---
name: Organic Atmospheric
colors:
  surface: '#121413'
  surface-dim: '#121413'
  surface-bright: '#383a38'
  surface-container-lowest: '#0d0f0e'
  surface-container-low: '#1a1c1b'
  surface-container: '#1e201f'
  surface-container-high: '#282a29'
  surface-container-highest: '#333534'
  on-surface: '#e2e3e0'
  on-surface-variant: '#c3c8c5'
  inverse-surface: '#e2e3e0'
  inverse-on-surface: '#2f3130'
  outline: '#8d928f'
  outline-variant: '#434846'
  surface-tint: '#bec9c4'
  primary: '#bec9c4'
  on-primary: '#28332f'
  primary-container: '#1a2421'
  on-primary-container: '#818c87'
  inverse-primary: '#56615d'
  secondary: '#bdcca1'
  on-secondary: '#283415'
  secondary-container: '#404d2c'
  on-secondary-container: '#afbe94'
  tertiary: '#c1c9be'
  on-tertiary: '#2b322b'
  tertiary-container: '#1c241d'
  on-tertiary-container: '#838c82'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#dae5e0'
  primary-fixed-dim: '#bec9c4'
  on-primary-fixed: '#141e1b'
  on-primary-fixed-variant: '#3e4945'
  secondary-fixed: '#d9e9bb'
  secondary-fixed-dim: '#bdcca1'
  on-secondary-fixed: '#141f04'
  on-secondary-fixed-variant: '#3e4b2a'
  tertiary-fixed: '#dde5da'
  tertiary-fixed-dim: '#c1c9be'
  on-tertiary-fixed: '#161d17'
  on-tertiary-fixed-variant: '#414941'
  background: '#121413'
  on-background: '#e2e3e0'
  surface-variant: '#333534'
typography:
  display-lg:
    fontFamily: EB Garamond
    fontSize: 64px
    fontWeight: '500'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: EB Garamond
    fontSize: 40px
    fontWeight: '500'
    lineHeight: '1.2'
  headline-lg-mobile:
    fontFamily: EB Garamond
    fontSize: 32px
    fontWeight: '500'
    lineHeight: '1.2'
  headline-md:
    fontFamily: EB Garamond
    fontSize: 28px
    fontWeight: '400'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-sm:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 8px
  gutter: 32px
  margin-desktop: 64px
  margin-mobile: 24px
  container-max: 1280px
---

## Brand & Style
The design system is rooted in the concept of "Atmospheric Minimalism"—a blend of high-end editorial aesthetics and organic textures. It is designed to evoke a sense of calm, steady authority, making it ideal for high-density dashboards that require focus or resumes that need to convey sophisticated professionalism. 

The visual mood is "Stormy and Grounded," utilizing the depth of forest tones and the clarity of glass-like surfaces to create an immersive experience. It avoids the clinical coldness of traditional SaaS by introducing natural textures and a high-contrast typographic hierarchy.

## Colors
This design system operates primarily in a dark mode palette to mimic the "stormy" aesthetic. 
- **Primary:** A deep, near-black Forest Green used for background surfaces and containers.
- **Secondary:** A muted Moss Green used for call-to-actions, success states, and subtle accents.
- **Tertiary:** A Storm Gray used for borders and secondary text elements.
- **Surface:** The neutral charcoal provides the base layer, while the deep greens are used to create "wells" or elevated card surfaces. 
- **Accents:** Use low-opacity versions of Moss Green for hover states and selection highlights to maintain a soft, organic feel.

## Typography
The system employs a sophisticated "Architectural Mix." 
- **EB Garamond** (Serif) is reserved for high-level storytelling: page titles, section headers, and prominent quotes. It should be typeset with slightly tighter tracking in large sizes to feel more editorial.
- **Hanken Grotesk** (Sans-serif) handles all functional interface elements, body copy, and data metrics. Its sharp, contemporary geometry provides a necessary foil to the romanticism of the serif.
- For dashboards, use **Label-sm** for table headers and small data points to ensure legibility against dark backgrounds.

## Layout & Spacing
The layout follows a **Fixed Grid** philosophy to maintain an editorial "magazine" feel. 
- Use a 12-column grid for desktop with wide 32px gutters to give content room to breathe.
- **Rhythm:** All spacing (padding, margins) should be multiples of 8px.
- **Dashboard Layout:** Use a sidebar-navigation model where the sidebar is a solid deep-forest green (#1A2421) and the main content area is a slightly lighter charcoal (#121413).
- **Resume/Metrics:** Centered content containers with wide gutters are preferred to maintain focus.

## Elevation & Depth
Depth in this design system is achieved through **Glassmorphism** and tonal stacking rather than heavy shadows.
- **Backdrop Blur:** Use 12px to 20px blurs on modal overlays and navigation bars to simulate the effect of looking through a rain-streaked window.
- **Tonal Layers:** Surfaces closer to the user are lighter. The base is #121413; cards are #1A2421.
- **Ghost Borders:** Instead of shadows, use 1px solid borders at 10% white opacity to define edges. This maintains a "flat-but-deep" architectural look.
- **Rainy Texture:** In marketing or resume headers, use a low-opacity photographic overlay of rain on glass to reinforce the brand mood.

## Shapes
The shape language is **Soft (0.25rem)**. This slight rounding takes the "edge" off the brutalist tendencies of the dark palette while maintaining the precision expected in a metrics-driven dashboard. 
- Large containers (cards) may use `rounded-lg` (0.5rem) to feel more like physical objects.
- Buttons and input fields must strictly follow the `rounded-sm` (0.25rem) rule to remain professional and sharp.

## Components
- **Buttons:** Primary buttons use a solid Moss Green (#8C9B73) background with dark text. Secondary buttons are "ghost" style with a 1px border of Moss Green.
- **Cards:** Cards should have no background shadow. Instead, use a subtle gradient from top-left to bottom-right (Primary Green to Charcoal) and a faint border.
- **Data Visuals:** For metrics/charts, use Moss Green for primary data lines and Fog Gray for grid lines. Avoid vibrant colors (red/yellow) unless absolutely necessary for alerts; prefer tonal shifts for status.
- **Inputs:** Fields should be dark with only a bottom-border highlight in Moss Green when focused, creating a minimalist, elegant interaction.
- **Chips/Labels:** Small, rectangular chips with a slight 10% opacity background of the label's color to keep them unobtrusive.