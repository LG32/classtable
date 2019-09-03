// pages/myclass/myclass.js
Page({


  data: {
    subject: [],
  },


  onLoad: function (options) {
    var that = this;
    var teacher_id = wx.getStorageSync('teacher_id');
    wx.showLoading({
      title: '加载中',
    })
    wx.cloud.callFunction({
      name: 'mycourse',
      data: {
        teach_id: teacher_id,
      },
      success: res => {
        wx.hideLoading();
        var data = res.result.data;
        var subject = new Array();
        console.log(res);
        console.log(data);
        subject.push(data[0]);
        for (var i = 1; i < data.length; i++) {
          if (data[i].course_class == data[i - 1].course_class &&
            data[i].course_date == data[i - 1].course_date) {
            var length = subject.length - 1;
            var part = subject[length].part + ',' + data[i].part;
            subject[length].part = part;
          } else {
            subject.push(data[i]);
          }
        }
        that.setData({
          subject: subject,
        })
      },
      fail: res => {
        wx.hideLoading();
        console.log(res);
      }
    })
  },

  exit: function () {
    var session = "session";
    session = session.toString();
    wx.showModal({
      title: '提示',
      content: '是否要注销该账户',
      success: res => {
        if (res.confirm) {
          wx.removeStorageSync('teacher_id');
          wx.removeStorage({
            key: session,
            success: res => {
              wx.showModal({
                title: '提示',
                content: '注销账号成功',
                showCancel: false,
                confirmText: '确定',
                success: function (res) {
                  wx.setStorageSync('isStudent', false);
                  wx.setStorageSync('isTeacher', false);
                  wx.setStorageSync('studentId', '')
                  if (res.confirm) {
                    wx.reLaunch({
                      url: '../tablepage/tablepage',
                    })
                  }
                },
              })
            },
          })
        }
        if (res.cancel) {

        }
      },
    })
  },

  startSignIn: function (e) {
    var that = this;
    var zoneId = e.currentTarget.id;
    console.log(zoneId);
    switch (that.data.subject[zoneId].state) {
      case 0:
        wx.showModal({
          title: '提示',
          content: '是否开始签到',
          success: res => {
            if (res.confirm) {
              var url = '../startSign/startSign?classId=' + that.data.subject[zoneId]._id + '&state=' + that.data.subject[zoneId].state;
              wx.navigateTo({
                url: url,
              })
            }
            if (res.cancel) {

            }
          },
        })

        break;

      case 1:
        var url = '../startSign/startSign?classId=' + that.data.subject[zoneId]._id + '&state=' + that.data.subject[zoneId].state;
        wx.navigateTo({
          url: url,
        })
        break;

      case 2:
        var url = '../startSign/startSign?classId=' + that.data.subject[zoneId]._id + '&state=' + that.data.subject[zoneId].state;
        wx.navigateTo({
          url: url,
        })
        break;
    }

  }
})