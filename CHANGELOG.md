# Changelog

## 1.2.5 - 2026-11-27

### Fixes
- Idle states use the theme's secondary text colour (`--secondary-text-color`), like every ha-* card.

## 1.2.4 - 2026-11-24

### Maintenance
- The card source is split into ES modules: `src/` (entry `src/index.js`), cut at its sections, with the translations in one file per language (`i18n/<lang>.js`). `scripts/bundle.mjs` concatenates them back, in their original order, into the same single file and per-language files as before; the tests evaluate that bundle.

## 1.2.3 - 2026-11-22

### Performance
- Card picker: the previews are back (`preview: true`), and light. Each card's preview is drawn only once it scrolls into view of Home Assistant's card picker, which otherwise builds the preview of every card at once: until then it holds Home Assistant's state (no render, no history request, no animation). On a dashboard or in the card editor the card is drawn as before.

## 1.2.2 - 2026-11-22

### Performance
- Card picker: the cards no longer ask Home Assistant for a live preview (`preview: false` in `window.customCards`). The picker drew every card at once (history requests, animations), which made the list slow to open; it now shows each card's description instead.

## 1.2.1 - 2026-11-20

### Fixes
- Status pill: it now sits at the right end of the title's row (aligned with the title, as the ha-* charter asks) instead of right after the title; it still drops under the subtitle, then keeps its dot, when the title and the pill do not fit.
- Plants: a reading that changes (soil moisture, conductivity, light, temperature, battery), a Plant Monitor threshold or the plant integration's verdict is now shown at once; the card kept the values read when the registries last changed.
- Visual editor: a plant made of sensors in YAML (no `entity`, no `device`) is no longer dropped when another option is edited.

### Performance
- Rendering: the card is patched in place instead of rewritten on every change (a small DOM morph): the banner's animations run on, images are not reloaded, the focus and the height stay; the status pill is measured once Home Assistant's `<ha-card>` has rendered, so it is in its place from the first frame.
- A plant or zone set by device name finds its device through a name index built once per device registry, instead of a scan of every device per plant on each rebuild.

### Maintenance
- README: the `plants_auto` option is documented.
- The commitlint config is an ES module (the package is `"type": "module"`): the local `commit-msg` hook no longer crashes.

## 1.2.0 - 2026-11-18

### Features
- **SONOFF SWV water valves on Zigbee2MQTT** (#13): Start now opens the duration popup for them too, and starts a timed run of the valve itself (`cyclic_timed_irrigation` through `mqtt.publish`, up to 24 h), so it closes on its own at the end even if Home Assistant goes down. The valve is recognised from its device (SONOFF, model SWV); `z2m_topic` sets its topic with another base topic than `zigbee2mqtt`.

### Fixes
- **README**: the duration popup is offered when the card can give the zone a duration (its integration, a duration number, a script or the SWV timed run); a plain valve or switch is still opened without it.

## 1.1.1 - 2026-11-18

### Fixes
- Illustrated header: `auto` now follows the Home Assistant theme alone — a light theme keeps the day picture after sunset, a dark theme still shows the night one.

## 1.1.0 - 2026-11-17

### Features
- **Illustrated header** on the full and the mini card: a 90 px banner with the title and the status on the sky at the left, the card's own drawn garden (sprinkler spraying, rain cloud, wilting plant) at the right in front of hills, a house and a tree, and a 10 px lawn strip edge to edge at the bottom. The garden picture moves from the card's body to the banner.
- **Night picture**: moon, stars and a lit window, darker lawn, when `sun.sun` is below the horizon or with Home Assistant's dark mode; `illustration_theme: day | night` forces one. `illustration: false` keeps the classic header.
- The header icon's colour always follows the garden's status: blue while watering, red or orange when a plant needs attention, grey at rest.
- New options in the visual editor of both cards (illustration, illustration theme), translated in every language.
- The status pill sits on the title's row of the banner, right after the whole title, in the status colour on frosted glass; when the whole title and the pill's whole label do not both fit on that row (measured, in every language), the pill takes a line of its own under the subtitle (the subtitle then on one line), and shows its dot alone when its label does not fit in the banner above the lawn or on a card of 200 px or less; the mini card's detail button sits in the banner's top-right corner, on the same glass as the other cards. The scene narrows so that the pill stays beside the title from 400 px, and stands lower and smaller under the detail button.
- Night picture with the dark theme even while the sun is up.

### Fixes
- **Plant tiles**: the plant's name is whole, its status chip goes under it when both do not fit; the readings of a tile share their columns, so every bar starts and ends at the same place (across tiles too); a tile narrower than 300 px shows the reading icons without their labels (named in the tooltip) instead of cutting them (« Temper… »); the tiles are filled like the other sections and the soil sensors keep their names on a narrow card.

## 1.0.2 - 2026-11-14

### Fixes
- **Mini card visual editor**: its detail view is the full card, but its editor left out the options of the full card. It now offers them too: soil moisture sensors, subtitle, zones, plants and soil sections, and folded sections.
- **README**: these options are marked as working on both cards.

## 1.0.1 - 2026-11-13

### Fixes
- Folding back on a tap elsewhere now works on iOS (Safari and the companion app): a tap on something that is not clickable sent no click to the page, so the unfolded sections, the popup and the detailed view of the mini card stayed open. The press and the release are caught instead; a slider dragged out of the card and a scroll do not fold anything.
- Leaving the card (another dashboard view, a conditional card hidden) brings it back in its default state: sections folded as configured, popup closed, mini card compact.
- Clicks lost under an update: Home Assistant updates the card several times a second, and an update that rewrote the card between the press and the release replaced the element pressed, so that the click landed on the card itself and did nothing. The card is no longer rewritten while a press is in progress; the pending update is drawn right after the click.
- Focus ring after a mouse click: the focus was put back on the clicked element after each update, which drew the focus ring. It is now kept across updates only for the keyboard.

## 1.0.0 - 2026-11-13

First release.

### Features
- **Garden Card** (`custom:garden-card`): drawn garden animated by what goes on (watering, rain expected, thirsty plant), watering zones with their state, next run and soil moisture, a countdown ring while a zone waters, Start with a duration popup and Stop, the next watering, the rain suggestion ("No watering needed" when rain is expected), plants with gauges and thresholds, and soil moisture sensors; collapsible sections.
- **Garden Mini Card** (`custom:garden-mini-card`): compact view with the zone watering now (countdown and Stop), the next watering, the rain suggestion and the plants needing attention; the detail button switches to the full card.
- Zones discovered from Gardena smart system, Gardena Bluetooth, Rain Bird, OpenSprinkler, Hunter Hydrawise, LinkTap, Rachio and Orbit B-hyve, each started its own way; any other valve or switch in `zones`, with a duration number or a script of your own.
- Plants from the plant integration, Plant Monitor (with its threshold numbers) and plant sensor devices such as Mi Flora.
- Rain forecast from the weather entity's forecast subscription (or a rain sensor), with `rain_threshold`, `rain_probability` and `rain_window`.
- Visual editor for both cards; light and dark themes; 22 languages, English in the bundle and every other language in its own file loaded on demand.
