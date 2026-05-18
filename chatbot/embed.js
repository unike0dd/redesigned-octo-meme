(function () {
  "use strict";

  const CONFIG = Object.freeze({
    chatbotName: "gabo io",
    endpoint: "/api/gabo-io-chat",
    historyKey: "gabo_io_chat_history_v1",
    blockedKey: "gabo_io_tinyml_blocked_v1",
    blockReasonKey: "gabo_io_tinyml_reason_v1",
    wikiCacheKey: "gabo_io_wiki_cache_v1",
    maxHistory: 60,
    maxLength: 256,
    maxRiskScore: 60
  });

  const RISK_PATTERNS = Object.freeze([/<\s*script/i, /javascript\s*:/i, /\bon[a-z]{3,}\s*=/i, /\beval\s*\(/i, /\bFunction\s*\(/i, /\b(select\s+\*\s+from|union\s+select|drop\s+table)\b/i]);

  function cleanText(value, maxLength) {
    return String(value || "").normalize("NFKC").replace(/[\u0000-\u001F\u007F]/g, " ").replace(/[<>`{}]/g, " ").replace(/\s+/g, " ").trim().slice(0, maxLength || CONFIG.maxLength);
  }

  function sanitizeMessage(value) {
    return cleanText(value).replace(/\bon[a-z]{3,}\s*=/gi, " ").replace(/\b(javascript|vbscript)\s*:/gi, " ").replace(/\b(eval|Function|XMLHttpRequest|fetch|import|export|require)\b/gi, " ").replace(/\s+/g, " ").trim();
  }

  function scanRisk(text) {
    const value = String(text || "");
    let score = 0;
    for (const pattern of RISK_PATTERNS) {
      pattern.lastIndex = 0;
      if (pattern.test(value)) score += 20;
    }
    return { score, blocked: score >= CONFIG.maxRiskScore };
  }

  function setBlocked(reason) {
    sessionStorage.setItem(CONFIG.blockedKey, "1");
    sessionStorage.setItem(CONFIG.blockReasonKey, reason || "policy_triggered");
  }
  function isBlocked() { return sessionStorage.getItem(CONFIG.blockedKey) === "1"; }

  function saveHistory(list) { localStorage.setItem(CONFIG.historyKey, JSON.stringify(list.slice(-CONFIG.maxHistory))); }
  function loadHistory() { try { return JSON.parse(localStorage.getItem(CONFIG.historyKey) || "[]"); } catch { return []; } }

  function saveWikiCache(wiki) { localStorage.setItem(CONFIG.wikiCacheKey, JSON.stringify(wiki || {})); }
  function loadWikiCache() { try { return JSON.parse(localStorage.getItem(CONFIG.wikiCacheKey) || "{}"); } catch { return {}; } }

  async function loadWikiIndex() {
    try {
      const res = await fetch("/chatbot/wiki-index.json", { cache: "no-store" });
      if (!res.ok) throw new Error("wiki_unavailable");
      const wiki = await res.json();
      saveWikiCache(wiki);
      return wiki;
    } catch {
      return loadWikiCache();
    }
  }

  function findWikiContext(wiki, language, query) {
    const entries = Array.isArray(wiki && wiki[language]) ? wiki[language] : [];
    const tokens = sanitizeMessage(query).toLowerCase().split(/\s+/).filter(Boolean);
    const scored = entries.map((e) => {
      const text = String(e.text || "").toLowerCase();
      const score = tokens.reduce((n, t) => n + (text.includes(t) ? 1 : 0), 0);
      return { key: e.key, text: e.text, score };
    }).filter((x) => x.score > 0).sort((a, b) => b.score - a.score).slice(0, 4);

    return scored.map((x) => `${x.key}: ${x.text}`).join("\n");
  }

  async function sha256(input) {
    const data = new TextEncoder().encode(String(input || ""));
    const hash = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  async function computeIntegrity(payload) {
    return sha256(JSON.stringify({ chatbot: CONFIG.chatbotName, message: sanitizeMessage(payload.message), lang: cleanText(payload.lang || "en", 8) }));
  }

  function buildWidget() {
    if (document.querySelector("#gabo-io-widget")) return;
    const root = document.createElement("div");
    root.id = "gabo-io-widget";
    root.innerHTML = `<style>#gabo-io-widget{position:fixed;right:16px;bottom:16px;z-index:9999;font-family:Segoe UI,Arial,sans-serif}#gabo-io-panel{width:320px;height:520px;background:#251541;border:2px solid #ff3bdb;border-radius:16px;box-shadow:0 8px 32px #0006;display:none;flex-direction:column;overflow:hidden}#gabo-io-panel.open{display:flex}#gabo-io-toggle{background:#ff3bdb;color:#fff;border:none;border-radius:999px;padding:10px 14px;font-weight:700;cursor:pointer}.h{padding:.8rem;background:linear-gradient(135deg,#00c4ff,#ff3bdb);color:#fff;text-align:center;font-weight:700}.l{flex:1;overflow:auto;padding:.8rem;background:#1b0e2d;color:#fff}.m{margin:.4rem 0;padding:.5rem .65rem;border-radius:12px;max-width:90%}.u{margin-left:auto;background:#00c4ff;color:#000}.b{background:#321b53}.f{padding:.6rem;background:#220f3a;display:flex;gap:.5rem}.f input{flex:1;background:#2b1347;color:#fff;border:1px solid #ffffff22;border-radius:8px;padding:.55rem}.f button{background:#ff3bdb;color:#fff;border:none;border-radius:8px;padding:.55rem .8rem}</style><button id="gabo-io-toggle" aria-label="Open gabo io">gabo io</button><div id="gabo-io-panel" role="dialog" aria-modal="false" aria-label="gabo io chatbot"><div class="h">gabo io</div><div id="gabo-io-log" class="l" aria-live="polite"></div><form id="gabo-io-form" class="f" autocomplete="off"><input id="gabo-io-honeypot" type="text" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-10000px;width:1px;height:1px;opacity:0" /><input id="gabo-io-input" maxlength="256" required placeholder="Type your message..." /><button type="submit">Send</button></form></div>`;
    document.body.appendChild(root);
  }

  async function boot() {
    buildWidget();
    const wiki = await loadWikiIndex();
    const language = (document.documentElement.getAttribute("lang") || "en").toLowerCase().startsWith("es") ? "es" : "en";
    const toggle = document.querySelector("#gabo-io-toggle");
    const panel = document.querySelector("#gabo-io-panel");
    const form = document.querySelector("#gabo-io-form");
    const input = document.querySelector("#gabo-io-input");
    const honey = document.querySelector("#gabo-io-honeypot");
    const log = document.querySelector("#gabo-io-log");

    function add(text, type) { const d = document.createElement("div"); d.className = "m " + (type === "user" ? "u" : "b"); d.textContent = sanitizeMessage(text); log.appendChild(d); log.scrollTop = log.scrollHeight; }
    loadHistory().forEach((x) => add(x.text, x.type));
    toggle.addEventListener("click", () => panel.classList.toggle("open"));

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (isBlocked()) return add("Session blocked by security policy.", "bot");
      if (String(honey.value || "").trim()) { setBlocked("honeypot_triggered"); return add("Bot activity detected. Session blocked.", "bot"); }

      const userText = sanitizeMessage(input.value);
      if (!userText) return;
      if (scanRisk(userText).blocked) return add("Message blocked by Tiny ML policy.", "bot");

      add(userText, "user");
      saveHistory([...loadHistory(), { type: "user", text: userText, ts: Date.now() }]);
      input.value = "";

      const wikiContext = findWikiContext(wiki, language, userText);
      const payload = { chatbot: CONFIG.chatbotName, message: userText, lang: language, wikiContext };
      const integrity = await computeIntegrity(payload);

      let botText;
      try {
        const res = await fetch(CONFIG.endpoint, { method: "POST", headers: { "Content-Type": "application/json", "X-Gabo-Integrity-SHA256": integrity }, body: JSON.stringify({ ...payload, integrity }) });
        const data = await res.json();
        botText = sanitizeMessage(data && data.reply ? data.reply : "No reply.");
      } catch {
        botText = sanitizeMessage("gabo io: Message received.");
      }

      if (scanRisk(botText).blocked) { setBlocked("unsafe_bot_output_detected"); botText = "Response blocked by Tiny ML policy."; }
      add(botText, "bot");
      saveHistory([...loadHistory(), { type: "bot", text: botText, ts: Date.now() }]);
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
