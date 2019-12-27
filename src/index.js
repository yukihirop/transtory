const GoogleSpreadSheet = require('./sheets/GSS')
  , AppLocale = require('./Locale')

module.exports = function transtory(uri, opts) {
  const defaultOpts = {
    type: 'GoogleSpreadSheet',
    baseURL: 'https://docs.google.com/spreadsheets/d/',
    worksheetIndex: 0,
    settingPath: `./.transtory`
  };
  const options = Object.assign({}, defaultOpts, opts)

  var locale = AppLocale(options);
  var sheet
  switch (options.type) {
    case 'GoogleSpreadSheet':
      sheet = GoogleSpreadSheet(uri, options)
      break;
  }

  var Sheet = {}
  Sheet.fetch = (worksheet_id = 1, callback) => {
    sheet.getRows(worksheet_id, rows => {
      var result = sheet.rows2Json(rows);
      if (callback) callback(result);
    });
  }

  var Locale = {}
  Locale.update = (worksheet_id = 1, callback) => {
    Sheet.fetch(worksheet_id, (result) => {
      locale.updateLocale(result, langFile => {
        if (callback) callback(langFile);
      });
    });
  }

  return {
    Sheet,
    Locale
  }
}
