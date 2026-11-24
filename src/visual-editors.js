// ---------------------------------------------------------------------------
// Visual editors (ha-form)
// ---------------------------------------------------------------------------
import { DEFAULT_COLLAPSED } from "./core.js";
import { asList, domainOf, lang, t } from "./helpers.js";

export const LANGUAGES = [
  ["en", "English"],
  ["fr", "Français"],
  ["de", "Deutsch"],
  ["es", "Español"],
  ["sr", "Српски"],
  ["sr-Latn", "Srpski (latinica)"],
  ["it", "Italiano"],
  ["nl", "Nederlands"],
  ["pt", "Português (Portugal)"],
  ["pl", "Polski"],
  ["ro", "Română"],
  ["da", "Dansk"],
  ["sv", "Svenska"],
  ["bg", "Български"],
  ["ru", "Русский"],
  ["uk", "Українська"],
  ["hu", "Magyar"],
  ["sk", "Slovenčina"],
  ["cs", "Čeština"],
  ["sl", "Slovenščina"],
  ["lv", "Latviešu"],
  ["el", "Ελληνικά"],
];

// Config → form data: the zone and plant lists are edited as entity / device lists, the rest as is.
export const toForm = (config) => {
  const data = { ...config };
  const zones = asList(config.zones);
  data.zone_entities = zones.map((z) => (typeof z === "string" ? z : z?.entity)).filter(Boolean);
  const plants = asList(config.plants);
  data.plant_entities = plants.map((p) => (typeof p === "string" && domainOf(p) === "plant" ? p : p?.entity)).filter(Boolean);
  data.plant_devices = plants.map((p) => (typeof p === "string" && domainOf(p) !== "plant" ? p : p?.device)).filter(Boolean);
  data.moisture_sensors = asList(config.moisture_sensors).map((s) => (typeof s === "string" ? s : s?.entity)).filter(Boolean);
  delete data.zones;
  delete data.plants;
  return data;
};

// Form data → config, keeping the options of a zone or plant written in YAML (name, duration, thresholds…).
export const fromForm = (value, previous) => {
  const config = { ...value };
  const keep = (list, id, key) => asList(list).find((x) => x && typeof x === "object" && x[key] === id) || id;
  const zones = asList(value.zone_entities).map((id) => keep(previous.zones, id, "entity"));
  // Plants made of sensors in YAML (no `entity`, no `device`) have no field in the form: kept as they are.
  const bySensors = asList(previous.plants).filter((p) => p && typeof p === "object" && !p.entity && !p.device);
  const plants = [
    ...asList(value.plant_entities).map((id) => keep(previous.plants, id, "entity")),
    ...asList(value.plant_devices).map((d) => keep(previous.plants, d, "device")),
    ...bySensors,
  ];
  const soil = asList(value.moisture_sensors).map((id) => keep(previous.moisture_sensors, id, "entity"));
  delete config.zone_entities;
  delete config.plant_entities;
  delete config.plant_devices;
  delete config.moisture_sensors;
  if (zones.length) config.zones = zones;
  if (plants.length) config.plants = plants.map((p) => (typeof p === "string" && domainOf(p) !== "plant" ? { device: p } : p));
  if (soil.length) config.moisture_sensors = soil;
  return config;
};

export class GardenEditorBase extends HTMLElement {
  static get toggles() {
    return [];
  }

  setConfig(config) {
    this._config = { ...config };
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  _schema() {
    const tr = (k) => t(this._hass, this._config, k);
    return [
      { name: "title", selector: { text: {} } },
      { name: "zone_entities", selector: { entity: { multiple: true, domain: ["valve", "switch"] } } },
      { name: "plant_entities", selector: { entity: { multiple: true, domain: "plant" } } },
      { name: "plant_devices", selector: { device: { multiple: true, entity: { domain: "sensor", device_class: "moisture" } } } },
      { name: "moisture_sensors", selector: { entity: { multiple: true, domain: "sensor", device_class: "moisture" } } },
      { name: "weather", selector: { entity: { domain: "weather" } } },
      { name: "rain_sensor", selector: { entity: { domain: "sensor" } } },
      { name: "next_run", selector: { entity: { domain: ["sensor", "input_datetime", "calendar"] } } },
      {
        type: "grid",
        name: "",
        schema: [
          { name: "rain_threshold", selector: { number: { min: 0, max: 100, step: 0.5, mode: "box" } } },
          { name: "rain_probability", selector: { number: { min: 0, max: 100, step: 5, mode: "box", unit_of_measurement: "%" } } },
          { name: "rain_window", selector: { number: { min: 1, max: 72, step: 1, mode: "box", unit_of_measurement: "h" } } },
          { name: "default_duration", selector: { number: { min: 1, max: 240, step: 1, mode: "box", unit_of_measurement: "min" } } },
        ],
      },
      { type: "grid", name: "", schema: this.constructor.toggles.map(([name]) => ({ name, selector: { boolean: {} } })) },
      {
        name: "illustration_theme",
        selector: { select: { mode: "dropdown", options: ["auto", "day", "night"].map((value) => ({ value, label: tr(`theme_${value}`) })) } },
      },
      {
        name: "collapsed",
        selector: { select: { multiple: true, mode: "list", options: ["zones", "plants", "soil"].map((value) => ({ value, label: tr(value) })) } },
      },
      { name: "language", selector: { select: { mode: "dropdown", options: [{ value: "", label: tr("lang_auto") }, ...LANGUAGES.map(([value, label]) => ({ value, label }))] } } },
    ];
  }

  _render() {
    if (!this._hass || !this._config) return;
    const toggles = this.constructor.toggles;
    if (!this._form) {
      this._form = document.createElement("ha-form");
      this._form.computeLabel = (s) => t(this._hass, this._config, s.name);
      this._form.computeHelper = (s) => (s.name === "zoom" ? t(this._hass, this._config, "zoom_helper") : undefined);
      this._form.addEventListener("value-changed", (ev) => {
        ev.stopPropagation();
        const defaults = { ...Object.fromEntries(toggles), rain_threshold: 2, rain_probability: 70, rain_window: 24, illustration_theme: "auto", collapsed: DEFAULT_COLLAPSED };
        const config = fromForm(ev.detail.value, this._config);
        for (const [k, v] of Object.entries(config)) {
          // Keep the YAML minimal: no empty values, no options left at their default.
          if (v === "" || v === undefined || v === null || (Array.isArray(v) && !v.length) || (k in defaults && JSON.stringify(v) === JSON.stringify(defaults[k]))) delete config[k];
        }
        this._config = config;
        this.dispatchEvent(new CustomEvent("config-changed", { detail: { config }, bubbles: true, composed: true }));
      });
      this.appendChild(this._form);
    }
    const data = { rain_threshold: 2, rain_probability: 70, rain_window: 24, illustration_theme: "auto", ...toForm(this._config) };
    for (const [name, def] of toggles) if (data[name] === undefined) data[name] = def;
    this._form.hass = this._hass;
    if (this._formConfig !== this._config) {
      this._formConfig = this._config;
      this._form.data = data;
    }
    const l = lang(this._hass, this._config);
    if (this._schemaLang !== l) {
      this._schemaLang = l;
      this._form.schema = this._schema();
    }
  }
}

export class GardenCardEditor extends GardenEditorBase {
  static get toggles() {
    return [
      ["illustration", true],
      ["show_title", true],
      ["show_subtitle", true],
      ["show_weather", true],
      ["show_zones", true],
      ["show_plants", true],
      ["show_soil", true],
    ];
  }
}

// The mini card's detail view is the full card: its editor offers the full card's options, plus the detail button.
export class GardenMiniCardEditor extends GardenCardEditor {
  static get toggles() {
    return [...GardenCardEditor.toggles, ["zoom", true]];
  }
}
