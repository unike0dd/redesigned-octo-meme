#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const I18N_PATH = path.join(ROOT, 'assets', 'i18n.js');
const OUT_PATH = path.join(ROOT, 'chatbot', 'wiki.json');

function extractTranslationsObject(source) {
  const marker = 'const translations =';
  const start = source.indexOf(marker);
  if (start === -1) throw new Error('translations object not found');
  const open = source.indexOf('{', start);
  let depth = 0;
  let end = -1;
  for (let i = open; i < source.length; i++) {
    const ch = source[i];
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) { end = i; break; }
    }
  }
  if (end === -1) throw new Error('could not parse translations object');
  return source.slice(open, end + 1);
}

function parseTranslations(objLiteral) {
  // trusted repo source
  return Function('"use strict";return (' + objLiteral + ');')();
}

function buildWiki(translations) {
  const pages = {};
  for (const lang of ['en', 'es']) {
    const dict = translations[lang] || {};
    pages[lang] = Object.entries(dict)
      .filter(([, v]) => typeof v === 'string')
      .map(([key, value]) => ({ key, text: value.replace(/<br\s*\/?\s*>/gi, ' ').trim() }));
  }

  return {
    version: new Date().toISOString(),
    source: 'assets/i18n.js',
    languages: ['en', 'es'],
    entries: pages
  };
}

const source = fs.readFileSync(I18N_PATH, 'utf8');
const objLiteral = extractTranslationsObject(source);
const translations = parseTranslations(objLiteral);
const wiki = buildWiki(translations);
fs.writeFileSync(OUT_PATH, JSON.stringify(wiki, null, 2) + '\n');
console.log('Generated', path.relative(ROOT, OUT_PATH));
