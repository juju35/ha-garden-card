// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

export const BASE_STYLE = `
  :host { --gc-accent: #3f9b4f; --gc-ok: var(--success-color, #43a047); --gc-warn: var(--warning-color, #ffa600);
          --gc-crit: var(--error-color, #db4437); --gc-idle: var(--disabled-text-color, #9e9e9e); --gc-active: var(--info-color, #039be5);
          /* Text in a state color is mixed with the text color so that it reads at 4.5:1 at least. */
          --gc-accent-text: color-mix(in srgb, var(--gc-accent) 50%, var(--primary-text-color)); }
  ha-card { overflow: hidden; container: gc-card / inline-size; }
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
  @container gc-card (max-width: 200px) {
    .chip { padding: 4px; flex: none; }
    .chip-text { display: none; }
    .header { gap: 6px; }
  }
`;

// The illustrated header (see gcSceneSvg): the scene is 200 × 80 (at most 46 % of the card's width), the lawn strip
// 10 px under it, the icon and the titles on the sky at its left.
export const BANNER_STYLE = `
  .banner { position: relative; overflow: hidden; height: 90px; color: #10283f; --gc-ground: 10px;
            background: linear-gradient(90deg, #f1f8ff 0%, #e2f1fd 34%, #b9def8 70%, #9fd0f3 100%); }
  .banner.night { color: #fff; background: linear-gradient(90deg, #1b2f52 0%, #15284a 36%, #0f1f3d 72%, #0a1830 100%); }
  .gc-ground { position: absolute; left: 0; right: 0; bottom: 0; height: var(--gc-ground);
               background: repeating-linear-gradient(90deg, #5aa83d 0 22px, #6cbb4c 22px 44px); }
  .night .gc-ground { background: repeating-linear-gradient(90deg, #1f4a2a 0 22px, #245433 22px 44px); }
  /* The scene leaves the title row room for the title and its pill (at least 250 px of the card); with the detail
     button in the corner, it stands lower and smaller, under the button. */
  .banner { --gc-stage-w: min(200px, 46%, max(40%, 100% - 250px)); }
  .banner:has(> .zoom) { --gc-stage-w: min(135px, 40%); }
  .gc-stage { position: absolute; right: 0; bottom: var(--gc-ground); width: var(--gc-stage-w); aspect-ratio: 5 / 2; }
  .gc-scene { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
  .gc-cloud { fill: #fff; opacity: .92; animation: gc-drift 4s ease-in-out infinite alternate; }
  .gc-cloud.gc-slow { animation-duration: 5.5s; animation-delay: -2s; }
  .night .gc-cloud { opacity: .1; }
  .gc-star { fill: #fff; opacity: .8; }
  .gc-star.tw { animation: gc-twinkle 3.2s ease-in-out infinite alternate; }
  .gc-moon { fill: #f3eed2; }
  .night .gc-window { filter: drop-shadow(0 0 1.4px #ffb347); }
  /* The card's drawn garden (160 × 120), its lawn on the strip at the right of the scene. */
  .gc-art { position: absolute; left: 47.7%; width: 50.3%; bottom: -3.1%; aspect-ratio: 4 / 3; }
  .gc-art img { display: block; width: 100%; height: 100%; }
  .htext { position: absolute; left: 12px; top: 6px; bottom: calc(var(--gc-ground) + 4px); right: calc(var(--gc-stage-w) + 4px);
           display: flex; align-items: center; gap: 10px; min-width: 0; }
  .htext .titles { display: grid; grid-template-columns: minmax(0, 1fr); row-gap: 1px; container: gc-titles / inline-size; }
  /* The status pill at the right end of the title's row: the title ellipsises first (4 characters kept), the pill keeps its label. */
  .trow { display: flex; align-items: center; gap: 8px; min-width: 0; }
  .trow .name { flex: 0 1 auto; min-width: 4.6ch; }
  .htext .name { font-weight: 600; }
  .banner .sub { color: #3d5670; font-size: 13px; }
  .banner.night .sub { color: rgba(255,255,255,.8); }
  /* The icon on a glass disc, in the colour of the garden's status (watering, warning, alert, else idle grey). */
  .banner .type-icon { background: rgba(255,255,255,.62); box-shadow: inset 0 0 0 1px rgba(47,128,237,.18); }
  .banner .type-icon .icon { fill: color-mix(in srgb, var(--gc-tint) 80%, #10283f); }
  .banner.night .type-icon { background: rgba(255,255,255,.12); box-shadow: inset 0 0 0 1px rgba(255,255,255,.14); }
  .banner.night .type-icon .icon { fill: color-mix(in srgb, var(--gc-tint) 70%, #fff); }
  .banner .chip { flex: none; max-width: none; margin-left: auto; background: color-mix(in srgb, var(--c) 18%, rgba(255,255,255,.78)); color: color-mix(in srgb, var(--c) 45%, #0d2a45); }
  .banner.night .chip { background: color-mix(in srgb, var(--c) 30%, rgba(8,18,38,.55)); color: color-mix(in srgb, var(--c) 35%, #ffffff); }
  .banner .dot { width: 7px; height: 7px; }
  .banner .zoom { position: absolute; z-index: 2; top: 5px; right: 5px; margin: 0; color: #33506b; background: rgba(255,255,255,.55);
                  box-shadow: inset 0 0 0 1px rgba(255,255,255,.7); backdrop-filter: blur(4px); }
  .banner.night .zoom { color: #fff; background: rgba(255,255,255,.12); box-shadow: inset 0 0 0 1px rgba(255,255,255,.2); }
  .banner .zoom:hover { background: rgba(255,255,255,.75); }
  .banner.night .zoom:hover { background: rgba(255,255,255,.22); }
  /* The whole title and the pill's whole label do not fit on one row (measured, see _fitPill): the pill takes a line
     of its own under the subtitle, which keeps one line; when that does not fit above the lawn, its dot alone. */
  .titles.below .trow { display: contents; } .banner .titles.below .chip { grid-row: 3; justify-self: start; max-width: 100%; margin-top: 3px; margin-left: 0; }
  .titles.below .sub { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .banner .titles.dot-only .chip { padding: 4px; } .banner .titles.dot-only .chip-text { display: none; }
  @keyframes gc-drift { to { transform: translateX(4px); } }
  @keyframes gc-twinkle { from { opacity: .35; } to { opacity: 1; } }
  /* Narrow card: no room for the scene beside the title, the sky and the lawn stay. */
  @container gc-card (max-width: 270px) { .gc-stage { display: none; } .htext { right: 34px; } }
  @media (prefers-reduced-motion: reduce) { .gc-cloud, .gc-star { animation: none !important; } }
`;

// Popup (duration to water a zone) at the top of the card, over a backdrop: it stays in view on a long card.
export const DIALOG_STYLE = `
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

export const FULL_STYLE = `
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
  .plant { display: flex; flex-direction: column; gap: 8px; padding: 10px; border-radius: 12px; min-width: 0; box-sizing: border-box;
           container: gc-plant / inline-size; background: var(--secondary-background-color, rgba(127,127,127,.1)); }
  .plant-head { display: flex; align-items: center; gap: 8px; min-width: 0; }
  /* The name first: the status chip follows it when there is room, else it goes under it (never the name cut for it). */
  .plant-titles { flex: 1 1 0; min-width: 0; display: flex; flex-wrap: wrap; align-items: center; gap: 2px 8px; }
  .plant-pic { width: 32px; height: 32px; border-radius: 50%; flex: none; display: grid; place-items: center; overflow: hidden;
               background: color-mix(in srgb, var(--c, var(--gc-ok)) 16%, transparent); color: color-mix(in srgb, var(--c, var(--gc-ok)) 60%, var(--primary-text-color)); position: relative; }
  .plant-pic img { width: 100%; height: 100%; object-fit: cover; }
  .plant-pic .icon { width: 20px; height: 20px; }
  .plant-pic .badge { position: absolute; right: -1px; bottom: -1px; width: 14px; height: 14px; color: var(--gc-crit); }
  .plant-name { flex: 0 1 auto; min-width: 0; font-size: 14px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .plant-titles .chip { flex: 0 1 auto; min-width: 0; max-width: 100%; }
  .plant-titles .chip-text { min-width: 0; overflow: hidden; text-overflow: ellipsis; }
  /* The rows of a tile (and of the soil section) share their columns: icon, label, bar, value, so every bar starts and
     ends at the same place. */
  .gauges, .soil { display: grid; grid-template-columns: 16px max-content minmax(48px, 1fr) minmax(6em, max-content); gap: 5px 6px; min-width: 0; }
  .soil { grid-template-columns: 16px minmax(0, max-content) minmax(60px, 1fr) max-content; }
  .plant .track .mark { box-shadow: 0 0 0 2px var(--secondary-background-color, #ececec); }
  .gauge { grid-column: 1 / -1; display: grid; grid-template-columns: subgrid; align-items: center; font-size: 12px; min-width: 0; }
  /* A tile too narrow for the labels: the icons alone (the label and the range in the tooltip), the bars wider. */
  @container gc-plant (max-width: 299px) {
    .gauges { grid-template-columns: 16px minmax(40px, 1fr) minmax(6em, max-content); }
    .gauges .lbl { display: none; }
  }
  .gauge > .icon { width: 16px; height: 16px; color: var(--secondary-text-color); }
  .gauge .lbl { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--secondary-text-color); }
  .gauge .v { text-align: right; font-weight: 500; white-space: nowrap; min-width: 4ch; }
  .gauge.warn .v, .gauge.crit .v { color: color-mix(in srgb, var(--c) 50%, var(--primary-text-color)); }
  .gauge.warn > .icon, .gauge.crit > .icon { color: var(--c); }
  .track { position: relative; height: 6px; border-radius: 3px; background: var(--divider-color, rgba(127,127,127,.25)); }
  .track .band { position: absolute; top: 0; bottom: 0; border-radius: 3px; background: color-mix(in srgb, var(--gc-ok) 40%, transparent); }
  .track .mark { position: absolute; top: 50%; width: 10px; height: 10px; margin: -5px 0 0 -5px; border-radius: 50%; background: var(--c, var(--gc-ok));
                 box-shadow: 0 0 0 2px var(--card-background-color, #fff); box-sizing: border-box; }
  /* Narrow card: a smaller picture, the zone button keeps its icon. */
  @container (max-width: 300px) {
    .picture { width: 80px; height: 60px; }
    .hero { gap: 10px; }
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

export const MINI_STYLE = `
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
export const DIALOG_TAGS = new Set(["HA-MORE-INFO-DIALOG", "HA-DIALOG", "DIALOG"]);
export const isOutside = (card, ev) => {
  const path = ev.composedPath();
  return !path.includes(card) && !path.some((n) => DIALOG_TAGS.has(n.tagName));
};

// "A click elsewhere" is caught on the pointer, not only on the click event: on iOS (Safari and the companion app) a
// tap on something that is not clickable (the background, an empty spot, a card with no action) sends no click to the
// page. It counts when the press and the release are both outside the card (a slider dragged out of the card does not
// fold it), and a scroll does not count (the browser cancels the pointer). Keyboard clicks still go through the click
// event. `tap(ev)` (a press and a release at the same spot) is for the tests.
export const watchOutside = (isOut, handler) => {
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
export const CONFIRM_GUARD_MS = 400;
// Elements a click acts on, and how one is told from the others across renders (focus kept for keyboard users).
export const FOCUS_SELECTOR = "[data-action], [data-entity]";
export const focusKey = (el) => {
  const data = Object.entries({ ...el.dataset });
  return data.length ? `${el.tagName}|${JSON.stringify(data)}` : "";
};
export const RING_C = 2 * Math.PI * 17;
