'use strict';

const { mkdirSyncRecursive, yamlSafeLoad, yamlDumpWriteSyncFile } = require('./utils/file');

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
      yamlDumpWriteSyncFile(langFile, result[lang]);
      if (callback) callback(langFile);
    });
  }

  const getLocale = (langName, extName = 'yaml', callback) => {
    const yamlData = yamlSafeLoad(`${distDirPath}/${langName}.${extName}`)
      , result = {};

    result[langName] = yamlData;
    if (callback) callback(result);
  }

  return {
    updateLocale,
    getLocale
  }
}

module.exports = Locale;
