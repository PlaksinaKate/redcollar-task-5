import { TO_TIME_DATA, SECONDS_DATA, TIME_WR, DANCE_CAT, DANCE_CAT_HIDDEN } from './contst.min.js'

class MyTimer extends HTMLElement {
  constructor() {
    super()

    this.events = {
      "start": new CustomEvent("starttimer", {
        bubbles: true,
      }),
      "pause": new CustomEvent("pausetimer", {
        bubbles: true,
      }),
      "reset": new CustomEvent("resettimer", {
        bubbles: true,
      }),
      "end": new CustomEvent("endtimer", {
        bubbles: true,
        composed: true,
      }),
    };

    this.interval;
  }

  connectedCallback() {
    this._timeWr = document.createElement('div')
    this._timeWr.classList.add(TIME_WR)

    this._timeWr._shadow = this._timeWr.attachShadow({ mode: 'closed' })

    const toTimeValue = this.getAttribute(TO_TIME_DATA)
    const secondsValue = this.getAttribute(SECONDS_DATA)
    const value = secondsValue ? this.getSeconds(secondsValue) : this.getToTimeSeconds(toTimeValue)
    this._timeWr._shadow.innerHTML = this.renderTime(value)

    this.append(this._timeWr)

    const btnsWr = this.nextSibling.nextElementSibling,
          btnStart = btnsWr.querySelector('.btn_start'),
          btnPause = btnsWr.querySelector('.btn_pause'),
          btnReset = btnsWr.querySelector('.btn_reset');
    
    this.addEventListener('starttimer', this.startTimer(this))
    this.addEventListener('pausetimer', this.pauseTimer(this))
    this.addEventListener('resettimer', this.resetTimer(this))
    window.addEventListener('endtimer', this.endTimer)

    btnStart.addEventListener('click', () => {
      this.dispatchEvent(this.events.start)
    })
    
    btnPause.addEventListener('click', () => {
      this.dispatchEvent(this.events.pause)
    })

    btnReset.addEventListener('click', () => {
      this.dispatchEvent(this.events.reset)
    })

  }

  static get observedAttributes() {
    return [TO_TIME_DATA, SECONDS_DATA];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    let secondsLeft
    switch (name) {
      case "to-time":
        secondsLeft = this.getToTimeSeconds(newValue)
        if (this._timeWr) this._timeWr._shadow.innerHTML = this.renderTime(secondsLeft)
        break;

      case "seconds":
        secondsLeft = this.getSeconds(newValue)
        if (this._timeWr) this._timeWr._shadow.innerHTML = this.renderTime(secondsLeft)
        break;
    }

  }

  renderTime(value) {
    const date = new Date()
    const nowSeconds = date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds();
    const nowSecondsLeft = value - nowSeconds
    const nowSecondsLeftValue = nowSecondsLeft < 0 ? 86400 - Math.abs(nowSecondsLeft) : nowSecondsLeft
    return this.secondsConverter(nowSecondsLeftValue);
  }

  getToTimeSeconds(toTime) {
    let s, m, h = 0;
    if (toTime.split(':').length === 3) {
      s = parseInt(toTime.split(':')[2]);
      m = parseInt(toTime.split(':')[1]);
      h = parseInt(toTime.split(':')[0]);
    } else {
      s = parseInt(toTime.split(':')[1]);
      m = parseInt(toTime.split(':')[0]);
    }

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

  startTimer = (timer) => () => {
    if (timer.getToTimeSeconds(timer._timeWr._shadow.innerHTML) != 0) {
      timer.interval = setInterval(() => {
        const timeSeconds = timer.getToTimeSeconds(timer._timeWr._shadow.innerHTML)

        if (timeSeconds === 0) {
          clearInterval(timer.interval)
          timer.dispatchEvent(this.events.end)
          return
        }

        timer._timeWr._shadow.innerHTML = timer.secondsConverter(timeSeconds - 1);
      }, 1000)
    }
  }

  pauseTimer = (timer) => () => {
    clearInterval(timer.interval)
  }

  resetTimer = (timer) => () => {
    clearInterval(timer.interval)
    const toTime = timer.getAttribute(TO_TIME_DATA)
    const seconds = timer.getAttribute(SECONDS_DATA)
    timer._timeWr._shadow.innerHTML = seconds ? timer.renderTime(timer.getSeconds(seconds)) : timer.renderTime(timer.getToTimeSeconds(toTime))
  }

  endTimer() {
    const danceCat = document.getElementsByClassName(DANCE_CAT)[0]
    danceCat.classList.remove(DANCE_CAT_HIDDEN)

    setTimeout(() => {
      danceCat.classList.add(DANCE_CAT_HIDDEN)
    }, 6000)
  }

}

customElements.define('timer-view', MyTimer);
