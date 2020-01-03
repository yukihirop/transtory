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
  const updateLocale = (result, callback) => {
    Object.keys(result).forEach(lang => {
      const langFile = `${distDirPath}/${lang}.yaml`;

      var langResult = {};
      langResult[lang] = result[lang];
      yamlDumpWriteSyncFile(langFile, langResult);

      if (callback) callback(langFile);
    });
  }

  const getLocale = (langName, extName = 'yaml', isFlatten = false, callback) => {
    var yamlData = yamlSafeLoad(`${distDirPath}/${langName}.${extName}`);

    if (isFlatten) {
      yamlData = flatten(yamlData);
    }

    if (callback) callback(yamlData);
  }

  const getLocaleAll = (isFlatten = false, callback) => {
    var fullPath = absolutePath(distDirPath)
      , result = {}
      , yamlData = {};

    recursive(fullPath, (err, files) => {
      if (err) throw err;

      result = files.reduce((acc, file) => {
        yamlData = yamlSafeLoad(file, false);
        Object.assign(acc, yamlData);

        if (isFlatten) {
          acc = flatten(acc);
        }

        return acc;
      }, {});

      if (callback) callback(result);
    })
  }

  const addLocale = (key, value, langName, extName = 'yaml', callback) => {
    const langFile = `${distDirPath}/${langName}.${extName}`;
    const yamlData = yamlSafeLoad(langFile);
    nestedProperty.set(yamlData, key, value);
    yamlDumpWriteSyncFile(langFile, yamlData);

    const writeData = nestedProperty.get(yamlData, key);
    if (callback) callback({ [key]: writeData });
  }

  return {
    updateLocale,
    getLocale,
    getLocaleAll,
    addLocale
  }
}

module.exports = Locale;
