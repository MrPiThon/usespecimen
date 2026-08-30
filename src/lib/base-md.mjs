// The Base: the block every DESIGN.md in this registry carries, generated from
// one template and inserted by `author`. Improving it is an edit here plus
// `npm run base`, which rewrites the block in every file; CI fails if any file's
// copy has drifted from what this module renders.
//
// Why it exists. Everything else in a DESIGN.md is a measurement, and a
// measurement cannot say what NOT to do. A model handed twelve colours and a
// type scale will still reach for its defaults on everything the file is silent
// about — an uppercase eyebrow over the headline, three feature cards, a violet
// gradient, a glass panel — because the average of every landing page is
// precisely what a language model returns when asked for one. The tokens
// replace the palette. The Base is what replaces the habits.
//
// Two rules govern what may go in here:
//
//   1. Nothing that contradicts a measurement. Stripe really does paint a
//      violet-to-pink gradient, so the rule is never "no gradients" but "none
//      you were not given". Every prohibition is phrased against the file
//      rather than against a style.
//   2. Nothing that inflates the file. This block ships in all 23 files and
//      competes for attention with the measurements, which are the reason
//      anyone is reading. It stays short enough to lose that competition.
//
// Framework-free, like the rest of src/lib: the CLI writes it and the site
// renders it, and neither may drag in the other's dependencies.

/**
 * Bumped when the template changes in a way worth a reader noticing. The
 * freshness check compares rendered text rather than this number, so a
 * forgotten bump is caught anyway — it exists for the human reading the file.
 *
 * 2: the tells in a Claude Design draft of this very site — a fake browser
 *    window with traffic-light dots around a code sample, and the filled-beside-
 *    outlined button pair under the headline. Both were in one generated
 *    screenshot and neither was in v1, which is the argument for auditing this
 *    list against real generated pages rather than writing it from memory.
 */
export const BASE_VERSION = 2;

const OPEN = `<!-- specimen:base v${BASE_VERSION} · generated · shared by every file in this registry · edit src/lib/base-md.mjs, then run \`npm run base\` -->`;
const CLOSE = '<!-- /specimen:base -->';

/** Matches a generated block at any version, so re-running is idempotent and a
 *  version bump replaces the old block rather than stacking a second one. */
const BLOCK_RE = /\n*<!--\s*specimen:base[\s\S]*?<!--\s*\/specimen:base\s*-->/g;

/** English list: "a", "a and b", "a, b and c". No Oxford comma, matching the
 *  prose already in the files. */
function list(parts) {
  const p = parts.filter(Boolean);
  if (p.length <= 1) return p[0] ?? '';
  return `${p.slice(0, -1).join(', ')} and ${p[p.length - 1]}`;
}

const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

/**
 * Hard-wrap a paragraph to the width the hand-written prose in these files
 * uses. Generated sentences carry interpolated counts of unpredictable length,
 * so the wrapping cannot live in the template — GOV.UK's budget paragraph
 * carries four absence clauses that Linear's does not, and a fixed line break
 * lands mid-word on one of them.
 *
 * Never breaks inside a backticked span: `AI-POWERED` split across a newline
 * stops being code and starts being two words with a stray backtick.
 */
function wrap(text, width = 78) {
  // A backticked span is one token even when it contains spaces, so the break
  // decision is never taken in the middle of one. Deciding per word and then
  // refusing to break while inside a span does not work: the line has already
  // been allowed to reach the margin by the time the span opens.
  const tokens = text.replace(/\s+/g, ' ').trim().match(/\S*`[^`]*`\S*|\S+/g) ?? [];
  const lines = [];
  let line = '';
  for (const token of tokens) {
    if (line && `${line} ${token}`.length > width) { lines.push(line); line = token; }
    else line = line ? `${line} ${token}` : token;
  }
  if (line) lines.push(line);
  return lines.join('\n');
}

/**
 * What the file actually hands an agent, counted.
 *
 * Distinct VALUES, not keys: Linear declares seven radius names over six
 * values, because `button` and `lg` are both 8px. Six is the number of corners
 * you can draw, and a count is only worth printing when it is the number that
 * constrains the work.
 */
export function budget(data) {
  const distinct = (obj) => new Set(
    Object.values(obj ?? {}).filter(v => typeof v === 'string'),
  );

  const light = Object.entries(data?.colors ?? {})
    .filter(([k, v]) => typeof v === 'string' && !k.startsWith('dark-'));
  const dark = Object.keys(data?.colors ?? {}).filter(k => k.startsWith('dark-'));
  const weights = new Set(
    [data?.typography?.weight, data?.typography?.headingWeight].filter(w => w != null),
  );

  return {
    colors: new Set(light.map(([, v]) => v)).size,
    darkColors: dark.length,
    radii: distinct(data?.rounded).size,
    spacing: Object.keys(data?.spacing ?? {}).filter(k => k !== 'base').length,
    steps: Object.keys(data?.typography?.scale ?? {}).length,
    weights: weights.size,
    shadows: Object.keys(data?.elevation ?? {}).length,
    motion: data?.motion?.duration ? 1 : 0,
  };
}

/**
 * The absences, said out loud.
 *
 * This is the half of a design a token list cannot carry, and the half a model
 * fills in from habit if nothing stops it. A file with no elevation group is
 * not a design waiting for `0 4px 12px rgba(0, 0, 0, 0.1)`; it is a design
 * where nothing floats, and that difference is the whole point of measuring.
 */
function absences(data, b) {
  const out = [];
  if (!b.shadows) out.push('It declares no elevation, so nothing in this design floats');
  if (!b.motion) out.push('It declares no motion, so state changes here are instant');
  if (!data?.spacing?.base && b.spacing) {
    out.push('It has no spacing grid, so use the steps it observed rather than rounding them into a tidy 8px rhythm');
  }
  if (data?.rounded?.button === '0px') {
    out.push('Its buttons are square at 0px, which is a measurement rather than a value nobody set');
  }
  const bg = data?.backgrounds ?? null;
  if (!bg?.pattern && !bg?.wash) {
    out.push('Its canvas carries no pattern or wash, so leave it flat');
  }
  return out;
}

/** The generated block, with no surrounding blank lines. */
export function renderBase(data) {
  const b = budget(data);
  const declared = list([
    b.colors ? plural(b.colors, 'colour', 'colours') : null,
    b.darkColors ? `${b.darkColors} more for its dark scheme` : null,
    b.radii ? plural(b.radii, 'radius', 'radii') : null,
    b.spacing ? `${b.spacing} spacing steps` : null,
    b.steps ? `${b.steps} type steps` : null,
    b.weights ? plural(b.weights, 'weight', 'weights') : null,
    b.shadows ? plural(b.shadows, 'shadow', 'shadows') : null,
    b.motion ? 'one easing curve' : null,
  ]);
  const gaps = absences(data, b);

  // Kept under a third of the median body deliberately. This block ships in
  // every file and competes for attention with the measurements, which are the
  // reason anyone opened it; a base long enough to dominate would have a model
  // following our prose instead of the site's design.
  const paragraphs = [
    '### The base',

    '*Shared by every file in this registry; only the counts below are this'
    + " file's.*",

    `**Budget.** ${declared}. That is the whole design — a colour, radius, shadow`
    + ` or curve not on that list is one you invented.${gaps.length ? ` ${gaps.join('. ')}.` : ''}`
    + ' An absence here is an instruction rather than a gap: fill nothing in'
    + ' from convention.',

    '**Scope.** A visual language, not a page. How surfaces are coloured, how'
    + ' type steps, how far things sit apart, how fast they move. Sections,'
    + ' copy, information architecture and imagery are yours — the file is'
    + ' silent on them on purpose.',

    '**Habits to suppress.** Asked for a landing page, a model returns the'
    + ' average of every landing page, and that average is recognisable on'
    + ' sight. None of this is here unless it was measured.',

    '- **Copy** — no small uppercase letterspaced line over the headline (`FOR'
    + ' DEVELOPERS`, `INTRODUCING`, `AI-POWERED`); no tricolon of one-word'
    + ' features; no *seamlessly*, *effortlessly*, *unlock*, *supercharge*,'
    + ' *elevate*, *empower*, *transform*, *leverage*, *next level*; no "Ready'
    + ' to get started?" band; no invented testimonial, customer logo or round'
    + ' statistic; no caption on a thing that already says what it is.\n'
    + '- **Structure** — not hero, logo wall, three feature cards, three steps,'
    + ' testimonials, FAQ, closing CTA; not three of anything by default; not'
    + ' every section the same width, centred, at the same padding; not a filled'
    + ' button beside an outlined one under the headline, either of them ending'
    + ' in an arrow.\n'
    + '- **Surface** — no indigo-to-violet-to-pink gradient; no gradient-filled'
    + ' heading; no blurred glow behind the hero; no glass panel on every card;'
    + ' no emoji standing in for an icon; no icon in a tinted rounded square; no'
    + ' fake browser or terminal chrome — traffic-light dots, a filename bar —'
    + ' around a code sample; no `scale(1.05)` on hover.',

    'The tell under all of them is uniformity — one radius, one border, one'
    + ' shadow, one gap everywhere, because nothing was decided.',
  ];

  // Bullets wrap per line, prose wraps per paragraph.
  const fill = p => (p.startsWith('- ')
    ? p.split('\n').map(li => wrap(li).replace(/\n/g, '\n  ')).join('\n')
    : wrap(p));
  return `${OPEN}\n\n${paragraphs.map(fill).join('\n\n')}\n\n${CLOSE}`;
}

/**
 * A body with any generated block removed, trimmed at both ends.
 *
 * Both ends, because `splitFrontmatter` hands back everything after the closing
 * delimiter — including the blank line that separates frontmatter from prose.
 * Re-anchoring under another blank line adds one every time, which is how
 * GOV.UK's file came to carry sixteen of them.
 */
export function stripBase(body) {
  return String(body ?? '').replace(BLOCK_RE, '').trim();
}

/** A body carrying exactly one current block, at the end. */
export function injectBase(body, data) {
  return `${stripBase(body)}\n\n${renderBase(data)}\n`;
}

/** The block a body currently carries, or null. Used by the freshness check. */
export function extractBase(body) {
  const m = String(body ?? '').match(BLOCK_RE);
  return m ? m[m.length - 1].replace(/^\n+/, '') : null;
}
