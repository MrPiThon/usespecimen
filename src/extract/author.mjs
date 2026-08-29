// Stage 4 of the pipeline: turn a capture into a DESIGN.md.
//
// The deterministic half only. Frontmatter is derived from the token set, so no
// value is ever retyped by hand, and the body is emitted as a per-section fact
// sheet rather than prose. Whoever writes the prose — a person or a model — is
// then working from values they were handed instead of reaching for plausible
// ones, which is the single rule the whole project rests on.
//
// A scaffold is therefore structurally conformant and entirely true the moment
// it is written. It is just not yet good.

import { SECTIONS } from '../lib/design-md.mjs';

const quote = v => `'${String(v).replace(/'/g, "''")}'`;
const scalar = v => (typeof v === 'number' ? String(v) : quote(v));

/** Minimal YAML for the shapes frontmatter actually uses: nested string/number
 *  maps. An empty group is omitted rather than emitted as a bare `key:`, which
 *  YAML would read back as null. */
export function emitYaml(obj, indent = 0) {
  const pad = ' '.repeat(indent);
  return Object.entries(obj)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .filter(([, v]) => !(v && typeof v === 'object' && Object.keys(v).length === 0))
    .map(([k, v]) => (v && typeof v === 'object' && !Array.isArray(v)
      ? `${pad}${k}:\n${emitYaml(v, indent + 2)}`
      : `${pad}${k}: ${scalar(v)}`))
    .join('\n');
}

/** Brand guess from the source host, for the provenance block. Overridable,
 *  because "Gov" is not what GOV.UK calls itself. */
export function brandFromUrl(url) {
  try {
    const host = new URL(url).hostname.replace(/^www\./, '');
    const label = host.split('.')[0];
    return label.charAt(0).toUpperCase() + label.slice(1);
  } catch {
    return 'Unknown';
  }
}

export function buildFrontmatter(cap, { name, description, brand, dark }) {
  const roles = cap.colors.roles;
  const t = cap.typography;

  const colors = {};
  for (const k of ['background', 'foreground', 'card', 'mutedForeground',
    'primary', 'primaryForeground', 'border']) {
    if (roles[k]) colors[k] = roles[k].hex;
  }
  for (const step of [...cap.colors.ramps.surface, ...cap.colors.ramps.text]) {
    colors[step.name] = step.hex;
  }
  for (const [role, v] of Object.entries(cap.colors.semantic)) colors[role] = v.hex;
  if (dark) {
    for (const [k, v] of Object.entries(dark.colors.roles)) {
      if (v) colors[`dark-${k}`] = v.hex;
    }
  }

  const scale = {};
  for (const s of t.scale) scale[s.name] = `${s.px}px`;

  const rounded = {};
  for (const s of cap.rounded.scale) rounded[s.name] = `${s.px}px`;
  if (cap.rounded.button) rounded.button = cap.rounded.button;
  // The observed pill radius, never a conventional 9999px we made up.
  if (cap.rounded.pillValue) rounded.pill = cap.rounded.pillValue;

  const spacing = { base: cap.spacing.base ? `${cap.spacing.base}px` : undefined };
  cap.spacing.scale.forEach((px, i) => { spacing[`s${i + 1}`] = `${px}px`; });

  const boxOf = (kind) => {
    const b = cap.components?.[kind];
    if (!b) return {};
    return {
      ...(b.padding && b.padding !== '0px' ? { padding: b.padding } : {}),
      ...(b.gap ? { gap: b.gap } : {}),
      ...(b.borderWidth ? { borderWidth: b.borderWidth } : {}),
    };
  };
  const stateOf = (kind) => Object.fromEntries(
    Object.entries(cap.states?.roles?.[kind] ?? {}).map(([state, props]) => {
      const { matchedElements, rulesConsidered, ...rest } = props;
      return [state, rest];
    }));

  const link = { ...boxOf('link'), ...stateOf('link') };

  return {
    name,
    version: '0.1.0',
    description,
    colors,
    typography: {
      fontFamily: t.body.stack,
      headingFamily: t.heading.stack,
      baseSize: t.body.sizePx ? `${t.body.sizePx}px` : undefined,
      lineHeight: t.body.lineHeightRatio,
      weight: t.body.weight,
      headingWeight: t.heading.weight,
      ...(t.body.letterSpacing ? { letterSpacing: t.body.letterSpacing } : {}),
      scale,
      roles: Object.fromEntries(Object.entries(t.roles).map(([n, r]) => [n, {
        fontFamily: r.fontStack,
        fontSize: r.fontSize,
        fontWeight: r.fontWeight,
        lineHeight: r.lineHeight,
        letterSpacing: r.letterSpacing,
      }])),
    },
    rounded,
    spacing,
    components: {
      button: {
        background: '{colors.primary}',
        // Only reference a foreground the extractor observed; a dangling
        // reference would (correctly) fail the build.
        ...(colors.primaryForeground ? { foreground: '{colors.primaryForeground}' } : {}),
        radius: cap.rounded.button ? '{rounded.button}' : '0px',
        ...boxOf('button'),
        ...stateOf('button'),
      },
      surface: {
        background: colors.card ? '{colors.card}' : '{colors.background}',
        border: colors.border ? '{colors.border}' : '{colors.foreground}',
      },
      ...(Object.keys(link).length ? { link } : {}),
    },
    provenance: {
      brand,
      source: cap.source.url,
      capturedAt: cap.capturedAt,
      method: cap.method,
      harvestVersion: cap.harvestVersion,
      clusterVersion: cap.clusterVersion,
    },
  };
}

const bullet = (label, value) => (value ? `- ${label}: ${value}` : null);
const lines = (...xs) => xs.flat().filter(Boolean).join('\n');

/** Facts per section, in the spec's order. Never prose — every line is a value
 *  the extractor produced, so a scaffold states nothing that isn't true. */
function factsFor(section, cap, dark) {
  const c = cap.colors;
  const r = c.roles;
  const t = cap.typography;
  const audit = cap.audit;
  const hex = k => r[k]?.hex;

  switch (section) {
    case 'Overview':
      return lines(
        bullet('Source', `${cap.source.url}, captured ${String(cap.capturedAt).slice(0, 10)}`),
        bullet('Polarity', c.polarity + (dark ? ', and ships a separate dark palette' : '')),
        bullet('Method', cap.method),
      );
    case 'Colors':
      return lines(
        ['background', 'foreground', 'mutedForeground', 'card', 'primary', 'primaryForeground', 'border']
          .map(k => bullet(k, hex(k))),
        c.ramps.text.length ? bullet('Text ramp', c.ramps.text.map(x => `${x.hex} (${x.contrast}:1)`).join(', ')) : null,
        c.ramps.surface.length ? bullet('Surface ramp', c.ramps.surface.map(x => x.hex).join(', ')) : null,
        Object.entries(c.semantic).map(([k, v]) => bullet(k, v.hex)),
        dark ? bullet('Dark', ['background', 'foreground', 'primary']
          .map(k => dark.colors.roles[k]?.hex).filter(Boolean).join(', ')) : null,
        r.primary?.source ? bullet('Accent found via', r.primary.source + (r.primary.via ? ` (${r.primary.via})` : '')) : null,
      );
    case 'Typography':
      return lines(
        bullet('Body', `${t.body.family} ${t.body.sizePx}px/${t.body.lineHeightRatio}`
          + ` weight ${t.body.weight}${t.body.letterSpacing ? `, tracking ${t.body.letterSpacing}` : ''}`),
        bullet('Headings', `${t.heading.family}, weight ${t.heading.weight}`),
        bullet('Scale', t.scale.map(s => `${s.name} ${s.px}px`).join(', ')),
        Object.entries(t.roles ?? {}).map(([n, x]) =>
          bullet(`Role ${n}`, `${x.fontSize} weight ${x.fontWeight} lh ${x.lineHeight}`)),
      );
    case 'Layout':
      return lines(
        cap.spacing.base
          ? bullet('Base unit', `${cap.spacing.base}px, explaining ${Math.round(cap.spacing.gridConfidence * 100)}% of observed spacing`)
          : bullet('Base unit', `none — the best candidate explains only ${Math.round(cap.spacing.gridConfidence * 100)}% of observed values`),
        bullet('Observed', cap.spacing.scale.join(', ')),
      );
    case 'Elevation & Depth':
      return cap.elevation.shadows.length
        ? lines(cap.elevation.shadows.map(s => `- \`${s.value}\` (${s.count} elements)`))
        : '- No box-shadow observed anywhere on the page.';
    case 'Shapes':
      return lines(
        cap.rounded.sharp ? '- No border radius anywhere.' : null,
        cap.rounded.scale.length ? bullet('Scale', cap.rounded.scale.map(x => `${x.name} ${x.px}px`).join(', ')) : null,
        bullet('Button radius', cap.rounded.button),
        cap.rounded.pillValue ? bullet('Pill', cap.rounded.pillValue) : null,
      );
    case 'Components':
      return lines(
        Object.entries(cap.components ?? {}).map(([kind, b]) => bullet(kind,
          [b.padding && b.padding !== '0px' ? `padding ${b.padding}` : null,
            b.radius ? `radius ${b.radius}` : null,
            b.borderWidth ? `border ${b.borderWidth}` : null,
            b.gap ? `gap ${b.gap}` : null,
            `${b.elements} elements of ${b.variants} shapes`].filter(Boolean).join(', '))),
        Object.entries(cap.states?.roles ?? {}).flatMap(([kind, states]) =>
          Object.entries(states).map(([state, props]) => {
            const { matchedElements, rulesConsidered, ...rest } = props;
            return bullet(`${kind}:${state}`, Object.entries(rest).map(([k, v]) => `${k} ${v}`).join(', '));
          })),
      );
    case "Do's and Don'ts":
      // Derived, not invented: the audit's failures and the extractor's own
      // warnings are exactly the things a consumer of this file should know.
      return lines(
        audit.pairs.filter(p => !p.aa).map(p =>
          `- **Don't** rely on ${p.pair.split('/')[0]} alone — it measures ${p.ratio}:1 against ${p.pair.split('/')[1]}, below the ${p.min}:1 this pair needs.`),
        (cap.warnings ?? []).map(w => `- Note: ${w}`),
      );
    default:
      return '';
  }
}

/** Frontmatter plus a fact-sheet body, ready for prose. */
export function authorSystem(cap, meta) {
  const front = emitYaml(buildFrontmatter(cap, meta));
  const body = SECTIONS.map((section) => {
    const facts = factsFor(section, cap, meta.dark);
    return `## ${section}\n\n${facts || '- Nothing observed.'}\n`;
  }).join('\n');

  return `---\n${front}\n---\n\n<!-- SCAFFOLD: every line below is a measured value. Rewrite as prose;\n`
    + `     do not add values that are not here. Delete this comment when done. -->\n\n${body}`;
}
