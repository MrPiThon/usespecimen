// Unit tests for the pure functions, chosen by where this codebase has actually
// been wrong before. Each block below is a bug that shipped, not a hypothetical.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseColor, toHex, flatten, contrastRatio, hueFamily, toOklch } from '../src/lib/color.mjs';
import { lintSections, SECTIONS } from '../src/lib/design-md.mjs';
import { renderBase, stripBase, injectBase, budget } from '../src/lib/base-md.mjs';
import { slugFromTitle, readVotes } from '../src/lib/votes.mjs';

// ---------------------------------------------------------------------------
// parseColor: 230 of 233 colour values on tailwindcss.com and 9 of 9 on
// basecamp.com are authored in modern spaces. Dropping them did not produce
// "no answer", it produced white-on-white.
// ---------------------------------------------------------------------------

test('parseColor handles every space the corpus actually uses', () => {
  const cases = [
    ['#fff', '#ffffff'],
    ['#ff0000', '#ff0000'],
    ['rgb(255, 102, 0)', '#ff6600'],
    ['rgba(0, 0, 0, 0.5)', '#000000'],
    ['hsl(210, 100%, 50%)', '#0080ff'],
    ['color(srgb 1 0 0)', '#ff0000'],
    ['oklch(1 0 34)', '#ffffff'],
  ];
  for (const [input, expected] of cases) {
    const c = parseColor(input);
    assert.ok(c, `${input} did not parse`);
    assert.equal(toHex(c), expected, `${input}`);
  }
});

test('parseColor survives the CSS `none` keyword inside a modern space', () => {
  // Figma serialises `oklch(0 0 none / 0.54)`, and an earlier version returned
  // `{ r: null }` — silently corrupt rather than null, which every caller then
  // used as if it were a colour.
  for (const input of ['oklch(0 0 none / 0.54)', 'color(srgb none 0 0)', 'oklab(0.5 none none)']) {
    const c = parseColor(input);
    if (c === null) continue;
    for (const ch of ['r', 'g', 'b']) {
      assert.ok(Number.isFinite(c[ch]), `${input} produced a non-finite ${ch}`);
    }
  }
});

test('parseColor returns null rather than guessing', () => {
  // Gradients, currentColor and named colours are NOT handled, so every call
  // site null-checks. A silent fallback would be worse than the gap.
  for (const input of ['currentColor', 'linear-gradient(red, blue)', 'red', '', 'nonsense']) {
    assert.equal(parseColor(input), null, `${input} should not parse`);
  }
});

test('transparent is the one keyword that carries a real value', () => {
  // Unlike `red`, `transparent` is unambiguous — rgba(0, 0, 0, 0) — and
  // compositing it over a backdrop is a no-op, which is exactly what a
  // stylesheet means by it.
  const t = parseColor('transparent');
  assert.equal(t.a, 0);
  assert.equal(toHex(flatten(t, parseColor('#1c1d1e'))), '#1c1d1e');
});

test('contrastRatio flattens the foreground over the background itself', () => {
  const white = parseColor('#ffffff');
  const black = parseColor('#000000');
  assert.equal(Math.round(contrastRatio(black, white) * 100) / 100, 21);
  // A translucent foreground must be composited, not treated as opaque.
  const half = parseColor('rgba(0, 0, 0, 0.5)');
  const r = contrastRatio(half, white);
  assert.ok(r > 1 && r < 21, `expected a composited ratio, got ${r}`);
});

test('flatten composites toward the backdrop', () => {
  assert.equal(toHex(flatten(parseColor('rgba(0,0,0,0.5)'), parseColor('#ffffff'))), '#808080');
  assert.equal(toHex(flatten(parseColor('rgba(0,0,0,0)'), parseColor('#ffffff'))), '#ffffff');
});

// ---------------------------------------------------------------------------
// hueFamily: the bands are OKLCH angles, which are NOT the HSL angles they
// resemble. Pure red is 29 degrees, not 0. An HSL-shaped table labelled every
// red "orange", and the `hue` facet was wrong on every palette containing one.
// ---------------------------------------------------------------------------

test('hueFamily reads OKLCH angles, not HSL ones', () => {
  const family = hex => hueFamily(toOklch(parseColor(hex)));
  assert.equal(family('#ff0000'), 'red');
  assert.equal(family('#ff6600'), 'orange');
  assert.equal(family('#0071e3'), 'blue');
  // GOV.UK's dark forest and Shopify's bright mint are both unarguably green;
  // matching on hue angle alone is what keeps them in one family.
  assert.equal(family('#0f7a52'), 'green');
  assert.equal(family('#36f4a4'), 'green');
});

test('hueFamily calls a grey neutral regardless of angle', () => {
  for (const hex of ['#808080', '#ffffff', '#1c1d1e']) {
    assert.equal(hueFamily(toOklch(parseColor(hex))), 'neutral', hex);
  }
});

// ---------------------------------------------------------------------------
// The spec linter. Section order is the product claim: a malformed file must
// fail the build rather than reach the site.
// ---------------------------------------------------------------------------

const bodyOf = (sections) => sections.map(s => `## ${s}\n\ntext\n`).join('\n');

test('a conformant section list lints clean', () => {
  const { errors } = lintSections(bodyOf(SECTIONS));
  assert.deepEqual(errors, []);
});

test('a reordered section is an error', () => {
  const swapped = [...SECTIONS];
  [swapped[1], swapped[2]] = [swapped[2], swapped[1]];
  const { errors } = lintSections(bodyOf(swapped));
  assert.ok(errors.some(e => /Section order/.test(e)), errors.join('; '));
});

test('a duplicate section is an error and a missing one is too', () => {
  assert.ok(lintSections(bodyOf([...SECTIONS, 'Colors'])).errors
    .some(e => /Duplicate/.test(e)));
  assert.ok(lintSections(bodyOf(SECTIONS.slice(1))).errors
    .some(e => /Missing required/.test(e)));
});

test('an unknown section warns but does not fail', () => {
  const { errors, warnings } = lintSections(`${bodyOf(SECTIONS)}\n## Extras\n\ntext\n`);
  assert.deepEqual(errors, [], 'the spec preserves unknown sections');
  assert.ok(warnings.some(w => /Unknown section/.test(w)));
});

test('a heading inside a fenced block is not a section', () => {
  const body = `${bodyOf(SECTIONS)}\n\`\`\`md\n## Colors\n\`\`\`\n`;
  assert.deepEqual(lintSections(body).errors, [], 'a fenced example is not a duplicate');
});

test('smart quotes and & spelling do not decide conformance', () => {
  const curly = SECTIONS.map(s => (s === "Do's and Don'ts" ? 'Do’s and Don’ts' : s));
  const amp = curly.map(s => (s === 'Elevation & Depth' ? 'Elevation and Depth' : s));
  assert.deepEqual(lintSections(bodyOf(amp)).errors, []);
});

// ---------------------------------------------------------------------------
// The Base. It is rendered into 23 files by one command, so re-running must be
// idempotent and a version bump must replace rather than stack.
// ---------------------------------------------------------------------------

const FILE = {
  colors: { background: '#fff', foreground: '#000', primary: '#f00' },
  rounded: { sm: '4px', lg: '8px', button: '8px' },
  spacing: { s1: '4px', s2: '8px' },
  typography: { scale: { sm: '12px', base: '16px' }, weight: 400, headingWeight: 600 },
  elevation: { 'shadow-1': '0 1px 2px #000' },
  motion: { duration: '0.2s', easing: 'ease' },
};

test('injectBase is idempotent', () => {
  const once = injectBase('## Do\'s and Don\'ts\n\nbody', FILE);
  assert.equal(injectBase(once, FILE), once, 'a second run must not change the file');
  assert.equal((once.match(/<!-- specimen:base/g) ?? []).length, 1);
});

test('injectBase replaces an older block rather than stacking one', () => {
  const stale = '## Do\'s and Don\'ts\n\nbody\n\n<!-- specimen:base v0 -->\nold\n<!-- /specimen:base -->\n';
  const fresh = injectBase(stale, FILE);
  assert.equal((fresh.match(/<!-- specimen:base/g) ?? []).length, 1);
  assert.ok(!fresh.includes('\nold\n'));
  assert.ok(fresh.includes('body'), 'the hand-written prose survives');
});

test('stripBase leaves a file that never had one alone', () => {
  assert.equal(stripBase('## Overview\n\ntext'), '## Overview\n\ntext');
});

test('budget counts distinct values, not key names', () => {
  // Linear declares seven radius names over six values because `button` and
  // `lg` are both 8px, and six is the number of corners you can draw.
  assert.equal(budget(FILE).radii, 2, '4px and 8px, not three keys');
  assert.equal(budget(FILE).weights, 2);
  assert.equal(budget(FILE).colors, 3);
});

test('the Base names the absences it should', () => {
  const flat = renderBase({ ...FILE, elevation: {}, motion: null });
  assert.match(flat, /declares no elevation/);
  assert.match(flat, /declares no motion/);
  assert.doesNotMatch(renderBase(FILE), /declares no elevation/);
});

test('the Base stays inside its size ceiling', () => {
  // It ships in every file and competes with the measurements for attention.
  const words = renderBase(FILE).split(/\s+/).length;
  assert.ok(words < 560, `the Base has grown to ${words} words; cut before adding`);
});

// ---------------------------------------------------------------------------
// Votes.
// ---------------------------------------------------------------------------

test('slugFromTitle only matches ballot issues', () => {
  assert.equal(slugFromTitle('Upvote: stripe'), 'stripe');
  assert.equal(slugFromTitle('upvote:  tailwindcss  '), 'tailwindcss');
  assert.equal(slugFromTitle('Wrong colour on stripe'), null);
  assert.equal(slugFromTitle(''), null);
});

test('readVotes reports a missing ballot as zero rather than absent', () => {
  const v = readVotes({ systems: { stripe: { up: 3, issue: 7 } } }, ['stripe', 'linear']);
  assert.deepEqual(v.systems.linear, { up: 0, issue: null });
  assert.equal(v.total, 3);
  assert.equal(v.fetchedAt, null, 'an unsynced file must not invent a date');
});
