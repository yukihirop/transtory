'use strict';

const GSSValidator = require('../validators/GSSValidator');
const ConfigValidator = require('../validators/ConfigValidator');
const Client = require('./GSSClient');
const nestedProperty = require('nested-property');
const { yamlSafeLoad } = require('../utils/file');

const _mergedDefaultOptions = (opts) => {
  const defaultOpts = {
    workSheetName: 'シート1'
  }
  return Object.assign({}, defaultOpts, opts)
}

function GSS(url, opts) {
  const { baseURL, settingPath, worksheetIndex } = opts;

  const gssValidator = GSSValidator(url, baseURL);
  const configValidator = ConfigValidator(settingPath);

  gssValidator.isSpreadSheetURL();
  configValidator.isVersion();

  opts = _mergedDefaultOptions(opts);

  var yamlData = yamlSafeLoad(settingPath)
    , sheetSchema = yamlData["sheet"]["gss"]["openAPIV3Schema"]["properties"];

  var client = Client(url, opts);

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

  const getRows = (worksheet_id = 1, callback) => {
    return getInfo(sheet => {
      new Promise((resolve, reject) => {
        sheet.getRows(worksheet_id, (err, rows) => {
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
    rows2Json,
  }
}

module.exports = GSS;
