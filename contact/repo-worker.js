/**
 * contact/repo-worker.js
 *
 * Browser-side contact relay for the contact form.
 * Sends cleaned contact payloads to the public contact API.
 *
 * Requires:
 * contact/tiny-ml.js
 */

(function () {
  "use strict";

  const CONFIG = Object.freeze({
    endpointUrl: "https://contacto.gabo.services/api/contact",
    route: "/api/contact",

    expectedAssetId: "redesigned-octo-meme-contact",
    expectedRepoId: "CONTACTO",
    expectedSource: "contact.html",
    headerPolicy: "contacto-repo-contact-v1",

    formSelector: 'form[data-contact-endpoint="true"]',
    statusSelector: "[data-contact-status]"
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }

  /**
   * @returns {void}
   */
  function init() {
    const forms = document.querySelectorAll(CONFIG.formSelector);

    forms.forEach((node) => {
      if (!(node instanceof HTMLFormElement)) return;

      const form = node;

      if (form.dataset.repoContactReady === "true") return;

      form.dataset.repoContactReady = "true";

      const tiny = getTiny();

      if (!tiny) {
        setStatus(form, "The secure contact intake could not start. Please try again later.", "error");
        return;
      }

      if (tiny.isSessionBlocked()) {
        tiny.blockForm(form, "This contact session was rejected. Please refresh and try again later.");
        return;
      }

      form.addEventListener("submit", handleSubmit);
    });
  }

  /**
   * @param {SubmitEvent} event
   * @returns {Promise<void>}
   */
  async function handleSubmit(event) {
    event.preventDefault();

    const form = event.currentTarget;

    if (!(form instanceof HTMLFormElement)) {
      return;
    }

    const tiny = getTiny();
    const submitButton = findSubmitButton(form);

    try {
      setBusy(form, submitButton, true);
      setStatus(form, "Checking your message securely...", "info");

      if (!tiny) {
        throw new Error("The secure contact intake could not start.");
      }

      if (tiny.honeypotFilled(form)) {
        tiny.markSessionBlocked();
        tiny.blockForm(form, "This contact session was rejected. Please refresh and try again later.");
        return;
      }

      const scan = tiny.scanForm(form);

      if (!scan.ok) {
        setStatus(form, "Your message could not be accepted. Please revise it and try again.", "error");
        return;
      }

      const session = tiny.createSession();

      const integrityBase = {
        route: CONFIG.route,
        origin: window.location.origin,
        source: CONFIG.expectedSource,
        sessionId: session.sessionId,
        nonce: session.nonce,
        fields: scan.fields
      };

      const clientSha256 = await tiny.sha256Hex(tiny.stableSerialize(integrityBase));

      const payload = {
        schema: "gabo.contact.repo-browser.v1",
        formType: "contact",
        route: CONFIG.route,
        requestId: tiny.createId("contact"),
        timestamp: new Date().toISOString(),

        site: {
          origin: window.location.origin,
          host: window.location.host,
          pageUrl: window.location.href,
          path: window.location.pathname
        },

        repo: {
          id: CONFIG.expectedRepoId,
          assetId: CONFIG.expectedAssetId,
          source: CONFIG.expectedSource
        },

        fields: scan.fields,

        scan: {
          ok: scan.ok,
          riskScore: scan.riskScore,
          report: scan.report
        },

        clientSession: session,

        clientIntegrity: {
          algorithm: "SHA-256",
          sha256: clientSha256,
          base: "route|origin|source|sessionId|nonce|fields"
        }
      };

      const response = await fetch(CONFIG.endpointUrl, {
        method: "POST",
        mode: "cors",
        credentials: "omit",
        cache: "no-store",
        redirect: "error",
        referrerPolicy: "no-referrer",
        headers: {
          "Content-Type": "application/json",
          "X-Gabo-Origin": window.location.origin,
          "X-Gabo-Source": CONFIG.expectedSource,
          "X-Ops-Asset-Id": CONFIG.expectedAssetId,
          "X-Gabo-Repo-Id": CONFIG.expectedRepoId,
          "X-Gabo-Session-Id": session.sessionId,
          "X-Gabo-Nonce": session.nonce,
          "X-Gabo-Integrity-SHA256": clientSha256,
          "X-Gabo-Header-Policy": CONFIG.headerPolicy,
          "X-Gabo-Client": "contact/repo-worker.js"
        },
        body: JSON.stringify(payload)
      });

      const data = await safeJson(response);

      if (!response.ok || !data.ok) {
        throw new Error("Your message could not be sent. Please try again later.");
      }

      setStatus(form, "Thank you. Your message was received securely.", "success");
      form.reset();
      tiny.clearInvalidFields(form);
    } catch {
      setStatus(form, "Your message could not be sent. Please try again later.", "error");
    } finally {
      setBusy(form, submitButton, false);
    }
  }

  /**
   * @returns {any}
   */
  function getTiny() {
    return window.GaboContactTinyML || null;
  }

  /**
   * @param {HTMLFormElement} form
   * @returns {HTMLButtonElement | HTMLInputElement | null}
   */
  function findSubmitButton(form) {
    const found = form.querySelector('button[type="submit"], input[type="submit"], button:not([type])');

    if (found instanceof HTMLButtonElement || found instanceof HTMLInputElement) {
      return found;
    }

    return null;
  }

  /**
   * @param {HTMLFormElement} form
   * @param {HTMLButtonElement | HTMLInputElement | null} button
   * @param {boolean} busy
   * @returns {void}
   */
  function setBusy(form, button, busy) {
    form.dataset.contactBusy = busy ? "true" : "false";

    if (button) {
      button.disabled = busy;
      button.setAttribute("aria-busy", busy ? "true" : "false");
    }
  }

  /**
   * @param {HTMLFormElement} form
   * @param {string} message
   * @param {"info" | "success" | "error"} type
   * @returns {void}
   */
  function setStatus(form, message, type) {
    const status = form.querySelector(CONFIG.statusSelector);

    if (status) {
      status.textContent = message;
      status.setAttribute("data-status-type", type || "info");
      status.setAttribute("role", type === "error" ? "alert" : "status");
      status.setAttribute("aria-live", "polite");
      return;
    }

    void message;
  }

  /**
   * @param {Response} response
   * @returns {Promise<any>}
   */
  async function safeJson(response) {
    try {
      return await response.json();
    } catch {
      return {
        ok: false,
        message: "The contact endpoint response could not be accepted."
      };
    }
  }

})();
