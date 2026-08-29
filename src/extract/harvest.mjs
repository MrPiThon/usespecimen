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
    harvestVersion: 4,
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

  return out;
};
