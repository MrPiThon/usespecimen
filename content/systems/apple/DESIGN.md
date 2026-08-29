---
name: 'Cupertino Minimal'
version: '0.1.0'
description: 'Product-page minimalism: near-white, SF Pro, one blue, and controls pilled at a 980px radius.'
categories:
  - e-commerce
  - marketing
colors:
  background: '#ffffff'
  foreground: '#1d1d1f'
  mutedForeground: '#707070'
  primary: '#0071e3'
  primaryForeground: '#ffffff'
  border: '#0066cc'
  text-1: '#000000'
  text-2: '#1d1d1f'
  text-3: '#474747'
  text-4: '#707070'
  warning: '#524617'
typography:
  fontFamily: '"SF Pro Text", "Myriad Set Pro", "SF Pro Icons", "Apple Legacy Chevron", "Helvetica Neue", Helvetica, Arial, sans-serif'
  headingFamily: '"SF Pro Display", "SF Pro Icons", "Helvetica Neue", Helvetica, Arial, sans-serif'
  baseSize: '12px'
  lineHeight: 1.33
  weight: 400
  headingWeight: 600
  letterSpacing: '-0.12px'
  scale:
    base: '12px'
    lg: '14px'
    xl: '17px'
    2xl: '19px'
    3xl: '21px'
    4xl: '24px'
    5xl: '28px'
    6xl: '32px'
    7xl: '34px'
    up-9: '40px'
    up-10: '48px'
    up-11: '56px'
  roles:
    body:
      fontFamily: '"SF Pro Text", "Myriad Set Pro", "SF Pro Icons", "Apple Legacy Chevron", "Helvetica Neue", Helvetica, Arial, sans-serif'
      fontSize: '12px'
      fontWeight: 400
      lineHeight: 1.33
      letterSpacing: '-0.12px'
    body-lg:
      fontFamily: '"SF Pro Text", "SF Pro Icons", "Helvetica Neue", Helvetica, Arial, sans-serif'
      fontSize: '14px'
      fontWeight: 400
      lineHeight: 1.43
      letterSpacing: '-0.224px'
    lead:
      fontFamily: '"SF Pro Text", "SF Pro Icons", "Helvetica Neue", Helvetica, Arial, sans-serif'
      fontSize: '17px'
      fontWeight: 400
      lineHeight: 1.24
      letterSpacing: '-0.374px'
    lead-lg:
      fontFamily: '"SF Pro Display", "SF Pro Icons", "Helvetica Neue", Helvetica, Arial, sans-serif'
      fontSize: '19px'
      fontWeight: 400
      lineHeight: 1.21
      letterSpacing: '0.228px'
    h1:
      fontFamily: '"SF Pro Text", "SF Pro Icons", "Helvetica Neue", Helvetica, Arial, sans-serif'
      fontSize: '34px'
      fontWeight: 600
      lineHeight: 1.47
      letterSpacing: '-0.374px'
    h2:
      fontFamily: '"SF Pro Display", "SF Pro Icons", "Helvetica Neue", Helvetica, Arial, sans-serif'
      fontSize: '56px'
      fontWeight: 600
      lineHeight: 1.07
      letterSpacing: '-0.28px'
    h3:
      fontFamily: '"SF Pro Display", "SF Pro Icons", "Helvetica Neue", Helvetica, Arial, sans-serif'
      fontSize: '32px'
      fontWeight: 600
      lineHeight: 1.13
      letterSpacing: '0.064px'
    link:
      fontFamily: '"SF Pro Text", "Myriad Set Pro", "SF Pro Icons", "Apple Legacy Chevron", "Helvetica Neue", Helvetica, Arial, sans-serif'
      fontSize: '12px'
      fontWeight: 400
      lineHeight: 1.33
      letterSpacing: '-0.12px'
rounded:
  sm: '8px'
  md: '980px'
  button: '980px'
  pill: '50%'
spacing:
  s1: '3px'
  s2: '4px'
  s3: '5px'
  s4: '8px'
  s5: '10px'
  s6: '11px'
  s7: '12px'
  s8: '13px'
  s9: '14px'
  s10: '15px'
components:
  button:
    background: '{colors.primary}'
    foreground: '{colors.primaryForeground}'
    radius: '{rounded.button}'
    padding: '0px 8px'
    hover:
      color: '#000000'
  surface:
    background: '{colors.background}'
    border: '{colors.border}'
  link:
    padding: '4px 20px 4px 0px'
    active:
      color: 'var(--sk-button-color-active, rgb(0, 0, 0))'
    focus:
      outlineColor: '#0071e3'
    focus-visible:
      color: '#000000'
    hover:
      color: '#000000'
provenance:
  brand: 'Apple'
  source: 'https://www.apple.com/'
  capturedAt: '2026-08-29T02:24:17.813Z'
  method: 'playwright/chromium 151.0.7922.34 computed styles @ 1440x900, 768x1024, 390x844 (light + dark)'
  harvestVersion: 4
  clusterVersion: 14
---

## Overview

Product-page minimalism: a white canvas, one blue, and controls pilled hard
enough that the radius reads as a shape rather than a corner treatment.

Use it when photography carries the page and the interface is only there to stay
out of the way.

## Colors

White canvas with `#1d1d1f` body copy at 16.83:1 — a near-black that is
deliberately not `#000000`, softening the page without costing contrast. The text
ladder runs `#000000`, `#1d1d1f`, `#474747`, `#707070`, ending at 4.94:1 just
above the AA floor.

The accent is `#0071e3` at 4.7:1, carrying white at the same ratio. Both clear AA
with very little room, which is a choice: this blue is tuned to be quiet.

The declared border colour is `#0066cc` — a *blue* border, measuring 5.57:1. That
is not a hairline; it is the link treatment, and the only place in the system
where a border carries meaning.

## Typography

SF Pro Text at 12px for the dominant body style, SF Pro Display at weight 600 for
headings — a genuine display/text optical pairing rather than one family scaled
up.

**A caveat worth stating.** 12px is small for body copy, and on a page that is
mostly imagery the most-typed style is legal and navigation text rather than
prose. Treat 17px or 19px from the scale as the reading size and 12px as the
chrome it actually is.

## Layout

**No spacing grid.** The best candidate explains 47.3% of observed values. The
run — 3, 4, 5, 8, 10, 11, 12, 13, 14, 15 — is dense and irregular, which is what
component-level tuning looks like when nothing is snapped to a step.

## Elevation & Depth

A single shadow, `rgba(0, 0, 0, 0.22) 3px 5px 30px`: wide, soft and offset
down-right. One shadow, used once, for the one thing that needs to float.

## Shapes

Two radii, 8px and **980px**. The 980 is a pill expressed as a number large
enough to always win, and it is the signature — every control is a capsule.

## Components

Buttons take `0px 8px` padding, links `4px 20px 4px 0px` — the trailing space on
links leaves room for the chevron that follows them. Hover, focus, focus-visible
and active are all declared on links.

## Do's and Don'ts

- **Do** pill everything interactive. The 980px radius is the identity.
- **Do** use `#1d1d1f` rather than black. The softening is deliberate.
- **Don't** treat 12px as your reading size — that measurement is chrome.
- **Don't** brighten the blue. At 4.7:1 it is tuned to sit quietly beside
  photography, and a louder blue changes what the page is for.
