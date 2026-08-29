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
    harvestVersion: 2,
    url: location.href,
    title: document.title,
    viewport: { w: innerWidth, h: innerHeight },
    docHeight: document.documentElement.scrollHeight,
    textColors: {}, bgColors: {}, borderColors: {},
    fontFamilies: {}, fontSizes: {}, fontWeights: {}, lineHeights: {}, letterSpacings: {},
    typeStyles: {},
    radii: {}, shadows: {}, spacings: {},
    interactiveBg: {}, interactiveRadius: {}, interactiveFg: {},
    headingSizes: {}, headingFamilies: {}, headingWeights: {},
    pageBg: null, elementCount: 0, sampled: 0,
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
      const kind = /^H[1-6]$/.test(tag) ? tag.toLowerCase()
        : (tag === 'BUTTON' || el.getAttribute('role') === 'button'
          || (tag === 'INPUT' && /button|submit/i.test(el.type || ''))) ? 'button'
          : tag === 'A' ? 'link' : 'text';
      bump(out.typeStyles, [
        kind, cs.fontSize, cs.fontWeight, cs.lineHeight, cs.letterSpacing, cs.fontFamily,
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
    }
  }
  return out;
};
