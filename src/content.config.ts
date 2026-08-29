import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { CATEGORY_IDS } from './lib/categories.mjs';

// Validation IS the content layer. A DESIGN.md that doesn't conform never
// becomes a page, because the build fails before it can — that guarantee is the
// thing we sell, so it belongs in the type system rather than in a CI step
// someone can skip.

/** Token values nest arbitrarily (colors.brand.500) and may be a literal or a
 *  {path.to.token} reference. Reference targets are resolved separately, by
 *  checkTokenRefs in src/lib/design-md.mjs. */
const tokenTree: z.ZodType<unknown> = z.lazy(() =>
  z.union([z.string(), z.number(), z.record(z.string(), tokenTree)]));

/** Our extension, not the Google spec — which permits unknown properties and
 *  preserves them. Required, though: an undated file is exactly the thing the
 *  incumbent ships and the thing we exist not to. Brand attribution lives here
 *  and never in `name`, so the artifact an agent reads can't tell it to build a
 *  company that doesn't exist. */
const provenance = (image: ImageFn) => z.object({
  brand: z.string(),
  source: z.string().url(),
  capturedAt: z.coerce.date(),
  method: z.string(),
  harvestVersion: z.number().int().nullable().optional(),
  clusterVersion: z.number().int().nullable().optional(),
  // MIT obligation from awesome-design-md travels with anything seeded from it.
  // Re-verifying against the live site does not by itself clear it.
  derivedFrom: z.string().optional(),
  // Collection-relative path to the proof shot, run through Astro's asset
  // pipeline. WebP rather than the AVIF the plan names — Chromium cannot encode
  // AVIF, and a native encoder is not worth adding to a browser-only pipeline.
  screenshot: image().optional(),
  screenshotDark: image().optional(),
});

/** Astro hands the schema factory an `image()` helper; typing it loosely here
 *  keeps this file free of framework-internal type imports. */
type ImageFn = () => z.ZodType<unknown>;

const systems = defineCollection({
  loader: glob({
    base: './content/systems',
    pattern: '**/DESIGN.md',
    // Directory name is the slug, so /systems/stripe comes from
    // content/systems/stripe/DESIGN.md and `specimen add stripe` lines up.
    generateId: ({ entry }) => entry.split('/')[0],
  }),
  schema: ({ image }: { image: ImageFn }) => z.object({
    // The only field the spec requires. Named for the aesthetic, not the
    // company: "Indigo Infrastructure", never "Stripe".
    name: z.string().min(1),
    version: z.string().optional(),
    description: z.string().optional(),
    // Declared, not measured — a crawler cannot see what a site is for. Held to
    // a controlled vocabulary so the filter never fragments across synonyms;
    // an unknown id is a build error, which is better than a slow decay into
    // "dev-tools" and "developer-tools" both half-working.
    categories: z.array(z.enum(CATEGORY_IDS)).min(1).optional(),
    colors: z.record(z.string(), tokenTree).optional(),
    typography: z.record(z.string(), tokenTree).optional(),
    rounded: z.record(z.string(), tokenTree).optional(),
    spacing: z.record(z.string(), tokenTree).optional(),
    components: z.record(z.string(), tokenTree).optional(),
    // Extensions. The spec's five token groups stop at `components`, but it
    // preserves unknown properties, so these are legal — and declaring them
    // rather than letting passthrough carry them means a malformed one fails
    // the build like everything else, which is the guarantee we sell.
    elevation: z.record(z.string(), tokenTree).optional(),
    layout: z.record(z.string(), z.union([z.string(), z.number()])).optional(),
    motion: z.object({ duration: z.string(), easing: z.string() }).optional(),
    provenance: provenance(image),
  // Unknown top-level properties are preserved with a warning, per the spec, so
  // the schema must not strip them.
  }).passthrough(),
});

export const collections = { systems };
