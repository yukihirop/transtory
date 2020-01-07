const transtory = require('../src/index');

var client = transtory()

client.Sheet.fetch(1).then(result => {
  console.log(JSON.stringify(result));
});

client.Locale.update(1).then(result => {
  console.log(result);
});

client.Locale.get('ja', 'yaml').then(result => {
  console.log(JSON.stringify(result));
});

client.Locale.get('en', 'yaml').then(result => {
  console.log(JSON.stringify(result));
});

client.Locale.getAll().then(result => {
  console.log(JSON.stringify(result, null, 2));
});

var formatDate = (new Date()).toFormat('YYYY/MM/DD HH24:MI:SS');
client.Sheet.push(formatDate).then(result => {
  console.log(result);
});

client.Locale.add('ja.common.text.good_bye', 'さようなら', 'ja', 'yaml').then(result => {
  console.log(JSON.stringify(result, null, 2));

// client.Repository.status((message) => {
//   console.log(message);
// });

// client.Repository.add((data, file) => {
//   console.log('added!');
//   console.log(data);
// });

// client.Repository.status((message) => {
//   console.log(message);
// });

// client.Repository.commit((diff, file) => {
//   console.log("committed!");
//   console.log(diff);
// });

client.Repository.push((result) => {
  console.log("pushed!");
  console.log(result);
});
