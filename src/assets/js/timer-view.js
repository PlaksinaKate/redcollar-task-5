import { TO_TIME_DATA, SECONDS_DATA, TIME_WR, DANCE_CAT, DANCE_CAT_HIDDEN } from './contst.min.js'

class MyTimer extends HTMLElement {
  constructor() {
    super()

    this.events = {
      "start": new CustomEvent("starttimer", {
        bubbles: true,
        detail: 'start',
      }),
      "pause": new CustomEvent("pausetimer", {
        bubbles: true,
        detail: 'pause',
      }),
      "reset": new CustomEvent("resettimer", {
        bubbles: true,
        detail: 'reset',
      }),
      "end": new CustomEvent("endtimer", {
        bubbles: true,
        composed: true,
        detail: 'end',
      }),
    };

    this.interval;

  }

  connectedCallback() {
    const timeWr = document.createElement('div')
    timeWr.classList.add(TIME_WR)

    timeWr._shadow = timeWr.attachShadow({ mode: 'closed' })

    const toTimeValue = this.getAttribute(TO_TIME_DATA)
    const secondsValue = this.getAttribute(SECONDS_DATA)
    const value = secondsValue ? this.getSeconds(secondsValue) : this.getToTimeSeconds(toTimeValue)
    timeWr._shadow.innerHTML = this.renderTime(value)

    this.append(timeWr)

    const btns = document.createElement('div')
    btns.classList.add('timer__time-btns')
    btns.innerHTML = `
                      <button class="btn btn_start">Старт</button>
                      <button class="btn btn_pause">Пауза</button>
                      <button class="btn btn_reset">Сброс</button>
                      `;

    this.append(btns)

    const btnStart = this.querySelector('.btn_start'),
      btnPause = this.querySelector('.btn_pause'),
      btnReset = this.querySelector('.btn_reset');

    btnStart.dispatchEvent(this.events.start)
    btnPause.dispatchEvent(this.events.pause)
    btnReset.dispatchEvent(this.events.reset)
    this.dispatchEvent(this.events.end)

    btnStart.addEventListener('click', () => {
      this.addEventListener('starttimer', this.startTimer())
    })
    btnPause.addEventListener('click', () => {
      this.addEventListener('pausetimer', this.pauseTimer())
    })
    btnReset.addEventListener('click', () => {
      this.addEventListener('resetTimer', this.resetTimer())
    })

  }

  static get observedAttributes() {
    return [TO_TIME_DATA, SECONDS_DATA];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    let secondsLeft
    const timerWr = this.getElementsByClassName(TIME_WR)[0]
    switch (name) {
      case "to-time":
        secondsLeft = this.getToTimeSeconds(newValue)
        if (timerWr) timerWr._shadow.innerHTML = this.renderTime(secondsLeft)
        break;

      case "seconds":
        secondsLeft = this.getSeconds(newValue)
        if (timerWr) timerWr._shadow.innerHTML = this.renderTime(secondsLeft)
        break;
    }

  }

  renderTime(value) {
    const date = new Date()
    const nowSeconds = date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds();
    const nowSecondsLeft = Math.abs(value - nowSeconds)
    return this.secondsConverter(nowSecondsLeft);
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

  startTimer(e) {
    const timerWr = this.getElementsByClassName(TIME_WR)[0]

    if (this.getToTimeSeconds(timerWr._shadow.innerHTML) != 0) {
      this.interval = setInterval(() => {
        const timeSeconds = this.getToTimeSeconds(timerWr._shadow.innerHTML)

        if (timeSeconds === 0) {
          clearInterval(this.interval)
          this.addEventListener('endtimer', this.endTimer())
          return
        }

        timerWr._shadow.innerHTML = this.secondsConverter(timeSeconds - 1);
      }, 1000)
    }
  }

  pauseTimer(e) {
    clearInterval(this.interval)
  }

  resetTimer(e) {
    clearInterval(this.interval)
    const timerWr = this.getElementsByClassName(TIME_WR)[0]
    const toTime = this.getAttribute(TO_TIME_DATA)
    const seconds = this.getAttribute(SECONDS_DATA)
    timerWr._shadow.innerHTML = seconds ? this.renderTime(this.getSeconds(seconds)) : this.renderTime(this.getToTimeSeconds(toTime))
  }

  endTimer(e) {
    const danceCat = document.getElementsByClassName(DANCE_CAT)[0]
    danceCat.classList.remove(DANCE_CAT_HIDDEN)

    setTimeout(() => {
      danceCat.classList.add(DANCE_CAT_HIDDEN)
    }, 6000)
  }

}

customElements.define('timer-view', MyTimer);
