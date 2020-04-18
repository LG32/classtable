const util = require('../../utils/util.js');

let __mindKeys = [];

function initMindKeys(keys) {
    __mindKeys = keys;
}

function init(that, barHeight, callBack) {
    let temData = {};
    let view = {
        barHeight: barHeight,
        isShow: false
    }

    wx.getSystemInfo({
        success: function (res) {
            let wHeight = res.windowHeight;
            view.seachHeight = wHeight - barHeight;
            temData.view = view;
            that.setData({
                wxSearchData: temData
            });
        }
    })

    if (typeof (callBack) == "function") {
        callBack();
    }

    getHisKeys(that);
}

function getHisKeys(that) {
    let value = [];
    try {
        value = wx.getStorageSync('wxSearchHisKeys')
        if (value) {
            let temData = that.data.wxSearchData;
            temData.his = value;
            that.setData({
                wxSearchData: temData
            });
        }
    } catch (e) {
    }
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
        gradeInfo: [],
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
        room_index: -1,
        showlist: 0,
        classValue: '',
        term: '',
    },

    onLoad: function (options) {
        let that = this;
        let week = wx.getStorageSync('week');
        let classroom = wx.getStorageSync('classroom');
        let room_index = wx.getStorageSync('room_index');
        let teacher_id = wx.getStorageSync('teacher_id');
        let date = wx.getStorageSync('date');
        let part = wx.getStorageSync('part');
        // let freeString = wx.getStorageSync('free');
        let term = wx.getStorageSync('term');

        let weekArray = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
        let day = weekArray[new Date(date).getDay()];
        // let free = freeString.split(',');
        // console.log('free' + free[0]);
        // let click_part = part - 1;
        // let check = 'check_items[' + click_part + '].checked';
        let timeFirst = [];
        timeFirst[0] = part;

        that.setData({
            week: week,
            classroom: classroom,
            teacher_id: teacher_id,
            date: date,
            click_part: part,
            day: day,
            timeFirst: timeFirst,
            room_index: room_index,
            term: term,
        })
        // that.setData({
        //   [check]: 1,
        // })
        // that.checkboxItems();
        that.allcourse();
        init(that, 215);
        that.lastMemory();
        that.getAllGrade();
        that.getAllMajor();
    },

    /**
     * 获取所有课程名
     */
    allcourse: function () {
        let term = 'S';
        wx.cloud.callFunction({
            name: 'getallcourses',
            data: {
                term: term
            },
            success: res => {
                let course_name = new Array();
                console.log(res);
                for (let i = 0; i < res.result.data.length; i++) {
                    course_name[i] = res.result.data[i].course_name;
                }
                initMindKeys(course_name);
            },
            fail: res => {
                console.log(res);
            },
        })
    },

    /**
     * 获取所有专业信息
     */
    getAllMajor: function () {
        wx.showLoading({
            title: '加载中',
        })
        wx.cloud.callFunction({
            name: 'getallmajor',
            data: {},
            success: res => {
                console.log(res);
                let major = res.result.data;
                let that = this;
                let majorName = new Array();
                for (let i = 0; i < res.result.data.length; i++) {
                    majorName[i] = major[i].major_name;
                }
                that.setData({
                    major: major,
                    majorName: majorName,
                })
                that.initGradeCheckBox();
                wx.hideLoading();
            },
            fail: res => {
                console.log(res);
                wx.hideLoading();
            },
        })
    },

    /**
     * 获取所有年级信息
     */
    getAllGrade: function () {
        wx.cloud.callFunction({
            name: 'getallgrade',
            data: {},
            success: res => {
                console.log(res);
                let gradeInfo = res.result.data;
                let that = this;
                that.setData({
                    gradeInfo: gradeInfo,
                })
            },
            fail: res => {
                console.log(res);
            },
        })
    },

    /**
     * 获取上次输入的数据
     */
    lastMemory: function () {
        let that = this;
        let indexG = wx.getStorageSync('indexG');
        let course_class = wx.getStorageSync('course_class');
        let course_name = wx.getStorageSync('course_name');
        let tempData = that.data.wxSearchData;
        console.log(tempData);
        if (indexG !== '' && course_class !== '' && course_name !== '') {
            // let classValue = course_class + '*上次输入';
            let classValue = course_class;
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
        } else {
            console.log('没有上次输入！');
        }
    },

    /**
     * 初始化年级CheckBox
     */
    initGradeCheckBox: function () {

        let that = this;
        let gradeInfo = that.data.gradeInfo;
        let arrayGrd = new Array();
        let majorName = that.data.majorName;
        let indexM = that.data.indexM;
        let x = 0;
        for (let i = 0; i < gradeInfo.length; i++) {
            if (majorName[indexM] === gradeInfo[i].class_major) {
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
    initClassCheckBox: function () {
        let that = this;
        let gradeInfo = that.data.gradeInfo;
        let arrayClass = [];
        let mark_class = [];
        let majorName = that.data.majorName;
        let indexM = that.data.indexM;
        let indexG = that.data.indexG;
        let arrayGrd = that.data.arrayGrd;
        let x = 0;

        for (let i = 0; i < gradeInfo.length; i++) {
            if (majorName[indexM] === gradeInfo[i].class_major
                && arrayGrd[indexG] === gradeInfo[i].class_grade) {
                x = gradeInfo[i].class_num;
            }
        }

        arrayClass[0] = '清空班级';
        let flag = 0

        for (let i = 1; i <= x; i++) {
            arrayClass[i] = i.toString();
            mark_class[i] = false;
            flag = i
        }

        arrayClass[flag] = 'A';
        mark_class[flag] = false;
        arrayClass[flag + 1] = 'B';
        mark_class[flag + 1] = false;
        arrayClass[flag + 2] = 'C';
        mark_class[flag + 2] = false;
        arrayClass[flag + 3] = 'D';
        mark_class[flag + 3] = false;

        that.setData({
            arrayClass: arrayClass,
            mark_class: mark_class,
            checkClass: '',
        })
    },

    checkboxItems: function () {
        let that = this;
        // let free = that.data.free;
        let subject = that.data.subject
        for (let i = 1; i < subject.length; i++) {
            let index = subject[i] - 1;
            let check = 'check_items[' + index + '].disabled';
            that.setData({
                [check]: 0,
            })
        }
    },

    /**
     * input输入时执行
     */
    wxSearchInput: function (e) {
        let that = this
        let temData = that.data.wxSearchData;
        let text = e.detail.value;
        let mindKeys = [];
        console.log('wxSearchInput');
        console.log(temData);
        console.log(text);
        if (typeof (text) == "undefined" || text.length == 0) {

        } else {
            for (let i = 0; i < __mindKeys.length; i++) {
                let mindKey = __mindKeys[i];
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
    wxSerchFocus: function (e) {
        let that = this
        let temData = that.data.wxSearchData;
        temData.view.isShow = true;
        console.log('wxSerchFocus');
        that.setData({
            wxSearchData: temData,
        });
    },

    /**
     * input失去焦点时
     */
    wxSearchBlur: function (e) {
        let that = this
        let tempData = that.data.wxSearchData;
        // let wxSearchData = 'wxSearchData.view.isShow'
        // tempData.value = e.detail.value;
        tempData.view.isShow = false;
        console.log('wxSearchBlur');
        console.log(e.detail.value);
        console.log(tempData);
        that.setData({
            wxSearchData: tempData,
            // inputCourseValue: e.detail.value,
        });
        if (typeof (callBack) == "function") {
            callBack();
        }
    },

    /**
     * 选择关键字
     */
    wxSearchKeyTap: function (e) {
        let that = this;
        let temData = that.data.wxSearchData;
        temData.view.isShow = false;
        temData.value = e.target.dataset.key;
        console.log('wxSearchKeyTap' + temData.value);
        console.log(temData);
        that.setData({
            wxSearchData: temData,
            inputCourseValue: temData.value,
        });
    },


    wxSearchTap: function (e) {
        // let that = this
        // let temData = that.data.wxSearchData;
        // temData.view.isShow = false;
        // console.log('wxSearchTap');
        // console.log(temData);
    },

    bindClassInput: function (e) {
        this.setData({
            inputClassValue: e.detail.value
        })
    },

    bindselChange: function () {
        let sel = this.data.select;
        this.setData({
            select: !sel,
        });
        console.log("select is" + this.data.select)
    },

    /**
     * 选择年级
     */
    bindGPickerChange: function (e) {
        console.log('pickerG发送选择改变，携带值为', e.detail.value)
        this.setData({
            indexG: e.detail.value
        })
    },

    /**
     * 选择专业
     */
    bindMPickerChange: function (e) {
        console.log('专业pickerM选择发生改变, 携带值为', e.detail.value)
        let that = this;
        that.setData({
            flag: true,
            indexM: e.detail.value
        })
        that.initGradeCheckBox();
    },


    /**
     * 选择班级
     */
    bindCPickerChange: function (e) {
        console.log('选择班级,携带值', e.detail.value)
        let that = this;
        let check = e.detail.value;
        console.log(check);
        if (that.data.mark_class[check] === true) {
            util.showBusy('已选择！');
        }
        if (check !== '0' && that.data.mark_class[check] === false) {
            console.log(that.data.arrayClass[check]);
            let mark_class_str = "mark_class[" + check + "]";
            let checkClass = that.data.checkClass + that.data.arrayClass[check] + ",";
            that.setData({
                indexC: check,
                [mark_class_str]: true,
                checkClass: checkClass,
            });
        }
        if (e.detail.value === '0') {
            let mark_class = that.data.mark_class;
            for (let i = 1; i < mark_class.length; i++) {
                mark_class[i] = false;
            }
            let nullStr = '';
            that.setData({
                mark_class: mark_class,
                checkClass: nullStr,
            })
        }
    },

    setGrade: function () {
        let grade_textArea = true;
        this.setData({
            grade_textArea: grade_textArea,
        })
    },

    /**
     * 提交表格
     */
    bindSubtap: function (e) {
        let that = this;
        let timeFirst = that.data.timeFirst;
        let course_class = that.data.checkClass;
        let major = that.data.majorName[that.data.indexM];
        let course_name = that.data.inputCourseValue;
        let part = part;

        if (major == '' || course_class == '' || course_name == '') {
            util.showBusy('请完善信息！');
            console.log(course_class);
            console.log(course_name);
        } else {
            that.addCallFunction(timeFirst[0]);
        }
    },

    addCallFunction: function (part) {
        let that = this;
        let course_class = that.data.majorName[that.data.indexM] + that.data.checkClass + '班';
        let course_date = that.data.date;
        let course_name = that.data.inputCourseValue;
        let course_room = that.data.classroom;
        let teach_id = that.data.teacher_id;
        let indexG = that.data.indexG;
        let grade = that.data.arrayGrd[indexG];
        let week = that.data.week;
        let room_index = that.data.room_index;
        let term = that.data.term;
        console.log(course_class, course_date, course_name, course_room,
            teach_id, grade, part, term)

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
