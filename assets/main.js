(function () {
  const SECURITY_HEADERS = {
    "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
    "Content-Security-Policy":
      "default-src 'self'; base-uri 'self'; object-src 'none'; form-action 'self' https://gabo.services https://www.gabo.services https://contacto.gabo.services https://careers.gabo.services https://chatbot.gabo.services; upgrade-insecure-requests; block-all-mixed-content; script-src 'self' https://static.cloudflareinsights.com https://challenges.cloudflare.com; style-src 'self'; img-src 'self' data: blob: https:; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https://gabo.services https://www.gabo.services https://contacto.gabo.services https://careers.gabo.services https://chatbot.gabo.services https://*.gabo.services; frame-src 'self' https://challenges.cloudflare.com; worker-src 'self'; manifest-src 'self'; media-src 'self';",
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
    "X-XSS-Protection": "0",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Cross-Origin-Resource-Policy": "same-site",
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
  const TINY_ML_HONEYPOT_SESSION_BLOCK_KEY =
    "gabo-careers-honeypot-session-blocked";

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

  function isHoneypotField(field) {
    return !!field?.matches?.('[data-tinyml-honeypot="true"]');
  }

  function getHoneypotFields(form) {
    return Array.from(form.querySelectorAll('[data-tinyml-honeypot="true"]'));
  }

  function isHoneypotSessionBlocked() {
    try {
      return (
        window.sessionStorage?.getItem(TINY_ML_HONEYPOT_SESSION_BLOCK_KEY) ===
        "true"
      );
    } catch (error) {
      return false;
    }
  }

  function flagHoneypotSessionBlocked() {
    try {
      window.sessionStorage?.setItem(TINY_ML_HONEYPOT_SESSION_BLOCK_KEY, "true");
    } catch (error) {
      document.documentElement.dataset.tinyMlSessionBlocked = "true";
    }
  }

  function closeHoneypotSession(form, statusNode, honeypotField) {
    const honeypotValue = String(honeypotField?.value || "");
    flagHoneypotSessionBlocked();
    form.reset();
    form.removeAttribute("data-integrity-sha256");
    form.dataset.tinyMlSession = "blocked";

    Array.from(form.querySelectorAll("input, textarea, select, button")).forEach(
      (field) => {
        field.disabled = true;
        markFieldState(field, false);
      },
    );

    if (statusNode) {
      statusNode.textContent =
        "TinyML closed this application session after bot-trap activity was detected.";
    }

    return {
      cleaned: {},
      report: [
        {
          key:
            honeypotField?.getAttribute("name") ||
            honeypotField?.id ||
            "honeypot",
          threatScore: TINY_ML_RISK_THRESHOLD,
          residualThreatScore: TINY_ML_BLOCKING_RESIDUAL_THRESHOLD,
          removedCharacters: honeypotValue.length,
          reasons: ["honeypot-filled", "session-closed"],
          blocked: true,
        },
      ],
      blocked: true,
      honeypotTriggered: true,
      sessionClosed: true,
    };
  }

  function detectFilledHoneypot(form) {
    return getHoneypotFields(form).find((field) =>
      String(field.value || "").trim(),
    );
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

  function getFieldKey(field, index) {
    const label =
      field.getAttribute("name") ||
      field.getAttribute("aria-label") ||
      field.closest(".entry-group")?.getAttribute("data-field-name") ||
      field.previousElementSibling?.textContent ||
      field.id ||
      `field-${index + 1}`;
    return `${String(label).trim() || "field"} #${index + 1}`;
  }

  function buildGatewayEnvelope(form, result, fingerprint) {
    return {
      repoId:
        form.getAttribute("data-repo-id") || "unike0dd/redesigned-octo-meme",
      assetId: form.getAttribute("data-asset-id") || "careers.html",
      src: form.getAttribute("data-src") || window.location.pathname,
      origin: window.location.origin,
      formId: form.id || "careers-application-form",
      integritySha256: fingerprint,
      sanitizedAt: new Date().toISOString(),
      tinyMl: {
        policy: "aggressive-client-sanitize-v1",
        threshold: TINY_ML_RISK_THRESHOLD,
        residualThreshold: TINY_ML_BLOCKING_RESIDUAL_THRESHOLD,
        report: result.report,
      },
      payload: result.cleaned,
    };
  }

  async function forwardSanitizedPayload(form, result, statusNode) {
    if (!form.matches('[data-secure-gateway="careers"]')) return;

    const fingerprint = await sha256Hex(JSON.stringify(result.cleaned));
    form.setAttribute("data-integrity-sha256", fingerprint);

    const endpoint =
      form.getAttribute("data-cf-worker-url") ||
      form.getAttribute("data-upstream-path") ||
      "/api/careers";
    const gatewayUrl = new URL(endpoint, window.location.origin);
    const envelope = buildGatewayEnvelope(form, result, fingerprint);

    await fetch(gatewayUrl.toString(), {
      method: "POST",
      mode: "cors",
      credentials: "omit",
      headers: {
        "Content-Type": "application/json",
        "X-Gabo-Origin": envelope.origin,
        "X-Gabo-Source": envelope.src,
        "X-Gabo-Asset-ID": envelope.assetId,
        "X-Gabo-Repo-ID": envelope.repoId,
        "X-Gabo-Integrity-SHA256": fingerprint,
      },
      body: JSON.stringify(envelope),
    });

    if (statusNode) {
      statusNode.textContent =
        "Application payload was sanitized, integrity-signed, and sent to the secure gateway.";
    }
  }

  function markFieldState(field, isInvalid) {
    if (!(field instanceof HTMLElement)) return;
    field.setAttribute("aria-invalid", String(isInvalid));
    field.classList.toggle("is-security-warning", isInvalid);
  }

  function secureFormSubmission(form, statusNode) {
    if (isHoneypotSessionBlocked()) {
      return closeHoneypotSession(form, statusNode);
    }

    const filledHoneypot = detectFilledHoneypot(form);
    if (filledHoneypot) {
      return closeHoneypotSession(form, statusNode, filledHoneypot);
    }

    const elements = Array.from(
      form.querySelectorAll("input, textarea, select"),
    ).filter((field) => !field.disabled && !isHoneypotField(field));

    const payload = {};
    const fieldKeys = new Map();
    elements.forEach((field, index) => {
      const key = getFieldKey(field, index);
      fieldKeys.set(field, key);
      payload[key] = field.value;
    });

    const result = scanAndSanitizePayload(payload);
    elements.forEach((field) => {
      const key = fieldKeys.get(field);
      const line = result.report.find((entry) => entry.key === key);
      const isInvalid = !!line?.blocked;
      markFieldState(field, isInvalid);
      if (typeof result.cleaned[key] === "string") {
        field.value = result.cleaned[key];
      }
    });

    if (statusNode) {
      const threatCount = result.report.filter((entry) => entry.blocked).length;
      statusNode.textContent = result.blocked
        ? `TinyML blocked ${threatCount} field(s). Remove malicious or programming payloads before submitting.`
        : "TinyML cleaned the form and passed residual integrity checks.";
    }

    return result;
  }

  function initSecureForms() {
    const forms = document.querySelectorAll('form[data-secure-gateway="careers"]');
    if (!forms.length) return;

    forms.forEach((form) => {
      if (form.dataset.pageTinyml) return;
      if (form.dataset.secureSubmitInitialized === "true") return;
      form.dataset.secureSubmitInitialized = "true";

      const message = document.createElement("small");
      message.className = "security-form-note";
      message.setAttribute("aria-live", "polite");
      form.appendChild(message);

      getHoneypotFields(form).forEach((field) => {
        field.addEventListener("input", () => {
          if (String(field.value || "").trim()) {
            closeHoneypotSession(form, message, field);
          }
        });
      });

      if (isHoneypotSessionBlocked()) {
        closeHoneypotSession(form, message);
        return;
      }

      form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const submitter = event.submitter;
        if (submitter instanceof HTMLButtonElement) submitter.disabled = true;

        const result = await secureFormSubmission(form, message);
        if (result.blocked) {
          if (submitter instanceof HTMLButtonElement)
            submitter.disabled = false;
          return;
        }

        const usesSecureGateway = form.matches('[data-secure-gateway="careers"]');
        if (!usesSecureGateway) {
          const fingerprint = await sha256Hex(JSON.stringify(result.cleaned));
          form.setAttribute("data-integrity-sha256", fingerprint);
          return;
        }

        event.preventDefault();
        try {
          await forwardSanitizedPayload(form, result, message);
        } catch (error) {
          form.setAttribute("data-gateway-error", String(error?.message || error));
          if (message) {
            message.textContent =
              "TinyML passed, but the secure gateway is unavailable. Please try again.";
          }
        }
      });
    });
  }

  function getSiteBasePath() {
    const parts = window.location.pathname.split("/").filter(Boolean);
    const repoName = "redesigned-octo-meme";
    return parts[0] === repoName ? `/${repoName}` : "";
  }

  function initSecurityRuntime() {
    enforceClientSecurityPolicy();
    initRuntimeErrorDiagnostics();
    window.GaboSecurity = {
      scanAndSanitizePayload,
      sanitizeTextValue,
      simpleThreatScore,
      isHoneypotSessionBlocked,
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

  function setupFloatingField(field) {
    if (!field || field.dataset.floatingFieldReady === "true") return;

    const controls = Array.from(field.querySelectorAll("input, textarea"));
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


  const CHATBOT_CLIENT_NAME = "gabo-io";
  const CHATBOT_NAME = "gabo io";
  const CHATBOT_SYNC = "io-pro-chatbot-v1";
  const CHATBOT_ASSET_ID = "redesigned-octo-meme-chatbot";
  const CHATBOT_ENDPOINT = "https://chatbot.gabo.services/api/chat";
  const CHATBOT_IO_PRO = "required-by-worker";
  const CHATBOT_CACHE_KEY = "gabo-io-chatbot-state";

  function initGaboIoChatbot() {
    if (document.querySelector(".gabo-chatbot-fab")) return;

    const labels = {
      en: {
        fab: "gabo io",
        title: "gabo io",
        subtitle: "",
        placeholder: "Type your message...",
        send: "Send",
        close: "Close",
        opening: "How can I help you today?",
        pending: "…",
        error: "Error: can't reach gabo io right now.",
      },
      es: {
        fab: "gabo io",
        title: "gabo io",
        subtitle: "",
        placeholder: "Escribe tu mensaje...",
        send: "Enviar",
        close: "Cerrar",
        opening: "¿Cómo puedo ayudarte hoy?",
        pending: "…",
        error: "Error: no se puede conectar con gabo io ahora.",
      },
    };

    const getLang = () =>
      window.I18N?.currentLanguage ||
      String(document.documentElement.lang || "en").split("-")[0];

    const getCopy = () => labels[getLang()] || labels.en;
    const sanitizeForWire = (value) => runTinyMlSanitizer(value).cleaned;

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

    function addMsg(text, type) {
      const div = document.createElement("div");
      div.className = `gabo-msg ${type}`;
      div.textContent = text;
      div.dataset.msgType = type;
      log.appendChild(div);
      log.scrollTop = log.scrollHeight;
      return div;
    }

    let chatState = { isOpen: false, lang: getLang(), messages: [], draft: "" };

    function persist(nextState = {}) {
      chatState = { ...chatState, ...nextState, lang: getLang() };
      try { localStorage.setItem(CHATBOT_CACHE_KEY, JSON.stringify(chatState)); } catch (_) {}
    }

    function applyFabVisibility(isOpen) {
      fab.hidden = isOpen;
      fab.setAttribute("aria-hidden", String(isOpen));
    }

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
          leadContext: { source: "website", client: CHATBOT_CLIENT_NAME },
        };
        const sanitizedPayload = JSON.parse(
          JSON.stringify(payload, (_, value) =>
            typeof value === "string" ? sanitizeForWire(value) : value,
          ),
        );
        const sha256 = await sha256Hex(JSON.stringify(sanitizedPayload));
        sanitizedPayload.integrity = "pending-client-integrity";
        sanitizedPayload.integritySha256 = sha256;

        const res = await fetch(CHATBOT_ENDPOINT, {
          method: "POST",
          mode: "cors",
          credentials: "omit",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "X-Gabo-Client": CHATBOT_CLIENT_NAME,
            "X-Gabo-Repo-Sync": CHATBOT_SYNC,
            "X-Gabo-Session-Id": sessionId,
            "X-Gabo-Integrity-SHA256": sha256,
            "X-Ops-Asset-Id": CHATBOT_ASSET_ID,
            "X-IO-Pro": CHATBOT_IO_PRO,
          },
          body: JSON.stringify(sanitizedPayload),
        });
        if (!res.ok) throw new Error('request-failed');
        const data = await res.json();
        pending.textContent = data?.reply || "No reply.";
      } catch (_) { pending.textContent = getCopy().error; }
      finally {
        const messages = Array.from(log.querySelectorAll(".gabo-msg")).map((node) => ({
          type: node.dataset.msgType || "bot",
          text: node.textContent || "",
        }));
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
        chatState = {
          ...chatState,
          ...cached,
          messages: Array.isArray(cached.messages) ? cached.messages : [],
          draft: typeof cached.draft === "string" ? cached.draft : "",
        };
      }
      if (chatState.messages.length) {
        log.innerHTML = "";
        chatState.messages.forEach((message) => {
          if (message && typeof message.text === "string") {
            addMsg(message.text, message.type === "user" ? "user" : "bot");
          }
        });
      }
      input.value = chatState.draft || "";
      if (chatState.isOpen) open();
      else applyFabVisibility(false);
    } catch (_) {}
  }

  function initPage() {
    initSecurityRuntime();
    ensurePrimaryNav();
    ensureMobileNav();
    ensureSkipLink();
    initFloatingFields();
    initRepeatableEntryGroups();
    initNumericOnlyInputs();
    initMobileServiceMenu();
    initScrollLazyLoad();
    initRoyalDarkPointerEffects();
    initSecureForms();
    initGaboIoChatbot();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initPage);
  } else {
    initPage();
  }
})();
