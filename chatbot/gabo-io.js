(function () {
  if (window.GaboChatbot?.init) {
    window.GaboChatbot.init();
    return;
  }

  const CHATBOT_ID = "gabo-chatbot-fab";
  const CF_WORKER_ENDPOINT = "/api/ops-online-chat";
  const CONFIDENCE_THRESHOLD = 0.28;

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
    return window.I18N?.currentLanguage || document.documentElement.lang || "en";
  }

  function getChatbotContentUrl() {
    return `${getSiteBasePath()}/chatbot/gabo-io-content-index.json`;
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
        reply: "I want to answer accurately from Gabriel Services website content. Please ask about services, learning paths, careers, contact, privacy, cookies, or terms so gabo io can ground the reply with confidence.",
        confidence: 0,
        matches: [],
      };
    }

    return {
      reply: [
        "Based on Gabriel Services website content:",
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
          <button id="gabo-chatbot-close" type="button" aria-label="Close chatbot">×</button>
        </div>
        <div id="gabo-chat-log" aria-live="polite"></div>
        <div id="gabo-chatbot-form-container">
          <form id="gabo-chatbot-form" autocomplete="off">
            <input id="gabo-chatbot-input" type="text" placeholder="Type your message..." maxlength="256" required />
            <button id="gabo-chatbot-send" type="submit" aria-label="Send message">Send</button>
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
    const chatSend = document.getElementById("gabo-chatbot-send");

    if (!chatPanel || !closeButton || !chatLog || !chatForm || !chatInput || !chatSend) {
      fab.remove();
      container.remove();
      return;
    }

    let hasWelcomed = false;

    chatPanel.hidden = true;

    const addChatMessage = (text, type) => {
      const message = document.createElement("div");
      message.className = `gabo-chat-msg ${type}`;
      message.textContent = text;
      chatLog.appendChild(message);
      chatLog.scrollTop = chatLog.scrollHeight;
      return message;
    };

    const setChatOpen = (open) => {
      container.classList.toggle("open", open);
      chatPanel.classList.toggle("open", open);
      chatPanel.hidden = !open;
      fab.setAttribute("aria-expanded", String(open));
      fab.setAttribute("aria-label", open ? "Close gabo io chatbot" : "Open gabo io chatbot");

      if (open) {
        if (!hasWelcomed) {
          addChatMessage("gabo io is online. How can we help?", "gabo-bot");
          hasWelcomed = true;
        }
        chatInput.focus();
      }
    };

    const sendChatMessage = async (message) => {
      const trimmed = String(message || "").trim();
      if (!trimmed) return;

      addChatMessage(trimmed, "gabo-user");
      chatInput.value = "";
      const botMessage = addChatMessage("…", "gabo-bot");
      chatSend.disabled = true;
      chatInput.disabled = true;

      const grounded = await findGroundedChatbotAnswer(trimmed).catch(() => ({
        reply: "gabo io is having trouble loading website content. Please try again soon.",
        confidence: 0,
        matches: [],
      }));

      try {
        const response = await fetch(CF_WORKER_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: trimmed,
            lang: getChatLanguage(),
            retrieval: {
              contentDirectory: "/chatbot/",
              contentIndexUrl: getChatbotContentUrl(),
              confidence: grounded.confidence,
              matches: grounded.matches,
            },
          }),
        });

        if (!response.ok) throw new Error("Request failed");

        const data = await response.json();
        botMessage.textContent = data && data.reply ? data.reply : grounded.reply;
      } catch (error) {
        botMessage.textContent = grounded.reply;
      } finally {
        chatSend.disabled = false;
        chatInput.disabled = false;
        chatInput.focus();
      }
    };

    fab.addEventListener("click", () => setChatOpen(!container.classList.contains("open")));
    closeButton.addEventListener("click", () => setChatOpen(false));
    container.addEventListener("click", (event) => {
      if (event.target === container) {
        setChatOpen(false);
      }
    });
    chatForm.addEventListener("submit", (event) => {
      event.preventDefault();
      sendChatMessage(chatInput.value);
    });
  }

  window.GaboChatbot = {
    init,
    loadContent: loadChatbotContent,
    findGroundedAnswer: findGroundedChatbotAnswer,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
