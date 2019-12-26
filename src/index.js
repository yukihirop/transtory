const GoogleSpreadSheet = require('./sheets/GSS')
  , fs = require('fs')
  , path = require('path');

const currentPath = fs.realpathSync('./')
  , settingTemplatePath = path.resolve(__dirname, './template/transtory.yaml')
  , settingData = fs.readFileSync(path.join(settingTemplatePath), 'utf-8');

module.exports = function transtory(uri, creds, opts) {
  const defaultOpts = {
    type: 'GoogleSpreadSheet',
    baseURL: 'https://docs.google.com/spreadsheets/d/',
    creds: creds,
    worksheetIndex: 0,
    settingPath: `${currentPath}/.transtory`
  };
  const options = Object.assign({}, defaultOpts, opts)

  var sheet
  switch (options.type) {
    case 'GoogleSpreadSheet':
      sheet = GoogleSpreadSheet(uri, creds, options)
      break;
  }

  var Sheet = {}
  Sheet.fetch = (worksheet_id = 1, callback) => {
    sheet.getRows(worksheet_id, rows => {
      var result = sheet.rows2Json(rows);
      if (callback) callback(result);
    });
  }

  return {
    Sheet,
  }
}
