---
name: 'Bulletin Orange'
version: '0.1.0'
description: 'Verdana at 10.67px on beige, zero border radius, no spacing grid and no transitions. Structure by table.'
categories:
  - editorial
  - developer-tools
colors:
  background: '#f6f6ef'
  foreground: '#000000'
  card: '#ffffff'
  mutedForeground: '#828282'
  primary: '#ff6600'
  border: '#767676'
  surface-1: '#ffffff'
  text-1: '#000000'
  text-2: '#828282'
typography:
  fontFamily: 'Verdana, Geneva, sans-serif'
  headingFamily: 'Verdana, Geneva, sans-serif'
  baseSize: '10.67px'
  weight: 400
  scale:
    2xs: '9.33333px'
    xs: '10.6667px'
    sm: '12px'
    base: '13.3333px'
    lg: '14.6667px'
  roles:
    body:
      fontFamily: 'Verdana, Geneva, sans-serif'
      fontSize: '10.67px'
      fontWeight: 400
    body-sm:
      fontFamily: 'Verdana, Geneva, sans-serif'
      fontSize: '9.33px'
      fontWeight: 400
    body-lg:
      fontFamily: 'Verdana, Geneva, sans-serif'
      fontSize: '12px'
      fontWeight: 400
    lead:
      fontFamily: 'Verdana, Geneva, sans-serif'
      fontSize: '13.33px'
      fontWeight: 400
    lead-lg:
      fontFamily: 'Verdana, Geneva, sans-serif'
      fontSize: '14.67px'
      fontWeight: 400
      lineHeight: 1.27
    link:
      fontFamily: 'Verdana, Geneva, sans-serif'
      fontSize: '13.33px'
      fontWeight: 400
rounded:
  button: '0px'
spacing:
  s1: '1px'
  s2: '2px'
  s3: '3px'
  s4: '5px'
  s5: '8px'
components:
  button:
    background: '{colors.primary}'
    radius: '0px'
  surface:
    background: '{colors.card}'
    border: '{colors.border}'
provenance:
  brand: 'News'
  source: 'https://news.ycombinator.com/'
  capturedAt: '2026-08-29T04:57:15.824Z'
  method: 'playwright/chromium 151.0.7922.34 computed styles @ 1440x900, 768x1024, 390x844 (light + dark)'
  harvestVersion: 8
  clusterVersion: 17
---


## Overview

Verdana at 10.67px on beige, one orange bar, and nothing else. No radius, no
shadow, no gradient, no transition, and no spacing grid worth the name. This is
what a page looks like when it was laid out in tables in 2007 and never
restyled.

Reach for this when density and speed are the entire brief and decoration would
be a cost.

## Colors

`#f6f6ef` — a warm beige, not white — under pure `#000000` body text at
**19.35:1**. A single muted tier at `#828282`, 3.54:1, which is below AA for
small text and is used anyway for byline metadata.

The accent is `#ff6600`, and it was found on a **surface, not a control**. There
is no styled button anywhere on this page, no focus ring, and no chromatic text;
the orange is a masthead fill on six elements. Treat it as a banner colour.

## Typography

**Verdana at 10.67px**, weight 400, with no declared line height at all — the
browser default does the spacing. The scale runs 9.33, 10.67, 12, 13.33, 14.67:
five steps inside six pixels, because the page sizes text in points.

There is no heading face. Nothing on the page is an `h1` through `h6` with its
own styling.

## Layout

**No spacing grid.** The best candidate explains **2%** of observed values —
effectively none, and the lowest figure in this registry by an order of
magnitude. Spacing here is table cell padding, not a system.

**No measure, no navigation and no hero could be read.** The content root does
not partition into sections because the page is a table, so those are withheld
rather than guessed.

## Elevation & Depth

No box-shadow anywhere. No background image, gradient or pattern anywhere. No
filter, no blend mode, no mask.

The canvas is flat beige. There is no depth in this system at all.

## Shapes

**No border radius anywhere on the page.** Every corner is square. This is the
only fully sharp system in the registry.

## Components

Links are the only component: 197 of them, all one shape, none carrying padding,
radius or border.

**No transitions.** Not one control declares one; every state change is
instantaneous.

## Do's and Don'ts

- **Do** keep the beige. `#f6f6ef` rather than white is the one deliberate
  colour decision in the whole design.
- **Do** keep text tiny and dense. 10.67px Verdana is the system.
- **Don't** add a radius, a shadow, a gradient or a transition. Each one would
  be the single most out-of-place thing on the page.
- **Don't** treat `#ff6600` as a button colour — it was measured on a masthead,
  and this design has no filled buttons.
- **Don't** rely on `#828282` for anything that must be read; at 3.54:1 it fails
  AA for small text.

**What this file does not constrain:** everything above the paint. There is no
measurable layout system here to copy, and that absence is itself the answer.

