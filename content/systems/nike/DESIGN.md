---
name: 'Kinetic Monochrome'
version: '0.1.0'
description: 'Black on white with a 76px Futura display step, pill controls and image-led sections. The only chromatic value on the page lives in the focus ring.'
categories:
  - e-commerce
  - marketing
colors:
  background: '#ffffff'
  foreground: '#111111'
  card: '#f5f5f5'
  mutedForeground: '#707072'
  primary: '#1151ff'
  border: '#111111'
  surface-1: '#f5f5f5'
  surface-2: '#e5e5e5'
  text-1: '#111111'
  text-2: '#707072'
typography:
  fontFamily: '"Helvetica Now Text", Helvetica, Arial, sans-serif'
  headingFamily: '"Nike Futura ND", "Helvetica Now Text Medium", Helvetica, Arial, sans-serif'
  baseSize: '16px'
  lineHeight: 1.5
  weight: 400
  headingWeight: 500
  scale:
    xs: '12px'
    sm: '14px'
    base: '16px'
    lg: '20px'
    xl: '24px'
    2xl: '40px'
    3xl: '76px'
  roles:
    body:
      fontFamily: '"Helvetica Now Text", Helvetica, Arial, sans-serif'
      fontSize: '16px'
      fontWeight: 400
      lineHeight: 1.5
    body-sm:
      fontFamily: '"Helvetica Now Text Medium", Helvetica, Arial, sans-serif'
      fontSize: '14px'
      fontWeight: 500
      lineHeight: 1.5
    caption:
      fontFamily: '"Helvetica Now Text Medium", Helvetica, Arial, sans-serif'
      fontSize: '12px'
      fontWeight: 500
      lineHeight: 1.5
    body-lg:
      fontFamily: '"Helvetica Now Display Medium", Helvetica, Arial, sans-serif'
      fontSize: '20px'
      fontWeight: 500
      lineHeight: 1.2
    lead:
      fontFamily: '"Helvetica Now Display Medium", Helvetica, Arial, sans-serif'
      fontSize: '24px'
      fontWeight: 500
      lineHeight: 1.2
    h1:
      fontFamily: '"Nike Futura ND", "Helvetica Now Text Medium", Helvetica, Arial, sans-serif'
      fontSize: '40px'
      fontWeight: 500
      lineHeight: 0.9
    h2:
      fontFamily: '"Nike Futura ND", "Helvetica Now Text Medium", Helvetica, Arial, sans-serif'
      fontSize: '40px'
      fontWeight: 500
      lineHeight: 0.9
    h3:
      fontFamily: '"Helvetica Now Display Medium", Helvetica, Arial, sans-serif'
      fontSize: '24px'
      fontWeight: 500
      lineHeight: 1.2
    button:
      fontFamily: '"Helvetica Now Display Medium", Helvetica, Arial, sans-serif'
      fontSize: '20px'
      fontWeight: 500
      lineHeight: 1.2
    link:
      fontFamily: '"Helvetica Now Text Medium", Helvetica, Arial, sans-serif'
      fontSize: '16px'
      fontWeight: 500
      lineHeight: 1.5
rounded:
  sm: '2px'
  md: '8px'
  lg: '24px'
  xl: '30px'
  button: '30px'
spacing:
  s1: '2px'
  s2: '4px'
  s3: '6px'
  s4: '8px'
  s5: '12px'
  s6: '16px'
  s7: '18px'
  s8: '24px'
  s9: '36px'
  s10: '48px'
elevation:
  shadow-1: 'rgb(229, 229, 229) 0px -1px 0px 0px inset'
  shadow-2: 'rgba(17, 17, 17, 0.06) 0px 4px 8px 0px, rgba(17, 17, 17, 0.03) 0px 0px 24px 4px'
layout:
  measure: '1340px'
  navHeight: '96px'
  navPosition: 'fixed'
  sectionWidth: 'mixed'
  sectionMedia: 'image-led'
  sectionCopy: 'sparse'
  heroHeight: '90vh'
  heroHeadingSize: '76px'
  heroAlign: 'left'
motion:
  duration: '0.3s'
  easing: 'ease'
components:
  button:
    background: '{colors.primary}'
    radius: '{rounded.button}'
    padding: '6px 16px'
    active:
      color: '#707072'
    focus:
      color: '#111111'
    focus-visible:
      boxShadow: 'rgb(17, 81, 255) 0px 0px 0px 2px'
    hover:
      color: '#707072'
  surface:
    background: '{colors.card}'
    border: '{colors.border}'
  link:
    padding: '6px 16px'
    focus-visible:
      boxShadow: '0 0 0 2px #1151FF'
    hover:
      color: '#111111'
provenance:
  brand: 'Nike'
  source: 'https://www.nike.com/'
  capturedAt: '2026-08-29T04:35:00.053Z'
  method: 'playwright/chromium 151.0.7922.34 computed styles @ 1440x900, 768x1024, 390x844 (light + dark)'
  harvestVersion: 8
  clusterVersion: 20
  screenshot: './source.webp'
---

## Overview

Monochrome and loud. Pure `#111111` on white, an enormous Futura display step,
pill-shaped controls, and photography doing all of the talking. There is
essentially no colour in this system — the one chromatic value on the page
appears in the focus ring and nowhere else.

Reach for this when the product is visual, the copy is short, and the imagery
has to carry the page.

## Colors

**A two-value text ladder and nothing else.** `#111111` on `#ffffff` at
**18.88:1**, and a single muted tier at `#707072`, 4.94:1. That is the whole
text palette. Surfaces step `#f5f5f5` then `#e5e5e5`.

Borders are `#111111` — the same value as body text. Edges here are drawn in
full-strength ink rather than in a tint, which is why controls read as printed
rather than as chrome.

**The accent, `#1151ff`, was found only in `button:focus-visible` and
`link:focus-visible`.** It is the sole chromatic value the crawler could
observe, and the site never fills a control with it, so no foreground pairing
could be measured. Treat it as a focus colour, not as a brand fill. If you need
a filled accent, you are adding something this system does not have.

No semantic success, danger or warning colours were observed.

## Typography

**Two families, sharply divided.** Helvetica Now Text at 16px/1.5 weight 400 for
body; Nike Futura ND at weight 500 for headings. The body face is neutral to the
point of invisibility so the display face can be the voice.

The scale is where the character sits: 12, 14, 16, 20, 24, **40, 76**. The jump
from 24 to 40 to 76 is not a smooth ladder — it is a deliberate gap between
interface text and display type, with nothing in between. Do not fill it in.

## Layout

**No spacing grid.** The best candidate explains only 63% of observed values;
the run is 2, 4, 6, 8, 12, 16, 18, 24, 36, 48. Match the observed values rather
than imposing a rhythm the system does not keep.

**A 1340px measure**, agreed by 47% of observed content widths, behind a **96px
fixed** nav carrying 248 links — as tall as any in the registry, and it
stays with you for the whole scroll.

**Section composition across nineteen sections: mixed width, image-led, sparse
copy.** Ten of nineteen bleed to the viewport and the rest hold the measure; six
carry a repeating group; **fourteen of nineteen are image-led**, and the median
section contains **96 characters**. That last number is the system: a Nike
section is a photograph with a few words on it, not a paragraph.

The hero, where a page has one, is **0.9 viewports and full bleed**, with a
**76px left-aligned** headline over one media element and two filled calls to
action.

## Elevation & Depth

Two registers. A `rgb(229, 229, 229) 0px -1px 0px inset` hairline that draws a
rule rather than a lift, on eight elements. And a genuine two-layer card shadow
— `rgba(17, 17, 17, 0.06) 0px 4px 8px` over `rgba(17, 17, 17, 0.03) 0px 0px 24px
4px` — a tight contact shadow under a wide ambient one.

Both are built from the ink colour at low alpha rather than from neutral black.

**No background image, gradient or pattern anywhere.** No filters, no blend
modes, no masks. The canvas is flat white and the photography does all the work.

Given how much imagery this system carries, the absence is deliberate: nothing
competes with the pictures.

## Shapes

Radii of 8, 24 and 30px, with **buttons at 30px**. At the observed button height
that is a fully rounded end without being a mathematical pill, which is why
controls read as soft but not as tablets.

## Components

Buttons and links share a box: `6px 16px` padding, 30px radius, no border. Both
were measured from a minority of their elements — most `<a>` and `<button>` on
the page are unstyled wrappers — so verify against the live site before treating
the padding as canonical.

Buttons declare all four states (hover, focus, focus-visible, active); links
declare hover and focus-visible.

**Motion is 0.3s ease**, on 39 controls and 91% of everything that animates. One
duration, one curve, applied almost everywhere.

## Do's and Don'ts

- **Do** keep the display step enormous and the gap below it empty. 76px over a
  24px interface size is the system; a tidy 32/40/48 ladder is not.
- **Do** let imagery carry the page and keep copy to a caption. Fourteen of
  nineteen sections are image-led with a 96-character median — writing
  paragraphs into this layout breaks it more surely than any colour change.
- **Do** draw borders in `#111111`. Softening them to a grey tint is the
  quickest way to make this look like a generic storefront.
- **Don't** fill anything with `#1151ff`. It was measured in focus rings only,
  and promoting it to a brand fill invents a colour this system does not use.
- **Don't** add a second muted text tier. Two values carry the whole hierarchy.
- **Don't** round corners past 30px or below 8px.

**What this file does not constrain:** section order, page composition, how many
sections a page has, the content of the imagery, or the copy itself. Those are
yours. The measurements above describe a language — an ink, a display gap, a
measure, a rhythm of image over text — not a page. Build your own pages in it.

<!-- specimen:base v3 · generated · shared by every file in this registry · edit src/lib/base-md.mjs, then run `npm run base` -->

### The base

*Shared by every file in this registry; only the counts below are this
file's.*

**Budget.** 6 colours, 4 radii, 10 spacing steps, 7 type steps, 2 weights, 2
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
