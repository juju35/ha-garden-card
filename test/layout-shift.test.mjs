// Browser test (Chromium through Playwright) of in-place rendering, with a <ha-card> that, like Home Assistant's Lit
// element, shows its content only from its first update (a microtask after it is connected): an unrelated state
// change touches nothing, a change of a shown entity patches texts and attributes without replacing a node (so the
// banner's animations run on), the height stays the same, and the status pill is measured once the card has
// rendered (same place from the first frame). Skipped when Playwright or Chromium is not installed.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { after, before, test } from "node:test";
import { devices, entities, forecast, states } from "../scripts/mock-states.mjs";

const src = readFileSync(new URL("../src/garden-card.js", import.meta.url), "utf8");
const HA_CARD = `customElements.define("ha-card", class extends HTMLElement {
  constructor() { super(); this.hasUpdated = false; this.attachShadow({ mode: "open" }); }
  connectedCallback() {
    if (this.hasUpdated) return;
    this.updateComplete = Promise.resolve().then(() => {
      this.shadowRoot.innerHTML = "<style>:host{display:block;overflow:hidden}</style><slot></slot>";
      this.hasUpdated = true;
      return true;
    });
  }
});`;
let browser;
let skip = false;
before(async () => {
  try {
    const { chromium } = await import("playwright");
    browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  } catch (err) {
    skip = `Chromium not available: ${err.message.split("\n")[0]}`;
  }
});
after(() => browser?.close());

test("in-place rendering: no node replaced on updates, stable height, pill fitted after <ha-card> rendered", { timeout: 120000 }, async (t) => {
  if (skip) return t.skip(skip);
  const page = await browser.newPage({ viewport: { width: 1000, height: 900 } });
  await page.setContent("<!doctype html><body style='margin:0;font-family:Roboto,Arial,sans-serif'></body>");
  await page.addScriptTag({ content: HA_CARD });
  await page.addScriptTag({ content: src });
  const results = await page.evaluate(
    async ({ states, entities, devices, forecast }) => {
      const frame = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      await document.fonts.ready;
      const out = [];
      for (const [type, width] of [["garden-card", 400], ["garden-mini-card", 300], ["garden-mini-card", 245]]) {
        const box = document.body.appendChild(document.createElement("div"));
        box.style.width = `${width}px`;
        const el = document.createElement(type);
        el.setConfig({ type: `custom:${type}`, name: "A rather long garden title" });
        let st = { ...states };
        const hass = () => ({ states: st, entities, devices, language: "en", locale: { language: "en" }, themes: { darkMode: false }, callService: async () => {},
                              connection: { subscribeMessage: async (cb) => { cb({ type: "hourly", forecast }); return () => {}; } } });
        el.hass = hass();
        box.appendChild(el);
        await Promise.resolve();
        await Promise.resolve();
        // The pill's place right after <ha-card> rendered, before any frame: the same as once settled.
        const titles = () => el.shadowRoot.querySelector(".htext .titles")?.className;
        const early = titles();
        await frame();
        const settled = titles();
        const h0 = el.getBoundingClientRect().height;
        let added = 0;
        let removed = 0;
        let any = 0;
        const mo = new MutationObserver((list) => {
          for (const m of list) {
            any++;
            added += [...m.addedNodes].filter((n) => n.nodeType === 1).length;
            removed += [...m.removedNodes].filter((n) => n.nodeType === 1).length;
          }
        });
        mo.observe(el.shadowRoot, { subtree: true, childList: true, attributes: true, characterData: true });
        const svg = el.shadowRoot.querySelector(".banner svg");
        // Unrelated entities.
        for (let i = 0; i < 10; i++) {
          st = { ...st, [`sensor.unrelated_${i}`]: { entity_id: `sensor.unrelated_${i}`, state: String(i), attributes: {} } };
          el.hass = hass();
          await frame();
        }
        const unrelated = any;
        const heights = new Set([Math.round(h0)]);
        // Shown entities: the remaining watering time and a plant's moisture.
        for (let i = 0; i < 10; i++) {
          st = { ...st, "sensor.potager_restant": { ...st["sensor.potager_restant"], state: String(480 - i * 7) },
                 "sensor.tomates_humidite": { ...st["sensor.tomates_humidite"], state: String(14 + (i % 3)) } };
          el.hass = hass();
          await frame();
          heights.add(Math.round(el.getBoundingClientRect().height));
        }
        mo.disconnect();
        out.push({ type, width, early, settled, unrelated, added, removed, sameSvg: el.shadowRoot.querySelector(".banner svg") === svg, heights: [...heights] });
        box.remove();
      }
      return out;
    },
    { states, entities, devices, forecast },
  );
  await page.close();
  for (const r of results) {
    const at = `${r.type} ${r.width}px`;
    assert.equal(r.early, r.settled, `pill place changed after the first frame: ${at}`);
    assert.equal(r.unrelated, 0, `unrelated updates mutated the card: ${at}`);
    assert.equal(r.added, 0, `nodes added on updates: ${at}`);
    assert.equal(r.removed, 0, `nodes removed on updates: ${at}`);
    assert.ok(r.sameSvg, `banner picture replaced: ${at}`);
    assert.deepEqual(r.heights.length, 1, `height changed (${r.heights}): ${at}`);
  }
});
