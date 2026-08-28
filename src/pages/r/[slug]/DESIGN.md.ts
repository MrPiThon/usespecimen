import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { readDesignFile } from '../../../lib/system-files.mjs';

// The URL people paste into an agent prompt. Permanent, plain text, no gate.
// Emitted as a literal /r/<slug>/DESIGN.md file; the CORS and content-type
// headers are applied by the host via public/_headers, because a static build
// discards Response headers.
export async function getStaticPaths() {
  const systems = await getCollection('systems');
  return systems.map((entry) => ({ params: { slug: entry.id } }));
}

export const GET: APIRoute = async ({ params }) =>
  new Response(await readDesignFile(params.slug!), {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
