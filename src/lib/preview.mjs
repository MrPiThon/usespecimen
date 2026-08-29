// Turns a DESIGN.md token set into the custom properties the live preview
// renders from.
//
// The rule that makes the preview worth anything: a property is set ONLY when
// the file declares the token. Nothing is filled in. Where a token is absent the
// property is omitted and the preview's CSS falls back to a deliberately neutral
// value, so a thin file renders visibly plain rather than borrowing polish it
// never specified. If the preview looks wrong, the file is wrong — that only
// holds while the preview refuses to improve on its input.

import { resolveRef } from './design-md.mjs';

/** Does this file carry a second, dark palette? */
export const hasDarkPalette = data =>
  Object.keys(data?.colors ?? {}).some(k => k.startsWith('dark-'));

/**
 * A view of the file as the dark scheme sees it: every `dark-x` token promoted
 * over `x`, with light values kept for whatever dark doesn't override.
 *
 * Promoting rather than special-casing lookups matters because component tokens
 * reference colours by name — `components.button.background` is
 * `{colors.primary}` — so a resolver reading the raw file resolves that to the
 * LIGHT accent even while rendering the dark preview. That is exactly the bug
 * this shape removes.
 */
function effective(data, dark) {
  if (!dark) return data;
  const colors = { ...(data?.colors ?? {}) };
  for (const [k, v] of Object.entries(data?.colors ?? {})) {
    if (k.startsWith('dark-')) colors[k.slice(5)] = v;
  }
  return { ...data, colors };
}

const firstOf = (obj, ...keys) => keys.map(k => obj?.[k]).find(v => typeof v === 'string');

/**
 * @returns {string} an inline `style` value — only the properties this file
 *   actually supports, so absent tokens stay absent rather than defaulting.
 */
export function previewVars(data, { dark = false } = {}) {
  const eff = effective(data, dark);
  const colors = eff?.colors ?? {};
  const rounded = eff?.rounded ?? {};
  const button = eff?.components?.button ?? {};
  const body = eff?.typography?.roles?.body ?? {};
  const heading = eff?.typography?.roles?.h2 ?? eff?.typography?.roles?.h1 ?? {};

  const vars = {
    '--pv-bg': colors.background,
    '--pv-fg': colors.foreground,
    '--pv-muted': colors.mutedForeground,
    '--pv-card': colors.card ?? colors['surface-1'],
    '--pv-border': colors.border,
    // Solid only when the file declares a border. Without one the preview draws
    // a dashed hairline, so a viewer can see the line is ours and not the
    // system's — the alternative is a borrowed border read as extracted.
    '--pv-border-style': colors.border ? 'solid' : undefined,
    '--pv-primary': colors.primary,
    '--pv-primary-fg': colors.primaryForeground,
    '--pv-success': colors.success,
    '--pv-danger': colors.danger,

    '--pv-radius': firstOf(rounded, 'md', 'sm', 'lg'),
    // The button's own radius may be a {rounded.x} reference.
    '--pv-btn-radius': resolveRef(eff, button.radius),
    '--pv-btn-padding': typeof button.padding === 'string' ? button.padding : undefined,
    '--pv-btn-bg': resolveRef(eff, button.background),
    '--pv-btn-fg': resolveRef(eff, button.foreground),
    '--pv-btn-gap': typeof button.gap === 'string' ? button.gap : undefined,

    '--pv-font': body.fontFamily ?? eff?.typography?.fontFamily,
    '--pv-size': body.fontSize ?? eff?.typography?.baseSize,
    '--pv-weight': body.fontWeight ?? eff?.typography?.weight,
    '--pv-leading': body.lineHeight ?? eff?.typography?.lineHeight,
    '--pv-tracking': body.letterSpacing,
    '--pv-heading-size': heading.fontSize,
    '--pv-heading-weight': heading.fontWeight,
  };

  return Object.entries(vars)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${k}:${v}`)
    .join(';');
}

/** Which preview aspects this file cannot drive, so the page can say so instead
 *  of letting a viewer read a CSS default as an extracted value. */
export function previewGaps(data) {
  const gaps = [];
  const colors = data?.colors ?? {};
  const button = data?.components?.button ?? {};
  if (!colors.card && !colors['surface-1']) gaps.push('no card surface');
  if (!colors.border) gaps.push('no border colour');
  if (!colors.primaryForeground && !resolveRef(data, button.foreground)) {
    gaps.push('no label colour for the accent');
  }
  if (typeof button.padding !== 'string') gaps.push('no button padding');
  return gaps;
}
