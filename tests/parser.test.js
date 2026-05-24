import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  tokenize,
  classToDeclarations,
  parse,
  toCSS,
} from "../parser.js";

describe("tokenize", () => {
  test("splits on whitespace, drops empties", () => {
    assert.deepEqual(tokenize("flex  p-4    text-white"), ["flex", "p-4", "text-white"]);
  });
  test("dedupes while preserving order", () => {
    assert.deepEqual(tokenize("flex p-4 flex"), ["flex", "p-4"]);
  });
  test("empty input → empty array", () => {
    assert.deepEqual(tokenize(""), []);
    assert.deepEqual(tokenize("   "), []);
  });
});

describe("classToDeclarations — layout", () => {
  test("flex", () => {
    assert.deepEqual(classToDeclarations("flex"), [["display", "flex"]]);
  });
  test("hidden", () => {
    assert.deepEqual(classToDeclarations("hidden"), [["display", "none"]]);
  });
  test("flex-col", () => {
    assert.deepEqual(classToDeclarations("flex-col"), [["flex-direction", "column"]]);
  });
  test("items-center", () => {
    assert.deepEqual(classToDeclarations("items-center"), [["align-items", "center"]]);
  });
  test("justify-between", () => {
    assert.deepEqual(classToDeclarations("justify-between"),
      [["justify-content", "space-between"]]);
  });
});

describe("classToDeclarations — spacing", () => {
  test("p-4 → padding 1rem", () => {
    assert.deepEqual(classToDeclarations("p-4"), [["padding", "1rem"]]);
  });
  test("p-0 → padding 0px", () => {
    assert.deepEqual(classToDeclarations("p-0"), [["padding", "0px"]]);
  });
  test("p-px → padding 1px", () => {
    assert.deepEqual(classToDeclarations("p-px"), [["padding", "1px"]]);
  });
  test("px-2 → padding-left + padding-right", () => {
    assert.deepEqual(classToDeclarations("px-2"), [
      ["padding-left", "0.5rem"],
      ["padding-right", "0.5rem"],
    ]);
  });
  test("m-auto → margin auto", () => {
    assert.deepEqual(classToDeclarations("m-auto"), [["margin", "auto"]]);
  });
  test("gap-4", () => {
    assert.deepEqual(classToDeclarations("gap-4"), [["gap", "1rem"]]);
  });
  test("w-full → 100%", () => {
    assert.deepEqual(classToDeclarations("w-full"), [["width", "100%"]]);
  });
  test("w-screen → 100vw (NOT 100vh)", () => {
    assert.deepEqual(classToDeclarations("w-screen"), [["width", "100vw"]]);
  });
  test("h-screen → 100vh", () => {
    assert.deepEqual(classToDeclarations("h-screen"), [["height", "100vh"]]);
  });
});

describe("classToDeclarations — colours", () => {
  test("bg-blue-500", () => {
    assert.deepEqual(classToDeclarations("bg-blue-500"),
      [["background-color", "#3b82f6"]]);
  });
  test("bg-white", () => {
    assert.deepEqual(classToDeclarations("bg-white"),
      [["background-color", "#ffffff"]]);
  });
  test("text-red-600", () => {
    assert.deepEqual(classToDeclarations("text-red-600"),
      [["color", "#dc2626"]]);
  });
  test("bg-transparent", () => {
    assert.deepEqual(classToDeclarations("bg-transparent"),
      [["background-color", "transparent"]]);
  });
  test("border-gray-300", () => {
    assert.deepEqual(classToDeclarations("border-gray-300"),
      [["border-color", "#d1d5db"]]);
  });
});

describe("classToDeclarations — typography", () => {
  test("text-lg → size + line-height", () => {
    assert.deepEqual(classToDeclarations("text-lg"), [
      ["font-size", "1.125rem"],
      ["line-height", "1.75rem"],
    ]);
  });
  test("text-center → text-align center", () => {
    assert.deepEqual(classToDeclarations("text-center"),
      [["text-align", "center"]]);
  });
  test("font-bold → 700", () => {
    assert.deepEqual(classToDeclarations("font-bold"),
      [["font-weight", "700"]]);
  });
  test("font-mono → monospace family", () => {
    const r = classToDeclarations("font-mono");
    assert.equal(r[0][0], "font-family");
    assert.match(r[0][1], /monospace/);
  });
  test("italic", () => {
    assert.deepEqual(classToDeclarations("italic"), [["font-style", "italic"]]);
  });
});

describe("classToDeclarations — radius, border, shadow", () => {
  test("rounded → 0.25rem", () => {
    assert.deepEqual(classToDeclarations("rounded"),
      [["border-radius", "0.25rem"]]);
  });
  test("rounded-lg", () => {
    assert.deepEqual(classToDeclarations("rounded-lg"),
      [["border-radius", "0.5rem"]]);
  });
  test("rounded-full → 9999px (pill)", () => {
    assert.deepEqual(classToDeclarations("rounded-full"),
      [["border-radius", "9999px"]]);
  });
  test("border → 1px", () => {
    assert.deepEqual(classToDeclarations("border"),
      [["border-width", "1px"]]);
  });
  test("border-2 → 2px", () => {
    assert.deepEqual(classToDeclarations("border-2"),
      [["border-width", "2px"]]);
  });
  test("shadow-md", () => {
    const r = classToDeclarations("shadow-md");
    assert.equal(r[0][0], "box-shadow");
    assert.match(r[0][1], /rgb/);
  });
});

describe("classToDeclarations — unknown", () => {
  test("invalid class returns null", () => {
    assert.equal(classToDeclarations("not-a-real-class"), null);
  });
  test("bg-unknowncolor-500 returns null", () => {
    assert.equal(classToDeclarations("bg-unknowncolor-500"), null);
  });
  test("p-99 (off-scale) returns null", () => {
    assert.equal(classToDeclarations("p-99"), null);
  });
});

describe("parse — whole class strings", () => {
  test("typical button classes", () => {
    const result = parse("bg-blue-500 text-white px-4 py-2 rounded font-bold");
    assert.equal(result.unrecognised.length, 0);
    assert.equal(result.rules.length, 6);
  });
  test("collects unrecognised classes", () => {
    const result = parse("flex bogus-class p-4 not-real");
    assert.deepEqual(result.unrecognised, ["bogus-class", "not-real"]);
    assert.equal(result.rules.length, 2);
  });
  test("empty input → empty result", () => {
    const result = parse("");
    assert.deepEqual(result.rules, []);
    assert.deepEqual(result.unrecognised, []);
  });
});

describe("toCSS", () => {
  test("renders rules as CSS block", () => {
    const result = parse("bg-blue-500 text-white p-4");
    const css = toCSS(result.rules);
    assert.match(css, /^\.preview \{/);
    assert.match(css, /background-color: #3b82f6;/);
    assert.match(css, /color: #ffffff;/);
    assert.match(css, /padding: 1rem;/);
  });
  test("later classes win on same property", () => {
    const result = parse("bg-red-500 bg-blue-500");
    const css = toCSS(result.rules);
    assert.match(css, /background-color: #3b82f6;/);
    assert.doesNotMatch(css, /background-color: #ef4444;/);
  });
  test("empty rules → empty selector block", () => {
    assert.equal(toCSS([]), ".preview {}");
  });
  test("custom selector", () => {
    const result = parse("flex");
    assert.match(toCSS(result.rules, ".my-button"), /^\.my-button \{/);
  });
});
