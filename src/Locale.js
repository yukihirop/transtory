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
  const updateLocale = (result) => {
    Object.keys(result).forEach(lang => {
      yamlDumpWriteSyncFile(`${distDirPath}/${lang}.yaml`, result[lang]);
    });
  }

  return {
    updateLocale
  }
}

module.exports = Locale;
