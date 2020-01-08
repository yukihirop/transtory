'use strict';

require('date-utils');

const AppSheet = require('./Sheet')
  , AppLocale = require('./Locale')

module.exports = function transtory(opts) {
  const defaultOpts = {
    type: 'GoogleSpreadSheet',
    baseURL: 'https://docs.google.com/spreadsheets/d/',
    worksheetIndex: 0,
    settingPath: `./.transtory`
  };

  const options = Object.assign({}, defaultOpts, opts);
  var Sheet = {}
    , Locale = {}
    , sheet = AppSheet(options)
    , locale = AppLocale(options);

  Sheet.fetch = (worksheet_id = 1) => {
    return new Promise((resolve, reject) => {
      sheet.getRows(worksheet_id, rows => {
        var result = sheet.rows2Json(rows);
        resolve(result);
      });
    })
  }

  Sheet.push = (worksheetName = (new Date()).toFormat('YYYY/MM/DD HH24:MI:SS'), callback) => {
    sheet.pushRows(worksheetName, callback);
  }

  Locale.update = (worksheet_id = 1) => {
    return new Promise((resolve, reject) => {
      Sheet.fetch(worksheet_id).then(result => {
        locale.updateLocale(result).then(files => {
          resolve(files)
        });
      });
    })
  }

  Locale.get = (langName, extName = 'yaml', isFlatten) => {
    return locale.getLocale(langName, extName, isFlatten)
  }

  Locale.getAll = (isFlatten) => {
    return locale.getLocaleAll(isFlatten)
  }

  Locale.add = (key, value, langName, extName = 'yaml', callback) => {
    locale.addLocale(key, value, langName, extName, callback)
  }

  return {
    Sheet,
    Locale
  }
}
