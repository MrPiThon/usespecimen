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

  return issues;
}
