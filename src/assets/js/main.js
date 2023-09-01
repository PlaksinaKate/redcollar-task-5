/* setInterval(() => {
  const date = new Date()
  const nowSeconds = date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds();
  const nowSecondsLeft = secondsLeft - nowSeconds

  if (nowSecondsLeft < 0) {
    clearInterval()
    return
  }

  timer.innerHTML = this.secondsConverter(nowSecondsLeft);

}, 1000) */