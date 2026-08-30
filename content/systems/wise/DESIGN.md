---
name: 'Currency Green'
version: '0.1.0'
description: 'A bright acid green filling controls that carry near-black labels, on a 2px radius.'
categories:
  - finance
  - saas
  - marketing
colors:
  background: '#ffffff'
  foreground: '#0e0f0c'
  card: '#ecefeb'
  mutedForeground: '#454745'
  primary: '#9fe870'
  primaryForeground: '#0e0f0c'
  border: '#e3e7e0'
  surface-1: '#ecefeb'
  text-1: '#0e0f0c'
  text-2: '#454745'
  success: '#163300'
  warning: '#3e3b07'
typography:
  fontFamily: 'Inter, Helvetica, Arial, sans-serif'
  headingFamily: 'Inter, Helvetica, Arial, sans-serif'
  baseSize: '14px'
  lineHeight: 1.57
  weight: 400
  headingWeight: 600
  letterSpacing: '0.14px'
  scale:
    base: '14px'
    lg: '15.2727px'
    xl: '16px'
    2xl: '17.2727px'
    3xl: '18px'
    4xl: '20px'
    5xl: '40px'
    6xl: '40.9092px'
    7xl: '44.9092px'
    up-9: '46px'
    up-10: '58.5143px'
    up-11: '300px'
  roles:
    body:
      fontFamily: 'Inter, Helvetica, Arial, sans-serif'
      fontSize: '14px'
      fontWeight: 400
      lineHeight: 1.57
      letterSpacing: '0.14px'
    body-sm:
      fontFamily: 'Inter, Helvetica, Arial, sans-serif'
      fontSize: '12px'
      fontWeight: 600
      letterSpacing: '0.08px'
    caption:
      fontFamily: 'Inter, Helvetica, Arial, sans-serif'
      fontSize: '10.5px'
      fontWeight: 400
      letterSpacing: '-0.084px'
    body-lg:
      fontFamily: 'Inter, Helvetica, Arial, sans-serif'
      fontSize: '16px'
      fontWeight: 400
      lineHeight: 1.5
      letterSpacing: '0.08px'
    lead:
      fontFamily: 'Inter, Helvetica, Arial, sans-serif'
      fontSize: '17.27px'
      fontWeight: 400
      lineHeight: 1.51
      letterSpacing: '0.0863633px'
    lead-lg:
      fontFamily: 'Inter, Helvetica, Arial, sans-serif'
      fontSize: '18px'
      fontWeight: 400
      lineHeight: 1.44
      letterSpacing: '0.09px'
    h1:
      fontFamily: '"Wise Sans", Inter, sans-serif'
      fontSize: '44.91px'
      fontWeight: 900
      lineHeight: 0.85
    h2:
      fontFamily: '"Wise Sans", Inter, sans-serif'
      fontSize: '40.91px'
      fontWeight: 900
      lineHeight: 0.85
    h3:
      fontFamily: '"Wise Sans", Inter, sans-serif'
      fontSize: '40px'
      fontWeight: 400
      lineHeight: 0.85
    h4:
      fontFamily: 'Inter, Helvetica, Arial, sans-serif'
      fontSize: '17.27px'
      fontWeight: 600
      lineHeight: 1.51
      letterSpacing: '0.0863633px'
    button:
      fontFamily: 'Inter, Helvetica, Arial, sans-serif'
      fontSize: '16px'
      fontWeight: 600
      lineHeight: 1.5
      letterSpacing: '-0.176px'
    link:
      fontFamily: 'Inter, Helvetica, Arial, sans-serif'
      fontSize: '16px'
      fontWeight: 600
      lineHeight: 1.5
      letterSpacing: '-0.176px'
    mono:
      fontFamily: 'Inter, sans-serif, helvetica, arial, monospace'
      fontSize: '300px'
      fontWeight: 400
      lineHeight: 0.09
rounded:
  sm: '2px'
  md: '10px'
  lg: '16px'
  xl: '17.0462px'
  2xl: '18.7693px'
  button: '2px'
  pill: '9999px'
spacing:
  s1: '3px'
  s2: '4px'
  s3: '8px'
  s4: '9px'
  s5: '10px'
  s6: '12px'
  s7: '16px'
  s8: '24px'
  s9: '34px'
  s10: '38px'
elevation:
  shadow-1: 'rgba(255, 255, 255, 0.2) 0px 0px 0px 1px'
  shadow-2: 'rgb(134, 134, 133) 0px 0px 0px 1px inset'
  shadow-3: 'rgba(0, 0, 0, 0.08) 0px 6px 20px 0px'
  shadow-4: 'rgba(14, 15, 12, 0.12) 0px 0px 0px 1px'
  shadow-5: 'rgba(22, 51, 0, 0.12) 0px 0px 0px 1px'
layout:
  measure: '1240px'
  sectionSpacing: '56px'
  gridColumns: 3
  navHeight: '76px'
  navPosition: 'relative'
  sectionWidth: 'full-bleed'
  sectionMedia: 'text-led'
  sectionCopy: 'dense'
  heroHeight: '156vh'
  heroHeadingSize: '89px'
  heroAlign: 'center'
motion:
  duration: '0.35s'
  easing: 'cubic-bezier(0.8, 0.05, 0.2, 0.95)'
backgrounds:
  maskImage: 'other'
components:
  button:
    background: '{colors.primary}'
    foreground: '{colors.primaryForeground}'
    radius: '{rounded.button}'
    padding: '8px 16px'
    active:
      backgroundColor: 'rgba(22,51,0,0.12941)'
    hover:
      backgroundColor: 'rgba(22,51,0,0.07843)'
  surface:
    background: '{colors.card}'
    border: '{colors.border}'
  link:
    padding: '9.38462px'
    focus-visible:
      color: '#0084b3'
      backgroundColor: 'transparent'
      borderColor: 'transparent'
provenance:
  brand: 'Wise'
  source: 'https://wise.com/'
  capturedAt: '2026-08-29T04:54:50.430Z'
  method: 'playwright/chromium 151.0.7922.34 computed styles @ 1440x900, 768x1024, 390x844 (light + dark)'
  harvestVersion: 8
  clusterVersion: 17
  screenshot: './source.webp'
---

## Overview

An acid green filling controls that carry near-black labels, on a 2px radius —
almost square. A centred 89px headline over a very tall hero, and dense body
copy at 14px.

Reach for this when the product is money and the brand needs to feel bright and
exact at the same time.

## Colors

`#9fe870` is the whole identity: a bright yellow-green, filling buttons that
carry **`#0e0f0c` labels rather than white**. Dark-on-bright is the pairing, and
inverting it to white-on-green would lose the contrast that makes it work.

Body text is `#0e0f0c` at **19.23:1**, with a single muted tier at `#454745`,
9.37:1 — a genuinely high floor. Surfaces are `#ecefeb`, borders `#e3e7e0`, both
faintly green rather than neutral grey.

`success` is `#163300`, a very dark forest, and `warning` `#3e3b07`. Both are
deep enough to carry text.

## Typography

Inter at **14px**/1.57 weight 400, with positive `0.14px` tracking — letters
opened up rather than tightened, which is unusual and suits small dense text.
Headings are the same family at weight 600.

**Twenty-five distinct sizes collapsed to twelve**, and the scale runs to a
300px step. Treat the top end as display sizes rather than as a ladder.

## Layout

**No spacing grid** — the best candidate explains 59% of observed values.

A **1240px measure** behind a 76px nav. The hero is **1.56 viewports** with an
**89px centred** headline: very tall and very large.

**Section composition: full-bleed, text-led, dense copy**, a median of 603
characters a section.

## Elevation & Depth

Rings rather than shadows: `rgba(255, 255, 255, 0.2) 0 0 0 1px` on 36 elements,
an inset grey ring, and pairs at `rgba(14, 15, 12, 0.12)` and
`rgba(22, 51, 0, 0.12)` — the second tinted green rather than neutral. One soft
`0 6px 20px` at 8% black is the only real lift.

No background gradient or pattern.

## Shapes

**Buttons at 2px** — very nearly square. The scale is 2, 10, 16, 17.05 and
18.77px, the fractional values coming from `rem` sizing.

## Components

Buttons take `8px 16px` padding, and their states are tinted with the same
green-black: `hover` at `rgba(22, 51, 0, 0.078)`, `active` at
`rgba(22, 51, 0, 0.129)`. Links sit at a 2px radius across 36 elements.

**Motion is 0.35s** on `cubic-bezier(0.8, 0.05, 0.2, 0.95)` — a slow, strongly
eased curve.

## Do's and Don'ts

- **Do** put near-black labels on the green. It is the pairing that makes the
  accent usable at all.
- **Do** keep corners at 2px. Rounding them undoes the precision.
- **Do** tint the neutrals green. `#ecefeb` is not grey.
- **Don't** use white text on `#9fe870`; the contrast collapses.
- **Don't** impose a spacing grid. This system does not keep one.

**What this file does not constrain:** section content and page structure.

<!-- specimen:base v3 · generated · shared by every file in this registry · edit src/lib/base-md.mjs, then run `npm run base` -->

### The base

*Shared by every file in this registry; only the counts below are this
file's.*

**Budget.** 8 colours, 6 radii, 10 spacing steps, 12 type steps, 2 weights, 5
shadows and one easing curve. That is the whole design — a colour, radius,
shadow or curve not on that list is one you invented. It has no spacing grid,
so use the steps it observed rather than rounding them into a tidy 8px rhythm.
Its canvas carries no pattern or wash, so leave it flat. An absence here is an
instruction rather than a gap: fill nothing in from convention.

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
