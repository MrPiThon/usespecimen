import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { readCapture } from '../../lib/system-files.mjs';
import { facetsFor } from '../../lib/facets.mjs';

// The machine-readable catalog. `specimen list` reads it, the MCP server will
// too, and it is deliberately small — enough to choose a system without
// fetching every file, and nothing that would go stale faster than the files do.
export const GET: APIRoute = async ({ site }) => {
  const systems = await getCollection('systems');
  const rows = await Promise.all(systems
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(async (entry) => {
      const capture = await readCapture(entry.id);
      const facets = facetsFor(capture);
      const colors = entry.data.colors ?? {};
      return {
        slug: entry.id,
        name: entry.data.name,
        description: entry.data.description ?? null,
        brand: entry.data.provenance.brand,
        source: entry.data.provenance.source,
        capturedAt: entry.data.provenance.capturedAt.toISOString(),
        // Facets, straight off the token data — the point of extracting it.
        // Identical to what /systems filters on, so a client and a human are
        // shopping the same catalogue.
        polarity: facets?.polarity ?? null,
        supportsDark: Boolean(capture?.supportsDark),
        shape: facets?.shape ?? null,
        hue: facets?.hue ?? null,
        shade: facets?.shade ?? null,
        accent: facets?.accent ?? null,
        categories: entry.data.categories ?? [],
        contrast: facets?.contrast ?? null,
        bodyContrast: facets?.ratio ?? null,
        palette: ['background', 'foreground', 'primary'].map(k => colors[k] ?? null),
        raw: new URL(`/r/${entry.id}/DESIGN.md`, site).href,
        page: new URL(`/systems/${entry.id}`, site).href,
      };
    }));

  return new Response(`${JSON.stringify({ count: rows.length, systems: rows }, null, 2)}\n`, {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
