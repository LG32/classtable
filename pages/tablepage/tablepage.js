// pages/tablepage/tablepage.js
let week = [];
let util = require("../../utils/util.js");
let TablePageSVC = require('../../service/tablepage_svc');
let subject_row = [];

for(let i = 0; i < 6; i++){
  let subject_line = [];
  for (let j = 0; j < 7; j++){
    let temp = { "id": "0",};
    subject_line.push(temp)
  }
  subject_row.push(subject_line)
}

for (let i = 0; i < 28; i++) {
  week.push(i)
}

let month_last = Array(31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31);


Page({
  data: {
    classroom: ["西-新E1105", "东区101", "西-新E1329"],
    week: week,
    term: ['2021年春','2020年秋','2020年春', '2019年秋', '2019年春', '2018年秋'],
    semester: {},
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
    subject: subject_row,
    click_images: 0,
    last_click: -1,
    msg_x: -1,
    msg_y: -1,
    classroom_arr: false,
    week_arr: false,
    message_tip: false,
    term_arr: false,
    onLoadFlag: true, //判断程序是否第一次启动
    identity: 'visitor',
    studentId: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let startDate = util.formatTime(new Date);
    startDate = startDate.toString();
    console.log(startDate);
    let that = this;
    let lab = that.data.classroom[that.data.room_index];
    // let term = wx.getStorageSync('term');
    // if (typeof (term) == "undefined" || term.length === 0) {
      let term = that.data.term[that.data.indexT];
    // }

    if (options.week !== undefined && options.room_index) {
      that.setData({
        room_index: options.room_index,
        week_index: options.week,
        today_date: startDate,
      });
      that.onPullDownRefresh();
    } else {
      let param = {
        'lab': lab,
        'term': term,
        'startDate': startDate,
      };
      that.setData({
        date: startDate,
        today_date: startDate,
      });
      TablePageSVC.getInfoTest(param, that.getInfoTest_cb);
    }
    TablePageSVC.getAllLab(that.getAllLab_cb)
  },

  onShow: function (options) {
    let that = this;
    if (that.data.onLoadFlag) {
      that.setData({
        onLoadFlag: false,
      })
    } else {
      wx.onAppShow;
      that.onPullDownRefresh();
    }
    let identity = wx.getStorageSync('identity');
    let studentId = wx.getStorageSync('studentId');
    if (typeof (identity) != "undefined" && identity !== '' ) {
      that.setData({
        identity: identity,
      })
    }
    if (typeof (studentId) != 'undefined' && studentId.length !== 0) {
      that.setData({
        studentId: studentId,
      })
    }
  },

  information_factory: function (information_obj) {
    let that = this;
    let obj = information_obj;
    let date = obj.result.start_time.split('-', 3);
    let data = obj.result.data;
    let year = date[0];
    let month = date[1];
    let monday = parseInt(date[2]);
    let week = obj.result.week;

    that.setData({
      month_date: month,
      monday_date: monday,
      year_date: year,
    });

    that.data_factory(data);
    that.week_factory(monday);

    if (week !== undefined) {
      that.setData({
        the_week: obj.result.week,
        week_index: obj.result.week,
      })
    } else {
      console.log("week is undefined!");
    }
  },

  data_factory: function (data_obj) {
    let that = this;
    let obj = data_obj;
    let subject_obj = that.data.subject;

    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < 7; j++) {
        subject_obj[i][j].id = '0';
        subject_obj[i][j].subject = '0';
        subject_obj[i][j].teacher = '0';
        subject_obj[i][j].class = '0';
        subject_obj[i][j].grade = '0';
        subject_obj[i][j].state = 0;
      }
    }

    for (let i = 0; i < data_obj.length; i++) {
      let olddata = obj[i].course_date.replace(/-/g, '/');
      let time = new Date(olddata);
      let day = time.getDate() - that.data.monday_date;
      let part = obj[i].part - 1;
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
    let that = this;
    let monday = monday_date;
    let month_date = that.data.month_date - 0;
    let last_day = month_last[month_date - 1];
    let week_list = [];
    let month_list = [];
    week_list.push(monday);
    month_list.push(month_date);

    for (let i = 1; i < 7; i++) {
      let day = monday + i;
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

  // 改变实验室
  bindPickerChange_a: function (e) {
    let that = this;
    let room_index = e.detail.value;
    let week = that.data.week[that.data.week_index];
    let lab = that.data.classroom[that.data.room_index];
    let term = that.data.term[that.data.indexT];
    let param = {
      'lab': lab,
      'week': week,
      'term': term,
    };

    that.setData({
      room_index: room_index,
      classroom_arr: false,
    });
    TablePageSVC.getInfoByWeek(param, that.getCloudInfo_cb);
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

  // 改变周数
  bindPickerChange_b: function (e) {
    let that = this;
    let week_idx = e.detail.value;
    let week = that.data.week[week_idx];
    let lab = that.data.classroom[that.data.room_index];
    let term = that.data.term[that.data.indexT];
    let param = {
      'lab': lab,
      'week': week,
      'term': term,
    };

    that.setData({
      week_index: week_idx,
      week_arr: false,
    });
    TablePageSVC.getInfoByWeek(param, that.getCloudInfo_cb);
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

  // 改变学期
  bindPickerChange_term: function (e) {
    let that = this;
    let term_idx = e.detail.value;
    let lab = that.data.classroom[that.data.room_index];
    let week = that.data.week[that.data.week_index];
    let term = that.data.term[term_idx];
    let param = {
      'lab': lab,
      'week': week,
      'term': term,
    };

    that.setData({
      indexT: e.detail.value,
    });
    TablePageSVC.getInfoByWeek(param, that.getCloudInfo_cb);
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
    let that = this;
    let click_images = [];
    let zoneId = e.currentTarget.id;
    let click_string = 'click_images[' + zoneId + ']';
    let img_src = '../../images/add_class.png';

    if (that.data.last_click !== zoneId) {
      console.log(zoneId);
      that.setData({
        click_images: click_images,
      });
      that.setData({
        [click_string]: img_src,
        last_click: zoneId,
      });
    } else {
      let last_login = wx.getStorageSync('last_login');
      let zone = parseInt(zoneId);
      let zone_x = (zone) % 7;
      let zone_y = parseInt((zone) / 7);
      let day = that.data.week_list[zone_x];
      let month = that.data.month_list[zone_x];
      let part = zone_y + 1;
      if (day - 10 < 0) {
        day = '0' + day;
      }
      let date = that.data.year_date + "-" + month + "-" + day;
      let startDate = that.data.today_date;
      let indexT = that.data.indexT;
      let semester = that.data.semester[indexT];
      let session_key = semester.season
      wx.setStorageSync("week", that.data.week[that.data.week[that.data.week_index]]);
      wx.setStorageSync("classroom", that.data.classroom[that.data.room_index]);
      wx.setStorageSync('room_index', that.data.room_index);
      wx.setStorageSync('part', part);
      wx.setStorageSync('date', date);
      wx.setStorageSync('term', that.data.term[that.data.indexT]);
      wx.setStorageSync('session', session_key)


      if (that.data.identity === 'teacher') {
        if (last_login === startDate) {
          wx.navigateTo({
            url: '../addC/addC?zone_x=' + zone_x
                + "&zone_y=" + zone_y
                + "&session=" + session_key,
          })
        } else {
          wx.navigateTo({
            url: '../login/login?id=0',
          })
        }
      }

      if (that.data.identity === 'student') {
        // util.showBusy('学生无法新建实验');
        return
      }

      if (that.data.identity === 'visitor') {
        wx.navigateTo({
          url: '../login/login?id=0',
        })
      }
    }
  },

  message_disappear: function () {
    let that = this;
    that.setData({
      message_tip: false,
    })
  },

  message_appear: function (e) {
    let that = this;
    let zoneId = e.currentTarget.id;
    let index = zoneId.split(",", 2);
    let index_x = index[0];
    let index_y = index[1];

    console.log("run messsage_appear");

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
    let that = this;
    let msg_x = that.data.msg_x;
    let msg_y = that.data.msg_y;
    let subject = that.data.subject;
    let id = subject[msg_x][msg_y].id;
    let teacher_id = wx.getStorageSync('teacher_id');
    let session = wx.getStorageSync('last_login');
    let today_date = that.data.today_date;
    let param = {
      "_id": id,
      'teacher_id': teacher_id,
    }

    if (session === today_date && teacher_id !== '') {
      wx.showModal({
        title: '提示',
        content: '是否删除这节实验课',
        success: res => {
          if (res.confirm) {
            TablePageSVC.deleteInfo(param, that.deleteInfo_cb)
          } else if (res.cancel) {}
        }
      })
    } else {
      wx.navigateTo({
        url: '../login/login?id=1',
      })
    }
  },

  onMyClass: function () {
    let that = this;
    let session = wx.getStorageSync('session');
    let teacher_id = wx.getStorageSync('teacher_id');
    let startDate = that.data.today_date;
    console.log("identity is", that.data.identity);
    console.log(teacher_id);

    switch (that.data.identity) {

      case "visitor":
        wx.navigateTo({
          url: '../login/login?id=1',
        })
        break;

      case "teacher":
        if (session === startDate && teacher_id !== '') {
          wx.navigateTo({
            url: '../myclass/myclass',
          })
        } else {
          wx.navigateTo({
            url: '../login/login?id=1',
          })
        }
        break;

      case "student":
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
                  wx.setStorageSync('identity', 'visitor');
                  wx.setStorageSync('studentId', '')
                  that.setData({
                    identity: 'visitor',
                    studentId: '',
                  })
                },
              })
            }
          }
        })
        break;
    }
  },

  /**
   * 点击签到
   */
  signIn: function () {
    let that = this;
    let msg_x = that.data.msg_x;
    let msg_y = that.data.msg_y;
    let subject = that.data.subject[msg_x][msg_y];
    let classId = subject.id;
    let className = subject.subject;
    let teacher = subject.teacher;
    let url = '../signUp/signUp?classId=' + classId + '&className=' + className +
      '&teacher=' + teacher + '&time=' + msg_x;
    console.log(url);
    if (that.data.identity === 'student') {
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
    let that = this;
    let lab = that.data.classroom[that.data.room_index];
    let week = that.data.week[that.data.week_index];
    let term = that.data.term[that.data.indexT];

    let param = {
      'lab': lab,
      'week': week,
      'term': term,
    };
    TablePageSVC.getInfoByWeek(param, that.onPullDownRefresh_cb);
  },

  /**
   * 请求得到所有实验室数据
   */
  getAllLab_cb: function (data) {
    let that = this;
    let classroom = data.classroom
    let grade = data.grade
    let semester = data.semester
    let term = data.term

    that.setData({
      classroom: classroom,
      grade: grade,
      semester: semester,
      term: term
    })
  },

  getCloudInfo_cb: function (res, flag) {
    let that = this;
    if (flag === true){
      that.information_factory(res);
    }else{
      console.log(res)
    }
  },

  getInfoTest_cb: function (res) {
    let that = this;
    console.log(res)
    that.setData({
      information_obj: res,
    });
    that.information_factory(res);
  },

  //flag为是否刷新成功,true为成功
  onPullDownRefresh_cb: function (res, flag) {
    let that = this;
    if (flag === false) {
      util.showModel('错误', '刷新失败！');
    }else {
      that.information_factory(res);
    }
    wx.stopPullDownRefresh(undefined);
  },

  deleteInfo_cb:function (res, flag) {
    let that = this;
    console.log("delect info", res)
    if (flag === false){

    }else {
      if (res.result.res === 1) {
        util.showSuccess('成功删除');
        that.onPullDownRefresh();
      } else if (res.result.res === 0) {
        util.showModel('失败', '您不是该实验的建立者');
      }
    }
  },
});
