---
name: 'Playful Green'
version: '0.1.0'
description: 'Rounded 12px everything, a heavy display face, and green carrying both borders and emphasis.'
categories:
  - marketing
  - saas
colors:
  background: '#ffffff'
  foreground: '#777777'
  primary: '#a5ed6e'
  border: '#a5ed6e'
  text-1: '#4b4b4b'
  text-2: '#777777'
  success: '#58cc02'
typography:
  fontFamily: 'duolingo-sans, sans-serif'
  headingFamily: 'feather, sans-serif'
  baseSize: '17px'
  lineHeight: 1.41
  weight: 500
  headingWeight: 700
  scale:
    2xs: '13px'
    xs: '14px'
    sm: '15px'
    base: '17px'
    lg: '19px'
    xl: '32px'
    2xl: '36px'
    3xl: '48px'
    4xl: '64px'
  roles:
    body:
      fontFamily: 'duolingo-sans, sans-serif'
      fontSize: '17px'
      fontWeight: 500
      lineHeight: 1.41
    body-sm:
      fontFamily: 'duolingo-sans, sans-serif'
      fontSize: '15px'
      fontWeight: 700
      lineHeight: 1.33
      letterSpacing: '0.8px'
    caption:
      fontFamily: 'duolingo-sans, sans-serif'
      fontSize: '14px'
      fontWeight: 700
      lineHeight: 1.21
    body-lg:
      fontFamily: 'duolingo-sans, sans-serif'
      fontSize: '19px'
      fontWeight: 700
      lineHeight: 1.4
    h1:
      fontFamily: 'duolingo-sans, sans-serif'
      fontSize: '32px'
      fontWeight: 700
    h2:
      fontFamily: 'feather, sans-serif'
      fontSize: '48px'
      fontWeight: 700
    link:
      fontFamily: 'duolingo-sans, sans-serif'
      fontSize: '15px'
      fontWeight: 700
      lineHeight: 1.47
rounded:
  sm: '12px'
  button: '12px'
spacing:
  base: '4px'
  s1: '8px'
  s2: '10px'
  s3: '12px'
  s4: '16px'
  s5: '24px'
  s6: '32px'
  s7: '40px'
  s8: '48px'
  s9: '96px'
  s10: '101px'
layout:
  measure: '990px'
  sectionSpacing: '96px'
  gridColumns: 3
  navPosition: 'static'
  sectionWidth: 'full-bleed'
  sectionMedia: 'image-led'
  sectionCopy: 'moderate'
  heroHeadingSize: '48px'
  heroAlign: 'left'
motion:
  duration: '0.2s'
  easing: 'ease'
backgrounds:
  maskImage: 'raster'
components:
  button:
    background: '{colors.primary}'
    radius: '{rounded.button}'
    padding: '0px 16px'
  surface:
    background: '{colors.background}'
    border: '{colors.border}'
  link:
    padding: '0px 16px'
provenance:
  brand: 'Duolingo'
  source: 'https://www.duolingo.com/'
  capturedAt: '2026-08-29T04:56:29.490Z'
  method: 'playwright/chromium 151.0.7922.34 computed styles @ 1440x900, 768x1024, 390x844 (light + dark)'
  harvestVersion: 8
  clusterVersion: 17
  screenshot: './source.webp'
---

## Overview

Rounded 12px on everything, a heavy display face over a rounded sans, and green
carrying both borders and emphasis. Image-led sections on a 4px grid.

Reach for this when the product should feel friendly and game-like rather than
professional.

## Colors

The accent is `#a5ed6e`, a light lime — and it is also the **border** colour,
which is unusual: edges here are drawn in the brand colour rather than in a
neutral. `success` is `#58cc02`, the deeper, more saturated green most people
picture.

**A caveat on the text colour.** `foreground` measured as `#777777` at 4.48:1,
because grey out-types everything else on this marketing page. The darker
`#4b4b4b` (8.72:1) is present in the ramp and is the value to use for real body
copy; `#777777` is what this particular page happens to set most of.

The accent came from **interactive text, not a filled button**, so verify it by
eye before building a control from it.

## Typography

**duolingo-sans at 17px**/1.41 weight **500** for body, under **feather** at
weight **700** for headings. A heavy display face over a medium-weight rounded
sans is the whole voice.

The scale jumps hard: 13, 14, 15, 17, 19, then 32, 36, 48, 64. There is nothing
between 19 and 32 — interface text and display text, with no middle.

## Layout

**A 4px base unit** explaining 76% of observed spacing, and a **990px measure**.

**Section composition: full-bleed, image-led, moderate copy** — a median of 229
characters a section.

Two structural figures were **withheld**: the navigation measured taller than a
fifth of the viewport, which means a menu was caught open rather than a bar
being that tall; and the first section came out at four viewports, which is a
run of stacked panels rather than one hero. Both are reported as absent rather
than published wrong.

## Elevation & Depth

**No box-shadow anywhere**, which is surprising for a system this playful — the
chunky look comes from radius and colour, not from lift. The only compositing is
a raster `mask-image`.

## Shapes

**One radius: 12px**, used everywhere including buttons. A single corner value
across the whole system is rare and is a large part of why it reads as
consistent.

## Components

Buttons and links share `0px 16px` padding at the 12px radius.

**Motion is 0.2s ease**, but measured on a single control — too thin to
generalise from. Most of this site's CSS is cross-origin: nine of eleven
stylesheets could not be read, so the state and motion picture here is
incomplete by measurement, not by choice.

## Do's and Don'ts

- **Do** use one radius everywhere. 12px on every corner is the system.
- **Do** let the green draw borders. Neutral edges would make this generic.
- **Do** pair a heavy display face with a medium-weight body.
- **Don't** use `#777777` for body copy — take `#4b4b4b` from the ramp. The
  measured foreground reflects this page's marketing text, not its reading text.
- **Don't** add shadows. There are none.

**What this file does not constrain:** structure, much of which could not be
read here, and state styling, most of which is in stylesheets we cannot see.
