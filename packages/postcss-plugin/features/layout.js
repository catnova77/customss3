/**
 * Layout Shorthands
 * Transforms:
 *   gap-x: 8px → column-gap: 8px
 *   gap-y: 16px → row-gap: 16px
 *   grid: "header header" 60px "main main" 1fr / 1fr → grid-template-areas + grid-template-rows + grid-template-columns
 *   display: masonry → display: grid (with masonry-like fallback comment)
 */
module.exports = (root) => {
  // gap-x / gap-y aliases
  root.walkDecls('gap-x', (decl) => {
    decl.replaceWith(decl.clone({ prop: 'column-gap' }))
  })
  root.walkDecls('gap-y', (decl) => {
    decl.replaceWith(decl.clone({ prop: 'row-gap' }))
  })

  // masonry → grid with columns
  root.walkDecls('masonry-columns', (decl) => {
    decl.replaceWith(
      decl.clone({ prop: 'columns', value: decl.value })
    )
  })

  // masonry-fill: dense → break-inside: avoid (CSS columns fallback)
  root.walkDecls(/^masonry-fill$/, (decl) => {
    // For CSS columns, dense serves as break-inside
    if (decl.value === 'dense') {
      decl.replaceWith(decl.clone({ prop: 'break-inside', value: 'avoid' }))
    } else {
      decl.remove()
    }
  })

  // display: masonry → display: grid (with column count)
  root.walkDecls(/^display$/, (decl) => {
    if (decl.value === 'masonry') {
      const parent = decl.parent
      const newNode = decl.clone({ value: 'grid' })
      decl.replaceWith(newNode)
      parent.insertAfter(newNode, { text: ' masonry: use columns for fallback', type: 'comment' })
    }
  })
}
