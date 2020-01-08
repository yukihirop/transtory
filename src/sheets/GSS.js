'use strict';

require('date-utils');

const flatten = require('flat');
const merge = require('deepmerge');

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
        locale.getLocaleAll(false).then(result => {
          var data = _bulkCreateCellData(result);
          _bulkPushRow(sheet, data);

          if (callback) callback(data);
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

  const _bulkCreateCellData = (result) => {
    var data = {}

    Object.keys(result).forEach((langName, langIndex) => {
      var langResult = {};
      langResult[langName] = result[langName];
      var flatternLangResult = flatten(langResult);

      Object.keys(flatternLangResult).forEach((key, itemIndex) => {
        var langValue = flatternLangResult[key]
          , langIndex = headerData.findIndex(header => header === langName)
          , keyIndex = headerData.findIndex(header => header === 'key')
          , itemKey = `${itemIndex}_${langIndex}`
          , keyKey = `${itemIndex}_${keyIndex}`
          , itemResult = {};

        itemResult[itemKey] = {};
        itemResult[keyKey] = {};

        itemResult[itemKey].rowNum = itemIndex;
        itemResult[itemKey].colNum = langIndex;
        itemResult[itemKey].value = langValue;
        itemResult[itemKey].type = 'item';

        itemResult[keyKey].rowNum = itemIndex;
        itemResult[keyKey].colNum = keyIndex;
        itemResult[keyKey].value = trimLang(key, langPrefix);
        itemResult[keyKey].type = 'key';

        data = merge(data, itemResult);
      });
    });

    return data;
  }

  const _bulkPushRow = (sheet, data, callback) => {
    const maxRowCount = Math.ceil(Object.keys(data).length / _languages(sheetSchema).length)
    sheet.getCells({
      'min-row': 2,
      'max-row': maxRowCount,
      'return-empty': true
    }, (err, cells) => {
        if (err) throw err;

        // i is itemIndex
        const colCount = sheet.colCount;
        for (let i = 0; i < cells.length / colCount; ++i) {
          // j is langIndex or keyIndex
          for (let j = 0; j < colCount; ++j) {
            var el = data[`${i}_${j}`];
            if (typeof el !== 'undefined') {
              cells[i * colCount + j].value = el.value
            }
          }
        }

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
