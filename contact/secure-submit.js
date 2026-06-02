/**
 * contact/secure-submit.js
 *
 * Browser-side secure contact submit handler.
 *
 * This is a browser-only public submit handler.
 * This file does not contain private platform details.
 * This file only prepares a sanitized public intake payload and sends it
 * to the configured public contact endpoint.
 */

(function () {
  "use strict";

  const CONTACT_EXPECTED_ASSET_ID = "redesigned-octo-meme-contact";
  const CONTACT_EXPECTED_REPO_ID = "CONTACTO";
  const CONTACT_EXPECTED_SOURCE = "contact.html";
  const CONTACT_EXPECTED_HEADER_POLICY = "contacto-repo-contact-v1";
  const CONTACT_ALLOWED_ORIGINS_JSON =
    '["https://unike0dd.github.io","https://gabo.services","https://www.gabo.services"]';
  const CONTACT_PUBLIC_BASE_URL = "https://contacto.gabo.services";
  const CONTACT_API_PATH = "/api/contact";
  const CONTACT_MAX_BODY_BYTES = 24576;
  const CONTACT_MAX_FIELD_LENGTH = 5000;
  const CONTACT_MAX_RISK_SCORE = 55;

  const CONTACT_ALLOWED_ORIGINS = Object.freeze(JSON.parse(CONTACT_ALLOWED_ORIGINS_JSON));

  const PUBLIC_CONTACT_CONTRACT = Object.freeze({
    endpoint: CONTACT_PUBLIC_BASE_URL + CONTACT_API_PATH,
    route: CONTACT_API_PATH,

    schema: "gabo.contact.repo.v2",

    repoId: CONTACT_EXPECTED_REPO_ID,
    assetId: CONTACT_EXPECTED_ASSET_ID,
    source: CONTACT_EXPECTED_SOURCE,
    headerPolicy: CONTACT_EXPECTED_HEADER_POLICY,

    allowedOriginsJson: CONTACT_ALLOWED_ORIGINS_JSON,
    allowedOrigins: CONTACT_ALLOWED_ORIGINS,
    publicBaseUrl: CONTACT_PUBLIC_BASE_URL,
    maxBodyBytes: CONTACT_MAX_BODY_BYTES,
    maxFieldLength: CONTACT_MAX_FIELD_LENGTH,
    maxRiskScore: CONTACT_MAX_RISK_SCORE,

    clientName: "repo-contact-v3",
    tinyMLVersion: "browser-rules-v3",
    cySecVersion: "sanitize-scan-integrity-v3",

    submitLockMs: 1500
  });

  const HEADER = Object.freeze({
    contentType: "Content-Type",
    origin: "X-Gabo-Origin",
    source: "X-Gabo-Source",
    assetId: "X-Ops-Asset-Id",
    repoId: "X-Gabo-Repo-Id",
    sessionId: "X-Gabo-Session-Id",
    nonce: "X-Gabo-Nonce",
    integrity: "X-Gabo-Integrity-SHA256",
    headerPolicy: "X-Gabo-Header-Policy",
    client: "X-Gabo-Client"
  });

  const SELECTOR = Object.freeze({
    forms: [
      "form[data-contact-form]",
      "#contact-form",
      "form.contact-form",
      "form[action*='contacto.gabo.services/api/contact']",
      "form[action*='contact']"
    ],
    status: [
      "[data-contact-status]",
      "#contact-status",
      ".contact-status"
    ],
    submitControls:
      "button[type='submit'], input[type='submit'], button[data-contact-submit]"
  });

  let lastSubmitAt = 0;

  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
      return;
    }

    callback();
  }

  function t(key, fallback) {
    if (window.I18N && typeof window.I18N.t === "function") {
      const value = window.I18N.t(key);
      if (value && value !== key) return value;
    }

    return fallback || key;
  }

  function tinyML() {
    if (!window.GaboContactTinyML) {
      throw new Error("Contact protection is unavailable.");
    }

    return window.GaboContactTinyML;
  }

  function findForm() {
    for (const selector of SELECTOR.forms) {
      const form = document.querySelector(selector);
      if (form) return form;
    }

    return null;
  }

  function findStatusNode(form) {
    if (form) {
      for (const selector of SELECTOR.status) {
        const local = form.querySelector(selector);
        if (local) return local;
      }
    }

    for (const selector of SELECTOR.status) {
      const node = document.querySelector(selector);
      if (node) return node;
    }

    return null;
  }

  function setStatus(node, type, message) {
    if (!node) return;

    node.textContent = message;
    node.setAttribute("data-status", type);
    node.setAttribute("data-status-type", type);
    node.setAttribute("role", type === "error" ? "alert" : "status");
    node.setAttribute("aria-live", "polite");
  }

  function getFieldName(field) {
    return field.getAttribute("name") || field.getAttribute("id") || "";
  }

  function collectAllFormFields(form) {
    const fields = {};
    const elements = Array.from(form.elements || []);

    elements.forEach(function (field) {
      const name = getFieldName(field);

      if (!name) return;
      if (field.disabled) return;

      fields[name] = field.value || "";
    });

    return fields;
  }

  function collectPublicFields(form) {
    const fields = {};
    const elements = Array.from(form.elements || []);

    elements.forEach(function (field) {
      const name = getFieldName(field);

      if (!name) return;
      if (field.disabled) return;
      if (field.matches && field.matches("[data-tinyml-honeypot='true']")) return;

      const type = String(field.type || "").toLowerCase();

      if (["submit", "button", "reset", "file"].includes(type)) return;

      if ((type === "checkbox" || type === "radio") && !field.checked) return;

      if (fields[name]) {
        if (!Array.isArray(fields[name])) {
          fields[name] = [fields[name]];
        }

        fields[name].push(field.value || "");
        return;
      }

      fields[name] = field.value || "";
    });

    return fields;
  }

  function readAlias(fields, aliases) {
    for (const alias of aliases) {
      const wanted = normalizeAlias(alias);

      for (const key of Object.keys(fields)) {
        if (normalizeAlias(key) === wanted) {
          return fields[key];
        }
      }
    }

    return "";
  }

  function normalizeAlias(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");
  }

  function validateRequiredContact(fields) {
    const fullName = readAlias(fields, [
      "fullName",
      "fullname",
      "full_name",
      "name",
      "yourName",
      "nombre"
    ]);

    const firstName = readAlias(fields, ["firstName", "first_name", "givenName", "nombre"]);
    const lastName = readAlias(fields, ["lastName", "last_name", "familyName", "apellido"]);
    const combinedName = [fullName, [firstName, lastName].filter(Boolean).join(" ")]
      .map(function (value) {
        return String(value || "").trim();
      })
      .find(Boolean);

    const email = readAlias(fields, [
      "emailAddress",
      "email",
      "email_address",
      "mail",
      "correo"
    ]);

    const message = readAlias(fields, [
      "message",
      "expectations",
      "comments",
      "comment",
      "notes",
      "details",
      "mensaje"
    ]);

    if (!combinedName || String(combinedName).trim().length < 2) {
      return t("contactFullNameRequired", "Full name is required.");
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(String(email || ""))) {
      return t("contactEmailRequired", "A valid email is required.");
    }

    if (!message || String(message).trim().length < 8) {
      return t("contactMessageRequired", "Message is required.");
    }

    return "";
  }

  function getSubmitControls(form) {
    return Array.from(form.querySelectorAll(SELECTOR.submitControls));
  }

  function activateSubmitControls(form) {
    getSubmitControls(form).forEach(function (button) {
      if (button instanceof HTMLButtonElement && button.type !== "submit") {
        button.type = "submit";
      }

      button.disabled = false;
      button.removeAttribute("disabled");
      button.setAttribute("aria-disabled", "false");
      button.setAttribute("aria-busy", "false");
      button.setAttribute("data-contact-submit-ready", "true");
    });
  }

  function lockSubmitControls(form, locked) {
    getSubmitControls(form).forEach(function (button) {
      button.disabled = Boolean(locked);
      button.setAttribute("aria-disabled", locked ? "true" : "false");
      button.setAttribute("aria-busy", locked ? "true" : "false");
    });
  }

  function buildSiteInfo() {
    return {
      pageUrl: window.location.href,
      origin: window.location.origin,
      path: window.location.pathname,
      title: document.title || "",
      language: document.documentElement.lang || ""
    };
  }

  function extractAntiBot(rawFields) {
    return {
      website:
        rawFields.website ||
        rawFields.website_url ||
        rawFields.companyWebsite ||
        rawFields.company_website ||
        "",
      companyWebsite:
        rawFields.companyWebsite ||
        rawFields.company_website ||
        rawFields.businessUrl ||
        rawFields.homepage ||
        ""
    };
  }

  function createContactRuntimeVariables() {
    return {
      CONTACT_EXPECTED_ASSET_ID,
      CONTACT_EXPECTED_REPO_ID,
      CONTACT_EXPECTED_SOURCE,
      CONTACT_EXPECTED_HEADER_POLICY,
      CONTACT_ALLOWED_ORIGINS_JSON,
      CONTACT_PUBLIC_BASE_URL,
      CONTACT_API_PATH,
      CONTACT_MAX_BODY_BYTES,
      CONTACT_MAX_FIELD_LENGTH,
      CONTACT_MAX_RISK_SCORE
    };
  }

  function createPayload(fields, rawFields, scan, session, sha256, contactRuntime) {
    return {
      schema: PUBLIC_CONTACT_CONTRACT.schema,

      contactRuntime,

      repo: {
        id: PUBLIC_CONTACT_CONTRACT.repoId,
        assetId: PUBLIC_CONTACT_CONTRACT.assetId,
        source: PUBLIC_CONTACT_CONTRACT.source
      },

      fields,

      clientIntegrity: {
        sha256,
        calculatedAfterSanitizer: true,
        calculatedAfterCySecScan: true
      },

      clientSession: {
        sessionId: session.sessionId,
        nonce: session.nonce,
        issuedAt: session.issuedAt
      },

      site: buildSiteInfo(),

      antiBot: extractAntiBot(rawFields),

      clientSecurity: {
        tinyML: PUBLIC_CONTACT_CONTRACT.tinyMLVersion,
        cySec: PUBLIC_CONTACT_CONTRACT.cySecVersion,
        sanitizedBeforeSend: true,
        maliciousCodeRemovedBeforeSend: true,
        programmingCodeRemovedBeforeSend: true,
        integrityCalculatedAfterSanitizer: true,
        integrityCalculatedAfterCySecScan: true,
        localRiskScore: scan.riskScore,
        localRiskReasons: scan.sanitizedRisk ? scan.sanitizedRisk.reasons : [],
        sanitizedRiskScore: scan.sanitizedRisk ? scan.sanitizedRisk.score : 0,
        sanitizedRiskReasons: scan.sanitizedRisk ? scan.sanitizedRisk.reasons : [],
        cySecRiskScore: scan.riskScore,
        cySecReport: scan.report
      }
    };
  }

  async function safeReadJson(response) {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }

  function getSafeErrorMessage(result) {
    if (!result || typeof result !== "object") {
      return t("contactSubmitBlockedSecure", "Your message could not be submitted securely.");
    }

    if (result.message && typeof result.message === "string") {
      return result.message;
    }

    return t("contactSubmitBlockedSecure", "Your message could not be submitted securely.");
  }

  async function submitContact(form, statusNode) {
    const now = Date.now();

    if (now - lastSubmitAt < PUBLIC_CONTACT_CONTRACT.submitLockMs) {
      return;
    }

    lastSubmitAt = now;

    const tiny = tinyML();

    if (tiny.isSessionBlocked && tiny.isSessionBlocked()) {
      tiny.blockForm(form, "This contact session has been blocked.");
      return;
    }

    const rawAllFields = collectAllFormFields(form);

    if (tiny.honeypotFilled(form)) {
      tiny.blockForm(form, "Your message could not be submitted.");
      return;
    }

    const antiBot = extractAntiBot(rawAllFields);

    if (String(antiBot.website || "").trim() || String(antiBot.companyWebsite || "").trim()) {
      tiny.blockForm(form, "Your message could not be submitted.");
      return;
    }

    tiny.clearInvalidFields(form);

    const scan = tiny.scanForm(form);
    const rawPublicFields = collectPublicFields(form);
    const fields = tiny.sanitizeObject(scan.fields || rawPublicFields);

    const rawRisk = tiny.scoreRisk(JSON.stringify(rawPublicFields));
    const sanitizedRisk = tiny.scoreRisk(tiny.stableSerialize(fields));

    if (!scan.ok || scan.blocked || rawRisk.blocked || sanitizedRisk.blocked) {
      setStatus(
        statusNode,
        "error",
        t("contactSubmitBlockedSecure", "Your message could not be submitted securely.")
      );
      return;
    }

    const validationMessage = validateRequiredContact(fields);

    if (validationMessage) {
      setStatus(statusNode, "error", validationMessage);
      return;
    }

    const session = tiny.createSession();
    const contactRuntime = createContactRuntimeVariables();

    const integrityPayload = {
      route: PUBLIC_CONTACT_CONTRACT.route,
      origin: window.location.origin,
      source: PUBLIC_CONTACT_CONTRACT.source,
      sessionId: session.sessionId,
      nonce: session.nonce,
      fields
    };

    const sha256 = await tiny.calculateIntegrity(integrityPayload);
    const payload = createPayload(fields, rawAllFields, scan, session, sha256, contactRuntime);

    lockSubmitControls(form, true);
    setStatus(
      statusNode,
      "pending",
      t("contactSubmitPending", "Sending your message securely...")
    );

    try {
      const requestBody = JSON.stringify(payload);
      const bodyBytes = new TextEncoder().encode(requestBody).byteLength;

      if (bodyBytes > PUBLIC_CONTACT_CONTRACT.maxBodyBytes) {
        setStatus(
          statusNode,
          "error",
          t("contactSubmitTooLarge", "Your message is too large to submit securely.")
        );
        return;
      }

      const response = await fetch(PUBLIC_CONTACT_CONTRACT.endpoint, {
        method: "POST",
        mode: "cors",
        credentials: "omit",
        cache: "no-store",
        referrerPolicy: "no-referrer",
        headers: {
          [HEADER.contentType]: "application/json",
          [HEADER.origin]: window.location.origin,
          [HEADER.source]: PUBLIC_CONTACT_CONTRACT.source,
          [HEADER.assetId]: PUBLIC_CONTACT_CONTRACT.assetId,
          [HEADER.repoId]: PUBLIC_CONTACT_CONTRACT.repoId,
          [HEADER.sessionId]: session.sessionId,
          [HEADER.nonce]: session.nonce,
          [HEADER.integrity]: sha256,
          [HEADER.headerPolicy]: PUBLIC_CONTACT_CONTRACT.headerPolicy,
          [HEADER.client]: PUBLIC_CONTACT_CONTRACT.clientName
        },
        body: requestBody
      });

      const result = await safeReadJson(response);

      if (!response.ok || !result || result.ok !== true) {
        setStatus(statusNode, "error", getSafeErrorMessage(result));
        return;
      }

      form.reset();

      setStatus(
        statusNode,
        "success",
        t("contactSubmitSuccess", "Your message was received securely.")
      );
    } catch {
      setStatus(
        statusNode,
        "error",
        t("contactSubmitUnavailable", "Contact service is temporarily unavailable.")
      );
    } finally {
      lockSubmitControls(form, false);
    }
  }

  ready(function () {
    const form = findForm();

    if (!form) return;

    const statusNode = findStatusNode(form);

    form.setAttribute("novalidate", "novalidate");

    if (window.GaboContactTinyML && window.GaboContactTinyML.isSessionBlocked()) {
      window.GaboContactTinyML.blockForm(form, "This contact session has been blocked.");
      return;
    }

    activateSubmitControls(form);

    window.addEventListener("pageshow", function () {
      if (!window.GaboContactTinyML || !window.GaboContactTinyML.isSessionBlocked()) {
        activateSubmitControls(form);
      }
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      submitContact(form, statusNode);
    });
  });
})();
