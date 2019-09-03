// pages/signUp/signUp.js
var util = require("../../utils/util.js");

Page({

  /**
   * 页面的初始数据
   */
  data: {
    class_name: 'NaN',
    teacher_name: 'NaN',
    class_time: 'NaN',
    Length: 4, //输入框个数
    isFocus: true, //聚焦
    Value: "", //输入的内容
    ispassword: false, //是否密文显示 true为密文， false为明文。
    classId: '',
    student_id: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    var classId = options.classId;
    var teacher = options.teacher;
    var className = options.className;
    var time = parseInt(options.time) + 1;
    var student_id = wx.getStorageSync('studentId');
    console.log(classId);
    console.log(teacher);
    console.log(className);
    console.log(time);
    var class_time = '第' + time + '大节';
    if (typeof(classId) != "undefined" && classId.length != 0) {
      that.setData({
        classId: classId,
        class_time: class_time,
        teacher_name: teacher,
        class_name: className,
        student_id: student_id,
      })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

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

  formSubmit: function(e) {
    var that = this;
    var password = e.detail.value.password;
    console.log(password);
    if (typeof(password) != "undefined" && password.length != 0) {
      wx.cloud.callFunction({
        name: 'sign',
        data: {
          student_id: that.data.student_id,
          password: password,
          lab_id: that.data.classId
        },
        success: res => {
          console.log(res);
          var code = res.result.res;
          switch (code) {
            case 0:
              util.showBusy('未设置签到');
              break;

            case 1:
              wx.showModal({
                title: '提示',
                content: '签到成功',
                showCancel: false,
                confirmText: '确定',
                success: function (res) {
                  if (res.confirm) {
                    wx.reLaunch({
                      url: '../tablepage/tablepage',
                    })
                  }
                }
              })
              break;

            case 2:
              wx.showModal({
                title: '提示',
                content: '该微信用户已签到',
                showCancel: false,
                confirmText: '确定',
                success: function (res) {
                  if (res.confirm) {
                    wx.reLaunch({
                      url: '../tablepage/tablepage',
                    })
                  }
                }
              })
              break;

            case 3:
              util.showBusy('签到失败，请重试');
              break;

            case 4:
              util.showBusy('验证码错误');
              break;

            case 5:
              util.showBusy('没找到签到信息');
              break;
          }
        }
      });
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})