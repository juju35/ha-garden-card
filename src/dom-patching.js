// ---------------------------------------------------------------------------
// DOM patching
// ---------------------------------------------------------------------------

// Patches `root` to the markup `html` in place: nodes of the same type and tag are kept (their attributes and text
// updated), so that animations and transitions run on instead of restarting, images are not reloaded, the focus
// stays where it is and the card keeps its height. Where there is no DOM to parse with (unit tests), the markup is
// set as is.
export const morph = (root, html) => {
  const tpl = typeof document !== "undefined" && document.createElement?.("template");
  if (!tpl || !("content" in tpl) || !root.childNodes) {
    root.innerHTML = html;
    return;
  }
  tpl.innerHTML = html;
  patchChildren(root, tpl.content);
};
export const patchChildren = (to, from) => {
  const old = [...to.childNodes];
  const fresh = [...from.childNodes];
  fresh.forEach((n, i) => {
    const o = old[i];
    if (!o) to.appendChild(n);
    else if (o.nodeType !== n.nodeType || o.nodeName !== n.nodeName) to.replaceChild(n, o);
    else if (o.nodeType !== 1) {
      if (o.nodeValue !== n.nodeValue) o.nodeValue = n.nodeValue;
    } else {
      for (const a of [...o.attributes]) if (!n.hasAttribute(a.name)) o.removeAttribute(a.name);
      for (const a of [...n.attributes]) if (o.getAttribute(a.name) !== a.value) o.setAttribute(a.name, a.value);
      patchChildren(o, n);
    }
  });
  for (let i = old.length - 1; i >= fresh.length; i--) to.removeChild(old[i]);
};

// The width of an element's whole text in its own font, in fractional pixels (scrollWidth is rounded).
export let textCtx;
export const textWidth = (el) => {
  const cs = getComputedStyle(el);
  textCtx ??= document.createElement("canvas").getContext?.("2d");
  if (!textCtx) return el.scrollWidth;
  textCtx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
  const pad = (parseFloat(cs.paddingLeft) || 0) + (parseFloat(cs.paddingRight) || 0);
  return Math.max(el.scrollWidth, textCtx.measureText(el.textContent.trim()).width + pad);
};
