(function () {
  const PAGE_NAME = "careers";
  const FORM_SELECTOR = 'form[data-secure-gateway="careers"]';
  const DEFAULT_ENDPOINT = "/api/careers";
  const SECURITY_HEADERS = {
    "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
    "Content-Security-Policy":
      "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self' https://gabo.services https://www.gabo.services; upgrade-insecure-requests; block-all-mixed-content; script-src 'self' https://static.cloudflareinsights.com https://challenges.cloudflare.com; style-src 'self'; img-src 'self' data: blob: https:; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https://gabo.services https://www.gabo.services https://demo.gabo.services; frame-src 'self' https://challenges.cloudflare.com; worker-src 'self'; manifest-src 'self'; media-src 'self';",
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
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
  const MAX_FIELD_LENGTH = 2000;
  const RISK_THRESHOLD = 3;
  const RESIDUAL_THRESHOLD = 1;
  const BLOCK_KEY = `gabo-${PAGE_NAME}-tinyml-session-blocked`;
  const RISK_SIGNATURES = [
    { label: "script-tag", weight: 4, pattern: /<\s*\/?\s*script\b/gi },
    {
      label: "dangerous-html-tag",
      weight: 3,
      pattern:
        /<\s*\/?\s*(?:iframe|object|embed|applet|meta|link|base|form|input|button|svg|math|template|style)\b/gi,
    },
    { label: "event-handler", weight: 3, pattern: /\bon[a-z]{3,}\s*=/gi },
    { label: "active-uri", weight: 4, pattern: /\b(?:javascript|vbscript|data)\s*:/gi },
    { label: "html-tag", weight: 2, pattern: /<\/?[a-z][\s\S]*?>/gi },
    { label: "code-block", weight: 4, pattern: /```[\s\S]*?```|~~~[\s\S]*?~~~/g },
    { label: "inline-code", weight: 2, pattern: /`[^`\n]{2,}`/g },
    {
      label: "js-code-token",
      weight: 3,
      pattern:
        /\b(?:eval|Function|setTimeout|setInterval|fetch|XMLHttpRequest|document\.|window\.|localStorage|sessionStorage|import\s|require\s*\(|process\.)\b/gi,
    },
    {
      label: "sql-injection",
      weight: 3,
      pattern:
        /(?:\bunion\s+(?:all\s+)?select\b|\bselect\b[\s\S]{0,80}\bfrom\b|\binsert\s+into\b|\bdelete\s+from\b|\bdrop\s+table\b|--\s*$)/gim,
    },
    { label: "shell-command", weight: 3, pattern: /\b(?:curl|wget|bash|powershell|cmd\.exe|rm\s+-rf)\b/gi },
    { label: "punctuation-burst", weight: 2, pattern: /(?:[{}()[\];=<>|&]{5,}|[A-Za-z_$][\w$]*\s*=>)/g },
  ];

  function decodeHtmlEntities(value) {
    const text = String(value || "");
    if (!/[&][#a-z0-9]+;/i.test(text) || !document.createElement) return text;
    const decoder = document.createElement("textarea");
    decoder.innerHTML = text;
    return decoder.value;
  }

  function threatSummary(value) {
    const text = decodeHtmlEntities(value);
    const reasons = [];
    const score = RISK_SIGNATURES.reduce((total, signature) => {
      const matches = text.match(signature.pattern);
      if (!matches) return total;
      reasons.push(signature.label);
      return total + matches.length * signature.weight;
    }, 0);
    const punctuation = text.replace(/[\w\s.,'"@:+/#-]/g, "").length;
    const density = text.length ? punctuation / text.length : 0;
    if (text.length > 24 && density > 0.22) reasons.push("punctuation-density");
    return {
      score: score + (text.length > 24 && density > 0.22 ? 2 : 0),
      reasons: Array.from(new Set(reasons)),
    };
  }

  function cleanseText(value) {
    return decodeHtmlEntities(value)
      .split(/\r?\n/)
      .filter((line) => !/^\s*(?:const|let|var|function|class|def|import|export|return|if|for|while)\b/i.test(line))
      .join(" ")
      .replace(/```[\s\S]*?```|~~~[\s\S]*?~~~/g, " ")
      .replace(/`[^`\n]{2,}`/g, " ")
      .replace(/<\s*(script|style|iframe|object|embed|applet|svg|math|template)[\s\S]*?<\s*\/\s*\1\s*>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\b(?:javascript|vbscript|data)\s*:[^\s,;)]*/gi, " ")
      .replace(/\bon[a-z]{3,}\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/gi, " ")
      .replace(/(?:\/\*[\s\S]*?\*\/|<!--|-->|--\s*$)/gm, " ")
      .replace(/[<>`{}()[\];|\\]/g, " ")
      .replace(/[\u0000-\u001F\u007F]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, MAX_FIELD_LENGTH);
  }

  function scanField(value) {
    const raw = String(value || "");
    const cleaned = cleanseText(raw);
    const rawThreat = threatSummary(raw);
    const residualThreat = threatSummary(cleaned);
    return {
      cleaned,
      blocked: rawThreat.score >= RISK_THRESHOLD || residualThreat.score >= RESIDUAL_THRESHOLD,
      removedCharacters: Math.max(raw.length - cleaned.length, 0),
      threatScore: rawThreat.score,
      residualThreatScore: residualThreat.score,
      reasons: Array.from(new Set([...rawThreat.reasons, ...residualThreat.reasons])),
    };
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

  function collectPayload(form) {
    const fields = Array.from(form.querySelectorAll("input, textarea, select")).filter(
      (field) => !field.disabled && !field.matches('[data-tinyml-honeypot="true"]'),
    );
    const payload = {};
    const fieldKeys = new Map();
    fields.forEach((field, index) => {
      const key = getFieldKey(field, index);
      fieldKeys.set(field, key);
      payload[key] = field.value;
    });
    return { fields, fieldKeys, payload };
  }

  function scanPayload(payload) {
    const cleaned = {};
    const report = Object.entries(payload).map(([key, value]) => {
      const result = scanField(value);
      cleaned[key] = result.cleaned;
      return { key, ...result };
    });
    return { cleaned, report, blocked: report.some((entry) => entry.blocked) };
  }

  function createSession() {
    const sessionId =
      (window.crypto?.randomUUID && window.crypto.randomUUID()) ||
      `${PAGE_NAME}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const bytes = new Uint8Array(32);
    if (window.crypto?.getRandomValues) {
      window.crypto.getRandomValues(bytes);
    } else {
      for (let index = 0; index < bytes.length; index += 1) {
        bytes[index] = Math.floor(Math.random() * 256);
      }
    }
    const nonce = Array.from(bytes)
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
    return { sessionId, nonce, issuedAt: new Date().toISOString() };
  }

  function stableStringify(value) {
    if (value === null || typeof value !== "object") return JSON.stringify(value);
    if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`)
      .join(",")}}`;
  }

  async function sha256Hex(value) {
    if (!window.crypto?.subtle || !window.TextEncoder) return "";
    const digest = await window.crypto.subtle.digest("SHA-256", new TextEncoder().encode(String(value || "")));
    return Array.from(new Uint8Array(digest))
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
  }

  function ensureStatus(form) {
    let status = form.querySelector(".security-form-note");
    if (!status) {
      status = document.createElement("small");
      status.className = "security-form-note";
      status.setAttribute("aria-live", "polite");
      form.appendChild(status);
    }
    return status;
  }

  function closeSession(form, status, honeypotField) {
    window.sessionStorage?.setItem(BLOCK_KEY, "true");
    form.reset();
    form.dataset.tinyMlSession = "blocked";
    Array.from(form.querySelectorAll("input, textarea, select, button")).forEach((field) => {
      field.disabled = true;
      field.setAttribute("aria-invalid", "true");
    });
    status.textContent = `${PAGE_NAME} TinyML closed this session after bot-trap activity was detected.`;
    return {
      cleaned: {},
      blocked: true,
      report: [
        {
          key: honeypotField?.name || honeypotField?.id || "honeypot",
          blocked: true,
          reasons: ["honeypot-filled", "session-closed"],
        },
      ],
    };
  }

  function buildEnvelope(form, result, fingerprint, session, source) {
    return {
      type: `${PAGE_NAME}-form-submission`,
      repoId: form.getAttribute("data-repo-id") || "unike0dd/redesigned-octo-meme",
      assetId: form.getAttribute("data-asset-id") || form.getAttribute("data-source-path") || `${PAGE_NAME}.html`,
      src: source,
      origin: window.location.origin,
      formId: form.id || `${PAGE_NAME}-form`,
      sanitizedAt: new Date().toISOString(),
      integritySha256: fingerprint,
      clientSession: {
        id: session.sessionId,
        nonce: session.nonce,
        issuedAt: session.issuedAt,
      },
      clientIntegrity: {
        checked: true,
        checked_at: new Date().toISOString(),
        sha256: fingerprint,
        fingerprintBase: "route+origin+source+session_id+nonce+cleanedFields",
        report: result.report,
      },
      securityHeaders: { ...SECURITY_HEADERS },
      tinyMl: {
        page: PAGE_NAME,
        policy: `${PAGE_NAME}-tinyml-cleanse-v1`,
        threshold: RISK_THRESHOLD,
        residualThreshold: RESIDUAL_THRESHOLD,
        report: result.report,
      },
      payload: result.cleaned,
    };
  }

  async function sendEnvelope(form, result, status) {
    const endpoint = form.getAttribute("data-cf-worker-url") || form.getAttribute("data-upstream-path") || form.action || DEFAULT_ENDPOINT;
    const source = form.getAttribute("data-src") || form.getAttribute("data-source-path") || window.location.pathname;
    const session = createSession();
    const fingerprintBase = {
      route: PAGE_NAME,
      origin: window.location.origin,
      source,
      session_id: session.sessionId,
      nonce: session.nonce,
      cleanedFields: result.cleaned,
    };
    const fingerprint = await sha256Hex(stableStringify(fingerprintBase));
    form.setAttribute("data-integrity-sha256", fingerprint);
    const envelope = buildEnvelope(form, result, fingerprint, session, source);
    const response = await fetch(new URL(endpoint, window.location.origin).toString(), {
      method: "POST",
      mode: "cors",
      credentials: "omit",
      headers: {
        "Content-Type": "application/json",
        "X-Gabo-Origin": envelope.origin,
        "X-Gabo-Source": envelope.src,
        "X-Gabo-Asset-ID": envelope.assetId,
        "X-Gabo-Repo-ID": envelope.repoId,
        "X-Gabo-Session-Id": session.sessionId,
        "X-Gabo-Nonce": session.nonce,
        "X-Gabo-Integrity-SHA256": fingerprint,
      },
      body: JSON.stringify(envelope),
    });
    if (!response.ok) throw new Error(`${PAGE_NAME} repo worker returned ${response.status}`);
    status.textContent = `${PAGE_NAME} TinyML cleansed, signed, and sent the submission to its repo worker.`;
  }

  function initForm(form) {
    if (form.dataset[`${PAGE_NAME}TinyMlInitialized`] === "true") return;
    form.dataset[`${PAGE_NAME}TinyMlInitialized`] = "true";
    const status = ensureStatus(form);
    if (window.sessionStorage?.getItem(BLOCK_KEY) === "true") {
      closeSession(form, status);
      return;
    }
    Array.from(form.querySelectorAll('[data-tinyml-honeypot="true"]')).forEach((field) => {
      field.addEventListener("input", () => {
        if (String(field.value || "").trim()) closeSession(form, status, field);
      });
    });
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const honeypotField = Array.from(form.querySelectorAll('[data-tinyml-honeypot="true"]')).find((field) => String(field.value || "").trim());
      if (honeypotField) {
        closeSession(form, status, honeypotField);
        return;
      }
      const submitter = event.submitter;
      if (submitter instanceof HTMLButtonElement) submitter.disabled = true;
      const { fields, fieldKeys, payload } = collectPayload(form);
      const result = scanPayload(payload);
      fields.forEach((field) => {
        const key = fieldKeys.get(field);
        const item = result.report.find((entry) => entry.key === key);
        field.value = result.cleaned[key] || "";
        field.setAttribute("aria-invalid", String(!!item?.blocked));
        field.classList.toggle("is-security-warning", !!item?.blocked);
      });
      if (result.blocked) {
        status.textContent = `${PAGE_NAME} TinyML blocked ${result.report.filter((entry) => entry.blocked).length} field(s). Remove code, script, SQL, or command payloads before sending.`;
        if (submitter instanceof HTMLButtonElement) submitter.disabled = false;
        return;
      }
      status.textContent = `${PAGE_NAME} TinyML cleansed the form and is sending it to the repo worker.`;
      try {
        await sendEnvelope(form, result, status);
      } catch (error) {
        form.dataset.repoWorkerError = String(error?.message || error);
        status.textContent = `${PAGE_NAME} TinyML passed, but its repo worker is unavailable. Please try again.`;
        if (submitter instanceof HTMLButtonElement) submitter.disabled = false;
      }
    });
  }

  function init() {
    document.querySelectorAll(FORM_SELECTOR).forEach(initForm);
  }

  window[`Gabo${PAGE_NAME[0].toUpperCase()}${PAGE_NAME.slice(1)}TinyML`] = {
    cleanseText,
    scanField,
    scanPayload,
    securityHeaders: { ...SECURITY_HEADERS },
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
