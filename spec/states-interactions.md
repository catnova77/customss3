# State & Interactions (Zero JS)

## Motivation

Many UI interactions (toggle, hover delay, pointer tracking) still require
JavaScript. CustomSS3 provides declarative state management.

## Syntax

### Toggle

```css
.menu {
  @toggle {
    state: closed;
    /* Initial state */
  }

  @toggle(open) {
    display: block;
    opacity: 1;
  }

  @toggle(closed) {
    display: none;
    opacity: 0;
  }
}

/* Trigger toggles via any element */
.toggle-btn {
  toggle-trigger: --menu-state;
  /* Clicking .toggle-btn toggles --menu-state between values */
}
```

### Pointer Tracking

```css
.card {
  --pointer-x: pointer-x();
  --pointer-y: pointer-y();
  /* These update as the mouse moves over the element */
}

.card::before {
  background: radial-gradient(
    circle at var(--pointer-x) var(--pointer-y),
    rgba(255,255,255,0.1),
    transparent 60%
  );
}
```

### Extended Hover

```css
.button {
  transition: all 0.2s;
}

.button:hover {
  hover-delay: 300ms;
  /* Hover effect activates after 300ms (prevents flash on accidental hover) */
}

.button:hover-out {
  hover-exit: 1000ms;
  /* Exit animation takes 1s */
}

/* Reactive hover — different zones */
.element {
  hover(x > 50%) { transform: translateX(10px); }
  hover(y < 30%) { opacity: 0.8; }
}
```

## Implementation

Toggle and pointer tracking use CSS custom property injection.
Where native CSS cannot express the interaction, a lightweight JS runtime
(~2KB) is optionally injected.
