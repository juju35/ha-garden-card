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

const VERSION = "__VERSION__";

const ICONS = {
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
const mins = (min, max) => clamp(Math.round(min), 1, max);
const PLATFORMS = {
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
const THRESHOLDS = { moisture: [20, 60], conductivity: [500, 3000], illuminance: [null, null], temperature: [null, null], battery: [20, null] };
const READINGS = ["moisture", "conductivity", "illuminance", "temperature", "battery"];
const UNITS = { moisture: "%", conductivity: "µS/cm", illuminance: "lx", temperature: "°C", battery: "%" };
const RAINY = new Set(["rainy", "pouring", "lightning-rainy", "snowy-rainy", "hail"]);
const DEFAULT_COLLAPSED = [];
const PRESETS = [5, 10, 15, 20, 30, 45, 60];

const STRINGS = {
  en: {
    garden: "Garden",
    zones: "Watering zones",
    plants: "Plants",
    soil: "Soil moisture",
    watering: "Watering",
    idle: "Idle",
    unavailable: "Unavailable",
    left: "{time} left",
    runs_until_stopped: "Runs until stopped",
    next: "Next {when}",
    next_watering: "Next watering {when}",
    today: "today {time}",
    tomorrow: "tomorrow {time}",
    start: "Start",
    stop: "Stop",
    cancel: "Cancel",
    water_zone: "Water {name}",
    duration: "Duration",
    less: "Less",
    more: "More",
    skip_title: "No watering needed",
    raining: "It is raining now",
    rain_expected: "{amount} of rain expected in the next {hours} h",
    rain_chance: "{prob} % chance of rain",
    dry: "No rain expected in the next {hours} h",
    plants_ok: "All plants are fine",
    plants_attention: "{n} plants need attention",
    plant_attention: "1 plant needs attention",
    needs_water: "Needs water",
    too_wet: "Too wet",
    low: "Low",
    high: "High",
    ok: "OK",
    low_battery: "Low battery",
    moisture: "Moisture",
    conductivity: "Fertility",
    illuminance: "Light",
    temperature: "Temperature",
    battery: "Battery",
    zones_count: "{n} zones",
    zone_count: "1 zone",
    plants_count: "{n} plants",
    plant_count: "1 plant",
    no_data: "Nothing to show: no watering zone, plant or soil moisture sensor found.",
    no_registry: "This card needs Home Assistant 2024.8 or later.",
    zoom_in: "Show details",
    zoom_out: "Show less",
    // Editor
    title: "Title (optional)",
    weather: "Weather entity (rain forecast)",
    rain_sensor: "Rain forecast sensor (optional)",
    next_run: "Next watering entity (optional)",
    rain_threshold: "Rain that makes watering unnecessary",
    rain_probability: "Rain probability that makes watering unnecessary (%)",
    rain_window: "Forecast window (hours)",
    default_duration: "Default watering duration (minutes)",
    zone_entities: "Watering zones (valves, switches; empty: automatic)",
    plant_entities: "Plants (empty: automatic)",
    plant_devices: "Plant sensor devices (Mi Flora…)",
    moisture_sensors: "Soil moisture sensors (empty: automatic)",
    show_title: "Show title",
    show_subtitle: "Show subtitle",
    show_zones: "Show watering zones",
    show_plants: "Show plants",
    show_soil: "Show soil moisture",
    show_weather: "Show the rain suggestion",
    collapsed: "Sections folded by default",
    zoom: "Detail button",
    zoom_helper: "Switches the mini card to the full card's content",
    language: "Language",
    lang_auto: "Automatic",
  },
  fr: {
    garden: "Jardin",
    zones: "Zones d'arrosage",
    plants: "Plantes",
    soil: "Humidité du sol",
    watering: "Arrosage",
    idle: "À l'arrêt",
    unavailable: "Indisponible",
    left: "{time} restantes",
    runs_until_stopped: "Jusqu'à l'arrêt",
    next: "Prochain {when}",
    next_watering: "Prochain arrosage {when}",
    today: "aujourd'hui {time}",
    tomorrow: "demain {time}",
    start: "Démarrer",
    stop: "Arrêter",
    cancel: "Annuler",
    water_zone: "Arroser {name}",
    duration: "Durée",
    less: "Moins",
    more: "Plus",
    skip_title: "Arrosage inutile",
    raining: "Il pleut",
    rain_expected: "{amount} de pluie prévus dans les {hours} h",
    rain_chance: "{prob} % de risque de pluie",
    dry: "Pas de pluie prévue dans les {hours} h",
    plants_ok: "Toutes les plantes vont bien",
    plants_attention: "{n} plantes demandent de l'attention",
    plant_attention: "1 plante demande de l'attention",
    needs_water: "A soif",
    too_wet: "Trop humide",
    low: "Bas",
    high: "Haut",
    ok: "OK",
    low_battery: "Pile faible",
    moisture: "Humidité",
    conductivity: "Fertilité",
    illuminance: "Lumière",
    temperature: "Température",
    battery: "Pile",
    zones_count: "{n} zones",
    zone_count: "1 zone",
    plants_count: "{n} plantes",
    plant_count: "1 plante",
    no_data: "Rien à afficher : aucune zone d'arrosage, plante ou sonde d'humidité du sol trouvée.",
    no_registry: "Cette carte nécessite Home Assistant 2024.8 ou plus récent.",
    zoom_in: "Afficher les détails",
    zoom_out: "Réduire",
    title: "Titre (facultatif)",
    weather: "Entité météo (prévision de pluie)",
    rain_sensor: "Capteur de pluie prévue (facultatif)",
    next_run: "Entité du prochain arrosage (facultatif)",
    rain_threshold: "Pluie rendant l'arrosage inutile",
    rain_probability: "Probabilité de pluie rendant l'arrosage inutile (%)",
    rain_window: "Fenêtre de prévision (heures)",
    default_duration: "Durée d'arrosage par défaut (minutes)",
    zone_entities: "Zones d'arrosage (vannes, interrupteurs ; vide : automatique)",
    plant_entities: "Plantes (vide : automatique)",
    plant_devices: "Capteurs de plantes (Mi Flora…)",
    moisture_sensors: "Sondes d'humidité du sol (vide : automatique)",
    show_title: "Afficher le titre",
    show_subtitle: "Afficher le sous-titre",
    show_zones: "Afficher les zones d'arrosage",
    show_plants: "Afficher les plantes",
    show_soil: "Afficher l'humidité du sol",
    show_weather: "Afficher la suggestion de pluie",
    collapsed: "Sections repliées par défaut",
    zoom: "Bouton détail",
    zoom_helper: "Bascule la mini-carte vers le contenu de la carte complète",
    language: "Langue",
    lang_auto: "Automatique",
  },
  de: {
    garden: "Garten",
    zones: "Bewässerungszonen",
    plants: "Pflanzen",
    soil: "Bodenfeuchte",
    watering: "Bewässerung",
    idle: "Inaktiv",
    unavailable: "Nicht verfügbar",
    left: "Noch {time}",
    runs_until_stopped: "Läuft bis zum Stopp",
    next: "Nächste {when}",
    next_watering: "Nächste Bewässerung {when}",
    today: "heute {time}",
    tomorrow: "morgen {time}",
    start: "Starten",
    stop: "Stoppen",
    cancel: "Abbrechen",
    water_zone: "{name} bewässern",
    duration: "Dauer",
    less: "Weniger",
    more: "Mehr",
    skip_title: "Keine Bewässerung nötig",
    raining: "Es regnet gerade",
    rain_expected: "{amount} Regen in den nächsten {hours} h erwartet",
    rain_chance: "{prob} % Regenwahrscheinlichkeit",
    dry: "Kein Regen in den nächsten {hours} h erwartet",
    plants_ok: "Allen Pflanzen geht es gut",
    plants_attention: "{n} Pflanzen brauchen Aufmerksamkeit",
    plant_attention: "1 Pflanze braucht Aufmerksamkeit",
    needs_water: "Braucht Wasser",
    too_wet: "Zu nass",
    low: "Niedrig",
    high: "Hoch",
    ok: "OK",
    low_battery: "Batterie schwach",
    moisture: "Feuchte",
    conductivity: "Fruchtbarkeit",
    illuminance: "Licht",
    temperature: "Temperatur",
    battery: "Batterie",
    zones_count: "{n} Zonen",
    zone_count: "1 Zone",
    plants_count: "{n} Pflanzen",
    plant_count: "1 Pflanze",
    no_data: "Nichts anzuzeigen: keine Bewässerungszone, Pflanze oder Bodenfeuchtesensor gefunden.",
    no_registry: "Diese Karte benötigt Home Assistant 2024.8 oder neuer.",
    zoom_in: "Details anzeigen",
    zoom_out: "Weniger anzeigen",
    title: "Titel (optional)",
    weather: "Wetter-Entität (Regenvorhersage)",
    rain_sensor: "Regenvorhersage-Sensor (optional)",
    next_run: "Entität der nächsten Bewässerung (optional)",
    rain_threshold: "Regenmenge, ab der Bewässerung unnötig ist",
    rain_probability: "Regenwahrscheinlichkeit, ab der Bewässerung unnötig ist (%)",
    rain_window: "Vorhersagezeitraum (Stunden)",
    default_duration: "Standard-Bewässerungsdauer (Minuten)",
    zone_entities: "Bewässerungszonen (Ventile, Schalter; leer: automatisch)",
    plant_entities: "Pflanzen (leer: automatisch)",
    plant_devices: "Pflanzensensor-Geräte (Mi Flora…)",
    moisture_sensors: "Bodenfeuchtesensoren (leer: automatisch)",
    show_title: "Titel anzeigen",
    show_subtitle: "Untertitel anzeigen",
    show_zones: "Bewässerungszonen anzeigen",
    show_plants: "Pflanzen anzeigen",
    show_soil: "Bodenfeuchte anzeigen",
    show_weather: "Regenhinweis anzeigen",
    collapsed: "Standardmäßig eingeklappte Bereiche",
    zoom: "Detail-Schaltfläche",
    zoom_helper: "Schaltet die Mini-Karte auf den Inhalt der vollen Karte um",
    language: "Sprache",
    lang_auto: "Automatisch",
  },
  es: {
    garden: "Jardín",
    zones: "Zonas de riego",
    plants: "Plantas",
    soil: "Humedad del suelo",
    watering: "Regando",
    idle: "Inactivo",
    unavailable: "No disponible",
    left: "Quedan {time}",
    runs_until_stopped: "Hasta detenerlo",
    next: "Próximo {when}",
    next_watering: "Próximo riego {when}",
    today: "hoy {time}",
    tomorrow: "mañana {time}",
    start: "Iniciar",
    stop: "Detener",
    cancel: "Cancelar",
    water_zone: "Regar {name}",
    duration: "Duración",
    less: "Menos",
    more: "Más",
    skip_title: "No hace falta regar",
    raining: "Está lloviendo",
    rain_expected: "{amount} de lluvia previstos en las próximas {hours} h",
    rain_chance: "{prob} % de probabilidad de lluvia",
    dry: "Sin lluvia prevista en las próximas {hours} h",
    plants_ok: "Todas las plantas están bien",
    plants_attention: "{n} plantas necesitan atención",
    plant_attention: "1 planta necesita atención",
    needs_water: "Necesita agua",
    too_wet: "Demasiado húmedo",
    low: "Bajo",
    high: "Alto",
    ok: "OK",
    low_battery: "Batería baja",
    moisture: "Humedad",
    conductivity: "Fertilidad",
    illuminance: "Luz",
    temperature: "Temperatura",
    battery: "Batería",
    zones_count: "{n} zonas",
    zone_count: "1 zona",
    plants_count: "{n} plantas",
    plant_count: "1 planta",
    no_data: "Nada que mostrar: no se encontró ninguna zona de riego, planta ni sensor de humedad del suelo.",
    no_registry: "Esta tarjeta necesita Home Assistant 2024.8 o posterior.",
    zoom_in: "Ver detalles",
    zoom_out: "Ver menos",
    title: "Título (opcional)",
    weather: "Entidad meteorológica (previsión de lluvia)",
    rain_sensor: "Sensor de lluvia prevista (opcional)",
    next_run: "Entidad del próximo riego (opcional)",
    rain_threshold: "Lluvia que hace innecesario el riego",
    rain_probability: "Probabilidad de lluvia que hace innecesario el riego (%)",
    rain_window: "Ventana de previsión (horas)",
    default_duration: "Duración de riego predeterminada (minutos)",
    zone_entities: "Zonas de riego (válvulas, interruptores; vacío: automático)",
    plant_entities: "Plantas (vacío: automático)",
    plant_devices: "Dispositivos sensores de plantas (Mi Flora…)",
    moisture_sensors: "Sensores de humedad del suelo (vacío: automático)",
    show_title: "Mostrar título",
    show_subtitle: "Mostrar subtítulo",
    show_zones: "Mostrar zonas de riego",
    show_plants: "Mostrar plantas",
    show_soil: "Mostrar humedad del suelo",
    show_weather: "Mostrar la sugerencia de lluvia",
    collapsed: "Secciones plegadas por defecto",
    zoom: "Botón de detalle",
    zoom_helper: "Cambia la minitarjeta al contenido de la tarjeta completa",
    language: "Idioma",
    lang_auto: "Automático",
  },
  it: {
    garden: "Giardino",
    zones: "Zone di irrigazione",
    plants: "Piante",
    soil: "Umidità del terreno",
    watering: "Irrigazione",
    idle: "Inattivo",
    unavailable: "Non disponibile",
    left: "{time} rimanenti",
    runs_until_stopped: "Fino all'arresto",
    next: "Prossima {when}",
    next_watering: "Prossima irrigazione {when}",
    today: "oggi {time}",
    tomorrow: "domani {time}",
    start: "Avvia",
    stop: "Ferma",
    cancel: "Annulla",
    water_zone: "Irriga {name}",
    duration: "Durata",
    less: "Meno",
    more: "Più",
    skip_title: "Irrigazione non necessaria",
    raining: "Sta piovendo",
    rain_expected: "{amount} di pioggia previsti nelle prossime {hours} h",
    rain_chance: "{prob} % di probabilità di pioggia",
    dry: "Nessuna pioggia prevista nelle prossime {hours} h",
    plants_ok: "Tutte le piante stanno bene",
    plants_attention: "{n} piante richiedono attenzione",
    plant_attention: "1 pianta richiede attenzione",
    needs_water: "Ha sete",
    too_wet: "Troppo umido",
    low: "Basso",
    high: "Alto",
    ok: "OK",
    low_battery: "Batteria scarica",
    moisture: "Umidità",
    conductivity: "Fertilità",
    illuminance: "Luce",
    temperature: "Temperatura",
    battery: "Batteria",
    zones_count: "{n} zone",
    zone_count: "1 zona",
    plants_count: "{n} piante",
    plant_count: "1 pianta",
    no_data: "Niente da mostrare: nessuna zona di irrigazione, pianta o sensore di umidità del terreno trovati.",
    no_registry: "Questa scheda richiede Home Assistant 2024.8 o successivo.",
    zoom_in: "Mostra dettagli",
    zoom_out: "Mostra meno",
    title: "Titolo (facoltativo)",
    weather: "Entità meteo (previsione di pioggia)",
    rain_sensor: "Sensore di pioggia prevista (facoltativo)",
    next_run: "Entità della prossima irrigazione (facoltativa)",
    rain_threshold: "Pioggia che rende inutile l'irrigazione",
    rain_probability: "Probabilità di pioggia che rende inutile l'irrigazione (%)",
    rain_window: "Finestra di previsione (ore)",
    default_duration: "Durata di irrigazione predefinita (minuti)",
    zone_entities: "Zone di irrigazione (valvole, interruttori; vuoto: automatico)",
    plant_entities: "Piante (vuoto: automatico)",
    plant_devices: "Dispositivi sensori per piante (Mi Flora…)",
    moisture_sensors: "Sensori di umidità del terreno (vuoto: automatico)",
    show_title: "Mostra titolo",
    show_subtitle: "Mostra sottotitolo",
    show_zones: "Mostra zone di irrigazione",
    show_plants: "Mostra piante",
    show_soil: "Mostra umidità del terreno",
    show_weather: "Mostra il suggerimento pioggia",
    collapsed: "Sezioni chiuse per impostazione predefinita",
    zoom: "Pulsante dettagli",
    zoom_helper: "Passa la mini scheda al contenuto della scheda completa",
    language: "Lingua",
    lang_auto: "Automatica",
  },
  nl: {
    garden: "Tuin",
    zones: "Beregeningszones",
    plants: "Planten",
    soil: "Bodemvocht",
    watering: "Beregenen",
    idle: "Inactief",
    unavailable: "Niet beschikbaar",
    left: "Nog {time}",
    runs_until_stopped: "Loopt tot stoppen",
    next: "Volgende {when}",
    next_watering: "Volgende beregening {when}",
    today: "vandaag {time}",
    tomorrow: "morgen {time}",
    start: "Starten",
    stop: "Stoppen",
    cancel: "Annuleren",
    water_zone: "{name} beregenen",
    duration: "Duur",
    less: "Minder",
    more: "Meer",
    skip_title: "Beregenen niet nodig",
    raining: "Het regent nu",
    rain_expected: "{amount} regen verwacht in de komende {hours} u",
    rain_chance: "{prob} % kans op regen",
    dry: "Geen regen verwacht in de komende {hours} u",
    plants_ok: "Alle planten maken het goed",
    plants_attention: "{n} planten hebben aandacht nodig",
    plant_attention: "1 plant heeft aandacht nodig",
    needs_water: "Heeft water nodig",
    too_wet: "Te nat",
    low: "Laag",
    high: "Hoog",
    ok: "OK",
    low_battery: "Batterij bijna leeg",
    moisture: "Vocht",
    conductivity: "Vruchtbaarheid",
    illuminance: "Licht",
    temperature: "Temperatuur",
    battery: "Batterij",
    zones_count: "{n} zones",
    zone_count: "1 zone",
    plants_count: "{n} planten",
    plant_count: "1 plant",
    no_data: "Niets te tonen: geen beregeningszone, plant of bodemvochtsensor gevonden.",
    no_registry: "Deze kaart vereist Home Assistant 2024.8 of nieuwer.",
    zoom_in: "Details tonen",
    zoom_out: "Minder tonen",
    title: "Titel (optioneel)",
    weather: "Weerentiteit (regenverwachting)",
    rain_sensor: "Regenverwachtingssensor (optioneel)",
    next_run: "Entiteit volgende beregening (optioneel)",
    rain_threshold: "Regen waardoor beregenen niet nodig is",
    rain_probability: "Regenkans waardoor beregenen niet nodig is (%)",
    rain_window: "Voorspellingsvenster (uren)",
    default_duration: "Standaard beregeningsduur (minuten)",
    zone_entities: "Beregeningszones (kleppen, schakelaars; leeg: automatisch)",
    plant_entities: "Planten (leeg: automatisch)",
    plant_devices: "Plantsensorapparaten (Mi Flora…)",
    moisture_sensors: "Bodemvochtsensoren (leeg: automatisch)",
    show_title: "Titel tonen",
    show_subtitle: "Ondertitel tonen",
    show_zones: "Beregeningszones tonen",
    show_plants: "Planten tonen",
    show_soil: "Bodemvocht tonen",
    show_weather: "Regenadvies tonen",
    collapsed: "Standaard ingeklapte secties",
    zoom: "Detailknop",
    zoom_helper: "Schakelt de minikaart naar de inhoud van de volledige kaart",
    language: "Taal",
    lang_auto: "Automatisch",
  },
  pt: {
    garden: "Jardim",
    zones: "Zonas de rega",
    plants: "Plantas",
    soil: "Humidade do solo",
    watering: "A regar",
    idle: "Inativo",
    unavailable: "Indisponível",
    left: "Faltam {time}",
    runs_until_stopped: "Até parar",
    next: "Próxima {when}",
    next_watering: "Próxima rega {when}",
    today: "hoje {time}",
    tomorrow: "amanhã {time}",
    start: "Iniciar",
    stop: "Parar",
    cancel: "Cancelar",
    water_zone: "Regar {name}",
    duration: "Duração",
    less: "Menos",
    more: "Mais",
    skip_title: "Rega desnecessária",
    raining: "Está a chover",
    rain_expected: "{amount} de chuva previstos nas próximas {hours} h",
    rain_chance: "{prob} % de probabilidade de chuva",
    dry: "Sem chuva prevista nas próximas {hours} h",
    plants_ok: "Todas as plantas estão bem",
    plants_attention: "{n} plantas precisam de atenção",
    plant_attention: "1 planta precisa de atenção",
    needs_water: "Precisa de água",
    too_wet: "Demasiado húmido",
    low: "Baixo",
    high: "Alto",
    ok: "OK",
    low_battery: "Bateria fraca",
    moisture: "Humidade",
    conductivity: "Fertilidade",
    illuminance: "Luz",
    temperature: "Temperatura",
    battery: "Bateria",
    zones_count: "{n} zonas",
    zone_count: "1 zona",
    plants_count: "{n} plantas",
    plant_count: "1 planta",
    no_data: "Nada a mostrar: nenhuma zona de rega, planta ou sensor de humidade do solo encontrado.",
    no_registry: "Este cartão requer o Home Assistant 2024.8 ou posterior.",
    zoom_in: "Mostrar detalhes",
    zoom_out: "Mostrar menos",
    title: "Título (opcional)",
    weather: "Entidade meteorológica (previsão de chuva)",
    rain_sensor: "Sensor de chuva prevista (opcional)",
    next_run: "Entidade da próxima rega (opcional)",
    rain_threshold: "Chuva que torna a rega desnecessária",
    rain_probability: "Probabilidade de chuva que torna a rega desnecessária (%)",
    rain_window: "Janela de previsão (horas)",
    default_duration: "Duração de rega predefinida (minutos)",
    zone_entities: "Zonas de rega (válvulas, interruptores; vazio: automático)",
    plant_entities: "Plantas (vazio: automático)",
    plant_devices: "Dispositivos sensores de plantas (Mi Flora…)",
    moisture_sensors: "Sensores de humidade do solo (vazio: automático)",
    show_title: "Mostrar título",
    show_subtitle: "Mostrar subtítulo",
    show_zones: "Mostrar zonas de rega",
    show_plants: "Mostrar plantas",
    show_soil: "Mostrar humidade do solo",
    show_weather: "Mostrar a sugestão de chuva",
    collapsed: "Secções recolhidas por predefinição",
    zoom: "Botão de detalhe",
    zoom_helper: "Muda o minicartão para o conteúdo do cartão completo",
    language: "Idioma",
    lang_auto: "Automático",
  },
  pl: {
    garden: "Ogród",
    zones: "Strefy podlewania",
    plants: "Rośliny",
    soil: "Wilgotność gleby",
    watering: "Podlewanie",
    idle: "Bezczynny",
    unavailable: "Niedostępne",
    left: "Pozostało {time}",
    runs_until_stopped: "Do zatrzymania",
    next: "Następne {when}",
    next_watering: "Następne podlewanie {when}",
    today: "dziś {time}",
    tomorrow: "jutro {time}",
    start: "Start",
    stop: "Stop",
    cancel: "Anuluj",
    water_zone: "Podlej: {name}",
    duration: "Czas trwania",
    less: "Mniej",
    more: "Więcej",
    skip_title: "Podlewanie niepotrzebne",
    raining: "Teraz pada",
    rain_expected: "{amount} deszczu w ciągu {hours} h",
    rain_chance: "{prob} % szans na deszcz",
    dry: "Brak deszczu w ciągu {hours} h",
    plants_ok: "Wszystkie rośliny mają się dobrze",
    plants_attention: "Rośliny wymagające uwagi: {n}",
    plant_attention: "1 roślina wymaga uwagi",
    needs_water: "Potrzebuje wody",
    too_wet: "Zbyt mokro",
    low: "Niska",
    high: "Wysoka",
    ok: "OK",
    low_battery: "Słaba bateria",
    moisture: "Wilgotność",
    conductivity: "Żyzność",
    illuminance: "Światło",
    temperature: "Temperatura",
    battery: "Bateria",
    zones_count: "Strefy: {n}",
    zone_count: "1 strefa",
    plants_count: "Rośliny: {n}",
    plant_count: "1 roślina",
    no_data: "Brak danych: nie znaleziono strefy podlewania, rośliny ani czujnika wilgotności gleby.",
    no_registry: "Ta karta wymaga Home Assistant 2024.8 lub nowszego.",
    zoom_in: "Pokaż szczegóły",
    zoom_out: "Pokaż mniej",
    title: "Tytuł (opcjonalnie)",
    weather: "Encja pogody (prognoza deszczu)",
    rain_sensor: "Czujnik prognozy deszczu (opcjonalnie)",
    next_run: "Encja następnego podlewania (opcjonalnie)",
    rain_threshold: "Opad, przy którym podlewanie jest zbędne",
    rain_probability: "Prawdopodobieństwo deszczu, przy którym podlewanie jest zbędne (%)",
    rain_window: "Okno prognozy (godziny)",
    default_duration: "Domyślny czas podlewania (minuty)",
    zone_entities: "Strefy podlewania (zawory, przełączniki; puste: automatycznie)",
    plant_entities: "Rośliny (puste: automatycznie)",
    plant_devices: "Urządzenia czujników roślin (Mi Flora…)",
    moisture_sensors: "Czujniki wilgotności gleby (puste: automatycznie)",
    show_title: "Pokaż tytuł",
    show_subtitle: "Pokaż podtytuł",
    show_zones: "Pokaż strefy podlewania",
    show_plants: "Pokaż rośliny",
    show_soil: "Pokaż wilgotność gleby",
    show_weather: "Pokaż sugestię deszczu",
    collapsed: "Sekcje domyślnie zwinięte",
    zoom: "Przycisk szczegółów",
    zoom_helper: "Przełącza minikartę na zawartość pełnej karty",
    language: "Język",
    lang_auto: "Automatycznie",
  },
  sr: {
    garden: "Башта",
    zones: "Зоне наводњавања",
    plants: "Биљке",
    soil: "Влажност земљишта",
    watering: "Наводњавање",
    idle: "Неактивно",
    unavailable: "Недоступно",
    left: "Преостало {time}",
    runs_until_stopped: "Ради до заустављања",
    next: "Следеће {when}",
    next_watering: "Следеће наводњавање {when}",
    today: "данас {time}",
    tomorrow: "сутра {time}",
    start: "Покрени",
    stop: "Заустави",
    cancel: "Откажи",
    water_zone: "Наводњавај: {name}",
    duration: "Трајање",
    less: "Мање",
    more: "Више",
    skip_title: "Наводњавање није потребно",
    raining: "Тренутно пада киша",
    rain_expected: "Очекује се {amount} кише у наредних {hours} h",
    rain_chance: "{prob} % шансе за кишу",
    dry: "Без кише у наредних {hours} h",
    plants_ok: "Све биљке су добро",
    plants_attention: "Биљке којима треба пажња: {n}",
    plant_attention: "1 биљци треба пажња",
    needs_water: "Треба јој вода",
    too_wet: "Превлажно",
    low: "Ниско",
    high: "Високо",
    ok: "OK",
    low_battery: "Слаба батерија",
    moisture: "Влажност",
    conductivity: "Плодност",
    illuminance: "Светлост",
    temperature: "Температура",
    battery: "Батерија",
    zones_count: "Зоне: {n}",
    zone_count: "1 зона",
    plants_count: "Биљке: {n}",
    plant_count: "1 биљка",
    no_data: "Нема шта да се прикаже: није пронађена зона наводњавања, биљка ни сензор влажности земљишта.",
    no_registry: "Ова картица захтева Home Assistant 2024.8 или новији.",
    zoom_in: "Прикажи детаље",
    zoom_out: "Прикажи мање",
    title: "Наслов (опционо)",
    weather: "Ентитет времена (прогноза кише)",
    rain_sensor: "Сензор прогнозе кише (опционо)",
    next_run: "Ентитет следећег наводњавања (опционо)",
    rain_threshold: "Количина кише због које наводњавање није потребно",
    rain_probability: "Вероватноћа кише због које наводњавање није потребно (%)",
    rain_window: "Период прогнозе (сати)",
    default_duration: "Подразумевано трајање наводњавања (минути)",
    zone_entities: "Зоне наводњавања (вентили, прекидачи; празно: аутоматски)",
    plant_entities: "Биљке (празно: аутоматски)",
    plant_devices: "Уређаји сензора биљака (Mi Flora…)",
    moisture_sensors: "Сензори влажности земљишта (празно: аутоматски)",
    show_title: "Прикажи наслов",
    show_subtitle: "Прикажи поднаслов",
    show_zones: "Прикажи зоне наводњавања",
    show_plants: "Прикажи биљке",
    show_soil: "Прикажи влажност земљишта",
    show_weather: "Прикажи предлог због кише",
    collapsed: "Подразумевано скупљени одељци",
    zoom: "Дугме за детаље",
    zoom_helper: "Пребацује мини картицу на садржај пуне картице",
    language: "Језик",
    lang_auto: "Аутоматски",
  },
  "sr-Latn": {
    garden: "Bašta",
    zones: "Zone navodnjavanja",
    plants: "Biljke",
    soil: "Vlažnost zemljišta",
    watering: "Navodnjavanje",
    idle: "Neaktivno",
    unavailable: "Nedostupno",
    left: "Preostalo {time}",
    runs_until_stopped: "Radi do zaustavljanja",
    next: "Sledeće {when}",
    next_watering: "Sledeće navodnjavanje {when}",
    today: "danas {time}",
    tomorrow: "sutra {time}",
    start: "Pokreni",
    stop: "Zaustavi",
    cancel: "Otkaži",
    water_zone: "Navodnjavaj: {name}",
    duration: "Trajanje",
    less: "Manje",
    more: "Više",
    skip_title: "Navodnjavanje nije potrebno",
    raining: "Trenutno pada kiša",
    rain_expected: "Očekuje se {amount} kiše u narednih {hours} h",
    rain_chance: "{prob} % šanse za kišu",
    dry: "Bez kiše u narednih {hours} h",
    plants_ok: "Sve biljke su dobro",
    plants_attention: "Biljke kojima treba pažnja: {n}",
    plant_attention: "1 biljci treba pažnja",
    needs_water: "Treba joj voda",
    too_wet: "Prevlažno",
    low: "Nisko",
    high: "Visoko",
    ok: "OK",
    low_battery: "Slaba baterija",
    moisture: "Vlažnost",
    conductivity: "Plodnost",
    illuminance: "Svetlost",
    temperature: "Temperatura",
    battery: "Baterija",
    zones_count: "Zone: {n}",
    zone_count: "1 zona",
    plants_count: "Biljke: {n}",
    plant_count: "1 biljka",
    no_data: "Nema šta da se prikaže: nije pronađena zona navodnjavanja, biljka ni senzor vlažnosti zemljišta.",
    no_registry: "Ova kartica zahteva Home Assistant 2024.8 ili noviji.",
    zoom_in: "Prikaži detalje",
    zoom_out: "Prikaži manje",
    title: "Naslov (opciono)",
    weather: "Entitet vremena (prognoza kiše)",
    rain_sensor: "Senzor prognoze kiše (opciono)",
    next_run: "Entitet sledećeg navodnjavanja (opciono)",
    rain_threshold: "Količina kiše zbog koje navodnjavanje nije potrebno",
    rain_probability: "Verovatnoća kiše zbog koje navodnjavanje nije potrebno (%)",
    rain_window: "Period prognoze (sati)",
    default_duration: "Podrazumevano trajanje navodnjavanja (minuti)",
    zone_entities: "Zone navodnjavanja (ventili, prekidači; prazno: automatski)",
    plant_entities: "Biljke (prazno: automatski)",
    plant_devices: "Uređaji senzora biljaka (Mi Flora…)",
    moisture_sensors: "Senzori vlažnosti zemljišta (prazno: automatski)",
    show_title: "Prikaži naslov",
    show_subtitle: "Prikaži podnaslov",
    show_zones: "Prikaži zone navodnjavanja",
    show_plants: "Prikaži biljke",
    show_soil: "Prikaži vlažnost zemljišta",
    show_weather: "Prikaži predlog zbog kiše",
    collapsed: "Podrazumevano skupljeni odeljci",
    zoom: "Dugme za detalje",
    zoom_helper: "Prebacuje mini karticu na sadržaj pune kartice",
    language: "Jezik",
    lang_auto: "Automatski",
  },
  ro: {
    garden: "Grădină",
    zones: "Zone de irigare",
    plants: "Plante",
    soil: "Umiditatea solului",
    watering: "Udare",
    idle: "Inactiv",
    unavailable: "Indisponibil",
    left: "Mai sunt {time}",
    runs_until_stopped: "Până la oprire",
    next: "Următoarea {when}",
    next_watering: "Următoarea udare {when}",
    today: "azi {time}",
    tomorrow: "mâine {time}",
    start: "Pornește",
    stop: "Oprește",
    cancel: "Anulează",
    water_zone: "Udă {name}",
    duration: "Durată",
    less: "Mai puțin",
    more: "Mai mult",
    skip_title: "Udarea nu este necesară",
    raining: "Plouă acum",
    rain_expected: "{amount} de ploaie în următoarele {hours} h",
    rain_chance: "{prob} % șanse de ploaie",
    dry: "Fără ploaie în următoarele {hours} h",
    plants_ok: "Toate plantele sunt bine",
    plants_attention: "{n} plante au nevoie de atenție",
    plant_attention: "1 plantă are nevoie de atenție",
    needs_water: "Are nevoie de apă",
    too_wet: "Prea umed",
    low: "Scăzut",
    high: "Ridicat",
    ok: "OK",
    low_battery: "Baterie descărcată",
    moisture: "Umiditate",
    conductivity: "Fertilitate",
    illuminance: "Lumină",
    temperature: "Temperatură",
    battery: "Baterie",
    zones_count: "{n} zone",
    zone_count: "1 zonă",
    plants_count: "{n} plante",
    plant_count: "1 plantă",
    no_data: "Nimic de afișat: nu a fost găsită nicio zonă de irigare, plantă sau senzor de umiditate a solului.",
    no_registry: "Acest card necesită Home Assistant 2024.8 sau mai nou.",
    zoom_in: "Arată detalii",
    zoom_out: "Arată mai puțin",
    title: "Titlu (opțional)",
    weather: "Entitate meteo (prognoză de ploaie)",
    rain_sensor: "Senzor de ploaie prognozată (opțional)",
    next_run: "Entitatea următoarei udări (opțional)",
    rain_threshold: "Ploaie care face udarea inutilă",
    rain_probability: "Probabilitate de ploaie care face udarea inutilă (%)",
    rain_window: "Fereastra prognozei (ore)",
    default_duration: "Durata implicită a udării (minute)",
    zone_entities: "Zone de irigare (robinete, comutatoare; gol: automat)",
    plant_entities: "Plante (gol: automat)",
    plant_devices: "Dispozitive senzori de plante (Mi Flora…)",
    moisture_sensors: "Senzori de umiditate a solului (gol: automat)",
    show_title: "Afișează titlul",
    show_subtitle: "Afișează subtitlul",
    show_zones: "Afișează zonele de irigare",
    show_plants: "Afișează plantele",
    show_soil: "Afișează umiditatea solului",
    show_weather: "Afișează sugestia de ploaie",
    collapsed: "Secțiuni pliate implicit",
    zoom: "Buton de detalii",
    zoom_helper: "Comută mini cardul la conținutul cardului complet",
    language: "Limbă",
    lang_auto: "Automat",
  },
  da: {
    garden: "Have",
    zones: "Vandingszoner",
    plants: "Planter",
    soil: "Jordfugtighed",
    watering: "Vander",
    idle: "Inaktiv",
    unavailable: "Utilgængelig",
    left: "{time} tilbage",
    runs_until_stopped: "Kører til stop",
    next: "Næste {when}",
    next_watering: "Næste vanding {when}",
    today: "i dag {time}",
    tomorrow: "i morgen {time}",
    start: "Start",
    stop: "Stop",
    cancel: "Annuller",
    water_zone: "Vand {name}",
    duration: "Varighed",
    less: "Mindre",
    more: "Mere",
    skip_title: "Ingen vanding nødvendig",
    raining: "Det regner nu",
    rain_expected: "{amount} regn ventet de næste {hours} t",
    rain_chance: "{prob} % risiko for regn",
    dry: "Ingen regn ventet de næste {hours} t",
    plants_ok: "Alle planter har det godt",
    plants_attention: "{n} planter kræver opmærksomhed",
    plant_attention: "1 plante kræver opmærksomhed",
    needs_water: "Mangler vand",
    too_wet: "For vådt",
    low: "Lav",
    high: "Høj",
    ok: "OK",
    low_battery: "Lavt batteri",
    moisture: "Fugtighed",
    conductivity: "Frugtbarhed",
    illuminance: "Lys",
    temperature: "Temperatur",
    battery: "Batteri",
    zones_count: "{n} zoner",
    zone_count: "1 zone",
    plants_count: "{n} planter",
    plant_count: "1 plante",
    no_data: "Intet at vise: ingen vandingszone, plante eller jordfugtighedssensor fundet.",
    no_registry: "Dette kort kræver Home Assistant 2024.8 eller nyere.",
    zoom_in: "Vis detaljer",
    zoom_out: "Vis mindre",
    title: "Titel (valgfri)",
    weather: "Vejrentitet (regnudsigt)",
    rain_sensor: "Sensor for forventet regn (valgfri)",
    next_run: "Entitet for næste vanding (valgfri)",
    rain_threshold: "Regn der gør vanding unødvendig",
    rain_probability: "Regnsandsynlighed der gør vanding unødvendig (%)",
    rain_window: "Udsigtsvindue (timer)",
    default_duration: "Standard vandingsvarighed (minutter)",
    zone_entities: "Vandingszoner (ventiler, kontakter; tom: automatisk)",
    plant_entities: "Planter (tom: automatisk)",
    plant_devices: "Plantesensorenheder (Mi Flora…)",
    moisture_sensors: "Jordfugtighedssensorer (tom: automatisk)",
    show_title: "Vis titel",
    show_subtitle: "Vis undertitel",
    show_zones: "Vis vandingszoner",
    show_plants: "Vis planter",
    show_soil: "Vis jordfugtighed",
    show_weather: "Vis regnforslaget",
    collapsed: "Sektioner foldet sammen som standard",
    zoom: "Detaljeknap",
    zoom_helper: "Skifter minikortet til det fulde korts indhold",
    language: "Sprog",
    lang_auto: "Automatisk",
  },
  sv: {
    garden: "Trädgård",
    zones: "Bevattningszoner",
    plants: "Växter",
    soil: "Markfuktighet",
    watering: "Bevattnar",
    idle: "Inaktiv",
    unavailable: "Otillgänglig",
    left: "{time} kvar",
    runs_until_stopped: "Körs tills stopp",
    next: "Nästa {when}",
    next_watering: "Nästa bevattning {when}",
    today: "i dag {time}",
    tomorrow: "i morgon {time}",
    start: "Starta",
    stop: "Stoppa",
    cancel: "Avbryt",
    water_zone: "Vattna {name}",
    duration: "Varaktighet",
    less: "Mindre",
    more: "Mer",
    skip_title: "Ingen bevattning behövs",
    raining: "Det regnar nu",
    rain_expected: "{amount} regn väntas de närmaste {hours} h",
    rain_chance: "{prob} % risk för regn",
    dry: "Inget regn väntas de närmaste {hours} h",
    plants_ok: "Alla växter mår bra",
    plants_attention: "{n} växter behöver uppmärksamhet",
    plant_attention: "1 växt behöver uppmärksamhet",
    needs_water: "Behöver vatten",
    too_wet: "För blött",
    low: "Låg",
    high: "Hög",
    ok: "OK",
    low_battery: "Låg batterinivå",
    moisture: "Fuktighet",
    conductivity: "Bördighet",
    illuminance: "Ljus",
    temperature: "Temperatur",
    battery: "Batteri",
    zones_count: "{n} zoner",
    zone_count: "1 zon",
    plants_count: "{n} växter",
    plant_count: "1 växt",
    no_data: "Inget att visa: ingen bevattningszon, växt eller markfuktighetssensor hittades.",
    no_registry: "Det här kortet kräver Home Assistant 2024.8 eller senare.",
    zoom_in: "Visa detaljer",
    zoom_out: "Visa mindre",
    title: "Titel (valfri)",
    weather: "Väderentitet (regnprognos)",
    rain_sensor: "Sensor för väntat regn (valfri)",
    next_run: "Entitet för nästa bevattning (valfri)",
    rain_threshold: "Regn som gör bevattning onödig",
    rain_probability: "Regnsannolikhet som gör bevattning onödig (%)",
    rain_window: "Prognosfönster (timmar)",
    default_duration: "Standardtid för bevattning (minuter)",
    zone_entities: "Bevattningszoner (ventiler, brytare; tomt: automatiskt)",
    plant_entities: "Växter (tomt: automatiskt)",
    plant_devices: "Växtsensorenheter (Mi Flora…)",
    moisture_sensors: "Markfuktighetssensorer (tomt: automatiskt)",
    show_title: "Visa titel",
    show_subtitle: "Visa undertitel",
    show_zones: "Visa bevattningszoner",
    show_plants: "Visa växter",
    show_soil: "Visa markfuktighet",
    show_weather: "Visa regnförslaget",
    collapsed: "Sektioner hopfällda som standard",
    zoom: "Detaljknapp",
    zoom_helper: "Växlar minikortet till hela kortets innehåll",
    language: "Språk",
    lang_auto: "Automatiskt",
  },
  bg: {
    garden: "Градина",
    zones: "Зони за поливане",
    plants: "Растения",
    soil: "Влажност на почвата",
    watering: "Поливане",
    idle: "Неактивно",
    unavailable: "Недостъпно",
    left: "Остават {time}",
    runs_until_stopped: "До спиране",
    next: "Следващо {when}",
    next_watering: "Следващо поливане {when}",
    today: "днес {time}",
    tomorrow: "утре {time}",
    start: "Старт",
    stop: "Стоп",
    cancel: "Отказ",
    water_zone: "Поливане: {name}",
    duration: "Продължителност",
    less: "По-малко",
    more: "Повече",
    skip_title: "Не е нужно поливане",
    raining: "В момента вали",
    rain_expected: "Очакват се {amount} дъжд през следващите {hours} ч",
    rain_chance: "{prob} % вероятност за дъжд",
    dry: "Не се очаква дъжд през следващите {hours} ч",
    plants_ok: "Всички растения са добре",
    plants_attention: "{n} растения се нуждаят от внимание",
    plant_attention: "1 растение се нуждае от внимание",
    needs_water: "Нуждае се от вода",
    too_wet: "Твърде влажно",
    low: "Ниско",
    high: "Високо",
    ok: "OK",
    low_battery: "Слаба батерия",
    moisture: "Влажност",
    conductivity: "Плодородие",
    illuminance: "Светлина",
    temperature: "Температура",
    battery: "Батерия",
    zones_count: "{n} зони",
    zone_count: "1 зона",
    plants_count: "{n} растения",
    plant_count: "1 растение",
    no_data: "Няма какво да се покаже: не е намерена зона за поливане, растение или сензор за влажност на почвата.",
    no_registry: "Тази карта изисква Home Assistant 2024.8 или по-нов.",
    zoom_in: "Покажи подробности",
    zoom_out: "Покажи по-малко",
    title: "Заглавие (по избор)",
    weather: "Метео обект (прогноза за дъжд)",
    rain_sensor: "Сензор за очакван дъжд (по избор)",
    next_run: "Обект за следващо поливане (по избор)",
    rain_threshold: "Дъжд, при който поливането е излишно",
    rain_probability: "Вероятност за дъжд, при която поливането е излишно (%)",
    rain_window: "Прозорец на прогнозата (часове)",
    default_duration: "Продължителност на поливане по подразбиране (минути)",
    zone_entities: "Зони за поливане (вентили, ключове; празно: автоматично)",
    plant_entities: "Растения (празно: автоматично)",
    plant_devices: "Устройства сензори за растения (Mi Flora…)",
    moisture_sensors: "Сензори за влажност на почвата (празно: автоматично)",
    show_title: "Покажи заглавие",
    show_subtitle: "Покажи подзаглавие",
    show_zones: "Покажи зоните за поливане",
    show_plants: "Покажи растенията",
    show_soil: "Покажи влажността на почвата",
    show_weather: "Покажи предложението при дъжд",
    collapsed: "Сгънати по подразбиране раздели",
    zoom: "Бутон за подробности",
    zoom_helper: "Превключва мини картата към съдържанието на пълната карта",
    language: "Език",
    lang_auto: "Автоматично",
  },
  ru: {
    garden: "Сад",
    zones: "Зоны полива",
    plants: "Растения",
    soil: "Влажность почвы",
    watering: "Полив",
    idle: "Неактивно",
    unavailable: "Недоступно",
    left: "Осталось {time}",
    runs_until_stopped: "До остановки",
    next: "Следующий {when}",
    next_watering: "Следующий полив {when}",
    today: "сегодня {time}",
    tomorrow: "завтра {time}",
    start: "Запустить",
    stop: "Остановить",
    cancel: "Отмена",
    water_zone: "Полить: {name}",
    duration: "Длительность",
    less: "Меньше",
    more: "Больше",
    skip_title: "Полив не нужен",
    raining: "Сейчас идёт дождь",
    rain_expected: "Ожидается {amount} осадков за {hours} ч",
    rain_chance: "Вероятность дождя {prob} %",
    dry: "Дождя не ожидается в ближайшие {hours} ч",
    plants_ok: "Все растения в порядке",
    plants_attention: "Растений, требующих внимания: {n}",
    plant_attention: "1 растение требует внимания",
    needs_water: "Нужен полив",
    too_wet: "Слишком влажно",
    low: "Низко",
    high: "Высоко",
    ok: "OK",
    low_battery: "Батарея разряжена",
    moisture: "Влажность",
    conductivity: "Плодородие",
    illuminance: "Свет",
    temperature: "Температура",
    battery: "Батарея",
    zones_count: "Зон: {n}",
    zone_count: "1 зона",
    plants_count: "Растений: {n}",
    plant_count: "1 растение",
    no_data: "Нечего показать: не найдены зоны полива, растения или датчики влажности почвы.",
    no_registry: "Для этой карточки нужен Home Assistant 2024.8 или новее.",
    zoom_in: "Показать подробности",
    zoom_out: "Свернуть",
    title: "Заголовок (необязательно)",
    weather: "Объект погоды (прогноз дождя)",
    rain_sensor: "Датчик ожидаемых осадков (необязательно)",
    next_run: "Объект следующего полива (необязательно)",
    rain_threshold: "Осадки, при которых полив не нужен",
    rain_probability: "Вероятность дождя, при которой полив не нужен (%)",
    rain_window: "Окно прогноза (часы)",
    default_duration: "Длительность полива по умолчанию (минуты)",
    zone_entities: "Зоны полива (клапаны, выключатели; пусто: автоматически)",
    plant_entities: "Растения (пусто: автоматически)",
    plant_devices: "Устройства датчиков растений (Mi Flora…)",
    moisture_sensors: "Датчики влажности почвы (пусто: автоматически)",
    show_title: "Показывать заголовок",
    show_subtitle: "Показывать подзаголовок",
    show_zones: "Показывать зоны полива",
    show_plants: "Показывать растения",
    show_soil: "Показывать влажность почвы",
    show_weather: "Показывать подсказку о дожде",
    collapsed: "Свёрнутые по умолчанию разделы",
    zoom: "Кнопка подробностей",
    zoom_helper: "Переключает мини-карточку на содержимое полной карточки",
    language: "Язык",
    lang_auto: "Автоматически",
  },
  uk: {
    garden: "Сад",
    zones: "Зони поливу",
    plants: "Рослини",
    soil: "Вологість ґрунту",
    watering: "Полив",
    idle: "Неактивно",
    unavailable: "Недоступно",
    left: "Залишилось {time}",
    runs_until_stopped: "До зупинки",
    next: "Наступний {when}",
    next_watering: "Наступний полив {when}",
    today: "сьогодні {time}",
    tomorrow: "завтра {time}",
    start: "Запустити",
    stop: "Зупинити",
    cancel: "Скасувати",
    water_zone: "Полити: {name}",
    duration: "Тривалість",
    less: "Менше",
    more: "Більше",
    skip_title: "Полив не потрібен",
    raining: "Зараз іде дощ",
    rain_expected: "Очікується {amount} опадів за {hours} год",
    rain_chance: "Імовірність дощу {prob} %",
    dry: "Дощу не очікується найближчі {hours} год",
    plants_ok: "Усі рослини в порядку",
    plants_attention: "Рослин, що потребують уваги: {n}",
    plant_attention: "1 рослина потребує уваги",
    needs_water: "Потрібен полив",
    too_wet: "Надто волого",
    low: "Низько",
    high: "Високо",
    ok: "OK",
    low_battery: "Низький заряд батареї",
    moisture: "Вологість",
    conductivity: "Родючість",
    illuminance: "Світло",
    temperature: "Температура",
    battery: "Батарея",
    zones_count: "Зон: {n}",
    zone_count: "1 зона",
    plants_count: "Рослин: {n}",
    plant_count: "1 рослина",
    no_data: "Нічого показати: не знайдено зон поливу, рослин чи датчиків вологості ґрунту.",
    no_registry: "Для цієї картки потрібен Home Assistant 2024.8 або новіший.",
    zoom_in: "Показати подробиці",
    zoom_out: "Згорнути",
    title: "Заголовок (необов'язково)",
    weather: "Об'єкт погоди (прогноз дощу)",
    rain_sensor: "Датчик очікуваних опадів (необов'язково)",
    next_run: "Об'єкт наступного поливу (необов'язково)",
    rain_threshold: "Опади, за яких полив не потрібен",
    rain_probability: "Імовірність дощу, за якої полив не потрібен (%)",
    rain_window: "Вікно прогнозу (години)",
    default_duration: "Тривалість поливу за замовчуванням (хвилини)",
    zone_entities: "Зони поливу (клапани, вимикачі; порожньо: автоматично)",
    plant_entities: "Рослини (порожньо: автоматично)",
    plant_devices: "Пристрої датчиків рослин (Mi Flora…)",
    moisture_sensors: "Датчики вологості ґрунту (порожньо: автоматично)",
    show_title: "Показувати заголовок",
    show_subtitle: "Показувати підзаголовок",
    show_zones: "Показувати зони поливу",
    show_plants: "Показувати рослини",
    show_soil: "Показувати вологість ґрунту",
    show_weather: "Показувати підказку про дощ",
    collapsed: "Згорнуті за замовчуванням розділи",
    zoom: "Кнопка подробиць",
    zoom_helper: "Перемикає міні-картку на вміст повної картки",
    language: "Мова",
    lang_auto: "Автоматично",
  },
  hu: {
    garden: "Kert",
    zones: "Öntözési zónák",
    plants: "Növények",
    soil: "Talajnedvesség",
    watering: "Öntözés",
    idle: "Tétlen",
    unavailable: "Nem elérhető",
    left: "Még {time}",
    runs_until_stopped: "Leállításig fut",
    next: "Következő: {when}",
    next_watering: "Következő öntözés: {when}",
    today: "ma {time}",
    tomorrow: "holnap {time}",
    start: "Indítás",
    stop: "Leállítás",
    cancel: "Mégse",
    water_zone: "{name} öntözése",
    duration: "Időtartam",
    less: "Kevesebb",
    more: "Több",
    skip_title: "Nincs szükség öntözésre",
    raining: "Most esik az eső",
    rain_expected: "{amount} eső várható a következő {hours} órában",
    rain_chance: "{prob} % esőesély",
    dry: "Nem várható eső a következő {hours} órában",
    plants_ok: "Minden növény rendben van",
    plants_attention: "{n} növény igényel figyelmet",
    plant_attention: "1 növény igényel figyelmet",
    needs_water: "Vízre van szüksége",
    too_wet: "Túl nedves",
    low: "Alacsony",
    high: "Magas",
    ok: "OK",
    low_battery: "Gyenge akkumulátor",
    moisture: "Nedvesség",
    conductivity: "Termékenység",
    illuminance: "Fény",
    temperature: "Hőmérséklet",
    battery: "Akkumulátor",
    zones_count: "{n} zóna",
    zone_count: "1 zóna",
    plants_count: "{n} növény",
    plant_count: "1 növény",
    no_data: "Nincs mit megjeleníteni: nem található öntözési zóna, növény vagy talajnedvesség-érzékelő.",
    no_registry: "Ehhez a kártyához Home Assistant 2024.8 vagy újabb szükséges.",
    zoom_in: "Részletek",
    zoom_out: "Kevesebb",
    title: "Cím (nem kötelező)",
    weather: "Időjárás-entitás (eső előrejelzés)",
    rain_sensor: "Várható eső érzékelő (nem kötelező)",
    next_run: "Következő öntözés entitás (nem kötelező)",
    rain_threshold: "Eső, amely mellett az öntözés felesleges",
    rain_probability: "Esővalószínűség, amely mellett az öntözés felesleges (%)",
    rain_window: "Előrejelzési ablak (óra)",
    default_duration: "Alapértelmezett öntözési idő (perc)",
    zone_entities: "Öntözési zónák (szelepek, kapcsolók; üres: automatikus)",
    plant_entities: "Növények (üres: automatikus)",
    plant_devices: "Növényérzékelő eszközök (Mi Flora…)",
    moisture_sensors: "Talajnedvesség-érzékelők (üres: automatikus)",
    show_title: "Cím megjelenítése",
    show_subtitle: "Alcím megjelenítése",
    show_zones: "Öntözési zónák megjelenítése",
    show_plants: "Növények megjelenítése",
    show_soil: "Talajnedvesség megjelenítése",
    show_weather: "Esőjavaslat megjelenítése",
    collapsed: "Alapértelmezetten összecsukott szakaszok",
    zoom: "Részletek gomb",
    zoom_helper: "A minikártyát a teljes kártya tartalmára váltja",
    language: "Nyelv",
    lang_auto: "Automatikus",
  },
  sk: {
    garden: "Záhrada",
    zones: "Zóny zavlažovania",
    plants: "Rastliny",
    soil: "Vlhkosť pôdy",
    watering: "Zavlažovanie",
    idle: "Nečinné",
    unavailable: "Nedostupné",
    left: "Zostáva {time}",
    runs_until_stopped: "Do zastavenia",
    next: "Ďalšie {when}",
    next_watering: "Ďalšie zavlažovanie {when}",
    today: "dnes {time}",
    tomorrow: "zajtra {time}",
    start: "Spustiť",
    stop: "Zastaviť",
    cancel: "Zrušiť",
    water_zone: "Zavlažiť: {name}",
    duration: "Trvanie",
    less: "Menej",
    more: "Viac",
    skip_title: "Zavlažovanie nie je potrebné",
    raining: "Práve prší",
    rain_expected: "Očakáva sa {amount} zrážok za {hours} h",
    rain_chance: "Pravdepodobnosť dažďa {prob} %",
    dry: "Bez dažďa počas nasledujúcich {hours} h",
    plants_ok: "Všetky rastliny sú v poriadku",
    plants_attention: "Rastliny vyžadujúce pozornosť: {n}",
    plant_attention: "1 rastlina vyžaduje pozornosť",
    needs_water: "Potrebuje vodu",
    too_wet: "Príliš mokré",
    low: "Nízka",
    high: "Vysoká",
    ok: "OK",
    low_battery: "Slabá batéria",
    moisture: "Vlhkosť",
    conductivity: "Úrodnosť",
    illuminance: "Svetlo",
    temperature: "Teplota",
    battery: "Batéria",
    zones_count: "Zóny: {n}",
    zone_count: "1 zóna",
    plants_count: "Rastliny: {n}",
    plant_count: "1 rastlina",
    no_data: "Nie je čo zobraziť: nenašla sa žiadna zóna zavlažovania, rastlina ani senzor vlhkosti pôdy.",
    no_registry: "Táto karta vyžaduje Home Assistant 2024.8 alebo novší.",
    zoom_in: "Zobraziť podrobnosti",
    zoom_out: "Zobraziť menej",
    title: "Názov (voliteľné)",
    weather: "Entita počasia (predpoveď dažďa)",
    rain_sensor: "Senzor očakávaného dažďa (voliteľné)",
    next_run: "Entita ďalšieho zavlažovania (voliteľné)",
    rain_threshold: "Zrážky, pri ktorých je zavlažovanie zbytočné",
    rain_probability: "Pravdepodobnosť dažďa, pri ktorej je zavlažovanie zbytočné (%)",
    rain_window: "Okno predpovede (hodiny)",
    default_duration: "Predvolené trvanie zavlažovania (minúty)",
    zone_entities: "Zóny zavlažovania (ventily, spínače; prázdne: automaticky)",
    plant_entities: "Rastliny (prázdne: automaticky)",
    plant_devices: "Zariadenia senzorov rastlín (Mi Flora…)",
    moisture_sensors: "Senzory vlhkosti pôdy (prázdne: automaticky)",
    show_title: "Zobraziť názov",
    show_subtitle: "Zobraziť podnadpis",
    show_zones: "Zobraziť zóny zavlažovania",
    show_plants: "Zobraziť rastliny",
    show_soil: "Zobraziť vlhkosť pôdy",
    show_weather: "Zobraziť návrh pri daždi",
    collapsed: "Predvolene zbalené sekcie",
    zoom: "Tlačidlo podrobností",
    zoom_helper: "Prepne mini kartu na obsah úplnej karty",
    language: "Jazyk",
    lang_auto: "Automaticky",
  },
  cs: {
    garden: "Zahrada",
    zones: "Zóny zavlažování",
    plants: "Rostliny",
    soil: "Vlhkost půdy",
    watering: "Zavlažování",
    idle: "Nečinné",
    unavailable: "Nedostupné",
    left: "Zbývá {time}",
    runs_until_stopped: "Do zastavení",
    next: "Další {when}",
    next_watering: "Další zavlažování {when}",
    today: "dnes {time}",
    tomorrow: "zítra {time}",
    start: "Spustit",
    stop: "Zastavit",
    cancel: "Zrušit",
    water_zone: "Zavlažit: {name}",
    duration: "Doba trvání",
    less: "Méně",
    more: "Více",
    skip_title: "Zavlažování není potřeba",
    raining: "Právě prší",
    rain_expected: "Očekává se {amount} srážek za {hours} h",
    rain_chance: "Pravděpodobnost deště {prob} %",
    dry: "Bez deště v příštích {hours} h",
    plants_ok: "Všechny rostliny jsou v pořádku",
    plants_attention: "Rostliny vyžadující pozornost: {n}",
    plant_attention: "1 rostlina vyžaduje pozornost",
    needs_water: "Potřebuje vodu",
    too_wet: "Příliš mokré",
    low: "Nízká",
    high: "Vysoká",
    ok: "OK",
    low_battery: "Slabá baterie",
    moisture: "Vlhkost",
    conductivity: "Úrodnost",
    illuminance: "Světlo",
    temperature: "Teplota",
    battery: "Baterie",
    zones_count: "Zóny: {n}",
    zone_count: "1 zóna",
    plants_count: "Rostliny: {n}",
    plant_count: "1 rostlina",
    no_data: "Není co zobrazit: nebyla nalezena žádná zóna zavlažování, rostlina ani čidlo vlhkosti půdy.",
    no_registry: "Tato karta vyžaduje Home Assistant 2024.8 nebo novější.",
    zoom_in: "Zobrazit podrobnosti",
    zoom_out: "Zobrazit méně",
    title: "Název (volitelné)",
    weather: "Entita počasí (předpověď deště)",
    rain_sensor: "Senzor očekávaného deště (volitelné)",
    next_run: "Entita dalšího zavlažování (volitelné)",
    rain_threshold: "Srážky, při kterých je zavlažování zbytečné",
    rain_probability: "Pravděpodobnost deště, při které je zavlažování zbytečné (%)",
    rain_window: "Okno předpovědi (hodiny)",
    default_duration: "Výchozí doba zavlažování (minuty)",
    zone_entities: "Zóny zavlažování (ventily, spínače; prázdné: automaticky)",
    plant_entities: "Rostliny (prázdné: automaticky)",
    plant_devices: "Zařízení čidel rostlin (Mi Flora…)",
    moisture_sensors: "Čidla vlhkosti půdy (prázdné: automaticky)",
    show_title: "Zobrazit název",
    show_subtitle: "Zobrazit podtitul",
    show_zones: "Zobrazit zóny zavlažování",
    show_plants: "Zobrazit rostliny",
    show_soil: "Zobrazit vlhkost půdy",
    show_weather: "Zobrazit návrh při dešti",
    collapsed: "Ve výchozím stavu sbalené sekce",
    zoom: "Tlačítko podrobností",
    zoom_helper: "Přepne mini kartu na obsah plné karty",
    language: "Jazyk",
    lang_auto: "Automaticky",
  },
  sl: {
    garden: "Vrt",
    zones: "Območja zalivanja",
    plants: "Rastline",
    soil: "Vlažnost tal",
    watering: "Zalivanje",
    idle: "Nedejavno",
    unavailable: "Ni na voljo",
    left: "Še {time}",
    runs_until_stopped: "Do ustavitve",
    next: "Naslednje {when}",
    next_watering: "Naslednje zalivanje {when}",
    today: "danes {time}",
    tomorrow: "jutri {time}",
    start: "Zaženi",
    stop: "Ustavi",
    cancel: "Prekliči",
    water_zone: "Zalij: {name}",
    duration: "Trajanje",
    less: "Manj",
    more: "Več",
    skip_title: "Zalivanje ni potrebno",
    raining: "Trenutno dežuje",
    rain_expected: "V naslednjih {hours} h je pričakovanih {amount} padavin",
    rain_chance: "{prob} % verjetnost dežja",
    dry: "V naslednjih {hours} h ni pričakovanega dežja",
    plants_ok: "Vse rastline so v redu",
    plants_attention: "Rastline, ki potrebujejo pozornost: {n}",
    plant_attention: "1 rastlina potrebuje pozornost",
    needs_water: "Potrebuje vodo",
    too_wet: "Preveč mokro",
    low: "Nizko",
    high: "Visoko",
    ok: "OK",
    low_battery: "Prazna baterija",
    moisture: "Vlažnost",
    conductivity: "Rodovitnost",
    illuminance: "Svetloba",
    temperature: "Temperatura",
    battery: "Baterija",
    zones_count: "Območja: {n}",
    zone_count: "1 območje",
    plants_count: "Rastline: {n}",
    plant_count: "1 rastlina",
    no_data: "Ni česa prikazati: ni najdenega območja zalivanja, rastline ali senzorja vlažnosti tal.",
    no_registry: "Ta kartica potrebuje Home Assistant 2024.8 ali novejši.",
    zoom_in: "Prikaži podrobnosti",
    zoom_out: "Prikaži manj",
    title: "Naslov (neobvezno)",
    weather: "Vremenska entiteta (napoved dežja)",
    rain_sensor: "Senzor pričakovanega dežja (neobvezno)",
    next_run: "Entiteta naslednjega zalivanja (neobvezno)",
    rain_threshold: "Padavine, pri katerih zalivanje ni potrebno",
    rain_probability: "Verjetnost dežja, pri kateri zalivanje ni potrebno (%)",
    rain_window: "Okno napovedi (ure)",
    default_duration: "Privzeto trajanje zalivanja (minute)",
    zone_entities: "Območja zalivanja (ventili, stikala; prazno: samodejno)",
    plant_entities: "Rastline (prazno: samodejno)",
    plant_devices: "Naprave senzorjev rastlin (Mi Flora…)",
    moisture_sensors: "Senzorji vlažnosti tal (prazno: samodejno)",
    show_title: "Prikaži naslov",
    show_subtitle: "Prikaži podnaslov",
    show_zones: "Prikaži območja zalivanja",
    show_plants: "Prikaži rastline",
    show_soil: "Prikaži vlažnost tal",
    show_weather: "Prikaži predlog ob dežju",
    collapsed: "Privzeto strnjeni razdelki",
    zoom: "Gumb za podrobnosti",
    zoom_helper: "Preklopi mini kartico na vsebino polne kartice",
    language: "Jezik",
    lang_auto: "Samodejno",
  },
  lv: {
    garden: "Dārzs",
    zones: "Laistīšanas zonas",
    plants: "Augi",
    soil: "Augsnes mitrums",
    watering: "Laistīšana",
    idle: "Dīkstāvē",
    unavailable: "Nav pieejams",
    left: "Atlikušas {time}",
    runs_until_stopped: "Līdz apturēšanai",
    next: "Nākamā {when}",
    next_watering: "Nākamā laistīšana {when}",
    today: "šodien {time}",
    tomorrow: "rīt {time}",
    start: "Sākt",
    stop: "Apturēt",
    cancel: "Atcelt",
    water_zone: "Laistīt: {name}",
    duration: "Ilgums",
    less: "Mazāk",
    more: "Vairāk",
    skip_title: "Laistīšana nav nepieciešama",
    raining: "Pašlaik līst",
    rain_expected: "Nākamajās {hours} h gaidāms {amount} nokrišņu",
    rain_chance: "Lietus iespējamība {prob} %",
    dry: "Nākamajās {hours} h lietus nav gaidāms",
    plants_ok: "Visi augi ir kārtībā",
    plants_attention: "Augi, kam nepieciešama uzmanība: {n}",
    plant_attention: "1 augam nepieciešama uzmanība",
    needs_water: "Vajag ūdeni",
    too_wet: "Pārāk mitrs",
    low: "Zems",
    high: "Augsts",
    ok: "OK",
    low_battery: "Zems akumulatora līmenis",
    moisture: "Mitrums",
    conductivity: "Auglība",
    illuminance: "Gaisma",
    temperature: "Temperatūra",
    battery: "Akumulators",
    zones_count: "Zonas: {n}",
    zone_count: "1 zona",
    plants_count: "Augi: {n}",
    plant_count: "1 augs",
    no_data: "Nav ko rādīt: nav atrasta neviena laistīšanas zona, augs vai augsnes mitruma sensors.",
    no_registry: "Šai kartītei nepieciešams Home Assistant 2024.8 vai jaunāks.",
    zoom_in: "Rādīt detaļas",
    zoom_out: "Rādīt mazāk",
    title: "Virsraksts (neobligāts)",
    weather: "Laikapstākļu vienība (lietus prognoze)",
    rain_sensor: "Gaidāmā lietus sensors (neobligāts)",
    next_run: "Nākamās laistīšanas vienība (neobligāta)",
    rain_threshold: "Nokrišņi, pie kuriem laistīšana nav vajadzīga",
    rain_probability: "Lietus iespējamība, pie kuras laistīšana nav vajadzīga (%)",
    rain_window: "Prognozes logs (stundas)",
    default_duration: "Noklusējuma laistīšanas ilgums (minūtes)",
    zone_entities: "Laistīšanas zonas (vārsti, slēdži; tukšs: automātiski)",
    plant_entities: "Augi (tukšs: automātiski)",
    plant_devices: "Augu sensoru ierīces (Mi Flora…)",
    moisture_sensors: "Augsnes mitruma sensori (tukšs: automātiski)",
    show_title: "Rādīt virsrakstu",
    show_subtitle: "Rādīt apakšvirsrakstu",
    show_zones: "Rādīt laistīšanas zonas",
    show_plants: "Rādīt augus",
    show_soil: "Rādīt augsnes mitrumu",
    show_weather: "Rādīt ieteikumu lietus gadījumā",
    collapsed: "Pēc noklusējuma sakļautās sadaļas",
    zoom: "Detaļu poga",
    zoom_helper: "Pārslēdz mini kartīti uz pilnās kartītes saturu",
    language: "Valoda",
    lang_auto: "Automātiski",
  },
  el: {
    garden: "Κήπος",
    zones: "Ζώνες ποτίσματος",
    plants: "Φυτά",
    soil: "Υγρασία εδάφους",
    watering: "Πότισμα",
    idle: "Ανενεργό",
    unavailable: "Μη διαθέσιμο",
    left: "Απομένουν {time}",
    runs_until_stopped: "Μέχρι τη διακοπή",
    next: "Επόμενο {when}",
    next_watering: "Επόμενο πότισμα {when}",
    today: "σήμερα {time}",
    tomorrow: "αύριο {time}",
    start: "Έναρξη",
    stop: "Διακοπή",
    cancel: "Ακύρωση",
    water_zone: "Πότισμα: {name}",
    duration: "Διάρκεια",
    less: "Λιγότερο",
    more: "Περισσότερο",
    skip_title: "Δεν χρειάζεται πότισμα",
    raining: "Βρέχει τώρα",
    rain_expected: "Αναμένονται {amount} βροχής τις επόμενες {hours} ώρες",
    rain_chance: "{prob} % πιθανότητα βροχής",
    dry: "Δεν αναμένεται βροχή τις επόμενες {hours} ώρες",
    plants_ok: "Όλα τα φυτά είναι καλά",
    plants_attention: "{n} φυτά χρειάζονται προσοχή",
    plant_attention: "1 φυτό χρειάζεται προσοχή",
    needs_water: "Χρειάζεται νερό",
    too_wet: "Πολύ υγρό",
    low: "Χαμηλό",
    high: "Υψηλό",
    ok: "OK",
    low_battery: "Χαμηλή μπαταρία",
    moisture: "Υγρασία",
    conductivity: "Γονιμότητα",
    illuminance: "Φως",
    temperature: "Θερμοκρασία",
    battery: "Μπαταρία",
    zones_count: "{n} ζώνες",
    zone_count: "1 ζώνη",
    plants_count: "{n} φυτά",
    plant_count: "1 φυτό",
    no_data: "Τίποτα για εμφάνιση: δεν βρέθηκε ζώνη ποτίσματος, φυτό ή αισθητήρας υγρασίας εδάφους.",
    no_registry: "Αυτή η κάρτα απαιτεί Home Assistant 2024.8 ή νεότερο.",
    zoom_in: "Εμφάνιση λεπτομερειών",
    zoom_out: "Εμφάνιση λιγότερων",
    title: "Τίτλος (προαιρετικό)",
    weather: "Οντότητα καιρού (πρόγνωση βροχής)",
    rain_sensor: "Αισθητήρας αναμενόμενης βροχής (προαιρετικό)",
    next_run: "Οντότητα επόμενου ποτίσματος (προαιρετικό)",
    rain_threshold: "Βροχή που καθιστά το πότισμα περιττό",
    rain_probability: "Πιθανότητα βροχής που καθιστά το πότισμα περιττό (%)",
    rain_window: "Παράθυρο πρόγνωσης (ώρες)",
    default_duration: "Προεπιλεγμένη διάρκεια ποτίσματος (λεπτά)",
    zone_entities: "Ζώνες ποτίσματος (βαλβίδες, διακόπτες· κενό: αυτόματα)",
    plant_entities: "Φυτά (κενό: αυτόματα)",
    plant_devices: "Συσκευές αισθητήρων φυτών (Mi Flora…)",
    moisture_sensors: "Αισθητήρες υγρασίας εδάφους (κενό: αυτόματα)",
    show_title: "Εμφάνιση τίτλου",
    show_subtitle: "Εμφάνιση υπότιτλου",
    show_zones: "Εμφάνιση ζωνών ποτίσματος",
    show_plants: "Εμφάνιση φυτών",
    show_soil: "Εμφάνιση υγρασίας εδάφους",
    show_weather: "Εμφάνιση πρότασης για βροχή",
    collapsed: "Ενότητες συμπτυγμένες από προεπιλογή",
    zoom: "Κουμπί λεπτομερειών",
    zoom_helper: "Αλλάζει τη μίνι κάρτα στο περιεχόμενο της πλήρους κάρτας",
    language: "Γλώσσα",
    lang_auto: "Αυτόματα",
  },
};

// ---------------------------------------------------------------------------
// Drawn picture
// ---------------------------------------------------------------------------
// The garden is a drawing (lawn, pop-up sprinkler, potted plant, sky), animated by what is going on (`activity`):
// watering (the sprinkler sprays water arcs, drops fall and the grass sways), rain (a cloud rains over the garden,
// watering is not needed), thirsty (a plant lacks water: it wilts under a burning sun), none (at rest).

// Animations, shared by every picture. Pictures are <img>, so CSS animations run but no script does.
const ANIM_CSS = `
  .spray { stroke-dasharray: 3 5; animation: spray .6s linear infinite; }
  .mist { animation: mist 1.2s ease-in-out infinite; }
  .fall { animation: fall 1.1s linear infinite; }
  .wave { transform-box: fill-box; transform-origin: 50% 100%; animation: wave 1.4s ease-in-out infinite alternate; }
  .wilt { transform-box: fill-box; transform-origin: 50% 100%; animation: wilt 3s ease-in-out infinite; }
  .rays { transform-box: fill-box; transform-origin: center; animation: rays 6s linear infinite; }
  .glow { animation: glow 1.6s ease-in-out infinite; }
  .drift { animation: drift 3s ease-in-out infinite alternate; }
  .d1 { animation-delay: -.22s; } .d2 { animation-delay: -.44s; } .d3 { animation-delay: -.66s; } .d4 { animation-delay: -.88s; }
  @keyframes spray { to { stroke-dashoffset: -16; } }
  @keyframes mist { 0%, 100% { opacity: .25; } 50% { opacity: .7; } }
  @keyframes fall { from { transform: translateY(-10px); opacity: 0; } 20% { opacity: .95; } to { transform: translateY(30px); opacity: 0; } }
  @keyframes wave { from { transform: skewX(-8deg); } to { transform: skewX(8deg); } }
  @keyframes wilt { 0%, 100% { transform: rotate(0); } 50% { transform: rotate(9deg) scaleY(.94); } }
  @keyframes rays { to { transform: rotate(360deg); } }
  @keyframes glow { 0%, 100% { opacity: .35; } 50% { opacity: .9; } }
  @keyframes drift { from { transform: translateX(-5px); } to { transform: translateX(5px); } }
  @media (prefers-reduced-motion: reduce) { * { animation: none !important; } }`;

const svgDoc = (w, h, body, anim = false) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">${anim ? `<style>${ANIM_CSS}</style>` : ""}${body}</svg>`;
const svgUri = (svg) => `data:image/svg+xml,${encodeURIComponent(svg)}`;

// Lawn (width w from x, its top at y), its blades swaying in the water or the rain.
const lawn = (x, y, w, moving) => {
  let s = `<rect x="${x}" y="${y}" width="${w}" height="12" rx="4" fill="#5aa83d"/>`;
  for (let i = 0; i < w / 9; i++) {
    const bx = x + 4 + i * 9;
    s += `<path class="${moving ? `wave d${i % 4}` : ""}" d="M${bx} ${y + 2} q1.5 -6 3 -9 q0 5 2 9" fill="#79c257"/>`;
  }
  return s;
};

// Potted plant (pot centred on cx, standing on y): green and upright, or pale and wilting when thirsty.
const plantPot = (cx, y, thirsty) => {
  const leaf = thirsty ? "#a4b54a" : "#4caf50";
  const leaf2 = thirsty ? "#8a9a3c" : "#2e8b3e";
  let s = `<path d="M${cx - 15} ${y - 26} H${cx + 15} L${cx + 11} ${y} H${cx - 11} Z" fill="#c8693c"/><rect x="${cx - 17}" y="${y - 30}" width="34" height="6" rx="2" fill="#b35a30"/>`;
  s += `<g class="${thirsty ? "wilt" : ""}"><path d="M${cx} ${y - 30} V${y - 58}" stroke="${leaf2}" stroke-width="2.5" stroke-linecap="round"/>`;
  s += `<path d="M${cx} ${y - 40} q-16 -2 -18 -14 q14 -1 18 14 Z" fill="${leaf}"/><path d="M${cx} ${y - 46} q16 -2 18 -14 q-14 -1 -18 14 Z" fill="${leaf2}"/>`;
  s += `<path d="M${cx} ${y - 56} q-9 -3 -9 -12 q9 2 9 12 Z" fill="${leaf}"/><path d="M${cx} ${y - 56} q9 -3 9 -12 q-9 2 -9 12 Z" fill="${leaf2}"/></g>`;
  return s;
};

// Pop-up sprinkler (x: its centre, y: the lawn), spraying two water arcs and drops while it waters.
const sprinkler = (x, y, on) => {
  let s = `<rect x="${x - 3}" y="${y - (on ? 16 : 6)}" width="6" height="${on ? 16 : 6}" rx="1.5" fill="#6b7178"/><rect x="${x - 6}" y="${y - (on ? 21 : 10)}" width="12" height="6" rx="2" fill="#3d4248"/>`;
  if (on) {
    const top = y - 21;
    s += `<circle class="mist" cx="${x}" cy="${top - 18}" r="22" fill="#4aa3ea" opacity=".3"/>`;
    s += `<path class="spray" d="M${x} ${top} Q${x - 22} ${top - 38} ${x - 44} ${y - 2}" fill="none" stroke="#4aa3ea" stroke-width="2.6" stroke-linecap="round"/>`;
    s += `<path class="spray d2" d="M${x} ${top} Q${x + 22} ${top - 38} ${x + 44} ${y - 2}" fill="none" stroke="#4aa3ea" stroke-width="2.6" stroke-linecap="round"/>`;
    s += `<path class="spray d1" d="M${x} ${top} Q${x - 10} ${top - 30} ${x - 22} ${y - 4}" fill="none" stroke="#7cc0f2" stroke-width="2" stroke-linecap="round"/>`;
    s += `<path class="spray d3" d="M${x} ${top} Q${x + 10} ${top - 30} ${x + 22} ${y - 4}" fill="none" stroke="#7cc0f2" stroke-width="2" stroke-linecap="round"/>`;
    s += [-36, -18, 18, 36].map((dx, i) => `<circle class="fall d${i}" cx="${x + dx}" cy="${top - 14}" r="1.8" fill="#4aa3ea" opacity="0"/>`).join("");
  }
  return s;
};

const sun = (cx, cy, hot) =>
  `<g class="${hot ? "rays" : ""}">${[0, 45, 90, 135, 180, 225, 270, 315]
    .map((a) => {
      const r = (a * Math.PI) / 180;
      return `<line x1="${(cx + 13 * Math.cos(r)).toFixed(1)}" y1="${(cy + 13 * Math.sin(r)).toFixed(1)}" x2="${(cx + 18 * Math.cos(r)).toFixed(1)}" y2="${(cy + 18 * Math.sin(r)).toFixed(1)}" stroke="#f4b400" stroke-width="2.4" stroke-linecap="round"/>`;
    })
    .join("")}</g>${hot ? `<circle class="glow" cx="${cx}" cy="${cy}" r="15" fill="#ff9800" opacity=".35"/>` : ""}<circle cx="${cx}" cy="${cy}" r="9" fill="${hot ? "#ff9800" : "#f4b400"}"/>`;

const cloud = (x, y, dark) =>
  `<g class="drift"><path d="M${x} ${y} a12 12 0 0 1 12 -12 a16 16 0 0 1 30 -4 a11 11 0 0 1 16 10 a9 9 0 0 1 -2 18 H${x + 6} a9 9 0 0 1 -6 -12 Z" fill="${dark ? "#8a98a8" : "#c3ccd6"}"/></g>`;

// The garden (160 × 120) for an activity: "watering", "rain", "thirsty" or null.
const gardenSvg = (activity = null) => {
  let s = "";
  if (activity === "rain") {
    s += cloud(30, 30, true);
    s += cloud(86, 22, false);
    s += [26, 44, 62, 80, 98, 116, 134]
      .map((x, i) => `<line class="fall d${i % 5}" x1="${x}" y1="40" x2="${x - 3}" y2="50" stroke="#4aa3ea" stroke-width="2" stroke-linecap="round" opacity="0"/>`)
      .join("");
  } else s += sun(136, 22, activity === "thirsty");
  s += lawn(4, 104, 152, activity === "watering" || activity === "rain");
  s += sprinkler(52, 106, activity === "watering");
  s += plantPot(122, 106, activity === "thirsty");
  if (activity === "thirsty") s += `<path d="M104 112 l4 3 l-2 3 M128 113 l3 2" stroke="#3f6b2b" stroke-width="1.2" fill="none" opacity=".7"/>`;
  return svgUri(svgDoc(160, 120, s, !!activity));
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const esc = (v) =>
  String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

const lang = (hass, config) => {
  const l = config?.language || (hass && (hass.locale?.language || hass.language)) || "en";
  return STRINGS[l] ? l : STRINGS[l.split("-")[0]] ? l.split("-")[0] : "en";
};

// Locale for Intl: the card's language, or Home Assistant's full locale when it has the same base (pt-BR, de-CH).
// A bare "pt" (Home Assistant's code for European Portuguese) becomes "pt-PT", otherwise Intl formats it the Brazilian way.
const intlLocale = (hass, config) => {
  const l = lang(hass, config);
  const src = config?.language || (hass && (hass.locale?.language || hass.language)) || "";
  const out = src && src.split("-")[0] === l.split("-")[0] ? src : l;
  return out === "pt" ? "pt-PT" : out;
};

const t = (hass, config, key, vars = {}) =>
  String(STRINGS[lang(hass, config)][key] ?? STRINGS.en[key] ?? key).replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? "");

const valid = (s) => !!s && !["unknown", "unavailable", ""].includes(s.state);

const num = (s) => {
  if (!valid(s)) return null;
  const v = parseFloat(s.state);
  return Number.isFinite(v) ? v : null;
};

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
// Attributes of an element that opens an entity's more-info (nothing without an entity).
const moreInfo = (id) => (id ? ` role="button" tabindex="0" data-entity="${esc(id)}"` : "");
const svgIcon = (path, cls = "") => `<svg class="icon ${cls}" viewBox="0 0 24 24" aria-hidden="true"><path d="${path}"/></svg>`;
const domainOf = (id) => String(id || "").split(".")[0];
const asList = (v) => (Array.isArray(v) ? v : v ? [v] : []);

// Milliseconds in one unit of a duration entity (minutes when it has no unit).
const unitMs = (unit) => ({ s: 1e3, sec: 1e3, seconds: 1e3, min: 6e4, minutes: 6e4, h: 3.6e6, hours: 3.6e6, d: 8.64e7 })[String(unit || "min").toLowerCase()] ?? 6e4;

// "8:12", "1:05:00": a countdown, rounded up to the second.
const fmtCountdown = (ms) => {
  const s = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = String(s % 60).padStart(2, "0");
  return h ? `${h}:${String(m).padStart(2, "0")}:${ss}` : `${m}:${ss}`;
};

const NUM_FMT = {};
const fmtNum = (v, digits, locale) =>
  (NUM_FMT[`${locale}|${digits}`] ??= new Intl.NumberFormat(locale, { maximumFractionDigits: digits, minimumFractionDigits: 0 })).format(v);

// A reading as shown: whole percentages, one decimal for temperatures, no decimal for conductivity and light.
const fmtReading = (key, v, unit, locale) => {
  if (v === null || v === undefined) return "—";
  const digits = key === "temperature" ? 1 : 0;
  const u = unit ?? UNITS[key];
  return u === "%" ? `${Math.round(v)} %` : `${fmtNum(v, digits, locale)} ${u}`;
};

// A time stamp of a sensor (timestamp), an input_datetime or a calendar (next event start), in ms; null otherwise.
const parseLocal = (s) => {
  const v = Date.parse(String(s || "").replace(" ", "T"));
  return Number.isFinite(v) ? v : null;
};
const timeOf = (s) => {
  if (!valid(s)) return null;
  const d = domainOf(s.entity_id);
  if (d === "calendar") return parseLocal(s.attributes?.start_time);
  if (d === "input_datetime") return s.attributes?.timestamp ? s.attributes.timestamp * 1000 : parseLocal(s.state);
  return parseLocal(s.state);
};

const DAY_MS = 8.64e7;
const startOfDay = (ms) => {
  const d = new Date(ms);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};
// "today 18:00", "tomorrow 06:00", "Tue 06:00", "Jun 24, 06:00".
const fmtWhen = (hass, config, ms) => {
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
const SPANS = { hourly: 3.6e6, twice_daily: 4.32e7, daily: 8.64e7 };
const rainOutlook = (list, type, now, hours) => {
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
const levelOf = (v, [min, max]) => (v === null || v === undefined ? null : min !== null && min !== undefined && v < min ? "low" : max !== null && max !== undefined && v > max ? "high" : "ok");
// Moisture below its minimum is the alert of a garden card (the plant needs water); the rest is a warning.
const levelClass = (key, level) => (level === "low" && key === "moisture" ? "crit" : level === "low" || level === "high" ? "warn" : "ok");

// Position of a value on a gauge (0..1): light on a logarithmic scale, conductivity up to beyond its maximum.
const scaleOf = (key, range, v) => {
  if (key === "illuminance") return { lo: 1, hi: 5, f: (x) => Math.log10(Math.max(10, x)) };
  if (key === "temperature") return { lo: -10, hi: 45, f: (x) => x };
  if (key === "conductivity") return { lo: 0, hi: Math.max(1000, (range[1] ?? 3000) * 1.33, (v ?? 0) * 1.1), f: (x) => x };
  return { lo: 0, hi: 100, f: (x) => x };
};
const posOf = (key, range, v, x) => {
  const s = scaleOf(key, range, v);
  return clamp((s.f(x) - s.lo) / (s.hi - s.lo), 0, 1);
};

// ---------------------------------------------------------------------------
// Discovery: zones, plants, soil sensors and weather from the registries (or the configuration)
// ---------------------------------------------------------------------------

const _cache = new WeakMap();

// Registry entries by device, built once per hass.entities object.
const byDevice = (hass) => {
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

const devName = (d) => d?.name_by_user || d?.name || "";
const nameOf = (hass, id, fallback) => fallback || hass.states[id]?.attributes?.friendly_name || id;
const findDev = (hass, ref) => {
  if (!ref || !hass.devices) return null;
  return hass.devices[ref] || Object.values(hass.devices).find((d) => devName(d) === ref || d.name === ref) || null;
};
// What an entity is called, to recognise it: its id, translation key and names (registry and state), as snake_case.
const keyText = (e, hass) =>
  [e.entity_id, e.translation_key, e.original_name, e.name, hass?.states[e.entity_id]?.attributes?.friendly_name]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
const deviceClass = (hass, id) => hass.states[id]?.attributes?.device_class;

// The entity of a device whose domain and text (entity id + translation key) match.
const pick = (hass, list, domain, re, test = () => true) => list.find((e) => domainOf(e.entity_id) === domain && re.test(keyText(e, hass)) && test(e))?.entity_id;

// A zone: { entity, name, platform, device, remaining, total, next, durationEntity, watering, running, moisture, … }.
const buildZone = (hass, item, entry, siblings, single) => {
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
  if (platform === "gardena_bluetooth") zone.openFor = cfg.open_for ?? pick(hass, list, "number", /remaining_open_set/);
  if (platform === "opensprinkler" && /_station_enabled$/.test(id)) {
    zone.running = cfg.running ?? id.replace(/^switch\./, "binary_sensor.").replace(/_station_enabled$/, "_station_running");
  } else if (cfg.running) zone.running = cfg.running;
  return zone;
};

const resolveZones = (hass, config) => {
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
const deviceReadings = (hass, list) => {
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
const deviceThresholds = (hass, list) => {
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
const buildPlant = (hass, item) => {
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
const resolvePlants = (hass, config) => {
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
const resolveSoil = (hass, config, plants, zones) => {
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

const resolveWeather = (hass, config) => {
  if (config.weather === false || config.weather === "none") return null;
  if (config.weather) return config.weather;
  return Object.keys(hass.states)
    .filter((id) => domainOf(id) === "weather")
    .sort()[0];
};

// Everything the card shows, memoized per registries / config object.
const resolve = (hass, config) => {
  if (!hass.entities || !hass.devices) return null;
  const zones = resolveZones(hass, config);
  const plants = resolvePlants(hass, config);
  const soil = resolveSoil(hass, config, plants, zones);
  return { zones, plants, soil, weather: resolveWeather(hass, config) };
};

// Runs started by the card (end, total), and the length first seen for a run reported by its remaining time:
// shared by every card of the page, so the full and the mini card show the same countdown.
const RUNS = new Map();

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const BASE_STYLE = `
  :host { --gc-accent: #3f9b4f; --gc-ok: var(--success-color, #43a047); --gc-warn: var(--warning-color, #ffa600);
          --gc-crit: var(--error-color, #db4437); --gc-idle: var(--disabled-text-color, #9e9e9e); --gc-active: var(--info-color, #039be5);
          /* Text in a state color is mixed with the text color so that it reads at 4.5:1 at least. */
          --gc-accent-text: color-mix(in srgb, var(--gc-accent) 50%, var(--primary-text-color)); }
  ha-card { overflow: hidden; container-type: inline-size; }
  /* Natural width in a parent that sizes to its content (inline-block, grid "auto" column), without a minimum. */
  :host { display: block; min-width: 0; --gc-natural-width: 380px; }
  :host::before { content: ""; display: grid; grid-template-columns: minmax(0, var(--gc-natural-width)); height: 0; }
  .icon { width: 18px; height: 18px; fill: currentColor; flex: none; }
  .muted { color: var(--secondary-text-color); }
  .clickable { cursor: pointer; }
  [role="button"]:focus-visible { outline: 2px solid var(--primary-color, var(--gc-accent)); outline-offset: 2px; border-radius: 4px; }
  .ok { --c: var(--gc-ok); } .warn { --c: var(--gc-warn); } .crit { --c: var(--gc-crit); } .idle { --c: var(--gc-idle); } .active { --c: var(--gc-active); }
  .dot { width: 6px; height: 6px; border-radius: 50%; background: var(--c, var(--gc-ok)); flex: none; display: inline-block; }
  .chip { display: inline-flex; align-items: center; gap: 4px; padding: 1px 8px; border-radius: 12px; font-size: 11px; font-weight: 500; white-space: nowrap;
          background: color-mix(in srgb, var(--c, var(--gc-ok)) 15%, transparent); color: color-mix(in srgb, var(--c, var(--gc-ok)) 50%, var(--primary-text-color));
          flex: 0 1 auto; min-width: 0; max-width: 50%; overflow: hidden; box-sizing: border-box; }
  .chip-text { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .header { display: flex; align-items: center; gap: 10px; padding: 12px 12px 0; }
  /* The chip sits on the title's line, whether a subtitle follows or not. */
  .header .chip, .header .zoom { align-self: flex-start; margin-top: 10px; }
  .type-icon { position: relative; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex: none;
               --gc-tint: var(--c, var(--gc-accent)); background: color-mix(in srgb, var(--gc-tint) 16%, transparent); transition: background-color .3s ease; }
  .type-icon .icon { width: 24px; height: 24px; fill: color-mix(in srgb, var(--gc-tint) 60%, var(--primary-text-color)); transition: fill .3s ease; }
  .titles { flex: 1 1 0; min-width: 5ch; }
  :host([hide-title]) .titles > .name, :host([hide-subtitle]) .titles > .sub { display: none; }
  .name { font-size: 16px; font-weight: 500; line-height: 1.25; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .sub { font-size: 12px; color: var(--secondary-text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .warning { padding: 16px; color: color-mix(in srgb, var(--gc-warn) 50%, var(--primary-text-color)); }
  /* Buttons as on the other cards: a smoked-glass background (never a filled color), the icon in the accent color. */
  .btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; border: none; cursor: pointer; font: inherit; font-size: 13px;
         font-weight: 500; padding: 6px 12px; border-radius: 18px; background: var(--secondary-background-color, rgba(127,127,127,.12));
         color: var(--primary-text-color); min-width: 0; }
  .btn span { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .btn:not(:disabled):hover { background: color-mix(in srgb, var(--gc-accent) 12%, var(--secondary-background-color, rgba(127,127,127,.12))); }
  .btn .icon { width: 18px; height: 18px; color: var(--gc-accent); }
  .btn.primary { background: color-mix(in srgb, var(--gc-accent) 16%, transparent); color: var(--gc-accent-text); }
  .btn.primary:not(:disabled):hover { background: color-mix(in srgb, var(--gc-accent) 24%, transparent); }
  .btn.active { background: color-mix(in srgb, var(--gc-active) 16%, transparent); color: color-mix(in srgb, var(--gc-active) 50%, var(--primary-text-color)); }
  .btn.active .icon { color: var(--gc-active); }
  .btn.active:not(:disabled):hover { background: color-mix(in srgb, var(--gc-active) 24%, transparent); }
  .btn.round { width: 36px; height: 36px; padding: 0; border-radius: 50%; flex: none; }
  .btn:disabled { opacity: .45; cursor: default; }
  .btn:focus-visible { outline: 2px solid var(--primary-color, var(--gc-accent)); outline-offset: 2px; }
  .zoom { all: unset; flex: none; cursor: pointer; width: 24px; height: 24px; margin: -4px -4px -4px 0; border-radius: 50%;
          display: grid; place-items: center; color: var(--secondary-text-color); }
  .zoom .icon { width: 16px; height: 16px; }
  .zoom:hover { background: color-mix(in srgb, var(--gc-idle) 16%, transparent); color: var(--primary-text-color); }
  .zoom:focus-visible { outline: 2px solid var(--primary-color, var(--gc-accent)); outline-offset: 1px; }
  .line { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--secondary-text-color); min-width: 0; }
  .line .icon { width: 16px; height: 16px; }
  .line span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .line.warn, .line.crit, .line.active { color: color-mix(in srgb, var(--c) 50%, var(--primary-text-color)); }
  .line.warn .icon, .line.crit .icon, .line.active .icon { color: var(--c); }
  .picture { flex: none; display: flex; align-items: center; justify-content: center; }
  .picture img { max-width: 100%; max-height: 100%; object-fit: contain; }
  .info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 6px; }
  .alert-line { display: flex; align-items: center; gap: 6px; font-size: 13px; color: color-mix(in srgb, var(--c, var(--gc-active)) 50%, var(--primary-text-color)); min-width: 0; }
  .alert-line .icon { width: 16px; height: 16px; color: var(--c, var(--gc-active)); }
  .alert-line span { min-width: 0; overflow-wrap: anywhere; }
  .num { font-variant-numeric: tabular-nums; }
  /* Watering: the zone's ring counts down, water sprays from the sprinkler. */
  .zone-icon { position: relative; width: 40px; height: 40px; flex: none; display: grid; place-items: center; border-radius: 50%;
               background: color-mix(in srgb, var(--c, var(--gc-idle)) 14%, transparent); color: color-mix(in srgb, var(--c, var(--gc-idle)) 60%, var(--primary-text-color)); }
  .zone-icon > .icon { width: 22px; height: 22px; }
  .ring { position: absolute; inset: 0; width: 40px; height: 40px; transform: rotate(-90deg); }
  .ring circle { fill: none; stroke-width: 3; }
  .ring .track { stroke: color-mix(in srgb, var(--c, var(--gc-active)) 18%, transparent); }
  .ring .prog { stroke: var(--c, var(--gc-active)); stroke-linecap: round; transition: stroke-dashoffset 1s linear; }
  .spray { position: absolute; inset: 0; width: 40px; height: 40px; overflow: visible; }
  .spray .drop { fill: var(--gc-active); opacity: 0; animation: gc-spray 1.4s ease-out infinite; transform-box: fill-box; transform-origin: center; }
  .spray .drop:nth-child(2) { animation-delay: .35s; } .spray .drop:nth-child(3) { animation-delay: .7s; } .spray .drop:nth-child(4) { animation-delay: 1.05s; }
  @keyframes gc-spray { 0% { opacity: 0; transform: translate(0, 4px) scale(.6); } 25% { opacity: 1; } 100% { opacity: 0; transform: translate(var(--dx, 0), -9px) scale(1); } }
  /* A thirsty plant: its drop pulses. */
  .thirst { animation: gc-thirst 1.6s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
  @keyframes gc-thirst { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.35); opacity: .55; } }
  @media (prefers-reduced-motion: reduce) { *, *::before, *::after { transition: none !important; animation: none !important; } .spray .drop { opacity: .8; } }
  @container (max-width: 230px) {
    .chip { padding: 4px; flex: none; }
    .chip-text { display: none; }
    .header { gap: 6px; }
  }
`;

// Popup (duration to water a zone) at the top of the card, over a backdrop: it stays in view on a long card.
const DIALOG_STYLE = `
  ha-card.dialog-open { position: relative; min-height: 200px; }
  .backdrop { position: absolute; inset: 0; background: rgba(0,0,0,.45); display: flex; align-items: flex-start; justify-content: center;
              padding-top: 12px; box-sizing: border-box; z-index: 9; border-radius: inherit; }
  .modal { background: var(--card-background-color, #1c1c1c); color: var(--primary-text-color); width: min(92%, 340px); max-height: calc(100% - 24px);
           box-sizing: border-box; border-radius: 14px; padding: 16px; box-shadow: 0 8px 30px rgba(0,0,0,.4); display: flex; flex-direction: column; gap: 12px; }
  .modal .msg { font-size: 15px; font-weight: 500; line-height: 1.3; overflow-wrap: anywhere; }
  .modal-actions { display: flex; justify-content: flex-end; gap: 8px; flex-wrap: wrap; }
  .stepper { display: flex; align-items: center; justify-content: center; gap: 14px; }
  .stepper .val { font-size: 28px; font-weight: 400; min-width: 4ch; text-align: center; }
  .stepper .val small { font-size: 14px; color: var(--secondary-text-color); margin-left: 2px; }
  .presets { display: flex; flex-wrap: wrap; gap: 6px; justify-content: center; }
  .preset { font: inherit; font-size: 12px; padding: 4px 10px; border-radius: 14px; cursor: pointer; color: var(--primary-text-color);
            background: transparent; border: 1px solid color-mix(in srgb, var(--primary-text-color) 16%, transparent); }
  .preset.on { border-color: color-mix(in srgb, var(--gc-accent) 60%, transparent); color: var(--gc-accent-text); font-weight: 500;
               background: color-mix(in srgb, var(--gc-accent) 10%, transparent); }
`;

const FULL_STYLE = `
  .content { padding: 8px 12px 12px; display: flex; flex-direction: column; gap: 12px; }
  .hero { display: flex; gap: 12px; align-items: center; }
  .picture { width: 104px; height: 78px; }
  .picture img { filter: drop-shadow(0 4px 8px rgba(0,0,0,.18)); }
  .big { display: flex; align-items: center; gap: 8px; min-width: 0; }
  .big .pct { font-size: 30px; font-weight: 400; line-height: 1; white-space: nowrap; min-width: 0; overflow: hidden; text-overflow: ellipsis; }
  .big .pct small { font-size: 14px; margin-left: 4px; color: var(--secondary-text-color); }
  .big > .icon { color: var(--c, var(--gc-accent)); }
  .section-title { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 500; text-transform: uppercase;
                   letter-spacing: .04em; color: var(--secondary-text-color); margin-bottom: 6px; }
  .section-title.toggle { cursor: pointer; user-select: none; }
  .section-title .icon { width: 16px; height: 16px; }
  .section-title span { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .section-title .count { margin-left: 2px; text-transform: none; letter-spacing: 0; font-weight: 400; }
  .section-title.toggle[aria-expanded="false"] { margin-bottom: 0; }
  /* Folded: the chevron points right; unfolded: down. */
  .section-title .chevron { margin-left: auto; width: 16px; height: 16px; transition: transform .2s ease; }
  .section-title.toggle[aria-expanded="false"] .chevron { transform: rotate(-90deg); }
  .zones { display: flex; flex-direction: column; gap: 8px; }
  .zone { display: flex; align-items: center; gap: 10px; min-width: 0; }
  .zone .info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
  .zone .zname { font-size: 14px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .plants { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 210px), 1fr)); gap: 8px; }
  .plant { display: flex; flex-direction: column; gap: 6px; padding: 8px 10px; border-radius: 12px; min-width: 0;
           border: 1px solid var(--divider-color, rgba(127,127,127,.25)); }
  .plant-head { display: flex; align-items: center; gap: 8px; min-width: 0; }
  .plant-pic { width: 32px; height: 32px; border-radius: 50%; flex: none; display: grid; place-items: center; overflow: hidden;
               background: color-mix(in srgb, var(--c, var(--gc-ok)) 16%, transparent); color: color-mix(in srgb, var(--c, var(--gc-ok)) 60%, var(--primary-text-color)); position: relative; }
  .plant-pic img { width: 100%; height: 100%; object-fit: cover; }
  .plant-pic .icon { width: 20px; height: 20px; }
  .plant-pic .badge { position: absolute; right: -1px; bottom: -1px; width: 14px; height: 14px; color: var(--gc-crit); }
  .plant-name { flex: 1; min-width: 0; font-size: 14px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .plant-name { min-width: 6ch; }
  .plant-head .chip { max-width: 50%; }
  .gauges { display: flex; flex-direction: column; gap: 4px; }
  .gauge { display: grid; grid-template-columns: 16px minmax(0, 1fr) minmax(48px, 1.2fr) auto; align-items: center; gap: 6px; font-size: 12px; min-width: 0; }
  .gauge > .icon { width: 16px; height: 16px; color: var(--secondary-text-color); }
  .gauge .lbl { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--secondary-text-color); }
  .gauge .v { text-align: right; font-weight: 500; white-space: nowrap; min-width: 4ch; }
  .gauge.warn .v, .gauge.crit .v { color: color-mix(in srgb, var(--c) 50%, var(--primary-text-color)); }
  .gauge.warn > .icon, .gauge.crit > .icon { color: var(--c); }
  .track { position: relative; height: 6px; border-radius: 3px; background: var(--divider-color, rgba(127,127,127,.25)); }
  .track .band { position: absolute; top: 0; bottom: 0; border-radius: 3px; background: color-mix(in srgb, var(--gc-ok) 40%, transparent); }
  .track .mark { position: absolute; top: 50%; width: 10px; height: 10px; margin: -5px 0 0 -5px; border-radius: 50%; background: var(--c, var(--gc-ok));
                 box-shadow: 0 0 0 2px var(--card-background-color, #fff); box-sizing: border-box; }
  .soil { display: flex; flex-direction: column; gap: 4px; }
  /* Narrow card: the gauge labels give way to the bars (the icon says which reading), the zone button keeps its icon. */
  @container (max-width: 300px) {
    .picture { width: 80px; height: 60px; }
    .hero { gap: 10px; }
    .gauge { grid-template-columns: 16px minmax(40px, 1fr) auto; }
    .gauge .lbl { display: none; }
    .zone .btn:not(.round) span { display: none; }
    .zone .btn:not(.round) { width: 34px; height: 34px; padding: 0; border-radius: 50%; flex: none; }
  }
  @container (max-width: 200px) {
    .picture { width: 56px; height: 42px; }
    .big .pct { font-size: 24px; }
    .zone { gap: 6px; }
    .zone-icon, .ring, .spray { width: 32px; height: 32px; }
  }
`;

const MINI_STYLE = `
  /* Natural width in a parent that sizes to its content (see :host::before in BASE_STYLE). */
  :host { --gc-natural-width: 300px; }
  .content { padding: 8px 12px 12px; display: flex; flex-direction: row; align-items: center; gap: 12px; }
  .picture { width: 72px; height: 54px; }
  .picture img { filter: drop-shadow(0 2px 4px rgba(0,0,0,.18)); }
  .info { gap: 4px; }
  .line .icon { width: 14px; height: 14px; }
  .controls { display: flex; gap: 6px; flex: none; }
  /* Narrow mini card (6 of 12 columns, 156-250 px): the Stop button moves under the lines, then the picture gives way. */
  @container (max-width: 300px) {
    .content { flex-wrap: wrap; row-gap: 8px; }
    .controls { flex-basis: 100%; justify-content: flex-end; }
  }
  @container (max-width: 200px) {
    .picture { display: none; }
  }
`;

// Element names of Home Assistant dialogs (a more-info opened from the card): a click there is not "elsewhere".
const DIALOG_TAGS = new Set(["HA-MORE-INFO-DIALOG", "HA-DIALOG", "DIALOG"]);
const isOutside = (card, ev) => {
  const path = ev.composedPath();
  return !path.includes(card) && !path.some((n) => DIALOG_TAGS.has(n.tagName));
};

// "A click elsewhere" is caught on the pointer, not only on the click event: on iOS (Safari and the companion app) a
// tap on something that is not clickable (the background, an empty spot, a card with no action) sends no click to the
// page. It counts when the press and the release are both outside the card (a slider dragged out of the card does not
// fold it), and a scroll does not count (the browser cancels the pointer). Keyboard clicks still go through the click
// event. `tap(ev)` (a press and a release at the same spot) is for the tests.
const watchOutside = (isOut, handler) => {
  let downOutside = false;
  const onDown = (ev) => {
    downOutside = isOut(ev);
  };
  const onUp = (ev) => {
    if (downOutside && isOut(ev)) handler(ev);
    downOutside = false;
  };
  const onClick = (ev) => {
    if (ev.detail === 0 && isOut(ev)) handler(ev);
  };
  return {
    on() {
      document.addEventListener("pointerdown", onDown, true);
      document.addEventListener("pointerup", onUp, true);
      document.addEventListener("click", onClick, true);
    },
    tap(ev) {
      onDown(ev);
      onUp(ev);
    },
    off() {
      document.removeEventListener("pointerdown", onDown, true);
      document.removeEventListener("pointerup", onUp, true);
      document.removeEventListener("click", onClick, true);
    },
  };
};
// After the popup closes, clicks on the card are ignored this long (the second click of a double click on Start).
const CONFIRM_GUARD_MS = 400;
// Elements a click acts on, and how one is told from the others across renders (focus kept for keyboard users).
const FOCUS_SELECTOR = "[data-action], [data-entity]";
const focusKey = (el) => {
  const data = Object.entries({ ...el.dataset });
  return data.length ? `${el.tagName}|${JSON.stringify(data)}` : "";
};
const RING_C = 2 * Math.PI * 17;

// ---------------------------------------------------------------------------
// Cards
// ---------------------------------------------------------------------------

class GardenCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._html = "";
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
    const m = this._resolve();
    if (!m) return null;
    const ids = this._entityIds(m);
    return [h.entities, h.devices, h.language, h.locale, h.themes?.darkMode, this._forecast, Math.floor(Date.now() / 6e4), ...ids.map((id) => h.states[id])];
  }

  // The model is rebuilt when the registries or the set of entities change (a new entity, a device renamed).
  _resolve() {
    const h = this._hass;
    const key = [h.entities, h.devices, Object.keys(h.states).length];
    if (this._model && this._modelKey?.every((k, i) => k === key[i])) return this._model;
    this._modelKey = key;
    this._model = resolve(h, this._config);
    return this._model;
  }

  _entityIds(m) {
    const z = m.zones.flatMap((z) => [z.entity, z.remaining, z.total, z.next, z.durationEntity, z.watering, z.running, z.moisture]);
    const p = m.plants.flatMap((p) => [p.entity, ...Object.values(p.sensors)]);
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
    this._update();
  }

  disconnectedCallback() {
    clearInterval(this._tick);
    clearInterval(this._countdown);
    this._tick = this._countdown = null;
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
    return !!(z.script || PLATFORMS[z.platform]?.start?.(z, 1) || z.durationEntity);
  }

  // The longest run the zone takes, in minutes: its integration's limit, else its duration number's maximum.
  _maxMinutes(z) {
    if (z.script) return 1440;
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
    const m = this._resolve();
    if (m) this._subscribeForecast(this._config.show_weather === false ? null : m.weather);
    let html = this._render();
    if (this._dialog) {
      html = html.replace(/<ha-card>([\s\S]*)<\/ha-card>\s*$/, (_, inner) => `<ha-card class="dialog-open">${inner}${this._dialogHtml()}</ha-card>`);
    }
    if (html !== this._html) {
      const focused = this._dialog && this.shadowRoot.activeElement?.dataset?.action;
      const kept = this._dialog ? null : this._focusedSpot();
      this._html = html;
      this.shadowRoot.innerHTML = html;
      if (kept) this._restoreFocus(kept);
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

  _header(sum, sub) {
    const c = this._config;
    const st = sum.status;
    const icon = sum.running.length ? "active" : st?.cls === "crit" ? "crit" : st?.cls === "warn" ? "warn" : "ok";
    return `
      <div class="header">
        <div class="type-icon ${icon}">${svgIcon(sum.running.length ? ICONS.sprinkler : ICONS.flower)}</div>
        <div class="titles">
          <div class="name">${esc(c.title || this._t("garden"))}</div>
          ${sub ? `<div class="sub">${esc(sub)}</div>` : ""}
        </div>
        ${
          st
            ? `<span class="chip ${st.cls}${st.entity ? " clickable" : ""}"${moreInfo(st.entity)} title="${esc(st.text)}" aria-label="${esc(
                st.text,
              )}"><span class="dot"></span><span class="chip-text">${esc(st.text)}</span></span>`
            : ""
        }
        ${this._zoomButton()}
      </div>`;
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

  _picture(sum) {
    const act = this._activity(sum);
    const thirsty = sum.plants.find((x) => x.s.thirsty)?.p;
    const target = act === "watering" ? sum.running[0].entity : act === "rain" ? sum.rain.entity : act === "thirsty" ? thirsty.entity || thirsty.sensors.moisture : sum.rain?.entity;
    return `<div class="picture${target ? " clickable" : ""}"${moreInfo(target)} aria-label="${esc(this._config.title || this._t("garden"))}"><img src="${gardenSvg(act)}" alt=""></div>`;
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
    return `<div class="hero">${this._picture(sum)}<div class="info">${this._big(m, sum)}${this._lines(m, sum)}</div></div>`;
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
        <div class="plant-name">${esc(p.name)}</div>
        <span class="chip ${st.cls}" title="${esc(st.text)}"><span class="dot"></span><span class="chip-text">${esc(st.text)}</span></span>
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
    return `<style>${BASE_STYLE}${FULL_STYLE}</style>
      <ha-card>
        ${this._header(sum, this._subtitle(m, sum))}
        ${body ? `<div class="content">${body}</div>` : '<div style="height:12px"></div>'}
      </ha-card>`;
  }
}

// The mini card is the full card drawn compact: its detail button (top right, `zoom: false` removes it) switches it
// to the full card's content and back, and a click anywhere else on the page brings the compact view back.
class GardenMiniCard extends GardenCard {
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
    return `<style>${BASE_STYLE}${FULL_STYLE}${MINI_STYLE}</style>
      <ha-card>
        ${this._header(sum, "")}
        <div class="content">
          ${this._picture(sum)}
          <div class="info">${zoneLine}${this._lines(m, sum, true)}</div>
          ${z ? `<div class="controls">${this._zoneButton(z, tm, true)}</div>` : ""}
        </div>
      </ha-card>`;
  }
}

// ---------------------------------------------------------------------------
// Visual editors (ha-form)
// ---------------------------------------------------------------------------

const LANGUAGES = [
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
const toForm = (config) => {
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
const fromForm = (value, previous) => {
  const config = { ...value };
  const keep = (list, id, key) => asList(list).find((x) => x && typeof x === "object" && x[key] === id) || id;
  const zones = asList(value.zone_entities).map((id) => keep(previous.zones, id, "entity"));
  const plants = [...asList(value.plant_entities).map((id) => keep(previous.plants, id, "entity")), ...asList(value.plant_devices).map((d) => keep(previous.plants, d, "device"))];
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

class GardenEditorBase extends HTMLElement {
  static get toggles() {
    return [];
  }

  static get full() {
    return true;
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
    const full = this.constructor.full;
    return [
      { name: "title", selector: { text: {} } },
      { name: "zone_entities", selector: { entity: { multiple: true, domain: ["valve", "switch"] } } },
      { name: "plant_entities", selector: { entity: { multiple: true, domain: "plant" } } },
      { name: "plant_devices", selector: { device: { multiple: true, entity: { domain: "sensor", device_class: "moisture" } } } },
      ...(full ? [{ name: "moisture_sensors", selector: { entity: { multiple: true, domain: "sensor", device_class: "moisture" } } }] : []),
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
      ...(full
        ? [
            {
              name: "collapsed",
              selector: { select: { multiple: true, mode: "list", options: ["zones", "plants", "soil"].map((value) => ({ value, label: tr(value) })) } },
            },
          ]
        : []),
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
        const defaults = { ...Object.fromEntries(toggles), rain_threshold: 2, rain_probability: 70, rain_window: 24, collapsed: DEFAULT_COLLAPSED };
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
    const data = { rain_threshold: 2, rain_probability: 70, rain_window: 24, ...toForm(this._config) };
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

class GardenCardEditor extends GardenEditorBase {
  static get toggles() {
    return [
      ["show_title", true],
      ["show_subtitle", true],
      ["show_weather", true],
      ["show_zones", true],
      ["show_plants", true],
      ["show_soil", true],
    ];
  }
}

class GardenMiniCardEditor extends GardenEditorBase {
  static get full() {
    return false;
  }

  static get toggles() {
    return [
      ["show_title", true],
      ["show_weather", true],
      ["zoom", true],
    ];
  }
}

// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------

const define = (name, cls) => {
  if (!customElements.get(name)) customElements.define(name, cls);
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
