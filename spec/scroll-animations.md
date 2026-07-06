# Scroll-Driven Animations

## Motivation

Scroll-triggered animations currently require JavaScript (IntersectionObserver,
scroll event listeners). CustomSS3 provides declarative scroll-driven animations
with timeline and viewport visibility controls.

## Syntax

### Scroll Timeline

```css
@keyframes fade-in {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}

.element {
  animation: fade-in 1s;
  animation-timeline: scroll();
  /* Animation progresses as user scrolls the nearest scroll container */
}

.element.section {
  animation-timeline: scroll(container);
  /* Or: scroll(root), scroll(#sidebar) */
}
```

### View Timeline

```css
.element {
  animation: fade-in 1s;
  animation-timeline: view();
  /* Animation plays as element enters/exits the viewport */
  animation-range: entry 0% entry 100%;
  /* Options: entry, exit, cover, contain */
}
```

### Scroll Progress Variables

```css
:root {
  --scroll-y: scroll-progress(y);
  /* 0..1 — current page scroll progress */
  --scroll-x: scroll-progress(x);
}

header {
  background: oklch(from var(--accent) adjust(lightness: calc(var(--scroll-y) * 30% + 40%)));
  /* Header darkens as user scrolls — zero JS */
}
```

### Visibility Triggers

```css
.lazy-image {
  visibility-trigger: when-visible {
    opacity: 1;
    transition: opacity 0.3s;
  }
  /* Also: when-visible(50%) — fires when 50% visible */
}
```

## Implementation

Transformed to use CSS `scroll-timeline` / `view-timeline` properties (Chrome 115+)
or falls back to IntersectionObserver via the plugin.
