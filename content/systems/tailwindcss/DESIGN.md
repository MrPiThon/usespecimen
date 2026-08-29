---
name: 'Utility Slate'
version: '0.1.0'
description: 'Documentation-first slate: near-black on off-white, a fuchsia accent, and the strictest spacing grid in this catalogue.'
categories:
  - developer-tools
  - docs
  - marketing
colors:
  background: '#f2f3f3'
  foreground: '#030712'
  card: '#ffffff'
  mutedForeground: '#4a5565'
  primary: '#f6339a'
  primaryForeground: '#030712'
  border: '#e6e7e8'
  surface-1: '#ecedee'
  surface-2: '#e6e7e8'
  surface-3: '#ffffff'
  surface-4: '#dadbdd'
  text-1: '#030712'
  text-2: '#3f424b'
  text-3: '#4a5565'
  text-4: '#6a7282'
  success: '#004f3b'
  warning: '#432004'
  danger: '#441306'
  dark-background: '#030712'
  dark-foreground: '#ffffff'
  dark-card: '#10131e'
  dark-mutedForeground: '#99a1af'
  dark-primary: '#0f0919'
  dark-primaryForeground: '#ffffff'
  dark-border: '#1c202a'
typography:
  fontFamily: 'inter, "inter Fallback", system-ui'
  headingFamily: 'inter, "inter Fallback", system-ui'
  baseSize: '14px'
  lineHeight: 2
  weight: 400
  headingWeight: 500
  scale:
    xs: '12px'
    sm: '13px'
    base: '14px'
    lg: '16px'
    xl: '17px'
    2xl: '18px'
    3xl: '20px'
    4xl: '24px'
    5xl: '30px'
    6xl: '36px'
    7xl: '40px'
    up-9: '48px'
  roles:
    body:
      fontFamily: 'inter, "inter Fallback", system-ui'
      fontSize: '14px'
      fontWeight: 400
      lineHeight: 2
    body-sm:
      fontFamily: 'inter, "inter Fallback", system-ui'
      fontSize: '12px'
      fontWeight: 400
      lineHeight: 1.33
    body-lg:
      fontFamily: 'inter, "inter Fallback", system-ui'
      fontSize: '16px'
      fontWeight: 400
      lineHeight: 1.75
    lead:
      fontFamily: 'inter, "inter Fallback", system-ui'
      fontSize: '18px'
      fontWeight: 500
      lineHeight: 1.56
    lead-lg:
      fontFamily: 'inter, "inter Fallback", system-ui'
      fontSize: '20px'
      fontWeight: 500
      lineHeight: 2
    h1:
      fontFamily: 'inter, "inter Fallback", system-ui'
      fontSize: '36px'
      fontWeight: 500
      lineHeight: 1.11
      letterSpacing: '-1.8px'
    h2:
      fontFamily: 'inter, "inter Fallback", system-ui'
      fontSize: '40px'
      fontWeight: 500
      lineHeight: 1
      letterSpacing: '-2px'
    h3:
      fontFamily: 'inter, "inter Fallback", system-ui'
      fontSize: '36px'
      fontWeight: 600
      lineHeight: 1.33
    button:
      fontFamily: 'inter, "inter Fallback", system-ui'
      fontSize: '12px'
      fontWeight: 400
      lineHeight: 1.67
    link:
      fontFamily: 'inter, "inter Fallback", system-ui'
      fontSize: '14px'
      fontWeight: 400
      lineHeight: 2
    mono:
      fontFamily: 'plexMono, "plexMono Fallback", monospace'
      fontSize: '13px'
      fontWeight: 400
      lineHeight: 1.85
rounded:
  sm: '4px'
  md: '8px'
  lg: '12px'
  xl: '16px'
  2xl: '32px'
  button: '4px'
  pill: '3.35544e+07px'
spacing:
  base: '8px'
  s1: '4px'
  s2: '8px'
  s3: '10px'
  s4: '12px'
  s5: '16px'
  s6: '24px'
  s7: '32px'
  s8: '36px'
  s9: '40px'
  s10: '44px'
components:
  button:
    background: '{colors.primary}'
    foreground: '{colors.primaryForeground}'
    radius: '{rounded.button}'
    padding: '4px 8px'
    hover:
      backgroundColor: 'rgba(255, 255, 255, 0.1)'
  surface:
    background: '{colors.card}'
    border: '{colors.border}'
  link:
    padding: '16px 8px'
    hover:
      backgroundColor: 'rgba(3, 7, 18, 0.024)'
provenance:
  brand: 'Tailwind CSS'
  source: 'https://tailwindcss.com/'
  capturedAt: '2026-08-29T02:23:31.415Z'
  method: 'playwright/chromium 151.0.7922.34 computed styles @ 1440x900, 768x1024, 390x844 (light + dark)'
  harvestVersion: 4
  clusterVersion: 14
---

## Overview

Documentation-first, and tuned for long reading rather than for a landing page.
The canvas is off-white, the type is small, and the leading is enormous.

Reach for this when people will be scanning reference material for hours.

## Colors

An off-white `#f2f3f3` canvas with `#030712` body copy at 18.08:1. Choosing a
canvas a few points off white is what keeps a documentation site from glaring.

The text ladder runs four steps — `#030712`, `#3f424b`, `#4a5565`, `#6a7282` —
from 18.08:1 down to 4.34:1. The surface ladder runs the other way, through
`#ecedee`, `#e6e7e8` and `#dadbdd` up to pure `#ffffff` for raised cards. White
as the *elevated* surface on an off-white page is a neat inversion.

The accent is the fuchsia `#f6339a` at 3.22:1 against the canvas. That passes the
3:1 required of a UI component and does **not** pass the 4.5:1 required of text,
which is exactly how it is used.

Borders are `#e6e7e8` at 1.11:1 — separation only.

## Typography

Inter at 14px with a line height of **2.0**. Small type with doubled leading is
the whole readability strategy: the measure stays short, the lines stay far
apart, and a long reference page stops being a wall.

Eleven roles, including distinct `button` and `mono` styles.

## Layout

An 8px grid, obeyed by 76.8% of observed spacing, and the only 8px system in this
catalogue — everything else here with a grid is on 4. The run is 4, 8, 10, 12,
16, 24, 32, 36, 40, 44.

## Elevation & Depth

Five declared shadows, most resolving to transparent. Depth comes from the
surface ladder — white cards on an off-white page — rather than from shadow.

## Shapes

Radii of 4, 8, 12, 16 and 32px, with buttons at the smallest step.

## Components

Buttons are padded `4px 8px` at 4px radius. Links take `16px 8px`, which is
vertical-heavy because they are stacked in navigation rather than sitting inline.
Only hover is declared.

## Do's and Don'ts

- **Do** keep the line height at 2.0. It is the single decision that makes this
  work for documentation.
- **Do** keep the canvas off-white and reserve pure white for raised surfaces.
- **Don't** set body text in the fuchsia. At 3.22:1 it is a UI colour, and using
  it for prose fails AA.
- **Don't** move to a 4px grid because it is more common. The 8px step is what
  gives the reference pages their rhythm.
