/**
 * careers/secure-submit.js
 *
 * Browser-side secure Careers submit handler.
 *
 * Browser-only public submit handler.
 * No secrets.
 * No internal service details.
 * Sends sanitized Careers payload to the public Careers gateway.
 */

(function () {
  "use strict";

  const CAREERS_REPO_SCHEMA = "gabo.careers.repo.v1";

  const CONTRACT = Object.freeze({
    endpoint: "https://careers.gabo.services/api/careers",
    route: "/api/careers",
    schema: CAREERS_REPO_SCHEMA,

    repoId: "CAREERS",
    assetId: "redesigned-octo-meme-careers",
    source: "careers.html",
    headerPolicy: "careers-repo-careers-v1",

    clientName: "repo-careers-v1",
    tinyMLVersion: "careers-browser-rules-v1",
    cySecVersion: "careers-sanitize-scan-integrity-v1",

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
      "#careers-application-form",
      "form[data-careers-form]",
      "form[data-page-tinyml='careers']",
      "form[action*='careers.gabo.services/api/careers']"
    ],
    status: [
      "[data-careers-status]",
      "#careers-status",
      ".careers-status",
      ".security-form-note"
    ],
    submitControls:
      "button[type='submit'], input[type='submit'], button[data-careers-submit]"
  });

  let lastSubmitAt = 0;

  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
      return;
    }

    callback();
  }

  function tinyML() {
    if (!window.GaboCareersTinyML) {
      throw new Error("Careers protection is unavailable.");
    }

    return window.GaboCareersTinyML;
  }

  function findForm() {
    for (const selector of SELECTOR.forms) {
      const form = document.querySelector(selector);
      if (form) return form;
    }

    return null;
  }

  function findStatusNode(form) {
    for (const selector of SELECTOR.status) {
      const local = form.querySelector(selector);
      if (local) return local;
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
    const output = {};
    const elements = Array.from(form.elements || []);

    elements.forEach((field) => {
      const name = getFieldName(field);
      if (!name || field.disabled) return;
      output[name] = field.value || "";
    });

    return output;
  }

  function collectPublicFields(form) {
    const fields = {};
    const lists = {};
    const elements = Array.from(form.elements || []);

    elements.forEach((field) => {
      const name = getFieldName(field);
      if (!name || field.disabled) return;
      if (field.matches && field.matches("[data-tinyml-honeypot='true']")) return;

      const type = String(field.type || "").toLowerCase();
      if (["submit", "button", "reset", "file"].includes(type)) return;
      if ((type === "checkbox" || type === "radio") && !field.checked) return;

      const value = field.value || "";

      if (name.endsWith("[]")) {
        const listName = name.replace(/\[\]$/, "");
        if (!Array.isArray(lists[listName])) lists[listName] = [];
        if (value) lists[listName].push(value);
        return;
      }

      if (fields[name] !== undefined) {
        if (!Array.isArray(fields[name])) fields[name] = [fields[name]];
        fields[name].push(value);
        return;
      }

      fields[name] = value;
    });

    return { fields, lists };
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

  function normalizeWorkerFields(inputFields) {
    const next = Object.assign({}, inputFields);

    const requiredMap = {
      fullName: ["fullName", "name", "full_name"],
      emailAddress: ["emailAddress", "email", "email_address"],
      countryCode: ["countryCode", "country_code"],
      contactNumber: ["contactNumber", "phone", "phoneNumber", "contact_number"],
      city: ["city"],
      stateProvince: ["stateProvince", "state", "province", "state_province"],
      countryZipCode: ["countryZipCode", "zip", "zipCode", "postalCode", "country_zip_code"],
      availability: ["availability", "availableWhen"],
      areaOfInterest: ["areaOfInterest", "areaInterest", "position", "role", "area_of_interest"],
      educationLevel: ["educationLevel", "education", "education_level"],
      message: ["message", "careerMessage", "comments"]
    };

    for (const target of Object.keys(requiredMap)) {
      const value = readAlias(next, requiredMap[target]);
      next[target] = typeof value === "string" ? value : value || "";
    }

    return next;
  }

  function validateRequiredFields(fields) {
    const required = [
      ["fullName", 2, "Full name is required."],
      ["emailAddress", 5, "A valid email is required."],
      ["countryCode", 1, "Country code is required."],
      ["contactNumber", 2, "Contact number is required."],
      ["city", 1, "City is required."],
      ["stateProvince", 1, "State or province is required."],
      ["countryZipCode", 1, "Zip or postal code is required."],
      ["availability", 1, "Availability is required."],
      ["areaOfInterest", 1, "Area of interest is required."],
      ["educationLevel", 1, "Education level is required."],
      ["message", 8, "Please tell us about you."]
    ];

    for (const [key, minLength, error] of required) {
      const value = String(fields[key] || "").trim();
      if (value.length < minLength) return error;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(String(fields.emailAddress || ""))) {
      return "A valid email is required.";
    }

    return "";
  }

  function getSubmitControls(form) {
    return Array.from(form.querySelectorAll(SELECTOR.submitControls));
  }

  function activateSubmitControls(form) {
    getSubmitControls(form).forEach((button) => {
      if (button instanceof HTMLButtonElement && button.type !== "submit") {
        button.type = "submit";
      }

      button.disabled = false;
      button.removeAttribute("disabled");
      button.setAttribute("aria-disabled", "false");
      button.setAttribute("aria-busy", "false");
      button.setAttribute("data-careers-submit-ready", "true");
    });
  }

  function lockSubmitControls(form, locked) {
    getSubmitControls(form).forEach((button) => {
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
      website: rawFields.website || rawFields.website_url || "",
      companyWebsite: rawFields.companyWebsite || rawFields.company_website || ""
    };
  }

  function withWorkerListShape(inputLists) {
    return {
      experience: Array.isArray(inputLists.experience) ? inputLists.experience : [],
      experienceLevels: Array.isArray(inputLists.experienceLevels) ? inputLists.experienceLevels : [],
      languages: Array.isArray(inputLists.languages) ? inputLists.languages : [],
      skills: Array.isArray(inputLists.skills) ? inputLists.skills : [],
      projects: Array.isArray(inputLists.projects) ? inputLists.projects : [],
      education: Array.isArray(inputLists.education) ? inputLists.education : []
    };
  }

  function createPayload(fields, lists, rawFields, scan, session, sha256) {
    return {
      schema: CONTRACT.schema,

      repo: {
        id: CONTRACT.repoId,
        assetId: CONTRACT.assetId,
        source: CONTRACT.source
      },

      fields,
      lists,

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
        tinyML: CONTRACT.tinyMLVersion,
        cySec: CONTRACT.cySecVersion,
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

  async function sendToCareersGateway(payload, headers) {
    const primary = CONTRACT.endpoint;
    const fallback = new URL(CONTRACT.route, window.location.origin).toString();
    const endpoints = primary === fallback ? [primary] : [primary, fallback];

    let lastError = null;

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          mode: "cors",
          credentials: "omit",
          cache: "no-store",
          referrerPolicy: "no-referrer",
          headers,
          body: JSON.stringify(payload)
        });

        return { response, endpoint };
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError || new Error("Failed to reach Careers gateway.");
  }

  async function submitCareers(form, statusNode) {
    const now = Date.now();

    if (now - lastSubmitAt < CONTRACT.submitLockMs) return;

    lastSubmitAt = now;

    const tiny = tinyML();

    if (tiny.isSessionBlocked && tiny.isSessionBlocked()) {
      tiny.blockForm(form, "This Careers session has been blocked.");
      return;
    }

    const rawAllFields = collectAllFormFields(form);

    if (tiny.honeypotFilled(form)) {
      tiny.blockForm(form, "Your application could not be submitted.");
      return;
    }

    const antiBot = extractAntiBot(rawAllFields);

    if (String(antiBot.website || "").trim() || String(antiBot.companyWebsite || "").trim()) {
      tiny.blockForm(form, "Your application could not be submitted.");
      return;
    }

    tiny.clearInvalidFields(form);

    const scan = tiny.scanForm(form);
    const collected = collectPublicFields(form);

    const fields = normalizeWorkerFields(tiny.sanitizeObject(scan.fields || collected.fields));
    const lists = withWorkerListShape(tiny.sanitizeObject(collected.lists));

    const rawRisk = tiny.scoreRisk(JSON.stringify(collected));
    const sanitizedRisk = tiny.scoreRisk(tiny.stableSerialize({ fields, lists }));

    if (!scan.ok || scan.blocked || rawRisk.blocked || sanitizedRisk.blocked) {
      setStatus(statusNode, "error", "Your application could not be submitted securely.");
      return;
    }

    const validationMessage = validateRequiredFields(fields);

    if (validationMessage) {
      setStatus(statusNode, "error", validationMessage);
      return;
    }

    const session = tiny.createSession();

    const integrityPayload = {
      route: CONTRACT.route,
      origin: window.location.origin,
      source: CONTRACT.source,
      sessionId: session.sessionId,
      nonce: session.nonce,
      fields,
      lists
    };

    const sha256 = await tiny.calculateIntegrity(integrityPayload);
    const payload = createPayload(fields, lists, rawAllFields, scan, session, sha256);

    lockSubmitControls(form, true);
    setStatus(statusNode, "pending", "Sending your application securely...");

    try {
      const headers = {
        [HEADER.contentType]: "application/json",
        [HEADER.origin]: window.location.origin,
        [HEADER.source]: CONTRACT.source,
        [HEADER.assetId]: CONTRACT.assetId,
        [HEADER.repoId]: CONTRACT.repoId,
        [HEADER.sessionId]: session.sessionId,
        [HEADER.nonce]: session.nonce,
        [HEADER.integrity]: sha256,
        [HEADER.headerPolicy]: CONTRACT.headerPolicy,
        [HEADER.client]: CONTRACT.clientName
      };

      const { response } = await sendToCareersGateway(payload, headers);
      const result = await safeReadJson(response);

      if (!response.ok || !result || result.ok !== true) {
        setStatus(statusNode, "error", result?.message || "Your application could not be submitted securely.");
        return;
      }

      form.reset();
      setStatus(statusNode, "success", "Your application was received securely.");
    } catch {
      setStatus(statusNode, "error", "Careers service is temporarily unavailable.");
    } finally {
      lockSubmitControls(form, false);
    }
  }

  ready(() => {
    const form = findForm();
    if (!form) return;

    let statusNode = findStatusNode(form);

    if (!statusNode) {
      statusNode = document.createElement("small");
      statusNode.className = "security-form-note careers-status";
      statusNode.setAttribute("aria-live", "polite");
      form.appendChild(statusNode);
    }

    form.setAttribute("novalidate", "novalidate");

    if (window.GaboCareersTinyML && window.GaboCareersTinyML.isSessionBlocked()) {
      window.GaboCareersTinyML.blockForm(form, "This Careers session has been blocked.");
      return;
    }

    activateSubmitControls(form);

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      submitCareers(form, statusNode);
    });
  });
})();
