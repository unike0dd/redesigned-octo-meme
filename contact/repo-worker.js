/**
 * contact/repo-worker.js
 *
 * Browser-side contact relay for secure contact intake.
 */

(function () {
  "use strict";

  const CONTACT_CONFIG = Object.freeze({
    endpoint: "https://contacto.gabo.services/api/contact",
    route: "/api/contact",

    repoId: "CONTACTO",
    assetId: "redesigned-octo-meme-contact",
    source: "contact.html",
    headerPolicy: "contacto-repo-contact-v1",

    formSelectors: [
      "form[data-contact-form]",
      "#contact-form",
      "form.contact-form",
      "form[action*='contact']"
    ],

    statusSelectors: [
      "[data-contact-status]",
      "#contact-status",
      ".contact-status"
    ],

    submitLockMs: 1200
  });

  let lastSubmitAt = 0;

  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
      return;
    }

    callback();
  }

  function getTinyML() {
    if (!window.GaboContactTinyML) {
      throw new Error("Contact protection module unavailable.");
    }

    return window.GaboContactTinyML;
  }

  function findForm() {
    for (const selector of CONTACT_CONFIG.formSelectors) {
      const form = document.querySelector(selector);

      if (form) return form;
    }

    return null;
  }

  function findStatusNode(form) {
    if (form) {
      const local = form.querySelector("[data-contact-status]");

      if (local) return local;
    }

    for (const selector of CONTACT_CONFIG.statusSelectors) {
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

  function collectFormFields(form) {
    const fields = {};
    const elements = Array.from(form.elements || []);

    elements.forEach(function (field) {
      const name = getFieldName(field);

      if (!name) return;
      if (field.disabled) return;
      if (field.matches && field.matches("[data-tinyml-honeypot='true']")) return;

      const type = String(field.type || "").toLowerCase();

      if (type === "submit" || type === "button" || type === "reset" || type === "file") {
        return;
      }

      if ((type === "checkbox" || type === "radio") && !field.checked) {
        return;
      }

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

  function checkHoneypot(fields) {
    const keys = [
      "website",
      "website_url",
      "companyWebsite",
      "company_website",
      "url",
      "homepage",
      "businessUrl"
    ];

    return keys.some(function (key) {
      return String(fields[key] || "").trim().length > 0;
    });
  }

  function validateRequiredContact(fields) {
    const fullName = readAlias(fields, ["fullName", "fullname", "full_name", "name", "yourName", "nombre"]);
    const email = readAlias(fields, ["emailAddress", "email", "email_address", "mail", "correo"]);
    const message = readAlias(fields, ["message", "comments", "comment", "notes", "details", "mensaje"]);

    if (!fullName || String(fullName).length < 2) {
      return "Please enter your full name.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(String(email || ""))) {
      return "Please enter a valid email address.";
    }

    if (!message || String(message).length < 8) {
      return "Please enter a message.";
    }

    return "";
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

  function buildSiteInfo() {
    return {
      pageUrl: window.location.href,
      path: window.location.pathname,
      title: document.title || ""
    };
  }

  function lockSubmitButton(form, locked) {
    const buttons = Array.from(form.querySelectorAll("button[type='submit'], input[type='submit']"));

    buttons.forEach(function (button) {
      button.disabled = Boolean(locked);
      button.setAttribute("aria-busy", locked ? "true" : "false");
    });
  }

  async function submitContact(form, statusNode) {
    const now = Date.now();

    if (now - lastSubmitAt < CONTACT_CONFIG.submitLockMs) {
      return;
    }

    lastSubmitAt = now;

    const tiny = getTinyML();

    if (tiny.isSessionBlocked && tiny.isSessionBlocked()) {
      tiny.blockForm(form, "This contact session has been blocked.");
      return;
    }

    const honeypotTripped = tiny.honeypotFilled(form) || checkHoneypot(collectAllFormFields(form));

    if (honeypotTripped) {
      if (tiny.markSessionBlocked) tiny.markSessionBlocked();
      tiny.blockForm(form, "Your message could not be submitted.");
      return;
    }

    tiny.clearInvalidFields(form);

    const cySecScan = tiny.scanForm(form);
    const rawFields = collectFormFields(form);
    const fields = tiny.sanitizeObject(cySecScan.fields || rawFields);
    const risk = tiny.scoreRisk(JSON.stringify(rawFields) + "\n" + tiny.stableSerialize(fields));
    const integrityRisk = tiny.scoreRisk(tiny.stableSerialize(fields));

    if (!cySecScan.ok || risk.blocked || integrityRisk.blocked) {
      setStatus(statusNode, "error", "Your message could not be submitted securely.");
      return;
    }

    const validationMessage = validateRequiredContact(fields);

    if (validationMessage) {
      setStatus(statusNode, "error", validationMessage);
      return;
    }

    const sessionId = tiny.makeToken("contact-session");
    const nonce = tiny.makeToken("contact-nonce");
    const issuedAt = new Date().toISOString();

    const integrityPayload = {
      route: CONTACT_CONFIG.route,
      origin: window.location.origin,
      source: CONTACT_CONFIG.source,
      sessionId: sessionId,
      nonce: nonce,
      fields: fields
    };

    const sha256 = await tiny.sha256Hex(tiny.stableSerialize(integrityPayload));

    const payload = {
      schema: "gabo.contact.repo.v2",
      repo: {
        id: CONTACT_CONFIG.repoId,
        assetId: CONTACT_CONFIG.assetId,
        source: CONTACT_CONFIG.source
      },
      fields: fields,
      clientIntegrity: {
        sha256: sha256,
        calculatedAfterSanitizer: true
      },
      clientSession: {
        sessionId: sessionId,
        nonce: nonce,
        issuedAt: issuedAt
      },
      site: buildSiteInfo(),
      antiBot: {
        website: rawFields.website || rawFields.website_url || "",
        companyWebsite: rawFields.companyWebsite || rawFields.company_website || ""
      },
      clientSecurity: {
        tinyML: "browser-rules-v2",
        cySec: "sanitize-scan-integrity-v1",
        sanitizedBeforeSend: true,
        maliciousCodeRemovedBeforeSend: true,
        programmingCodeRemovedBeforeSend: true,
        integrityCalculatedAfterSanitizer: true,
        integrityCalculatedAfterCySecScan: true,
        localRiskScore: risk.score,
        localRiskReasons: risk.reasons,
        sanitizedRiskScore: integrityRisk.score,
        sanitizedRiskReasons: integrityRisk.reasons,
        cySecRiskScore: cySecScan.riskScore,
        cySecReport: cySecScan.report
      }
    };

    lockSubmitButton(form, true);
    setStatus(statusNode, "pending", "Sending your message securely...");

    try {
      const response = await fetch(CONTACT_CONFIG.endpoint, {
        method: "POST",
        mode: "cors",
        credentials: "omit",
        cache: "no-store",
        referrerPolicy: "no-referrer",
        headers: {
          "Content-Type": "application/json",
          "X-Gabo-Origin": window.location.origin,
          "X-Gabo-Source": CONTACT_CONFIG.source,
          "X-Ops-Asset-Id": CONTACT_CONFIG.assetId,
          "X-Gabo-Repo-Id": CONTACT_CONFIG.repoId,
          "X-Gabo-Session-Id": sessionId,
          "X-Gabo-Nonce": nonce,
          "X-Gabo-Integrity-SHA256": sha256,
          "X-Gabo-Header-Policy": CONTACT_CONFIG.headerPolicy,
          "X-Gabo-Client": "repo-contact-v2"
        },
        body: JSON.stringify(payload)
      });

      const result = await safeReadJson(response);

      if (!response.ok || !result || result.ok !== true) {
        setStatus(statusNode, "error", "Your message could not be submitted securely.");
        return;
      }

      form.reset();
      setStatus(statusNode, "success", "Your message was received securely.");
    } catch {
      setStatus(statusNode, "error", "Your message could not be submitted right now.");
    } finally {
      lockSubmitButton(form, false);
    }
  }

  async function safeReadJson(response) {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }

  ready(function () {
    const form = findForm();

    if (!form) return;

    const statusNode = findStatusNode(form);

    form.setAttribute("novalidate", "novalidate");

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      submitContact(form, statusNode);
    });
  });
})();
