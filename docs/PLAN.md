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

## 2. Six findings, ranked by exploitability

**1. The pages don't contain the product.**
`/design-md/betterstack` has no DESIGN.md content, no copy button, no download,
no raw file, and no link to the file in their own GitHub repo. Its only CTAs are
a $39 paid analysis, a $249 starter kit, and a sponsor ad. Someone arriving from
a search for "Better Stack design system" gets a screenshot, one sentence, and
three boilerplate blocks — "Three ways to ship a Better Stack-style UI" — that
are byte-identical across all 551 pages. Trivially beatable: put the file on the
page.

**2. The catalog is a menu of things that don't exist yet.**
551 entries, 74 public files, 35 in the Pass. Roughly seven in eight entries are
lead-gen pages for a file generated only after you pay $39. Defensible business,
terrible browsing, and it makes the "550+" headline hollow — which matters,
because the whole category competes on that number.

**3. No search, on a 551-item catalog.**
Eight category chips and 35 pages of numbered pagination. No search input
anywhere. You cannot look up a brand by name, let alone shop the way people
actually choose a direction: dark and high-contrast, editorial serif, dense data
UI, soft and rounded, brutalist. Every file already carries structured color,
type, spacing and radius tokens in frontmatter — the facets are sitting there
unused.

**4. No machine interface, for a product whose user is a machine.**
No API, no CLI, no MCP server, no stable raw-file URL. The documented workflow is
"look at the page, then paste something into Cursor." The correct primitive is
`npx specimen add stripe`, or an MCP server the agent queries itself.

**5. The files hedge the brand name, and it breaks the output.**
The Stripe file's frontmatter reads `name: Stripi-Inspired-design-analysis`. The
page says Stripe; the file says Stripi. The trademark instinct is right, the
execution leaks into the artifact and tells the agent to build a company that
does not exist.

**6. Nothing is verified, and nothing is dated.**
Files are "independent analysis of publicly visible design patterns" with no
capture date, no extraction method, no contrast audit, no conformance check.
Every file claims to describe a live site's tokens; sites get redesigned. This is
the one thing a hand-written analysis cannot fake and a crawler can prove.

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

## 4. Five things we do that they don't

1. **The whole file is on the page.** Rendered, highlighted, copy button, raw
   download, stable URL at `/r/<slug>/DESIGN.md`. No gate, no sign-in.
2. **Proof, not vibes.** A provenance block per entry: capture date, source URL,
   extraction method — plus a live preview rendering real components (buttons,
   cards, nav, form, table) from the file's own tokens in both themes, beside a
   screenshot of the source. If the preview looks wrong, the file is wrong, and
   everyone can see it.
3. **Validated in public.** Google spec linter plus a WCAG contrast audit on
   every declared foreground/background pair, printed on the page as pass/fail
   with detail. Files that fail don't ship.
4. **Search that matches how people choose.** Full-text plus facets derived from
   the token data: hue family, contrast level, radius scale, type
   classification, density, light/dark polarity.
5. **It installs.** `npx specimen add stripe` writes DESIGN.md into the repo and
   prints the agent prompt. An MCP server exposes `search_designs` and
   `get_design` so agents fetch without a human leaving the editor.

Not on the list: more entries, a Catalog Pass, backgrounds, video templates, an
affiliate program, a starter kit. Their homepage carries nine product lines.
Ours carries one.

---

## 5. Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Astro 6, static | Hundreds–thousands of near-static pages is SSG's job. Zero JS by default. Next.js would ship a runtime we don't need. |
| Content | Content Layer + Zod, `src/content.config.ts` | `glob()` over `content/systems/**/DESIGN.md`, schema mirrors the spec. A malformed file fails the build. |
| Source of truth | Git, one dir per system | `DESIGN.md`, `capture.json`, `source.avif`. PRs for contributions; provenance is commit history. No CMS, no DB in v1. |
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
- `/spec` — a genuinely good explainer of the format, section by section, with a
  live validator. Best organic-traffic asset; theirs is thin.
- `/validate` — paste or upload a DESIGN.md, get conformance plus a contrast
  audit. Free, no account. One afternoon; earns links forever.
- `/cli`, `/mcp` — install docs for the machine interfaces.
- `/submit` — contribute by PR, schema documented.
- `/about` — provenance policy, trademark policy, opt-out process. Early, not
  boilerplate: it's a trust asset.

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
- **Extraction quality.** Computed-style harvesting on a modern marketing site
  returns hundreds of near-duplicate values. Clustering is the hard engineering
  problem in this plan and where the schedule will slip. Prototype on three sites
  before committing to the rest.

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
