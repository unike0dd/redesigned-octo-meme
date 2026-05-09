(function () {
  "use strict";

  const FORM_SELECTOR = 'form[data-contact-gateway="true"]';

  const DEFAULT_REPO_ENDPOINT = "https://contact-api.gabo.services/api/contact";
  const LEGACY_REPO_ENDPOINT_PATH = "/api/contact";
  const DEFAULT_ASSET_ID = "redesigned-octo-meme-contact";
  const DEFAULT_REPO_ID = "CONTACTO";
  const DEFAULT_SOURCE = "contact.html";

  const BLOCK_KEY = "gabo-contact-tinyml-blocked";
  const MAX_FIELD_CHARS = 5000;
  const MAX_BODY_CHARS = 18000;
  const MAX_RISK_SCORE = 55;

  const BLOCK_PATTERNS = [
    "javascript:",
    "vbscript:",
    "data:text/html",
    "<script",
    "</script",
    "<style",
    "</style",
    "<iframe",
    "<object",
    "<embed",
    "<svg",
    "<math",
    "<form",
    "<template",
    "srcdoc=",
    "onerror=",
    "onload=",
    "onclick=",
    "onmouseover=",
    "document.",
    "window.",
    "document.cookie",
    "localstorage",
    "sessionstorage",
    "eval(",
    "new function",
    "function(",
    "constructor",
    "__proto__",
    "prototype",
    "globalthis",
    "process.",
    "require(",
    "import ",
    "export ",
    "select * from",
    "union select",
    "drop table",
    "insert into",
    "delete from",
    "../",
    "${",
    "{{",
    "}}",
    "<%",
    "%>"
  ];

  function text(value) {
    return String(value ?? "");
  }

  function nowIso() {
    return new Date().toISOString();
  }

  function cleanText(value) {
    return text(value)
      .normalize("NFKC")
      .replace(/\u0000/g, "")
      .replace(/[\u0001-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, " ")
      .replace(/[<>]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function sanitizeText(value) {
    return text(value)
      .normalize("NFKC")
      .replace(/\u0000/g, "")
      .replace(/```[\s\S]*?```/g, " ")
      .replace(/~~~[\s\S]*?~~~/g, " ")
      .replace(/`[^`]{1,500}`/g, " ")
      .replace(/<\s*(script|style|iframe|object|embed|svg|math|form|template)\b[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, " ")
      .replace(/<\s*(script|style|iframe|object|embed|svg|math|form|template|meta|link|base)\b[^>]*>/gi, " ")
      .replace(/<\/?[^>]+>/g, " ")
      .replace(/\bon\w+\s*=\s*["'][\s\S]*?["']/gi, " ")
      .replace(/\bon\w+\s*=\s*[^\s>]+/gi, " ")
      .replace(/\bjavascript\s*:/gi, " ")
      .replace(/\bvbscript\s*:/gi, " ")
      .replace(/\bdata\s*:\s*text\/html\b/gi, " ")
      .replace(/\beval\s*\(/gi, " ")
      .replace(/\bnew\s+Function\b/gi, " ")
      .replace(/\bsetTimeout\s*\(/gi, " ")
      .replace(/\bsetInterval\s*\(/gi, " ")
      .replace(/\bdocument\.(cookie|write|location)\b/gi, " ")
      .replace(/\bwindow\.(location|open)\b/gi, " ")
      .replace(/\b(import|export|function|class|const|let|var|return|await|async|fetch|XMLHttpRequest|localStorage|sessionStorage)\b/gi, " ")
      .replace(/[{}()[\];=<>$\\|]/g, " ")
      .replace(/[\u0001-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, MAX_FIELD_CHARS);
  }

  function riskScore(value) {
    const lower = text(value).toLowerCase();
    const flags = [];
    let score = 0;

    for (const pattern of BLOCK_PATTERNS) {
      if (lower.includes(pattern)) {
        flags.push(pattern);
        score += 20;
      }
    }

    if (lower.length < 30 && lower.length > 0) {
      flags.push("short_payload");
      score += 10;
    }

    if ((lower.match(/https?:\/\//g) || []).length > 8) {
      flags.push("excessive_links");
      score += 15;
    }

    return {
      ok: score <= MAX_RISK_SCORE,
      score,
      flags: Array.from(new Set(flags))
    };
  }

  function getFieldKey(field, index) {
    return cleanText(
      field.getAttribute("name") ||
      field.getAttribute("aria-label") ||
      field.id ||
      `field_${index + 1}`
    ).replace(/\s+/g, "_");
  }

  function isHoneypot(field) {
    return !!field && !!field.matches && field.matches('[data-tinyml-honeypot="true"]');
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

  function blockSession(form, status, message) {
    try {
      sessionStorage.setItem(BLOCK_KEY, "true");
    } catch {
      document.documentElement.dataset.contactTinymlBlocked = "true";
    }

    form.reset();
    form.dataset.tinymlBlocked = "true";

    Array.from(form.querySelectorAll("input, textarea, select, button")).forEach(function (field) {
      field.disabled = true;
      field.setAttribute("aria-invalid", "true");
    });

    status.textContent = message || "Contact TinyML blocked this session.";
  }

  function sessionIsBlocked() {
    try {
      return sessionStorage.getItem(BLOCK_KEY) === "true";
    } catch {
      return document.documentElement.dataset.contactTinymlBlocked === "true";
    }
  }

  function addValue(target, key, value) {
    if (!key) return;

    const cleanKey = key.replace(/\[\]$/, "");
    const cleanValue = sanitizeText(value);

    if (key.endsWith("[]")) {
      if (!Array.isArray(target[cleanKey])) target[cleanKey] = [];
      if (cleanValue) target[cleanKey].push(cleanValue);
      return;
    }

    if (target[cleanKey] === undefined) {
      target[cleanKey] = cleanValue;
      return;
    }

    if (!Array.isArray(target[cleanKey])) {
      target[cleanKey] = [target[cleanKey]].filter(Boolean);
    }

    if (cleanValue) target[cleanKey].push(cleanValue);
  }

  function scanForm(form) {
    const fields = Array.from(form.querySelectorAll("input, textarea, select")).filter(function (field) {
      return !field.disabled && !isHoneypot(field);
    });

    const rawFields = {};
    const cleanedFields = {};
    const report = [];
    let blocked = false;

    fields.forEach(function (field, index) {
      const key = getFieldKey(field, index);
      const raw = text(field.value);
      const cleaned = sanitizeText(raw);
      const rawRisk = riskScore(raw);
      const cleanRisk = riskScore(cleaned);

      rawFields[key] = raw;
      addValue(cleanedFields, key, cleaned);

      field.value = cleaned;
      field.setAttribute("aria-invalid", String(!cleanRisk.ok));

      if (!rawRisk.ok || !cleanRisk.ok) blocked = true;

      report.push({
        key,
        raw_risk_score: rawRisk.score,
        raw_flags: rawRisk.flags,
        sanitized_risk_score: cleanRisk.score,
        sanitized_flags: cleanRisk.flags,
        removed_characters: Math.max(raw.length - cleaned.length, 0)
      });
    });

    return {
      rawFields,
      cleanedFields,
      report,
      blocked
    };
  }

  function createSession() {
    const sessionId =
      (crypto && crypto.randomUUID && crypto.randomUUID()) ||
      `contact-${Date.now()}-${Math.random().toString(16).slice(2)}`;

    const bytes = new Uint8Array(32);

    if (crypto && crypto.getRandomValues) {
      crypto.getRandomValues(bytes);
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
    if (value === null || typeof value !== "object") return JSON.stringify(value);

    if (Array.isArray(value)) {
      return "[" + value.map(stableStringify).join(",") + "]";
    }

    return (
      "{" +
      Object.keys(value)
        .sort()
        .map(function (key) {
          return JSON.stringify(key) + ":" + stableStringify(value[key]);
        })
        .join(",") +
      "}"
    );
  }

  async function sha256Hex(value) {
    if (!crypto || !crypto.subtle || !TextEncoder) return "";

    const digest = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(String(value || ""))
    );

    return Array.from(new Uint8Array(digest))
      .map(function (byte) {
        return byte.toString(16).padStart(2, "0");
      })
      .join("");
  }

  function pick(source, keys) {
    for (const key of keys) {
      const value = source[key];

      if (Array.isArray(value)) {
        const joined = value.map(cleanText).filter(Boolean).join(", ");
        if (joined) return joined;
      }

      if (value !== undefined && value !== null) {
        const clean = cleanText(value);
        if (clean) return clean;
      }
    }

    return "";
  }

  function pickList(source, keys) {
    for (const key of keys) {
      const value = source[key];

      if (Array.isArray(value)) {
        return value.map(cleanText).filter(Boolean).slice(0, 100);
      }

      if (value !== undefined && value !== null) {
        const clean = cleanText(value);
        if (clean) return [clean];
      }
    }

    return [];
  }

  function buildPayload(form, config, session, scan, clientSha256) {
    const cleaned = scan.cleanedFields;

    return {
      formType: "contact",
      route: "contact",
      site: "Gabriel Services",
      repo: "redesigned-octo-meme",
      request_id:
        (crypto && crypto.randomUUID && crypto.randomUUID()) ||
        `contact-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      submittedAt: nowIso(),
      pageUrl: location.href,
      source: location.pathname || "/contact.html",

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
        sha256: clientSha256,
        report: scan.report
      },

      security: {
        lane: "contact",
        browser_tinyml: "passed",
        origin: location.origin,
        repo_id: config.repoId,
        asset_id: config.assetId
      }
    };
  }

  function normalizeRepoEndpoint(value) {
    if (!value || value === DEFAULT_REPO_ENDPOINT) return DEFAULT_REPO_ENDPOINT;

    try {
      const url = new URL(value, location.origin);

      if (url.origin === location.origin && url.pathname === LEGACY_REPO_ENDPOINT_PATH) {
        return DEFAULT_REPO_ENDPOINT;
      }
    } catch {
      return DEFAULT_REPO_ENDPOINT;
    }

    return DEFAULT_REPO_ENDPOINT;
  }

  function getConfig(form) {
    return {
      endpoint: normalizeRepoEndpoint(
        form.getAttribute("data-upstream-path") ||
        form.getAttribute("action") ||
        DEFAULT_REPO_ENDPOINT
      ),

      assetId:
        form.getAttribute("data-ops-asset-id") ||
        form.getAttribute("data-asset-id") ||
        DEFAULT_ASSET_ID,

      repoId:
        form.getAttribute("data-gabo-repo-id") ||
        form.getAttribute("data-repo-id") ||
        DEFAULT_REPO_ID,

      source:
        form.getAttribute("data-source-path") ||
        DEFAULT_SOURCE
    };
  }

  async function submitForm(form, status, scan) {
    const config = getConfig(form);
    const session = createSession();

    const clientHashBase = {
      route: "contact",
      origin: location.origin,
      source: location.pathname || "/contact.html",
      session_id: session.sessionId,
      nonce: session.nonce,
      cleanedFields: scan.cleanedFields
    };

    const clientSha256 = await sha256Hex(stableStringify(clientHashBase));
    const payload = buildPayload(form, config, session, scan, clientSha256);

    if (stableStringify(payload).length > MAX_BODY_CHARS) {
      status.textContent = "Contact TinyML blocked the form because the payload is too large.";
      return;
    }

    const response = await fetch(config.endpoint, {
      method: "POST",
      mode: "cors",
      credentials: "omit",
      headers: {
        "Content-Type": "application/json",
        "X-Gabo-Origin": location.origin,
        "X-Gabo-Source": config.source,
        "X-Ops-Asset-Id": config.assetId,
        "X-Gabo-Repo-Id": config.repoId,
        "X-Gabo-Session-Id": session.sessionId,
        "X-Gabo-Nonce": session.nonce,
        "X-Gabo-Integrity-SHA256": clientSha256
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
          : `Contact repo worker rejected: ${response.status}`
      );
    }

    status.textContent =
      responseJson.message ||
      "Contact TinyML passed and the repo worker accepted the handoff.";

    form.reset();
  }

  function initForm(form) {
    if (form.dataset.contactTinymlReady === "true") return;
    form.dataset.contactTinymlReady = "true";

    const status = ensureStatus(form);

    if (sessionIsBlocked()) {
      blockSession(form, status, "Contact TinyML session is blocked.");
      return;
    }

    Array.from(form.querySelectorAll('[data-tinyml-honeypot="true"]')).forEach(function (field) {
      field.addEventListener("input", function () {
        if (String(field.value || "").trim()) {
          blockSession(form, status, "Contact TinyML closed this session after bot-trap activity.");
        }
      });
    });

    form.addEventListener("submit", async function (event) {
      event.preventDefault();

      const honeypot = Array.from(form.querySelectorAll('[data-tinyml-honeypot="true"]')).find(function (field) {
        return String(field.value || "").trim();
      });

      if (honeypot) {
        blockSession(form, status, "Contact TinyML closed this session after bot-trap activity.");
        return;
      }

      const submitter = event.submitter;

      if (submitter && "disabled" in submitter) {
        submitter.disabled = true;
      }

      try {
        const scan = scanForm(form);

        if (scan.blocked) {
          status.textContent = "Contact TinyML blocked malicious or programming-code-like content.";
          return;
        }

        status.textContent = "Contact TinyML cleaned the form. Sending to repo worker.";

        await submitForm(form, status, scan);
      } catch (error) {
        form.dataset.contactError = String(error && error.message ? error.message : error);
        status.textContent = "Contact TinyML passed, but the repo worker handoff failed.";
      } finally {
        if (submitter && "disabled" in submitter) {
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
    riskScore,
    stableStringify
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
