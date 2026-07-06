const postcss = require('postcss')
const path = require('path')
const fs = require('fs')

const stylesPlugin = require('./index')
const effectsPlugin = require('./features/effects')

const inputFile = path.join(__dirname, '..', '..', 'examples', 'layout', 'demo-input.css')
const outputFile = path.join(__dirname, '..', '..', 'examples', 'layout', 'demo-output.css')

const css = fs.readFileSync(inputFile, 'utf-8')

console.log('╔══════════════════════════════════════════════════╗')
console.log('║        CustomSS3 — PostCSS Demo Run             ║')
console.log('╚══════════════════════════════════════════════════╝')
console.log('')
console.log('Input:  examples/layout/demo-input.css')
console.log('')

// Phase 1: Parse input, run effects plugin to collect snippets + modify selectors
const root = postcss.parse(css)
const snippets = effectsPlugin(root, postcss)

// Phase 2: Run main styles plugin (container queries, range, glass, layout)
const phase1Css = root.toString()
postcss([stylesPlugin()])
  .process(phase1Css, { from: inputFile })
  .then((result) => {
    let output = result.css

    // Phase 3: Append generated snippets (@keyframes, pseudo-elements, etc.)
    if (snippets.length) {
      output += '\n\n/* ═══════════════════════════════════════════ */'
      output += '\n/* CustomSS3 Effects — Generated Content       */'
      output += '\n/* ═══════════════════════════════════════════ */\n\n'
      output += snippets.join('\n\n')
      output += '\n'
    }

    fs.writeFileSync(outputFile, output)
    console.log('Output: examples/layout/demo-output.css')
    console.log('')
    console.log(output)
  })
  .catch((err) => {
    console.error('Error:', err.message)
    process.exit(1)
  })
