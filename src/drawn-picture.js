// ---------------------------------------------------------------------------
// Drawn picture
// ---------------------------------------------------------------------------
// The garden is a drawing (lawn, pop-up sprinkler, potted plant, sky), animated by what is going on (`activity`):
// watering (the sprinkler sprays water arcs, drops fall and the grass sways), rain (a cloud rains over the garden,
// watering is not needed), thirsty (a plant lacks water: it wilts under a burning sun), none (at rest).

// Animations, shared by every picture. Pictures are <img>, so CSS animations run but no script does.
export const ANIM_CSS = `
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

export const svgDoc = (w, h, body, anim = false) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">${anim ? `<style>${ANIM_CSS}</style>` : ""}${body}</svg>`;
export const svgUri = (svg) => `data:image/svg+xml,${encodeURIComponent(svg)}`;

// Lawn (width w from x, its top at y), its blades swaying in the water or the rain.
export const lawn = (x, y, w, moving, night = false) => {
  let s = `<rect x="${x}" y="${y}" width="${w}" height="12" rx="4" fill="${night ? "#3d7f33" : "#5aa83d"}"/>`;
  for (let i = 0; i < w / 9; i++) {
    const bx = x + 4 + i * 9;
    s += `<path class="${moving ? `wave d${i % 4}` : ""}" d="M${bx} ${y + 2} q1.5 -6 3 -9 q0 5 2 9" fill="${night ? "#58a043" : "#79c257"}"/>`;
  }
  return s;
};

// Potted plant (pot centred on cx, standing on y): green and upright, or pale and wilting when thirsty.
export const plantPot = (cx, y, thirsty) => {
  const leaf = thirsty ? "#a4b54a" : "#4caf50";
  const leaf2 = thirsty ? "#8a9a3c" : "#2e8b3e";
  let s = `<path d="M${cx - 15} ${y - 26} H${cx + 15} L${cx + 11} ${y} H${cx - 11} Z" fill="#c8693c"/><rect x="${cx - 17}" y="${y - 30}" width="34" height="6" rx="2" fill="#b35a30"/>`;
  s += `<g class="${thirsty ? "wilt" : ""}"><path d="M${cx} ${y - 30} V${y - 58}" stroke="${leaf2}" stroke-width="2.5" stroke-linecap="round"/>`;
  s += `<path d="M${cx} ${y - 40} q-16 -2 -18 -14 q14 -1 18 14 Z" fill="${leaf}"/><path d="M${cx} ${y - 46} q16 -2 18 -14 q-14 -1 -18 14 Z" fill="${leaf2}"/>`;
  s += `<path d="M${cx} ${y - 56} q-9 -3 -9 -12 q9 2 9 12 Z" fill="${leaf}"/><path d="M${cx} ${y - 56} q9 -3 9 -12 q-9 2 -9 12 Z" fill="${leaf2}"/></g>`;
  return s;
};

// Pop-up sprinkler (x: its centre, y: the lawn), spraying two water arcs and drops while it waters.
export const sprinkler = (x, y, on) => {
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

export const sun = (cx, cy, hot) =>
  `<g class="${hot ? "rays" : ""}">${[0, 45, 90, 135, 180, 225, 270, 315]
    .map((a) => {
      const r = (a * Math.PI) / 180;
      return `<line x1="${(cx + 13 * Math.cos(r)).toFixed(1)}" y1="${(cy + 13 * Math.sin(r)).toFixed(1)}" x2="${(cx + 18 * Math.cos(r)).toFixed(1)}" y2="${(cy + 18 * Math.sin(r)).toFixed(1)}" stroke="#f4b400" stroke-width="2.4" stroke-linecap="round"/>`;
    })
    .join("")}</g>${hot ? `<circle class="glow" cx="${cx}" cy="${cy}" r="15" fill="#ff9800" opacity=".35"/>` : ""}<circle cx="${cx}" cy="${cy}" r="9" fill="${hot ? "#ff9800" : "#f4b400"}"/>`;

export const cloud = (x, y, dark) =>
  `<g class="drift"><path d="M${x} ${y} a12 12 0 0 1 12 -12 a16 16 0 0 1 30 -4 a11 11 0 0 1 16 10 a9 9 0 0 1 -2 18 H${x + 6} a9 9 0 0 1 -6 -12 Z" fill="${dark ? "#8a98a8" : "#c3ccd6"}"/></g>`;

// The garden (160 × 120) for an activity: "watering", "rain", "thirsty" or null. At night (the illustrated
// header's night theme) the sun is left out (the header's sky has the moon) and the lawn is darker.
export const gardenSvg = (activity = null, night = false) => {
  let s = "";
  if (activity === "rain") {
    s += cloud(30, 30, true);
    s += cloud(86, 22, false);
    s += [26, 44, 62, 80, 98, 116, 134]
      .map((x, i) => `<line class="fall d${i % 5}" x1="${x}" y1="40" x2="${x - 3}" y2="50" stroke="#4aa3ea" stroke-width="2" stroke-linecap="round" opacity="0"/>`)
      .join("");
  } else if (!night) s += sun(136, 22, activity === "thirsty");
  s += lawn(4, 104, 152, activity === "watering" || activity === "rain", night);
  s += sprinkler(52, 106, activity === "watering");
  s += plantPot(122, 106, activity === "thirsty");
  if (activity === "thirsty") s += `<path d="M104 112 l4 3 l-2 3 M128 113 l3 2" stroke="#3f6b2b" stroke-width="1.2" fill="none" opacity=".7"/>`;
  return svgUri(svgDoc(160, 120, s, !!activity));
};

// ---------------------------------------------------------------------------
// The illustrated header: a 90 px banner, the title on the sky at its left, a garden scene at its right (hills, a
// house and a tree behind the card's own drawn garden above) and a 10 px lawn strip edge to edge at the bottom.
// Day or night: forced by `illustration_theme`, else Home Assistant's dark theme alone (a light theme keeps the day picture after sunset).
// ---------------------------------------------------------------------------

export const GC_STARS = [
  [10, 8],
  [40, 20],
  [100, 6],
  [130, 26],
  [170, 10],
  [190, 30],
  [86, 30],
];

// The scene's backdrop (200 × 80, drawn to the right edge, the lawn strip under it). No id: nothing to keep apart
// between cards on one page. The garden itself is the card's own picture (gardenSvg), set over it.
export const gcSceneSvg = (night) => {
  const c = (day, dark) => (night ? dark : day);
  const cloud = (x, y, k, i) =>
    `<g transform="translate(${x} ${y}) scale(${k})"><path class="gc-cloud${i ? " gc-slow" : ""}" d="M-14,4 C-17,4 -18,0 -14.5,-1 C-14,-5 -8,-6 -6,-3 C-4,-8 4,-8 5,-2 C9,-3 12,0 10,4 Z"/></g>`;
  const sky = night
    ? `${GC_STARS.map(([x, y], i) => `<circle class="gc-star${i % 3 ? "" : " tw"}" cx="${x}" cy="${y}" r=".7"/>`).join("")}<path class="gc-moon" d="M70 9.4a6.4 6.4 0 1 0 5.6 9.6 5.2 5.2 0 1 1-5.6-9.6Z"/>`
    : "";
  return `<svg class="gc-scene" viewBox="0 0 200 80" preserveAspectRatio="xMaxYMax meet" aria-hidden="true" focusable="false">${sky}${cloud(40, 14, 1, 0)}${cloud(150, 22, 0.7, 1)}
    <path d="M0,80 C30,70 60,64 100,66 C140,68 170,60 200,62 L200,80Z" fill="${c("#a7d39f", "#1d3a4a")}"/>
    <g transform="translate(20 50)"><rect width="34" height="22" fill="${c("#f3e6d3", "#2a3646")}"/><path d="M-3 1 L17 -12 L37 1Z" fill="${c("#c0603a", "#3a2a2a")}"/><rect class="gc-window" x="5" y="7" width="7" height="6" fill="${c("#86b9de", "#ffcf6e")}"/><rect x="21" y="9" width="6" height="13" fill="${c("#8a5a3a", "#1c2530")}"/></g>
    <path d="M0,80 C40,74 90,75 200,72 L200,80Z" fill="${c("#86c27f", "#17303d")}"/><circle cx="72" cy="56" r="9" fill="${c("#5aa83d", "#1a3a2a")}"/><rect x="71" y="62" width="2" height="12" fill="#6b4a2a"/></svg>`;
};

export const gcIsNight = (hass, config) => {
  const theme = config.illustration_theme;
  if (theme === "night") return true;
  if (theme === "day") return false;
  return !!hass?.themes?.darkMode;
};
