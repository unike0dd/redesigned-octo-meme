(function () {
  "use strict";

  const CONFIG = Object.freeze({
    chatbotName: "gabo io",
    endpoint: "/api/gabo-io-chat",
    historyKey: "gabo_io_chat_history_v1",
    blockedKey: "gabo_io_tinyml_blocked_v1",
    blockReasonKey: "gabo_io_tinyml_reason_v1",
    wikiKey: "gabo_io_chat_wiki_v1",
    maxHistory: 60,
    maxLength: 256,
    maxRiskScore: 60,
    maxWikiCharsPerLang: 12000
  });

  const RISK_PATTERNS = Object.freeze([
    /<\s*script/i, /<\s*\/\s*script/i, /javascript\s*:/i, /vbscript\s*:/i,
    /\bon[a-z]{3,}\s*=/i, /\beval\s*\(/i, /\bnew\s+Function\b/i, /\bFunction\s*\(/i,
    /\bXMLHttpRequest\b/i, /\bfetch\s*\(/i, /\b(import|export|require)\b/i,
    /\b(select\s+\*\s+from|union\s+select|drop\s+table|insert\s+into|delete\s+from)\b/i,
    /\b(curl|wget|powershell|cmd\.exe|bash|rm\s+-rf|sudo|chmod)\b/i, /\.\.\//, /\$\{/, /\{\{/, /<%/
  ]);

  function cleanText(value, maxLength) {
    return String(value || "")
      .normalize("NFKC")
      .replace(/[\u0000-\u001F\u007F]/g, " ")
      .replace(/[<>`{}]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, maxLength || CONFIG.maxLength);
  }

  function sanitizeMessage(value) {
    return cleanText(value)
      .replace(/\bon[a-z]{3,}\s*=/gi, " ")
      .replace(/\b(javascript|vbscript)\s*:/gi, " ")
      .replace(/\b(eval|Function|XMLHttpRequest|fetch|import|export|require)\b/gi, " ")
      .replace(/\b(select\s+\*\s+from|union\s+select|drop\s+table|insert\s+into|delete\s+from)\b/gi, " ")
      .replace(/[;|&$]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function scanRisk(text) {
    const value = String(text || "");
    let score = 0;
    for (const pattern of RISK_PATTERNS) {
      pattern.lastIndex = 0;
      if (pattern.test(value)) score += 15;
    }
    if ((value.match(/https?:\/\//gi) || []).length > 3) score += 15;
    return { score, blocked: score >= CONFIG.maxRiskScore };
  }

  function setBlocked(reason) {
    sessionStorage.setItem(CONFIG.blockedKey, "1");
    sessionStorage.setItem(CONFIG.blockReasonKey, reason || "policy_triggered");
  }

  function isBlocked() { return sessionStorage.getItem(CONFIG.blockedKey) === "1"; }

  function saveHistory(list) {
    localStorage.setItem(CONFIG.historyKey, JSON.stringify(list.slice(-CONFIG.maxHistory)));
  }

  function loadHistory() {
    try { return JSON.parse(localStorage.getItem(CONFIG.historyKey) || "[]"); }
    catch { return []; }
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
    localStorage.setItem(CONFIG.wikiKey, JSON.stringify(wiki));
  }

  function collectReadableText() {
    const selectors = "h1,h2,h3,h4,p,li,a,button,label,summary,figcaption,td,th";
    const nodes = Array.from(document.querySelectorAll(selectors));
    const parts = [];
    for (const node of nodes) {
      if (!node || !node.textContent) continue;
      if (node.closest("script,style,noscript")) continue;
      const text = cleanText(node.textContent, 400);
      if (!text || text.length < 2) continue;
      parts.push(text);
    }
    return Array.from(new Set(parts)).join(" ").slice(0, CONFIG.maxWikiCharsPerLang);
  }

  async function hashText(input) {
    const data = new TextEncoder().encode(String(input || ""));
    const hash = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  async function buildWikiEntryForLanguage(lang) {
    const i18n = window.I18N;
    if (!i18n || typeof i18n.setLanguage !== "function") return { lang, text: collectReadableText() };

    const previous = i18n.currentLanguage;
    if (previous !== lang) i18n.setLanguage(lang);
    const text = collectReadableText();
    if (previous !== lang) i18n.setLanguage(previous);

    return { lang, text };
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
      title: cleanText(document.title, 200),
      updatedAt: new Date().toISOString(),
      signature,
      content: { en: en.text, es: es.text }
    };

    saveWiki(wiki);
  }

  async function sha256(input) {
    return hashText(input);
  }

  async function computeIntegrity(payload) {
    const canonical = JSON.stringify({
      chatbot: CONFIG.chatbotName,
      message: sanitizeMessage(payload.message),
      lang: cleanText(payload.lang || "en", 8)
    });
    return sha256(canonical);
  }

  function wikiSnippet(query) {
    const q = cleanText(query, 120).toLowerCase();
    if (!q) return "";
    const wiki = loadWiki();
    const lang = (window.I18N && window.I18N.currentLanguage) || "en";
    const hits = [];

    for (const page of Object.values(wiki.pages)) {
      const blob = cleanText((page.content && (page.content[lang] || page.content.en || "")) || "", 12000);
      if (!blob) continue;
      if (blob.toLowerCase().includes(q)) {
        hits.push({ path: page.path, text: blob });
      }
      if (hits.length >= 2) break;
    }

    if (!hits.length) return "";
    const summary = hits.map((h) => `${h.path}: ${h.text.slice(0, 260)}`).join(" | ");
    return cleanText(`Website Wiki Context: ${summary}`, 700);
  }

  function buildWidget() {
    if (document.querySelector("#gabo-io-widget")) return;
    const root = document.createElement("div");
    root.id = "gabo-io-widget";
    root.innerHTML = `
      <style>
        #gabo-io-widget{position:fixed;right:16px;bottom:16px;z-index:9999;font-family:Segoe UI,Arial,sans-serif}
        #gabo-io-panel{width:320px;height:520px;background:#251541;border:2px solid #ff3bdb;border-radius:16px;box-shadow:0 8px 32px #0006;display:none;flex-direction:column;overflow:hidden}
        #gabo-io-panel.open{display:flex}
        #gabo-io-toggle{background:#ff3bdb;color:#fff;border:none;border-radius:999px;padding:10px 14px;font-weight:700;cursor:pointer}
        .h{padding:.8rem;background:linear-gradient(135deg,#00c4ff,#ff3bdb);color:#fff;text-align:center;font-weight:700}
        .l{flex:1;overflow:auto;padding:.8rem;background:#1b0e2d;color:#fff}
        .m{margin:.4rem 0;padding:.5rem .65rem;border-radius:12px;max-width:90%}
        .u{margin-left:auto;background:#00c4ff;color:#000}.b{background:#321b53}
        .f{padding:.6rem;background:#220f3a;display:flex;gap:.5rem}.f input{flex:1;background:#2b1347;color:#fff;border:1px solid #ffffff22;border-radius:8px;padding:.55rem}.f button{background:#ff3bdb;color:#fff;border:none;border-radius:8px;padding:.55rem .8rem}
      </style>
      <button id="gabo-io-toggle" aria-label="Open gabo io">gabo io</button>
      <div id="gabo-io-panel" role="dialog" aria-modal="false" aria-label="gabo io chatbot">
        <div class="h">gabo io</div>
        <div id="gabo-io-log" class="l" aria-live="polite"></div>
        <form id="gabo-io-form" class="f" autocomplete="off">
          <input id="gabo-io-honeypot" type="text" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-10000px;width:1px;height:1px;opacity:0" />
          <input id="gabo-io-input" maxlength="256" required placeholder="Type your message..." />
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
    const form = document.querySelector("#gabo-io-form");
    const input = document.querySelector("#gabo-io-input");
    const honey = document.querySelector("#gabo-io-honeypot");
    const log = document.querySelector("#gabo-io-log");

    function add(text, type) {
      const d = document.createElement("div");
      d.className = "m " + (type === "user" ? "u" : "b");
      d.textContent = sanitizeMessage(text);
      log.appendChild(d);
      log.scrollTop = log.scrollHeight;
    }

    const history = loadHistory();
    history.forEach((x) => add(x.text, x.type));

    toggle.addEventListener("click", () => panel.classList.toggle("open"));

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (isBlocked()) { add("Session blocked by security policy.", "bot"); return; }
      if (String(honey.value || "").trim()) { setBlocked("honeypot_triggered"); add("Bot activity detected. Session blocked.", "bot"); return; }

      const userText = sanitizeMessage(input.value);
      if (!userText) return;
      if (scanRisk(userText).blocked) { add("Message blocked by Tiny ML policy.", "bot"); return; }

      add(userText, "user");
      const conversation = loadHistory();
      conversation.push({ type: "user", text: userText, ts: Date.now() });
      saveHistory(conversation);
      input.value = "";

      const payload = { chatbot: CONFIG.chatbotName, message: userText, lang: "en" };
      const wikiContext = wikiSnippet(userText);
      if (wikiContext) payload.wikiContext = wikiContext;
      const integrity = await computeIntegrity(payload);

      let botText = "";
      try {
        const res = await fetch(CONFIG.endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-Gabo-Integrity-SHA256": integrity },
          body: JSON.stringify({ ...payload, integrity })
        });
        const data = await res.json();
        botText = sanitizeMessage(data && data.reply ? data.reply : "No reply.");
      } catch {
        botText = sanitizeMessage(`${CONFIG.chatbotName}: I received your message securely.`);
      }

      if (scanRisk(botText).blocked) {
        setBlocked("unsafe_bot_output_detected");
        botText = "Response blocked by Tiny ML policy.";
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

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => { boot(); });
  else { boot(); }
})();
