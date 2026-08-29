// Facets derived from the extracted tokens.
//
// This is the one search feature the token data makes nearly free and that a
// competitor cannot copy by scraping the files: you cannot compute "sharp,
// high-contrast, dark" from prose. Every facet below is read from measurements,
// never hand-tagged, so a system cannot be mis-filed and cannot go stale.

import { parseColor, toOklch, hueFamily } from './color.mjs';
import { shadeName } from './colornames.mjs';

/** Contrast bands, on the body/background pair. Chosen to separate the three
 *  kinds of system people actually mean: severe, ordinary, and soft. */
const CONTRAST_BANDS = [
  { id: 'high', label: 'Very high', min: 12 },
  { id: 'medium', label: 'High', min: 7 },
  { id: 'low', label: 'Moderate', min: 0 },
];

export function facetsFor(capture) {
  if (!capture) return null;
  const roles = capture.colors?.roles ?? {};
  const rounded = capture.rounded ?? {};

  // Both levels come off the same measured accent: `hue` is the broad word a
  // reader browses by, `shade` the specific one they search for.
  const primary = roles.primary?.hex ? parseColor(roles.primary.hex) : null;
  const hue = primary ? hueFamily(toOklch(primary)) : 'neutral';
  const shade = primary ? shadeName(primary) : null;

  const bodyPair = capture.audit?.pairs?.find(p => p.pair === 'foreground/background');
  const ratio = bodyPair?.ratio ?? null;
  const contrast = ratio == null ? null : CONTRAST_BANDS.find(b => ratio >= b.min).id;

  // Shape reads off the radius scale rather than a single token: a system with
  // pills is a different animal from one with an 8px radius, and both differ
  // from one with none at all.
  const shape = rounded.sharp ? 'sharp' : (rounded.pill ? 'pill' : 'rounded');

  return {
    polarity: capture.colors?.polarity ?? null,
    dark: capture.supportsDark ? 'yes' : 'no',
    hue,
    shade,
    accent: roles.primary?.hex ?? null,
    shape,
    contrast,
    ratio,
  };
}

/** The facet bar's own definition, so the page and the filter agree. */
export const FACET_GROUPS = [
  { key: 'polarity', label: 'Polarity', options: [['light', 'Light'], ['dark', 'Dark']] },
  { key: 'shape', label: 'Shape', options: [['sharp', 'Sharp'], ['rounded', 'Rounded'], ['pill', 'Pill']] },
  {
    key: 'contrast',
    label: 'Contrast',
    options: CONTRAST_BANDS.map(b => [b.id, b.label]),
  },
  { key: 'dark', label: 'Dark mode', options: [['yes', 'Ships dark']] },
];
