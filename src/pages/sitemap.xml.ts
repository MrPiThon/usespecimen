import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

// Hand-rolled rather than pulling in @astrojs/sitemap, for the same reason the
// other endpoints are: the route list is nine static pages plus one per system,
// and `lastmod` should be the date the system was actually re-captured rather
// than the date the site happened to build.

const STATIC = ['/', '/systems', '/compare', '/spec', '/validate', '/cli', '/mcp', '/about', '/submit'];

export const GET: APIRoute = async ({ site }) => {
  const url = (p: string) => new URL(p, site).href;
  const systems = await getCollection('systems');

  const entries = [
    ...STATIC.map(p => ({ loc: url(p), lastmod: null as string | null })),
    ...systems
      .sort((a, b) => a.id.localeCompare(b.id))
      .map(entry => ({
        loc: url(`/systems/${entry.id}`),
        // The capture date is the only honest lastmod: it is when the content
        // of the page actually changed.
        lastmod: entry.data.provenance.capturedAt.toISOString().slice(0, 10),
      })),
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.map(e => `  <url>
    <loc>${e.loc}</loc>${e.lastmod ? `\n    <lastmod>${e.lastmod}</lastmod>` : ''}
  </url>`).join('\n')}
</urlset>
`;

  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
