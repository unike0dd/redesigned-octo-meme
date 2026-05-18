import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const repoRoot = process.cwd();
const i18nPath = path.join(repoRoot, "assets", "i18n.js");
const src = fs.readFileSync(i18nPath, "utf8");

const sandbox = {
  window: {},
  document: {
    readyState: "loading",
    addEventListener() {},
    documentElement: { setAttribute() {}, dataset: { pageLanguage: "en" } },
    querySelectorAll() { return []; },
    querySelector() { return null; }
  },
  localStorage: { getItem() { return null; }, setItem() {} },
  CustomEvent: class {},
  dispatchEvent() {}
};
vm.createContext(sandbox);
vm.runInContext(src, sandbox, { filename: "assets/i18n.js" });

const db = sandbox.window.I18N_DB || {};
const en = db.en || {};
const es = db.es || {};

const toEntries = (langObj) =>
  Object.entries(langObj)
    .filter(([, v]) => typeof v === "string")
    .map(([key, value]) => ({ key, text: value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() }))
    .filter((x) => x.text.length > 0);

const output = {
  generatedAt: new Date().toISOString(),
  source: "assets/i18n.js",
  chatbot: "gabo io",
  en: toEntries(en),
  es: toEntries(es)
};

fs.writeFileSync(path.join(repoRoot, "chatbot", "wiki-index.json"), JSON.stringify(output, null, 2));
console.log(`Generated chatbot/wiki-index.json with EN=${output.en.length} ES=${output.es.length}`);
