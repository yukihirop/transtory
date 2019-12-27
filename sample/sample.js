var GoogleSpreadsheet = require('google-spreadsheet');
var async = require('async');
var path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

var spreadsheet_id = process.env.SPREADSHEET_ID;
var doc = new GoogleSpreadsheet(spreadsheet_id);
var sheet;

async.series([
  function setAuth(step) {
    // var creds = require('./google-generated-creds.json');
    var creds_json = {
      client_email: process.env.CLIENT_EMAIL,
      private_key: process.env.PRIVATE_KEY
    }
    doc.useServiceAccountAuth(creds_json, step);
  },
  function getInfoAndWorksheets(step) {
    doc.getInfo(function (err, info) {
      console.log('Loaded doc: ' + info.title + ' by ' + info.author.email);
      sheet = info.worksheets[0];
      console.log('sheet 1: ' + sheet.title + ' ' + sheet.rowCount + 'x' + sheet.colCount);
      step();
    });
  },
  function workingWithRows(step) {
    sheet.getRows({
      offset: 1,
      limit: 20,
      orderby: 'col2'
    }, function (err, rows) {
      console.log('Read ' + rows.length + ' rows');

      // the row is an object with keys set by the column headers
      rows[0].colname = 'new val';
      rows[0].save();

      // deleting a row
      // rows[0].del();

      step();
    });
  },
  function workingWithCells(step) {
    sheet.getCells({
      'min-row': 1,
      'max-row': 2,
      'return-empty': true
    }, function (err, cells) {
      var cell = cells[0];
      console.log('Cell R' + cell.row + 'C' + cell.col + ' = ' + cell.value);


      cells[0].value = 1;
      cells[1].value = 2;
      cells[2].formula = '=A1+B1';
      sheet.bulkUpdateCells(cells);

      step();
    });
  },
  function managingSheets(step) {
    doc.addWorksheet({
      title: 'my new secret'
    }, function (err, sheet) {
      // change a sheet7s title
      sheet.setTitle('new title');

      sheet.resize({ rowCount: 50, colCount: 20 });

      step();
    });
  }
], function (err) {
  if (err) {
    console.log('Error: ' + err);
  }
});
