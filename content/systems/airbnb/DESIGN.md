---
name: 'Rosewood Marketplace'
version: '0.1.0'
description: 'Warm marketplace neutrals with a single rose accent and a soft radius throughout.'
categories:
  - e-commerce
  - marketing
colors:
  background: '#ffffff'
  foreground: '#222222'
  card: '#f7f7f7'
  mutedForeground: '#6c6c6c'
  primary: '#da1249'
  border: '#dddddd'
  surface-1: '#f7f7f7'
  text-1: '#222222'
  text-2: '#6c6c6c'
typography:
  fontFamily: '"Airbnb Cereal VF", Circular, -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", sans-serif'
  headingFamily: '"Airbnb Cereal VF", Circular, -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", sans-serif'
  baseSize: '12px'
  lineHeight: 1.33
  weight: 400
  headingWeight: 500
  scale:
    xs: '10px'
    sm: '12px'
    base: '14px'
    lg: '21px'
    xl: '22px'
    2xl: '28px'
  roles:
    body:
      fontFamily: '"Airbnb Cereal VF", Circular, -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", sans-serif'
      fontSize: '12px'
      fontWeight: 400
      lineHeight: 1.33
    body-lg:
      fontFamily: '"Airbnb Cereal VF", Circular, -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", sans-serif'
      fontSize: '14px'
      fontWeight: 400
      lineHeight: 1.29
    h1:
      fontFamily: '"Airbnb Cereal VF", Circular, -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", sans-serif'
      fontSize: '28px'
      fontWeight: 700
      lineHeight: 1.43
    h2:
      fontFamily: '"Airbnb Cereal VF", Circular, -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", sans-serif'
      fontSize: '22px'
      fontWeight: 500
      lineHeight: 1.18
      letterSpacing: '-0.44px'
    h3:
      fontFamily: '"Airbnb Cereal VF", Circular, -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", sans-serif'
      fontSize: '14px'
      fontWeight: 500
      lineHeight: 1.29
    button:
      fontFamily: '"Airbnb Cereal VF", Circular, -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", sans-serif'
      fontSize: '14px'
      fontWeight: 500
      lineHeight: 1.29
    link:
      fontFamily: '"Airbnb Cereal VF", Circular, -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", sans-serif'
      fontSize: '14px'
      fontWeight: 400
      lineHeight: 1.29
rounded:
  sm: '4px'
  md: '8px'
  lg: '12px'
  xl: '32px'
  2xl: '40px'
  button: '4px'
  pill: '50%'
spacing:
  s1: '2px'
  s2: '4px'
  s3: '5px'
  s4: '8px'
  s5: '10px'
  s6: '11px'
  s7: '12px'
  s8: '16px'
  s9: '20px'
  s10: '24px'
elevation:
  shadow-1: 'rgba(0, 0, 0, 0.1) 0px 3px 2.5px 0px, rgba(0, 0, 0, 0.15) 0px 1px 1px 0px, rgba(0, 0, 0, 0.15) 0px 0.8px 0.4px 0px, rgb(255, 255, 255) 0px 1px 1.5px 0px inset, rgba(58, 58, 58, 0.02) 0px 10px 15px 0px inset, rgba(255, 255, 255, 0.6) 0px -1.5px 0.8px 0px inset, rgba(0, 0, 0, 0.3) 0px -1.5px 0.75px 0px inset'
  shadow-2: 'rgba(0, 0, 0, 0.02) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 8px 24px 0px'
  shadow-3: 'rgb(255, 255, 255) 0px 1px 0.5px 0px, rgba(0, 0, 0, 0.15) 0px -0.5px 1px 0px, rgba(0, 0, 0, 0.05) 0px -1.2px 0.5px 1px, rgba(0, 0, 0, 0.05) 0px 8px 16px 0px, rgb(255, 255, 255) -0.2px -1px 1px 0px inset, rgba(0, 0, 0, 0.2) 0.5px 0.7px 2.5px 0px inset, rgba(0, 0, 0, 0.05) -1px -3px 8px 0px inset, rgba(0, 0, 0, 0.1) 0.5px 2px 4px 0px inset, rgba(0, 0, 0, 0.1) 1px 6px 6px 2px inset'
  shadow-4: 'rgba(0, 0, 0, 0) 0px 2px 12px 0px'
  shadow-5: 'rgba(0, 0, 0, 0.1) 0px 6px 20px 0px'
layout:
  measure: '1430px'
  gridColumns: 4
  navHeight: '96px'
  navPosition: 'static'
motion:
  duration: '0.3s'
  easing: 'cubic-bezier(0.2, 0, 0, 1)'
backgrounds:
  wash: 'linear-gradient(rgb(255, 255, 255) 39.9%, rgb(248, 248, 248) 100%)'
components:
  button:
    background: '{colors.primary}'
    radius: '{rounded.button}'
    padding: '0px 16px'
    active:
      color: '#000000'
    focus:
      color: '#222222'
    focus-visible:
      color: '#222222'
    hover:
      color: '#222222'
  surface:
    background: '{colors.card}'
    border: '{colors.border}'
  link:
    padding: '0px 0px 0px 2px'
    focus:
      color: '#ff385c'
    focus-visible:
      color: '#ffffff'
    hover:
      color: '#ff385c'
provenance:
  brand: 'Airbnb'
  source: 'https://www.airbnb.com/'
  capturedAt: '2026-08-29T04:34:00.391Z'
  method: 'playwright/chromium 151.0.7922.34 computed styles @ 1440x900, 768x1024, 390x844 (light + dark)'
  harvestVersion: 8
  clusterVersion: 20
  screenshot: './source.webp'
---

## Overview

Warm marketplace neutrals with a single rose accent and a soft radius on
everything. The palette is quiet so that photography can carry the page.

Reach for this when listings and imagery are the content and the interface is
scaffolding around them.

## Colors

White canvas with `#222222` body copy at 15.91:1 — a soft near-black rather than
pure — and a muted tier at `#6c6c6c`, 5.25:1. Surfaces are `#f7f7f7`, borders
`#dddddd` at 1.36:1.

The accent is the rose `#da1249` at 5.04:1. Two honesty notes on it. First, it
was found in text rather than on a filled control, so verify before building a
button from it. Second, the extractor considered and **rejected** `#0073e5` — a
blue appearing on a single interactive fill — because a brand colour recurs and a
one-off is a promotion. Both facts are recorded in the capture rather than
resolved silently.

No state colours were observed on this page.

## Typography

Airbnb Cereal VF at weight 400 for body and 500 for headings — one variable
family doing both jobs, with weight rather than family carrying the difference.

**A caveat.** The most-typed size is 12px, which on a page dominated by imagery
is caption and navigation text rather than prose. Read the larger steps of the
scale as the reading sizes.

## Layout

**No spacing grid.** The best candidate explains 68.2% of observed values: 2, 4,
5, 8, 10, 11, 12, 16, 20, 24. Close to a 4px rhythm with enough odd values to
break it.

**A 1430px measure** — the widest in the registry, agreed by 56% of observed
content widths — with four-column card grids and a **96px static** nav carrying
only five links.

**Section structure could not be read.** The children of the content root do not
partition it, which is what an app shell looks like from the outside: the page
is assembled at runtime rather than laid out as a document. Measure, grid, nav
and motion were all measured independently and stand; hero and section rhythm
are withheld rather than guessed.

## Elevation & Depth

`rgba(0, 0, 0, 0.1) 0px 3px 2.5px` — a small, tight, slightly-offset shadow.
Cards sit just above the page rather than floating over it, which is right when
the card is mostly a photograph.

**One barely-there fade**, `#ffffff` to `#f8f8f8`, linear. No pattern, no
compositing, no tint. The page is effectively flat, and the photography carries
every bit of visual interest.

## Shapes

Radii of 4, 8, 12, 32 and 40px, with buttons at 4px. The wide range is the tell:
small radii for controls, large ones for image containers.

## Components

Buttons are padded `0px 16px` — horizontal only, with height coming from line
box rather than padding. All four states are declared on buttons.

**0.3s cubic-bezier(0.2, 0, 0, 1)** on 34 controls, about half of what animates.

## Do's and Don'ts

- **Do** keep `#222222` rather than black. The softness is what makes the
  neutrals feel warm.
- **Do** use the large radii on media and the small ones on controls.
- **Do** hold content to 1430px, the widest measure in the registry.
- **Don't** treat 12px as the reading size — that measurement is chrome.
- **Don't** promote the rejected `#0073e5` to an accent. It appeared once, and
  once is a campaign rather than a system.
- **Don't** infer a page structure from this file. The section layout could not
  be read — this is an app shell — so hero and rhythm are absent by measurement,
  not by oversight.

**What this file does not constrain:** almost all of the page structure, and
deliberately so. Take the colour, type and shape language; the layout is yours.

<!-- specimen:base v3 · generated · shared by every file in this registry · edit src/lib/base-md.mjs, then run `npm run base` -->

### The base

*Shared by every file in this registry; only the counts below are this
file's.*

**Budget.** 6 colours, 6 radii, 10 spacing steps, 6 type steps, 2 weights, 5
shadows and one easing curve. That is the whole design — a colour, radius,
shadow or curve not on that list is one you invented. It has no spacing grid,
so use the steps it observed rather than rounding them into a tidy 8px rhythm.
An absence here is an instruction rather than a gap: fill nothing in from
convention.

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
