import fs from "fs";
import path from "path";

const root = process.cwd();
const i18nPath = path.join(root, "assets", "i18n.js");
const htmlFiles = [
  "index.html","about.html","services.html","learning.html","contact.html","careers.html",
  "services/logistics-operations.html","services/it-support.html","services/administrative-backoffice.html","services/customer-relations.html",
  "learning/logistics-operations.html","learning/it-support.html","learning/administrative-backoffice.html","learning/customer-relations.html",
  "legal/privacy-gdpr.html","legal/cookies.html","legal/terms.html"
];

function stripHtml(html) {
  return html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

const source = fs.readFileSync(i18nPath, "utf8");
const match = source.match(/const translations\s*=\s*(\{[\s\S]*?\n\s*\});/);
if (!match) throw new Error("Could not parse translations object");
const translations = Function(`"use strict"; return (${match[1]});`)();

const pages = htmlFiles.map((file) => {
  const html = fs.readFileSync(path.join(root, file), "utf8");
  return { path: file, digest: stripHtml(html).slice(0, 12000) };
});

const wiki = {
  id: "gabo-io-site-wiki",
  generatedAt: new Date().toISOString(),
  source: { translations: "assets/i18n.js", htmlFiles },
  languages: { en: translations.en || {}, es: translations.es || {} },
  pages
};

fs.writeFileSync(path.join(root, "chatbot", "wiki.json"), JSON.stringify(wiki, null, 2) + "\n");
console.log("Generated chatbot/wiki.json");
