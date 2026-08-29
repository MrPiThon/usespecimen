---
name: 'Canvas Black'
version: '0.1.0'
description: 'Pure #000000 with white type and a blue focus ring. Dark-only, sparse copy, and no CSS motion at all.'
categories:
  - saas
  - portfolio
  - marketing
colors:
  background: '#000000'
  foreground: '#ffffff'
  card: '#111111'
  mutedForeground: '#999999'
  primary: '#0099ff'
  border: '#0f0f0f'
  surface-1: '#111111'
  surface-2: '#171717'
  text-1: '#ffffff'
  text-2: '#cccccc'
  text-3: '#999999'
  success: '#00bb88'
typography:
  fontFamily: '"Inter Variable", "Inter Variable Placeholder", sans-serif'
  headingFamily: '"GT Walsheim Medium", "GT Walsheim Medium Placeholder", sans-serif'
  baseSize: '18px'
  lineHeight: 1.35
  weight: 400
  headingWeight: 500
  letterSpacing: '-0.2px'
  scale:
    3xs: '7px'
    2xs: '10px'
    xs: '12px'
    sm: '13px'
    base: '14px'
    lg: '15px'
    xl: '16px'
    2xl: '18px'
    3xl: '28px'
    4xl: '36px'
    5xl: '44px'
    6xl: '54px'
  roles:
    body:
      fontFamily: '"Inter Variable", "Inter Variable Placeholder", sans-serif'
      fontSize: '18px'
      fontWeight: 400
      lineHeight: 1.35
      letterSpacing: '-0.2px'
    body-sm:
      fontFamily: '"Inter Variable", "Inter Variable Placeholder", sans-serif'
      fontSize: '14px'
      fontWeight: 400
      lineHeight: 1
      letterSpacing: '-0.14px'
    caption:
      fontFamily: 'Inter, "Inter Placeholder", sans-serif'
      fontSize: '13px'
      fontWeight: 500
      lineHeight: 1.6
    caption-sm:
      fontFamily: 'Inter, "Inter Placeholder", sans-serif'
      fontSize: '12px'
      fontWeight: 500
      lineHeight: 1.4
    h1:
      fontFamily: '"GT Walsheim Medium", "GT Walsheim Medium Placeholder", sans-serif'
      fontSize: '36px'
      fontWeight: 500
      lineHeight: 1
      letterSpacing: '-1.44px'
    h2:
      fontFamily: '"GT Walsheim Medium", "GT Walsheim Medium Placeholder", sans-serif'
      fontSize: '28px'
      fontWeight: 500
      lineHeight: 1.1
      letterSpacing: '-1.12px'
    h3:
      fontFamily: '"Inter Variable", "Inter Variable Placeholder", sans-serif'
      fontSize: '18px'
      fontWeight: 400
      lineHeight: 1.35
      letterSpacing: '-0.2px'
    h4:
      fontFamily: '"GT Walsheim Medium", "GT Walsheim Medium Placeholder", sans-serif'
      fontSize: '54px'
      fontWeight: 500
      lineHeight: 0.8
      letterSpacing: '-2.16px'
    h6:
      fontFamily: '"Inter Variable", "Inter Variable Placeholder", sans-serif'
      fontSize: '18px'
      fontWeight: 400
      lineHeight: 1.35
      letterSpacing: '-0.2px'
    link:
      fontFamily: 'Inter, "Inter Placeholder", sans-serif'
      fontSize: '14px'
      fontWeight: 400
      lineHeight: 1.5
      letterSpacing: '-0.1px'
    mono:
      fontFamily: '"Input Mono Regular", "Input Mono Regular Placeholder", monospace'
      fontSize: '12px'
      fontWeight: 400
      lineHeight: 1.33
rounded:
  sm: '6px'
  md: '8px'
  lg: '10px'
  xl: '15px'
  2xl: '18px'
  button: '8px'
  pill: '50%'
spacing:
  base: '5px'
  s1: '1px'
  s2: '4px'
  s3: '5px'
  s4: '6px'
  s5: '8px'
  s6: '10px'
  s7: '15px'
  s8: '20px'
  s9: '25px'
  s10: '40px'
elevation:
  shadow-1: 'rgba(0, 0, 0, 0.1) 0px 1px 2px 0px'
  shadow-2: 'rgba(0, 0, 0, 0.1) 0px 10px 20px 0px, rgba(255, 255, 255, 0.1) 0px 0px 0px 1px inset'
  shadow-3: 'rgba(0, 0, 0, 0.2) 0px 2px 6px 0px'
  shadow-4: 'rgba(0, 0, 0, 0.25) 0px 2px 4px 0px'
  shadow-5: 'rgba(0, 0, 0, 0.25) 0px 4px 8px 0px'
layout:
  measure: '690px'
  sectionSpacing: '120px'
  gridColumns: 3
  navHeight: '64px'
  navPosition: 'relative'
  sectionWidth: 'full-bleed'
  sectionMedia: 'balanced'
  sectionCopy: 'sparse'
  heroHeight: '109vh'
  heroHeadingSize: '54px'
  heroAlign: 'left'
backgrounds:
  wash: 'linear-gradient(rgba(0, 0, 0, 0) 0%, rgb(0, 0, 0) 100%)'
  backdropFilter: 'blur(5px)'
  mixBlendMode: 'overlay'
  maskImage: 'linear-gradient'
components:
  button:
    background: '{colors.primary}'
    radius: '{rounded.button}'
    padding: '0px 10px'
    gap: '0px'
  surface:
    background: '{colors.card}'
    border: '{colors.border}'
  link:
    padding: '40px'
    gap: '10px'
provenance:
  brand: 'Framer'
  source: 'https://www.framer.com/'
  capturedAt: '2026-08-29T04:54:20.506Z'
  method: 'playwright/chromium 151.0.7922.34 computed styles @ 1440x900, 768x1024, 390x844 (light + dark)'
  harvestVersion: 8
  clusterVersion: 17
  screenshot: './source.webp'
---

## Overview

Pure `#000000` with white type, a blue that exists only in the focus ring, and
**no CSS motion at all**. Sparse copy over full-bleed sections, on a 5px grid.

Reach for this when the canvas should disappear and the content on it should be
the only thing with colour.

## Colors

**True black**, not a near-black: `#000000` under `#ffffff` at **21:1**, the
maximum possible. The text ramp steps `#ffffff` → `#cccccc` (13.08:1) →
`#999999` (7.37:1), every tier comfortably legible.

Surfaces are `#111111` and borders `#0f0f0f` — both barely separated from the
canvas, so structure is carried by spacing rather than by edges.

The accent `#0099ff` was found **in a focus ring**, the only chromatic evidence
on the page. The extractor also considered and **rejected** `#0066ff`: it
appeared as an interactive fill on exactly one element, which reads as a
promotion rather than a brand colour. Both facts are recorded rather than
resolved silently.

`success` is `#00bb88`.

## Typography

Inter Variable at **18px**/1.35, weight 400, tracking `-0.2px`, under
**GT Walsheim Medium** at weight 500 for headings — a geometric display face
over a neutral text face.

The scale is long and bottom-heavy: 7, 10, 12, 13, 14, 15, 16, 18, then jumping
to 28, 36, 44, 54. Sixteen distinct sizes collapsed to twelve, so treat the
interface end as approximate.

## Layout

**A 5px base unit** explaining 80% of observed spacing — unusual; almost
everything else here is on 4 or 8.

A **690px measure** behind a 64px nav, with a hero at **1.09 viewports** under a
54px left-aligned headline.

**Section composition: full-bleed, balanced, sparse copy** — a median of just
**135 characters** a section. Full-width sections carrying very little text.

## Elevation & Depth

**Five shadow tiers**, unusually many: `0 1px 2px` at 10% black, then `0 2px 4px`
and `0 2px 6px` at 20–25%, `0 4px 8px`, and a top tier pairing `0 10px 20px`
with an inset `rgba(255, 255, 255, 0.1)` hairline.

The canvas carries a linear fade to black over 15% of painted background area,
composited with `mix-blend-mode: overlay`, a `blur(5px)` backdrop and a linear
mask.

## Shapes

Radii of 6, 8, 10, 15 and 18px with buttons at 8px, and a `50%` pill for
circular controls.

## Components

Buttons take `0px 10px` padding at an 8px radius. Links carry a full `40px` of
padding at an 18px radius with a 10px gap — navigation-sized rather than inline.

**No transitions.** Not one control on the page declares one. Framer animates
with JavaScript, so nothing about its motion is legible from CSS; this file
records the absence rather than inventing a duration.

## Do's and Don'ts

- **Do** use true `#000000`. A near-black canvas is a different system.
- **Do** keep copy short. 135 characters a section is the measured density.
- **Do** spend the blue on focus only. It was never found on a fill.
- **Don't** promote the rejected `#0066ff`; one element is a campaign.
- **Don't** invent a transition because the page feels animated. The CSS
  declares none, and this file says so rather than guessing.

**What this file does not constrain:** motion, which is not expressed in CSS
here, and the content of the sections.
