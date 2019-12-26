const transtory = require('../src/index');
const creds = require('./google-generated-creds.json')

transtory(
  "https://docs.google.com/spreadsheets/d/1nBMgL7p4HpGpEqpWKsUzNYZIacykUifgy8o_BBTWuFQ/edit#gid=0",
  creds,
  { hoge: 'fuga' }
).getRows()
