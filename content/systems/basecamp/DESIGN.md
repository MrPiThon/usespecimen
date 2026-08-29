---
name: 'Calm Sage'
version: '0.1.0'
description: 'Deliberately unhurried: a sage-tinted canvas, a rem-scaled type ramp, and a blue that only ever means action.'
categories:
  - saas
  - marketing
colors:
  background: '#f5faf6'
  foreground: '#29353c'
  primary: '#2377d2'
  primaryForeground: '#29353c'
  text-1: '#29353c'
  warning: '#ffdc74'
  danger: '#dd5942'
  success: '#19874d'
  dark-background: '#0b151b'
  dark-foreground: '#e1e5e8'
  dark-card: '#20292e'
  dark-primary: '#2377d2'
  dark-primaryForeground: '#e1e5e8'
typography:
  fontFamily: 'Graphik, sans-serif'
  headingFamily: 'Graphik, sans-serif'
  baseSize: '14px'
  lineHeight: 1.5
  weight: 400
  headingWeight: 600
  letterSpacing: '-0.2625px'
  scale:
    3xs: '9px'
    2xs: '11px'
    xs: '12px'
    sm: '13.333px'
    base: '14px'
    lg: '15.2381px'
    xl: '17.1432px'
    2xl: '19.0483px'
    3xl: '27px'
    4xl: '30px'
    5xl: '38.0952px'
    6xl: '41.9054px'
  roles:
    body:
      fontFamily: 'Graphik, sans-serif'
      fontSize: '14px'
      fontWeight: 400
      lineHeight: 1.5
      letterSpacing: '-0.2625px'
    body-sm:
      fontFamily: 'Graphik, sans-serif'
      fontSize: '13.33px'
      fontWeight: 600
      lineHeight: 1.3
      letterSpacing: '-0.149996px'
    caption:
      fontFamily: 'Graphik, sans-serif'
      fontSize: '11px'
      fontWeight: 400
      lineHeight: 1.5
      letterSpacing: '-0.20625px'
    caption-sm:
      fontFamily: 'Graphik, sans-serif'
      fontSize: '9px'
      fontWeight: 600
      lineHeight: 1.3
      letterSpacing: '-0.10125px'
    body-lg:
      fontFamily: 'Graphik, sans-serif'
      fontSize: '15.24px'
      fontWeight: 400
      lineHeight: 1.5
      letterSpacing: '-0.285714px'
    lead:
      fontFamily: 'Graphik, sans-serif'
      fontSize: '17.14px'
      fontWeight: 400
      lineHeight: 1.5
      letterSpacing: '-0.285714px'
    lead-lg:
      fontFamily: 'Graphik, sans-serif'
      fontSize: '19.05px'
      fontWeight: 400
      lineHeight: 1.5
      letterSpacing: '-0.357156px'
    h1:
      fontFamily: 'Graphik, sans-serif'
      fontSize: '30px'
      fontWeight: 600
      lineHeight: 1.15
      letterSpacing: '-0.675px'
    h2:
      fontFamily: 'Graphik, sans-serif'
      fontSize: '27px'
      fontWeight: 600
      lineHeight: 1.15
      letterSpacing: '-0.6075px'
    link:
      fontFamily: 'Graphik, sans-serif'
      fontSize: '14px'
      fontWeight: 600
      lineHeight: 1.5
      letterSpacing: '-0.2625px'
rounded:
  sm: '3.575px'
  md: '4.125px'
  lg: '4.95238px'
  xl: '5.5px'
  2xl: '7.61904px'
  button: '4.125px'
  pill: '100%'
spacing:
  s1: '4px'
  s2: '7px'
  s3: '8px'
  s4: '10px'
  s5: '14px'
  s6: '20px'
  s7: '27px'
  s8: '28px'
  s9: '38px'
  s10: '66px'
components:
  button:
    background: '{colors.primary}'
    foreground: '{colors.primaryForeground}'
    radius: '{rounded.button}'
    focus:
      color: '#ffffff'
      backgroundColor: '#0465be'
    hover:
      color: '#ffffff'
      backgroundColor: '#0465be'
  surface:
    background: '{colors.background}'
    border: '{colors.foreground}'
  link:
    padding: '12.1905px 14.4762px'
    focus:
      color: '#29353c'
      textDecorationColor: '#29353c'
    hover:
      color: '#29353c'
      textDecorationColor: '#29353c'
provenance:
  brand: 'Basecamp'
  source: 'https://basecamp.com/'
  capturedAt: '2026-08-29T02:25:37.646Z'
  method: 'playwright/chromium 151.0.7922.34 computed styles @ 1440x900, 768x1024, 390x844 (light + dark)'
  harvestVersion: 4
  clusterVersion: 14
---

## Overview

A sage-tinted canvas, generous type, and an unhurried rhythm that comes partly
from having no spacing grid at all. The palette is almost entirely one text
colour and one blue.

Use it where calm matters more than density.

## Colors

The canvas is `#f5faf6` — white with a green cast, doing more work than its
subtlety suggests. Body copy is `#29353c` at 11.92:1: a blue-grey rather than a
black, softer than the near-blacks most systems reach for.

There is **one** text tier. No muted grey qualified, so none is declared —
hierarchy here is carried by size and weight instead.

The accent is `#2377d2`, at 4.29:1 against the canvas. State colours are declared
and unusually saturated for so calm a palette: `#ffdc74` warning, `#dd5942`
danger, `#19874d` success.

**One accessibility finding, stated rather than smoothed over.** The observed
label colour on the accent measures **2.78:1**, which fails AA for text. Either
the label needs to be lighter or the blue needs to be darker; reproducing that
pairing as measured would ship a real problem.

## Typography

Graphik at 14px with a 1.5 line height and `-0.2625px` tracking. The tracking is
the tell: it is not a round number because the whole scale is derived in rems
from a fractional root, and the sizes follow — 13.333, 15.2381, 17.1432, 19.0483,
38.0952, 41.9054.

That is a modular scale computed rather than chosen, so reproducing it means
reproducing the ratio, not the rounded pixels.

## Layout

**No spacing grid.** The best candidate base explains only 40.9% of observed
values, the loosest in this catalogue. The run is 4, 7, 8, 10, 14, 20, 27, 28,
38, 66 — spacing here follows the type scale rather than a grid.

## Elevation & Depth

Five shadows, authored in `oklch` and largely inset.
`oklch(0 0 0 / 0.1125) 0px 0px 0px 1px inset` is a hairline drawn as a shadow
rather than as a border, which is why no border colour was observed anywhere.

## Shapes

Fractional radii — 3.575, 4.125, 4.95238, 5.5 and 7.61904px — for the same reason
the type sizes are fractional. Buttons sit at 4.125px.

## Components

Only hover and focus are declared, on buttons and links alike. No border token
exists in the system at all.

## Do's and Don'ts

- **Do** tint the canvas. `#f5faf6` rather than `#ffffff` is most of the calm.
- **Do** derive the scale in rems rather than copying the fractional pixels.
- **Don't** ship the accent's label pairing as measured — 2.78:1 fails AA.
- **Don't** add a muted text tier. This system genuinely has one text colour.
- **Don't** impose a spacing grid. It does not have one, and adding it would
  regularise exactly what makes it feel unhurried.
