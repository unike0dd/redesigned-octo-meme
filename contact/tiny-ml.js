(function () {
  "use strict";

  const PAGE_NAME = "contact";
  const FORM_SELECTOR = 'form[data-contact-gateway="true"]';

  const DEFAULT_SESSION_URL = "https://contacto.gabo.services/__ops/contact/session";
  const DEFAULT_SUBMIT_URL = "https://contacto.gabo.services/__ops/contact/submit";

  const MAX_FIELD_LENGTH = 2000;
  const MAX_TOTAL_PAYLOAD_CHARS = 12000;

  const RISK_THRESHOLD = 4;
  const RESIDUAL_THRESHOLD = 1;

  const BLOCK_KEY = "gabo-contact-tinyml-session-blocked";

  const RISK_SIGNATURES = [
    { label: "script-tag", weight: 4, pattern: /<\s*\/?\s*script\b/gi },
    { label: "dangerous-html-tag", weight: 3, pattern: /<\s*\/?\s*(?:iframe|object|embed|applet|meta|link|base|form|svg|math|template|style)\b/gi },
    { label: "event-handler", weight: 3, pattern: /\bon[a-z]{3,}\s*=/gi },
    { label: "active-uri", weight: 4, pattern: /\b(?:javascript|vbscript|data|file|blob)\s*:/gi },
    { label: "html-tag", weight: 2, pattern: /<\/?[a-z][\s\S]*?>/gi },
    { label: "code-block", weight: 4, pattern: /```[\s\S]*?```|~~~[\s\S]*?~~~/g },
    { label: "inline-code", weight: 2, pattern: /`[^`\n]{2,}`/g },
    { label: "js-code-token", weight: 3, pattern: /\b(?:eval|Function|setTimeout|setInterval|fetch|XMLHttpRequest|document\.|window\.|localStorage|sessionStorage|import\s|require\s*\(|process\.|globalThis)\b/gi },
    { label: "programming-declaration", weight: 2, pattern: /\b(?:const|let|var|function|class|def|lambda|async\s+function|return|public\s+class|using\s+namespace)\b[\s\w]*(?:[({=;:]|=>)/gi },
    { label: "sql-injection", weight: 3, pattern: /(?:\bunion\s+(?:all\s+)?select\b|\bselect\b[\s\S]{0,80}\bfrom\b|\binsert\s+into\b|\bupdate\b[\s\S]{0,80}\bset\b|\bdelete\s+from\b|\bdrop\s+(?:table|database)\b|\btruncate\s+table\b|--\s|\/\*|\*\/|;\s*(?:select|drop|insert|delete|update)\b)/gi },
    { label: "shell-or-path-exec", weight: 3, pattern: /(?:\.\.\/|\b(?:curl|wget|bash|sh|powershell|cmd\.exe|chmod|sudo|rm\s+-rf|nc\s+-|python\s+-c|node\s+-e)\b|\|\||&&)/gi },
    { label: "template-injection", weight: 3, pattern: /(?:\$\{[\s\S]*?\}|\{\{[\s\S]*?\}\}|<%[\s\S]*?%>)/g },
    { label: "dense-code-punctuation", weight: 2, pattern: /(?:[{}()[\];=<>|&]{5,}|[A-Za-z_$][\w$]*\s*=>)/g }
  ];

  function text(value) {
    return String(value ?? "");
  }

  function decodeHtmlEntities(value) {
    const raw = text(value);
    if (!/[&][#a-z0-9]+;/i.test(raw) || !document.createElement) return raw;

    const decoder = document.createElement("textarea");
    decoder.innerHTML = raw;
    return decoder.value;
  }

  function summarizeThreats(value) {
    const source = decodeHtmlEntities(value);
    const reasons = [];

    let score = 0;

    for (const signature of RISK_SIGNATURES) {
      const matches = source.match(signature.pattern);
      if (!matches) continue;

      reasons.push(signature.label);
      score += matches.length * signature.weight;
    }

    const punctuation = source.replace(/[\w\s.,'"@:+/#-]/g, "").length;
    const density = source.length ? punctuation / source.length : 0;

    if (source.length > 24 && density > 0.22) {
      reasons.push("punctuation-density");
      score += 2;
    }

    return {
      score,
      reasons: Array.from(new Set(reasons))
    };
  }

  function removeCodeLikeLines(value) {
    return text(value)
      .split(/\r?\n/)
      .filter((line) => {
        const trimmed = line.trim();
        if (!trimmed) return true;

        return !/(?:^\s*(?:const|let|var|function|class|def|import|export|return|if|for|while)\b|=>|[{};]{2,}|<\/?[a-z][\s\S]*?>|\b(?:SELECT|DROP|DELETE|INSERT|UPDATE)\b)/i.test(trimmed);
      })
      .join(" ");
  }

  function sanitizeText(value) {
    return removeCodeLikeLines(decodeHtmlEntities(value))
      .replace(/```[\s\S]*?```|~~~[\s\S]*?~~~/g, " ")
      .replace(/`[^`\n]{2,}`/g, " ")
      .replace(/<\s*(script|style|iframe|object|embed|applet|svg|math|template)[\s\S]*?<\s*\/\s*\1\s*>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\b(?:javascript|vbscript|data|file|blob)\s*:[^\s,;)]*/gi, " ")
      .replace(/\bon[a-z]{3,}\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/gi, " ")
      .replace(/\b(?:eval|Function|setTimeout|setInterval)\s*\([^)]*\)/gi, " ")
      .replace(/(?:\/\*[\s\S]*?\*\/|--\s*$)/gm, " ")
      .replace(/[<>`{}()[\];|\\]/g, " ")
      .replace(/[\u0000-\u001F\u007F]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, MAX_FIELD_LENGTH);
  }

  function scanField(value) {
    const raw = text(value);
    const cleaned = sanitizeText(raw);

    const rawThreat = summarizeThreats(raw);
    const residualThreat = summarizeThreats(cleaned);

    const blocked =
      rawThreat.score >= RISK_THRESHOLD ||
      residualThreat.score >= RESIDUAL_THRESHOLD;

    return {
      cleaned,
      blocked,
      rawThreatScore: rawThreat.score,
      residualThreatScore: residualThreat.score,
      removedCharacters: Math.max(raw.length - cleaned.length, 0),
      reasons: Array.from(new Set([...rawThreat.reasons, ...residualThreat.reasons]))
    };
  }

  function getFieldKey(field, index) {
    const label =
      field.getAttribute("name") ||
      field.getAttribute("aria-label") ||
      field.id ||
      `field_${index + 1}`;

    return String(label).trim() || `field_${index + 1}`;
  }

  function isHoneypot(field) {
    return !!field?.matches?.('[data-tinyml-honeypot="true"]');
  }

  function getHoneypotFields(form) {
    return Array.from(form.querySelectorAll('[data-tinyml-honeypot="true"]'));
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

  function isSessionBlocked() {
    try {
      return window.sessionStorage?.getItem(BLOCK_KEY) === "true";
    } catch {
      return document.documentElement.dataset.contactTinymlBlocked === "true";
    }
  }

  function blockSession(form, status, reason) {
    try {
      window.sessionStorage?.setItem(BLOCK_KEY, "true");
    } catch {
      document.documentElement.dataset.contactTinymlBlocked = "true";
    }

    form.reset();
    form.dataset.tinyMlSession = "blocked";

    Array.from(form.querySelectorAll("input, textarea, select, button")).forEach((field) => {
      field.disabled = true;
      field.setAttribute("aria-invalid", "true");
    });

    status.textContent = reason || "Contact TinyML closed this session after bot-trap activity was detected.";
  }

  function scanForm(form) {
    const fields = Array.from(form.querySelectorAll("input, textarea, select"))
      .filter((field) => !field.disabled && !isHoneypot(field));

    const rawFields = {};
    const report = [];
    const cleaned = {};

    fields.forEach((field, index) => {
      const key = getFieldKey(field, index);
      const result = scanField(field.value);

      rawFields[key] = text(field.value);
      cleaned[key] = result.cleaned;

      field.value = result.cleaned;
      field.setAttribute("aria-invalid", String(result.blocked));
      field.classList.toggle("is-security-warning", result.blocked);

      report.push({
        key,
        blocked: result.blocked,
        rawThreatScore: result.rawThreatScore,
        residualThreatScore: result.residualThreatScore,
        removedCharacters: result.removedCharacters,
        reasons: result.reasons
      });
    });

    const blocked = report.some((item) => item.blocked);

    return {
      rawFields,
      cleaned,
      report,
      blocked
    };
  }

  async function sha256Hex(value) {
    if (!window.crypto?.subtle || !window.TextEncoder) return "";

    const digest = await window.crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(String(value || ""))
    );

    return Array.from(new Uint8Array(digest))
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
  }

  async function requestSession(form) {
    const sessionUrl =
      form.getAttribute("data-session-url") ||
      DEFAULT_SESSION_URL;

    const assetId =
      form.getAttribute("data-asset-id") ||
      "redesigned-octo-meme-contact";

    const repoId =
      form.getAttribute("data-repo-id") ||
      "CONTACTO";

    const response = await fetch(sessionUrl, {
      method: "POST",
      mode: "cors",
      credentials: "omit",
      headers: {
        "Content-Type": "application/json",
        "X-Ops-Asset-Id": assetId,
        "X-Gabo-Repo-Id": repoId
      },
      body: JSON.stringify({
        page: PAGE_NAME,
        origin: window.location.origin,
        path: window.location.pathname,
        requested_at: new Date().toISOString()
      })
    });

    if (!response.ok) {
      throw new Error(`Contact session rejected: ${response.status}`);
    }

    const data = await response.json();

    if (!data || data.ok !== true || !data.session_id || !data.nonce) {
      throw new Error("Contact session response is invalid.");
    }

    return data;
  }

  function canonicalPayload(form, scan, integritySha256) {
    const cleaned = scan.cleaned;

    return {
      formType: "contact",
      route: "contact",
      site: "Gabriel Services",
      repo: "redesigned-octo-meme",
      request_id:
        (window.crypto?.randomUUID && window.crypto.randomUUID()) ||
        `contact-${Date.now()}-${Math.random().toString(16).slice(2)}`,

      submittedAt: new Date().toISOString(),
      pageUrl: window.location.href,
      source: window.location.pathname,

      fields: {
        fullName: cleaned.fullName || cleaned.full_name || cleaned.name || cleaned["fullName"] || "",
        emailAddress: cleaned.emailAddress || cleaned.email || cleaned.email_address || "",
        countryCode: cleaned.countryCode || cleaned.country_code || "",
        contactNumber: cleaned.contactNumber || cleaned.phone || cleaned.contact_number || "",
        city: cleaned.city || "",
        stateProvince: cleaned.stateProvince || cleaned.state || cleaned.province || "",
        spaceSuiteApt: cleaned.spaceSuiteApt || cleaned.suite || cleaned.apt || "",
        countryZipCode: cleaned.countryZipCode || cleaned.zipCode || cleaned.postalCode || "",
        bestContactDate: cleaned.bestContactDate || cleaned.best_contact_date || "",
        bestContactTime: cleaned.bestContactTime || cleaned.best_contact_time || "",
        inquiryAbout: cleaned.inquiryAbout || cleaned.subject || cleaned.topic || "",
        message: cleaned.message || cleaned.comments || cleaned.details || ""
      },

      rawFields: cleaned,

      clientIntegrity: {
        checked: true,
        checked_at: new Date().toISOString(),
        sha256: integritySha256,
        report: scan.report
      }
    };
  }

  async function submitContact(form, scan, status) {
    const submitUrl =
      form.getAttribute("data-cf-worker-url") ||
      DEFAULT_SUBMIT_URL;

    const assetId =
      form.getAttribute("data-asset-id") ||
      "redesigned-octo-meme-contact";

    const repoId =
      form.getAttribute("data-repo-id") ||
      "CONTACTO";

    const integritySha256 = await sha256Hex(JSON.stringify(scan.cleaned));

    const session = await requestSession(form);
    const payload = canonicalPayload(form, scan, integritySha256);

    const response = await fetch(submitUrl, {
      method: "POST",
      mode: "cors",
      credentials: "omit",
      headers: {
        "Content-Type": "application/json",
        "X-Ops-Asset-Id": assetId,
        "X-Gabo-Repo-Id": repoId,
        "X-Gabo-Session-Id": session.session_id,
        "X-Gabo-Nonce": session.nonce,
        "X-Gabo-Integrity-SHA256": integritySha256
      },
      body: JSON.stringify(payload)
    });

    const text = await response.text();
    let data = null;

    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }

    if (!response.ok || !data || data.ok !== true) {
      throw new Error(data?.message || `Contact gateway rejected: ${response.status}`);
    }

    status.textContent = data.message || "Contact submission delivered.";
    form.reset();
  }

  function initForm(form) {
    if (form.dataset.contactTinymlInitialized === "true") return;
    form.dataset.contactTinymlInitialized = "true";

    const status = ensureStatus(form);

    getHoneypotFields(form).forEach((field) => {
      field.addEventListener("input", () => {
        if (String(field.value || "").trim()) {
          blockSession(form, status, "Contact TinyML closed this session after bot-trap activity was detected.");
        }
      });
    });

    if (isSessionBlocked()) {
      blockSession(form, status, "Contact TinyML session is blocked.");
      return;
    }

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const honeypot = getHoneypotFields(form).find((field) => String(field.value || "").trim());

      if (honeypot) {
        blockSession(form, status, "Contact TinyML closed this session after bot-trap activity was detected.");
        return;
      }

      const submitter = event.submitter;
      if (submitter instanceof HTMLButtonElement) submitter.disabled = true;

      try {
        const scan = scanForm(form);

        const payloadLength = JSON.stringify(scan.cleaned).length;

        if (payloadLength > MAX_TOTAL_PAYLOAD_CHARS) {
          status.textContent = "Contact TinyML blocked this submission because the payload is too large.";
          return;
        }

        if (scan.blocked) {
          const count = scan.report.filter((item) => item.blocked).length;
          status.textContent = `Contact TinyML blocked ${count} field(s). Remove scripts, code, SQL, shell commands, or template payloads before submitting.`;
          return;
        }

        status.textContent = "Contact TinyML cleaned the form and is verifying the secure session.";

        await submitContact(form, scan, status);
      } catch (error) {
        form.dataset.contactGatewayError = String(error?.message || error);
        status.textContent = "Contact TinyML passed, but the secure Contact gateway is unavailable. Please try again.";
      } finally {
        if (submitter instanceof HTMLButtonElement) submitter.disabled = false;
      }
    });
  }

  function init() {
    document.querySelectorAll(FORM_SELECTOR).forEach(initForm);
  }

  window.GaboContactTinyML = {
    sanitizeText,
    scanField,
    summarizeThreats
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
