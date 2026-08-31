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
elevation:
  shadow-1: 'rgba(0, 0, 0, 0.22) 3px 5px 30px 0px'
layout:
  measure: '930px'
  sectionSpacing: '53px'
  gridColumns: 2
  navHeight: '44px'
  navPosition: 'fixed'
  heroHeadingSize: '56px'
  heroAlign: 'center'
motion:
  duration: '0.32s'
  easing: 'cubic-bezier(0.4, 0, 0.6, 1)'
backgrounds:
  wash: 'radial-gradient(100% 33% at 0% 100%, rgba(0, 0, 0, 0.5) 0%, rgba(255, 255, 255, 0))'
  backdropFilter: 'saturate(1.8) blur(20px)'
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
    focus:
      outlineColor: '#0071e3'
    focus-visible:
      color: '#000000'
    hover:
      color: '#000000'
provenance:
  brand: 'Apple'
  source: 'https://www.apple.com/'
  capturedAt: '2026-08-29T04:34:11.808Z'
  method: 'playwright/chromium 151.0.7922.34 computed styles @ 1440x900, 768x1024, 390x844 (light + dark)'
  harvestVersion: 8
  clusterVersion: 21
  screenshot: './source.webp'
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

**A 930px measure** — strikingly narrow for a page of this scale, and the reason
its full-bleed product imagery reads as wide: the text column beside it is not.
Sections sit **53px** apart with two-column grids.

The **44px fixed** nav is among the thinnest here and carries 234 links, almost
all of them inside its menus.

**The first section is 2.33 viewports tall, so no hero height is published.**
That is not one hero but a run of stacked product panels; it does carry a 56px
centred headline over four media elements. Treat the opening as a sequence you
scroll, not a view you land on.

**Section composition could not be described.** The page resolves to only three
sections — containers of 2100, 1764 and 957px, each holding several stacked
product panels — and shares over three items are not a distribution. Section
width, media emphasis and copy density are withheld rather than reported from a
handful. The measure, rhythm, grid and motion are independent measurements and
stand.

## Elevation & Depth

A single shadow, `rgba(0, 0, 0, 0.22) 3px 5px 30px`: wide, soft and offset
down-right. One shadow, used once, for the one thing that needs to float.

**A radial scrim rather than a decorative wash**: `#000000` at **50% alpha** out
to transparent white, covering 85% of painted background area. That is a
darkening layer for text over imagery, not a colour effect.

The chrome uses `backdrop-filter: saturate(1.8) blur(20px)` — the saturation
boost is what stops the translucent nav from going grey over photography.

## Shapes

Two radii, 8px and **980px**. The 980 is a pill expressed as a number large
enough to always win, and it is the signature — every control is a capsule.

## Components

Buttons take `0px 8px` padding, links `4px 20px 4px 0px` — the trailing space on
links leaves room for the chevron that follows them. Hover, focus, focus-visible
and active are all declared on links.

**0.32s cubic-bezier(0.4, 0, 0.6, 1)** on 232 controls, 94% of everything that
animates. A single curve governs essentially the whole page.

## Do's and Don'ts

- **Do** keep the text column narrow. A 930px measure beside full-bleed imagery
  is what makes the photography feel enormous.
- **Do** keep the nav thin and fixed. At 44px it is among the thinnest here,
  behind only The Verge.
- **Do** apply one curve everywhere. 0.32s governs 94% of what animates.
- **Don't** build a 2.33-viewport hero because the measurement mentions one.
  That opening is a run of stacked product panels, which is why its height is
  withheld rather than published.
- **Don't** read the section shares from this file; there were too few sections
  to describe.

**What this file does not constrain:** page composition, section order, or
content. It gives you a narrow measure against wide imagery, and one timing.

<!-- specimen:base v3 · generated · shared by every file in this registry · edit src/lib/base-md.mjs, then run `npm run base` -->

### The base

*Shared by every file in this registry; only the counts below are this
file's.*

**Budget.** 8 colours, 3 radii, 10 spacing steps, 12 type steps, 2 weights, 1
shadow and one easing curve. That is the whole design — a colour, radius,
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
