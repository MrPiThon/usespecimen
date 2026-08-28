---
name: 'Voltage Dark'
version: '0.1.0'
description: 'Dense dark product UI: near-black canvas, small tight type, and a lavender accent so restrained it survives only in focus rings.'
colors:
  background: '#08090a'
  foreground: '#d0d6e0'
  card: '#0f1011'
  mutedForeground: '#8a8f98'
  primary: '#5e6ad2'
  border: '#1c1d1e'
typography:
  fontFamily: '"Inter Variable", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif'
  headingFamily: '"Inter Variable", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif'
  baseSize: '13px'
  lineHeight: 1.85
  weight: 400
  headingWeight: 510
  letterSpacing: '-0.165px'
  scale:
    xs: '10px'
    sm: '12px'
    base: '13px'
    lg: '14px'
    xl: '15px'
    2xl: '16px'
    3xl: '18px'
    4xl: '24px'
    5xl: '32px'
    6xl: '48px'
    7xl: '64px'
    up-9: '72px'
rounded:
  sm: '4px'
  md: '6px'
  lg: '8px'
  xl: '9px'
  2xl: '12px'
  button: '9999px'
  pill: '9999px'
spacing:
  s1: '2px'
  s2: '4px'
  s3: '6px'
  s4: '7px'
  s5: '8px'
  s6: '10px'
  s7: '11px'
  s8: '12px'
  s9: '16px'
  s10: '32px'
components:
  button:
    background: '{colors.primary}'
    radius: '{rounded.button}'
  surface:
    background: '{colors.card}'
    border: '{colors.border}'
provenance:
  brand: 'Linear'
  source: 'https://linear.app/'
  capturedAt: '2026-08-28T22:26:46.603Z'
  method: 'playwright/chromium 151.0.7922.34 computed styles @ 1440x900'
  harvestVersion: 1
  clusterVersion: 3
---

## Overview

A dark, information-dense aesthetic for tools people keep open all day. The
canvas is near-black, type is small and tightly tracked, and the brand colour is
held back so far that it never fills a button on the marketing page.

Use it for keyboard-driven software where density is a feature.

## Colors

The canvas is `#08090a` — effectively black but not pure, which keeps large
fills from feeling like holes. Body text `#d0d6e0` sits at 13.64:1 and the muted
tier `#8a8f98` at 6.13:1, so both remain comfortably legible.

The accent is the lavender `#5e6ad2`, and finding it says something about the
system: it appears nowhere as a filled surface, only as a focus ring. A design
this restrained spends its brand colour on the one moment that needs it. No
foreground pairing is recorded here because the site never gave us one to
observe.

A single acid-yellow panel (`#e4f222`) appears once on the marketing page. It is
a campaign element, not a token, and it is deliberately excluded.

Borders are `#1c1d1e` at 1.18:1. Separation here is a small luminance step, not
a contrast boundary — correct for dark UI, but it means borders alone cannot
convey state.

## Typography

`Inter Variable` at 13px with a generous 1.85 line height and `-0.165px`
tracking. Small type with loose leading is what makes the density readable.

Headings use weight 510 — a variable-font axis value, not a named weight. The
scale runs twelve steps from 10px to 72px.

## Layout

**This system has no consistent spacing grid.** The best candidate base unit
explains only 67% of observed values, and the run includes 7px and 11px
alongside the expected 4, 8, 12, 16, 32.

Do not impose a grid it does not have; match the observed values instead.

## Elevation & Depth

Five distinct shadows, including inset treatments such as
`rgba(0, 0, 0, 0.2) 0px 0px 12px inset`. Depth is built with inner glow and
subtle luminance shifts rather than drop shadows, which read poorly on near-black.

## Shapes

Radii of 4, 6, 8, 9 and 12px across surfaces, with buttons fully pilled at
9999px. The contrast between rounded rectangles and pill buttons is intentional.

## Components

Buttons are pills. Their fills are neutral, not branded — the lavender is spent
on the focus ring instead. Surfaces sit a step above the canvas with a
`#1c1d1e` border.

## Do's and Don'ts

- **Do** keep type small and tracking tight; loosening either breaks the density.
- **Do** spend the lavender on focus and selection states rather than on fills.
  That restraint is the system, not an oversight.
- **Don't** invent a spacing scale. This system genuinely does not have one.
- **Don't** rely on border colour alone to indicate state at 1.18:1.
