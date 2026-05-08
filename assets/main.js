(function () {
  const SECURITY_HEADERS = {
    "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
    "Content-Security-Policy":
      "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self' https://gabo.services https://www.gabo.services; upgrade-insecure-requests; block-all-mixed-content; script-src 'self' https://static.cloudflareinsights.com https://challenges.cloudflare.com; style-src 'self'; img-src 'self' data: blob: https:; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https://gabo.services https://www.gabo.services https://demo.gabo.services; frame-src 'self' https://challenges.cloudflare.com; worker-src 'self'; manifest-src 'self'; media-src 'self';",
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
    "Access-Control-Allow-Origin": "https://www.gabo.services",
    "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin",
  };

  const CLIENT_SECURITY_POLICIES = {
    "Content-Security-Policy": SECURITY_HEADERS[
      "Content-Security-Policy"
    ].replace("frame-ancestors 'none'; ", ""),
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

  const CONTACT_GATEWAY = {
    repoId: "unike0dd/redesigned-octo-meme",
    sourcePath: "contact.html",
    assetSource: "github-pages-static-contact-form",
    gatewayVersion: "tinyml-sanitizer-v2",
    allowedOrigins: [
      "https://unike0dd.github.io",
      "http://localhost:8080",
      "http://localhost:3000",
      "http://127.0.0.1:8080",
      "http://127.0.0.1:3000",
    ],
  };

  const MALICIOUS_OR_CODE_SIGNATURES = [
    { id: "html-tag", pattern: /<\/?[a-z][\s\S]*?>/gi, weight: 2 },
    {
      id: "dangerous-tag",
      pattern:
        /<\s*\/?\s*(?:script|iframe|object|embed|svg|math|link|meta|base|form|input|button|style|template)\b/gi,
      weight: 5,
    },
    { id: "event-handler", pattern: /\bon[a-z]{3,}\s*=/gi, weight: 4 },
    {
      id: "dangerous-uri",
      pattern: /(?:javascript|vbscript|data|file|blob)\s*:/gi,
      weight: 5,
    },
    {
      id: "encoded-xss",
      pattern:
        /%(?:3c|3e|22|27|2f)|&#x?[0-9a-f]+;|\\x[0-9a-f]{2}|\\u[0-9a-f]{4}/gi,
      weight: 2,
    },
    { id: "code-fence", pattern: /```[\s\S]*?```|~~~[\s\S]*?~~~/g, weight: 5 },
    { id: "inline-code", pattern: /`[^`\n]{2,}`/g, weight: 2 },
    {
      id: "js-execution",
      pattern:
        /\b(?:eval|Function|setTimeout|setInterval|document\.|window\.|location\.|localStorage|sessionStorage|fetch\s*\(|XMLHttpRequest|constructor\s*\()\b/gi,
      weight: 4,
    },
    {
      id: "programming-token",
      pattern:
        /\b(?:function|class|const|let|var|import|export|return|async|await|require|module\.exports|public\s+static\s+void|def\s+\w+|lambda\b)\b/gi,
      weight: 3,
    },
    {
      id: "shell-command",
      pattern:
        /\b(?:curl|wget|bash|sh|powershell|cmd\.exe|chmod|chown|rm\s+-rf|sudo|nc\s+-|python\s+-c|perl\s+-e)\b/gi,
      weight: 4,
    },
    {
      id: "sqli",
      pattern:
        /(?:\bunion\s+select\b|\bselect\b[\s\S]{0,40}\bfrom\b|\binsert\s+into\b|\bupdate\b[\s\S]{0,30}\bset\b|\bdelete\s+from\b|\bdrop\s+(?:table|database)\b|\btruncate\s+table\b|\balter\s+table\b|\bor\s+1\s*=\s*1\b|--\s|\/\*|\*\/)/gi,
      weight: 4,
    },
    {
      id: "path-traversal",
      pattern: /(?:\.\.\/|\.\.\\|%2e%2e%2f|%252e%252e%252f)/gi,
      weight: 4,
    },
    {
      id: "template-injection",
      pattern: /(?:\$\{|<%|%>|\{\{|\}\}|\[\[|\]\])/g,
      weight: 3,
    },
    {
      id: "dense-code-punctuation",
      pattern: /[{}()[\];=<>]{4,}|(?:=>|&&|\|\||::|\/\*)/g,
      weight: 2,
    },
  ];

  const CODE_LIKE_LINE =
    /(?:^|\s)(?:function|class|const|let|var|import|export|return|if\s*\(|for\s*\(|while\s*\(|switch\s*\(|try\s*\{|catch\s*\(|def\s+\w+|SELECT\s+.*\s+FROM|INSERT\s+INTO|UPDATE\s+.*\s+SET|DELETE\s+FROM)\b|[{};]{2,}|=>|<\/?[a-z][\s\S]*?>/i;

  function decodeSuspiciousEncodings(value) {
    let decoded = String(value || "");
    const textarea = document.createElement("textarea");
    for (let i = 0; i < 2; i += 1) {
      textarea.innerHTML = decoded;
      const htmlDecoded = textarea.value;
      const uriDecoded = htmlDecoded.replace(/%[0-9a-f]{2}/gi, (match) => {
        const charCode = parseInt(match.slice(1), 16);
        return Number.isFinite(charCode)
          ? String.fromCharCode(charCode)
          : match;
      });
      if (uriDecoded === decoded) break;
      decoded = uriDecoded;
    }
    return decoded;
  }

  function tinyMlRiskScan(value) {
    const text = decodeSuspiciousEncodings(value);
    if (!text.trim()) return { score: 0, signatures: [], density: 0 };

    const signatures = [];
    let score = 0;
    MALICIOUS_OR_CODE_SIGNATURES.forEach(({ id, pattern, weight }) => {
      pattern.lastIndex = 0;
      const matches = text.match(pattern) || [];
      if (!matches.length) return;
      signatures.push({ id, count: matches.length });
      score += matches.length * weight;
    });

    const punctuationMatches = text.match(/[{}()[\];=<>`$\\/|&]/g) || [];
    const density = punctuationMatches.length / Math.max(text.length, 1);
    if (text.length > 24 && density > 0.18) {
      signatures.push({ id: "punctuation-density", count: 1 });
      score += 5;
    }

    const codeLikeLines = text
      .split(/\r?\n/)
      .filter((line) => CODE_LIKE_LINE.test(line.trim())).length;
    if (codeLikeLines) {
      signatures.push({ id: "code-like-line", count: codeLikeLines });
      score += codeLikeLines * 4;
    }

    return { score, signatures, density };
  }

  function simpleThreatScore(value) {
    return tinyMlRiskScan(value).score;
  }

  function removeCodeLikeLines(value) {
    return String(value || "")
      .split(/\r?\n/)
      .filter((line) => !CODE_LIKE_LINE.test(line.trim()))
      .join(" ");
  }

  function sanitizeTextValue(value) {
    const decoded = decodeSuspiciousEncodings(value);
    return removeCodeLikeLines(decoded)
      .replace(/```[\s\S]*?```|~~~[\s\S]*?~~~/g, " ")
      .replace(/`[^`\n]{2,}`/g, " ")
      .replace(
        /<\s*(script|style|iframe|object|embed|svg|math|template)\b[\s\S]*?<\s*\/\s*\1\s*>/gi,
        " ",
      )
      .replace(
        /<\s*\/?\s*(?:script|iframe|object|embed|svg|math|link|meta|base|form|input|button|style|template)[^>]*>/gi,
        " ",
      )
      .replace(/\s+on[a-z]{3,}\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, " ")
      .replace(/(?:javascript|vbscript|data|file|blob)\s*:/gi, " ")
      .replace(
        /\b(?:eval|Function|setTimeout|setInterval|XMLHttpRequest|document\.|window\.|location\.|localStorage|sessionStorage|fetch\s*\()[^\s]*/gi,
        " ",
      )
      .replace(
        /\b(?:union\s+select|drop\s+table|truncate\s+table|alter\s+table|insert\s+into|delete\s+from|or\s+1\s*=\s*1)\b/gi,
        " ",
      )
      .replace(/<\/?[a-z][\s\S]*?>/gi, " ")
      .replace(/[<>`{}()[\];$\\|]/g, " ")
      .replace(/[\u0000-\u001F\u007F]/g, " ")
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
      const rawScan = tinyMlRiskScan(rawValue);
      const residualScan = tinyMlRiskScan(normalized);
      const changed = String(rawValue || "") !== normalized;
      cleaned[key] = normalized;
      report.push({
        key,
        changed,
        threatScore: rawScan.score,
        residualScore: residualScan.score,
        signatures: rawScan.signatures,
        residualSignatures: residualScan.signatures,
        blocked: rawScan.score >= 7 || residualScan.score > 0,
      });
    });

    const blocked = report.some((entry) => entry.blocked);
    return { cleaned, report, blocked };
  }

  function markFieldState(field, isInvalid) {
    if (!(field instanceof HTMLElement)) return;
    field.setAttribute("aria-invalid", String(isInvalid));
    field.classList.toggle("is-security-warning", isInvalid);
  }

  function getFieldSecurityKey(field, index) {
    const label = field.id
      ? document.querySelector(`label[for="${field.id}"]`)?.textContent
      : "";
    const group = field
      .closest("[data-field-name]")
      ?.getAttribute("data-field-name");
    const key =
      field.getAttribute("name") ||
      field.getAttribute("aria-label") ||
      label ||
      field.previousElementSibling?.textContent ||
      group ||
      field.id ||
      `field-${index + 1}`;
    return `${key.trim() || "field"} #${index + 1}`;
  }

  function buildContactGatewayEnvelope(form, result, fingerprint) {
    return {
      meta: {
        repoId: form.dataset.repoId || CONTACT_GATEWAY.repoId,
        sourcePath: form.dataset.sourcePath || CONTACT_GATEWAY.sourcePath,
        assetSource: form.dataset.assetSource || CONTACT_GATEWAY.assetSource,
        gatewayVersion: CONTACT_GATEWAY.gatewayVersion,
        origin: window.location.origin,
        href: window.location.href,
        integritySha256: fingerprint,
        sanitizedAt: new Date().toISOString(),
      },
      payload: result.cleaned,
      securityReport: result.report.map((entry) => ({
        key: entry.key,
        changed: entry.changed,
        threatScore: entry.threatScore,
        residualScore: entry.residualScore,
        signatures: entry.signatures.map((signature) => signature.id),
        residualSignatures: entry.residualSignatures.map(
          (signature) => signature.id,
        ),
      })),
    };
  }

  function verifyGatewayRoute(form, endpoint) {
    const expectedRepo = form.dataset.repoId || CONTACT_GATEWAY.repoId;
    const expectedSource =
      form.dataset.sourcePath || CONTACT_GATEWAY.sourcePath;
    const allowedOrigins = new Set([
      ...CONTACT_GATEWAY.allowedOrigins,
      window.location.origin,
    ]);
    const currentPath = window.location.pathname.replace(/^\//, "");
    const sourceMatches =
      currentPath.endsWith(expectedSource) ||
      currentPath.endsWith("contact.html");
    const repoMatches = expectedRepo === CONTACT_GATEWAY.repoId;
    const endpointUrl = new URL(endpoint, window.location.href);
    const endpointAllowed =
      endpointUrl.origin === window.location.origin ||
      endpointUrl.hostname.endsWith(".workers.dev");
    const originAllowed = allowedOrigins.has(window.location.origin);

    return {
      allowed: sourceMatches && repoMatches && endpointAllowed && originAllowed,
      sourceMatches,
      repoMatches,
      endpointAllowed,
      originAllowed,
      endpointUrl,
    };
  }

  async function forwardSanitizedContact(form, result, fingerprint) {
    const endpoint = form.dataset.upstreamEndpoint;
    if (!endpoint) return { skipped: true };

    const route = verifyGatewayRoute(form, endpoint);
    if (!route.allowed) {
      return {
        blocked: true,
        reason: "Gateway origin/source/repository verification failed.",
      };
    }

    const response = await fetch(route.endpointUrl.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Gabo-Repo-Id": form.dataset.repoId || CONTACT_GATEWAY.repoId,
        "X-Gabo-Source-Path":
          form.dataset.sourcePath || CONTACT_GATEWAY.sourcePath,
        "X-Gabo-Integrity-SHA256": fingerprint,
      },
      credentials: "omit",
      referrerPolicy: "strict-origin-when-cross-origin",
      body: JSON.stringify(
        buildContactGatewayEnvelope(form, result, fingerprint),
      ),
    });

    return { ok: response.ok, status: response.status };
  }

  async function secureFormSubmission(form, statusNode) {
    const elements = Array.from(
      form.querySelectorAll("input, textarea, select"),
    ).filter((field) => !field.disabled);

    const payload = {};
    elements.forEach((field, index) => {
      payload[getFieldSecurityKey(field, index)] = field.value;
    });

    const result = scanAndSanitizePayload(payload);
    elements.forEach((field, index) => {
      const key = getFieldSecurityKey(field, index);
      const line = result.report.find((entry) => entry.key === key);
      const isInvalid = !!line?.blocked;
      markFieldState(field, isInvalid);
      if (typeof result.cleaned[key] === "string") {
        field.value = result.cleaned[key];
      }
    });

    if (statusNode) {
      statusNode.textContent = result.blocked
        ? "Potentially malicious or programming-like input was blocked after TinyML sanitation. Please remove script/code fragments."
        : "Input passed TinyML sanitation, residual scanning, and integrity checks.";
    }

    return result;
  }

  function initSecureForms() {
    const forms = document.querySelectorAll("form");
    if (!forms.length) return;

    forms.forEach((form) => {
      if (form.dataset.secureSubmitInitialized === "true") return;
      form.dataset.secureSubmitInitialized = "true";

      const message = document.createElement("small");
      message.className = "security-form-note";
      message.setAttribute("aria-live", "polite");
      form.appendChild(message);

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

        const fingerprint = await sha256Hex(JSON.stringify(result.cleaned));
        form.setAttribute("data-integrity-sha256", fingerprint);
        const upstream = await forwardSanitizedContact(
          form,
          result,
          fingerprint,
        );

        if (upstream.blocked) {
          message.textContent = upstream.reason;
          if (submitter instanceof HTMLButtonElement)
            submitter.disabled = false;
          return;
        }

        message.textContent = upstream.skipped
          ? "Input is sanitized and ready for the verified Cloudflare Worker gateway."
          : upstream.ok
            ? "Sanitized contact request was securely forwarded to the verified gateway."
            : "Sanitized input passed locally, but the upstream gateway did not accept it. Please try again later.";
        if (submitter instanceof HTMLButtonElement) submitter.disabled = false;
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
      tinyMlRiskScan,
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
      const inputName = firstInput?.getAttribute("name") || `${fieldName}[]`;

      addBtn.addEventListener("click", () => {
        const row = document.createElement("div");
        row.className = "entry-row";
        const input = document.createElement("input");
        input.setAttribute("name", inputName);
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
