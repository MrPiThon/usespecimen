# Specimen — strategy and build plan

Competitive teardown of getdesign.md, the strategy that follows from it, and a
phased plan. Site facts gathered by direct inspection on 28 Aug 2026; repo
counts read live from the GitHub API.

---

## 1. The board

| | |
|---|---|
| Catalog entries on getdesign.md | 551 |
| DESIGN.md files publicly available | 74 |
| Stars on the upstream MIT repo | 111,079 |
| Catalog Pass price | $99/mo, covering 35 files |

getdesign.md is run by the VoltAgent team as the commercial front end for
`VoltAgent/awesome-design-md`, a repo that went from zero to 111k stars in five
months (created 2026-03-31). The repo is the distribution engine; the site is
the funnel. Respect that position before attacking it.

**Three things they got right — copy these, don't out-clever them.**

- Genuinely static: two CSS files, no client framework, the only external JS is
  Google Analytics and a Cloudflare beacon.
- Real SEO surface: 755 URLs in the sitemap, clean canonicals, an `llms.txt`.
- The files that exist are good. The Stripe file is 24KB of structured analysis
  with YAML token frontmatter, following Google's section order exactly.

Everything else is soft.

---

## 2. Findings, re-verified

> **Rewritten after re-checking the live site on 28 Aug 2026.** The original
> teardown listed six findings. Four of them are no longer true — getdesign.md
> has shipped the file-on-page, an install command and search since. They are
> recorded below as dead so nobody plans against them again.

**Dead — they shipped these.**

- ~~The pages don't contain the product.~~ `/linear.app/design-md` now serves the
  full DESIGN.md behind a tab, plus a Download button and a Live Preview with
  light/dark toggles.
- ~~No machine interface.~~ `npx getdesign@latest add linear.app` is on the page,
  above the fold. This was our finding #4 and our proposed primitive; they got
  there first.
- ~~No search.~~ The catalog now has a search input.
- ~~The files hedge the brand name.~~ Partly. The Linear file reads
  `name: Linear-design-analysis` — the real brand, uncorrupted. The `Stripi`
  mangling may be one bad file rather than a policy.

**Still true, and now the whole wedge.**

**1. Nothing is verified, dated, or sourced — and at least one token is invented.**
Their files carry no capture date, no method, no source URL, no contrast audit,
no conformance result. That was already the strongest finding. It is now
*evidenced*: their Linear file declares `canvas: "#010102"`, described in prose
as "the deepest dark surface of any tool in this collection". That colour does
not appear anywhere on linear.app — not as a background, border, shadow or text
colour. Our capture of the same page finds `#08090a` covering 43.7M px².

A described file cannot avoid this failure mode. A crawled one cannot have it.
That asymmetry is the product.

**2. Their token vocabulary is richer than ours.**
Worth stating plainly, because it cuts against us. Their Linear file has four ink
tiers, four surfaces, three hairline weights, thirteen typography roles, semantic
success/overlay colours, and per-component padding with pressed states. We emit
seven colour roles and a flat size scale. Several of their values are correct and
independently confirmed by our own capture: `#d0d6e0`, `#8a8f98`, `#62666d`,
`#0f1011`, `#23252a` all match our histograms exactly.

Their method produces a *better-shaped* file. Ours produces a *checkable* one.
The goal is both, and the gap is a real backlog item, not a rounding error.

**3. Distribution, not product, is their moat.**
22K installs and 781 bookmarks on the Linear page alone, off a 111k-star repo.
Nothing in this plan closes that by building features.

Minor: 24 of 76 homepage images have no alt text.

---

## 3. Strategic read

**The corpus is not a moat.** The upstream repo is MIT. We may seed from all 74
files with attribution — and so may everyone else, and they have. designmd.app
claims 562 files, free. Competing on count means competing on a commodity being
given away.

**The category is entirely directories.** Every player is browse-and-copy with
SEO detail pages. Not one is a tool that runs. The unoccupied ground is the
*pipeline*: something that extracts, validates, previews, and keeps files
current.

**There is a real spec to conform to,** and nobody publishes conformance
results. Being the registry where every file is validated, with the result
visible on the page, is a position nobody holds.

> They built a catalog of design analyses. We build the **verification and
> delivery layer for DESIGN.md** — fewer files, each extracted by machine,
> dated, spec-linted, contrast-audited, rendered as living proof, and
> installable with one command.

---

## 4. What actually differentiates us

Revised 28 Aug 2026. Three of the original five are now table stakes — they have
the file on the page, search, and an install command. Building those wins
nothing; not having them loses. What remains:

**Real differentiators.**

1. **Proof, not vibes.** Built. A provenance block per entry — capture date,
   source URL, extraction method, pipeline versions — plus a live preview
   rendering real components from the file's own tokens, in both schemes where
   the site has two, above a dated screenshot of the source.

   The preview only earns the claim "if the preview looks wrong, the file is
   wrong" while it refuses to improve on its input, so a custom property is set
   **only** when the file declares the token. Where the file is silent the
   preview falls back to a plainly neutral default and draws its own hairlines
   **dashed**, and the page names what it had to supply: Linear's preview says
   "this file supplies no label colour for the accent" rather than letting a
   white button label read as extracted. GOV.UK, which declares everything the
   preview needs, renders solid and says nothing.

   Nobody else dates a file, and nobody else shows you what they had to make up.
2. **Validated in public.** Google spec linter plus a WCAG contrast audit on
   every declared pair, printed on the page. Enforced at build time, so a
   non-conformant file cannot reach the site. Caveat learned in testing: a
   *text* pair below AA is disqualifying, a decorative border below 3:1 is not —
   four of four reference sites fail the latter, so blocking on it would ship
   nothing.
3. **Facets from the token data.** Hue family, contrast level, radius scale,
   type classification, density, light/dark polarity. They have search; nobody
   has shopping-by-aesthetic, and the token data makes it nearly free.
4. **Falsifiability as a feature.** Publish the capture alongside the file so a
   reader can check any claim. It is how we found `#010102` doesn't exist, and
   it is the one thing a competitor cannot copy by scraping the output.

**Table stakes — build, but claim nothing for them.**
Whole file on the page, raw URL at `/r/<slug>/DESIGN.md`, `specimen add`, MCP
server. All four are built; none of them is a reason to choose us.

One thing carries over from the differentiators even here: both clients validate
a file before it lands. `add` refuses to write a non-conformant file and
`get_design` refuses to return one, because that is the last point before an
agent follows it as though it were sound.

Not on the list: more entries, a Catalog Pass, backgrounds, video templates, an
affiliate program, a starter kit. Their homepage carries nine product lines.
Ours carries one.

---

## 5. Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Astro 6, static | Hundreds–thousands of near-static pages is SSG's job. Zero JS by default. Next.js would ship a runtime we don't need. |
| Content | Content Layer + Zod, `src/content.config.ts` | `glob()` over `content/systems/**/DESIGN.md`, schema mirrors the spec. A malformed file fails the build. |
| Source of truth | Git, one dir per system | `DESIGN.md`, `capture.json`, `source.webp`. PRs for contributions; provenance is commit history. No CMS, no DB in v1. |
| Search | Pagefind + prebuilt facet index | Static, no backend. Facets from frontmatter. Vector search only if it earns its keep. |
| Hosting | Cloudflare Pages | Same edge the incumbent sits on, free at this scale, Workers ready for the API tier. |
| Styling | CSS custom properties | We sell design credibility. Tailwind defaults produce the look customers are escaping. |
| Ingestion | Playwright + Node CLI | Runs offline in CI, writes files, opens a PR. Never part of the web app. |
| Later | Better Auth + Stripe/Polar | Phase 3 only. Don't build accounts before there's something worth logging into. |

---

## 6. The ingestion pipeline is the product

Six stages, each runnable alone:

```
capture  →  extract  →  cluster  →  author  →  audit  →  review
Playwright  computed   collapse    model      spec      human PR
screenshots styles     into a      writes     lint +    + capture
light/dark  harvested  token       the 8      contrast  date and
3 widths    across DOM scale       sections   check     method
```

Stages 1–3 are deterministic. The model in stage 4 only writes prose about
values it was handed — it never invents a hex code. Every competitor currently
has a model look at a screenshot and describe it, which is exactly why none of
them can date or verify their files.

**Drift monitoring.** Once the pipeline exists, scheduled re-capture is nearly
free, and it produces the feature that turns a directory into a subscription:
*verified against the live site 6 days ago*, plus a visible diff when a source
site redesigns. That's Phase 2, but design the `capture.json` schema for it now.

---

## 7. Site map — nine routes, not ninety

- `/` — one claim, live search box, six exemplar systems rendered as real
  previews rather than screenshots.
- `/systems` — search-first, faceted catalog; cards show each system's actual
  palette and type.
- `/systems/<slug>` — the file in full, copy button, live component preview in
  both themes, token tables, provenance block, lint badge, install command.
- `/r/<slug>/DESIGN.md` — raw, plain text, permanent, CORS-open. The URL people
  paste into agent prompts.
- `/r/index.json` — the machine-readable catalog behind `list` and, later, the
  MCP server. Carries the token-derived facets (polarity, dark support, palette)
  so a client can choose a system without fetching every file.
- `/spec` — **built.** The format section by section, each illustrated with a
  real excerpt pulled live from the collection rather than an invented sample,
  so the documentation cannot drift away from the files it describes. Links to
  `/validate` rather than duplicating it.
- `/validate` — **built.** Paste or upload a DESIGN.md, get conformance plus a
  contrast audit. Free, no account, nothing uploaded — it runs entirely in the
  browser. It runs the *same* linter the build enforces and the same YAML parser
  the content layer uses, so its verdict is the verdict: a validator that
  disagreed with the build would be worse than not offering one. Contrast is
  audited only on pairs the file's naming makes identifiable, and everything it
  could not pair is listed rather than quietly skipped.
- `/cli`, `/mcp` — install docs for the machine interfaces. The CLI itself is
  built: `add <slug>` fetches a system into the working directory and `list`
  shows the catalog, both against `/r/index.json`. `add` validates the file
  **before** writing it and refuses a non-conformant one — the registry should
  never serve such a file, but the client is the last place to catch it and the
  only one that knows it is about to be handed to an agent.

  The MCP server is built too: `search_designs` (free text plus polarity and
  supportsDark facets) and `get_design` (one file, verbatim). It reads the same
  HTTP endpoints rather than the repository, so it works against a deployed
  registry from any machine, and `SPECIMEN_REGISTRY` overrides the origin since
  an MCP client passes no argv. Both pages still need writing — the software
  exists, and both pages are now written. They say plainly that nothing is
  published to npm yet and give the clone-and-run path instead — a documented
  `npx @usespecimen/cli` that does not resolve would be worse than no page.
- `/submit` — **built.** Leads with corrections rather than new systems: every
  file ships the capture it came from, which makes it falsifiable, and that only
  means anything if people check. States the four things a PR has to satisfy,
  including that no value may be typed by hand.
- `/about` — **built.** Provenance policy, trademark policy, removal process.
  The brand list and the "no file here is derived from another corpus" claim are
  rendered *from the collection*, so neither can drift away from what the
  registry actually holds. Removal is stated as unconditional.

If a block is identical on every system page, it belongs in the footer or the
docs, not the body. That's the trap that caught them.

---

## 8. Money — invert their value ladder

Theirs: free screenshot → $39 one-off → $99/mo for 35 files → $249 starter kit.
The paid tiers rent access to markdown that is free and MIT upstream. That gets
harder to sell as the free corpora grow.

Ours:

- **Free forever** — the whole public catalog, raw files, CLI, MCP server,
  validator. This is distribution, and it's the honest position given the
  corpus's license.
- **Paid, your brand extracted** — point it at your own site, get a
  spec-conformant DESIGN.md with real extracted tokens and a preview page.
  One-off, priced near theirs, differentiated by verification.
- **Paid, kept in sync** — monthly. Re-capture, diff the tokens, open a PR
  against your repo when your design drifts from your DESIGN.md.
- **Paid, teams** — private systems shared across a workspace, MCP scoped to
  your org's tokens.

The subscription case is the interesting one: a DESIGN.md that silently goes
stale is worse than none, because the agent keeps confidently generating last
year's brand. Nobody is selling the fix.

---

## 9. Phases

**P0 — 2 weeks. Prove the claim on a small corpus.**
Astro site, Zod schema, spec linter, contrast audit. Hand-run the pipeline over
40 systems, seeded from the MIT repo with attribution then re-verified against
the live sites so every file carries a real capture date. Full file on the page,
copy button, raw URLs, both themes.
*Done when:* a stranger can find a system, read the whole file on the page, copy
it, and see when it was verified and that it passed the spec.

**P1 — 2–3 weeks. Searchable and installable.**
Pagefind plus token-derived facets. Live component previews. `/validate`. CLI and
MCP server. This is the launch package — the CLI and validator get posted, not
the catalog.
*Done when:* `npx specimen add <slug>` works from a clean machine and an agent
can fetch through MCP without a browser.

**P2 — 4–6 weeks. Scale the pipeline, then the catalog.**
Automate capture end to end in CI. Grow to 250–400 systems only once a run needs
no hand-holding. Scheduled re-capture, drift indicator, diffs. Write `/spec`
properly.
*Done when:* adding a system is one command plus a PR review, and every page
shows days since verification.

**P3 — when P2 holds. Turn drift monitoring into revenue.**
Auth, billing, private systems, sync subscription, org-scoped MCP. Only if the
free tier has produced an audience asking for it.
*Done when:* someone pays to keep their own DESIGN.md in sync, not to read ours.

Depth first. Forty files done properly beats five hundred stubs.

---

## 10. Risks

- **Trademark.** Hundreds of pages naming other companies' brands and
  reproducing their visual identities. Nominative fair use covers much of this,
  but publish a clear provenance and trademark policy, don't use brand logos as
  page furniture, and build a one-click opt-out before it's needed. Worth an hour
  with a lawyer before the P1 launch, not after.
- **MIT attribution.** Seeding from `awesome-design-md` requires the copyright
  notice and permission text to travel with the material. Keep an
  `ATTRIBUTION.md` and a `derived_from` field in every seeded `capture.json`.
  Re-verifying against the live site does not by itself clear the obligation.
- **SEO cold start.** They have a 111k-star repo pointing at them. We won't
  out-rank them on brand queries for a long time. Traffic has to come from the
  tool surfaces — validator, CLI, spec explainer — and from being the link people
  share when arguing about which registry is accurate.
- **Category risk.** DESIGN.md is five months old and the spec is `alpha`. It may
  consolidate into the agent platforms. Build the pipeline so its output is
  useful even if the file format changes: extracted tokens are the durable asset,
  the markdown wrapper is not.
- **Extraction quality.** Confirmed as predicted, and worse than expected in one
  specific way: the failures are not noise, they are *confident wrong answers*.
  Ranking interactive fills by area gave Linear a one-off promo banner as its
  brand colour — a plausible token, wrong, and invisible without something to
  check it against. Two independent bugs of this shape surfaced in the first
  comparison against a competitor's file (see §11). Assume more exist; the
  mitigation is not better heuristics but keeping the raw capture published so
  any claim can be falsified.

## 11. Extraction backlog — measured, not speculative

Every item below came from diffing our Linear output against getdesign.md's on
28 Aug 2026, and each is stated with the number that proves it. Ordered by how
much it distorts a shipped file.

**1. ~~Dark surfaces over-merge.~~ FIXED, cluster v3.**
Diagnosed as a dark-region problem, but the measurements said otherwise: real
surface steps are 0.018–0.034 apart in *both* polarities (`#08090a`→`#0f1011` is
0.0334, `#ffffff`→`#f7f8f8` is 0.0217), while text needs the coarse 0.045 to fold
antialiasing variants together (Stripe's navy variants are 0.0424 apart and must
merge; its grey tiers are 0.0669 apart and must not). Not a lightness problem —
a *role* problem. Surfaces and borders now cluster at `SURFACE_MERGE = 0.015`,
just under the ~0.02 just-noticeable step.

Linear's `card` went from `#201011` — which was `rgba(243, 78, 82, 0.1)`, a red
danger overlay composited over the canvas — to `#0f1011`, matching the
`surface-1` getdesign.md derived by hand. Stripe and GOV.UK primaries and text
tiers are unchanged. This also unblocks item 2: the surface ramp now exists in
the cluster output instead of being merged away.

**2. ~~We emit roles; they emit ramps.~~ DONE, cluster v5.**
`colors.ramps` now carries ordered ladders alongside the named roles — text by
contrast descending, surfaces by lightness distance from the canvas. Emitted into
frontmatter as flat `text-1..n` / `surface-1..n` keys.

The text ramp reproduces their ink ladder exactly, and independently:

| ours | theirs | contrast |
|---|---|---|
| `text-1` `#f7f8f8` | `ink` | 18.73:1 |
| `text-2` `#d0d6e0` | `ink-muted` | 13.64:1 |
| `text-3` `#8a8f98` | `ink-subtle` | 6.13:1 |
| `text-4` `#62666d` | `ink-tertiary` | 3.45:1 |

Surfaces close less of the gap: we find one step above Linear's canvas
(`#0f1011`, their `surface-1`) where they declare four. The rest are not on the
page we captured — they live in hover and component states, which is backlog
item 5, not a clustering failure. Stripe gets three surface steps and three text
tiers; GOV.UK gets one of each, consistent with it having no muted tier at all.

Separation is by **area share**, not chroma: real surfaces sit at 9.3% and 0.42%
of painted background area while Linear's green and red semantic overlays sit at
0.145% and 0.104%. Chroma would have failed here, because plenty of systems tint
their surfaces deliberately — Stripe's `#e5edf5` is measurably blue.

**3. ~~Body size is wrong on dense UI.~~ DONE, harvest v2 + cluster v6.**
Fixed together with typography roles, because both needed the same missing data.
The per-property histograms cannot be recombined — knowing a page uses 16px and
weight 600 says nothing about whether 16px is ever bold — so `harvest` now
records **co-occurring bundles**: `kind|size|weight|lineHeight|tracking|family`,
keyed by the element that carried them (`h1`…`h6`, `button`, `link`, `text`).
54 distinct bundles on Linear, 62 on Stripe, 19 on GOV.UK.

Body is now the style that sets the most *prose*: filter to bundles above 20
characters per element (drops nav and label chrome), then rank by total
characters (drops display type, which scores highest per element but has little
volume). Neither measure works alone.

| | was | now | getdesign.md |
|---|---|---|---|
| Linear | 13px | **15px** | 16px |
| Stripe | 16px | **16px** | 16px |
| GOV.UK | 19px | **19px** | — |

GOV.UK matches its published 19px. Linear's 16px in their file now looks wrong
in the other direction.

Roles emitted: 12 for Linear, 9 for Stripe, 4 for GOV.UK, against their 13 —
`body`, the `body-sm`/`caption`/`body-lg`/`lead` ladder, `h1`…`h6`, `button`,
`link`, `mono`. Names come from the DOM element that carried the style, not from
a guess about what a size is for.

Side effect worth noting: `lineHeightInferred` is now false. Assembling `body`
from four independent histograms could emit a combination the page never used,
and it did — Stripe's body was reported with `-0.22px` tracking, which belongs to
its 22px display style. The 16px body carries none.

**4. ~~Semantic colours are on the floor.~~ DONE, cluster v7.**
`colors.semantic` reads state colours from tinted panels and their borders,
declared RAW for the same reason focus rings are: `rgba(39, 166, 68, 0.07)` is a
7% wash on screen, but the token it declares is `#27a644` — exactly the
`semantic-success` in their file.

Ranked by how many properties a colour paints before how often it appears. A real
state style colours a surface *and* its edge, which is what separates Linear's
`#27a644` (background + border, 9 elements) from a pure lime used 16 times as
decoration. Linear yields `success #27a644` and `danger #f34e52`; Stripe and
GOV.UK yield nothing, which is correct — neither marketing page shows a state.

**This uncovered a bug in `hueFamily`.** Its bands were HSL hue angles applied to
OKLCH values. Pure red sits at 29 degrees in OKLCH, not 0, so *every red was
labelled orange* and pink was labelled red. That silently broke both semantic
classification and the hue facet this plan sells in section 4.3. Bands are now
verified against canonical colours (#ff0000 29, #f97316 48, #eab308 86, #22c55e
150, #14b8a6 183, #3b82f6 260, #8b5cf6 293, #ec4899 354).

**5. ~~No interaction states.~~ DONE, harvest v3 + cluster v8.**
`getComputedStyle` reports the resting value, so states are read from
`document.styleSheets` instead. Every state rule is matched back against the DOM
(`querySelectorAll` on the selector minus its pseudo-class) so the role name comes
from a real element and dead CSS is skipped. `var(--token, fallback)` is resolved
against a matched element — GOV.UK's focus styles are entirely var() references
and would otherwise be unusable.

GOV.UK yields its signature state exactly: `link:focus` → `#ffdd00` background,
`#0b0c0c` text, `0 -2px #ffdd00, 0 4px #0b0c0c` underline, native outline
suppressed. Plus button hover, active and focus-visible.

**The two failure modes are reported separately, and that matters more than the
successes.** Stripe: 0 of 8 stylesheets readable, all cross-origin — we learn
nothing, and the file says so. Linear: 30 of 84 readable, 71 state rules found,
but every one targets a bundled toast/drawer library not present on the page, so
zero declarations. "This site declares no hover styles" and "we could not read
this site's CSS" must never render the same, and they don't.

Two design points learned the hard way, both the same lesson a third time:

- Declarations are bundled **one key per rule**. Recording them per property let
  the winner for `color` come from a different rule than the winner for
  `background-color`, and emitted white text on a white button — the identical
  fabricated combination that per-property type histograms produced before
  `typeStyles`.
- Within a near-tie on reach (95%), the **fuller** declaration wins. GOV.UK's
  focus splits across two rules — one sets colour on 107 links, the other sets
  colour, background and box-shadow on 106 — and taking the wider by one element
  dropped the yellow the whole design is known for.

Still approximate: CSS cascades and we pick a single rule, so `rulesConsidered`
ships in `capture.json` as the caveat. The rigorous fix is CDP
`CSS.forcePseudoState` plus a computed-style read, which needs a capture stage
outside `harvestFn` — worth doing when states become load-bearing.

**6. ~~One viewport, one colour scheme.~~ DONE, cluster v9.**
`extract` now sweeps 1440 / 768 / 390 under both `prefers-color-scheme` values —
six harvests per site. Widths are merged per scheme (`src/extract/merge.mjs`);
schemes are clustered separately into two palettes.

One page load per scheme rather than toggling `emulateMedia` after load, because
a site that picks its theme in JS at boot will not react to a toggle. Only the
value histograms are summed: `document.styleSheets` does not vary with viewport,
so summing state rules would triple their counts for no information.

`supportsDark` is decided by comparing the two page backgrounds perceptually, not
as strings. **None of the three reference sites support it** — Stripe and GOV.UK
are light-only, Linear is dark-only — so vercel.com is seeded as the
dark-mode example and yields two genuinely different palettes:

| | light | dark |
|---|---|---|
| background | `#fafafa` | `#000000` |
| foreground | `#171717` | `#ededed` |
| primary | `#0072f5` | `#52a8ff` |

The accent differs by scheme, and lightens rather than staying put — a fixed
accent would sink into the black canvas. A single-scheme capture misses that
entirely, and no amount of cleverness recovers it from one pass.

Side effect worth recording: merging widths changed Linear's button radius from
`9999px` to `8px`, because across three viewports the 8px buttons out-count the
pill CTA. Both are observed; the wider sweep simply has a different centre of
gravity, and `area` weights still scale with viewport so the widest capture
dominates any area-ranked role.

It also caught an invented value in our own seeder: `rounded.pill` was hardcoded
to `9999px`. `rounded.pillValue` now carries what was observed — `9999px` for
Linear, but `100%` for Stripe and `3.35544e+07px` for Vercel, which is Chrome's
own serialisation of a very large radius.

**9. ~~Accent detection ignored state shadows.~~ DONE, cluster v10.**
Found while writing Vercel's file. Its brand blue sits in the `:focus-visible`
ring, but `shadowAccents` only mined the *resting* shadow histogram, so the
accent fell through to `#297a3a` — a status green found in text, never on a
control. Two fixes:

- `parseColor` learned `hsl()`/`hsla()`, including `deg` units and slash-alpha.
  It previously handled only rgb, hex and `color(srgb ...)`, so Vercel's ring —
  authored as `hsla(212, 100%, 48%)` — would not have parsed even once found.
- `shadowAccents` now mines state box-shadows alongside resting ones, weighted by
  elements reached, and records which state supplied the winner.

Vercel's accent is now `#0072f5` (via `button:focus-visible`), lightening to
`#52a8ff` in dark. Stripe, GOV.UK and Linear are unchanged — their accents come
from filled controls or resting shadows and never consult the new source.

**7. ~~No component-level tokens.~~ DONE, harvest v4 + cluster v11.**
`componentBoxes` records padding, border width, radius and gap as one bundle per
interactive element — the same shape as `typeStyles` and states, for the same
reason.

The naive read was useless: the most common bundle for almost every kind is
fully default, because `<a>` and `<button>` are frequently bare wrappers around
the element that carries the styling. So a bundle that sets real padding is
preferred, then any bundle that sets anything, then the dominant one.

| | padding | other |
|---|---|---|
| Stripe **link** | `14.5px 24px 15.5px 24px` | 1px border, 4px radius, 8px gap |
| GOV.UK **button** | `8px 10px 7px 10px` | 1px border |
| Linear **button** | `0px 7px` | 8px radius, 8px gap |
| Vercel **link** | `2px` | 6px gap |

Stripe's call to action turns out to be an anchor, not a button element, and its
file now says to reproduce the padding rather than the tag. GOV.UK styles
`<button>` directly and so is unaffected by the preference rule — `dominantUnstyled`
is false there and true for the other three, which is the reader's cue.

Thin evidence is flagged: Vercel's button token rests on one element out of two
distinct shapes, and the file says so.

**8. ~~No screenshots.~~ DONE — but as WebP, not AVIF.**
Every capture now writes a viewport-sized proof shot beside `capture.json`, one
per colour scheme, referenced from frontmatter and run through Astro's asset
pipeline into responsive `srcset` variants. 20–57KB each.

**The format changed, and the reason is a trap worth recording.** Chromium cannot
encode AVIF: `canvas.toBlob(cb, 'image/avif')` silently returns a **PNG**, with
`blob.type` reading `"image/png"`. Nothing throws. A naive implementation writes
PNG bytes into a file named `.avif` and every check passes. Encoding AVIF
properly means a native dependency (sharp/libavif) in a pipeline that otherwise
needs only the browser we already run, so the files are `source.webp` —
browser-encoded, universally supported, about a quarter the size of the PNG. The
encoder verifies `blob.type` and returns null rather than falling back, because a
file whose extension lies about its contents is worse than no file.

## Verify before building

- [ ] Run the official `@google/design.md` linter against a repo file — confirm
      the corpus passes the spec it claims to follow.
- [ ] Prototype extract-and-cluster on three sites and eyeball the tokens against
      the real design. **If this doesn't work, the differentiator doesn't work.**
- [ ] Check whether designmd.app or designmd.co has shipped search, previews, or
      a CLI — this plan assumes they haven't.
- [ ] File the npm dispute for the unscoped `specimen` package.

---

## Sources

- getdesign.md — home, catalog, Catalog Pass, request, about
- github.com/VoltAgent/awesome-design-md — 111,079 stars, MIT, 74 DESIGN.md files
- github.com/google-labs-code/design.md — format specification
- designmd.app — competing free library, 562 files
- docs.astro.build — Content Layer and content collections
