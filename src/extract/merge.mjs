// Combines several harvests of the same page — one per viewport width — into a
// single set of histograms.
//
// Only the value histograms are summed. Everything else comes from the primary
// (widest) capture, and the reason is specific: `document.styleSheets` does not
// change with viewport, so the state rules are identical at every width and
// summing them would triple their counts while adding no information.
//
// Note the bias this accepts: `area` weights scale with the viewport, so the
// widest capture dominates any area-ranked role. That is the right default — the
// widest layout is the canonical one — but it means a mobile-only surface can be
// out-weighed by the same element at desktop.

/** Maps of `value -> {count, area, chars}` that are safe to sum. */
const HISTOGRAMS = [
  'textColors', 'bgColors', 'borderColors',
  'fontFamilies', 'fontSizes', 'fontWeights', 'lineHeights', 'letterSpacings',
  'typeStyles', 'radii', 'shadows', 'spacings',
  'interactiveBg', 'interactiveRadius', 'interactiveFg',
  'headingSizes', 'headingFamilies', 'headingWeights',
];

/**
 * @param {Array<{viewport: object, harvest: object}>} captures widest first
 * @returns {object} one harvest, with `viewports` recording what went into it
 */
export function mergeHarvests(captures) {
  if (!captures.length) throw new Error('mergeHarvests: nothing to merge');
  const [primary, ...rest] = captures;
  const merged = { ...primary.harvest };

  for (const key of HISTOGRAMS) {
    const out = {};
    for (const { harvest } of captures) {
      for (const [value, w] of Object.entries(harvest[key] ?? {})) {
        const e = out[value] ?? (out[value] = { count: 0, area: 0, chars: 0 });
        e.count += w.count ?? 0;
        e.area += w.area ?? 0;
        e.chars += w.chars ?? 0;
      }
    }
    merged[key] = out;
  }

  // Diagnostics describe the whole sweep; the scalars describe the page.
  merged.elementCount = captures.reduce((n, c) => n + (c.harvest.elementCount ?? 0), 0);
  merged.sampled = captures.reduce((n, c) => n + (c.harvest.sampled ?? 0), 0);
  merged.viewports = captures.map(c => ({
    w: c.viewport.width,
    h: c.viewport.height,
    elements: c.harvest.elementCount ?? null,
  }));
  merged.mergedFrom = captures.length;
  if (rest.length) merged.viewport = { w: primary.viewport.width, h: primary.viewport.height };
  return merged;
}
