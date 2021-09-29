
let getAllLab = callback => {

    wx.cloud.callFunction({
        name: 'getalllab',
        success: res => {
            console.log(res);
            let lab = res.result.data.lab
            let grade = res.result.data.grade
            let semester = res.result.data.semester
            let term = new Array()

            for(let i = 0; i < semester.length; i++) {
                let id = semester[i].sorted_id;
                let index = id - 1
                term[index] = semester[i].term
            }
            term.reverse();

            let classroom = new Array()
            for (let i = 0; i < lab.length; i++) {
                classroom[i] = lab[i].lab_room;
            }

            let grade_number = new Array()
            for (let i = 0; i < grade.length; i++) {
                grade_number[i] = grade[i].grade_number;
            }

            let data = {
                'classroom' : classroom,
                'grade' : grade_number,
                'term': term,
                'semester': semester,
            };
            callback(data);
        }
    })
};

let getInfoByWeek = (param, callback) =>{
    let lab = param.lab;
    let week = param.week;
    let term = param.term;
    console.log('change', param)

    wx.showLoading({
        title: '加载中',
    });
    wx.cloud.callFunction({
        name: 'getInfobyweek',
        data: {
            lab: lab,
            week: week,
            term: term,
        },
        success: res => {
            console.log('get info by week', res)
            wx.hideLoading(undefined);
            callback(res, true);
        },
        fail: res => {
            wx.hideLoading(undefined);
            callback(res, false)
        }
    })
};

let getInfoTest = (param, callback) => {
    let lab = param.lab;
    let startDate = param.startDate;
    let term = param.term;

    wx.showLoading({
        title: '加载中',
    });

    wx.cloud.callFunction({
        name: 'getinfotest',
        data: {
            term: term,
            lab: lab,
            date: startDate,
        },
        success: res => {
            wx.hideLoading(undefined);
            callback(res);
            },
        fail: res => {
            wx.hideLoading(undefined);
        }
    });
};

// 删除课程
let deleteInfo = (param, callback) => {
    let id  = param._id
    let teacher_id = param.teacher_id
    wx.showLoading({
        title: '加载中',
    });
    wx.cloud.callFunction({
        name: 'deleteInfo',
        data: {
            _id: id,
            teach_id: teacher_id,
        },
        success: res => {
            callback(res, true)
            wx.hideLoading(undefined);
        },
        fail: res => {
            callback(res, false)
            wx.hideLoading(undefined);
        }
    })
}

module.exports = {
    getAllLab: getAllLab,
    getInfoByWeek: getInfoByWeek,
    getInfoTest: getInfoTest,
    deleteInfo: deleteInfo,
};
