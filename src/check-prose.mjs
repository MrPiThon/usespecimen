#!/usr/bin/env node
// Runner for the prose drift check. `npm run check`.
//
// The build already refuses a file that breaks the DESIGN.md spec. It has
// nothing to say about a file whose prose asserts a number its own frontmatter
// contradicts, and that is the more likely failure here: every body was written
// by hand against a capture, and every capture gets re-taken.
//
// Found on the first run: GOV.UK claiming a 5px base its capture no longer
// publishes, Linear quoting a grid share three points stale, Basecamp
// describing a green canvas tint that had become violet, and The Verge
// describing an electric violet accent that had been replaced by a mint fill
// (the violet survives — as a link-hover underline — which is a different
// claim entirely).

import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { load as parseYaml } from 'js-yaml';
import { checkProse, checkSuperlatives } from './lib/prose-check.mjs';

const ROOT = 'content/systems';

const entries = await readdir(ROOT, { withFileTypes: true });
const slugs = entries.filter(e => e.isDirectory()).map(e => e.name).sort();

let total = 0;
const corpus = [];
for (const slug of slugs) {
  const raw = await readFile(join(ROOT, slug, 'DESIGN.md'), 'utf8');
  const parts = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!parts) {
    console.error(`${slug}: no frontmatter`);
    total += 1;
    continue;
  }
  let capture = null;
  try {
    capture = JSON.parse(await readFile(join(ROOT, slug, 'capture.json'), 'utf8'));
  } catch { /* a system may ship without one; the check degrades rather than fails */ }

  const data = parseYaml(parts[1]);
  corpus.push({ slug, data, body: parts[2], capture });
  const issues = checkProse(slug, data, parts[2], capture);
  if (issues.length) {
    total += issues.length;
    console.error(`\n${slug}`);
    for (const i of issues) console.error(`  - ${i.issue}`);
  }
}

// Cross-corpus claims need every system loaded, so they run after the loop.
for (const i of checkSuperlatives(corpus)) {
  total += 1;
  console.error(`
${i.slug}
  - ${i.issue}`);
}

if (total) {
  console.error(`\n${total} contradiction(s) across ${slugs.length} systems.`);
  console.error('The prose and the tokens disagree. Re-read the capture and correct the prose;');
  console.error('do not adjust the tokens to match a sentence.');
  process.exit(1);
}
console.log(`${slugs.length} systems: prose agrees with the tokens.`);
