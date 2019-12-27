const transtory = require('../src/index');
const { Command } = require('../src/monkey_patches/commander');

function SheetCmd() {
  const sheetCmd = new Command();

  sheetCmd
    .name('sheet')
    .description('sheet utils');

  sheetCmd
    .command('fetch <url>')
    .description('fetch rows from Sheet')
    .option(
      '-t, --type <type>',
      'sheet type',
      'GoogleSpreadSheet'
    )
    .option(
      'widx, --worksheet-index <worksheetIndex>',
      'worksheet Index',
      1
    )
    .action((url, options) => {
      const { type, worksheetIndex } = options;
      transtory(url, {
        type: type
      }).Sheet.fetch(worksheetIndex, (result) => {
        console.log(JSON.stringify(result, null, 2));
      });
    });

  return sheetCmd;
}

module.exports = SheetCmd;
