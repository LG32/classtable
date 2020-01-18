
let getAllLab = callback => {
    let classroom = [];
    wx.cloud.callFunction({
        name: 'getalllab',
        success: res => {
            console.log(res);
            for (let i = 0; i < res.result.data.length; i++) {
                classroom[i] = res.result.data[i].lab_room;
            }
            callback(classroom);
        }
    })
};

let getInfoByWeek = (param, callback) =>{
    let lab = param.lab;
    let week = param.week;
    let term = param.term;

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
            wx.hideLoading();
            console.log(res);
            callback(res);
        },
        fail: res => {
            wx.hideLoading();
            console.log(res);
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
            console.log(res);
        }
    });
};

module.exports = {
    getAllLab: getAllLab,
    getInfoByWeek: getInfoByWeek,
    getInfoTest: getInfoTest,
};
