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
import { mergeHarvests } from './extract/merge.mjs';
import { parseColor, deltaE } from './lib/color.mjs';
import { captureScreenshot } from './extract/screenshot.mjs';

// Widest first: the primary capture supplies the scalars and the stylesheet
// data, and the widest layout is the canonical one.
const VIEWPORTS = [
  { width: 1440, height: 900 },
  { width: 768, height: 1024 },
  { width: 390, height: 844 },
];
const SCHEMES = ['light', 'dark'];

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
  --viewport <WxH>   Single viewport instead of the 1440/768/390 sweep
  --light-only       Skip the dark-scheme pass
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
const record = ({ tokens, harvest, method, capturedAt, dark, darkHarvest, supportsDark }) => ({
  capturedAt,
  tool: `${pkg.name}@${pkg.version}`,
  method,
  ...tokens,
  // A second palette, not a second file. Null when the site ignores
  // prefers-color-scheme, which is itself a fact worth recording.
  supportsDark: supportsDark ?? false,
  dark: dark ?? null,
  harvest,
  darkHarvest: darkHarvest ?? null,
});

/**
 * One page load per colour scheme, then a sweep of viewport widths within it.
 * Reloading per scheme rather than toggling after load, because a site that
 * picks its theme in JS at boot will not react to emulateMedia afterwards.
 */
async function captureScheme(browser, url, scheme, opts) {
  const context = await browser.newContext({
    colorScheme: scheme,
    viewport: opts.viewports[0],
  });
  try {
    const page = await context.newPage();
    // domcontentloaded then a best-effort wait for quiet: `networkidle` alone
    // never settles on sites that long-poll, and timing out there would lose a
    // page we could have harvested perfectly well.
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: opts.timeout });
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(opts.wait);

    const captures = [];
    let shot = null;
    for (const viewport of opts.viewports) {
      await page.setViewportSize(viewport);
      // Media queries and resize observers need a beat before the computed
      // styles are worth reading.
      await page.waitForTimeout(500);
      captures.push({ viewport, harvest: await page.evaluate(harvestFn) });
      // Proof shot from the widest viewport only — the canonical layout.
      if (!shot) shot = await captureScreenshot(page);
    }
    const harvest = mergeHarvests(captures);
    harvest.screenshot = shot ? { width: shot.width, height: shot.height, format: shot.format } : null;
    return { harvest, shot };
  } finally {
    await context.close();
  }
}

/** Did the dark pass actually produce a different page? */
function differentScheme(light, dark) {
  const a = parseColor(light.pageBg);
  const b = parseColor(dark.pageBg);
  if (!a || !b) return light.pageBg !== dark.pageBg;
  // Well above the just-noticeable step, so a hairline anti-aliasing difference
  // never gets reported as dark-mode support.
  return deltaE(a, b) > 0.02;
}

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
      try {
        log(`→ ${url}`);
        const sweep = {};
        for (const scheme of opts.schemes) {
          sweep[scheme] = await captureScheme(browser, url, scheme, opts);
        }
        const lightRun = sweep.light ?? sweep[opts.schemes[0]];
        const darkRun = sweep.dark ?? null;
        const light = lightRun.harvest;
        const dark = darkRun?.harvest ?? null;
        // A site that ignores prefers-color-scheme hands back the same page
        // twice. A "dark" palette identical to the light one is noise dressed as
        // a feature, so this comparison decides whether one is emitted at all.
        // Compared perceptually, not as strings: rgb(0,0,0) and rgba(0,0,0,1)
        // are the same colour written two ways.
        const supportsDark = Boolean(dark && light && differentScheme(light, dark));

        const data = record({
          tokens: cluster(light),
          harvest: light,
          dark: supportsDark ? cluster(dark) : null,
          darkHarvest: supportsDark ? dark : null,
          supportsDark,
          capturedAt: new Date().toISOString(),
          method: `playwright/chromium ${version} computed styles @ `
            + `${opts.viewports.map(v => `${v.width}x${v.height}`).join(', ')}`
            + ` (${opts.schemes.join(' + ')})`,
        });

        const slug = opts.slug || slugify(light.url || url);
        const dir = join(opts.out, slug);
        const path = await writeCapture(dir, data);
        const shots = [
          [lightRun.shot, 'source.webp'],
          [supportsDark ? darkRun?.shot : null, 'source-dark.webp'],
        ];
        for (const [shot, name] of shots) {
          if (shot) await writeFile(join(dir, name), shot.buffer);
        }
        log(`  wrote ${path}  (${data.warnings.length} warnings, `
          + `${data.audit.failures} contrast failures`
          + `${supportsDark ? ', + dark palette' : ''}`
          + `${lightRun.shot ? `, ${Math.round(lightRun.shot.buffer.length / 1024)}KB shot` : ''})`);
        results.push(data);
        report(data, opts);
      } catch (err) {
        log(`  failed: ${err.message.split('\n')[0]}`);
        failures.push({ url, error: err.message.split('\n')[0] });
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
      viewport: { type: 'string' },
      'light-only': { type: 'boolean', default: false },
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
  viewports: values.viewport ? [parseViewport(values.viewport)] : VIEWPORTS,
  schemes: values['light-only'] ? ['light'] : SCHEMES,
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
