(function () {
  const CHATBOT_CLIENT_NAME = "gabo-io";
  const CHATBOT_NAME = "gabo io";
  const CHATBOT_SYNC = "io-pro-chatbot-v1";
  const CHATBOT_ASSET_ID = "redesigned-octo-meme-chatbot";
  const CHATBOT_ENDPOINT = "https://chatbot.gabo.services/api/chat";
  const CHATBOT_CACHE_KEY = "gabo-io-chatbot-state";

  const chatbotUtils = window.GABO_IO_CHATBOT_UTILS || {};
  const sanitizeForWire = (value) =>
    chatbotUtils.runTinyMlSanitizer?.(value)?.cleaned || String(value || "");
  const sha256Hex = async (value) => (await chatbotUtils.sha256Hex?.(value)) || "";

  function initGaboIoChatbot() {
    if (document.querySelector(".gabo-chatbot-fab")) return;

    const labels = {
      en: { fab: "gabo io", title: "gabo io", subtitle: "", placeholder: "Type your message...", send: "Send", close: "Close", opening: "How can I help you today?", pending: "…", error: "Error: can't reach gabo io right now." },
      es: { fab: "gabo io", title: "gabo io", subtitle: "", placeholder: "Escribe tu mensaje...", send: "Enviar", close: "Cerrar", opening: "¿Cómo puedo ayudarte hoy?", pending: "…", error: "Error: no se puede conectar con gabo io ahora." },
    };

    const getLang = () => window.I18N?.currentLanguage || String(document.documentElement.lang || "en").split("-")[0];
    const getCopy = () => labels[getLang()] || labels.en;

    const fab = document.createElement("button");
    fab.type = "button";
    fab.className = "gabo-chatbot-fab";

    const overlay = document.createElement("div");
    overlay.className = "gabo-chatbot-overlay";
    overlay.innerHTML = `<section class="gabo-chatbot" role="dialog" aria-modal="true" aria-label="gabo io chatbot">
      <header class="gabo-chatbot-header"><div><h3></h3><small></small></div><button class="gabo-chatbot-close" type="button" aria-label="Close">✕</button></header>
      <div class="gabo-chatbot-log" aria-live="polite"></div>
      <form class="gabo-chatbot-form"><input class="gabo-chatbot-input" maxlength="256" required /><button class="gabo-chatbot-send" type="submit"></button></form>
    </section>`;
    document.body.append(fab, overlay);

    const closeBtn = overlay.querySelector(".gabo-chatbot-close");
    const log = overlay.querySelector(".gabo-chatbot-log");
    const form = overlay.querySelector(".gabo-chatbot-form");
    const input = overlay.querySelector(".gabo-chatbot-input");
    const send = overlay.querySelector(".gabo-chatbot-send");
    const title = overlay.querySelector("h3");
    const subtitle = overlay.querySelector("small");

    function addMsg(text, type) { const div = document.createElement("div"); div.className = `gabo-msg ${type}`; div.textContent = text; div.dataset.msgType = type; log.appendChild(div); log.scrollTop = log.scrollHeight; return div; }
    let chatState = { isOpen: false, lang: getLang(), messages: [], draft: "" };
    function persist(nextState = {}) { chatState = { ...chatState, ...nextState, lang: getLang() }; try { localStorage.setItem(CHATBOT_CACHE_KEY, JSON.stringify(chatState)); } catch (_) {} }
    function applyFabVisibility(isOpen) { fab.hidden = isOpen; fab.setAttribute("aria-hidden", String(isOpen)); }
    function open() { overlay.classList.add("open"); applyFabVisibility(true); input.focus(); persist({ isOpen: true }); }
    function close() { overlay.classList.remove("open"); applyFabVisibility(false); persist({ isOpen: false, draft: input.value }); }

    function applyLanguage() {
      const copy = getCopy();
      fab.textContent = copy.fab;
      title.textContent = copy.title;
      subtitle.textContent = copy.subtitle;
      input.placeholder = copy.placeholder;
      send.textContent = copy.send;
      closeBtn.setAttribute("aria-label", copy.close);
      if (!log.childElementCount) addMsg(copy.opening, "bot");
      persist({ isOpen: overlay.classList.contains("open") });
    }

    async function sendMessage(message) {
      const cleanedMessage = sanitizeForWire(message).trim();
      if (!cleanedMessage) return;
      addMsg(cleanedMessage, "user");
      input.value = "";
      const pending = addMsg(getCopy().pending, "bot");
      send.disabled = true; input.disabled = true;
      try {
        const sessionId = crypto.randomUUID ? crypto.randomUUID() : String(Date.now());
        const wikiContext = "chatbot-i18n-CX-LeadGen";
        const lang = getLang().startsWith("es") ? "es" : "en";
        const payload = {
          chatbot: CHATBOT_NAME,
          message: cleanedMessage,
          lang,
          wikiContext,
          page: location.pathname,
          sessionId,
          honeypot: "",
          leadContext: {
            source: "website",
            client: CHATBOT_CLIENT_NAME,
            intent: "general",
            pageTitle: document.title,
            referrer: document.referrer
          }
        };
        const sanitizedPayload = JSON.parse(JSON.stringify(payload, (_, value) => typeof value === "string" ? sanitizeForWire(value) : value));
        const canonicalIntegrityPayload = {
          chatbot: sanitizedPayload.chatbot,
          message: sanitizedPayload.message,
          lang: sanitizedPayload.lang,
          wikiContext: sanitizedPayload.wikiContext,
          sessionId: sanitizedPayload.sessionId
        };
        const sha256 = await sha256Hex(JSON.stringify(canonicalIntegrityPayload));

        console.log("[gabo io] sending POST", sanitizedPayload);
        const res = await fetch(CHATBOT_ENDPOINT, {
          method: "POST",
          mode: "cors",
          credentials: "omit",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "X-Gabo-Client": CHATBOT_CLIENT_NAME,
            "X-Gabo-Repo-Sync": CHATBOT_SYNC,
            "X-Gabo-Session-Id": sanitizedPayload.sessionId,
            "X-Gabo-Integrity-SHA256": sha256,
            "X-Ops-Asset-Id": CHATBOT_ASSET_ID,
          },
          body: JSON.stringify(sanitizedPayload),
        });
        if (!res.ok) throw new Error("request-failed");
        const data = await res.json();
        pending.textContent = data?.reply || "No reply.";
      } catch (_) { pending.textContent = getCopy().error; }
      finally {
        const messages = Array.from(log.querySelectorAll(".gabo-msg")).map((node) => ({ type: node.dataset.msgType || "bot", text: node.textContent || "" }));
        persist({ messages, draft: input.value });
        send.disabled = false; input.disabled = false; input.focus();
      }
    }

    fab.addEventListener("click", open);
    closeBtn.addEventListener("click", close);
    overlay.addEventListener("click", (event) => { if (event.target === overlay) close(); });
    window.addEventListener("keydown", (event) => { if (event.key === "Escape" && overlay.classList.contains("open")) close(); });
    form.addEventListener("submit", (event) => { event.preventDefault(); sendMessage(input.value); });
    input.addEventListener("input", () => persist({ draft: input.value }));
    window.addEventListener("language:changed", applyLanguage);

    applyLanguage();
    try {
      const cached = JSON.parse(localStorage.getItem(CHATBOT_CACHE_KEY) || "{}");
      if (cached && typeof cached === "object") {
        chatState = { ...chatState, ...cached, messages: Array.isArray(cached.messages) ? cached.messages : [], draft: typeof cached.draft === "string" ? cached.draft : "" };
      }
      if (chatState.messages.length) {
        log.innerHTML = "";
        chatState.messages.forEach((message) => { if (message && typeof message.text === "string") addMsg(message.text, message.type === "user" ? "user" : "bot"); });
      }
      input.value = chatState.draft || "";
      if (chatState.isOpen) open(); else applyFabVisibility(false);
    } catch (_) {}
  }

  window.initGaboIoChatbot = initGaboIoChatbot;
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initGaboIoChatbot);
  else initGaboIoChatbot();
})();
