---
name: 'Studio Bright'
version: '0.1.0'
description: 'White canvas, black type, 2px corners, and a green found only on a section fill.'
categories:
  - saas
  - marketing
colors:
  background: '#ffffff'
  foreground: '#000000'
  card: '#f5f5f5'
  mutedForeground: '#757575'
  primary: '#24cb71'
  border: '#d6d6d6'
  text-1: '#000000'
  text-2: '#757575'
typography:
  fontFamily: 'figmaSans, "figmaSans Fallback", "SF Pro Display", system-ui, helvetica, sans-serif'
  headingFamily: 'figmaSans, "figmaSans Fallback", "SF Pro Display", system-ui, helvetica, sans-serif'
  baseSize: '24px'
  lineHeight: 1.2
  weight: 400
  headingWeight: 400
  letterSpacing: '-0.66px'
  scale:
    xs: '12px'
    sm: '14px'
    base: '16px'
    lg: '18px'
    xl: '22px'
    2xl: '24px'
    3xl: '30px'
    4xl: '32px'
    5xl: '36px'
    6xl: '44px'
    7xl: '56px'
    up-9: '72px'
  roles:
    body:
      fontFamily: 'figmaSans, "figmaSans Fallback", "SF Pro Display", system-ui, helvetica, sans-serif'
      fontSize: '24px'
      fontWeight: 400
      lineHeight: 1.2
      letterSpacing: '-0.66px'
    body-sm:
      fontFamily: 'figmaSans, "figmaSans Fallback", "SF Pro Display", system-ui, helvetica, sans-serif'
      fontSize: '22px'
      fontWeight: 320
      lineHeight: 1.35
      letterSpacing: '-0.11px'
    caption:
      fontFamily: 'figmaSans, "figmaSans Fallback", "SF Pro Display", system-ui, helvetica, sans-serif'
      fontSize: '18px'
      fontWeight: 330
      lineHeight: 1.4
    caption-sm:
      fontFamily: 'figmaSans, "figmaSans Fallback", "SF Pro Display", system-ui, helvetica, sans-serif'
      fontSize: '16px'
      fontWeight: 400
      lineHeight: 1.4
    body-lg:
      fontFamily: 'figmaSans, "figmaSans Fallback", "SF Pro Display", system-ui, helvetica, sans-serif'
      fontSize: '30px'
      fontWeight: 400
      lineHeight: 1.2
      letterSpacing: '-0.66px'
    lead:
      fontFamily: 'figmaSans, "figmaSans Fallback", "SF Pro Display", system-ui, helvetica, sans-serif'
      fontSize: '32px'
      fontWeight: 400
      lineHeight: 1.1
      letterSpacing: '-0.66px'
    h1:
      fontFamily: 'figmaSans, "figmaSans Fallback", "SF Pro Display", system-ui, helvetica, sans-serif'
      fontSize: '36px'
      fontWeight: 400
      lineHeight: 1
      letterSpacing: '-1.25px'
    h2:
      fontFamily: 'figmaSans, "figmaSans Fallback", "SF Pro Display", system-ui, helvetica, sans-serif'
      fontSize: '32px'
      fontWeight: 400
      lineHeight: 1.1
      letterSpacing: '-0.66px'
    h3:
      fontFamily: 'figmaSans, "figmaSans Fallback", "SF Pro Display", system-ui, helvetica, sans-serif'
      fontSize: '16px'
      fontWeight: 400
      lineHeight: 1.4
    button:
      fontFamily: 'figmaSans, "figmaSans Fallback", "SF Pro Display", system-ui, helvetica, sans-serif'
      fontSize: '16px'
      fontWeight: 400
      lineHeight: 1.45
    mono:
      fontFamily: 'figmaMono, "figmaMono Fallback", "SF Mono", menlo, monospace'
      fontSize: '16px'
      fontWeight: 400
      lineHeight: 1.3
      letterSpacing: '0.64px'
rounded:
  sm: '2px'
  md: '4px'
  lg: '8px'
  xl: '16px'
  2xl: '24px'
  button: '2px'
  pill: '9999px'
spacing:
  s1: '2px'
  s2: '4px'
  s3: '6px'
  s4: '8px'
  s5: '12px'
  s6: '16px'
  s7: '24px'
  s8: '32px'
  s9: '40px'
  s10: '70px'
elevation:
  shadow-1: 'oklch(0 0 none / 0.16) 0px 0px 0px 1px inset'
  shadow-2: 'oklch(0 0 none / 0.16) 0px 1px 0px 0px'
layout:
  measure: '1360px'
  sectionSpacing: '80px'
  gridColumns: 2
  navHeight: '78px'
  navPosition: 'fixed'
  sectionWidth: 'full-bleed'
  sectionMedia: 'text-led'
  sectionCopy: 'moderate'
  heroHeight: '96vh'
  heroHeadingSize: '56px'
  heroAlign: 'left'
motion:
  duration: '0.18s'
  easing: 'ease-out'
components:
  button:
    background: '{colors.primary}'
    radius: '{rounded.button}'
    padding: '8px'
  surface:
    background: '{colors.card}'
    border: '{colors.border}'
  link:
    padding: '0px 6px'
    focus:
      color: '#000000'
      backgroundColor: '#e4ff97'
      outlineColor: '#000000'
    focus-visible:
      color: '#000000'
      backgroundColor: '#e4ff97'
      outlineColor: '#000000'
provenance:
  brand: 'Figma'
  source: 'https://www.figma.com/'
  capturedAt: '2026-08-29T04:55:24.465Z'
  method: 'playwright/chromium 151.0.7922.34 computed styles @ 1440x900, 768x1024, 390x844 (light + dark)'
  harvestVersion: 8
  clusterVersion: 17
  screenshot: './source.webp'
---

## Overview

White canvas, pure black type, 2px corners, and a green that exists only on a
section fill. A fixed nav over full-bleed sections and a 56px left-aligned
headline.

Reach for this when the tool is colourful and the marketing around it should not
be.

## Colors

`#000000` on `#ffffff` at **21:1** — the maximum — with a muted tier at
`#757575` (4.59:1), surfaces at `#f5f5f5` and borders at `#d6d6d6`.

The accent `#24cb71` was taken from a **recurring coloured surface**, because
this page has no styled control, no focus ring and no chromatic text to read one
from. It is a section fill, not a button colour. Given how many colours this
brand uses elsewhere, treat a single measured accent with suspicion.

Much of this page's colour is authored in `oklch()` with a **missing hue
component** — values like `oklch(0 0 none / 0.16)` — which is a real and
increasingly common way to write a neutral.

## Typography

**figmaSans at 24px**/1.2 with `-0.66px` tracking, weight 400 for both body and
headings.

**Read 24px as lead size, not body.** This is a display-heavy marketing page and
24px is simply the size that sets the most text on it; the scale's 16px step is
the reading size. Thirteen sizes collapsed to twelve.

The scale runs 12, 14, 16, 18, 22, 24, 30, 32, 36, 44, 56, 72.

## Layout

**No spacing grid** — the best candidate explains 72% of observed values, just
under the threshold.

A **1360px measure** behind a **78px fixed** nav. The hero is 0.96 viewports
with a **56px left-aligned** headline.

**Section composition: full-bleed, text-led, moderate copy**, a median of 183
characters a section.

## Elevation & Depth

Hairlines rather than shadows: `oklch(0 0 none / 0.16) 0 0 0 1px inset` on seven
elements and the same colour as a `0 1px 0` bottom rule on three. Both are rules
drawn as shadows.

**No background image, gradient or pattern anywhere.** The canvas is flat.

## Shapes

Radii of 2, 4, 8, 16 and 24px with **buttons at 2px** — very nearly square — and
a `50%` pill for circular controls.

## Components

Buttons take `8px` padding; links `0px 6px` at a **50%** radius. Button states
are declared for `hover`, `focus-visible` and `active`, though their values
resolve through CSS variables this capture could not follow, so they are omitted
rather than published as references.

**Motion is 0.18s ease-out.**

## Do's and Don'ts

- **Do** keep corners at 2px. Near-square is the shape decision.
- **Do** use pure black on pure white. This system does not soften either end.
- **Don't** treat 24px as body size; take 16px from the scale.
- **Don't** build a brand around `#24cb71`. It was measured on one section fill,
  and this capture found no other chromatic evidence on the page.

**What this file does not constrain:** section content, and the state styles
whose values were unresolvable references.
