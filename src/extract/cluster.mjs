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
} from '../lib/color.mjs';

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
/** Below this share of painted background area a colour is a component tint — a
 *  success panel, a danger overlay — not a tier of the system. Measured on
 *  Linear: real surfaces sit at 9.3% and 0.42%, the green and red overlays at
 *  0.145% and 0.104%. Area separates them cleanly; chroma does not, because
 *  plenty of systems tint their surfaces on purpose. */
const SURFACE_MIN_AREA = 0.0025;
/** A text tier has to carry real copy. Lower than TEXT_SIGNIFICANCE, which gates
 *  role assignment: a tier can be a minority voice, a role cannot. */
const RAMP_MIN_SHARE = 0.02;
/** Ramps stop here. Beyond four or five steps the tail is noise, and no system
 *  we have measured declares more. */
const MAX_RAMP = 5;

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

/** Hue families that carry conventional meaning. Blue is deliberately absent: it
 *  is the most common brand hue, and labelling every blue panel "info" would be
 *  wrong far more often than right. */
const SEMANTIC_BY_HUE = {
  green: 'success', red: 'danger', orange: 'warning', yellow: 'warning',
};
const SEMANTIC_MIN_CHROMA = 0.05;
const MIN_SEMANTIC_COUNT = 2;

/**
 * Success / danger / warning colours, read from tinted panels and their borders.
 *
 * Declared RAW, for the same reason focus rings are: `rgba(39, 166, 68, 0.07)`
 * is a 7% wash on screen, but the token it declares is `#27a644`, and that is
 * what a design system means by "success". Compositing it would emit a colour
 * that is on screen and is not the token.
 *
 * Ranked by how many properties a colour paints before how often it appears. A
 * real state style colours a surface AND its edge; that is what separates
 * Linear's #27a644 (background and border, 9 elements) from a pure lime used
 * 16 times as decoration.
 */
export function semanticColors(capture, primary) {
  const byHex = new Map();
  for (const map of ['bgColors', 'borderColors']) {
    for (const [key, w] of Object.entries(capture?.[map] ?? {})) {
      const c = parseColor(key);
      if (!c || (c.a ?? 1) === 0) continue;
      const rgb = { r: c.r, g: c.g, b: c.b, a: 1 };
      const lch = toOklch(rgb);
      if (lch.C < SEMANTIC_MIN_CHROMA) continue;
      const role = SEMANTIC_BY_HUE[hueFamily(lch)];
      if (!role) continue;
      // The brand accent is not a semantic colour, however green it happens to
      // be — GOV.UK's primary would otherwise be reported as `success`.
      if (primary && deltaE(rgb, primary.rgb) <= COLOR_MERGE) continue;
      const hit = byHex.get(toHex(rgb))
        ?? { hex: toHex(rgb), role, count: 0, sources: new Set() };
      hit.count += w.count;
      hit.sources.add(map);
      byHex.set(hit.hex, hit);
    }
  }

  const out = {};
  const ranked = [...byHex.values()].sort((a, b) => b.sources.size - a.sources.size
    || b.count - a.count || (a.hex < b.hex ? -1 : 1));
  for (const c of ranked) {
    if (c.count < MIN_SEMANTIC_COUNT || out[c.role]) continue;
    out[c.role] = {
      hex: c.hex,
      occurrences: c.count,
      paintsBorder: c.sources.has('borderColors'),
    };
  }
  return out;
}

/**
 * Colors declared inside box-shadow strings. A chromatic one is nearly always a
 * focus ring or brand glow, which is where a restrained system keeps its accent
 * when it never fills a button with it.
 *
 * Kept RAW rather than composited: a ring drawn at 40% alpha still declares the
 * brand value, and that declared value is the observed one. Flattening it would
 * emit a colour that is genuinely on screen but is not the token.
 */
const COLOR_IN_SHADOW = /rgba?\([^)]+\)|hsla?\([^)]+\)|#[0-9a-f]{3,8}\b/gi;

/** Every box-shadow we hold, resting and state, weighted by elements reached. */
function* shadowDeclarations(capture) {
  for (const [value, w] of Object.entries(capture?.shadows ?? {})) {
    yield { value, weight: w.count ?? 0, source: 'resting' };
  }
  // State shadows matter more than resting ones here: a :focus-visible ring is
  // drawn in the brand colour precisely on the sites too restrained to fill
  // anything with it. Vercel's whole interface is achromatic but for one ring.
  for (const [key, w] of Object.entries(capture?.states ?? {})) {
    const [kind, state, ...rest] = key.split('|');
    for (const decl of rest.join('|').split(';')) {
      const i = decl.indexOf(':');
      if (i < 1 || decl.slice(0, i) !== 'box-shadow') continue;
      yield { value: decl.slice(i + 1), weight: w.matched ?? 0, source: `${kind}:${state}` };
    }
  }
}

export function shadowAccents(capture) {
  const byHex = new Map();
  for (const { value, weight, source } of shadowDeclarations(capture)) {
    for (const m of value.matchAll(COLOR_IN_SHADOW)) {
      const raw = parseColor(m[0]);
      if (!raw) continue;
      const rgb = { r: raw.r, g: raw.g, b: raw.b, a: 1 };
      if (toOklch(rgb).C < CHROMATIC) continue;
      const hex = toHex(rgb);
      const hit = byHex.get(hex);
      if (hit) {
        hit.weight += weight;
        hit.count += weight;
        hit.sources.add(source);
      } else {
        byHex.set(hex, {
          hex, rgb, weight, count: weight, variants: [], sources: new Set([source]),
        });
      }
    }
  }
  return [...byHex.values()]
    .map(c => ({ ...c, sources: [...c.sources].sort() }))
    .sort(byWeightThen('hex'));
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

/**
 * The surface ladder: each distinct near-canvas background, ordered by distance
 * from the canvas. This is how a dark UI builds depth, and until SURFACE_MERGE
 * landed the whole ladder collapsed into `background` and was thrown away.
 *
 * Ordered by lightness distance rather than by area, because a ramp is a
 * sequence of steps. `card` stays area-ranked — it answers "which surface does
 * this system actually use most", which is a different question.
 */
function surfaceRamp(bg, backdrop, accents, total) {
  const bgL = toOklch(backdrop.rgb).L;
  const dL = c => Math.abs(toOklch(c.rgb).L - bgL);
  return bg
    .filter(c => deltaE(c.rgb, backdrop.rgb) > SURFACE_MERGE
      && dL(c) <= SURFACE_MAX_DL
      && !accents.has(c.hex)
      && total > 0 && c.weight / total >= SURFACE_MIN_AREA)
    .sort((a, b) => dL(a) - dL(b) || (a.hex < b.hex ? -1 : 1))
    .slice(0, MAX_RAMP);
}

/**
 * The text ladder, strongest contrast first. Same guards as `mutedForeground`:
 * legible, desaturated so a link colour is not mistaken for a text tier, and
 * common enough to be a tier at all.
 */
function textRamp(text, backdrop, total) {
  const ratio = c => contrastRatio(c.rgb, backdrop.rgb);
  return text
    .filter(c => total > 0 && c.weight / total >= RAMP_MIN_SHARE
      && ratio(c) >= MUTED_MIN_CONTRAST
      && toOklch(c.rgb).C < MUTED_MAX_CHROMA)
    .sort((a, b) => ratio(b) - ratio(a) || (a.hex < b.hex ? -1 : 1))
    .slice(0, MAX_RAMP);
}

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
  const ringVia = primarySource === 'focusRing' ? (primary.sources ?? []).join(', ') : null;
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
    {
      source: primarySource,
      occurrences: primary?.count ?? null,
      ...(ringVia ? { via: ringVia } : {}),
    }),
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

  const surfaces = surfaceRamp(bg, backdrop, accents, shares.bg);
  const texts = textRamp(text, backdrop, shares.text);
  const semantic = semanticColors(capture, primary);

  return {
    polarity: relativeLuminance(backdrop.rgb) < 0.2 ? 'dark' : 'light',
    roles,
    // Ordered ladders alongside the named roles. The roles answer "what is the
    // body colour"; the ramps answer "what are the tiers", which is the shape a
    // design system is actually built from.
    ramps: {
      surface: surfaces.map((c, i) => ({
        name: `surface-${i + 1}`,
        hex: c.hex,
        deltaL: round(Math.abs(toOklch(c.rgb).L - bgLightness)),
        areaShare: round(shares.bg > 0 ? c.weight / shares.bg : 0, 4),
      })),
      text: texts.map((c, i) => ({
        name: `text-${i + 1}`,
        hex: c.hex,
        contrast: round(ratioToBg(c), 2),
        charShare: round(shares.text > 0 ? c.weight / shares.text : 0, 4),
      })),
    },
    palette,
    // State colours, not brand colours. Empty is a real answer: a marketing page
    // that never shows an error state has no danger token to extract.
    semantic,
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
// Components
// ---------------------------------------------------------------------------

/**
 * Box metrics per component kind, taken from the single most common bundle.
 *
 * Needs harvest v4. Ranked by element count, not area: the token is whatever
 * shape the site uses most often, and area would hand it to one oversized hero
 * button. Zero values are kept — a link with no padding is a fact about the
 * system, not a missing measurement.
 */
export function componentTokens(capture) {
  const ranked = entriesOf(capture?.componentBoxes, 'count').map((e) => {
    const [kind, padding, borderWidth, radius, gap] = e.value.split('|');
    return {
      kind,
      padding,
      borderWidth: borderWidth === '0px' ? null : borderWidth,
      radius: radius === '0px' ? null : radius,
      gap: gap === 'normal' ? null : gap,
      elements: e.count,
      padded: padding !== '0px',
      styled: padding !== '0px' || borderWidth !== '0px' || radius !== '0px' || gap !== 'normal',
    };
  });

  const out = {};
  for (const kind of [...new Set(ranked.map(r => r.kind))]) {
    // Entries arrive count-ordered, so `find` returns the most common match.
    //
    // The most common bundle is usually a fully default one — an <a> or <button>
    // that wraps the element carrying the actual styling. It describes nothing,
    // so a bundle that sets real padding is preferred, then any bundle that sets
    // anything at all. Stripe's CTA is a link padded 14.5px 24px; its <button>
    // elements are bare wrappers. GOV.UK, which styles <button> directly, is
    // unaffected either way.
    const forKind = ranked.filter(r => r.kind === kind);
    const pick = forKind.find(r => r.padded) ?? forKind.find(r => r.styled) ?? forKind[0];
    const { kind: _k, padded, styled, ...token } = pick;
    out[kind] = {
      ...token,
      // How many distinct shapes this kind has, and whether the commonest one
      // carried no styling at all — both are the reader's cue to how much to
      // trust a single set of numbers.
      variants: forKind.length,
      dominantUnstyled: !forKind[0].styled,
    };
  }
  return out;
}

// ---------------------------------------------------------------------------
// Interaction states
// ---------------------------------------------------------------------------

const camel = prop => prop.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
const COLOR_PROPS = new Set(['color', 'backgroundColor', 'borderColor',
  'outlineColor', 'textDecorationColor']);

/** Normalise declared colours to hex so state values read like the rest of the
 *  file. Translucent values keep their rgba() form — flattening them here would
 *  be inventing a composite the stylesheet never declared. */
function normalizeStateValue(prop, value) {
  if (!COLOR_PROPS.has(prop)) return value;
  const c = parseColor(value);
  return c && (c.a ?? 1) === 1 ? toHex(c) : value;
}

/**
 * Hover / focus / active declarations, grouped by the element kind they target.
 *
 * Needs harvest v3. Availability is reported rather than assumed: a site whose
 * stylesheets are all cross-origin produces an empty set for a reason that is
 * ours, not theirs, and the two must not read the same on the page.
 */
export function stateTokens(capture) {
  const sheets = capture?.styleSheets ?? null;

  // One winning RULE per (kind, state), not one winning value per property.
  // Most-targeted wins: a rule matching 106 links describes the system, one
  // matching a single element describes an exception. Keeping the rule intact is
  // what stops `color` and `background-color` being taken from different rules
  // and emitted as a pair the stylesheet never declared.
  const candidates = new Map();
  for (const [key, w] of Object.entries(capture?.states ?? {})) {
    const [kind, state, ...rest] = key.split('|');
    const id = `${kind}|${state}`;
    const decls = rest.join('|');
    if (!candidates.has(id)) candidates.set(id, []);
    candidates.get(id).push({
      kind, state, decls, matched: w.matched, size: decls.split(';').length,
    });
  }

  // Within a near-tie on reach, prefer the fuller declaration. GOV.UK's focus
  // style splits across two rules — one sets colour on 107 links, the other sets
  // colour, background and box-shadow on 106 — and taking the wider one by a
  // single element drops the yellow that the whole design is known for.
  const NEAR_TIE = 0.95;
  const best = new Map();
  for (const [id, list] of candidates) {
    const top = Math.max(...list.map(c => c.matched));
    const contenders = list.filter(c => c.matched >= top * NEAR_TIE);
    best.set(id, {
      ...contenders.sort((a, b) => b.size - a.size || b.matched - a.matched)[0],
      rulesConsidered: list.length,
    });
  }

  const roles = {};
  for (const { kind, state, decls, matched, rulesConsidered } of [...best.values()]
    .sort((a, b) => (a.kind + a.state < b.kind + b.state ? -1 : 1))) {
    const props = {};
    for (const decl of decls.split(';')) {
      const i = decl.indexOf(':');
      if (i < 1) continue;
      const prop = camel(decl.slice(0, i));
      props[prop] = normalizeStateValue(prop, decl.slice(i + 1));
    }
    if (Object.keys(props).length) {
      // rulesConsidered is the honest caveat: CSS cascades, we pick one rule, and
      // a reader should know how many others also style this state.
      (roles[kind] ??= {})[state] = { ...props, matchedElements: matched, rulesConsidered };
    }
  }

  return {
    available: (sheets?.readable ?? 0) > 0,
    sheets,
    roles,
    declarations: Object.keys(capture?.states ?? {}).length,
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

/** Prose sets many characters per element; chrome (nav, labels, badges) sets
 *  few. 20 splits them on every site measured. */
const PROSE_MIN_CHARS_PER_EL = 20;
/** The body ladder covers sizes near body. Past this ratio a size is display
 *  type, which is named by its heading element or not at all — calling a 48px
 *  hero "lead-lg" would be worse than leaving it unnamed. */
const LADDER_MAX_RATIO = 1.6;
const LADDER_MIN_RATIO = 0.6;
/** A ladder step used on one or two elements is a styled span, not a tier. */
const MIN_LADDER_ELEMENTS = 3;
const TEXT_DOWN = ['body-sm', 'caption', 'caption-sm'];
const TEXT_UP = ['body-lg', 'lead', 'lead-lg'];

/** Parse one typeStyles key back into a record. Family is the tail, so a '|'
 *  inside a font stack survives the round trip. */
function parseTypeStyle(key) {
  const parts = key.split('|');
  if (parts.length < 6) return null;
  const px = parseFloat(parts[1]);
  if (!Number.isFinite(px)) return null;
  return {
    kind: parts[0],
    px,
    fontWeight: Number(parts[2]) || null,
    // 'normal' is a real, common value here — unlike in the per-property
    // histograms, where harvest's bump() drops it before we ever see it.
    lineHeightPx: parts[3] === 'normal' ? null : parseFloat(parts[3]),
    letterSpacing: parts[4] === 'normal' ? null : parts[4],
    stack: parts.slice(5).join('|'),
  };
}

const typeEntries = capture => entriesOf(capture.typeStyles, 'chars')
  .map((e) => {
    const parsed = parseTypeStyle(e.value);
    return parsed && { ...parsed, chars: e.weight, count: e.count, charsPerEl: e.weight / e.count };
  })
  .filter(Boolean);

const asRole = (b) => ({
  fontFamily: primaryFamily(b.stack),
  fontStack: b.stack,
  class: familyClass(b.stack),
  fontSize: `${round(b.px, 2)}px`,
  fontWeight: b.fontWeight,
  lineHeight: b.lineHeightPx ? round(b.lineHeightPx / b.px, 2) : null,
  letterSpacing: b.letterSpacing,
  elements: b.count,
  chars: b.chars,
});

/**
 * Typography roles built from co-occurring bundles, so every role is a
 * combination the page actually used rather than four independent histogram
 * winners glued together.
 *
 * Needs harvest v2. Older captures have no `typeStyles` and get an empty set
 * rather than a fabricated one.
 */
export function typographyRoles(capture) {
  const all = typeEntries(capture);
  if (!all.length) return { roles: {}, available: false };

  const roles = {};
  const dominant = kind => all.filter(b => b.kind === kind)[0] ?? null;
  // Monospace is its own role; letting it into the prose pool makes a code block
  // compete for `body`, and on Linear it won `body-lg` outright.
  const textish = all.filter(b => b.kind === 'text' && familyClass(b.stack) !== 'mono');

  // Body is the style that sets the most PROSE. Not the most characters — that
  // is chrome, which has many elements with few characters each. Not the highest
  // characters-per-element either — that is display type, few elements with many.
  // Filter on chars-per-element to drop the chrome, then rank the remainder by
  // total volume to drop the display sizes. `all` is already chars-sorted.
  // Measured: Stripe 16px over 26px, Linear 15px over 13px, GOV.UK 19px, which
  // matches the value GOV.UK publishes.
  const body = textish.find(b => b.charsPerEl >= PROSE_MIN_CHARS_PER_EL) ?? textish[0] ?? null;
  if (body) roles.body = asRole(body);

  if (body) {
    // One bundle per size, heaviest wins: three weights at 12px are one tier of
    // the system, not three separate ones.
    const bySize = new Map();
    for (const b of textish) {
      const key = Math.round(b.px);
      if (!bySize.has(key)) bySize.set(key, b);
    }
    const near = [...bySize.values()].filter(b => Math.round(b.px) !== Math.round(body.px)
      && b.count >= MIN_LADDER_ELEMENTS
      && b.px / body.px <= LADDER_MAX_RATIO && b.px / body.px >= LADDER_MIN_RATIO);
    // Take the heaviest steps, THEN order by size to name them. Taking the
    // nearest sizes instead drops the tier the site actually leans on — Stripe's
    // 10px small print (93 elements) lost to three sizes used once each.
    const name = (list, names) => list.slice(0, names.length)
      .sort((a, b) => Math.abs(a.px - body.px) - Math.abs(b.px - body.px))
      .forEach((b, i) => { roles[names[i]] = asRole(b); });
    name(near.filter(b => b.px < body.px), TEXT_DOWN);
    name(near.filter(b => b.px > body.px), TEXT_UP);
  }

  // Heading roles are named by the element that carried them, so h1 means h1
  // rather than "the biggest thing we found".
  for (const level of ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']) {
    const hit = dominant(level);
    if (hit) roles[level] = asRole(hit);
  }
  for (const kind of ['button', 'link']) {
    const hit = dominant(kind);
    if (hit) roles[kind] = asRole(hit);
  }
  const mono = all.find(b => familyClass(b.stack) === 'mono');
  if (mono) roles.mono = asRole(mono);

  return { roles, available: true, distinctStyles: all.length };
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

  const roleSet = typographyRoles(capture);
  const bodyRole = roleSet.roles.body ?? null;
  const bodyPx = bodyRole ? parseFloat(bodyRole.fontSize) : null;

  // Prefer the co-occurring bundle. Assembling `body` from four independent
  // histograms can emit a combination the page never used; a bundle is by
  // construction one it did, which is also why lineHeightInferred goes false.
  return {
    body: bodyRole ? {
      family: bodyRole.fontFamily,
      class: bodyRole.class,
      stack: bodyRole.fontStack,
      sizePx: bodyPx,
      weight: bodyRole.fontWeight,
      lineHeightPx: bodyRole.lineHeight ? round(bodyRole.lineHeight * bodyPx, 2) : null,
      lineHeightRatio: bodyRole.lineHeight,
      lineHeightInferred: false,
      letterSpacing: bodyRole.letterSpacing,
    } : {
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
    // Roles need harvest v2; older captures get an empty set, never a made-up one.
    roles: roleSet.roles,
    rolesAvailable: roleSet.available,
    distinctStyles: roleSet.distinctStyles ?? null,
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
  // The OBSERVED pill value, not a conventional 9999px. Browsers serialise very
  // large radii their own way — Chrome hands back "3.35544e+07px" — and that
  // ugly string is what the site actually declares.
  const pillValue = all.find(e => isPillValue(e.value))?.value
    ?? (button && isPillValue(button) ? button : null);

  return {
    // Note: harvest gates on `borderRadius` but keys on `borderTopLeftRadius`,
    // so asymmetric radii are recorded by one corner only.
    scale: ascending.map((r, i) => ({ name: RADIUS_NAMES[i], px: r.px, count: r.count })),
    button,
    pill: Boolean(pillValue),
    pillValue,
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

/** WCAG thresholds. 1.4.11 has no enhanced level, so `enhanced` is null there
 *  rather than repeating the minimum — "not applicable" and "same bar twice"
 *  are different claims. */
const WCAG = {
  text: { min: 4.5, enhanced: 7, criterion: '1.4.3 Contrast (Minimum)' },
  nonText: { min: 3, enhanced: null, criterion: '1.4.11 Non-text Contrast' },
};

/** Which criterion the accent falls under depends on what it actually is, which
 *  only the extractor knows. A button fill or a focus ring is a UI component
 *  judged at 3:1; a link colour is text judged at 4.5:1. Applying the text bar
 *  to a focus ring reports a failure WCAG does not claim — Linear's #5e6ad2 at
 *  4.24:1 is a conformant focus indicator, not a failing body colour. */
const ACCENT_KIND = {
  interactiveBg: ['nonText', 'accent is a button fill, judged as a UI component'],
  focusRing: ['nonText', 'accent is a focus indicator, judged as a UI component'],
  interactiveFg: ['text', 'accent is link text'],
  textColors: ['text', 'accent is body text'],
};

/** WCAG check on every pair the token set actually declares. Pairs whose colors
 *  we failed to observe are skipped, never assumed to pass. */
export function contrastAudit(colors) {
  const { roles } = colors;
  const [accentKind, accentNote] = ACCENT_KIND[roles.primary?.source] ?? ['text', null];

  const pairs = [
    ['foreground', 'background', 'text', null],
    ['mutedForeground', 'background', 'text', null],
    ['primaryForeground', 'primary', 'text', 'label sitting on the accent fill'],
    ['primary', 'background', accentKind, accentNote],
    ['border', 'background', 'nonText',
      'decorative separators legitimately fail; only boundaries that convey meaning must pass'],
  ];

  const results = [];
  for (const [fgKey, bgKey, kind, note] of pairs) {
    const fg = roles[fgKey]?.hex;
    const bg = roles[bgKey]?.hex;
    if (!fg || !bg) continue;
    const { min, enhanced, criterion } = WCAG[kind];
    const ratio = round(contrastRatio(parseColor(fg), parseColor(bg)), 2);
    results.push({
      pair: `${fgKey}/${bgKey}`,
      fg, bg, ratio, kind, criterion, min, note,
      aa: ratio >= min,
      aaa: enhanced === null ? null : ratio >= enhanced,
    });
  }

  const failing = results.filter(r => !r.aa);
  return {
    pairs: results,
    failures: failing.length,
    // Split out because they mean different things: a failing text pair
    // disqualifies a file, a failing decorative border does not.
    textFailures: failing.filter(r => r.kind === 'text').length,
    minRatio: results.length ? Math.min(...results.map(r => r.ratio)) : null,
  };
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

/** Everything we could not observe, said out loud. This list is the honest
 *  half of the product — an unflagged gap is how a wrong token ships. */
function collectWarnings(capture, colors, type, spacing, rounded, states, components) {
  const w = [];
  const { roles } = colors;
  if (colors.roles.background.source === 'browserDefault') {
    w.push('No page background observed; composited against white. Colors with alpha may be off.');
  }
  if (!roles.foreground) w.push('No text color observed — the capture may have run before render.');
  if (!roles.primary) w.push('No chromatic accent found in buttons, focus rings, links or body text; palette is fully neutral.');
  else if (roles.primary.source === 'focusRing') {
    w.push(`Accent ${roles.primary.hex} taken from a focus ring`
      + (roles.primary.via ? ` (${roles.primary.via})` : '')
      + ', the only chromatic evidence on the page. The site never fills a button '
      + 'with it, so no foreground pairing could be observed.');
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
  for (const [kind, box] of Object.entries(components ?? {})) {
    if (box.elements < 3 && (box.padding !== '0px' || box.radius)) {
      w.push(`${kind} box metrics come from ${box.elements} element`
        + `${box.elements === 1 ? '' : 's'} out of ${box.variants} distinct shapes; `
        + 'thin evidence for a component token.');
    }
  }
  const sh = states?.sheets;
  if (sh && !states.available) {
    w.push(`Interaction states unavailable: all ${sh.total} stylesheets are cross-origin, `
      + 'so hover, focus and active could not be read at all.');
  } else if (sh && states.declarations === 0) {
    w.push(`Found ${sh.stateRules} state rules but none target elements on this page`
      + (sh.blocked ? `; the site's own CSS is likely among the ${sh.blocked} cross-origin sheets.` : '.'));
  }
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
  const states = stateTokens(capture);
  const components = componentTokens(capture);

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
    // 4: contrast audit picks its WCAG criterion from the accent's source.
    //    Tokens are unchanged from 3; only the audit verdicts move.
    // 5: adds colors.ramps — ordered surface and text ladders. Additive; the
    //    named roles are unchanged.
    // 6: adds typography.roles from harvest v2 bundles, and `body` now comes
    //    from a real bundle instead of four independent histogram winners,
    //    which moves body size on pages whose most-typed size is UI chrome.
    // 7: adds colors.semantic, and fixes hueFamily's bands, which were HSL
    //    angles applied to OKLCH — every red was labelled orange, so the `hue`
    //    facet moves on any palette containing one.
    // 8: adds states from harvest v3 stylesheet rules.
    // 9: rounded.pillValue records the observed pill radius, so nothing
    //    downstream has to invent a conventional 9999px.
    // 10: accent detection mines STATE box-shadows too, and parseColor learned
    //     hsl()/hsla(), so focus rings authored in hsl stop being invisible.
    // 11: adds components — box metrics per kind from harvest v4.
    // Token sets are only comparable for drift within the same version.
    clusterVersion: 11,
    tuning: { colorMerge: COLOR_MERGE, chromatic: CHROMATIC, gridThreshold: GRID_THRESHOLD },
    colors,
    typography,
    spacing,
    rounded,
    elevation,
    components,
    states,
    audit,
    warnings: collectWarnings(capture, colors, typography, spacing, rounded, states, components),
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

  const ramp = (label, items, detail) => (items.length
    ? `  ${label.padEnd(8)}${items.map(x => swatch(x.hex)).join('')}  `
      + items.map(x => `${x.hex} ${detail(x)}`).join('  ')
    : `  ${label.padEnd(8)}—`);
  lines.push('',
    ramp('surface', tokens.colors.ramps.surface, x => `(dL ${x.deltaL})`),
    ramp('text', tokens.colors.ramps.text, x => `(${x.contrast}:1)`));

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

  // Show the bar each pair was judged against, so a 4.24:1 PASS doesn't read as
  // a mistake when it is a focus ring measured at 3:1.
  lines.push('', ...tokens.audit.pairs.map(
    p => `  ${p.aa ? 'PASS' : 'FAIL'} ${p.pair.padEnd(28)} ${String(p.ratio).padStart(5)}:1`
      + `  needs ${p.min}:1 ${p.kind === 'nonText' ? '(non-text)' : '(text)'}`));
  if (tokens.warnings.length) {
    lines.push('', ...tokens.warnings.map(x => `  ! ${x}`));
  }
  return lines.join('\n');
}
