const transtory = require('../src/index');
const { Command } = require('../src/monkey_patches/commander');

function LocaleCmd() {
  const localeCmd = new Command();

  localeCmd
    .name('locale')
    .description('locale utils');

  localeCmd
    .command('update <url>')
    .description('update locales from Sheet')
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
      }).Locale.update(worksheetIndex, (langFile) => {
        console.log(`updated locale file: ${langFile}`);
      });
    });

  return localeCmd;
}

module.exports = LocaleCmd;
