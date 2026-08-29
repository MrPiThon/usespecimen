// The hostname, in exactly one place.
//
// Both the Astro config and the CLI read it from here, so moving to the real
// domain is this line plus 301s. The path structure below is fixed from day one
// for the same reason — a domain move must never become a link migration.

export const SITE = 'https://specimen.coursey.website';

/** Permanent, CORS-open, plain text. The URL people paste into agent prompts. */
export const rawUrl = (slug, origin = SITE) => `${origin}/r/${slug}/DESIGN.md`;

/** Machine-readable catalog, for the CLI and later the MCP server. */
export const indexUrl = (origin = SITE) => `${origin}/r/index.json`;

export const systemUrl = (slug, origin = SITE) => `${origin}/systems/${slug}`;
