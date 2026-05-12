/**
 * contact/tiny-ml.js
 *
 * Browser-side first-pass contact intake protection.
 * Cleans, scans, sanitizes, scores risk, checks honeypot state,
 * blocks bad sessions, and provides SHA-256 integrity helpers.
 *
 * This is not a Cloudflare Worker.
 * This file contains no private Worker binding details.
 */

(function () {
  "use strict";

  const LIMIT = Object.freeze({
    maxFieldLength: 5000,
    maxRiskScore: 55,
    maxTotalRiskScore: 110,
    maxArrayItems: 50,
    maxDepth: 8,
    maxKeyLength: 80
  });

  const SELECTOR = Object.freeze({
    honeypot: "[data-tinyml-honeypot='true']",
    controls: "input, textarea, select",
    status: "[data-contact-status], #contact-status, .contact-status"
  });

  const SESSION = Object.freeze({
    blockedKey: "gabo_contact_tinyml_blocked_v2",
    blockReasonKey: "gabo_contact_tinyml_block_reason_v2"
  });

  const RISK_PATTERNS = Object.freeze([
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
    /\bFunction\s*\(/i,
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
    /\bexport\s+default\b/i,
    /\brequire\s*\(/i,
    /\bfetch\s*\(/i,
    /\bXMLHttpRequest\b/i,
    /\bprocess\.env\b/i,
    /\bwindow\s*\[/i,
    /\bdocument\s*\[/i
  ]);

  function cleanText(value, maxLength) {
    const limit =
      typeof maxLength === "number" && Number.isFinite(maxLength)
        ? maxLength
        : LIMIT.maxFieldLength;

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
      .replace(/[^a-zA-Z0-9_.:\-[\]]/g, "")
      .slice(0, LIMIT.maxKeyLength);
  }

  function sanitizeText(value) {
    return cleanText(value, LIMIT.maxFieldLength)
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
      .replace(/\bFunction\s*\(/gi, " ")
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
      .replace(/\bexport\s+default\b/gi, " ")
      .replace(/\brequire\s*\(/gi, " ")
      .replace(/\bfetch\s*\(/gi, " ")
      .replace(/\bXMLHttpRequest\b/gi, " ")
      .replace(/\bprocess\.env\b/gi, " ")
      .replace(/[<>`{}\[\];]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, LIMIT.maxFieldLength);
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

    if (level > LIMIT.maxDepth) return "";
    if (value === null || value === undefined) return "";

    if (typeof value === "string") return sanitizeText(value);
    if (typeof value === "number") return Number.isFinite(value) ? value : "";
    if (typeof value === "boolean") return value;

    if (Array.isArray(value)) {
      return value.slice(0, LIMIT.maxArrayItems).map(function (item) {
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
    const value = String(text || "");
    let score = 0;
    const reasons = [];

    RISK_PATTERNS.forEach(function (pattern) {
      pattern.lastIndex = 0;

      if (pattern.test(value)) {
        score += 18;
        reasons.push("malicious_or_programming_pattern");
      }
    });

    const linkCount = (value.match(/https?:\/\//gi) || []).length;
    if (linkCount > 3) {
      score += 18;
      reasons.push("too_many_links");
    }

    const codeDensity = (value.match(/[{}()[\];=<>`]/g) || []).length;
    if (codeDensity > 40) {
      score += 18;
      reasons.push("high_code_density");
    }

    const encodedPayloads = (value.match(/[A-Za-z0-9+/=]{120,}/g) || []).length;
    if (encodedPayloads > 0) {
      score += 18;
      reasons.push("encoded_payload_pattern");
    }

    const commandHints = (value.match(/\b(curl|wget|powershell|cmd\.exe|bash|sh\s+-c|sudo|chmod|rm\s+-rf)\b/gi) || []).length;
    if (commandHints > 0) {
      score += 18;
      reasons.push("command_or_script_pattern");
    }

    return {
      score,
      blocked: score > LIMIT.maxRiskScore,
      reasons: Array.from(new Set(reasons))
    };
  }

  function getControlName(control, index) {
    return cleanKey(
      control.getAttribute("name") ||
        control.getAttribute("aria-label") ||
        control.getAttribute("id") ||
        "field_" + String(index + 1)
    );
  }

  function isSupportedControl(control) {
    if (
      !(control instanceof HTMLInputElement) &&
      !(control instanceof HTMLTextAreaElement) &&
      !(control instanceof HTMLSelectElement)
    ) {
      return false;
    }

    if (control.disabled) return false;
    if (control.matches(SELECTOR.honeypot)) return false;

    if (control instanceof HTMLInputElement) {
      const type = String(control.type || "").toLowerCase();
      if (["submit", "button", "reset", "file"].includes(type)) return false;
    }

    return true;
  }

  function getFormControls(form) {
    return Array.from(form.querySelectorAll(SELECTOR.controls)).filter(isSupportedControl);
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

  function scanForm(form) {
    const rawFields = {};
    const cleanFields = {};
    const report = [];
    let totalRisk = 0;

    getFormControls(form).forEach(function (control, index) {
      const key = getControlName(control, index);
      const rawValue = getControlValue(control);
      const cleanValue = sanitizeText(rawValue);
      const rawRisk = scoreRisk(rawValue);
      const cleanRisk = scoreRisk(cleanValue);
      const fieldRisk = Math.max(rawRisk.score, cleanRisk.score);
      const reasons = Array.from(new Set(rawRisk.reasons.concat(cleanRisk.reasons)));

      if (!key) return;

      totalRisk += fieldRisk;

      addFieldValue(rawFields, key, rawValue);
      addFieldValue(cleanFields, key, cleanValue);

      setControlValue(control, cleanValue);

      if (fieldRisk > LIMIT.maxRiskScore) {
        control.setAttribute("aria-invalid", "true");
      } else {
        control.removeAttribute("aria-invalid");
      }

      report.push({
        key,
        riskScore: fieldRisk,
        rawLength: String(rawValue || "").length,
        cleanLength: String(cleanValue || "").length,
        reasons
      });
    });

    const sanitizedFields = sanitizeObject(cleanFields);
    const sanitizedRisk = scoreRisk(stableSerialize(sanitizedFields));

    totalRisk += sanitizedRisk.score;

    return {
      ok:
        totalRisk <= LIMIT.maxTotalRiskScore &&
        report.every(function (item) {
          return item.riskScore <= LIMIT.maxRiskScore;
        }) &&
        !sanitizedRisk.blocked,
      fields: sanitizedFields,
      rawFields: sanitizeObject(rawFields),
      riskScore: totalRisk,
      blocked: totalRisk > LIMIT.maxTotalRiskScore || sanitizedRisk.blocked,
      report,
      sanitizedRisk
    };
  }

  function honeypotFilled(form) {
    return Array.from(form.querySelectorAll(SELECTOR.honeypot)).some(function (field) {
      if (
        !(field instanceof HTMLInputElement) &&
        !(field instanceof HTMLTextAreaElement)
      ) {
        return false;
      }

      return String(field.value || "").trim().length > 0;
    });
  }

  function markSessionBlocked(reason) {
    try {
      sessionStorage.setItem(SESSION.blockedKey, String(Date.now()));
      sessionStorage.setItem(SESSION.blockReasonKey, cleanText(reason || "blocked", 200));
      return true;
    } catch {
      return false;
    }
  }

  function isSessionBlocked() {
    try {
      return Boolean(sessionStorage.getItem(SESSION.blockedKey));
    } catch {
      return false;
    }
  }

  function clearInvalidFields(form) {
    Array.from(form.querySelectorAll("[aria-invalid]")).forEach(function (field) {
      field.removeAttribute("aria-invalid");
    });
  }

  function findStatus(form) {
    return form.querySelector(SELECTOR.status) || document.querySelector(SELECTOR.status);
  }

  function setStatus(form, type, message) {
    const node = findStatus(form);

    if (!node) return;

    node.textContent = message;
    node.setAttribute("data-status", type);
    node.setAttribute("data-status-type", type);
    node.setAttribute("role", type === "error" ? "alert" : "status");
    node.setAttribute("aria-live", "polite");
  }

  function blockForm(form, message) {
    markSessionBlocked(message || "blocked");

    try {
      form.reset();
    } catch {
      /* no-op */
    }

    Array.from(form.querySelectorAll("input, textarea, select, button")).forEach(function (control) {
      if (
        control instanceof HTMLInputElement ||
        control instanceof HTMLTextAreaElement ||
        control instanceof HTMLSelectElement ||
        control instanceof HTMLButtonElement
      ) {
        control.disabled = true;
        control.setAttribute("aria-invalid", "true");
        control.setAttribute("aria-disabled", "true");
      }
    });

    setStatus(form, "error", message || "This contact session has been blocked.");
  }

  function makeToken(prefix) {
    const safePrefix = cleanKey(prefix || "token") || "token";
    const bytes = new Uint8Array(24);

    crypto.getRandomValues(bytes);

    const value = Array.from(bytes)
      .map(function (byte) {
        return byte.toString(16).padStart(2, "0");
      })
      .join("");

    return safePrefix + "-" + value;
  }

  function createSession() {
    return {
      sessionId: makeToken("contact-session"),
      nonce: makeToken("contact-nonce"),
      issuedAt: new Date().toISOString()
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
      return (
        "{" +
        Object.keys(value)
          .sort()
          .map(function (key) {
            return JSON.stringify(key) + ":" + stableSerialize(value[key]);
          })
          .join(",") +
        "}"
      );
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

  async function calculateIntegrity(input) {
    return sha256Hex(stableSerialize(input));
  }

  window.GaboContactTinyML = Object.freeze({
    cleanText,
    cleanKey,
    sanitizeText,
    sanitizeObject,
    scoreRisk,
    scanForm,
    honeypotFilled,
    markSessionBlocked,
    isSessionBlocked,
    clearInvalidFields,
    blockForm,
    setStatus,
    makeToken,
    createSession,
    stableSerialize,
    sha256Hex,
    calculateIntegrity
  });
})();
