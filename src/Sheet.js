const GoogleSpreadSheet = require('./sheets/GSS');

function Sheet(opts) {
  const { type } = opts;

  switch (type) {
    case 'GoogleSpreadSheet':
      sheet = GoogleSpreadSheet(opts);
      break;
  }

  return sheet;
}

module.exports = Sheet;
