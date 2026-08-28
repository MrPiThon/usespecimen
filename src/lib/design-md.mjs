// Conformance checks for the Google DESIGN.md format (spec is `alpha`).
//
// Deliberately dependency-free and Astro-free: the build imports it, and so will
// /validate and the CLI. Splitting hard errors from warnings matters — the spec
// says duplicate section headings ARE an error while unknown sections and
// properties are preserved with a warning, so a linter that treats every
// deviation as fatal would reject files the spec explicitly allows.

/** The eight level-2 sections, in the order the spec requires. */
export const SECTIONS = [
  'Overview',
  'Colors',
  'Typography',
  'Layout',
  'Elevation & Depth',
  'Shapes',
  'Components',
  "Do's and Don'ts",
];

/** Compare headings loosely: smart quotes and ampersand spelling shouldn't
 *  decide whether a file is conformant. */
const normalize = s => s
  .toLowerCase()
  .replace(/[‘’ʼ]/g, "'")
  .replace(/\s*&\s*|\s+and\s+/g, ' and ')
  .replace(/[^a-z' ]/g, '')
  .replace(/\s+/g, ' ')
  .trim();

const CANON = new Map(SECTIONS.map(s => [normalize(s), s]));

/** Level-2 headings in document order, ignoring anything inside fenced code —
 *  a `## Colors` line in an example block is not a section. */
export function parseSections(body) {
  const found = [];
  let fenced = false;
  const lines = String(body ?? '').split(/\r?\n/);
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (/^\s*(```|~~~)/.test(line)) { fenced = !fenced; continue; }
    if (fenced) continue;
    const m = /^##\s+(.+?)\s*$/.exec(line);
    if (m) found.push({ heading: m[1], line: i + 1, canonical: CANON.get(normalize(m[1])) ?? null });
  }
  return found;
}

/**
 * Lint a DESIGN.md body against the spec's section rules.
 * @returns {{ errors: string[], warnings: string[], sections: object[] }}
 */
export function lintSections(body) {
  const sections = parseSections(body);
  const errors = [];
  const warnings = [];

  const seen = new Map();
  for (const s of sections) {
    const key = s.canonical ?? s.heading;
    if (seen.has(key)) {
      errors.push(`Duplicate section "${key}" (lines ${seen.get(key)} and ${s.line}).`);
    } else {
      seen.set(key, s.line);
    }
    // Unknown sections are preserved with a warning, per the spec.
    if (!s.canonical) warnings.push(`Unknown section "${s.heading}" (line ${s.line}); preserved.`);
  }

  const known = sections.filter(s => s.canonical).map(s => s.canonical);
  for (const required of SECTIONS) {
    if (!known.includes(required)) errors.push(`Missing required section "${required}".`);
  }

  // Order is checked over the known sections only, so an extra section sitting
  // between two required ones doesn't read as a reordering.
  const expected = SECTIONS.filter(s => known.includes(s));
  const actual = known.filter((s, i) => known.indexOf(s) === i);
  for (let i = 0; i < Math.min(expected.length, actual.length); i += 1) {
    if (expected[i] !== actual[i]) {
      errors.push(`Section order: expected "${expected[i]}" at position ${i + 1}, found "${actual[i]}".`);
      break;
    }
  }

  return { errors, warnings, sections };
}

/** Token references use {path.to.token}. Resolve against the frontmatter so a
 *  reference to a token that was never declared is caught at build time. */
export function checkTokenRefs(data) {
  const errors = [];
  const at = (obj, path) => path.split('.').reduce((o, k) => (o == null ? o : o[k]), obj);
  const walk = (node, trail) => {
    if (typeof node === 'string') {
      const m = /^\{([a-zA-Z0-9_.-]+)\}$/.exec(node.trim());
      if (m && at(data, m[1]) === undefined) {
        errors.push(`${trail} references {${m[1]}}, which is not defined.`);
      }
      return;
    }
    if (node && typeof node === 'object') {
      for (const [k, v] of Object.entries(node)) walk(v, trail ? `${trail}.${k}` : k);
    }
  };
  for (const group of ['colors', 'typography', 'rounded', 'spacing', 'components']) {
    if (data?.[group]) walk(data[group], group);
  }
  return errors;
}

/** Full conformance result for one file. */
export function lint(entry) {
  const section = lintSections(entry.body);
  return {
    errors: [...section.errors, ...checkTokenRefs(entry.data)],
    warnings: section.warnings,
    sections: section.sections,
  };
}
