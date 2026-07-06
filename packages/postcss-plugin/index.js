const features = {
  'container-queries': require('./features/container-queries'),
  'responsive-range': require('./features/responsive-range'),
  'visual-effects': require('./features/visual-effects'),
  'layout': require('./features/layout'),
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
