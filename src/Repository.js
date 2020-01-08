'use strict';

const uuidv4 = require('uuid/v4');
const recursive = require('recursive-readdir');
const { detailedDiff } = require('deep-object-diff');
const merge = require('deepmerge');

const {
  isExistFile,
  yamlSafeLoad,
  absolutePath,
  fileSafeLoad,
  basename,
  yamlDumpWriteSyncFile,
  mkdirSyncRecursive,
  writeSyncFile
} = require('./utils/file');
const AppSheet = require('./Sheet')
  , AppLocale = require('./Locale');

const INITIAL_COMMIT_HASH = '00000000000000000000000000000000';

function Repository(opts) {
  const { settingPath } = opts;
  const yamlData = yamlSafeLoad(settingPath)
    , distDirPath = yamlData["locale"]["distDirPath"]

  const fullDistDirPath = absolutePath(distDirPath)
    , fullTrsPath = absolutePath('.trs')
    , fullObjectPath = `${fullTrsPath}/objects`
    , fullRefPathAtADD = `${fullTrsPath}/ADD`
    , fullRefPathAtCOMMIT = `${fullTrsPath}/COMMIT`
    , fullRefPathAtHEAD = `${fullTrsPath}/HEAD`;

  const sheet = AppSheet(opts);
  const locale = AppLocale(opts);

  const status = (callback) => {
    recursive(fullDistDirPath, (err, files) => {
      if (err) throw err;

      if (_isInitial('ADD') && _isInitial('COMMIT')) {
        callback('not added');
      } else if (!_isInitial('ADD') && _isInitial('COMMIT')) {
        callback('added but not committed');
      } else if (!_isInitial('ADD') && !_isInitial('COMMIT')) {
        callback('committed');
      }
    });
  }

  const add = (callback) => {
    var hash = _createCommitHash()
      , fileName = ''
      , fullSavePath = ''
      , localData = {}
      , fullCommitPath = `${fullTrsPath}/objects/${hash}`;

    mkdirSyncRecursive(fullCommitPath);
    recursive(fullDistDirPath, (err, files) => {
      if (err) throw err;

      files.forEach(file => {
        fileName = basename(file);
        fullSavePath = `${fullCommitPath}/${fileName}`;
        localData = _dataAt(`${fullDistDirPath}/${fileName}`);

        yamlDumpWriteSyncFile(fullSavePath, localData);
        writeSyncFile(fullRefPathAtADD, hash);

        callback(localData, fullSavePath);
      });
    })
  }


  const commit = (callback) => {
    var hash = _createCommitHash()
      , fileName = ''
      , fullSavePath = ''
      , diffData = {}
      , fullCommitPathAtADD = `${fullObjectPath}/${_readCommitHash('ADD')}`
      , fullCommitPath = `${fullObjectPath}/${hash}`;

    mkdirSyncRecursive(fullCommitPath);
    recursive(fullCommitPathAtADD, (err, files) => {
      if (err) throw err;

      files.forEach(file => {
        fileName = basename(file)
        fullSavePath = `${fullCommitPath}/${fileName}`;
        diffData = _eachDiffAt(fileName, 'ADD')

        yamlDumpWriteSyncFile(fullSavePath, diffData);
        writeSyncFile(fullRefPathAtCOMMIT, hash);

        callback(diffData, fullSavePath);
      });
    });
  };

  const push = async (callback) => {
    const commitHash = _readCommitHash('COMMIT');
    const commitData = await _mergedDataAt('COMMIT');

    writeSyncFile(fullRefPathAtHEAD, commitHash);
    sheet.pushRows(commitHash, commitData, callback);
  }

  //private

  const _isInitial = (state) => {
    return _readCommitHash(state) === INITIAL_COMMIT_HASH
  }

  const _readCommitHash = (state) => {
    return fileSafeLoad(`.trs/${state}`).replace(/\r?\n/g, '')
  }

  const _eachDiffAt = (fileName, state) => {
    const orig = _dataAt(`${fullObjectPath}/${_readCommitHash(state)}/${fileName}`);
    const local = _dataAt(`${fullDistDirPath}/${fileName}`);
    return detailedDiff(orig, local);
  }

  const _isDiffAt = async (state) => {
    const dataAt = await _mergedDataAt(state)
  }

  const _dataAt = (filePath) => {
    if (isExistFile(filePath)) {
      return yamlSafeLoad(filePath);
    } else {
      return {}
    }
  }

  const _mergedDataAt = (state) => {
    var result = {}
      , yamlData = {}
      , fullObjectPathAt = `${fullObjectPath}/${_readCommitHash(state)}`;

    return new Promise((resolve, reject) => {
      recursive(fullObjectPathAt, (err, files) => {
        if (err) reject(err);

        result = files.reduce((acc, file) => {
          yamlData = yamlSafeLoad(file, false);
          acc = merge(acc, yamlData);

          return acc;
        }, {});

        resolve(result);
      });
    });
  }

  const _createCommitHash = () => {
    return uuidv4().split('-').join('');
  }

  return {
    status,
    add,
    commit,
    push,
  }
}

module.exports = Repository
