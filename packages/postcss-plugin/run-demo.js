const postcss = require('postcss')
const path = require('path')
const fs = require('fs')

const plugin = require('./index')

const inputFile = path.join(__dirname, '..', '..', 'examples', 'layout', 'demo-input.css')
const outputFile = path.join(__dirname, '..', '..', 'examples', 'layout', 'demo-output.css')

const css = fs.readFileSync(inputFile, 'utf-8')

console.log('╔══════════════════════════════════════════════════╗')
console.log('║        CustomSS3 — PostCSS Demo Run             ║')
console.log('╚══════════════════════════════════════════════════╝')
console.log('')
console.log('Input:  examples/layout/demo-input.css')
console.log('')
console.log('Processing...')
console.log('')

postcss([plugin()])
  .process(css, { from: inputFile, to: outputFile })
  .then((result) => {
    fs.writeFileSync(outputFile, result.css)
    console.log('Output: examples/layout/demo-output.css')
    console.log('')
    console.log('Result:')
    console.log(result.css)
    console.log('')
    if (result.warnings().length) {
      console.log('Warnings:')
      result.warnings().forEach((w) => console.log('  ⚠', w.toString()))
    }
  })
  .catch((err) => {
    console.error('Error:', err.message)
    process.exit(1)
  })
