// Color math for token extraction: parsing, OKLab/OKLCH, perceptual distance, WCAG contrast.

/** Parse a CSS computed color string into {r,g,b,a} with 0-255 channels. */
/**
 * Colour values as they appear inside a compound string — a gradient's stops, a
 * box-shadow's colour. Lives here rather than in the clusterer because the site
 * needs it too: a file publishes a decorative layer as one gradient string, and
 * pulling its hairline colour back out is the only way to draw a rule in the
 * same colour without inventing one.
 *
 * `[^()]*` deliberately refuses nested parens, so a `color-mix()` wrapping other
 * functions is skipped rather than half-matched.
 */
export const COLOR_STOP_RE = /(?:rgba?|hsla?|oklab|oklch|lab|lch|color)\([^()]*\)|#[0-9a-fA-F]{3,8}\b/g;

export function parseColor(str) {
  if (!str || typeof str !== 'string') return null;
  const s = str.trim().toLowerCase();
  if (s === 'transparent') return { r: 0, g: 0, b: 0, a: 0 };
  let m = s.match(/^rgba?\(([^)]+)\)$/);
  if (m) {
    const parts = m[1].split(/[,\/\s]+/).filter(Boolean).map(noneAsZero).map(Number);
    if (parts.length < 3 || parts.slice(0, 3).some(Number.isNaN)) return null;
    return { r: parts[0], g: parts[1], b: parts[2], a: parts.length > 3 ? parts[3] : 1 };
  }
  m = s.match(/^#([0-9a-f]{3,8})$/);
  if (m) {
    let h = m[1];
    if (h.length === 3 || h.length === 4) h = h.split('').map(c => c + c).join('');
    const n = parseInt(h.slice(0, 6), 16);
    const a = h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1;
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255, a };
  }
  // color(srgb r g b / a) — emitted by some engines for wide-gamut authored colors
  m = s.match(/^color\(srgb\s+([^)]+)\)$/);
  if (m) {
    const parts = m[1].split(/[\/\s]+/).filter(Boolean).map(noneAsZero).map(Number);
    if (parts.length < 3) return null;
    return { r: parts[0] * 255, g: parts[1] * 255, b: parts[2] * 255, a: parts.length > 3 ? parts[3] : 1 };
  }
  // Modern CSS colour spaces. Chrome returns these from getComputedStyle
  // verbatim when a site authors in them, and dropping them is not survivable:
  // 230 of 233 colour values on tailwindcss.com are lab()/oklch(), and 9 of 9 on
  // basecamp.com. Parsing only rgb/hex left both sites with white text on a
  // white background rather than with no answer.
  m = s.match(/^oklch\(([^)]+)\)$/);
  if (m) {
    const [L, C, h, a] = numbers(m[1], [1, 0.4, 360]);
    if (L === null) return null;
    return { ...oklabToRgb(L, C * Math.cos(h * Math.PI / 180), C * Math.sin(h * Math.PI / 180)), a };
  }
  m = s.match(/^oklab\(([^)]+)\)$/);
  if (m) {
    const [L, aa, bb, alpha] = numbers(m[1], [1, 0.4, 0.4]);
    if (L === null) return null;
    return { ...oklabToRgb(L, aa, bb), a: alpha };
  }
  m = s.match(/^lab\(([^)]+)\)$/);
  if (m) {
    const [L, aa, bb, alpha] = numbers(m[1], [100, 125, 125]);
    if (L === null) return null;
    return { ...labToRgb(L, aa, bb), a: alpha };
  }
  m = s.match(/^color\(display-p3\s+([^)]+)\)$/);
  if (m) {
    const [r, g, b, alpha] = numbers(m[1], [1, 1, 1]);
    if (r === null) return null;
    return { ...p3ToRgb(r, g, b), a: alpha };
  }
  // hsl()/hsla(). Computed style rarely returns these, but stylesheet rules are
  // full of them — Vercel's entire focus ring is authored in hsla().
  m = s.match(/^hsla?\(([^)]+)\)$/);
  if (m) {
    const parts = m[1].split(/[,\/\s]+/).filter(Boolean);
    if (parts.length < 3) return null;
    const h = parseFloat(parts[0]);
    const sat = parseFloat(parts[1]) / 100;
    const l = parseFloat(parts[2]) / 100;
    if ([h, sat, l].some(Number.isNaN)) return null;
    let a = 1;
    if (parts.length > 3) {
      a = parts[3].endsWith('%') ? parseFloat(parts[3]) / 100 : parseFloat(parts[3]);
      if (Number.isNaN(a)) a = 1;
    }
    return { ...hslToRgb(h, sat, l), a };
  }
  return null;
}

/** HSL -> sRGB, 0-255 channels. Hue in degrees; other units are rare enough in
 *  authored CSS that a bare number is the only case worth handling. */
function hslToRgb(h, s, l) {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const hp = (((h % 360) + 360) % 360) / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  const m = l - c / 2;
  const [r, g, b] = hp < 1 ? [c, x, 0] : hp < 2 ? [x, c, 0] : hp < 3 ? [0, c, x]
    : hp < 4 ? [0, x, c] : hp < 5 ? [x, 0, c] : [c, 0, x];
  return { r: (r + m) * 255, g: (g + m) * 255, b: (b + m) * 255 };
}

export function toHex({ r, g, b }) {
  const c = v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');
  return `#${c(r)}${c(g)}${c(b)}`;
}

/** Composite a possibly-translucent color over an opaque backdrop. */
export function flatten(fg, bg = { r: 255, g: 255, b: 255, a: 1 }) {
  const a = fg.a ?? 1;
  if (a >= 1) return { r: fg.r, g: fg.g, b: fg.b, a: 1 };
  return {
    r: fg.r * a + bg.r * (1 - a),
    g: fg.g * a + bg.g * (1 - a),
    b: fg.b * a + bg.b * (1 - a),
    a: 1,
  };
}

const srgbToLinear = c => {
  c /= 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
};

/** sRGB -> OKLab. Bjorn Ottosson's matrices. */
export function toOklab({ r, g, b }) {
  const lr = srgbToLinear(r), lg = srgbToLinear(g), lb = srgbToLinear(b);
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
  return {
    L: 0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s,
    a: 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s,
    b: 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s,
  };
}

export function toOklch(rgb) {
  const { L, a, b } = toOklab(rgb);
  const C = Math.sqrt(a * a + b * b);
  let h = (Math.atan2(b, a) * 180) / Math.PI;
  if (h < 0) h += 360;
  return { L, C, h };
}

/** Perceptual distance in OKLab. ~0.02 is a just-noticeable step; 0.05 groups near-duplicates. */
export function deltaE(c1, c2) {
  const a = toOklab(c1), b = toOklab(c2);
  return Math.hypot(a.L - b.L, a.a - b.a, a.b - b.b);
}

export function relativeLuminance({ r, g, b }) {
  return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b);
}

export function contrastRatio(fg, bg) {
  const a = relativeLuminance(flatten(fg, bg));
  const b = relativeLuminance(bg);
  const [hi, lo] = a > b ? [a, b] : [b, a];
  return (hi + 0.05) / (lo + 0.05);
}

/**
 * Rough hue family label, for faceted search and semantic classification.
 *
 * These are OKLCH hue angles, which are NOT the HSL angles they resemble: pure
 * red sits at 29 degrees, not 0. Bands verified against canonical colours —
 * #ff0000 29, #f97316 48, #eab308 86, #22c55e 150, #14b8a6 183, #3b82f6 260,
 * #8b5cf6 293, #ec4899 354. An HSL-shaped table labels every red "orange".
 */
export function hueFamily({ C, h }) {
  if (C < 0.03) return 'neutral';
  if (h < 15 || h >= 330) return 'pink';
  if (h < 40) return 'red';
  if (h < 75) return 'orange';
  if (h < 120) return 'yellow';
  if (h < 170) return 'green';
  if (h < 230) return 'teal';
  if (h < 275) return 'blue';
  return 'purple';
}

// ---------------------------------------------------------------------------
// Modern colour space conversions
//
// Needed because a site authoring in oklch or lab hands those strings straight
// back from getComputedStyle. Every function below returns 0-255 sRGB, clamped:
// lab and display-p3 both describe colours outside sRGB, and a token has to be
// something a browser can paint.
// ---------------------------------------------------------------------------

/** Parse a modern colour's component list. `pcts` gives what 100% means for
 *  each slot, since `oklch(50% ...)` is 0.5 but `lab(50% ...)` is 50. */
/**
 * CSS Color 4's missing-component keyword. `oklch(0 0 none / 0.54)` is a real
 * value Chrome serialises — Figma's whole muted text tier is authored that way
 * — and `none` resolves to zero when the colour is actually used.
 *
 * Worth handling for the same reason lab/oklch were: unparsed here does not
 * mean "no answer", it means a role silently goes missing. Figma came back with
 * no mutedForeground, no card, and a white border, because every candidate for
 * those carried a `none` hue. The `color()` branch was worse than unparsed —
 * it returned `{r: null}`, which passes a null check and corrupts downstream
 * maths rather than failing.
 */
const noneAsZero = p => (p === 'none' ? '0' : p);

function numbers(body, pcts) {
  const parts = body.split(/[,\/\s]+/).filter(Boolean).map(noneAsZero);
  if (parts.length < 3) return [null];
  const out = parts.slice(0, 3).map((p, i) => (p.endsWith('%')
    ? (parseFloat(p) / 100) * pcts[i]
    : parseFloat(p)));
  if (out.some(Number.isNaN)) return [null];
  let a = 1;
  if (parts.length > 3) {
    a = parts[3].endsWith('%') ? parseFloat(parts[3]) / 100 : parseFloat(parts[3]);
    if (Number.isNaN(a)) a = 1;
  }
  return [...out, a];
}

const linearToSrgb = c => (c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055);
const clamp255 = c => Math.max(0, Math.min(255, linearToSrgb(c) * 255));
const toRgb = (r, g, b) => ({ r: clamp255(r), g: clamp255(g), b: clamp255(b) });

/** OKLab -> linear sRGB. The exact inverse of toOklab's matrices. */
function oklabToRgb(L, a, b) {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.2914855480 * b) ** 3;
  return toRgb(
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s,
  );
}

/** CIE Lab -> linear sRGB. CSS lab() is D50-referenced, so this adapts to D65
 *  (Bradford) before applying the sRGB matrix. */
function labToRgb(L, a, bb) {
  const E = 216 / 24389;
  const K = 24389 / 27;
  const fy = (L + 16) / 116;
  const fx = fy + a / 500;
  const fz = fy - bb / 200;
  const f = t => (t ** 3 > E ? t ** 3 : (116 * t - 16) / K);
  // D50 reference white, per CSS Color 4.
  const Xn = 0.3457 / 0.3585;
  const Zn = (1 - 0.3457 - 0.3585) / 0.3585;
  const x = f(fx) * Xn;
  const y = (L > K * E ? fy ** 3 : L / K);
  const z = f(fz) * Zn;

  // Bradford D50 -> D65.
  const X = 0.9555766 * x - 0.0230393 * y + 0.0631636 * z;
  const Y = -0.0282895 * x + 1.0099416 * y + 0.0210077 * z;
  const Z = 0.0122982 * x - 0.0204830 * y + 1.3299098 * z;

  return toRgb(
    3.2404542 * X - 1.5371385 * Y - 0.4985314 * Z,
    -0.9692660 * X + 1.8760108 * Y + 0.0415560 * Z,
    0.0556434 * X - 0.2040259 * Y + 1.0572252 * Z,
  );
}

/** display-p3 -> linear sRGB, via XYZ D65. Both share a white point, so no
 *  chromatic adaptation is needed — only a gamut change, hence the clamp. */
function p3ToRgb(r, g, b) {
  const lin = c => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  const [R, G, B] = [lin(r), lin(g), lin(b)];
  const X = 0.4865709 * R + 0.2656677 * G + 0.1982173 * B;
  const Y = 0.2289746 * R + 0.6917385 * G + 0.0792869 * B;
  const Z = 0.0000000 * R + 0.0451134 * G + 1.0439444 * B;
  return toRgb(
    3.2404542 * X - 1.5371385 * Y - 0.4985314 * Z,
    -0.9692660 * X + 1.8760108 * Y + 0.0415560 * Z,
    0.0556434 * X - 0.2040259 * Y + 1.0572252 * Z,
  );
}
