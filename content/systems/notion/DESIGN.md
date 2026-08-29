---
name: 'Editorial Workspace'
version: '0.1.0'
description: 'Serif-led productivity: a Lyon Text body at 18px, near-black on white, and one blue reserved for action.'
categories:
  - saas
  - marketing
colors:
  background: '#ffffff'
  foreground: '#000000'
  card: '#f9f9f8'
  mutedForeground: '#615d59'
  primary: '#0075de'
  primaryForeground: '#ffffff'
  border: '#e6e6e6'
  surface-1: '#f9f9f8'
  text-1: '#000000'
  text-2: '#0d0d0d'
  text-3: '#1a1a1a'
  text-4: '#615d59'
  text-5: '#757575'
  danger: '#f64932'
  warning: '#ffb110'
  success: '#1aae39'
typography:
  fontFamily: '"Lyon Text", Georgia, YuMincho, "Yu Mincho", "Hiragino Mincho ProN", "Hiragino Mincho Pro", "Songti TC", "Songti SC", SimSun, "Nanum Myeongjo", NanumMyeongjo, Batang, serif'
  headingFamily: 'NotionInter, Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, "Apple Color Emoji", Arial, sans-serif, "Segoe UI Emoji", "Segoe UI Symbol"'
  baseSize: '18px'
  lineHeight: 1.56
  weight: 400
  headingWeight: 700
  scale:
    sm: '12px'
    base: '14px'
    lg: '16px'
    xl: '18px'
    2xl: '20px'
    3xl: '22px'
    4xl: '32px'
    5xl: '42px'
    6xl: '45.675px'
    7xl: '54px'
    up-9: '60.9px'
    up-10: '96px'
  roles:
    body:
      fontFamily: '"Lyon Text", Georgia, YuMincho, "Yu Mincho", "Hiragino Mincho ProN", "Hiragino Mincho Pro", "Songti TC", "Songti SC", SimSun, "Nanum Myeongjo", NanumMyeongjo, Batang, serif'
      fontSize: '18px'
      fontWeight: 400
      lineHeight: 1.56
    body-sm:
      fontFamily: 'NotionInter, Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, "Apple Color Emoji", Arial, sans-serif, "Segoe UI Emoji", "Segoe UI Symbol"'
      fontSize: '14px'
      fontWeight: 500
      lineHeight: 1.43
    caption:
      fontFamily: 'NotionInter, Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, "Apple Color Emoji", Arial, sans-serif, "Segoe UI Emoji", "Segoe UI Symbol"'
      fontSize: '12px'
      fontWeight: 500
      lineHeight: 1.33
      letterSpacing: '0.125px'
    h1:
      fontFamily: 'NotionInter, Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, "Apple Color Emoji", Arial, sans-serif, "Segoe UI Emoji", "Segoe UI Symbol"'
      fontSize: '42px'
      fontWeight: 600
      lineHeight: 1.14
      letterSpacing: '-1.5px'
    h2:
      fontFamily: 'NotionInter, Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, "Apple Color Emoji", Arial, sans-serif, "Segoe UI Emoji", "Segoe UI Symbol"'
      fontSize: '22px'
      fontWeight: 700
      lineHeight: 1.27
      letterSpacing: '-0.25px'
    h3:
      fontFamily: 'NotionInter, Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, "Apple Color Emoji", Arial, sans-serif, "Segoe UI Emoji", "Segoe UI Symbol"'
      fontSize: '16px'
      fontWeight: 700
      lineHeight: 1.5
    link:
      fontFamily: 'NotionInter, Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, "Apple Color Emoji", Arial, sans-serif, "Segoe UI Emoji", "Segoe UI Symbol"'
      fontSize: '16px'
      fontWeight: 500
      lineHeight: 1.5
rounded:
  sm: '4px'
  md: '6px'
  lg: '8px'
  xl: '12px'
  button: '8px'
  pill: '9999.01px'
spacing:
  base: '4px'
  s1: '3px'
  s2: '4px'
  s3: '6px'
  s4: '8px'
  s5: '12px'
  s6: '15px'
  s7: '16px'
  s8: '24px'
  s9: '32px'
  s10: '40px'
elevation:
  shadow-1: 'rgba(0, 0, 0, 0.01) 0px 0.175px 1.041px 0px, rgba(0, 0, 0, 0.02) 0px 0.8px 2.925px 0px, rgba(0, 0, 0, 0.027) 0px 2.025px 7.847px 0px, rgba(0, 0, 0, 0.04) 0px 4px 18px 0px'
  shadow-2: 'rgba(0, 0, 0, 0.008) 0px 0.667px 3.502px 0px, rgba(0, 0, 0, 0.016) 0px 2.933px 7.252px 0px, rgba(0, 0, 0, 0.02) 0px 7.2px 14.462px 0px, rgba(0, 0, 0, 0.024) 0px 13.867px 28.348px 0px, rgba(0, 0, 0, 0.03) 0px 23.333px 52.123px 0px, rgba(0, 0, 0, 0.04) 0px 36px 89px 0px'
  shadow-3: 'rgba(0, 0, 0, 0) 0px 1px 0px 0px'
layout:
  measure: '1230px'
  sectionSpacing: '96px'
  gridColumns: 2
  navHeight: '64px'
  navPosition: 'relative'
  sectionWidth: 'full-bleed'
  sectionMedia: 'image-led'
  sectionCopy: 'moderate'
  heroHeight: '159vh'
  heroHeadingSize: '96px'
  heroAlign: 'center'
motion:
  duration: '0.2s'
  easing: 'cubic-bezier(0.42, 0, 1, 1)'
backgrounds:
  wash: 'linear-gradient(rgba(0, 0, 0, 0) 35%, rgba(0, 0, 0, 0.55) 100%)'
  mixBlendMode: 'screen'
  maskImage: 'linear-gradient'
components:
  button:
    background: '{colors.primary}'
    foreground: '{colors.primaryForeground}'
    radius: '{rounded.button}'
    padding: '5px 10px'
    gap: '8px'
    active:
      backgroundColor: '#f6f5f4'
      borderColor: '#f9f9f8'
    focus-visible:
      backgroundColor: '#f6f5f4'
      borderColor: '#f9f9f8'
    hover:
      color: '#000000e5'
  surface:
    background: '{colors.card}'
    border: '{colors.border}'
  link:
    padding: '3px 16px 3px 8px'
    gap: '0px 8px'
    active:
      backgroundColor: '#0000001a'
    focus:
      color: '#00396b'
    focus-visible:
      backgroundColor: '#0000000d'
    hover:
      backgroundColor: '#0000000d'
provenance:
  brand: 'Notion'
  source: 'https://www.notion.com/'
  capturedAt: '2026-08-29T04:35:15.365Z'
  method: 'playwright/chromium 151.0.7922.34 computed styles @ 1440x900, 768x1024, 390x844 (light + dark)'
  harvestVersion: 8
  clusterVersion: 17
  screenshot: './source.webp'
---











## Overview

A productivity interface built on a serif. Body copy is set in Lyon Text at
18px, which is the opposite of the sans-at-14px convention the category runs on,
and it is the decision everything else defers to.

Reach for this when the product is mostly reading and writing, and you want it
to feel closer to a document than to a dashboard.

## Colors

White canvas, pure `#000000` body copy at 21:1. The text ladder runs five steps
— `#000000`, `#0d0d0d`, `#1a1a1a`, `#615d59`, `#757575` — from 21:1 down to
4.59:1, and the top three are separated by almost nothing. That is a system
using near-black as a texture rather than as a single value.

One blue, `#0075de`, carries every action. Its white label measures 4.57:1,
which clears AA by 0.07 — real, but with no room to spare. Surfaces sit a single
step off white at `#f9f9f8`.

State colours are declared and distinct: `#1aae39` success, `#ffb110` warning,
`#f64932` danger. Borders are `#e6e6e6` at 1.25:1 — separation only.

## Typography

Lyon Text at 18px with a 1.56 line height for body, and NotionInter at weight
700 for headings. A serif body under a sans heading is the reverse of the usual
pairing and is the single most copyable idea here.

Twelve steps from 12px to 96px.

## Layout

A 4px grid, obeyed by 82.6% of observed spacing — the second strictest in this
catalogue. The run is 3, 4, 6, 8, 12, 15, 16, 24, 32, 40.

**1230px measure, 96px between sections.** Where this diverges from almost
everything else in the registry is the hero: **1.59 viewports, full bleed, and
centred**, under a **96px** headline with three media elements and two filled
calls to action.

Centred display type at that size is the signature. Most systems here align
their hero left; this one puts the headline in the middle of the screen and
makes it very large.

**Section composition across four sections: full-bleed, image-led, moderate
copy.** All four bleed, three are image-led and three carry a repeating group,
with a median of **489 characters**. Four is a small sample — treat the shares
as indicative rather than settled.

## Elevation & Depth

Barely there, deliberately. The largest shadow begins
`rgba(0, 0, 0, 0.01) 0px 0.175px 1.041px` — a hundredth of an alpha and a
sub-pixel offset. Depth is a hint that something is liftable, not a claim that
it is already floating.

**A single full-coverage fade** from transparent to `#000000` at **55%**,
composited with `mix-blend-mode: screen` and cut off with a linear `mask-image`.
The layer is also run through `brightness(1.4) saturate(0.25)` — brightened and
substantially desaturated, which is how the page keeps illustration colour from
competing with the type.

## Shapes

Radii of 4, 6, 8 and 12px, with buttons at 8px. Nothing is pilled.

## Components

Buttons are padded `5px 10px` at 8px radius with an 8px gap. Links carry
asymmetric padding, `3px 16px 3px 8px`, which is what makes them sit correctly
against inline text rather than floating in a box of their own.

Hover, focus-visible and active are all declared, on buttons and links alike.

**0.2s cubic-bezier(0.42, 0, 1, 1)** across 62 controls, 82% of what animates.
The curve accelerates into the end rather than easing out of it.

## Do's and Don'ts

- **Do** centre the hero headline and make it very large. 96px centred over a
  full-bleed 1.59-viewport opening is the signature, and almost nothing else in
  this registry does it.
- **Do** bleed sections and hold content to 1230px.
- **Don't** left-align the display type. It is the one thing that would make
  this read as a different system.
- **Don't** over-read the section shares — they come from only four sections.

**What this file does not constrain:** what the sections contain or how many
there are. Take the centred display voice and the measure; build your own page.





