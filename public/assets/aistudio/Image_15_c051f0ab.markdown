---
name: AgriFly Precision Flight
colors:
  surface: '#0b1326'
  surface-dim: '#0b1326'
  surface-bright: '#31394d'
  surface-container-lowest: '#060e20'
  surface-container-low: '#131b2e'
  surface-container: '#171f33'
  surface-container-high: '#222a3d'
  surface-container-highest: '#2d3449'
  on-surface: '#dae2fd'
  on-surface-variant: '#bccac0'
  inverse-surface: '#dae2fd'
  inverse-on-surface: '#283044'
  outline: '#87948b'
  outline-variant: '#3d4a42'
  surface-tint: '#68dba9'
  primary: '#68dba9'
  on-primary: '#003825'
  primary-container: '#25a475'
  on-primary-container: '#00311f'
  inverse-primary: '#006c4a'
  secondary: '#ffb95f'
  on-secondary: '#472a00'
  secondary-container: '#ee9800'
  on-secondary-container: '#5b3800'
  tertiary: '#4cd7f6'
  on-tertiary: '#003640'
  tertiary-container: '#009eb9'
  on-tertiary-container: '#002f38'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#85f8c4'
  primary-fixed-dim: '#68dba9'
  on-primary-fixed: '#002114'
  on-primary-fixed-variant: '#005137'
  secondary-fixed: '#ffddb8'
  secondary-fixed-dim: '#ffb95f'
  on-secondary-fixed: '#2a1700'
  on-secondary-fixed-variant: '#653e00'
  tertiary-fixed: '#acedff'
  tertiary-fixed-dim: '#4cd7f6'
  on-tertiary-fixed: '#001f26'
  on-tertiary-fixed-variant: '#004e5c'
  background: '#0b1326'
  on-background: '#dae2fd'
  surface-variant: '#2d3449'
typography:
  display-lg:
    fontFamily: Manrope
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Manrope
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Manrope
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
  telemetry-numeral-lg:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '800'
    lineHeight: 28px
    letterSpacing: 0.02em
  telemetry-numeral-sm:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '700'
    lineHeight: 20px
    letterSpacing: 0.04em
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  label-caps:
    fontFamily: Hanken Grotesk
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.08em
  label-sm:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-tablet: 1.25rem
  margin: 1rem
  margin-tablet: 1.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1.25rem
  space-xl: 1.75rem
---

## Brand & Style

This design system is engineered for autonomous agricultural aviation, aerial spraying, and real-time field telemetry. It balances rugged utility with an elevated, high-precision avionics HUD aesthetic designed specifically for outdoor field operators working under unpredictable environmental conditions.

The visual style blends dark cockpit instrumentation with crisp, high-contrast data readouts. It prioritizes instant cognitive parsing, low visual fatigue during prolonged field sessions, and fail-safe tactile interactions for gloved or single-handed tablet/mobile operation. The aesthetic is industrial, structured, and modern—conveying mission-critical reliability and biological vitality through calibrated luminous accents over deep, light-absorbent slate foundations.

## Colors

The palette is tuned specifically for deep dark-mode field viability and maximum chromatic separation under outdoor light scatter.

- **Primary (`#059669` / Vivid Bio-Green):** Dictates normal operating parameters, active flight paths, healthy crop indexing, and positive mission execution states (Arm, Start, Resume).
- **Secondary (`#F59E0B` / Safety Amber):** Serves mission-critical warnings, low-battery thresholds, obstacle proximity, and immediate alert telemetry readouts.
- **Tertiary (`#06B6D4` / Aviation Cyan):** Dedicated to spatial vectoring, GPS waypoints, telemetry lines, RTK status, and drone orientation indicators.
- **Neutral Surface Palette:**
  - Base Canvas: Deep Obsidian Slate (`#0B0F19`)
  - Elevated Container / HUD Card: Dark Charcoal Slate (`#131B2E`)
  - Raised Interactive Surface: Structured Slate (`#1E293B`)
  - High-Contrast Border / Divider: Technical Muted Cyan-Slate (`#334155`)
  - Functional Accent Red (`#EF4444`): Dedicated exclusively to immediate Return-to-Home (RTH), emergency cutoffs, and sensor fault states.

## Typography

The typographic hierarchy balances structural authority with tabular, telemetry-grade scannability:

- **Manrope** anchors all high-level display values, critical flight metrics, and titles. Its geometric cuts maintain legibility when vibration or movement occurs in field conditions.
- **Hanken Grotesk** serves standard operational body copy, secondary readouts, and status notifications with high x-height and neutral clarity.
- **Tabular & Telemetry Figures:** All dynamic numerical indicators (altitude, ground speed, battery voltage, tank payload, NDVI values) must employ tabular numeral formatting (`tnum`) to eliminate layout jitter during high-frequency telemetry streaming.
- **Field Micro-Labels:** Key telemetry captions (e.g., `ALT`, `BAT`, `G-SPEED`, `FLOW`) use uppercase tracking to guarantee legibility at small scale over map overlays.

## Layout & Spacing

This design system uses a modular grid that adapts seamlessly between hand-held mobile devices and rugged tablet ground control stations (GCS).

- **Grid Architecture:** 4-column layout on compact mobile screens expanding to an 8-column layout on 7-to-10-inch rugged field tablets.
- **Touch Target Threshold:** All critical interaction touch zones strictly adhere to a minimum size of 48×48px (expanding to 56×56px for mission-abort and primary control targets) to accommodate single-hand and gloved operations.
- **HUD Edge Pinning:** Dynamic telemetry widgets dock to the screen corners and top notch boundaries with safe-area offsets, preserving a clear satellite map viewport in the central viewport.
- **Adaptive Layout Reflow:** On mobile viewports, secondary telemetry collapses into horizontal scrolling telemetry rails, whereas tablet viewports anchor side-docked split HUD cards.

## Elevation & Depth

Visual hierarchy does not rely on ambient diffused shadows, which wash out in high-ambient sunlight. Instead, spatial layering is achieved via high-contrast border definition and translucent tactical backplates:

- **Layer 0 (Base Map / Viewport):** Real-time satellite imagery, terrain topology, or NDVI vegetation heatmap overlays.
- **Layer 1 (HUD Underlay / Cards):** Semi-opaque tinted backdrop (`#131B2E` at 88% opacity) paired with hardware-accelerated background blur (`backdrop-filter: blur(12px)`) and a crisp `1px` inner technical border (`#334155`).
- **Layer 2 (Interactive Floating Controls):** Solid high-density slate (`#1E293B`) accented by structural state strokes (primary green or amber outline highlights).
- **Layer 3 (Modal Overlays / Critical Alert Sheets):** Opaque `#0F172A` with a distinct `2px` amber or red perimeter rule to indicate override status.

## Shapes

The design system employs a tight, structural radius architecture (`roundedness: 1`):

- **HUD Cards & Containers:** Standardized at 4px (`0.25rem`), projecting an avionics instrument chassis appearance.
- **Interactive Badges & Telemetry Pills:** Retain micro-beveled 4px radii rather than full organic capsules to reinforce the engineered, military-spec hardware design language.
- **Emergency / Primary Action Orbitals:** Circular floating action controls retain fixed aspect ratios with rigid 2px concentric rings to maintain visual distinction from standard data cards.

## Components

### Telemetry Pills & Badges
- Composed of an icon, an uppercase micro-label (`Hanken Grotesk`, `700`, uppercase), and a bold tabular value (`Manrope`).
- Surface: `#131B2E` with a `1px` border of `#334155`. When within optimal status, accent borders light up to `#059669`. When entering critical thresholds, borders and text dynamically shift to `#F59E0B` or `#EF4444`.

### Mission Floating Action Controls (FABs)
- **Primary Flight Controls:** 56×56px circular floating buttons with crisp iconography and high-contrast dual-tone states.
- **Arm / Mission Launch:** Solid `#059669` fill with `#FFFFFF` glyph and subtle concentric glow.
- **Return To Home (RTH):** Industrial safety hazard styling—`#EF4444` background with an internal tactile ring, requiring a deliberate press-and-hold (long-press confirmation with radial timer fill).

### Map HUD Overlays & Waypoint Navigators
- Positioned as floating, non-intrusive ribbons.
- Top Ribbon: Consolidated signal links (RTK lock, satellite count, transmitter RSSI, craft battery percentage, and remaining spray tank capacity).
- Bottom HUD Drawer: Swipeable field execution summary (target application rate L/ha, current flow rate, total area surveyed).

### NDVI Vegetation Spectrum Scale
- A specialized continuous gradient bar transitioning from Red (`#EF4444`, dead/stressed biomass) to Safety Gold (`#F59E0B`, moderate vigor) to Bio-Green (`#059669`, high vigor).
- Includes real-time pointer anchors that track sampling data directly beneath the aircraft crosshairs.

### Buttons & Rugged Toggles
- **Standard Buttons:** Boxy 4px radius with high-contrast text and a tactile active-state depression (0.98 scale compression on touch).
- **Flight Toggle Switches:** Segmented, mechanical-style sliding switches with a visible physical state indicator and high-contrast color fills for active and disarmed states.
- **Input Fields:** Flat dark slate inputs (`#131B2E`) framed with sharp `#334155` outlines, expanding with a luminous `#06B6D4` focus ring when entering navigation coordinates or spray rates.