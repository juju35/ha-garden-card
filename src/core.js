/*
 * Garden Card for Home Assistant
 * https://github.com/juju35/ha-garden-card
 *
 * Lovelace cards for the garden: watering zones (valves and switches of Gardena smart system, Gardena Bluetooth,
 * Rain Bird, OpenSprinkler, Hydrawise, LinkTap, Rachio, Orbit B-hyve, or any valve / switch), soil moisture
 * sensors, plants (the plant integration, Mi Flora and other plant sensors) and the rain forecast of a weather
 * entity, with a "no watering needed, rain expected" suggestion.
 * Entities are found through the entity and device registries, so they work whatever the Home Assistant language
 * or entity ids; every one of them can also be set in the configuration.
 */
import { clamp } from "./helpers.js";

export const VERSION = "__VERSION__";

export const ICONS = {
  sprinkler:
    "M10 10H14V22H10V10M7 9H9V7H7V9M4 8H6V6H4V8M4 11H6V9H4V11M1 13H3V11H1V13M1 7H3V5H1V7M1 10H3V8H1V10M18 11H20V9H18V11M21 10H23V8H21V10M21 5V7H23V5H21M21 13H23V11H21V13M15 9H17V7H15V9M18 8H20V6H18V8M10 7H10.33L11 9H13L13.67 7H14V6H10V7Z",
  water: "M12,20A6,6 0 0,1 6,14C6,10 12,3.25 12,3.25C12,3.25 18,10 18,14A6,6 0 0,1 12,20Z",
  water_off:
    "M20.84 22.73L16.29 18.18C15.2 19.3 13.69 20 12 20C8.69 20 6 17.31 6 14C6 12.67 6.67 11.03 7.55 9.44L1.11 3L2.39 1.73L22.11 21.46L20.84 22.73M18 14C18 10 12 3.25 12 3.25S10.84 4.55 9.55 6.35L17.95 14.75C18 14.5 18 14.25 18 14Z",
  moisture:
    "M12,3.25C12,3.25 6,10 6,14C6,17.32 8.69,20 12,20A6,6 0 0,0 18,14C18,10 12,3.25 12,3.25M14.47,9.97L15.53,11.03L9.53,17.03L8.47,15.97M9.75,10A1.25,1.25 0 0,1 11,11.25A1.25,1.25 0 0,1 9.75,12.5A1.25,1.25 0 0,1 8.5,11.25A1.25,1.25 0 0,1 9.75,10M14.25,14.5A1.25,1.25 0 0,1 15.5,15.75A1.25,1.25 0 0,1 14.25,17A1.25,1.25 0 0,1 13,15.75A1.25,1.25 0 0,1 14.25,14.5Z",
  sprout:
    "M2,22V20C2,20 7,18 12,18C17,18 22,20 22,20V22H2M11.3,9.1C10.1,5.2 4,6.1 4,6.1C4,6.1 4.2,13.9 9.9,12.7C9.5,9.8 8,9 8,9C10.8,9 11,12.4 11,12.4V17C11.3,17 11.7,17 12,17C12.3,17 12.7,17 13,17V12.8C13,12.8 13,8.9 16,7.9C16,7.9 14,10.9 14,12.9C21,13.6 21,4 21,4C21,4 12.1,3 11.3,9.1Z",
  flower:
    "M3,13A9,9 0 0,0 12,22A9,9 0 0,0 3,13M12,22A9,9 0 0,0 21,13A9,9 0 0,0 12,22M18,3V8A6,6 0 0,1 12,14A6,6 0 0,1 6,8V3C6.74,3 7.47,3.12 8.16,3.39C8.71,3.62 9.2,3.96 9.61,4.39L12,2L14.39,4.39C14.8,3.96 15.29,3.62 15.84,3.39C16.53,3.12 17.26,3 18,3Z",
  temperature: "M15 13V5A3 3 0 0 0 9 5V13A5 5 0 1 0 15 13M12 4A1 1 0 0 1 13 5V8H11V5A1 1 0 0 1 12 4Z",
  illuminance:
    "M3.55 19.09L4.96 20.5L6.76 18.71L5.34 17.29M12 6C8.69 6 6 8.69 6 12S8.69 18 12 18 18 15.31 18 12C18 8.68 15.31 6 12 6M20 13H23V11H20M17.24 18.71L19.04 20.5L20.45 19.09L18.66 17.29M20.45 5L19.04 3.6L17.24 5.39L18.66 6.81M13 1H11V4H13M6.76 5.39L4.96 3.6L3.55 5L5.34 6.81L6.76 5.39M1 13H4V11H1M13 20H11V23H13",
  conductivity: "M7,2V13H10V22L17,10H13L17,2H7Z",
  battery: "M16.67,4H15V2H9V4H7.33A1.33,1.33 0 0,0 6,5.33V20.67C6,21.4 6.6,22 7.33,22H16.67A1.33,1.33 0 0,0 18,20.67V5.33C18,4.6 17.4,4 16.67,4Z",
  calendar:
    "M15,13H16.5V15.82L18.94,17.23L18.19,18.53L15,16.69V13M19,8H5V19H9.67C9.24,18.09 9,17.07 9,16A7,7 0 0,1 16,9C17.07,9 18.09,9.24 19,9.67V8M5,21C3.89,21 3,20.1 3,19V5C3,3.89 3.89,3 5,3H6V1H8V3H16V1H18V3H19A2,2 0 0,1 21,5V11.1C22.24,12.36 23,14.09 23,16A7,7 0 0,1 16,23C14.09,23 12.36,22.24 11.1,21H5M16,11.15A4.85,4.85 0 0,0 11.15,16C11.15,18.68 13.32,20.85 16,20.85A4.85,4.85 0 0,0 20.85,16C20.85,13.32 18.68,11.15 16,11.15Z",
  cloud:
    "M6,19A5,5 0 0,1 1,14A5,5 0 0,1 6,9C7,6.65 9.3,5 12,5C15.43,5 18.24,7.66 18.5,11.03L19,11A4,4 0 0,1 23,15A4,4 0 0,1 19,19H6M19,13H17V12A5,5 0 0,0 12,7C9.5,7 7.45,8.82 7.06,11.19C6.73,11.07 6.37,11 6,11A3,3 0 0,0 3,14A3,3 0 0,0 6,17H19A2,2 0 0,0 21,15A2,2 0 0,0 19,13Z",
  sun: "M12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,2L14.39,5.42C13.65,5.15 12.84,5 12,5C11.16,5 10.35,5.15 9.61,5.42L12,2M3.34,7L7.5,6.65C6.9,7.16 6.36,7.78 5.94,8.5C5.5,9.24 5.25,10 5.11,10.79L3.34,7M3.36,17L5.12,13.23C5.26,14 5.53,14.78 5.95,15.5C6.37,16.24 6.91,16.86 7.5,17.37L3.36,17M20.65,7L18.88,10.79C18.74,10 18.47,9.23 18.05,8.5C17.63,7.78 17.1,7.15 16.5,6.64L20.65,7M20.64,17L16.5,17.36C17.09,16.85 17.62,16.22 18.04,15.5C18.46,14.77 18.73,14 18.87,13.21L20.64,17M12,22L9.59,18.56C10.33,18.83 11.14,19 12,19C12.82,19 13.63,18.83 14.37,18.56L12,22Z",
  alert:
    "M11,15H13V17H11V15M11,7H13V13H11V7M12,2C6.47,2 2,6.5 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20Z",
  chevron_down: "M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z",
  expand: "M10,21V19H6.41L10.91,14.5L9.5,13.09L5,17.59V14H3V21H10M14.5,10.91L19,6.41V10H21V3H14V5H17.59L13.09,9.5L14.5,10.91Z",
  collapse: "M19.5,3.09L15,7.59V4H13V11H20V9H16.41L20.91,4.5L19.5,3.09M4,13V15H7.59L3.09,19.5L4.5,20.91L9,16.41V20H11V13H4Z",
  play: "M8,5.14V19.14L19,12.14L8,5.14Z",
  stop: "M18,18H6V6H18V18Z",
  timer:
    "M12,20A7,7 0 0,1 5,13A7,7 0 0,1 12,6A7,7 0 0,1 19,13A7,7 0 0,1 12,20M19.03,7.39L20.45,5.97C20,5.46 19.55,5 19.04,4.56L17.62,6C16.07,4.74 14.12,4 12,4A9,9 0 0,0 3,13A9,9 0 0,0 12,22C17,22 21,17.97 21,13C21,10.88 20.26,8.93 19.03,7.39M11,14H13V8H11M15,1H9V3H15V1Z",
  minus: "M19,13H5V11H19V13Z",
  plus: "M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z",
};

// Integrations whose zones are found on their own, with how a zone is started for a given number of minutes.
// Each `start` returns the service calls [domain, service, data]; null: the generic way (a duration number entity
// of the zone's device, then open / turn on). `max`: the longest run the integration accepts, in minutes. `zone`
// tells a zone from the integration's other entities of the same domain (registry entry).
export const mins = (min, max) => clamp(Math.round(min), 1, max);
export const PLATFORMS = {
  gardena_smart_system: {
    name: "Gardena smart system",
    domains: ["valve"],
    max: 240,
    // valve_open: duration in seconds, a multiple of 60 from 60 to 14400.
    start: (z, min) => [["gardena_smart_system", "valve_open", { entity_id: z.entity, duration: mins(min, 240) * 60 }]],
  },
  gardena_bluetooth: {
    name: "Gardena Bluetooth",
    domains: ["valve"],
    max: 1440,
    // The "Open for" number (minutes) opens the valve for that long, without changing its manual watering time.
    start: (z, min) => (z.openFor ? [["number", "set_value", { entity_id: z.openFor, value: mins(min, 1440) }]] : null),
  },
  rainbird: {
    name: "Rain Bird",
    domains: ["switch"],
    max: 1440,
    start: (z, min) => [["rainbird", "start_irrigation", { entity_id: z.entity, duration: mins(min, 1440) }]],
  },
  opensprinkler: {
    name: "OpenSprinkler",
    domains: ["switch"],
    max: 1080,
    // Only the station switches (<station>_station_enabled) are zones, not the master station (a pump); they enable
    // a station, the run goes through run_station (0 to 64800 s) and its state is the <station>_station_running
    // binary sensor.
    zone: (e, st) => /_station_enabled$/.test(e.entity_id) && !st?.attributes?.is_master,
    start: (z, min) => [["opensprinkler", "run_station", { entity_id: z.entity, run_seconds: mins(min, 1080) * 60 }]],
    stop: (z) => [["opensprinkler", "stop", { entity_id: z.entity }]],
  },
  hydrawise: {
    name: "Hydrawise",
    domains: ["valve"],
    max: 1440,
    // start_watering targets the zone's Watering binary sensor, duration in minutes (up to 1440).
    start: (z, min) => (z.watering ? [["hydrawise", "start_watering", { entity_id: z.watering, duration: mins(min, 1440) }]] : null),
  },
  linktap: {
    name: "LinkTap",
    domains: ["valve"],
    max: 1439,
    // start_watering on the valve, in seconds (the tap's own limit: 1439 minutes).
    start: (z, min) => [["linktap", "start_watering", { entity_id: z.entity, seconds: mins(min, 1439) * 60 }]],
  },
  rachio: {
    name: "Rachio",
    domains: ["switch"],
    // The Rachio API runs a zone for 3 hours at most.
    max: 180,
    zone: (e) => !/(standby|rain_delay|schedule)/.test(`${e.entity_id} ${e.translation_key || ""}`),
    start: (z, min) => [["rachio", "start_watering", { entity_id: z.entity, duration: mins(min, 180) }]],
  },
  bhyve: {
    name: "Orbit B-hyve",
    // Zones are valves since 4.0 (switches before); the switches of 4.x are programs, rain delay, smart watering.
    domains: ["valve", "switch"],
    max: 1440,
    zone: (e) => !/(rain_delay|program|smart_watering)/.test(`${e.entity_id} ${e.translation_key || ""}`),
    // bhyve.start_watering: entity_id and minutes (a positive integer).
    start: (z, min) => [["bhyve", "start_watering", { entity_id: z.entity, minutes: mins(min, 1440) }]],
  },
};

// Default thresholds: those of the plant integration (moisture 20-60 %, conductivity 500-3000 µS/cm, battery 20 %).
// Light and temperature have none there: the plant integration checks light against the day's maximum, so a
// threshold on the current light would warn every night; they come from the configuration or Plant Monitor.
export const THRESHOLDS = { moisture: [20, 60], conductivity: [500, 3000], illuminance: [null, null], temperature: [null, null], battery: [20, null] };
export const READINGS = ["moisture", "conductivity", "illuminance", "temperature", "battery"];
export const UNITS = { moisture: "%", conductivity: "µS/cm", illuminance: "lx", temperature: "°C", battery: "%" };
export const RAINY = new Set(["rainy", "pouring", "lightning-rainy", "snowy-rainy", "hail"]);
export const DEFAULT_COLLAPSED = [];
export const PRESETS = [5, 10, 15, 20, 30, 45, 60];
