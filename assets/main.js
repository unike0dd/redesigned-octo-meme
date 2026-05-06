(function () {
  const SECURITY_HEADERS = {
    "Content-Security-Policy":
      "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; script-src 'self' https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; img-src 'self' data:; connect-src 'self'; font-src 'self' https://cdnjs.cloudflare.com; upgrade-insecure-requests",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
    "Cross-Origin-Resource-Policy": "same-origin",
    "Permissions-Policy":
      "geolocation=(), camera=(), microphone=(), payment=(), usb=()",
  };
  const CORS_ALLOWLIST = [window.location.origin];

  function enforceClientSecurityPolicy() {
    Object.entries(SECURITY_HEADERS).forEach(([name, content]) => {
      const selector = `meta[http-equiv="${name}"], meta[name="${name}"]`;
      let meta = document.head.querySelector(selector);
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute("http-equiv", name);
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", content);
    });
  }

  function simpleThreatScore(value) {
    const text = String(value || "");
    if (!text.trim()) return 0;
    const patterns = [
      /<\s*script/gi,
      /javascript:/gi,
      /on[a-z]+\s*=/gi,
      /<\/?[a-z][\s\S]*?>/gi,
      /union\s+select/gi,
      /\b(drop|truncate|alter)\s+table\b/gi,
      /\.\.\//g,
      /%3cscript/gi,
    ];
    return patterns.reduce((score, pattern) => {
      const matches = text.match(pattern);
      return score + (matches ? matches.length : 0);
    }, 0);
  }

  function sanitizeTextValue(value) {
    return String(value || "")
      .replace(/[\u0000-\u001F\u007F]/g, " ")
      .replace(/[<>`]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  async function sha256Hex(value) {
    const source = String(value || "");
    if (!window.crypto?.subtle || !window.TextEncoder) return "";
    const digest = await window.crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(source),
    );
    return Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  function scanAndSanitizePayload(payload) {
    const report = [];
    const cleaned = {};

    Object.entries(payload || {}).forEach(([key, rawValue]) => {
      const normalized = sanitizeTextValue(rawValue);
      const threatScore = simpleThreatScore(rawValue);
      cleaned[key] = normalized;
      report.push({ key, threatScore, blocked: threatScore >= 2 });
    });

    const blocked = report.some((entry) => entry.blocked);
    return { cleaned, report, blocked };
  }

  function markFieldState(field, isInvalid) {
    if (!(field instanceof HTMLElement)) return;
    field.setAttribute("aria-invalid", String(isInvalid));
    field.classList.toggle("is-security-warning", isInvalid);
  }

  function secureFormSubmission(form, statusNode) {
    const elements = Array.from(
      form.querySelectorAll("input, textarea, select"),
    ).filter((field) => !field.disabled);

    const payload = {};
    elements.forEach((field) => {
      const key =
        field.getAttribute("name") ||
        field.getAttribute("aria-label") ||
        field.previousElementSibling?.textContent ||
        field.id ||
        "field";
      payload[key] = field.value;
    });

    const result = scanAndSanitizePayload(payload);
    elements.forEach((field) => {
      const key =
        field.getAttribute("name") ||
        field.getAttribute("aria-label") ||
        field.previousElementSibling?.textContent ||
        field.id ||
        "field";
      const line = result.report.find((entry) => entry.key === key);
      const isInvalid = !!line?.blocked;
      markFieldState(field, isInvalid);
      if (!isInvalid && typeof result.cleaned[key] === "string") {
        field.value = result.cleaned[key];
      }
    });

    if (statusNode) {
      statusNode.textContent = result.blocked
        ? "Potentially malicious input was blocked. Please remove script/code fragments."
        : "Input passed sanitization and integrity checks.";
    }

    return result;
  }

  function initSecureForms() {
    const forms = document.querySelectorAll("form");
    if (!forms.length) return;

    forms.forEach((form) => {
      const message = document.createElement("small");
      message.className = "security-form-note";
      message.setAttribute("aria-live", "polite");
      form.appendChild(message);

      form.addEventListener("submit", async (event) => {
        const result = secureFormSubmission(form, message);
        if (result.blocked) {
          event.preventDefault();
          return;
        }

        const fingerprint = await sha256Hex(JSON.stringify(result.cleaned));
        form.setAttribute("data-integrity-sha256", fingerprint);
      });
    });
  }

  function getSiteBasePath() {
    const parts = window.location.pathname.split("/").filter(Boolean);
    const repoName = "redesigned-octo-meme";
    return parts[0] === repoName ? `/${repoName}` : "";
  }

  function escapeRegExp(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function initChatbot() {
    if (document.getElementById("gabo-chatbot-fab")) return;

    const fab = document.createElement("button");
    fab.id = "gabo-chatbot-fab";
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
    const API_URL = "/api/ops-online-chat";
    const CHATBOT_CONTENT_URL = `${getSiteBasePath()}/chatbot%20content/gabo-io-content-index.json`;
    let hasWelcomed = false;
    let contentIndexPromise;

    const getChatLanguage = () => window.I18N?.currentLanguage || "en";

    const loadChatbotContent = () => {
      if (!contentIndexPromise) {
        contentIndexPromise = fetch(CHATBOT_CONTENT_URL).then((response) => {
          if (!response.ok) throw new Error("Chatbot content unavailable");
          return response.json();
        });
      }
      return contentIndexPromise;
    };

    const findLocalChatbotAnswer = async (message) => {
      const index = await loadChatbotContent();
      const entries = Array.isArray(index.entries) ? index.entries : [];
      const language = getChatLanguage();
      const normalized = String(message || "").toLowerCase();
      const localizedEntries = entries.filter(
        (entry) => entry.language === language || entry.language === "es",
      );

      const match = localizedEntries.find((entry) => {
        const intents = Array.isArray(entry.intents) ? entry.intents : [];
        return intents.some((intent) =>
          new RegExp(
            `\\b${escapeRegExp(String(intent).toLowerCase())}\\b`,
            "i",
          ).test(normalized),
        );
      });

      if (!match) return "";
      return [match.answer, match.leadGenerationPrompt, match.recommendedCta]
        .filter(Boolean)
        .join(" ");
    };

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
      fab.setAttribute(
        "aria-label",
        open ? "Close gabo io chatbot" : "Open gabo io chatbot",
      );

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

      try {
        const response = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: trimmed, lang: getChatLanguage() }),
        });

        if (!response.ok) {
          throw new Error("Request failed");
        }

        const data = await response.json();
        botMessage.textContent = data && data.reply ? data.reply : "No reply.";
      } catch (error) {
        const localAnswer = await findLocalChatbotAnswer(trimmed).catch(
          () => "",
        );
        botMessage.textContent =
          localAnswer || "Error: can’t reach gabo io. Please try again soon.";
      } finally {
        chatSend.disabled = false;
        chatInput.disabled = false;
        chatInput.focus();
      }
    };

    fab.addEventListener("click", () => {
      const isOpen = fab.getAttribute("aria-expanded") === "true";
      setChatOpen(!isOpen);
    });
    closeButton.addEventListener("click", () => setChatOpen(false));
    container.addEventListener("click", (event) => {
      if (event.target === container) {
        setChatOpen(false);
      }
    });

    chatForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      await sendChatMessage(chatInput.value);
    });
  }

  function initSecurityRuntime() {
    enforceClientSecurityPolicy();
    window.GaboSecurity = {
      scanAndSanitizePayload,
      sha256Hex,
      corsAllowlist: CORS_ALLOWLIST.slice(),
      frameworks: ["OWASP ASVS", "CISA CPG", "NIST CSF", "PCI DSS 4.0"],
    };
  }

  function ensurePrimaryNav() {
    if (document.querySelector(".main-nav")) return;
    const topbar = document.querySelector("header .topbar");
    if (!topbar) return;
    const nav = document.createElement("nav");
    nav.className = "main-nav";
    nav.innerHTML = `
      <a href="./about/">About</a>
      <a href="careers.html">Careers</a>
      <a href="contact.html">Contact</a>
      <a href="./learning/">Learning</a>
    `;
    topbar.appendChild(nav);
  }

  function ensureMobileNav() {
    if (document.querySelector(".mobile-nav")) return;

    const mobileNav = document.createElement("nav");
    mobileNav.className = "mobile-nav";
    mobileNav.setAttribute("aria-label", "Mobile Navigation");
    mobileNav.innerHTML = `
      <div id="services-dropup" class="services-dropup">
        <a href="learning.html">Logistics</a>
        <a href="learning.html">Admin Back Office</a>
        <a href="learning.html">Customer Relations</a>
        <a href="learning.html">IT Support</a>
      </div>
      <div class="menu">
        <a href="./">Home</a>
        <button id="mobile-services-toggle" type="button">Services</button>
        <a href="careers.html">Careers</a>
                <a href="contact.html">Contact</a>
      </div>
    `;

    document.body.appendChild(mobileNav);
  }

  function ensureSkipLink() {
    if (document.querySelector(".skip-link")) return;
    const target =
      document.querySelector("main") ||
      document.querySelector(".hero") ||
      document.querySelector(".section") ||
      document.body.firstElementChild;
    if (!target) return;
    if (!target.id) target.id = "main-content";
    const skipLink = document.createElement("a");
    skipLink.className = "skip-link";
    skipLink.href = "#" + target.id;
    skipLink.textContent = "Skip to main content";
    document.body.insertAdjacentElement("afterbegin", skipLink);
  }

  function activateServiceLetterScramble() {
    const targets = document.querySelectorAll("[data-scramble]");
    if (!targets.length) return;
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    function randomLetter() {
      return alphabet[Math.floor(Math.random() * alphabet.length)];
    }

    function scrambleToText(node) {
      const finalText = (
        node.dataset.scramble ||
        node.textContent ||
        ""
      ).trim();
      if (!finalText) return;

      let frame = 0;
      const totalFrames = Math.max(20, finalText.replace(/\s/g, "").length * 3);
      const interval = setInterval(() => {
        const revealCount = Math.floor(
          (frame / totalFrames) * finalText.length,
        );
        let output = "";
        for (let i = 0; i < finalText.length; i += 1) {
          const char = finalText[i];
          if (char === " ") {
            output += " ";
          } else if (i < revealCount) {
            output += char;
          } else {
            output += randomLetter();
          }
        }
        node.textContent = output;
        frame += 1;

        if (frame > totalFrames) {
          clearInterval(interval);
          node.textContent = finalText;
        }
      }, 45);
    }

    targets.forEach((node, idx) => {
      const delay = idx * 220;
      const finalText = (
        node.dataset.scramble ||
        node.textContent ||
        ""
      ).trim();

      node.textContent = finalText;
      const finalHeight = Math.ceil(node.getBoundingClientRect().height);
      if (finalHeight > 0) {
        node.style.minHeight = `${finalHeight}px`;
      }

      node.textContent = finalText.replace(/[A-Za-z]/g, () => randomLetter());
      setTimeout(() => scrambleToText(node), delay);
    });
  }

  function initRepeatableEntryGroups() {
    const groups = document.querySelectorAll("[data-repeatable-group]");
    if (!groups.length) return;

    groups.forEach((group) => {
      const list = group.querySelector("[data-repeat-list]");
      const addBtn = group.querySelector("[data-repeat-add]");
      const removeBtn = group.querySelector("[data-repeat-remove]");
      const fieldName =
        group.getAttribute("data-field-name") || "additional entry";

      if (!list || !addBtn || !removeBtn) return;

      const firstInput = list.querySelector("input");
      const placeholder =
        firstInput?.getAttribute("placeholder") ||
        "Add " + fieldName.toLowerCase() + " entry";

      addBtn.addEventListener("click", () => {
        const row = document.createElement("div");
        row.className = "entry-row";
        const input = document.createElement("input");
        input.setAttribute("placeholder", placeholder);
        input.setAttribute("aria-label", fieldName + " entry");
        row.appendChild(input);
        list.appendChild(row);
        input.focus();
      });

      removeBtn.addEventListener("click", () => {
        const rows = list.querySelectorAll(".entry-row");
        if (rows.length <= 1) {
          const onlyInput = rows[0]?.querySelector("input");
          if (onlyInput) {
            onlyInput.value = "";
            onlyInput.focus();
          }
          return;
        }
        rows[rows.length - 1].remove();
      });
    });
  }

  function initNumericOnlyInputs() {
    const numericInputs = document.querySelectorAll("input[data-numeric-only]");
    if (!numericInputs.length) return;

    const keepOnlyDigits = (value) => value.replace(/\D+/g, "");

    numericInputs.forEach((input) => {
      input.addEventListener("input", () => {
        const sanitized = keepOnlyDigits(input.value);
        if (input.value !== sanitized) {
          input.value = sanitized;
        }
      });

      input.addEventListener("paste", (event) => {
        event.preventDefault();
        const clipboardText = event.clipboardData?.getData("text") || "";
        const sanitized = keepOnlyDigits(clipboardText);
        if (document.queryCommandSupported?.("insertText")) {
          document.execCommand("insertText", false, sanitized);
          return;
        }
        const start = input.selectionStart ?? input.value.length;
        const end = input.selectionEnd ?? input.value.length;
        input.value =
          input.value.slice(0, start) + sanitized + input.value.slice(end);
      });
    });
  }

  function initMobileServiceMenu() {
    const serviceBtn = document.getElementById("mobile-services-toggle");
    const dropup = document.getElementById("services-dropup");
    if (!serviceBtn || !dropup) return;

    serviceBtn.setAttribute("aria-expanded", "false");
    serviceBtn.setAttribute("aria-controls", "services-dropup");
    serviceBtn.addEventListener("click", () => {
      const isOpen = dropup.classList.toggle("open");
      serviceBtn.setAttribute("aria-expanded", String(isOpen));
    });
  }

  function initScrollLazyLoad() {
    const lazyTargets = Array.from(
      document.querySelectorAll(".section, .card, .footer-grid > div"),
    );
    if (!lazyTargets.length) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduceMotion || !("IntersectionObserver" in window)) {
      lazyTargets.forEach((target) => target.classList.add("is-visible"));
      return;
    }

    lazyTargets.forEach((target, index) => {
      if (index < 2) {
        target.classList.add("is-visible");
        return;
      }
      target.classList.add("lazy-on-scroll");
    });

    const observer = new IntersectionObserver(
      (entries, intersectionObserver) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          intersectionObserver.unobserve(entry.target);
        });
      },
      {
        rootMargin: "0px 0px 120px 0px",
        threshold: 0.12,
      },
    );

    lazyTargets
      .filter((target) => target.classList.contains("lazy-on-scroll"))
      .forEach((target) => observer.observe(target));
  }

  function initPage() {
    ensurePrimaryNav();
    ensureMobileNav();
    ensureSkipLink();
    initRepeatableEntryGroups();
    initNumericOnlyInputs();
    initMobileServiceMenu();
    initScrollLazyLoad();
    initSecureForms();
    initChatbot();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initPage);
  } else {
    initPage();
  }
})();
