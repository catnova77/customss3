# CustomSS3

> CSS3 superset — extensions for the modern web.

CustomSS3 extends CSS3 with practical, battle-tested features that reduce JavaScript dependency and make stylesheets more expressive.

## Features

| # | Feature | Status |
|---|---------|--------|
| 1 | **Container Query Enhancements** — `@container` with comparison operators, container-scoped variables, `cqmin`/`cqmax` units | Spec |
| 2 | **Responsive Range Syntax** — `500px <= width < 1024px`, `fluid()` shorthand, element-level responsive blocks | Spec |
| 3 | **Scroll-Driven Animations** — `animation-timeline: scroll()/view()`, scroll-progress states, visibility triggers | Spec |
| 4 | **Spring Physics Engine** — `spring(stiffness, damping, mass)` timing functions, physics-based keyframes | Spec |
| 5 | **OKLCH-Native Color System** — First-class `oklch()`, `color-mix()`, relative color adjust | Spec |
| 6 | **Typography Enhancements** — `fluid()` with breakpoint mapping, `text-wrap: balance(N)`, line-clamp standard | Spec |
| 7 | **Layout Shorthands** — Native masonry, grid syntax sugar, aspect-ratio extensions | Spec |
| 8 | **Visual Effect Factories** — `glass()`, `neon()`, `mesh()` gradient shorthand | Spec |
| 9 | **State & Interactions (Zero JS)** — `@toggle`, `@pointer` tracking, extended `@hover` | Spec |
| 10 | **Custom CSS Functions** — `@function` definitions, inline `if()` conditions | Spec |

## Packages

| Package | Description |
|---------|-------------|
| `postcss-customss3` | PostCSS plugin — the primary implementation |
| `spec` | Formal spec definitions for each feature |

## Usage

```bash
npm install postcss-customss3
```

```js
// postcss.config.js
module.exports = {
  plugins: [
    require('postcss-customss3')({
      features: ['container-queries', 'spring-physics', 'color-system']
    })
  ]
}
```

## Design Principles

1. **No new build tools** — PostCSS plugin or native-compatible syntax only
2. **Declarative first** — If CSS can do it, JS shouldn't have to
3. **Pragmatic** — Every feature solves a real pain point
4. **Backward compatible** — Valid CSS3 is valid CustomSS3

## License

MIT
