// pages/startSign/startSign.js

var hour = [];
var minute = [];
var util = require("../../utils/util.js");

for (var i = 0; i < 2; i++) {
  hour.push(i)
}

for (var i = 5; i < 60; i++) {
  minute.push(i);
}

var valHandle; //定时器
const ctx = wx.createCanvasContext("bgCanvas");

/**
 * 实现键值存储
 */
function Map() {
  this.keys = new Array();
  this.data = new Array();

  //添加键值
  this.set = function(key, value) {
    if (this.keys.indexOf(key) == -1) {
      this.keys.push(key);
      var newClassObj = new ClassValue();
      newClassObj.set(value);
      this.data[key] = newClassObj;
    } else {
      var oldClassObj = this.data[key];
      oldClassObj.set(value);
    }
  };

  //取值
  this.get = function(key) {
    return this.data[key].student;
  };

  //取键
  this.getKey = function() {
    return this.keys;
  };

  this.getData = function() {
    return this.data;
  };

  //去除键值
  this.remove = function(key) {
    this.keys.remove(key);
    this.data[key] = null;
  };

  //判断键元素大小
  this.size = function() {
    return this.keys.length;
  };

  //判断键元素是否为空
  this.isEmpty = function() {
    return this.keys.length == 0;
  };

}

function ClassValue() {
  this.student = new Array();
  // this.classId = '';

  this.set = function(studentId) {
    this.student.push(studentId);
  };

  this.getAll = function() {
    return this.student;
  };

  this.size = function() {
    return this.student.length;
  }
}

Page({

  /**
   * 页面的初始数据
   */
  data: {
    Length: 4, //输入框个数
    isFocus: true, //聚焦
    Value: "", //输入的内容
    ispassword: false, //是否密文显示 true为密文， false为明文。
    hour_index: 0,
    minute_index: 0,
    hour: hour,
    minute: minute,
    classId: '',
    stepText: 5, //设置倒计时初始值
    isStart: false,
    mask: [],
    state: '',
    message_tip: false,
    signUpStudent: [],
    number: [],
    isScroll: true,
    goodStudent: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    var classId = options.classId;
    var state = options.state;
    if (typeof(classId) != 'undefined' && classId.Length != 0) {
      that.setData({
        classId: classId,
      })
    }
    if (typeof(state) != 'undefined' && state.Length != 0) {
      that.setData({
        state: state,
      })
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    var that = this;
    switch (that.data.state) {
      case '0':
        that.setsigninfo();
        break;

      case '1':
        that.cheakOldDate();
        break;

      case '2':
        that.cheakOldDate();
        break;
    }
  },

  setsigninfo: function() {
    var that = this;
    console.log("setsigninfo");
    wx.cloud.callFunction({
      name: "setsigninfo",
      data: {
        lab_id: that.data.classId,
      },
      success: res => {
        console.log(res);
        var code = res.result.res;
        switch (code) {
          case 0:
            util.showBusy('验证码获取失败');
            break;

          case 1:
            var codeStorage = 'code' + that.data.classId;
            var startDate = util.longFormatTime(new Date);
            startDate = startDate.toString();
            console.log(startDate);
            var signStartTime = 'time' + that.data.classId;
            util.showSuccess('获取验证码成功');
            var mask = new Array();
            var tempMask = res.result.password + "";
            console.log(tempMask.length);
            for (var i = 0; i < tempMask.length; i++) {
              mask[i] = tempMask.substr(i, 1);
              console.log(mask[i]);
            }
            that.setData({
              mask: mask,
              isStart: true,
              Value: res.result.password,
            })
            that.readyCanvas();
            that.clickStartBtn();
            wx.setStorageSync(codeStorage, res.result.password);
            wx.setStorageSync(signStartTime, startDate);
            break;

          case 2:
            util.showBusy('该课已设置过签到');
            break;
        }
      },
      fail: res => {
        console.log(res);
      }
    })
  },

  Focus(e) {
    var that = this;
    console.log(e.detail.value);
    var inputValue = e.detail.value;
    that.setData({
      Value: inputValue,
    })
  },

  Tap() {
    var that = this;
    that.setData({
      isFocus: true,
    })
  },

  // formSubmit: function(e) {
  //   var that = this;
  //   var password = e.detail.value.password;
  //   console.log(password);
  //   console.log(that.data.classId);
  //   wx.cloud.callFunction({
  //     name: 'setsigninfo',
  //     data: {
  //       password: password,
  //       lab_id: that.data.classId,
  //     },
  //     success: res => {
  //       console.log(res);
  //       switch (res.result.res) {
  //         case '0':
  //           util.showBusy('验证码获取失败');
  //           break;

  //         case '1':
  //           util.showSuccess('获取验证码成功');
  //           that.setData({
  //             mask: res.result.password,
  //           })
  //           that.readyCanvas();
  //           that.clickStartBtn();
  //           break;

  //         case '2':
  //           util.showBusy('该课已设置过签到');
  //           break;

  //           break;

  //       }
  //     }
  //   })
  // },

  // bindPickerChange_a: function(e) {
  //   var that = this;
  //   var hour_index = e.detail.value;
  //   var minute = that.data.minute[that.data.minute_index];

  //   that.setData({
  //     hour_index: hour_index,
  //     hour_arr: false,
  //   })
  //   // that.getCloudInfo(that.data.classroom[room_index], week);
  // },

  // bindPickerChange_b: function(e) {
  //   var that = this;
  //   var minute_index = e.detail.value;
  //   var hour = that.data.hour[that.data.hour_index];

  //   that.setData({
  //     minute_index: minute_index,
  //     hour_arr: false,
  //   })
  //   // that.getCloudInfo(that.data.classroom[room_index], week);
  // },

  cheakOldDate: function() {
    var that = this;
    var classId = that.data.classId;
    var tempTime = 'time' + classId;
    var tempCode = 'code' + classId;
    var time = wx.getStorageSync(tempTime);
    var tempMask = wx.getStorageSync(tempCode) + '';

    console.log(time);
    console.log(tempMask);

    var mask = new Array();
    var oldTime = new Array();
    var newTime = new Array();
    var theDate = util.longFormatTime(new Date);
    theDate = theDate.toString();
    console.log(theDate);
    newTime = theDate.split('-');
    oldTime = time.split('-');

    var sum = util.hourToSecond(newTime[3]) - util.hourToSecond(oldTime[3]) + util.minuteToSecond(newTime[4]) - util.minuteToSecond(newTime[4]) + newTime[5] - oldTime[5];

    console.log(newTime[3]);
    console.log(util.hourToSecond(newTime[3]));
    console.log(sum);

    // if (sum < 3600) {
    //   that.setData({
    //     isStart: true,
    //   })
    //   that.readyCanvas();
    //   that.clickStartBtn();
    // }

    for (var i = 0; i < tempMask.length; i++) {
      mask[i] = tempMask.substr(i, 1);
    }
    that.setData({
      mask: mask,
    })
  },

  readyCanvas: function() {
    ctx.setLineWidth(16)
    ctx.arc(50, 50, 50, 0, 2 * Math.PI)
    ctx.setStrokeStyle('white')
    ctx.stroke()

    ctx.beginPath()
    ctx.setLineCap('round')
    ctx.setLineWidth(10)
    ctx.arc(50, 50, 50, 1.5 * Math.PI, -0.5 * Math.PI, true)
    ctx.setStrokeStyle('green')
    ctx.stroke()
    ctx.draw()
  },

  //点击开始倒计时按钮
  clickStartBtn: function() {
    console.log("倒计时动画开始")
    var that = this
    var hour = parseInt(that.data.hour_index);
    var minute = parseInt(that.data.minute_index) + 5;
    var time = minute * 60 + hour * 3600;
    that.data.stepText = time //重新设置一遍初始值，防止初始值被改变
    var step = that.data.stepText; //定义倒计时
    var num = -0.5;
    var decNum = 2 / step / 10
    console.log(step);
    clearInterval(valHandle)

    function drawArc(endAngle) {
      ctx.setLineWidth(10)
      ctx.arc(75, 75, 30, 0, 2 * Math.PI)
      ctx.setStrokeStyle('white')
      ctx.stroke()

      ctx.beginPath()
      ctx.setLineCap('round')
      ctx.setLineWidth(6)
      ctx.arc(75, 75, 30, 1.5 * Math.PI, endAngle, true)
      ctx.setStrokeStyle('green')
      ctx.stroke()
      ctx.draw()
    }

    valHandle = setInterval(function() {

      that.setData({
        stepText: parseInt(step)
      })
      step = (step - 0.1).toFixed(1)

      num += decNum
      drawArc(num * Math.PI)

      if (step <= 0) {
        clearInterval(valHandle) //销毁定时器

      }

    }, 100)
  },


  /**
   * 点击查看签到名单按钮监听函数
   */
  check: function() {
    var that = this;
    wx.cloud.callFunction({
      name: "getsignedstu",
      data: {
        lab_id: that.data.classId,
      },
      success: res => {
        console.log(res.result.data);
        var student = res.result.data;

        that.formatGoodStudent(
          that.classJudgemen(
            that.stringSort(student)
          )
        );
        that.message_appear();
      },
      fail: res => {
        console.log(res);
      }
    })
  },

  stringSort: function(str) {
    var student = str;
    for (var i = 0; i < student.length; i++) {
      student[i] = parseInt(student[i]);
    }
    for (var i = 0; i < student.length; i++) {
      for (var j = i; j < student.length; j++) {
        if (student[i] > student[j]) {
          var temp = student[i];
          student[i] = student[j];
          student[j] = temp;
        }
      }
    }
    for (var i = 0; i < student.length; i++) {
      student[i] = String(student[i]);
    }
    return student;
  },

  message_disappear: function() {
    var that = this;
    that.setData({
      message_tip: false,
      isScroll: true,
    })
  },

  message_appear: function(e) {
    var that = this;
    that.setData({
      message_tip: true,
      isScroll: false,
    })
  },

  /**
   * 为学生分班
   */
  classJudgemen: function(studentData) {
    var that = this;
    console.log("do classJudgemen");
    var map = new Map();
    var studentArray = new Array();

    for (var i = 0; i < studentData.length; i++) {
      var grade = studentData[i].substring(0, 8);
      var studentId = studentData[i];

      map.set(grade, studentId);
    }
    var keys = map.getKey();

    for (var i = 0; i < keys.length; i++) {
      studentArray.push(map.get(keys[i]));
    }

    that.setData({
      goodStudent: studentArray,
    })
    return studentArray;
  },

  /**
   * 格式化显示的数据格式
   */
  formatGoodStudent: function(student) {
    var that = this;

    var signUpStudent = new Array();
    var number = new Array();

    for (var i = 0; i < student.length; i++) {
      var numStr = "专业:" + that.setSubject(student[i][0].substring(4, 6)) + "," + student[i][0].substring(0, 2) + "级, " + student[i][0].substring(6, 8) + "班共有" + student[i].length + "人签到";
      number.push(numStr);
      var goodStudentId = '';
      for (var j = 0; j < student[i].length; j++) {
        goodStudentId = goodStudentId + student[i][j] + ',';
        if ((j + 1) % 3 == 0) {
          goodStudentId = goodStudentId + '\n';
        }
      }
      signUpStudent.push(goodStudentId);
    }
    that.setData({
      signUpStudent: signUpStudent,
      number: number,
    })
  },

  /**
   * 匹配专业
   */
  setSubject: function(subjectId) {
    if (subjectId == '01')
      return '软件工程';
    if (subjectId == '02')
      return '集成电路';
    if (subjectId == '03')
      return '物联网';
    if (subjectId == '04')
      return '电子科学与技术';
    return '未知专业';
  }
})