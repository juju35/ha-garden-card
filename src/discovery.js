// ---------------------------------------------------------------------------
// Discovery: zones, plants, soil sensors and weather from the registries (or the configuration)
// ---------------------------------------------------------------------------
import { PLATFORMS, READINGS, THRESHOLDS, mins } from "./core.js";
import { asList, domainOf, num } from "./helpers.js";

export const _cache = new WeakMap();

// Registry entries by device, built once per hass.entities object.
export const byDevice = (hass) => {
  const hit = _cache.get(hass.entities);
  if (hit) return hit;
  const map = new Map();
  for (const e of Object.values(hass.entities)) {
    if (!e.device_id || e.hidden || e.disabled_by) continue;
    if (!map.has(e.device_id)) map.set(e.device_id, []);
    map.get(e.device_id).push(e);
  }
  _cache.set(hass.entities, map);
  return map;
};

export const devName = (d) => d?.name_by_user || d?.name || "";
export const nameOf = (hass, id, fallback) => fallback || hass.states[id]?.attributes?.friendly_name || id;
// Devices by display or registry name (the first device that has it, as a scan would find), built once per device registry object.
export const devByName = new WeakMap();
export const findDev = (hass, ref) => {
  if (!ref || !hass.devices) return null;
  if (hass.devices[ref]) return hass.devices[ref];
  let names = devByName.get(hass.devices);
  if (!names) {
    names = new Map();
    for (const d of Object.values(hass.devices)) for (const n of [devName(d), d.name]) if (n && !names.has(n)) names.set(n, d);
    devByName.set(hass.devices, names);
  }
  return names.get(ref) || null;
};
// What an entity is called, to recognise it: its id, translation key and names (registry and state), as snake_case.
export const keyText = (e, hass) =>
  [e.entity_id, e.translation_key, e.original_name, e.name, hass?.states[e.entity_id]?.attributes?.friendly_name]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
export const deviceClass = (hass, id) => hass.states[id]?.attributes?.device_class;

// The entity of a device whose domain and text (entity id + translation key) match.
export const pick = (hass, list, domain, re, test = () => true) => list.find((e) => domainOf(e.entity_id) === domain && re.test(keyText(e, hass)) && test(e))?.entity_id;

// A SONOFF Zigbee water valve (SWV, SWV-Z…) as Zigbee2MQTT describes it in the device registry.
export const isSonoffSwv = (d) => !!d && /sonoff/i.test(d.manufacturer || "") && /\bSWV\b|\(SWV|^SWV/i.test(`${d.model_id || ""} ${d.model || ""}`);
// Zigbee2MQTT's timed run of a SONOFF SWV: once, for `min` minutes (the valve takes up to 24 h).
export const swvPayload = (min) => JSON.stringify({ cyclic_timed_irrigation: { current_count: 0, total_number: 1, irrigation_duration: mins(min, 1440) * 60, irrigation_interval: 0 } });

// A zone: { entity, name, platform, device, remaining, total, next, durationEntity, watering, running, moisture, … }.
export const buildZone = (hass, item, entry, siblings, single) => {
  const cfg = typeof item === "string" ? { entity: item } : { ...item };
  const id = cfg.entity;
  const platform = entry?.platform;
  // Device-wide entities are only a zone's own when the device holds this one zone (a Rain Bird controller holds all of them).
  const list = single ? siblings : [];
  const ts = (e) => deviceClass(hass, e.entity_id) === "timestamp";
  const zone = {
    entity: id,
    name: nameOf(hass, id, cfg.name),
    platform,
    script: cfg.script,
    duration: Number(cfg.duration) || null,
    remaining: cfg.remaining ?? pick(hass, list, "sensor", /remain|time_left|left_time|valve_closing|closing|end_time/),
    total: cfg.total ?? pick(hass, list, "sensor", /total_duration|run_duration/),
    next: cfg.next_run ?? pick(hass, list, "sensor", /next/, ts),
    durationEntity: cfg.duration_entity ?? pick(hass, list, "number", /duration|watering_time|run_time|irrigation_time|manual_watering/),
    watering: cfg.watering ?? pick(hass, list, "binary_sensor", /watering/),
    moisture: cfg.moisture ?? pick(hass, list, "sensor", /./, (e) => deviceClass(hass, e.entity_id) === "moisture"),
  };
  // SONOFF SWV water valves on Zigbee2MQTT: no duration entity, but the valve takes a timed run of its own
  // (cyclic_timed_irrigation, published on its set topic) and closes itself, whatever becomes of Home Assistant.
  const dev = entry?.device_id ? hass.devices?.[entry.device_id] : null;
  if (cfg.z2m_topic || (platform === "mqtt" && !zone.durationEntity && isSonoffSwv(dev))) {
    zone.z2mTopic = String(cfg.z2m_topic || `zigbee2mqtt/${dev.name}`).replace(/\/set$/, "");
  }
  if (platform === "gardena_bluetooth") zone.openFor = cfg.open_for ?? pick(hass, list, "number", /remaining_open_set/);
  if (platform === "opensprinkler" && /_station_enabled$/.test(id)) {
    zone.running = cfg.running ?? id.replace(/^switch\./, "binary_sensor.").replace(/_station_enabled$/, "_station_running");
  } else if (cfg.running) zone.running = cfg.running;
  return zone;
};

export const resolveZones = (hass, config) => {
  const devs = byDevice(hass);
  const entry = (id) => hass.entities[id];
  const zoneItems = asList(config.zones);
  const items = zoneItems.length
    ? zoneItems
    : Object.values(hass.entities)
        .filter((e) => {
          const p = PLATFORMS[e.platform];
          const d = domainOf(e.entity_id);
          // LinkTap has a switch and a valve for the same tap: its platform lists the valve only.
          if (!p?.domains.includes(d) || e.hidden || e.disabled_by || !hass.states[e.entity_id]) return false;
          return !p.zone || p.zone(e, hass.states[e.entity_id]);
        })
        .map((e) => e.entity_id)
        .sort((a, b) => nameOf(hass, a).localeCompare(nameOf(hass, b)));
  const ids = items.map((i) => (typeof i === "string" ? i : i?.entity)).filter(Boolean);
  return items
    .filter((i) => (typeof i === "string" ? i : i?.entity))
    .map((item) => {
      const id = typeof item === "string" ? item : item.entity;
      const e = entry(id);
      const siblings = (e?.device_id && devs.get(e.device_id)) || [];
      const zonesHere = siblings.filter((s) => ids.includes(s.entity_id)).length;
      return buildZone(hass, item, e, siblings, zonesHere <= 1);
    });
};

// Sensors of a device by reading, from their device class (conductivity: its unit for older integrations).
export const deviceReadings = (hass, list) => {
  const out = {};
  for (const e of list) {
    if (domainOf(e.entity_id) !== "sensor") continue;
    const a = hass.states[e.entity_id]?.attributes || {};
    const key =
      a.device_class === "moisture"
        ? "moisture"
        : a.device_class === "conductivity" || /µS\/cm|uS\/cm/.test(a.unit_of_measurement || "")
          ? "conductivity"
          : a.device_class === "illuminance"
            ? "illuminance"
            : a.device_class === "temperature"
              ? "temperature"
              : a.device_class === "battery"
                ? "battery"
                : null;
    if (key && !out[key]) out[key] = e.entity_id;
  }
  return out;
};

// Thresholds of a plant from number entities on its device (the Plant Monitor integration: min_soil_moisture…).
export const deviceThresholds = (hass, list) => {
  const out = {};
  for (const e of list) {
    if (domainOf(e.entity_id) !== "number") continue;
    const m = keyText(e, hass).match(/(min|max)_(soil_moisture|moisture|conductivity|illuminance|temperature)/);
    if (!m) continue;
    const key = m[2] === "soil_moisture" ? "moisture" : m[2];
    (out[key] ||= [null, null])[m[1] === "min" ? 0 : 1] = e.entity_id;
  }
  return out;
};

// A plant: { id, name, entity, image, sensors: { moisture: entity…}, values: { moisture: n… }, units, thresholds, problems }.
export const buildPlant = (hass, item) => {
  const devs = byDevice(hass);
  const cfg = typeof item === "string" ? (domainOf(item) === "plant" ? { entity: item } : { device: item }) : { ...item };
  const st = cfg.entity ? hass.states[cfg.entity] : null;
  const dev = cfg.device ? findDev(hass, cfg.device) : cfg.entity && hass.entities[cfg.entity]?.device_id ? hass.devices?.[hass.entities[cfg.entity].device_id] : null;
  const list = (dev && devs.get(dev.id)) || [];
  const sensors = { ...deviceReadings(hass, list) };
  const values = {};
  const units = {};
  // The plant integration keeps its readings as attributes, and the sensors they come from in `sensors`.
  const a = st?.attributes || {};
  const attrKey = { moisture: "moisture", conductivity: "conductivity", illuminance: "brightness", temperature: "temperature", battery: "battery" };
  for (const k of READINGS) {
    if (cfg[k]) sensors[k] = cfg[k];
    else if (!sensors[k] && a.sensors?.[attrKey[k]]) sensors[k] = a.sensors[attrKey[k]];
    const s = sensors[k] ? hass.states[sensors[k]] : null;
    if (s) {
      values[k] = num(s);
      units[k] = s.attributes?.unit_of_measurement;
    } else if (a[attrKey[k]] !== undefined && Number.isFinite(parseFloat(a[attrKey[k]]))) values[k] = parseFloat(a[attrKey[k]]);
    else values[k] = undefined;
  }
  const numbers = deviceThresholds(hass, list);
  const thresholds = {};
  for (const k of READINGS) {
    const def = THRESHOLDS[k];
    const fromNum = (i) => {
      const id = numbers[k]?.[i];
      return id ? num(hass.states[id]) : null;
    };
    thresholds[k] = [cfg[`min_${k}`] ?? fromNum(0) ?? def[0], cfg[`max_${k}`] ?? fromNum(1) ?? def[1]];
  }
  // "moisture low, conductivity high": the plant integration's own verdict.
  const problems = {};
  if (st?.state === "problem") {
    for (const part of String(a.problem || "").split(",")) {
      const m = part.trim().match(/^(\w+)\s+(low|high)$/);
      if (m) problems[m[1] === "brightness" ? "illuminance" : m[1]] = m[2];
    }
  }
  return {
    // What the plant was built from: its readings are read again from it on every state change (see refreshPlants).
    item,
    // The number entities its thresholds come from (Plant Monitor), watched like its sensors.
    limits: Object.values(numbers).flat().filter(Boolean),
    id: cfg.entity || dev?.id || cfg.name,
    name: cfg.name || (st && (a.friendly_name || cfg.entity)) || devName(dev) || "?",
    entity: cfg.entity || null,
    image: cfg.image || a.entity_picture || null,
    sensors,
    values,
    units,
    thresholds,
    problems,
  };
};

// Plants: the configured ones, else every plant entity and every device with soil moisture plus fertility or light
// sensors (Mi Flora, other plant sensors) that holds no plant entity.
export const resolvePlants = (hass, config) => {
  if (config.plants !== undefined && !(Array.isArray(config.plants) && !config.plants.length && config.plants_auto !== false)) {
    return asList(config.plants).map((p) => buildPlant(hass, p));
  }
  const devs = byDevice(hass);
  const plantEntities = Object.keys(hass.states)
    .filter((id) => domainOf(id) === "plant" && !hass.entities[id]?.hidden)
    .sort();
  const plantDevices = new Set(plantEntities.map((id) => hass.entities[id]?.device_id).filter(Boolean));
  const sensorDevices = [];
  for (const [id, list] of devs) {
    if (plantDevices.has(id)) continue;
    const r = deviceReadings(hass, list);
    if (r.moisture && (r.conductivity || r.illuminance)) sensorDevices.push(id);
  }
  sensorDevices.sort((a, b) => devName(hass.devices?.[a]).localeCompare(devName(hass.devices?.[b])));
  return [...plantEntities, ...sensorDevices.map((d) => ({ device: d }))].map((p) => buildPlant(hass, p));
};

// Soil moisture sensors: the configured ones, else the moisture sensors that belong to no plant and no zone.
export const resolveSoil = (hass, config, plants, zones) => {
  const items = asList(config.moisture_sensors);
  if (items.length) return items.map((i) => (typeof i === "string" ? { entity: i } : { ...i })).filter((i) => i.entity);
  const taken = new Set([...plants.flatMap((p) => Object.values(p.sensors)), ...zones.map((z) => z.moisture)]);
  const plantDevices = new Set(
    plants
      .map((p) => (p.entity ? hass.entities[p.entity]?.device_id : hass.devices?.[p.id] ? p.id : null))
      .filter(Boolean),
  );
  return Object.values(hass.entities)
    .filter((e) => domainOf(e.entity_id) === "sensor" && !e.hidden && !taken.has(e.entity_id) && !plantDevices.has(e.device_id))
    .filter((e) => deviceClass(hass, e.entity_id) === "moisture")
    .map((e) => ({ entity: e.entity_id }))
    .sort((a, b) => nameOf(hass, a.entity).localeCompare(nameOf(hass, b.entity)));
};

export const resolveWeather = (hass, config) => {
  if (config.weather === false || config.weather === "none") return null;
  if (config.weather) return config.weather;
  return Object.keys(hass.states)
    .filter((id) => domainOf(id) === "weather")
    .sort()[0];
};

// The readings of the plants (values, thresholds from number entities, the plant integration's verdict) come from
// states: the model is kept across state changes, so they are read again once per new set of states.
export const refreshPlants = (hass, m) => {
  if (!m || m.states === hass.states) return m;
  m.states = hass.states;
  m.plants = m.plants.map((p) => buildPlant(hass, p.item));
  return m;
};

// Everything the card shows, memoized per registries / config object.
export const resolve = (hass, config) => {
  if (!hass.entities || !hass.devices) return null;
  const zones = resolveZones(hass, config);
  const plants = resolvePlants(hass, config);
  const soil = resolveSoil(hass, config, plants, zones);
  return { zones, plants, soil, weather: resolveWeather(hass, config) };
};

// Runs started by the card (end, total), and the length first seen for a run reported by its remaining time:
// shared by every card of the page, so the full and the mini card show the same countdown.
export const RUNS = new Map();
