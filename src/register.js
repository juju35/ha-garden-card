// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------
import { pickerDefine } from "./card-picker.js";
import { VERSION } from "./core.js";
import { GardenCard, GardenMiniCard } from "./cards.js";
import { GardenCardEditor, GardenMiniCardEditor } from "./visual-editors.js";

export const define = (name, cls) => {
  if (!customElements.get(name)) pickerDefine(name, cls);
};
define("garden-card", GardenCard);
define("garden-mini-card", GardenMiniCard);
define("garden-card-editor", GardenCardEditor);
define("garden-mini-card-editor", GardenMiniCardEditor);

window.customCards = window.customCards || [];
for (const card of [
  {
    type: "garden-card",
    name: "Garden Card",
    description: "Watering zones with countdown and timed start, next watering, plants with gauges and thresholds, soil moisture and a skip-watering suggestion when rain is expected.",
  },
  {
    type: "garden-mini-card",
    name: "Garden Mini Card",
    description: "Compact garden overview: the zone watering now, the next watering, the rain suggestion and the plants needing attention.",
  },
]) {
  if (!window.customCards.some((c) => c.type === card.type)) window.customCards.push({ ...card, preview: true, documentationURL: "https://github.com/juju35/ha-garden-card" });
}

console.info(`%c GARDEN-CARD %c v${VERSION} `, "color: white; background: #3f9b4f; font-weight: 700;", "color: #3f9b4f; background: white; font-weight: 700;");
