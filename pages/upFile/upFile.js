// pages/upFile/upFile.js
Page({


  data: {
    tempFilePaths: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

  },



  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },

  /**
   * 选择上传文件路径
   */
  updata: function(e) {
    var that = this;
    wx.chooseMessageFile({
      count: 1,
      type: 'file',
      success: res => {
        // tempFilePath可以作为img标签的src属性显示图片
        const tempFilePaths = res.tempFiles;
        console.log('文件')
        console.log(res);
        that.setData({
          tempFilePaths: tempFilePaths,
        })
        that.upFilePath();
      }
    })

  },


  /**
   * 上传文件路径
   */
  upFilePath: function() {
    var that = this;
    var tempFilePaths = that.data.tempFilePaths;
    console.log('上传' + tempFilePaths.length());
    for (var i = 0; i < tempFilePaths.length; i++) {
      var path = tempFilePaths[i].path;
      console.log('开始上传');
      console.log(path);
      wx.cloud.uploadFile({
        cloudPath: 'test/',
        filePath: path,
        success(res) {
          console.log(res);
        }
      })
    }
  },
})