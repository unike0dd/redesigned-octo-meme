(function () {
  if (window.GaboChatbot?.init) {
    window.GaboChatbot.init();
    return;
  }

  const CHATBOT_ID = "gabo-chatbot-fab";
  const REPO_WORKER_INTERACTION_ENDPOINT = "/api/ops-online-chat";
  const CONFIDENCE_THRESHOLD = 0.28;
  const SUPPORTED_CHAT_LANGUAGES = ["en", "es"];
  const MAX_SANITIZED_MESSAGE_LENGTH = 220;
  const CHATBOT_ASSET_ID = "gabo-io-repo-en-es-widget";
  const MIN_TYPING_DURATION_MS = 650;
  const MIN_TYPING_INTERVAL_MS = 45;
  const MIN_WORD_LIKE_RATIO = 0.62;

  function getSiteBasePath() {
    const parts = window.location.pathname.split("/").filter(Boolean);
    const repoName = "redesigned-octo-meme";
    return parts[0] === repoName ? `/${repoName}` : "";
  }

  function escapeRegExp(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function normalize(value) {
    return String(value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function uniqueTerms(value) {
    return Array.from(new Set(normalize(value).split(" ").filter((term) => term.length > 2)));
  }

  function getChatLanguage() {
    const language = window.I18N?.currentLanguage || document.documentElement.lang || "en";
    return SUPPORTED_CHAT_LANGUAGES.includes(language) ? language : "en";
  }

  function getLocalizedText(key) {
    const language = getChatLanguage();
    const copy = {
      en: {
        groundedPrefix: "Based on Gabriel Services website content:",
        lowConfidence: "I want to answer accurately from Gabriel Services website content. Please ask about services, learning paths, careers, contact, privacy, cookies, or terms so gabo io can ground the reply with confidence.",
        loadingError: "gabo io is having trouble loading website content. Please try again soon.",
        welcome: "gabo io is online. How can we help?",
        inputPlaceholder: "Type your message...",
        send: "Send",
        blocked: "This chat session was closed because the safety checks detected bot activity or unsafe input.",
      },
      es: {
        groundedPrefix: "Según el contenido del sitio web de Gabriel Services:",
        lowConfidence: "Quiero responder con precisión usando el contenido del sitio web de Gabriel Services. Pregunta sobre servicios, rutas de aprendizaje, carreras, contacto, privacidad, cookies o términos para que gabo io pueda fundamentar la respuesta con confianza.",
        loadingError: "gabo io tiene problemas para cargar el contenido del sitio web. Inténtalo de nuevo pronto.",
        welcome: "gabo io está en línea. ¿Cómo podemos ayudar?",
        inputPlaceholder: "Escribe tu mensaje...",
        send: "Enviar",
        blocked: "Esta sesión de chat se cerró porque los controles de seguridad detectaron actividad automatizada o entrada no segura.",
      },
    };
    return (copy[language] || copy.en)[key] || copy.en[key];
  }

  function getChatbotContentUrl() {
    return `${getSiteBasePath()}/chatbot/gabo-io-content-index.json`;
  }

  function decodeHtmlEntities(value) {
    const decoder = document.createElement("textarea");
    decoder.innerHTML = String(value || "");
    return decoder.value;
  }

  function squeezeWhitespace(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }

  function tinyMlScanRisk(value) {
    const text = String(value || "");
    const normalizedText = text.toLowerCase();
    const lines = text.split(/\r?\n/);
    const signatures = [
      { name: "codeBlock", weight: 8, pattern: /```|~~~|<\/?code\b|<\/?pre\b/i },
      { name: "dangerousTag", weight: 10, pattern: /<\/?(?:script|iframe|object|embed|svg|math|link|meta|base|form|input|button|textarea|style|video|audio|source)\b/i },
      { name: "eventHandler", weight: 9, pattern: /\bon[a-z]{3,}\s*=/i },
      { name: "dangerousUri", weight: 9, pattern: /\b(?:javascript|vbscript|data|file|blob):/i },
      { name: "domAccess", weight: 7, pattern: /\b(?:document|window|localStorage|sessionStorage|indexedDB|navigator|location)\s*\./i },
      { name: "execution", weight: 9, pattern: /\b(?:eval|Function|setTimeout|setInterval|fetch|XMLHttpRequest|importScripts|postMessage)\s*\(/i },
      { name: "programmingKeyword", weight: 5, pattern: /\b(?:function|class|const|let|var|import|export|return|async|await|=>|require|module\.exports)\b/i },
      { name: "shellOrRuntime", weight: 8, pattern: /(?:^|\s)(?:npm|pnpm|yarn|node|python|python3|bash|sh|powershell|curl|wget|chmod|sudo|rm\s+-rf|docker|kubectl)\b/i },
      { name: "sqli", weight: 9, pattern: /(?:\bunion\s+select\b|\bselect\b.+\bfrom\b|\binsert\s+into\b|\bdrop\s+table\b|\bdelete\s+from\b|\bor\s+1\s*=\s*1\b|--|\/\*|\*\/)/i },
      { name: "templateInjection", weight: 8, pattern: /(?:\$\{|\{\{|\}\}|<%|%>|#\{|\[\[|\]\])/ },
      { name: "encodedPayload", weight: 5, pattern: /(?:%3c|%3e|%27|%22|&#x?[0-9a-f]+;|\\x[0-9a-f]{2}|\\u[0-9a-f]{4})/i },
    ];

    const matches = signatures.filter((signature) => signature.pattern.test(text));
    const codeLikeLines = lines.filter((line) => {
      const trimmed = line.trim();
      if (!trimmed) return false;
      const punctuation = (trimmed.match(/[{}()[\];=<>`|&$]/g) || []).length;
      const densePunctuation = punctuation / Math.max(trimmed.length, 1) > 0.12 && punctuation >= 3;
      return densePunctuation || /^[\s>$]*(?:const|let|var|function|class|if|for|while|return|import|export|SELECT|DROP|curl|npm|python|bash)\b/i.test(trimmed);
    });
    const punctuationCount = (text.match(/[{}()[\];=<>`|&$]/g) || []).length;
    const denseCodePunctuation = punctuationCount / Math.max(text.length, 1) > 0.16 && punctuationCount >= 6;
    const riskScore = matches.reduce((score, match) => score + match.weight, 0)
      + codeLikeLines.length * 4
      + (denseCodePunctuation ? 6 : 0)
      + (normalizedText.includes("</") ? 4 : 0);

    return {
      riskScore,
      matches: matches.map((match) => match.name),
      codeLikeLines: codeLikeLines.length,
      denseCodePunctuation,
    };
  }

  function tinyMlSanitizeMessage(value) {
    return squeezeWhitespace(decodeHtmlEntities(value)
      .replace(/```[\s\S]*?```/g, " ")
      .replace(/~~~[\s\S]*?~~~/g, " ")
      .replace(/`[^`]*`/g, " ")
      .replace(/<!--[\s\S]*?-->/g, " ")
      .replace(/<\/?(?:script|iframe|object|embed|svg|math|link|meta|base|form|input|button|textarea|style|video|audio|source)[^>]*>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\bon[a-z]{3,}\s*=\s*(?:"[^"]*"|'[^']*'|\S+)/gi, " ")
      .replace(/\b(?:javascript|vbscript|data|file|blob):\S*/gi, " ")
      .replace(/\b(?:eval|Function|setTimeout|setInterval|fetch|XMLHttpRequest|importScripts|postMessage)\s*\([^)]*\)/gi, " ")
      .replace(/\b(?:document|window|localStorage|sessionStorage|indexedDB|navigator|location)\s*\.[\w.]+/gi, " ")
      .replace(/(?:\$\{|\{\{|\}\}|<%|%>|#\{|\[\[|\]\])/g, " ")
      .split(/\r?\n/)
      .filter((line) => {
        const trimmed = line.trim();
        if (!trimmed) return false;
        if (/^[\s>$]*(?:const|let|var|function|class|if|for|while|return|import|export|SELECT|DROP|INSERT|DELETE|curl|npm|python|bash|sudo|chmod|docker|kubectl)\b/i.test(trimmed)) return false;
        const punctuation = (trimmed.match(/[{}()[\];=<>`|&$]/g) || []).length;
        return !(punctuation / Math.max(trimmed.length, 1) > 0.12 && punctuation >= 3);
      })
      .join(" ")
      .replace(/\b(?:function|class|const|let|var|import|export|module\.exports|require|async|await|return)\b/gi, " ")
      .replace(/\b(?:union\s+select|select\s+.+\s+from|insert\s+into|drop\s+table|delete\s+from|or\s+1\s*=\s*1)\b/gi, " ")
      .replace(/(?:--|\/\*|\*\/)/g, " ")
      .replace(/[^\p{L}\p{N}\s.,?!¿¡'’"()\-:/]/gu, " ")
      .slice(0, MAX_SANITIZED_MESSAGE_LENGTH));
  }

  function classifyTinyMlInteraction(value) {
    const sanitized = squeezeWhitespace(value);
    const letters = (sanitized.match(/[\p{L}]/gu) || []).length;
    const wordTokens = sanitized.match(/[\p{L}\p{N}][\p{L}\p{N}'’\-]*/gu) || [];
    const allowedCharacters = (sanitized.match(/[\p{L}\p{N}\s.,?!¿¡'’"()\-:/]/gu) || []).length;
    const wordLikeRatio = sanitized.length ? allowedCharacters / sanitized.length : 0;
    const hasQuestion = /[?¿]/.test(sanitized) || /\b(?:what|when|where|why|how|can|could|would|do|does|is|are|cu[aá]l|qu[eé]|c[oó]mo|d[oó]nde|cu[aá]ndo|puede|puedo|tienen?)\b/i.test(sanitized);
    const hasRequest = /\b(?:help|need|want|request|quote|consult|contact|price|pricing|available|service|support|schedule|demo|ayuda|necesito|quiero|solicito|cotizaci[oó]n|consulta|contacto|precio|servicio|soporte|disponible)\b/i.test(sanitized);

    return {
      accepted: letters > 0 && wordTokens.length > 0 && wordLikeRatio >= MIN_WORD_LIKE_RATIO,
      category: hasQuestion ? "question" : hasRequest ? "request" : wordTokens.length <= 5 ? "query" : "words",
      wordCount: wordTokens.length,
      wordLikeRatio: Number(wordLikeRatio.toFixed(2)),
    };
  }

  function inspectTypingPace(typingTelemetry, sanitized) {
    const telemetry = typingTelemetry || {};
    const characterCount = Math.max(0, Number(telemetry.characterCount) || 0);
    const durationMs = Math.max(0, Number(telemetry.durationMs) || 0);
    const averageIntervalMs = Math.max(0, Number(telemetry.averageIntervalMs) || 0);
    const sanitizedLength = String(sanitized || "").length;
    const enoughTypingSignal = characterCount >= Math.min(3, sanitizedLength) && durationMs > 0;
    const tooFast = sanitizedLength >= 4 && (!enoughTypingSignal
      || durationMs < Math.min(MIN_TYPING_DURATION_MS, sanitizedLength * MIN_TYPING_INTERVAL_MS)
      || averageIntervalMs < MIN_TYPING_INTERVAL_MS);

    return {
      accepted: !tooFast,
      characterCount,
      durationMs,
      averageIntervalMs,
      minimumAverageIntervalMs: MIN_TYPING_INTERVAL_MS,
    };
  }

  function inspectTinyMlSubmission(message, honeypotValue, typingTelemetry) {
    if (squeezeWhitespace(honeypotValue)) {
      return { blocked: true, reason: "honeypot", sanitized: "", risk: { riskScore: 99, matches: ["honeypot"] } };
    }

    const original = String(message || "");
    const originalRisk = tinyMlScanRisk(original);
    const sanitized = tinyMlSanitizeMessage(original);
    const residualRisk = tinyMlScanRisk(sanitized);
    const classification = classifyTinyMlInteraction(sanitized);
    const typingPace = inspectTypingPace(typingTelemetry, sanitized);
    const removedCharacters = Math.max(0, original.length - sanitized.length);
    const removedRatio = original.length ? removedCharacters / original.length : 0;
    const blocked = !sanitized
      || !classification.accepted
      || !typingPace.accepted
      || residualRisk.riskScore >= 7
      || residualRisk.matches.length > 0
      || originalRisk.riskScore >= 18
      || (originalRisk.riskScore >= 10 && removedRatio > 0.35);

    return {
      blocked,
      reason: blocked ? (!typingPace.accepted ? "typing-pace" : !classification.accepted ? "non-conversational" : "tinyml-risk") : "clean",
      sanitized,
      classification,
      typingPace,
      risk: {
        original: originalRisk,
        residual: residualRisk,
        removedCharacters,
        removedRatio: Number(removedRatio.toFixed(2)),
      },
    };
  }

  function verifyGatewayPath() {
    const endpoint = new URL(REPO_WORKER_INTERACTION_ENDPOINT, window.location.origin);
    const contentIndex = new URL(getChatbotContentUrl(), window.location.origin);
    return endpoint.origin === window.location.origin
      && endpoint.pathname === REPO_WORKER_INTERACTION_ENDPOINT
      && contentIndex.origin === window.location.origin
      && contentIndex.pathname.endsWith("/chatbot/gabo-io-content-index.json");
  }


  let contentIndexPromise;

  function loadChatbotContent() {
    if (!contentIndexPromise) {
      contentIndexPromise = fetch(getChatbotContentUrl()).then((response) => {
        if (!response.ok) throw new Error("Chatbot content unavailable");
        return response.json();
      });
    }
    return contentIndexPromise;
  }

  function scoreEntry(entry, message) {
    const normalizedMessage = normalize(message);
    const messageTerms = uniqueTerms(message);
    const intents = Array.isArray(entry.intents) ? entry.intents : [];
    const searchableText = normalize([
      entry.title,
      entry.sourceUrl,
      entry.answer,
      entry.leadGenerationPrompt,
      entry.recommendedCta,
      intents.join(" "),
    ].filter(Boolean).join(" "));

    let score = 0;
    intents.forEach((intent) => {
      const normalizedIntent = normalize(intent);
      if (!normalizedIntent) return;
      if (normalizedMessage === normalizedIntent) score += 1;
      if (normalizedMessage.includes(normalizedIntent)) score += 0.7;
      if (new RegExp(`\\b${escapeRegExp(normalizedIntent)}\\b`, "i").test(normalizedMessage)) {
        score += 0.55;
      }
    });

    const matchedTerms = messageTerms.filter((term) => searchableText.includes(term));
    score += Math.min(0.5, matchedTerms.length * 0.08);

    return {
      entry,
      score,
      confidence: Math.min(0.99, Number(score.toFixed(2))),
    };
  }

  async function findGroundedChatbotAnswer(message) {
    const index = await loadChatbotContent();
    const entries = Array.isArray(index.entries) ? index.entries : [];
    const language = getChatLanguage();
    const localizedEntries = entries.filter((entry) => entry.language === language);
    const candidatePool = localizedEntries.length ? localizedEntries : entries;

    const ranked = candidatePool
      .map((entry) => scoreEntry(entry, message))
      .filter((candidate) => candidate.score > 0)
      .sort((a, b) => b.score - a.score);

    const best = ranked[0];
    if (!best || best.confidence < CONFIDENCE_THRESHOLD) {
      return {
        reply: getLocalizedText("lowConfidence"),
        confidence: 0,
        matches: [],
      };
    }

    return {
      reply: [
        getLocalizedText("groundedPrefix"),
        best.entry.answer,
        best.entry.leadGenerationPrompt,
        best.entry.recommendedCta,
      ].filter(Boolean).join(" "),
      confidence: best.confidence,
      matches: ranked.slice(0, 3).map((candidate) => ({
        id: candidate.entry.id,
        title: candidate.entry.title,
        sourceUrl: candidate.entry.sourceUrl,
        answer: candidate.entry.answer,
        confidence: candidate.confidence,
      })),
    };
  }

  function init() {
    if (document.getElementById(CHATBOT_ID)) return;

    const fab = document.createElement("button");
    fab.id = CHATBOT_ID;
    fab.type = "button";
    fab.setAttribute("aria-label", "Open gabo io chatbot");
    fab.setAttribute("aria-expanded", "false");
    fab.setAttribute("aria-controls", "gabo-chatbot-panel");
    fab.textContent = "gabo io";
    document.body.appendChild(fab);

    const container = document.createElement("div");
    container.id = "gabo-chatbot-container";
    container.innerHTML = `
      <div id="gabo-chatbot-panel" role="dialog" aria-modal="true" aria-label="gabo io chatbot">
        <div id="gabo-chatbot-header">
          <span>gabo io</span>
          <button id="gabo-chatbot-close" type="button" aria-label="Close chatbot">Close ×</button>
        </div>
        <div id="gabo-chat-log" aria-live="polite"></div>
        <div id="gabo-chatbot-form-container">
          <form id="gabo-chatbot-form" autocomplete="off">
            <div class="form-honeypot gabo-chatbot-honeypot" aria-hidden="true" hidden inert>
              <label for="gabo-chatbot-website">Website URL</label>
              <input id="gabo-chatbot-website" name="website" type="text" tabindex="-1" autocomplete="off" />
            </div>
            <input id="gabo-chatbot-input" type="text" placeholder="${getLocalizedText("inputPlaceholder")}" maxlength="256" required />
            <button id="gabo-chatbot-send" type="submit" aria-label="Send message">${getLocalizedText("send")}</button>
          </form>
        </div>
      </div>
    `;
    document.body.appendChild(container);

    const chatPanel = document.getElementById("gabo-chatbot-panel");
    const closeButton = document.getElementById("gabo-chatbot-close");
    const chatLog = document.getElementById("gabo-chat-log");
    const chatForm = document.getElementById("gabo-chatbot-form");
    const chatInput = document.getElementById("gabo-chatbot-input");
    const chatHoneypot = document.getElementById("gabo-chatbot-website");
    const chatSend = document.getElementById("gabo-chatbot-send");

    if (!chatPanel || !closeButton || !chatLog || !chatForm || !chatInput || !chatHoneypot || !chatSend) {
      fab.remove();
      container.remove();
      return;
    }

    let hasWelcomed = false;
    let sessionBlocked = false;
    let typingStartedAt = 0;
    let lastInputAt = 0;
    let typedCharacterCount = 0;
    let typingIntervalTotal = 0;
    let typingIntervalSamples = 0;
    let isChatOpen = false;
    let chatRequestSequence = 0;

    chatPanel.hidden = true;

    const addChatMessage = (text, type) => {
      const message = document.createElement("div");
      message.className = `gabo-chat-msg ${type}`;
      message.textContent = text;
      chatLog.appendChild(message);
      chatLog.scrollTop = chatLog.scrollHeight;
      return message;
    };

    const setChatOpen = (open, returnFocus = true) => {
      isChatOpen = open;
      container.classList.toggle("open", open);
      chatPanel.classList.toggle("open", open);
      chatPanel.hidden = !open;
      fab.hidden = open;
      fab.setAttribute("aria-hidden", String(open));
      fab.setAttribute("aria-expanded", String(open));
      fab.setAttribute("aria-label", open ? "gabo io chatbot is open" : "Open gabo io chatbot");

      if (open) {
        if (!hasWelcomed) {
          addChatMessage(getLocalizedText("welcome"), "gabo-bot");
          hasWelcomed = true;
        }
        chatInput.focus();
      } else if (returnFocus) {
        fab.focus();
      }
    };

    const resetTypingTelemetry = () => {
      typingStartedAt = 0;
      lastInputAt = 0;
      typedCharacterCount = 0;
      typingIntervalTotal = 0;
      typingIntervalSamples = 0;
    };

    const getTypingTelemetry = () => ({
      characterCount: typedCharacterCount,
      durationMs: typingStartedAt ? Math.max(0, Date.now() - typingStartedAt) : 0,
      averageIntervalMs: typingIntervalSamples ? typingIntervalTotal / typingIntervalSamples : 0,
    });

    const exitChatbot = (returnFocus = true) => {
      chatRequestSequence += 1;
      chatInput.value = "";
      chatHoneypot.value = "";
      chatForm.reset();
      if (!sessionBlocked) {
        chatInput.disabled = false;
        chatSend.disabled = false;
      }
      resetTypingTelemetry();
      setChatOpen(false, returnFocus);
    };

    const blockChatSession = () => {
      sessionBlocked = true;
      addChatMessage(getLocalizedText("blocked"), "gabo-bot");
      chatInput.value = "";
      chatHoneypot.value = "";
      resetTypingTelemetry();
      chatInput.disabled = true;
      chatSend.disabled = true;
      exitChatbot(false);
    };

    const sendChatMessage = async (message) => {
      if (sessionBlocked) return;

      const inspected = inspectTinyMlSubmission(message, chatHoneypot.value, getTypingTelemetry());
      if (inspected.blocked) {
        blockChatSession();
        return;
      }

      const trimmed = inspected.sanitized;
      if (!trimmed) return;
      const requestId = chatRequestSequence + 1;
      chatRequestSequence = requestId;

      if (["exit", "quit"].includes(trimmed.toLowerCase())) {
        exitChatbot();
        return;
      }

      if (!verifyGatewayPath()) {
        blockChatSession();
        return;
      }

      addChatMessage(trimmed, "gabo-user");
      chatInput.value = "";
      chatHoneypot.value = "";
      resetTypingTelemetry();
      const botMessage = addChatMessage("…", "gabo-bot");
      chatSend.disabled = true;
      chatInput.disabled = true;

      const grounded = await findGroundedChatbotAnswer(trimmed).catch(() => ({
        reply: getLocalizedText("loadingError"),
        confidence: 0,
        matches: [],
      }));

      if (!isChatOpen || requestId !== chatRequestSequence) return;

      if (!grounded.confidence || !grounded.matches.length) {
        botMessage.textContent = grounded.reply;
        chatSend.disabled = false;
        chatInput.disabled = false;
        chatInput.focus();
        return;
      }

      try {
        const response = await fetch(REPO_WORKER_INTERACTION_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: trimmed,
            lang: getChatLanguage(),
            handoff: {
              order: [
                "browser-safety-gate",
                "repo-content-gateway",
                "edge-safety-gate",
                "approved-chatbot-service",
              ],
              current: "browser-safety-gate",
              next: "repo-content-gateway",
              final: "approved-chatbot-service",
            },
            typingPace: inspected.typingPace,
            interactionCategory: inspected.classification.category,
            retrieval: {
              contentDirectory: "/readme MD/chatbot/",
              contentIndexUrl: getChatbotContentUrl(),
              sourceOfTruth: "repo-en-es",
              assetId: CHATBOT_ASSET_ID,
              origin: window.location.origin,
              languages: SUPPORTED_CHAT_LANGUAGES,
              confidence: grounded.confidence,
              matches: grounded.matches,
            },
          }),
        });

        if (!response.ok) throw new Error("Request failed");

        const data = await response.json();
        if (!isChatOpen || requestId !== chatRequestSequence) return;
        botMessage.textContent = data && data.reply ? data.reply : grounded.reply;
      } catch (error) {
        if (!isChatOpen || requestId !== chatRequestSequence) return;
        botMessage.textContent = grounded.reply;
      } finally {
        if (isChatOpen && requestId === chatRequestSequence) {
          chatSend.disabled = false;
          chatInput.disabled = false;
          chatInput.focus();
        }
      }
    };

    fab.addEventListener("click", () => {
      if (container.classList.contains("open")) {
        exitChatbot();
        return;
      }
      setChatOpen(true);
    });
    closeButton.addEventListener("click", () => exitChatbot());
    container.addEventListener("click", (event) => {
      if (event.target === container) {
        exitChatbot();
      }
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && container.classList.contains("open")) {
        exitChatbot();
      }
    });
    chatInput.addEventListener("input", () => {
      const now = Date.now();
      if (chatHoneypot.value) {
        blockChatSession();
        return;
      }
      if (!typingStartedAt) typingStartedAt = now;
      if (lastInputAt) {
        typingIntervalTotal += now - lastInputAt;
        typingIntervalSamples += 1;
      }
      lastInputAt = now;
      typedCharacterCount = Math.max(typedCharacterCount, chatInput.value.length);
    });
    chatHoneypot.addEventListener("input", blockChatSession);
    chatForm.addEventListener("submit", (event) => {
      event.preventDefault();
      sendChatMessage(chatInput.value);
    });
  }

  window.GaboChatbot = {
    init,
    loadContent: loadChatbotContent,
    findGroundedAnswer: findGroundedChatbotAnswer,
    tinyMlInspect: inspectTinyMlSubmission,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
