(function () {
  "use strict";

  const EMBED_SCRIPT_URL =
    document.currentScript && document.currentScript.src
      ? document.currentScript.src
      : new URL("./chatbot/embed.js", window.location.href).href;

  function embedAssetUrl(fileName) {
    return new URL(fileName, EMBED_SCRIPT_URL).href;
  }

  const CONFIG = Object.freeze({
    chatbotName: "gabo io",
    endpoint: "/api/gabo-io-chat",
    fallbackEndpoint: "https://chatbot.gabo.services/api/chat",
    clientName: "gabo-io",
    repoSync: "io-pro-chatbot-v1",
    assetId: "redesigned-octo-meme-chatbot",
    historyKey: "gabo_io_chat_history_v1",
    blockedKey: "gabo_io_security_blocked_v1",
    blockReasonKey: "gabo_io_security_reason_v1",
    wikiKey: "gabo_io_chat_wiki_v1",
    sessionKey: "gabo_io_session_id",
    maxHistory: 60,
    maxMessageChars: 1200,
    maxInputChars: 256,
    maxRiskScore: 60,
    maxWikiCharsPerLang: 8000
  });

  const REQUIRED_PUBLIC_HEADERS = Object.freeze({
    "Content-Type": "application/json",
    "Accept": "application/json",
    "X-Gabo-Client": CONFIG.clientName,
    "X-Gabo-Repo-Sync": CONFIG.repoSync,
    "X-Ops-Asset-Id": CONFIG.assetId
  });

  const LEAD_INTENT_PATTERNS = Object.freeze([
    /\b(price|pricing|cost|quote|plan|plans|budget)\b/i,
    /\b(book|booking|schedule|appointment|consult|demo|call)\b/i,
    /\b(buy|purchase|order|subscribe|get started|start now)\b/i,
    /\b(contact|email|phone|sales|talk to (a )?human|representative)\b/i
  ]);

  const RISK_PATTERNS = Object.freeze([
    /<\s*script/i,
    /<\s*\/\s*script/i,
    /<\s*\/?\s*(iframe|object|embed|applet|meta|link|base|svg|math|template|form|input|button)\b/i,
    /javascript\s*:/i,
    /vbscript\s*:/i,
    /data\s*:/i,
    /\bon[a-z]{3,}\s*=/i,
    /\beval\s*\(/i,
    /\bnew\s+Function\b/i,
    /\bFunction\s*\(/i,
    /\bXMLHttpRequest\b/i,
    /\bfetch\s*\(/i,
    /\b(import|export|require|function|class|const|let|var|return|await|async|def|lambda)\b/i,
    /```[\s\S]*?```|~~~[\s\S]*?~~~/,
    /`[^`\n]{2,}`/,
    /\b(select\s+\*\s+from|union\s+select|drop\s+table|insert\s+into|delete\s+from|truncate\s+table|or\s+1\s*=\s*1)\b/i,
    /\b(curl|wget|powershell|cmd\.exe|bash|sh|rm\s+-rf|sudo|chmod|node\s+-e|python\s+-c)\b/i,
    /\.\.\//,
    /\$\{/,
    /\{\{/,
    /<%/
  ]);

  function toText(value) {
    return value == null ? "" : String(value);
  }

  function cleanText(value, maxLength) {
    return toText(value)
      .normalize("NFKC")
      .replace(/[\u0000-\u001F\u007F]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, maxLength || CONFIG.maxMessageChars);
  }

  function sanitize(value, maxLength) {
    return toText(value)
      .normalize("NFKC")
      .replace(/```[\s\S]*?```|~~~[\s\S]*?~~~/g, " ")
      .replace(/`[^`\n]{1,500}`/g, " ")
      .replace(/<\s*(script|style|iframe|object|embed|applet|svg|math|template)[\s\S]*?<\s*\/\s*\1\s*>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\bon[a-z]{3,}\s*=\s*("[^"]*"|'[^']*'|[^\s>]*)/gi, " ")
      .replace(/\b(javascript|vbscript|data)\s*:[^\s,;)]*/gi, " ")
      .replace(/\b(eval|Function|setTimeout|setInterval|XMLHttpRequest|fetch|import|export|require)\b/gi, " ")
      .replace(/\b(function|class|const|let|var|return|await|async|def|lambda)\b/gi, " ")
      .replace(/\b(union\s+select|drop\s+table|insert\s+into|delete\s+from|truncate\s+table|or\s+1\s*=\s*1)\b/gi, " ")
      .replace(/\b(curl|wget|powershell|cmd\.exe|bash|sudo|chmod|rm\s+-rf|node\s+-e|python\s+-c)\b/gi, " ")
      .replace(/(\.\.\/|\$\{|\{\{|<%|%>)/g, " ")
      .replace(/[<>`{}()[\];|\\]/g, " ")
      .replace(/[\u0000-\u001F\u007F]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, maxLength || CONFIG.maxMessageChars);
  }

  function scanRisk(text) {
    const value = toText(text);
    let score = 0;

    for (const pattern of RISK_PATTERNS) {
      pattern.lastIndex = 0;
      if (pattern.test(value)) score += 15;
    }

    if ((value.match(/https?:\/\//gi) || []).length > 3) score += 15;

    const punctuation = value.replace(/[\w\s.,'"@:+/#?!-]/g, "").length;
    const density = value.length ? punctuation / value.length : 0;
    if (value.length > 24 && density > 0.22) score += 10;

    return {
      score,
      blocked: score >= CONFIG.maxRiskScore
    };
  }

  function detectLeadSignals(text) {
    const value = cleanText(text || "", 300).toLowerCase();
    if (!value) return { score: 0, intent: "general" };

    let score = 0;
    for (const pattern of LEAD_INTENT_PATTERNS) {
      if (pattern.test(value)) score += 1;
    }

    return {
      score,
      intent: score >= 2 ? "high" : score === 1 ? "medium" : "general"
    };
  }

  function setBlocked(reason) {
    sessionStorage.setItem(CONFIG.blockedKey, "1");
    sessionStorage.setItem(CONFIG.blockReasonKey, reason || "policy_triggered");
  }

  function isBlocked() {
    return sessionStorage.getItem(CONFIG.blockedKey) === "1";
  }

  function saveHistory(list) {
    try {
      localStorage.setItem(CONFIG.historyKey, JSON.stringify(list.slice(-CONFIG.maxHistory)));
    } catch {}
  }

  function loadHistory() {
    try {
      const value = JSON.parse(localStorage.getItem(CONFIG.historyKey) || "[]");
      return Array.isArray(value) ? value : [];
    } catch {
      return [];
    }
  }

  function loadWiki() {
    try {
      const raw = JSON.parse(localStorage.getItem(CONFIG.wikiKey) || '{"pages":{}}');
      if (!raw.pages || typeof raw.pages !== "object") raw.pages = {};
      return raw;
    } catch {
      return { pages: {} };
    }
  }

  function saveWiki(wiki) {
    try {
      localStorage.setItem(CONFIG.wikiKey, JSON.stringify(wiki));
    } catch {}
  }

  function collectReadableText() {
    const selectors = "h1,h2,h3,h4,p,li,a,button,label,summary,figcaption,td,th";
    const nodes = Array.from(document.querySelectorAll(selectors));
    const parts = [];

    for (const node of nodes) {
      if (!node || !node.textContent) continue;
      if (node.closest("script,style,noscript")) continue;

      const text = sanitize(node.textContent, 400);
      if (!text || text.length < 2) continue;
      parts.push(text);
    }

    return Array.from(new Set(parts)).join(" ").slice(0, CONFIG.maxWikiCharsPerLang);
  }

  async function hashText(input) {
    const data = new TextEncoder().encode(toText(input));
    const hash = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hash))
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
  }

  async function buildWikiEntryForLanguage(lang) {
    const i18n = window.I18N;

    if (!i18n || typeof i18n.setLanguage !== "function") {
      return {
        lang,
        text: collectReadableText()
      };
    }

    const previous = i18n.currentLanguage;
    if (previous !== lang) i18n.setLanguage(lang);
    const text = collectReadableText();
    if (previous !== lang) i18n.setLanguage(previous);

    return {
      lang,
      text
    };
  }

  async function syncPageToWiki() {
    const en = await buildWikiEntryForLanguage("en");
    const es = await buildWikiEntryForLanguage("es");
    const signature = await hashText(`${location.pathname}|${en.text}|${es.text}`);

    const wiki = loadWiki();
    const existing = wiki.pages[location.pathname];

    if (existing && existing.signature === signature) return;

    wiki.pages[location.pathname] = {
      path: location.pathname,
      title: sanitize(document.title, 200),
      updatedAt: new Date().toISOString(),
      signature,
      content: {
        en: en.text,
        es: es.text
      }
    };

    saveWiki(wiki);
  }

  function wikiSnippet(query) {
    const q = sanitize(query, 120).toLowerCase();
    if (!q) return "";

    const wiki = loadWiki();
    const lang = (window.I18N && window.I18N.currentLanguage) || "en";
    const hits = [];

    for (const page of Object.values(wiki.pages || {})) {
      const blob = sanitize((page.content && (page.content[lang] || page.content.en || "")) || "", 12000);
      if (!blob) continue;

      if (blob.toLowerCase().includes(q)) {
        hits.push({ path: page.path, text: blob });
      }

      if (hits.length >= 2) break;
    }

    if (!hits.length) return "";

    const summary = hits.map((hit) => `${hit.path}: ${hit.text.slice(0, 260)}`).join(" | ");
    return sanitize(`Website Wiki Context: ${summary}`, 700);
  }

  function getSessionId() {
    const existing = sanitize(sessionStorage.getItem(CONFIG.sessionKey) || "", 160);
    if (existing) return existing;

    const created = crypto.randomUUID();
    sessionStorage.setItem(CONFIG.sessionKey, created);
    return created;
  }

  function canonicalPayload(payload) {
    return JSON.stringify({
      chatbot: CONFIG.chatbotName,
      message: sanitize(payload.message, CONFIG.maxMessageChars),
      lang: sanitize(payload.lang || "en", 8),
      wikiContext: sanitize(payload.wikiContext || "", CONFIG.maxWikiCharsPerLang),
      sessionId: sanitize(payload.sessionId || "", 160)
    });
  }

  async function computeIntegrity(payload) {
    return hashText(canonicalPayload(payload));
  }

  function buildRequestHeaders(integrity, sessionId) {
    return {
      ...REQUIRED_PUBLIC_HEADERS,
      "X-Gabo-Integrity-SHA256": integrity,
      "X-Gabo-Session-Id": sessionId
    };
  }

  function buildPayload(userText, honey) {
    const lang = window.I18N && window.I18N.currentLanguage === "es" ? "es" : "en";
    const sessionId = getSessionId();
    const message = sanitize(userText, CONFIG.maxMessageChars);
    const wikiContext = wikiSnippet(message);
    const leadSignals = detectLeadSignals(message);

    return {
      chatbot: CONFIG.chatbotName,
      message,
      lang,
      wikiContext,
      page: sanitize(location.pathname, 300),
      sessionId,
      honeypot: sanitize(honey && honey.value ? honey.value : "", 300),
      leadContext: {
        intent: sanitize(leadSignals.intent, 60),
        score: leadSignals.score,
        pageTitle: sanitize(document.title, 200),
        referrer: sanitize(document.referrer || "", 300)
      }
    };
  }

  async function sendToGateway(payload) {
    const integrity = await computeIntegrity(payload);
    const body = {
      ...payload,
      integrity
    };

    const endpoints = [CONFIG.endpoint, CONFIG.fallbackEndpoint].filter(Boolean);
    let lastError = null;

    for (const endpoint of endpoints) {
      const response = await fetch(endpoint, {
        method: "POST",
        mode: "cors",
        credentials: "omit",
        referrerPolicy: "no-referrer",
        cache: "no-store",
        headers: buildRequestHeaders(integrity, payload.sessionId),
        body: JSON.stringify(body)
      });

      let data = {};
      try {
        data = await response.json();
      } catch {}

      if (response.ok && data && data.ok === true) {
        return sanitize(data.reply || "No reply.", 1600);
      }

      lastError = new Error(`chatbot_gateway_rejected:${endpoint}:${response.status}`);
    }

    throw lastError || new Error("chatbot_gateway_rejected");
  }

  function lookupWikiAnswer(wiki, query) {
    const q = sanitize(query, 120).toLowerCase();
    if (!q || !wiki || !wiki.pages) return "";

    const lang = window.I18N && window.I18N.currentLanguage ? window.I18N.currentLanguage : "en";

    for (const page of Object.values(wiki.pages)) {
      const text = sanitize((page.content && (page.content[lang] || page.content.en || "")) || "", 12000);
      if (!text) continue;

      const index = text.toLowerCase().indexOf(q);
      if (index < 0) continue;

      const start = Math.max(index - 120, 0);
      const end = Math.min(index + 360, text.length);
      return `${CONFIG.chatbotName}: ${text.slice(start, end)}`;
    }

    return "";
  }

  function ensureWidgetStylesheet() {
    if (document.querySelector('link[data-gabo-embed-css="1"]')) return;

    const cssLink = document.createElement("link");
    cssLink.rel = "stylesheet";
    cssLink.href = embedAssetUrl("embed.css");
    cssLink.setAttribute("data-gabo-embed-css", "1");
    document.head.appendChild(cssLink);
  }

  function buildWidget() {
    if (document.querySelector("#gabo-io-widget")) return;

    ensureWidgetStylesheet();

    const root = document.createElement("div");
    root.id = "gabo-io-widget";
    root.innerHTML = `
      <button id="gabo-io-toggle" aria-label="Open gabo io chatbot"><span class="inner"><span class="label">gabo io</span></span></button>
      <div id="gabo-io-backdrop" aria-hidden="true"></div>
      <div id="gabo-io-panel" role="dialog" aria-modal="true" aria-label="gabo io chatbot">
        <div class="h"><span>gabo io</span><button id="gabo-io-close" type="button" aria-label="Close chatbot">✕</button></div>
        <div id="gabo-io-log" class="l" aria-live="polite"></div>
        <form id="gabo-io-form" class="f" autocomplete="off">
          <input id="gabo-io-honeypot" type="text" tabindex="-1" autocomplete="off" aria-hidden="true" />
          <input id="gabo-io-input" maxlength="${CONFIG.maxInputChars}" required placeholder="Type your message..." />
          <button type="submit">Send</button>
        </form>
      </div>`;

    document.body.appendChild(root);
  }

  async function boot() {
    buildWidget();
    await syncPageToWiki();

    const toggle = document.querySelector("#gabo-io-toggle");
    const panel = document.querySelector("#gabo-io-panel");
    const backdrop = document.querySelector("#gabo-io-backdrop");
    const closeBtn = document.querySelector("#gabo-io-close");
    const form = document.querySelector("#gabo-io-form");
    const input = document.querySelector("#gabo-io-input");
    const honey = document.querySelector("#gabo-io-honeypot");
    const log = document.querySelector("#gabo-io-log");

    function add(text, type) {
      const node = document.createElement("div");
      node.className = "m " + (type === "user" ? "u" : "b");
      node.textContent = sanitize(text, 1600);
      log.appendChild(node);
      log.scrollTop = log.scrollHeight;
    }

    const wiki = loadWiki();
    const history = loadHistory();
    history.forEach((item) => add(item.text, item.type));

    function openPanel() {
      panel.classList.add("open");
      backdrop.classList.add("open");
      toggle.setAttribute("aria-expanded", "true");
      input.focus();
    }

    function closePanel() {
      panel.classList.remove("open");
      backdrop.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.focus();
    }

    toggle.setAttribute("aria-expanded", "false");
    toggle.addEventListener("click", () => (panel.classList.contains("open") ? closePanel() : openPanel()));
    closeBtn.addEventListener("click", closePanel);
    backdrop.addEventListener("click", closePanel);
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && panel.classList.contains("open")) closePanel();
    });

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      if (isBlocked()) {
        add("Session blocked by security policy.", "bot");
        return;
      }

      if (toText(honey.value).trim()) {
        setBlocked("honeypot_triggered");
        add("Bot activity detected. Session blocked.", "bot");
        return;
      }

      const rawUserText = toText(input.value);
      const rawUserRisk = scanRisk(rawUserText);

      if (rawUserRisk.blocked) {
        add("Message blocked by security policy.", "bot");
        return;
      }

      const userText = sanitize(rawUserText, CONFIG.maxMessageChars);
      if (!userText) return;

      add(userText, "user");

      const conversation = loadHistory();
      conversation.push({ type: "user", text: userText, ts: Date.now() });
      saveHistory(conversation);

      input.value = "";

      let botText = "";

      try {
        const payload = buildPayload(userText, honey);
        botText = await sendToGateway(payload);
      } catch (error) {
        console.warn("[gabo io] chatbot gateway request failed", error && error.message ? error.message : error);
        botText = lookupWikiAnswer(wiki, userText) || `${CONFIG.chatbotName}: I received your message securely.`;
      }

      const botRisk = scanRisk(botText);

      if (botRisk.blocked) {
        setBlocked("unsafe_bot_output_detected");
        botText = "Response blocked by security policy.";
      } else {
        botText = sanitize(botText, 1600);
      }

      add(botText, "bot");

      const updated = loadHistory();
      updated.push({ type: "bot", text: botText, ts: Date.now() });
      saveHistory(updated);
    });

    const observer = new MutationObserver(async () => {
      observer.disconnect();
      await syncPageToWiki();
      observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    });

    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      boot();
    });
  } else {
    boot();
  }
})();
