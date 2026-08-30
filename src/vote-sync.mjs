#!/usr/bin/env node
// Refresh content/votes.json from GitHub, and open the ballot issues.
//
//   npm run votes            read counts for the issues that exist
//   npm run votes -- --create  open an issue for any system missing one
//
// Split deliberately. Reading is safe and runs on a schedule; `--create` posts
// public issues to somebody's repository and only ever runs when a person asks
// for it.
//
// Auth comes from GH_TOKEN / GITHUB_TOKEN, or from `gh auth token` if the CLI is
// signed in. Reading public reactions works unauthenticated too, at 60 requests
// an hour, which is enough for one sync.

import { readFile, writeFile } from 'node:fs/promises';
import { readdir } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { join } from 'node:path';
import { VOTE_REPO, voteTitle, slugFromTitle } from './lib/votes.mjs';

const run = promisify(execFile);
const log = m => process.stderr.write(`${m}\n`);
const fail = (m) => { log(m); process.exit(1); };

const CONTENT = 'content/systems';
const OUT = 'content/votes.json';

async function token() {
  if (process.env.GH_TOKEN) return process.env.GH_TOKEN;
  if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN;
  try {
    // No `shell: true`: it triggers a Node deprecation warning about unescaped
    // arguments, and execFile resolves gh/gh.exe without it.
    const { stdout } = await run('gh', ['auth', 'token']);
    return stdout.trim() || null;
  } catch {
    return null;
  }
}

async function api(path, { auth, method = 'GET', body } = {}) {
  const res = await fetch(`https://api.github.com${path}`, {
    method,
    headers: {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'specimen-vote-sync',
      ...(auth ? { Authorization: `Bearer ${auth}` } : {}),
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`GitHub ${method} ${path} -> ${res.status}\n${text.slice(0, 300)}`);
  }
  return res.json();
}

/** Every `Upvote: <slug>` issue, open or closed, keyed by slug. */
async function ballots(auth) {
  const found = new Map();
  for (let page = 1; page <= 10; page += 1) {
    const batch = await api(
      `/repos/${VOTE_REPO}/issues?state=all&per_page=100&page=${page}`, { auth });
    if (!batch.length) break;
    for (const issue of batch) {
      // Pull requests come back from this endpoint too and are not ballots.
      if (issue.pull_request) continue;
      const slug = slugFromTitle(issue.title);
      if (slug) found.set(slug, { issue: issue.number, up: issue.reactions?.['+1'] ?? 0 });
    }
    if (batch.length < 100) break;
  }
  return found;
}

const BODY = slug => [
  `React with a thumbs-up on this issue to upvote **${slug}**.`,
  '',
  `The count appears at https://specimen.coursey.website/systems/${slug} and in`,
  'the catalogue, refreshed by a scheduled job.',
  '',
  'Comments here are welcome but only the 👍 reaction is counted. To report a',
  'wrong value or a stale capture, open a separate issue instead — that is a',
  'correction, not a vote.',
].join('\n');

async function main() {
  const create = process.argv.includes('--create');
  const auth = await token();
  if (create && !auth) {
    fail('--create needs a token: set GH_TOKEN, or run `gh auth login`.');
  }
  if (!auth) log('No token found; reading public counts unauthenticated.');

  const slugs = (await readdir(CONTENT, { withFileTypes: true }))
    .filter(e => e.isDirectory()).map(e => e.name).sort();

  let found = await ballots(auth);

  if (create) {
    const missing = slugs.filter(s => !found.has(s));
    if (!missing.length) log('Every system already has a ballot issue.');
    for (const slug of missing) {
      const issue = await api(`/repos/${VOTE_REPO}/issues`, {
        auth,
        method: 'POST',
        body: { title: voteTitle(slug), body: BODY(slug), labels: ['upvote'] },
      });
      log(`opened #${issue.number} for ${slug}`);
      found.set(slug, { issue: issue.number, up: 0 });
    }
  }

  const systems = {};
  for (const slug of slugs) {
    const v = found.get(slug);
    systems[slug] = { issue: v?.issue ?? null, up: v?.up ?? 0 };
  }

  // Written sorted and pretty so a diff of this file is readable: the point of
  // committing it is that a change in the counts is visible in history.
  const out = {
    repo: VOTE_REPO,
    fetchedAt: new Date().toISOString(),
    systems,
  };
  await writeFile(OUT, `${JSON.stringify(out, null, 2)}\n`);

  const counted = Object.values(systems).filter(v => v.issue).length;
  const total = Object.values(systems).reduce((n, v) => n + v.up, 0);
  log(`${OUT}: ${counted}/${slugs.length} systems have a ballot, ${total} upvote(s) total.`);
  if (counted < slugs.length) {
    log('Run `npm run votes -- --create` to open the missing ones.');
  }
}

main().catch(err => fail(err.message));
