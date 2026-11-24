// ---------------------------------------------------------------------------
// Cards
// ---------------------------------------------------------------------------
import { DEFAULT_COLLAPSED, ICONS, PLATFORMS, PRESETS, RAINY, READINGS, THRESHOLDS, UNITS } from "./core.js";
import { gardenSvg, gcIsNight, gcSceneSvg } from "./drawn-picture.js";
import { asList, clamp, domainOf, esc, fmtCountdown, fmtNum, fmtReading, fmtWhen, intlLocale, levelClass, levelOf, moreInfo, num, parseLocal, posOf, rainOutlook, svgIcon, t, timeOf, unitMs, valid } from "./helpers.js";
import { RUNS, nameOf, refreshPlants, resolve, swvPayload } from "./discovery.js";
import { morph, textWidth } from "./dom-patching.js";
import { BANNER_STYLE, BASE_STYLE, CONFIRM_GUARD_MS, DIALOG_STYLE, FOCUS_SELECTOR, FULL_STYLE, MINI_STYLE, RING_C, focusKey, isOutside, watchOutside } from "./styles.js";

export class GardenCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._html = "";
    // No rewrite of the card between a press and its click: Home Assistant updates the card several times a second,
    // and a rewrite under the pointer replaces the element pressed, so that the click lands on the card itself and
    // does nothing. The update held back is drawn once released: by the click (registered before the card's own
    // handler, which renders at once), else right after the release.
    this._onPress = () => {
      this._byPointer = true;
      this._pressing = true;
      window.addEventListener("pointerup", this._onPressEnd, true);
      window.addEventListener("pointercancel", this._onPressEnd, true);
    };
    this._onPressEnd = () => {
      window.removeEventListener("pointerup", this._onPressEnd, true);
      window.removeEventListener("pointercancel", this._onPressEnd, true);
      setTimeout(() => {
        this._pressing = false;
        if (this._dirty) this._update();
      }, 0);
    };
    this._onPressClick = (ev) => {
      if (ev.detail === 0) this._byPointer = false;
      this._pressing = false;
    };
    this.shadowRoot.addEventListener("pointerdown", this._onPress);
    this.shadowRoot.addEventListener("click", this._onPressClick);
    // From the keyboard, the focus is kept across rewrites (with the pointer it would draw the focus ring).
    this.shadowRoot.addEventListener("keydown", () => {
      this._byPointer = false;
    });
    this.shadowRoot.addEventListener("click", (ev) => this._onClick(ev));
    // Enter / Space on an element with the button role acts as a click, as on a <button>.
    this.shadowRoot.addEventListener("keydown", (ev) => {
      if ((ev.key !== "Enter" && ev.key !== " ") || ev.target?.getAttribute?.("role") !== "button") return;
      ev.preventDefault();
      ev.target.click();
    });
    this._onKey = (ev) => {
      if (ev.key !== "Escape" || !this._dialog) return;
      ev.stopPropagation();
      this._closeDialog();
    };
  }

  static getConfigElement() {
    return document.createElement("garden-card-editor");
  }

  static getStubConfig() {
    return {};
  }

  getCardSize() {
    return 8;
  }

  getGridOptions() {
    return { columns: 12, min_columns: 6 };
  }

  setConfig(config) {
    if (!config) throw new Error("Invalid configuration");
    this._config = { ...config };
    this.toggleAttribute?.("hide-title", config.show_title === false);
    this.toggleAttribute?.("hide-subtitle", config.show_subtitle === false);
    this._html = "";
    this._lastDeps = null;
    this._model = null;
    this._update();
  }

  // Home Assistant pushes a new hass on every state change of the whole instance: the card is only rebuilt when
  // something it shows changed (see _deps).
  set hass(hass) {
    this._hass = hass;
    const deps = this._deps();
    const prev = this._lastDeps;
    if (deps && prev && deps.length === prev.length && deps.every((d, i) => d === prev[i])) return;
    this._lastDeps = deps;
    this._update();
  }

  get hass() {
    return this._hass;
  }

  // The registries, the language, the theme, the state objects the card reads, the forecast and the minute (the
  // "today / tomorrow" texts move on their own).
  _deps() {
    const h = this._hass;
    if (!h || !this._config) return null;
    const m = this._resolve(false);
    if (!m) return null;
    const ids = this._entityIds(m);
    return [h.entities, h.devices, h.language, h.locale, h.themes?.darkMode, this._forecast, Math.floor(Date.now() / 6e4), ...ids.map((id) => h.states[id])];
  }

  // The model is rebuilt when the registries or the set of entities change (a new entity, a device renamed).
  // `fresh: false` (the dependency check, on every state change of the instance) skips reading the plants again.
  _resolve(fresh = true) {
    const h = this._hass;
    const key = [h.entities, h.devices, Object.keys(h.states).length];
    if (this._model && this._modelKey?.every((k, i) => k === key[i])) return fresh ? refreshPlants(h, this._model) : this._model;
    this._modelKey = key;
    this._model = resolve(h, this._config);
    if (this._model) this._model.states = h.states;
    return this._model;
  }

  _entityIds(m) {
    const z = m.zones.flatMap((z) => [z.entity, z.remaining, z.total, z.next, z.durationEntity, z.watering, z.running, z.moisture]);
    const p = m.plants.flatMap((p) => [p.entity, ...Object.values(p.sensors), ...(p.limits || [])]);
    return [...z, ...p, ...m.soil.map((s) => s.entity), m.weather, this._config.rain_sensor, this._config.next_run].filter(Boolean);
  }

  connectedCallback() {
    // A click elsewhere on the page folds the sections back to their defaults and closes the popup.
    this._outside ??= watchOutside(
      (ev) => isOutside(this, ev),
      () => {
        if (!this._toggled?.size && !this._dialog) return;
        this._toggled = new Map();
        if (this._dialog) this._closeDialog();
        else this._update();
      },
    );
    this._outside.on();
    if (this._dialog) window.addEventListener("keydown", this._onKey);
    clearInterval(this._tick);
    this._tick = setInterval(() => {
      if (this._hass) this.hass = this._hass;
    }, 60000);
    this._fcEntity = undefined;
    if (!this._fitObserver && typeof ResizeObserver === "function") this._fitObserver = new ResizeObserver(() => this._fitPill());
    this._fitObserver?.observe(this);
    document.fonts?.ready?.then(() => this._fitPill());
    this._update();
  }

  // The banner's status pill, measured after each render and on a new width (in every language): it sits at the
  // right end of the title's row only when the whole title and the pill's whole label fit there; otherwise it
  // takes a line of its own under the subtitle (.below), the title whole on its row (cut only when it does not fit
  // alone) and the subtitle on one line. When the three lines do not fit in the banner above the lawn, or the label
  // not on its line, the pill shows its dot alone (.dot-only): beside the title when the whole title leaves it room, else under the subtitle.
  _fitPill() {
    // Home Assistant's <ha-card> (a Lit element) shows its content only from its first update, a microtask after it
    // is connected: measured before, everything is 0 px wide and the pill lands on the wrong line. Fitted then.
    const haCard = this.shadowRoot?.querySelector?.("ha-card");
    if (haCard && haCard.hasUpdated === false) {
      this._pillWait ??= (haCard.updateComplete?.then ? haCard.updateComplete : new Promise((r) => requestAnimationFrame(r))).then(() => {
        this._pillWait = null;
        this._fitPill();
      });
      return;
    }
    for (const t of this.shadowRoot?.querySelectorAll?.(".htext .titles") || []) {
      const row = t.querySelector(".trow");
      const chip = row?.querySelector(".chip");
      if (!chip?.getBoundingClientRect) continue;
      t.classList.remove("below", "dot-only");
      const name = row.querySelector(".name");
      const gap = parseFloat(getComputedStyle(row).columnGap) || 0;
      const room = row.getBoundingClientRect().width;
      const title = name && getComputedStyle(name).display !== "none" ? textWidth(name) + gap : 0;
      if (title + chip.getBoundingClientRect().width <= room) continue;
      t.classList.add("below");
      const banner = t.closest(".banner");
      const ground = banner.querySelector(".gc-ground");
      const floor = ground ? ground.getBoundingClientRect().top : banner.getBoundingClientRect().bottom;
      const box = t.getBoundingClientRect();
      const tx = chip.querySelector(".chip-text");
      const whole = !tx || tx.scrollWidth <= tx.clientWidth + 0.5;
      if (whole && box.bottom <= floor + 0.5 && box.top >= banner.getBoundingClientRect().top - 0.5) continue;
      t.classList.add("dot-only");
      if (title + chip.getBoundingClientRect().width <= room) t.classList.remove("below");
    }
  }

  disconnectedCallback() {
    this._pressing = this._dirty = false;
    window.removeEventListener("pointerup", this._onPressEnd, true);
    window.removeEventListener("pointercancel", this._onPressEnd, true);
    clearInterval(this._tick);
    clearInterval(this._countdown);
    this._tick = this._countdown = null;
    this._fitObserver?.disconnect();
    this._outside?.off();
    window.removeEventListener("keydown", this._onKey);
    this._unsubscribeForecast();
    // Left (another dashboard view, a conditional card hidden): back to the defaults, so that the card does not come
    // back unfolded or with its popup open.
    this._toggled = new Map();
    this._dialog = null;
  }

  _t(key, vars) {
    return t(this._hass, this._config, key, vars);
  }

  _locale() {
    return intlLocale(this._hass, this._config);
  }

  _s(id) {
    return id ? this._hass.states[id] : undefined;
  }

  // Service call whose failure Home Assistant already reports (toast): handled here so that it does not end up as
  // "Uncaught (in promise)".
  _call(domain, service, data) {
    return Promise.resolve(this._hass.callService(domain, service, data)).catch(() => {});
  }

  // ---- Forecast -------------------------------------------------------------------------------------------------

  // The weather entity's forecast, through the subscription Home Assistant's own weather cards use (hourly when the
  // entity has one, else twice daily or daily); the forecast attribute of older integrations otherwise.
  _subscribeForecast(id) {
    if (id === this._fcEntity) return;
    this._unsubscribeForecast();
    this._fcEntity = id;
    this._forecast = null;
    const conn = this._hass?.connection;
    if (!id || !this.isConnected || typeof conn?.subscribeMessage !== "function") return;
    const f = Number(this._hass.states[id]?.attributes?.supported_features) || 0;
    const type = f & 2 ? "hourly" : f & 4 ? "twice_daily" : f & 1 ? "daily" : "hourly";
    try {
      this._fcSub = Promise.resolve(
        conn.subscribeMessage(
          (msg) => {
            if (this._fcEntity !== id) return;
            this._forecast = { type: msg?.type || type, list: msg?.forecast || [] };
            this.hass = this._hass;
          },
          { type: "weather/subscribe_forecast", forecast_type: type, entity_id: id },
        ),
      ).catch(() => null);
    } catch (_err) {
      this._fcSub = null;
    }
  }

  _unsubscribeForecast() {
    const sub = this._fcSub;
    this._fcSub = null;
    sub?.then((unsub) => typeof unsub === "function" && unsub()).catch(() => {});
  }

  // { skip, raining, amount, unit, prob, hours, entity } or null without forecast.
  _rain(m) {
    const c = this._config;
    const hours = Number(c.rain_window) || 24;
    const w = this._s(m.weather);
    let out = null;
    const fc = this._forecast || (Array.isArray(w?.attributes?.forecast) ? { type: "daily", list: w.attributes.forecast } : null);
    if (fc) {
      const o = rainOutlook(fc.list, fc.type, Date.now(), hours);
      if (o) out = { ...o, unit: w?.attributes?.precipitation_unit || "mm", entity: m.weather };
    }
    const sensor = this._s(c.rain_sensor);
    if (num(sensor) !== null) out = { amount: num(sensor), prob: out?.prob ?? null, unit: sensor.attributes?.unit_of_measurement || "mm", entity: c.rain_sensor };
    const raining = valid(w) && RAINY.has(w.state);
    if (!out && !raining) return null;
    out ||= { amount: null, prob: null, unit: "mm", entity: m.weather };
    const threshold = Number(c.rain_threshold ?? 2);
    const probMin = Number(c.rain_probability ?? 70);
    out.hours = hours;
    out.raining = raining;
    out.skip = raining || (out.amount !== null && out.amount >= threshold) || (out.prob !== null && out.prob >= probMin && (out.amount ?? 0) > 0);
    return out;
  }

  // ---- Zones ----------------------------------------------------------------------------------------------------

  _zoneRunning(z) {
    if (z.running) return this._s(z.running)?.state === "on";
    const s = this._s(z.entity);
    return !!s && (s.state === "on" || s.state === "open" || s.state === "opening");
  }

  _zoneOffline(z) {
    const s = this._s(z.entity);
    return !s || s.state === "unavailable";
  }

  // { running, end, total }: the end of a run from the zone's remaining time sensor (a duration counted from its
  // last update, or a time stamp), else from the run the card started.
  _timing(z) {
    if (!this._zoneRunning(z)) {
      RUNS.delete(z.entity);
      return { running: false };
    }
    const now = Date.now();
    let end = null;
    const r = this._s(z.remaining);
    if (valid(r)) {
      if (r.attributes?.device_class === "timestamp") end = parseLocal(r.state);
      else {
        const v = num(r);
        if (v > 0) end = Date.parse(r.last_updated || r.last_changed || "") + v * unitMs(r.attributes?.unit_of_measurement);
      }
      if (!Number.isFinite(end) || end <= now) end = null;
    }
    let run = RUNS.get(z.entity);
    if (run && run.end <= now - 5000) {
      RUNS.delete(z.entity);
      run = null;
    }
    const totalS = this._s(z.total);
    const durS = this._s(z.durationEntity);
    const known = num(totalS) > 0 ? num(totalS) * unitMs(totalS.attributes?.unit_of_measurement) : null;
    if (end && !run) {
      // First seen running: its length is the total sensor, the device's duration setting, or what is left now.
      const dur = num(durS) > 0 ? num(durS) * unitMs(durS.attributes?.unit_of_measurement) : null;
      run = { end, total: Math.max(known ?? dur ?? 0, end - now) };
      RUNS.set(z.entity, run);
    }
    if (end && run) run.end = end;
    if (!end && run) end = run.end;
    const total = known ?? run?.total ?? null;
    return { running: true, end, total: total && end ? Math.max(total, end - now) : null };
  }

  _supportsDuration(z) {
    return !!(z.script || z.z2mTopic || PLATFORMS[z.platform]?.start?.(z, 1) || z.durationEntity);
  }

  // The longest run the zone takes, in minutes: its integration's limit, else its duration number's maximum.
  _maxMinutes(z) {
    if (z.script || z.z2mTopic) return 1440;
    const own = PLATFORMS[z.platform];
    if (own?.max && own.start?.(z, 1)) return own.max;
    const n = this._s(z.durationEntity);
    const hi = Number(n?.attributes?.max);
    const m = Number.isFinite(hi) && hi > 0 ? Math.floor((hi * unitMs(n.attributes?.unit_of_measurement)) / 6e4) : 1440;
    return clamp(m, 1, 1440);
  }

  _defaultMinutes(z) {
    const n = num(this._s(z.durationEntity));
    const unit = this._s(z.durationEntity)?.attributes?.unit_of_measurement;
    const fromNumber = n > 0 ? Math.round((n * unitMs(unit)) / 6e4) : null;
    // The zone's own duration, else its device's duration setting, else the card's default.
    const def = Number(this._config.default_duration) > 0 ? Number(this._config.default_duration) : null;
    return clamp(Math.round(z.duration ?? fromNumber ?? def ?? 10), 1, this._maxMinutes(z));
  }

  // Service calls that start `z` for `min` minutes.
  _startCalls(z, min) {
    if (z.script) return [["script", "turn_on", { entity_id: z.script, variables: { zone: z.entity, minutes: min } }]];
    if (z.z2mTopic) return [["mqtt", "publish", { topic: `${z.z2mTopic}/set`, payload: swvPayload(min) }]];
    const own = PLATFORMS[z.platform]?.start?.(z, min);
    if (own) return own;
    const calls = [];
    const n = this._s(z.durationEntity);
    if (n) {
      const unit = n.attributes?.unit_of_measurement;
      const value = Math.round(((min * 6e4) / unitMs(unit)) * 100) / 100;
      const lo = Number(n.attributes?.min);
      const hi = Number(n.attributes?.max);
      calls.push(["number", "set_value", { entity_id: z.durationEntity, value: clamp(value, Number.isFinite(lo) ? lo : 0, Number.isFinite(hi) ? hi : value) }]);
    }
    calls.push(domainOf(z.entity) === "valve" ? ["valve", "open_valve", { entity_id: z.entity }] : ["switch", "turn_on", { entity_id: z.entity }]);
    return calls;
  }

  _stopCalls(z) {
    const own = PLATFORMS[z.platform]?.stop?.(z);
    if (own) return own;
    return [domainOf(z.entity) === "valve" ? ["valve", "close_valve", { entity_id: z.entity }] : ["switch", "turn_off", { entity_id: z.entity }]];
  }

  async _run(calls) {
    for (const [d, s, data] of calls) await this._call(d, s, data);
  }

  _startZone(z, min) {
    RUNS.set(z.entity, { end: Date.now() + min * 6e4, total: min * 6e4, own: true });
    this._run(this._startCalls(z, min));
    this._update();
  }

  _stopZone(z) {
    RUNS.delete(z.entity);
    this._run(this._stopCalls(z));
  }

  // ---- Rendering ------------------------------------------------------------------------------------------------

  _update() {
    if (!this._hass || !this._config) return;
    // Held back under a press (see the constructor): drawn once released.
    if (this._pressing) {
      this._dirty = true;
      return;
    }
    this._dirty = false;
    const m = this._resolve();
    if (m) this._subscribeForecast(this._config.show_weather === false ? null : m.weather);
    let html = this._render();
    if (this._dialog) {
      html = html.replace(/<ha-card>([\s\S]*)<\/ha-card>\s*$/, (_, inner) => `<ha-card class="dialog-open">${inner}${this._dialogHtml()}</ha-card>`);
    }
    if (html !== this._html) {
      const focused = this._dialog && this.shadowRoot.activeElement?.dataset?.action;
      const kept = this._dialog || this._byPointer ? null : this._focusedSpot();
      const was = this.shadowRoot.activeElement;
      this._html = html;
      morph(this.shadowRoot, html);
      this._fitPill();
      // The focused node is kept by the patch; put the focus back only when that node was replaced.
      if (kept && (!was || !was.isConnected || this.shadowRoot.activeElement !== was)) this._restoreFocus(kept);
      if (this._dialog) {
        const sel = focused ? `.modal [data-action="${focused}"]${focused === "dur_preset" ? "" : ""}` : ".modal .primary";
        this.shadowRoot.querySelector(sel)?.focus?.({ preventScroll: true });
      }
    }
    this._syncCountdown();
  }

  // While a zone counts down, its texts and ring move every second in place (no re-render, which would restart
  // the animations); the card is redrawn once a countdown ends.
  _syncCountdown() {
    const els = [...(this.shadowRoot.querySelectorAll?.("[data-end]") || [])];
    if (!els.length) {
      clearInterval(this._countdown);
      this._countdown = null;
      return;
    }
    if (this._countdown) return;
    this._countdown = setInterval(() => {
      const now = Date.now();
      let ended = false;
      for (const el of this.shadowRoot.querySelectorAll("[data-end]")) {
        const left = Number(el.dataset.end) - now;
        if (left <= 0) ended = true;
        // Written only when it changes, with the precision of the render (no transition restarted for nothing).
        if (el.dataset.total) {
          const offset = (RING_C * (1 - clamp(left / Number(el.dataset.total), 0, 1))).toFixed(2);
          if (el.style.strokeDashoffset !== offset) el.style.strokeDashoffset = offset;
        } else {
          const text = el.dataset.fmt === "bare" ? fmtCountdown(left) : this._t("left", { time: fmtCountdown(left) });
          if (el.textContent !== text) el.textContent = text;
        }
      }
      if (ended) {
        clearInterval(this._countdown);
        this._countdown = null;
        this._lastDeps = null;
        this._update();
      }
    }, 1000);
  }

  _focusedSpot() {
    const el = this.shadowRoot.activeElement;
    if (!el?.dataset) return null;
    const key = focusKey(el);
    if (!key) return null;
    const index = this._focusables(key).indexOf(el);
    return index < 0 ? null : { key, index };
  }

  _focusables(key) {
    return [...this.shadowRoot.querySelectorAll(FOCUS_SELECTOR)].filter((n) => focusKey(n) === key);
  }

  _restoreFocus({ key, index }) {
    this._focusables(key)[index]?.focus({ preventScroll: true });
  }

  _onClick(ev) {
    const path = ev.composedPath();
    const el = path.find((n) => n.dataset && (n.dataset.entity || n.dataset.action));
    if (!this._dialog && Date.now() - (this._dialogClosedAt ?? 0) < CONFIRM_GUARD_MS) {
      ev.stopPropagation();
      return;
    }
    if (this._dialog) {
      ev.stopPropagation();
      const action = el?.dataset.action;
      const d = this._dialog;
      if (action === "dur_minus" || action === "dur_plus") {
        const step = d.minutes > 30 || (d.minutes === 30 && action === "dur_plus") ? 5 : 1;
        d.minutes = clamp(d.minutes + (action === "dur_plus" ? step : -step), 1, d.max ?? 1440);
        this._update();
      } else if (action === "dur_preset") {
        d.minutes = Number(el.dataset.min);
        this._update();
      } else if (action === "dialog_ok") {
        const z = this._model?.zones.find((x) => x.entity === d.zone);
        this._closeDialog();
        if (z) this._startZone(z, d.minutes);
      } else if (action === "dialog_cancel" || (action === "dialog_backdrop" && path[0] === el)) this._closeDialog();
      return;
    }
    if (!el) return;
    ev.stopPropagation();
    const { action, entity } = el.dataset;
    if (action === "zoom") return this._toggleZoom(ev);
    if (action === "toggle_section") {
      const key = el.dataset.section;
      this._toggled = new Map(this._toggled).set(key, !this._isCollapsed(key));
      return this._update();
    }
    const zone = this._model?.zones.find((z) => z.entity === entity);
    if (action === "start" && zone) {
      if (this._zoneOffline(zone)) return;
      if (!this._supportsDuration(zone)) return this._startZone(zone, this._defaultMinutes(zone));
      return this._openDialog({ zone: zone.entity, name: zone.name, minutes: this._defaultMinutes(zone), max: this._maxMinutes(zone) });
    }
    if (action === "stop" && zone) {
      if (!this._zoneOffline(zone)) this._stopZone(zone);
      return;
    }
    if (entity) this.dispatchEvent(new CustomEvent("hass-more-info", { detail: { entityId: entity }, bubbles: true, composed: true }));
  }

  _openDialog(d) {
    this._dialog = d;
    window.addEventListener("keydown", this._onKey);
    this._update();
    this.shadowRoot.querySelector(".modal .primary")?.focus?.();
  }

  _closeDialog() {
    this._dialog = null;
    this._dialogClosedAt = Date.now();
    window.removeEventListener("keydown", this._onKey);
    this._update();
  }

  _dialogHtml() {
    const d = this._dialog;
    const presets = PRESETS.filter((n) => n <= (d.max ?? 1440)).map(
      (n) => `<button class="preset${n === d.minutes ? " on" : ""}" data-action="dur_preset" data-min="${n}" aria-pressed="${n === d.minutes}">${n} min</button>`,
    ).join("");
    return `<style>${DIALOG_STYLE}</style><div class="backdrop" data-action="dialog_backdrop">
      <div class="modal" role="dialog" aria-modal="true" aria-label="${esc(this._t("water_zone", { name: d.name }))}">
        <div class="msg">${esc(this._t("water_zone", { name: d.name }))}</div>
        <div class="stepper" role="group" aria-label="${esc(this._t("duration"))}">
          <button class="btn round" data-action="dur_minus" aria-label="${esc(this._t("less"))}" title="${esc(this._t("less"))}"${d.minutes <= 1 ? " disabled" : ""}>${svgIcon(ICONS.minus)}</button>
          <div class="val num" aria-live="polite">${d.minutes}<small>min</small></div>
          <button class="btn round" data-action="dur_plus" aria-label="${esc(this._t("more"))}" title="${esc(this._t("more"))}"${d.minutes >= (d.max ?? 1440) ? " disabled" : ""}>${svgIcon(ICONS.plus)}</button>
        </div>
        <div class="presets">${presets}</div>
        <div class="modal-actions">
          <button class="btn" data-action="dialog_cancel"><span>${esc(this._t("cancel"))}</span></button>
          <button class="btn primary" data-action="dialog_ok">${svgIcon(ICONS.play)}<span>${esc(this._t("start"))}</span></button>
        </div>
      </div>
    </div>`;
  }

  _isCollapsed(key) {
    if (this._toggled?.has(key)) return this._toggled.get(key);
    const c = this._config.collapsed ?? DEFAULT_COLLAPSED;
    return asList(c).includes(key);
  }

  _sectionTitle(key, icon, label, count = "") {
    const closed = this._isCollapsed(key);
    return `<div class="section-title toggle" role="button" tabindex="0" data-action="toggle_section" data-section="${key}" aria-expanded="${!closed}">${svgIcon(icon)}<span>${esc(
      label,
    )}</span>${count ? `<span class="count">${esc(count)}</span>` : ""}${svgIcon(ICONS.chevron_down, "chevron")}</div>`;
  }

  _errorCard(key) {
    return `<style>${BASE_STYLE}</style><ha-card><div class="warning">${esc(this._t(key))}</div></ha-card>`;
  }

  // Plant verdicts: { cls, text, thirsty } of each plant, from its readings and thresholds.
  _plantState(p) {
    let worst = "ok";
    let text = this._t("ok");
    let thirsty = false;
    for (const k of READINGS) {
      const v = p.values[k];
      if (v === undefined || v === null) continue;
      const level = p.problems[k] || levelOf(v, p.thresholds[k]);
      const cls = levelClass(k, level);
      if (cls === "ok") continue;
      const label = k === "battery" ? this._t("low_battery") : k === "moisture" ? this._t(level === "low" ? "needs_water" : "too_wet") : `${this._t(k)}: ${this._t(level)}`;
      if (k === "moisture" && level === "low") thirsty = true;
      if (cls === "crit" || worst === "ok") {
        worst = cls;
        text = label;
      }
    }
    return { cls: worst, text, thirsty };
  }

  // Header state: watering, rain, plants needing attention.
  _summary(m) {
    const now = Date.now();
    const running = m.zones.filter((z) => this._zoneRunning(z));
    const plants = m.plants.map((p) => ({ p, s: this._plantState(p) }));
    const attention = plants.filter((x) => x.s.cls !== "ok");
    const rain = this._config.show_weather === false ? null : this._rain(m);
    const next = [
      ...m.zones.map((z) => ({ at: timeOf(this._s(z.next)), z, entity: z.next })),
      { at: timeOf(this._s(this._config.next_run)), entity: this._config.next_run },
    ]
      .filter((x) => x.at && x.at > now - 6e4)
      .sort((a, b) => a.at - b.at)[0];
    let status;
    if (running.length) status = { cls: "active", text: this._t("watering"), entity: running[0].entity };
    else if (attention.some((x) => x.s.cls === "crit")) {
      const x = attention.find((y) => y.s.cls === "crit");
      status = { cls: "crit", text: attention.length > 1 ? this._t("plants_attention", { n: attention.length }) : x.s.text, entity: x.p.entity || x.p.sensors.moisture };
    } else if (attention.length) status = { cls: "warn", text: attention.length > 1 ? this._t("plants_attention", { n: attention.length }) : attention[0].s.text, entity: attention[0].p.entity || attention[0].p.sensors.moisture };
    else if (m.zones.length || m.plants.length) status = { cls: "ok", text: this._t("ok") };
    return { running, plants, attention, rain, next, status };
  }

  // The header: the illustrated banner (the garden scene, its lawn strip), or the classic header
  // (`illustration: false`). The icon's colour is the garden's status: watering, alert, warning, else idle grey.
  _header(sum, sub) {
    const c = this._config;
    const st = sum.status;
    const icon = sum.running.length ? "active" : st?.cls === "crit" ? "crit" : st?.cls === "warn" ? "warn" : "idle";
    const name = `<div class="name">${esc(c.title || this._t("garden"))}</div>`;
    // On the banner the status pill follows the title on its row (under the subtitle on a narrow card).
    const titles = `<div class="titles">
          ${this._illustrated() ? `<div class="trow">${name}${this._chip(st)}</div>` : name}
          ${sub ? `<div class="sub" title="${esc(sub)}">${esc(sub)}</div>` : ""}
        </div>`;
    const badge = `<div class="type-icon ${icon}">${svgIcon(sum.running.length ? ICONS.sprinkler : ICONS.flower)}</div>`;
    if (this._illustrated()) {
      const night = gcIsNight(this._hass, c);
      return `
      <div class="banner${night ? " night" : ""}">
        <div class="gc-ground"></div>
        ${this._stage(sum, night)}
        <div class="htext">${badge}${titles}</div>
        ${this._zoomButton()}
      </div>`;
    }
    return `
      <div class="header">
        ${badge}
        ${titles}
        ${this._chip(st)}
        ${this._zoomButton()}
      </div>`;
  }

  _illustrated() {
    return this._config.illustration !== false;
  }

  _chip(st) {
    if (!st) return "";
    return `<span class="chip ${st.cls}${st.entity ? " clickable" : ""}"${moreInfo(st.entity)} title="${esc(st.text)}" aria-label="${esc(
      st.text,
    )}"><span class="dot"></span><span class="chip-text">${esc(st.text)}</span></span>`;
  }

  _zoomButton() {
    return "";
  }

  _subtitle(m, sum) {
    if (sum.next) return this._t("next_watering", { when: fmtWhen(this._hass, this._config, sum.next.at) });
    const parts = [];
    if (m.zones.length) parts.push(m.zones.length === 1 ? this._t("zone_count") : this._t("zones_count", { n: m.zones.length }));
    if (m.plants.length) parts.push(m.plants.length === 1 ? this._t("plant_count") : this._t("plants_count", { n: m.plants.length }));
    return parts.join(" · ");
  }

  _rainText(r) {
    if (r.amount === null) return "";
    const locale = this._locale();
    const amount = `${fmtNum(r.amount, r.amount < 10 ? 1 : 0, locale)} ${r.unit}`;
    const parts = [r.amount > 0 ? this._t("rain_expected", { amount, hours: r.hours }) : this._t("dry", { hours: r.hours })];
    if (r.prob !== null && r.amount > 0) parts.push(this._t("rain_chance", { prob: Math.round(r.prob) }));
    return parts.join(" · ");
  }

  // What the picture shows: watering, rain (no watering needed), a thirsty plant, or nothing going on.
  _activity(sum) {
    if (sum.running.length) return "watering";
    if (sum.rain?.skip) return "rain";
    if (sum.plants.some((x) => x.s.thirsty)) return "thirsty";
    return null;
  }

  // The entity behind the picture: the zone watering, the rain forecast, the thirsty plant.
  _pictureTarget(sum, act) {
    const thirsty = sum.plants.find((x) => x.s.thirsty)?.p;
    return act === "watering" ? sum.running[0].entity : act === "rain" ? sum.rain.entity : act === "thirsty" ? thirsty.entity || thirsty.sensors.moisture : sum.rain?.entity;
  }

  _picture(sum) {
    if (this._illustrated()) return "";
    const act = this._activity(sum);
    const target = this._pictureTarget(sum, act);
    return `<div class="picture${target ? " clickable" : ""}"${moreInfo(target)} aria-label="${esc(this._config.title || this._t("garden"))}"><img src="${gardenSvg(act)}" alt=""></div>`;
  }

  // The banner's scene: the backdrop and, over it, the drawn garden of the current activity.
  _stage(sum, night) {
    const act = this._activity(sum);
    const target = this._pictureTarget(sum, act);
    return `<div class="gc-stage${target ? " clickable" : ""}"${moreInfo(target)} aria-label="${esc(this._config.title || this._t("garden"))}">${gcSceneSvg(night)}<div class="gc-art"><img src="${gardenSvg(
      act,
      night,
    )}" alt=""></div></div>`;
  }

  // Info lines next to the picture: the rain suggestion, the next watering, the plants.
  _lines(m, sum, mini = false) {
    const lines = [];
    const line = (id, icon, text, cls = "") =>
      `<div class="line${cls ? ` ${cls}` : ""}${id ? " clickable" : ""}"${moreInfo(id)}>${icon}<span>${esc(text)}</span></div>`;
    const r = sum.rain;
    if (r?.skip) {
      lines.push(`<div class="alert-line active clickable" role="button" tabindex="0" data-entity="${esc(r.entity || "")}">${svgIcon(ICONS.water_off)}<span>${esc(this._t("skip_title"))}</span></div>`);
      const why = [r.raining ? this._t("raining") : "", this._rainText(r)].filter(Boolean).join(" · ");
      if (why && !mini) lines.push(line(r.entity, svgIcon(ICONS.cloud), why));
    } else if (r) {
      const text = this._rainText(r);
      if (text) lines.push(line(r.entity, svgIcon(r.amount > 0 ? ICONS.cloud : ICONS.sun), text));
    }
    // The full card shows the next watering in its subtitle.
    if (sum.next && mini && !sum.running.length) lines.push(line(sum.next.entity, svgIcon(ICONS.calendar), this._t("next_watering", { when: fmtWhen(this._hass, this._config, sum.next.at) })));
    if (m.plants.length) {
      const n = sum.attention.length;
      const worst = sum.attention.find((x) => x.s.cls === "crit") || sum.attention[0];
      const text = !n ? this._t("plants_ok") : n === 1 ? `${worst.p.name}: ${worst.s.text}` : this._t("plants_attention", { n });
      const icon = worst?.s.thirsty ? `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path class="thirst" d="${ICONS.water}"/></svg>` : svgIcon(ICONS.sprout);
      lines.push(line(worst ? worst.p.entity || worst.p.sensors.moisture : "", icon, text, worst ? worst.s.cls : ""));
    }
    return lines.join("");
  }

  // Big value of the hero: the countdown of the zone watering now, else the first soil moisture reading.
  _big(m, sum) {
    const z = sum.running[0];
    if (z) {
      const tm = this._timing(z);
      if (tm.end) {
        return `<div class="big active clickable" role="button" tabindex="0" data-entity="${esc(z.entity)}" title="${esc(z.name)}">${svgIcon(ICONS.timer)}<span class="pct num"><span data-end="${tm.end}" data-fmt="bare">${fmtCountdown(
          tm.end - Date.now(),
        )}</span><small>${esc(z.name)}</small></span></div>`;
      }
      return `<div class="alert-line active clickable" role="button" tabindex="0" data-entity="${esc(z.entity)}">${svgIcon(ICONS.sprinkler)}<span>${esc(`${z.name} · ${this._t("runs_until_stopped")}`)}</span></div>`;
    }
    const soil = m.soil.find((x) => num(this._s(x.entity)) !== null);
    const plant = m.plants.find((p) => p.values.moisture !== undefined && p.values.moisture !== null);
    const id = soil ? soil.entity : plant ? plant.sensors.moisture || plant.entity : null;
    const v = soil ? num(this._s(soil.entity)) : plant ? plant.values.moisture : null;
    if (v === null) return "";
    const range = soil ? [soil.min ?? THRESHOLDS.moisture[0], soil.max ?? THRESHOLDS.moisture[1]] : plant.thresholds.moisture;
    const cls = levelClass("moisture", levelOf(v, range));
    const name = soil ? nameOf(this._hass, soil.entity, soil.name) : plant.name;
    return `<div class="big ${cls}${id ? " clickable" : ""}"${moreInfo(id)} title="${esc(`${this._t("moisture")}: ${name}`)}">${svgIcon(ICONS.moisture)}<span class="pct num">${Math.round(
      v,
    )}<small>% · ${esc(name)}</small></span></div>`;
  }

  _hero(m, sum) {
    const info = this._big(m, sum) + this._lines(m, sum);
    const pic = this._picture(sum);
    if (!pic && !info) return "";
    return `<div class="hero">${pic}<div class="info">${info}</div></div>`;
  }

  // The zone's icon: idle sprinkler, or the countdown ring with water spraying.
  _zoneIcon(z, tm) {
    if (!tm.running) return `<div class="zone-icon ${this._zoneOffline(z) ? "idle" : ""}">${svgIcon(ICONS.sprinkler)}</div>`;
    const frac = tm.end && tm.total ? clamp((tm.end - Date.now()) / tm.total, 0, 1) : 1;
    const ring = `<svg class="ring" viewBox="0 0 40 40" aria-hidden="true"><circle class="track" cx="20" cy="20" r="17"/><circle class="prog" cx="20" cy="20" r="17" stroke-dasharray="${RING_C.toFixed(
      2,
    )}" style="stroke-dashoffset:${(RING_C * (1 - frac)).toFixed(2)}"${tm.end && tm.total ? ` data-end="${tm.end}" data-total="${tm.total}"` : ""}/></svg>`;
    const spray = `<svg class="spray" viewBox="0 0 40 40" aria-hidden="true"><circle class="drop" cx="15" cy="12" r="1.6" style="--dx:-4px"/><circle class="drop" cx="20" cy="10" r="1.6" style="--dx:0px"/><circle class="drop" cx="25" cy="12" r="1.6" style="--dx:4px"/><circle class="drop" cx="20" cy="12" r="1.3" style="--dx:-2px"/></svg>`;
    return `<div class="zone-icon active">${ring}${spray}${svgIcon(ICONS.sprinkler)}</div>`;
  }

  // Status line of a zone: the countdown while it waters, else its next run, its soil moisture.
  _zoneLine(z, tm) {
    const parts = [];
    if (this._zoneOffline(z)) parts.push(`<span>${esc(this._t("unavailable"))}</span>`);
    else if (tm.running) {
      parts.push(
        tm.end
          ? `<span class="num" data-end="${tm.end}">${esc(this._t("left", { time: fmtCountdown(tm.end - Date.now()) }))}</span>`
          : `<span>${esc(this._t("watering"))} · ${esc(this._t("runs_until_stopped"))}</span>`,
      );
    } else {
      const at = timeOf(this._s(z.next));
      parts.push(`<span>${esc(at && at > Date.now() ? this._t("next", { when: fmtWhen(this._hass, this._config, at) }) : this._t("idle"))}</span>`);
    }
    const ms = num(this._s(z.moisture));
    if (ms !== null) parts.push(`<span>· ${svgIcon(ICONS.moisture)}</span><span>${Math.round(ms)} %</span>`);
    return `<div class="line${tm.running ? " active" : ""}">${parts.join("")}</div>`;
  }

  _zoneButton(z, tm, round = false) {
    const off = this._zoneOffline(z) ? " disabled" : "";
    const [action, icon, label, cls] = tm.running ? ["stop", ICONS.stop, this._t("stop"), "active"] : ["start", ICONS.play, this._t("start"), ""];
    const aria = `${label}: ${z.name}`;
    return `<button class="btn${round ? " round" : ""}${cls ? ` ${cls}` : ""}" data-action="${action}" data-entity="${esc(z.entity)}" title="${esc(aria)}" aria-label="${esc(aria)}"${off}>${svgIcon(
      icon,
    )}${round ? "" : `<span>${esc(label)}</span>`}</button>`;
  }

  _zones(m) {
    if (!m.zones.length) return "";
    const rows = m.zones.map((z) => {
      const tm = this._timing(z);
      return `<div class="zone">
        ${this._zoneIcon(z, tm)}
        <div class="info clickable" role="button" tabindex="0" data-entity="${esc(z.entity)}"><div class="zname">${esc(z.name)}</div>${this._zoneLine(z, tm)}</div>
        ${this._zoneButton(z, tm)}
      </div>`;
    });
    const n = m.zones.length;
    return `<div>${this._sectionTitle("zones", ICONS.sprinkler, this._t("zones"), String(n))}${this._isCollapsed("zones") ? "" : `<div class="zones">${rows.join("")}</div>`}</div>`;
  }

  _gauge(key, entity, v, unit, range, level) {
    const cls = levelClass(key, level);
    const locale = this._locale();
    const pos = (x) => (posOf(key, range, v, x) * 100).toFixed(1);
    const [lo, hi] = range;
    // No band for a reading without thresholds (light and temperature by default): nothing to compare it with.
    const band =
      key === "battery" || (lo === null && hi === null)
        ? ""
        : `<div class="band" style="left:${lo === null ? 0 : pos(lo)}%;width:${(Number(hi === null ? 100 : pos(hi)) - Number(lo === null ? 0 : pos(lo))).toFixed(1)}%"></div>`;
    const fill = key === "battery" ? `<div class="band" style="left:0;width:${clamp(v ?? 0, 0, 100).toFixed(1)}%;background:color-mix(in srgb, var(--c) 45%, transparent)"></div>` : "";
    const mark = v === null || v === undefined || key === "battery" ? "" : `<div class="mark"${key === "moisture" && level === "low" ? ' data-thirst=""' : ""} style="left:${pos(v)}%"></div>`;
    const range_txt = [lo, hi].every((x) => x !== null && x !== undefined) ? ` (${fmtNum(lo, 0, locale)}–${fmtNum(hi, 0, locale)} ${unit ?? UNITS[key]})` : "";
    const icon = key === "moisture" && level === "low" ? `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path class="thirst" d="${ICONS.water}"/></svg>` : svgIcon(ICONS[key]);
    return `<div class="gauge ${cls}${entity ? " clickable" : ""}"${moreInfo(entity)} title="${esc(`${this._t(key)}${range_txt}`)}">${icon}<span class="lbl">${esc(
      this._t(key),
    )}</span><div class="track">${band}${fill}${mark}</div><span class="v num">${esc(fmtReading(key, v, unit, locale))}</span></div>`;
  }

  _plant(p, st) {
    const gauges = READINGS.filter((k) => p.values[k] !== undefined).map((k) =>
      this._gauge(k, p.sensors[k] || p.entity, p.values[k], p.units[k], p.thresholds[k], p.problems[k] || levelOf(p.values[k], p.thresholds[k])),
    );
    const pic = p.image ? `<img src="${esc(p.image)}" alt="">` : svgIcon(ICONS.sprout);
    const badge = st.thirsty ? `<svg class="badge" viewBox="0 0 24 24" aria-hidden="true"><path class="thirst" fill="currentColor" d="${ICONS.water}"/></svg>` : "";
    const target = p.entity || p.sensors.moisture || "";
    return `<div class="plant">
      <div class="plant-head${target ? " clickable" : ""}"${moreInfo(target)}>
        <div class="plant-pic ${st.cls}">${pic}${badge}</div>
        <div class="plant-titles"><div class="plant-name" title="${esc(p.name)}">${esc(p.name)}</div><span class="chip ${st.cls}" title="${esc(st.text)}"><span class="dot"></span><span class="chip-text">${esc(st.text)}</span></span></div>
      </div>
      ${gauges.length ? `<div class="gauges">${gauges.join("")}</div>` : ""}
    </div>`;
  }

  _plants(m, sum) {
    if (!m.plants.length) return "";
    const body = sum.plants.map(({ p, s }) => this._plant(p, s)).join("");
    return `<div>${this._sectionTitle("plants", ICONS.sprout, this._t("plants"), String(m.plants.length))}${this._isCollapsed("plants") ? "" : `<div class="plants">${body}</div>`}</div>`;
  }

  _soil(m) {
    if (!m.soil.length) return "";
    const rows = m.soil.map((s) => {
      const st = this._s(s.entity);
      const v = num(st);
      const range = [s.min ?? THRESHOLDS.moisture[0], s.max ?? THRESHOLDS.moisture[1]];
      const level = levelOf(v, range);
      // The name of the sensor replaces the "Moisture" label.
      return this._gauge("moisture", s.entity, v, "%", range, level).replace(
        `<span class="lbl">${esc(this._t("moisture"))}</span>`,
        `<span class="lbl">${esc(nameOf(this._hass, s.entity, s.name))}</span>`,
      );
    });
    return `<div>${this._sectionTitle("soil", ICONS.moisture, this._t("soil"), String(m.soil.length))}${this._isCollapsed("soil") ? "" : `<div class="soil">${rows.join("")}</div>`}</div>`;
  }

  _render() {
    const m = this._resolve();
    if (!m) return this._errorCard("no_registry");
    const c = this._config;
    if (!m.zones.length && !m.plants.length && !m.soil.length && !m.weather) return this._errorCard("no_data");
    const sum = this._summary(m);
    const parts = [];
    parts.push(this._hero(m, sum));
    if (c.show_zones !== false) parts.push(this._zones(m));
    if (c.show_plants !== false) parts.push(this._plants(m, sum));
    if (c.show_soil !== false) parts.push(this._soil(m));
    const body = parts.filter(Boolean).join("");
    return `<style>${BASE_STYLE}${FULL_STYLE}${this._illustrated() ? BANNER_STYLE : ""}</style>
      <ha-card>
        ${this._header(sum, this._subtitle(m, sum))}
        ${body ? `<div class="content">${body}</div>` : this._illustrated() ? "" : '<div style="height:12px"></div>'}
      </ha-card>`;
  }
}

// The mini card is the full card drawn compact: its detail button (top right, `zoom: false` removes it) switches it
// to the full card's content and back, and a click anywhere else on the page brings the compact view back.
export class GardenMiniCard extends GardenCard {
  constructor() {
    super();
    this._unzoom = watchOutside(
      (ev) => isOutside(this, ev),
      () => {
        if (this._zoomed) this._setZoom(false);
      },
    );
  }

  static getConfigElement() {
    return document.createElement("garden-mini-card-editor");
  }

  connectedCallback() {
    super.connectedCallback();
    this._unzoom.on();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._unzoom.off();
    // Back to the compact view once off the screen (see the full card).
    this._zoomed = false;
  }

  getCardSize() {
    return this._zoomed ? super.getCardSize() : 3;
  }

  getGridOptions() {
    return { ...(this._zoomed ? super.getGridOptions() : { columns: 6, min_columns: 6 }), rows: "auto" };
  }

  _zoomButton() {
    if (this._config.zoom === false) return "";
    const z = this._zoomed;
    const label = esc(this._t(z ? "zoom_out" : "zoom_in"));
    return `<button class="zoom" data-action="zoom" title="${label}" aria-label="${label}">${svgIcon(z ? ICONS.collapse : ICONS.expand)}</button>`;
  }

  _setZoom(on) {
    this._zoomed = on;
    this._update();
    this.dispatchEvent(new CustomEvent("iron-resize", { bubbles: true, composed: true }));
  }

  _toggleZoom(ev) {
    this._setZoom(!this._zoomed);
    if (ev.detail === 0) this.shadowRoot.querySelector(".zoom")?.focus({ preventScroll: true });
  }

  _render() {
    if (this._zoomed) return super._render();
    const m = this._resolve();
    if (!m) return this._errorCard("no_registry");
    if (!m.zones.length && !m.plants.length && !m.soil.length && !m.weather) return this._errorCard("no_data");
    const sum = this._summary(m);
    // The zone watering now, with its countdown and a Stop button.
    const z = sum.running[0];
    const tm = z && this._timing(z);
    const zoneLine = z
      ? `<div class="line active clickable" role="button" tabindex="0" data-entity="${esc(z.entity)}">${svgIcon(ICONS.sprinkler)}<span>${esc(z.name)}</span>${
          tm.end ? `<span class="num" data-end="${tm.end}">${esc(this._t("left", { time: fmtCountdown(tm.end - Date.now()) }))}</span>` : ""
        }</div>`
      : "";
    const info = zoneLine + this._lines(m, sum, true);
    const pic = this._picture(sum);
    const content =
      pic || info || z
        ? `<div class="content">
          ${pic}
          <div class="info">${info}</div>
          ${z ? `<div class="controls">${this._zoneButton(z, tm, true)}</div>` : ""}
        </div>`
        : "";
    return `<style>${BASE_STYLE}${FULL_STYLE}${MINI_STYLE}${this._illustrated() ? BANNER_STYLE : ""}</style>
      <ha-card>
        ${this._header(sum, "")}
        ${content}
      </ha-card>`;
  }
}
