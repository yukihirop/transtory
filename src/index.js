'use strict';

require('date-utils');

const GoogleSpreadSheet = require('./sheets/GSS')
  , AppLocale = require('./Locale')

module.exports = function transtory(opts) {
  const defaultOpts = {
    type: 'GoogleSpreadSheet',
    baseURL: 'https://docs.google.com/spreadsheets/d/',
    worksheetIndex: 0,
    settingPath: `./.transtory`
  };

  const options = Object.assign({}, defaultOpts, opts);
  const { url, type } = options;
  var Sheet = {}
    , Locale = {}
    , locale = AppLocale(options)
    , sheet = {};

  if (url) {

    switch (type) {
      case 'GoogleSpreadSheet':
        sheet = GoogleSpreadSheet(url, options)
        break;
    }

    Sheet.fetch = (worksheet_id = 1, callback) => {
      sheet.getRows(worksheet_id, rows => {
        var result = sheet.rows2Json(rows);
        if (callback) callback(result);
      });
    }

    Sheet.push = (worksheetName = (new Date()).toFormat('YYYY/MM/DD HH24:MI:SS'), callback) => {
      sheet.pushRows(worksheetName, callback);
    }

    Locale.update = (worksheet_id = 1, callback) => {
      Sheet.fetch(worksheet_id, (result) => {
        locale.updateLocale(result, langFile => {
          if (callback) callback(langFile);
        });
      });
    }
  }

  Locale.get = (langName, extName = 'yaml', isFlatten, callback) => {
    locale.getLocale(langName, extName, isFlatten, callback)
  }

  Locale.getAll = (isFlatten, callback) => {
    locale.getLocaleAll(isFlatten, callback)
  }

  Locale.add = (key, value, langName, extName = 'yaml', callback) => {
    locale.addLocale(key, value, langName, extName, callback)
  }

  return {
    Sheet,
    Locale
  }
}
