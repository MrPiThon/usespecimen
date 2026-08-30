import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { readCapture } from '../lib/system-files.mjs';
import { facetsFor } from '../lib/facets.mjs';

// https://llmstxt.org — a plain-text index written for a model rather than a
// crawler. Every other registry in this category is built to be browsed by a
// person and scraped by a bot; ours is built to be read by an agent, so it
// should say so in the one file agents are starting to look for.
//
// Deliberately an index, not a dump. An agent choosing a system needs the
// catalogue and the fetch URL; one that has chosen fetches the file itself at
// /r/<slug>/DESIGN.md. Inlining 23 files here would be ~200KB of context spent
// before a decision is even made.

const line = (s: string) => s.replace(/\s+/g, ' ').trim();

export const GET: APIRoute = async ({ site }) => {
  const url = (p: string) => new URL(p, site).href;
  const systems = await getCollection('systems');

  const rows = await Promise.all(systems
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(async (entry) => {
      const capture = await readCapture(entry.id);
      const f = facetsFor(capture);
      const d = entry.data;
      // The facets an agent would actually filter on, in the order it would ask
      // about them: what it looks like, then what it is for.
      const traits = [
        f?.polarity,
        capture?.supportsDark ? 'ships dark' : null,
        f?.shade ? `${f.shade} accent` : null,
        f?.shape,
        d.layout?.sectionMedia === 'none' ? 'no imagery' : d.layout?.sectionMedia,
        d.motion ? `motion ${d.motion.duration}` : 'no motion',
        ...(d.categories ?? []),
      ].filter(Boolean).join(', ');
      return `- [${d.name}](${url(`/r/${entry.id}/DESIGN.md`)}): ${line(d.description ?? '')} `
        + `Measured from ${d.provenance.source} on `
        + `${d.provenance.capturedAt.toISOString().slice(0, 10)}. ${traits}.`;
    }));

  const body = `# Specimen

> A registry of verified DESIGN.md files — machine-readable design-system briefs
> you can hand to a coding agent so the UI it generates matches a chosen visual
> language. Every token was measured from the live site by a headless browser
> using getComputedStyle, then dated, spec-linted and contrast-audited. No value
> in any file was written by a model.

DESIGN.md is a format from Google Labs (google-labs-code/design.md, alpha):
optional YAML frontmatter carrying tokens, then eight markdown sections in a
fixed order — Overview, Colors, Typography, Layout, Elevation & Depth, Shapes,
Components, Do's and Don'ts.

## How to use a file

Fetch the raw file and write it to DESIGN.md at the root of the repository you
are working in, then follow it for all UI work. The files are served as plain
text with permissive CORS and are byte-identical to what is in the repository.

    curl -O ${url('/r/stripe/DESIGN.md')}

Or, with the CLI: \`npx specimen add stripe\`. An MCP server is also available
(\`search_designs\` and \`get_design\`); see ${url('/mcp')}.

## What is in a file, and what is not

Measured: colours by role and as ordered ramps, gradient stops, typography
(family, size, weight, leading, tracking, and a scale), radii, spacing steps,
shadows, component boxes, interaction states, the content measure, section
rhythm and composition, nav height and behaviour, hero proportions, background
gradients and tiled patterns, and transition timing.

Not measured, and deliberately absent: section order, page composition, how many
sections a page should have, imagery, and copy. A DESIGN.md here describes a
design *language*, not a wireframe of one page — it is meant to transfer to a
page the source site does not have. Each file's Do's and Don'ts closes by naming
what it does not constrain.

Where a measurement could not be made it is omitted with a warning rather than
guessed, and the warnings are published alongside the file. An omission is an
instruction: a file with no elevation group describes a design where nothing
floats, not one waiting for a default shadow.

Every file ends with a shared block called the Base, generated from one template
and marked in the source with an HTML comment. It states what that file's whole
budget is — how many colours, radii, steps, weights, shadows and curves you were
actually given — and lists the defaults a language model reaches for when a file
is silent: the uppercase eyebrow over a headline, the three feature cards, the
violet gradient, the glass panel on every surface. None of those is in a file
here unless it was measured on the source page.

## Catalogue (${rows.length} systems)

${rows.join('\n')}

## Machine endpoints

- [Catalogue as JSON](${url('/r/index.json')}): every system with its facets, accent, contrast and raw URL.
- [Raw file](${url('/r/{slug}/DESIGN.md')}): plain text, CORS-open, permanent.
- [Validator](${url('/validate')}): paste a DESIGN.md and get the same spec lint and contrast audit the build runs.

## Pages

- [The spec](${url('/spec')}): the DESIGN.md format, section order and token groups.
- [CLI](${url('/cli')}): \`specimen add\`, \`specimen list\`.
- [MCP server](${url('/mcp')}): for agents that fetch without a shell.
- [About](${url('/about')}): method, provenance, trademarks and removal.
- [Submit](${url('/submit')}): corrections and new systems.
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
    },
  });
};
