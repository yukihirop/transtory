'use strict';

const flatten = require('flat');
const merge = require('deepmerge');
const { trimLang } = require('../utils/string');

function Worksheet(headerData, langPrefix) {

  /*
  {
    '0_1': { rowNum: 0, colNum: 1, value: 'hello', type: 'item' },
    '0_2': { rowNum: 0, colNum: 2, value: 'common.text.hello', type: 'key' },
    '1_1': { rowNum: 1, colNum: 1, value: 'good night', type: 'item' },
  }
  */
  const bulkData = (localeData) => {
    var data = {}

    Object.keys(localeData).forEach((langName, langIndex) => {
      var langResult = {};
      langResult[langName] = localeData[langName];
      var flatternLangResult = flatten(langResult);

      Object.keys(flatternLangResult).forEach((key, itemIndex) => {
        var langValue = flatternLangResult[key]
          , langIndex = headerData.findIndex(header => header === langName)
          , keyIndex = headerData.findIndex(header => header === 'key')
          , itemKey = `${itemIndex}_${langIndex}`
          , keyKey = `${itemIndex}_${keyIndex}`
          , itemResult = {};

        itemResult[itemKey] = {};
        itemResult[keyKey] = {};

        itemResult[itemKey].rowNum = itemIndex;
        itemResult[itemKey].colNum = langIndex;
        itemResult[itemKey].value = langValue;
        itemResult[itemKey].type = 'item';

        itemResult[keyKey].rowNum = itemIndex;
        itemResult[keyKey].colNum = keyIndex;
        itemResult[keyKey].value = trimLang(key, langPrefix);
        itemResult[keyKey].type = 'key';

        data = merge(data, itemResult);
      });
    });

    return data;
  }


  /*
  [
    {
      rowNum: 4,
      langName: ja,
      langIndex: 0,
      keyIndex: 2,
      langValue: 'さようなら',
      keyValue: 'common.text.good_bye'
    }
  ]
  */
  const rowArr = (localeData) => {
    var data = [];

    Object.keys(localeData).forEach((langName, langIndex) => {
      var langResult = {};
      langResult[langName] = localeData[langName];
      var flatternLangResult = flatten(langResult);

      Object.keys(flatternLangResult).forEach((key, itemIndex) => {
        var langValue = flatternLangResult[key]
          , itemResult = {};

        itemResult = {
          rowNum: itemIndex + 2,
          langName: langName,
          langIndex: headerData.findIndex(header => header === langName),
          keyIndex: headerData.findIndex(header => header === 'key'),
          langValue: langValue,
          keyValue: trimLang(key, langPrefix)
        };

        data.push(itemResult);
      });
    });

    return data;
  }

  return {
    bulkData,
    rowArr,
  }
}

module.exports = Worksheet;
