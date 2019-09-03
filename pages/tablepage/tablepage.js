// pages/tablepage/tablepage.js
var week = [];
var year = [];
var month = [];
var day = [];
var util = require("../../utils/util.js");
var requestman = require("../../utils/requestman.js");

for (var i = 0; i < 28; i++) {
  week.push(i)
}

var month_last = Array(31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31);


Page({
  data: {
    classroom: ["西-新E1105", "东区101", "西-新E1329"],
    week: week,
    term: ['2019年秋', '2019年春', '2018年秋'],
    grade: [],
    indexT: 0,
    room_index: 0,
    week_index: 0,
    date: 0,
    today_date: 0,
    the_week: 0,
    monday_date: 0,
    month_date: 0,
    year_date: 0,
    week_list: 0,
    month_list: 0,
    information_obj: {},
    subject: [
      [{
        "id": "0",
      }, {
        "id": "0",
      }, {
        "id": "0",
      }, {
        "id": "0",
      }, {
        "id": "0",
      }, {
        "id": "0",
      }, {
        "id": "0",
      }],
      [{
        "id": "0",
      }, {
        "id": "0",
      }, {
        "id": "0",
      }, {
        "id": "0",
      }, {
        "id": "0",
      }, {
        "id": "0",
      }, {
        "id": "0",
      }],
      [{
        "id": "0",
      }, {
        "id": "0",
      }, {
        "id": "0",
      }, {
        "id": "0",
      }, {
        "id": "0",
      }, {
        "id": "0",
      }, {
        "id": "0",
      }],
      [{
        "id": "0",
      }, {
        "id": "0",
      }, {
        "id": "0",
      }, {
        "id": "0",
      }, {
        "id": "0",
      }, {
        "id": "0",
      }, {
        "id": "0",
      }],
      [{
        "id": "0",
      }, {
        "id": "0",
      }, {
        "id": "0",
      }, {
        "id": "0",
      }, {
        "id": "0",
      }, {
        "id": "0",
      }, {
        "id": "0",
      }],
      [{
        "id": "0",
      }, {
        "id": "0",
      }, {
        "id": "0",
      }, {
        "id": "0",
      }, {
        "id": "0",
      }, {
        "id": "0",
      }, {
        "id": "0",
      }]
    ],
    click_images: 0,
    last_click: -1,
    msg_x: -1,
    msg_y: -1,
    classroom_arr: false,
    week_arr: false,
    message_tip: false,
    term_arr: false,
    onLoadFlag: true, //判断程序是否第一次启动
    isStudent: false,
    isTeacher: false,
    studentId: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var startDate = util.formatTime(new Date);
    startDate = startDate.toString();
    console.log(startDate);
    var that = this;
    var lab = that.data.classroom[that.data.room_index];
    var term = wx.getStorageSync('term');
    if (typeof (term) == "undefined" || term.length == 0) {
      term = that.data.term[that.data.indexT];
    }

    if (options.week != undefined && options.room_index) {
      that.setData({
        room_index: options.room_index,
        week_index: options.week,
        today_date: startDate,
      })
      that.onPullDownRefresh();
    } else {
      wx.showLoading({
        title: '加载中',
      })
      // var resBody = requestman.getInfoTest(term, lab, startDate);
      // console.log(resBody);
      // if(resBody != false){
      //   wx.hideLoading();
      //   that.data.information_obj = resBody,
      //   that.information_factory(resBody);
      // }
      
      wx.cloud.callFunction({
        name: 'getinfotest',
        data: {
          term: term,
          lab: lab,
          date: startDate,
        },
        success: res => {
          wx.hideLoading();
          console.log(res);
          that.setData({
            information_obj: res,
          })
          that.information_factory(res);
        },
        fail: res => {
          wx.hideLoading();
          console.log(res);
        }
      })
      that.setData({
        date: startDate,
        today_date: startDate,
      })
    }
    that.getAllLab();
  },

  /**
   * 生命周期
   */
  onShow: function (options) {
    var that = this;
    if (that.data.onLoadFlag) {
      that.setData({
        onLoadFlag: false,
      })
    } else {
      wx.onAppShow
      that.onPullDownRefresh();
    }
    var isStudent = wx.getStorageSync('isStudent');
    var isTeacher = wx.getStorageSync('isTeacher');
    var studentId = wx.getStorageSync('studentId');
    console.log(studentId);
    if (typeof (isStudent) != "undefined" && typeof (isTeacher) != "undefined") {
      that.setData({
        isStudent: isStudent,
        isTeacher: isTeacher,
      })
    }
    if (typeof (studentId) != 'underfined' && studentId.length != 0) {
      that.setData({
        studentId: studentId,
      })
    }
  },

  information_factory: function (information_obj) {
    var that = this;
    var obj = information_obj;
    var date = obj.result.start_time.split('-', 3);
    var data = obj.result.data;
    var year = date[0];
    var month = date[1];
    var monday = parseInt(date[2]);
    var week = obj.result.week;

    console.log('date' + date);
    console.log('data');
    console.log(data);

    that.setData({
      month_date: month,
      monday_date: monday,
      year_date: year,
    })

    that.data_factory(data);
    that.week_factory(monday);

    if (week != undefined) {
      that.setData({
        the_week: obj.result.week,
        week_index: obj.result.week,
      })
    } else {
      console.log("week is undefined!");
    }
  },

  data_factory: function (data_obj) {
    var that = this;
    var obj = data_obj;
    var subject_obj = that.data.subject;
    console.log("data_obj");
    console.log(data_obj);
    for (var i = 0; i < 6; i++) {
      for (var j = 0; j < 7; j++) {
        subject_obj[i][j].id = '0';
        subject_obj[i][j].subject = '0';
        subject_obj[i][j].teacher = '0';
        subject_obj[i][j].class = '0';
        subject_obj[i][j].grade = '0';
        subject_obj[i][j].state = 0;
      }
    }

    for (var i = 0; i < data_obj.length; i++) {
      var olddata = obj[i].course_date.replace(/-/g, '/');
      var time = new Date(olddata);
      var day = time.getDate() - that.data.monday_date;
      var part = obj[i].part - 1;
      if (day < 0) {
        day = day + month_last[that.data.month_date - 1];
      }
      console.log(obj[i].course_date);
      console.log(time);
      console.log('time' + time + ' time.getDate()' + time.getDate());
      console.log('day' + day);
      subject_obj[part][day].id = obj[i]._id;
      subject_obj[part][day].subject = obj[i].course_name;
      subject_obj[part][day].teacher = obj[i].course_teacher;
      subject_obj[part][day].class = obj[i].course_class;
      subject_obj[part][day].grade = obj[i].grade;
      subject_obj[part][day].state = obj[i].state;
    }

    that.setData({
      subject: subject_obj,
    })
  },

  week_factory: function (monday_date) {
    var that = this;
    var monday = monday_date;
    var month_date = that.data.month_date - 0;
    var last_day = month_last[month_date - 1];
    var week_list = new Array();
    var month_list = new Array();
    week_list.push(monday);
    month_list.push(month_date);

    for (var i = 1; i < 7; i++) {
      var day = monday + i;
      if ((last_day - day) < 0) {
        week_list.push((day - last_day));
        month_list.push(month_date + 1);
      } else {
        week_list.push(day);
        month_list.push(month_date);
      }
    }

    that.setData({
      week_list: week_list,
      month_list: month_list,
    })
  },

  getCloudInfo: function (labInfo, weekInfo) {
    var that = this;
    var lab = labInfo;
    var week = weekInfo;
    var term = that.data.term[that.data.indexT];

    wx.showLoading({
      title: '加载中',
    })
    wx.cloud.callFunction({
      name: 'getInfobyweek',
      data: {
        lab: lab,
        week: week,
        term: term,
      },
      success: res => {
        wx.hideLoading();
        console.log(res);
        that.information_factory(res);
      },
      fail: res => {
        wx.hideLoading();
        console.log(res);
      }
    })
  },

  /**
   * 请求得到所有实验室数据
   */
  getAllLab: function () {
    var that = this;
    var classroom = new Array();
    wx.cloud.callFunction({
      name: 'getalllab',
      data: {},
      success: res => {
        console.log(res)
        for (var i = 0; i < res.result.data.length; i++) {
          classroom[i] = res.result.data[i].lab_room;
        }

        that.setData({
          classroom: classroom,
        })
      }
    })
  },

  bindPickerChange_a: function (e) {
    var that = this;
    var room_index = e.detail.value;
    var week = that.data.week[that.data.week_index];

    that.setData({
      room_index: room_index,
      classroom_arr: false,
    })
    that.getCloudInfo(that.data.classroom[room_index], week);
  },

  bindPickerTapOn_a: function () {
    this.setData({
      classroom_arr: true,
    })
  },

  bindPickerTapOff_a: function () {
    this.setData({
      classroom_arr: false,
    })
  },

  bindPickerChange_b: function (e) {
    var week_index = e.detail.value;
    var that = this;
    var lab = that.data.classroom[that.data.room_index];

    that.setData({
      week_index: week_index,
      week_arr: false,
    })
    that.getCloudInfo(lab, week[week_index]);
  },

  bindPickerTapOn_b: function () {
    this.setData({
      week_arr: true,
    })
  },

  bindPickerTapOff_b: function () {
    this.setData({
      week_arr: false,
    })
  },

  bindPickerChange_term: function (e) {
    console.log('选择学期,携带值', e.detail.value)
    var that = this;
    var lab = that.data.classroom[that.data.room_index];
    var week = that.data.week[that.data.week_index];
    that.setData({
      indexT: e.detail.value,
    })
    that.getCloudInfo(lab, week);
  },

  bindPickerTapOn_term: function () {
    this.setData({
      term_arr: true,
    })
  },

  bindPickerTapOff_term: function () {
    this.setData({
      term_arr: false,
    })
  },

  clickZone: function (e) {
    var that = this;
    var click_images = new Array();
    var zoneId = e.currentTarget.id;
    var click_string = 'click_images[' + zoneId + ']';
    var img_src = '../../images/add_class.png';

    if (that.data.last_click != zoneId) {
      console.log(zoneId);
      that.setData({
        click_images: click_images,
      });
      that.setData({
        [click_string]: img_src,
        last_click: zoneId,
      });
    } else {
      var session = wx.getStorageSync('session');
      var zone = parseInt(zoneId);
      var zone_x = (zone) % 7;
      var zone_y = parseInt((zone) / 7);
      var day = that.data.week_list[zone_x];
      var month = that.data.month_list[zone_x];
      var part = zone_y + 1;
      if (day - 10 < 0) {
        day = '0' + day;
      }
      var date = that.data.year_date + "-" + month + "-" + day;
      var startDate = that.data.today_date;

      wx.setStorageSync("week", that.data.week[that.data.week[that.data.week_index]]);
      wx.setStorageSync("classroom", that.data.classroom[that.data.room_index]);
      wx.setStorageSync('room_index', that.data.room_index);
      wx.setStorageSync('part', part);
      wx.setStorageSync('date', date);
      wx.setStorageSync('term', that.data.term[that.data.indexT]);

      that.judgeClassFree(zone_x, zone_y);
      if (that.data.isTeacher == true && that.data.isStudent == false) {
        if (session == startDate) {
          wx.navigateTo({
            url: '../addC/addC',
          })
        } else {
          wx.navigateTo({
            url: '../login/login?id=0',
          })
        }
      }

      if (that.data.isTeacher == false && that.data.isStudent == true) {
        util.showBusy('学生无法新建实验');
      }

      if (that.data.isTeacher == false && that.data.isStudent == false) {
        wx.navigateTo({
          url: '../login/login?id=0',
        })
      }
    }
  },


  judgeClassFree: function (x, y) {
    var that = this;
    var part_index = y;
    var day_index = x;
    var free = 0;
    var subject = that.data.subject;
    for (var i = 0; i < 6; i++) {
      if (subject[i][day_index].subject == 0) {
        console.log('(' + i + ',' + day_index + ') is free');
        free = free + ',' + (i + 1);
      }
    }
    wx.setStorageSync('free', free);
  },

  message_disappear: function () {
    var that = this;
    that.setData({
      message_tip: false,
    })
  },

  message_appear: function (e) {
    var that = this;
    var zoneId = e.currentTarget.id;
    var index = zoneId.split(",", 2);
    var index_x = index[0];
    var index_y = index[1];

    console.log("run messsage_appear")

    that.setData({
      message_tip: true,
      msg_x: index_x,
      msg_y: index_y,
    })
  },

  /**
   * 分享页
   */
  onShareAppMessage: function () {
    return {
      title: '排课表',
      desc: '哈理工软微学院实验室排课表',
      path: '/pages/tablepage/tablepage?id=123',
      success: function (res) {
        console.log(res)
      },
      fail: function (res) {
        console.log(res);
      }
    }
  },

  deleteInfo: function () {
    var that = this;
    var msg_x = that.data.msg_x;
    var msg_y = that.data.msg_y;
    var subject = that.data.subject;
    var id = subject[msg_x][msg_y].id;
    var teacher_id = wx.getStorageSync('teacher_id');
    var session = wx.getStorageSync('session');
    var today_date = that.data.today_date;
    console.log("session" + session);
    console.log('teacher_id' + teacher_id);

    if (session == today_date && teacher_id != '') {
      wx.showModal({
        title: '提示',
        content: '是否删除这节实验课',
        success: res => {
          if (res.confirm) {
            wx.showLoading({
              title: '加载中',
            })
            wx.cloud.callFunction({
              name: 'deleteInfo',
              data: {
                _id: id,
                teach_id: teacher_id,
              },
              success: res => {
                console.log(res);
                wx.hideLoading();
                if (res.result.res == 1) {
                  util.showSuccess('成功删除');
                  that.onPullDownRefresh();
                } else if (res.result.res == 0) {
                  util.showModel('失败', '您不是该实验的建立者');
                }
              },
              fail: res => {
                wx.hideLoading();
                console.log(res);
              }
            })
          } else if (res.cancel) { }
        }
      })
    } else {
      wx.navigateTo({
        url: '../login/login?id=1',
      })
    }
  },

  onMyClass: function () {
    var that = this;
    var session = wx.getStorageSync('session');
    var teacher_id = wx.getStorageSync('teacher_id');
    var startDate = that.data.today_date;
    console.log(teacher_id);

    if (that.data.isTeacher == true) {
      if (session == startDate && teacher_id != '') {
        wx.navigateTo({
          url: '../myclass/myclass',
        })
      } else {
        wx.navigateTo({
          url: '../login/login?id=1',
        })
      }
    }


    if (that.data.isStudent == true) {
      wx.showModal({
        title: '提示',
        content: '是否要注销该账户',
        success: res => {
          if (res.confirm) {
            wx.showModal({
              title: '提示',
              content: '注销账号成功',
              showCancel: false,
              confirmText: '确定',
              success: function (res) {
                wx.setStorageSync('isStudent', false);
                wx.setStorageSync('isTeacher', false);
                wx.setStorageSync('studentId', '')
                that.setData({
                  isStudent: false,
                  isTeacher: false,
                  studentId: '',
                })
              },
            })
          }
        }
      })
    }

    if (that.data.isStudent == false && that.data.isTeacher == false) {
      wx.navigateTo({
        url: '../login/login?id=1',
      })
    }
  },

  /**
   * 点击签到
   */
  signIn: function () {
    var that = this;
    var msg_x = that.data.msg_x;
    var msg_y = that.data.msg_y;
    var subject = that.data.subject[msg_x][msg_y]
    var classId = subject.id;
    var className = subject.subject;
    var teacher = subject.teacher
    var url = '../signUp/signUp?classId=' + classId + '&className=' + className +
      '&teacher=' + teacher + '&time=' + msg_x;
    console.log(url);
    if (that.data.isStudent) {
      wx.navigateTo({
        url: url,
      })
    } else {
      wx.navigateTo({
        url: '../login/login?id=1',
      })
    }

  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh: function () {
    var that = this;
    var lab = that.data.classroom[that.data.room_index];
    var week = that.data.week[that.data.week_index];
    var term = that.data.term[that.data.indexT];

    console.log(lab);
    console.log(week);
    console.log(term);

    wx.showLoading({
      title: '加载中',
    })
    wx.cloud.callFunction({
      name: 'getInfobyweek',
      data: {
        lab: lab,
        week: week,
        term: term,
      },
      success: res => {
        wx.hideLoading();
        console.log(res);
        that.information_factory(res);
        wx.stopPullDownRefresh();
      },
      fail: res => {
        wx.hideLoading();
        util.showModel('错误', '刷新失败！');
        wx.stopPullDownRefresh();
      },
    })
  }
})