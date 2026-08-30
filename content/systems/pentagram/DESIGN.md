---
name: 'Gallery Neutral'
version: '0.1.0'
description: 'No accent colour at all. Black on white, a 1390px measure, and image-led sections carrying long copy.'
categories:
  - agency
  - portfolio
colors:
  background: '#ffffff'
  foreground: '#1a1a1a'
  card: '#e3e4e5'
  mutedForeground: '#767676'
  border: '#333333'
  surface-1: '#e3e4e5'
  text-1: '#1a1a1a'
  text-2: '#767676'
  text-3: '#8c8c8c'
typography:
  fontFamily: 'Plain, Arial, sans-serif'
  headingFamily: 'Plain, Arial, sans-serif'
  baseSize: '16px'
  lineHeight: 1.25
  weight: 400
  headingWeight: 400
  scale:
    sm: '13px'
    base: '16px'
    lg: '17px'
    xl: '19px'
    2xl: '24px'
    3xl: '32px'
    4xl: '36px'
    5xl: '41px'
    6xl: '52px'
  roles:
    body:
      fontFamily: 'Plain, Arial, sans-serif'
      fontSize: '16px'
      fontWeight: 400
      lineHeight: 1.25
    body-sm:
      fontFamily: 'Plain, Arial, sans-serif'
      fontSize: '13px'
      fontWeight: 400
      lineHeight: 1.25
    body-lg:
      fontFamily: 'Plain, Arial, sans-serif'
      fontSize: '24px'
      fontWeight: 400
      lineHeight: 1.2
      letterSpacing: '-0.24px'
    h2:
      fontFamily: 'Plain, Arial, sans-serif'
      fontSize: '16px'
      fontWeight: 400
      lineHeight: 1.25
    h3:
      fontFamily: 'Plain, Arial, sans-serif'
      fontSize: '16px'
      fontWeight: 400
      lineHeight: 1.25
    h4:
      fontFamily: 'Plain, Arial, sans-serif'
      fontSize: '16px'
      fontWeight: 400
      lineHeight: 1.25
    button:
      fontFamily: 'Plain, Arial, sans-serif'
      fontSize: '16px'
      fontWeight: 400
      lineHeight: 1.25
    link:
      fontFamily: 'Plain, Arial, sans-serif'
      fontSize: '16px'
      fontWeight: 400
      lineHeight: 1.25
rounded:
  sm: '4px'
  md: '8px'
  button: '4px'
  pill: '9999px'
spacing:
  base: '4px'
  s1: '4px'
  s2: '8px'
  s3: '12px'
  s4: '16px'
  s5: '24px'
  s6: '32px'
  s7: '40px'
  s8: '48px'
  s9: '64px'
  s10: '96px'
layout:
  measure: '1390px'
  sectionSpacing: '48px'
  navHeight: '60px'
  navPosition: 'static'
  sectionWidth: 'full-bleed'
  sectionMedia: 'image-led'
  sectionCopy: 'dense'
  heroHeight: '69vh'
motion:
  duration: '0.2s'
  easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
backgrounds:
  backdropFilter: 'blur(7.5px)'
components:
  button:
    radius: '{rounded.button}'
    padding: '6px 8px'
    active:
      backgroundColor: '#000000'
    focus:
      outlineColor: 'transparent'
    hover:
      backgroundColor: 'rgba(0, 0, 0, 0.15)'
  surface:
    background: '{colors.card}'
    border: '{colors.border}'
  link:
    padding: '8px 24px 0px 0px'
    focus:
      outlineColor: 'transparent'
    hover:
      color: '#767676'
provenance:
  brand: 'Pentagram'
  source: 'https://www.pentagram.com/'
  capturedAt: '2026-08-29T04:54:08.903Z'
  method: 'playwright/chromium 151.0.7922.34 computed styles @ 1440x900, 768x1024, 390x844 (light + dark)'
  harvestVersion: 8
  clusterVersion: 17
  screenshot: './source.webp'
---

## Overview

A design studio's own site: black on white, no accent colour of any kind, a
1390px measure, and photography carrying every section under unusually long
copy.

Reach for this when the work is the content and the interface should get out of
its way entirely.

## Colors

**There is no accent.** The extractor found no chromatic colour in buttons,
focus rings, links or body text — the palette is genuinely achromatic, and that
is the design rather than a gap in the capture.

`#1a1a1a` on white at **17.4:1**, stepping down through `#767676` (4.54:1) to
`#8c8c8c` (3.36:1). Borders are `#333333` — near-black, drawn at full strength
rather than as a tint. Surfaces are `#e3e4e5`.

## Typography

**One family for everything: Plain, at 16px with a tight 1.25 line height,
weight 400 for both body and headings.** No weight contrast, no second face,
no italics doing structural work.

The scale carries the hierarchy instead, and it is long: 13, 16, 17, 19, 24, 32,
36, 41, 52. Nine steps, several only a pixel or two apart at the reading sizes.

## Layout

**A 4px grid explaining 98% of observed spacing** — as strict as anything
measured here, a hair behind Gumroad's 99%.

A **1390px measure** behind a 60px static nav. The hero runs 0.69 viewports and
carries no headline at all; the page opens on work, not on a statement.

**Section composition: full-bleed, image-led, dense copy** — a median of
**1139 characters** a section. Long-form writing under full-width photography is
the format.

## Elevation & Depth

**No box-shadow anywhere.** The only compositing on the page is a
`backdrop-filter: blur(7.5px)`. Nothing lifts; things sit.

## Shapes

Radii of 4 and 8px only, with buttons at 4px. Nearly square, but not sharp.

## Components

Buttons are padded `6px 8px` at a 4px radius, and every state is declared:
`hover` fills `rgba(0, 0, 0, 0.15)`, `active` goes to solid `#000000`, and
`focus` sets `outline-color: transparent`.

Links carry asymmetric `8px 24px 0px 0px` padding across 61 elements. On hover
they drop to `#767676`, and headings underline in their own ink.

**Motion is 0.2s** on a `cubic-bezier(0.25, 0.46, 0.45, 0.94)` ease-out.

## Do's and Don'ts

- **Do** keep it achromatic. Adding a brand colour would change what this system
  is more than any other single edit.
- **Do** hold the 4px grid. At 98% it is effectively absolute.
- **Do** write long. A median section here carries over a thousand characters.
- **Don't** introduce a second typeface or lean on weight. One family at one
  weight, with size doing the work, is the whole typographic system.
- **Don't** add elevation. There is not a single shadow on the page.

**What this file does not constrain:** the work you put in it, the section
order, or the imagery. It gives you a measure, a grid, one face and no colour.

<!-- specimen:base v1 · generated · shared by every file in this registry · edit src/lib/base-md.mjs, then run `npm run base` -->

### The base

*Shared by every file in this registry; only the counts below are this
file's.*

**Budget.** 6 colours, 3 radii, 10 spacing steps, 9 type steps, 1 weight and
one easing curve. That is the whole design — a colour, radius, shadow or curve
not on that list is one you invented. It declares no elevation, so nothing in
this design floats. Its canvas carries no pattern or wash, so leave it flat.
An absence here is an instruction rather than a gap: fill nothing in from
convention.

**Scope.** A visual language, not a page. How surfaces are coloured, how type
steps, how far things sit apart, how fast they move. Sections, copy,
information architecture and imagery are yours — the file is silent on them on
purpose.

**Habits to suppress.** Asked for a landing page, a model returns the average
of every landing page, and that average is recognisable on sight. None of this
is here unless it was measured.

- **Copy** — no small uppercase letterspaced line over the headline
  (`FOR DEVELOPERS`, `INTRODUCING`, `AI-POWERED`); no tricolon of one-word
  features; no *seamlessly*, *effortlessly*, *unlock*, *supercharge*, *elevate*,
  *empower*, *transform*, *leverage*, *next level*; no "Ready to get started?"
  band; no invented testimonial, customer logo or round statistic; no caption on
  a thing that already says what it is.
- **Structure** — not hero, logo wall, three feature cards, three steps,
  testimonials, FAQ, closing CTA; not three of anything by default; not every
  section the same width, centred, at the same padding.
- **Surface** — no indigo-to-violet-to-pink gradient; no gradient-filled
  heading; no blurred glow behind the hero; no glass panel on every card; no
  emoji standing in for an icon; no icon in a tinted rounded square; no
  `scale(1.05)` on hover.

The tell under all of them is uniformity — one radius, one border, one shadow,
one gap everywhere, because nothing was decided.

<!-- /specimen:base -->
