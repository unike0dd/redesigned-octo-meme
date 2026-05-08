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

  const CLIENT_SECURITY_POLICIES = {
    "Content-Security-Policy": SECURITY_HEADERS["Content-Security-Policy"].replace(
      "frame-ancestors 'none'; ",
      "",
    ),
  };
  const CORS_ALLOWLIST = [window.location.origin];

  const EXTENSION_MESSAGE_CHANNEL_CLOSED =
    /(?:runtime\.lastError.*message channel closed before a response was received|listener indicated an asynchronous response.*message channel closed)/i;

  function isKnownExtensionRuntimeNoise(reason) {
    const text = String(reason?.message || reason || "");
    return EXTENSION_MESSAGE_CHANNEL_CLOSED.test(text);
  }

  function initRuntimeErrorDiagnostics() {
    window.addEventListener("error", (event) => {
      if (!isKnownExtensionRuntimeNoise(event.message || event.error)) return;
      event.preventDefault();
    });

    window.addEventListener("unhandledrejection", (event) => {
      if (!isKnownExtensionRuntimeNoise(event.reason)) return;
      event.preventDefault();
    });
  }

  function enforceClientSecurityPolicy() {
    Object.entries(CLIENT_SECURITY_POLICIES).forEach(([name, content]) => {
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

  function loadGaboChatbot() {
    if (window.GaboChatbot?.init) {
      window.GaboChatbot.init();
      return;
    }

    if (document.querySelector('script[data-gabo-chatbot="true"]')) return;

    const script = document.createElement("script");
    script.src = `${getSiteBasePath()}/chatbot/gabo-io.js`;
    script.defer = true;
    script.dataset.gaboChatbot = "true";
    document.body.appendChild(script);
  }

  function initSecurityRuntime() {
    enforceClientSecurityPolicy();
    initRuntimeErrorDiagnostics();
    window.GaboSecurity = {
      scanAndSanitizePayload,
      sha256Hex,
      corsAllowlist: CORS_ALLOWLIST.slice(),
      knownRuntimeNoise: {
        source: "browser-extension-message-channel",
        pattern: EXTENSION_MESSAGE_CHANNEL_CLOSED.source,
      },
      frameworks: ["OWASP ASVS", "CISA CPG", "NIST CSF", "PCI DSS 4.0"],
      securityHeaders: { ...SECURITY_HEADERS },
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
    const existingMobileNav = document.querySelector(".mobile-nav");
    const mobileNav = existingMobileNav || document.createElement("nav");
    const basePath = getSiteBasePath();

    mobileNav.className = "mobile-nav";
    mobileNav.setAttribute("aria-label", "Mobile Navigation");
    mobileNav.setAttribute("data-i18n-aria-label", "mobileNavigation");
    mobileNav.innerHTML = `
      <div id="services-dropup" class="services-dropup">
        <a href="${basePath}/learning.html" data-i18n="logisticsOps">Logistics</a>
        <a href="${basePath}/learning.html" data-i18n="adminBackOffice">Admin Back Office</a>
        <a href="${basePath}/learning.html" data-i18n="customerRelations">Customer Relations</a>
        <a href="${basePath}/learning.html" data-i18n="itSupport">IT Support</a>
      </div>
      <div class="menu">
        <a href="${basePath}/" data-i18n="home">Home</a>
        <button id="mobile-services-toggle" type="button" data-i18n="services">Services</button>
        <div class="mobile-preference-controls" aria-label="Quick preferences">
          <button
            id="mobile-language-toggle"
            type="button"
            class="mobile-preference-toggle"
            data-language-toggle="mobile"
            aria-label="Switch to Spanish"
            data-i18n-aria-label="switchToSpanish"
          >EN</button>
          <button
            id="mobile-theme-toggle"
            type="button"
            class="mobile-preference-toggle"
            data-theme-toggle="mobile"
            aria-label="Switch to dark theme"
          >SUN</button>
        </div>
        <a href="${basePath}/careers.html" data-i18n="careers">Careers</a>
        <a href="${basePath}/contact.html" data-i18n="contact">Contact</a>
      </div>
    `;

    if (!existingMobileNav) {
      document.body.appendChild(mobileNav);
    }

    if (window.I18N && typeof I18N.applyLanguage === "function") {
      I18N.applyLanguage();
      window.dispatchEvent(
        new CustomEvent("language:changed", {
          detail: { language: I18N.currentLanguage },
        }),
      );
    }
    if (window.THEME?.current) {
      window.dispatchEvent(
        new CustomEvent("theme:changed", { detail: { theme: THEME.current } }),
      );
    }
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

  function initRoyalDarkPointerEffects() {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduceMotion) return;

    window.addEventListener(
      "pointermove",
      () => {
        document.body.classList.add("mouse-active");
      },
      { passive: true },
    );

    window.addEventListener("pointerleave", () => {
      document.body.classList.remove("mouse-active");
    });
  }

  function initPage() {
    initSecurityRuntime();
    ensurePrimaryNav();
    ensureMobileNav();
    ensureSkipLink();
    initRepeatableEntryGroups();
    initNumericOnlyInputs();
    initMobileServiceMenu();
    initScrollLazyLoad();
    initRoyalDarkPointerEffects();
    initSecureForms();
    loadGaboChatbot();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initPage);
  } else {
    initPage();
  }
})();
