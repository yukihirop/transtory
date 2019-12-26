const GoogleSpreadSheet = require('./sheets/GSS');

module.exports = function transtory(uri, creds, opts) {
  const defaultOpts = {
    type: 'GoogleSpreadSheet',
    baseURL: 'https://docs.google.com/spreadsheets/d/',
    creds: creds,
    worksheetIndex: 0
  };
  const options = Object.assign({}, defaultOpts, opts)

  var gss
  switch (options.type) {
    case 'GoogleSpreadSheet':
      gss = GoogleSpreadSheet(uri, creds, options)
      break;
  }

  const getRows = (worksheet_id = 1) => {
    gss.getRows(worksheet_id, rows => {
      console.log(rows);
    });
  }

  return {
    getRows
  }
}
