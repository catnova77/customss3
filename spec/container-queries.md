# Container Query Enhancements

## Motivation

Standard `@container` queries only support `min-width`/`max-width` syntax. CustomSS3 adds
comparison operators, container-scoped CSS variables, and extended container-relative units
for more expressive responsive layouts.

## Syntax

### Comparison Operators

```css
/* Standard */
@container (min-width: 400px) { }

/* CustomSS3 — ranges and comparisons */
@container (width > 400px) { }
@container (300px < width < 800px) { }
@container (width >= 50vw) { }
@container (aspect-ratio < 1) { }
```

### Container-Scoped Variables

```css
.container {
  container-scope: --card;
  /* Auto-injects: */
  /* --card-width:  <current container width>  */
  /* --card-height: <current container height> */
  /* --card-area:   <width * height>           */
}

@container --card (width > 400px) {
  .child {
    font-size: calc(1rem + var(--card-width) * 0.002);
  }
}
```

### Extended Units

| Unit | Description |
|------|-------------|
| `cqmin` | `min(cqi, cqb)` — smaller of inline/block |
| `cqmax` | `max(cqi, cqb)` — larger of inline/block |

## Implementation

PostCSS plugin transforms:

```css
/* Input */
@container (width > 400px) { }

/* Output */
@container (min-width: 401px) { }
```
