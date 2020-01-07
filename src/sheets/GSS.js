'use strict';

require('date-utils');

const flatten = require('flat');

const GSSValidator = require('../validators/GSSValidator');
const ConfigValidator = require('../validators/ConfigValidator');
const Client = require('./GSSClient');
const nestedProperty = require('nested-property');
const { yamlSafeLoad } = require('../utils/file');
const { trimLang } = require('../utils/string');
const Locale = require('../Locale');

const _mergedDefaultOptions = (opts) => {
  const defaultOpts = {
    workSheetName: 'シート1'
  }
  return Object.assign({}, defaultOpts, opts)
}

function GSS(opts) {
  const { baseURL, settingPath, worksheetIndex } = opts;

  var settingData = yamlSafeLoad(settingPath)
    , url = settingData["sheet"]["gss"]["url"]
    , langPrefix = settingData["sheet"]["gss"]["langPrefix"]
    , sheetSchema = settingData["sheet"]["gss"]["openAPIV3Schema"]["properties"]
    , headerData = Object.keys(sheetSchema)
    , headerHumanData = Object.keys(sheetSchema).map(key => { return sheetSchema[key]['description']; });

  const gssValidator = GSSValidator(url, baseURL);
  const configValidator = ConfigValidator(settingPath);

  gssValidator.isSpreadSheetURL();
  configValidator.isVersion();

  opts = _mergedDefaultOptions(opts);

  const client = Client(url, opts);
  const locale = new Locale(opts);

  const getInfo = (callback) => {
    return client.then(doc => {
      new Promise((resolve, reject) => {
        doc.getInfo((err, info) => {
          if (err) reject(err);
          resolve(info.worksheets[worksheetIndex]);
        });
      }).then(sheet => {
        if (callback) {
          callback(sheet);
        }
      });
    });
  };

  const getRows = (worksheetId = 1, callback) => {
    return getInfo(sheet => {
      new Promise((resolve, reject) => {
        sheet.getRows(worksheetId, (err, rows) => {
          if (err) reject(err);
          resolve(rows);
        });
      }).then(rows => {
        if (callback) {
          callback(rows);
        }
      });
    });
  };

  const pushRows = (worksheetName = (new Date()).toFormat('YYYY/MM/DD HH24:MI:SS'), callback) => {
    return client.then(doc => {
      new Promise((resolve, reject) => {
        doc.addWorksheet({
          title: worksheetName
        }, (err, sheet) => {
          if (err) reject(err);

          sheet.setHeaderRow(headerHumanData);
          resolve(sheet);
        });
      }).then(sheet => {
        locale.getLocaleAll(false, result => {
          var writeData = _createCellData(result);
          var writeCount = writeData.length;

          process.on('WriteGSS', c => {
            if (c > writeCount - 1) {
              return;
            }

            var data = writeData.shift();
            _pushRow(sheet, data, (result) => {
              callback(result);
              process.emit('WriteGSS', ++c);
            });
          });

          process.emit('WriteGSS', 0);
        });
      });
    });
  }

  const rows2Json = (rows) => {
    var translateHumanKey = _translateHumanKey(sheetSchema);
    var translateKey, langHuman;
    var result = {};

    _languages(sheetSchema).forEach(lang => {
      result[lang] = {};
      langHuman = sheetSchema[lang]['description'];

      rows.forEach(row => {
        translateKey = row[translateHumanKey];
        nestedProperty.set(result, `${lang}.${translateKey}`, row[langHuman]);
      });
    });

    return result
  }

  // private

  const _createCellData = (result) => {
    var data = [];

    Object.keys(result).forEach((langName, langIndex) => {
      var langResult = {};
      langResult[langName] = result[langName];
      var flatternLangResult = flatten(langResult);

      Object.keys(flatternLangResult).forEach((key, itemIndex) => {
        var langValue = flatternLangResult[key]
          , itemResult = {};

        itemResult = {
          rowNum: itemIndex + 2,
          langIndex: headerData.findIndex(header => header === langName),
          keyIndex: headerData.findIndex(header => header === 'key'),
          langValue: langValue,
          keyValue: trimLang(key, langPrefix)
        };

        data.push(itemResult);
      });
    });

    return data;
  }

  const _pushRow = (sheet, data, callback) => {
    const { rowNum, langIndex, keyIndex, langValue, keyValue } = data;
    sheet.getCells({
      'min-row': rowNum,
      'return-empty': true
    }, (err, cells) => {
      if (err) throw err;

      cells[langIndex].value = langValue;
      cells[keyIndex].value = keyValue;
      sheet.bulkUpdateCells(cells);
      if (callback) callback(data);
    });
  }

  const _languages = (sheetSchema) => {
    const keys = Object.keys(sheetSchema)

    keys.some((key, i) => {
      if (key === 'key') keys.splice(i, 1)
    });

    return keys
  }

  const _translateHumanKey = (sheetSchema) => {
    return sheetSchema['key']['description']
  }

  return {
    getInfo,
    getRows,
    pushRows,
    rows2Json,
  }
}

module.exports = GSS;
