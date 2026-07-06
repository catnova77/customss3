# OKLCH-Native Color System

## Motivation

CSS Color Level 4 introduced `oklch()` and `oklab()`, but the syntax is verbose.
CustomSS3 provides shorthand, color mixing presets, and relative color adjustment
for practical day-to-day use.

## Syntax

### Shorthand OKLCH

```css
/* Standard */
color: oklch(50% 0.15 180);

/* CustomSS3 shorthand (when standard is too verbose) */
--primary: oklch(50% 0.15 180);
--primary-light: adjust(--primary, lightness: +20%);
--primary-muted: adjust(--primary, chroma: -0.05);
```

### Color Mixing

```css
.element {
  color: mix(red, blue, 30%);
  /* 30% red + 70% blue in OKLCH space */
  background: mix(var(--surface), var(--primary), 15%);
}
```

### Relative Color Adjustment

```css
:root {
  --brand: oklch(55% 0.18 25);
  --brand-hover: from var(--brand) adjust(lightness: +8%);
  --brand-pressed: from var(--brand) adjust(lightness: -5%, chroma: +0.02);
  --brand-muted: from var(--brand) adjust(chroma: -0.08, hue: +15);
}

/* Accessibility */
--brand-on-dark: from var(--brand) adjust(lightness: 85%);
```

## Implementation

PostCSS plugin resolves `mix()` and `adjust()` at build time, outputting
standard `oklch()` or `color-mix()` CSS.
