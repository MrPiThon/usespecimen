// Which typefaces this site may actually render, and which it must not.
//
// A preview in the wrong face is a preview of the wrong design — Nike's 76px
// Futura headline is a different object in Arial. So the honest thing is to
// load the real face wherever we legitimately can, and to say plainly which
// face is missing wherever we cannot.
//
// **Almost always we cannot.** Of the 31 families measured across this
// registry, four are openly licensed and a handful more are system faces. The
// rest — sohne-var, Nike Futura ND, Graphik, GT Walsheim, Lyon Text, ABC
// Favorit, Airbnb Cereal, Salesforce-Sans, figmaSans, Means Web, Cahuenga,
// duolingo-sans, feather, Plain — are commercially licensed. Serving them,
// self-hosted OR hotlinked from the source site's CDN, is redistribution we
// have no right to. GDS Transport is licensed for use on GOV.UK services
// specifically and is no more available to us than the commercial faces.
//
// This is the same rule that withholds Linear's grain PNG: measure it, name it,
// describe it precisely, and do not serve somebody else's asset.

/**
 * Measured family name -> the OFL family we self-host via @fontsource.
 *
 * Keys are lowercased. Values are the family the fontsource package actually
 * declares, which is not the name the site's own stack uses — Supabase says
 * `Manrope` and the package ships `Manrope Variable` — so the resolved name is
 * prepended to the stack rather than replacing it.
 */
const SELF_HOSTED = {
  inter: 'Inter Variable',
  'inter variable': 'Inter Variable',
  manrope: 'Manrope Variable',
  geistsans: 'Geist Variable',
  geist: 'Geist Variable',
};

/**
 * Faces already on the viewer's machine. Nothing to load and nothing to
 * apologise for: Hacker News really is Verdana, and a page that asks for
 * `system-ui` is asking for whatever the reader has.
 */
const SYSTEM = new Set([
  'verdana', 'system-ui', 'ui-sans-serif', 'ui-serif', 'ui-monospace',
  '-apple-system', 'georgia', 'arial', 'helvetica', 'times new roman',
  'courier new', 'sans-serif', 'serif', 'monospace',
]);

/** First family in a CSS stack, unquoted and with bundler hashes stripped. */
export function primaryFamily(stack) {
  if (typeof stack !== 'string' || !stack.trim()) return null;
  return stack.split(',')[0].trim()
    .replace(/^["']|["']$/g, '')
    // Next.js ships The Verge's serif as `__fkRomanStandard_cfceed`.
    .replace(/^_+/, '')
    .replace(/_(?:Fallback_)?[0-9a-f]{5,}$/i, '');
}

/**
 * @returns {'self-hosted'|'system'|'unavailable'} how a family will render.
 */
export function faceStatus(stack) {
  const fam = primaryFamily(stack);
  if (!fam) return 'system';
  const key = fam.toLowerCase();
  if (SELF_HOSTED[key]) return 'self-hosted';
  if (SYSTEM.has(key)) return 'system';
  return 'unavailable';
}

/**
 * The stack to actually render with. When we hold the real face, its fontsource
 * name goes in front; the file's own stack is kept behind it untouched, so
 * nothing is lost if the package ever goes away.
 */
export function resolveStack(stack) {
  const fam = primaryFamily(stack);
  const hosted = fam && SELF_HOSTED[fam.toLowerCase()];
  if (!hosted) return stack;
  return `"${hosted}", ${stack}`;
}

/**
 * What to tell the reader, per system rather than as a blanket disclaimer.
 * Saying "typefaces are not loaded" on Linear was simply untrue — Inter is OFL
 * and we already ship it, so that preview has been rendering in the real face
 * the whole time.
 *
 * @returns {{real: boolean, missing: string[], note: string}}
 */
export function fontNote(data) {
  const type = data?.typography ?? {};
  const faces = [
    ['body', type.fontFamily],
    ['heading', type.headingFamily],
  ].filter(([, s]) => typeof s === 'string' && s.trim());

  const missing = [];
  for (const [, stack] of faces) {
    if (faceStatus(stack) !== 'unavailable') continue;
    const fam = primaryFamily(stack);
    if (fam && !missing.includes(fam)) missing.push(fam);
  }

  if (!faces.length) return { real: false, missing: [], note: 'No typeface is declared.' };
  if (!missing.length) {
    return {
      real: true,
      missing: [],
      note: 'Rendered in the real typeface — it is openly licensed, so this site ships it.',
    };
  }
  const names = missing.join(' and ');
  const many = missing.length > 1;
  return {
    real: false,
    missing,
    note: `${names} ${many ? 'are' : 'is'} commercially licensed, so this site cannot serve `
      + `${many ? 'them' : 'it'} and the text below falls back. Sizes, weights, leading and `
      + 'tracking are the measurement; only the letterforms are substituted.',
  };
}
