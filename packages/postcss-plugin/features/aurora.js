/**
 * Aurora Effect — 极光流动背景
 * 
 * Input:
 *   aurora: blur(40px) speed(8s) colors(#667eea, #764ba2, #f093fb, #4facfe)
 * 
 * Output:
 *   3 overlapping radial gradients with blur + hue-rotation animation
 */
module.exports = (root) => {
  root.walkDecls('aurora', (decl) => {
    const props = {}
    const blurMatch = decl.value.match(/blur\(([^)]+)\)/)
    const speedMatch = decl.value.match(/speed\(([^)]+)\)/)
    const colorsMatch = decl.value.match(/colors\(([^)]+)\)/)

    if (blurMatch) props.blur = blurMatch[1]
    if (speedMatch) props.speed = speedMatch[1]
    if (colorsMatch) props.colors = colorsMatch[1].split(',').map(c => c.trim())

    const blur = props.blur || '40px'
    const speed = props.speed || '10s'
    const colors = props.colors || ['#667eea', '#764ba2', '#4facfe']
    const id = 'a' + Math.random().toString(36).slice(2, 6)

    // Generate unique animation name
    const animName = `aurora-${id}`
    const animName2 = `aurora-${id}-2`
    const animName3 = `aurora-${id}-3`

    // Replace the declaration with expanded properties
    decl.replaceWith(
      decl.clone({ prop: 'position', value: 'relative' }),
      decl.clone({ prop: 'overflow', value: 'hidden' }),
    )

    // Insert @keyframes rules before the parent rule
    const parent = decl.parent
    const root2 = parent.parent

    // Build keyframes for each gradient layer
    const positions = [
      ['0%', '50%', '100%'],
      ['50%', '100%', '0%'],
      ['100%', '0%', '50%']
    ]

    const keyframeCSS1 = positions.map((p, i) =>
      `${p[i]}% { transform: translate(${Math.sin(i * 2.1) * 20}%, ${Math.cos(i * 1.7) * 20}%) scale(${1 + Math.sin(i * 0.5) * 0.3}) }`
    ).join('\n    ')

    // Insert pseudo-element with gradient + blur + animation
    // Build the gradient string
    const gradientStops = colors.map((c, i) =>
      `${c} ${(i / (colors.length - 1)) * 100}%`
    ).join(', ')

    const auroraCSS = `
  position: relative;
  overflow: hidden;
}
.aurora-${id}::before {
  content: '';
  position: absolute;
  inset: -50%;
  z-index: 0;
  background: radial-gradient(ellipse at 30% 40%, ${colors[0]} 0%, transparent 50%),
              radial-gradient(ellipse at 70% 60%, ${colors[1] || colors[0]} 0%, transparent 50%),
              radial-gradient(ellipse at 50% 50%, ${colors[2] || colors[0]} 0%, transparent 50%);
  filter: blur(${blur});
  animation: ${animName} ${speed} ease-in-out infinite alternate;
  pointer-events: none;
}
.aurora-${id} > * {
  position: relative;
  z-index: 1;
}
@keyframes ${animName} {
  0% { transform: translate(-5%, -5%) scale(1) rotate(0deg); filter: blur(${blur}) hue-rotate(0deg); }
  33% { transform: translate(5%, 3%) scale(1.1) rotate(2deg); filter: blur(${parseInt(blur) + 5}px) hue-rotate(10deg); }
  66% { transform: translate(-3%, 5%) scale(0.95) rotate(-1deg); filter: blur(${blur}) hue-rotate(20deg); }
  100% { transform: translate(5%, -3%) scale(1.05) rotate(1deg); filter: blur(${parseInt(blur) + 3}px) hue-rotate(30deg); }
}`

    // Insert the expanded CSS
    // Since PostCSS manipulation of keyframes is complex, we'll add the class-based approach
    // Add .aurora-{id} class to the parent
    const origSelector = parent.selector
    const newSelector = `${origSelector}.aurora-${id}`
    
    // Create a comment with the class name so the user knows
    parent.after(`/* aurora: add class "aurora-${id}" to activate */`)
    
    // We need a different approach - let's just output a @keyframes block
    // and rely on the class being added
    const keyframeRule = `@keyframes ${animName} {
  0% { transform: translate(-5%, -5%) scale(1) rotate(0deg); filter: blur(${blur}) hue-rotate(0deg); }
  33% { transform: translate(5%, 3%) scale(1.1) rotate(2deg); filter: blur(${parseInt(blur) + 5}px) hue-rotate(10deg); }
  66% { transform: translate(-3%, 5%) scale(0.95) rotate(-1deg); filter: blur(${blur}) hue-rotate(20deg); }
  100% { transform: translate(5%, -3%) scale(1.05) rotate(1deg); filter: blur(${parseInt(blur) + 3}px) hue-rotate(30deg); }
}`
    
    // Insert the keyframe at-rule before parent
    root2.insertBefore(parent, postcss.parse(keyframeRule))
  })
}
