# Changelog

## 1.0.0 - 2026-11-13

First release.

### Features
- **Garden Card** (`custom:garden-card`): drawn garden animated by what goes on (watering, rain expected, thirsty plant), watering zones with their state, next run and soil moisture, a countdown ring while a zone waters, Start with a duration popup and Stop, the next watering, the rain suggestion ("No watering needed" when rain is expected), plants with gauges and thresholds, and soil moisture sensors; collapsible sections.
- **Garden Mini Card** (`custom:garden-mini-card`): compact view with the zone watering now (countdown and Stop), the next watering, the rain suggestion and the plants needing attention; the detail button switches to the full card.
- Zones discovered from Gardena smart system, Gardena Bluetooth, Rain Bird, OpenSprinkler, Hunter Hydrawise, LinkTap, Rachio and Orbit B-hyve, each started its own way; any other valve or switch in `zones`, with a duration number or a script of your own.
- Plants from the plant integration, Plant Monitor (with its threshold numbers) and plant sensor devices such as Mi Flora.
- Rain forecast from the weather entity's forecast subscription (or a rain sensor), with `rain_threshold`, `rain_probability` and `rain_window`.
- Visual editor for both cards; light and dark themes; 22 languages, English in the bundle and every other language in its own file loaded on demand.
