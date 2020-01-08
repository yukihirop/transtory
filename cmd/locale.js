const transtory = require('../src/index');
const { Command } = require('../src/monkey_patches/commander');

function LocaleCmd() {
  const localeCmd = new Command();

  localeCmd
    .name('locale')
    .description('locale utils');

  localeCmd
    .command('update')
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
    .action((options) => {
      const { type, worksheetIndex } = options;
      transtory({
        type: type
      }).Locale.update(worksheetIndex).then(langFiles => {
        langFiles.forEach(langFile => {
          console.log(`updated locale file: ${langFile}`);
        })
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
    .option(
      '-f, --flat [flat]',
      'display flatten',
      false,
    )
    .action((langName, options) => {
      const { extName, flat } = options;
      const isFlatten = (flat === 'true') ? true : false;
      if (langName) {
        transtory().Locale.get(langName, extName, isFlatten).then(result => {
          console.log(JSON.stringify(result, null, 2));
        });
      } else {
        transtory().Locale.getAll(isFlatten).then(result => {
          console.log(JSON.stringify(result, null, 2));
        });
      }
    });

  localeCmd
    .command('add <langName> <key> <value>')
    .description('add locale')
    .option(
      '-e, --extName <extName>',
      'extension name',
      'yaml'
    )
    .action((langName, key, value, options) => {
      const { extname } = options;
      transtory().Locale.add(key, value, langName, extname).then(result => {
        console.log(JSON.stringify(result, null, 2));
      });
    });

  return localeCmd;
}

module.exports = LocaleCmd;
