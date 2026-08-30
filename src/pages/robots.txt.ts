import type { APIRoute } from 'astro';

// Agents are the audience, not a nuisance to be rate-limited. Everything here is
// public, dated and meant to be fetched — so this file exists to say "yes" in
// the place crawlers look, and to point at the two indexes worth reading.

export const GET: APIRoute = ({ site }) => {
  const url = (p: string) => new URL(p, site).href;
  const body = `# Everything on this site is public and meant to be fetched.
# The registry is built for coding agents; crawling it is the intended use.

User-agent: *
Allow: /

# The machine-readable entry points, for anything that would rather not parse
# HTML: a plain-text index for models, and the same catalogue as JSON.
# llms.txt: ${url('/llms.txt')}

Sitemap: ${url('/sitemap.xml')}
`;
  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
