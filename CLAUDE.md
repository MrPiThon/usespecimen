# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Read `docs/PLAN.md` for the full strategy, competitive teardown, and phasing.
This file is the orientation: what this is, how to run it, and what not to waste
time on.

## What we're building

A registry of **DESIGN.md** files — machine-readable design-system briefs that
AI coding agents drop into a repo so generated UI matches a chosen visual
language. DESIGN.md is a real format spec from Google Labs
(`google-labs-code/design.md`, currently `alpha`).

The category already exists (getdesign.md, designmd.app, designmd.co) and is
entirely made of **directories** — browse-and-copy sites with SEO pages. The
incumbent, getdesign.md, lists 551 catalog entries while only 74 DESIGN.md
files exist publicly in its MIT-licensed upstream repo, and its detail pages do
not contain the file they are about: no content, no copy button, no download,
no link to the repo.

**Our wedge is not a bigger catalog. It is verification and delivery.** Tokens
extracted by a real crawler from the live site, dated, spec-linted,
contrast-audited, previewed as rendered proof, and installable with one
command. That is the one claim a competitor cannot get by scraping us.

Corollary, and it is the load-bearing rule of this codebase: **never let an LLM
invent a hex code.** Colors come from `getComputedStyle`; the model only writes
prose *about* values it was handed.

## Commands

```bash
npm install
npm run dev                                   # Astro dev server on :4321
npm run build                                 # static build to dist/
```

```bash
npm run list -- --registry http://localhost:4321    # catalog (needs a running site)
npm run add -- stripe --registry http://localhost:4321
npm run mcp                                         # MCP server on stdio
```

```bash
npx playwright install chromium               # one-time; already present on this machine
npm run extract -- https://stripe.com         # → out/stripe/capture.json
npm run cluster -- out/stripe/capture.json    # re-cluster offline, no browser
npm run author -- stripe --name "Indigo Infrastructure"   # capture -> content/
```

- Node 24, ESM only; extractor sources are `.mjs`, and `package.json` sets
  `"type": "module"`.
- **`npm run build` fails if any DESIGN.md breaks the spec** — wrong section
  order, a duplicate heading, or a `{token.reference}` that resolves to nothing.
  That is deliberate and it is the product claim; don't route around it by
  loosening the schema when a file fails.
- Playwright is a **devDependency**. The ingestion pipeline is never part of the
  web app, so the site build must never import from `src/extract/`. Genuinely
  shared, dependency-free code belongs in `src/lib/` — that is why `color.mjs`
  lives there and `cluster.mjs` imports it as `../lib/color.mjs`.
- `extract` sweeps **1440 / 768 / 390 under light and dark** — six harvests per
  site. Widths merge per scheme (`src/extract/merge.mjs`), schemes cluster
  separately. `--viewport WxH` pins a single width, `--light-only` skips the dark
  pass; both make a run roughly 6x faster when iterating.
- `extract` accepts several urls at once; one failure doesn't abort the rest and
  the exit code is non-zero if any failed. `--json` prints the token set on
  stdout while progress goes to stderr, so it pipes. `--slug` overrides the
  derived directory name (`www.gov.uk` would otherwise give `gov`), `--viewport
  WxH` the crawl size. `node src/cli.mjs --help` for the rest.
- **No test runner is configured.** Verification to date is running `extract`
  against real sites and reading the summary against the live design.
- **`out/` is gitignored.** Captures only enter the repo when copied into
  `content/systems/<slug>/`. `main` pushes to `MrPiThon/usespecimen`, and CI runs
  the build plus a raw-file identity check on every push and PR.
- `author` writes `content/systems/<slug>/` and **refuses to overwrite** an
  existing DESIGN.md without `--force`, because the prose in it is the one part
  no command can regenerate. It re-clusters from the stored harvest rather than
  trusting the capture's tokens, and validates its own output against the build's
  linter before writing — a scaffold that could not ship would be a bug in
  `author.mjs`, not a file to fix by hand. Use `--from` when the capture
  directory and the published slug differ (`www.gov.uk` extracts to `gov`).
- To iterate on clustering without launching Playwright, paste the body of
  `harvestFn` into a browser console on any target page. `cluster` takes that
  bare dump as well as a full `capture.json`.

## Architecture

Six stages, each runnable alone. Stages 1–3 are deterministic; the model in
stage 4 never sees a site, only a token set:

```
capture  →  extract  →  cluster  →  author  →  audit  →  review
Playwright  computed   collapse    model      spec      human PR
light/dark  styles     into a      writes     lint +    + capture
3 widths    harvested  token       the 8      contrast  date and
            across DOM scale       sections   check     method
```

The whole pipeline is a Node CLI that runs offline in CI and writes files. It is
**never** part of the web app.

### The site — Astro 7, static

Note the version: PLAN.md says Astro 6, but the registry serves **7.2.9**. The
Content Layer API is unchanged from 5 (`glob` from `astro/loaders`,
`defineCollection`/`render` from `astro:content`).

- `content/systems/<slug>/` holds `DESIGN.md`, `capture.json` and `source.webp`
  (plus `source-dark.webp` where the site has a dark scheme). The shots are
  referenced from frontmatter via Astro's `image()` schema helper, so the asset
  pipeline emits responsive variants and there is no second copy under `public/`. The directory
  name is the slug, so `/systems/stripe` and `specimen add stripe` line up.
- `src/content.config.ts` is where validation lives. The Zod schema mirrors the
  Google spec and adds a **required** `provenance` block — an undated file is
  precisely what the incumbent ships, so the schema refuses one.
- `src/lib/design-md.mjs` is the spec linter: section order, duplicates, and
  `{token.reference}` resolution. Deliberately framework-free so `/validate` and
  the CLI can share it. It normalises smart quotes, which matters because
  Markdown rendering turns `Do's and Don'ts` into a curly apostrophe.
- The detail page **throws** on lint errors, which fails the build. Contrast
  failures do not: non-text pairs below 3:1 are near-universal on real sites
  (four of four reference captures), so those are reported, not disqualifying.
- `src/lib/facets.mjs` derives the catalogue facets — polarity, shape, accent
  hue, contrast band — from a capture. It is the single definition behind
  `/systems`, `/r/index.json` and MCP `search_designs`, so the three cannot
  disagree about what a system is. Facets are measured, never hand-tagged.
- `src/lib/validate.mjs` powers `/validate`, and reuses the build's own linter
  plus the YAML parser Astro's content layer uses. That is deliberate: a
  validator that disagreed with the build would be worse than none, since the
  offer is "paste your file and learn whether it would ship". Contrast is audited
  only on pairs the file's own naming makes identifiable — `background`/`canvas`,
  `foreground`/`ink`, `on-x`/`xForeground` — and everything it could not pair is
  listed, because silently checking nothing looks exactly like silently passing.
- `src/lib/preview.mjs` + `src/components/Preview.astro` render real components
  from one file's tokens. The rule that makes it worth anything: a custom
  property is set **only** where the file declares the token — nothing is filled
  in, so a thin file renders visibly plain. Absent borders draw dashed, and
  `previewGaps()` lists what the preview had to supply so a viewer never reads a
  CSS default as an extracted value. For the dark scheme, `dark-*` tokens are
  promoted over their base names *before* resolving `{colors.primary}`-style
  references, or component tokens resolve to the light accent while the dark
  preview renders.
- `src/lib/system-files.mjs` reads `DESIGN.md` from disk rather than using
  `entry.body`, because the Content Layer strips frontmatter and the file people
  paste into an agent is the whole thing. Verified byte-identical at
  `/r/<slug>/DESIGN.md`.
- **Host config is duplicated and not portable.** A static build discards the
  `Response` headers set in an endpoint, so the `/r/*` CORS and content-type
  contract lives in host config — and every host spells it differently. We
  deploy on **Vercel**, so `vercel.json` is the live one; `public/_headers` is
  the Cloudflare/Netlify form, kept only against a move. Change one, change both,
  and remember `_headers` is inert on Vercel rather than merely redundant.
- `vercel.json` also sets `cleanUrls`. Astro's `build.format: 'file'` emits
  `about.html`, which Vercel will not serve at `/about` without it — every nav
  link 404s in production while working perfectly in `astro dev`.
- The hostname is in `src/lib/site.mjs` and nowhere else — the CLI needs it too,
  so it cannot live in `astro.config.mjs`, which imports it. Site code still
  derives URLs from `Astro.site`.
- `add`/`list` talk to the published site by default; `--registry <origin>`
  points them at a local `astro preview` for testing. The MCP server
  (`src/mcp.mjs`) uses the same endpoints and reads `SPECIMEN_REGISTRY` from the
  environment, because an MCP client gives it no argv.
- The MCP server fetches over HTTP rather than reading `content/` — one contract,
  and it then works against a deployed registry from any machine. `get_design`
  returns the file **verbatim** so writing it to disk reproduces the registry's
  bytes; a provenance preamble would end up inside the repository's DESIGN.md.

### `src/extract/harvest.mjs` — runs inside the page

`harvestFn` is stringified and injected by `page.evaluate()`. It must stay
**entirely self-contained**: no imports, no closure over module scope. Adding an
import breaks it at runtime inside the browser rather than at build time, so the
failure surfaces far from its cause.

It returns aggregate maps keyed by **raw CSS value strings**, not parsed values:

```js
{ textColors: { 'rgb(26, 26, 26)': { count, area, chars }, ... }, ... }
```

Weight semantics, which the clusterer depends on:

- `area` — visible px² of the element's bounding box.
- `chars` — **direct** child text nodes only, so a wrapper div never gets credit
  for its subtree's text. This is what makes body-text color identifiable.
- Headings (`h1`–`h6`) and interactive elements (`button`/`a`/`role=button`,
  area > 200) are tracked separately. **The accent color lives in
  `interactiveBg`**, not in the general `bgColors` histogram.

Four gotchas that will silently skew a clusterer:

1. `bump()` drops keys that are empty, `'none'`, or `'normal'` — so
   `lineHeight: normal` and `letterSpacing: normal` never appear in the
   per-property maps. They survive in `typeStyles`, where `normal` sits inside a
   joined key rather than being the key.
2. `spacings` is **count-only**; its `area` and `chars` are always 0, because the
   call site passes `{count: 1}` as the weights object.
3. Above 6000 elements the walk strides. Counts are a **sample, not a census** —
   compare weights against each other, never against `elementCount`.
4. `radii` is gated on `borderRadius !== '0px'` but keyed on
   `borderTopLeftRadius`, so asymmetric radii record only one corner.

`componentBoxes` (harvest v4) records padding, border width, radius and gap per
interactive element, bundled. Selection prefers a bundle with real padding over
the most common one, because `<a>` and `<button>` are frequently bare wrappers
around whatever carries the styling — the commonest bundle is usually all
defaults and describes nothing. `dominantUnstyled` records when that happened.

`states` (harvest v3) is read from `document.styleSheets`, not from computed
style, which only ever reports the resting value. Each state rule is matched back
against the DOM so its role name comes from a real element, `var()` references are
resolved against a matched element, and declarations are bundled **one key per
rule**. `styleSheets.{readable,blocked}` is load-bearing: a site whose CSS is all
cross-origin (Stripe: 0 of 8) must not read the same as one that declares no
states.

`typeStyles` (harvest v2) is the exception to the one-property-per-map rule: it
keys on `kind|size|weight|lineHeight|tracking|family` so type properties that
**co-occur** stay together. The other histograms cannot be recombined — knowing a
page uses 16px and weight 600 says nothing about whether 16px is ever bold — so
any typography role built from them is a combination that may never have existed.
Family is last in the key because a font stack can contain `|`.

### `src/extract/screenshot.mjs` — proof shots

WebP, **not** the AVIF the plan originally named. Chromium cannot encode AVIF:
`canvas.toBlob(cb, 'image/avif')` silently hands back a PNG whose `blob.type`
reads `"image/png"`, so the obvious implementation writes PNG bytes into a
`.avif` file and nothing complains. The encoder checks `blob.type` and returns
null rather than falling back — an extension that lies about its contents is
worse than a missing file. Encoding real AVIF would need a native dependency in
a pipeline that otherwise only needs the browser.

### `src/extract/merge.mjs` — one harvest per scheme

Sums only the value histograms across viewport widths. Everything else comes from
the primary (widest) capture, for a specific reason: `document.styleSheets` does
not change with viewport, so the state rules are identical at every width and
summing them would triple their counts while adding nothing.

Accepts a known bias: `area` weights scale with the viewport, so the widest
capture dominates any area-ranked role. That is the right default — the widest
layout is canonical — but a mobile-only surface can be out-weighed by the same
element at desktop.

### `src/lib/color.mjs` — the math

Lives in `src/lib/`, not `src/extract/`, because both the pipeline and the site
need it and it has no dependencies at all. That is the shape of the rule: the
site must never import from `src/extract/` (which would drag in the browser
driver), so anything genuinely shared moves here rather than reaching across the
boundary.

Pure functions, no I/O. Signature conventions are not uniform, so check before
calling:

- Most functions take `{r, g, b, a}` with **0-255** channels — `flatten`,
  `toOklab`, `toOklch`, `deltaE`, `relativeLuminance`, `contrastRatio`, `toHex`.
- `hueFamily` is the exception: it takes an **OKLCH** `{C, h}`, so pipe through
  `toOklch` first. Its bands are OKLCH hue angles, which are *not* the HSL angles
  they resemble — pure red is 29 degrees, not 0. An HSL-shaped table labels every
  red "orange", which is what the original did.
- `deltaE` converts sRGB→OKLab internally. Pass it RGB, not OKLab.
- `contrastRatio(fg, bg)` flattens `fg` over `bg` itself, so `bg` must already be
  opaque.
- `parseColor` handles `rgb()/rgba()`, `hsl()/hsla()` (with `deg` and
  slash-alpha), 3/4/6/8-digit hex, and `color(srgb ...)`. It returns `null` for
  everything else — gradients, `currentColor`, and named colors like `red` are
  **not** handled, so null-check every parse. hsl matters more than it looks:
  computed style rarely emits it, but authored stylesheet rules are full of it.

Because harvest emits raw strings including translucent ones, the clusterer must
`parseColor` and then `flatten` against the effective backdrop (`out.pageBg`)
before any comparison. Skip the flatten and visually identical colors won't
group.

### `src/extract/cluster.mjs` — histograms → token scale

Two invariants: every emitted value is one that was **observed** (a cluster is
represented by its heaviest member, never an average — an averaged hex is an
invented hex), and a token that can't be observed is **omitted with a warning**
rather than guessed.

Role assignment is deliberately not "the most common value", and the difference
is what makes the palette recognisable:

- **foreground** — highest-contrast *significant* text cluster, not the most
  numerous. On Stripe the secondary grey out-types the real navy body color, so
  ranking by character count swaps foreground and muted.
- **mutedForeground** — heaviest cluster that is meaningfully quieter than body
  text (≤0.6× its contrast), still legible (≥3:1) and desaturated (chroma
  <0.08). Without the chroma bound this returns the link color.
- **card** — a surface near the background in lightness that the site never fills
  buttons with. Without both guards it returns the brightest CTA on the page.
- **primary** — highest-weight chromatic cluster in `interactiveBg` (it must
  recur), then chromatic colours found in box-shadows both resting *and* in
  `:focus-visible`/`:hover` state rules, then interactive text, then body text.
  The emitted `source` says which, and `via` names the state for ring accents.
  A restrained system keeps its brand colour in the focus ring and nowhere else —
  that is where both Linear's and Vercel's accents come from.
- **border** — top border cluster by count, not area.

`typography.roles` is built from those bundles. `body` is the style that sets the
most prose — filtered above 20 chars/element to drop nav and label chrome, then
ranked by total characters to drop display type. Neither measure works alone, and
ranking by total characters (the old behaviour) gave Linear its 13px chrome size.

`colors.semantic` reads success/danger/warning from tinted panels, taking the
**declared** colour rather than the composited one — a 7% green wash declares
`#27a644`, and that is the token. Candidates are ranked by how many properties
they paint before how often: a real state style colours a surface and its edge.

Alongside the colour roles, `colors.ramps` carries ordered ladders: `text` by contrast
descending, `surface` by lightness distance from the canvas. They answer a
different question from the roles — "what are the tiers" rather than "what is the
body colour" — so `card` (the most-used surface, area-ranked) and `surface-1`
(the nearest step, distance-ranked) can legitimately differ. Ramp membership is
gated on **area share**, not chroma: real surfaces sit near 9% and 0.4% of
painted background area while semantic overlays sit near 0.1%, and a chroma cut
would wrongly reject deliberately tinted surfaces like Stripe's `#e5edf5`.

The tuning constants at the top of the file were each derived from a measured
failure on a real site, not chosen a priori:

- `COLOR_MERGE` 0.045 for **text and interactive** — Stripe's navy variants sit
  0.0424 apart and must merge, its grey tiers 0.0669 apart and must not.
- `SURFACE_MERGE` 0.015 for **backgrounds and borders**. Surfaces step by
  0.018–0.034 in both light and dark, so the coarse threshold swallowed them.
  One threshold cannot serve both roles; that mistake published a translucent
  red danger overlay as Linear's card surface.
- `MIN_ACCENT_COUNT` 2 — a brand accent recurs. A single large fill is a promo
  panel, which is how a yellow banner once became Linear's brand colour.
- `MUTED_MAX_CHROMA` 0.08 sits between observed muted greys (0.015–0.046) and
  observed link blues (0.125+).
- `GRID_CANDIDATES` excludes 2, because every even value divides by it and it
  wins whenever nothing else fits.

Changing any of them without re-running the reference sites is how the palette
quietly regresses.

Every one of them is also a **boundary a measurement can land on**. GOV.UK sits
1.1% under `GRID_THRESHOLD`, and a ~2% wobble between captures once flipped its
`spacing.base` from 5px to null on an unchanged page. `cluster(harvest,
{ previous })` therefore applies hysteresis inside a 5% dead band, and records
every near-boundary decision in `stability.notes`. Pass `previous` from any path
that re-clusters, or drift monitoring will report noise as change. Bump `clusterVersion` when you do — drift diffs are only
meaningful within one version.

Output is deterministic and carries `harvestVersion` + `clusterVersion`, so a
drift diff can tell a redesign from a pipeline change. That is the schema
groundwork for Phase 2 re-capture.

## Identity

| Thing | Value |
|---|---|
| Product name | Specimen |
| npm scope | `@usespecimen` (the bare `specimen` org name was taken) |
| GitHub org | `usespecimen` |
| Site (for now) | `specimen.coursey.website` — Cloudflare, upgrade domain later |
| CLI binary | `specimen` — via `bin` in `@usespecimen/cli`, independent of package name |

A dispute is worth filing with npm support for the unscoped `specimen` package
(dead since 2013, v0.2.0). If it lands, `npx specimen add stripe` works with no
scope, which is the version that belongs on the homepage.

Keep the hostname in exactly one config value. Path structure is fixed from day
one so a domain move is a config change plus 301s:
`/systems/<slug>` and `/r/<slug>/DESIGN.md`.

## Where it stands

Phase 0. The extractor runs end to end: `extract <url>` crawls, harvests
computed styles, clusters, and writes a dated `capture.json` carrying provenance,
tokens, a contrast audit, explicit warnings, and the raw harvest.

Checked by eye against Stripe, Linear, NN/G and GOV.UK. It recovers GOV.UK's
published `#0b0c0c` / 19px GDS Transport / 5px spacing base and Stripe's navy,
indigo and 4px grid, so the differentiator holds. Known soft spot: `card` on
Linear returns a dark maroon rather than its neutral surface.

The site is scaffolded and builds: `/`, `/systems`, `/systems/<slug>` and the raw
`/r/<slug>/DESIGN.md`, over three seeded systems (stripe, govuk, linear) whose
frontmatter was generated from their captures rather than typed by hand.

Not built: Pagefind and facets, the live component preview, `/validate`,
`/spec`, `/cli`, `/mcp`, `/submit`, `/about`, screenshots (`source.avif`), the
model authoring step, and tests.

## Environment — don't repeat these dead ends

Running the extractor from a cloud sandbox and from the desktop bridge's Linux
VM both failed, for different reasons:

- The Linux VM behind the desktop bridge reaches the npm registry but **cannot
  download Playwright's browsers** — the CDN is off its egress allowlist.
- The cloud sandbox has Chromium preinstalled but its **egress proxy denies
  arbitrary sites** (stripe.com → `ERR_TUNNEL_CONNECTION_FAILED`).

Neither applies on this Windows machine, where Chromium is already installed.

## Decisions already made

- **Astro 6, static output.** Hundreds to thousands of near-static pages; zero
  JS by default. Islands only for search and the theme toggle.
- **Content Layer + Zod** in `src/content.config.ts`, schema mirroring the
  Google spec — a malformed DESIGN.md fails the build. Validation *is* the
  content layer, and that guarantee is what we sell.
- **Git is the source of truth.** One directory per system:
  `content/systems/<slug>/` holding `DESIGN.md`, `capture.json`, `source.avif`.
  Contributions and corrections arrive as PRs; provenance is commit history.
- **Pagefind** for search plus a prebuilt facet index from frontmatter. No
  backend, indexes at build.
- **CSS custom properties, no Tailwind.** We sell design credibility; Tailwind's
  defaults produce the exact look our customers are trying to escape.
- **No auth, no billing, no accounts** until Phase 3.

## The spec (conform to it exactly)

Optional YAML frontmatter carrying tokens, then markdown body. `name` is the
only required field; `version` and `description` optional. Token groups:
`colors`, `typography`, `rounded`, `spacing`, `components`. Token references use
`{path.to.token}` syntax. Duplicate section headings are an error; unknown
sections and properties are preserved with warnings.

The eight `##` sections must appear in this order:

1. Overview
2. Colors
3. Typography
4. Layout
5. Elevation & Depth
6. Shapes
7. Components
8. Do's and Don'ts

Name files for the **aesthetic**, not the company — `name: Indigo
Infrastructure`, not `Stripe`. Keep brand attribution in a separate, clearly
labelled provenance block. The incumbent hedges by corrupting the brand name
inside the file (`name: Stripi-Inspired-design-analysis`), which leaks into the
artifact and tells the agent to build a company that doesn't exist. Better file,
better legal posture.

Seeded files carry an MIT attribution obligation from `awesome-design-md`: keep
an `ATTRIBUTION.md` and a `derived_from` field in every seeded `capture.json`.
Re-verifying against the live site does not by itself clear it.

## Next task

Write `cluster.mjs`, then run it against three sites with genuinely different
design languages and **look at the tokens by eye** against the real site. If the
clustering doesn't produce a palette a designer would recognise, the whole
differentiator is in trouble and we need to know that in week one, not week six.
