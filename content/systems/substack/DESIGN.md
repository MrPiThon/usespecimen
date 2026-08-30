---
name: 'Dispatch Orange'
version: '0.1.0'
description: 'A publishing system: warm orange on white, pill controls, and a display serif over system sans.'
categories:
  - editorial
  - saas
  - marketing
colors:
  background: '#ffffff'
  foreground: '#363737'
  card: '#c8c8c8'
  mutedForeground: '#777777'
  primary: '#ff6719'
  primaryForeground: '#363737'
  border: '#e6e6e6'
  text-1: '#363737'
  text-2: '#777777'
  gradient-1: '#3b374a'
  dark-background: '#161718'
  dark-foreground: '#ffffff'
  dark-card: '#1b1c1d'
  dark-mutedForeground: '#777777'
  dark-primary: '#ff6719'
  dark-primaryForeground: '#ffffff'
  dark-border: '#2d2e2f'
typography:
  fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"'
  headingFamily: 'Cahuenga, serif'
  baseSize: '15px'
  lineHeight: 1.4
  weight: 400
  headingWeight: 500
  scale:
    sm: '13px'
    base: '15px'
    lg: '20px'
    xl: '24px'
    2xl: '32px'
  roles:
    body:
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"'
      fontSize: '15px'
      fontWeight: 400
      lineHeight: 1.4
    body-sm:
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"'
      fontSize: '13px'
      fontWeight: 400
      lineHeight: 1.31
    h1:
      fontFamily: '"SF Pro Display", -apple-system-headline, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"'
      fontSize: '20px'
      fontWeight: 700
      lineHeight: 1.2
    h3:
      fontFamily: 'Cahuenga, serif'
      fontSize: '32px'
      fontWeight: 500
      lineHeight: 1.24
    h4:
      fontFamily: 'Cahuenga, serif'
      fontSize: '24px'
      fontWeight: 500
      lineHeight: 1.25
    button:
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"'
      fontSize: '15px'
      fontWeight: 600
      lineHeight: 1.33
    link:
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"'
      fontSize: '15px'
      fontWeight: 500
      lineHeight: 1.33
rounded:
  sm: '8px'
  md: '12px'
  button: '9999px'
  pill: '9999px'
spacing:
  base: '4px'
  s1: '2px'
  s2: '4px'
  s3: '6px'
  s4: '8px'
  s5: '12px'
  s6: '16px'
  s7: '20px'
  s8: '24px'
  s9: '32px'
  s10: '48px'
elevation:
  shadow-1: 'rgba(255, 255, 255, 0.2) 0px 1px 0px 0px inset, rgba(0, 0, 0, 0.1) 0px -1px 0px 0px inset'
  shadow-2: 'rgba(0, 0, 0, 0.1) 0px 4px 6px -1px, rgba(0, 0, 0, 0.06) 0px 2px 4px -1px'
layout:
  measure: '570px'
motion:
  duration: '0.25s'
  easing: 'cubic-bezier(0.19, 1, 0.22, 1)'
backgrounds:
  wash: 'linear-gradient(rgba(59, 55, 74, 0.75), rgba(59, 55, 74, 0.75))'
components:
  button:
    background: '{colors.primary}'
    foreground: '{colors.primaryForeground}'
    radius: '{rounded.button}'
    padding: '0px 8px'
    gap: '8px'
  surface:
    background: '{colors.card}'
    border: '{colors.border}'
provenance:
  brand: 'Substack'
  source: 'https://substack.com/'
  capturedAt: '2026-08-29T04:53:56.476Z'
  method: 'playwright/chromium 151.0.7922.34 computed styles @ 1440x900, 768x1024, 390x844 (light + dark)'
  harvestVersion: 8
  clusterVersion: 17
  screenshot: './source.webp'
  screenshotDark: './source-dark.webp'
---

## Overview

A publishing system: warm orange on white, fully rounded controls, and a display
serif over the system sans. Tight 1.4 leading on a strict 4px grid.

Reach for this when the product is writing and the interface should feel like a
masthead rather than an app.

## Colors

`#ff6719` — a warm orange, closer to vermilion than to amber — filling controls
that carry **`#363737` labels rather than white**. Dark-on-orange is the
pairing.

Body text is `#363737` at **11.94:1**, a soft near-black, with a muted tier at
`#777777`, 4.48:1. Borders are `#e6e6e6`; surfaces `#c8c8c8`, which is a
notably dark card value for a white page.

A **dark palette** was observed and is carried in the `dark-` tokens.

## Typography

**The system sans at 15px**/1.4 weight 400 — no custom body face at all, which
loads instantly and reads as native. Headings are **Cahuenga**, a serif, at
weight 500.

Serif display over system sans is the entire typographic idea, and the 1.4
leading keeps a feed dense.

The scale is short and clean: 13, 15, 20, 24, 32.

## Layout

**A 4px base unit** explaining **94%** of observed spacing, and a **570px
measure** — a reading column, not a marketing width.

**Section structure could not be read.** The content root does not partition
into sections, which is what an application shell looks like from outside, so
hero, rhythm and section composition are withheld rather than guessed. The
measure and motion were measured independently and stand.

## Elevation & Depth

A **bevel**: `rgba(255, 255, 255, 0.2) 0 1px 0 inset` over
`rgba(0, 0, 0, 0.1) 0 -1px 0 inset` on 14 elements — light on the top edge, dark
on the bottom, which reads as a raised physical control. Alongside it a
conventional card shadow, `0 4px 6px -1px` over `0 2px 4px -1px`, on 11.

The canvas carries a flat `rgba(59, 55, 74, 0.75)` wash over 42% of painted
background area.

## Shapes

Radii of 8 and 12px only, with buttons **fully rounded at 9999px**. Pill
controls against gently rounded containers.

## Components

Buttons take `0px 8px` padding at the pill radius with an 8px gap, across 24
elements — the best-evidenced component token in this file.

**Motion is 0.25s** on `cubic-bezier(0.19, 1, 0.22, 1)`, a strongly decelerating
curve, across 64 controls.

No state rules could be read: all thirteen stylesheets are cross-origin.

## Do's and Don'ts

- **Do** put `#363737` on the orange, not white.
- **Do** keep the system sans for body. Loading a custom text face would work
  against the immediacy this design is built on.
- **Do** keep buttons fully rounded against 8–12px containers. The contrast
  between the two is the shape language.
- **Don't** loosen the 1.4 leading; the density suits a feed.
- **Don't** read the absent state styles as an absence of states — none of this
  site's CSS was readable.

**What this file does not constrain:** page structure, which could not be read
here.

<!-- specimen:base v2 · generated · shared by every file in this registry · edit src/lib/base-md.mjs, then run `npm run base` -->

### The base

*Shared by every file in this registry; only the counts below are this
file's.*

**Budget.** 7 colours, 7 more for its dark scheme, 3 radii, 10 spacing steps,
5 type steps, 2 weights, 2 shadows and one easing curve. That is the whole
design — a colour, radius, shadow or curve not on that list is one you
invented. An absence here is an instruction rather than a gap: fill nothing in
from convention.

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
  section the same width, centred, at the same padding; not a filled button
  beside an outlined one under the headline, either of them ending in an arrow.
- **Surface** — no indigo-to-violet-to-pink gradient; no gradient-filled
  heading; no blurred glow behind the hero; no glass panel on every card; no
  emoji standing in for an icon; no icon in a tinted rounded square; no fake
  browser or terminal chrome — traffic-light dots, a filename bar — around a
  code sample; no `scale(1.05)` on hover.

The tell under all of them is uniformity — one radius, one border, one shadow,
one gap everywhere, because nothing was decided.

<!-- /specimen:base -->
