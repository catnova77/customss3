/**
 * Visual Effects Module
 * 
 * Generates complete CSS for: aurora, glitch, blob, starfield, perspective
 * Each effect is a class-based system that outputs ready-to-use CSS.
 * 
 * CustomSS3 syntax → expanded CSS with @keyframes
 */

function parseArgs(str) {
  const props = {}
  str.replace(/(\w+)\(([^)]*)\)/g, (_, key, val) => { props[key] = val; return '' })
  return props
}

module.exports = (root, postcss) => {
  const snippets = []

  /* ─── AURORA — Flowing animated aurora background ─── */
  root.walkDecls('aurora', (decl) => {
    const p = parseArgs(decl.value)
    const blur = p.blur || '40px'
    const speed = p.speed || '10s'
    const colors = (p.colors || '#667eea,#764ba2,#4facfe').split(',').map(c => c.trim())
    const id = Math.random().toString(36).slice(2, 6)
    const animName = `a-aurora-${id}`

    // Generate unique output class
    const className = `_aurora_${id}`
    decl.replaceWith(
      decl.clone({ prop: 'position', value: 'relative' }),
      decl.clone({ prop: 'overflow', value: 'hidden' }),
    )

    const gradientLayers = colors.map((c, i) => {
      const cx = 30 + i * 20
      const cy = 30 + (i * 15) % 50
      return `radial-gradient(ellipse at ${cx}% ${cy}%, ${c} 0%, transparent 50%)`
    }).join(',\n    ')

    snippets.push(`.${className}::before {
  content: '';
  position: absolute;
  inset: -50%;
  z-index: 0;
  background:
    ${gradientLayers};
  filter: blur(${blur});
  animation: ${animName} ${speed} ease-in-out infinite alternate;
  pointer-events: none;
}
.${className} > * {
  position: relative;
  z-index: 1;
}
@keyframes ${animName} {
  0%   { transform: translate(-5%, -5%) scale(1) rotate(0deg); filter: blur(${blur}) hue-rotate(0deg); }
  25%  { transform: translate(8%, 3%) scale(1.1) rotate(2deg); filter: blur(${parseInt(blur) + 8}px) hue-rotate(10deg); }
  50%  { transform: translate(-3%, 8%) scale(0.95) rotate(-1deg); filter: blur(${blur}) hue-rotate(20deg); }
  75%  { transform: translate(5%, -5%) scale(1.08) rotate(1.5deg); filter: blur(${parseInt(blur) + 5}px) hue-rotate(15deg); }
  100% { transform: translate(-8%, 3%) scale(1.05) rotate(-0.5deg); filter: blur(${parseInt(blur) + 3}px) hue-rotate(30deg); }
}`)

    // Add the class to the parent selector
    const parent = decl.parent
    if (parent && parent.selector) {
      parent.selector = parent.selector + `.${className}`
    }
  })

  /* ─── GLITCH — Glitch text effect ─── */
  root.walkDecls('glitch', (decl) => {
    const p = parseArgs(decl.value)
    const speed = p.speed || '3s'
    const intensity = parseInt(p.intensity) || 3
    const id = Math.random().toString(36).slice(2, 6)
    const className = `_glitch_${id}`
    const animName = `a-glitch-${id}`
    const animName2 = `a-glitch-${id}-2`

    decl.replaceWith(
      decl.clone({ prop: 'position', value: 'relative' }),
    )

    // Add data-text attribute requirement
    snippets.push(`.${className} {
  position: relative;
}
.${className}::before,
.${className}::after {
  content: attr(data-text);
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.${className}::before {
  color: #ff00c1;
  animation: ${animName} ${speed} infinite linear alternate-reverse;
  clip-path: inset(0 0 60% 0);
}
.${className}::after {
  color: #00ffea;
  animation: ${animName2} ${speed} infinite linear alternate-reverse;
  clip-path: inset(60% 0 0 0);
}
@keyframes ${animName} {
  0%   { transform: translate(0); clip-path: inset(40% 0 60% 0); }
  20%  { transform: translate(${intensity * 2}px); clip-path: inset(20% 0 40% 0); }
  40%  { transform: translate(-${intensity * 3}px); clip-path: inset(70% 0 5% 0); }
  60%  { transform: translate(${intensity}px); clip-path: inset(10% 0 70% 0); }
  80%  { transform: translate(-${intensity * 2}px); clip-path: inset(50% 0 30% 0); }
  100% { transform: translate(0); clip-path: inset(30% 0 50% 0); }
}
@keyframes ${animName2} {
  0%   { transform: translate(0); }
  20%  { transform: translate(-${intensity * 2}px); }
  40%  { transform: translate(${intensity * 3}px); }
  60%  { transform: translate(-${intensity}px); }
  80%  { transform: translate(${intensity * 2}px); }
  100% { transform: translate(0); }
}`)

    const parent = decl.parent
    if (parent && parent.selector) {
      parent.selector = parent.selector + `.${className}`
    }
  })

  /* ─── BLOB — Gooey blob morphing animation ─── */
  root.walkDecls('blob', (decl) => {
    const p = parseArgs(decl.value)
    const speed = p.speed || '12s'
    const colors = (p.colors || '#667eea,#764ba2').split(',').map(c => c.trim())
    const size = parseInt(p.size) || 200
    const id = Math.random().toString(36).slice(2, 6)
    const className = `_blob_${id}`
    const animName = `a-blob-${id}`
    const animName2 = `a-blob-${id}-2`

    decl.replaceWith(
      decl.clone({ prop: 'position', value: 'relative' }),
      decl.clone({ prop: 'overflow', value: 'hidden' }),
    )

    snippets.push(`
.${className}::before,
.${className}::after {
  content: '';
  position: absolute;
  width: ${size}px;
  height: ${size}px;
  border-radius: 50%;
  filter: blur(40px);
  opacity: 0.7;
  pointer-events: none;
  z-index: 0;
}
.${className}::before {
  background: ${colors[0]};
  animation: ${animName} ${speed} ease-in-out infinite alternate;
  top: 10%;
  left: 10%;
}
.${className}::after {
  background: ${colors[1] || colors[0]};
  animation: ${animName2} ${speed} ease-in-out infinite alternate;
  bottom: 10%;
  right: 10%;
}
.${className} > * {
  position: relative;
  z-index: 1;
}
@keyframes ${animName} {
  0%   { border-radius: 50% 50% 50% 50% / 50% 50% 50% 50%; transform: translate(0, 0) scale(1); }
  25%  { border-radius: 40% 60% 60% 40% / 60% 40% 60% 40%; transform: translate(30px, 20px) scale(1.1); }
  50%  { border-radius: 60% 40% 40% 60% / 40% 60% 40% 60%; transform: translate(-20px, 40px) scale(0.9); }
  75%  { border-radius: 50% 50% 60% 40% / 50% 60% 40% 50%; transform: translate(20px, -10px) scale(1.2); }
  100% { border-radius: 40% 60% 50% 50% / 60% 40% 50% 50%; transform: translate(-30px, 20px) scale(1); }
}
@keyframes ${animName2} {
  0%   { border-radius: 50% 50% 50% 50% / 50% 50% 50% 50%; transform: translate(0, 0) scale(1); }
  25%  { border-radius: 60% 40% 50% 50% / 50% 60% 40% 50%; transform: translate(-30px, -20px) scale(1.2); }
  50%  { border-radius: 40% 60% 60% 40% / 60% 40% 50% 50%; transform: translate(20px, -30px) scale(0.85); }
  75%  { border-radius: 50% 40% 60% 50% / 40% 50% 60% 50%; transform: translate(-20px, 30px) scale(1.15); }
  100% { border-radius: 60% 50% 40% 50% / 50% 40% 60% 50%; transform: translate(30px, -10px) scale(1); }
}`)

    const parent = decl.parent
    if (parent && parent.selector) {
      parent.selector = parent.selector + `.${className}`
    }
  })

  /* ─── STARFIELD — Particle starfield background ─── */
  root.walkDecls('starfield', (decl) => {
    const p = parseArgs(decl.value)
    const count = parseInt(p.count) || 100
    const speed = p.speed || '4s'
    const id = Math.random().toString(36).slice(2, 6)
    const className = `_star_${id}`
    const animName = `a-star-${id}`

    // Generate box-shadow stars
    const rng = () => Math.floor(Math.random() * 2000)
    const stars1 = Array.from({ length: count }, () => `${rng()}px ${rng()}px rgba(255,255,255,${(Math.random() * 0.5 + 0.3).toFixed(2)})`).join(',\n    ')
    const stars2 = Array.from({ length: Math.floor(count / 2) }, () => `${rng()}px ${rng()}px rgba(200,200,255,${(Math.random() * 0.3 + 0.2).toFixed(2)})`).join(',\n    ')

    decl.replaceWith(
      decl.clone({ prop: 'position', value: 'relative' }),
      decl.clone({ prop: 'overflow', value: 'hidden' }),
    )

    snippets.push(`
.${className}::before,
.${className}::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}
.${className}::before {
  box-shadow:
    ${stars1};
  animation: ${animName}-1 ${speed} linear infinite;
}
.${className}::after {
  box-shadow:
    ${stars2};
  animation: ${animName}-2 ${parseInt(speed) * 2}s linear infinite;
}
.${className} > * {
  position: relative;
  z-index: 1;
}
@keyframes ${animName}-1 {
  from { transform: translateY(0); }
  to { transform: translateY(-2000px); }
}
@keyframes ${animName}-2 {
  from { transform: translateY(0); opacity: 1; }
  50% { opacity: 0.5; }
  to { transform: translateY(-2000px); opacity: 0; }
}`)

    const parent = decl.parent
    if (parent && parent.selector) {
      parent.selector = parent.selector + `.${className}`
    }
  })

  /* ─── PERSPECTIVE — 3D tilt card ─── */
  root.walkDecls('perspective', (decl) => {
    const p = parseArgs(decl.value)
    const depth = p.depth || '1000px'
    const maxTilt = p.tilt || '15'
    const id = Math.random().toString(36).slice(2, 6)
    const className = `_persp_${id}`

    decl.replaceWith(
      decl.clone({ prop: 'perspective', value: depth }),
    )

    snippets.push(`
.${className} {
  transition: transform 0.1s ease-out;
  transform-style: preserve-3d;
}
.${className}-child {
  transition: transform 0.2s ease-out;
}`)

    const parent = decl.parent
    if (parent && parent.selector) {
      parent.selector = parent.selector + `.${className}`
    }
  })

  return snippets
}
