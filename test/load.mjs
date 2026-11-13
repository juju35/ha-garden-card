// Evaluates src/garden-card.js (a classic script, bundled as is by scripts/build.mjs) in a sandbox with minimal DOM
// stand-ins and a clock fixed at the mocks' NOW, and returns the names the tests need. No dependency, no browser.
import { readFileSync } from "node:fs";
import vm from "node:vm";
import { NOW } from "../scripts/mock-states.mjs";

const source = readFileSync(new URL("../src/garden-card.js", import.meta.url), "utf8");

// Shadow root stand-in: keeps the HTML it is given and the listeners it gets.
const fakeRoot = () => ({
  innerHTML: "",
  listeners: {},
  addEventListener(type, fn) {
    this.listeners[type] = fn;
  },
  querySelector() {
    return null;
  },
  querySelectorAll() {
    return [];
  },
});

const fakeNode = (tag) => ({ tagName: String(tag).toUpperCase(), style: {}, dataset: {}, children: [], appendChild(c) { this.children.push(c); return c; }, addEventListener() {} });

export const load = ({ now = NOW } = {}) => {
  const registry = new Map();
  class HTMLElement {
    attachShadow() {
      this.shadowRoot = fakeRoot();
      return this.shadowRoot;
    }
    dispatchEvent(ev) {
      (this.events ||= []).push(ev);
    }
    appendChild() {}
    toggleAttribute(name, on) {
      (this.attrs ||= {})[name] = !!on;
    }
    get isConnected() {
      return !!this._connected;
    }
  }
  class CustomEvent {
    constructor(type, init = {}) {
      this.type = type;
      this.detail = init.detail;
    }
  }
  // Date whose "now" is fixed (new Date() and Date.now()); everything else is the real Date.
  class FixedDate extends Date {
    constructor(...a) {
      super(...(a.length ? a : [now]));
    }
    static now() {
      return now;
    }
  }
  const sandbox = {
    HTMLElement,
    CustomEvent,
    Intl,
    Date: FixedDate,
    console: { info() {}, warn() {} },
    customElements: { get: (t) => registry.get(t), define: (t, c) => registry.set(t, c) },
    document: {
      createElement: (t) => (registry.has(t) ? new (registry.get(t))() : fakeNode(t)),
      addEventListener() {},
      removeEventListener() {},
    },
    setTimeout,
    clearTimeout,
    setInterval: () => 0,
    clearInterval() {},
    addEventListener() {},
    removeEventListener() {},
  };
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  return vm.runInContext(
    `${source}
    ({ esc, lang, intlLocale, t, fmtCountdown, fmtWhen, rainOutlook, levelOf, levelClass, posOf, unitMs, timeOf, gardenSvg, resolve, toForm, fromForm,
       PLATFORMS, STRINGS, THRESHOLDS, RUNS, GardenCard: customElements.get("garden-card"), GardenMiniCard: customElements.get("garden-mini-card"),
       GardenCardEditor: customElements.get("garden-card-editor"), window })`,
    sandbox,
  );
};
