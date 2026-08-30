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
//
// SOURCES for the habit list. v1 and v2 were written from priors and from one
// generated screenshot, which is not research and should not have been
// presented as any. These are what the list is actually drawn from, and a
// claim that is in none of them and in no generated page we have seen does not
// belong in it:
//
//   925studios.co/blog/ai-slop-web-design-guide       Inter, purple-to-blue,
//                                                     uniform 16px radius and
//                                                     24px padding, stock
//                                                     imagery, dead hover states
//   sikora.software/blog/ai-website-design            #615fff / #8e51ff /
//                                                     #0f172b, 01/02/03 steps,
//                                                     "Sarah Johnson, Head of
//                                                     Operations", 🚀💡✨
//   github.com/funboy322/avoid-ai-design              rounded-2xl shadow-lg,
//                                                     lucide Sparkles/ArrowRight/
//                                                     Zap, untouched shadcn zinc,
//                                                     icon-in-rounded-square
//   dev.to/alanwest/how-to-fix-the-ai-generated-look-in-your-frontend
//                                                     hero → features → social
//                                                     proof → pricing → FAQ →
//                                                     footer; bg-indigo-600;
//                                                     two-abstract-noun titles
//   uxplanet.org/how-to-spot-ai-generated-design      ultra-conventional
//                                                     hierarchy, the same
//                                                     skeleton repeated
//   slopdetector.org/blog/ai-words-list               delve/utilize/robust/
//                                                     pivotal, and the finding
//                                                     that density is the tell
//                                                     rather than any one word
//
// Two things the research contradicted, both now fixed: "tricolon of one-word
// features" is not attested anywhere and was replaced by the two-abstract-noun
// title that is; and the word list implied a single hit convicts, which the
// density finding says is wrong.
//
// One thing it did not corroborate and which is kept anyway: the uppercase
// eyebrow over the headline. No source names it, but it was the first thing in
// the generated draft of this site, so it stays on the evidence of that page.

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
 * 3: sourced. See SOURCES above. Adds the default typeface and palette, which
 *    every source names first and neither earlier version had; the concrete
 *    `rounded-2xl shadow-lg p-6` form of the uniformity tell; lucide's worn
 *    three; 01/02/03 steps, the lifted middle pricing tier and the four-column
 *    footer; named placeholder people; stock imagery; and a motion bullet,
 *    which earns its place because motion is a thing these files measure.
 */
export const BASE_VERSION = 3;

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
  //
  // Built by counting ticks rather than by one regex. The regex version
  // (/\S*`[^`]*`\S*|\S+/) backtracked into welding two adjacent spans into a
  // single token — `Sparkles`, `ArrowRight` came back as one — and a token
  // wider than the margin cannot be broken, so the line simply ran long.
  const tokens = [];
  let span = null;
  for (const word of text.replace(/\s+/g, ' ').trim().split(' ')) {
    if (span === null) tokens.push(word);
    else span.push(word);
    if ((word.match(/`/g) ?? []).length % 2 === 0) continue;
    if (span === null) span = [tokens.pop()];
    else { tokens.push(span.join(' ')); span = null; }
  }
  if (span) tokens.push(span.join(' '));
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

    '**Scope.** A visual language, not a page: sections, copy, information'
    + ' architecture and imagery are yours, and the silence on them is'
    + ' deliberate.',

    '**Habits to suppress.** A model asked for a page returns the average of'
    + ' every page, and the average is recognisable. None of this is here'
    + ' unless it was measured.',

    '- **Copy** — no small uppercase letterspaced line over the headline (`FOR'
    + ' DEVELOPERS`, `INTRODUCING`); no feature title built from two abstract'
    + ' nouns ("Seamless Integration"); no *seamlessly*, *effortlessly*,'
    + ' *unlock*, *elevate*, *empower*, *transform*, *leverage*, *delve* —'
    + ' density is the tell rather than any one word; no "Get started" band;'
    + ' no invented testimonial, customer logo, round statistic, or "Sarah'
    + ' Johnson, Head of Operations" over a generated avatar; no caption on a'
    + ' thing that already says what it is.\n'
    + '- **Structure** — not hero, logo wall, three feature cards, three-tier'
    + ' pricing with the middle plan lifted, FAQ accordion, closing CTA,'
    + ' four-column footer; not steps numbered 01 / 02 / 03; not three of'
    + ' anything by default; not every section the same width, centred, at the'
    + ' same padding; not a filled button beside an outlined one, arrow welded'
    + ' to the label.\n'
    + '- **Surface** — not Inter unless this file names it, and not a stock'
    + ' Tailwind palette (`indigo-600`, untouched `zinc` and `slate`); no'
    + ' indigo-to-violet-to-pink gradient; no gradient-filled heading; no'
    + ' `rounded-2xl shadow-lg p-6` on everything; no glass panel; no blurred'
    + ' glow behind the hero; no emoji standing in for an icon; no icon in a'
    + ' tinted rounded square; no `Sparkles`, `ArrowRight` or `Zap`; no fake'
    + ' browser or terminal chrome — traffic-light dots, a filename bar — around'
    + ' a code sample; no stock photograph of people at a laptop and no floating'
    + ' 3D blob.\n'
    + '- **Motion** — this file measures its own. Do not leave hover states'
    + ' doing nothing, do not snap where it declares an easing curve, and do not'
    + ' put one fade-in-up on every element on the page.',

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
