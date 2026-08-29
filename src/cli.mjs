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
import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { harvestFn } from './extract/harvest.mjs';
import { cluster, summarize } from './extract/cluster.mjs';
import { mergeHarvests } from './extract/merge.mjs';
import { authorSystem, brandFromUrl } from './extract/author.mjs';
import { parseColor, deltaE } from './lib/color.mjs';
import { captureScreenshot } from './extract/screenshot.mjs';
import { SITE, rawUrl, indexUrl, systemUrl } from './lib/site.mjs';
import { validateDesignMd, splitFrontmatter } from './lib/validate.mjs';

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
  node src/cli.mjs author <slug> --name <name> [options]
  node src/cli.mjs add <slug> [options]
  node src/cli.mjs list [options]

Commands:
  extract    Crawl live pages, harvest computed styles, cluster into tokens,
             write <out>/<slug>/capture.json.
  cluster    Re-cluster a saved capture. No browser, no network. Accepts a full
             capture.json or a bare harvestFn dump pasted from a browser console.
  author     Turn out/<slug>/capture.json into content/systems/<slug>/, with
             frontmatter derived from the tokens and a fact-sheet body to write
             prose over. Never invents a value.
  add        Fetch a system's DESIGN.md into the current directory, validated
             before it lands. Prints the prompt to hand your agent.
  list       Show what the registry carries.

Options:
  --out <dir>        Output directory (default: out)
  --slug <name>      Override the derived directory name (single url only)
  --viewport <WxH>   Single viewport instead of the 1440/768/390 sweep
  --light-only       Skip the dark-scheme pass
  --wait <ms>        Settle time after load (default: 1500)
  --timeout <ms>     Navigation timeout (default: 45000)
  --write            cluster: update the source file's tokens in place
  --registry <url>   Registry origin for add/list (default: the published site)
  --name <name>      author: the aesthetic's name, not the company's
  --description <s>  author: one line for the catalog
  --brand <name>     author: attribution (default: guessed from the source host)
  --categories <ids> author: comma-separated, e.g. saas,developer-tools
  --content <dir>    author: target directory (default: content/systems)
  --from <slug>      author: capture directory under out/ when it differs from
                     the target slug (www.gov.uk extracts to gov, ships as govuk)
  --tokens-only      author: refresh frontmatter, keep the prose. Use when the
                     clusterer improves and the values are stale
  --force            author/add: overwrite an existing DESIGN.md
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
    let shotError = null;
    for (const viewport of opts.viewports) {
      await page.setViewportSize(viewport);
      // Media queries and resize observers need a beat before the computed
      // styles are worth reading.
      await page.waitForTimeout(500);
      captures.push({ viewport, harvest: await page.evaluate(harvestFn) });
      // Proof shot from the widest viewport only — the canonical layout.
      //
      // Never fatal. The shot is evidence, not the extraction: Hacker News
      // threw `EncodingError: The source image cannot be decoded` out of the
      // in-page encoder and lost an otherwise clean token capture with it. The
      // rest of this pipeline omits what it cannot measure and says so, and a
      // screenshot is no different.
      if (!shot) {
        try {
          shot = await captureScreenshot(page);
        } catch (err) {
          shotError = err.message;
        }
      }
    }
    const harvest = mergeHarvests(captures);
    harvest.screenshot = shot ? { width: shot.width, height: shot.height, format: shot.format } : null;
    // Recorded rather than swallowed, so a system with no proof shot says why.
    if (shotError) harvest.screenshotError = shotError;
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

/**
 * Capture -> content/systems/<slug>/. Re-clusters from the stored harvest rather
 * than trusting the tokens already in the file: copying a stale capture is
 * exactly how frontmatter and the clusterer drift apart, and this command exists
 * to make that impossible.
 */
async function author(slug, opts) {
  // The capture directory and the published slug need not match: www.gov.uk
  // extracts to `gov` but ships as `govuk`.
  const source = opts.from || slug;
  const from = join(opts.out, source, 'capture.json');
  let src;
  try {
    src = JSON.parse(await readFile(from, 'utf8'));
  } catch (err) {
    fail(`Could not read ${from}: ${err.message}\nRun \`extract\` first.`);
  }
  if (!src.harvest) fail(`${from} has no harvest data; re-run \`extract\`.`);

  const dir = join(opts.content, slug);
  const previous = await previousTokens(dir);
  const cap = {
    capturedAt: src.capturedAt,
    tool: src.tool,
    method: src.method,
    ...cluster(src.harvest, { previous }),
    supportsDark: src.supportsDark ?? false,
    dark: src.darkHarvest ? cluster(src.darkHarvest, { previous: previous?.dark }) : null,
    harvest: src.harvest,
    darkHarvest: src.darkHarvest ?? null,
  };

  const target = join(dir, 'DESIGN.md');
  // Refreshing tokens must never cost the prose. A clusterer improvement makes
  // frontmatter stale on every existing file, and rewriting the body to fix a
  // hex would throw away the only part no command can regenerate.
  let keepBody = null;
  let inherited = {};
  if (opts.tokensOnly) {
    try {
      const raw = await readFile(target, 'utf8');
      keepBody = splitFrontmatter(raw).body;
      // Name, description and categories exist only in the file — nothing in a
      // capture knows them. A token refresh that dropped them would silently
      // un-categorise the whole catalogue.
      const prior = validateDesignMd(raw).data ?? {};
      inherited = {
        name: prior.name,
        description: prior.description,
        categories: prior.categories,
        brand: prior.provenance?.brand,
      };
    } catch (err) {
      fail(`--tokens-only needs an existing ${target} to keep the prose from.`);
    }
  }

  const meta = {
    name: opts.name ?? inherited.name,
    description: opts.description ?? inherited.description,
    categories: opts.categories ?? inherited.categories,
    brand: opts.brand ?? inherited.brand,
  };
  if (!meta.name) {
    fail('author needs --name. Name the aesthetic, not the company:\n'
      + '  --name "Indigo Infrastructure", not --name "Stripe"');
  }
  if (!opts.force && !opts.tokensOnly) {
    try {
      await readFile(target, 'utf8');
      fail(`${target} already exists. Pass --force to overwrite it — the prose in `
        + 'it will be lost.');
    } catch (err) {
      if (err.code !== 'ENOENT') throw err;
    }
  }

  // Which proof shots exist has to be known BEFORE the frontmatter is built:
  // they are referenced from it. They are still copied afterwards, below.
  const available = [];
  for (const shot of ['source.webp', 'source-dark.webp']) {
    try {
      await access(join(opts.out, source, shot));
      available.push(shot);
    } catch { /* not captured for this system */ }
  }

  const generated = authorSystem(cap, {
    ...meta,
    brand: meta.brand || brandFromUrl(cap.source.url),
    dark: cap.supportsDark ? cap.dark : null,
    shots: available,
  });
  const file = keepBody === null
    ? generated
    : `---
${splitFrontmatter(generated).frontmatter}
---

${keepBody}
`;

  // The scaffold must pass the same gate the build applies, or `author` has
  // produced something that cannot ship.
  const verdict = validateDesignMd(file);
  if (!verdict.ok) {
    fail('The generated file does not conform, which is a bug in author.mjs:\n'
      + verdict.errors.map(e => `  - ${e}`).join('\n'));
  }

  await mkdir(dir, { recursive: true });
  await writeFile(target, file, 'utf8');
  await writeFile(join(dir, 'capture.json'), `${JSON.stringify(cap, null, 2)}\n`, 'utf8');
  // Proof shots travel with the system directory.
  const shots = [];
  for (const shot of available) {
    await writeFile(join(dir, shot), await readFile(join(opts.out, source, shot)));
    shots.push(shot);
  }

  log(`Wrote ${dir}/${keepBody === null ? '' : '  (frontmatter only; prose kept)'}`);
  log(`  DESIGN.md, capture.json${shots.length ? `, ${shots.join(', ')}` : ''}`);
  log(`  cluster v${cap.clusterVersion}, ${cap.warnings.length} warning(s)`
    + `${cap.supportsDark ? ', + dark palette' : ''}`);
  out('');
  out('The body is a fact sheet, not prose. Every line is a measured value —');
  out('rewrite them into prose without adding any value that is not there.');
}

/** The previous token set for a slug, if there is one. Re-clustering without it
 *  lets a threshold decision flip on measurement noise and read as real drift. */
async function previousTokens(dir) {
  try {
    return JSON.parse(await readFile(join(dir, 'capture.json'), 'utf8'));
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
    return undefined;
  }
}

async function fetchText(url, what) {
  let res;
  try {
    res = await fetch(url);
  } catch (err) {
    fail(`Could not reach the registry at ${url}\n  ${err.message}`);
  }
  if (res.status === 404) fail(`No ${what} at ${url}\nRun \`list\` to see what exists.`);
  if (!res.ok) fail(`Registry returned ${res.status} for ${url}`);
  return res.text();
}

/**
 * Fetch one system into the working directory.
 *
 * The file is validated BEFORE it is written. A registry shipping a
 * non-conformant file has already failed upstream, but the client is the last
 * place to catch it and the only one that knows the file is about to be handed
 * to an agent — so it checks rather than assuming.
 */
async function add(slug, opts) {
  const url = rawUrl(slug, opts.registry);
  const body = await fetchText(url, `system called "${slug}"`);

  const verdict = validateDesignMd(body);
  if (!verdict.ok) {
    fail(`${url} is not a conformant DESIGN.md, so nothing was written:\n`
      + verdict.errors.map(e => `  - ${e}`).join('\n'));
  }

  const target = join(process.cwd(), 'DESIGN.md');
  if (!opts.force) {
    try {
      await readFile(target, 'utf8');
      fail('DESIGN.md already exists here. Pass --force to overwrite it.');
    } catch (err) {
      if (err.code !== 'ENOENT') throw err;
    }
  }
  await writeFile(target, body, 'utf8');

  const prov = verdict.data?.provenance ?? {};
  const captured = prov.capturedAt ? String(prov.capturedAt).slice(0, 10) : 'unknown';
  log(`Wrote DESIGN.md — ${verdict.data?.name ?? slug}`);
  log(`  verified ${captured} against ${prov.source ?? 'its source'}`);
  if (verdict.warnings.length) {
    log(`  ${verdict.warnings.length} warning(s) — see ${systemUrl(slug, opts.registry)}`);
  }
  // The prompt is the point: a file the agent is never told to read is inert.
  out('');
  out('Hand this to your agent:');
  out('');
  out('  Use DESIGN.md in this repository as the design system for all UI work.');
  out('  Follow its tokens exactly. Do not substitute colours, type sizes or');
  out('  spacing values that are not in the file.');
}

async function list(opts) {
  const raw = await fetchText(indexUrl(opts.registry), 'catalog');
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    fail(`The catalog at ${indexUrl(opts.registry)} is not valid JSON.`);
  }
  if (opts.json) { out(JSON.stringify(data, null, 2)); return; }

  const swatch = (hex) => {
    const n = parseInt(hex.slice(1), 16);
    return `\x1b[48;2;${(n >> 16) & 255};${(n >> 8) & 255};${n & 255}m  \x1b[0m`;
  };
  out(`${data.count} system${data.count === 1 ? '' : 's'}`);
  out('');
  for (const s of data.systems) {
    out(`  ${s.palette.filter(Boolean).map(swatch).join('')} ${s.slug.padEnd(9)}`
      + ` ${s.name.padEnd(23)} ${(s.polarity ?? '?') + (s.supportsDark ? '+dark' : '')}`.padEnd(16)
      + `  verified ${s.capturedAt.slice(0, 10)}`);
  }
  out('');
  out('  specimen add <slug>');
}

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

        const slug = opts.slug || slugify(light.url || url);
        const dir = join(opts.out, slug);
        const previous = await previousTokens(dir);
        const data = record({
          tokens: cluster(light, { previous }),
          harvest: light,
          dark: supportsDark ? cluster(dark, { previous: previous?.dark }) : null,
          darkHarvest: supportsDark ? dark : null,
          supportsDark,
          capturedAt: new Date().toISOString(),
          method: `playwright/chromium ${version} computed styles @ `
            + `${opts.viewports.map(v => `${v.width}x${v.height}`).join(', ')}`
            + ` (${opts.schemes.join(' + ')})`,
        });

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

  // The file we are re-clustering is its own previous state, which is what makes
  // `cluster --write` idempotent across a borderline threshold.
  const tokens = cluster(harvest, { previous: source.harvest ? source : undefined });
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
      registry: { type: 'string', default: SITE },
      name: { type: 'string' },
      description: { type: 'string' },
      brand: { type: 'string' },
      categories: { type: 'string' },
      content: { type: 'string', default: 'content/systems' },
      from: { type: 'string' },
      'tokens-only': { type: 'boolean', default: false },
      force: { type: 'boolean', default: false },
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
  registry: String(values.registry).replace(/\/+$/, ''),
  name: values.name,
  description: values.description,
  brand: values.brand,
  categories: values.categories
    ? values.categories.split(',').map(x => x.trim()).filter(Boolean)
    : undefined,
  content: values.content,
  from: values.from,
  tokensOnly: values['tokens-only'],
  force: values.force,
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
  case 'author': {
    if (rest.length !== 1) fail(`author needs exactly one slug.\n\n${USAGE}`);
    await author(rest[0], opts);
    break;
  }
  case 'add': {
    if (rest.length !== 1) fail(`add needs exactly one slug.\n\n${USAGE}`);
    await add(rest[0], opts);
    break;
  }
  case 'list': {
    await list(opts);
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
