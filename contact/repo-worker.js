/**
 * contact/repo-worker.js
 *
 * Repo browser bridge for the contact form.
 * This is NOT the Cloudflare Worker.
 *
 * Sends cleaned contact payloads to:
 * https://contacto.gabo.services/api/contact
 *
 * Requires:
 * contact/tiny-ml.js
 */

(function () {
  "use strict";

  const CONFIG = Object.freeze({
    gatewayUrl: "https://contacto.gabo.services/api/contact",
    route: "/api/contact",

    expectedAssetId: "redesigned-octo-meme-contact",
    expectedRepoId: "CONTACTO",
    expectedSource: "contact.html",
    headerPolicy: "contacto-repo-contact-v1",

    formSelector: 'form[data-contact-gateway="true"]',
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
        setStatus(form, "Contact security module did not load.", "error");
        return;
      }

      if (tiny.isSessionBlocked()) {
        tiny.blockForm(form, "This contact session was blocked for security protection.");
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
        throw new Error("Contact security module is unavailable.");
      }

      if (tiny.honeypotFilled(form)) {
        tiny.markSessionBlocked();
        tiny.blockForm(form, "This contact session was blocked by bot protection.");
        return;
      }

      const scan = tiny.scanForm(form);

      if (!scan.ok) {
        setStatus(form, "Security blocked suspicious or programming-code-like content.", "error");
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

      const response = await fetch(CONFIG.gatewayUrl, {
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
        throw new Error(data.message || data.code || "Contact handoff failed.");
      }

      setStatus(form, data.message || "Your message was received securely.", "success");
      form.reset();
      tiny.clearInvalidFields(form);
    } catch (error) {
      setStatus(form, getErrorMessage(error) || "Contact handoff failed.", "error");
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

    if (type === "error") {
      console.warn(message);
    } else {
      console.info(message);
    }
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
        message: "Invalid contact gateway response."
      };
    }
  }

  /**
   * @param {unknown} error
   * @returns {string}
   */
  function getErrorMessage(error) {
    if (!error) return "";

    if (typeof error === "string") {
      return error;
    }

    if (typeof error === "object" && "message" in error) {
      return String(error.message || "");
    }

    return String(error);
  }
})();
