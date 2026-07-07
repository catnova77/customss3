/**
 * CustomSS3 Effects Runtime
 * 
 * High-performance visual effects using Canvas + requestAnimationFrame.
 * 
 * Aurora:  real aurora curtain with bezier light sheets
 * Glitch:  authentic random pixel-sorting glitch art
 */
const CSS3FX = (() => {

/* ─────────── AURORA ─────────── */

class Aurora {
  constructor(canvas, opts = {}) {
    this.canvas = typeof canvas === 'string' ? document.querySelector(canvas) : canvas
    this.ctx = this.canvas.getContext('2d')
    this.dpr = opts.dpr || 0.5
    this.speed = opts.speed || 0.4
    this.colors = opts.colors || [
      [60, 255, 100],   // bright green
      [80, 220, 160],   // green-teal
      [100, 170, 210],  // blue
      [130, 90, 190],   // purple
    ]
    this.bands = opts.bands || 32
    this.time = 0
    this.running = false
    this.freq = opts.freq || 1.5

    this.resize()
    window.addEventListener('resize', () => this.resize())
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect()
    this.w = rect.width
    this.h = rect.height
    this.canvas.width = this.w * this.dpr
    this.canvas.height = this.h * this.dpr
  }

  start() {
    if (this.running) return
    this.running = true
    this._loop()
  }

  stop() {
    this.running = false
  }

  _loop() {
    if (!this.running) return
    this.time += 0.012 * this.speed
    this._draw()
    requestAnimationFrame(() => this._loop())
  }

  _draw() {
    const ctx = this.ctx
    const w = this.canvas.width
    const h = this.canvas.height
    const dpr = this.dpr
    const f = this.freq

    // Clear with slight trail for smooth motion (low opacity fill)
    ctx.fillStyle = 'rgba(8, 8, 8, 0.15)'
    ctx.fillRect(0, 0, w, h)

    const bands = this.bands
    const bandW = w / bands
    const t = this.time

    // Draw each curtain band
    for (let i = 0; i < bands; i++) {
      const x = i * bandW
      const phase = i / bands * Math.PI * 2

      // Pick gradient colors
      const ci1 = Math.floor((i / bands) * this.colors.length) % this.colors.length
      const ci2 = (ci1 + 1) % this.colors.length
      const c1 = this.colors[ci1]
      const c2 = this.colors[ci2]

      // Curtain height varies with sine waves (multiple frequencies for natural look)
      const wave1 = Math.sin(t * f * 0.5 + phase) * 0.3
      const wave2 = Math.sin(t * f * 0.8 + phase * 1.7) * 0.2
      const wave3 = Math.sin(t * f * 1.2 + phase * 0.5 + 1) * 0.15
      const heightFactor = 0.4 + wave1 + wave2 + wave3
      const curtainH = Math.max(h * 0.1, h * heightFactor)

      // Horizontal sway
      const sway = Math.sin(t * f * 0.3 + phase * 0.7) * bandW * 0.5

      // Vertical offset (curtain "hang" point)
      const topY = h * 0.05 + Math.sin(t * f * 0.4 + phase * 1.2) * h * 0.05

      // Draw the curtain band as a vertical gradient strip
      const grad = ctx.createLinearGradient(x + sway, topY, x + sway + bandW * 0.6, topY + curtainH)
      const alpha = 0.08 + Math.sin(t * f + phase * 2) * 0.04 + 0.04
      grad.addColorStop(0, `rgba(${c1[0]},${c1[1]},${c1[2]},${alpha * 1.5})`)
      grad.addColorStop(0.3, `rgba(${c1[0]},${c1[1]},${c1[2]},${alpha})`)
      grad.addColorStop(0.5, `rgba(${c2[0]},${c2[1]},${c2[2]},${alpha * 0.8})`)
      grad.addColorStop(0.7, `rgba(${c2[0]},${c2[1]},${c2[2]},${alpha * 0.4})`)
      grad.addColorStop(1, `rgba(${c2[0]},${c2[1]},${c2[2]},0)`)

      ctx.fillStyle = grad
      ctx.beginPath()

      // Bezier curve for organic curtain shape
      const cx = x + sway
      const cw = bandW * 0.4
      const midH = Math.sin(t * 0.6 + phase * 1.3) * h * 0.08

      ctx.moveTo(cx, topY)
      ctx.quadraticCurveTo(
        cx + cw * 0.5, topY + curtainH * 0.3 + midH,
        cx + cw * 0.3, topY + curtainH * 0.6
      )
      ctx.quadraticCurveTo(
        cx + cw * 0.2, topY + curtainH * 0.8 - midH,
        cx, topY + curtainH
      )
      ctx.quadraticCurveTo(
        cx - cw * 0.2, topY + curtainH * 0.8 + midH,
        cx - cw * 0.3, topY + curtainH * 0.6
      )
      ctx.quadraticCurveTo(
        cx - cw * 0.5, topY + curtainH * 0.3 - midH,
        cx, topY
      )
      ctx.closePath()
      ctx.fill()
    }
  }
}


/* ─────────── GLITCH ─────────── */

class Glitch {
  constructor(element, opts = {}) {
    this.el = typeof element === 'string' ? document.querySelector(element) : element
    this.speed = opts.speed || 300    // ms between glitch attacks
    this.intensity = opts.intensity || 4  // pixel displacement max
    this.text = this.el.textContent
    this.running = false
    this._timer = null
    this._animFrame = null
    this._glitching = false
    this._originalText = this.el.innerHTML
  }

  start() {
    if (this.running) return
    this.running = true
    this._schedule()
  }

  stop() {
    this.running = false
    clearTimeout(this._timer)
    if (this._animFrame) cancelAnimationFrame(this._animFrame)
    this.el.innerHTML = this._originalText
    this.el.style.textShadow = ''
    this.el.style.transform = ''
  }

  _schedule() {
    if (!this.running) return
    // Random interval between glitches (faster than configured for frequency)
    const delay = this.speed * (0.3 + Math.random() * 0.7)
    this._timer = setTimeout(() => this._attack(), delay)
  }

  _attack() {
    if (!this.running) return
    this._glitching = true
    const intensity = this.intensity
    const el = this.el
    const text = this.text
    const chars = text.split('')

    // Track original state for cleanup
    const origShadow = el.style.textShadow
    const origTransform = el.style.transform

    // Phase 1: RGB channel shift (chromatic aberration)
    const rOff = (Math.random() - 0.5) * intensity * 2
    const gOff = (Math.random() - 0.5) * intensity * 2
    const bOff = (Math.random() - 0.5) * intensity * 2
    el.style.textShadow = `
      ${rOff}px 0 rgba(255,0,0,0.7),
      ${gOff}px 0 rgba(0,255,0,0.3),
      ${bOff}px 0 rgba(0,0,255,0.7)
    `

    // Phase 2: Random slice displacement
    // Insert spans with random horizontal offsets for character groups
    const sliceCount = 1 + Math.floor(Math.random() * 3)
    let html = ''
    for (let i = 0; i < chars.length; i++) {
      // 15% chance per character to start a glitch slice
      if (Math.random() < 0.15 && i < chars.length - 2) {
        const sliceLen = 1 + Math.floor(Math.random() * 4)
        const sliceChars = chars.slice(i, Math.min(i + sliceLen, chars.length)).join('')
        const offset = (Math.random() - 0.5) * intensity * 3
        const blur = Math.random() * 2
        html += `<span style="display:inline-block;transform:translateX(${offset}px);filter:blur(${blur}px);color:${Math.random() > 0.5 ? '#ff00c1' : '#00ffea'}">${sliceChars}</span>`
        i += sliceLen - 1
      } else {
        html += chars[i]
      }
    }
    el.innerHTML = html

    // Phase 3: Full horizontal shake
    const shakeX = (Math.random() - 0.5) * intensity * 2
    el.style.transform = `translateX(${shakeX}px)`

    // Phase 4: Sometimes add a flicker
    if (Math.random() < 0.3) {
      el.style.opacity = '0.7'
      setTimeout(() => { if (this.running) el.style.opacity = '1' }, 50 + Math.random() * 80)
    }

    // Cleanup after a random short duration
    const duration = 80 + Math.random() * 200
    setTimeout(() => {
      if (!this.running) return
      this._glitching = false
      el.innerHTML = this._originalText
      el.style.textShadow = ''
      el.style.transform = ''
      el.style.opacity = '1'
      this._schedule()
    }, duration)
  }
}

return { Aurora, Glitch }
})()
