// The README screenshots (PNG) and animations (GIF) rendered by scripts/screenshots.mjs.
// Every capture has a twin in the other theme ("-dark" for a light capture) that shows exactly the same state: only
// the theme differs (checked by test/screenshots.test.mjs). `forecast: "dry"` serves the dry forecast of the mocks.
import { raining, thirsty, watering } from "./mock-states.mjs";

const twins = (list) => list.flatMap((s) => [{ ...s, theme: "light" }, { ...s, file: `${s.file}-dark`, theme: "dark" }]);

export const shots = twins([
  { file: "card", type: "garden-card", width: 460, config: {} },
  { file: "card-rain", type: "garden-card", width: 460, config: { show_plants: false, show_soil: false }, overrides: raining },
  { file: "card-duration", type: "garden-card", width: 460, config: { show_plants: false, show_soil: false }, clicks: ['[data-action="start"][data-entity="valve.gazon"]', '[data-action="dur_preset"][data-min="20"]'] },
  { file: "card-plants", type: "garden-card", width: 460, config: { show_zones: false, show_soil: false }, overrides: thirsty, forecast: "dry" },
  { file: "mini-card", type: "garden-mini-card", width: 380, config: {} },
  { file: "mini-card-rain", type: "garden-mini-card", width: 380, config: {}, overrides: raining },
  { file: "mini-card-zoom", type: "garden-mini-card", width: 460, config: {}, clicks: [".zoom"] },
  // Narrow cards: the full card at 6 columns of a phone's Sections view and the mini card at its minimum width.
  { file: "card-narrow", type: "garden-card", width: 238, config: { show_plants: false } },
  { file: "mini-card-narrow", type: "garden-mini-card", width: 170, config: {} },
]);

// One looping GIF per distinct animated state of the drawn garden (each plays different keyframes):
//   watering — a zone waters: the sprinkler sprays its arcs, drops fall, the grass sways, the zone's ring counts down
//   rain     — rain is expected: watering is not needed, the cloud rains over the garden
//   thirsty  — a plant lacks water: it wilts under a burning sun, its moisture drop pulses
export const gifs = twins([
  { file: "watering", type: "garden-card", width: 460, config: { show_plants: false, show_soil: false }, overrides: watering },
  { file: "rain", type: "garden-card", width: 460, config: { show_plants: false, show_soil: false }, overrides: raining },
  { file: "thirsty", type: "garden-card", width: 460, config: { show_zones: false, show_soil: false, plants: [{ device: "flora" }] }, overrides: thirsty, forecast: "dry" },
]);
