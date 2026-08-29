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

import { CHROMATIC } from './cluster.mjs';
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
    .map(([k, v]) => {
      // Arrays are block sequences — `categories` is the only one, and a flow
      // list would still parse but reads nothing like the rest of the file.
      if (Array.isArray(v)) return `${pad}${k}:\n${v.map(x => `${pad}  - ${x}`).join('\n')}`;
      return v && typeof v === 'object'
        ? `${pad}${k}:\n${emitYaml(v, indent + 2)}`
        : `${pad}${k}: ${scalar(v)}`;
    })
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

export function buildFrontmatter(cap, { name, description, brand, dark, categories, shots = [] }) {
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

  // Gradient stops are colours this design uses, and they were missing.
  // Stripe's #7f7dfc -> #f44bcc hero sweep is the single most recognisable
  // thing about its homepage and appeared in no token; Shopify's #1260ff
  // exists only as a 35% wash and never as a solid surface.
  //
  // The DECLARED stop is the token, not the composited result, matching how
  // semantic colours already treat a 7% tinted panel. Fully transparent stops
  // are dropped — a fade to nothing is not a colour — and any stop already
  // emitted above is skipped, so a gradient that ends on the card surface does
  // not restate it. The full gradient stays in `backgrounds.wash`, so nothing
  // is lost by keeping this list to what is new.
  const seen = new Set(Object.values(colors));
  const stops = [
    ...(cap.backgrounds?.wash?.stops ?? []),
    ...(cap.backgrounds?.pattern?.stops ?? []),
  ];
  let g = 0;
  for (const stop of stops) {
    // Chromatic only. A fade to white or to the canvas is a transition, not a
    // colour worth a token, and #ffffff sitting in a dark system's palette
    // invites somebody to fill something with it.
    if (!stop.alpha || stop.chroma < CHROMATIC || seen.has(stop.hex) || g >= 6) continue;
    seen.add(stop.hex);
    g += 1;
    colors[`gradient-${g}`] = stop.hex;
  }
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

  // Shadows are tokens and belong in frontmatter, not only in the prose. The
  // spec's five groups do not include elevation, but it explicitly preserves
  // unknown properties, so this is a legal extension rather than a liberty —
  // the same footing `provenance` sits on.
  const elevation = {};
  cap.elevation.shadows.forEach((sh, i) => { elevation[`shadow-${i + 1}`] = sh.value; });

  // Structure and motion, on the same footing as `elevation`: not among the
  // spec's five token groups, but it preserves unknown properties, and these
  // are values an agent applies directly rather than prose about the page.
  //
  // The hero height is emitted in vh because that is the unit it was measured
  // in — a ratio of the viewport — and converting it to pixels would invent a
  // precision the measurement never had.
  const L = cap.layout;
  const layout = L?.available ? {
    ...(L.measure ? { measure: `${L.measure.px}px` } : {}),
    ...(L.rhythm ? { sectionSpacing: `${L.rhythm.px}px` } : {}),
    ...(L.columns ? { gridColumns: L.columns.count } : {}),
    ...(L.nav?.height ? { navHeight: `${L.nav.height}px` } : {}),
    ...(L.nav?.position ? { navPosition: L.nav.position } : {}),
    // How sections are built. Rules, not a running order — see the note in
    // harvest, which records counts and cannot express a sequence.
    ...(L.composition ? {
      sectionWidth: L.composition.sectionWidth,
      sectionMedia: L.composition.sectionMedia,
      sectionCopy: L.composition.sectionCopy,
    } : {}),
    ...(L.hero ? {
      ...(L.hero.heightRatio ? { heroHeight: `${Math.round(L.hero.heightRatio * 100)}vh` } : {}),
      ...(L.hero.headingSize ? { heroHeadingSize: `${L.hero.headingSize}px` } : {}),
      ...(L.hero.align ? { heroAlign: L.hero.align } : {}),
    } : {}),
  } : {};
  // The decorative layer. Values are emitted verbatim because a gradient string
  // is directly usable — an agent pastes it — and every stop in it came from
  // getComputedStyle rather than from a model.
  const B = cap.backgrounds;
  const backgrounds = B?.available && B.decorated ? {
    ...(B.pattern ? {
      pattern: B.pattern.kind,
      patternSize: B.pattern.size,
      ...(B.pattern.angle ? { patternAngle: `${B.pattern.angle}deg` } : {}),
      // Omitted for an external raster: the effect is reproducible, the asset
      // belongs to the source site, and a URL here would end up committed into
      // somebody's repository as a hotlink.
      ...(B.pattern.value ? { patternImage: B.pattern.value } : {}),
    } : {}),
    ...(B.wash?.value ? { wash: B.wash.value } : {}),
    ...(B.effects.backdropFilter ? { backdropFilter: B.effects.backdropFilter.value } : {}),
    ...(B.effects.mixBlendMode ? { mixBlendMode: B.effects.mixBlendMode.value } : {}),
    ...(B.effects.maskImage ? { maskImage: B.effects.maskImage.value } : {}),
  } : {};

  // Omitted entirely when the page animates nothing. The Layout prose says so
  // in words; emitting `duration: null` would invite an agent to fill it in.
  const motion = L?.motion?.duration
    ? { duration: L.motion.duration, easing: L.motion.easing }
    : {};

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
    // Declared, not measured, so it can only come from the author or from the
    // file being refreshed — never from the capture.
    ...(categories?.length ? { categories } : {}),
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
    ...(Object.keys(elevation).length ? { elevation } : {}),
    ...(Object.keys(layout).length ? { layout } : {}),
    ...(Object.keys(motion).length ? { motion } : {}),
    ...(Object.keys(backgrounds).length ? { backgrounds } : {}),
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
      // Collection-relative, so Astro's image() helper resolves it and emits
      // responsive variants. Without these keys the proof shots sit in the
      // system directory referenced by nothing, which is how seventeen of them
      // came to exist without a single one ever reaching a page.
      ...(shots.includes('source.webp') ? { screenshot: './source.webp' } : {}),
      ...(shots.includes('source-dark.webp') ? { screenshotDark: './source-dark.webp' } : {}),
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
        cap.backgrounds?.wash?.stops?.length
          ? bullet('Gradient stops', cap.backgrounds.wash.stops
            .map(x => `${x.hex}${x.alpha < 1 ? ` at ${Math.round(x.alpha * 100)}%` : ''}`).join(' to '))
          : null,
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
    case 'Layout': {
      // Spacing describes the gaps; the structure below describes the page they
      // sit in. Without it an agent has the right ink and no idea of the shape,
      // which is most of why generated UI reads as generic.
      const L = cap.layout;
      const h = L?.hero;
      return lines(
        cap.spacing.base
          ? bullet('Base unit', `${cap.spacing.base}px, explaining ${Math.round(cap.spacing.gridConfidence * 100)}% of observed spacing`)
          : bullet('Base unit', `none — the best candidate explains only ${Math.round(cap.spacing.gridConfidence * 100)}% of observed values`),
        bullet('Observed', cap.spacing.scale.join(', ')),
        L?.measure
          ? bullet('Measure', `${L.measure.px}px, ${Math.round(L.measure.share * 100)}% of observed content widths`)
          : null,
        L?.rhythm ? bullet('Section rhythm', `${L.rhythm.px}px`) : null,
        L?.columns ? bullet('Card grid', `${L.columns.count} columns, on ${L.columns.occurrences} grids`) : null,
        L?.nav
          ? bullet('Navigation', [
            L.nav.height ? `${L.nav.height}px` : 'height not measurable',
            L.nav.position,
            `${L.nav.links} links`,
          ].join(', '))
          : null,
        L?.sections ? bullet('Sections', `${L.sections} on the captured page`) : null,
        L?.composition
          ? bullet('Section composition', [
            `${L.composition.sectionWidth}`,
            `${L.composition.sectionMedia === 'none' ? 'no content imagery'
              : L.composition.sectionMedia}`,
            `${L.composition.sectionCopy} copy (${L.composition.charsMedian} characters per section, median)`,
            `${L.composition.griddedCount} of ${L.composition.total} carry a repeating group`,
          ].join('; '))
          : null,
        h
          // Named conditionally on purpose. These are the proportions of a hero
          // where a page has one — an interior page in this language should not
          // grow a 94vh opening because the homepage had one.
          ? bullet('Hero, where a page has one', [
            h.heightRatio ? `${Math.round(h.heightRatio * 100)}vh`
              : `${h.heightRatioMeasured} viewports tall, too tall to read as one hero`,
            h.headingSize ? `${h.headingSize}px ${h.align}-aligned heading` : null,
            h.ctas ? `${h.ctas} call${h.ctas === 1 ? '' : 's'} to action`
              + (h.ctasFilled ? ` (${h.ctasFilled} filled)` : '') : 'no call to action',
            h.media ? `${h.media} media element${h.media === 1 ? '' : 's'}` : 'no media',
            // Said out loud, because a reader comparing this to the live site
            // deserves to know which numbers to check first.
            h.ctaEvidence === 'weak' ? 'call-to-action count is weakly evidenced' : null,
          ].filter(Boolean).join('; '))
          : null,
      );
    }
    case 'Elevation & Depth': {
      // Shadows lift things off the canvas; the decorative layer is what the
      // canvas is made of. Both are depth, and an agent that reads one without
      // the other builds a flat page with correct shadows on it.
      const b = cap.backgrounds;
      const stops = xs => xs.map(x => `${x.hex}${x.alpha < 1 ? ` at ${Math.round(x.alpha * 100)}%` : ''}`).join(' to ');
      return lines(
        cap.elevation.shadows.length
          ? cap.elevation.shadows.map(s => `- \`${s.value}\` (${s.count} elements)`)
          : '- No box-shadow observed anywhere on the page.',
        b?.available && !b.decorated
          ? '- No background image, gradient or pattern anywhere; the canvas is flat colour.'
          : null,
        b?.pattern
          ? bullet('Pattern', `${b.pattern.kind} tiling at ${b.pattern.size}`
            + `${b.pattern.angle ? ` at ${b.pattern.angle} degrees` : ''}`
            + `${b.pattern.stops.length ? `, ${stops(b.pattern.stops)}` : ''}`
            + `, ${Math.round(b.pattern.areaShare * 100)}% of painted background area`
            + `${b.pattern.external ? ' (external raster; reproduce it rather than linking it)' : ''}`)
          : null,
        b?.wash
          ? bullet('Wash', `${b.wash.kind}`
            + `${b.wash.stops.length ? `, ${stops(b.wash.stops)}` : ''}`
            + `, ${Math.round(b.wash.areaShare * 100)}% of painted background area`)
          : null,
        b?.available && Object.values(b.effects).some(Boolean)
          ? bullet('Compositing', Object.entries(b.effects).filter(([, v]) => v)
            .map(([k, v]) => `${k} ${v.value}`).join(', '))
          : null,
      );
    }
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
        // How the states arrive, not just what they are. A file that lists a
        // hover colour but no timing leaves an agent to pick one, and the pick
        // is usually a 200ms ease that the site never uses.
        cap.layout?.motion
          ? bullet('Motion', cap.layout.motion.duration
            ? `${cap.layout.motion.duration} ${cap.layout.motion.easing},`
              + ` on ${cap.layout.motion.occurrences} controls`
            : 'none — no control on the page declares a transition, so state changes are instant')
          : null,
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
