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
  COLOR_STOP_RE,
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
/** ...and stays close to neutral. Deliberately generous — plenty of systems tint
 *  their surfaces on purpose — but measured, real surfaces top out at 0.0186
 *  (Stripe's blue-grey #d4dee9) while accent panels start at 0.0776 (Apple's
 *  #9fc6f4) and run to 0.1684 (Notion's amber). 0.04 has margin on both sides. */
const SURFACE_MAX_CHROMA = 0.04;
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

/** Share of a page's button elements that must carry the same radius before it
 *  overrides the count rank across all interactive elements. See roundedTokens. */
const BUTTON_RADIUS_CONSENSUS = 0.6;

/**
 * Share of painted background area above which a chromatic colour is a SURFACE
 * the site fills sections with, not a control it fills buttons with.
 *
 * 0.05, and the cut sits in an observed gap. Measured across the corpus:
 * wise 21.3%, stripe 12.0%, duolingo 10.9%, shopify 9.5%, mailchimp 8.1%,
 * slack 7.5% — then a drop to apple 3.9%, govuk 3.6%, hackernews 2.3% and
 * everything else under 2%. The six above the line are exactly the sites built
 * from big coloured bands; the ones below paint a badge or a link.
 *
 * This is the fact the surface ramp cannot carry and correctly refuses to:
 * that ladder is a depth sequence of near-canvas neutrals, so it filters out
 * anything chromatic and anything already claimed as the accent. Wise's lime is
 * both, so 24% of its page went unpublished and its preview rendered as a white
 * page with a green button — which is the one thing Wise does not look like.
 */
const SECTION_FILL_MIN_AREA = 0.05;
/** A text tier has to carry real copy. Lower than TEXT_SIGNIFICANCE, which gates
 *  role assignment: a tier can be a minority voice, a role cannot. */
const RAMP_MIN_SHARE = 0.02;
/** Ramps stop here. Beyond four or five steps the tail is noise, and no system
 *  we have measured declares more. */
const MAX_RAMP = 5;

/**
 * Relative distance from a threshold inside which a decision is treated as
 * unstable — a re-capture could land on the other side without the site having
 * changed at all.
 *
 * Measured: GOV.UK's grid share moved 0.757 to 0.742 between two captures of an
 * unchanged page, flipping `spacing.base` from 5px to "no grid". That is a ~2%
 * wobble, so 5% covers ordinary sampling noise with room.
 *
 * This matters because drift monitoring is the point of dating these files. A
 * token that changes has to mean the SITE changed; a token that changes because
 * a measurement crossed a line is a false alarm that trains people to ignore
 * real ones.
 */
const DEAD_BAND = 0.05;

/**
 * Records how close each threshold decision came to flipping, and — given the
 * previous token set — declines to flip on a margin thinner than the noise.
 * Hysteresis is the standard answer to boundary chatter.
 */
function stabilizer() {
  const notes = [];
  return {
    notes,
    choose(decision, { measured, threshold, value, prior }) {
      const margin = threshold === 0 ? Infinity : (measured - threshold) / Math.abs(threshold);
      if (Math.abs(margin) > DEAD_BAND) return value;
      // `undefined` means no previous capture; `null` is a real prior verdict
      // ("this site has no grid") and holds symmetrically.
      const hold = prior !== undefined && prior !== value;
      notes.push({
        decision,
        measured: round(measured, 4),
        threshold,
        margin: round(margin, 4),
        ...(hold ? { held: prior, wouldHaveBeen: value } : { held: null }),
      });
      return hold ? prior : value;
    },
  };
}

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

// `? :` rather than `&&`. With `&&`, an unobservable role inherited whatever
// falsy value the caller happened to pass — `border[0]` on an empty array is
// `undefined`, and JSON.stringify DELETES undefined keys, so `border` vanished
// from three captures entirely. A missing key reads as "this pipeline version
// had no such field"; null reads as "measured, not found", which is the claim.
// Every other omission in this file is already null.
const token = (cluster, share, extra = {}) => (cluster ? {
  hex: cluster.hex,
  weightShare: round(share, 4),
  variants: cluster.variants,
  ...extra,
} : null);

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
      && toOklch(c.rgb).C <= SURFACE_MAX_CHROMA
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
  // Last resort: a recurring chromatic SURFACE.
  //
  // The general bgColors histogram is deliberately excluded from every step
  // above, because a single large fill is a promotion rather than a brand — the
  // yellow panel that once became Linear's accent. That exclusion is right, and
  // it also made Hacker News come out "fully neutral": its #ff6600 masthead is
  // painted on a table, the page has no styled control anywhere, and nothing
  // chromatic reaches the chain.
  //
  // Reached only when the page is otherwise entirely neutral, so it can never
  // outrank a button fill, a focus ring or a link. The recurrence floor still
  // applies, which is what keeps the one-off promo panel out.
  if (!primary) {
    // `bg`, not the surface ramp: the ramp is built further down and is gated
    // on area share to find real surfaces, which is the wrong test for a small
    // brand masthead.
    primary = bg.find(c => isChromatic(c) && recurring(c) && c.rgb !== backdrop.rgb);
    primarySource = primary ? 'surfaceFill' : null;
  }

  // A surface is not an accent and not a state. Semantic colours are resolved
  // first so they can be excluded here: a warning tint sitting behind a banner
  // is near the background in lightness and low-chroma enough to pass every
  // other guard, which is how Basecamp's #ffdc74 became its `card`.
  const semantic = semanticColors(capture, primary);
  const accents = new Set([
    ...iBg.map(c => c.hex),
    ...Object.values(semantic).map(v => v.hex),
  ]);
  const card = bg.find(c => deltaE(c.rgb, backdrop.rgb) > SURFACE_MERGE
    && Math.abs(toOklch(c.rgb).L - bgLightness) <= SURFACE_MAX_DL
    && toOklch(c.rgb).C <= SURFACE_MAX_CHROMA
    && !accents.has(c.hex)) || null;

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

  // The colour this system paints whole sections in. Ranked by painted area
  // over the background histogram — `interactiveBg` would only ever find the
  // button. Chromatic, because a neutral band is the surface ramp's job, and
  // not the canvas itself.
  const fill = bg
    .filter(c => c.hex !== backdrop.hex
      && toOklch(c.rgb).C >= CHROMATIC
      && shares.bg > 0 && c.weight / shares.bg >= SECTION_FILL_MIN_AREA)
    .sort((a, b) => b.weight - a.weight)[0] ?? null;

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
    // A brand colour used as a ground, not as a control. Null for most systems,
    // and null is the right answer: Nike, Pentagram and Vercel paint no large
    // chromatic area at all, and a preview that invented one for them would be
    // wrong in the same direction Wise's was.
    sectionFill: fill
      ? { hex: fill.hex, areaShare: round(fill.weight / shares.bg, 4) }
      : null,
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
  // Bundle selection is unchanged, and that is a finding rather than an
  // oversight. Ranking by mean painted area was tried and is worse: the
  // `button|a|role=button` selector matches links wrapped around whole cards,
  // so "biggest" gave Linear `0px 28px 0px 36px`, Stripe `32px 0px`, and turned
  // Tailwind's 4px buttons into pills. Filtering to bundles padded on both axes
  // first still put Stripe at 2px and Notion at a pill.
  //
  // `componentBoxes` does not carry enough signal to identify a primary CTA —
  // it has no notion of which element is the call to action, and a big link is
  // shaped exactly like a big button. `dominantUnstyled` and `variants` below
  // exist to say so, and the file publishes the warning rather than pretending.
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
      const value = normalizeStateValue(prop, decl.slice(i + 1));
      // Harvest resolves var() against a matched element. When that fails the
      // declaration is still a reference, not a value, and publishing it hands
      // an agent something it cannot use: Framer's link:hover survived as a
      // 400-character chain of nested framer-* fallbacks, and Figma's as
      // `var(--fig-theme-border-hover, ...)`. Omit rather than emit a token
      // whose value is "look somewhere else".
      if (/var\(/.test(value)) continue;
      props[prop] = value;
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

/**
 * Classify off the generic keyword the site itself declared — the FIRST one in
 * stack order, not whichever kind is tested first.
 *
 * Substring-testing the whole stack, mono first, made any stack mentioning
 * monospace anywhere a monospace stack. Wise declares
 * `Inter, sans-serif, helvetica, arial, monospace` on its big currency figure:
 * a sans stack with a legacy last-resort fallback. That gave Wise a `mono`
 * type role of 300px at a 0.09 line-height — three elements and 42 characters
 * of display number, published as the file's monospace text style. A site
 * wearing that file rendered every line of code at 300px.
 *
 * Reading left to right also keeps the original sans-before-serif care, which
 * is still needed WITHIN a token because "sans-serif" contains "serif".
 */
const GENERICS = [
  [/^(ui-)?monospace$/, 'mono'],
  [/^(ui-)?sans-serif$/, 'sans'],
  [/^(system-ui|-apple-system|blinkmacsystemfont)$/, 'sans'],
  [/^(ui-)?serif$/, 'serif'],
  [/^cursive$/, 'cursive'],
];
function familyClass(stack) {
  for (const raw of String(stack ?? '').toLowerCase().split(',')) {
    const family = raw.trim().replace(/^["']|["']$/g, '');
    for (const [re, cls] of GENERICS) if (re.test(family)) return cls;
  }
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

export function spacingTokens(capture, { stab, prior } = {}) {
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
  const best = Math.max(0, ...shares.map(s => s.share));
  // The base is a scalar, so it can be held outright. Role decisions elsewhere
  // resolve to whole clusters and are only flagged, not held — see `stability`.
  const base = stab
    ? stab.choose('spacing.base', {
      measured: best, threshold: GRID_THRESHOLD, value: grid?.base ?? null, prior,
    })
    : grid?.base ?? null;

  return {
    base,
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
  // The radius a supermajority of this page's BUTTONS actually carry, when one
  // exists, ahead of the commonest radius across every interactive element.
  //
  // Wise puts 9999px on 95% of its twenty button elements and 2px on hundreds
  // of other interactive things; the count rank over `interactiveRadius` took
  // the 2px, and because `components.button.radius` is emitted as a
  // `{rounded.button}` reference, the file told an agent to build square
  // buttons for a site whose buttons are all pills. Figma is the same at 68%.
  //
  // BUTTON_RADIUS_CONSENSUS is 0.6 and the cut sits in an observed gap: of the
  // systems whose top button radius is non-zero, agreement runs 95% (wise),
  // 68% (figma), 67% (duolingo) — then 57% (mailchimp), 53%, 50%, 46%, 43%,
  // 42%. Below the cut the bundles genuinely disagree and there is no
  // supermajority to read, so the old behaviour stands rather than a coin toss.
  //
  // Zero is excluded here as it is below: most `<a>` elements are square, so a
  // zero majority says nothing about button shape.
  const buttonRadii = {};
  let buttonElements = 0;
  for (const [key, w] of Object.entries(capture?.componentBoxes ?? {})) {
    const [kind, , , radius] = key.split('|');
    if (kind !== 'button') continue;
    buttonRadii[radius] = (buttonRadii[radius] ?? 0) + (w?.count ?? 0);
    buttonElements += w?.count ?? 0;
  }
  const consensus = Object.entries(buttonRadii)
    .sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1))[0];
  const agreed = consensus && buttonElements > 0
    && consensus[1] / buttonElements >= BUTTON_RADIUS_CONSENSUS
    && parseFloat(consensus[0]) > 0
    ? consensus[0]
    : null;

  const button = agreed
    ?? entriesOf(capture.interactiveRadius, 'count')
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
function collectWarnings(capture, colors, type, spacing, rounded, states, components, layout, backgrounds) {
  const w = [];
  const { roles } = colors;
  if (colors.roles.background.source === 'browserDefault') {
    w.push('No page background observed; composited against white. Colors with alpha may be off.');
  }
  if (!roles.foreground) w.push('No text color observed — the capture may have run before render.');
  if (layout && !layout.available) {
    w.push('Capture predates harvest v5; no structure was measured. Re-extract to '
      + 'recover the measure, hero, rhythm and motion.');
  } else if (layout) {
    if (layout.sectionsReliable === false) {
      w.push('Page sections could not be read — the children of the content root do not '
        + 'partition it, which happens on app shells and on stacked full-height layers. '
        + 'Hero, section rhythm and section count are withheld; measure, grid, navigation '
        + 'and motion are measured independently and stand.');
    }
    if (layout.hero?.ctaEvidence === 'weak') {
      w.push(`Hero call-to-action count (${layout.hero.ctas}) was found several levels above `
        + 'the headline, so it may include controls that are not part of the hero.');
    }
    if (layout.nav?.overflowed) {
      w.push('Navigation measured taller than a fifth of the viewport — likely a menu '
        + 'caught open; its height was withheld rather than published.');
    }
    if (layout.sectionsReliable && !layout.composition) {
      w.push('Too few sections to describe how they are composed; section width, media '
        + 'emphasis and copy density are withheld rather than reported from a handful.');
    }
    if (layout.hero && layout.hero.heightRatio == null) {
      w.push(`First section is ${layout.hero.heightRatioMeasured} viewports tall — most likely `
        + 'a run of stacked panels rather than one hero, so its height was withheld.');
    }
    if (layout.hero && !layout.hero.headingSize) {
      w.push('First section carries no heading; the page may open on chrome — a search bar '
        + 'or a breadcrumb — rather than on a headline.');
    }
    if (layout.measure && layout.measure.share < 0.2) {
      w.push(`Content measure ${layout.measure.px}px explains only `
        + `${Math.round(layout.measure.share * 100)}% of observed widths; the page may not hold one.`);
    }
  }
  if (backgrounds && !backgrounds.available) {
    w.push('Capture predates harvest v8; the decorative layer was not measured. '
      + 'Re-extract to recover gradients, patterns and compositing.');
  } else if (backgrounds?.available) {
    if (!backgrounds.decorated) {
      w.push('No background image, gradient or pattern anywhere on the page. The canvas '
        + 'is flat colour, and that is the design rather than a gap in the capture.');
    }
    if (backgrounds.pattern?.external) {
      w.push(`Background texture is an external raster tiling at ${backgrounds.pattern.size}. `
        + 'Its URL is deliberately not published — reproduce the effect rather than '
        + 'hotlinking the source site\'s asset.');
    }
    if (backgrounds.wash?.truncated || backgrounds.pattern?.truncated) {
      w.push('A background value exceeded the capture limit and was truncated; '
        + 'read it from the source rather than copying it from here.');
    }
  }
  if (!roles.primary) w.push('No chromatic accent found in buttons, focus rings, links or body text; palette is fully neutral.');
  else if (roles.primary.source === 'focusRing') {
    w.push(`Accent ${roles.primary.hex} taken from a focus ring`
      + (roles.primary.via ? ` (${roles.primary.via})` : '')
      + ', the only chromatic evidence on the page. The site never fills a button '
      + 'with it, so no foreground pairing could be observed.');
  } else if (roles.primary.source === 'surfaceFill') {
    w.push(`Accent ${roles.primary.hex} taken from a recurring coloured surface — the page `
      + 'has no styled control, focus ring or chromatic text to read it from. It is the '
      + 'brand colour of a masthead or panel, not of a button.');
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
/** Sibling containers land a pixel or two apart while being the same measure.
 *  2% groups those without merging a 1230px column into a 1440px full bleed. */
const MEASURE_TOLERANCE = px => Math.max(4, px * 0.02);

/**
 * Structure: the part of a design an agent cannot guess from the palette.
 *
 * A file carrying only colours and type produces a page in the right ink and
 * the wrong shape, which is most of why generated UI still reads as generic.
 * Everything here was measured from boxes and computed style by harvest v5, and
 * is reduced the same way colour is: cluster, then represent the cluster by its
 * heaviest OBSERVED member. No value is averaged into existence.
 */
export function layoutTokens(capture) {
  const st = capture.structure;
  // Captures older than harvestVersion 5 have no structure, and nothing about
  // the page can be inferred from its absence.
  if (!st) return { available: false };

  const dominant = (obj, tolerance) => {
    const entries = Object.entries(obj || {})
      .map(([k, count]) => ({ px: Number(k), weight: count, count }))
      .filter(e => Number.isFinite(e.px))
      // Heaviest first, so clusterNumeric seeds each cluster with its heaviest
      // member and reports that rather than whichever it happened to see first.
      .sort((a, b) => b.weight - a.weight || b.px - a.px);
    if (!entries.length) return null;
    const total = entries.reduce((sum, e) => sum + e.weight, 0);
    const top = clusterNumeric(entries, tolerance)[0];
    return top ? { px: top.px, occurrences: top.count, share: round(top.weight / total, 3) } : null;
  };

  const columns = Object.entries(st.gridColumns || {})
    .map(([k, v]) => ({ count: Number(k), occurrences: v }))
    .sort((a, b) => b.occurrences - a.occurrences)[0] ?? null;

  const transitions = Object.entries(st.transitions || {}).sort((a, b) => b[1] - a[1]);
  const motionTotal = transitions.reduce((sum, t) => sum + t[1], 0);
  const motion = transitions.length
    ? {
      // Duration and easing were bundled into one key by the harvester, off the
      // same element, so this pair is one that actually runs on the page.
      duration: transitions[0][0].slice(0, transitions[0][0].indexOf(' ')),
      easing: transitions[0][0].slice(transitions[0][0].indexOf(' ') + 1),
      occurrences: transitions[0][1],
      share: round(transitions[0][1] / motionTotal, 3),
    }
    // Not "unknown". A page that animates no control is making a choice, and
    // GOV.UK's instant, motionless interactions are as much its character as
    // its 610px measure. An agent told nothing here would invent an ease.
    : { duration: null, easing: null, occurrences: 0, share: 0 };

  // Measured across the corpus, real heroes run 0.76 to 1.59 viewports. Apple's
  // first section is 2.33 and holds several stacked product panels: a sequence
  // you scroll through, not a view you land on. Publishing it as heroHeight
  // would tell an agent to build a 2.3-screen opening, so the height is
  // withheld above this and the headline it does contain is kept.
  const HERO_MAX_RATIO = 2;
  const hero = st.hero
    ? {
      heightRatio: st.hero.heightRatio <= HERO_MAX_RATIO ? st.hero.heightRatio : null,
      heightRatioMeasured: st.hero.heightRatio,
      headingSize: st.hero.headingSize,
      align: st.hero.align,
      media: st.hero.media,
      fullBleed: st.hero.fullBleed,
      ctas: st.hero.ctas,
      ctasFilled: st.hero.ctasFilled,
      // Level 0 means the controls sit in the headline's own block. Deeper
      // means the walk passed through markup that was not plainly the hero's
      // text block, so the count is reported with a warning rather than as
      // though it were certain.
      ctaEvidence: st.hero.ctaLevel === 0 ? 'strong'
        : st.hero.ctaLevel > 0 ? 'weak' : 'none',
    }
    : null;

  // Section composition, as a repertoire rather than a running order.
  //
  // Bands, not raw ratios, because the ratio is evidence and the band is the
  // instruction. Each cut sits in an observed gap rather than at a round
  // number: bleed measured 0% on three sites and 100% on two, with Nike alone
  // at 53%, so anything inside 0.3-0.7 is genuinely mixed. Media-led ran 0, 0,
  // 30, 50, 64 and 74. Median characters per section ran 74, 96, 249, 536, 892
  // and 1145, which separates a page of captions from a page of prose.
  const BLEED_MOSTLY = 0.7;
  const BLEED_RARELY = 0.3;
  const MEDIA_LED = 0.6;
  const MEDIA_SOME = 0.35;
  const COPY_SPARSE = 150;
  const COPY_DENSE = 600;

  // A distribution over three sections is not a distribution. Apple's three are
  // 2100, 1764 and 957px containers each holding several stacked panels, so its
  // shares quantise to thirds and its median section carries 9400 characters —
  // the same coarseness that already withheld its hero height. Four is the
  // point where the observed corpus starts reporting shares that match the site.
  const MIN_COMPOSITION_SECTIONS = 4;
  const comp = st.sectionComposition;
  const composition = (comp && comp.total >= MIN_COMPOSITION_SECTIONS && st.sectionsReliable)
    ? (() => {
      const share = (n) => n / comp.total;
      const bleed = share(comp.bleed);
      const media = share(comp.mediaLed);
      return {
        // Counts kept alongside the labels: the label is what an agent acts
        // on, the count is what a reader checks it against.
        total: comp.total,
        bleedCount: comp.bleed,
        griddedCount: comp.gridded,
        mediaLedCount: comp.mediaLed,
        charsMedian: comp.charsMedian,
        sectionWidth: bleed >= BLEED_MOSTLY ? 'full-bleed'
          : bleed <= BLEED_RARELY ? 'contained' : 'mixed',
        // "none" is its own answer, not a low score. Basecamp runs five
        // sections with no content imagery at all, and an agent told
        // "text-led" would still reach for a photograph.
        sectionMedia: comp.mediaLed === 0 ? 'none'
          : media >= MEDIA_LED ? 'image-led'
            : media >= MEDIA_SOME ? 'balanced' : 'text-led',
        sectionCopy: comp.charsMedian < COPY_SPARSE ? 'sparse'
          : comp.charsMedian < COPY_DENSE ? 'moderate' : 'dense',
        gridPrevalence: round(share(comp.gridded), 2),
      };
    })()
    : null;

  // Section detection either partitioned the page or it did not. When it did
  // not, everything derived from sections is withheld — the measure, the grid,
  // the nav and the motion are read independently and still stand.
  const ok = st.sectionsReliable;
  return {
    available: true,
    sectionsReliable: ok,
    sections: ok ? st.sectionCount : null,
    measure: dominant(st.contentWidths, MEASURE_TOLERANCE),
    rhythm: ok ? dominant(st.sectionRhythm, MEASURE_TOLERANCE) : null,
    composition,
    columns,
    hero: ok ? hero : null,
    // A nav measured taller than a fifth of the viewport is a mega-menu caught
    // open, not a bar. The height is dropped and the rest kept.
    nav: st.nav ? { ...st.nav, height: st.nav.overflowed ? null : st.nav.height } : null,
    motion,
  };
}

/** A background-size small enough to be a repeating tile rather than a wash.
 *  Measured tiles run 3px (getdesign.md scanlines), 10px (Tailwind's dot grid
 *  and hatch) and 256px (Linear's grain sheet); the smallest non-tiled washes
 *  are `auto` or full-element. 320 sits well clear of both. */
const TILE_MAX_PX = 320;

/** Colour functions that can appear as a gradient stop. None of them nest, so a
 *  non-greedy match to the first `)` is safe — `color(display-p3 ...)` included. */
/**
 * The decorative layer: gradients, tiled patterns, grain, and the compositing
 * that makes them read.
 *
 * Everything else in this file records what colour a surface IS. This records
 * what is painted over it, which is most of the difference between a flat page
 * in the right palette and one that looks like the site. GOV.UK returns nothing
 * here, and that is a finding rather than a failure.
 */
export function backgroundTokens(capture) {
  const bg = capture.backgrounds;
  // Captures before harvest v8 never looked, and silence is not evidence.
  if (!bg) return { available: false };

  const totalArea = Object.values(bg.layers).reduce((sum, w) => sum + w.area, 0);
  const layers = Object.entries(bg.layers).map(([key, w]) => {
    const parts = key.split('|');
    const [kind, size, repeat, position] = parts;
    const value = parts.slice(4).join('|');
    // A tile repeats and is small in every axis it sizes.
    //
    // `no-repeat` contains the substring `repeat`, so a bare /repeat/ test
    // matched images that explicitly do not tile — Basecamp's signature SVG and
    // a Verge `cover` image both came back as textures. The negative has to be
    // ruled out before the positive.
    const repeats = !/no-repeat/.test(repeat) && /repeat|round|space/.test(repeat);
    // A size with `auto`, `cover` or `contain` is scaled to its box, not laid
    // out on a grid, whatever the other axis says.
    const scaled = /auto|cover|contain/.test(size);
    const px = size.match(/(-?[\d.]+)px/g)?.map(parseFloat) ?? [];
    const tiled = repeats && !scaled && px.length > 0 && px.every(n => n > 0 && n <= TILE_MAX_PX);
    const stops = [];
    for (const raw of value.match(COLOR_STOP_RE) ?? []) {
      const rgb = parseColor(raw);
      // parseColor returns null for keywords like `transparent`, which are real
      // stops but carry no colour worth publishing.
      // Chroma travels with the stop so a consumer can tell a brand colour from
      // a fade-end without re-deriving it. Measured across the corpus, real
      // gradient colours run 0.063 (Slack's palest lilac) to 0.246, while the
      // noise runs 0.000 (white), 0.014 and 0.027 — CHROMATIC at 0.03 sits in
      // the gap, so the existing constant does the job without a new one.
      if (rgb) {
        stops.push({
          raw, hex: toHex(rgb), alpha: round(rgb.a ?? 1, 3),
          chroma: round(toOklch(rgb).C, 4),
        });
      }
    }
    return {
      kind,
      tiled,
      size,
      repeat,
      position,
      // An external raster is somebody else's asset. Recording that a 256px
      // grain sheet tiles over the page is a fact about the design; shipping
      // the URL into a file people commit invites hotlinking Linear's PNG.
      value: kind === 'raster' ? null : value,
      external: kind === 'raster',
      truncated: /TRUNCATED$/.test(value),
      stops,
      count: w.count,
      areaShare: totalArea ? round(w.area / totalArea, 3) : 0,
    };
  }).sort((a, b) => b.areaShare - a.areaShare);

  // Derived from geometry, not from the author's intent: a radial gradient on a
  // 10px tile IS a dot grid, whatever it was called in the stylesheet.
  const patternOf = (l) => {
    if (!l.tiled) return null;
    if (l.kind.includes('radial')) return 'dots';
    if (l.kind.includes('linear')) return 'lines';
    if (l.kind === 'raster' || l.kind === 'data-uri') return 'noise';
    if (l.kind === 'svg-tile') return 'svg-tile';
    return null;
  };
  const angleOf = (l) => l.value?.match(/\(\s*(-?[\d.]+)deg/)?.[1] ?? null;

  // Ordered by painted area, because a page can carry more than one texture and
  // taking only the largest silently drops the rest. Tailwind lays a 315-degree
  // hairline hatch over its dot grid at a third of the dots' area — the second
  // most-painted decoration on the page, and invisible in every file we
  // published before this. The Verge stacks three rule sheets at 120/160/200px.
  const tiled = layers.filter(l => patternOf(l));
  const pattern = tiled[0];
  // Only the runner-up. A third layer is real but the file is a design language,
  // not a transcript of the page, and two textures is already the whole of what
  // a consumer can act on without recreating the source's own layout.
  const overlay = tiled[1];
  const wash = layers.find(l => !l.tiled && /gradient/.test(l.kind));

  const patternShape = (l) => ({
    kind: patternOf(l),
    size: l.size,
    angle: angleOf(l),
    value: l.value,
    external: l.external,
    stops: l.stops,
    areaShare: l.areaShare,
  });

  const effect = (prefix) => {
    const hit = Object.entries(bg.effects)
      .filter(([k]) => k.startsWith(`${prefix}|`))
      .sort((a, b) => b[1].area - a[1].area)[0];
    return hit ? { value: hit[0].slice(prefix.length + 1), count: hit[1].count } : null;
  };

  return {
    available: true,
    // Said explicitly. A page with no decorative layer at all is a design
    // choice — GOV.UK's flat canvas is as deliberate as Linear's grain — and an
    // agent told nothing here would reach for a gradient.
    //
    // "Decorated" means a treatment was found, not merely that some element
    // carries a background-image. Basecamp paints a signature SVG and a logo
    // that way; neither decorates the canvas, and counting them would have
    // reported a flat page as textured.
    decorated: Boolean(pattern || wash || Object.values({
      a: effect('backdrop-filter'), b: effect('mix-blend-mode'),
      c: effect('mask-image'), d: effect('filter'),
    }).some(Boolean)),
    layerCount: layers.length,
    pattern: pattern ? patternShape(pattern) : null,
    // The second texture, same shape as the first. Null on twenty-one of the
    // twenty-three systems here: most pages carry one treatment or none.
    overlay: overlay ? patternShape(overlay) : null,
    wash: wash
      ? {
        kind: wash.kind,
        value: wash.value,
        stops: wash.stops,
        areaShare: wash.areaShare,
      }
      : null,
    effects: {
      backdropFilter: effect('backdrop-filter'),
      mixBlendMode: effect('mix-blend-mode'),
      maskImage: effect('mask-image'),
      filter: effect('filter'),
    },
  };
}

export function cluster(capture, { previous } = {}) {
  const stab = stabilizer();
  const colors = colorTokens(capture);
  const typography = typographyTokens(capture);
  const spacing = spacingTokens(capture, { stab, prior: previous?.spacing?.base });
  const rounded = roundedTokens(capture);
  const elevation = elevationTokens(capture);
  const audit = contrastAudit(colors);
  const states = stateTokens(capture);
  // Flagged, not held: an accent decision resolves to a whole cluster, and
  // reconstructing one from a previous hex would be guesswork.
  const accent = colors.roles.primary;
  if (accent?.occurrences != null && accent.source === 'interactiveBg') {
    stab.choose('colors.primary', {
      measured: accent.occurrences, threshold: MIN_ACCENT_COUNT,
      value: accent.hex, prior: undefined,
    });
  }
  const components = componentTokens(capture);
  const layout = layoutTokens(capture);
  const backgrounds = backgroundTokens(capture);

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
    // 12: adds `stability`, and spacing.base holds its previous value when the
    //     grid share lands within DEAD_BAND of the threshold.
    // 13: parseColor understands lab/oklab/oklch/display-p3, so sites authoring
    //     in modern colour spaces stop resolving to null andwhite-on-white.
    // Token sets are only comparable for drift within the same version.
    // 18: adds backgrounds.overlay — the second tiled texture, previously
    //     dropped because only the largest layer was published.
    // 19: adds colors.sectionFill — the chromatic colour a site grounds whole
    //     sections in, which the surface ramp filters out by design.
    // 20: rounded.button reads a supermajority of the page's own button
    //     bundles before falling back to the interactiveRadius count rank, and
    //     an unobservable colour role is null rather than undefined — the
    //     latter was being deleted by JSON.stringify, so the key vanished.
    // 21: familyClass reads the FIRST generic in a font stack rather than any
    //     generic present, so a sans stack with a trailing `monospace` fallback
    //     stops being published as a monospace type role.
    clusterVersion: 21,
    tuning: { colorMerge: COLOR_MERGE, chromatic: CHROMATIC, gridThreshold: GRID_THRESHOLD },
    colors,
    typography,
    spacing,
    // Decisions that came within DEAD_BAND of their threshold. A drift check
    // should discount a change to any of these: it may be the measurement
    // moving rather than the site.
    stability: { deadBand: DEAD_BAND, notes: stab.notes },
    rounded,
    elevation,
    components,
    // Structure. Colours and type describe the paint; this describes the
    // building, and it is the half a scraped catalog cannot reproduce.
    layout,
    // The decorative layer painted over the surfaces.
    backgrounds,
    states,
    audit,
    warnings: collectWarnings(capture, colors, typography, spacing, rounded, states, components, layout, backgrounds),
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
