import assert from "node:assert/strict";
import { test } from "node:test";
import { NOW, devices, dryForecast, entities, forecast, raining, states, thirsty } from "../scripts/mock-states.mjs";
import { load } from "./load.mjs";

const gc = load();
// Objects from the sandbox have the sandbox's prototypes: compared as plain JSON.
const same = (a, b, msg) => assert.deepEqual(JSON.parse(JSON.stringify(a)), JSON.parse(JSON.stringify(b)), msg);

const makeHass = ({ overrides = {}, list = forecast, language = "en", extraStates = {} } = {}) => {
  const st = structuredClone(states);
  for (const [id, o] of Object.entries(overrides)) st[id] = { ...st[id], ...o };
  Object.assign(st, extraStates);
  const calls = [];
  return {
    calls,
    states: st,
    entities,
    devices,
    language,
    locale: { language },
    callService: (...a) => calls.push(a),
    connection: {
      subscribeMessage: async (cb, msg) => {
        calls.push(["subscribe", msg.type, msg]);
        cb({ type: "hourly", forecast: list });
        return () => {};
      },
    },
  };
};

const mount = async (config = {}, opts = {}, Card = gc.GardenCard) => {
  gc.RUNS.clear();
  const card = new Card();
  card._connected = true;
  card.setConfig(config);
  const hass = makeHass(opts);
  card.hass = hass;
  await new Promise((r) => setTimeout(r, 0));
  return { card, hass, html: () => card.shadowRoot.innerHTML };
};

const click = (card, dataset, path) => card._onClick({ composedPath: () => path ?? [{ dataset }], stopPropagation() {}, detail: 1 });

test("zones, plants, soil sensors and the weather are discovered from the registries", () => {
  const m = gc.resolve(makeHass(), {});
  same(
    m.zones.map((z) => [z.entity, z.platform]),
    [
      ["valve.massifs", "hydrawise"],
      ["switch.haie", "rainbird"],
      ["valve.gazon", "gardena_smart_system"],
      ["valve.potager", "linktap"],
    ],
  );
  same(
    m.plants.map((p) => p.name),
    ["Basil", "Olive tree", "Tomatoes"],
  );
  same(
    m.soil.map((s) => s.entity),
    ["sensor.sol_gazon"],
  );
  assert.equal(m.weather, "weather.maison");
});

test("a zone's helpers are found on its device by their names, whatever the entity ids", () => {
  const m = gc.resolve(makeHass(), {});
  const patch = m.zones.find((z) => z.entity === "valve.potager");
  assert.equal(patch.remaining, "sensor.potager_restant");
  assert.equal(patch.total, "sensor.potager_total");
  assert.equal(patch.durationEntity, "number.potager_duree");
  const beds = m.zones.find((z) => z.entity === "valve.massifs");
  assert.equal(beds.next, "sensor.massifs_prochain_cycle");
  assert.equal(beds.watering, "binary_sensor.massifs_arrosage");
  assert.equal(beds.remaining, "sensor.massifs_restant");
});

test("configured zones keep their own options and name", () => {
  const m = gc.resolve(makeHass(), { zones: [{ entity: "switch.haie", name: "Hedge", duration: 25 }, "valve.gazon"] });
  same(
    m.zones.map((z) => [z.entity, z.name, z.duration]),
    [
      ["switch.haie", "Hedge", 25],
      ["valve.gazon", "Lawn", null],
    ],
  );
});

test("rain outlook: the part of each forecast entry inside the window, and the highest probability", () => {
  const o = gc.rainOutlook(forecast, "hourly", NOW, 24);
  // The current hour counts for its remaining half (0 mm), the 24th entry is cut at the window's end.
  assert.ok(Math.abs(o.amount - 6.4) < 1e-9, String(o.amount));
  assert.equal(o.prob, 80);
  assert.equal(gc.rainOutlook(forecast, "hourly", NOW, 3).amount.toFixed(2), "0.10");
  assert.equal(gc.rainOutlook([], "hourly", NOW, 24), null);
  const daily = [{ datetime: new Date(NOW - 7.5 * 3.6e6).toISOString(), precipitation: 10, precipitation_probability: 90 }];
  assert.equal(gc.rainOutlook(daily, "daily", NOW, 12).amount.toFixed(2), "5.00");
});

test("only real zones are discovered: B-hyve valves (4.x), not its programs; not Rachio's standby; not OpenSprinkler's master", () => {
  const ent = (entity_id, platform, translation_key, attributes = {}) => ({ entity_id, platform, translation_key, device_id: null, attributes });
  const list = [
    ent("valve.back_zone", "bhyve", "zone"),
    ent("switch.back_program", "bhyve", "program"),
    ent("switch.back_rain_delay", "bhyve", "rain_delay"),
    ent("switch.back_smart_watering", "bhyve", "smart_watering"),
    ent("switch.front_lawn", "rachio", null),
    ent("switch.rachio_veille", "rachio", "standby"),
    ent("switch.rachio_morning_schedule", "rachio", null),
    ent("switch.pump_station_enabled", "opensprinkler", null, { is_master: true }),
    ent("switch.beds_station_enabled", "opensprinkler", null, { is_master: false }),
    ent("switch.program_1_program_enabled", "opensprinkler", null),
  ];
  const hass = {
    entities: Object.fromEntries(list.map((e) => [e.entity_id, e])),
    devices: {},
    states: Object.fromEntries(list.map((e) => [e.entity_id, { entity_id: e.entity_id, state: "off", attributes: e.attributes }])),
  };
  same(
    gc.resolve(hass, {}).zones.map((z) => z.entity).sort(),
    ["switch.beds_station_enabled", "switch.front_lawn", "valve.back_zone"],
  );
});

test("the card suggests skipping the watering when rain is expected, and says the forecast when it is dry", async () => {
  const { html } = await mount({}, { overrides: raining });
  assert.match(html(), /No watering needed/);
  assert.match(html(), /6\.4 mm of rain expected in the next 24 h · 80 % chance of rain/);
  const dry = await mount({}, { overrides: thirsty, list: dryForecast });
  assert.doesNotMatch(dry.html(), /No watering needed/);
  assert.match(dry.html(), /No rain expected in the next 24 h/);
  const high = await mount({ rain_threshold: 10, rain_probability: 90 }, { overrides: raining });
  assert.doesNotMatch(high.html(), /No watering needed/, "10 mm / 90 % thresholds are not reached");
  const rainy = await mount({}, { overrides: { ...thirsty, "weather.maison": { state: "pouring" } }, list: dryForecast });
  assert.match(rainy.html(), /No watering needed/);
  assert.match(rainy.html(), /It is raining now/);
});

test("the forecast comes from the weather entity's hourly subscription", async () => {
  const { hass } = await mount();
  const sub = hass.calls.find((c) => c[0] === "subscribe");
  same(sub[2], { type: "weather/subscribe_forecast", forecast_type: "hourly", entity_id: "weather.maison" });
});

test("a watering zone counts down from its remaining time sensor, with a ring and the big countdown", async () => {
  const { html } = await mount();
  // 492 s left, reported at NOW.
  assert.match(html(), /data-end="\d+">8:12 left</);
  assert.match(html(), /data-fmt="bare">8:12</);
  assert.match(html(), /class="ring"/);
  assert.match(html(), /<span class="chip active[^"]*"[^>]*>.*Watering/s);
  const end = NOW + 492e3;
  assert.ok(html().includes(`data-end="${end}"`));
  // 492 of 900 s left: the ring shows what is left.
  assert.ok(html().includes(`data-total="900000"`));
});

test("Start opens the duration popup at the top of the card; presets and steps change it; Start calls the integration", async () => {
  const { card, hass, html } = await mount();
  click(card, { action: "start", entity: "switch.haie" });
  assert.match(html(), /class="backdrop"/);
  assert.match(html(), /Water Hedge drip line/);
  assert.match(html(), /10<small>min<\/small>/);
  click(card, { action: "dur_preset", min: "20" });
  click(card, { action: "dur_plus" });
  assert.match(html(), /21<small>min<\/small>/);
  click(card, { action: "dialog_ok" });
  await new Promise((r) => setTimeout(r, 0));
  same(hass.calls.filter((c) => c[0] !== "subscribe"), [["rainbird", "start_irrigation", { entity_id: "switch.haie", duration: 21 }]]);
  assert.doesNotMatch(html(), /class="backdrop"/);
});

test("each integration is started its own way", async () => {
  const { card } = await mount({ default_duration: 12 });
  const zone = (id) => card._model.zones.find((z) => z.entity === id);
  same(card._startCalls(zone("valve.gazon"), 12), [["gardena_smart_system", "valve_open", { entity_id: "valve.gazon", duration: 720 }]]);
  same(card._startCalls(zone("valve.massifs"), 12), [["hydrawise", "start_watering", { entity_id: "binary_sensor.massifs_arrosage", duration: 12 }]]);
  // LinkTap: start_watering on the valve, in seconds.
  same(card._startCalls(zone("valve.potager"), 12), [["linktap", "start_watering", { entity_id: "valve.potager", seconds: 720 }]]);
  // Gardena smart system: a multiple of 60 s, at most 4 h; Rachio: 3 h at most.
  same(card._startCalls(zone("valve.gazon"), 7.6), [["gardena_smart_system", "valve_open", { entity_id: "valve.gazon", duration: 480 }]]);
  same(card._startCalls(zone("valve.gazon"), 600), [["gardena_smart_system", "valve_open", { entity_id: "valve.gazon", duration: 14400 }]]);
  assert.equal(card._maxMinutes(zone("valve.gazon")), 240);
  assert.equal(card._maxMinutes({ entity: "switch.x", platform: "rachio" }), 180);
  // Gardena Bluetooth: its "Open for" number, else its manual watering time number then the valve.
  same(card._startCalls({ entity: "valve.tap", platform: "gardena_bluetooth", openFor: "number.tap_open_for" }, 9), [["number", "set_value", { entity_id: "number.tap_open_for", value: 9 }]]);
  same(card._startCalls({ entity: "valve.tap", platform: "gardena_bluetooth" }, 9), [["valve", "open_valve", { entity_id: "valve.tap" }]]);
  const os = { entity: "switch.front_station_enabled", platform: "opensprinkler" };
  same(card._startCalls(os, 2), [["opensprinkler", "run_station", { entity_id: "switch.front_station_enabled", run_seconds: 120 }]]);
  same(card._stopCalls(os), [["opensprinkler", "stop", { entity_id: "switch.front_station_enabled" }]]);
  same(card._startCalls({ entity: "switch.x", platform: "rachio" }, 5), [["rachio", "start_watering", { entity_id: "switch.x", duration: 5 }]]);
  same(card._startCalls({ entity: "valve.x", platform: "bhyve" }, 5), [["bhyve", "start_watering", { entity_id: "valve.x", minutes: 5 }]]);
  same(card._startCalls({ entity: "valve.x", script: "script.water" }, 5), [["script", "turn_on", { entity_id: "script.water", variables: { zone: "valve.x", minutes: 5 } }]]);
  same(card._startCalls({ entity: "valve.x" }, 5), [["valve", "open_valve", { entity_id: "valve.x" }]]);
  assert.equal(card._defaultMinutes(zone("valve.gazon")), 12);
  // LinkTap: its watering duration number (15 min) comes before the card's default.
  assert.equal(card._defaultMinutes(zone("valve.potager")), 15);
});

test("Stop closes a valve, and an unavailable zone gets disabled buttons and no call", async () => {
  const { card, hass, html } = await mount({}, { overrides: { "valve.gazon": { state: "unavailable" } } });
  click(card, { action: "stop", entity: "valve.potager" });
  await new Promise((r) => setTimeout(r, 0));
  same(hass.calls.filter((c) => c[0] !== "subscribe"), [["valve", "close_valve", { entity_id: "valve.potager" }]]);
  assert.match(html(), /data-action="start" data-entity="valve\.gazon"[^>]*disabled/);
  click(card, { action: "start", entity: "valve.gazon" });
  assert.doesNotMatch(html(), /class="backdrop"/);
});

test("plants: thresholds from the configuration, the Plant Monitor numbers or the defaults; the plant integration's verdict", () => {
  const hass = makeHass({ extraStates: { "plant.basilic": { ...states["plant.basilic"], state: "problem", attributes: { ...states["plant.basilic"].attributes, problem: "conductivity low, brightness high" } } } });
  const m = gc.resolve(hass, {});
  const olive = m.plants.find((p) => p.name === "Olive tree");
  same([...olive.thresholds.moisture], [15, 50]);
  assert.equal(olive.values.moisture, 28);
  const basil = m.plants.find((p) => p.name === "Basil");
  same({ ...basil.problems }, { conductivity: "low", illuminance: "high" });
  assert.equal(basil.values.illuminance, 8200);
  const tomatoes = gc.resolve(hass, { plants: [{ device: "Tomatoes", min_moisture: 10 }] }).plants[0];
  same([...tomatoes.thresholds.moisture], [10, 60]);
  assert.equal(gc.levelOf(14, [20, 60]), "low");
  assert.equal(gc.levelClass("moisture", "low"), "crit");
  assert.equal(gc.levelClass("temperature", "high"), "warn");
});

test("a thirsty plant: red gauge and chip, pulsing drop, and the thirsty garden picture", async () => {
  const { html } = await mount({}, { overrides: thirsty, list: dryForecast });
  assert.match(html(), /Tomatoes: Needs water/);
  assert.match(html(), /class="thirst"/);
  assert.match(html(), /<div class="gauge crit/);
  assert.ok(html().includes(gc.gardenSvg("thirsty")));
});

test("the picture follows what goes on: watering, rain, thirsty", async () => {
  assert.ok((await mount()).html().includes(gc.gardenSvg("watering")));
  assert.ok((await mount({}, { overrides: raining })).html().includes(gc.gardenSvg("rain")));
  for (const a of ["watering", "rain", "thirsty"]) assert.match(decodeURIComponent(gc.gardenSvg(a)), /@keyframes/, a);
  assert.doesNotMatch(decodeURIComponent(gc.gardenSvg(null)), /@keyframes/);
});

test("sections fold on their title, and a click elsewhere folds them back to their defaults", async () => {
  const { card, html } = await mount({ collapsed: ["soil"] });
  assert.match(html(), /data-section="soil" aria-expanded="false"/);
  assert.match(html(), /data-section="plants" aria-expanded="true"/);
  click(card, { action: "toggle_section", section: "plants" });
  assert.match(html(), /data-section="plants" aria-expanded="false"/);
  assert.doesNotMatch(html(), /class="plants"/);
  card.connectedCallback();
  card._outside.tap({ composedPath: () => [] });
  assert.match(html(), /data-section="plants" aria-expanded="true"/);
});

test("folding: a tap elsewhere (pointer), not a drag that ends outside; leaving the page folds back too", async () => {
  const { card, html } = await mount({ collapsed: ["soil"] });
  card.connectedCallback();
  const closed = /data-section="plants" aria-expanded="false"/;
  click(card, { action: "toggle_section", section: "plants" });
  // A slider pressed in the card and released outside of it: nothing goes back.
  card._outside.tap({ composedPath: () => [card] });
  assert.match(html(), closed);
  // Left with the section changed and back: its default again.
  card.disconnectedCallback();
  card.connectedCallback();
  assert.doesNotMatch(html(), closed);
  card.disconnectedCallback();
  const mini = await mount({}, {}, gc.GardenMiniCard);
  mini.card.connectedCallback();
  click(mini.card, { action: "zoom" });
  assert.match(mini.html(), /class="zones"/);
  mini.card.disconnectedCallback();
  mini.card.connectedCallback();
  assert.doesNotMatch(mini.html(), /class="zones"/, "back compact");
  mini.card.disconnectedCallback();
});

test("mini card: compact lines and Stop; the detail button switches to the full card", async () => {
  const { card, html } = await mount({}, {}, gc.GardenMiniCard);
  assert.match(html(), /class="zoom"/);
  assert.match(html(), /Vegetable patch/);
  assert.match(html(), /data-action="stop"/);
  assert.doesNotMatch(html(), /class="zones"/);
  click(card, { action: "zoom" });
  assert.match(html(), /class="zones"/);
  same(card.getGridOptions(), { columns: 12, min_columns: 6, rows: "auto" });
  const noZoom = await mount({ zoom: false }, {}, gc.GardenMiniCard);
  assert.doesNotMatch(noZoom.html(), /class="zoom"/);
});

test("header: tinted round icon, status chip on the right, title options", async () => {
  const { card, html } = await mount({ title: "Backyard", show_subtitle: false });
  assert.match(html(), /<div class="type-icon active">/);
  assert.match(html(), /<div class="name">Backyard<\/div>/);
  assert.equal(card.attrs["hide-subtitle"], true);
  assert.match(html(), /Next watering tomorrow/);
});

test("times: countdowns, today / tomorrow, units", () => {
  assert.equal(gc.fmtCountdown(492e3), "8:12");
  assert.equal(gc.fmtCountdown(3725e3), "1:02:05");
  assert.equal(gc.fmtCountdown(-5), "0:00");
  assert.equal(gc.unitMs("s"), 1e3);
  assert.equal(gc.unitMs("h"), 3.6e6);
  assert.equal(gc.unitMs(undefined), 6e4);
  const tomorrow = Date.parse("2026-06-16T06:00:00Z");
  assert.match(gc.fmtWhen({ language: "en" }, {}, tomorrow), /^tomorrow /);
  assert.match(gc.fmtWhen({ language: "fr" }, {}, NOW + 3.6e6), /^aujourd'hui /);
  assert.equal(gc.timeOf({ entity_id: "calendar.x", state: "off", attributes: { start_time: "2026-06-16 06:00:00" } }), Date.parse("2026-06-16T06:00:00"));
});

test("nothing to show: a clear message instead of an empty card", async () => {
  const card = new gc.GardenCard();
  card.setConfig({ weather: "none", zones: [], plants: [], moisture_sensors: [], plants_auto: false });
  card.hass = { states: {}, entities: {}, devices: {}, language: "en", callService() {} };
  assert.match(card.shadowRoot.innerHTML, /Nothing to show/);
  const old = new gc.GardenCard();
  old.setConfig({});
  old.hass = { states: {}, language: "en" };
  assert.match(old.shadowRoot.innerHTML, /2024\.8/);
});

test("every language has every text, with the same placeholders as English", () => {
  const en = gc.STRINGS.en;
  const langs = Object.keys(gc.STRINGS);
  same(langs.sort(), ["bg", "cs", "da", "de", "el", "en", "es", "fr", "hu", "it", "lv", "nl", "pl", "pt", "ro", "ru", "sk", "sl", "sr", "sr-Latn", "sv", "uk"].sort());
  const ph = (s) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
  for (const l of langs) {
    same(Object.keys(gc.STRINGS[l]), Object.keys(en), l);
    for (const k of Object.keys(en)) same(ph(gc.STRINGS[l][k]), ph(en[k]), `${l}.${k}`);
  }
  assert.equal(gc.lang({ language: "sr-Latn" }, {}), "sr-Latn");
  assert.equal(gc.lang({ language: "de-CH" }, {}), "de");
  assert.equal(gc.intlLocale({ language: "pt" }, {}), "pt-PT");
});

test("visual editor: zone and plant lists edited as entities and devices, YAML options kept, defaults left out", () => {
  const config = { zones: [{ entity: "switch.haie", duration: 25 }, "valve.gazon"], plants: ["plant.basilic", { device: "flora", min_moisture: 10 }] };
  const form = gc.toForm(config);
  same([...form.zone_entities], ["switch.haie", "valve.gazon"]);
  same([...form.plant_entities], ["plant.basilic"]);
  same([...form.plant_devices], ["flora"]);
  const back = gc.fromForm({ ...form, zone_entities: ["switch.haie"] }, config);
  same(JSON.parse(JSON.stringify(back.zones)), [{ entity: "switch.haie", duration: 25 }]);
  same(JSON.parse(JSON.stringify(back.plants)), ["plant.basilic", { device: "flora", min_moisture: 10 }]);
  assert.equal(typeof gc.GardenCard.getConfigElement, "function");
  same(gc.GardenCard.getStubConfig(), {});
  assert.ok(gc.window.customCards.some((c) => c.type === "garden-mini-card"));
});

test("every clickable element can be reached and used from the keyboard", async () => {
  for (const Card of [gc.GardenCard, gc.GardenMiniCard]) {
    const { html } = await mount({}, {}, Card);
    const tags = html().match(/<[a-z-]+\b[^>]*\bdata-(?:entity|action)="[^"]*"[^>]*>/g) || [];
    assert.ok(tags.length > 3);
    for (const tag of tags) {
      if (tag.startsWith("<button")) continue;
      assert.match(tag, /\brole="button"/, tag);
      assert.match(tag, /\btabindex="0"/, tag);
    }
  }
});
