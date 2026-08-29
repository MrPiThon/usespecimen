#!/usr/bin/env node
// MCP server: lets an agent find and fetch a DESIGN.md without a human leaving
// the editor. Section 9's P1 criterion, second half.
//
// It talks to the same public endpoints the CLI does — /r/index.json and
// /r/<slug>/DESIGN.md — rather than reading the repository, so it works against
// a deployed registry from anywhere and there is exactly one contract to keep.

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { SITE, rawUrl, indexUrl, systemUrl } from './lib/site.mjs';
import { validateDesignMd } from './lib/validate.mjs';

const REGISTRY = (process.env.SPECIMEN_REGISTRY || SITE).replace(/\/+$/, '');
const INDEX_TTL_MS = 5 * 60 * 1000;

let cached = null;

/** The catalog, cached briefly. An agent searching three times in a row should
 *  not fetch three times, and the data changes at the speed of a git push. */
async function catalog() {
  if (cached && Date.now() - cached.at < INDEX_TTL_MS) return cached.data;
  const res = await fetch(indexUrl(REGISTRY));
  if (!res.ok) throw new Error(`Registry returned ${res.status} for ${indexUrl(REGISTRY)}`);
  const data = await res.json();
  cached = { at: Date.now(), data };
  return data;
}

const text = value => ({ content: [{ type: 'text', text: value }] });
const failure = message => ({ content: [{ type: 'text', text: message }], isError: true });

const describe = s => [
  `${s.slug} — ${s.name}`,
  s.description ? `  ${s.description}` : null,
  `  brand: ${s.brand}  ·  ${s.polarity ?? 'unknown'}${s.supportsDark ? ' (also ships dark)' : ''}`
    + `  ·  ${s.shape ?? '?'}  ·  ${s.hue ?? '?'} accent  ·  body ${s.bodyContrast ?? '?'}:1`,
  `  palette: ${s.palette.filter(Boolean).join(' ')}`,
  `  verified ${String(s.capturedAt).slice(0, 10)} against ${s.source}`,
  // Built from THIS server's registry, not the canonical URL baked into the
  // catalog: pointing an agent at the published domain while it is talking to a
  // local or self-hosted registry hands it a URL it cannot fetch.
  `  raw: ${rawUrl(s.slug, REGISTRY)}`,
].filter(Boolean).join('\n');

const server = new McpServer({ name: 'specimen', version: '0.1.0' });

server.registerTool('search_designs', {
  title: 'Search design systems',
  description:
    'Find a verified DESIGN.md in the Specimen registry. Every entry was extracted '
    + 'from the live site by a headless browser and carries the date it was verified. '
    + 'Filter by free text, by light/dark polarity, or by whether the system ships a '
    + 'dark palette. Returns slugs to pass to get_design.',
  inputSchema: {
    query: z.string().optional().describe('Free text matched against slug, name, brand and description'),
    polarity: z.enum(['light', 'dark']).optional().describe('The polarity of the default palette'),
    supportsDark: z.boolean().optional().describe('Only systems that respond to prefers-color-scheme'),
    shape: z.enum(['sharp', 'rounded', 'pill']).optional()
      .describe('Corner treatment: sharp means no radius anywhere'),
    hue: z.string().optional()
      .describe('Hue family of the accent — neutral, red, orange, yellow, green, teal, blue, purple, pink'),
  },
}, async ({ query, polarity, supportsDark, shape, hue }) => {
  let data;
  try {
    data = await catalog();
  } catch (err) {
    return failure(`Could not reach the Specimen registry at ${REGISTRY}: ${err.message}`);
  }

  const q = query?.trim().toLowerCase();
  const hits = data.systems.filter(s => {
    if (polarity && s.polarity !== polarity) return false;
    if (supportsDark === true && !s.supportsDark) return false;
    if (shape && s.shape !== shape) return false;
    if (hue && s.hue !== hue) return false;
    if (!q) return true;
    return [s.slug, s.name, s.brand, s.description].filter(Boolean)
      .some(f => String(f).toLowerCase().includes(q));
  });

  if (!hits.length) {
    // Say what was searched, so the agent can widen rather than conclude the
    // registry is empty.
    return text(`No system matches${q ? ` "${query}"` : ''}`
      + `${polarity ? ` with ${polarity} polarity` : ''}`
      + `${shape ? ` and ${shape} corners` : ''}. `
      + `The registry currently carries ${data.count}: `
      + `${data.systems.map(s => s.slug).join(', ')}.`);
  }

  return text([
    `${hits.length} of ${data.count} systems:`,
    '',
    hits.map(describe).join('\n\n'),
    '',
    'Pass a slug to get_design to retrieve the file.',
  ].join('\n'));
});

server.registerTool('get_design', {
  title: 'Get a DESIGN.md',
  description:
    'Fetch one system\'s DESIGN.md verbatim, ready to write into a repository as '
    + 'DESIGN.md and follow for all UI work. The file carries its own provenance '
    + 'block: when it was captured, from which URL, and by which pipeline version.',
  inputSchema: {
    slug: z.string().describe('System slug, e.g. "stripe" — from search_designs'),
  },
}, async ({ slug }) => {
  const url = rawUrl(slug, REGISTRY);
  let res;
  try {
    res = await fetch(url);
  } catch (err) {
    return failure(`Could not reach the Specimen registry at ${REGISTRY}: ${err.message}`);
  }
  if (res.status === 404) {
    return failure(`No system called "${slug}". Use search_designs to see what exists.`);
  }
  if (!res.ok) return failure(`Registry returned ${res.status} for ${url}`);

  const body = await res.text();
  // Same check the CLI makes before writing: this is the last point before the
  // file reaches an agent, and a malformed one would be followed as if it were
  // sound. The registry should never serve one; that is not a reason to assume.
  const verdict = validateDesignMd(body);
  if (!verdict.ok) {
    return failure(`${url} is not a conformant DESIGN.md and was not returned:\n`
      + verdict.errors.map(e => `  - ${e}`).join('\n'));
  }

  // Returned verbatim, so writing it to disk reproduces the registry's file
  // byte for byte. Provenance is already inside its frontmatter; a preamble
  // here would end up written into the repository as part of the file.
  return text(body);
});

const transport = new StdioServerTransport();
await server.connect(transport);
