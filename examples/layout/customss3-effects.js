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
    this.dpr = opts.dpr || 0.5  // half-res for perf, canvas will be CSS-scaled
    this.speed = opts.speed || 0.3
    this.colors = opts.colors || [
      [0x66, 0x7e, 0xea],  // blue
      [0x76, 0x4b, 0xa2],  // purple
      [0x4f, 0xac, 0xfe],  // light blue
      [0xf0, 0x93, 0xfb],  // pink
    ]
    this.bands = opts.bands || 24     // number of curtain bands
    this.time = 0
    this.running = false
    // wave frequency multipliers — raised for faster, more dynamic motion
    this.freq = opts.freq || 1.0

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
      const f = this.freq * 1.5
      const wave1 = Math.sin(t * f * 0.5 + phase) * 0.3
      const wave2 = Math.sin(t * f * 0.8 + phase * 1.7 + 0.5) * 0.2
      const wave3 = Math.sin(t * f * 1.4 + phase * 0.6 + 1.2) * 0.15
      const heightFactor = 0.4 + wave1 + wave2 + wave3
      const curtainH = Math.max(h * 0.1, h * heightFactor)

      // Horizontal sway
      const sway = Math.sin(t * f * 0.4 + phase * 0.7) * bandW * 0.6

      // Vertical offset (curtain "hang" point)
      const topY = h * 0.05 + Math.sin(t * f * 0.45 + phase * 1.2) * h * 0.06

      // Draw the curtain band as a vertical gradient strip
      const grad = ctx.createLinearGradient(x + sway, topY, x + sway + bandW * 0.6, topY + curtainH)
      const alpha = 0.08 + Math.sin(t + phase * 2) * 0.04 + 0.04
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
      const midH = Math.sin(t * f * 0.7 + phase * 1.3) * h * 0.08

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
    this.speed = opts.speed || 400    // avg ms between attacks
    this.intensity = opts.intensity || 3  // pixel displacement max
    this.running = false
    this._timer = null
    this._glitching = false

    // Ensure element has position for overlay
    if (getComputedStyle(this.el).position === 'static')
      this.el.style.position = 'relative'
  }

  start() {
    if (this.running) return
    this.running = true
    this._schedule()
  }

  stop() {
    this.running = false
    clearTimeout(this._timer)
    this._cleanup()
  }

  _schedule() {
    if (!this.running) return
    const delay = this.speed * (0.3 + Math.random() * 0.7)
    this._timer = setTimeout(() => this._attack(), delay)
  }

  _cleanup() {
    const el = this.el
    el.style.textShadow = ''
    el.style.transform = ''
    el.style.opacity = ''
    el.style.clipPath = ''
    el.style.letterSpacing = ''
    // remove overlay if any
    const ov = el.querySelector('[data-glitch-overlay]')
    if (ov) ov.remove()
  }

  _attack() {
    if (!this.running) return
    this._glitching = true
    const el = this.el
    const I = this.intensity

    // === Phase 1: RGB channel split via text-shadow ===
    const rX = (Math.random() - 0.5) * I * 2
    const gX = (Math.random() - 0.5) * I * 2
    const bX = (Math.random() - 0.5) * I * 2
    const offY = (Math.random() < 0.4) ? (Math.random() - 0.5) * I * 0.5 : 0
    el.style.textShadow = [
      `${rX}px ${offY}px rgba(255,0,0,0.75)`,
      `${gX}px ${offY}px rgba(0,255,0,0.25)`,
      `${bX}px ${offY}px rgba(0,0,255,0.7)`,
      `${(Math.random()-0.5)*I*0.5}px ${offY}px rgba(255,255,255,0.1)`
    ].join(',')

    // === Phase 2: horizontal shake + skew ===
    const shakeX = (Math.random() - 0.5) * I * 2
    const skewX = (Math.random() < 0.25) ? (Math.random() - 0.5) * 3 : 0
    const scaleX = (Math.random() < 0.15) ? (0.95 + Math.random() * 0.1) : 1
    const transY = (Math.random() - 0.5) * I * 0.3
    el.style.transform = `translateX(${shakeX}px) translateY(${transY}px) skewX(${skewX}deg) scaleX(${scaleX})`

    // === Phase 3: clip-path to simulate torn rows ===
    // Create the appearance of sliced/missing horizontal strips
    if (Math.random() < 0.5) {
      const h = el.offsetHeight
      const y1 = Math.random() * h * 0.3
      const y2 = y1 + 2 + Math.random() * 4
      const y3 = Math.random() > 0.5 ? 0 : Math.random() * h * 0.7
      const y4 = y3 + 1 + Math.random() * 3
      const inset = `${y1}px ${Math.random()*5}px ${h-y2}px ${Math.random()*5}px`
      el.style.clipPath = `inset(${inset})`
    }

    // === Phase 4: letter-spacing jitter ===
    if (Math.random() < 0.3) {
      const ls = (Math.random() - 0.5) * 4
      el.style.letterSpacing = `${ls}px`
    }

    // === Phase 5: opacity flicker ===
    if (Math.random() < 0.25) {
      el.style.opacity = `${0.6 + Math.random() * 0.3}`
    }

    // === Duration + cleanup ===
    const duration = 60 + Math.random() * 180
    setTimeout(() => {
      if (!this.running) return
      this._glitching = false
      this._cleanup()
      this._schedule()
    }, duration)
  }
}

return { Aurora, Glitch }
})()
