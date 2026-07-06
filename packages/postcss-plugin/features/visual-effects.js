/**
 * Visual Effect Factories
 * Transforms:
 *   glass: blur(16px) opacity(0.85) color(#fff) → expanded background + backdrop-filter
 *   neon: color(cyan) radius(4px) intensity(2) → expanded text-shadow
 *   background: mesh(#ff6b6b, #4ecdc4, #45b7d1) → multi-stop linear-gradient
 */
module.exports = (root) => {
  root.walkDecls('glass', (decl) => {
    const props = {}
    const blurMatch = decl.value.match(/blur\(([^)]+)\)/)
    const opacityMatch = decl.value.match(/opacity\(([^)]+)\)/)
    const colorMatch = decl.value.match(/color\(([^)]+)\)/)
    const borderMatch = decl.value.match(/border\(([^,]+),\s*([^)]+)\)/)

    if (blurMatch) props.blur = blurMatch[1]
    if (opacityMatch) props.opacity = parseFloat(opacityMatch[1])
    if (colorMatch) props.color = colorMatch[1]
    if (borderMatch) { props.borderWidth = borderMatch[1]; props.borderColor = borderMatch[2] }
    // Fix borderColor if it's missing closing paren (rgba)
    if (props.borderColor && props.borderColor.startsWith('rgba') && !props.borderColor.endsWith(')')) {
      props.borderColor += ')'
    }

    const color = props.color || 'rgba(255,255,255,0.15)'
    const alpha = isNaN(props.opacity) ? '0.85' : props.opacity

    // Build RGBA color from hex or named color
    const alphaColor = alpha !== 1 ? `rgba(255,255,255,${alpha})` : color
    const bgColor = color.startsWith('#') || color.startsWith('rgb') 
      ? color 
      : alphaColor

    const replacements = [
      `background: ${bgColor}`,
      `backdrop-filter: blur(${props.blur || '16px'})`,
      `-webkit-backdrop-filter: blur(${props.blur || '16px'})`,
    ]

    if (props.borderWidth && props.borderColor) {
      replacements.push(`border: ${props.borderWidth} solid ${props.borderColor}`)
    }

    decl.replaceWith(
      ...replacements.map((val) => decl.clone({ prop: val.split(':')[0].trim(), value: val.split(':')[1].trim() }))
    )
  })

  root.walkDecls('neon', (decl) => {
    const props = {}
    const colorMatch = decl.value.match(/color\(([^)]+)\)/)
    const radiusMatch = decl.value.match(/radius\(([^)]+)\)/)
    const intensityMatch = decl.value.match(/intensity\(([^)]+)\)/)

    if (colorMatch) props.color = colorMatch[1]
    if (radiusMatch) props.radius = parseFloat(radiusMatch[1])
    if (intensityMatch) props.intensity = parseFloat(intensityMatch[1])

    const color = props.color || 'cyan'
    const radius = props.radius || 4
    const intensity = props.intensity || 1

    const layers = []
    for (let i = intensity; i >= 1; i--) {
      layers.push(`0 0 ${radius * i}px ${color}`)
    }

    decl.replaceWith(
      decl.clone({ prop: 'text-shadow', value: layers.join(', ') })
    )
  })

  root.walkDecls(/^background$/, (decl) => {
    const meshMatch = decl.value.match(/^mesh\(([^)]+)\)/)
    if (meshMatch) {
      const colors = meshMatch[1].split(',').map((c) => c.trim()).filter((c) => !c.startsWith('angle:'))
      const angleMatch = decl.value.match(/angle:\s*([\d.]+(?:deg|turn)?)/)
      const angle = angleMatch ? angleMatch[1] : '135deg'
      const stops = colors.map((c, i) => `${c} ${(i / (colors.length - 1)) * 100}%`).join(', ')
      decl.replaceWith(
        decl.clone({ value: `linear-gradient(${angle}, ${stops})` })
      )
    }
  })
}
