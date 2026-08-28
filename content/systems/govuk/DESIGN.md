---
name: 'Civic Sans'
version: '0.1.0'
description: 'Function-first public service design: zero ornament, zero radius, maximum contrast, unusually large body type.'
colors:
  background: '#ffffff'
  foreground: '#0b0c0c'
  card: '#f4f8fb'
  primary: '#0f7a52'
  primaryForeground: '#ffffff'
  border: '#cecece'
typography:
  fontFamily: '"GDS Transport", arial, sans-serif'
  headingFamily: '"GDS Transport", arial, sans-serif'
  baseSize: '19px'
  lineHeight: 1.32
  weight: 400
  headingWeight: 700
  scale:
    xs: '13.3333px'
    sm: '16px'
    base: '19px'
    lg: '24px'
    xl: '28.5px'
    2xl: '36px'
    3xl: '64px'
spacing:
  base: '5px'
  s1: '5px'
  s2: '6px'
  s3: '8px'
  s4: '10px'
  s5: '15px'
  s6: '16px'
  s7: '19px'
  s8: '20px'
  s9: '30px'
  s10: '60px'
components:
  button:
    background: '{colors.primary}'
    foreground: '{colors.primaryForeground}'
    radius: '0px'
  surface:
    background: '{colors.card}'
    border: '{colors.border}'
provenance:
  brand: 'GOV.UK'
  source: 'https://www.gov.uk/'
  capturedAt: '2026-08-28T22:47:12.097Z'
  method: 'playwright/chromium 151.0.7922.34 computed styles @ 1440x900'
  harvestVersion: 1
  clusterVersion: 4
---

## Overview

Public-service design optimised for being read by everyone, on anything,
including assistive technology and low-end hardware. Every decision trades
personality for legibility, on purpose.

Reach for this when the cost of a user failing to understand something is high.

## Colors

Near-black `#0b0c0c` on white at 19.59:1 — comfortably past AAA, and far beyond
what most systems attempt. The primary action green `#0f7a52` carries a white
label at 5.35:1.

There is no muted text tier at all. That absence is a design decision, not an
omission: hierarchy is carried by size and weight so that no information is
encoded in a lower-contrast grey.

Borders are `#cecece` at 1.57:1 and are purely decorative.

## Typography

`GDS Transport` at 19px — substantially larger than typical web body copy, and
the single most consequential choice in the system. Line height is 1.32, body
weight 400, headings 700.

The scale runs seven steps from 13.3px to 64px. The jump from body to the
largest heading is deliberately wide.

## Layout

A 5px base unit rather than the more common 4 or 8, obeyed by 76% of observed
spacing. The run is 5, 10, 15, 20, 30, 60.

## Elevation & Depth

No blur anywhere. Buttons carry a solid offset block —
`rgb(11, 12, 12) 0px 3px 0px 0px` — which reads as a physical edge rather than a
shadow, and stays visible in forced-colours mode.

## Shapes

No border radius. Not on buttons, not on inputs, not on panels. This is the
system's most recognisable trait.

## Components

Buttons are square, green-filled, with a white label and the solid offset edge.
Surfaces are plain white separated by rules.

## Do's and Don'ts

- **Do** keep body copy at 19px. Shrinking it to 16px breaks the system's
  central promise.
- **Do** carry hierarchy with size and weight.
- **Don't** round any corner. Sharpness is the identity.
- **Don't** add a muted grey text tier. Its absence is deliberate.
