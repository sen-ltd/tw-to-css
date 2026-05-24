import { parse, toCSS } from "./parser.js";

const $ = (id) => document.getElementById(id);

const input = $("input");
const preview = $("preview");
const output = $("output");
const warn = $("warn");
const warnList = $("warnList");
const copyBtn = $("copyBtn");

function update() {
  const text = input.value;
  const { rules, unrecognised } = parse(text);
  const css = toCSS(rules, ".preview-target");
  output.textContent = css;

  // Apply the resolved declarations directly to the preview element so
  // even unsupported / mis-implemented utilities don't poison the preview
  // — we set each property explicitly via inline style.
  preview.removeAttribute("style");
  const seen = new Map();
  for (const r of rules) {
    for (const [prop, value] of r.declarations) {
      seen.set(prop, value);
    }
  }
  for (const [prop, value] of seen) {
    preview.style.setProperty(prop, value);
  }

  if (unrecognised.length > 0) {
    warn.hidden = false;
    warnList.innerHTML = unrecognised
      .map((c) => `<li><code>${escape(c)}</code></li>`)
      .join("");
  } else {
    warn.hidden = true;
  }
}

function escape(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function attach() {
  input.addEventListener("input", update);
  for (const btn of document.querySelectorAll(".preset")) {
    btn.addEventListener("click", () => {
      input.value = btn.dataset.classes;
      update();
    });
  }
  copyBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(output.textContent);
      copyBtn.textContent = "Copied!";
      setTimeout(() => (copyBtn.textContent = "Copy CSS"), 1200);
    } catch {
      copyBtn.textContent = "Copy failed";
    }
  });
}

attach();
update();
