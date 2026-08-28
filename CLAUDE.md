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
npx playwright install chromium               # one-time; already present on this machine
npm run extract -- https://stripe.com         # → out/stripe/capture.json
npm run cluster -- out/stripe/capture.json    # re-cluster offline, no browser
```

- Node 24, ESM only. Every source file is `.mjs` and `package.json` sets
  `"type": "module"`.
- `extract` accepts several urls at once; one failure doesn't abort the rest and
  the exit code is non-zero if any failed. `--json` prints the token set on
  stdout while progress goes to stderr, so it pipes. `--slug` overrides the
  derived directory name (`www.gov.uk` would otherwise give `gov`), `--viewport
  WxH` the crawl size. `node src/cli.mjs --help` for the rest.
- **No test runner is configured.** Verification to date is running `extract`
  against real sites and reading the summary against the live design.
- **`out/` is gitignored**, and this is not yet a git repo (`git init` is
  pending) even though the plan treats git as the source of truth.
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
   `lineHeight: normal` and `letterSpacing: normal` never appear at all.
2. `spacings` is **count-only**; its `area` and `chars` are always 0, because the
   call site passes `{count: 1}` as the weights object.
3. Above 6000 elements the walk strides. Counts are a **sample, not a census** —
   compare weights against each other, never against `elementCount`.
4. `radii` is gated on `borderRadius !== '0px'` but keyed on
   `borderTopLeftRadius`, so asymmetric radii record only one corner.

### `src/extract/color.mjs` — the math

Pure functions, no I/O. Signature conventions are not uniform, so check before
calling:

- Most functions take `{r, g, b, a}` with **0-255** channels — `flatten`,
  `toOklab`, `toOklch`, `deltaE`, `relativeLuminance`, `contrastRatio`, `toHex`.
- `hueFamily` is the exception: it takes an **OKLCH** `{C, h}`, so pipe through
  `toOklch` first.
- `deltaE` converts sRGB→OKLab internally. Pass it RGB, not OKLab.
- `contrastRatio(fg, bg)` flattens `fg` over `bg` itself, so `bg` must already be
  opaque.
- `parseColor` handles `rgb()/rgba()`, 3/4/6/8-digit hex, and `color(srgb ...)`.
  It returns `null` for everything else — gradients, `currentColor`, and named
  colors like `red` are **not** handled, so null-check every parse.

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
- **primary** — highest-weight chromatic cluster in `interactiveBg`, falling back
  to interactive then body text; the emitted `source` says which.
- **border** — top border cluster by count, not area.

The tuning constants at the top of the file were each derived from a measured
failure on a real site, not chosen a priori: `MUTED_MAX_CHROMA` at 0.08 sits
between observed muted greys (0.015–0.046) and observed link blues (0.125+), and
`GRID_CANDIDATES` excludes 2 because every even value divides by it, so it wins
whenever nothing else fits. Changing them without re-running the reference sites
is how the palette quietly regresses.

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

Not built: the Astro site, the spec linter, the DESIGN.md authoring step, tests,
git history.

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
