# Responsive Range Syntax

## Motivation

Media queries require repetitive declarations and unintuitive nested syntax.
CustomSS3 provides mathematical range syntax and element-level responsive blocks.

## Syntax

### Range Comparison

```css
/* Standard */
@media (min-width: 500px) and (max-width: 1023px) { }

/* CustomSS3 */
@media (500px <= width < 1024px) { }
@media (width >= 1400px) { }
@media (width < 480px) { }
```

### Element-Level Responsive Blocks

```css
.element {
  /* Base styles */
  font-size: 1rem;

  responsive: {
    (width > 768px) {
      font-size: 1.25rem;
      display: flex;
    }
    (width > 1200px) {
      font-size: 1.5rem;
    }
  }
}

/* Equivalent to — without the selector duplication */
/* @media (min-width: 769px) { .element { font-size: 1.25rem; ... } } */
```

### Property-Level Responsive Values

```css
.element {
  width: responsive(100%, 480px: 50%, 768px: 33%);
  /* 100% default, 50% at 480px+, 33% at 768px+ */
  padding: responsive(12px, 768px: 24px, 1200px: 32px);
}
```

## Implementation

PostCSS transforms `responsive()` to media query blocks.
Range operators (`<=`, `<`, `>`, `>=`) are mapped to `min-width`/`max-width`.
