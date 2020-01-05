'use strict';

const uuidv4 = require('uuid/v4');
const recursive = require('recursive-readdir');
const { detailedDiff } = require('deep-object-diff');
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
const {
  isEmpty
} = require('./utils/object');

const INITIAL_COMMIT_HASH = '00000000000000000000000000000000';

function Repository(distDirPath, branch) {
  const fullDistDirPath = absolutePath(distDirPath)
    , trsPath = absolutePath('.trs')
    , commitHashAtHEAD = fileSafeLoad(".trs/HEAD").replace(/\r?\n/g, '')
    , commitHashAtMerged = 'merged'
    , isInitialHEAD = (commitHashAtHEAD === INITIAL_COMMIT_HASH)
    , refPathAtHEAD = `${trsPath}/HEAD`
    , refPathAtBranch = `${trsPath}/refs/heads/${branch}`
    , logRefPathAtHEAD = `${trsPath}/logs/HEAD`
    , logRefPathAtBranch = `${trsPath}/logs/refs/heads/${branch}`
    , objectPathAtMerged = `${trsPath}/objects/${commitHashAtMerged}`;

  const dataAt = (fileName, commitHash = commitHashAtHEAD) => {
    if (commitHash === '' || commitHash === 'undefined') {
      return {}
    } else {
      var normalizeCommitHash = commitHash.replace(/\r?\n/g, '');
      var dataPath = absolutePath(`.trs/objects/${normalizeCommitHash}/${fileName}`);
      return yamlSafeLoad(dataPath);
    }
  };

  const status = (callback) => {
    var fullPath = absolutePath(distDirPath);

    recursive(fullPath, (err, files) => {
      if (err) throw err;
      if (isInitialHEAD) {
        callback(files)
      } else {
        var filteredFiles = files.filter((file) => {
          var diff = eachDiff(file, false);
          var modified = [isEmpty(diff["added"]), isEmpty(diff["deleted"]), isEmpty(diff["updated"])].some(v => v);
          return modified;
        });
        callback(filteredFiles);
      }
    });
  }

  const commit = (callback) => {
    var hash = _commitHash()
      , fileName = ''
      , savePath = ''
      , diffData = {}
      , commitPath = `${trsPath}/objects/${hash}`;

    mkdirSyncRecursive(commitPath);
    recursive(fullDistDirPath, (err, files) => {
      if (err) throw err;

      files.forEach(file => {
        fileName = basename(file);

        var mergedPath = `${objectPathAtMerged}/${fileName}`;

        savePath = `${commitPath}/${fileName}`;
        diffData = eachDiff(fileName, true);

        yamlDumpWriteSyncFile(mergedPath, _localData(fileName));
        yamlDumpWriteSyncFile(savePath, diffData);
        writeSyncFile(refPathAtHEAD, hash);
        writeSyncFile(refPathAtBranch, hash);
        writeSyncFile(logRefPathAtHEAD, hash);
        writeSyncFile(logRefPathAtBranch, hash);

        callback(diffData, savePath);
      })
    });
  };

  const eachDiff = (file, isRelative = false) => {
    const fileName = basename(file)
      , dataAtHEAD = _mergedData(fileName)
      , dataAtLocal = _localData(fileName);
    return detailedDiff(_mergedDiff(dataAtHEAD), dataAtLocal)
  }

  //private

  const _mergedData = (fileName) => {
    var filePath = `${objectPathAtMerged}/${fileName}`;

    if (isExistFile(filePath)) {
      return yamlSafeLoad(filePath);
    } else {
      return {}
    }
  }

  const _localData = (fileName) => {
    return yamlSafeLoad(`${distDirPath}/${fileName}`);
  }

  const _mergedDiff = (diff) => {
    const added = diff["added"]
      , deleted = diff["deleted"]
      , updated = diff["updated"]
      , result = {};

    Object.assign(result, added);
    Object.assign(result, deleted);
    Object.assign(result, updated);

    return result;
  }

  const _commitHash = () => {
    return uuidv4().split('-').join('');
  }

  return {
    dataAt,
    status,
    commit,
    eachDiff
  }
}

module.exports = Repository
