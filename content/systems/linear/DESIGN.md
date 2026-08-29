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
  surface-1: '#0f1011'
  surface-2: '#161718'
  text-1: '#f7f8f8'
  text-2: '#d0d6e0'
  text-3: '#8a8f98'
  text-4: '#62666d'
  success: '#27a644'
  danger: '#f34e52'
  warning: '#e4f222'
typography:
  fontFamily: '"Inter Variable", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif'
  headingFamily: '"Inter Variable", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif'
  baseSize: '15px'
  lineHeight: 1.6
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
    3xl: '20px'
    4xl: '24px'
    5xl: '32px'
    6xl: '38px'
    7xl: '40px'
    up-9: '48px'
  roles:
    body:
      fontFamily: '"Inter Variable", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif'
      fontSize: '15px'
      fontWeight: 400
      lineHeight: 1.6
      letterSpacing: '-0.165px'
    body-sm:
      fontFamily: '"Inter Variable", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif'
      fontSize: '14px'
      fontWeight: 400
      lineHeight: 1.5
      letterSpacing: '-0.182px'
    caption:
      fontFamily: '"Inter Variable", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif'
      fontSize: '13px'
      fontWeight: 400
      lineHeight: 1.54
      letterSpacing: '-0.039px'
    caption-sm:
      fontFamily: '"Inter Variable", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif'
      fontSize: '12px'
      fontWeight: 510
      lineHeight: 1.4
    body-lg:
      fontFamily: '"Inter Variable", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif'
      fontSize: '18px'
      fontWeight: 400
      lineHeight: 1.6
      letterSpacing: '-0.165px'
    lead:
      fontFamily: '"Inter Variable", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif'
      fontSize: '20px'
      fontWeight: 400
      lineHeight: 1.33
      letterSpacing: '-0.24px'
    lead-lg:
      fontFamily: '"Inter Variable", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif'
      fontSize: '24px'
      fontWeight: 400
      lineHeight: 1.33
      letterSpacing: '-0.288px'
    h2:
      fontFamily: '"Inter Variable", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif'
      fontSize: '48px'
      fontWeight: 510
      lineHeight: 1
      letterSpacing: '-1.056px'
    h3:
      fontFamily: '"Inter Variable", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif'
      fontSize: '13px'
      fontWeight: 510
      lineHeight: 1.5
      letterSpacing: '-0.13px'
    h4:
      fontFamily: '"Inter Variable", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif'
      fontSize: '16px'
      fontWeight: 590
      lineHeight: 1.75
    button:
      fontFamily: '"Inter Variable", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif'
      fontSize: '16px'
      fontWeight: 510
      lineHeight: 2.75
    link:
      fontFamily: '"Inter Variable", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif'
      fontSize: '13px'
      fontWeight: 400
      lineHeight: 1.5
      letterSpacing: '-0.13px'
    mono:
      fontFamily: '"Berkeley Mono", ui-monospace, "SF Mono", Menlo, monospace'
      fontSize: '14px'
      fontWeight: 400
      lineHeight: 1.71
rounded:
  sm: '4px'
  md: '6px'
  lg: '8px'
  xl: '9px'
  2xl: '12px'
  button: '8px'
  pill: '9999px'
spacing:
  s1: '2px'
  s2: '4px'
  s3: '6px'
  s4: '7px'
  s5: '8px'
  s6: '10px'
  s7: '12px'
  s8: '16px'
  s9: '24px'
  s10: '32px'
components:
  button:
    background: '{colors.primary}'
    radius: '{rounded.button}'
    padding: '0px 7px'
    gap: '8px'
  surface:
    background: '{colors.card}'
    border: '{colors.border}'
  link:
    padding: '0px 12px'
provenance:
  brand: 'Linear'
  source: 'https://linear.app/'
  capturedAt: '2026-08-29T00:37:06.457Z'
  method: 'playwright/chromium 151.0.7922.34 computed styles @ 1440x900, 768x1024, 390x844 (light + dark)'
  harvestVersion: 4
  clusterVersion: 11
  screenshot: './source.webp'
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

The text ladder runs four steps — `#f7f8f8` at 18.73:1, `#d0d6e0` at 13.64:1,
`#8a8f98` at 6.13:1, `#62666d` at 3.45:1. Every step stays above 3:1, so the
quietest tier is still readable rather than decorative. Above the canvas only one
surface step is visible on this page, `#0f1011`; the system almost certainly has
more, but they appear in states this capture does not reach.

The accent is the lavender `#5e6ad2`, and finding it says something about the
system: it appears nowhere as a filled surface, only as a focus ring. A design
this restrained spends its brand colour on the one moment that needs it. No
foreground pairing is recorded here because the site never gave us one to
observe.

A single acid-yellow panel (`#e4f222`) appears once on the marketing page. It is
a campaign element, not a token, and it is deliberately excluded.

State colours survive in tinted panels and their borders: `#27a644` for success
and `#f34e52` for danger, both painting a surface and its edge. They are the
only saturated colours in the system that are neither brand nor decoration.

Borders are `#1c1d1e` at 1.18:1. Separation here is a small luminance step, not
a contrast boundary — correct for dark UI, but it means borders alone cannot
convey state.

## Typography

`Inter Variable` at 15px with a 1.6 line height and `-0.165px` tracking.
The tight tracking at a modest size is what lets the interface stay dense
without becoming cramped.

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
