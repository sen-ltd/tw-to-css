// Subset of Tailwind v3's default theme — the parts that cover ~90% of real
// class usage in tutorials and quick prototypes. This is intentionally not
// the full set; the goal is "explain how Tailwind class names map to CSS,"
// not "reimplement Tailwind in 500 lines."

// Spacing scale (used by p-*, m-*, w-*, h-*, gap-*, etc.).
// Values in rem. Tailwind's default: 0=0px, 1=0.25rem, 2=0.5rem, ...
const SPACING_MAP = {};
const SPACING_BASE = [
  0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 5, 6, 7, 8, 9, 10, 11, 12,
  14, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60, 64, 72, 80, 96,
];
for (const n of SPACING_BASE) {
  // tailwind's unit is 0.25rem per step
  SPACING_MAP[String(n)] = n === 0 ? "0px" : `${n * 0.25}rem`;
}
SPACING_MAP["px"] = "1px";
SPACING_MAP["auto"] = "auto";
SPACING_MAP["full"] = "100%";
SPACING_MAP["screen"] = "100vh"; // for h-screen; w-screen uses 100vw

// Tailwind v3 default colour palette (subset: slate, gray, red, orange,
// amber, yellow, lime, green, emerald, teal, cyan, sky, blue, indigo,
// violet, purple, pink, rose). Hex values match the official default.
const COLORS = {
  slate: ["#f8fafc","#f1f5f9","#e2e8f0","#cbd5e1","#94a3b8","#64748b","#475569","#334155","#1e293b","#0f172a"],
  gray:  ["#f9fafb","#f3f4f6","#e5e7eb","#d1d5db","#9ca3af","#6b7280","#4b5563","#374151","#1f2937","#111827"],
  red:   ["#fef2f2","#fee2e2","#fecaca","#fca5a5","#f87171","#ef4444","#dc2626","#b91c1c","#991b1b","#7f1d1d"],
  orange:["#fff7ed","#ffedd5","#fed7aa","#fdba74","#fb923c","#f97316","#ea580c","#c2410c","#9a3412","#7c2d12"],
  amber: ["#fffbeb","#fef3c7","#fde68a","#fcd34d","#fbbf24","#f59e0b","#d97706","#b45309","#92400e","#78350f"],
  yellow:["#fefce8","#fef9c3","#fef08a","#fde047","#facc15","#eab308","#ca8a04","#a16207","#854d0e","#713f12"],
  lime:  ["#f7fee7","#ecfccb","#d9f99d","#bef264","#a3e635","#84cc16","#65a30d","#4d7c0f","#3f6212","#365314"],
  green: ["#f0fdf4","#dcfce7","#bbf7d0","#86efac","#4ade80","#22c55e","#16a34a","#15803d","#166534","#14532d"],
  emerald:["#ecfdf5","#d1fae5","#a7f3d0","#6ee7b7","#34d399","#10b981","#059669","#047857","#065f46","#064e3b"],
  teal:  ["#f0fdfa","#ccfbf1","#99f6e4","#5eead4","#2dd4bf","#14b8a6","#0d9488","#0f766e","#115e59","#134e4a"],
  cyan:  ["#ecfeff","#cffafe","#a5f3fc","#67e8f9","#22d3ee","#06b6d4","#0891b2","#0e7490","#155e75","#164e63"],
  sky:   ["#f0f9ff","#e0f2fe","#bae6fd","#7dd3fc","#38bdf8","#0ea5e9","#0284c7","#0369a1","#075985","#0c4a6e"],
  blue:  ["#eff6ff","#dbeafe","#bfdbfe","#93c5fd","#60a5fa","#3b82f6","#2563eb","#1d4ed8","#1e40af","#1e3a8a"],
  indigo:["#eef2ff","#e0e7ff","#c7d2fe","#a5b4fc","#818cf8","#6366f1","#4f46e5","#4338ca","#3730a3","#312e81"],
  violet:["#f5f3ff","#ede9fe","#ddd6fe","#c4b5fd","#a78bfa","#8b5cf6","#7c3aed","#6d28d9","#5b21b6","#4c1d95"],
  purple:["#faf5ff","#f3e8ff","#e9d5ff","#d8b4fe","#c084fc","#a855f7","#9333ea","#7e22ce","#6b21a8","#581c87"],
  pink:  ["#fdf2f8","#fce7f3","#fbcfe8","#f9a8d4","#f472b6","#ec4899","#db2777","#be185d","#9d174d","#831843"],
  rose:  ["#fff1f2","#ffe4e6","#fecdd3","#fda4af","#fb7185","#f43f5e","#e11d48","#be123c","#9f1239","#881337"],
};
const COLOR_SHADES = ["50","100","200","300","400","500","600","700","800","900"];
const COLOR_ALIASES = { white: "#ffffff", black: "#000000", transparent: "transparent", current: "currentColor" };

// Font-size scale (text-xs, text-sm, ...). [size, line-height]
const FONT_SIZE = {
  xs:  ["0.75rem", "1rem"],
  sm:  ["0.875rem","1.25rem"],
  base:["1rem",   "1.5rem"],
  lg:  ["1.125rem","1.75rem"],
  xl:  ["1.25rem","1.75rem"],
  "2xl":["1.5rem","2rem"],
  "3xl":["1.875rem","2.25rem"],
  "4xl":["2.25rem","2.5rem"],
  "5xl":["3rem","1"],
  "6xl":["3.75rem","1"],
};

// Font-weight (font-thin / font-bold / etc.)
const FONT_WEIGHT = {
  thin: "100", extralight: "200", light: "300", normal: "400",
  medium: "500", semibold: "600", bold: "700", extrabold: "800", black: "900",
};

// Border-radius (rounded, rounded-md, ...)
const BORDER_RADIUS = {
  none: "0px", sm: "0.125rem", "": "0.25rem", md: "0.375rem",
  lg: "0.5rem", xl: "0.75rem", "2xl": "1rem", "3xl": "1.5rem", full: "9999px",
};

// Shadow (shadow, shadow-md, ...)
const SHADOW = {
  sm:  "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  "":  "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
  md:  "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
  lg:  "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  xl:  "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
  "2xl":"0 25px 50px -12px rgb(0 0 0 / 0.25)",
  inner:"inset 0 2px 4px 0 rgb(0 0 0 / 0.05)",
  none: "none",
};

// Resolve a colour token like "blue-500", "gray-900", "white" → hex string.
// Returns null if the token isn't a recognised colour.
function resolveColor(token) {
  if (token in COLOR_ALIASES) return COLOR_ALIASES[token];
  const dash = token.lastIndexOf("-");
  if (dash < 0) return null;
  const name = token.slice(0, dash);
  const shade = token.slice(dash + 1);
  if (!(name in COLORS)) return null;
  const idx = COLOR_SHADES.indexOf(shade);
  if (idx < 0) return null;
  return COLORS[name][idx];
}

export {
  SPACING_MAP,
  COLORS,
  COLOR_SHADES,
  COLOR_ALIASES,
  FONT_SIZE,
  FONT_WEIGHT,
  BORDER_RADIUS,
  SHADOW,
  resolveColor,
};
