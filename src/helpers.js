// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
import { UNITS } from "./core.js";
import { STRINGS } from "./i18n/strings.js";

export const esc = (v) =>
  String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

export const lang = (hass, config) => {
  const l = config?.language || (hass && (hass.locale?.language || hass.language)) || "en";
  return STRINGS[l] ? l : STRINGS[l.split("-")[0]] ? l.split("-")[0] : "en";
};

// Locale for Intl: the card's language, or Home Assistant's full locale when it has the same base (pt-BR, de-CH).
// A bare "pt" (Home Assistant's code for European Portuguese) becomes "pt-PT", otherwise Intl formats it the Brazilian way.
export const intlLocale = (hass, config) => {
  const l = lang(hass, config);
  const src = config?.language || (hass && (hass.locale?.language || hass.language)) || "";
  const out = src && src.split("-")[0] === l.split("-")[0] ? src : l;
  return out === "pt" ? "pt-PT" : out;
};

export const t = (hass, config, key, vars = {}) =>
  String(STRINGS[lang(hass, config)][key] ?? STRINGS.en[key] ?? key).replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? "");

export const valid = (s) => !!s && !["unknown", "unavailable", ""].includes(s.state);

export const num = (s) => {
  if (!valid(s)) return null;
  const v = parseFloat(s.state);
  return Number.isFinite(v) ? v : null;
};

export const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
// Attributes of an element that opens an entity's more-info (nothing without an entity).
export const moreInfo = (id) => (id ? ` role="button" tabindex="0" data-entity="${esc(id)}"` : "");
export const svgIcon = (path, cls = "") => `<svg class="icon ${cls}" viewBox="0 0 24 24" aria-hidden="true"><path d="${path}"/></svg>`;
export const domainOf = (id) => String(id || "").split(".")[0];
export const asList = (v) => (Array.isArray(v) ? v : v ? [v] : []);

// Milliseconds in one unit of a duration entity (minutes when it has no unit).
export const unitMs = (unit) => ({ s: 1e3, sec: 1e3, seconds: 1e3, min: 6e4, minutes: 6e4, h: 3.6e6, hours: 3.6e6, d: 8.64e7 })[String(unit || "min").toLowerCase()] ?? 6e4;

// "8:12", "1:05:00": a countdown, rounded up to the second.
export const fmtCountdown = (ms) => {
  const s = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = String(s % 60).padStart(2, "0");
  return h ? `${h}:${String(m).padStart(2, "0")}:${ss}` : `${m}:${ss}`;
};

export const NUM_FMT = {};
export const fmtNum = (v, digits, locale) =>
  (NUM_FMT[`${locale}|${digits}`] ??= new Intl.NumberFormat(locale, { maximumFractionDigits: digits, minimumFractionDigits: 0 })).format(v);

// A reading as shown: whole percentages, one decimal for temperatures, no decimal for conductivity and light.
export const fmtReading = (key, v, unit, locale) => {
  if (v === null || v === undefined) return "—";
  const digits = key === "temperature" ? 1 : 0;
  const u = unit ?? UNITS[key];
  return u === "%" ? `${Math.round(v)} %` : `${fmtNum(v, digits, locale)} ${u}`;
};

// A time stamp of a sensor (timestamp), an input_datetime or a calendar (next event start), in ms; null otherwise.
export const parseLocal = (s) => {
  const v = Date.parse(String(s || "").replace(" ", "T"));
  return Number.isFinite(v) ? v : null;
};
export const timeOf = (s) => {
  if (!valid(s)) return null;
  const d = domainOf(s.entity_id);
  if (d === "calendar") return parseLocal(s.attributes?.start_time);
  if (d === "input_datetime") return s.attributes?.timestamp ? s.attributes.timestamp * 1000 : parseLocal(s.state);
  return parseLocal(s.state);
};

export const DAY_MS = 8.64e7;
export const startOfDay = (ms) => {
  const d = new Date(ms);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};
// "today 18:00", "tomorrow 06:00", "Tue 06:00", "Jun 24, 06:00".
export const fmtWhen = (hass, config, ms) => {
  const locale = intlLocale(hass, config);
  const time = new Date(ms).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
  const days = Math.round((startOfDay(ms) - startOfDay(Date.now())) / DAY_MS);
  if (days === 0) return t(hass, config, "today", { time });
  if (days === 1) return t(hass, config, "tomorrow", { time });
  if (days > 1 && days < 7) return `${new Date(ms).toLocaleDateString(locale, { weekday: "short" })} ${time}`;
  return new Date(ms).toLocaleString(locale, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
};

// Rain expected in the next `hours` hours from a forecast list ({ datetime, precipitation, precipitation_probability }):
// an entry counts for the part of it inside the window. null when no entry covers the window.
export const SPANS = { hourly: 3.6e6, twice_daily: 4.32e7, daily: 8.64e7 };
export const rainOutlook = (list, type, now, hours) => {
  const span = SPANS[type] ?? SPANS.hourly;
  const end = now + hours * 3.6e6;
  let amount = 0;
  let prob = null;
  let n = 0;
  for (const f of asList(list)) {
    const at = Date.parse(f?.datetime);
    if (!Number.isFinite(at) || at + span <= now || at >= end) continue;
    const part = (Math.min(at + span, end) - Math.max(at, now)) / span;
    amount += (Number(f.precipitation) || 0) * part;
    const p = Number(f.precipitation_probability);
    if (f.precipitation_probability !== undefined && f.precipitation_probability !== null && Number.isFinite(p)) prob = Math.max(prob ?? 0, p);
    n++;
  }
  return n ? { amount, prob } : null;
};

// Status of a reading against its thresholds: "low", "high" or "ok" (null: no value).
export const levelOf = (v, [min, max]) => (v === null || v === undefined ? null : min !== null && min !== undefined && v < min ? "low" : max !== null && max !== undefined && v > max ? "high" : "ok");
// Moisture below its minimum is the alert of a garden card (the plant needs water); the rest is a warning.
export const levelClass = (key, level) => (level === "low" && key === "moisture" ? "crit" : level === "low" || level === "high" ? "warn" : "ok");

// Position of a value on a gauge (0..1): light on a logarithmic scale, conductivity up to beyond its maximum.
export const scaleOf = (key, range, v) => {
  if (key === "illuminance") return { lo: 1, hi: 5, f: (x) => Math.log10(Math.max(10, x)) };
  if (key === "temperature") return { lo: -10, hi: 45, f: (x) => x };
  if (key === "conductivity") return { lo: 0, hi: Math.max(1000, (range[1] ?? 3000) * 1.33, (v ?? 0) * 1.1), f: (x) => x };
  return { lo: 0, hi: 100, f: (x) => x };
};
export const posOf = (key, range, v, x) => {
  const s = scaleOf(key, range, v);
  return clamp((s.f(x) - s.lo) / (s.hi - s.lo), 0, 1);
};
