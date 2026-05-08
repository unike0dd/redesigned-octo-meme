(function () {
  "use strict";

  const PAGE_NAME = "contact";
  const FORM_SELECTOR = 'form[data-contact-gateway="true"]';

  /*
   * STEP 1 RULE:
   * Browser TinyML must NOT call contacto.gabo.services directly.
   * It cleans/scans/signs locally, then sends to the repo Worker endpoint.
   */
  const DEFAULT_REPO_ENDPOINT = "/api/contact";

  const DEFAULT_ASSET_ID = "redesigned-octo-meme-contact";
  const DEFAULT_REPO_ID = "CONTACTO";
  const DEFAULT_SOURCE_PATH = "contact.html";

  const MAX_FIELD_LENGTH = 2000;
  const MAX_LIST_ITEMS = 100;
  const MAX_TOTAL_PAYLOAD_CHARS = 12000;

  const RISK_THRESHOLD = 4;
  const RESIDUAL_THRESHOLD = 1;

  const BLOCK_KEY = "gabo-contact-tinyml-session-blocked";

  const RISK_SIGNATURES = [
    {
      label: "script-tag",
      weight: 4,
      pattern: /<\s*\/?\s*script\b/gi
    },
    {
      label: "dangerous-html-tag",
      weight: 3,
      pattern: /<\s*\/?\s*(?:iframe|object|embed|applet|meta|link|base|form|svg|math|template|style)\b/gi
    },
    {
      label: "event-handler",
      weight: 3,
      pattern: /\bon[a-z]{3,}\s*=/gi
    },
    {
      label: "active-uri",
      weight: 4,
      pattern: /\b(?:javascript|vbscript|data|file|blob)\s*:/gi
    },
    {
      label: "html-tag",
      weight: 2,
      pattern: /<\/?[a-z][\s\S]*?>/gi
    },
    {
      label: "code-block",
      weight: 4,
      pattern: /```[\s\S]*?```|~~~[\s\S]*?~~~/g
    },
    {
      label: "inline-code",
      weight: 2,
      pattern: /`[^`\n]{2,}`/g
    },
    {
      label: "js-code-token",
      weight: 3,
      pattern: /\b(?:eval|Function|setTimeout|setInterval|XMLHttpRequest|document\.|window\.|localStorage|sessionStorage|import\s|require\s*\(|process\.|globalThis)\b/gi
    },
    {
      label: "programming-declaration",
      weight: 2,
      pattern: /\b(?:const|let|var|function|class|def|lambda|async\s+function|return|public\s+class|using\s+namespace)\b[\s\w]*(?:[({=;:]|=>)/gi
    },
    {
      label: "sql-injection",
      weight: 3,
      pattern: /(?:\bunion\s+(?:all\s+)?select\b|\bselect\b[\s\S]{0,80}\bfrom\b|\binsert\s+into\b|\bupdate\b[\s\S]{0,80}\bset\b|\bdelete\s+from\b|\bdrop\s+(?:table|database)\b|\btruncate\s+table\b|--\s|\/\*|\*\/|;\s*(?:select|drop|insert|delete|update)\b)/gi
    },
    {
      label: "shell-or-path-exec",
      weight: 3,
      pattern: /(?:\.\.\/|\b(?:curl|wget|bash|sh|powershell|cmd\.exe|chmod|sudo|rm\s+-rf|nc\s+-|python\s+-c|node\s+-e)\b|\|\||&&)/gi
    },
    {
      label: "template-injection",
      weight: 3,
      pattern: /(?:\$\{[\s\S]*?\}|\{\{[\s\S]*?\}\}|<%[\s\S]*?%>)/g
    },
    {
      label: "dense-code-punctuation",
      weight: 2,
      pattern: /(?:[{}()[\];=<>|&]{5,}|[A-Za-z_$][\w$]*\s*=>)/g
    }
  ];

  function toText(value) {
    return String(value ?? "");
  }

  function nowIso() {
    return new Date().toISOString();
  }

  function cleanKey(value) {
    return toText(value)
      .normalize("NFKC")
      .replace(/\u0000/g, "")
      .replace(/[\u0001-\u001F\u007F]/g, "")
      .replace(/[<>`"']/g, "")
      .replace(/\s+/g, "_")
      .trim()
      .slice(0, 80);
  }

  function decodeHtmlEntities(value) {
    const raw = toText(value);

    if (!/[&][#a-z0-9]+;/i.test(raw)) return raw;
    if (!document.createElement) return raw;

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
    return toText(value)
      .split(/\r?\n/)
      .filter(function (line) {
        const trimmed = line.trim();

        if (!trimmed) return true;

        return !/(?:^\s*(?:const|let|var|function|class|def|import|export|return|if|for|while|switch|try|catch)\b|=>|[{};]{2,}|<\/?[a-z][\s\S]*?>|\b(?:SELECT|DROP|DELETE|INSERT|UPDATE)\b)/i.test(trimmed);
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
    const raw = toText(value);
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
      reasons: Array.from(new Set([].concat(rawThreat.reasons, residualThreat.reasons)))
    };
  }

  function isHoneypot(field) {
    return !!field && !!field.matches && field.matches('[data-tinyml-honeypot="true"]');
  }

  function getHoneypotFields(form) {
    return Array.from(form.querySelectorAll('[data-tinyml-honeypot="true"]'));
  }

  function getFieldKey(field, index) {
    const name =
      field.getAttribute("name") ||
      field.getAttribute("aria-label") ||
      field.id ||
      `field_${index + 1}`;

    return cleanKey(name) || `field_${index + 1}`;
  }

  function normalizeArrayKey(key) {
    return String(key || "").replace(/\[\]$/, "");
  }

  function addFieldValue(target, key, value) {
    const normalizedKey = normalizeArrayKey(key);

    if (!normalizedKey) return;

    if (key.endsWith("[]")) {
      if (!Array.isArray(target[normalizedKey])) target[normalizedKey] = [];

      if (value) {
        target[normalizedKey].push(value);
        target[normalizedKey] = target[normalizedKey].slice(0, MAX_LIST_ITEMS);
      }

      return;
    }

    if (target[normalizedKey] === undefined) {
      target[normalizedKey] = value;
      return;
    }

    if (!Array.isArray(target[normalizedKey])) {
      target[normalizedKey] = [target[normalizedKey]].filter(Boolean);
    }

    if (value) target[normalizedKey].push(value);
    target[normalizedKey] = target[normalizedKey].slice(0, MAX_LIST_ITEMS);
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
      return window.sessionStorage.getItem(BLOCK_KEY) === "true";
    } catch {
      return document.documentElement.dataset.contactTinymlBlocked === "true";
    }
  }

  function blockSession(form, status, reason) {
    try {
      window.sessionStorage.setItem(BLOCK_KEY, "true");
    } catch {
      document.documentElement.dataset.contactTinymlBlocked = "true";
    }

    form.reset();
    form.dataset.tinyMlSession = "blocked";

    Array.from(form.querySelectorAll("input, textarea, select, button")).forEach(function (field) {
      field.disabled = true;
      field.setAttribute("aria-invalid", "true");
    });

    status.textContent =
      reason ||
      "Contact TinyML closed this session after bot-trap activity was detected.";
  }

  function createClientSession() {
    const sessionId =
      (window.crypto && window.crypto.randomUUID && window.crypto.randomUUID()) ||
      `contact-session-${Date.now()}-${Math.random().toString(16).slice(2)}`;

    const bytes = new Uint8Array(32);

    if (window.crypto && window.crypto.getRandomValues) {
      window.crypto.getRandomValues(bytes);
    } else {
      for (let i = 0; i < bytes.length; i++) {
        bytes[i] = Math.floor(Math.random() * 256);
      }
    }

    const nonce = Array.from(bytes)
      .map(function (byte) {
        return byte.toString(16).padStart(2, "0");
      })
      .join("");

    return {
      sessionId,
      nonce,
      issuedAt: nowIso()
    };
  }

  function stableStringify(value) {
    if (value === null || typeof value !== "object") {
      return JSON.stringify(value);
    }

    if (Array.isArray(value)) {
      return "[" + value.map(stableStringify).join(",") + "]";
    }

    const keys = Object.keys(value).sort();

    return (
      "{" +
      keys
        .map(function (key) {
          return JSON.stringify(key) + ":" + stableStringify(value[key]);
        })
        .join(",") +
      "}"
    );
  }

  async function sha256Hex(value) {
    if (!window.crypto || !window.crypto.subtle || !window.TextEncoder) {
      return "";
    }

    const digest = await window.crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(String(value || ""))
    );

    return Array.from(new Uint8Array(digest))
      .map(function (byte) {
        return byte.toString(16).padStart(2, "0");
      })
      .join("");
  }

  function scanForm(form) {
    const fields = Array.from(form.querySelectorAll("input, textarea, select")).filter(function (field) {
      return !field.disabled && !isHoneypot(field);
    });

    const rawFields = {};
    const cleanedFields = {};
    const report = [];

    fields.forEach(function (field, index) {
      const key = getFieldKey(field, index);
      const originalValue = toText(field.value);
      const result = scanField(originalValue);

      addFieldValue(rawFields, key, originalValue);
      addFieldValue(cleanedFields, key, result.cleaned);

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

    return {
      rawFields,
      cleanedFields,
      report,
      blocked: report.some(function (item) {
        return item.blocked;
      })
    };
  }

  function getConfig(form) {
    const endpoint =
      form.getAttribute("data-upstream-path") ||
      form.getAttribute("action") ||
      DEFAULT_REPO_ENDPOINT;

    return {
      endpoint,
      assetId:
        form.getAttribute("data-ops-asset-id") ||
        form.getAttribute("data-asset-id") ||
        DEFAULT_ASSET_ID,
      repoId:
        form.getAttribute("data-gabo-repo-id") ||
        form.getAttribute("data-repo-id") ||
        DEFAULT_REPO_ID,
      sourcePath:
        form.getAttribute("data-source-path") ||
        DEFAULT_SOURCE_PATH,
      assetSource:
        form.getAttribute("data-asset-source") ||
        "github-pages-static-contact-form"
    };
  }

  function pick(source, keys) {
    for (const key of keys) {
      const value = source[key];

      if (Array.isArray(value)) {
        const joined = value.filter(Boolean).join(", ");
        if (joined) return joined;
      }

      if (value !== undefined && value !== null && String(value).trim()) {
        return String(value).trim();
      }
    }

    return "";
  }

  function pickList(source, keys) {
    for (const key of keys) {
      const value = source[key];

      if (Array.isArray(value)) {
        return value.filter(Boolean).slice(0, MAX_LIST_ITEMS);
      }

      if (value !== undefined && value !== null && String(value).trim()) {
        return [String(value).trim()];
      }
    }

    return [];
  }

  function buildCanonicalPayload(form, config, session, scan, integritySha256) {
    const cleaned = scan.cleanedFields;

    return {
      formType: "contact",
      route: "contact",
      site: "Gabriel Services",
      repo: "redesigned-octo-meme",

      request_id:
        (window.crypto && window.crypto.randomUUID && window.crypto.randomUUID()) ||
        `contact-${Date.now()}-${Math.random().toString(16).slice(2)}`,

      submittedAt: nowIso(),
      pageUrl: window.location.href,
      source: window.location.pathname,
      sourcePath: config.sourcePath,
      assetSource: config.assetSource,

      fields: {
        fullName: pick(cleaned, ["fullName", "full_name", "name"]),
        emailAddress: pick(cleaned, ["emailAddress", "email", "email_address"]),
        countryCode: pick(cleaned, ["countryCode", "country_code"]),
        contactNumber: pick(cleaned, ["contactNumber", "phone", "contact_number"]),
        city: pick(cleaned, ["city"]),
        stateProvince: pick(cleaned, ["stateProvince", "state", "province", "state_province"]),
        spaceSuiteApt: pick(cleaned, ["spaceSuiteApt", "suite", "apt", "apartment", "space_suite_apt"]),
        countryZipCode: pick(cleaned, ["countryZipCode", "zipCode", "postalCode", "country_zip_code"]),
        bestContactDate: pick(cleaned, ["bestContactDate", "best_contact_date"]),
        bestContactTime: pick(cleaned, ["bestContactTime", "best_contact_time"]),
        inquiryAbout: pick(cleaned, ["inquiryAbout", "subject", "topic", "contactInterest"]),
        message: pick(cleaned, ["message", "comments", "details"])
      },

      lists: {
        skills: pickList(cleaned, ["skills", "skills[]"]),
        areasOfInterest: pickList(cleaned, ["areasOfInterest", "areaOfInterest", "areaOfInterest[]", "interests"]),
        experienceLevels: pickList(cleaned, ["experienceLevels", "experienceLevel", "experienceLevel[]", "experience"]),
        education: pickList(cleaned, ["education", "education[]"]),
        languages: pickList(cleaned, ["languages", "languages[]"])
      },

      rawFields: cleaned,

      clientSession: {
        id: session.sessionId,
        nonce: session.nonce,
        issuedAt: session.issuedAt
      },

      clientIntegrity: {
        checked: true,
        checked_at: nowIso(),
        sha256: integritySha256,
        report: scan.report
      },

      security: {
        lane: "contact",
        browser_tinyml: "passed",
        origin: window.location.origin,
        asset_id: config.assetId,
        repo_id: config.repoId
      }
    };
  }

  async function submitToRepoWorker(form, status, scan) {
    const config = getConfig(form);
    const session = createClientSession();

    const integrityBase = {
      page: PAGE_NAME,
      origin: window.location.origin,
      path: window.location.pathname,
      cleanedFields: scan.cleanedFields,
      sessionId: session.sessionId,
      nonce: session.nonce
    };

    const integritySha256 = await sha256Hex(stableStringify(integrityBase));
    const payload = buildCanonicalPayload(form, config, session, scan, integritySha256);

    const payloadLength = stableStringify(payload).length;

    if (payloadLength > MAX_TOTAL_PAYLOAD_CHARS) {
      status.textContent = "Contact TinyML blocked this submission because the payload is too large.";
      return;
    }

    const response = await fetch(config.endpoint, {
      method: "POST",
      mode: "cors",
      credentials: "omit",
      headers: {
        "Content-Type": "application/json",

        "X-Ops-Asset-Id": config.assetId,
        "X-Gabo-Repo-Id": config.repoId,
        "X-Gabo-Session-Id": session.sessionId,
        "X-Gabo-Nonce": session.nonce,
        "X-Gabo-Integrity-SHA256": integritySha256,
        "X-Gabo-Origin": window.location.origin,
        "X-Gabo-Source": config.sourcePath,

        /*
         * Temporary compatibility headers.
         * Step 2 should standardize repo-worker.js to the title-case versions above.
         */
        "X-Gabo-Asset-ID": config.assetId,
        "X-Gabo-Repo-ID": config.repoId
      },
      body: JSON.stringify(payload)
    });

    const responseText = await response.text();
    let responseJson = null;

    try {
      responseJson = JSON.parse(responseText);
    } catch {
      responseJson = null;
    }

    if (!response.ok || !responseJson || responseJson.ok !== true) {
      throw new Error(
        responseJson && responseJson.message
          ? responseJson.message
          : `Repo Contact worker rejected the submission: ${response.status}`
      );
    }

    status.textContent =
      responseJson.message ||
      "Contact TinyML passed. Repo Contact worker accepted the submission.";

    form.reset();
  }

  function initForm(form) {
    if (form.dataset.contactTinymlInitialized === "true") return;

    form.dataset.contactTinymlInitialized = "true";

    const status = ensureStatus(form);

    getHoneypotFields(form).forEach(function (field) {
      field.addEventListener("input", function () {
        if (String(field.value || "").trim()) {
          blockSession(
            form,
            status,
            "Contact TinyML closed this session after bot-trap activity was detected."
          );
        }
      });
    });

    if (isSessionBlocked()) {
      blockSession(form, status, "Contact TinyML session is blocked.");
      return;
    }

    form.addEventListener("submit", async function (event) {
      event.preventDefault();

      const honeypot = getHoneypotFields(form).find(function (field) {
        return String(field.value || "").trim();
      });

      if (honeypot) {
        blockSession(
          form,
          status,
          "Contact TinyML closed this session after bot-trap activity was detected."
        );
        return;
      }

      const submitter = event.submitter;

      if (submitter instanceof HTMLButtonElement) {
        submitter.disabled = true;
      }

      try {
        const scan = scanForm(form);

        if (scan.blocked) {
          const blockedCount = scan.report.filter(function (item) {
            return item.blocked;
          }).length;

          status.textContent =
            `Contact TinyML blocked ${blockedCount} field(s). ` +
            "Remove scripts, programming code, SQL, shell commands, or template payloads before submitting.";

          return;
        }

        status.textContent = "Contact TinyML cleaned the form. Sending to the repo Contact worker.";

        await submitToRepoWorker(form, status, scan);
      } catch (error) {
        form.dataset.contactGatewayError = String(error && error.message ? error.message : error);

        status.textContent =
          "Contact TinyML passed, but the repo Contact worker is unavailable or rejected the secure handoff.";
      } finally {
        if (submitter instanceof HTMLButtonElement) {
          submitter.disabled = false;
        }
      }
    });
  }

  function init() {
    document.querySelectorAll(FORM_SELECTOR).forEach(initForm);
  }

  window.GaboContactTinyML = {
    sanitizeText,
    scanField,
    summarizeThreats,
    stableStringify
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();(function () {
  "use strict";

  const PAGE_NAME = "contact";
  const FORM_SELECTOR = 'form[data-contact-gateway="true"]';

  /*
   * STEP 1 RULE:
   * Browser TinyML must NOT call contacto.gabo.services directly.
   * It cleans/scans/signs locally, then sends to the repo Worker endpoint.
   */
  const DEFAULT_REPO_ENDPOINT = "/api/contact";

  const DEFAULT_ASSET_ID = "redesigned-octo-meme-contact";
  const DEFAULT_REPO_ID = "CONTACTO";
  const DEFAULT_SOURCE_PATH = "contact.html";

  const MAX_FIELD_LENGTH = 2000;
  const MAX_LIST_ITEMS = 100;
  const MAX_TOTAL_PAYLOAD_CHARS = 12000;

  const RISK_THRESHOLD = 4;
  const RESIDUAL_THRESHOLD = 1;

  const BLOCK_KEY = "gabo-contact-tinyml-session-blocked";

  const RISK_SIGNATURES = [
    {
      label: "script-tag",
      weight: 4,
      pattern: /<\s*\/?\s*script\b/gi
    },
    {
      label: "dangerous-html-tag",
      weight: 3,
      pattern: /<\s*\/?\s*(?:iframe|object|embed|applet|meta|link|base|form|svg|math|template|style)\b/gi
    },
    {
      label: "event-handler",
      weight: 3,
      pattern: /\bon[a-z]{3,}\s*=/gi
    },
    {
      label: "active-uri",
      weight: 4,
      pattern: /\b(?:javascript|vbscript|data|file|blob)\s*:/gi
    },
    {
      label: "html-tag",
      weight: 2,
      pattern: /<\/?[a-z][\s\S]*?>/gi
    },
    {
      label: "code-block",
      weight: 4,
      pattern: /```[\s\S]*?```|~~~[\s\S]*?~~~/g
    },
    {
      label: "inline-code",
      weight: 2,
      pattern: /`[^`\n]{2,}`/g
    },
    {
      label: "js-code-token",
      weight: 3,
      pattern: /\b(?:eval|Function|setTimeout|setInterval|XMLHttpRequest|document\.|window\.|localStorage|sessionStorage|import\s|require\s*\(|process\.|globalThis)\b/gi
    },
    {
      label: "programming-declaration",
      weight: 2,
      pattern: /\b(?:const|let|var|function|class|def|lambda|async\s+function|return|public\s+class|using\s+namespace)\b[\s\w]*(?:[({=;:]|=>)/gi
    },
    {
      label: "sql-injection",
      weight: 3,
      pattern: /(?:\bunion\s+(?:all\s+)?select\b|\bselect\b[\s\S]{0,80}\bfrom\b|\binsert\s+into\b|\bupdate\b[\s\S]{0,80}\bset\b|\bdelete\s+from\b|\bdrop\s+(?:table|database)\b|\btruncate\s+table\b|--\s|\/\*|\*\/|;\s*(?:select|drop|insert|delete|update)\b)/gi
    },
    {
      label: "shell-or-path-exec",
      weight: 3,
      pattern: /(?:\.\.\/|\b(?:curl|wget|bash|sh|powershell|cmd\.exe|chmod|sudo|rm\s+-rf|nc\s+-|python\s+-c|node\s+-e)\b|\|\||&&)/gi
    },
    {
      label: "template-injection",
      weight: 3,
      pattern: /(?:\$\{[\s\S]*?\}|\{\{[\s\S]*?\}\}|<%[\s\S]*?%>)/g
    },
    {
      label: "dense-code-punctuation",
      weight: 2,
      pattern: /(?:[{}()[\];=<>|&]{5,}|[A-Za-z_$][\w$]*\s*=>)/g
    }
  ];

  function toText(value) {
    return String(value ?? "");
  }

  function nowIso() {
    return new Date().toISOString();
  }

  function cleanKey(value) {
    return toText(value)
      .normalize("NFKC")
      .replace(/\u0000/g, "")
      .replace(/[\u0001-\u001F\u007F]/g, "")
      .replace(/[<>`"']/g, "")
      .replace(/\s+/g, "_")
      .trim()
      .slice(0, 80);
  }

  function decodeHtmlEntities(value) {
    const raw = toText(value);

    if (!/[&][#a-z0-9]+;/i.test(raw)) return raw;
    if (!document.createElement) return raw;

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
    return toText(value)
      .split(/\r?\n/)
      .filter(function (line) {
        const trimmed = line.trim();

        if (!trimmed) return true;

        return !/(?:^\s*(?:const|let|var|function|class|def|import|export|return|if|for|while|switch|try|catch)\b|=>|[{};]{2,}|<\/?[a-z][\s\S]*?>|\b(?:SELECT|DROP|DELETE|INSERT|UPDATE)\b)/i.test(trimmed);
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
    const raw = toText(value);
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
      reasons: Array.from(new Set([].concat(rawThreat.reasons, residualThreat.reasons)))
    };
  }

  function isHoneypot(field) {
    return !!field && !!field.matches && field.matches('[data-tinyml-honeypot="true"]');
  }

  function getHoneypotFields(form) {
    return Array.from(form.querySelectorAll('[data-tinyml-honeypot="true"]'));
  }

  function getFieldKey(field, index) {
    const name =
      field.getAttribute("name") ||
      field.getAttribute("aria-label") ||
      field.id ||
      `field_${index + 1}`;

    return cleanKey(name) || `field_${index + 1}`;
  }

  function normalizeArrayKey(key) {
    return String(key || "").replace(/\[\]$/, "");
  }

  function addFieldValue(target, key, value) {
    const normalizedKey = normalizeArrayKey(key);

    if (!normalizedKey) return;

    if (key.endsWith("[]")) {
      if (!Array.isArray(target[normalizedKey])) target[normalizedKey] = [];

      if (value) {
        target[normalizedKey].push(value);
        target[normalizedKey] = target[normalizedKey].slice(0, MAX_LIST_ITEMS);
      }

      return;
    }

    if (target[normalizedKey] === undefined) {
      target[normalizedKey] = value;
      return;
    }

    if (!Array.isArray(target[normalizedKey])) {
      target[normalizedKey] = [target[normalizedKey]].filter(Boolean);
    }

    if (value) target[normalizedKey].push(value);
    target[normalizedKey] = target[normalizedKey].slice(0, MAX_LIST_ITEMS);
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
      return window.sessionStorage.getItem(BLOCK_KEY) === "true";
    } catch {
      return document.documentElement.dataset.contactTinymlBlocked === "true";
    }
  }

  function blockSession(form, status, reason) {
    try {
      window.sessionStorage.setItem(BLOCK_KEY, "true");
    } catch {
      document.documentElement.dataset.contactTinymlBlocked = "true";
    }

    form.reset();
    form.dataset.tinyMlSession = "blocked";

    Array.from(form.querySelectorAll("input, textarea, select, button")).forEach(function (field) {
      field.disabled = true;
      field.setAttribute("aria-invalid", "true");
    });

    status.textContent =
      reason ||
      "Contact TinyML closed this session after bot-trap activity was detected.";
  }

  function createClientSession() {
    const sessionId =
      (window.crypto && window.crypto.randomUUID && window.crypto.randomUUID()) ||
      `contact-session-${Date.now()}-${Math.random().toString(16).slice(2)}`;

    const bytes = new Uint8Array(32);

    if (window.crypto && window.crypto.getRandomValues) {
      window.crypto.getRandomValues(bytes);
    } else {
      for (let i = 0; i < bytes.length; i++) {
        bytes[i] = Math.floor(Math.random() * 256);
      }
    }

    const nonce = Array.from(bytes)
      .map(function (byte) {
        return byte.toString(16).padStart(2, "0");
      })
      .join("");

    return {
      sessionId,
      nonce,
      issuedAt: nowIso()
    };
  }

  function stableStringify(value) {
    if (value === null || typeof value !== "object") {
      return JSON.stringify(value);
    }

    if (Array.isArray(value)) {
      return "[" + value.map(stableStringify).join(",") + "]";
    }

    const keys = Object.keys(value).sort();

    return (
      "{" +
      keys
        .map(function (key) {
          return JSON.stringify(key) + ":" + stableStringify(value[key]);
        })
        .join(",") +
      "}"
    );
  }

  async function sha256Hex(value) {
    if (!window.crypto || !window.crypto.subtle || !window.TextEncoder) {
      return "";
    }

    const digest = await window.crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(String(value || ""))
    );

    return Array.from(new Uint8Array(digest))
      .map(function (byte) {
        return byte.toString(16).padStart(2, "0");
      })
      .join("");
  }

  function scanForm(form) {
    const fields = Array.from(form.querySelectorAll("input, textarea, select")).filter(function (field) {
      return !field.disabled && !isHoneypot(field);
    });

    const rawFields = {};
    const cleanedFields = {};
    const report = [];

    fields.forEach(function (field, index) {
      const key = getFieldKey(field, index);
      const originalValue = toText(field.value);
      const result = scanField(originalValue);

      addFieldValue(rawFields, key, originalValue);
      addFieldValue(cleanedFields, key, result.cleaned);

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

    return {
      rawFields,
      cleanedFields,
      report,
      blocked: report.some(function (item) {
        return item.blocked;
      })
    };
  }

  function getConfig(form) {
    const endpoint =
      form.getAttribute("data-upstream-path") ||
      form.getAttribute("action") ||
      DEFAULT_REPO_ENDPOINT;

    return {
      endpoint,
      assetId:
        form.getAttribute("data-ops-asset-id") ||
        form.getAttribute("data-asset-id") ||
        DEFAULT_ASSET_ID,
      repoId:
        form.getAttribute("data-gabo-repo-id") ||
        form.getAttribute("data-repo-id") ||
        DEFAULT_REPO_ID,
      sourcePath:
        form.getAttribute("data-source-path") ||
        DEFAULT_SOURCE_PATH,
      assetSource:
        form.getAttribute("data-asset-source") ||
        "github-pages-static-contact-form"
    };
  }

  function pick(source, keys) {
    for (const key of keys) {
      const value = source[key];

      if (Array.isArray(value)) {
        const joined = value.filter(Boolean).join(", ");
        if (joined) return joined;
      }

      if (value !== undefined && value !== null && String(value).trim()) {
        return String(value).trim();
      }
    }

    return "";
  }

  function pickList(source, keys) {
    for (const key of keys) {
      const value = source[key];

      if (Array.isArray(value)) {
        return value.filter(Boolean).slice(0, MAX_LIST_ITEMS);
      }

      if (value !== undefined && value !== null && String(value).trim()) {
        return [String(value).trim()];
      }
    }

    return [];
  }

  function buildCanonicalPayload(form, config, session, scan, integritySha256) {
    const cleaned = scan.cleanedFields;

    return {
      formType: "contact",
      route: "contact",
      site: "Gabriel Services",
      repo: "redesigned-octo-meme",

      request_id:
        (window.crypto && window.crypto.randomUUID && window.crypto.randomUUID()) ||
        `contact-${Date.now()}-${Math.random().toString(16).slice(2)}`,

      submittedAt: nowIso(),
      pageUrl: window.location.href,
      source: window.location.pathname,
      sourcePath: config.sourcePath,
      assetSource: config.assetSource,

      fields: {
        fullName: pick(cleaned, ["fullName", "full_name", "name"]),
        emailAddress: pick(cleaned, ["emailAddress", "email", "email_address"]),
        countryCode: pick(cleaned, ["countryCode", "country_code"]),
        contactNumber: pick(cleaned, ["contactNumber", "phone", "contact_number"]),
        city: pick(cleaned, ["city"]),
        stateProvince: pick(cleaned, ["stateProvince", "state", "province", "state_province"]),
        spaceSuiteApt: pick(cleaned, ["spaceSuiteApt", "suite", "apt", "apartment", "space_suite_apt"]),
        countryZipCode: pick(cleaned, ["countryZipCode", "zipCode", "postalCode", "country_zip_code"]),
        bestContactDate: pick(cleaned, ["bestContactDate", "best_contact_date"]),
        bestContactTime: pick(cleaned, ["bestContactTime", "best_contact_time"]),
        inquiryAbout: pick(cleaned, ["inquiryAbout", "subject", "topic", "contactInterest"]),
        message: pick(cleaned, ["message", "comments", "details"])
      },

      lists: {
        skills: pickList(cleaned, ["skills", "skills[]"]),
        areasOfInterest: pickList(cleaned, ["areasOfInterest", "areaOfInterest", "areaOfInterest[]", "interests"]),
        experienceLevels: pickList(cleaned, ["experienceLevels", "experienceLevel", "experienceLevel[]", "experience"]),
        education: pickList(cleaned, ["education", "education[]"]),
        languages: pickList(cleaned, ["languages", "languages[]"])
      },

      rawFields: cleaned,

      clientSession: {
        id: session.sessionId,
        nonce: session.nonce,
        issuedAt: session.issuedAt
      },

      clientIntegrity: {
        checked: true,
        checked_at: nowIso(),
        sha256: integritySha256,
        report: scan.report
      },

      security: {
        lane: "contact",
        browser_tinyml: "passed",
        origin: window.location.origin,
        asset_id: config.assetId,
        repo_id: config.repoId
      }
    };
  }

  async function submitToRepoWorker(form, status, scan) {
    const config = getConfig(form);
    const session = createClientSession();

    const integrityBase = {
      page: PAGE_NAME,
      origin: window.location.origin,
      path: window.location.pathname,
      cleanedFields: scan.cleanedFields,
      sessionId: session.sessionId,
      nonce: session.nonce
    };

    const integritySha256 = await sha256Hex(stableStringify(integrityBase));
    const payload = buildCanonicalPayload(form, config, session, scan, integritySha256);

    const payloadLength = stableStringify(payload).length;

    if (payloadLength > MAX_TOTAL_PAYLOAD_CHARS) {
      status.textContent = "Contact TinyML blocked this submission because the payload is too large.";
      return;
    }

    const response = await fetch(config.endpoint, {
      method: "POST",
      mode: "cors",
      credentials: "omit",
      headers: {
        "Content-Type": "application/json",

        "X-Ops-Asset-Id": config.assetId,
        "X-Gabo-Repo-Id": config.repoId,
        "X-Gabo-Session-Id": session.sessionId,
        "X-Gabo-Nonce": session.nonce,
        "X-Gabo-Integrity-SHA256": integritySha256,
        "X-Gabo-Origin": window.location.origin,
        "X-Gabo-Source": config.sourcePath,

        /*
         * Temporary compatibility headers.
         * Step 2 should standardize repo-worker.js to the title-case versions above.
         */
        "X-Gabo-Asset-ID": config.assetId,
        "X-Gabo-Repo-ID": config.repoId
      },
      body: JSON.stringify(payload)
    });

    const responseText = await response.text();
    let responseJson = null;

    try {
      responseJson = JSON.parse(responseText);
    } catch {
      responseJson = null;
    }

    if (!response.ok || !responseJson || responseJson.ok !== true) {
      throw new Error(
        responseJson && responseJson.message
          ? responseJson.message
          : `Repo Contact worker rejected the submission: ${response.status}`
      );
    }

    status.textContent =
      responseJson.message ||
      "Contact TinyML passed. Repo Contact worker accepted the submission.";

    form.reset();
  }

  function initForm(form) {
    if (form.dataset.contactTinymlInitialized === "true") return;

    form.dataset.contactTinymlInitialized = "true";

    const status = ensureStatus(form);

    getHoneypotFields(form).forEach(function (field) {
      field.addEventListener("input", function () {
        if (String(field.value || "").trim()) {
          blockSession(
            form,
            status,
            "Contact TinyML closed this session after bot-trap activity was detected."
          );
        }
      });
    });

    if (isSessionBlocked()) {
      blockSession(form, status, "Contact TinyML session is blocked.");
      return;
    }

    form.addEventListener("submit", async function (event) {
      event.preventDefault();

      const honeypot = getHoneypotFields(form).find(function (field) {
        return String(field.value || "").trim();
      });

      if (honeypot) {
        blockSession(
          form,
          status,
          "Contact TinyML closed this session after bot-trap activity was detected."
        );
        return;
      }

      const submitter = event.submitter;

      if (submitter instanceof HTMLButtonElement) {
        submitter.disabled = true;
      }

      try {
        const scan = scanForm(form);

        if (scan.blocked) {
          const blockedCount = scan.report.filter(function (item) {
            return item.blocked;
          }).length;

          status.textContent =
            `Contact TinyML blocked ${blockedCount} field(s). ` +
            "Remove scripts, programming code, SQL, shell commands, or template payloads before submitting.";

          return;
        }

        status.textContent = "Contact TinyML cleaned the form. Sending to the repo Contact worker.";

        await submitToRepoWorker(form, status, scan);
      } catch (error) {
        form.dataset.contactGatewayError = String(error && error.message ? error.message : error);

        status.textContent =
          "Contact TinyML passed, but the repo Contact worker is unavailable or rejected the secure handoff.";
      } finally {
        if (submitter instanceof HTMLButtonElement) {
          submitter.disabled = false;
        }
      }
    });
  }

  function init() {
    document.querySelectorAll(FORM_SELECTOR).forEach(initForm);
  }

  window.GaboContactTinyML = {
    sanitizeText,
    scanField,
    summarizeThreats,
    stableStringify
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
