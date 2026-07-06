const features = {
  'container-queries': require('./features/container-queries'),
  'spring-physics': require('./features/spring-physics'),
  'color-system': require('./features/color-system'),
  'typography': require('./features/typography'),
  'layout': require('./features/layout'),
  'visual-effects': require('./features/visual-effects'),
  'states-interactions': require('./features/states-interactions'),
  'custom-functions': require('./features/custom-functions'),
}

module.exports = (opts = {}) => {
  const enabled = opts.features || Object.keys(features)

  return {
    postcssPlugin: 'postcss-customss3',
    Once(root) {
      for (const name of enabled) {
        if (features[name]) {
          features[name](root)
        }
      }
    }
  }
}

module.exports.postcss = true
