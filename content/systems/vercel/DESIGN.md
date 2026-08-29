---
name: 'Monochrome Inversion'
version: '0.1.0'
description: 'Achromatic platform design that inverts whole: near-white and near-black, a geometric sans, and colour reserved for focus and status.'
categories:
  - developer-tools
  - saas
  - marketing
colors:
  background: '#fafafa'
  foreground: '#171717'
  mutedForeground: '#4d4d4d'
  primary: '#0072f5'
  text-1: '#171717'
  text-2: '#4d4d4d'
  dark-background: '#000000'
  dark-foreground: '#ededed'
  dark-card: '#171717'
  dark-mutedForeground: '#a1a1a1'
  dark-primary: '#52a8ff'
typography:
  fontFamily: 'GeistSans, "GeistSans Fallback"'
  headingFamily: 'GeistSans, "GeistSans Fallback"'
  baseSize: '14px'
  lineHeight: 1.43
  weight: 400
  headingWeight: 450
  scale:
    xs: '11px'
    sm: '12px'
    base: '14px'
    lg: '16px'
    xl: '24px'
    2xl: '32px'
    3xl: '48px'
    4xl: '56px'
    5xl: '64px'
  roles:
    body:
      fontFamily: 'GeistSans, "GeistSans Fallback"'
      fontSize: '14px'
      fontWeight: 400
      lineHeight: 1.43
    body-sm:
      fontFamily: 'GeistSans, "GeistSans Fallback"'
      fontSize: '11px'
      fontWeight: 500
      lineHeight: 1.82
      letterSpacing: '0.2px'
    body-lg:
      fontFamily: 'GeistSans, "GeistSans Fallback"'
      fontSize: '16px'
      fontWeight: 500
      lineHeight: 1.5
    h1:
      fontFamily: 'GeistSans, "GeistSans Fallback"'
      fontSize: '64px'
      fontWeight: 400
      lineHeight: 1
      letterSpacing: '-3.84px'
    h2:
      fontFamily: 'GeistSans, "GeistSans Fallback"'
      fontSize: '14px'
      fontWeight: 500
      lineHeight: 1.43
    link:
      fontFamily: 'GeistSans, "GeistSans Fallback"'
      fontSize: '14px'
      fontWeight: 400
      lineHeight: 1.43
    mono:
      fontFamily: '"Geist Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, "Liberation Mono", "DejaVu Sans Mono", "Courier New", monospace, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"'
      fontSize: '12px'
      fontWeight: 400
      lineHeight: 1.33
rounded:
  sm: '6px'
  button: '3.35544e+07px'
  pill: '3.35544e+07px'
spacing:
  s1: '2px'
  s2: '4px'
  s3: '6px'
  s4: '8px'
  s5: '12px'
  s6: '16px'
  s7: '20px'
  s8: '24px'
  s9: '40px'
  s10: '44px'
elevation:
  shadow-1: 'rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px, rgb(250, 250, 250) 0px 0px 0px 1px'
  shadow-2: 'rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgb(235, 235, 235) 0px 0px 0px 1px inset'
  shadow-3: 'rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgb(235, 235, 235) 0px 0px 0px 1px'
layout:
  measure: '1390px'
  sectionSpacing: '40px'
  navHeight: '64px'
  navPosition: 'sticky'
  heroHeight: '93vh'
  heroHeadingSize: '64px'
  heroAlign: 'left'
motion:
  duration: '0.1s'
  easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
components:
  button:
    background: '{colors.primary}'
    radius: '{rounded.button}'
    padding: '0px 8px 0px 4px'
    focus-visible:
      boxShadow: '0 0 0 2px hsla(0, 0%, 100%, 1), 0 0 0 4px hsla(212, 100%, 48%, 1)'
    hover:
      backgroundColor: '#0000000d'
  surface:
    background: '{colors.background}'
    border: '{colors.foreground}'
  link:
    padding: '2px'
    gap: '6px'
    focus:
      opacity: '1'
    hover:
      color: '#171717'
provenance:
  brand: 'Vercel'
  source: 'https://vercel.com/'
  capturedAt: '2026-08-29T03:26:36.066Z'
  method: 'playwright/chromium 151.0.7922.34 computed styles @ 1440x900, 768x1024, 390x844 (light + dark)'
  harvestVersion: 6
  clusterVersion: 15
---





## Overview

Achromatic platform design. Near-white and near-black, one geometric sans, and
almost no colour anywhere. The defining move is that the whole system inverts:
every colour role has a dark counterpart and nothing about the layout changes.

Reach for this when the interface should disappear behind the content.

## Colors

Light runs `#fafafa` canvas with `#171717` text at 17.18:1 and `#4d4d4d`
muted at 8.1:1. Dark runs `#000000` with `#ededed` at 17.94:1 and `#a1a1a1`
at 8.13:1.

The symmetry is the point: both schemes hold roughly 17:1 for body and 8:1 for
muted. Inverting this system is not a hue flip, it is a contrast-preserving
mirror, and matching those ratios matters more than matching the greys.

The accent is `#0072f5`, and where it lives says everything: it appears only in
the focus ring, never as a fill. The primary action itself is achromatic — black
on white, inverting to white on black — so the single saturated colour in the
whole system is spent telling you where the keyboard is.

It inverts too, and not by staying put: the ring lightens to `#52a8ff` in dark
mode. Holding a fixed accent across both schemes would sink it into the black
canvas, so the accent moves for the same reason the greys do.

## Typography

`GeistSans` at 14px with a compact 1.43 line height and weight 400. Small body
text, tightly led. Display sets `h1` at 64px, still at weight 400 — scale does
the work a heavier cut would do elsewhere. `Geist Mono` at 12px carries code.

## Layout

**No consistent spacing grid.** The best candidate base explains 45.5% of
observed values, the weakest of any system here. The run is 2, 4, 6, 8, 12, 16,
20, 24, 40, 44. Match the observed values rather than imposing a scale.

**1390px measure**, second only to Airbnb's 1430px — and it is the most
decisive: 60% of observed content widths land on it, the highest agreement of
any system measured. Sections
are only **40px** apart, which is why the page feels tight despite its width.

No repeating card grid was found. The hero is **0.93 viewports** with a 64px
left-aligned headline, two media elements and two filled calls to action, under
a **64px sticky** nav.

## Elevation & Depth

Flat by construction. Every observed box-shadow resolves to fully transparent —
`rgba(0, 0, 0, 0) 0px 0px 0px 0px` repeated, which is a framework shadow reset
that this page never overrides. Depth comes from the canvas-to-foreground
inversion, not from shadows.

## Shapes

A single 6px radius across surfaces, plus fully pilled controls. Chrome reports
the declared pill radius as `3.35544e+07px`, which is the browser's own
serialisation of a very large number rather than anything a designer typed.

## Components

Buttons take a 5% black wash on hover (`#0000000d`) and, on focus-visible, a
two-ring indicator: 2px white then 4px `#0072f5`. The white inner ring is what
keeps the blue legible against either canvas, so both rings are load-bearing.
Links darken to `hsla(0, 0%, 9%)` on hover.

**0.1s cubic-bezier(0.4, 0, 0.2, 1)** on 80 controls, 62% of what animates —
the standard material curve, run about twice as fast as it usually is.

## Do's and Don'ts

- **Do** keep it achromatic. Colour is reserved for focus and status, nothing else.
- **Do** preserve the contrast symmetry when inverting — about 17:1 for body and
  8:1 for muted in both schemes.
- **Don't** add drop shadows. This system is flat on purpose.
- **Don't** spend the blue on anything but focus. Filling a button with it would
  break the one rule the palette is built around.




