// What a system is FOR, as opposed to what it looks like.
//
// Every other facet in this registry is measured — polarity, shape, hue and
// contrast all come from getComputedStyle. Category cannot be. Whether a site is
// e-commerce or a portfolio is a judgement about its purpose, invisible to a
// crawler, so categories are DECLARED in frontmatter and the interface says so.
//
// They are still a controlled vocabulary rather than free tags. Free tags on a
// registry drift into synonyms — "dev-tools", "developer tools", "devtools" —
// and a filter over synonyms silently returns partial results. The schema
// rejects anything not on this list, which is a build error rather than a slow
// decay.

export const CATEGORIES = {
  saas: 'SaaS',
  'developer-tools': 'Developer tools',
  'e-commerce': 'E-commerce',
  marketing: 'Marketing',
  editorial: 'Editorial',
  docs: 'Documentation',
  portfolio: 'Portfolio',
  'public-sector': 'Public sector',
  finance: 'Finance',
  agency: 'Agency',
};

export const CATEGORY_IDS = Object.keys(CATEGORIES);
export const labelFor = id => CATEGORIES[id] ?? id;

/** Categories present across a set of entries, in vocabulary order, with counts.
 *  Ordered by the vocabulary rather than by frequency so the bar does not
 *  reshuffle itself every time the corpus grows. */
export function categoryCounts(entries) {
  const counts = new Map();
  for (const entry of entries) {
    for (const id of entry.data.categories ?? []) {
      counts.set(id, (counts.get(id) ?? 0) + 1);
    }
  }
  return CATEGORY_IDS
    .filter(id => counts.has(id))
    .map(id => ({ id, label: labelFor(id), count: counts.get(id) }));
}
