# Spring Physics Engine

## Motivation

CSS `cubic-bezier()` and `linear()` can approximate spring motion, but the parameters
are unintuitive. CustomSS3 adds a `spring()` timing function with physically meaningful
parameters: stiffness, damping, and mass.

## Syntax

```css
.element {
  transition: transform 0.5s spring(200, 20);
  /* stiffness: 200, damping: 20, mass: 1 (default) */
}

.element.heavy {
  transition: transform 0.5s spring(200, 20, 3);
  /* mass: 3 — slower, more bouncy */
}

/* Animation keyframes */
@keyframes bounce-in {
  from {
    transform: scale(0);
    animation-physics: spring(300, 15);
  }
  to {
    transform: scale(1);
  }
}
```

## Parameters

| Param | Default | Description |
|-------|---------|-------------|
| `stiffness` | 100 | Spring tension. Higher = faster return |
| `damping` | 10 | Resistance. Higher = less bounce |
| `mass` | 1 | Object mass. Higher = slower, more momentum |

## iOS Spring Equivalents

| iOS Spring | CustomSS3 |
|------------|-----------|
| `defaultSpring` | `spring(200, 20)` |
| `spring(damping: 15, response: 0.3)` | `spring(250, 15)` |

## Implementation

Converted to a `linear()` easing function via numerical simulation
(Runge-Kutta integration of spring physics ODE).
