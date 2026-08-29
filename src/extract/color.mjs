// Color math for token extraction: parsing, OKLab/OKLCH, perceptual distance, WCAG contrast.

/** Parse a CSS computed color string into {r,g,b,a} with 0-255 channels. */
export function parseColor(str) {
  if (!str || typeof str !== 'string') return null;
  const s = str.trim().toLowerCase();
  if (s === 'transparent') return { r: 0, g: 0, b: 0, a: 0 };
  let m = s.match(/^rgba?\(([^)]+)\)$/);
  if (m) {
    const parts = m[1].split(/[,\/\s]+/).filter(Boolean).map(Number);
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
    const parts = m[1].split(/[\/\s]+/).filter(Boolean).map(Number);
    if (parts.length < 3) return null;
    return { r: parts[0] * 255, g: parts[1] * 255, b: parts[2] * 255, a: parts.length > 3 ? parts[3] : 1 };
  }
  return null;
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
