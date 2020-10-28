
/**
 * 获取所有年级信息
 */
let getAllGrade = callback => {
    wx.cloud.callFunction({
        name: 'getallgrade',
        data: {},
        success: res => {
            console.log(res);
            let gradeInfo = res.result.data;
            callback(gradeInfo)
        },
        fail: res => {
            console.log(res);
        },
    })
};


/**
 * 获取所有课程名
 */
let allCourse = (callback) => {
    let term = 'A';
    let that = this
    wx.cloud.callFunction({
        name: 'getallcourses',
        data: {
            term: term
        },
        success: res => {
            let data = res.result.data
            let course_name = [];
            let courses = [];
            for (let i = 0; i < data.length; i++) {
                let name = data[i].course_name;
                let major = data[i].course_major
                course_name[i] = name;
                if (!courses[major]) {
                    courses[major] = [];
                }

                courses[major].push(name);
            }
            callback(course_name, courses);
        },
        fail: res => {
            console.log(res);
        },
    })
};

module.exports = {
    getAllGrade: getAllGrade,
    allCourse: allCourse,
};
