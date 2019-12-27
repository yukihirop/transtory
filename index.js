#!/usr/bin/env node

/* refereence
  https://github.com/tj/commander.js/pull/1024/files
*/
const { Command } = require('./src/monkey_patches/commander')
  , pkg = require('./package.json')
  , program = new Command()
  , initCmd = require('./cmd/init')()
  , sheetCmd = require('./cmd/sheet')()
  , localeCmd = require('./cmd/locale')();

program
  .version(pkg.version)

program
  .description('transtory cli')

program
  .useSubcommand(initCmd)
  .useSubcommand(sheetCmd)
  .useSubcommand(localeCmd);

if (process.argv.length <= 2) {
  program.help();
} else {
  program.parse(process.argv);
}
