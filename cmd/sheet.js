const transtory = require('../src/index');
const { Command } = require('../src/monkey_patches/commander');

function SheetCmd() {
  const sheetCmd = new Command();

  sheetCmd
    .name('sheet')
    .description('sheet utils');

  sheetCmd
    .command('fetch')
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
    .action((options) => {
      const { type, worksheetIndex } = options;
      transtory({
        type: type
      }).Sheet.fetch(worksheetIndex).then(result => {
        console.log(JSON.stringify(result, null, 2));
      });
    });

  sheetCmd
    .command('push')
    .description('push locales to Sheet')
    .option(
      '-t, --type <type>',
      'sheet type',
      'GoogleSpreadSheet'
    )
    .option(
      '-n, --name <name>',
      'worksheet name',
      (new Date()).toFormat('YYYY/MM/DD HH24:MI:SS')
    )
    .action((options) => {
      const { type, name } = options;
      transtory({
        type: type
      }).Sheet.push(name).then(result => {
        console.log(result);
      });
    });

  return sheetCmd;
}

module.exports = SheetCmd;
