const trimLang = (str, flag = true) => {
  if (flag) {
    var arr = str.split('.');
    arr.shift();
    return arr.join('.');
  } else {
    return str
  }
}

module.exports = {
  trimLang
}
