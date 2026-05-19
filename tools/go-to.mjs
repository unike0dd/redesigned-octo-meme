import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const i18nPath = path.join(root, "assets", "i18n.js");
const wikiPath = path.join(root, "chatbot", "wiki.json");
const wikiIndexPath = path.join(root, "chatbot", "wiki-index.json");

const htmlFiles = [
  "index.html", "about.html", "services.html", "learning.html", "contact.html", "careers.html",
  "services/logistics-operations.html", "services/it-support.html", "services/administrative-backoffice.html", "services/customer-relations.html",
  "learning/logistics-operations.html", "learning/it-support.html", "learning/administrative-backoffice.html", "learning/customer-relations.html",
  "legal/privacy-gdpr.html", "legal/cookies.html", "legal/terms.html"
];

function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseTranslations(source) {
  const match = source.match(/const translations\s*=\s*(\{[\s\S]*?\n\s*\});/);
  if (!match) throw new Error("Could not parse translations object in assets/i18n.js");
  return Function(`"use strict"; return (${match[1]});`)();
}

function toEntries(langObj) {
  return Object.entries(langObj || {})
    .filter(([, value]) => typeof value === "string")
    .map(([key, value]) => ({
      key,
      text: value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
    }))
    .filter((entry) => entry.text.length > 0);
}

function buildWiki(translations) {
  const pages = htmlFiles.map((file) => {
    const html = fs.readFileSync(path.join(root, file), "utf8");
    return { path: file, digest: stripHtml(html).slice(0, 12000) };
  });

  return {
    id: "gabo-io-site-wiki",
    generatedAt: new Date().toISOString(),
    source: { translations: "assets/i18n.js", htmlFiles },
    languages: { en: translations.en || {}, es: translations.es || {} },
    pages
  };
}

function buildWikiIndex(translations) {
  return {
    generatedAt: new Date().toISOString(),
    source: "assets/i18n.js",
    chatbot: "gabo io",
    en: toEntries(translations.en || {}),
    es: toEntries(translations.es || {})
  };
}

const source = fs.readFileSync(i18nPath, "utf8");
const translations = parseTranslations(source);
const wiki = buildWiki(translations);
const wikiIndex = buildWikiIndex(translations);

fs.writeFileSync(wikiPath, JSON.stringify(wiki, null, 2) + "\n");
fs.writeFileSync(wikiIndexPath, JSON.stringify(wikiIndex, null, 2) + "\n");

console.log(`Generated chatbot/wiki.json (${Object.keys(wiki.languages.en).length} EN keys, ${Object.keys(wiki.languages.es).length} ES keys)`);
console.log(`Generated chatbot/wiki-index.json (EN=${wikiIndex.en.length} ES=${wikiIndex.es.length})`);
