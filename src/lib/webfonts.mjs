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

/**
 * Openly-licensed stand-ins for faces we cannot serve.
 *
 * Chosen for construction rather than for vibe: Jost is a Futura revival, so it
 * is the right shape for Nike's display face; Archivo is a grotesque in the
 * Söhne/Graphik territory; Public Sans exists because a government needed a
 * humanist sans it could actually license, which is GDS Transport's whole
 * problem too.
 *
 * A substitution is a real loss of information, so it is ALWAYS labelled — see
 * `fontNote` and the badge on the specimen sheet. getdesign.md does the same
 * swap (Bebas Neue and Inter, from Google Fonts, placed ahead of the real name
 * in the stack) and says nothing about it, so a reader there believes they are
 * looking at Nike Futura ND when they are looking at a condensed grotesque.
 * Showing the approximation is fine; not saying so is not.
 *
 * The DESIGN.md tokens are never touched. A file keeps naming `Nike Futura ND`
 * because that is what an agent needs in order to license the right thing; the
 * substitution exists only in this site's rendering of it.
 */
const SUBSTITUTES = {
  // Geometric — Futura and its relatives.
  'nike futura nd': 'Jost Variable',
  'salesforce-avant-garde': 'Jost Variable',
  'gt walsheim medium': 'Jost Variable',
  'airbnb cereal vf': 'Jost Variable',
  // Grotesques.
  'sohne-var': 'Archivo Variable',
  graphik: 'Archivo Variable',
  'graphik web': 'Archivo Variable',
  'abc favorit': 'Archivo Variable',
  plain: 'Archivo Variable',
  // Neo-grotesques close enough to Inter that Inter is the honest answer.
  'sf pro text': 'Inter Variable',
  'sf pro display': 'Inter Variable',
  'helvetica now text': 'Inter Variable',
  figmasans: 'Inter Variable',
  // Custom cuts OF Inter. Stock Inter is as close as a substitute gets.
  notioninter: 'Inter Variable',
  'shopify-inter': 'Inter Variable',
  // Humanist.
  'gds transport': 'Public Sans Variable',
  'salesforce-sans': 'Source Sans 3 Variable',
  // Rounded.
  'duolingo-sans': 'Nunito Variable',
  feather: 'Nunito Variable',
  // Serifs.
  'lyon text': 'Source Serif 4 Variable',
  cahuenga: 'Source Serif 4 Variable',
  'means web': 'Source Serif 4 Variable',
  fkromanstandard: 'Source Serif 4 Variable',
};

/** The stand-in's name without the fontsource "Variable" suffix, for prose. */
const plain = name => name.replace(/ Variable$/, '');

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
  if (SUBSTITUTES[key]) return 'substituted';
  return 'unavailable';
}

/**
 * The stack to actually render with. When we hold the real face, its fontsource
 * name goes in front; the file's own stack is kept behind it untouched, so
 * nothing is lost if the package ever goes away.
 */
export function resolveStack(stack) {
  const fam = primaryFamily(stack);
  if (!fam) return stack;
  const key = fam.toLowerCase();
  const render = SELF_HOSTED[key] ?? SUBSTITUTES[key];
  if (!render) return stack;
  // The file's own stack is kept behind the rendered face. A viewer who has the
  // real thing installed still gets our choice first, which is exactly why the
  // swap has to be disclosed rather than left for them to notice.
  return `"${render}", ${stack}`;
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
  ].filter(([, stack]) => typeof stack === 'string' && stack.trim());

  const subs = [];
  const missing = [];
  for (const [, stack] of faces) {
    const fam = primaryFamily(stack);
    if (!fam) continue;
    const status = faceStatus(stack);
    if (status === 'substituted') {
      const standIn = plain(SUBSTITUTES[fam.toLowerCase()]);
      if (!subs.some(x => x.real === fam)) subs.push({ real: fam, standIn });
    } else if (status === 'unavailable' && !missing.includes(fam)) {
      missing.push(fam);
    }
  }

  if (!faces.length) {
    return { real: false, substituted: [], missing: [], note: 'No typeface is declared.' };
  }
  if (!subs.length && !missing.length) {
    return {
      real: true,
      substituted: [],
      missing: [],
      note: 'Rendered in the real typeface — it is openly licensed, so this site ships it.',
    };
  }

  const parts = [];
  if (subs.length) {
    // Group by stand-in: Duolingo's two faces both resolve to Nunito, and
    // "Nunito stands in for duolingo-sans, and Nunito stands in for feather"
    // reads like a bug.
    const byStandIn = new Map();
    for (const x of subs) {
      if (!byStandIn.has(x.standIn)) byStandIn.set(x.standIn, []);
      byStandIn.get(x.standIn).push(x.real);
    }
    const phrases = [...byStandIn.entries()]
      .map(([standIn, reals]) => `${standIn} stands in for ${reals.join(' and ')}`);
    parts.push(`${phrases.join(', and ')} — `
      + `${subs.length > 1 ? 'those faces are' : 'that face is'} not licensed for this site `
      + 'to serve, so an openly-licensed approximation is shown instead.');
  }
  if (missing.length) {
    const many = missing.length > 1;
    parts.push(`${missing.join(' and ')} ${many ? 'have' : 'has'} no close open substitute, `
      + `so ${many ? 'those fall' : 'that falls'} back to a system face.`);
  }
  parts.push('Sizes, weights, leading and tracking are the measurement; only the letterforms differ.');
  return { real: false, substituted: subs, missing, note: parts.join(' ') };
}
