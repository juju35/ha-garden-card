// Mock Home Assistant registries and states for the screenshots and the tests: four watering zones from four
// integrations (Gardena smart system, LinkTap, Rain Bird, Hydrawise), three plants (the plant integration, a Mi Flora
// sensor of Xiaomi BLE, a Plant Monitor plant with its threshold numbers), a soil moisture sensor and a weather entity
// whose hourly forecast brings rain. Entity ids are in French on purpose (the card never relies on them); the names
// shown are neutral English ones. Every time is relative to NOW, a fixed instant, so that the captures never change.
export const NOW = Date.parse("2026-06-15T07:30:00Z");
export const states = {};
export const entities = {};
export const devices = {};

const iso = (ms) => new Date(ms).toISOString();
const device = (id, name, model) => (devices[id] = { id, name, model, name_by_user: null, identifiers: [["mock", id]] });
const entity = (entity_id, device_id, platform, translation_key, state, attributes = {}, extra = {}) => {
  entities[entity_id] = { entity_id, device_id, platform, translation_key: translation_key || null };
  states[entity_id] = { entity_id, state: String(state), attributes, last_changed: iso(NOW - 60e3), last_updated: iso(NOW), ...extra };
};

// Gardena smart system: a Water Control valve on the lawn.
device("lawn", "Lawn", "GARDENA smart Water Control");
entity("valve.gazon", "lawn", "gardena_smart_system", null, "closed", { friendly_name: "Lawn", device_class: "water", supported_features: 3 });

// LinkTap: the vegetable patch, watering now (15 min run, 8 min 12 s left), with its duration number.
device("patch", "Vegetable patch", "LinkTap G2S");
entity("valve.potager", "patch", "linktap", null, "open", { friendly_name: "Vegetable patch", device_class: "water", supported_features: 3 });
entity("number.potager_duree", "patch", "linktap", null, "15", { friendly_name: "Vegetable patch Watering Duration", unit_of_measurement: "min", min: 0, max: 120 });
entity("sensor.potager_restant", "patch", "linktap", null, "492", { friendly_name: "Vegetable patch Remain Duration", unit_of_measurement: "s", device_class: "duration" });
entity("sensor.potager_total", "patch", "linktap", null, "900", { friendly_name: "Vegetable patch Total Duration", unit_of_measurement: "s", device_class: "duration" });
entity("binary_sensor.potager_arrosage", "patch", "linktap", null, "on", { friendly_name: "Vegetable patch Is Watering" });

// Rain Bird controller: one drip line zone (a switch).
device("rainbird", "Rain Bird controller", "ESP-ME3");
entity("switch.haie", "rainbird", "rainbird", null, "off", { friendly_name: "Hedge drip line" });

// Hydrawise: the flower beds zone, next cycle tomorrow at 06:00.
device("beds", "Flower beds", "Hydrawise zone");
entity("valve.massifs", "beds", "hydrawise", "zone", "closed", { friendly_name: "Flower beds", device_class: "water", supported_features: 3 });
entity("binary_sensor.massifs_arrosage", "beds", "hydrawise", "watering", "off", { friendly_name: "Flower beds Watering" });
entity("sensor.massifs_prochain_cycle", "beds", "hydrawise", "next_cycle", iso(Date.parse("2026-06-16T06:00:00Z")), { friendly_name: "Flower beds Next cycle", device_class: "timestamp" });
entity("sensor.massifs_restant", "beds", "hydrawise", "watering_time", "0", { friendly_name: "Flower beds Remaining watering time", unit_of_measurement: "min", device_class: "duration" });

// The plant integration (core): readings as attributes, problem when out of its limits.
states["plant.basilic"] = {
  entity_id: "plant.basilic",
  state: "ok",
  attributes: { friendly_name: "Basil", moisture: 42, conductivity: 1150, brightness: 8200, temperature: 21.4, battery: 88, problem: "none", sensors: {} },
  last_changed: iso(NOW - 3.6e6),
  last_updated: iso(NOW),
};

// A Mi Flora sensor (Xiaomi BLE) in the tomatoes: the soil is too dry.
device("flora", "Tomatoes", "Mi Flora HHCCJCY01");
entity("sensor.tomates_humidite", "flora", "xiaomi_ble", null, "14", { friendly_name: "Tomatoes Moisture", device_class: "moisture", unit_of_measurement: "%" });
entity("sensor.tomates_conductivite", "flora", "xiaomi_ble", null, "640", { friendly_name: "Tomatoes Conductivity", device_class: "conductivity", unit_of_measurement: "µS/cm" });
entity("sensor.tomates_lumiere", "flora", "xiaomi_ble", null, "23500", { friendly_name: "Tomatoes Illuminance", device_class: "illuminance", unit_of_measurement: "lx" });
entity("sensor.tomates_temperature", "flora", "xiaomi_ble", null, "24.1", { friendly_name: "Tomatoes Temperature", device_class: "temperature", unit_of_measurement: "°C" });
entity("sensor.tomates_batterie", "flora", "xiaomi_ble", null, "71", { friendly_name: "Tomatoes Battery", device_class: "battery", unit_of_measurement: "%" });

// Plant Monitor (custom plant integration): a plant entity with its sensors and threshold numbers on its device.
device("olive", "Olive tree", "Olea europaea");
entity("plant.olivier", "olive", "plant", null, "ok", { friendly_name: "Olive tree", species: "olea europaea" });
entity("sensor.olivier_humidite_du_sol", "olive", "plant", null, "28", { friendly_name: "Olive tree Soil moisture", device_class: "moisture", unit_of_measurement: "%" });
entity("sensor.olivier_eclairement", "olive", "plant", null, "41000", { friendly_name: "Olive tree Illuminance", device_class: "illuminance", unit_of_measurement: "lx" });
entity("sensor.olivier_conductivite", "olive", "plant", null, "900", { friendly_name: "Olive tree Conductivity", device_class: "conductivity", unit_of_measurement: "µS/cm" });
entity("sensor.olivier_temperature", "olive", "plant", null, "26.3", { friendly_name: "Olive tree Temperature", device_class: "temperature", unit_of_measurement: "°C" });
for (const [k, v] of Object.entries({ min_soil_moisture: 15, max_soil_moisture: 50, min_temperature: 5, max_temperature: 32, min_illuminance: 5000, max_illuminance: 90000, min_conductivity: 400, max_conductivity: 2000 }))
  entity(`number.olivier_${k}`, "olive", "plant", null, String(v), { friendly_name: `Olive tree ${k}` });

// A Zigbee soil moisture sensor in the lawn.
device("soil", "Lawn soil sensor", "Soil moisture sensor");
entity("sensor.sol_gazon", "soil", "zha", null, "31", { friendly_name: "Lawn soil", device_class: "moisture", unit_of_measurement: "%" });

// Weather: cloudy now, rain from late morning (6.4 mm over the next 24 h, up to 80 %).
entity("weather.maison", null, "met", null, "cloudy", { friendly_name: "Home", temperature: 18, precipitation_unit: "mm", supported_features: 3 });
const RAIN = [0, 0, 0, 0.2, 0.6, 1.4, 1.8, 1.1, 0.7, 0.4, 0.2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
const PROB = [10, 10, 20, 40, 60, 80, 80, 70, 60, 40, 30, 20, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10];
const hourStart = Math.floor(NOW / 3.6e6) * 3.6e6;
export const forecast = RAIN.map((precipitation, i) => ({ datetime: iso(hourStart + i * 3.6e6), precipitation, precipitation_probability: PROB[i], condition: precipitation ? "rainy" : "cloudy" }));
// A dry forecast (for the "no rain" captures and tests).
export const dryForecast = forecast.map((f) => ({ ...f, precipitation: 0, precipitation_probability: 0, condition: "sunny" }));

// Overrides of the animated states.
// watering — the default mock: the vegetable patch waters, rain is expected.
export const watering = {};
// rain — nothing waters: the card suggests skipping (the vegetable patch closed).
export const raining = { "valve.potager": { state: "closed" }, "binary_sensor.potager_arrosage": { state: "off" }, "sensor.potager_restant": { state: "0" } };
// thirsty — nothing waters, dry forecast (see dryForecast), the tomatoes need water.
export const thirsty = raining;
