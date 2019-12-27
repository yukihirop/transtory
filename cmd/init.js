const { Command } = require('../src/monkey_patches/commander');
const { yamlSafeLoad, yamlDumpWriteSyncFile } = require('../src/utils/file');

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
      yamlDumpWriteSyncFile(settingPath, yamlData);
      console.log(`created setting file: ${settingPath}`);
    });

  return initCmd
}

module.exports = InitCmd;
