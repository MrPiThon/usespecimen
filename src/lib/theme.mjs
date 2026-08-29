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

/**
 * The one family the site ships as a webfont, self-hosted via
 * `@fontsource-variable/inter` and imported in Base.astro.
 *
 * This has to be a constant because the import is static, and that creates a
 * way for the site to lie: swap the theme to a system that uses a different
 * face and the page would go on claiming to wear the file while rendering a
 * system fallback. Which is precisely what was happening — the file named
 * Inter Variable, nothing loaded it, and a canvas probe measured the body text
 * as identical to the monospace fallback.
 *
 * So `assertThemeFont` throws at build time instead. Change the theme file and
 * the build tells you to change the font, rather than quietly rendering in
 * Arial under a stylesheet that says Inter.
 */
export const SELF_HOSTED_FONT = 'Inter Variable';

/** First family in a CSS font stack, unquoted. */
export function primaryFamily(stack) {
  if (!stack) return null;
  return stack.split(',')[0].trim().replace(/^["']|["']$/g, '');
}

function assertThemeFont(data) {
  const family = primaryFamily(data?.typography?.fontFamily);
  if (family && family !== SELF_HOSTED_FONT) {
    throw new Error(
      `Theme "${THEME_SLUG}" declares "${family}" but the site self-hosts `
      + `"${SELF_HOSTED_FONT}". Add the matching @fontsource package and update `
      + 'SELF_HOSTED_FONT, or the site renders a fallback while claiming to wear the file.',
    );
  }
}

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
  assertThemeFont(data);
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

  // Structure. The measure is the page container, not the reading column —
  // `--measure` stays in ch because a prose column is measured in characters.
  const layout = data?.layout ?? {};
  if (layout.measure) out.push(['--container', layout.measure]);
  if (layout.navHeight) out.push(['--nav-height', layout.navHeight]);
  // The rhythm between sections, and the hero's own proportions. These were
  // emitted into the file and then used by nothing: the site ran 64px gaps
  // against a system that measures 128px, and a 38px headline against one whose
  // heroes carry 64px.
  if (layout.sectionSpacing) out.push(['--section-gap', layout.sectionSpacing]);
  if (layout.heroHeight) out.push(['--hero-height', layout.heroHeight]);
  if (layout.heroHeadingSize) out.push(['--hero-heading', layout.heroHeadingSize]);
  if (layout.heroAlign) out.push(['--hero-align', layout.heroAlign]);
  // `fixed` and `sticky` differ in whether the bar takes space in flow, so this
  // is passed through rather than normalised to whichever the site preferred.
  if (layout.navPosition) out.push(['--nav-position', layout.navPosition]);
  // A fixed bar leaves the flow, so the page has to reserve its height; a
  // sticky one does not. Derived here rather than guessed in CSS, which cannot
  // branch on a custom property's value.
  const fixed = layout.navPosition === 'fixed' || layout.navPosition === 'absolute';
  if (layout.navHeight) out.push(['--nav-offset', fixed ? layout.navHeight : '0px']);
  // How state changes arrive. Without this the site would pick its own timing
  // while claiming to wear the file, which is the gap this whole exercise
  // exists to close. A system that declares no motion sets nothing, and the
  // stylesheet's 0s fallback leaves interactions instant — as measured.
  const motion = data?.motion;
  if (motion?.duration) out.push(['--motion', motion.duration]);
  if (motion?.easing) out.push(['--motion-ease', motion.easing]);

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
