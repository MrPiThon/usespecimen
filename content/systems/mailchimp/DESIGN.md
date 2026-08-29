---
name: 'Signal Yellow'
version: '0.1.0'
description: 'A saturated yellow filling controls with near-black labels, under a display serif on a 4px grid.'
categories:
  - saas
  - marketing
colors:
  background: '#ffffff'
  foreground: '#000000'
  card: '#f5f5f5'
  primary: '#ffe01b'
  primaryForeground: '#231e15'
  border: '#403b3b'
  surface-1: '#f5f5f5'
  surface-2: '#bfbfbf'
  text-1: '#000000'
  text-2: '#231e15'
  text-3: '#004e56'
  warning: '#e7b75f'
typography:
  fontFamily: '"Graphik Web", "Helvetica Neue", Helvetica, Arial, Verdana, sans-serif'
  headingFamily: '"Means Web", Georgia, Times, "Times New Roman", serif'
  baseSize: '14px'
  lineHeight: 1.44
  weight: 400
  headingWeight: 400
  scale:
    xs: '11px'
    sm: '12px'
    base: '13px'
    lg: '14px'
    xl: '15px'
    2xl: '16px'
    3xl: '17px'
    4xl: '20px'
    5xl: '28px'
    6xl: '29.25px'
    7xl: '38.4px'
    up-9: '40px'
  roles:
    body:
      fontFamily: '"Graphik Web", "Helvetica Neue", Helvetica, Arial, Verdana, sans-serif'
      fontSize: '14px'
      fontWeight: 400
      lineHeight: 1.44
    body-sm:
      fontFamily: '"Graphik Web", "Helvetica Neue", Helvetica, Arial, Verdana, sans-serif'
      fontSize: '13px'
      fontWeight: 400
      lineHeight: 1.54
    caption:
      fontFamily: '"Graphik Web", "Helvetica Neue", Helvetica, Arial, Verdana, sans-serif'
      fontSize: '12px'
      fontWeight: 400
      lineHeight: 1.5
    caption-sm:
      fontFamily: '"Graphik Web", "Helvetica Neue", Helvetica, Arial, Verdana, sans-serif'
      fontSize: '11px'
      fontWeight: 400
      lineHeight: 1.45
    body-lg:
      fontFamily: '"Graphik Web", "Helvetica Neue", Helvetica, Arial, Verdana, sans-serif'
      fontSize: '16px'
      fontWeight: 500
      lineHeight: 2
    lead:
      fontFamily: '"Graphik Web", "Helvetica Neue", Helvetica, Arial, Verdana, sans-serif'
      fontSize: '20px'
      fontWeight: 400
      lineHeight: 1.6
    h1:
      fontFamily: '"Means Web", Georgia, Times, "Times New Roman", serif'
      fontSize: '36px'
      fontWeight: 400
      lineHeight: 1.3
    h2:
      fontFamily: '"Means Web", Georgia, Times, "Times New Roman", serif'
      fontSize: '28px'
      fontWeight: 400
      lineHeight: 1.13
    h3:
      fontFamily: '"Graphik Web", "Helvetica Neue", Helvetica, Arial, Verdana, sans-serif'
      fontSize: '17px'
      fontWeight: 400
      lineHeight: 1.41
    button:
      fontFamily: '"Graphik Web", "Helvetica Neue", Helvetica, Arial, Verdana, sans-serif'
      fontSize: '13px'
      fontWeight: 500
      lineHeight: 1.2
      letterSpacing: '0.13px'
    link:
      fontFamily: '"Graphik Web", "Helvetica Neue", Helvetica, Arial, Verdana, sans-serif'
      fontSize: '13px'
      fontWeight: 400
      lineHeight: 1.35
rounded:
  sm: '3px'
  md: '4px'
  lg: '16px'
  xl: '24px'
  2xl: '26px'
  button: '16px'
  pill: '50%'
spacing:
  base: '4px'
  s1: '2px'
  s2: '5px'
  s3: '8px'
  s4: '10px'
  s5: '12px'
  s6: '16px'
  s7: '20px'
  s8: '24px'
  s9: '32px'
  s10: '48px'
elevation:
  shadow-1: 'rgba(0, 0, 0, 0.086) 0px 15.547px 44px 0px'
  shadow-2: 'rgb(35, 30, 21) 0px 0px 0px 1px'
  shadow-3: 'rgba(0, 0, 0, 0.06) 0px 4px 16px 0px'
  shadow-4: 'rgb(255, 255, 255) 0px 0px 0px 0px'
  shadow-5: 'rgba(0, 0, 0, 0.2) 0px 0px 18px 0px'
layout:
  measure: '1280px'
  sectionSpacing: '80px'
  navHeight: '68px'
  navPosition: 'sticky'
  sectionWidth: 'full-bleed'
  sectionMedia: 'text-led'
  sectionCopy: 'dense'
  heroHeight: '80vh'
  heroHeadingSize: '64px'
  heroAlign: 'center'
motion:
  duration: '0.15s'
  easing: 'ease'
backgrounds:
  maskImage: 'linear-gradient'
components:
  button:
    background: '{colors.primary}'
    foreground: '{colors.primaryForeground}'
    radius: '{rounded.button}'
    padding: '8px'
    focus:
      outlineColor: '#000000'
    hover:
      color: '#ffffff'
      borderColor: '#68b631'
  surface:
    background: '{colors.card}'
    border: '{colors.border}'
  link:
    padding: '16px'
    gap: '16px'
    focus:
      backgroundColor: 'rgba(35, 30, 21, 0.05)'
    focus-visible:
      outlineColor: '#4bc4c2'
    hover:
      color: '#002023'
provenance:
  brand: 'Mailchimp'
  source: 'https://mailchimp.com/'
  capturedAt: '2026-08-29T04:55:52.846Z'
  method: 'playwright/chromium 151.0.7922.34 computed styles @ 1440x900, 768x1024, 390x844 (light + dark)'
  harvestVersion: 8
  clusterVersion: 17
  screenshot: './source.webp'
---

## Overview

A saturated yellow filling controls with near-black labels, under a display
serif on a strict 4px grid. Centred 64px headlines, dense copy, and a very wide
soft shadow used on over a hundred elements.

Reach for this when the brand should feel warm and slightly editorial rather
than technical.

## Colors

`#ffe01b` is the accent, carrying **`#231e15` labels** — a warm near-black
rather than pure black. Yellow can only be a fill if what sits on it is dark,
and this system commits to that.

Body text is `#000000` at **21:1**. Borders are `#403b3b`, drawn in ink rather
than in a tint. `warning` is `#e7b75f`, a muted amber distinct from the accent.

The text ramp is `#000000`, `#231e15`, then **`#004e56`** — a deep teal used as
a text tier, which is an unusual third step and worth keeping.

**No muted tier was found.** No secondary colour was quiet, desaturated and
common enough to qualify, so it is omitted rather than promoting a link colour
into the role.

## Typography

**Graphik Web at 14px**/1.44 for body under **Means Web**, a serif, at weight
400 for headings. Sans body with serif display is the inverse of the usual
editorial pairing and is a large part of the character.

Nineteen sizes collapsed to twelve; the scale steps 11, 12, 13, 14, 15, 16, 17
before jumping to 20, 28, 29.25, 38.4, 40.

## Layout

**A 4px base unit** explaining 87% of observed spacing.

A **1280px measure** behind a **68px sticky** nav. The hero is 0.8 viewports
with a **64px centred** headline.

**Section composition: full-bleed, text-led, dense copy** — a median of
**1259 characters** a section, the highest in the registry.

## Elevation & Depth

One shadow dominates: `rgba(0, 0, 0, 0.086) 0 15.547px 44px` on **102
elements** — very wide, very soft, barely offset. Alongside it a hard
`rgb(35, 30, 21) 0 0 0 1px` ring on 19 elements: a solid ink outline used as
elevation, which pairs oddly and deliberately with the soft blur.

A linear `mask-image` fades decorative layers out.

## Shapes

Radii of 3, 4, 16, 24 and 26px with **buttons at 16px**, plus a `50%` pill for
circular controls. Small radii on containers, large on controls — the reverse of
most systems here.

## Components

Buttons are padded `8px` at a 3px radius; links carry `16px` padding at a 16px
radius with a 16px gap.

**Motion is 0.15s ease.**

## Do's and Don'ts

- **Do** put `#231e15` on the yellow, never white. The label colour is what
  makes a yellow fill legible.
- **Do** pair the sans body with the serif display. Collapsing to one family
  removes the editorial note entirely.
- **Do** keep the wide soft shadow. At 44px blur on 102 elements it is the
  page's dominant depth cue.
- **Don't** invent a muted grey. This system was measured as not having one.
- **Don't** discard `#004e56`; the teal text tier is a real and unusual part of
  the ladder.

**What this file does not constrain:** page structure and copy.
