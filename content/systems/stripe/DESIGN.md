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
  surface-1: '#f8fafd'
  surface-2: '#e5edf5'
  text-1: '#061b31'
  text-2: '#50617a'
  text-3: '#64748d'
  success: '#00d66f'
typography:
  fontFamily: 'sohne-var, "SF Pro Display", sans-serif'
  headingFamily: 'sohne-var, "SF Pro Display", sans-serif'
  baseSize: '16px'
  lineHeight: 1.4
  weight: 300
  headingWeight: 300
  scale:
    3xs: '9px'
    2xs: '10px'
    xs: '11px'
    sm: '12px'
    base: '16px'
    lg: '18px'
    xl: '20px'
    2xl: '22px'
    3xl: '26px'
    4xl: '28px'
    5xl: '32px'
    6xl: '48px'
  roles:
    body:
      fontFamily: 'sohne-var, "SF Pro Display", sans-serif'
      fontSize: '16px'
      fontWeight: 300
      lineHeight: 1.4
    body-sm:
      fontFamily: 'sohne-var, "SF Pro Display", sans-serif'
      fontSize: '12px'
      fontWeight: 300
      lineHeight: 1.45
    caption:
      fontFamily: 'sohne-var, "SF Pro Display", sans-serif'
      fontSize: '11px'
      fontWeight: 300
      lineHeight: 1.4
    caption-sm:
      fontFamily: 'sohne-var, "SF Pro Display", sans-serif'
      fontSize: '10px'
      fontWeight: 300
      lineHeight: 1.15
      letterSpacing: '0.1px'
    body-lg:
      fontFamily: 'sohne-var, "SF Pro Display", sans-serif'
      fontSize: '18px'
      fontWeight: 300
      lineHeight: 1.4
    lead:
      fontFamily: 'sohne-var, "SF Pro Display", sans-serif'
      fontSize: '20px'
      fontWeight: 300
      lineHeight: 1.2
      letterSpacing: '-0.2px'
    lead-lg:
      fontFamily: 'sohne-var, "SF Pro Display", sans-serif'
      fontSize: '22px'
      fontWeight: 300
      lineHeight: 1.1
      letterSpacing: '-0.22px'
    h2:
      fontFamily: 'sohne-var, "SF Pro Display", sans-serif'
      fontSize: '22px'
      fontWeight: 300
      lineHeight: 1.2
      letterSpacing: '-0.22px'
    h3:
      fontFamily: 'sohne-var, "SF Pro Display", sans-serif'
      fontSize: '22px'
      fontWeight: 300
      lineHeight: 1.1
      letterSpacing: '-0.22px'
    h4:
      fontFamily: 'sohne-var, "SF Pro Display", sans-serif'
      fontSize: '16px'
      fontWeight: 300
      lineHeight: 1.4
    button:
      fontFamily: 'sohne-var, "SF Pro Display", sans-serif'
      fontSize: '14px'
      fontWeight: 400
      lineHeight: 1
    link:
      fontFamily: 'sohne-var, "SF Pro Display", sans-serif'
      fontSize: '16px'
      fontWeight: 300
      lineHeight: 1.25
rounded:
  sm: '1px'
  md: '4px'
  lg: '5px'
  xl: '6px'
  button: '4px'
  pill: '100%'
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
  capturedAt: '2026-08-29T00:16:40.277Z'
  method: 'playwright/chromium 151.0.7922.34 computed styles @ 1440x900, 768x1024, 390x844 (light + dark)'
  harvestVersion: 3
  clusterVersion: 10
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

Three surface steps sit above white — `#f8fafd`, `#e5edf5`, `#d4dee9` — and
three text tiers below it at 17.37:1, 6.3:1 and 4.75:1. The palette is wide but
every step is shallow, which is why the page reads as calm rather than layered.

## Typography

One family, `sohne-var`, at 16px with a 1.4 line height and no tracking
adjustment. Body weight is 300 — noticeably lighter than most product UI, and
central to the character rather than incidental. Negative tracking appears only
at display sizes, tightening to `-0.22px` at 22px and `-0.64px` at 32px.

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
