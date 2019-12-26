const GSSValidator = require('../validators/GSSValidator');
const Client = require('./GSSClient');

const _mergedDefaultOptions = (opts) => {
  const defaultOpts = {
    workSheetName: 'シート1'
  }
  return Object.assign({}, defaultOpts, opts)
}

function GSS(uri, creds, opts) {
  const baseURL = opts.baseURL
  const validator = GSSValidator(uri, baseURL)
  validator.isSpreadSheetURL()

  opts = _mergedDefaultOptions(opts);
  var worksheetIndex = opts.worksheetIndex;

  client = Client(uri, creds, opts);

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

  return {
    getInfo,
    getRows,
  }
}

module.exports = GSS;
