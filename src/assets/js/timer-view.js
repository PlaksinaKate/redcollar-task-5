class MyTimer extends HTMLElement {

  connectedCallback() {
    this._shadow = this.attachShadow({ mode: 'closed' })

    const timer = document.createElement('div');
    const secondsData = this.getAttribute('seconds')
    const toTimeData = this.getAttribute('to-time')
    const secondsLeft = secondsData ? this.getSeconds(secondsData) : this.getToTimeSeconds(toTimeData)
    const date = new Date()
    const nowSeconds = date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds();

    timer.innerHTML = this.secondsConverter(secondsLeft - nowSeconds);

    this._shadow.prepend(timer)
  }

  static get observedAttributes() {
    return ['to-time', 'seconds'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    const timer = document.querySelector(`[${name}]`)
    console.log(timer)
    this.render(timer, newValue);
  }

  render(timer, value) {
    const secondsLeft = timer === 'seconds' ? this.getSeconds(value) : this.getToTimeSeconds(value)
    console.log(secondsLeft)
    setInterval(() => {
      const date = new Date()
      const nowSeconds = date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds();
      const nowSecondsLeft = secondsLeft - nowSeconds

      if (nowSecondsLeft < 0) {
        clearInterval()
        return
      }

      timer.innerHTML = this.secondsConverter(nowSecondsLeft);

    }, 1000)
  }

  getToTimeSeconds(toTime) {
    const s = parseInt(toTime.split(':')[2]),
      m = parseInt(toTime.split(':')[1]),
      h = parseInt(toTime.split(':')[0]);

    return h * 3600 + m * 60 + s
  }

  getSeconds(seconds) {
    const date = new Date()
    const intSeconds = parseInt(seconds)

    return (date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds()) + intSeconds
  }

  secondsConverter(seconds) {
    let s = (seconds % 60).toString(),
      m = Math.floor(seconds / 60 % 60).toString(),
      h = Math.floor(seconds / 60 / 60 % 60).toString();

    return h !== '0' ? `${h.padStart(2, '0')}:${m.padStart(2, '0')}:${s.padStart(2, '0')}` : `${m.padStart(2, '0')}:${s.padStart(2, '0')}`;
  }
}

customElements.define('timer-view', MyTimer);
