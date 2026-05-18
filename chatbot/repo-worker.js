(function () {
  "use strict";

  const log = document.querySelector("#chat-log");
  const form = document.querySelector("#chatbot-input-row");
  const input = document.querySelector("#chatbot-input");
  const honeypot = document.querySelector("#chatbot-website");
  const sendBtn = document.querySelector("#chatbot-send");

  const API_URL = "/api/gabo-io-chat";

  function addMsg(text, type) {
    const div = document.createElement("div");
    div.className = "chat-msg " + type;
    div.textContent = text;
    log.appendChild(div);
    log.scrollTop = log.scrollHeight;
    return div;
  }

  async function sendMessage(message) {
    const ml = window.GaboIoTinyML;
    if (!ml) {
      addMsg("Security module not loaded.", "bot");
      return;
    }

    if (ml.isSessionBlocked()) {
      addMsg("Session blocked by CyberSec policy.", "bot");
      return;
    }

    const honey = ml.checkHoneypot(honeypot ? honeypot.value : "");
    if (honey.blocked) {
      addMsg("Bot activity detected. Session blocked.", "bot");
      return;
    }

    const sanitized = ml.sanitizeMessage(message);
    if (!sanitized) return;

    const risk = ml.scanRisk(sanitized);
    if (risk.blocked) {
      addMsg("Message blocked by Tiny ML + CyberSec rules.", "bot");
      return;
    }

    addMsg(sanitized, "user");
    input.value = "";

    const botDiv = addMsg("…", "bot");

    sendBtn.disabled = true;
    input.disabled = true;

    try {
      const payload = { chatbot: "gabo io", message: sanitized, lang: "en" };
      const integrity = await ml.integrityAfterCySec(payload);

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Gabo-Integrity-SHA256": integrity
        },
        body: JSON.stringify({ ...payload, integrity })
      });

      if (!response.ok) {
        throw new Error("Request failed");
      }

      const data = await response.json();
      botDiv.textContent = data && data.reply ? data.reply : "No reply.";
    } catch (error) {
      botDiv.textContent = "Error: can't reach gabo io.";
    } finally {
      sendBtn.disabled = false;
      input.disabled = false;
      input.focus();
    }
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    await sendMessage(input.value);
  });
})();
