const GoogleSpreadSheet = require('./sheets/GSS');

function Sheet(url, opts) {
  const { type } = opts;

  switch (type) {
    case 'GoogleSpreadSheet':
      sheet = GoogleSpreadSheet(url, opts);
      break;
  }

  return sheet;
}

module.exports = Sheet;
