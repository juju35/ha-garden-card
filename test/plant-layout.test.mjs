// Browser test (Chromium through Playwright) of the plant tiles: from 245 to 500 px, light and dark, in long languages,
// the plant's name is whole (the status chip goes under it rather than cut it), a label shown is never cut, every bar
// of a tile starts and ends at the same place, and no text is under 11 px. Skipped when Chromium is not installed.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { after, before, test } from "node:test";
import { devices, entities, forecast, states, thirsty } from "../scripts/mock-states.mjs";

const src = readFileSync(new URL("../src/garden-card.js", import.meta.url), "utf8");
const HA_CARD = `customElements.define("ha-card", class extends HTMLElement { constructor() { super();
  this.attachShadow({ mode: "open" }).innerHTML = "<style>:host{display:block;overflow:hidden}</style><slot></slot>"; } });`;
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

test("plant tiles: whole names, labels never cut, the bars of a tile aligned", { timeout: 180000 }, async (t) => {
  if (skip) return t.skip(skip);
  const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
  await page.setContent("<!doctype html><body style='margin:0;font-family:Roboto,Arial,sans-serif'></body>");
  await page.addScriptTag({ content: HA_CARD });
  await page.addScriptTag({ content: src });
  const cases = [];
  for (const language of ["en", "fr", "de", "el", "hu"]) for (const dark of [false, true]) for (const width of [245, 300, 400, 500]) cases.push({ language, dark, width });
  const results = await page.evaluate(
    async ({ cases, states, entities, devices, forecast, thirsty }) => {
      const frame = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      const out = [];
      for (const c of cases) {
        const box = document.body.appendChild(document.createElement("div"));
        box.style.width = `${c.width}px`;
        const el = document.createElement("garden-card");
        el.setConfig({ type: "custom:garden-card", language: c.language });
        const st = { ...states };
        for (const [id, o] of Object.entries(thirsty)) st[id] = { ...st[id], ...o };
        el.hass = { states: st, entities, devices, language: c.language, locale: { language: c.language }, themes: { darkMode: c.dark }, callService: async () => {},
                    connection: { subscribeMessage: async (cb) => { cb({ type: "hourly", forecast }); return () => {}; } } };
        box.appendChild(el);
        await frame();
        const cut = (n) => n.scrollWidth - n.clientWidth;
        for (const tile of el.shadowRoot.querySelectorAll(".plant, .soil")) {
          const name = tile.querySelector(".plant-name");
          const labels = [...tile.querySelectorAll(".lbl")].filter((l) => getComputedStyle(l).display !== "none");
          const tracks = [...tile.querySelectorAll(".track")].map((x) => x.getBoundingClientRect());
          const texts = [...tile.querySelectorAll(".plant-name, .chip-text, .lbl, .v")].filter((n) => getComputedStyle(n).display !== "none");
          out.push({
            ...c,
            tile: name ? name.textContent : "soil",
            name: name ? cut(name) : 0,
            labels: labels.map((l) => [l.textContent, cut(l)]).filter(([, n]) => n > 0.5),
            left: Math.max(...tracks.map((r) => r.left)) - Math.min(...tracks.map((r) => r.left)),
            right: Math.max(...tracks.map((r) => r.right)) - Math.min(...tracks.map((r) => r.right)),
            small: texts.filter((n) => parseFloat(getComputedStyle(n).fontSize) < 11).map((n) => n.textContent),
          });
        }
        box.remove();
      }
      return out;
    },
    { cases, states, entities, devices, forecast, thirsty },
  );
  await page.close();
  assert.ok(results.length > 0);
  for (const r of results) {
    const at = `${r.tile} ${r.language} ${r.dark ? "dark" : "light"} ${r.width}px`;
    assert.ok(r.name <= 0.5, `name cut by ${r.name}px: ${at}`);
    assert.deepEqual(r.labels, [], `labels cut: ${at}`);
    assert.ok(r.left <= 0.5 && r.right <= 0.5, `bars not aligned (${r.left}/${r.right}px): ${at}`);
    assert.deepEqual(r.small, [], `text under 11 px: ${at}`);
  }
});
