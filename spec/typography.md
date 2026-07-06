# Typography Enhancements

## Motivation

Responsive typography requires manual `clamp()` calculations. Text balancing
and line-clamping are either missing or require non-standard properties.

## Syntax

### Fluid Typography

```css
.element {
  /* fluid(minSize, maxSize, [minViewport, maxViewport]) */
  font-size: fluid(1rem, 2rem);
  /* expands to: clamp(1rem, 1rem + 1vw, 2rem) */

  font-size: fluid(1rem@320px, 2rem@1200px);
  /* explicit breakpoint mapping */
}

.heading {
  font-size: fluid(1.5rem@320px, 3rem@1400px);
  line-height: fluid(1.3, 1.1);
}
```

### Text Balance

```css
.element {
  text-wrap: balance(3);
  /* Balance text across at most 3 lines */
  /* Falls back to text-wrap: pretty */
}
```

### Line Clamp

```css
.card-text {
  line-clamp: 3;
  /* Standard property */
}
```

### Font Stack Generator

```css
@font-stack system {
  /* Generates optimized fallback stacks */
  font-family: system;
  /* -> -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, ... */
}

@font-stack mono {
  font-family: mono;
  /* -> 'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Consolas', monospace */
}
```

## Implementation

PostCSS resolves `fluid()` and `text-wrap: balance(N)` at build time.
`line-clamp` passes through as standard CSS (already supported in modern browsers).
