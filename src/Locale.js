'use strict';

const recursive = require('recursive-readdir');
const nestedProperty = require('nested-property');
const flatten = require('flat');
const {
  mkdirSyncRecursive,
  yamlSafeLoad,
  yamlDumpWriteSyncFile,
  walk,
  absolutePath
} = require('./utils/file');

const _mergedDefaultOptions = (opts) => {
  const defaultOpts = {};
  return Object.assign({}, defaultOpts, opts)
}

function Locale(opts) {
  opts = _mergedDefaultOptions(opts);

  var { settingPath } = opts;
  var yamlData = yamlSafeLoad(settingPath)
    , distDirPath = yamlData["locale"]["distDirPath"];

  mkdirSyncRecursive(distDirPath);

  /*
    e.x.)
    result = {"ja":{"common":{"text":{"hello":"こんにちは","good_night":"おやすみなさい"}}},"en":{"common":{"text":{"hello":"hello","good_night":"good night"}}}}
  */
  const updateLocale = (result) => {
    var promises = [];

    Object.keys(result).forEach(lang => {
      var promise = new Promise((resolve, reject) => {
        try {
          const langFile = `${distDirPath}/${lang}.yaml`;
          var langResult = {};
          langResult[lang] = result[lang];
          yamlDumpWriteSyncFile(langFile, langResult);

          resolve(langFile);
        } catch (err) {
          reject(err)
        }
      });
      promises.push(promise)
    });

    return Promise.all(promises);
  }

  const getLocale = (langName, extName = 'yaml', isFlatten = false) => {
    return new Promise((resolve, reject) => {
      try {
        var yamlData = yamlSafeLoad(`${distDirPath}/${langName}.${extName}`);
        if (isFlatten) {
          yamlData = flatten(yamlData);
        }
        resolve(yamlData);
      } catch (err) {
        reject(err);
      }
    });
  }

  const getLocaleAll = (isFlatten = false) => {
    var fullPath = absolutePath(distDirPath)
      , result = {}
      , yamlData = {};

    return new Promise((resolve, reject) => {
      recursive(fullPath, (err, files) => {
        if (err) reject(err);

        result = files.reduce((acc, file) => {
          yamlData = yamlSafeLoad(file, false);
          Object.assign(acc, yamlData);

          if (isFlatten) {
            acc = flatten(acc);
          }

          return acc;
        }, {});

        resolve(result);
      });
    });
  }

  const addLocale = (key, value, langName, extName = 'yaml') => {
    return new Promise((resolve, reject) => {
      try {
        const langFile = `${distDirPath}/${langName}.${extName}`;
        const yamlData = yamlSafeLoad(langFile);
        nestedProperty.set(yamlData, key, value);
        yamlDumpWriteSyncFile(langFile, yamlData);

        const writeData = nestedProperty.get(yamlData, key);
        resolve({ [key]: writeData });
      } catch (err) {
        reject(err);
      }
    });
  }

  return {
    updateLocale,
    getLocale,
    getLocaleAll,
    addLocale
  }
}

module.exports = Locale;
