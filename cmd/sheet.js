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
      transtory({
        url: url,
        type: type
      }).Sheet.fetch(worksheetIndex, (result) => {
        console.log(JSON.stringify(result, null, 2));
      });
    });

  sheetCmd
    .command('push <url>')
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
    .action((url, options) => {
      const { type, name } = options;
      transtory({
        url: url,
        type: type
      }).Sheet.push(name, result => {
        console.log("Row: %d\tColumn: %d\tValue: %s\tKey: %s", result['rowNum'], result['langIndex'] + 1, result['langValue'], result['keyValue'])
      });
    });

  return sheetCmd;
}

module.exports = SheetCmd;
