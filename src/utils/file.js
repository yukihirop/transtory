const fs = require('fs')
  , path = require('path')
  , yaml = require('js-yaml');

const currentPath = fs.realpathSync('./');

const isExistFile = (file) => {
  try {
    fs.statSync(file);
    return true
  } catch (err) {
    if (err.code === 'ENOENT') return false
  }
}

const writeSyncFile = (file, data, check = false) => {
  if (check) {
    if (isExistFile(file) === false) {
      fs.writeFile(file, data, (err) => {
        if (err) throw err;
      });
    }
  } else {
    fs.writeFile(file, data, (err) => {
      if (err) throw err;
    });
  }
}

const mkdirSyncRecursive = (dir) => {
  fullPath = path.resolve(currentPath, dir)
  fullPath.split('/').reduce((acc, item) => {
    const path = item ? [acc, item].join('/') : '';
    if (path && !fs.existsSync(path)) {
      fs.mkdirSync(path);
    }
    return path;
  }, '');
}

const yamlSafeLoad = (file, encoding = 'utf-8') => {
  fullPath = path.resolve(currentPath, file)
  var yamlText = fs.readFileSync(fullPath, encoding)
    , yamlData = yaml.safeLoad(yamlText);
  return yamlData
}

const yamlDumpWriteSyncFile = (file, data) => {
  const yamlText = yaml.dump(data);
  writeSyncFile(file, yamlText);
}

const jsonSafeLoad = (file) => {
  fullPath = path.resolve(currentPath, file);
  return require(fullPath);
}

const packageJSON = () => {
  return require(`${currentPath}/package.json`);
}

module.exports = {
  isExistFile,
  writeSyncFile,
  mkdirSyncRecursive,
  yamlSafeLoad,
  yamlDumpWriteSyncFile,
  jsonSafeLoad,
  packageJSON,
}
