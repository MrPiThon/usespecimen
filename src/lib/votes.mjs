// Upvotes, stored as thumbs-up reactions on one GitHub issue per system.
//
// Why there and not in a database: this site is a static build with no backend
// and no accounts, and upvotes need shared mutable state that a static build
// cannot hold. GitHub already holds the rest of the registry's state — the
// files, the history, the corrections — so it holds this too. Voting needs a
// GitHub account, which is the whole anti-abuse story and costs us no auth code
// and no personal data.
//
// The build NEVER fetches. Counts are read from `content/votes.json`, which is
// committed, so a build is deterministic, works offline, and needs no token in
// CI — the same discipline captures already follow. `npm run votes` refreshes
// the file and a scheduled workflow commits it.
//
// The cost of that choice is staleness, and staleness is stated rather than
// hidden: every count on the site is shown with the date it was read, exactly
// like every token is shown with the date it was captured.

export const VOTE_REPO = 'MrPiThon/usespecimen';

/** Where a person actually votes. The issue is the ballot box. */
export const voteUrl = (issue) => `https://github.com/${VOTE_REPO}/issues/${issue}`;

/** Title of the issue that holds a system's votes. Parsed back out by the sync
 *  command, so the format is load-bearing rather than cosmetic. */
export const voteTitle = (slug) => `Upvote: ${slug}`;

/** The slug a vote issue belongs to, or null if the title is not one of ours. */
export function slugFromTitle(title) {
  const m = /^Upvote:\s*([a-z0-9-]+)\s*$/i.exec(String(title ?? ''));
  return m ? m[1].toLowerCase() : null;
}

/**
 * Normalise the stored file into something the pages can use without
 * null-checking every access.
 *
 * A system with no issue yet is `{ up: 0, issue: null }` rather than absent, so
 * the UI can render "no votes yet, here is where to cast one" instead of
 * silently showing nothing — an upvote control that disappears when the count
 * is zero is how a catalogue ends up looking unanimously popular.
 */
export function readVotes(file, slugs = []) {
  const systems = file?.systems ?? {};
  const out = {};
  for (const slug of slugs) {
    const v = systems[slug] ?? {};
    out[slug] = { up: Number(v.up) || 0, issue: v.issue ?? null };
  }
  return {
    repo: file?.repo ?? VOTE_REPO,
    // Null until the first sync. The page says "not yet read" rather than
    // printing an invented date.
    fetchedAt: file?.fetchedAt ?? null,
    systems: out,
    total: Object.values(out).reduce((n, v) => n + v.up, 0),
  };
}
