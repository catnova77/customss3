# Layout Shorthands

## Motivation

CSS Grid and Flexbox are powerful but verbose. Masonry layout still requires
a polyfill or column-based hacks.

## Syntax

### Native Masonry

```css
.gallery {
  display: masonry;
  masonry-fill: dense;
  masonry-columns: 3;
  /* Or: masonry-columns: 250px (auto-fit min column width) */
  gap: 16px;
}
```

### Grid Shorthands

```css
/* Grid syntax sugar */
.grid {
  grid: repeat(3, 1fr) / auto-rows;
  /* Same as:
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: auto-rows;
  */
}

/* Named grid areas in one line */
.layout {
  grid:
    "header header header" 60px
    "sidebar main   aside" 1fr
    "footer footer footer" 40px
    / 200px 1fr 200px;
}
```

### Aspect-Ratio Extensions

```css
.element {
  aspect-ratio: auto(4/3);
  /* Maintains 4:3 ratio but overrides if content is larger */
}
```

### Gap Shorthand Aliases

```css
/* Column/row gap in one */
.element {
  gap: 16px 8px;  /* row-gap column-gap — standard already */
  gap-x: 8px;     /* column-gap alias */
  gap-y: 16px;    /* row-gap alias */
}
```

## Implementation

PostCSS sugar transforms. Masonry uses CSS columns as fallback where
native `display: masonry` is not supported.
