# Custom CSS Functions & Inline Conditions

## Motivation

CSS preprocessors (Sass, Less) support functions, but native CSS has no
equivalent. CustomSS3 adds user-definable `@function` and inline `if()`.

## Syntax

### @function

```css
@function tint($color, $amount) {
  @return mix($color, white, $amount);
}

@function shade($color, $amount) {
  @return mix($color, black, $amount);
}

.element {
  color: tint(var(--primary), 20%);
  background: shade(var(--surface), 10%);
}
```

### Inline if()

```css
.element {
  width: if(var(--container-width) > 600px, 50%, 100%);
  color: if(theme = dark, var(--text-light), var(--text-dark));
  padding: if(var(--viewport-width) < 480px, 12px, 24px);
}
```

### Built-in Functions

| Function | Description |
|----------|-------------|
| `clamp()` | Standard CSS — no change |
| `fluid()` | Typography/fluid value shorthand |
| `tint($c, $p)` | Mix with white |
| `shade($c, $p)` | Mix with black |
| `strip-unit($v)` | Remove unit from value |
| `em($px, $base: 16)` | px to em |
| `rem($px, $base: 16)` | px to rem |

## Implementation

`@function` is resolved at build time (PostCSS). `if()` currently requires
build-time resolution; runtime `if()` requires CSS `var()` placeholders
with fallback values. Built-in functions are always available.
