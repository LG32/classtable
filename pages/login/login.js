// pages/login/login.js
const app = getApp();
const util = require("../../utils/util.js");

Page({
  data: {
    canIUse: wx.canIUse('button.open-type.getUseInfo'),
    userInfo: {},
    logged: false,
    showLoading: '',
    userInfoFlag: false,
    password: '',
    id: -1,
    identityStatus: '教师登录',
    changeIdentity: '切换至学生登录',
    isStudent: false,
  },


  onLoad: function (options) {
    let that = this;
    let id = options.id;
    console.log("获取用户信息");
    that.checkGetSetting();
    that.setData({
      id: id,
    })
    if (1 == id) {
      util.showBusy('请先登录！');
    }
  },


  onGetOpenid: function (e) {
    // 调用云函数
    wx.showLoading({
      title: '加载中',
    })
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        wx.hideLoading();
        console.log('[云函数] [login] user openid: ', res.result.openid);
        app.globalData.openid = res.result.openid;
      },
      fail: err => {
        wx.hideLoading();
        console.error('[云函数] [login] 调用失败', err)
        wx.navigateTo({
          url: '../tablepage/tablepage',
        })
      }
    })
  },

  formSubmit: function (e) {
    let that = this;
    let startDate = util.formatTime(new Date);
    let id = that.data.id;

    wx.showLoading({
      title: '加载中',
    })
    if (!that.data.isStudent) {
      let password = e.detail.value.password;
      let teacher_id = e.detail.value.teacher_id;
      if (password !== '' && teacher_id !== '') {
        wx.cloud.callFunction({
          name: 'teacherlogin',
          data: {
            teach_id: teacher_id,
            password: password,
          },
          success: res => {
            wx.hideLoading();
            console.log(res);
            if (res.result.res == 1) {
              util.showSuccess(res.result.msg);
              wx.setStorageSync('teacher_id', teacher_id);
              wx.setStorageSync('last_login', startDate);
              wx.setStorageSync('identity', 'teacher');
              if (id == 0) {
                wx.redirectTo({
                  url: '../addC/addC',
                })
              }
              if (id == 1) {
                wx.navigateTo({
                  url: '../tablepage/tablepage',
                })
              }

            } else {
              util.showBusy('教工号或密码错');
            }
          }
        })
        this.onGetOpenid();

      } else {
        wx.hideLoading();
        util.showBusy('请输入完整！');
      }
    } else {
      let student_id = e.detail.value.student_id;
      if (student_id !== '' && student_id.length === 10) {
        console.log(student_id);
        wx.hideLoading();
        wx.setStorageSync('studentId', student_id);
        wx.setStorageSync('last_login', startDate);
        wx.setStorageSync('identity', 'student');
        wx.navigateTo({
          url: '../tablepage/tablepage',
        })

        this.onGetOpenid();
      } else {
        wx.hideLoading();
        util.showBusy('请输入完整学号！');
      }
    }
  },

  checkGetSetting: function () {
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              console.log('获取用户信息成功！')
              this.setData({
                avatarUrl: res.userInfo.avatarUrl,
                userInfo: res.userInfo,
                userInfoFlag: true,
              })
            },
            fail: res => {
              console.log('获取用户信息失败！');
            }
          })
        }
      },
      fail: res => {
        console.log('未授权');
      }
    })
  },

  /**
   * 监听用户身份改变
   */
  onClickChangeIdentity: function () {
    let that = this;
    if (!that.data.isStudent) {
      that.setData({
        identityStatus: '学生登录',
        changeIdentity: '切换至教师登录',
        isStudent: true,
      })
    } else if (that.data.isStudent) {
      that.setData({
        identityStatus: '教师登录',
        changeIdentity: '切换至学生登录',
        isStudent: false,
      })
    }
  },
})
