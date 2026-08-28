---
name: 'Indigo Infrastructure'
version: '0.1.0'
description: 'High-trust developer commerce: near-white canvas, deep navy prose, one saturated indigo doing all the persuading.'
colors:
  background: '#ffffff'
  foreground: '#061b31'
  card: '#e5edf5'
  mutedForeground: '#50617a'
  primary: '#533afd'
  primaryForeground: '#ffffff'
  border: '#e5edf5'
typography:
  fontFamily: 'sohne-var, "SF Pro Display", sans-serif'
  headingFamily: 'sohne-var, "SF Pro Display", sans-serif'
  baseSize: '16px'
  lineHeight: 1.4
  weight: 300
  headingWeight: 300
  letterSpacing: '-0.22px'
  scale:
    4xs: '8px'
    3xs: '9px'
    2xs: '10px'
    xs: '12px'
    sm: '14px'
    base: '16px'
    lg: '18px'
    xl: '20px'
    2xl: '22px'
    3xl: '26px'
    4xl: '32px'
    5xl: '48px'
rounded:
  sm: '4px'
  md: '5px'
  lg: '6px'
  xl: '8px'
  button: '4px'
  pill: '9999px'
spacing:
  base: '4px'
  s1: '4px'
  s2: '6px'
  s3: '8px'
  s4: '10px'
  s5: '12px'
  s6: '16px'
  s7: '24px'
  s8: '32px'
  s9: '40px'
  s10: '64px'
components:
  button:
    background: '{colors.primary}'
    foreground: '{colors.primaryForeground}'
    radius: '{rounded.button}'
  surface:
    background: '{colors.card}'
    border: '{colors.border}'
provenance:
  brand: 'Stripe'
  source: 'https://stripe.com/'
  capturedAt: '2026-08-28T22:47:09.750Z'
  method: 'playwright/chromium 151.0.7922.34 computed styles @ 1440x900'
  harvestVersion: 1
  clusterVersion: 2
---

## Overview

A restraint-first aesthetic for financial and developer products. Almost the
entire surface is white; almost all the type is one deep navy. A single
saturated indigo carries every call to action, and because nothing else on the
page competes with it, it does not need to be loud.

Use this when the product must read as trustworthy and technical at once.

## Colors

The canvas is pure white and body copy is `#061b31`, a navy that measures
17.37:1 against it — far past AA. A second tier at `#50617a` handles secondary
copy at 6.3:1 and does the work a grey would do in a less considered system.

The indigo `#533afd` appears only on interactive fills, never as body text. Its
white label sits at 6.19:1.

Borders are `#e5edf5` at 1.18:1 against the canvas. That is decorative
separation, not a meaningful boundary, and it should not be asked to carry
information on its own.

## Typography

One family, `sohne-var`, at 16px with a 1.4 line height and `-0.22px`
tracking. Body weight is 300 — noticeably lighter than most product UI, and
central to the character rather than incidental.

The scale runs twelve steps from 8px to 48px. Headings share the body family
and weight; hierarchy comes from size, not from a heavier cut.

## Layout

A 4px grid, obeyed by 79% of observed spacing values. The common run is
4, 8, 12, 16, 24, 32, 40, 64.

## Elevation & Depth

Shadows are wide, soft and tinted blue rather than neutral:
`rgba(50, 50, 93, 0.12) 0px 16px 32px`. Depth signals hierarchy here, not
physical material — nothing looks embossed.

## Shapes

A 4px radius by default, 6px on larger panels, 8px at the top end. Pill shapes
appear, but only on badges and small status chips.

## Components

Buttons take the indigo fill, a white label and the 4px radius. Surfaces use the
pale `#e5edf5` tint with the same colour as their border.

## Do's and Don'ts

- **Do** keep the indigo scarce. It reads as confident because it is rare.
- **Do** preserve the 300 body weight; raising it to 400 loses the character.
- **Don't** use the border colour to carry meaning. At 1.18:1 it is invisible to
  many readers and fails non-text contrast.
- **Don't** introduce a second accent hue. This system has exactly one.
