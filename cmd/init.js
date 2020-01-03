const { Command } = require('../src/monkey_patches/commander');
const { yamlSafeLoad, yamlDumpWriteSyncFile, mkdirSyncRecursive, isExistFile, writeSyncFile } = require('../src/utils/file');

const fs = require('fs')
  , currentPath = fs.realpathSync('./');

function InitCmd() {
  const initCmd = new Command();

  initCmd
    .name('init')
    .description('create setting file (.transtory)')
    .action(() => {
      var yamlData = yamlSafeLoad('./src/template/transtory.yaml');
      var settingPath = `${currentPath}/.transtory`;

      if (isExistFile(settingPath)) {
        console.log(`already exist file: ${settingPath}`);
      } else {
        yamlDumpWriteSyncFile(settingPath, yamlData);
        console.log(`created setting file: ${settingPath}`);
      }

      var trsPath = `${currentPath}/.trs`;
      if (!isExistFile(trsPath)) {
        mkdirSyncRecursive(`${trsPath}/refs/heads`);
        mkdirSyncRecursive(`${trsPath}/logs/refs/heads`);
        mkdirSyncRecursive(`${trsPath}/objects/merged`);
        writeSyncFile(`${trsPath}/HEAD`, '00000000000000000000000000000000');
        writeSyncFile(`${trsPath}/refs/heads/master`, '00000000000000000000000000000000');
        writeSyncFile(`${trsPath}/logs/HEAD`);
        writeSyncFile(`${trsPath}/logs/refs/heads/master`);
      }
    });

  return initCmd
}

module.exports = InitCmd;
