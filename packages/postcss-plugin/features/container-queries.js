/**
 * Container Query Enhancements
 * Transforms: @container (width > 400px) → @container (min-width: 401px)
 */
module.exports = (root) => {
  root.walkAtRules('container', (rule) => {
    const params = rule.params
    // Transform comparison operators in container queries
    // width > 400px → min-width: 401px
    // 300px < width < 800px → min-width: 301px and max-width: 799px
    // width >= 50vw → min-width: 50vw
    // aspect-ratio < 1 → max-width: 0.999... (approximation)
    // aspect-ratio >= 0.5 → min-aspect-ratio: 0.5

    let newParams = params
    const gtMatch = params.match(/([\w-]+)\s*>\s*([\d.]+(\w+)?)/)
    if (gtMatch) {
      const val = parseFloat(gtMatch[2])
      const unit = gtMatch[3] || ''
      // For integer pixel values, add 1; for other units, it's approximate
      const newVal = unit === 'px' ? val + 1 : val
      newParams = newParams.replace(gtMatch[0], `min-${gtMatch[1]}: ${newVal}${unit}`)
    }

    const ltMatch = params.match(/([\w-]+)\s*<\s*([\d.]+(\w+)?)/)
    if (ltMatch) {
      const val = parseFloat(ltMatch[2])
      const unit = ltMatch[3] || ''
      const newVal = unit === 'px' ? val - 1 : val
      newParams = newParams.replace(ltMatch[0], `max-${ltMatch[1]}: ${newVal}${unit}`)
    }

    const gteMatch = params.match(/([\w-]+)\s*>=\s*([\d.]+(\w+)?)/)
    if (gteMatch) {
      newParams = newParams.replace(gteMatch[0], `min-${gteMatch[1]}: ${gteMatch[2]}`)
    }

    const lteMatch = params.match(/([\w-]+)\s*<=\s*([\d.]+(\w+)?)/)
    if (lteMatch) {
      newParams = newParams.replace(lteMatch[0], `max-${lteMatch[1]}: ${lteMatch[2]}`)
    }

    // Range: 300px < width < 800px
    const rangeMatch = params.match(/([\d.]+(\w+)?)\s*<\s*([\w-]+)\s*<\s*([\d.]+(\w+)?)/)
    if (rangeMatch) {
      const minVal = parseFloat(rangeMatch[1])
      const minUnit = rangeMatch[2] || ''
      const prop = rangeMatch[3]
      const maxVal = parseFloat(rangeMatch[4])
      const maxUnit = rangeMatch[5] || ''
      const newMin = minUnit === 'px' ? minVal + 1 : minVal
      const newMax = maxUnit === 'px' ? maxVal - 1 : maxVal
      newParams = `(min-${prop}: ${newMin}${minUnit}) and (max-${prop}: ${newMax}${maxUnit})`
    }

    if (newParams !== params) {
      rule.params = newParams
    }
  })
}
