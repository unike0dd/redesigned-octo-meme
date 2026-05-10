/**
 * contact/tiny-ml.js
 *
 * Browser-side Contact TinyML/CySec guard.
 * It collects the Contact form fields, cleans and sanitizes text, removes
 * malicious/programming-code patterns, scores residual risk, and creates the
 * post-sanitizer SHA-256 integrity proof required by contacto.gabo.services.
 */

(function () {
  "use strict";

  const CONFIG = Object.freeze({
    apiPath: "/api/contact",
    expectedSource: "contact.html",
    maxFieldLength: 5000,
    maxRiskScore: 55,
    maxTotalRiskScore: 110,
    sessionBlockKey: "gabo_contact_cysec_blocked_v1",
    honeypotSelector: "[data-tinyml-honeypot='true']",
    frameworks: ["OWASP ASVS", "CISA CPG", "NIST CSF", "PCI DSS 4.0", "CySec"],
  });

  const RISK_PATTERNS = [
    /<\s*script/i,
    /<\s*\/\s*script/i,
    /javascript\s*:/i,
    /vbscript\s*:/i,
    /data\s*:\s*text\/html/i,
    /<\s*(iframe|object|embed|svg|math|form|template|style|link|meta)/i,
    /\bon[a-z]{3,}\s*=/i,
    /\bdocument\s*\.\s*cookie\b/i,
    /\blocalStorage\b/i,
    /\bsessionStorage\b/i,
    /\beval\s*\(/i,
    /\bnew\s+Function\b/i,
    /\bconstructor\b/i,
    /\b__proto__\b/i,
    /\bprototype\b/i,
    /\bselect\s+\*\s+from\b/i,
    /\bunion\s+select\b/i,
    /\bdrop\s+table\b/i,
    /\binsert\s+into\b/i,
    /\bdelete\s+from\b/i,
    /\bupdate\s+[a-z0-9_]+\s+set\b/i,
    /\balter\s+table\b/i,
    /\btruncate\s+table\b/i,
    /\.\.\//,
    /\$\{/,
    /\{\{/,
    /<%/,
    /```[\s\S]*?```/,
    /\bimport\s+.+\s+from\b/i,
    /\brequire\s*\(/i,
    /\bfetch\s*\(/i,
    /\bXMLHttpRequest\b/i,
    /\bprocess\.env\b/i,
  ];

  window.GaboContactTinyML = Object.freeze({
    scanForm,
    sanitizeObject,
    sanitizeText,
    cleanText,
    scoreRisk,
    createSession,
    createId,
    createIntegrityProof,
    sha256Hex,
    stableSerialize,
    honeypotFilled,
    markSessionBlocked,
    isSessionBlocked,
    blockForm,
    clearInvalidFields,
    frameworks: CONFIG.frameworks.slice(),
  });

  function scanForm(form) {
    const rawFields = collectFormFields(form);
    const fields = sanitizeObject(rawFields);
    const report = [];
    let totalRiskScore = 0;
    let maxFieldRiskScore = 0;

    for (const key of Object.keys(rawFields).sort()) {
      const rawValue = valueToText(rawFields[key]);
      const cleanValue = valueToText(fields[key]);
      const rawRisk = scoreRisk(rawValue);
      const cleanRisk = scoreRisk(cleanValue);
      const fieldRiskScore = Math.max(rawRisk.score, cleanRisk.score);
      const removedCharacters = Math.max(
        rawValue.length - cleanValue.length,
        0,
      );

      totalRiskScore += fieldRiskScore;
      maxFieldRiskScore = Math.max(maxFieldRiskScore, fieldRiskScore);

      report.push({
        key,
        riskScore: fieldRiskScore,
        rawRiskScore: rawRisk.score,
        residualRiskScore: cleanRisk.score,
        rawLength: rawValue.length,
        cleanLength: cleanValue.length,
        removedCharacters,
        reasons: unique(rawRisk.reasons.concat(cleanRisk.reasons)),
        blocked: fieldRiskScore > CONFIG.maxRiskScore,
      });
    }

    const residual = scoreRisk(stableSerialize(fields));
    const ok =
      maxFieldRiskScore <= CONFIG.maxRiskScore &&
      totalRiskScore <= CONFIG.maxTotalRiskScore &&
      residual.score <= CONFIG.maxRiskScore;

    markInvalidFields(form, report);

    return {
      ok,
      sanitized: true,
      fields: sortObject(fields),
      rawFields: sortObject(rawFields),
      riskScore: totalRiskScore,
      residualRiskScore: residual.score,
      report,
      cySec: buildCySecReport(ok, totalRiskScore, residual.score, report),
    };
  }

  async function createIntegrityProof(options) {
    const base = {
      route: CONFIG.apiPath,
      origin: String(options.origin || ""),
      source: CONFIG.expectedSource,
      sessionId: String(options.sessionId || ""),
      nonce: String(options.nonce || ""),
      fields: sortObject(options.fields || {}),
    };

    const serialized = stableSerialize(base);
    const sha256 = await sha256Hex(serialized);

    return {
      algorithm: "SHA-256",
      sha256,
      base: "route|origin|source|sessionId|nonce|fields",
      sanitizedBeforeHash: true,
      cySecVerifiedBeforeHash: true,
      serialized,
    };
  }

  function collectFormFields(form) {
    const fields = {};
    const controls = Array.from(
      form.querySelectorAll("input, textarea, select"),
    );

    controls.forEach((control, index) => {
      if (!isSubmittableControl(control)) return;

      const key = getFieldKey(control, index);
      const value = getControlValue(control);

      addFieldValue(fields, key, value);
    });

    return fields;
  }

  function isSubmittableControl(control) {
    if (
      !(control instanceof HTMLInputElement) &&
      !(control instanceof HTMLTextAreaElement) &&
      !(control instanceof HTMLSelectElement)
    ) {
      return false;
    }

    if (control.disabled) return false;
    if (control.matches(CONFIG.honeypotSelector)) return false;

    if (control instanceof HTMLInputElement) {
      if (["submit", "button", "reset", "file"].includes(control.type))
        return false;
      if (
        (control.type === "checkbox" || control.type === "radio") &&
        !control.checked
      ) {
        return false;
      }
    }

    return true;
  }

  function getControlValue(control) {
    if (control instanceof HTMLInputElement && control.type === "checkbox") {
      return control.value || "checked";
    }

    if (control instanceof HTMLInputElement && control.type === "radio") {
      return control.checked ? control.value || "selected" : "";
    }

    if (control instanceof HTMLSelectElement && control.multiple) {
      return Array.from(control.selectedOptions).map(
        (option) => option.value || option.textContent || "",
      );
    }

    return control.value || "";
  }

  function getFieldKey(control, index) {
    return (
      cleanKey(
        control.getAttribute("name") || control.id || `field_${index}`,
      ) || `field_${index}`
    );
  }

  function addFieldValue(fields, key, value) {
    if (!key) return;

    if (fields[key] === undefined) {
      fields[key] = value;
      return;
    }

    if (Array.isArray(fields[key])) {
      fields[key].push(value);
      return;
    }

    fields[key] = [fields[key], value];
  }

  function sanitizeObject(value, depth = 0) {
    if (depth > 8) return "";
    if (value === null || value === undefined) return "";

    if (typeof value === "string") return sanitizeText(value);
    if (typeof value === "number") return Number.isFinite(value) ? value : "";
    if (typeof value === "boolean") return value;

    if (Array.isArray(value)) {
      return value.slice(0, 50).map((item) => sanitizeObject(item, depth + 1));
    }

    if (isPlainObject(value)) {
      const out = {};

      for (const [key, item] of Object.entries(value)) {
        const safeKey = cleanKey(key);

        if (!safeKey) continue;
        if (["__proto__", "prototype", "constructor"].includes(safeKey))
          continue;

        out[safeKey] = sanitizeObject(item, depth + 1);
      }

      return sortObject(out);
    }

    return "";
  }

  function sanitizeText(value) {
    return cleanText(value, CONFIG.maxFieldLength)
      .replace(/```[\s\S]*?```/g, " ")
      .replace(
        /<\s*\/?\s*(script|style|iframe|object|embed|svg|math|form|template|link|meta)[^>]*>/gi,
        " ",
      )
      .replace(/\bon[a-z]{3,}\s*=/gi, " ")
      .replace(/\b(javascript|vbscript)\s*:/gi, " ")
      .replace(/\bdata\s*:\s*text\/html/gi, " ")
      .replace(/\bdocument\s*\.\s*cookie\b/gi, " ")
      .replace(/\blocalStorage\b/gi, " ")
      .replace(/\bsessionStorage\b/gi, " ")
      .replace(/\beval\s*\(/gi, " ")
      .replace(/\bnew\s+Function\b/gi, " ")
      .replace(/\bconstructor\b/gi, " ")
      .replace(/\b__proto__\b/gi, " ")
      .replace(/\bprototype\b/gi, " ")
      .replace(/\bselect\s+\*\s+from\b/gi, " ")
      .replace(/\bunion\s+select\b/gi, " ")
      .replace(/\bdrop\s+table\b/gi, " ")
      .replace(/\binsert\s+into\b/gi, " ")
      .replace(/\bdelete\s+from\b/gi, " ")
      .replace(/\bupdate\s+[a-z0-9_]+\s+set\b/gi, " ")
      .replace(/\balter\s+table\b/gi, " ")
      .replace(/\btruncate\s+table\b/gi, " ")
      .replace(/\bimport\s+.+\s+from\b/gi, " ")
      .replace(/\brequire\s*\(/gi, " ")
      .replace(/\bfetch\s*\(/gi, " ")
      .replace(/\bXMLHttpRequest\b/gi, " ")
      .replace(/\bprocess\.env\b/gi, " ")
      .replace(/[<>`{}[\];]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, CONFIG.maxFieldLength);
  }

  function cleanText(value, maxLength) {
    const limit =
      typeof maxLength === "number" && Number.isFinite(maxLength)
        ? maxLength
        : CONFIG.maxFieldLength;

    return String(value || "")
      .normalize("NFKC")
      .replace(/[\u0000-\u001F\u007F]/g, " ")
      .replace(/[<>]/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, limit);
  }

  function cleanKey(value) {
    return String(value || "")
      .normalize("NFKC")
      .replace(/[^a-zA-Z0-9_.:-]/g, "")
      .slice(0, 80);
  }

  function scoreRisk(text) {
    const source = String(text || "");
    let score = 0;
    const reasons = [];

    for (const pattern of RISK_PATTERNS) {
      if (pattern.test(source)) {
        score += 18;
        reasons.push("malicious_or_programming_pattern");
      }
    }

    const links = (source.match(/https?:\/\//gi) || []).length;
    if (links > 3) {
      score += 18;
      reasons.push("too_many_links");
    }

    const codeDensity = (source.match(/[{}()[\];=<>`]/g) || []).length;
    if (codeDensity > 40) {
      score += 18;
      reasons.push("high_code_density");
    }

    const base64Like = (source.match(/[A-Za-z0-9+/=]{120,}/g) || []).length;
    if (base64Like > 0) {
      score += 18;
      reasons.push("encoded_payload_pattern");
    }

    return {
      score,
      reasons: unique(reasons),
    };
  }

  function buildCySecReport(ok, riskScore, residualRiskScore, report) {
    return {
      ok,
      sanitized: true,
      checkedProgrammingCode: true,
      checkedMaliciousCode: true,
      integrityRequiredAfterSanitizer: true,
      riskScore,
      residualRiskScore,
      frameworks: CONFIG.frameworks.slice(),
      controls: {
        owaspAsvs: [
          "V5 input validation",
          "V8 data protection",
          "V14 configuration",
        ],
        cisaCpg: ["Input validation", "secure-by-design", "least privilege"],
        nistCsf: ["Protect", "Detect", "Respond"],
        pciDss40: [
          "Req. 6 secure development",
          "Req. 10 auditability",
          "Req. 11 testing",
        ],
      },
      blockedFields: report
        .filter((entry) => entry.blocked)
        .map((entry) => entry.key),
    };
  }

  function markInvalidFields(form, report) {
    const blocked = new Set(
      report.filter((entry) => entry.blocked).map((entry) => entry.key),
    );

    Array.from(form.querySelectorAll("input, textarea, select")).forEach(
      (control, index) => {
        if (!isSubmittableControl(control)) return;

        const key = getFieldKey(control, index);

        if (blocked.has(key)) {
          control.setAttribute("aria-invalid", "true");
        } else {
          control.removeAttribute("aria-invalid");
        }
      },
    );
  }

  function createSession() {
    return {
      sessionId: createId("contact-session"),
      nonce: createId("contact-nonce"),
      issuedAt: new Date().toISOString(),
    };
  }

  function createId(prefix) {
    const bytes = new Uint8Array(16);
    window.crypto.getRandomValues(bytes);

    const token = Array.from(bytes)
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");

    return `${prefix}-${token}`;
  }

  async function sha256Hex(text) {
    const data = new TextEncoder().encode(String(text || ""));
    const digest = await window.crypto.subtle.digest("SHA-256", data);

    return Array.from(new Uint8Array(digest))
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
  }

  function stableSerialize(value) {
    if (value === null || value === undefined) return "null";
    if (typeof value === "string") return JSON.stringify(value);
    if (typeof value === "number" || typeof value === "boolean")
      return JSON.stringify(value);

    if (Array.isArray(value)) {
      return `[${value.map(stableSerialize).join(",")}]`;
    }

    if (isPlainObject(value)) {
      return `{${Object.keys(value)
        .sort()
        .map((key) => `${JSON.stringify(key)}:${stableSerialize(value[key])}`)
        .join(",")}}`;
    }

    return JSON.stringify(String(value));
  }

  function honeypotFilled(form) {
    return Array.from(form.querySelectorAll(CONFIG.honeypotSelector)).some(
      (field) => String(field.value || "").trim(),
    );
  }

  function markSessionBlocked() {
    try {
      window.sessionStorage.setItem(CONFIG.sessionBlockKey, "true");
    } catch {
      document.documentElement.dataset.contactCysecBlocked = "true";
    }
  }

  function isSessionBlocked() {
    try {
      return window.sessionStorage.getItem(CONFIG.sessionBlockKey) === "true";
    } catch {
      return document.documentElement.dataset.contactCysecBlocked === "true";
    }
  }

  function blockForm(form, message) {
    markSessionBlocked();
    form.reset();
    form.dataset.contactBlocked = "true";

    Array.from(
      form.querySelectorAll("input, textarea, select, button"),
    ).forEach((field) => {
      field.disabled = true;
      field.setAttribute("aria-invalid", "true");
    });

    const status = form.querySelector("[data-contact-status]");
    if (status) {
      status.textContent =
        message || "This contact session was blocked by Contact CySec.";
      status.dataset.contactStatus = "error";
      status.setAttribute("role", "alert");
    }
  }

  function clearInvalidFields(form) {
    Array.from(form.querySelectorAll("[aria-invalid='true']")).forEach(
      (field) => {
        field.removeAttribute("aria-invalid");
      },
    );
  }

  function valueToText(value) {
    if (Array.isArray(value))
      return value.map(valueToText).filter(Boolean).join(", ");
    if (isPlainObject(value)) return stableSerialize(value);
    return cleanText(value || "");
  }

  function isPlainObject(value) {
    return Object.prototype.toString.call(value) === "[object Object]";
  }

  function sortObject(object) {
    const out = {};

    Object.keys(object)
      .sort()
      .forEach((key) => {
        out[key] = object[key];
      });

    return out;
  }

  function unique(values) {
    return Array.from(new Set(values.filter(Boolean)));
  }
})();
