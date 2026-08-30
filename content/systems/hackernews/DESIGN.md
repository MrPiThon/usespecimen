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
  clusterVersion: 20
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

<!-- specimen:base v3 · generated · shared by every file in this registry · edit src/lib/base-md.mjs, then run `npm run base` -->

### The base

*Shared by every file in this registry; only the counts below are this
file's.*

**Budget.** 6 colours, 1 radius, 5 spacing steps, 5 type steps and 1 weight.
That is the whole design — a colour, radius, shadow or curve not on that list
is one you invented. It declares no elevation, so nothing in this design
floats. It declares no motion, so state changes here are instant. It has no
spacing grid, so use the steps it observed rather than rounding them into a
tidy 8px rhythm. Its buttons are square at 0px, which is a measurement rather
than a value nobody set. Its canvas carries no pattern or wash, so leave it
flat. An absence here is an instruction rather than a gap: fill nothing in
from convention.

**Scope.** A visual language, not a page: sections, copy, information
architecture and imagery are yours, and the silence on them is deliberate.

**Habits to suppress.** A model asked for a page returns the average of every
page, and the average is recognisable. None of this is here unless it was
measured.

- **Copy** — no small uppercase letterspaced line over the headline
  (`FOR DEVELOPERS`, `INTRODUCING`); no feature title built from two abstract
  nouns ("Seamless Integration"); no *seamlessly*, *effortlessly*, *unlock*,
  *elevate*, *empower*, *transform*, *leverage*, *delve* — density is the tell
  rather than any one word; no "Get started" band; no invented testimonial,
  customer logo, round statistic, or "Sarah Johnson, Head of Operations" over a
  generated avatar; no caption on a thing that already says what it is.
- **Structure** — not hero, logo wall, three feature cards, three-tier pricing
  with the middle plan lifted, FAQ accordion, closing CTA, four-column footer;
  not steps numbered 01 / 02 / 03; not three of anything by default; not every
  section the same width, centred, at the same padding; not a filled button
  beside an outlined one, arrow welded to the label.
- **Surface** — not Inter unless this file names it, and not a stock Tailwind
  palette (`indigo-600`, untouched `zinc` and `slate`); no
  indigo-to-violet-to-pink gradient; no gradient-filled heading; no
  `rounded-2xl shadow-lg p-6` on everything; no glass panel; no blurred glow
  behind the hero; no emoji standing in for an icon; no icon in a tinted rounded
  square; no `Sparkles`, `ArrowRight` or `Zap`; no fake browser or terminal
  chrome — traffic-light dots, a filename bar — around a code sample; no stock
  photograph of people at a laptop and no floating 3D blob.
- **Motion** — this file measures its own. Do not leave hover states doing
  nothing, do not snap where it declares an easing curve, and do not put one
  fade-in-up on every element on the page.

The tell under all of them is uniformity — one radius, one border, one shadow,
one gap everywhere, because nothing was decided.

<!-- /specimen:base -->
