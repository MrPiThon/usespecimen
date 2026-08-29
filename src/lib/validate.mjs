// Validates an arbitrary DESIGN.md — the engine behind /validate.
//
// Runs in the browser and in Node, and deliberately reuses the same linter the
// build enforces (`design-md.mjs`) and the same YAML parser Astro's content
// layer uses. A validator that disagrees with the build is worse than none: the
// whole offer is "paste your file and learn whether it would ship".

import { load as parseYaml } from 'js-yaml';
import { lintSections, checkTokenRefs, resolveRef } from './design-md.mjs';
import { parseColor, contrastRatio } from './color.mjs';

/** Frontmatter is optional in the spec, so its absence is a fact, not an error. */
export function splitFrontmatter(raw) {
  const text = String(raw ?? '').replace(/^﻿/, '');
  const m = /^---[ \t]*\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/.exec(text);
  if (!m) return { frontmatter: null, body: text };
  return { frontmatter: m[1], body: text.slice(m[0].length) };
}

// Role names differ between authors — ours say `background`/`foreground`, the
// files in the wild say `canvas`/`ink`. The audit recognises both vocabularies
// and reports which names it understood, because silently checking nothing looks
// identical to silently passing.
const BACKGROUND_NAMES = ['background', 'canvas', 'bg', 'base', 'page'];
const FOREGROUND_NAMES = ['foreground', 'ink', 'text', 'fg', 'body', 'copy'];
const isPairedForeground = k => k.startsWith('on-') || /Foreground$/.test(k);
const isTier = k => /^(text|ink)-\d+$/.test(k) || /muted/i.test(k);

const AA_TEXT = 4.5;

/** Flatten the colors group to name -> hex, resolving `{ref}` values. */
function flatColors(data) {
  const out = {};
  for (const [k, v] of Object.entries(data?.colors ?? {})) {
    const resolved = resolveRef(data, v);
    if (typeof resolved === 'string' && parseColor(resolved)) out[k] = resolved;
  }
  return out;
}

/**
 * Contrast on the pairs the file's own naming makes identifiable. Deliberately
 * conservative: a pair we cannot name is skipped and counted, never guessed at
 * and never assumed to pass.
 */
export function auditColors(data) {
  const colors = flatColors(data);
  const names = Object.keys(colors);
  const bgKey = BACKGROUND_NAMES.find(n => colors[n]);
  const pairs = [];

  if (bgKey) {
    for (const k of names) {
      if (k === bgKey || isPairedForeground(k)) continue;
      if (FOREGROUND_NAMES.includes(k) || isTier(k)) pairs.push([k, bgKey]);
    }
  }
  // `on-primary` and `primaryForeground` name the surface they sit on — unless
  // that surface isn't declared. `mutedForeground` has no `muted` token in our
  // own files, so it sits on the page background like any other text tier, and
  // falling back keeps it audited instead of silently unpaired.
  for (const k of names) {
    const base = k.startsWith('on-') ? k.slice(3)
      : (/Foreground$/.test(k) ? k.replace(/Foreground$/, '') : null);
    if (!base) continue;
    if (colors[base]) pairs.push([k, base]);
    else if (bgKey) pairs.push([k, bgKey]);
  }

  const seen = new Set();
  const results = [];
  for (const [fg, bg] of pairs) {
    const id = `${fg}/${bg}`;
    if (seen.has(id)) continue;
    seen.add(id);
    const ratio = Math.round(contrastRatio(parseColor(colors[fg]), parseColor(colors[bg])) * 100) / 100;
    results.push({ pair: id, fg: colors[fg], bg: colors[bg], ratio, aa: ratio >= AA_TEXT, min: AA_TEXT });
  }

  return {
    backgroundToken: bgKey ?? null,
    pairs: results,
    failures: results.filter(r => !r.aa).length,
    unpaired: names.filter(n => !results.some(r => r.pair.startsWith(`${n}/`)) && n !== bgKey),
  };
}

/**
 * Full verdict for one pasted file.
 * @returns {{ok: boolean, errors: string[], warnings: string[], sections: object[],
 *   data: object|null, audit: object|null}}
 */
export function validateDesignMd(raw) {
  const { frontmatter, body } = splitFrontmatter(raw);
  const errors = [];
  const warnings = [];

  if (!String(raw ?? '').trim()) {
    return { ok: false, errors: ['Nothing to validate.'], warnings, sections: [], data: null, audit: null };
  }

  let data = null;
  if (frontmatter === null) {
    warnings.push('No YAML frontmatter. The spec allows this, but a file without tokens '
      + 'gives an agent nothing to work from.');
  } else {
    try {
      const parsed = parseYaml(frontmatter);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) data = parsed;
      else errors.push('Frontmatter is not a YAML mapping.');
    } catch (err) {
      errors.push(`Frontmatter is not valid YAML: ${err.reason ?? err.message}`);
    }
  }

  if (data && typeof data.name !== 'string') {
    errors.push('Missing required property `name`. It is the only field the spec requires.');
  }
  if (data && typeof data.name === 'string' && !data.name.trim()) {
    errors.push('`name` is empty.');
  }

  const section = lintSections(body);
  errors.push(...section.errors);
  warnings.push(...section.warnings);
  if (data) errors.push(...checkTokenRefs(data));

  const audit = data ? auditColors(data) : null;

  return { ok: errors.length === 0, errors, warnings, sections: section.sections, data, audit };
}
