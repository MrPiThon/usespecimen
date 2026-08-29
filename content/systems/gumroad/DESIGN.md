---
name: 'Marketplace Pink'
version: '0.1.0'
description: 'Flat pink on warm off-white, a 20px body size, and fully rounded controls.'
categories:
  - e-commerce
  - marketing
colors:
  background: '#f4f4f0'
  foreground: '#000000'
  primary: '#ff90e8'
  primaryForeground: '#000000'
  border: '#d1d5dc'
  text-1: '#000000'
  warning: '#ffc900'
  danger: '#dc341e'
  dark-background: '#242423'
  dark-foreground: '#ffffff'
  dark-primary: '#ff90e8'
  dark-primaryForeground: '#000000'
  dark-border: '#717170'
typography:
  fontFamily: '"ABC Favorit"'
  headingFamily: '"ABC Favorit"'
  baseSize: '20px'
  lineHeight: 1.63
  weight: 500
  headingWeight: 500
  letterSpacing: '-0.4px'
  scale:
    2xs: '14px'
    xs: '16px'
    sm: '18px'
    base: '20px'
    lg: '24px'
    xl: '30px'
    2xl: '36px'
    3xl: '48px'
    4xl: '60px'
    5xl: '72px'
    6xl: '96px'
    7xl: '128px'
  roles:
    body:
      fontFamily: '"ABC Favorit"'
      fontSize: '20px'
      fontWeight: 500
      lineHeight: 1.63
      letterSpacing: '-0.4px'
    body-sm:
      fontFamily: '"ABC Favorit"'
      fontSize: '18px'
      fontWeight: 400
      lineHeight: 1.56
      letterSpacing: '-0.4px'
    caption:
      fontFamily: '"ABC Favorit"'
      fontSize: '16px'
      fontWeight: 400
      lineHeight: 1.63
      letterSpacing: '-0.4px'
    caption-sm:
      fontFamily: '"ABC Favorit"'
      fontSize: '14px'
      fontWeight: 400
      lineHeight: 1.43
      letterSpacing: '-0.4px'
    body-lg:
      fontFamily: '"ABC Favorit"'
      fontSize: '24px'
      fontWeight: 400
      lineHeight: 1.33
      letterSpacing: '-0.4px'
    lead:
      fontFamily: '"ABC Favorit"'
      fontSize: '30px'
      fontWeight: 400
      lineHeight: 1.2
      letterSpacing: '-0.4px'
    h1:
      fontFamily: '"ABC Favorit"'
      fontSize: '36px'
      fontWeight: 500
      lineHeight: 1.11
      letterSpacing: '-0.4px'
    h2:
      fontFamily: '"ABC Favorit"'
      fontSize: '36px'
      fontWeight: 400
      lineHeight: 1.11
      letterSpacing: '-0.4px'
    h3:
      fontFamily: '"ABC Favorit"'
      fontSize: '18px'
      fontWeight: 700
      lineHeight: 1.56
      letterSpacing: '-0.4px'
    button:
      fontFamily: 'Arial'
      fontSize: '16px'
      fontWeight: 400
      lineHeight: 1.5
    link:
      fontFamily: '"ABC Favorit"'
      fontSize: '24px'
      fontWeight: 500
      lineHeight: 1.33
      letterSpacing: '-0.4px'
rounded:
  sm: '4px'
  md: '16px'
  lg: '24px'
  button: '3.35544e+07px'
  pill: '3.35544e+07px'
spacing:
  base: '4px'
  s1: '4px'
  s2: '6px'
  s3: '8px'
  s4: '12px'
  s5: '16px'
  s6: '24px'
  s7: '32px'
  s8: '40px'
  s9: '48px'
  s10: '64px'
layout:
  measure: '540px'
  sectionSpacing: '96px'
  gridColumns: 2
  sectionWidth: 'mixed'
  sectionMedia: 'text-led'
  sectionCopy: 'moderate'
  heroHeight: '177vh'
motion:
  duration: '0.15s'
  easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
components:
  button:
    background: '{colors.primary}'
    foreground: '{colors.primaryForeground}'
    radius: '{rounded.button}'
    padding: '0px 24px'
    borderWidth: '1px'
    focus:
      outlineColor: 'rgba(0, 0, 0, 0)'
  surface:
    background: '{colors.background}'
    border: '{colors.border}'
  link:
    padding: '8px 16px'
    borderWidth: '1px'
    hover:
      boxShadow: '0 0 #0000,0 0 #0000,0 0 #0000,0 0 #0000,0 0 #0000'
provenance:
  brand: 'Gumroad'
  source: 'https://gumroad.com/'
  capturedAt: '2026-08-29T04:56:01.515Z'
  method: 'playwright/chromium 151.0.7922.34 computed styles @ 1440x900, 768x1024, 390x844 (light + dark)'
  harvestVersion: 8
  clusterVersion: 17
  screenshot: './source.webp'
  screenshotDark: './source-dark.webp'
---

## Overview

Flat pink on warm off-white, a 20px body size, fully rounded controls and no
depth of any kind. Nothing on this page casts a shadow or carries a gradient.

Reach for this when the interface should feel like printed matter — bold, flat
and unfussy.

## Colors

`#f4f4f0` — warm off-white, not white — under `#000000` at **19.05:1**. The
accent is `#ff90e8`, a bright pink filling controls that carry **black labels**.

`warning` is `#ffc900` and `danger` `#dc341e`, both fully saturated. This
palette does not do subtle.

**No muted tier was found**: no secondary text colour was quiet and desaturated
enough to qualify, so the role is omitted rather than filled with a link colour.
The text ramp has exactly one step.

## Typography

**ABC Favorit at 20px**/1.63, weight **500** for body — a large, medium-weight
body size, which is why the page reads as confident rather than dense. Tracking
is `-0.4px`. Headings are the same face at the same weight.

The scale is long and doubles cleanly at the top: 14, 16, 18, 20, 24, 30, 36,
48, 60, 72, 96, **128**.

## Layout

**A 4px base unit** explaining **99%** of observed spacing — the strictest grid
in this registry.

A **540px measure**, which is narrow, and a hero measured at 1.77 viewports
carrying no headline — the page opens on chrome rather than on a statement.
**Neither figure is strongly evidenced**; treat the measure and hero as
indicative and check them against the live page.

**Section composition: mixed width, text-led, moderate copy**, a median of 172
characters a section.

## Elevation & Depth

**No box-shadow anywhere. No background image, gradient or pattern anywhere.**

The canvas is flat colour and nothing lifts off it. In a system this bold, the
absence of depth is the point: contrast does the separating.

## Shapes

Radii of 4, 16 and 24px, with buttons **fully rounded** — the browser reports
`3.35544e+07px`, which is what a "round it as far as it goes" declaration
serialises to. That ugly string is the observed value.

## Components

Buttons take `0px 24px` padding with a 1px border; links `8px 16px`, also
bordered, across 108 elements. Borders on both is the system: controls are
outlined shapes, not fills with soft edges.

`text:focus` sets `border-color: #ff90e8` — the pink used as a focus indicator.

**Motion is 0.15s** on `cubic-bezier(0.4, 0, 0.2, 1)`, across 106 controls.

## Do's and Don'ts

- **Do** keep the off-white. `#f4f4f0` against `#000000` is warmer than white
  and it matters.
- **Do** put black on the pink.
- **Do** hold the 4px grid; at 99% it is effectively absolute.
- **Do** outline controls. Borders on both buttons and links are the shape
  language.
- **Don't** add shadows or gradients. This system has none at all, and adding
  depth would make it a different design.
- **Don't** shrink the 20px body. The size is the confidence.

**What this file does not constrain:** page structure, which was only weakly
measurable here, and content.
