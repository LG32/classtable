const util = require('../../utils/util.js');

var __mindKeys = [];

function initMindKeys(keys) {
  __mindKeys = keys;
}

function init(that, barHeight, callBack) {
  var temData = {};
  var view = {
    barHeight: barHeight,
    isShow: false
  }

  wx.getSystemInfo({
    success: function(res) {
      var wHeight = res.windowHeight;
      view.seachHeight = wHeight - barHeight;
      temData.view = view;
      that.setData({
        wxSearchData: temData
      });
    }
  })

  if (typeof(callBack) == "function") {
    callBack();
  }

  getHisKeys(that);
}

function getHisKeys(that) {
  var value = [];
  try {
    value = wx.getStorageSync('wxSearchHisKeys')
    if (value) {
      var temData = that.data.wxSearchData;
      temData.his = value;
      that.setData({
        wxSearchData: temData
      });
    }
  } catch (e) {}
}


Page({
  data: {
    flag: false,
    focus: true,
    select: false,
    timeFirst: "",
    inputCourseValue: '',
    inputClassValue: '',
    arrayGrd: [],
    arrayClass: ['请先选择年级'],
    mark_class: [],
    checkClass: '',
    major: ['软件工程', '集成工程', '物联网', '微电子'],
    majorName: [],
    gradeInfo:[],
    class_num: [],
    indexM: 0,
    indexG: 0,
    indexN: 0,
    indexC: 0,
    week: 0,
    classroom: 0,
    teacher_id: 0,
    date: 0,
    click_part: 0,
    day: 0,
    free: 0,
    room_index: -1,
    showlist: 0,
    classValue: '',
    term: '',
  },

  onLoad: function(options) {
    var that = this;
    var week = wx.getStorageSync('week');
    var classroom = wx.getStorageSync('classroom');
    var room_index = wx.getStorageSync('room_index');
    var teacher_id = wx.getStorageSync('teacher_id');
    var date = wx.getStorageSync('date');
    var part = wx.getStorageSync('part');
    var freeString = wx.getStorageSync('free');
    var term = wx.getStorageSync('term');

    var weekArray = new Array("星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六");
    var day = weekArray[new Date(date).getDay()];
    var free = freeString.split(',');
    console.log('free' + free[0]);
    var click_part = part - 1;
    var check = 'check_items[' + click_part + '].checked';
    var timeFirst = new Array();
    timeFirst[0] = part;

    that.setData({
      week: week,
      classroom: classroom,
      teacher_id: teacher_id,
      date: date,
      click_part: part,
      day: day,
      free: free,
      timeFirst: timeFirst,
      room_index: room_index,
      term: term,
    })
    that.setData({
      [check]: 1,
    })
    that.checkboxItems();
    that.allcourse();
    init(that, 215);
    that.lastMemory();
    that.getAllGrade();
    that.getAllMajor();
  },

  /**
   * 获取所有课程名
   */
  allcourse: function() {
    var term = 'S';
    wx.cloud.callFunction({
      name: 'getallcourses',
      data: {
        term: term
      },
      success: res => {
        var course_name = new Array();
        console.log(res);
        for(var i = 0 ; i < res.result.data.length; i++){
          course_name[i] = res.result.data[i].course_name;
        }
        initMindKeys(course_name);
      },
      fail: res => {
        console.log(res);
      } ,
    })
  },

  /**
   * 获取所有专业信息
   */
  getAllMajor: function(){
    wx.showLoading({
      title: '加载中',
    })
    wx.cloud.callFunction({
      name: 'getallmajor',
      data:{},
      success: res =>{
        console.log(res);
        var major = res.result.data;
        var that = this;
        var majorName = new Array();
        for(var i = 0; i < res.result.data.length; i++){
          majorName[i] = major[i].major_name;
        }
        that.setData({
          major: major,
          majorName: majorName,
        })
        that.initGradeCheckBox();
        wx.hideLoading();
      },
      fail: res=> {
        console.log(res);
        wx.hideLoading();
      } ,
    })
  },

  /**
   * 获取所有年级信息
   */
  getAllGrade: function(){
    wx.cloud.callFunction({
      name: 'getallgrade',
      data:{},
      success: res => {
        console.log(res);
        var gradeInfo = res.result.data;
        var that = this;
        that.setData({
          gradeInfo: gradeInfo,
        })
      },
      fail: res => {
        console.log(res);
      } ,
    })
  },

/**
 * 获取上次输入的数据
 */
  lastMemory: function() {
    var that = this;
    var indexG = wx.getStorageSync('indexG');
    var course_class = wx.getStorageSync('course_class');
    var course_name = wx.getStorageSync('course_name');
    var tempData = that.data.wxSearchData;
    console.log(tempData);
    if (indexG != '' && course_class != '' && course_name != '') {
      // var classValue = course_class + '*上次输入';
      var classValue = course_class;
      that.setData({
        indexG: indexG,
        inputClassValue: course_class,
        inputCourseValue: course_name,
        flag: false,
        classValue: classValue,
      })
      // tempData.value = course_name + '*上次输入';
      tempData.value = course_name;
      that.setData({
        wxSearchData: tempData,
      })
    }else{
      console.log('没有上次输入！');
    }
  },

  /**
   * 初始化年级CheckBox
   */
  initGradeCheckBox: function(){
   
    var that = this;
    var gradeInfo = that.data.gradeInfo;
    var arrayGrd = new Array();
    var majorName = that.data.majorName;
    var indexM = that.data.indexM;
    var x = 0;
    for(var  i = 0; i < gradeInfo.length; i++){
      if (majorName[indexM] == gradeInfo[i].class_major ){
        console.log('相等')
          arrayGrd[x] = gradeInfo[i].class_grade; 
          x++;
      }
    }
    that.setData({
      arrayGrd: arrayGrd,
      indexG: 0
    })
    that.initClassCheckBox();
  },

  /**
   * 初始化班级checkbox
   */
  initClassCheckBox: function(){
    var that = this;
    var gradeInfo = that.data.gradeInfo;
    var arrayClass = new Array();
    var mark_class = new Array();
    var majorName = that.data.majorName;
    var indexM = that.data.indexM;
    var indexG = that.data.indexG;
    var arrayGrd = that.data.arrayGrd;
    var x = 0; 
    for (var i = 0; i < gradeInfo.length; i++) {
      if (majorName[indexM] == gradeInfo[i].class_major 
      && arrayGrd[indexG] == gradeInfo[i].class_grade) {
        x = gradeInfo[i].class_num;
      }
    }
    var arrayClass = new Array();
    arrayClass[0] = '清空班级';
    for(var i = 1; i <= x; i++){
      arrayClass[i] = i.toString();
      mark_class[i] =false;
    }
    arrayClass[i] = 'A';
    mark_class[i] = false;
    arrayClass[i + 1] = 'B';
    mark_class[i + 1] = false;
    arrayClass[i + 2] = 'C';
    mark_class[i + 2] = false;
    arrayClass[i + 3] = 'D';
    mark_class[i + 3] = false;

    that.setData({
      arrayClass: arrayClass,
      mark_class: mark_class,
      checkClass: '',
    })
  },

  checkboxItems: function() {
    var that = this;
    var free = that.data.free;
    for (var i = 1; i < free.length; i++) {
      var index = free[i] - 1;
      var check = 'check_items[' + index + '].disabled';
      that.setData({
        [check]: 0,
      })
    }
  },

  /**
   * input输入时执行
   */
  wxSearchInput: function(e) {
    var that = this
    var temData = that.data.wxSearchData;
    var text = e.detail.value;
    var mindKeys = [];
    console.log('wxSearchInput');
    console.log(temData);
    console.log(text);
    if (typeof(text) == "undefined" || text.length == 0) {

    } else {
      for (var i = 0; i < __mindKeys.length; i++) {
        var mindKey = __mindKeys[i];
        if (mindKey.indexOf(text) > -1) {
          mindKeys.push(mindKey);
        }
      }
    }
    temData.value = text;
    temData.mindKeys = mindKeys;
    that.setData({
      wxSearchData: temData,
      inputCourseValue: e.detail.value
    });
  },

  /**
   * input得到焦点时执行
   */
  wxSerchFocus: function(e) {
    var that = this
    var temData = that.data.wxSearchData;
    temData.view.isShow = true;
    console.log('wxSerchFocus');
    that.setData({
      wxSearchData: temData,
    });
  },

  /**
   * input失去焦点时
   */
  wxSearchBlur: function(e) {
    var that = this
    var tempData = that.data.wxSearchData;
    // var wxSearchData = 'wxSearchData.view.isShow'
    // tempData.value = e.detail.value;
    tempData.view.isShow = false;
    console.log('wxSearchBlur');
    console.log(e.detail.value);
    console.log(tempData);
    that.setData({
      wxSearchData: tempData,
      // inputCourseValue: e.detail.value,
    });
    if (typeof(callBack) == "function") {
      callBack();
    }
  },

  /**
   * 选择关键字
   */
  wxSearchKeyTap: function(e) {
    var that = this;
    var temData = that.data.wxSearchData;
    temData.view.isShow = false;
    temData.value = e.target.dataset.key;
    console.log('wxSearchKeyTap' + temData.value);
    console.log(temData);
    that.setData({
      wxSearchData: temData,
      inputCourseValue: temData.value,
    });
  },


  wxSearchTap: function(e) {
    // var that = this
    // var temData = that.data.wxSearchData;
    // temData.view.isShow = false;
    // console.log('wxSearchTap');
    // console.log(temData);
  },

  bindClassInput: function(e) {
    this.setData({
      inputClassValue: e.detail.value
    })
  },

  bindselChange: function() {
    var sel = this.data.select;
    this.setData({
      select: !sel,
    });
    console.log("select is" + this.data.select)
  },

/**
 * 选择年级
 */
  bindGPickerChange: function(e) {
    console.log('pickerG发送选择改变，携带值为', e.detail.value)
    this.setData({
      indexG: e.detail.value
    })
  },

/**
 * 选择专业
 */
  bindMPickerChange: function(e){
    console.log('专业pickerM选择发生改变, 携带值为', e.detail.value)
    var that = this;
    that.setData({
      flag: true,
      indexM: e.detail.value
    })
    that.initGradeCheckBox();
  },


/**
 * 选择班级
 */
  bindCPickerChange: function(e){
    console.log('选择班级,携带值', e.detail.value)
    var that = this;
    var check = e.detail.value;
    console.log(check);
    if (that.data.mark_class[check] == true) {
      util.showBusy('已选择！');
    }
    if (check != '0' && that.data.mark_class[check] == false){
      console.log(that.data.arrayClass[check]);
      var mark_class_str = "mark_class[" + check + "]";
      var checkClass = that.data.checkClass + that.data.arrayClass[check] + ",";
      that.setData({
        indexC: check,
        [mark_class_str]: true,
        checkClass: checkClass,
      });
    } 
    if(e.detail.value == '0'){
      var mark_class = that.data.mark_class;
      for(var i = 1; i < mark_class.length; i++){
        mark_class[i] = false;
      } 
      var nullStr = '';
      that.setData({
        mark_class: mark_class,
        checkClass: nullStr,
      })
    }
  }, 

  setGrade: function() {
    var grade_textArea = true;
    this.setData({
      grade_textArea: grade_textArea,
    })
  },

  /**
   * 提交表格
   */
  bindSubtap: function(e) {
    var that = this;
    var timeFirst = that.data.timeFirst;
    var course_class = that.data.checkClass;
    var major = that.data.majorName[that.data.indexM];
    var course_name = that.data.inputCourseValue;
    var part = part;

    if (major == '' || course_class == '' || course_name == '') {
      util.showBusy('请完善信息！');
      console.log(course_class);
      console.log(course_name);
    } else {
      that.addCallFunction(timeFirst[0]);
    }
  },

  addCallFunction: function(part) {
    var that = this;
    var course_class = that.data.majorName[that.data.indexM] + that.data.checkClass + '班';
    var course_date = that.data.date;
    var course_name = that.data.inputCourseValue;
    var course_room = that.data.classroom;
    var teach_id = that.data.teacher_id;
    var indexG = that.data.indexG;
    var grade = that.data.arrayGrd[indexG];
    var part = part;
    var week = that.data.week;
    var room_index = that.data.room_index;
    var term = that.data.term;
  
    wx.showLoading({
      title: '加载中',
    })
    wx.cloud.callFunction({
      name: 'add',
      data: {
        course_class: course_class,
        course_date: course_date,
        course_name: course_name,
        course_room: course_room,
        teach_id: teach_id,
        grade: grade,
        part: part,
        term: term,
      },
      success: res => {
        wx.hideLoading();
        console.log(res);
        if (res.result.res == 1) {
          // wx.setStorageSync('indexG', indexG);
          wx.setStorageSync('course_name', course_name);
          // wx.setStorageSync('course_class', course_class);
          wx.reLaunch({
            url: '../tablepage/tablepage?week=' + week + '&room_index=' + room_index,
          })
        } else if (res.result.res == 2) {
          util.showModel('失败', '这节课已被占用！');
        }
      },
      fail: res => {
        wx.hideLoading();
        console.log(res);
      }
    })
  }
})