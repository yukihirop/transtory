jsdiff = require('diff');

orig = "";
modified = "aaaa";

diff = jsdiff.diffChars(orig, modified);
console.log(diff);




