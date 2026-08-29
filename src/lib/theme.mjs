// The site's own design system, read from a file in its own registry.
//
// Specimen is styled by content/systems/linear/DESIGN.md — the same artifact it
// hands to an agent. Nothing here is hand-picked: change that file and this site
// changes with it, which is the only honest way to claim these files are usable.
//
// Two of its constraints are followed rather than worked around, because
// following them is the whole demonstration:
//
//   1. It declares no `primaryForeground`. Linear never fills a control with the
//      lavender, so neither do we — the accent lives on focus rings, borders and
//      link text. Its own Do's and Don'ts say to spend it on focus and selection
//      states, and inventing a label colour to get a filled button would be
//      exactly the fabrication this project exists to refuse.
//   2. It has no spacing grid. Its observed steps are used as-is rather than
//      being rounded into a tidy 8px rhythm it does not have.
//
// It is also a dark-only system: no light palette was observed, so the site has
// no light mode. Adopting a design system means adopting its limits.

export const THEME_SLUG = 'linear';

/** Site variable <- token name in the file. Anything absent simply is not set,
 *  and the stylesheet falls back rather than inventing a value. */
const COLOR_MAP = {
  '--bg': 'background',
  '--surface': 'surface-1',
  '--surface-2': 'surface-2',
  '--fg-strong': 'text-1',
  '--fg': 'text-2',
  '--muted': 'text-3',
  '--faint': 'text-4',
  '--border': 'border',
  '--accent': 'primary',
  '--ok': 'success',
  '--bad': 'danger',
  '--warn': 'warning',
};

/**
 * @param {object} data frontmatter of the theme system
 * @returns {string} custom property declarations for a :root block
 */
export function themeVars(data) {
  const colors = data?.colors ?? {};
  const type = data?.typography ?? {};
  const rounded = data?.rounded ?? {};
  const spacing = data?.spacing ?? {};
  const elevation = data?.elevation ?? {};

  const out = [];
  for (const [cssVar, token] of Object.entries(COLOR_MAP)) {
    if (colors[token]) out.push([cssVar, colors[token]]);
  }
  if (type.fontFamily) out.push(['--sans', type.fontFamily]);
  if (type.baseSize) out.push(['--size', type.baseSize]);
  if (type.lineHeight) out.push(['--leading', String(type.lineHeight)]);
  if (type.weight) out.push(['--weight', String(type.weight)]);
  if (type.headingWeight) out.push(['--heading-weight', String(type.headingWeight)]);
  if (type.letterSpacing) out.push(['--tracking', type.letterSpacing]);
  if (rounded.md) out.push(['--radius', rounded.md]);
  if (rounded.sm) out.push(['--radius-sm', rounded.sm]);
  if (rounded.lg) out.push(['--radius-lg', rounded.lg]);
  if (rounded.button) out.push(['--radius-button', rounded.button]);
  if (rounded.pill) out.push(['--radius-pill', rounded.pill]);

  // Type scale, straight from the file. Headings climb the system's own steps
  // instead of a ladder this site made up.
  for (const [step, value] of Object.entries(type.scale ?? {})) {
    out.push([`--step-${step}`, value]);
  }
  // Observed spacing. `base` is skipped: this system has no grid, and the value
  // would be null anyway. The stylesheet picks which steps to use for what —
  // that selection is unavoidably ours, but every value is the file's.
  for (const [step, value] of Object.entries(spacing)) {
    if (step !== 'base') out.push([`--space-${step.replace(/^s/, '')}`, value]);
  }
  for (const [name, value] of Object.entries(elevation)) out.push([`--${name}`, value]);

  return out.map(([k, v]) => `  ${k}: ${v};`).join('\n');
}

/** What the footer says. Built from the file so it cannot claim a system the
 *  site is not actually wearing. */
export function themeCredit(data) {
  return {
    name: data?.name ?? 'Unknown',
    brand: data?.provenance?.brand ?? null,
    capturedAt: data?.provenance?.capturedAt ?? null,
  };
}
