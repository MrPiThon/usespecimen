---
name: 'Vivid Editorial'
version: '0.1.0'
description: 'Newsroom energy: near-black on white with an electric violet doing all the signalling.'
categories:
  - editorial
  - marketing
colors:
  background: '#ffffff'
  foreground: '#131313'
  card: '#f6f6f6'
  mutedForeground: '#4a4a4a'
  primary: '#3cffd0'
  primaryForeground: '#000000'
  border: '#e9e9e9'
  surface-1: '#f6f6f6'
  text-1: '#000000'
  text-2: '#131313'
  text-3: '#4a4a4a'
  text-4: '#636363'
  dark-background: '#131313'
  dark-foreground: '#ffffff'
  dark-card: '#1a1a1a'
  dark-primary: '#3cffd0'
  dark-primaryForeground: '#000000'
  dark-border: '#313131'
typography:
  fontFamily: '__fkRomanStandard_cfceed, __fkRomanStandard_Fallback_cfceed, Georgia, serif, Georgia, serif'
  headingFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"'
  baseSize: '16px'
  lineHeight: 1.3
  weight: 400
  headingWeight: 600
  letterSpacing: '-0.16px'
  scale:
    4xs: '11px'
    3xs: '12px'
    2xs: '13.008px'
    xs: '14px'
    sm: '15px'
    base: '16px'
    lg: '18px'
    xl: '20px'
    2xl: '24px'
    3xl: '26px'
    4xl: '31px'
    5xl: '65px'
  roles:
    body:
      fontFamily: '__fkRomanStandard_cfceed, __fkRomanStandard_Fallback_cfceed, Georgia, serif, Georgia, serif'
      fontSize: '16px'
      fontWeight: 400
      lineHeight: 1.3
      letterSpacing: '-0.16px'
    body-sm:
      fontFamily: '__polySans_9afc27, __polySans_Fallback_9afc27, Helvetica, Arial, sans-serif, Arial, sans-serif'
      fontSize: '14px'
      fontWeight: 400
      lineHeight: 1.3
    caption:
      fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"'
      fontSize: '13.01px'
      fontWeight: 400
      lineHeight: 1.5
    caption-sm:
      fontFamily: '__polySans_9afc27, __polySans_Fallback_9afc27, Helvetica, Arial, sans-serif, Arial, sans-serif'
      fontSize: '11px'
      fontWeight: 400
      lineHeight: 1.2
      letterSpacing: '1.1px'
    body-lg:
      fontFamily: '__fkRomanStandard_cfceed, __fkRomanStandard_Fallback_cfceed, Georgia, serif, Georgia, serif'
      fontSize: '18px'
      fontWeight: 400
      lineHeight: 1.2
    lead:
      fontFamily: '__fkRomanStandard_cfceed, __fkRomanStandard_Fallback_cfceed, Georgia, serif, Georgia, serif'
      fontSize: '20px'
      fontWeight: 400
      lineHeight: 1.2
    lead-lg:
      fontFamily: '__polySans_9afc27, __polySans_Fallback_9afc27, Helvetica, Arial, sans-serif, Arial, sans-serif'
      fontSize: '24px'
      fontWeight: 300
      lineHeight: 1.1
      letterSpacing: '0.24px'
    h2:
      fontFamily: '__polySans_9afc27, __polySans_Fallback_9afc27, Helvetica, Arial, sans-serif, Arial, sans-serif'
      fontSize: '24px'
      fontWeight: 700
      lineHeight: 1.1
      letterSpacing: '0.24px'
    h3:
      fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"'
      fontSize: '8px'
      fontWeight: 600
      lineHeight: 1.4
    button:
      fontFamily: '__polySans_9afc27, __polySans_Fallback_9afc27, Helvetica, Arial, sans-serif, Arial, sans-serif'
      fontSize: '14px'
      fontWeight: 400
      lineHeight: 1.3
    link:
      fontFamily: '__polySans_9afc27, __polySans_Fallback_9afc27, Helvetica, Arial, sans-serif, Arial, sans-serif'
      fontSize: '18px'
      fontWeight: 700
      lineHeight: 1
    mono:
      fontFamily: '__polySansMono_0b836e, __polySansMono_Fallback_0b836e, "Courier New", Courier, monospace, Arial, sans-serif'
      fontSize: '11px'
      fontWeight: 400
      lineHeight: 1.3
rounded:
  sm: '2px'
  md: '3px'
  lg: '24px'
  button: '2px'
  pill: '50%'
spacing:
  s1: '6px'
  s2: '8px'
  s3: '10px'
  s4: '12px'
  s5: '15px'
  s6: '16px'
  s7: '20px'
  s8: '24px'
  s9: '30px'
  s10: '40px'
elevation:
  shadow-1: 'rgba(0, 0, 0, 0) 0px -1px 0px 0px inset'
  shadow-2: 'rgb(82, 0, 255) 0px -1px 0px 0px inset'
  shadow-3: 'rgb(19, 19, 19) 0px -1px 0px 0px inset'
  shadow-4: 'rgba(0, 0, 0, 0) 0px 0px 0px 0px inset'
  shadow-5: 'rgba(0, 0, 0, 0.2) 0px 0px 18px 0px'
layout:
  measure: '800px'
  gridColumns: 2
  navHeight: '36px'
  navPosition: 'absolute'
motion:
  duration: '0.1s'
  easing: 'ease'
components:
  button:
    background: '{colors.primary}'
    foreground: '{colors.primaryForeground}'
    radius: '{rounded.button}'
    padding: '10px 18px'
    active:
      color: '#ffffff'
      backgroundColor: '#2c6415'
      borderColor: 'rgba(162, 192, 169, 0.5)'
    focus:
      color: '#ffffff'
      borderColor: '#68b631'
    focus-visible:
      borderColor: '#3cffd0'
      outlineColor: '#ffffff'
    hover:
      color: '#ffffff'
      borderColor: '#68b631'
  surface:
    background: '{colors.card}'
    border: '{colors.border}'
  link:
    padding: '14px 0px 14px 14px'
    focus:
      outlineColor: '#000000'
    hover:
      color: '#131313'
      boxShadow: 'inset 0 -1px 0 0 #5200ff'
provenance:
  brand: 'The Verge'
  source: 'https://www.theverge.com/'
  capturedAt: '2026-08-29T03:23:47.835Z'
  method: 'playwright/chromium 151.0.7922.34 computed styles @ 1440x900, 768x1024, 390x844 (light + dark)'
  harvestVersion: 6
  clusterVersion: 15
---




## Overview

Newsroom energy: near-black on white, a serif for reading, and an electric
violet that does every piece of signalling on the page.

Reach for this when there is a lot of text, it changes constantly, and readers
need to be pulled through it.

## Colors

White canvas, `#131313` body copy at 18.58:1, and a three-step text ladder down
through `#4a4a4a` and `#636363` to 6.01:1 — every tier still comfortably legible,
which is what a page of dense headlines needs.

The accent is `#5200ff`, a genuinely electric violet at 7.49:1. It carries white
at the same ratio, so it works as a fill and as text, and at that saturation it
does not need size to be noticed.

Surfaces are `#f6f6f6`; borders `#e9e9e9` at 1.21:1.

## Typography

A serif for body — `fkRomanStandard` at 16px with a tight 1.3 line height and
`-0.16px` tracking — under a geometric sans, `polySans`, at weight 700 for
headlines. Serif body with sans display is the classic editorial pairing, and the
1.3 leading is what keeps a dense homepage from becoming airy.

## Layout

**No spacing grid.** The best candidate explains 56.9% of observed values. The
run is 6, 8, 10, 12, 15, 16, 20, 24, 30, 40 — a publication laid out by
component rather than by step.

**An 800px measure** with two-column grids — narrow for a homepage this busy,
which is what keeps a dense wall of headlines readable. The nav is **36px**, the
shortest here, and absolutely positioned over the content.

**Section structure could not be read**: the content root does not partition
into sections, so hero and section rhythm are withheld. The measure, grid and
nav were measured independently and stand.

## Elevation & Depth

Almost none. The declared shadows are inset hairlines like
`rgba(0, 0, 0, 0) 0px -1px 0px inset` — rules drawn as shadows rather than
elevation. Nothing floats.

## Shapes

Radii of 2, 3 and 24px, and buttons at **50%** — fully circular. Small sharp
corners on containers with circular controls is an unusual and very recognisable
combination.

## Components

Buttons take `10px 24px`; links `14px 0px 14px 14px`, with the asymmetry giving
room for a leading marker. Buttons declare all four states, links only hover.

**0.1s ease**, but on a single control. Motion is essentially absent from this
page; do not build a system of transitions on one measurement.

## Do's and Don'ts

- **Do** keep the violet at full saturation. A muted version stops working as a
  signal in a page this dense.
- **Do** pair the serif body with a sans display. Collapsing to one family loses
  the editorial character entirely.
- **Don't** loosen the 1.3 line height. The density is the point.
- **Don't** round the containers. Sharp boxes with circular buttons is the
  signature.



