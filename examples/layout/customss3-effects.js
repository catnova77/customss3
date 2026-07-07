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
    this.speed = opts.speed || 500     // avg ms between attacks
    this.intensity = opts.intensity || 4
    this.running = false
    this._timer = null
    this._glitching = false
    this._timeouts = []

    if (getComputedStyle(this.el).position === 'static')
      this.el.style.position = 'relative'

    // Store original for clone creation
    this._text = this.el.textContent
    this._origHTML = this.el.innerHTML
    this._origFontSize = getComputedStyle(this.el).fontSize
  }

  start() {
    if (this.running) return
    this.running = true
    this._schedule()
  }

  stop() {
    this.running = false
    clearTimeout(this._timer)
    this._fullCleanup()
  }

  _schedule() {
    if (!this.running) return
    const delay = this.speed * (0.2 + Math.random() * 0.5)
    this._timer = setTimeout(() => this._attack(), delay)
  }

  _fullCleanup() {
    const el = this.el
    this._timeouts.forEach(t => clearTimeout(t))
    this._timeouts = []
    el.innerHTML = this._origHTML
    el.style.textShadow = ''
    el.style.transform = ''
    el.style.opacity = ''
    el.style.clipPath = ''
    el.style.letterSpacing = ''
    el.style.filter = ''
    el.style.color = ''
    el.style.mixBlendMode = ''
    el.querySelectorAll('[data-glitch-layer]').forEach(n => n.remove())
  }

  _cleanup() {
    const el = this.el
    this._timeouts.forEach(t => clearTimeout(t))
    this._timeouts = []
    el.style.textShadow = ''
    el.style.transform = ''
    el.style.opacity = ''
    el.style.clipPath = ''
    el.style.letterSpacing = ''
    el.style.filter = ''
    el.style.color = ''
    el.style.mixBlendMode = ''
    el.querySelectorAll('[data-glitch-layer]').forEach(n => n.remove())
  }

  _createClone(id) {
    const el = this.el
    const clone = document.createElement('div')
    clone.setAttribute('data-glitch-layer', id)
    clone.textContent = this._text
    clone.style.cssText = `
      position: absolute; inset: 0;
      font-size: ${this._origFontSize};
      font-family: ${getComputedStyle(el).fontFamily};
      font-weight: ${getComputedStyle(el).fontWeight};
      letter-spacing: inherit;
      text-align: inherit;
      line-height: inherit;
      pointer-events: none;
      white-space: nowrap;
    `
    el.appendChild(clone)
    return clone
  }

  _track(t) {
    this._timeouts.push(t)
    return t
  }

  _attack() {
    if (!this.running) return
    this._glitching = true
    const el = this.el
    const I = this.intensity

    // === ALL phases fire simultaneously ===
    this._phase1(el, I)
    this._phase2(el, I)
    this._phase3(el, I)
    this._phase4(el, I)

    // Single cleanup after burst
    const burstDuration = 120 + Math.random() * 250
    setTimeout(() => {
      if (!this.running) return
      this._glitching = false
      this._cleanup()
      this._schedule()
    }, burstDuration)
  }

  // Phase 1: RGB split + shake + clone tear
  _phase1(el, I) {
    // Aggressive RGB
    const rX = (Math.random() - 0.5) * I * 2.5
    const gX = (Math.random() - 0.5) * I * 2.5
    const bX = (Math.random() - 0.5) * I * 2.5
    el.style.textShadow = [
      `${rX}px 0 rgba(255,0,0,0.85)`,
      `${gX * 0.5}px ${(Math.random()-0.5)*I*0.5}px rgba(0,255,0,0.3)`,
      `${bX}px 0 rgba(0,0,255,0.8)`,
    ].join(',')

    // Shake
    el.style.transform = `translateX(${(Math.random()-0.5)*I*3}px) translateY(${(Math.random()-0.5)*I*0.5}px)`

    // Clone tear — displace upper portion
    if (Math.random() < 0.6) {
      const clone = this._createClone('a')
      const tearY = (0.2 + Math.random() * 0.4) * el.offsetHeight
      const cloneH = el.offsetHeight - tearY
      clone.style.cssText += `
        clip-path: inset(${tearY}px 0 0 0);
        transform: translateX(${(Math.random()-0.5)*I*4}px) translateY(${(Math.random()-0.5)*I*0.8}px);
        opacity: ${0.7 + Math.random() * 0.3};
        filter: blur(${Math.random() < 0.4 ? '1px' : '0'});
      `
      // Also clip the original to the top portion
      el.style.clipPath = `inset(0 0 ${el.offsetHeight - tearY}px 0)`
    }
  }

  // Phase 2: Color blocks + vertical tear
  _phase2(el, I) {
    el.style.transform = `translateX(${(Math.random()-0.5)*I*2.5}px)`

    // Invert colors briefly
    if (Math.random() < 0.35) {
      el.style.mixBlendMode = 'difference'
      el.style.filter = 'invert(1)'
      this._track(setTimeout(() => {
        if (this.running) {
          el.style.mixBlendMode = ''
          el.style.filter = ''
        }
      }, 40 + Math.random() * 60))
    }

    // Color block overlay
    if (Math.random() < 0.4) {
      const block = document.createElement('div')
      block.setAttribute('data-glitch-layer', 'block')
      const bw = 20 + Math.random() * 60
      const bh = 2 + Math.random() * 6
      const bx = Math.random() * (el.offsetWidth - bw)
      const by = Math.random() * el.offsetHeight
      const colors = ['#ff00c1', '#00ffea', '#ff0', '#f0f', '#0ff']
      block.style.cssText = `
        position: absolute;
        left: ${bx}px; top: ${by}px;
        width: ${bw}px; height: ${bh}px;
        background: ${colors[Math.floor(Math.random()*colors.length)]};
        opacity: ${0.4 + Math.random() * 0.4};
        pointer-events: none;
        mix-blend-mode: screen;
      `
      el.appendChild(block)
      this._track(setTimeout(() => { if (this.running) block.remove() }, 60 + Math.random() * 100))
    }
  }

  // Phase 3: Horizontal strip tear with clone
  _phase3(el, I) {
    el.style.transform = `translateX(${(Math.random()-0.5)*I*1.5}px) skewX(${(Math.random()-0.5)*2}deg)`

    // Create a middle-strip clone
    if (Math.random() < 0.6) {
      const clone = this._createClone('b')
      const stripY = (0.15 + Math.random() * 0.6) * el.offsetHeight
      const stripH = 4 + Math.random() * (el.offsetHeight * 0.35)
      clone.style.cssText += `
        clip-path: inset(${stripY}px 0 ${el.offsetHeight - stripY - stripH}px 0);
        transform: translateX(${(Math.random()-0.5)*I*6}px) scaleX(${0.9 + Math.random()*0.2});
        opacity: 0.85;
        color: ${['#ff00c1', '#00ffea', '#fff'][Math.floor(Math.random()*3)]};
        filter: blur(${Math.random() < 0.5 ? '0.5px' : '0'});
      `
    }

    // text jitter
    el.style.letterSpacing = `${(Math.random()-0.5)*6}px`
  }

  // Phase 4: Screen tear + scan lines
  _phase4(el, I) {
    // Scan line overlay
    const scan = document.createElement('div')
    scan.setAttribute('data-glitch-layer', 'scan')
    const sy = Math.random() * el.offsetHeight
    scan.style.cssText = `
      position: absolute;
      left: 0; top: ${sy}px;
      width: 100%; height: 1.5px;
      background: rgba(255,255,255,0.6);
      pointer-events: none;
      box-shadow: 0 0 4px rgba(255,255,255,0.3);
    `
    el.appendChild(scan)
    this._track(setTimeout(() => { if (this.running) scan.remove() }, 30 + Math.random() * 50))

    // Text jitter
    el.style.transform = `translateY(${(Math.random()-0.5)*I*0.5}px)`
    el.style.letterSpacing = `${(Math.random()-0.5)*I}px`
  }
}

/* ─────────── MATRIX RAIN ─────────── */

class MatrixRain {
  constructor(canvas, opts = {}) {
    this.canvas = typeof canvas === 'string' ? document.querySelector(canvas) : canvas
    this.ctx = this.canvas.getContext('2d')
    this.dpr = opts.dpr || 0.5
    this.speed = opts.speed || 40
    this.charSize = opts.charSize || 14
    this.color = opts.color || '#0f0'
    this.fade = opts.fade !== false
    
    this.chars = '日ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾟﾁﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍ0123456789'
    this.drops = []
    this.time = 0
    this.running = false

    this.resize()
    window.addEventListener('resize', () => this.resize())
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect()
    this.w = rect.width
    this.h = rect.height
    this.canvas.width = this.w * this.dpr
    this.canvas.height = this.h * this.dpr
    const cols = Math.ceil(this.canvas.width / (this.charSize * 0.6))
    while (this.drops.length < cols) {
      this.drops.push({
        y: Math.random() * -this.canvas.height,
        speed: 1 + Math.random() * 3,
        chars: Math.floor(5 + Math.random() * 20)
      })
    }
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
    this._draw()
    setTimeout(() => requestAnimationFrame(() => this._loop()), this.speed)
  }

  _draw() {
    const ctx = this.ctx
    const w = this.canvas.width
    const h = this.canvas.height
    const cs = this.charSize * this.dpr

    // Semi-transparent overlay for trail effect
    if (this.fade) {
      ctx.fillStyle = 'rgba(8, 8, 8, 0.08)'
      ctx.fillRect(0, 0, w, h)
    } else {
      ctx.fillStyle = '#080808'
      ctx.fillRect(0, 0, w, h)
    }

    ctx.font = `${cs}px monospace`
    ctx.textAlign = 'center'

    for (let i = 0; i < this.drops.length; i++) {
      const drop = this.drops[i]
      const x = i * cs * 0.6 + cs * 0.3

      // Draw trail of characters
      for (let j = 0; j < drop.chars; j++) {
        const char = this.chars[Math.floor(Math.random() * this.chars.length)]
        const y = drop.y - j * cs
        if (y < -cs) break

        if (j === 0) {
          // Leading character — bright white
          ctx.fillStyle = '#fff'
          ctx.shadowColor = this.color
          ctx.shadowBlur = 8
        } else if (j < 3) {
          ctx.fillStyle = this.color
          ctx.shadowBlur = 3
        } else {
          // Trail — fading
          const alpha = 1 - (j / drop.chars) * 0.8
          ctx.fillStyle = `rgba(0, 255, 0, ${alpha * 0.5})`
          ctx.shadowBlur = 0
        }
        ctx.fillText(char, x, y)
      }
      ctx.shadowBlur = 0

      // Move drop down
      drop.y += drop.speed * this.dpr
      
      // Reset at bottom or randomly
      if (drop.y > h + drop.chars * cs) {
        drop.y = Math.random() * -h * 0.5
        drop.speed = 1 + Math.random() * 3
        drop.chars = Math.floor(5 + Math.random() * 20)
      }
    }
  }
}


/* ─────────── PARTICLE SWARM ─────────── */

class ParticleSwarm {
  constructor(canvas, opts = {}) {
    this.canvas = typeof canvas === 'string' ? document.querySelector(canvas) : canvas
    this.ctx = this.canvas.getContext('2d')
    this.count = opts.count || 80
    this.speed = opts.speed || 1.5
    this.connectDist = opts.connectDist || 60
    this.particleSize = opts.particleSize || 2
    this.colors = opts.colors || ['#000', '#888', '#fff']

    this.particles = []
    this.running = false

    this.resize()
    window.addEventListener('resize', () => this.resize())
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect()
    this.w = rect.width
    this.h = rect.height
    this.canvas.width = this.w
    this.canvas.height = this.h
    this._initParticles()
  }

  _initParticles() {
    this.particles = Array.from({ length: this.count }, () => ({
      x: Math.random() * this.w,
      y: Math.random() * this.h,
      vx: (Math.random() - 0.5) * this.speed,
      vy: (Math.random() - 0.5) * this.speed,
      size: 1 + Math.random() * this.particleSize,
      color: this.colors[Math.floor(Math.random() * this.colors.length)]
    }))
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
    this._draw()
    requestAnimationFrame(() => this._loop())
  }

  _draw() {
    const ctx = this.ctx
    const w = this.w
    const h = this.h

    ctx.clearRect(0, 0, w, h)
    ctx.fillStyle = '#080808'
    ctx.fillRect(0, 0, w, h)

    const particles = this.particles

    // Update particles — automatic floating
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i]

      // Random gentle direction changes
      if (Math.random() < 0.005) {
        p.vx += (Math.random() - 0.5) * 0.5
        p.vy += (Math.random() - 0.5) * 0.5
      }

      p.x += p.vx
      p.y += p.vy

      // Damping
      p.vx *= 0.995
      p.vy *= 0.995

      // Clamp speed
      const spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy)
      if (spd > this.speed) {
        p.vx = (p.vx / spd) * this.speed
        p.vy = (p.vy / spd) * this.speed
      }

      // Boundary wrap
      if (p.x < 0) p.x = w
      if (p.x > w) p.x = 0
      if (p.y < 0) p.y = h
      if (p.y > h) p.y = 0

      // Draw particle
      ctx.fillStyle = p.color
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
      ctx.fill()
    }

    // Draw connections
    const maxDistSq = this.connectDist * this.connectDist
    ctx.lineWidth = 0.5
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i]
        const b = particles[j]
        const dx = a.x - b.x
        const dy = a.y - b.y
        const distSq = dx * dx + dy * dy
        if (distSq < maxDistSq) {
          const alpha = 1 - distSq / maxDistSq
          ctx.strokeStyle = `rgba(136,136,136,${(alpha * 0.35).toFixed(2)})`
          ctx.beginPath()
          ctx.moveTo(a.x, a.y)
          ctx.lineTo(b.x, b.y)
          ctx.stroke()
        }
      }
    }
  }
}


/* ─────────── RIPPLE ─────────── */

class Ripple {
  constructor(canvas, opts = {}) {
    this.canvas = typeof canvas === 'string' ? document.querySelector(canvas) : canvas
    this.ctx = this.canvas.getContext('2d')
    this.count = opts.count || 5
    this.color = opts.color || '#6c8cff'
    this.speed = opts.speed || 2

    this.ripples = []
    this.running = false
    this.autoMode = true

    this.resize()
    window.addEventListener('resize', () => this.resize())

    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect()
      const x = (e.clientX - rect.left) * this.dpr
      const y = (e.clientY - rect.top) * this.dpr
      // Emit a new ripple wave
      if (this.running && this.ripples.length < 8) {
        this.ripples.push({
          x, y,
          r: 0,
          speed: 1.5 + Math.random() * this.speed,
          alpha: 0.6 + Math.random() * 0.3,
          growing: true
        })
      }
      this.autoMode = false
      clearTimeout(this._autoTimer)
      this._autoTimer = setTimeout(() => { this.autoMode = true }, 2000)
    })
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect()
    this.dpr = 1
    this.w = rect.width
    this.h = rect.height
    this.canvas.width = this.w
    this.canvas.height = this.h
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
    this._draw()
    requestAnimationFrame(() => this._loop())
  }

  _draw() {
    const ctx = this.ctx
    const w = this.w
    const h = this.h

    ctx.clearRect(0, 0, w, h)

    // Auto ripples
    if (this.autoMode && this.ripples.length < 3 && Math.random() < 0.02) {
      this.ripples.push({
        x: (0.2 + Math.random() * 0.6) * w,
        y: (0.2 + Math.random() * 0.6) * h,
        r: 0,
        speed: 1 + Math.random() * this.speed,
        alpha: 0.3 + Math.random() * 0.3,
        growing: true
      })
    }

    const color = this.color
    for (let i = this.ripples.length - 1; i >= 0; i--) {
      const rip = this.ripples[i]
      rip.r += rip.speed * this.dpr

      // Draw ripple rings
      for (let ring = 0; ring < 3; ring++) {
        const r = rip.r - ring * 8
        if (r < 0) continue
        const alpha = rip.alpha * (1 - r / Math.max(w, h) * 1.5)
        if (alpha <= 0) continue
        ctx.strokeStyle = color.replace(')', `, ${alpha.toFixed(2)})`).replace('rgb', 'rgba')
        ctx.lineWidth = 1 + (1 - alpha / rip.alpha) * 2
        ctx.beginPath()
        ctx.arc(rip.x, rip.y, r, 0, Math.PI * 2)
        ctx.stroke()
      }

      // Remove faded ripples
      if (rip.r > Math.max(w, h) * 0.7) {
        this.ripples.splice(i, 1)
      }
    }
  }
}


return { Aurora, Glitch, MatrixRain, ParticleSwarm, Ripple }
})()
