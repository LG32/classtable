var util = require("../utils/util.js");

const testJs = str => {
  console.log(str);
}

const getInfoTest = (term, lab, startDate) => {
  console.log('getIntoTest request start');
  var result = false;
  wx.cloud.callFunction({
    name: 'getinfotest',
    data: {
      term: term,
      lab: lab,
      date: startDate,
    },

    success: res => {
      console.log(res);
      result = res;
    },
    
    fail: res => {
      console.log(res);
      util.showModel('提示', '课表拉取失败');
    }
  })
  return result;
}

module.exports = {
  testJs: testJs,
  getInfoTest: getInfoTest,
}
