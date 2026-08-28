// @ts-check
import { defineConfig } from 'astro/config';

// The hostname lives here and nowhere else. Everything downstream reads
// `Astro.site`, so moving to the real domain is this line plus 301s — the path
// structure (/systems/<slug>, /r/<slug>/DESIGN.md) is fixed from day one.
export default defineConfig({
  site: 'https://specimen.coursey.website',
  output: 'static',
  trailingSlash: 'never',
  build: {
    // Emit systems/stripe.html, not systems/stripe/index.html, so URLs stay
    // extensionless without a trailing slash. Endpoints are unaffected by this
    // and still emit their literal path, which is what /r/<slug>/DESIGN.md needs.
    format: 'file',
  },
  markdown: {
    shikiConfig: { themes: { light: 'github-light', dark: 'github-dark' } },
  },
});
