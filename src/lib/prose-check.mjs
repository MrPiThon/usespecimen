// Does the prose still say what the tokens say?
//
// Every body in this registry was written by hand against a capture, and every
// capture has been re-taken since. The build already refuses a file that breaks
// the spec; it has nothing to say about a file whose prose asserts a number its
// own frontmatter contradicts. GOV.UK claimed "a 5px base unit obeyed by 76%"
// for several captures after its grid stopped resolving at all.
//
// Deliberately narrow. It checks claims that are mechanically verifiable and
// stays silent on everything else, because a drift check that cries wolf gets
// switched off. Cross-references to other systems ("second only to Airbnb's
// 1430px") are why bare pixel values are not checked at all.

import { parseColor, contrastRatio, flatten } from './color.mjs';

const round2 = n => Math.round(n * 100) / 100;

/** Every colour the file or its capture can legitimately mention. */
function knownHexes(data, capture) {
  const out = new Set();
  const add = (v) => {
    if (typeof v !== 'string') return;
    for (const m of v.toLowerCase().matchAll(/#[0-9a-f]{6}\b/g)) out.add(m[0]);
    // Shadows, gradients and state rules carry rgb()/oklch() rather than hex;
    // normalising them lets prose quote either form.
    for (const m of v.matchAll(/(?:rgba?|oklch|oklab|lab|hsla?|color)\([^()]*\)/gi)) {
      const c = parseColor(m[0]);
      if (c) out.add(toHexish(c));
    }
  };
  const walk = (v) => {
    if (typeof v === 'string') add(v);
    else if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === 'object') Object.values(v).forEach(walk);
  };
  walk(data);
  walk(capture);
  return out;
}

function toHexish({ r, g, b }) {
  const h = n => Math.round(Math.min(255, Math.max(0, n))).toString(16).padStart(2, '0');
  return `#${h(r)}${h(g)}${h(b)}`;
}

/** Ratios a reader could legitimately quote: every token against the canvas,
 *  plus the on-primary pairing, plus whatever the audit already published. */
function knownRatios(data, capture) {
  const out = new Set();
  const colors = data.colors ?? {};
  const bg = parseColor(colors.background ?? '#ffffff');
  const push = (n) => { if (Number.isFinite(n)) out.add(round2(n)); };
  if (bg) {
    for (const v of Object.values(colors)) {
      const c = parseColor(v);
      if (c) push(contrastRatio(flatten(c, bg), bg));
    }
  }
  const prim = parseColor(colors.primary ?? '');
  const onPrim = parseColor(colors.primaryForeground ?? '');
  if (prim && onPrim) push(contrastRatio(flatten(onPrim, prim), prim));
  // The dark palette is a second set of legitimate pairings. Without it, prose
  // quoting a dark-mode ratio — Vercel's #ededed on #000000 at 17.94:1 — reads
  // as a claim matching nothing.
  const darkBg = parseColor(colors['dark-background'] ?? '');
  if (darkBg) {
    for (const [k, v] of Object.entries(colors)) {
      if (!k.startsWith('dark-')) continue;
      const c = parseColor(v);
      if (c) push(contrastRatio(flatten(c, darkBg), darkBg));
    }
  }
  for (const p of capture?.audit?.pairs ?? []) push(p.ratio);
  for (const t of capture?.colors?.ramps?.text ?? []) push(t.contrast);
  return out;
}

/**
 * @returns {{slug: string, issue: string}[]} one entry per contradiction.
 */
export function checkProse(slug, data, body, capture) {
  const issues = [];
  const say = issue => issues.push({ slug, issue });

  // --- colours the file does not contain ----------------------------------
  const known = knownHexes(data, capture);
  const quoted = new Set([...body.toLowerCase().matchAll(/#[0-9a-f]{6}\b/g)].map(m => m[0]));
  for (const hex of quoted) {
    if (!known.has(hex)) say(`prose cites ${hex}, which is not in the tokens or the capture`);
  }

  // --- contrast ratios ------------------------------------------------------
  const ratios = knownRatios(data, capture);
  // WCAG's own thresholds. Prose cites them as the bar a value has to clear —
  // "most brand colours sit near the 4.5:1 floor" — which is not a claim about
  // anything measured in this file.
  const THRESHOLDS = new Set([3, 4.5, 7]);
  for (const m of body.matchAll(/\b(\d+\.\d+):1/g)) {
    const claimed = Number(m[1]);
    if (THRESHOLDS.has(claimed)) continue;
    // Tolerance covers rounding in the prose, not a different measurement.
    const near = [...ratios].some(r => Math.abs(r - claimed) <= 0.02);
    if (!near) say(`prose claims ${claimed}:1, which matches no measured pair`);
  }

  // --- the spacing grid -----------------------------------------------------
  const base = data.spacing?.base ?? null;
  const claimsNoGrid = /no spacing grid|has no (?:consistent )?spacing grid|no consistent spacing grid/i.test(body);
  const claimsBase = body.match(/\b(\d+(?:\.\d+)?)px base unit\b/i)
    || body.match(/\bA (\d+(?:\.\d+)?)px base unit\b/i);
  if (base && claimsNoGrid) {
    say(`prose says there is no spacing grid, but the file publishes base ${base}`);
  }
  if (!base && claimsBase) {
    say(`prose claims a ${claimsBase[1]}px base unit, but the file publishes none`);
  }
  if (base && claimsBase && `${claimsBase[1]}px` !== base) {
    say(`prose claims a ${claimsBase[1]}px base unit; the file publishes ${base}`);
  }

  // --- grid confidence ------------------------------------------------------
  const conf = capture?.spacing?.gridConfidence;
  if (Number.isFinite(conf)) {
    const pct = Math.round(conf * 100);
    for (const m of body.matchAll(/explain(?:s|ing)? only (\d+)%|explains (\d+)%|obeyed by (\d+)%/gi)) {
      const claimed = Number(m[1] ?? m[2] ?? m[3]);
      if (Math.abs(claimed - pct) > 1) {
        say(`prose says the grid explains ${claimed}% of values; the capture measured ${pct}%`);
      }
    }
  }

  // --- motion ---------------------------------------------------------------
  const dur = data.motion?.duration ?? null;
  const noMotion = /\bno (?:control|transition)|declares? no transition|Motion is essentially absent|not one control/i.test(body);
  if (dur && noMotion && !/only one control|a single control/i.test(body)) {
    say(`prose says nothing animates, but the file publishes motion ${dur}`);
  }
  if (!dur && /\bMotion is \d/i.test(body)) {
    say('prose states a motion duration, but the file publishes no motion group');
  }
  if (dur) {
    for (const m of body.matchAll(/\bMotion is \*{0,2}(\d+(?:\.\d+)?s)\b/gi)) {
      if (m[1] !== dur) say(`prose says motion is ${m[1]}; the file publishes ${dur}`);
    }
  }

  // --- shape ----------------------------------------------------------------
  const radii = Object.entries(data.rounded ?? {})
    .filter(([, v]) => typeof v === 'string')
    .map(([, v]) => parseFloat(v));
  const isSharp = radii.length > 0 && radii.every(r => r === 0);
  if (isSharp && !/no border radius|every corner|square/i.test(body)) {
    say('file is sharp (every radius 0px) but the prose does not say so');
  }
  if (!isSharp && radii.length && /no border radius anywhere/i.test(body)) {
    say('prose says there is no radius anywhere, but the file publishes radii');
  }

  // --- typography -----------------------------------------------------------
  const type = data.typography ?? {};
  const family = (stack) => (typeof stack === 'string'
    ? stack.split(',')[0].trim().replace(/^["']|["']$/g, '')
    : null);
  const body_ = body.toLowerCase();
  for (const [label, stack] of [['body', type.fontFamily], ['heading', type.headingFamily]]) {
    const raw = family(stack);
    // A generic stack has no name worth asserting: `ui-sans-serif` and friends
    // are what a page says when it declines to choose a face, and The Verge's
    // headings resolve to one at the top level while the real face survives in
    // the type roles.
    if (!raw || /^(ui-)?(system-ui|sans-serif|serif|monospace|rounded)$|^-apple-system$|^inherit$/i.test(raw)) continue;
    // Bundlers hash CSS-module font names — Next.js ships The Verge's serif as
    // `__fkRomanStandard_cfceed`. The prose names the face, which is the part a
    // reader can act on, so compare on that.
    const fam = raw.replace(/^_+/, '').replace(/_(?:Fallback_)?[0-9a-f]{5,}$/i, '');
    if (!body_.includes(fam.toLowerCase())) {
      say(`prose never names the ${label} face, which the file publishes as "${fam}"`);
    }
  }
  if (type.baseSize && !body.includes(type.baseSize)) {
    say(`prose never states the body size, which the file publishes as ${type.baseSize}`);
  }

  // --- structure ------------------------------------------------------------
  const layout = data.layout ?? {};
  // Only checked when the prose is talking about the thing: a file that says
  // nothing about its measure is thin, not wrong.
  if (layout.measure && /\bmeasure\b/i.test(body) && !body.includes(layout.measure)) {
    say(`prose discusses the measure but never states ${layout.measure}`);
  }
  if (layout.sectionSpacing && /between sections|section rhythm/i.test(body)
      && !body.includes(layout.sectionSpacing)) {
    say(`prose discusses section rhythm but never states ${layout.sectionSpacing}`);
  }

  const comp = capture?.layout?.composition ?? null;
  if (comp) {
    for (const m of body.matchAll(/median of \*{0,2}(\d+)\*{0,2} characters/gi)) {
      if (Number(m[1]) !== comp.charsMedian) {
        say(`prose says a median of ${m[1]} characters a section; the capture measured ${comp.charsMedian}`);
      }
    }
    // The three composition labels are published verbatim, so a stale one is a
    // straight contradiction rather than a matter of phrasing.
    const claims = [
      ['full-bleed', 'contained', 'mixed'].filter(w => new RegExp(`composition[^.]*\\b${w}\\b`, 'i').test(body)),
    ].flat();
    for (const c of claims) {
      if (c !== comp.sectionWidth) {
        say(`prose describes sections as "${c}"; the capture measured "${comp.sectionWidth}"`);
      }
    }
  }
  const sections = capture?.layout?.sections ?? null;
  if (Number.isFinite(sections)) {
    const WORDS = { three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
      eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, nineteen: 19 };
    for (const m of body.matchAll(/\*{0,2}(\d+|[a-z]+)\*{0,2} sections\b/gi)) {
      const n = /^\d+$/.test(m[1]) ? Number(m[1]) : WORDS[m[1].toLowerCase()];
      if (Number.isFinite(n) && n !== sections) {
        say(`prose says ${m[1]} sections; the capture measured ${sections}`);
      }
    }
  }

  // --- background -----------------------------------------------------------
  const bgTok = data.backgrounds ?? {};
  if (bgTok.patternSize) {
    for (const m of body.matchAll(/tiling at \*{0,2}(\d+px)/gi)) {
      if (!bgTok.patternSize.startsWith(m[1])) {
        say(`prose says the pattern tiles at ${m[1]}; the file publishes ${bgTok.patternSize}`);
      }
    }
  }
  // Only when the prose asserts a gradient EXISTS. "No background gradient or
  // pattern" is the file agreeing with itself, not contradicting itself.
  const deniesBg = /\bno\b[^.]{0,40}\b(background|gradient|pattern|decorative)/i.test(body)
    || /flat colour|flat color/i.test(body);
  if (!bgTok.pattern && !bgTok.wash && /\bgradient\b/i.test(body) && !deniesBg) {
    say('prose discusses a gradient, but the file publishes no background layer');
  }

  return issues;
}

/**
 * Claims that can only be checked against the whole registry: "the widest
 * measure here", "more than any other system". Four of these were wrong when
 * the corpus was thirteen systems, and every system added since can falsify
 * one silently.
 *
 * @param {{slug: string, data: object, body: string, capture: object}[]} all
 */
export function checkSuperlatives(all) {
  const issues = [];
  const say = (slug, issue) => issues.push({ slug, issue });

  const num = (v) => (typeof v === 'string' ? parseFloat(v) : v);
  const metrics = {
    measure: s => num(s.data.layout?.measure),
    navHeight: s => num(s.data.layout?.navHeight),
    charsMedian: s => s.capture?.layout?.composition?.charsMedian,
    motion: s => num(s.data.motion?.duration),
    baseSize: s => num(s.data.typography?.baseSize),
    gridPrevalence: s => s.capture?.layout?.composition?.gridPrevalence,
    gridConfidence: s => s.capture?.spacing?.gridConfidence,
  };

  const extreme = (key, dir) => {
    const rows = all.map(s => ({ slug: s.slug, v: metrics[key](s) }))
      .filter(r => Number.isFinite(r.v));
    if (!rows.length) return null;
    return rows.reduce((a, b) => ((dir === 'max' ? b.v > a.v : b.v < a.v) ? b : a));
  };

  // Each phrase is tied to the metric it is actually about, so "the widest
  // measure" is not checked against nav height.
  const CLAIMS = [
    { re: /widest (?:measure|here|in the registry)|measure[^.]{0,40}widest/i, key: 'measure', dir: 'max' },
    { re: /narrowest/i, key: 'measure', dir: 'min' },
    { re: /(?:thinnest|slimmest) (?:nav|navigation)|nav[^.]{0,30}thinnest/i, key: 'navHeight', dir: 'min' },
    { re: /tallest (?:nav|navigation)/i, key: 'navHeight', dir: 'max' },
    { re: /(?:longest|slowest) (?:transition|motion)/i, key: 'motion', dir: 'max' },
    // Tied to characters explicitly. A bare "the most of any system measured
    // here" matched Stripe's claim about its GRID COUNT and reported it as a
    // claim about copy density.
    { re: /(?:characters?|copy)[^.]{0,60}\bthe most\b|\bthe most\b[^.]{0,40}characters?/i,
      key: 'charsMedian', dir: 'max' },
    { re: /highest grid usage|most grid|densest grid/i, key: 'gridPrevalence', dir: 'max' },
    { re: /strictest (?:grid|spacing|adherence)|strictest[^.]{0,30}(?:grid|spacing)/i,
      key: 'gridConfidence', dir: 'max' },
  ];

  // "among the thinnest", "the second narrowest", "close to the narrowest" are
  // hedged and were written that way on purpose. Only an unqualified claim to
  // the extreme is checkable.
  const HEDGE = /\b(among|one of|second|third|close to|nearly|almost|behind)\b/i;
  // A sentence measuring this system AGAINST the extreme is not claiming to be
  // it. GOV.UK's "less than half the width of the widest system here" is a
  // comparison, and "as tall as any" concedes a tie rather than asserting a win.
  const COMPARES = /\bless than\b|\bthan the\b|\bas \w+ as\b|\bhalf the\b/i;

  for (const s of all) {
    const mine = k => metrics[k](s);
    for (const c of CLAIMS) {
      const m = c.re.exec(s.body);
      if (!m) continue;
      // Look at the sentence the claim sits in, not the whole document.
      const at = s.body.lastIndexOf('.', m.index) + 1;
      const sentence = s.body.slice(at, s.body.indexOf('.', m.index + m[0].length) + 1);
      if (HEDGE.test(sentence) || COMPARES.test(sentence)) continue;
      const top = extreme(c.key, c.dir);
      const v = mine(c.key);
      // A tie is not a contradiction. Nike and Airbnb both run a 96px nav, and
      // "the tallest" is true of both.
      if (!top || !Number.isFinite(v) || v === top.v) continue;
      say(s.slug, `claims the ${c.dir === 'max' ? 'highest' : 'lowest'} ${c.key} in the registry`
        + ` at ${v}; ${top.slug} holds it at ${top.v}`);
    }
  }
  return issues;
}
