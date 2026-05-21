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
    chatEndpoint: "https://chatbot.gabo.services/api/chat",
    ttsEndpoint: "https://chatbot.gabo.services/api/tts",
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


  const GABO_PUBLIC_SERVICES_CONTEXT = Object.freeze({
    en: {
      businessName: "Gabo Services",
      assistantName: "gabo io",
      creatorName: "Gabriel Anangonó",
      creatorDisplay: "gabo io was created by Gabriel Anangonó for Gabo Services.",
      rule: "Only answer about the services and information listed on this public website."
    },
    es: {
      businessName: "Gabo Services",
      assistantName: "gabo io",
      creatorName: "Gabriel Anangonó",
      creatorDisplay: "gabo io fue creado por Gabriel Anangonó para Gabo Services.",
      rule: "Responde únicamente sobre los servicios y la información pública listada en este sitio web."
    }
  });

  const REQUIRED_PUBLIC_HEADERS = Object.freeze({
    "Content-Type": "application/json",
    "Accept": "application/json",
    "X-Gabo-Client": CONFIG.clientName,
    "X-Gabo-Repo-Sync": CONFIG.repoSync,
    "X-Ops-Asset-Id": CONFIG.assetId
  });

  const GABO_PUBLIC_SERVICES_CONTEXT = Object.freeze({
    en: Object.freeze({
      businessName: "Gabriel Services",
      assistantName: "gabo io",
      rule: "Only use the public website context. Do not invent services or capabilities. If a visitor asks about something not shown on the website, politely say that gabo io can only advise about services listed on this website and recommend contacting Gabriel Services for confirmation.",
      responseGuidance: [
        "Answer in English.",
        "Use only services listed on this public website.",
        "Keep answers concise, professional, and friendly.",
        "Ask one helpful lead question when appropriate.",
        "Do not promise pricing, timelines, guarantees, availability, integrations, certifications, or outcomes not shown on the website."
      ],
      services: [
        {
          title: "Logistics Operations",
          summary: "Operational support for dispatch coordination, shipment tracking, and continuity across logistics workflows.",
          visitorNeed: "Keep logistics activity organized, visible, and moving with reliable follow-up.",
          idealVisitor: "Businesses that need day-to-day logistics execution support.",
          commonQuestion: "Can you help with dispatch and shipment follow-ups?",
          leadQuestion: "Which logistics workflow do you need help with right now?",
          nextStep: "Use the contact page to share your logistics support request."
        },
        {
          title: "Administrative Back Office",
          summary: "Operational support for documentation, scheduling, reporting, communication flow, and business process consistency.",
          visitorNeed: "Reduce internal admin friction and keep operational processes consistent.",
          idealVisitor: "Teams that need structured administrative execution support.",
          commonQuestion: "Can you help with ongoing admin coordination and documentation?",
          leadQuestion: "Which back-office process would you like to improve first?",
          nextStep: "Use the contact page to describe your administrative support needs."
        },
        {
          title: "Customer Relations Operations",
          summary: "Support for customer communications, ticket follow-up, issue resolution workflows, and satisfaction follow-ups.",
          visitorNeed: "Improve customer response flow and service consistency.",
          idealVisitor: "Teams that need help managing customer communication and follow-up operations.",
          commonQuestion: "Can you support customer follow-up and resolution tracking?",
          leadQuestion: "What type of customer support workflow are you looking to strengthen?",
          nextStep: "Use the contact page to share your customer operations goals."
        },
        {
          title: "IT Support (Level I and Level II)",
          summary: "Structured day-to-day support including intake, troubleshooting, escalation coordination, and post-escalation resolution support.",
          visitorNeed: "Maintain dependable user-facing IT continuity and issue handling.",
          idealVisitor: "Organizations that need ongoing operational IT support coverage.",
          commonQuestion: "Can you assist with ticket triage and technical support workflows?",
          leadQuestion: "Is your request related to Level I support, Level II support, or both?",
          nextStep: "Use the contact page to explain the IT support coverage you need."
        }
      ],
      fallback: "I can help with the services listed on this website. For requests outside this website content, please contact Gabriel Services for confirmation."
    }),
    es: Object.freeze({
      businessName: "Gabriel Services",
      assistantName: "gabo io",
      rule: "Usa únicamente el contexto público del sitio web. No inventes servicios ni capacidades. Si el visitante pregunta por algo que no aparece en el sitio, indica amablemente que gabo io solo puede orientar sobre los servicios listados en este sitio web y recomienda contactar a Gabriel Services para confirmar.",
      responseGuidance: [
        "Responde en español.",
        "Usa solo los servicios listados en este sitio web público.",
        "Mantén respuestas concisas, profesionales y amables.",
        "Haz una sola pregunta útil de calificación cuando corresponda.",
        "No prometas precios, tiempos, garantías, disponibilidad, integraciones, certificaciones ni resultados que no estén publicados en el sitio web."
      ],
      services: [
        {
          title: "Operaciones Logísticas",
          summary: "Soporte operativo para coordinación de despacho, seguimiento de envíos y continuidad en flujos logísticos.",
          visitorNeed: "Mantener la operación logística organizada, visible y en movimiento con seguimiento confiable.",
          idealVisitor: "Negocios que necesitan apoyo de ejecución logística en el día a día.",
          commonQuestion: "¿Pueden ayudar con despacho y seguimiento de envíos?",
          leadQuestion: "¿En qué flujo logístico necesitas apoyo ahora mismo?",
          nextStep: "Usa la página de contacto para compartir tu solicitud de soporte logístico."
        },
        {
          title: "Back Office Administrativo",
          summary: "Soporte operativo para documentación, agenda, reportes, flujo de comunicación y consistencia de procesos.",
          visitorNeed: "Reducir fricción administrativa interna y mantener procesos operativos consistentes.",
          idealVisitor: "Equipos que necesitan ejecución administrativa estructurada.",
          commonQuestion: "¿Pueden apoyar con coordinación administrativa y documentación continua?",
          leadQuestion: "¿Qué proceso de back office te gustaría mejorar primero?",
          nextStep: "Usa la página de contacto para describir tus necesidades administrativas."
        },
        {
          title: "Operaciones de Relación con Clientes",
          summary: "Soporte para comunicación con clientes, seguimiento de tickets, flujos de resolución y seguimiento de satisfacción.",
          visitorNeed: "Mejorar el flujo de respuesta al cliente y la consistencia del servicio.",
          idealVisitor: "Equipos que necesitan ayuda para gestionar comunicación y seguimiento con clientes.",
          commonQuestion: "¿Pueden apoyar el seguimiento al cliente y el control de resoluciones?",
          leadQuestion: "¿Qué tipo de flujo de soporte al cliente quieres fortalecer?",
          nextStep: "Usa la página de contacto para compartir tus objetivos de operación con clientes."
        },
        {
          title: "Soporte de TI (Nivel I y Nivel II)",
          summary: "Soporte estructurado del día a día con intake, troubleshooting, coordinación de escalaciones y resolución posterior.",
          visitorNeed: "Mantener continuidad de soporte técnico al usuario y manejo confiable de incidentes.",
          idealVisitor: "Organizaciones que necesitan cobertura operativa continua de soporte TI.",
          commonQuestion: "¿Pueden ayudar con triage de tickets y flujos de soporte técnico?",
          leadQuestion: "¿Tu solicitud es para soporte Nivel I, Nivel II o ambos?",
          nextStep: "Usa la página de contacto para explicar la cobertura de soporte TI que necesitas."
        }
      ],
      fallback: "Puedo ayudarte con los servicios listados en este sitio web. Para solicitudes fuera de este contenido público, por favor contacta a Gabriel Services para confirmar."
    })
  });

  function buildPublicWebsiteContext(lang) {
    const safeLang = lang === "es" ? "es" : "en";
    const ctx = GABO_PUBLIC_SERVICES_CONTEXT[safeLang];

    return JSON.stringify({
      businessName: ctx.businessName,
      assistantName: ctx.assistantName,
      rule: ctx.rule,
      responseGuidance: ctx.responseGuidance,
      services: ctx.services,
      fallback: ctx.fallback
    });
  }

  const LEAD_INTENT_PATTERNS = Object.freeze([
    /\b(price|pricing|cost|quote|plan|plans|budget)\b/i,
    /\b(book|booking|schedule|appointment|consult|demo|call)\b/i,
    /\b(buy|purchase|order|subscribe|get started|start now)\b/i,
    /\b(contact|email|phone|sales|talk to (a )?human|representative)\b/i
  ]);

  const GABO_PUBLIC_SERVICES_CONTEXT = Object.freeze({
    en: Object.freeze({
      businessName: "gabo.services",
      assistantName: "gabo io",
      creatorName: "GABO",
      creatorDisplay: "GABO",
      rule: "Use only public website services context.",
      services: [],
      fallback: ""
    }),
    es: Object.freeze({
      businessName: "gabo.services",
      assistantName: "gabo io",
      creatorName: "GABO",
      creatorDisplay: "GABO",
      rule: "Usa solo el contexto público de servicios del sitio web.",
      services: [],
      fallback: ""
    })
  });

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

  function buildPublicWebsiteContext(lang) {
    const safeLang = lang === "es" ? "es" : "en";
    const ctx = GABO_PUBLIC_SERVICES_CONTEXT[safeLang];

    return JSON.stringify({
      businessName: ctx.businessName,
      assistantName: ctx.assistantName,
      creatorName: ctx.creatorName,
      creatorDisplay: ctx.creatorDisplay,
      rule: ctx.rule,
      services: ctx.services || [],
      fallback: ctx.fallback || ""
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

  function getPublicServicesContext(lang) {
    const safeLang = lang === "es" ? "es" : "en";
    const ctx = window.GABO_SERVICES_CONTEXT?.[safeLang];

    if (!ctx) return "";

    return JSON.stringify({
      businessName: ctx.businessName,
      assistantName: ctx.assistantName,
      serviceRule: ctx.serviceRule,
      services: ctx.services,
      fallback: ctx.fallback
    });
  }

  function buildPayload(userText, honey) {
    const lang = window.I18N && window.I18N.currentLanguage === "es" ? "es" : "en";
    const sessionId = getSessionId();
    const message = sanitize(userText, CONFIG.maxMessageChars);
    const publicWebsiteContext = buildPublicWebsiteContext(lang);
    const pageSnippet = wikiSnippet(message);
    const wikiContext = pageSnippet
      ? `${publicWebsiteContext}\n\npageContext:${pageSnippet}`
      : publicWebsiteContext;
    const leadSignals = detectLeadSignals(message);

    return {
      chatbot: CONFIG.chatbotName,
      message,
      lang,
      wikiContext: [wikiContext, publicServicesContext].filter(Boolean).join(" "),
      page: sanitize(location.href || location.pathname, 500),
      sessionId,
      honeypot: "",
      leadContext: {
        intent: "general",
        score: leadSignals.score,
        pageTitle: sanitize(document.title, 200),
        referrer: sanitize(document.referrer || "", 300),
        publicServicesContext: GABO_PUBLIC_SERVICES_CONTEXT[lang] || GABO_PUBLIC_SERVICES_CONTEXT.en
      }
    };
  }

  async function sendToGateway(payload) {
    const integrity = await computeIntegrity(payload);
    const body = {
      ...payload,
      integrity
    };

    const response = await fetch(CONFIG.chatEndpoint, {
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

    throw new Error(`chatbot_gateway_rejected:${response.status}`);
  }

  async function requestVoice(message) {
    const safeMessage = sanitize(message, CONFIG.maxMessageChars);
    if (!safeMessage) throw new Error("voice_message_required");

    const sessionId = getSessionId();
    const lang = window.I18N && window.I18N.currentLanguage === "es" ? "es" : "en";
    const canonical = {
      chatbot: CONFIG.chatbotName,
      message: safeMessage,
      lang,
      wikiContext: "",
      sessionId
    };
    const integrity = await computeIntegrity(canonical);
    const body = {
      chatbot: CONFIG.chatbotName,
      message: safeMessage,
      lang,
      wikiContext: "",
      page: sanitize(location.href || location.pathname, 500),
      sessionId,
      honeypot: "",
      leadContext: {
        intent: "voice",
        score: 0,
        pageTitle: sanitize(document.title, 200),
        referrer: sanitize(document.referrer || "", 300),
        publicServicesContext: GABO_PUBLIC_SERVICES_CONTEXT[lang] || GABO_PUBLIC_SERVICES_CONTEXT.en
      },
      integrity,
      voice: {
        speaker: ""
      }
    };

    const response = await fetch(CONFIG.ttsEndpoint, {
      method: "POST",
      mode: "cors",
      credentials: "omit",
      referrerPolicy: "no-referrer",
      cache: "no-store",
      headers: buildRequestHeaders(integrity, sessionId),
      body: JSON.stringify(body)
    });

    if (!response.ok) throw new Error("voice_unavailable");
    return response.blob();
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
        add("I received your message, but the assistant is temporarily unavailable. Please try again or use the contact page.", "bot");
        return;
      }

      const rawUserText = toText(input.value);
      const rawUserRisk = scanRisk(rawUserText);

      if (rawUserRisk.blocked) {
        add("I received your message, but the assistant is temporarily unavailable. Please try again or use the contact page.", "bot");
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
        botText = "I received your message, but the assistant is temporarily unavailable. Please try again or use the contact page.";
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

  window.GaboChatbot = Object.freeze({ requestVoice });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      boot();
    });
  } else {
    boot();
  }
})();
