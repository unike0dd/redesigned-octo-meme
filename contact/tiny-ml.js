/**
 * contact/tiny-ml.js
 *
 * Browser-side secure contact intake helper.
 * This file performs first-pass cleaning, scanning, risk scoring, and hashing.
 */

(function () {
  "use strict";

  const MAX_FIELD_LENGTH = 5000;
  const MAX_RISK_SCORE = 55;
  const MAX_TOTAL_RISK_SCORE = MAX_RISK_SCORE * 2;
  const HONEYPOT_SELECTOR = "[data-tinyml-honeypot='true'], .form-trap input, .form-trap textarea";
  const SESSION_BLOCK_KEY = "gabo_contact_blocked_v1";

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
    /\bprocess\.env\b/i
  ];

  function cleanText(value, maxLength) {
    const limit = Number.isFinite(maxLength) ? maxLength : MAX_FIELD_LENGTH;

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

  function sanitizeText(value) {
    return cleanText(value, MAX_FIELD_LENGTH)
      .replace(/```[\s\S]*?```/g, " ")
      .replace(/<\s*\/?\s*(script|style|iframe|object|embed|svg|math|form|template|link|meta)[^>]*>/gi, " ")
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
      .slice(0, MAX_FIELD_LENGTH);
  }

  function isPlainObject(value) {
    return Object.prototype.toString.call(value) === "[object Object]";
  }

  function sortObject(object) {
    const out = {};

    Object.keys(object)
      .sort()
      .forEach(function (key) {
        out[key] = object[key];
      });

    return out;
  }

  function sanitizeObject(value, depth) {
    const level = Number.isFinite(depth) ? depth : 0;

    if (level > 8) return "";
    if (value === null || value === undefined) return "";

    if (typeof value === "string") return sanitizeText(value);
    if (typeof value === "number") return Number.isFinite(value) ? value : "";
    if (typeof value === "boolean") return value;

    if (Array.isArray(value)) {
      return value.slice(0, 50).map(function (item) {
        return sanitizeObject(item, level + 1);
      });
    }

    if (isPlainObject(value)) {
      const out = {};

      Object.entries(value).forEach(function ([key, item]) {
        const safeKey = cleanKey(key);

        if (!safeKey) return;
        if (safeKey === "__proto__") return;
        if (safeKey === "prototype") return;
        if (safeKey === "constructor") return;

        out[safeKey] = sanitizeObject(item, level + 1);
      });

      return sortObject(out);
    }

    return "";
  }

  function scoreRisk(text) {
    let score = 0;
    const reasons = [];
    const value = String(text || "");

    RISK_PATTERNS.forEach(function (pattern) {
      pattern.lastIndex = 0;

      if (pattern.test(value)) {
        score += 18;
        reasons.push("malicious_or_programming_pattern");
      }
    });

    const links = (value.match(/https?:\/\//gi) || []).length;

    if (links > 3) {
      score += 18;
      reasons.push("too_many_links");
    }

    const codeDensity = (value.match(/[{}()[\];=<>`]/g) || []).length;

    if (codeDensity > 40) {
      score += 18;
      reasons.push("high_code_density");
    }

    const encoded = (value.match(/[A-Za-z0-9+/=]{120,}/g) || []).length;

    if (encoded > 0) {
      score += 18;
      reasons.push("encoded_payload_pattern");
    }

    return {
      score: score,
      blocked: score > MAX_RISK_SCORE,
      reasons: Array.from(new Set(reasons))
    };
  }

  function stableSerialize(value) {
    if (value === null || value === undefined) return "null";

    if (typeof value === "string") return JSON.stringify(value);
    if (typeof value === "number" || typeof value === "boolean") return JSON.stringify(value);

    if (Array.isArray(value)) {
      return "[" + value.map(stableSerialize).join(",") + "]";
    }

    if (isPlainObject(value)) {
      return "{" + Object.keys(value)
        .sort()
        .map(function (key) {
          return JSON.stringify(key) + ":" + stableSerialize(value[key]);
        })
        .join(",") + "}";
    }

    return JSON.stringify(String(value));
  }

  async function sha256Hex(text) {
    const data = new TextEncoder().encode(String(text || ""));
    const digest = await crypto.subtle.digest("SHA-256", data);

    return Array.from(new Uint8Array(digest))
      .map(function (byte) {
        return byte.toString(16).padStart(2, "0");
      })
      .join("");
  }

  function makeToken(prefix) {
    const bytes = new Uint8Array(24);
    crypto.getRandomValues(bytes);

    const value = Array.from(bytes)
      .map(function (byte) {
        return byte.toString(16).padStart(2, "0");
      })
      .join("");

    return prefix + "-" + value;
  }

  function scanForm(form) {
    const rawFields = {};
    const report = [];
    let totalRisk = 0;

    getFormControls(form).forEach(function (control, index) {
      const key = cleanKey(
        control.getAttribute("name") ||
        control.getAttribute("aria-label") ||
        control.getAttribute("id") ||
        "field_" + (index + 1)
      );
      const rawValue = getControlValue(control);
      const sanitizedValue = sanitizeText(rawValue);
      const rawRisk = scoreRisk(rawValue);
      const sanitizedRisk = scoreRisk(sanitizedValue);
      const fieldRisk = Math.max(rawRisk.score, sanitizedRisk.score);
      const reasons = Array.from(new Set(rawRisk.reasons.concat(sanitizedRisk.reasons)));

      if (!key) return;

      totalRisk += fieldRisk;
      setControlValue(control, sanitizedValue);
      addFieldValue(rawFields, key, rawValue);

      if (fieldRisk > MAX_RISK_SCORE) {
        control.setAttribute("aria-invalid", "true");
      } else {
        control.removeAttribute("aria-invalid");
      }

      report.push({
        key: key,
        riskScore: fieldRisk,
        rawLength: String(rawValue || "").length,
        cleanLength: String(sanitizedValue || "").length,
        reasons: reasons
      });
    });

    return {
      ok: totalRisk <= MAX_TOTAL_RISK_SCORE && report.every(function (item) {
        return item.riskScore <= MAX_RISK_SCORE;
      }),
      fields: sanitizeObject(rawFields),
      riskScore: totalRisk,
      report: report
    };
  }

  function getFormControls(form) {
    return Array.from(form.querySelectorAll("input, textarea, select")).filter(function (control) {
      if (!(control instanceof HTMLInputElement) &&
          !(control instanceof HTMLTextAreaElement) &&
          !(control instanceof HTMLSelectElement)) {
        return false;
      }

      if (control.disabled) return false;
      if (control.matches(HONEYPOT_SELECTOR)) return false;
      if (control instanceof HTMLInputElement && control.type === "submit") return false;
      if (control instanceof HTMLInputElement && control.type === "button") return false;
      if (control instanceof HTMLInputElement && control.type === "reset") return false;
      if (control instanceof HTMLInputElement && control.type === "file") return false;

      return true;
    });
  }

  function getControlValue(control) {
    if (control instanceof HTMLInputElement && control.type === "checkbox") {
      return control.checked ? control.value || "yes" : "";
    }

    if (control instanceof HTMLInputElement && control.type === "radio") {
      return control.checked ? control.value || "" : "";
    }

    if (control instanceof HTMLSelectElement && control.multiple) {
      return Array.from(control.selectedOptions)
        .map(function (option) {
          return option.value || option.textContent || "";
        })
        .join(", ");
    }

    return control.value || "";
  }

  function setControlValue(control, value) {
    if (control instanceof HTMLInputElement && control.type === "checkbox") return;
    if (control instanceof HTMLInputElement && control.type === "radio") return;

    control.value = value;
  }

  function addFieldValue(fields, key, value) {
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

  function honeypotFilled(form) {
    return Array.from(form.querySelectorAll(HONEYPOT_SELECTOR)).some(function (field) {
      if (!(field instanceof HTMLInputElement) && !(field instanceof HTMLTextAreaElement)) {
        return false;
      }

      return String(field.value || "").trim().length > 0;
    });
  }

  function createSession() {
    return {
      sessionId: createId("sess"),
      nonce: makeToken("nonce"),
      issuedAt: new Date().toISOString()
    };
  }

  function createId(prefix) {
    return makeToken(prefix || "id");
  }

  function markSessionBlocked() {
    try {
      sessionStorage.setItem(SESSION_BLOCK_KEY, String(Date.now()));
      return true;
    } catch {
      return false;
    }
  }

  function isSessionBlocked() {
    try {
      return Boolean(sessionStorage.getItem(SESSION_BLOCK_KEY));
    } catch {
      return false;
    }
  }

  function clearInvalidFields(form) {
    Array.from(form.querySelectorAll("[aria-invalid]")).forEach(function (field) {
      field.removeAttribute("aria-invalid");
    });
  }

  function blockForm(form, message) {
    form.reset();

    Array.from(form.querySelectorAll("input, textarea, select, button")).forEach(function (control) {
      if (control instanceof HTMLInputElement ||
          control instanceof HTMLTextAreaElement ||
          control instanceof HTMLSelectElement ||
          control instanceof HTMLButtonElement) {
        control.disabled = true;
        control.setAttribute("aria-invalid", "true");
      }
    });

    const status = form.querySelector("[data-contact-status]");

    if (status) {
      status.textContent = message;
      status.setAttribute("data-status-type", "error");
      status.setAttribute("role", "alert");
      status.setAttribute("aria-live", "polite");
    }
  }

  window.GaboContactTinyML = Object.freeze({
    cleanText: cleanText,
    sanitizeText: sanitizeText,
    sanitizeObject: sanitizeObject,
    scoreRisk: scoreRisk,
    stableSerialize: stableSerialize,
    sha256Hex: sha256Hex,
    makeToken: makeToken,
    createId: createId,
    scanForm: scanForm,
    honeypotFilled: honeypotFilled,
    createSession: createSession,
    markSessionBlocked: markSessionBlocked,
    isSessionBlocked: isSessionBlocked,
    clearInvalidFields: clearInvalidFields,
    blockForm: blockForm
  });
})();
