// Collapses the raw value histograms from harvest.mjs into a token scale.
// This is the hard step: a modern marketing page yields hundreds of
// near-duplicate values and a DESIGN.md needs the six or eight a designer would
// actually name.
//
// Three rules run through the whole module:
//
//   1. Every emitted value is an OBSERVED value. A cluster is represented by its
//      heaviest member, never by a centroid average — an averaged hex is an
//      invented hex, and not inventing hex codes is the thing this project
//      sells. Same for type sizes, radii and shadows.
//   2. Weights are comparable only to each other. harvest strides above 6000
//      elements, so counts are a sample; ratios survive that, magnitudes don't.
//   3. A token we cannot observe is omitted, not guessed, and the reason lands
//      in `warnings`. Half a palette that is true beats a whole one that isn't.
//
// Output is deterministic and sorted throughout, so re-capturing an unchanged
// site produces a byte-identical result and drift diffs mean something.

import {
  parseColor, toHex, flatten, toOklch, deltaE, contrastRatio, relativeLuminance, hueFamily,
} from './color.mjs';

/** OKLab distance below which two TEXT or interactive colors are one token.
 *  Measured against real pairs: Stripe's navy variants sit 0.0424 apart and must
 *  merge, its two grey tiers 0.0669 apart and must not. 0.045 splits them. */
export const COLOR_MERGE = 0.045;

/**
 * The same threshold for SURFACES, which need a much finer one.
 *
 * Design systems separate adjacent panels by deliberately small steps —
 * measured at 0.018–0.034 in both light and dark (`#08090a`→`#0f1011` is 0.0334,
 * `#ffffff`→`#f7f8f8` is 0.0217). At 0.045 those all collapse into the page
 * background, which is how Linear's card surface disappeared and the role fell
 * through to a translucent red danger overlay.
 *
 * 0.015 sits just under the ~0.02 just-noticeable step, so it still folds away
 * genuinely imperceptible variants (`#ffffff`→`#fcfcfd` is 0.0088) while keeping
 * every step a designer chose on purpose.
 */
export const SURFACE_MERGE = 0.015;

/** OKLCH chroma below which a color reads as grey. Matches hueFamily's cutoff. */
export const CHROMATIC = 0.03;

/** Text clusters under this share of all characters are incidental — a caption
 *  inside an inverted section, not a role. */
const TEXT_SIGNIFICANCE = 0.1;
/** A muted foreground has to be meaningfully lower-contrast than body text, not
 *  merely a second near-black. */
const MUTED_MAX_RATIO = 0.6;
/** ...but still legible. Everything is composited over the page backdrop, so
 *  text from inverted sections lands at ~1:1 and would otherwise win on weight. */
const MUTED_MIN_CONTRAST = 3;
/** Muted means desaturated. Deliberately looser than CHROMATIC, which would
 *  reject legitimate blue-greys (~0.045); observed link colors sit at 0.12+, so
 *  this splits secondary text from an accent with room on both sides. */
const MUTED_MAX_CHROMA = 0.08;
/** A card surface sits near the page background in lightness. Further than this
 *  and it is an accent panel, not a surface. */
const SURFACE_MAX_DL = 0.25;
/** A brand accent recurs; a single element is a promo panel. Measured: Stripe's
 *  indigo appears on 7 interactive fills and GOV.UK's green on 2, while the one
 *  576x360 yellow banner that used to win Linear by sheer area appears on 1. */
const MIN_ACCENT_COUNT = 2;

const WHITE = { r: 255, g: 255, b: 255, a: 1 };
const MAX_VARIANTS = 6;
const MAX_TYPE_STEPS = 12;

const round = (n, p = 3) => (Number.isFinite(n) ? Math.round(n * 10 ** p) / 10 ** p : null);
const byWeightThen = key => (a, b) => b.weight - a.weight || (a[key] < b[key] ? -1 : 1);

/** Ranked entries for one histogram, heaviest first. Ties break on the value
 *  string, because a stable order is what makes a drift diff readable. */
function entriesOf(map, weightKey) {
  return Object.entries(map || {})
    .map(([value, w]) => ({ value, weight: w?.[weightKey] || 0, count: w?.count || 0 }))
    .filter(e => e.weight > 0)
    .sort((a, b) => b.weight - a.weight || (a.value < b.value ? -1 : 1));
}

const totalWeight = entries => entries.reduce((s, e) => s + e.weight, 0);

// ---------------------------------------------------------------------------
// Colors
// ---------------------------------------------------------------------------

/** Parse and flatten one color histogram. Values harvest couldn't express as a
 *  plain color — gradients, currentColor, named colors — parse to null and are
 *  dropped rather than guessed at. */
function colorEntries(map, weightKey, backdrop) {
  const out = [];
  for (const e of entriesOf(map, weightKey)) {
    const raw = parseColor(e.value);
    if (!raw) continue;
    const alpha = raw.a ?? 1;
    if (alpha === 0) continue;
    // Translucent values are composited over the PAGE backdrop. A translucent
    // label sitting on a card is really over the card, but harvest doesn't
    // record ancestry, so this is the best available approximation.
    const rgb = flatten(raw, backdrop);
    out.push({ ...e, rgb, hex: toHex(rgb), alpha });
  }
  return out;
}

/** Leader clustering in OKLab: the heaviest value seeds a cluster, lighter ones
 *  join their nearest leader within `threshold`. The leader is a real sampled
 *  color, so nothing here fabricates a hex. */
export function clusterColors(entries, threshold = COLOR_MERGE) {
  const clusters = [];
  for (const e of entries) {
    let best = null;
    let bestD = Infinity;
    for (const c of clusters) {
      const d = deltaE(e.rgb, c.rgb);
      if (d < bestD) { bestD = d; best = c; }
    }
    if (best && bestD <= threshold) {
      best.weight += e.weight;
      best.count += e.count;
      if (e.hex !== best.hex) best.variants.add(e.hex);
    } else {
      clusters.push({
        hex: e.hex, rgb: e.rgb, weight: e.weight, count: e.count,
        variants: new Set(), translucent: e.alpha < 1,
      });
    }
  }
  // Merging redistributes weight, so rank after the fact, not during.
  return clusters
    .map(c => ({ ...c, variants: [...c.variants].sort().slice(0, MAX_VARIANTS) }))
    .sort(byWeightThen('hex'));
}

const isChromatic = c => toOklch(c.rgb).C >= CHROMATIC;

/**
 * Colors declared inside box-shadow strings. A chromatic one is nearly always a
 * focus ring or brand glow, which is where a restrained system keeps its accent
 * when it never fills a button with it.
 *
 * Kept RAW rather than composited: a ring drawn at 40% alpha still declares the
 * brand value, and that declared value is the observed one. Flattening it would
 * emit a colour that is genuinely on screen but is not the token.
 */
export function shadowAccents(capture) {
  const byHex = new Map();
  for (const [value, w] of Object.entries(capture?.shadows ?? {})) {
    for (const m of value.matchAll(/rgba?\([^)]+\)|#[0-9a-f]{3,8}\b/gi)) {
      const raw = parseColor(m[0]);
      if (!raw) continue;
      const rgb = { r: raw.r, g: raw.g, b: raw.b, a: 1 };
      if (toOklch(rgb).C < CHROMATIC) continue;
      const hex = toHex(rgb);
      const hit = byHex.get(hex);
      if (hit) { hit.weight += w.count; hit.count += w.count; } else {
        byHex.set(hex, { hex, rgb, weight: w.count, count: w.count, variants: [] });
      }
    }
  }
  return [...byHex.values()].sort(byWeightThen('hex'));
}

/** The page backdrop everything else composites against. */
function resolveBackdrop(capture) {
  const page = parseColor(capture.pageBg);
  if (page && (page.a ?? 1) > 0.99) return { rgb: page, source: 'pageBg' };
  // body and html were both transparent, so the largest painted surface is a
  // better guess at what the user actually sees than the browser default.
  const largest = colorEntries(capture.bgColors, 'area', WHITE)[0];
  if (largest) return { rgb: largest.rgb, source: 'largestBgCluster' };
  return { rgb: WHITE, source: 'browserDefault' };
}

const token = (cluster, share, extra = {}) => cluster && ({
  hex: cluster.hex,
  weightShare: round(share, 4),
  variants: cluster.variants,
  ...extra,
});

export function colorTokens(capture) {
  const backdrop = resolveBackdrop(capture);
  // Surfaces and borders cluster finely; text and interactive fills coarsely.
  // One threshold cannot do both — see SURFACE_MERGE.
  const bg = clusterColors(colorEntries(capture.bgColors, 'area', backdrop.rgb), SURFACE_MERGE);
  const text = clusterColors(colorEntries(capture.textColors, 'chars', backdrop.rgb));
  // Borders weight by count, not area: a design system uses one border color on
  // many small cards, and area would hand the token to whichever single big
  // section happens to be outlined.
  const border = clusterColors(
    colorEntries(capture.borderColors, 'count', backdrop.rgb), SURFACE_MERGE);
  const iBg = clusterColors(colorEntries(capture.interactiveBg, 'area', backdrop.rgb));
  const iFg = clusterColors(colorEntries(capture.interactiveFg, 'chars', backdrop.rgb));

  const shares = {
    bg: totalWeight(bg), text: totalWeight(text), border: totalWeight(border),
    iBg: totalWeight(iBg), iFg: totalWeight(iFg),
  };
  const share = (c, t) => (t > 0 && c ? c.weight / t : 0);

  const background = { hex: toHex(backdrop.rgb), rgb: backdrop.rgb, variants: [] };
  const ratioToBg = c => contrastRatio(c.rgb, backdrop.rgb);
  const bgLightness = toOklch(backdrop.rgb).L;

  // Body text is the highest-contrast SIGNIFICANT text color, not simply the
  // most numerous one. On a marketing page the secondary grey routinely
  // out-types the real body color — ranking on characters alone swaps
  // foreground and mutedForeground, which is worse than emitting neither.
  const significant = text.filter(c => c.weight >= shares.text * TEXT_SIGNIFICANCE);
  const foreground = [...(significant.length ? significant : text)]
    .sort((a, b) => ratioToBg(b) - ratioToBg(a))[0] || null;

  // Heaviest cluster that is genuinely quieter than body text but still reads.
  // The significance floor applies here too: without it the winner is whatever
  // link blue happens to sit one percent of the way down the histogram.
  const fgRatio = foreground ? ratioToBg(foreground) : 0;
  const mutedForeground = significant.find(c => c !== foreground
    && ratioToBg(c) <= fgRatio * MUTED_MAX_RATIO
    && ratioToBg(c) >= MUTED_MIN_CONTRAST
    && toOklch(c.rgb).C < MUTED_MAX_CHROMA) || null;

  // A surface, not an accent: close to the page background in lightness, and
  // never a color the site fills buttons with. Without both guards this picks
  // up the brightest CTA on the page and calls it a card.
  const accents = new Set(iBg.map(c => c.hex));
  const card = bg.find(c => deltaE(c.rgb, backdrop.rgb) > SURFACE_MERGE
    && Math.abs(toOklch(c.rgb).L - bgLightness) <= SURFACE_MAX_DL
    && !accents.has(c.hex)) || null;

  // The accent ladder, strongest evidence first. Ranking interactive fills by
  // area alone is what handed Linear a one-off promo panel instead of its brand
  // colour, so a fill has to RECUR to count as the accent.
  const recurring = c => c.count >= MIN_ACCENT_COUNT;
  const oneOffs = iBg.filter(c => isChromatic(c) && !recurring(c));
  const rings = shadowAccents(capture);

  let primary = iBg.find(c => isChromatic(c) && recurring(c));
  let primarySource = primary ? 'interactiveBg' : null;
  // No count floor on focus rings: only the focused element draws one, so they
  // are always rare, and a chromatic ring is unambiguously the brand colour.
  if (!primary && rings.length) { primary = rings[0]; primarySource = 'focusRing'; }
  if (!primary) {
    primary = iFg.find(isChromatic);
    primarySource = primary ? 'interactiveFg' : null;
  }
  if (!primary) {
    primary = text.find(isChromatic);
    primarySource = primary ? 'textColors' : null;
  }

  // Only meaningful when primary is a filled surface — if the accent came from
  // link text there is no "on primary" to report, and guessing white would be
  // exactly the invention this pipeline exists to avoid.
  // Highest contrast against the accent, not the heaviest — harvest can't pair a
  // button's text with its own background, and the heaviest interactive text
  // color is usually a plain link. If the winner still fails, the audit says so.
  let primaryForeground = null;
  if (primary && primarySource === 'interactiveBg' && iFg.length) {
    primaryForeground = [...iFg].sort(
      (a, b) => contrastRatio(b.rgb, primary.rgb) - contrastRatio(a.rgb, primary.rgb),
    )[0];
  }

  const roles = {
    background: token(background, 1, { source: backdrop.source }),
    foreground: token(foreground, share(foreground, shares.text)),
    card: token(card, share(card, shares.bg)),
    mutedForeground: token(mutedForeground, share(mutedForeground, shares.text)),
    // A focus ring has no meaningful share of any histogram, so it reports null
    // rather than 0 — "not applicable" and "never appears" are different claims.
    primary: token(primary, ({
      interactiveBg: shares.iBg, interactiveFg: shares.iFg, textColors: shares.text,
    }[primarySource] ?? 0) > 0
      ? share(primary, { interactiveBg: shares.iBg, interactiveFg: shares.iFg,
        textColors: shares.text }[primarySource])
      : null,
    { source: primarySource, occurrences: primary?.count ?? null }),
    primaryForeground: token(primaryForeground, share(primaryForeground, shares.iFg)),
    border: token(border[0], share(border[0], shares.border)),
  };

  const label = (hex) => Object.entries(roles).find(([, v]) => v?.hex === hex)?.[0] || null;
  const palette = [...bg, ...text, ...border, ...iBg]
    .reduce((acc, c) => (acc.some(x => x.hex === c.hex) ? acc : [...acc, c]), [])
    .sort(byWeightThen('hex'))
    .slice(0, 24)
    .map(c => {
      const lch = toOklch(c.rgb);
      return {
        hex: c.hex,
        role: label(c.hex),
        hue: hueFamily(lch),
        lightness: round(lch.L),
        chroma: round(lch.C),
        count: c.count,
      };
    });

  return {
    polarity: relativeLuminance(backdrop.rgb) < 0.2 ? 'dark' : 'light',
    roles,
    palette,
    // Chromatic fills that lost the accent role for appearing once. Reported
    // rather than dropped: a reviewer eyeballing the tokens should see what was
    // considered and why it was passed over.
    accentRejected: oneOffs.map(c => ({ hex: c.hex, occurrences: c.count })),
    clusterCounts: {
      bg: bg.length, text: text.length, border: border.length, interactive: iBg.length,
    },
  };
}

// ---------------------------------------------------------------------------
// Typography
// ---------------------------------------------------------------------------

const primaryFamily = stack =>
  stack.split(',')[0].trim().replace(/^["']|["']$/g, '');

/** Classify off the generic keyword the site itself declared. Checked
 *  sans-before-serif because "sans-serif" contains "serif". */
function familyClass(stack) {
  const s = stack.toLowerCase();
  if (s.includes('monospace') || s.includes('ui-monospace')) return 'mono';
  if (s.includes('sans-serif') || s.includes('system-ui') || s.includes('-apple-system')) return 'sans';
  if (s.includes('serif')) return 'serif';
  if (s.includes('cursive')) return 'cursive';
  return 'unknown';
}

/** px-valued entries. Everything except `spacings` carries its unit. */
function pxEntries(map, weightKey) {
  return entriesOf(map, weightKey)
    .filter(e => e.value.endsWith('px'))
    .map(e => ({ ...e, px: parseFloat(e.value) }))
    .filter(e => Number.isFinite(e.px) && e.px > 0);
}

/** Leader clustering on a number line. `tolerance` is a function of the leader
 *  so large display sizes merge proportionally (48/49px) while small steps stay
 *  distinct (14/15px). Representative is the heaviest observed value. */
export function clusterNumeric(entries, tolerance) {
  const clusters = [];
  for (const e of entries) {
    let best = null;
    let bestD = Infinity;
    for (const c of clusters) {
      const d = Math.abs(c.px - e.px);
      if (d < bestD) { bestD = d; best = c; }
    }
    if (best && bestD <= tolerance(best.px)) {
      best.weight += e.weight;
      best.count += e.count;
      if (e.px !== best.px) best.variants.add(e.px);
    } else {
      clusters.push({ px: e.px, weight: e.weight, count: e.count, variants: new Set() });
    }
  }
  return clusters
    .map(c => ({ ...c, variants: [...c.variants].sort((a, b) => a - b) }))
    .sort(byWeightThen('px'));
}

const SIZE_TOLERANCE = px => Math.max(0.5, px * 0.02);
const DOWN = ['sm', 'xs', '2xs', '3xs', '4xs'];
const UP = ['lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl', '7xl'];

function stepName(i, baseIdx) {
  if (i === baseIdx) return 'base';
  const d = i - baseIdx;
  return d < 0 ? (DOWN[-d - 1] || `down-${-d}`) : (UP[d - 1] || `up-${d}`);
}

export function typographyTokens(capture) {
  const families = entriesOf(capture.fontFamilies, 'chars');
  const headingFamilies = entriesOf(capture.headingFamilies, 'chars');
  const sizes = clusterNumeric(pxEntries(capture.fontSizes, 'chars'), SIZE_TOLERANCE);
  const weights = entriesOf(capture.fontWeights, 'chars');
  const headingWeights = entriesOf(capture.headingWeights, 'chars');
  const headingSizes = clusterNumeric(pxEntries(capture.headingSizes, 'chars'), SIZE_TOLERANCE);
  const lineHeights = clusterNumeric(pxEntries(capture.lineHeights, 'chars'), SIZE_TOLERANCE);
  // `normal` never reaches us — harvest's bump() drops it — so anything here is
  // tracking the site set deliberately.
  const letterSpacings = entriesOf(capture.letterSpacings, 'chars');

  const bodySize = sizes[0] || null;
  const truncated = sizes.length > MAX_TYPE_STEPS;
  const ranked = sizes.slice(0, MAX_TYPE_STEPS);
  const ascending = [...ranked].sort((a, b) => a.px - b.px);
  const baseIdx = bodySize ? ascending.findIndex(s => s.px === bodySize.px) : -1;
  const totalSize = totalWeight(sizes);

  const scale = ascending.map((s, i) => ({
    name: baseIdx >= 0 ? stepName(i, baseIdx) : `step-${i}`,
    px: s.px,
    rem: bodySize ? round(s.px / bodySize.px, 3) : null,
    weightShare: round(totalSize > 0 ? s.weight / totalSize : 0, 4),
    variants: s.variants,
  }));

  const face = (entry) => entry && ({
    family: primaryFamily(entry.value),
    class: familyClass(entry.value),
    stack: entry.value,
  });

  // Pairing the dominant line-height with the dominant size assumes both belong
  // to body copy. They do on almost every page — both are the highest-character
  // bucket — but harvest doesn't pair properties per element, so this is an
  // inference and is labelled as one.
  const bodyLineHeight = lineHeights[0] || null;

  return {
    body: {
      ...face(families[0]),
      sizePx: bodySize?.px ?? null,
      weight: weights[0] ? Number(weights[0].value) : null,
      lineHeightPx: bodyLineHeight?.px ?? null,
      lineHeightRatio: bodyLineHeight && bodySize
        ? round(bodyLineHeight.px / bodySize.px, 2) : null,
      lineHeightInferred: true,
      letterSpacing: letterSpacings[0]?.value ?? null,
    },
    heading: {
      ...face(headingFamilies[0] || families[0]),
      largestPx: headingSizes.length ? Math.max(...headingSizes.map(s => s.px)) : null,
      weight: headingWeights[0] ? Number(headingWeights[0].value) : null,
      sharesBodyFamily: !headingFamilies[0] || !families[0]
        || primaryFamily(headingFamilies[0].value) === primaryFamily(families[0].value),
    },
    families: families.slice(0, 4).map(f => ({
      family: primaryFamily(f.value), class: familyClass(f.value), stack: f.value,
    })),
    scale,
    scaleTruncated: truncated,
    distinctSizes: sizes.length,
  };
}

// ---------------------------------------------------------------------------
// Spacing
// ---------------------------------------------------------------------------

// 2 is deliberately absent: every even value divides by it, so it wins whenever
// nothing else fits and reports a "2px grid" no designer ever chose. If 4 can't
// explain the page, the honest answer is that there is no grid.
const GRID_CANDIDATES = [8, 6, 5, 4];
const GRID_THRESHOLD = 0.75;

export function spacingTokens(capture) {
  // spacings is COUNT-ONLY: harvest passes `{count: 1}` as the weight object, so
  // area and chars are structurally zero here. Weighting by anything else
  // silently returns nothing.
  const entries = entriesOf(capture.spacings, 'count')
    .map(e => ({ ...e, px: parseInt(e.value, 10) }))
    .filter(e => Number.isFinite(e.px) && e.px > 0);
  const total = totalWeight(entries);

  // Descending, and take the first that clears the bar: divisibility by 8
  // implies divisibility by 4 and 2, so we want the coarsest grid the site
  // actually obeys rather than the trivially true one.
  const shares = GRID_CANDIDATES.map(base => ({
    base,
    share: total > 0
      ? entries.filter(e => e.px % base === 0).reduce((s, e) => s + e.weight, 0) / total
      : 0,
  }));
  const grid = shares.find(s => s.share >= GRID_THRESHOLD) || null;

  return {
    base: grid?.base ?? null,
    gridConfidence: round(grid?.share ?? Math.max(0, ...shares.map(s => s.share)), 3),
    gridCandidates: shares.map(s => ({ base: s.base, share: round(s.share, 3) })),
    scale: entries.slice(0, 10).map(e => e.px).sort((a, b) => a - b),
    distinctValues: entries.length,
  };
}

// ---------------------------------------------------------------------------
// Shapes and elevation
// ---------------------------------------------------------------------------

const RADIUS_NAMES = ['sm', 'md', 'lg', 'xl', '2xl'];
/** Radii under this share of all rounded elements are one-offs, not tokens. */
const RADIUS_SIGNIFICANCE = 0.03;
const isPillValue = v => v.endsWith('%') ? parseFloat(v) >= 50 : parseFloat(v) >= 999;

export function roundedTokens(capture) {
  const all = entriesOf(capture.radii, 'count');
  const px = clusterNumeric(pxEntries(capture.radii, 'count').filter(e => e.px < 999),
    () => 0.5);
  // Rank by weight, THEN sort for naming. Sorting first and slicing keeps the
  // five smallest radii, which on a real site means the 1px and 2px noise and
  // never the 8px the design actually uses.
  const total = totalWeight(px);
  const ascending = px
    .filter(r => total > 0 && r.weight / total >= RADIUS_SIGNIFICANCE)
    .slice(0, RADIUS_NAMES.length)
    .sort((a, b) => a.px - b.px);

  // Every <a> on the page reports its radius here, and most links are square, so
  // zero carries no information about button shape. The heaviest non-zero value
  // is the shape token; genuinely square systems fall out as `sharp`.
  const button = entriesOf(capture.interactiveRadius, 'count')
    .find(e => parseFloat(e.value) > 0)?.value ?? null;

  return {
    // Note: harvest gates on `borderRadius` but keys on `borderTopLeftRadius`,
    // so asymmetric radii are recorded by one corner only.
    scale: ascending.map((r, i) => ({ name: RADIUS_NAMES[i], px: r.px, count: r.count })),
    button,
    pill: all.some(e => isPillValue(e.value)) || (!!button && isPillValue(button)),
    sharp: all.length === 0,
  };
}

export function elevationTokens(capture) {
  // Computed box-shadow strings are already valid CSS. Kept verbatim: there is
  // nothing to gain from re-serialising them and everything to lose.
  const shadows = entriesOf(capture.shadows, 'count').slice(0, 5);
  return {
    shadows: shadows.map(s => ({ value: s.value, count: s.count })),
    flat: shadows.length === 0,
  };
}

// ---------------------------------------------------------------------------
// Contrast audit
// ---------------------------------------------------------------------------

const AA_TEXT = 4.5;
const AA_LARGE = 3;
const AAA_TEXT = 7;

/** WCAG check on every pair the token set actually declares. Pairs whose
 *  colors we failed to observe are skipped, not assumed to pass. */
export function contrastAudit(colors) {
  const { roles } = colors;
  const rgbOf = hex => parseColor(hex);
  const pairs = [
    ['foreground', 'background', false],
    ['mutedForeground', 'background', false],
    ['primaryForeground', 'primary', false],
    ['primary', 'background', false],
    ['border', 'background', true],
  ];

  const results = [];
  for (const [fgKey, bgKey, nonText] of pairs) {
    const fg = roles[fgKey]?.hex;
    const bg = roles[bgKey]?.hex;
    if (!fg || !bg) continue;
    const ratio = round(contrastRatio(rgbOf(fg), rgbOf(bg)), 2);
    const min = nonText ? AA_LARGE : AA_TEXT;
    results.push({
      pair: `${fgKey}/${bgKey}`,
      fg, bg, ratio, nonText,
      aa: ratio >= min,
      aaa: nonText ? ratio >= AA_LARGE : ratio >= AAA_TEXT,
    });
  }
  return {
    pairs: results,
    failures: results.filter(r => !r.aa).length,
    minRatio: results.length ? Math.min(...results.map(r => r.ratio)) : null,
  };
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

/** Everything we could not observe, said out loud. This list is the honest
 *  half of the product — an unflagged gap is how a wrong token ships. */
function collectWarnings(capture, colors, type, spacing, rounded) {
  const w = [];
  const { roles } = colors;
  if (colors.roles.background.source === 'browserDefault') {
    w.push('No page background observed; composited against white. Colors with alpha may be off.');
  }
  if (!roles.foreground) w.push('No text color observed — the capture may have run before render.');
  if (!roles.primary) w.push('No chromatic accent found in buttons, focus rings, links or body text; palette is fully neutral.');
  else if (roles.primary.source === 'focusRing') {
    w.push(`Accent ${roles.primary.hex} taken from a focus ring, the only chromatic `
      + 'evidence on the page. The site never fills a button with it, so no '
      + 'foreground pairing could be observed.');
  } else if (roles.primary.source !== 'interactiveBg') {
    w.push(`Accent taken from ${roles.primary.source}, not a filled button — verify by eye.`);
  }
  for (const r of colors.accentRejected ?? []) {
    w.push(`Ignored ${r.hex} as the accent: a chromatic interactive fill on only `
      + `${r.occurrences} element, which reads as a promo panel rather than a brand colour.`);
  }
  if (roles.primary && !roles.primaryForeground && roles.primary.source === 'interactiveBg') {
    w.push('No text color observed on interactive surfaces; primaryForeground omitted rather than guessed.');
  }
  if (!roles.border) w.push('No borders observed; border token omitted.');
  if (roles.foreground && !roles.mutedForeground) {
    w.push('No secondary text color is quiet enough, desaturated enough and common '
      + 'enough to call muted; omitted rather than promoting a link color.');
  }
  if (spacing.base === null) {
    w.push(`No spacing grid explains ${Math.round(GRID_THRESHOLD * 100)}% of values `
      + `(best ${spacing.gridConfidence}); site may not be on a grid.`);
  }
  if (!type.body?.family) w.push('No font family observed.');
  if (type.scaleTruncated) {
    w.push(`${type.distinctSizes} distinct type sizes collapsed to ${MAX_TYPE_STEPS}; `
      + 'the site may not have a real type scale.');
  }
  if (rounded.sharp) w.push('No border radius anywhere; treat as a deliberately sharp system.');
  if (capture.sampled && capture.elementCount > capture.sampled) {
    w.push(`Strided sample: ${capture.sampled} of ${capture.elementCount} elements. `
      + 'Weights are relative only.');
  }
  return w;
}

/** Raw harvest output → token set. Pure; no I/O, no network, no model. */
export function cluster(capture) {
  const colors = colorTokens(capture);
  const typography = typographyTokens(capture);
  const spacing = spacingTokens(capture);
  const rounded = roundedTokens(capture);
  const elevation = elevationTokens(capture);
  const audit = contrastAudit(colors);

  return {
    source: {
      url: capture.url ?? null,
      title: capture.title ?? null,
      viewport: capture.viewport ?? null,
      docHeight: capture.docHeight ?? null,
      elementCount: capture.elementCount ?? null,
      sampled: capture.sampled ?? null,
      sampleRatio: capture.elementCount ? round(capture.sampled / capture.elementCount, 3) : null,
    },
    // Together these identify the code that produced this file. Token changes
    // with both versions unchanged are a real redesign; anything else is us.
    // A null harvestVersion means a capture taken before the field existed.
    harvestVersion: capture.harvestVersion ?? null,
    // 2: accent requires a recurring fill, falls back to focus-ring colour.
    // 3: surfaces and borders cluster at SURFACE_MERGE instead of COLOR_MERGE,
    //    which moves `card` and `border` on any site with subtle surface steps.
    // Token sets are only comparable for drift within the same version.
    clusterVersion: 3,
    tuning: { colorMerge: COLOR_MERGE, chromatic: CHROMATIC, gridThreshold: GRID_THRESHOLD },
    colors,
    typography,
    spacing,
    rounded,
    elevation,
    audit,
    warnings: collectWarnings(capture, colors, typography, spacing, rounded),
  };
}

/** Terminal summary with truecolor swatches. The plan's next step is to eyeball
 *  these against the real site, and that is hard to do against raw JSON. */
export function summarize(tokens) {
  const swatch = (hex) => {
    const n = parseInt(hex.slice(1), 16);
    return `\x1b[48;2;${(n >> 16) & 255};${(n >> 8) & 255};${n & 255}m   \x1b[0m`;
  };
  const { roles } = tokens.colors;
  const lines = [`${tokens.source.title || tokens.source.url}  [${tokens.colors.polarity}]`, ''];

  for (const [name, t] of Object.entries(roles)) {
    if (!t) { lines.push(`     ${name.padEnd(18)} —`); continue; }
    const extra = [t.variants?.length ? `+${t.variants.length}` : '', t.source || ''].filter(Boolean);
    lines.push(`  ${swatch(t.hex)} ${name.padEnd(18)} ${t.hex}  ${extra.join(' ')}`);
  }

  const b = tokens.typography.body;
  const h = tokens.typography.heading;
  lines.push('',
    `  type    ${b.family || '?'} ${b.sizePx}px/${b.lineHeightRatio ?? '?'} ${b.weight ?? ''}`
    + `  headings ${h.family || '?'} ${h.weight ?? ''}`,
    `  scale   ${tokens.typography.scale.map(s => `${s.name}:${s.px}`).join('  ')}`,
    `  spacing base ${tokens.spacing.base ?? '—'} (${tokens.spacing.gridConfidence})`
    + `  [${tokens.spacing.scale.join(' ')}]`,
    `  radius  ${tokens.rounded.scale.map(r => `${r.name}:${r.px}`).join('  ') || '—'}`
    + `${tokens.rounded.pill ? '  pill' : ''}  button:${tokens.rounded.button ?? '—'}`,
    `  shadows ${tokens.elevation.shadows.length}`);

  lines.push('', ...tokens.audit.pairs.map(
    p => `  ${p.aa ? 'PASS' : 'FAIL'} ${p.pair.padEnd(28)} ${p.ratio}:1`));
  if (tokens.warnings.length) {
    lines.push('', ...tokens.warnings.map(x => `  ! ${x}`));
  }
  return lines.join('\n');
}
