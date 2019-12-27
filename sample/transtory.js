const transtory = require('../src/index');
const creds = require('./google-generated-creds.json')

var client = transtory(
  "https://docs.google.com/spreadsheets/d/1nBMgL7p4HpGpEqpWKsUzNYZIacykUifgy8o_BBTWuFQ/edit#gid=0",
  creds,
  { hoge: 'fuga' }
)

client.Sheet.fetch(1, (result) => {
  console.log(JSON.stringify(result));
});

client.Locale.update(1);
