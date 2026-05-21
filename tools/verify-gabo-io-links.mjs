#!/usr/bin/env node
import { readFileSync } from 'node:fs';

function read(path){return readFileSync(path,'utf8');}
function assert(cond,msg){if(!cond) throw new Error(msg);}

const embed = read('chatbot/embed.js');
const i18n = read('assets/i18n.js');
const contactEs = read('es/contact.html');
const careersEs = read('es/careers.html');
const contact = read('contact.html');
const careers = read('careers.html');

// repo -> gabo io
assert(embed.includes('chatEndpoint: "https://chatbot.gabo.services/api/chat"'),'Missing gabo io chat endpoint');
assert(embed.includes('clientName: "gabo-io"'),'Missing gabo io client name');
assert(embed.includes('repoSync: "io-pro-chatbot-v1"'),'Missing repo sync id');
assert(embed.includes('assetId: "redesigned-octo-meme-chatbot"'),'Missing asset id');

// gabo io UI action triggers
['toggle.addEventListener("click"','closeBtn.addEventListener("click"','backdrop.addEventListener("click"','form.addEventListener("submit"'].forEach((token)=>{
  assert(embed.includes(token),`Missing event trigger: ${token}`);
});

// ES pages load chatbot script and preserve forms
assert(contactEs.includes('../chatbot/embed.js?v=2026-05-21-fabfix'),'ES contact missing chatbot embed');
assert(careersEs.includes('../chatbot/embed.js?v=2026-05-21-fabfix'),'ES careers missing chatbot embed');
assert(contactEs.includes('id="contact-form"'),'ES contact form id missing');
assert(careersEs.includes('id="careers-application-form"'),'ES careers form id missing');

// EN pages still connected
assert(contact.includes('./chatbot/embed.js?v=2026-05-21-fabfix'),'EN contact missing chatbot embed');
assert(careers.includes('./chatbot/embed.js?v=2026-05-21-fabfix'),'EN careers missing chatbot embed');

// language route switching for localized pages
['"/contact.html": "/es/contact.html"','"/careers.html": "/es/careers.html"','"/es/contact.html": "/contact.html"','"/es/careers.html": "/careers.html"'].forEach((token)=>{
  assert(i18n.includes(token),`Missing i18n localized map token ${token}`);
});

console.log('gabo io link/reference/action/trigger checks passed');
