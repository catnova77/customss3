# Visual Effect Factories

## Motivation

Common visual effects like glassmorphism, neon glow, and mesh gradients require
multiple CSS declarations. CustomSS3 provides single-line shorthand.

## Syntax

### Glass

```css
.glass-panel {
  glass: blur(16px) opacity(0.85) color(#fff);
  /* Expands to:
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
  */
}

.glass-dark {
  glass: blur(12px) opacity(0.8) color(#0a0a0a) border(1px, rgba(255,255,255,0.08));
}
```

### Neon Glow

```css
.neon-text {
  neon: color(cyan) radius(4px) intensity(2);
  /* Expands to multiple text-shadow layers */
}

.neon-box {
  neon: color(magenta) radius(8px) spread(2px);
  /* Applies box-shadow glow */
}
```

### Mesh Gradient

```css
.element {
  background: mesh(#ff6b6b, #4ecdc4, #45b7d1);
  /* Generates a multi-stop gradient with smooth interpolation */
  /* Option: mesh(#ff6b6b, #4ecdc4, #45b7d1, angle: 120deg) */

  /* Conic steps */
  background: conic(#ff6b6b, #4ecdc4, #45b7d1, #ff6b6b, steps: 8);
}
```

## Implementation

PostCSS plugin generates the expanded CSS at build time. `mesh()` uses
a perceptually-uniform interpolation path (OKLCH).
