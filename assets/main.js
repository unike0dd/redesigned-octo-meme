(function () {
  const SECURITY_HEADERS = {
    "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
    "Content-Security-Policy":
      "default-src 'self'; base-uri 'self'; object-src 'none'; form-action 'self' https://gabo.services https://www.gabo.services https://contacto.gabo.services https://careers.gabo.services https://chatbot.gabo.services; upgrade-insecure-requests; block-all-mixed-content; script-src 'self' https://static.cloudflareinsights.com https://challenges.cloudflare.com; style-src 'self'; img-src 'self' data: blob: https:; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https://gabo.services https://www.gabo.services https://contacto.gabo.services https://careers.gabo.services https://chatbot.gabo.services https://*.gabo.services; frame-src 'self' https://challenges.cloudflare.com; worker-src 'self'; manifest-src 'self'; media-src 'self';",
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
    "X-XSS-Protection": "0",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Cross-Origin-Resource-Policy": "same-origin",
    "Cross-Origin-Opener-Policy": "same-origin",
    "Permissions-Policy":
      "accelerometer=(), ambient-light-sensor=(), autoplay=(), battery=(), bluetooth=(), browsing-topics=(), camera=(), clipboard-read=(), clipboard-write=(self), display-capture=(), encrypted-media=(), fullscreen=(self), gamepad=(), geolocation=(), gyroscope=(), hid=(), idle-detection=(), interest-cohort=(), local-fonts=(), magnetometer=(), microphone=(), midi=(), otp-credentials=(), payment=(), picture-in-picture=(), publickey-credentials-create=(), publickey-credentials-get=(self), screen-wake-lock=(), serial=(), speaker-selection=(), storage-access=(), usb=(), web-share=(), xr-spatial-tracking=()",
    "X-Permitted-Cross-Domain-Policies": "none",
    "X-DNS-Prefetch-Control": "off",
    "X-Download-Options": "noopen",
  };

  const CLIENT_SECURITY_POLICIES = {
    "Content-Security-Policy": SECURITY_HEADERS[
      "Content-Security-Policy"
    ],
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

  const TINY_ML_RISK_THRESHOLD = 3;
  const TINY_ML_BLOCKING_RESIDUAL_THRESHOLD = 1;
  const TINY_ML_MAX_FIELD_LENGTH = 2000;
  const TINY_ML_RISK_SIGNATURES = [
    { label: "script-tag", weight: 4, pattern: /<\s*\/?\s*script\b/gi },
    {
      label: "dangerous-html-tag",
      weight: 3,
      pattern:
        /<\s*\/?\s*(?:iframe|object|embed|applet|meta|link|base|form|input|button|svg|math|template|style)\b/gi,
    },
    { label: "event-handler", weight: 3, pattern: /\bon[a-z]{3,}\s*=/gi },
    {
      label: "active-uri",
      weight: 4,
      pattern: /\b(?:javascript|vbscript|data)\s*:/gi,
    },
    {
      label: "encoded-active-uri",
      weight: 4,
      pattern: /(?:%6a%61%76%61%73%63%72%69%70%74|&#x?6a;?)/gi,
    },
    { label: "html-tag", weight: 2, pattern: /<\/?[a-z][\s\S]*?>/gi },
    {
      label: "code-block",
      weight: 4,
      pattern: /```[\s\S]*?```|~~~[\s\S]*?~~~/g,
    },
    { label: "inline-code", weight: 2, pattern: /`[^`\n]{2,}`/g },
    {
      label: "js-code-token",
      weight: 3,
      pattern:
        /\b(?:eval|Function|setTimeout|setInterval|fetch|XMLHttpRequest|document\.|window\.|localStorage|sessionStorage|import\s|require\s*\(|process\.|child_process)\b/gi,
    },
    {
      label: "programming-declaration",
      weight: 2,
      pattern:
        /\b(?:const|let|var|function|class|def|lambda|async\s+function|return|public\s+class|using\s+namespace)\b[\s\w]*(?:[({=;:]|=>)/gi,
    },
    {
      label: "sql-injection",
      weight: 3,
      pattern:
        /(?:\bunion\s+(?:all\s+)?select\b|\bselect\b[\s\S]{0,80}\bfrom\b|\binsert\s+into\b|\bupdate\b[\s\S]{0,80}\bset\b|\bdelete\s+from\b|\bdrop\s+(?:table|database)\b|\btruncate\s+table\b|--\s|\/\*|\*\/|;\s*(?:select|drop|insert|delete|update)\b)/gi,
    },
    {
      label: "shell-or-path-exec",
      weight: 3,
      pattern:
        /(?:\.\.\/|\b(?:curl|wget|bash|sh|powershell|cmd\.exe|chmod|sudo|rm\s+-rf|nc\s+-|python\s+-c|node\s+-e)\b|\|\||&&)/gi,
    },
    {
      label: "template-injection",
      weight: 3,
      pattern: /(?:\$\{[\s\S]*?\}|\{\{[\s\S]*?\}\}|<%[\s\S]*?%>)/g,
    },
    {
      label: "dense-code-punctuation",
      weight: 2,
      pattern: /(?:[{}()[\];=<>|&]{5,}|[A-Za-z_$][\w$]*\s*=>)/g,
    },
  ];

  function decodeHtmlEntities(value) {
    const text = String(value || "");
    if (!/[&][#a-z0-9]+;/i.test(text) || !document.createElement) return text;
    const decoder = document.createElement("textarea");
    decoder.innerHTML = text;
    return decoder.value;
  }

  function summarizeThreats(value) {
    const text = decodeHtmlEntities(value);
    const reasons = [];
    const score = TINY_ML_RISK_SIGNATURES.reduce((total, signature) => {
      const matches = text.match(signature.pattern);
      if (!matches) return total;
      reasons.push(signature.label);
      return total + matches.length * signature.weight;
    }, 0);

    const punctuation = text.replace(/[\w\s.,'"@:+/#-]/g, "").length;
    const density = text.length ? punctuation / text.length : 0;
    if (text.length > 24 && density > 0.22) {
      reasons.push("punctuation-density");
      return { score: score + 2, reasons: Array.from(new Set(reasons)) };
    }

    return { score, reasons: Array.from(new Set(reasons)) };
  }

  function removeCodeLikeLines(value) {
    return String(value || "")
      .split(/\r?\n/)
      .filter((line) => {
        const trimmed = line.trim();
        if (!trimmed) return true;
        return !/(?:^\s*(?:const|let|var|function|class|def|import|export|return|if|for|while)\b|=>|[{};]{2,}|<\/?[a-z][\s\S]*?>|\b(?:SELECT|DROP|DELETE|INSERT|UPDATE)\b)/i.test(
          trimmed,
        );
      })
      .join(" ");
  }

  function sanitizeTextValue(value) {
    return removeCodeLikeLines(decodeHtmlEntities(value))
      .replace(/```[\s\S]*?```|~~~[\s\S]*?~~~/g, " ")
      .replace(/`[^`\n]{2,}`/g, " ")
      .replace(
        /<\s*(script|style|iframe|object|embed|applet|svg|math|template)[\s\S]*?<\s*\/\s*\1\s*>/gi,
        " ",
      )
      .replace(/<[^>]+>/g, " ")
      .replace(/\b(?:javascript|vbscript|data)\s*:[^\s,;)]*/gi, " ")
      .replace(/\bon[a-z]{3,}\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/gi, " ")
      .replace(/\b(?:eval|Function|setTimeout|setInterval)\s*\([^)]*\)/gi, " ")
      .replace(/(?:\/\*[\s\S]*?\*\/|<!--|-->|--\s*$)/gm, " ")
      .replace(/[<>`{}()[\];|\\]/g, " ")
      .replace(/[\u0000-\u001F\u007F]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, TINY_ML_MAX_FIELD_LENGTH);
  }

  function runTinyMlSanitizer(value) {
    const raw = String(value || "");
    const cleaned = sanitizeTextValue(raw);
    const rawThreat = summarizeThreats(raw);
    const residualThreat = summarizeThreats(cleaned);
    const removedCharacters = Math.max(raw.length - cleaned.length, 0);
    const blocked =
      rawThreat.score >= TINY_ML_RISK_THRESHOLD ||
      residualThreat.score >= TINY_ML_BLOCKING_RESIDUAL_THRESHOLD;

    return {
      cleaned,
      blocked,
      removedCharacters,
      rawThreatScore: rawThreat.score,
      residualThreatScore: residualThreat.score,
      reasons: Array.from(
        new Set([...rawThreat.reasons, ...residualThreat.reasons]),
      ),
    };
  }

  function simpleThreatScore(value) {
    return summarizeThreats(value).score;
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
      const result = runTinyMlSanitizer(rawValue);
      cleaned[key] = result.cleaned;
      report.push({
        key,
        threatScore: result.rawThreatScore,
        residualThreatScore: result.residualThreatScore,
        removedCharacters: result.removedCharacters,
        reasons: result.reasons,
        blocked: result.blocked,
      });
    });

    const blocked = report.some((entry) => entry.blocked);
    return { cleaned, report, blocked };
  }

  function getSiteBasePath() {
    const parts = window.location.pathname.split("/").filter(Boolean);
    const repoName = "redesigned-octo-meme";
    return parts[0] === repoName ? `/${repoName}` : "";
  }

  function getSiteUrl(pathname) {
    const basePath = getSiteBasePath();
    const normalizedPath = String(pathname || "").replace(/^\/+/, "");
    return `${basePath}/${normalizedPath}`.replace(/\/{2,}/g, "/");
  }

  function ensureHeadLink({ rel, href, type }) {
    if (!document.head) return null;
    const selector = `link[rel="${rel}"]${type ? `[type="${type}"]` : ""}`;
    let link = document.head.querySelector(selector);
    if (!link) {
      link = document.createElement("link");
      link.setAttribute("rel", rel);
      if (type) link.setAttribute("type", type);
      document.head.appendChild(link);
    }
    link.setAttribute("href", href);
    return link;
  }

  function ensureThemeColor() {
    if (!document.head) return;
    let meta = document.head.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "theme-color");
      document.head.appendChild(meta);
    }
    const isDark = document.documentElement.classList.contains("dark-theme");
    meta.setAttribute("content", isDark ? "#190833" : "#35106d");
  }

  function initProgressiveWebApp() {
    ensureHeadLink({
      rel: "manifest",
      href: getSiteUrl("manifest.webmanifest"),
      type: "application/manifest+json",
    });
    ensureHeadLink({ rel: "icon", href: getSiteUrl("assets/icon.svg"), type: "image/svg+xml" });
    ensureThemeColor();

    window.addEventListener("theme:changed", ensureThemeColor);

    const pwaState = {
      manifest: getSiteUrl("manifest.webmanifest"),
      serviceWorker: getSiteUrl("service-worker.js"),
      offlineFallback: getSiteUrl("offline.html"),
      status: "unsupported",
    };
    window.GaboPWA = pwaState;

    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker
      .register(pwaState.serviceWorker, { scope: `${getSiteBasePath() || ""}/` })
      .then((registration) => {
        pwaState.status = "registered";
        pwaState.scope = registration.scope;
        window.dispatchEvent(new CustomEvent("pwa:ready", { detail: { ...pwaState } }));
      })
      .catch((error) => {
        pwaState.status = "registration-failed";
        pwaState.error = String(error?.message || error);
        window.dispatchEvent(new CustomEvent("pwa:error", { detail: { ...pwaState } }));
      });
  }

  function initWebVitalsTelemetry() {
    if (!("PerformanceObserver" in window)) return;

    const vitals = {
      lcp: null,
      cls: 0,
      inp: 0,
      thresholds: { lcp: 2500, cls: 0.1, inp: 200 },
    };

    const publish = (metric, value, rating) => {
      const detail = { metric, value, rating, source: "gabo-web-vitals" };
      window.GaboWebVitals = { ...vitals };
      window.dispatchEvent(new CustomEvent("web-vital:measure", { detail }));
    };

    const ratingFor = (metric, value) => {
      const good = vitals.thresholds[metric];
      if (value <= good) return "good";
      if (metric === "cls") return value <= 0.25 ? "needs-improvement" : "poor";
      if (metric === "lcp") return value <= 4000 ? "needs-improvement" : "poor";
      return value <= 500 ? "needs-improvement" : "poor";
    };

    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const lastEntry = list.getEntries().at(-1);
        if (!lastEntry) return;
        vitals.lcp = Math.round(lastEntry.startTime);
        publish("lcp", vitals.lcp, ratingFor("lcp", vitals.lcp));
      });
      lcpObserver.observe({ type: "largest-contentful-paint", buffered: true });
    } catch (error) {
      // Some browsers do not expose every web-vitals observer type.
    }

    try {
      const clsObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.hadRecentInput) return;
          vitals.cls += entry.value;
        });
        publish("cls", Number(vitals.cls.toFixed(4)), ratingFor("cls", vitals.cls));
      });
      clsObserver.observe({ type: "layout-shift", buffered: true });
    } catch (error) {
      // Some browsers do not expose every web-vitals observer type.
    }

    try {
      const interactions = new Map();
      const inpObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (!entry.interactionId) return;
          const previous = interactions.get(entry.interactionId) || 0;
          interactions.set(entry.interactionId, Math.max(previous, entry.duration));
        });
        const worstInteraction = Math.max(0, ...interactions.values());
        vitals.inp = Math.round(worstInteraction);
        publish("inp", vitals.inp, ratingFor("inp", vitals.inp));
      });
      inpObserver.observe({ type: "event", buffered: true, durationThreshold: 40 });
    } catch (error) {
      // Some browsers do not expose every web-vitals observer type.
    }

    window.GaboWebVitals = { ...vitals };
  }

  function initSecurityRuntime() {
    enforceClientSecurityPolicy();
    initRuntimeErrorDiagnostics();
    window.GaboSecurity = {
      scanAndSanitizePayload,
      sanitizeTextValue,
      simpleThreatScore,
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
        <a href="${basePath}/services/logistics-operations.html" data-i18n="logisticsOps">Logistics Operations</a>
        <a href="${basePath}/services/administrative-backoffice.html" data-i18n="adminBackOffice">Administrative Back Office</a>
        <a href="${basePath}/services/customer-relations.html" data-i18n="customerRelations">Customer Relations</a>
        <a href="${basePath}/services/it-support.html" data-i18n="itSupport">IT Support</a>
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

  function setupFloatingField(field) {
    if (!field || field.dataset.floatingFieldReady === "true") return;

    const controls = Array.from(field.querySelectorAll("input, textarea, select"));
    if (!controls.length) return;

    const updateValueState = () => {
      field.classList.toggle(
        "has-value",
        controls.some((control) => Boolean(control.value)),
      );
    };

    field.addEventListener("focusin", () => {
      field.classList.add("is-focused");
    });

    field.addEventListener("focusout", () => {
      field.classList.remove("is-focused");
      updateValueState();
    });

    controls.forEach((control) => {
      control.addEventListener("input", updateValueState);
      control.addEventListener("change", updateValueState);
    });

    const form = controls[0].form;
    if (form) {
      form.addEventListener("reset", () => window.setTimeout(updateValueState, 0));
    }

    field.dataset.floatingFieldReady = "true";
    updateValueState();
    window.setTimeout(updateValueState, 150);
  }

  function initFloatingFields(root = document) {
    root.querySelectorAll(".floating-field").forEach(setupFloatingField);
  }

  function initRepeatableEntryGroups() {
    const groups = document.querySelectorAll("[data-repeatable-group]");
    if (!groups.length) return;

    groups.forEach((group) => {
      const list = group.querySelector("[data-repeat-list]");
      const addBtn = group.querySelector("[data-repeat-add]");
      const removeBtn = group.querySelector("[data-repeat-remove]");
      if (!list || !addBtn || !removeBtn) return;

      const templateRow = list.querySelector(".entry-row");
      const focusableSelector = "input, select, textarea";

      const clearRowValues = (row) => {
        row.querySelectorAll("input, textarea").forEach((field) => {
          field.value = "";
          field.dispatchEvent(new Event("input", { bubbles: true }));
        });
        row.querySelectorAll("select").forEach((field) => {
          field.selectedIndex = 0;
          field.dispatchEvent(new Event("change", { bubbles: true }));
        });
      };

      if (!templateRow) return;

      addBtn.addEventListener("click", () => {
        const row = templateRow.cloneNode(true);
        clearRowValues(row);
        list.appendChild(row);
        initFloatingFields(row);
        window.I18N?.applyLanguage?.();
        row.querySelector(focusableSelector)?.focus();
      });

      removeBtn.addEventListener("click", () => {
        const rows = list.querySelectorAll(".entry-row");
        if (rows.length <= 1) {
          const onlyRow = rows[0];
          if (onlyRow) {
            clearRowValues(onlyRow);
            initFloatingFields(onlyRow);
            onlyRow.querySelector(focusableSelector)?.focus();
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


  const SERVICE_FOCUS_CONTENT = {
    admin: {
      executive: {
        eyebrowKey: "selectedPriorityEyebrow",
        titleKey: "serviceFocusAdminExecutiveTitle",
        textKey: "serviceFocusAdminExecutiveText",
        itemKeys: [
          "serviceFocusAdminExecutiveItem1",
          "serviceFocusAdminExecutiveItem2",
          "serviceFocusAdminExecutiveItem3",
          "serviceFocusAdminExecutiveItem4",
          "serviceFocusAdminExecutiveItem5",
          "serviceFocusAdminExecutiveItem6",
        ],
      },
      records: {
        eyebrowKey: "selectedPriorityEyebrow",
        titleKey: "serviceFocusAdminRecordsTitle",
        textKey: "serviceFocusAdminRecordsText",
        itemKeys: [
          "serviceFocusAdminRecordsItem1",
          "serviceFocusAdminRecordsItem2",
          "serviceFocusAdminRecordsItem3",
          "serviceFocusAdminRecordsItem4",
          "serviceFocusAdminRecordsItem5",
          "serviceFocusAdminRecordsItem6",
        ],
      },
      scheduling: {
        eyebrowKey: "selectedPriorityEyebrow",
        titleKey: "serviceFocusAdminSchedulingTitle",
        textKey: "serviceFocusAdminSchedulingText",
        itemKeys: [
          "serviceFocusAdminSchedulingItem1",
          "serviceFocusAdminSchedulingItem2",
          "serviceFocusAdminSchedulingItem3",
          "serviceFocusAdminSchedulingItem4",
        ],
      },
      vendorTravel: {
        eyebrowKey: "selectedPriorityEyebrow",
        titleKey: "serviceFocusAdminVendorTravelTitle",
        textKey: "serviceFocusAdminVendorTravelText",
        itemKeys: [
          "serviceFocusAdminVendorTravelItem1",
          "serviceFocusAdminVendorTravelItem2",
          "serviceFocusAdminVendorTravelItem3",
          "serviceFocusAdminVendorTravelItem4",
        ],
      },
    },
    customer: {
      communication: {
        eyebrowKey: "selectedPriorityEyebrow",
        titleKey: "serviceFocusCustomerCommunicationTitle",
        textKey: "serviceFocusCustomerCommunicationText",
        itemKeys: [
          "serviceFocusCustomerCommunicationItem1",
          "serviceFocusCustomerCommunicationItem2",
          "serviceFocusCustomerCommunicationItem3",
          "serviceFocusCustomerCommunicationItem4",
          "serviceFocusCustomerCommunicationItem5",
          "serviceFocusCustomerCommunicationItem6",
        ],
      },
      resolution: {
        eyebrowKey: "selectedPriorityEyebrow",
        titleKey: "serviceFocusCustomerResolutionTitle",
        textKey: "serviceFocusCustomerResolutionText",
        itemKeys: [
          "serviceFocusCustomerResolutionItem1",
          "serviceFocusCustomerResolutionItem2",
          "serviceFocusCustomerResolutionItem3",
          "serviceFocusCustomerResolutionItem4",
          "serviceFocusCustomerResolutionItem5",
          "serviceFocusCustomerResolutionItem6",
        ],
      },
      satisfaction: {
        eyebrowKey: "selectedPriorityEyebrow",
        titleKey: "serviceFocusCustomerSatisfactionTitle",
        textKey: "serviceFocusCustomerSatisfactionText",
        itemKeys: [
          "serviceFocusCustomerSatisfactionItem1",
          "serviceFocusCustomerSatisfactionItem2",
          "serviceFocusCustomerSatisfactionItem3",
          "serviceFocusCustomerSatisfactionItem4",
        ],
      },
      billingUpsell: {
        eyebrowKey: "selectedPriorityEyebrow",
        titleKey: "serviceFocusCustomerBillingUpsellTitle",
        textKey: "serviceFocusCustomerBillingUpsellText",
        itemKeys: [
          "serviceFocusCustomerBillingUpsellItem1",
          "serviceFocusCustomerBillingUpsellItem2",
          "serviceFocusCustomerBillingUpsellItem3",
          "serviceFocusCustomerBillingUpsellItem4",
        ],
      },
      escalationClosure: {
        eyebrowKey: "selectedPriorityEyebrow",
        titleKey: "serviceFocusCustomerEscalationClosureTitle",
        textKey: "serviceFocusCustomerEscalationClosureText",
        itemKeys: [
          "serviceFocusCustomerEscalationClosureItem1",
          "serviceFocusCustomerEscalationClosureItem2",
          "serviceFocusCustomerEscalationClosureItem3",
          "serviceFocusCustomerEscalationClosureItem4",
        ],
      },
    },
    it: {
      levelOne: {
        eyebrowKey: "selectedPriorityEyebrow",
        titleKey: "serviceFocusItLevelOneTitle",
        textKey: "serviceFocusItLevelOneText",
        itemKeys: [
          "serviceFocusItLevelOneItem1",
          "serviceFocusItLevelOneItem2",
          "serviceFocusItLevelOneItem3",
          "serviceFocusItLevelOneItem4",
          "serviceFocusItLevelOneItem5",
        ],
      },
      levelTwo: {
        eyebrowKey: "selectedPriorityEyebrow",
        titleKey: "serviceFocusItLevelTwoTitle",
        textKey: "serviceFocusItLevelTwoText",
        itemKeys: [
          "serviceFocusItLevelTwoItem1",
          "serviceFocusItLevelTwoItem2",
          "serviceFocusItLevelTwoItem3",
          "serviceFocusItLevelTwoItem4",
          "serviceFocusItLevelTwoItem5",
          "serviceFocusItLevelTwoItem6",
        ],
      },
      escalationFlow: {
        eyebrowKey: "selectedPriorityEyebrow",
        titleKey: "serviceFocusItEscalationFlowTitle",
        textKey: "serviceFocusItEscalationFlowText",
        itemKeys: [
          "serviceFocusItEscalationFlowItem1",
          "serviceFocusItEscalationFlowItem2",
          "serviceFocusItEscalationFlowItem3",
          "serviceFocusItEscalationFlowItem4",
          "serviceFocusItEscalationFlowItem5",
        ],
      },
    },
  };

  function getServiceFocusText(key) {
    if (window.I18N?.t) return window.I18N.t(key);
    return window.I18N_DB?.en?.[key] || key;
  }

  function renderServiceFocus(display, data) {
    if (!display || !data) return;

    const eyebrow = document.createElement("p");
    eyebrow.className = "eyebrow";
    eyebrow.textContent = getServiceFocusText(data.eyebrowKey);

    const title = document.createElement("h3");
    title.textContent = getServiceFocusText(data.titleKey);

    const description = document.createElement("p");
    description.textContent = getServiceFocusText(data.textKey);

    const list = document.createElement("ul");
    data.itemKeys.forEach((itemKey) => {
      const item = document.createElement("li");
      item.textContent = getServiceFocusText(itemKey);
      list.appendChild(item);
    });

    display.replaceChildren(eyebrow, title, description, list);
  }

  function initServiceFocusPanels() {
    const boards = Array.from(
      document.querySelectorAll("[data-service-focus-board]"),
    );
    if (!boards.length) return;

    const syncBoard = (board) => {
      const boardKey = board.getAttribute("data-service-focus-board");
      const boardContent = SERVICE_FOCUS_CONTENT[boardKey];
      if (!boardContent) return;

      const tabs = Array.from(board.querySelectorAll("[data-service-focus]"));
      const display = board.querySelector(".service-focus-display, .focus-display");
      if (!tabs.length || !display) return;

      const activeTab =
        tabs.find((tab) => tab.getAttribute("aria-selected") === "true") ||
        tabs[0];
      const activeKey = activeTab.getAttribute("data-service-focus");
      renderServiceFocus(display, boardContent[activeKey]);
    };

    boards.forEach((board) => {
      const boardKey = board.getAttribute("data-service-focus-board");
      const boardContent = SERVICE_FOCUS_CONTENT[boardKey];
      if (!boardContent) return;

      const tabs = Array.from(board.querySelectorAll("[data-service-focus]"));
      const display = board.querySelector(".service-focus-display, .focus-display");
      if (!tabs.length || !display) return;

      tabs.forEach((tab) => {
        tab.addEventListener("click", () => {
          const focusKey = tab.getAttribute("data-service-focus");
          const focusContent = boardContent[focusKey];
          if (!focusContent) return;

          tabs.forEach((item) => {
            item.classList.remove("active", "is-active");
            item.setAttribute("aria-selected", "false");
          });
          tab.classList.add("active");
          tab.setAttribute("aria-selected", "true");
          renderServiceFocus(display, focusContent);
        });
      });

      syncBoard(board);
    });

    window.addEventListener("language:changed", () => {
      boards.forEach(syncBoard);
    });
  }

  function initRoyalDarkPointerEffects() {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduceMotion) return;

    window.addEventListener(
      "pointermove",
      (event) => {
        const x = `${(event.clientX / window.innerWidth) * 100}%`;
        const y = `${(event.clientY / window.innerHeight) * 100}%`;
        document.documentElement.style.setProperty("--mouse-x", x);
        document.documentElement.style.setProperty("--mouse-y", y);
        document.body.classList.add("mouse-active");
      },
      { passive: true },
    );

    window.addEventListener("pointerleave", () => {
      document.body.classList.remove("mouse-active");
    });
  }


  window.GABO_IO_CHATBOT_UTILS = Object.freeze({
    runTinyMlSanitizer,
    sha256Hex,
  });



  function initContactFormEnhancements() {
    const form = document.querySelector("#contactForm[data-contact-form]");
    const mount = form?.querySelector("[data-contact-dynamic-groups]");
    if (!form || !mount || form.dataset.contactUiReady === "true") return;

    const CACHE_KEY = "gabo_contact_v3";
    const ARRAY_KEYS = [
      "areaOfInterest",
      "experience",
      "experienceLevel",
      "languages",
      "languageLevel",
      "skills",
      "skillLevel",
      "education",
      "educationLevel",
    ];

    const defaultState = {
      firstName: "",
      lastName: "",
      emailAddress: "",
      countryCode: "",
      contactNumber: "",
      city: "",
      stateProvince: "",
      countryZipCode: "",
      bestContactDate: "",
      bestContactTime: "",
      expectations: "",
      areaOfInterest: [],
      experience: [],
      experienceLevel: [],
      languages: [],
      languageLevel: [],
      skills: [],
      skillLevel: [],
      education: [],
      educationLevel: [],
    };

    const translate = (key, fallback) => window.I18N?.t?.(key) || fallback || key;

    const option = (valueKey, fallback) => ({ value: fallback, labelKey: valueKey, fallback });

    const selectData = {
      areaOfInterest: [
        option("careersOptionItSupport", "IT Support"),
        option("careersOptionCustomerRelations", "Customer Relations"),
        option("careersOptionLogistics", "Logistics"),
        option("careersOptionAdministrationBackOffice", "Administration Back Office"),
      ],
      experienceLevel: [
        option("experienceLevelEntry", "Entry"),
        option("experienceLevelJunior", "Junior"),
        option("experienceLevelIntermediate", "Intermediate"),
        option("experienceLevelAdvance", "Advance"),
        option("experienceLevelSenior", "Senior"),
        option("experienceLevelExpert", "Expert"),
        option("experienceLevelEngineer", "Engineer"),
        option("experienceLevelLowerManagement", "Lower Management"),
        option("experienceLevelTopManagement", "Top Management"),
        option("experienceLevelSeniorManagement", "Senior Management"),
        option("experienceLevelCSuite", "C Suite"),
      ],
      languageLevel: [
        option("languageLevelBeginner", "Beginner"),
        option("languageLevelElementary", "Elementary"),
        option("languageLevelIntermediate", "Intermediate"),
        option("languageLevelUpperIntermediate", "Upper Intermediate"),
        option("languageLevelAdvanced", "Advanced"),
        option("languageLevelProficient", "Proficient"),
      ],
      skillLevel: [
        option("skillLevelNovice", "Novice"),
        option("skillLevelAdvancedBeginner", "Advanced Beginner"),
        option("skillLevelProficient", "Proficient"),
        option("skillLevelExpert", "Expert"),
      ],
      educationLevel: [
        option("educationOptionGed", "GED"),
        option("educationOptionHighSchool", "High School"),
        option("educationOptionSomeCollege", "Some College"),
        option("educationOptionAssociateDegree", "Associate Degree"),
        option("educationOptionGraduate", "Graduate"),
        option("educationOptionMasters", "Masters"),
        option("educationOptionDoctorate", "Doctorate"),
        option("educationOptionCertified", "Certified"),
      ],
    };

    const pairs = [
      {
        key: "areaOfInterest",
        titleKey: "areaInterestLabel",
        fallbackTitle: "Area Of Interest",
        type: "select",
        options: selectData.areaOfInterest,
      },
      {
        key: "experience",
        titleKey: "experienceLabel",
        fallbackTitle: "Experience",
        pairKey: "experienceLevel",
        pairTitleKey: "experienceLevelLabel",
        pairFallbackTitle: "Experience Level",
        pairOptions: selectData.experienceLevel,
      },
      {
        key: "languages",
        titleKey: "languagesLabel",
        fallbackTitle: "Language",
        pairKey: "languageLevel",
        pairTitleKey: "languageLevelLabel",
        pairFallbackTitle: "Language Level",
        pairOptions: selectData.languageLevel,
      },
      {
        key: "skills",
        titleKey: "skillsLabel",
        fallbackTitle: "Skill",
        pairKey: "skillLevel",
        pairTitleKey: "skillLevelLabel",
        pairFallbackTitle: "Skill Level",
        pairOptions: selectData.skillLevel,
      },
      {
        key: "education",
        titleKey: "educationLabel",
        fallbackTitle: "Education",
        pairKey: "educationLevel",
        pairTitleKey: "educationLevelLabel",
        pairFallbackTitle: "Education Level",
        pairOptions: selectData.educationLevel,
      },
    ];

    const state = { ...defaultState };

    try {
      const cached = JSON.parse(window.localStorage?.getItem(CACHE_KEY) || "{}");
      Object.entries(cached).forEach(([key, value]) => {
        if (!(key in state)) return;
        state[key] = ARRAY_KEYS.includes(key) ? (Array.isArray(value) ? value : []) : String(value || "");
      });
    } catch (error) {
      window.localStorage?.removeItem(CACHE_KEY);
    }

    const save = () => {
      try {
        window.localStorage?.setItem(CACHE_KEY, JSON.stringify(state));
      } catch (error) {
        form.dataset.contactDraftStorage = "unavailable";
      }
    };

    const make = (tag, className) => {
      const node = document.createElement(tag);
      if (className) node.className = className;
      return node;
    };

    const createLabel = (forId, text) => {
      const label = make("label");
      label.setAttribute("for", forId);
      label.textContent = text;
      return label;
    };

    const optionLabel = (item) => translate(item.labelKey, item.fallback);

    const fillSelect = (select, options, placeholder) => {
      select.innerHTML = "";
      if (placeholder) {
        const placeholderOption = document.createElement("option");
        placeholderOption.disabled = true;
        placeholderOption.hidden = true;
        placeholderOption.value = "";
        placeholderOption.textContent = placeholder;
        select.appendChild(placeholderOption);
      }
      options.forEach((item) => {
        const entry = document.createElement("option");
        entry.value = item.value;
        entry.textContent = optionLabel(item);
        select.appendChild(entry);
      });
    };

    const readFormValue = (name) => String(form.elements[name]?.value || "");

    const syncCompatibilityFields = () => {
      const fullName = form.querySelector("[data-contact-full-name]");
      const message = form.querySelector("[data-contact-message]");
      const combinedName = [readFormValue("firstName"), readFormValue("lastName")]
        .map((value) => String(value || "").trim())
        .filter(Boolean)
        .join(" ");
      const expectations = readFormValue("expectations");

      if (fullName && fullName.value !== combinedName) fullName.value = combinedName;
      if (message && message.value !== expectations) message.value = expectations;
    };

    const syncStaticField = (key) => {
      const field = form.elements[key];
      if (!field || ARRAY_KEYS.includes(key)) return;
      field.value = state[key] || "";
      field.addEventListener(field.tagName === "SELECT" ? "change" : "input", () => {
        state[key] = field.value;
        syncCompatibilityFields();
        save();
      });
    };

    const push = (spec) => {
      const options = spec.options || [];
      state[spec.key].push(spec.type === "select" && options[0] ? options[0].value : "");
      if (spec.pairKey) {
        state[spec.pairKey].push(spec.pairOptions?.[0]?.value || "");
      }
    };

    const remove = (spec, index) => {
      state[spec.key].splice(index, 1);
      if (spec.pairKey) state[spec.pairKey].splice(index, 1);
    };

    const createControl = ({ id, label, control, className = "form-control" }) => {
      const wrapper = make("div", className);
      control.id = id;
      control.setAttribute("aria-label", label);
      wrapper.append(control, createLabel(id, label));
      return wrapper;
    };

    const createRow = (spec, index) => {
      const row = make("div", "dynamic-row");
      const title = translate(spec.titleKey, spec.fallbackTitle);
      const first = document.createElement(spec.type === "select" ? "select" : "input");
      const firstId = `contact-${spec.key}-${index}`;

      first.name = `${spec.key}[]`;
      first.required = false;

      if (spec.type === "select") {
        fillSelect(first, spec.options, "");
        first.value = state[spec.key][index] || spec.options[0]?.value || "";
        first.addEventListener("change", () => {
          state[spec.key][index] = first.value;
          save();
        });
      } else {
        first.placeholder = " ";
        first.value = state[spec.key][index] || "";
        first.addEventListener("input", () => {
          state[spec.key][index] = first.value;
          save();
        });
      }

      row.append(createControl({ id: firstId, label: title, control: first }));

      if (spec.pairKey) {
        const pairLabel = translate(spec.pairTitleKey, spec.pairFallbackTitle);
        const select = document.createElement("select");
        const selectId = `contact-${spec.pairKey}-${index}`;
        select.name = `${spec.pairKey}[]`;
        select.required = false;
        fillSelect(select, spec.pairOptions, pairLabel);
        select.value = state[spec.pairKey][index] || spec.pairOptions?.[0]?.value || "";
        select.addEventListener("change", () => {
          state[spec.pairKey][index] = select.value;
          save();
        });
        row.append(
          createControl({
            id: selectId,
            label: pairLabel,
            control: select,
            className: "form-control dynamic-select-control",
          }),
        );
      }

      const removeButton = make("button", "remove-btn");
      removeButton.type = "button";
      removeButton.textContent = "−";
      removeButton.setAttribute("aria-label", `${translate("removeSkill", "Remove")} ${title}`);
      removeButton.addEventListener("click", () => {
        remove(spec, index);
        renderGroups();
        save();
      });
      row.append(removeButton);

      return row;
    };

    function renderGroups() {
      mount.innerHTML = "";

      pairs.forEach((spec) => {
        const title = translate(spec.titleKey, spec.fallbackTitle);
        const pairTitle = spec.pairKey ? translate(spec.pairTitleKey, spec.pairFallbackTitle) : "";
        const group = make("section", "dynamic-group");
        const heading = make("h3");
        const rows = make("div", "dynamic-rows");
        const addButton = make("button", "add-btn");

        heading.textContent = pairTitle ? `${title} / ${pairTitle}` : title;
        addButton.type = "button";
        addButton.textContent = translate("addContactEntry", "+ Add");
        addButton.addEventListener("click", () => {
          push(spec);
          renderGroups();
          save();
          mount
            .querySelectorAll(".dynamic-row")
            .item(mount.querySelectorAll(".dynamic-row").length - 1)
            ?.querySelector("input, select")
            ?.focus();
        });

        (state[spec.key] || []).forEach((_, index) => rows.append(createRow(spec, index)));
        group.append(heading, rows, addButton);
        mount.append(group);
      });
    }

    Object.keys(state).forEach(syncStaticField);
    form.addEventListener("submit", syncCompatibilityFields, true);
    window.addEventListener("language:changed", renderGroups);
    form.addEventListener("reset", () => {
      window.setTimeout(() => {
        Object.entries(defaultState).forEach(([key, value]) => {
          state[key] = Array.isArray(value) ? [] : "";
        });
        window.localStorage?.removeItem(CACHE_KEY);
        renderGroups();
        syncCompatibilityFields();
      }, 0);
    });

    form.dataset.contactUiReady = "true";
    renderGroups();
    syncCompatibilityFields();
  }

  function initCareersFormEnhancements() {
    const form = document.querySelector("#careers-application-form");
    if (!form || form.dataset.careersUiReady === "true") return;

    const firstName = form.querySelector("[data-careers-first-name]");
    const lastName = form.querySelector("[data-careers-last-name]");
    const fullName = form.querySelector("[data-careers-full-name]");

    const syncFullName = () => {
      if (!firstName || !lastName || !fullName) return;

      const combined = [firstName.value, lastName.value]
        .map((value) => String(value || "").trim())
        .filter(Boolean)
        .join(" ");

      if (fullName.value !== combined) {
        fullName.value = combined;
        fullName.dispatchEvent(new Event("input", { bubbles: true }));
      }
    };

    const readSelectedText = (select) => {
      if (!select) return "";
      const selected = select.options[select.selectedIndex];
      return String(selected?.textContent || select.value || "").trim();
    };

    const syncCompositeRow = (row) => {
      const textInput = row.querySelector("[data-careers-composite-text]");
      const select = row.querySelector("[data-careers-composite-select]");
      const output = row.querySelector("[data-careers-composite-output]");
      if (!textInput || !output) return;

      const value = String(textInput.value || "").trim();
      const qualifier = readSelectedText(select);
      const composed = value && qualifier ? `${value} — ${qualifier}` : value;

      if (output.value !== composed) {
        output.value = composed;
        output.dispatchEvent(new Event("input", { bubbles: true }));
      }
    };

    const syncCompositeRows = () => {
      form.querySelectorAll("[data-careers-composite-row]").forEach(syncCompositeRow);
    };

    const syncCareersUi = () => {
      syncFullName();
      syncCompositeRows();
    };

    form.addEventListener("input", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;

      if (
        target.matches("[data-careers-first-name], [data-careers-last-name]") ||
        target.matches("[data-careers-composite-text]")
      ) {
        syncCareersUi();
      }
    });

    form.addEventListener("change", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;

      if (target.matches("[data-careers-composite-select]")) {
        syncCareersUi();
      }
    });

    form.addEventListener("submit", syncCareersUi, true);
    form.addEventListener("reset", () => window.setTimeout(syncCareersUi, 0));

    form.dataset.careersUiReady = "true";
    syncCareersUi();
    window.setTimeout(syncCareersUi, 150);
  }


  function initRevealSections() {
    const revealItems = Array.from(document.querySelectorAll(".reveal"));
    if (!revealItems.length) return;

    const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      revealItems.forEach((item) => {
        item.classList.add("is-visible");
        item.dataset.revealObserved = "true";
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          entry.target.dataset.revealObserved = "true";
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.16 },
    );

    revealItems
      .filter((item) => item.dataset.revealObserved !== "true")
      .forEach((item) => {
        item.dataset.revealObserved = "pending";
        observer.observe(item);
      });
  }

  function initDynamicFocusTabs() {
    document.querySelectorAll("[data-dynamic-focus]").forEach((board) => {
      if (board.dataset.dynamicFocusReady === "true") return;
      const tabs = Array.from(board.querySelectorAll("button[data-focus]"));
      const display = board.querySelector("[data-focus-display]");
      if (!tabs.length || !display) return;

      const render = (tab) => {
        const title = document.createElement("h3");
        title.textContent = tab.getAttribute("data-focus-title") || tab.textContent.trim();

        const text = document.createElement("p");
        text.textContent = tab.getAttribute("data-focus-text") || "";

        const list = document.createElement("ul");
        String(tab.getAttribute("data-focus-items") || "")
          .split("|")
          .map((item) => item.trim())
          .filter(Boolean)
          .forEach((itemText) => {
            const item = document.createElement("li");
            item.textContent = itemText;
            list.appendChild(item);
          });

        display.replaceChildren(title, text, list);
        tabs.forEach((item) => {
          const active = item === tab;
          item.classList.toggle("active", active);
          item.classList.toggle("is-active", active);
          item.setAttribute("aria-selected", String(active));
        });
      };

      tabs.forEach((tab) => {
        tab.type = "button";
        tab.addEventListener("click", () => render(tab));
      });

      render(tabs.find((tab) => tab.classList.contains("active")) || tabs[0]);
      board.dataset.dynamicFocusReady = "true";
    });
  }

  function initFocusBoards() {
    document.querySelectorAll("[data-focus-board], .focus-board").forEach((board) => {
      if (board.dataset.focusBoardReady === "true") return;
      const tabs = Array.from(board.querySelectorAll(".focus-tab[data-focus-target]"));
      const panels = Array.from(board.querySelectorAll("[data-focus-panel]"));
      if (!tabs.length || !panels.length) return;

      const activate = (targetId) => {
        tabs.forEach((tab) => {
          const isActive = tab.dataset.focusTarget === targetId;
          tab.classList.toggle("active", isActive);
          tab.setAttribute("aria-selected", String(isActive));
        });

        panels.forEach((panel) => {
          panel.hidden = panel.id !== targetId;
        });
      };

      tabs.forEach((tab) => {
        tab.addEventListener("click", () => {
          const targetId = tab.dataset.focusTarget;
          if (!targetId || !panels.some((panel) => panel.id === targetId)) return;
          activate(targetId);
        });
      });

      const firstTarget = tabs.find((tab) => tab.classList.contains("active"))?.dataset.focusTarget || tabs[0].dataset.focusTarget;
      if (firstTarget) activate(firstTarget);
      board.dataset.focusBoardReady = "true";
    });
  }

  function initPage() {
    initSecurityRuntime();
    initProgressiveWebApp();
    initWebVitalsTelemetry();
    ensurePrimaryNav();
    ensureMobileNav();
    ensureSkipLink();
    initFloatingFields();
    initRepeatableEntryGroups();
    initNumericOnlyInputs();
    initContactFormEnhancements();
    initCareersFormEnhancements();
    initMobileServiceMenu();
    initRevealSections();
    initDynamicFocusTabs();
    initFocusBoards();
    initScrollLazyLoad();
    initServiceFocusPanels();
    initRoyalDarkPointerEffects();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initPage);
  } else {
    initPage();
  }
})();
