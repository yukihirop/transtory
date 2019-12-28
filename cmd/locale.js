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
      transtory({
        url: url,
        type: type
      }).Locale.update(worksheetIndex, (langFile) => {
        console.log(`updated locale file: ${langFile}`);
      });
    });

  localeCmd
    .command('get [langName]')
    .description('get locale from local')
    .option(
      '-e, --extName <extName>',
      'extension name',
      'yaml'
    )
    .action((langName, options) => {
      const { extName } = options;
      if (langName) {
        transtory().Locale.get(langName, extName, (result) => {
          console.log(JSON.stringify(result, null, 2));
        });
      } else {
        transtory().Locale.getAll((result) => {
          console.log(JSON.stringify(result, null, 2));
        });
      }
    });

  return localeCmd;
}

module.exports = LocaleCmd;
