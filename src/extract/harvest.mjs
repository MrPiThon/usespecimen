// Runs INSIDE the page via page.evaluate(). Must be entirely self-contained —
// no imports, no closure over module scope. Aggregates in-page so we ship
// compact counts rather than one record per element.

export const harvestFn = () => {
  const MAX_ELEMENTS = 6000;
  const bump = (map, key, weights) => {
    if (key == null || key === '' || key === 'none' || key === 'normal') return;
    const e = map[key] || (map[key] = { count: 0, area: 0, chars: 0 });
    e.count += 1;
    e.area += weights.area || 0;
    e.chars += weights.chars || 0;
  };

  const out = {
    // Bump whenever a change in here moves the output for an unchanged page, so
    // a drift diff can tell a redesign from a harvester change. Captures with no
    // version predate the field, and so predate the painted-border-side fix.
    // 2: adds typeStyles, co-occurring type property bundles keyed by element
    //    kind. Older captures cannot produce typography roles.
    // 3: adds states — hover/focus/active declarations read from stylesheet
    //    rules rather than computed style, bundled one key per rule.
    // 4: adds componentBoxes, the box metrics of interactive elements.
    // 5: adds structure -- sections, measure, hero composition, rhythm, grid,
    //    nav and transitions. Everything above describes the paint; this is the
    //    first field that describes the building.
    // 6: section detection validates that sections partition their parent, and
    //    reports sectionsReliable. v5 accepted stacked full-height layers as
    //    sections and called Tailwind's whole document a 1288vh hero.
    // 7: adds sectionComposition -- how sections are built, as AGGREGATE COUNTS.
    //    See the note at the measurement for why it is deliberately incapable
    //    of expressing an order.
    harvestVersion: 7,
    url: location.href,
    title: document.title,
    viewport: { w: innerWidth, h: innerHeight },
    docHeight: document.documentElement.scrollHeight,
    textColors: {}, bgColors: {}, borderColors: {},
    fontFamilies: {}, fontSizes: {}, fontWeights: {}, lineHeights: {}, letterSpacings: {},
    typeStyles: {},
    // Different shape from the histograms above: `rules` counts declarations,
    // `matched` counts elements the base selector actually selects. States have
    // no area or character weight to speak of, so overloading those fields would
    // be a lie the clusterer would then have to decode.
    states: {},
    componentBoxes: {},
    styleSheets: { total: 0, readable: 0, blocked: 0, stateRules: 0 },
    radii: {}, shadows: {}, spacings: {},
    interactiveBg: {}, interactiveRadius: {}, interactiveFg: {},
    headingSizes: {}, headingFamilies: {}, headingWeights: {},
    pageBg: null, elementCount: 0, sampled: 0,
    // Counts only. These are structural facts rather than styles carried by
    // area or by text, so the {count, area, chars} shape above would be
    // three-quarters padding and would invite the clusterer to weight them as
    // though the padding meant something.
    structure: {
      sectionCount: 0, sectionDepth: 0, sectionHeights: [],
      contentWidths: {}, sectionRhythm: {}, gridColumns: {}, transitions: {},
      sectionsReliable: false, sectionComposition: null, hero: null, nav: null,
    },
  };

  // Role names come from the element that carried the style, so the same
  // vocabulary has to serve typeStyles and states.
  const kindOf = (el) => {
    const t = el.tagName;
    if (/^H[1-6]$/.test(t)) return t.toLowerCase();
    if (t === 'BUTTON' || el.getAttribute('role') === 'button'
      || (t === 'INPUT' && /button|submit/i.test(el.type || ''))) return 'button';
    return t === 'A' ? 'link' : 'text';
  };

  const cs0 = getComputedStyle(document.body);
  const htmlBg = getComputedStyle(document.documentElement).backgroundColor;
  out.pageBg = (cs0.backgroundColor && cs0.backgroundColor !== 'rgba(0, 0, 0, 0)')
    ? cs0.backgroundColor : htmlBg;

  const all = document.querySelectorAll('*');
  out.elementCount = all.length;
  const step = all.length > MAX_ELEMENTS ? Math.ceil(all.length / MAX_ELEMENTS) : 1;

  for (let i = 0; i < all.length; i += step) {
    const el = all[i];
    const tag = el.tagName;
    if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'NOSCRIPT' || tag === 'HEAD' || tag === 'META' || tag === 'LINK') continue;

    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) === 0) continue;

    const r = el.getBoundingClientRect();
    const area = Math.max(0, r.width) * Math.max(0, r.height);
    if (area === 0) continue;

    // Direct text only — avoids counting a wrapper's whole subtree as its own text.
    let chars = 0;
    for (const n of el.childNodes) {
      if (n.nodeType === 3) chars += n.nodeValue.trim().length;
    }

    out.sampled += 1;
    const w = { area, chars };

    if (chars > 0) {
      bump(out.textColors, cs.color, w);
      bump(out.fontFamilies, cs.fontFamily, w);
      bump(out.fontSizes, cs.fontSize, w);
      bump(out.fontWeights, cs.fontWeight, w);
      bump(out.lineHeights, cs.lineHeight, w);
      bump(out.letterSpacings, cs.letterSpacing, w);
      if (/^H[1-6]$/.test(tag)) {
        bump(out.headingSizes, cs.fontSize, w);
        bump(out.headingFamilies, cs.fontFamily, w);
        bump(out.headingWeights, cs.fontWeight, w);
      }

      // One key per CO-OCCURRING type style. The per-property histograms above
      // cannot be recombined — knowing a page uses 16px and weight 600 says
      // nothing about whether 16px is ever bold — so a real typography role has
      // to be recorded as a bundle or invented later, and inventing is the one
      // thing this pipeline does not do.
      //
      // The kind prefix is the element that carried the style, so role names
      // come from the DOM rather than from a guess. Family goes last: a '|'
      // inside a font stack then cannot break the split on the way out.
      bump(out.typeStyles, [
        kindOf(el), cs.fontSize, cs.fontWeight, cs.lineHeight, cs.letterSpacing, cs.fontFamily,
      ].join('|'), w);
    }

    const bg = cs.backgroundColor;
    if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') bump(out.bgColors, bg, w);

    // Read the color off a side that is actually painted. Gating on "any side has
    // width" while always reading borderTopColor records the reset's default on
    // every element that only sets border-bottom — a border that never renders,
    // and on a Tailwind-style reset it outvotes the real one. First painted side
    // only, so an element still counts once however many sides it draws.
    for (const side of ['Top', 'Bottom', 'Left', 'Right']) {
      if (cs['border' + side + 'Width'] !== '0px') {
        bump(out.borderColors, cs['border' + side + 'Color'], w);
        break;
      }
    }

    if (cs.borderRadius && cs.borderRadius !== '0px') bump(out.radii, cs.borderTopLeftRadius, w);
    if (cs.boxShadow && cs.boxShadow !== 'none') bump(out.shadows, cs.boxShadow, w);

    for (const prop of ['paddingTop', 'paddingLeft', 'marginTop', 'marginLeft', 'gap', 'rowGap', 'columnGap']) {
      const v = cs[prop];
      if (v && v.endsWith('px')) {
        const n = parseFloat(v);
        if (n > 0 && n <= 160) bump(out.spacings, String(Math.round(n)), { count: 1 });
      }
    }

    const role = el.getAttribute('role');
    const interactive = tag === 'BUTTON' || tag === 'A' || role === 'button' ||
      (tag === 'INPUT' && /button|submit/i.test(el.type || ''));
    if (interactive && area > 200) {
      if (bg && bg !== 'rgba(0, 0, 0, 0)') bump(out.interactiveBg, bg, w);
      bump(out.interactiveFg, cs.color, w);
      if (cs.borderTopLeftRadius) bump(out.interactiveRadius, cs.borderTopLeftRadius, w);

      // Box metrics as ONE bundle per element, for the same reason typeStyles
      // exists: padding and radius that co-occur describe a real component,
      // while taking each from its own histogram describes one that may not.
      // Padding is collapsed to CSS shorthand here so the emitted token reads
      // the way a person would write it.
      const pad = [cs.paddingTop, cs.paddingRight, cs.paddingBottom, cs.paddingLeft];
      const padding = (pad[0] === pad[2] && pad[1] === pad[3])
        ? (pad[0] === pad[1] ? pad[0] : pad[0] + ' ' + pad[1])
        : pad.join(' ');
      bump(out.componentBoxes, [
        kindOf(el), padding, cs.borderTopWidth, cs.borderTopLeftRadius, cs.gap || 'normal',
      ].join('|'), w);
    }
  }

  // ---- interaction states -------------------------------------------------
  // getComputedStyle reports the RESTING value, so hover, focus and active are
  // invisible to the walk above, and driving real interaction on every element
  // is not something a crawler does reliably. The declarations are sitting in
  // the CSS, so read them from there.
  //
  // Cross-origin sheets throw on .cssRules. Those are counted rather than
  // skipped quietly: "this site declares no hover styles" and "we could not read
  // this site's CSS" are completely different claims, and only the second is our
  // fault.
  const STATE_RE = /:(hover|focus-visible|focus|active)(?![\w-])/;
  const STATE_PROPS = ['color', 'background-color', 'border-color', 'box-shadow',
    'opacity', 'outline-color', 'text-decoration-color'];
  const MAX_RULES = 20000;
  const MAX_STATE_RULES = 800;

  // Declared values are frequently `var(--token, fallback)`, which is a
  // reference, not a colour. Resolve it against a real element that the rule
  // targets; fall back to the fallback. GOV.UK's focus styles are entirely
  // var() references and would otherwise be unusable.
  const CSS_WIDE = /^(initial|inherit|unset|revert|revert-layer)$/;
  const resolveValue = (value, el) => {
    if (!value.includes('var(')) return value;
    return value.replace(/var\(\s*(--[\w-]+)\s*(?:,\s*([^()]*))?\)/g, (whole, name, fb) => {
      const v = el ? getComputedStyle(el).getPropertyValue(name).trim() : '';
      return v || (fb ? fb.trim() : whole);
    });
  };

  const bumpState = (key, matched) => {
    const e = out.states[key] || (out.states[key] = { rules: 0, matched: 0 });
    e.rules += 1;
    e.matched += matched;
  };

  let seen = 0;
  const visit = (rules) => {
    for (const rule of rules) {
      if (seen++ > MAX_RULES || out.styleSheets.stateRules > MAX_STATE_RULES) return;
      if (rule.selectorText && STATE_RE.test(rule.selectorText)) {
        out.styleSheets.stateRules += 1;
        for (const sel of rule.selectorText.split(',')) {
          const m = STATE_RE.exec(sel);
          if (!m) continue;
          // Strip every state pseudo, then ask the page what the rule targets.
          // Grounding the role in a real element beats parsing the selector.
          const base = sel.replace(new RegExp(STATE_RE.source, 'g'), '').trim();
          let matched = 0;
          let kind = 'other';
          let els0 = null;
          try {
            const els = base ? document.querySelectorAll(base) : [];
            matched = els.length;
            if (matched) { els0 = els[0]; kind = kindOf(els0); }
          } catch (e) { /* selector no longer parses once the pseudo is gone */ }
          if (!matched) continue; // dead CSS, or a rule for a state we can't reach
          // Every declaration from ONE rule in ONE key. Recording them
          // separately lets the winner for `color` come from a different rule
          // than the winner for `background-color`, which produced white text
          // on a white button — the same fabricated combination that per-property
          // type histograms produced before typeStyles.
          const decls = [];
          for (const prop of STATE_PROPS) {
            const raw = rule.style.getPropertyValue(prop);
            if (!raw) continue;
            const value = resolveValue(raw.trim(), els0);
            // CSS-wide keywords are resets, not tokens.
            if (!value || CSS_WIDE.test(value)) continue;
            decls.push(prop + ':' + value);
          }
          if (decls.length) bumpState([kind, m[1], decls.join(';')].join('|'), matched);
        }
      }
      if (rule.cssRules) visit(rule.cssRules); // @media, @supports, @layer, nesting
    }
  };

  for (const sheet of document.styleSheets) {
    out.styleSheets.total += 1;
    try {
      const rules = sheet.cssRules;
      out.styleSheets.readable += 1;
      visit(rules);
    } catch (e) {
      out.styleSheets.blocked += 1;
    }
  }

  // --- Structure -------------------------------------------------------------
  // Colours and type tell an agent what the paint is. They say nothing about
  // whether the page opens on a full-height hero or a 610px column of links,
  // which is most of the reason generated UI reads as generic even when the
  // palette is right.
  //
  // Same discipline as everything above: measured from boxes and computed
  // style. Nothing here infers intent, and no value is averaged into existence.
  const vw = innerWidth;
  const vh = innerHeight;
  const rectOf = (el) => el.getBoundingClientRect();
  const isVisible = (el) => {
    const c = getComputedStyle(el);
    if (c.display === 'none' || c.visibility === 'hidden') return false;
    const r = rectOf(el);
    return r.width > 1 && r.height > 1;
  };
  const kids = (el) => Array.prototype.filter.call(el.children, isVisible);
  const tally = (map, key) => {
    if (key == null || key === '') return;
    map[key] = (map[key] || 0) + 1;
  };
  // A transition shorthand is a comma-separated list whose values contain
  // commas of their own. Splitting on every comma truncated each easing to
  // "cubic-bezier(0.25".
  const topSplit = (str) => {
    const parts = [];
    let depth = 0;
    let cur = '';
    for (const ch of str) {
      if (ch === '(') depth += 1;
      else if (ch === ')') depth -= 1;
      if (ch === ',' && depth === 0) { parts.push(cur.trim()); cur = ''; } else cur += ch;
    }
    if (cur.trim()) parts.push(cur.trim());
    return parts;
  };

  // Chrome is not a section. Counting the masthead as the first section made
  // GOV.UK's hero the site header, and then excluded its real nav from the nav
  // search for being "inside the hero".
  const CHROME = { HEADER: 1, NAV: 1, FOOTER: 1 };
  const sectionsIn = (root) => kids(root)
    .filter((el) => !CHROME[el.tagName] && el.getAttribute('role') !== 'banner'
      && el.getAttribute('role') !== 'contentinfo')
    .map((el) => ({ el, r: rectOf(el) }))
    .filter((sec) => sec.r.height > vh * 0.12);

  // Real sections PARTITION their parent: stacked in flow, together roughly
  // accounting for its height. Counting tall children instead accepted two
  // different failures as success.
  //
  //   Tailwind returned five "sections" of 11592, 11092 and 11592px against an
  //   11592px parent -- absolutely positioned layers stacked on top of one
  //   another, summing to three times the page. Its hero came out at 1288vh.
  //
  //   The Verge returned [6064, 610], the first being 91% of its parent: a
  //   wrapper wearing a section's clothes.
  const partitions = (secs, root) => {
    if (secs.length < 3) return false;
    const parentH = rectOf(root).height;
    if (parentH <= 0) return false;
    // Overlapping layers sum well past their parent. The margin allows for
    // ordinary margin collapse and a little overlap.
    if (secs.reduce((sum, sec) => sum + sec.r.height, 0) > parentH * 1.25) return false;
    // Any single child that essentially IS the parent is a wrapper.
    return !secs.some((sec) => sec.r.height > parentH * 0.85);
  };

  let secRoot = document.querySelector('main') || document.body;
  let secDepth = 0;
  let sections = sectionsIn(secRoot);
  for (; secDepth < 10 && !partitions(sections, secRoot); secDepth += 1) {
    const children = kids(secRoot);
    if (!children.length) break;
    const tallest = children.reduce((a, b) => (rectOf(a).height >= rectOf(b).height ? a : b));
    // Only follow a child that essentially IS its parent; a shorter one means
    // we have reached the sections and would otherwise descend into the first.
    if (rectOf(tallest).height < rectOf(secRoot).height * 0.6) break;
    secRoot = tallest;
    sections = sectionsIn(secRoot);
  }
  // Reported rather than silently corrected. Some pages -- an app shell, a
  // stack of overlays -- genuinely have no section structure to read, and the
  // clusterer withholds the section-derived facts instead of publishing a
  // hero the height of the document.
  const sectionsReliable = partitions(sections, secRoot);
  if (!sectionsReliable) sections = [];
  out.structure.sectionsReliable = sectionsReliable;
  out.structure.sectionCount = sections.length;
  out.structure.sectionDepth = secDepth;
  out.structure.sectionHeights = sections.map((sec) => Math.round(sec.r.height));

  // How sections are BUILT, as counts over the whole page.
  //
  // Deliberately aggregate. A DESIGN.md is a design language, not a wireframe
  // of one page, and the difference decides whether a model can use it. An
  // ordered list -- "hero, then product grid, then editorial" -- describes a
  // single artifact and stops making sense the moment someone asks for a page
  // the source site does not have. A distribution is grammar: "sections here
  // bleed to the viewport, hold their content to the measure, and usually lead
  // with an image" applies to a checkout page as readily as to a homepage.
  //
  // So this records counts and never an array. The shape itself refuses to
  // carry an order, which is a stronger guarantee than a convention would be.
  if (sections.length) {
    // Icons are not composition. 5000px^2 is about a 70x70 box, comfortably
    // above any icon and below any image being used as content.
    const MEDIA_MIN_AREA = 5000;
    const MEDIA_LED_SHARE = 0.25;
    let bleed = 0;
    let gridded = 0;
    let mediaLed = 0;
    const charCounts = [];

    for (const sec of sections) {
      const area = sec.r.width * sec.r.height;
      if (sec.r.width >= vw - 4) bleed += 1;

      // Nested media double-counts: a <picture> and the <img> inside it are
      // both matched, and stacked absolute layers compound it. Stripe summed to
      // 383% of its own section area before this. Count only the outermost.
      let media = 0;
      const counted = [];
      for (const m of sec.el.querySelectorAll('img,video,canvas,picture,svg')) {
        if (!isVisible(m)) continue;
        if (counted.some((c) => c.contains(m))) continue;
        const mr = rectOf(m);
        const ma = mr.width * mr.height;
        if (ma < MEDIA_MIN_AREA) continue;
        counted.push(m);
        media += ma;
      }
      if (area > 0 && media / area > MEDIA_LED_SHARE) mediaLed += 1;

      // A repeating group: three or more siblings laid out at the same width.
      // That is a card deck whatever the markup calls itself.
      let repeats = false;
      for (const d of sec.el.querySelectorAll('*')) {
        const c = getComputedStyle(d);
        if (!/grid|flex/.test(c.display)) continue;
        const ch = kids(d);
        if (ch.length < 3) continue;
        const widths = ch.map((x) => Math.round(rectOf(x).width));
        if (widths.filter((w) => Math.abs(w - widths[0]) <= 4).length >= 3) { repeats = true; break; }
      }
      if (repeats) gridded += 1;

      let chars = 0;
      const walk = document.createTreeWalker(sec.el, NodeFilter.SHOW_TEXT);
      for (let n = walk.nextNode(); n; n = walk.nextNode()) {
        const t = (n.textContent || '').trim();
        if (t) chars += t.length;
      }
      charCounts.push(chars);
    }

    charCounts.sort((a, b) => a - b);
    out.structure.sectionComposition = {
      total: sections.length,
      bleed,
      gridded,
      mediaLed,
      // Median, not mean: one 4465-character section should not make a page of
      // 100-character sections look prose-heavy.
      charsMedian: charCounts[Math.floor(charCounts.length / 2)] ?? 0,
    };
  }

  // The measure: how wide content is allowed to get. Full-bleed boxes are
  // excluded because they are the canvas rather than the column.
  for (const el of document.querySelectorAll('div,section,article,header,footer,ul,ol,p,nav,form')) {
    const r = rectOf(el);
    if (r.width < vw * 0.35 || r.width > vw - 4 || r.height < 40) continue;
    tally(out.structure.contentWidths, String(Math.round(r.width / 10) * 10));
  }

  // Vertical rhythm between sections. Read from the section and its first few
  // children, because plenty of pages put the inset on an inner wrapper and
  // reading only the section itself returns nothing at all.
  for (const sec of sections) {
    for (const el of [sec.el].concat(kids(sec.el).slice(0, 3))) {
      const c = getComputedStyle(el);
      for (const v of [c.paddingTop, c.paddingBottom]) {
        const n = Math.round(parseFloat(v) || 0);
        if (n >= 32) tally(out.structure.sectionRhythm, String(n));
      }
    }
  }

  for (let i = 0; i < all.length; i += step) {
    const el = all[i];
    const c = getComputedStyle(el);
    if (c.display === 'grid') {
      const n = c.gridTemplateColumns.split(/\s+/).filter((x) => x && x !== 'none').length;
      // Needs enough children to actually fill a row, or every two-column
      // wrapper on the page counts as a card grid.
      if (n >= 2 && n <= 6 && kids(el).length >= n) tally(out.structure.gridColumns, String(n));
    }
    const t = el.tagName;
    if (t !== 'A' && t !== 'BUTTON' && el.getAttribute('role') !== 'button') continue;
    if (!c.transitionDuration || c.transitionDuration === '0s') continue;
    const dur = topSplit(c.transitionDuration)[0];
    if (!dur || dur === '0s') continue;
    // Duration and easing off the SAME element, in one key. Separate histograms
    // would let a duration pair with an easing it never actually runs with --
    // the fabricated-combination bug that typeStyles and states already fixed.
    tally(out.structure.transitions, dur + ' ' + (topSplit(c.transitionTimingFunction)[0] || 'ease'));
  }

  const heroEl = sections.length ? sections[0].el : null;
  if (heroEl) {
    const head = Array.prototype.filter.call(heroEl.querySelectorAll('h1,h2'), isVisible)[0] || null;
    const headCs = head ? getComputedStyle(head) : null;
    const hr = head ? rectOf(head) : null;
    // A control that looks pressable: filled, or outlined, and big enough to be
    // a target rather than a text link.
    const isCta = (el) => {
      if (!isVisible(el)) return false;
      const c = getComputedStyle(el);
      const r = rectOf(el);
      const filled = c.backgroundColor
        && c.backgroundColor !== 'rgba(0, 0, 0, 0)' && c.backgroundColor !== 'transparent';
      if (!filled && !(parseFloat(c.borderTopWidth) > 0)) return false;
      return r.height >= 28 && r.width >= 60;
    };
    // Walk up from the headline to the first ancestor that also holds a
    // control. That ancestor is the hero's text block, and scoping to it is
    // what separates the real buttons from decoration elsewhere in the hero.
    //
    // A pixel window around the headline does not work. Linear renders a fake
    // product sidebar as live DOM inside its hero, so `Pulse`, `Inbox` and
    // `My issues` all sat within 320px of the headline and counted as calls to
    // action. They are in a different branch of the tree, which is exactly what
    // this catches. Notion, Stripe and Vercel resolve at the first level up, to
    // `Get Notion free` / `Request a demo`, `Get started`, `Deploy now`.
    let ctas = [];
    let ctaLevel = -1;
    let node = head ? head.parentElement : null;
    for (let lvl = 0; lvl < 5 && node && node !== heroEl.parentElement; lvl += 1) {
      const found = Array.prototype.filter.call(node.querySelectorAll('a,button,[role=button]'), isCta);
      if (found.length) { ctas = found; ctaLevel = lvl; break; }
      node = node.parentElement;
    }
    const media = Array.prototype.filter.call(
      heroEl.querySelectorAll('img,video,canvas,svg,picture'),
      (el) => {
        const r = rectOf(el);
        return isVisible(el) && r.width > vw * 0.2 && r.height > 100;
      },
    );
    const ta = headCs ? headCs.textAlign : null;
    out.structure.hero = {
      heightRatio: Math.round((rectOf(heroEl).height / vh) * 100) / 100,
      headingSize: head ? Math.round(parseFloat(headCs.fontSize)) : null,
      // `start` and `end` are writing-mode relative; the rest of the file
      // speaks in physical directions.
      align: ta === 'start' ? 'left' : ta === 'end' ? 'right' : ta,
      ctas: ctas.length,
      // How far up the tree the cluster was found. Level 0 is the headline's
      // own block and is strong evidence; deeper means the walk passed through
      // markup that was not obviously the hero's text block, and the clusterer
      // says so rather than publishing the number as though it were certain.
      ctaLevel,
      ctasFilled: ctas.filter((el) => {
        const bg = getComputedStyle(el).backgroundColor;
        return bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent';
      }).length,
      media: media.length,
      fullBleed: rectOf(heroEl).width >= vw - 4,
    };
  }

  // Notion's first <header> in document order is the HERO's header — its
  // children are an H1, a P and a HeroCTA — so querySelector('header') measured
  // a 308px block of hero text and called it a nav bar. A banner is instead
  // identified by behaviour: near the top, spanning the page, carrying several
  // links, and not part of the hero.
  const heroSection = sections.length ? sections[0].el : null;
  const navEl = Array.prototype.filter.call(
    document.querySelectorAll('header,nav,[role=banner]'),
    (el) => {
      if (!isVisible(el)) return false;
      if (heroSection && heroSection.contains(el)) return false;
      if (el.querySelectorAll('a').length < 3) return false;
      const r = rectOf(el);
      // Within the first screen rather than within a fixed 200px. GOV.UK shows
      // a cookie bar above its masthead, which pushes the banner to y=324; a
      // tighter cutoff reported that the site has no navigation at all.
      return r.top < vh && r.width > vw * 0.5;
    },
  ).sort((a, b) => {
    const d = rectOf(a).top - rectOf(b).top;
    // Topmost wins; on a tie take the wider element, which is the bar itself
    // rather than the <nav> nested inside it.
    return d !== 0 ? d : rectOf(b).width - rectOf(a).width;
  })[0] || null;
  if (navEl) {
    let height = rectOf(navEl).height;
    // A banner holding an open mega-menu measures the menu rather than the bar.
    // Menus are taken out of flow, so the union of the in-flow children is the
    // bar itself.
    if (height > vh * 0.2) {
      const inFlow = kids(navEl).filter((el) => !/absolute|fixed/.test(getComputedStyle(el).position));
      if (inFlow.length) {
        const top = Math.min.apply(null, inFlow.map((el) => rectOf(el).top));
        const bottom = Math.max.apply(null, inFlow.map((el) => rectOf(el).bottom));
        if (bottom - top > 1) height = bottom - top;
      }
    }
    out.structure.nav = {
      height: Math.round(height),
      position: getComputedStyle(navEl).position,
      links: navEl.querySelectorAll('a').length,
      // Recorded so the clusterer can withhold a value it cannot trust instead
      // of publishing a nav bar a third of the viewport tall.
      overflowed: height > vh * 0.2,
    };
  }

  return out;
};
