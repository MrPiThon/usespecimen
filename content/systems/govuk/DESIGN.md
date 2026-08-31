---
name: 'Civic Sans'
version: '0.1.0'
description: 'Function-first public service design: zero ornament, zero radius, maximum contrast, unusually large body type.'
categories:
  - public-sector
colors:
  background: '#ffffff'
  foreground: '#0b0c0c'
  card: '#f4f8fb'
  primary: '#0f7a52'
  primaryForeground: '#ffffff'
  border: '#cecece'
  surface-1: '#f4f8fb'
  text-1: '#0b0c0c'
typography:
  fontFamily: '"GDS Transport", arial, sans-serif'
  headingFamily: '"GDS Transport", arial, sans-serif'
  baseSize: '19px'
  lineHeight: 1.32
  weight: 400
  headingWeight: 700
  scale:
    xs: '13.3333px'
    sm: '16px'
    base: '19px'
    lg: '21px'
    xl: '24px'
    2xl: '28.5px'
    3xl: '32px'
    4xl: '36px'
    5xl: '40px'
    6xl: '50px'
    7xl: '64px'
  roles:
    body:
      fontFamily: '"GDS Transport", arial, sans-serif'
      fontSize: '19px'
      fontWeight: 400
      lineHeight: 1.32
    body-sm:
      fontFamily: '"GDS Transport", arial, sans-serif'
      fontSize: '16px'
      fontWeight: 400
      lineHeight: 1.25
    h2:
      fontFamily: '"GDS Transport", arial, sans-serif'
      fontSize: '36px'
      fontWeight: 700
      lineHeight: 1.11
    button:
      fontFamily: '"GDS Transport", arial, sans-serif'
      fontSize: '19px'
      fontWeight: 400
      lineHeight: 1
    link:
      fontFamily: '"GDS Transport", arial, sans-serif'
      fontSize: '19px'
      fontWeight: 700
      lineHeight: 1.32
rounded:
  button: '0px'
spacing:
  s1: '5px'
  s2: '8px'
  s3: '9px'
  s4: '10px'
  s5: '15px'
  s6: '19px'
  s7: '20px'
  s8: '30px'
  s9: '50px'
  s10: '60px'
elevation:
  shadow-1: 'rgb(11, 12, 12) 0px 3px 0px 0px'
  shadow-2: 'rgb(8, 61, 41) 0px 2px 0px 0px'
layout:
  measure: '610px'
  gridColumns: 3
  navHeight: '62px'
  navPosition: 'static'
  sectionWidth: 'contained'
  sectionMedia: 'none'
  sectionCopy: 'sparse'
  heroHeight: '12vh'
components:
  button:
    background: '{colors.primary}'
    foreground: '{colors.primaryForeground}'
    radius: '0px'
    padding: '8px 10px 7px 10px'
    borderWidth: '1px'
    active:
      color: '#ffffff'
    focus:
      borderColor: '#ffdd00'
      boxShadow: 'inset 0 0 0 1px #ffdd00'
      outlineColor: 'rgba(0, 0, 0, 0)'
    focus-visible:
      color: '#0b0c0c'
      backgroundColor: '#ffdd00'
      borderColor: '#ffdd00'
      boxShadow: 'none'
      outlineColor: 'rgba(0, 0, 0, 0)'
    hover:
      color: '#ffffff'
  surface:
    background: '{colors.card}'
    border: '{colors.border}'
  link:
    active:
      color: '#0b0c0c'
    focus:
      color: '#0b0c0c'
      backgroundColor: '#ffdd00'
      boxShadow: '0 -2px #ffdd00,0 4px #0b0c0c'
      outlineColor: 'rgba(0, 0, 0, 0)'
    hover:
      color: '#0f385c'
provenance:
  brand: 'GOV.UK'
  source: 'https://www.gov.uk/'
  capturedAt: '2026-08-29T04:34:31.099Z'
  method: 'playwright/chromium 151.0.7922.34 computed styles @ 1440x900, 768x1024, 390x844 (light + dark)'
  harvestVersion: 8
  clusterVersion: 21
  screenshot: './source.webp'
---

## Overview

Public-service design optimised for being read by everyone, on anything,
including assistive technology and low-end hardware. Every decision trades
personality for legibility, on purpose.

Reach for this when the cost of a user failing to understand something is high.

## Colors

Near-black `#0b0c0c` on white at 19.59:1 — comfortably past AAA, and far beyond
what most systems attempt. The primary action green `#0f7a52` carries a white
label at 5.35:1.

There is no muted text tier at all. That absence is a design decision, not an
omission: hierarchy is carried by size and weight so that no information is
encoded in a lower-contrast grey.

Borders are `#cecece` at 1.57:1 and are purely decorative.

## Typography

`GDS Transport` at 19px — substantially larger than typical web body copy, and
the single most consequential choice in the system. Line height is 1.32, body
weight 400, headings 700.

The scale runs seven steps from 13.3px to 64px. The jump from body to the
largest heading is deliberately wide.

## Layout

**No spacing grid in the current capture.** The best candidate explains 74% of
observed values, just under the threshold — and this system is the registry's
known boundary case: it has measured either side of the line across captures,
which is why the clusterer applies hysteresis here. The observed run is 5, 8, 9,
10, 15, 19, 20, 30, 50, 60, and the 5px rhythm is visible in it even though it
does not explain enough of the page to be published as a base.

**A 610px measure** — less than half the width of the widest system in this
registry, and the single most consequential number in the file. This is a
reading column, sized for prose rather than for cards.

The page runs **fifteen sections** at a 3-column grid, behind a **62px static**
nav carrying 25 links. There is no hero in the marketing sense: the first
section is 0.12 viewports and carries **no heading at all**, because the page
opens on search and links rather than on a headline.

**Section composition across fifteen sections: contained, no imagery, sparse
copy.** Not one section bleeds, not one carries a repeating group, and **not one
is image-led** — there is no content photography on this page at all. The median
section holds **74 characters**.

Fifteen short, contained, text-only blocks in a 610px column is the entire
layout system. It is austere by design and does not want decorating.

## Elevation & Depth

No blur anywhere. Buttons carry a solid offset block —
`rgb(11, 12, 12) 0px 3px 0px 0px` — which reads as a physical edge rather than a
shadow, and stays visible in forced-colours mode.

**No background image, gradient or pattern anywhere on the page.** Not one
element carries a `background-image`, and there is no `filter`, `backdrop-filter`,
`mask-image` or blend mode in use.

The canvas is flat colour. This is not a gap in the capture — it was checked —
and adding a subtle gradient "for depth" would be as wrong here as adding a
transition.

## Shapes

No border radius. Not on buttons, not on inputs, not on panels. This is the
system's most recognisable trait.

## Components

Buttons are square, green-filled, with a white label and the solid offset edge.
Surfaces are plain white separated by rules.

The focus state is the most distinctive thing in the system and the reason to
copy it: links on focus take a `#ffdd00` yellow background with `#0b0c0c`
text and a `0 -2px #ffdd00, 0 4px #0b0c0c` box-shadow that draws a solid black
underline. The native outline is suppressed in favour of it. Reproduce this
exactly — it is engineered to survive high-contrast modes and to be unmissable.

**Nothing on this page declares a transition.** Not one control, at any state.
Hover and focus changes are instantaneous.

This is not an omission in the capture — it is the system. Adding a 150ms ease
because it feels polished would be the single most un-GOV.UK thing you could do.

## Do's and Don'ts

- **Do** keep body copy at 19px. Shrinking it to 16px breaks the system's
  central promise.
- **Do** carry hierarchy with size and weight.
- **Do** hold everything to the 610px column. It is less than half the width of
  the widest system here, and it is the most consequential number in the
  file.
- **Don't** round any corner. Sharpness is the identity.
- **Don't** add a muted grey text tier. Its absence is deliberate.
- **Don't** drop the yellow focus state or replace it with a default outline.
- **Don't** add photography. Fifteen sections, no imagery, no card grids, 74
  characters a section — this system is text and links.
- **Don't** add transitions. Not one control on this page declares one, and a
  150ms ease "for polish" is the single most un-GOV.UK change you could make.

**What this file does not constrain:** what the pages say, how many there are,
or how the content is organised. It constrains how it looks and how it behaves —
narrow, sharp, text-only, instant.

<!-- specimen:base v3 · generated · shared by every file in this registry · edit src/lib/base-md.mjs, then run `npm run base` -->

### The base

*Shared by every file in this registry; only the counts below are this
file's.*

**Budget.** 5 colours, 1 radius, 10 spacing steps, 11 type steps, 2 weights
and 2 shadows. That is the whole design — a colour, radius, shadow or curve
not on that list is one you invented. It declares no motion, so state changes
here are instant. It has no spacing grid, so use the steps it observed rather
than rounding them into a tidy 8px rhythm. Its buttons are square at 0px,
which is a measurement rather than a value nobody set. Its canvas carries no
pattern or wash, so leave it flat. An absence here is an instruction rather
than a gap: fill nothing in from convention.

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
