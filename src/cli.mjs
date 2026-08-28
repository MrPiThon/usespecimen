#!/usr/bin/env node
// Front door for the ingestion pipeline.
//
// Stages stay independently runnable, per the plan: `extract` crawls a live page
// and clusters it, `cluster` re-runs the deterministic half over a saved capture
// with no browser and no network. That second path is the loop for tuning
// cluster.mjs against fixtures, and it works on a machine where Playwright's
// browsers were never installed — so Playwright is imported lazily, not up top.
//
// stdout carries the payload (summary or JSON) and nothing else; progress and
// errors go to stderr, so `--json` pipes cleanly.

import { parseArgs } from 'node:util';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { harvestFn } from './extract/harvest.mjs';
import { cluster, summarize } from './extract/cluster.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(await readFile(join(HERE, '..', 'package.json'), 'utf8'));

const USAGE = `specimen — design token extractor (${pkg.name}@${pkg.version})

Usage:
  node src/cli.mjs extract <url> [<url>...] [options]
  node src/cli.mjs cluster <capture.json> [options]

Commands:
  extract    Crawl live pages, harvest computed styles, cluster into tokens,
             write <out>/<slug>/capture.json.
  cluster    Re-cluster a saved capture. No browser, no network. Accepts a full
             capture.json or a bare harvestFn dump pasted from a browser console.

Options:
  --out <dir>        Output directory (default: out)
  --slug <name>      Override the derived directory name (single url only)
  --viewport <WxH>   Viewport for the crawl (default: 1440x900)
  --wait <ms>        Settle time after load (default: 1500)
  --timeout <ms>     Navigation timeout (default: 45000)
  --write            cluster: update the source file's tokens in place
  --json             Print token JSON instead of the summary
  --quiet            Suppress the summary
  -h, --help

Requires one-time setup:  npx playwright install chromium
`;

const log = msg => process.stderr.write(`${msg}\n`);
const out = msg => process.stdout.write(`${msg}\n`);

function fail(msg, code = 1) {
  log(msg);
  process.exit(code);
}

/** Directory name for a system. First label of the host, so stripe.com becomes
 *  `stripe` and the path matches the `specimen add stripe` the CLI is aiming at.
 *  Override with --slug when that reads badly (www.gov.uk would give `gov`). */
export function slugify(url) {
  let host;
  try {
    host = new URL(url).hostname;
  } catch {
    host = String(url);
  }
  const label = host.replace(/^www\./, '').split('.')[0];
  return label.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '') || 'site';
}

const num = (value, flag) => {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) fail(`--${flag} expects a non-negative number, got "${value}"`);
  return n;
};

function parseViewport(value) {
  const m = /^(\d+)x(\d+)$/.exec(String(value).trim());
  if (!m) fail(`--viewport expects WxH, e.g. 1440x900, got "${value}"`);
  return { width: Number(m[1]), height: Number(m[2]) };
}

/** Provenance envelope around the token set. capturedAt is the dated claim the
 *  whole product rests on, so it leads. The raw harvest rides along last: it is
 *  what lets `cluster` re-run offline without another crawl, and what a future
 *  drift check diffs against. */
const record = ({ tokens, harvest, method, capturedAt }) => ({
  capturedAt,
  tool: `${pkg.name}@${pkg.version}`,
  method,
  ...tokens,
  harvest,
});

async function writeCapture(dir, data) {
  await mkdir(dir, { recursive: true });
  const path = join(dir, 'capture.json');
  // Trailing newline: these files live in git and get reviewed as diffs.
  await writeFile(path, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  return path;
}

function report(data, opts) {
  if (opts.json) return;
  if (!opts.quiet) out(summarize(data));
}

// ---------------------------------------------------------------------------

async function extract(urls, opts) {
  let chromium;
  try {
    ({ chromium } = await import('playwright'));
  } catch {
    fail('Playwright is not installed. Run:\n  npm install');
  }

  let browser;
  try {
    browser = await chromium.launch();
  } catch (err) {
    // The single most common first-run failure, and the one CLAUDE.md warns
    // about — worth catching rather than letting Playwright's wall of text land.
    if (/executable doesn't exist|playwright install/i.test(err.message)) {
      fail("Chromium isn't installed for Playwright. Run:\n  npx playwright install chromium");
    }
    throw err;
  }

  const version = browser.version();
  const results = [];
  const failures = [];

  try {
    for (const url of urls) {
      const page = await browser.newPage({ viewport: opts.viewport });
      try {
        log(`→ ${url}`);
        // domcontentloaded then a best-effort wait for quiet: `networkidle` alone
        // never settles on sites that long-poll, and timing out there would lose
        // a page we could have harvested perfectly well.
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: opts.timeout });
        await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
        await page.waitForTimeout(opts.wait);

        const harvest = await page.evaluate(harvestFn);
        const data = record({
          tokens: cluster(harvest),
          harvest,
          capturedAt: new Date().toISOString(),
          method: `playwright/chromium ${version} computed styles `
            + `@ ${opts.viewport.width}x${opts.viewport.height}`,
        });

        const slug = opts.slug || slugify(harvest.url || url);
        const path = await writeCapture(join(opts.out, slug), data);
        log(`  wrote ${path}  (${data.warnings.length} warnings, `
          + `${data.audit.failures} contrast failures)`);
        results.push(data);
        report(data, opts);
      } catch (err) {
        log(`  failed: ${err.message.split('\n')[0]}`);
        failures.push({ url, error: err.message.split('\n')[0] });
      } finally {
        await page.close();
      }
    }
  } finally {
    await browser.close();
  }

  if (opts.json && results.length) {
    out(JSON.stringify(results.length === 1 ? results[0] : results, null, 2));
  }
  if (failures.length) {
    fail(`\n${failures.length} of ${urls.length} failed:\n`
      + failures.map(f => `  ${f.url} — ${f.error}`).join('\n'));
  }
}

async function recluster(path, opts) {
  let source;
  try {
    source = JSON.parse(await readFile(path, 'utf8'));
  } catch (err) {
    fail(`Could not read ${path}: ${err.message}`);
  }

  // Accept a full capture.json or a bare harvestFn dump — pasting the function
  // into a browser console is the documented way to get fixtures without
  // Playwright, and those come back unwrapped.
  const harvest = source.harvest ?? source;
  if (!harvest || typeof harvest !== 'object' || !('textColors' in harvest)) {
    fail(`${path} does not look like a capture: no harvest data found.`);
  }

  const tokens = cluster(harvest);
  const data = source.harvest
    // Re-clustering is not a re-capture: capturedAt and method describe when the
    // page was actually visited and must survive untouched.
    ? { ...source, ...tokens, harvest }
    : record({
      tokens, harvest, capturedAt: source.capturedAt ?? null, method: 'recluster of bare harvest',
    });

  if (opts.write) {
    if (!source.harvest) fail('--write needs a capture.json, not a bare harvest dump.');
    await writeFile(path, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
    log(`wrote ${path}`);
  }
  report(data, opts);
  if (opts.json) out(JSON.stringify(data, null, 2));
}

// ---------------------------------------------------------------------------

let parsed;
try {
  parsed = parseArgs({
    allowPositionals: true,
    options: {
      out: { type: 'string', default: 'out' },
      slug: { type: 'string' },
      viewport: { type: 'string', default: '1440x900' },
      wait: { type: 'string', default: '1500' },
      timeout: { type: 'string', default: '45000' },
      write: { type: 'boolean', default: false },
      json: { type: 'boolean', default: false },
      quiet: { type: 'boolean', default: false },
      help: { type: 'boolean', short: 'h', default: false },
    },
  });
} catch (err) {
  fail(`${err.message}\n\n${USAGE}`);
}

const { values, positionals } = parsed;
const [command, ...rest] = positionals;

if (values.help || !command) {
  out(USAGE);
  process.exit(values.help ? 0 : 1);
}

const opts = {
  out: values.out,
  slug: values.slug,
  viewport: parseViewport(values.viewport),
  wait: num(values.wait, 'wait'),
  timeout: num(values.timeout, 'timeout'),
  write: values.write,
  json: values.json,
  quiet: values.quiet,
};

switch (command) {
  case 'extract': {
    if (!rest.length) fail(`extract needs at least one url.\n\n${USAGE}`);
    if (values.slug && rest.length > 1) fail('--slug only makes sense with a single url.');
    await extract(rest, opts);
    break;
  }
  case 'cluster': {
    if (rest.length !== 1) fail(`cluster needs exactly one capture file.\n\n${USAGE}`);
    await recluster(rest[0], opts);
    break;
  }
  default:
    fail(`Unknown command "${command}".\n\n${USAGE}`);
}
