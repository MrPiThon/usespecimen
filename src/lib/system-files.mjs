// Reads the on-disk artifacts that sit beside each DESIGN.md.
//
// The Content Layer hands back a body with frontmatter already stripped, but the
// file someone pastes into an agent prompt is the whole thing. Serving what is
// literally in git — frontmatter included, byte for byte — is the difference
// between "the page is about the file" and "the page contains the file".

import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

// cwd, not import.meta.url: this module gets bundled during the build and its
// own URL can end up pointing inside dist/. Astro always builds from the root.
const systemDir = slug => join(process.cwd(), 'content', 'systems', slug);

export const readDesignFile = slug => readFile(join(systemDir(slug), 'DESIGN.md'), 'utf8');

/** The extractor's capture, for the provenance and audit panels. Absent for any
 *  system seeded from upstream but not yet re-verified, which is a state the
 *  page has to render honestly rather than crash on. */
export async function readCapture(slug) {
  try {
    return JSON.parse(await readFile(join(systemDir(slug), 'capture.json'), 'utf8'));
  } catch {
    return null;
  }
}
