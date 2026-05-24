// Pure Tailwind-class-to-CSS converter. Given a class string like
// "bg-blue-500 text-white p-4 rounded-lg", returns:
//   { rules: [...], unrecognised: [...] }
// where each rule is { class, declarations: [[prop, value], ...] }.
//
// No DOM. Tests pass synthetic class strings.

import {
  SPACING_MAP,
  FONT_SIZE,
  FONT_WEIGHT,
  BORDER_RADIUS,
  SHADOW,
  resolveColor,
} from "./tailwind-data.js";

// Tokenize a Tailwind class string. Splits on whitespace, drops empty
// tokens, and dedupes while preserving order.
export function tokenize(input) {
  const seen = new Set();
  const out = [];
  for (const t of input.split(/\s+/)) {
    if (!t) continue;
    if (seen.has(t)) continue;
    seen.add(t);
    out.push(t);
  }
  return out;
}

// Each handler returns either an array of [prop, value] declarations or
// null (not a match). The parser tries them in order; first non-null wins.
//
// Adding a new utility = adding a handler. The lookup tables stay in
// tailwind-data.js, the logic stays here, both stay DOM-free and testable.
const HANDLERS = [
  // ─── Layout ───
  layoutHandler("flex", [["display", "flex"]]),
  layoutHandler("grid", [["display", "grid"]]),
  layoutHandler("inline-flex", [["display", "inline-flex"]]),
  layoutHandler("block", [["display", "block"]]),
  layoutHandler("inline", [["display", "inline"]]),
  layoutHandler("inline-block", [["display", "inline-block"]]),
  layoutHandler("hidden", [["display", "none"]]),

  // flex direction / wrap
  layoutHandler("flex-row", [["flex-direction", "row"]]),
  layoutHandler("flex-col", [["flex-direction", "column"]]),
  layoutHandler("flex-wrap", [["flex-wrap", "wrap"]]),
  layoutHandler("flex-nowrap", [["flex-wrap", "nowrap"]]),

  // alignment
  prefixHandler("items-", (v) => {
    const map = { start: "flex-start", center: "center", end: "flex-end",
                  stretch: "stretch", baseline: "baseline" };
    return map[v] ? [["align-items", map[v]]] : null;
  }),
  prefixHandler("justify-", (v) => {
    const map = { start: "flex-start", center: "center", end: "flex-end",
                  between: "space-between", around: "space-around", evenly: "space-evenly" };
    return map[v] ? [["justify-content", map[v]]] : null;
  }),

  // ─── Spacing (margin, padding, gap) ───
  spacingHandler("p", "padding"),
  spacingHandler("pt", "padding-top"),
  spacingHandler("pr", "padding-right"),
  spacingHandler("pb", "padding-bottom"),
  spacingHandler("pl", "padding-left"),
  spacingHandler("px", ["padding-left", "padding-right"]),
  spacingHandler("py", ["padding-top", "padding-bottom"]),
  spacingHandler("m", "margin"),
  spacingHandler("mt", "margin-top"),
  spacingHandler("mr", "margin-right"),
  spacingHandler("mb", "margin-bottom"),
  spacingHandler("ml", "margin-left"),
  spacingHandler("mx", ["margin-left", "margin-right"]),
  spacingHandler("my", ["margin-top", "margin-bottom"]),
  spacingHandler("gap", "gap"),
  spacingHandler("gap-x", "column-gap"),
  spacingHandler("gap-y", "row-gap"),

  // ─── Sizing ───
  spacingHandler("w", "width"),
  spacingHandler("h", "height"),
  spacingHandler("min-w", "min-width"),
  spacingHandler("min-h", "min-height"),
  spacingHandler("max-w", "max-width"),
  spacingHandler("max-h", "max-height"),

  // ─── Colours ───
  prefixHandler("bg-", (v) => {
    const hex = resolveColor(v);
    return hex ? [["background-color", hex]] : null;
  }),
  prefixHandler("text-", (v) => {
    // text-* is overloaded: text-{size} OR text-{align} OR text-{color}.
    if (v in FONT_SIZE) {
      const [size, lh] = FONT_SIZE[v];
      return [["font-size", size], ["line-height", lh]];
    }
    if (["left", "center", "right", "justify"].includes(v)) {
      return [["text-align", v]];
    }
    const hex = resolveColor(v);
    return hex ? [["color", hex]] : null;
  }),
  prefixHandler("border-", (v) => {
    const hex = resolveColor(v);
    if (hex) return [["border-color", hex]];
    // border-2, border-4 etc. = border-width
    if (/^\d+$/.test(v)) return [["border-width", `${v}px`]];
    return null;
  }),

  // ─── Typography ───
  prefixHandler("font-", (v) => {
    if (v in FONT_WEIGHT) return [["font-weight", FONT_WEIGHT[v]]];
    if (v === "sans") return [["font-family", "ui-sans-serif, system-ui, sans-serif"]];
    if (v === "serif") return [["font-family", "ui-serif, Georgia, serif"]];
    if (v === "mono") return [["font-family", "ui-monospace, monospace"]];
    return null;
  }),
  layoutHandler("italic", [["font-style", "italic"]]),
  layoutHandler("uppercase", [["text-transform", "uppercase"]]),
  layoutHandler("lowercase", [["text-transform", "lowercase"]]),
  layoutHandler("capitalize", [["text-transform", "capitalize"]]),
  layoutHandler("underline", [["text-decoration-line", "underline"]]),

  // ─── Borders, radius, shadow ───
  layoutHandler("border", [["border-width", "1px"]]),
  prefixHandler("rounded", (v) => {
    // rounded → "" key; rounded-md, rounded-full, etc.
    const key = v.startsWith("-") ? v.slice(1) : v;
    if (key in BORDER_RADIUS) return [["border-radius", BORDER_RADIUS[key]]];
    return null;
  }, { allowExact: true }),
  prefixHandler("shadow", (v) => {
    const key = v.startsWith("-") ? v.slice(1) : v;
    if (key in SHADOW) return [["box-shadow", SHADOW[key]]];
    return null;
  }, { allowExact: true }),
];

function layoutHandler(exact, decls) {
  return (cls) => (cls === exact ? decls : null);
}

function prefixHandler(prefix, fn, opts = {}) {
  return (cls) => {
    if (opts.allowExact && cls === prefix) {
      return fn("");
    }
    if (!cls.startsWith(prefix)) return null;
    return fn(cls.slice(prefix.length));
  };
}

function spacingHandler(prefix, cssProp) {
  return (cls) => {
    const dash = `${prefix}-`;
    if (!cls.startsWith(dash)) return null;
    const v = cls.slice(dash.length);
    if (!(v in SPACING_MAP)) return null;
    const value = SPACING_MAP[v];
    const props = Array.isArray(cssProp) ? cssProp : [cssProp];
    // h-screen → 100vh; w-screen → 100vw (vertical for height, viewport for width)
    let final = value;
    if (value === "100vh") {
      if (props[0] === "width") final = "100vw";
    }
    return props.map((p) => [p, final]);
  };
}

// Convert a single class name into [[prop, value], ...] or null.
export function classToDeclarations(cls) {
  for (const h of HANDLERS) {
    const result = h(cls);
    if (result) return result;
  }
  return null;
}

// Convert a class string into an array of rules + an unrecognised list.
export function parse(input) {
  const tokens = tokenize(input);
  const rules = [];
  const unrecognised = [];
  for (const cls of tokens) {
    const decls = classToDeclarations(cls);
    if (decls) {
      rules.push({ class: cls, declarations: decls });
    } else {
      unrecognised.push(cls);
    }
  }
  return { rules, unrecognised };
}

// Render the rules to a single CSS block:
//   .preview {
//     background-color: #3b82f6;
//     color: #ffffff;
//     ...
//   }
export function toCSS(rules, selector = ".preview") {
  const seen = new Map();
  // Later classes override earlier ones for the same property — matches
  // Tailwind's "last in source order wins" intuition (within a single
  // class list; no specificity tricks here).
  for (const r of rules) {
    for (const [prop, value] of r.declarations) {
      seen.set(prop, value);
    }
  }
  if (seen.size === 0) return `${selector} {}`;
  const lines = [...seen.entries()].map(([p, v]) => `  ${p}: ${v};`);
  return `${selector} {\n${lines.join("\n")}\n}`;
}
