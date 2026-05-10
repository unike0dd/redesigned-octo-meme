/**
 * contact/tiny-ml.js
 *
 * Repo browser TinyML-style security helper.
 * This file does NOT send the request by itself.
 *
 * Used by:
 * contact/repo-worker.js
 */

(function () {
  "use strict";

  const CONFIG = Object.freeze({
    maxFieldLength: 5000,
    maxRiskScore: 55,
    sessionBlockKey: "gabo_contact_blocked_v1",
    honeypotSelector: "[data-tinyml-honeypot='true']"
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
    /\bFunction\s*\(/i,
    /\bconstructor\b/i,
    /\b__proto__\b/i,
    /\bprototype\b/i,
    /\bimport\s*\(/i,
    /\brequire\s*\(/i,
    /\bfetch\s*\(/i,
    /\bXMLHttpRequest\b/i,
    /\bselect\s+\*\s+from\b/i,
    /\bunion\s+select\b/i,
    /\bdrop\s+table\b/i,
    /\binsert\s+into\b/i,
    /\bdelete\s+from\b/i,
    /\.\.\//,
    /\$\{/,
    /\{\{/,
    /<%/,
    /=>/,
    /\b(?:const|let|var)\s+[a-z_$][\w$]*\s*=/i
  ];

  window.GaboContactTinyML = {
    scanForm,
    sanitizeText,
    cleanText,
    riskScore,
    createSession,
    createId,
    sha256Hex,
    stableSerialize,
    honeypotFilled,
    markSessionBlocked,
    isSessionBlocked,
    blockForm,
    clearInvalidFields
  };

  /**
   * @param {HTMLFormElement} form
   * @returns {{
   *   ok: boolean,
   *   fields: Record<string, any>,
   *   riskScore: number,
   *   report: Array<{
   *     key: string,
   *     riskScore: number,
   *     rawLength: number,
   *     cleanLength: number,
   *     reasons: string[]
   *   }>
   * }}
   */
  function scanForm(form) {
    const fields = {};
    const report = [];
    let totalRisk = 0;
    let ok = true;

    const controls = Array.from(
      form.querySelectorAll("input, textarea, select")
    ).filter((control) => {
      if (!(control instanceof HTMLInputElement) &&
          !(control instanceof HTMLTextAreaElement) &&
          !(control instanceof HTMLSelectElement)) {
        return false;
      }

      if (control.disabled) return false;
      if (control.matches(CONFIG.honeypotSelector)) return false;
      if (control instanceof HTMLInputElement && control.type === "submit") return false;
      if (control instanceof HTMLInputElement && control.type === "button") return false;
      if (control instanceof HTMLInputElement && control.type === "reset") return false;
      if (control instanceof HTMLInputElement && control.type === "file") return false;

      return true;
    });

    controls.forEach((control, index) => {
      const key = getFieldKey(control, index);
      const rawValue = getControlValue(control);
      const cleanValue = sanitizeText(rawValue);
      const rawRisk = riskScore(rawValue);
      const cleanRisk = riskScore(cleanValue);
      const fieldRisk = Math.max(rawRisk.score, cleanRisk.score);

      totalRisk += fieldRisk;

      if (fieldRisk > CONFIG.maxRiskScore) {
        ok = false;
        control.setAttribute("aria-invalid", "true");
      } else {
        control.removeAttribute("aria-invalid");
      }

      setControlValue(control, cleanValue);
      addFieldValue(fields, key, cleanValue);

      report.push({
        key,
        riskScore: fieldRisk,
        rawLength: String(rawValue || "").length,
        cleanLength: String(cleanValue || "").length,
        reasons: unique(rawRisk.reasons.concat(cleanRisk.reasons))
      });
    });

    if (totalRisk > CONFIG.maxRiskScore * 2) {
      ok = false;
    }

    return {
      ok,
      fields: sortObject(canonicalizeFields(fields)),
      riskScore: totalRisk,
      report
    };
  }

  /**
   * @param {Record<string, any>} fields
   * @returns {Record<string, any>}
   */
  function canonicalizeFields(fields) {
    const output = Object.assign({}, fields);

    assignCanonical(output, "fullName", [
      "fullName",
      "fullname",
      "full_name",
      "name",
      "yourName",
      "contactName",
      "customerName",
      "nombre"
    ]);

    assignCanonical(output, "emailAddress", [
      "emailAddress",
      "email",
      "email_address",
      "mail",
      "correo",
      "correoElectronico"
    ]);

    assignCanonical(output, "contactNumber", [
      "contactNumber",
      "phone",
      "telephone",
      "tel",
      "mobile",
      "telefono",
      "number"
    ]);

    assignCanonical(output, "countryCode", [
      "countryCode",
      "country_code",
      "phoneCountryCode",
      "codigoPais"
    ]);

    assignCanonical(output, "city", [
      "city",
      "ciudad"
    ]);

    assignCanonical(output, "stateProvince", [
      "stateProvince",
      "state",
      "province",
      "provincia"
    ]);

    assignCanonical(output, "spaceSuiteApt", [
      "spaceSuiteApt",
      "suite",
      "apt",
      "apartment",
      "unit"
    ]);

    assignCanonical(output, "countryZipCode", [
      "countryZipCode",
      "zip",
      "zipcode",
      "postalCode",
      "codigoPostal"
    ]);

    assignCanonical(output, "bestContactDate", [
      "bestContactDate",
      "contactDate",
      "date"
    ]);

    assignCanonical(output, "bestContactTime", [
      "bestContactTime",
      "contactTime",
      "time"
    ]);

    assignCanonical(output, "inquiryAbout", [
      "inquiryAbout",
      "subject",
      "service",
      "topic",
      "reason",
      "asunto"
    ]);

    assignCanonical(output, "message", [
      "message",
      "comments",
      "comment",
      "notes",
      "details",
      "inquiry",
      "mensaje"
    ]);

    return output;
  }

  /**
   * @param {Record<string, any>} object
   * @param {string} canonicalKey
   * @param {string[]} aliases
   * @returns {void}
   */
  function assignCanonical(object, canonicalKey, aliases) {
    if (object[canonicalKey]) return;

    for (const alias of aliases) {
      const value = findByAlias(object, alias);

      if (value) {
        object[canonicalKey] = value;
        return;
      }
    }
  }

  /**
   * @param {Record<string, any>} object
   * @param {string} alias
   * @returns {string}
   */
  function findByAlias(object, alias) {
    const wanted = normalizeAlias(alias);

    for (const [key, value] of Object.entries(object)) {
      if (normalizeAlias(key) === wanted && value) {
        return valueToText(value);
      }
    }

    return "";
  }

  /**
   * @param {any} value
   * @returns {string}
   */
  function normalizeAlias(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");
  }

  /**
   * @param {HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement} control
   * @param {number} index
   * @returns {string}
   */
  function getFieldKey(control, index) {
    const raw =
      control.getAttribute("name") ||
      control.getAttribute("aria-label") ||
      control.getAttribute("id") ||
      `field_${index + 1}`;

    return String(raw)
      .normalize("NFKC")
      .replace(/[^a-zA-Z0-9_.:-]/g, "")
      .slice(0, 80);
  }

  /**
   * @param {HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement} control
   * @returns {string}
   */
  function getControlValue(control) {
    if (control instanceof HTMLInputElement && control.type === "checkbox") {
      return control.checked ? control.value || "yes" : "";
    }

    if (control instanceof HTMLInputElement && control.type === "radio") {
      return control.checked ? control.value || "" : "";
    }

    if (control instanceof HTMLSelectElement && control.multiple) {
      return Array.from(control.selectedOptions)
        .map((option) => option.value || option.textContent || "")
        .join(", ");
    }

    return control.value || "";
  }

  /**
   * @param {HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement} control
   * @param {string} value
   * @returns {void}
   */
  function setControlValue(control, value) {
    if (control instanceof HTMLInputElement && control.type === "checkbox") return;
    if (control instanceof HTMLInputElement && control.type === "radio") return;

    control.value = value;
  }

  /**
   * @param {Record<string, any>} fields
   * @param {string} key
   * @param {string} value
   * @returns {void}
   */
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

  /**
   * @param {any} value
   * @returns {string}
   */
  function valueToText(value) {
    if (Array.isArray(value)) {
      return value.map(valueToText).filter(Boolean).join(", ");
    }

    if (isPlainObject(value)) {
      return stableSerialize(value);
    }

    return cleanText(value || "");
  }

  /**
   * @param {any} value
   * @returns {string}
   */
  function sanitizeText(value) {
    return String(value || "")
      .normalize("NFKC")
      .replace(/[\u0000-\u001F\u007F]/g, " ")
      .slice(0, CONFIG.maxFieldLength)
      .replace(/```[\s\S]*?```/g, " ")
      .replace(/<\s*(script|style|iframe|svg|object|embed|template|meta|link|math|form)\b[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, " ")
      .replace(/<\s*\/?\s*(script|style|iframe|object|embed|svg|math|form|template|link|meta)[^>]*>/gi, " ")
      .replace(/\s+on[a-z]{3,}\s*=\s*("[^"]*"|'[^']*'|[^\s>]*)/gi, " ")
      .replace(/\bon[a-z]{3,}\s*=/gi, " ")
      .replace(/\b(javascript|vbscript)\s*:/gi, " ")
      .replace(/\bdata\s*:\s*text\/html[^\s)]*/gi, " ")
      .replace(/\bdocument\s*\.\s*cookie\b/gi, " ")
      .replace(/\blocalStorage\b/gi, " ")
      .replace(/\bsessionStorage\b/gi, " ")
      .replace(/\beval\s*\([^)]*\)/gi, " ")
      .replace(/\bnew\s+Function\b/gi, " ")
      .replace(/\bFunction\s*\([^)]*\)/gi, " ")
      .replace(/\b(?:constructor|__proto__|prototype)\b/gi, " ")
      .replace(/\b(?:import|require|fetch)\s*\([^)]*\)/gi, " ")
      .replace(/\bXMLHttpRequest\b/gi, " ")
      .replace(/\b(?:const|let|var)\s+[a-z_$][\w$]*\s*=/gi, " ")
      .replace(/(?:=>|\$\{|\{\{|<%|%>|\.\.\/)/g, " ")
      .replace(/[<>`{}[\]\;|\\]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, CONFIG.maxFieldLength);
  }

  /**
   * @param {any} value
   * @param {number} [maxLength]
   * @returns {string}
   */
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

  /**
   * @param {any} value
   * @returns {{ score: number, reasons: string[] }}
   */
  function riskScore(value) {
    const text = String(value || "");
    let score = 0;
    const reasons = [];

    for (const pattern of RISK_PATTERNS) {
      if (pattern.test(text)) {
        score += 18;
        reasons.push(String(pattern));
      }
    }

    const links = (text.match(/https?:\/\//gi) || []).length;

    if (links > 3) {
      score += 18;
      reasons.push("too_many_links");
    }

    const codeDensity = (text.match(/[{}()[\];=<>`]/g) || []).length;

    if (codeDensity > 40) {
      score += 18;
      reasons.push("high_code_density");
    }

    return {
      score,
      reasons: unique(reasons)
    };
  }

  /**
   * @param {HTMLFormElement} form
   * @returns {boolean}
   */
  function honeypotFilled(form) {
    const honeypots = Array.from(form.querySelectorAll(CONFIG.honeypotSelector));

    return honeypots.some((field) => {
      if (!(field instanceof HTMLInputElement) &&
          !(field instanceof HTMLTextAreaElement)) {
        return false;
      }

      return String(field.value || "").trim().length > 0;
    });
  }

  /**
   * @returns {{ sessionId: string, nonce: string, issuedAt: string }}
   */
  function createSession() {
    return {
      sessionId: createId("sess"),
      nonce: createNonce(),
      issuedAt: new Date().toISOString()
    };
  }

  /**
   * @param {string} prefix
   * @returns {string}
   */
  function createId(prefix) {
    if (window.crypto && crypto.randomUUID) {
      return `${prefix}:${crypto.randomUUID()}`;
    }

    return `${prefix}:${Date.now().toString(36)}:${Math.random().toString(36).slice(2)}`;
  }

  /**
   * @returns {string}
   */
  function createNonce() {
    if (window.crypto && crypto.getRandomValues) {
      const bytes = new Uint8Array(32);
      crypto.getRandomValues(bytes);

      return Array.from(bytes)
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join("");
    }

    return `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}${Math.random()
      .toString(36)
      .slice(2)}`;
  }

  /**
   * @param {string} text
   * @returns {Promise<string>}
   */
  async function sha256Hex(text) {
    if (!window.crypto || !crypto.subtle) {
      throw new Error("Secure browser crypto is required.");
    }

    const data = new TextEncoder().encode(text);
    const digest = await crypto.subtle.digest("SHA-256", data);

    return Array.from(new Uint8Array(digest))
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
  }

  /**
   * @param {any} value
   * @returns {string}
   */
  function stableSerialize(value) {
    if (value === null || value === undefined) return "null";

    if (typeof value === "string") return JSON.stringify(value);
    if (typeof value === "number" || typeof value === "boolean") return JSON.stringify(value);

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

  /**
   * @param {Record<string, any>} object
   * @returns {Record<string, any>}
   */
  function sortObject(object) {
    const out = {};

    Object.keys(object)
      .sort()
      .forEach((key) => {
        out[key] = object[key];
      });

    return out;
  }

  /**
   * @param {string[]} items
   * @returns {string[]}
   */
  function unique(items) {
    return Array.from(new Set(items.filter(Boolean)));
  }

  /**
   * @param {any} value
   * @returns {boolean}
   */
  function isPlainObject(value) {
    return Object.prototype.toString.call(value) === "[object Object]";
  }

  /**
   * @returns {boolean}
   */
  function markSessionBlocked() {
    try {
      sessionStorage.setItem(CONFIG.sessionBlockKey, String(Date.now()));
      return true;
    } catch {
      return false;
    }
  }

  /**
   * @returns {boolean}
   */
  function isSessionBlocked() {
    try {
      return Boolean(sessionStorage.getItem(CONFIG.sessionBlockKey));
    } catch {
      return false;
    }
  }

  /**
   * @param {HTMLFormElement} form
   * @param {string} message
   * @returns {void}
   */
  function blockForm(form, message) {
    form.reset();

    Array.from(form.querySelectorAll("input, textarea, select, button")).forEach((control) => {
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
    }
  }

  /**
   * @param {HTMLFormElement} form
   * @returns {void}
   */
  function clearInvalidFields(form) {
    Array.from(form.querySelectorAll("[aria-invalid]")).forEach((field) => {
      field.removeAttribute("aria-invalid");
    });
  }
})();
