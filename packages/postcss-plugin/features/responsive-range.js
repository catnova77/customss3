/**
 * Responsive Range Syntax
 * Transforms:
 *   @media (500px <= width < 1024px) → @media (min-width: 500px) and (max-width: 1023px)
 *   @media (width >= 1400px) → @media (min-width: 1400px)
 *   @media (width < 480px) → @media (max-width: 479px)
 *   @media (width > 768px) → @media (min-width: 769px)
 */
module.exports = (root) => {
  root.walkAtRules('media', (rule) => {
    let params = rule.params.trim()

    // Range: 500px <= width < 1024px
    const rangeLteMatch = params.match(
      /\(?([\d.]+(\w+)?)\s*<=\s*([\w-]+)\s*<\s*([\d.]+(\w+)?)\)?/
    )
    if (rangeLteMatch) {
      const minVal = parseFloat(rangeLteMatch[1])
      const minUnit = rangeLteMatch[2] || ''
      const prop = rangeLteMatch[3]
      const maxVal = parseFloat(rangeLteMatch[4])
      const maxUnit = rangeLteMatch[5] || ''
      const newMax = maxUnit === 'px' ? maxVal - 1 : maxVal
      params = `(min-${prop}: ${minVal}${minUnit}) and (max-${prop}: ${newMax}${maxUnit})`
    }

    // Single comparisons
    // width >= 1400px
    const gteMatch = params.match(/([\w-]+)\s*>=\s*([\d.]+(\w+)?)/)
    if (gteMatch && !rangeLteMatch) {
      params = params.replace(gteMatch[0], `min-${gteMatch[1]}: ${gteMatch[2]}`)
    }

    // width <= 768px
    const lteMatch = params.match(/([\w-]+)\s*<=\s*([\d.]+(\w+)?)/)
    if (lteMatch && !rangeLteMatch) {
      params = params.replace(lteMatch[0], `max-${lteMatch[1]}: ${lteMatch[2]}`)
    }

    // width > 768px → min-width: 769px
    const gtMatch = params.match(/([\w-]+)\s*>\s*([\d.]+(\w+)?)/)
    if (gtMatch && !rangeLteMatch) {
      const val = parseFloat(gtMatch[2])
      const unit = gtMatch[3] || ''
      const newVal = unit === 'px' ? val + 1 : val
      params = params.replace(gtMatch[0], `min-${gtMatch[1]}: ${newVal}${unit}`)
    }

    // width < 480px → max-width: 479px
    const ltMatch = params.match(/([\w-]+)\s*<\s*([\d.]+(\w+)?)/)
    if (ltMatch && !rangeLteMatch) {
      const val = parseFloat(ltMatch[2])
      const unit = ltMatch[3] || ''
      const newVal = unit === 'px' ? val - 1 : val
      params = params.replace(ltMatch[0], `max-${ltMatch[1]}: ${newVal}${unit}`)
    }

    if (params !== rule.params.trim()) {
      rule.params = params
    }
  })
}
