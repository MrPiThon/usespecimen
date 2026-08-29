// @ts-check
import { defineConfig } from 'astro/config';
import { SITE } from './src/lib/site.mjs';

// The hostname lives in src/lib/site.mjs and nowhere else, because the CLI needs
// it too and two copies is one copy too many. Site code reads `Astro.site`.
export default defineConfig({
  site: SITE,
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
