// The regression net under the clusterer.
//
// Nineteen versions of tuning constants live in cluster.mjs, and every one of
// them was derived from a specific measured failure on a real site — COLOR_MERGE
// is 0.045 because Stripe's navy variants sit 0.0424 apart, MIN_ACCENT_COUNT is
// 2 because a promo banner once became Linear's brand colour. Until this file
// existed, nothing at all guarded them: you could move a threshold and the only
// alarm was somebody eyeballing a palette.
//
// The fixtures were free. Every capture in content/systems carries its raw
// harvest, so the whole corpus is 23 real pages' worth of input with no
// network, no browser and no mocking. Snapshotting the full token set means a
// constant that moves shows up as an exact diff on exactly the systems it
// affects, which is also the review you want when the move is deliberate.
//
//   npm test
//   UPDATE_SNAPSHOTS=1 npm test    accept the current output as the baseline
//
// Snapshots are committed. A diff in test/snapshots/ is the point, not noise —
// it is the answer to "which of the 23 did that actually change, and how".

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { cluster } from '../src/extract/cluster.mjs';
import { parseColor, flatten, toHex, COLOR_STOP_RE } from '../src/lib/color.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const CONTENT = join(HERE, '..', 'content', 'systems');
const SNAPS = join(HERE, 'snapshots');
const UPDATE = process.env.UPDATE_SNAPSHOTS === '1';

const slugs = (await readdir(CONTENT, { withFileTypes: true }))
  .filter(e => e.isDirectory()).map(e => e.name).sort();

test('the corpus is not empty', () => {
  assert.ok(slugs.length >= 20, `expected the full corpus, found ${slugs.length}`);
});

for (const slug of slugs) {
  test(`cluster(${slug})`, async () => {
    const capture = JSON.parse(await readFile(join(CONTENT, slug, 'capture.json'), 'utf8'));
    assert.ok(capture.harvest, `${slug} has no stored harvest to re-cluster`);

    const actual = cluster(capture.harvest);
    const file = join(SNAPS, `${slug}.json`);
    const json = `${JSON.stringify(actual, null, 2)}\n`;

    if (UPDATE) {
      await mkdir(SNAPS, { recursive: true });
      await writeFile(file, json);
      return;
    }

    let expected;
    try {
      expected = await readFile(file, 'utf8');
    } catch {
      assert.fail(`No snapshot for ${slug}. Run: UPDATE_SNAPSHOTS=1 npm test`);
    }
    // Compared as parsed objects rather than as text, so the failure message
    // names the path that moved instead of printing two 19KB strings.
    assert.deepEqual(actual, JSON.parse(expected));
  });

  test(`cluster(${slug}) is deterministic`, async () => {
    const capture = JSON.parse(await readFile(join(CONTENT, slug, 'capture.json'), 'utf8'));
    // Same input twice. The whole drift story rests on this: a token that
    // changes between runs would make every re-capture diff meaningless.
    assert.deepEqual(cluster(capture.harvest), cluster(capture.harvest));
  });
}

test('every emitted colour was observed in the harvest', async () => {
  // The load-bearing rule of the project, checked rather than trusted: a
  // cluster is represented by its heaviest member and never by an average, so
  // every hex the clusterer emits must be a colour that literally appeared on
  // the page. An averaged hex is an invented hex.
  //
  // Not circular: this re-derives the candidate set straight from the raw
  // histograms with parseColor and flatten, and never uses the clusterer's
  // merging. If clustering ever started emitting a midpoint, this fails.
  for (const slug of slugs) {
    const capture = JSON.parse(await readFile(join(CONTENT, slug, 'capture.json'), 'utf8'));
    const h = capture.harvest;
    const tokens = cluster(h);

    // The RESOLVED canvas, not h.pageBg. Figma reports `rgba(0, 0, 0, 0)` for
    // the page background — transparent — and flattening a 24% white over a
    // transparent black yields #3d3d3d, which matches nothing. The clusterer
    // resolves that to the real canvas, and its answer is itself one of the
    // emitted values this test checks.
    const backdrop = parseColor(tokens.colors.roles.background?.hex ?? '#ffffff')
      ?? { r: 255, g: 255, b: 255, a: 1 };
    // Every colour-shaped string anywhere in the harvest, not just the four
    // colour histograms. Linear's accent is a restrained system's whole story:
    // it survives only in a `:focus-visible` box-shadow and appears in no
    // colour histogram at all, so a candidate set built from those alone
    // called a correctly-extracted brand colour invented.
    const observed = new Set();
    for (const raw of JSON.stringify(h).match(COLOR_STOP_RE) ?? []) {
      const rgb = parseColor(raw);
      if (!rgb) continue;
      // Translucent values are only ever emitted composited over the canvas,
      // which is what flatten does, so both forms count as observed.
      observed.add(toHex(rgb));
      observed.add(toHex(flatten(rgb, backdrop)));
    }

    const emitted = [
      ...Object.entries(tokens.colors.roles)
        .filter(([, r]) => r).map(([name, r]) => [name, r.hex]),
      ...tokens.colors.ramps.surface.map(r => [r.name, r.hex]),
      ...tokens.colors.ramps.text.map(r => [r.name, r.hex]),
    ];

    // Within one 8-bit step per channel, and no more. The clusterer composites
    // translucent values against the parsed canvas at full float precision
    // while this reconstruction rounds the canvas to a hex first, so Supabase's
    // 5%-alpha card lands a single unit apart in one channel. That is
    // serialisation, not invention — and a tolerance this tight still fails
    // instantly on an averaged hex, which is the thing being guarded against.
    const near = (hex) => {
      const rgb = parseColor(hex);
      for (const o of observed) {
        const c = parseColor(o);
        if (Math.abs(c.r - rgb.r) <= 1 && Math.abs(c.g - rgb.g) <= 1
          && Math.abs(c.b - rgb.b) <= 1) return true;
      }
      return false;
    };

    for (const [name, hex] of emitted) {
      assert.ok(near(hex),
        `${slug}: ${name} = ${hex} appears nowhere in the harvest — an invented colour`);
    }
  }
});
