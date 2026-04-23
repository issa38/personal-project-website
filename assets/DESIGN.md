---
name: Ceramic Noir
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#3a3939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#d2c3bd'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#9b8e88'
  outline-variant: '#4f4540'
  surface-tint: '#ddc1b4'
  primary: '#ddc1b4'
  on-primary: '#3e2c23'
  primary-container: '#a58c7f'
  on-primary-container: '#37261d'
  inverse-primary: '#6f5a4f'
  secondary: '#c8c6c5'
  on-secondary: '#313030'
  secondary-container: '#474746'
  on-secondary-container: '#b7b5b4'
  tertiary: '#c7c6c6'
  on-tertiary: '#303031'
  tertiary-container: '#919090'
  on-tertiary-container: '#292a2a'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#faddcf'
  primary-fixed-dim: '#ddc1b4'
  on-primary-fixed: '#271810'
  on-primary-fixed-variant: '#564239'
  secondary-fixed: '#e5e2e1'
  secondary-fixed-dim: '#c8c6c5'
  on-secondary-fixed: '#1c1b1b'
  on-secondary-fixed-variant: '#474746'
  tertiary-fixed: '#e3e2e2'
  tertiary-fixed-dim: '#c7c6c6'
  on-tertiary-fixed: '#1b1c1c'
  on-tertiary-fixed-variant: '#464747'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
typography:
  h1:
    fontFamily: Noto Serif
    fontSize: 48px
    fontWeight: '600'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  h2:
    fontFamily: Noto Serif
    fontSize: 32px
    fontWeight: '500'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  h3:
    fontFamily: Noto Serif
    fontSize: 24px
    fontWeight: '500'
    lineHeight: '1.3'
    letterSpacing: '0'
  body-lg:
    fontFamily: Manrope
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: 0.01em
  body-md:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: 0.01em
  label-caps:
    fontFamily: Manrope
    fontSize: 12px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: 0.1em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 64px
---

## Brand & Style

This design system is built upon the tactile and enduring quality of high-fired ceramic. It targets luxury markets, architectural showcases, and premium editorial platforms where a sense of weight and permanence is required. The aesthetic merges **Minimalism** with a **Tactile** sensibility, prioritizing the physical "feel" of digital elements.

The personality is quiet and grounded. Every interface element should feel like an object placed carefully on a matte surface. It avoids the fleeting nature of digital transparency in favor of solid, opaque masses. The emotional response is one of calm, deliberate focus and artisanal quality.

## Colors

The palette is monochromatic with a singular earth-toned accent. 
- **Obsidian (#0D0D0D):** The foundation. Used for the primary background to simulate a dark, light-absorbent workspace.
- **Deep Charcoal (#1A1A1A):** The surface color. Used for cards, navigation bars, and elevated elements.
- **Stoneware Grey (#757575):** The utility color. Reserved for borders, secondary text, and icons that should recede into the background.
- **Muted Clay (#A38A7E):** The focal point. This desaturated, warm accent color is used sparingly for primary actions, active states, and critical highlights.

All colors must maintain a matte finish; avoid using pure whites or high-vibrancy hues that would break the ceramic metaphor.

## Typography

The typographic hierarchy relies on the contrast between the intellectual, classic nature of Noto Serif and the functional clarity of Manrope. 

**Headlines** utilize Noto Serif to establish a premium, editorial voice. They should be set with tighter tracking to emphasize their structural silhouette. **Body text** utilizes Manrope for its balanced geometric proportions, ensuring legibility even against dark backgrounds. Use the **Label Caps** style for small metadata and navigational elements to provide a modern, structural counterpoint to the serif headlines.

## Layout & Spacing

This design system employs a **Fixed Grid** model centered within the viewport. This creates a sense of an "object" centered on a surface, avoiding the stretched look of fluid layouts which can feel thin and digital.

The spacing rhythm is built on an 8px base unit. High-density layouts should be avoided; instead, use generous margins and white space (or "dark space") to allow elements to breathe. Components should be grouped into distinct containers with wide gutters (24px) to reinforce the feeling of separate ceramic tiles or slabs.

## Elevation & Depth

Depth is conveyed through **Tonal Layers** and **Ambient Shadows** rather than traditional drop shadows. 

1.  **Base:** The Obsidian background is the "tabletop."
2.  **Raised:** Elements like cards use the Deep Charcoal surface color. They are elevated by soft, diffused shadows (Blur: 32px, Spread: -4px, Opacity: 40%) that mimic the way a thick clay slab casts a shadow on a matte surface.
3.  **Sunken:** Input fields and secondary containers use a subtle "inset" look, created by a 1px border slightly darker than the surface, suggesting a carved-out area.

Avoid all glows, blurs, or light-source-dependent highlights. The depth should feel soft and omnidirectional.

## Shapes

The shape language is defined by **Soft** corners. Ceramic edges are rarely sharp like glass, nor are they perfectly circular like plastic. 

A standard radius of 4px (`0.25rem`) is applied to most components to simulate a "softened" edge. Larger containers like cards may use up to 8px (`0.5rem`) to emphasize their physical volume. Buttons should remain rectangular with soft corners rather than using pill shapes, maintaining the architectural integrity of the layout.

## Components

- **Buttons:** Primary buttons use a solid Muted Clay fill with dark text. Secondary buttons are Deep Charcoal with a Stoneware Grey border. On hover, the shadow depth decreases slightly to simulate "pressing" the ceramic into the surface.
- **Chips:** Small, Deep Charcoal pills with Manrope labels. These act as low-priority tags and should not have shadows.
- **Input Fields:** Designed as "troughs." Use a solid Deep Charcoal background with a 1px bottom border in Muted Clay for the active state.
- **Cards:** The workhorse of the system. Cards must have a visible shadow and a padding of at least 32px to maintain the "premium" feel.
- **Checkboxes & Radios:** These should appear "stamped" into the UI. When selected, the Muted Clay accent fills the interior, appearing like a poured glaze.
- **Lists:** Items are separated by subtle Stoneware Grey dividers with 10% opacity, ensuring the list feels like a single cohesive slab.
- **Modals:** These are treated as heavy "over-slabs." They should have the most significant shadow depth and be centered with a 60% opacity Obsidian backdrop.