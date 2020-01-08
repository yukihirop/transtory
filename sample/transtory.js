const transtory = require('../src/index');

var client = transtory()

client.Sheet.fetch(1, (result) => {
  console.log(JSON.stringify(result));
});

client.Locale.update(1).then(result => {
  console.log(result);
});

client.Locale.get('ja', 'yaml', (result) => {
  console.log(JSON.stringify(result));
});

client.Locale.get('en', 'yaml', (result) => {
  console.log(JSON.stringify(result));
});

client.Locale.getAll((result) => {
  console.log(JSON.stringify(result, null, 2));
});

var formatDate = (new Date()).toFormat('YYYY/MM/DD HH24:MI:SS');
client.Sheet.push(formatDate, (result) => {
  console.log(result);
});

client.Locale.add('ja.common.text.good_bye', 'さようなら', 'ja', 'yaml', (result) => {
  console.log(JSON.stringify(result, null, 2));
});
