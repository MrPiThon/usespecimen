// Naming a measured colour, at two levels of precision.
//
// `hueFamily` in color.mjs already gives the broad word — green, blue, purple.
// This adds the specific one — emerald, indigo, violet — because "show me the
// systems with an emerald accent" is how people actually shop for a palette, and
// "green" covers everything from mint to forest.
//
// These names are DERIVED, not declared. The anchors below are a classification
// vocabulary, not tokens: no anchor hex is ever emitted as a value, and renaming
// one changes only how a measured colour is labelled. That keeps the filter on
// the measured side of the line, unlike categories.

import { toOklch } from './color.mjs';

/**
 * Anchors, matched on HUE ANGLE alone.
 *
 * Deliberately not nearest-deltaE: GOV.UK's #0f7a52 and Shopify's #36f4a4 are a
 * dark forest and a bright mint, far apart in lightness and chroma, and both are
 * unarguably green. Matching the full distance would file them under different
 * names and split a filter that should unite them. Hue is the part of a colour
 * its name actually describes.
 */
const ANCHORS = [
  ['red', 29], ['orange', 55], ['amber', 71], ['yellow', 96], ['lime', 122],
  ['green', 145], ['emerald', 158], ['teal', 175], ['cyan', 205], ['sky', 232],
  ['blue', 258], ['indigo', 272], ['violet', 292], ['purple', 310],
  ['fuchsia', 322], ['pink', 348], ['rose', 12],
];

/** Neutrals have no hue worth naming, so they are named by lightness instead. */
const NEUTRALS = [
  ['black', 0.20], ['charcoal', 0.45], ['grey', 0.78], ['silver', 0.93], ['white', 1.01],
];

/**
 * A colour with a little chroma is a tinted neutral, and designers already have
 * words for those. Naming #64748b "blue" is technically true and useless.
 *
 * Measured: blue-greys people call slate run 0.0116 to 0.0455 chroma, while real
 * hues start at 0.1101 (GOV.UK's green). The gap between is wide, so 0.07 sits
 * safely in it.
 */
const TINTED_MAX_CHROMA = 0.07;
const TINTS = { slate: ['teal', 'blue', 'indigo', 'violet', 'purple', 'sky', 'cyan'],
  stone: ['red', 'rose', 'orange', 'amber', 'yellow', 'pink', 'fuchsia'],
  sage: ['green', 'emerald', 'lime'] };

const CHROMA_FLOOR = 0.03;

/** Shortest distance around the 360-degree hue circle. */
const hueGap = (a, b) => {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
};

/**
 * The specific name for one colour: "emerald", "indigo", "charcoal".
 * @returns {string|null} null when the input cannot be read as a colour.
 */
export function shadeName(rgb) {
  if (!rgb) return null;
  const { L, C, h } = toOklch(rgb);
  if (C < CHROMA_FLOOR) {
    return (NEUTRALS.find(([, max]) => L < max) ?? NEUTRALS.at(-1))[0];
  }
  const hue = ANCHORS.reduce(
    (best, anchor) => (hueGap(h, anchor[1]) < hueGap(h, best[1]) ? anchor : best),
  )[0];
  if (C < TINTED_MAX_CHROMA) {
    return Object.keys(TINTS).find(tint => TINTS[tint].includes(hue)) ?? 'grey';
  }
  return hue;
}

/** Every shade name, in hue order, for a stable filter bar. Neutrals last —
 *  they are a different kind of answer and should not interleave with hues. */
export const SHADE_ORDER = [
  ...ANCHORS.map(a => a[0]),
  ...Object.keys(TINTS),
  ...NEUTRALS.map(n => n[0]),
];

/** Shades present across a set of facet objects, in vocabulary order, with
 *  counts. Same contract as categoryCounts: never offer a filter that matches
 *  nothing. */
export function shadeCounts(facetList) {
  const counts = new Map();
  for (const f of facetList) {
    if (f?.shade) counts.set(f.shade, (counts.get(f.shade) ?? 0) + 1);
  }
  return SHADE_ORDER
    .filter(id => counts.has(id))
    .map(id => ({ id, label: id[0].toUpperCase() + id.slice(1), count: counts.get(id) }));
}
