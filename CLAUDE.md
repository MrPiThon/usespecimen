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
npm run base                                  # rewrite the Base block in all 23 files
npm run base -- --check                       # verify none has drifted (CI gate)
```

```bash
npx playwright install chromium               # one-time; already present on this machine
npm run extract -- https://stripe.com         # → out/stripe/capture.json
npm run cluster -- out/stripe/capture.json    # re-cluster offline, no browser
npm run author -- stripe --name "Indigo Infrastructure"   # capture -> content/
```

- Node 24, ESM only; extractor sources are `.mjs`, and `package.json` sets
  `"type": "module"`.
- Three gates, all run in CI: `npm run build` (spec), `npm run check` (prose
  against tokens) and `npm run base -- --check` (the shared Base block is
  current in every file).
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
  `--tokens-only` re-anchors the kept body rather than concatenating it:
  `splitFrontmatter` returns everything after the closing delimiter, which for a
  file this command wrote begins with the blank line separating frontmatter from
  prose — so pasting it under another blank line added one on every refresh. The
  Verge had accumulated eleven leading and five trailing blank lines.
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
- `src/lib/categories.mjs` holds the category vocabulary. Categories are the one
  facet that is **declared, not measured** — no crawler can see whether a site is
  e-commerce or a portfolio — so they live in frontmatter and the schema holds
  them to an enum. An unknown id fails the build, which beats a filter that
  quietly fragments across `dev-tools` and `developer-tools`.
- `author --tokens-only` refreshes frontmatter and keeps the prose. Use it after
  any clusterer change: it inherits name, description, categories and brand from
  the existing file, because none of those exist in a capture and a refresh that
  dropped them would silently un-categorise the catalogue.
- `src/lib/colornames.mjs` names a measured accent at two levels: the broad hue
  from `hueFamily`, and a specific shade (emerald, indigo, rose, slate). Matched
  on **hue angle alone**, not nearest deltaE — GOV.UK's dark forest and Shopify's
  bright mint are both unarguably green, and full-distance matching would file
  them apart. Anchors are a classification vocabulary, never emitted as values,
  so the filter stays on the measured side of the line unlike categories.
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
- `src/lib/webfonts.mjs` decides which typefaces the site may render. **Six of
  23 systems render in their real face**, three partly, and fourteen fall back.
  That split is a licensing fact, not a technical one: only Inter, Manrope and
  Geist are OFL, so only those are self-hosted via `@fontsource`. sohne-var,
  Nike Futura ND, Graphik, Lyon Text, ABC Favorit, Airbnb Cereal, figmaSans and
  the rest are commercially licensed, and serving them — self-hosted **or**
  hotlinked from the source CDN — is redistribution we have no right to. GDS
  Transport is licensed for GOV.UK services specifically. Same rule that
  withholds Linear's grain PNG.
  The resolved family is **prepended** to the file's own stack rather than
  replacing it, because fontsource ships `Manrope Variable` where Supabase
  declares `Manrope`.
  The old blanket note ("typefaces are not loaded") was untrue for every Inter
  system, which this site already shipped; `fontNote()` now states per system
  which face is rendering and names the ones it cannot serve.
  Where the real face cannot be served, an **openly-licensed stand-in** is
  rendered and **always labelled** — a dashed badge on the specimen sheet, and
  the caption naming both ("Nike Futura ND (shown in Jost)"). Six systems render
  their real face, 17 are substituted, none fall back to an unnamed system face.
  Stand-ins are chosen for construction, not vibe: Jost is a Futura revival,
  Archivo sits in Söhne/Graphik territory, Public Sans exists because a
  government needed a humanist sans it could license — which is GDS Transport's
  problem exactly.
  **The DESIGN.md tokens are never touched.** A file keeps naming `Nike Futura
  ND`, because that is what an agent needs in order to license the right thing;
  the substitution exists only in this site's rendering.
  getdesign.md does the same swap — Bebas Neue and Inter from Google Fonts,
  placed *ahead* of the real name in the stack — and discloses none of it, so a
  reader there believes they are seeing Nike Futura ND while looking at a
  condensed grotesque. Showing an approximation is fine; not saying so is not.
  Declaring `@font-face` costs only CSS: a browser fetches a woff2 only when a
  family actually renders, so shipping nine faces still downloads one or two.
- `src/components/Specimen.astro` is the token sheet: every value rendered as
  the thing it describes rather than listed in a table. Swatches with contrast,
  the type scale at its measured sizes, radii drawn, shadows cast, spacing as
  bars, the canvas gradient painted, and a control carrying the file's own
  timing. It renders inside the previewed system's `--pv-*` block, so a light
  system stays light on this dark site.
  Contrast is **pair-aware**: `primaryForeground` is scored against `primary`,
  not the canvas, and pass/fail colouring is applied only to tokens that carry
  text — `card` at 1.09:1 is a fact about a surface, not a failure. The site
  styles `strong` with its own near-white `--fg-strong`, which renders invisible
  on a light system, so the sheet resets it to `inherit`.
- The detail page is **tabbed** (Specimen / Preview / Notes / DESIGN.md) rather
  than one long scroll. Without JS the first panel shows and the raw file stays
  reachable at `/r/<slug>/DESIGN.md`, which is linked from the panel.
- A **deliberately sharp** system emits `rounded: { button: '0px' }`. It used to
  emit no `rounded` group at all, which reads as "not measured" rather than
  "measured as zero" — and an agent handed no radius invents one.
- **`colors.sectionFill`** (cluster v19) is the colour a design grounds whole
  sections in, and it is the token that made the previews stop looking alike.
  The surface ramp cannot carry it and correctly refuses to: that ladder is a
  depth sequence of near-canvas neutrals, so it filters out anything chromatic
  **and** anything already claimed as the accent. Wise's lime is both, so 24% of
  its painted background area went unpublished, and its preview rendered as a
  white page with a green button — the one thing Wise does not look like.
  Ranked by area over `bgColors`, not `interactiveBg`, which would only ever
  find the button. `SECTION_FILL_MIN_AREA` is 0.05 and the cut sits in an
  observed gap: wise 21.3%, stripe 12.0%, duolingo 10.9%, shopify 9.5%,
  mailchimp 8.1%, slack 7.5% — then apple 3.9%, govuk 3.6% and everything else
  under 2.5%. The six above the line are exactly the sites built from big
  coloured bands. Seventeen systems get null, and null is the answer: Nike,
  Pentagram and Vercel ground nothing.
  The text on the band is **not** `primaryForeground` — that is the label the
  file pairs with `primary`, and on five of the six those are different colours
  (Stripe's accent is indigo, its fill is navy). `onFill()` picks whichever of
  the file's own declared colours scores the highest contrast against the fill:
  the values are observed, the selection is computed, which is the same move
  `card` and `mutedForeground` already make. Result across the six: 13.05, 17.55,
  4.18, 14.00, 17.44 and 11.34:1.
- `src/lib/preview.mjs` + `src/components/Preview.astro` render real components
  from one file's tokens. The rule that makes it worth anything: a custom
  property is set **only** where the file declares the token — nothing is filled
  in, so a thin file renders visibly plain. Absent borders draw dashed, and
  `previewGaps()` lists what the preview had to supply so a viewer never reads a
  CSS default as an extracted value. For the dark scheme, `dark-*` tokens are
  promoted over their base names *before* resolving `{colors.primary}`-style
  references, or component tokens resolve to the light accent while the dark
  preview renders.
- Proof shots are referenced from frontmatter as `provenance.screenshot`, which
  `author` emits by discovering which files exist in the capture directory
  **before** building the frontmatter. They used to be copied afterwards and
  referenced by nothing: seventeen `source.webp` files existed in the repository
  and not one had ever reached a page.
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
- `parseColor` handles `rgb()/rgba()`, `hsl()/hsla()`, hex, `color(srgb ...)`,
  and the modern spaces `lab()`, `oklab()`, `oklch()` and
  `color(display-p3 ...)`. That last group is not optional: **230 of 233** colour
  values on tailwindcss.com and **9 of 9** on basecamp.com are authored in them,
  and dropping them produced white-on-white rather than no answer. It returns
  `null` for everything else — gradients, `currentColor`, and named colors like `red` are
  **not** handled, so null-check every parse. hsl matters more than it looks:
  computed style rarely emits it, but authored stylesheet rules are full of it.

`COLOR_STOP_RE` also lives here rather than in the clusterer, because the site
needs it too: a file publishes a decorative layer as one gradient string, and
pulling its hairline colour back out is the only way to draw a rule in the same
colour without inventing one. Its `[^()]*` deliberately refuses nested parens,
so a `color-mix()` wrapping other functions is skipped rather than half-matched.

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

## The Base (`npm run base`)

Every measurement in a DESIGN.md says what a design *is*. None of them can say
what not to do, and that gap is where generated UI comes from: handed twelve
colours and a type scale, a model still reaches for its defaults on everything
the file is silent about — the small uppercase eyebrow over the headline, the
three feature cards, the indigo-to-pink gradient, the glass panel on every
surface. Those are not failures of the palette. They are what the average of
every landing page looks like, and the average is what a language model returns
when asked for a landing page.

So every file ends with a **Base**: one block, generated from
`src/lib/base-md.mjs`, written into all 23 files by `npm run base`. CI runs
`npm run base -- --check` and fails if any copy has drifted, which is what keeps
twenty-three copies one copy.

**Where it goes: the end of Do's and Don'ts.** A ninth `##` section is legal —
the spec preserves unknown sections — but it warns, and every file in the
registry would carry that warning forever. Inside section eight it is also
simply where it belongs, and last in the file is where an agent looks for rules.
Delimited by `<!-- specimen:base ... -->` comments so regeneration is idempotent
and a version bump replaces the block rather than stacking a second one.

**Baked in, not served.** Splicing it into `/r/<slug>/DESIGN.md` and MCP
`get_design` on the way out would be a smaller change and a worse one: the raw
file would stop being the file in the repository, and the byte-identity CI
enforces is worth more than the convenience.

Two rules govern what may go in it:

1. **Nothing that contradicts a measurement.** Stripe really does paint a
   violet-to-pink gradient. So the rule is never "no gradients", it is "none you
   were not given" — every prohibition is phrased against the file rather than
   against a style.
2. **Nothing that inflates the file.** v3 runs 460–494 words, of which roughly
   385 is shared boilerplate and the rest is the per-file budget. Against a
   median body of ~660 hand-written words that is about 40% of each file, up
   from a third at v1 — the sourcing pass in v3 earned its additions, but the
   ceiling is real and the next version should cut before it adds. A Base long
   enough to dominate has a model following our prose instead of the site's
   design.

**The list is sourced, and was not always.** v1 and v2 were written from priors
plus one generated screenshot, which is not research. `SOURCES` at the top of
`base-md.mjs` names what v3 is actually drawn from, so an item can be checked or
challenged. Two things the research corrected outright: "tricolon of one-word
features" is attested nowhere and was replaced by the two-abstract-noun feature
title that is; and the word list implied a single hit convicts, when the finding
is that **density is the tell** rather than any one word. One item is kept
without corroboration and labelled as such — the uppercase eyebrow over the
headline, which no source names but which led the generated draft of this site.

Anything added later should be traceable to a source or to a generated page we
have actually looked at. Writing it from memory is what produced a v1 that a
single screenshot could hole twice.

**The budget is the part that is not boilerplate.** The first paragraph is
computed from the frontmatter — distinct *values*, not key names, because Linear
declares seven radius names over six values and six is the number of corners you
can draw:

> **Budget.** 5 colours, 1 radius, 10 spacing steps, 11 type steps, 2 weights
> and 2 shadows. […] It declares no motion, so state changes here are instant.
> It has no spacing grid […] Its buttons are square at 0px, which is a
> measurement rather than a value nobody set. Its canvas carries no pattern or
> wash, so leave it flat.

That is GOV.UK, and it is a portrait of restraint no token table conveys. The
absences are derived the same way, and they are the half a token list cannot
carry: a file with no elevation group is not a design waiting for
`0 4px 12px rgba(0, 0, 0, 0.1)`, it is a design where nothing floats.

`stripBase` trims **both** ends of the body, which also swept up the blank-line
rot the old `--tokens-only` had been accumulating — GOV.UK was carrying sixteen
leading blank lines.

`base` normalises CRLF to LF on read and writes LF. Without it a Windows
checkout under `core.autocrlf` reports all 23 files stale forever, and `--check`
fails on one machine and passes on another.

## Prose drift (`npm run check`)

The build refuses a file that breaks the spec. It has nothing to say about a
file whose **prose asserts a number its own frontmatter contradicts**, and that
is the likelier failure: every body is hand-written against a capture, and every
capture gets re-taken. `src/lib/prose-check.mjs` compares the two and CI fails
on a disagreement.

Deliberately narrow — a drift check that cries wolf gets switched off. It
verifies hex codes, contrast ratios, spacing-grid claims, grid-confidence
percentages, motion durations and sharpness. It does **not** check bare pixel
values, because prose legitimately cross-references other systems ("second only
to Airbnb's 1430px").

Two false-positive classes are excluded by design: WCAG's own thresholds
(4.5:1 is a bar prose cites, not a measurement), and dark-palette pairings,
which are computed against `dark-background` rather than the light canvas.

What the first run found, all real:

| | claimed | measured |
|---|---|---|
| GOV.UK | a 5px base obeyed by 76% | no base at all — the registry's grid boundary case |
| Linear | grid explains 67% | 64% |
| Basecamp | canvas `#f5faf6`, green cast | `#fcf7ff`, violet cast |
| The Verge | accent `#5200ff` violet at 7.49:1 | `#3cffd0` mint at 1.28:1, carrying black at 16.41 |

The Verge is the instructive one. The violet had not vanished — it survives as
`inset 0 -1px 0 0 #5200ff` on `link:hover` across 98 links — but it stopped
being the accent when a mint button fill outranked it. The file now says both
things separately, which is what it should have said all along.

A second pass widened it to typography (is the published face ever named?),
structure, section counts, composition labels, background patterns, and
**corpus-wide superlatives** — the claims that cannot be checked against one
file at a time. Those are the ones that rot as the registry grows: nine were
true when written and false by the time the corpus reached 23.

| claimed | actually |
|---|---|
| apple: "44px is the slimmest here" | The Verge runs 36px |
| basecamp: "the second narrowest" | fifth, behind gumroad/supabase/substack/govuk |
| govuk: "less than half of every commercial system" | gumroad is 540 |
| linear: "the highest grid usage here" | vercel carries one in all four sections |
| mailchimp: "the second highest" | it *is* the highest at 1259 |
| notion: "the second strictest grid" | sixth |
| pentagram: "the strictest adherence" | gumroad 98.5% beats 98.4% |
| stripe: "1145 characters, the most" | 713, and mailchimp holds the record |
| stripe: "173 controls, more than any other" | apple animates 232 |
| tailwindcss: "the strictest spacing grid" | 76.8%, well down the table |

Hedged phrasing is skipped on purpose — "among the thinnest", "a hair behind
Gumroad's 99%" — as are comparisons that measure a system *against* the extreme
rather than claiming it ("less than half the width of the widest system here").
Ties are not contradictions: Nike and Airbnb both run a 96px nav.

When this fails: correct the prose. Never adjust a token to match a sentence.

## Mobile

The header is the one part that cannot simply wrap. `main` reserves exactly
`--nav-offset` — the file's own `--nav-height` — below a fixed bar, so a nav
that grew to two lines would sit on top of the page content. Under 46rem it
**scrolls horizontally instead**, with a mask fading the last item so it reads
as "more this way" rather than as a clipped rendering fault. Before that it
measured 458px wide in a 375px viewport and CLI and MCP were simply unreachable.

**The zoom-out class of bug.** With `width=device-width`, a layout wider than
the screen does not produce a scrollbar — the browser widens the viewport and
zooms out, so text goes small and nothing looks obviously broken. Four causes,
all the same underlying thing: an **intrinsic minimum** that refuses to shrink.

| | fix |
|---|---|
| `.detail` mobile rule used a bare `1fr` | `minmax(0, 1fr)` — bare `1fr` is `minmax(auto, 1fr)`, and `auto` will not go below min-content, so the raw DESIGN.md `<pre>` set the page width |
| `.grid` floor of `19rem` on a 272px content box | `minmax(min(19rem, 100%), 1fr)` |
| `<select>` sized to its widest option (279px) | `min-width: 0` on it and its flex parent |
| `.get-actions` three buttons, no wrap | `flex-wrap: wrap` |

Grid and flex children default to `min-width: auto`, so **anything scrollable
inside them expands its parent instead of scrolling**. `.detail > * { min-width:
0 }` guards the whole detail page against a recurrence.

Checking for this needs `innerWidth`, not `scrollWidth`: once the browser has
zoomed out the two are equal and the page looks fine. The tell is `innerWidth`
exceeding the width you asked for.

And a hole in the first audit worth not repeating: only the Specimen tab was
ever measured. **Hidden panels report zero size**, so the DESIGN.md tab — the
one actually causing the zoom-out — was invisible to every check. Click through
each tab.

Two flexbox traps in that header, worth remembering because they look identical
from the outside:

- `align-self` and `align-items` are different axes. `align-self: stretch` made
  the nav fill the 73px bar; the links inside stayed 23px because the nav's own
  `align-items: center` re-centred them. Both are needed for a full-height tap
  target.
- A flex item will not shrink below its content width without `min-width: 0`,
  which is why the nav ran off the screen rather than compressing.

The hero heading is `min(var(--hero-heading), 11vw)` below 40rem. 64px comes
from a 1440px capture; at 375px it ran to four lines and took a third of the
viewport before any content. The capture is desktop-only, so scaling here is
responsive behaviour rather than a value invented against the measurement — the
full measured size is restored above 40rem.

Everything else already collapsed correctly and was left alone: `.detail` to one
column, tabs and badges wrap, the footer to one column, `pre` scrolls internally
rather than forcing the page wide, and facet chips sit at 27px — above the 24px
floor, and deliberately not larger, because 40 of them at a comfortable tap size
would be a page of scrolling on its own.

## `/compare`

Two systems side by side, every row a measured value. One page with the pair in
the query string (`?a=stripe&b=linear`) rather than 253 static permutations, so
a comparison is still a link you can send. All values are embedded at build
time; the script only chooses which two to show.

A row is marked `≠` **only when both sides have a value**. "One of them was not
measurable" is a different statement from "these two designs disagree", and
conflating them would overstate what the comparison knows.

The style block is `is:global`, and it has to be: Astro stamps
`data-astro-cid-*` on template elements at build time, and markup injected with
`innerHTML` never gets it — so scoped rules silently did not apply to the
generated table. It kept `display: table-row` instead of the grid, the column
swatches computed to 0px, and the group headings rendered as plain 24px h2s.
Every selector is `.cmp`-prefixed, which is what makes global safe here.

## The machine-facing surface

- `/llms.txt` (https://llmstxt.org) is a plain-text index written for a model
  rather than a crawler — what the registry is, how to fetch a file, what a file
  does and does not contain, and the whole catalogue with facets and raw URLs.
  Deliberately an **index, not a dump**: an agent choosing a system needs the
  catalogue, and one that has chosen fetches `/r/<slug>/DESIGN.md`. Inlining 23
  files would be ~200KB of context spent before a decision is made.
  Advertised from every page via `<link rel="alternate" type="text/plain">`.
- `/robots.txt` exists to say **yes**. Everything here is public, dated and meant
  to be fetched; crawling it is the intended use.
- `/sitemap.xml` is hand-rolled rather than pulling in `@astrojs/sitemap`,
  because `lastmod` should be the date a system was re-captured, not the date
  the site happened to build.
- `llms.txt` needs its CORS and content type in **host config**, like `/r/*`: a
  static build discards an endpoint's own `Response` headers. Both `vercel.json`
  and `public/_headers` carry it.

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
- **The site wears one of its own files.** `src/lib/theme.mjs` reads
  `content/systems/linear/DESIGN.md` at build time and emits its tokens as the
  site's custom properties — the values in `global.css` are fallbacks only.
  Change that file and the site changes. Two of its constraints are followed
  rather than worked around: it declares no `primaryForeground`, so nothing is
  ever filled with the accent (its own Do's say to spend it on focus and
  selection), and it has no spacing grid, so the steps are its observed values.
  It is dark-only, so the site has no light mode and no theme toggle.
  What it takes: colours, the font stack, base size, leading, both weights,
  tracking, all five radii, the **type scale** (headings are its own steps, not a
  ladder invented here), the **observed spacing steps**, and the **shadows**.
  It also takes the **structure**: the 1340px measure becomes the page
  container, the 73px nav height the header, `navPosition: fixed` makes it fixed
  (with `--nav-offset` reserving its height, since a fixed bar leaves the flow),
  the 128px `sectionSpacing` is the rhythm between sections, the 64px
  `heroHeadingSize` is the homepage headline, and the file's 0.1s ease governs
  every transition. A file that declares no motion sets `--motion` to nothing
  and interactions stay instant.
  **The typeface is self-hosted** via `@fontsource-variable/inter`, because for
  a long time the stylesheet named Inter Variable and nothing loaded it — a
  canvas probe measured the body text as identical to the monospace fallback.
  `themeVars` now throws if the theme file's family stops matching
  `SELF_HOSTED_FONT`, so the site cannot go back to claiming a face it is not
  rendering.
  Two tokens are deliberately **not** applied, and the reason is the same one
  that governs section composition: they describe Linear's *content*, not its
  language. `heroHeight: 114vh` is 1.14 viewports because Linear's hero holds a
  product screenshot; forcing it on a hero holding a headline and an install
  line produced 450px of dead space. `gridColumns: 2` is a marketing page's card
  density, and this is a catalogue. Adopting a design system means adopting its
  language, not its page.
  One CSS trap worth knowing: **the minifier merges duplicate selectors.** A
  second `.site-header` block whose `position: var(--nav-position)` was written
  after the original's `position: sticky` lost silently, because the merge kept
  source order within the combined rule.
  **The site wears the file's type ROLES, not sizes picked off its scale.** A
  scale is a list of sizes; a role is a size that was observed together with a
  weight, a leading and a tracking. `theme.mjs` emits every role as
  `--t-<role>-{size,weight,leading,track}`, and `global.css` groups its
  selectors by role. Setting 24px and then choosing 1.15 leading and -0.02em
  tracking by eye rebuilds a bundle that never existed on the page — the same
  fabricated-combination bug the pipeline avoids in `typeStyles`, `states` and
  motion, committed in the stylesheet instead of the clusterer.
  This was an audit of the site against the Base it publishes, and the site
  lost: **16 hardcoded rem sizes in the stylesheet rendering 5 sizes the file
  does not contain** — 11.48, 12.24, 13.125, 13.6 and 14.4px. `0.85rem` is
  13.6px; Linear measures 13px and 14px and nothing between. Every page now
  renders only the file's own twelve steps, checked by walking the DOM rather
  than by reading the CSS.
  h1 takes the **h2 role** (48px/510/1.0/-1.056px), the file's one display
  bundle; h2 and h3 take `lead-lg` and `lead` for size and tracking under the
  file's heading weight. The file measures tracking at 13, 14, 15, 20, 24 and
  48px and nowhere else, so those are the sizes a heading may be. The jump from
  48 to 24 is steep and it is the system's: a large display step and then small
  dense type is what this file measures.
  **`.pv` is the deliberate exception.** It renders the *previewed* system's
  components, so its sizes are `em` against that system's base. Putting it on
  Linear's steps would render every preview in Linear's type.
  Sections are all one width because `sectionWidth: contained` — the Base's
  "not every section the same width" is a rule about defaults, and this one was
  measured.
  `--faint` (3.45:1) is the one token held back from small text — it is the
  system's quietest tier, fine where it is used at size and a failing pair at
  label size, and shipping it would contradict the audit we publish elsewhere.
- **The canvas texture comes from a second file** — `DECOR_SLUG`, currently
  `tailwindcss`. This is the one exception to the bullet above, and the reason
  it is allowed is narrow: Linear's file declares `pattern: noise` with **no
  value**, because the source was a PNG on Linear's CDN and publishing that URL
  would invite a hotlink to somebody else's asset. So that slot was already
  filled by a stand-in *we invented* — `NOISE_SVG`, our own `feTurbulence` tile.
  It was the only declaration in the whole stylesheet not backed by a
  measurement, which makes it the only one another file can legitimately
  replace: this swaps an invented texture for a measured one out of the same
  registry. Tailwind's 10px dot grid and 315-degree hatch are published values,
  read from the same frontmatter every other consumer gets.
  It takes the **whole** `backgrounds` group or none of it. Linear's vignette
  under Tailwind's dots would compose a surface that exists on no site — the
  same fabricated-combination error the clusterer avoids everywhere it bundles
  co-occurring properties.
  Which scheme's values to read is **measured, not declared**: `themeVars`
  takes the relative luminance of the theme's own canvas and reads the `*Dark`
  keys below 0.2. The theme file is the only thing that knows this site is dark,
  and a boolean would go stale the moment the theme changed.
  Where the layers land is composition and is labelled as such. The dots field
  the content column, the hatch fills the margins outside it, and a hairline
  marks the boundary — the `--container` measure Linear already supplies. The
  rule's *colour* is not invented: it is the hatch's own first stop, pulled back
  out of the published gradient with `COLOR_STOP_RE` and rewritten as rgba.
  Two fixed pseudo-elements rather than one masked one, and the reason is a
  trap worth remembering: masking the hatch to the gutters needs their width in
  CSS, and `(100% - container) / 2` inside a `background-position` is not the
  width it looks like — percentages there resolve against the positioning area
  **minus the image**, and `100vw` counts a scrollbar the centred container does
  not. Painting the column opaquely over a full-bleed hatch needs no width at
  all: `margin-inline: auto` finds the same centre the page content uses.
- **No auth, no billing, no accounts** until Phase 3.

## Structure extraction (harvest v6, cluster v15)

Tokens describe the paint. `structure` describes the building, and it is what a
scraped catalog cannot reproduce. Measured from boxes and computed style like
everything else; nothing here infers intent.

Recovered: the **measure** (dominant content width), **section rhythm**, **grid
columns**, **nav** height/position/links, **hero** height, headline size and
alignment, CTA and media counts, and **motion** — transition duration and easing
bundled off the same element, never glued together from separate histograms.

Constants, each with the measurement behind it:

| Constant | Value | Why |
|---|---|---|
| section partition | sum ≤ 1.25×parent, none > 0.85×parent | Tailwind returned five "sections" of 11592/11092/11592px against an 11592px parent — stacked absolute layers summing to 3× the page, which yielded a 1288vh hero. The Verge returned a wrapper at 91% of its parent. |
| `HERO_MAX_RATIO` | 2 | Real heroes across the corpus run 0.76–1.59 viewports. Apple's first section is 2.33 and holds several stacked product panels, so its height is withheld and its headline kept. |
| `MEASURE_TOLERANCE` | max(4px, 2%) | Sibling containers land a pixel or two apart at the same measure; 2% groups those without merging a 1230px column into a 1440px bleed. |
| nav candidate | ≥3 links, width > 50vw, top < 1vh, topmost wins | Notion's first `<header>` in document order is the *hero's* header (`H1`, `P`, `HeroCTA`), so `querySelector('header')` measured a 308px block of hero text. GOV.UK's real masthead sits at y=324 behind a cookie bar, so a fixed 200px cutoff reported it had no navigation. |
| media, per section | outermost only, ≥5000px² | A `<picture>` and its `<img>` both match, and stacked layers compound: Stripe summed to 383% of its own section area before nested media were skipped. 5000px² is above any icon, below any content image. |
| CTA cluster | walk ≤5 ancestors from the headline | A pixel window fails: Linear renders a fake product sidebar as live DOM inside its hero, so `Pulse`, `Inbox` and `My issues` all counted as calls to action. The cluster is a different branch of the tree. Level 0 is strong evidence; deeper is reported as weak. |

### Grammar, not transcription

The load-bearing rule for anything structural. A DESIGN.md is a design
*language*, not a wireframe of one page, and the test for whether a fact belongs
in it is:

> Does this fact still make sense on a page the source site does not have?

Build a checkout page in Nike's language. The 1340px measure applies. `0.3s
ease` applies. A 96px fixed nav applies. "19 sections: hero, product grid,
editorial, footer CTA" is meaningless — there is no checkout equivalent.

Grammar transfers. Transcription does not. And the failure mode of getting this
wrong is not merely less creativity: a model handed a section sequence will try
to satisfy it, so you get a homepage-shaped checkout page. Over-specification
buys mismatch, not fidelity.

So `sectionComposition` records **counts and never an array** — the shape itself
cannot express an order, which is a stronger guarantee than a convention. What
is published is a repertoire: `sectionWidth` (full-bleed / contained / mixed),
`sectionMedia` (image-led / balanced / text-led / none), `sectionCopy`
(sparse / moderate / dense), and grid prevalence.

Bands rather than raw ratios, because the ratio is evidence and the band is the
instruction. Each cut sits in an observed gap: bleed measured 0% on three sites
and 100% on two with Nike alone at 53%; media-led ran 0, 0, 30, 50, 64, 74;
median characters per section ran 74, 96, 249, 536, 892, 1145.

`MIN_COMPOSITION_SECTIONS` is 4. Apple's three sections are 2100/1764/957px
containers each holding several panels, so its shares quantise to thirds and its
median section carries 9400 characters — the same coarseness that withholds its
hero height.

Each file's **Do's and Don'ts** closes with what the file deliberately does *not*
constrain. That is the mechanism that keeps direction from becoming dictation,
and it is also just true: naming the open ground is more honest than implying
the file covers everything.

Section detection either partitions the page or it does not. When it does not
(`sectionsReliable: false` — app shells, stacked overlays: airbnb, tailwindcss,
theverge) the hero, rhythm and section count are **withheld**; the measure,
grid, nav and motion are read independently and still stand.

`--motion` is a site variable, so it inherits through the preview boundary —
`previewVars` therefore sets it unconditionally, `0s` when a file declares none.
Without that, GOV.UK's preview rendered on Linear's 0.1s ease.

## Background treatment (harvest v8, cluster v18)

Colour tokens say what a surface *is*. `backgrounds` says what is painted over
it, and it is a large part of why a page in the right palette can still look
nothing like the site. Linear's canvas is not the flat `#08090a` its colour
tokens describe: a 256px grain sheet tiles over it under a radial vignette,
blended `overlay`.

Recovered per layer: kind (linear/radial/conic, repeating variants, svg tile,
data URI, raster), `background-size`, `repeat`, `position`, the full value, and
every colour stop parsed through `parseColor` — Tailwind authors its dots in
`oklab()`, which is exactly why that parser had to handle the modern spaces.

Bundled one key per element **per layer index**: a single declaration can stack
several images, and `background-size`/`repeat`/`position` are parallel lists
that CSS cycles when shorter, so they are paired by index rather than assumed
to be single values. Gluing a 10px tile size onto the wrong gradient is the same
fabricated-combination bug that `typeStyles`, `states` and motion each had.

| Constant / rule | Value | Why |
|---|---|---|
| `DECOR_MIN_AREA` | 10000px² | ~100×100. Below this a `background-image` is an icon, not a wash. |
| `TILE_MAX_PX` | 320 | Observed tiles: 3px (getdesign.md scanlines), 10px (Tailwind dots and hatch), 120px (Verge hairlines), 256px (Linear grain). Washes are `auto` or full-element. |
| tiled test | `!/no-repeat/` **then** `/repeat\|round\|space/`, and no `auto\|cover\|contain` | `no-repeat` contains the substring `repeat`, so a bare `/repeat/` test called Basecamp's signature SVG and a Verge `cover` image textures. Rule the negative out first. |
| `decorated` | a pattern, wash or effect exists | Not "some element has a background-image". Basecamp paints a signature and a logo that way and is otherwise flat; counting those reported a flat page as textured. |
| full pass | not the strided sample | Decorative layers live on a handful of elements and striding can miss the one painting the canvas. |

A **full scan** rather than the sampled loop, and `body`/`html` are useless as a
starting point — both report `background-image: none` on all thirteen sites,
GOV.UK and Stripe alike. The decoration always sits on large overlay elements,
so layers are ranked by painted area.

**Two textures, not one** (cluster v18). Ranking by area and publishing the
winner silently dropped every layer behind it. Tailwind lays a 315-degree
hairline hatch over its dot grid at a third of the dots' painted area — the
second most-painted decoration on the page, and absent from the file until now,
even though the hand-written prose had described it all along. That gap is the
tell: a human reading the capture saw the hatch, the frontmatter did not carry
it, and an agent gets only the frontmatter. The runner-up now ships as
`overlay` / `overlaySize` / `overlayAngle` / `overlayImage`. Only the runner-up:
The Verge stacks three rule sheets at 120/160/200px, and a file is a design
language rather than a transcript of one page.

**Dark variants, where they differ** (cluster v18). A file published only its
light values, so a dark-mode consumer of Tailwind got a near-black dot at 5%
alpha to paint on a near-black canvas — an invisible texture, confidently
specified. `patternImageDark`, `overlayImageDark` and `washDark` are emitted
**only when the dark capture disagrees with the light one**: Tailwind's dot
inverts to white at 10% and gets a key, its wash is byte-identical across
schemes and gets none. Restating an unchanged value teaches nothing, and a key
that appears only when something changed is itself information. The Verge picks
up both — hairlines to white at 4.3%, vignette deepening to 22% black.

Known asymmetry: the layer *set* comes from the light cluster and dark supplies
only variants of those layers, so a texture that exists **only** in dark mode is
not published. The Verge is the case — its dark scheme carries a second rule
sheet at 242 degrees that its light scheme does not, and no `overlay` ships for
it. Emitting an `overlayImageDark` with no `overlayImage` to vary would be the
alternative, and it is not obviously better.

**External rasters are recorded but never published.** Linear's grain is a PNG
on their CDN; the file carries the tile size and blend mode and withholds the
URL, with a warning saying to reproduce the effect. `theme.mjs` does exactly
that — `NOISE_SVG` is our own `feTurbulence` tile, used only when a file reports
`noise` with no usable value. The measured values in play are the tile size and
the blend mode; the texture is ours.

**Chromatic gradient stops become colour tokens.** Stripe's `#7f7dfc` and
`#f44bcc` are the most recognisable thing about its homepage and appeared in no
token; Shopify's `#1260ff` exists only as a 35% wash and never as a solid. They
are emitted as `gradient-1..n` in the `colors` group, using the **declared**
stop rather than the composited result — the same rule semantic colours already
follow for a tinted panel.

Gated on `CHROMATIC` (0.03), reusing the existing constant rather than adding
one: measured stops run 0.063 (Slack's palest lilac) to 0.246, while the noise
runs 0.000 (white), 0.014 and 0.027, so the cut lands in the gap. Fully
transparent stops are dropped, and any stop already emitted as a role, ramp or
semantic colour is skipped — the full gradient is in `backgrounds.wash`, so the
token list only has to carry what is new. Without the chroma gate Linear got
`gradient-1: #ffffff`, which is a fade-end in a dark-only system and an
invitation to fill something with it.

The contrast audit does not pair them: they are decorative, and
`gradient-1/background` is not a text pair.

Three of thirteen systems are **undecorated** — GOV.UK, Nike, Basecamp. That is
a finding, not a failure, and the files say so in words so an agent does not
reach for a gradient.

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
