const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('-')
}

const longFormatTime = date => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();

  return [year, month, day, hour, minute, second].map(formatNumber).join('-');
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

const hourToSecond = hour => {
  hour = parseInt(hour);
  return hour*60*60;
}

const minuteToSecond = minute => {
  minute = parseInt(minute);
  return minute * 60;
}

// 显示繁忙提示
var showBusy = text => wx.showToast({
  title: text,
  image: '../../images/warming.png',
  duration: 5000
})

// 显示成功提示
var showSuccess = text => wx.showToast({
  title: text,
  icon: 'success',
  duration: 3000
})

// 显示失败提示
var showModel = (title, content) => {
  wx.hideToast();
  wx.showModal({
    title,
    content: content,
    showCancel: false
  })
}

module.exports = {
  formatTime: formatTime,
  showBusy: showBusy,
  showSuccess: showSuccess,
  showModel: showModel,
  longFormatTime: longFormatTime,
  hourToSecond: hourToSecond,
  minuteToSecond: minuteToSecond,
}
