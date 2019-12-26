'use strict';

const GoogleSpreadSheet = require('google-spreadsheet');

const _createSheetId = (uri, baseURL) => {
  // https://teratail.com/questions/116620
  const regExp = new RegExp(`${baseURL}(.*?)/.*?`);
  const sheetId = uri.match(regExp)[1];
  return sheetId;
}

function GSSClient(uri, creds, opts) {
  const baseURL = opts.baseURL;
  const sheetId = _createSheetId(uri, baseURL);
  const doc = new GoogleSpreadSheet(sheetId);

  return new Promise((resolve, reject) => {
    doc.useServiceAccountAuth(creds, (err) => {
      if (err) reject(err);
      resolve(doc);
    });
  });
}

module.exports = GSSClient;
