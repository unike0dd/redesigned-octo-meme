/**
 * contact/repo-worker.js
 *
 * Repo-side browser communication bridge for Contact.
 * Flow: Contact submit -> repo TinyML/CySec -> this bridge -> CF Worker
 * https://contacto.gabo.services/api/contact
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
    statusSelector: "[data-contact-status]",
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }

  function init() {
    document.querySelectorAll(CONFIG.formSelector).forEach((node) => {
      if (!(node instanceof HTMLFormElement)) return;
      if (node.dataset.repoContactReady === "true") return;

      node.dataset.repoContactReady = "true";

      const tiny = getTiny();

      if (!tiny) {
        setStatus(
          node,
          "Contact CySec module did not load. Please refresh before sending.",
          "error",
        );
        return;
      }

      if (tiny.isSessionBlocked()) {
        tiny.blockForm(
          node,
          "This contact session was blocked for security protection.",
        );
        return;
      }

      node.addEventListener("submit", handleSubmit);
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const form = event.currentTarget;
    if (!(form instanceof HTMLFormElement)) return;

    const tiny = getTiny();
    const submitButton = findSubmitButton(form);

    try {
      setBusy(form, submitButton, true);
      setStatus(
        form,
        "Scanning and sanitizing your message with Contact CySec...",
        "info",
      );

      if (!tiny) {
        throw new Error("Contact CySec module is unavailable.");
      }

      if (!form.reportValidity()) {
        setStatus(
          form,
          "Please complete the required Contact fields before sending.",
          "error",
        );
        return;
      }

      if (tiny.honeypotFilled(form)) {
        tiny.markSessionBlocked();
        tiny.blockForm(
          form,
          "This contact session was blocked by bot protection.",
        );
        return;
      }

      const scan = tiny.scanForm(form);

      if (!scan.ok) {
        setStatus(
          form,
          "Contact CySec blocked suspicious or programming-code-like content. Please revise and try again.",
          "error",
        );
        return;
      }

      const session = tiny.createSession();
      const integrity = await tiny.createIntegrityProof({
        origin: window.location.origin,
        sessionId: session.sessionId,
        nonce: session.nonce,
        fields: scan.fields,
      });

      setStatus(
        form,
        "Integrity verified after sanitization. Sending securely...",
        "info",
      );

      const payload = {
        schema: "gabo.contact.repo-browser.v2",
        formType: "contact",
        route: CONFIG.route,
        requestId: tiny.createId("contact"),
        timestamp: new Date().toISOString(),

        site: {
          origin: window.location.origin,
          host: window.location.host,
          pageUrl: window.location.href,
          path: window.location.pathname,
          title: document.title || "Contact",
        },

        repo: {
          id: CONFIG.expectedRepoId,
          assetId: CONFIG.expectedAssetId,
          source: CONFIG.expectedSource,
        },

        fields: scan.fields,

        antiBot: {
          website: "",
          companyWebsite: "",
        },

        scan: {
          ok: scan.ok,
          sanitized: scan.sanitized,
          riskScore: scan.riskScore,
          residualRiskScore: scan.residualRiskScore,
          report: scan.report,
        },

        cySec: scan.cySec,
        frameworks: tiny.frameworks,
        clientSession: session,

        clientIntegrity: {
          algorithm: integrity.algorithm,
          sha256: integrity.sha256,
          base: integrity.base,
          sanitizedBeforeHash: integrity.sanitizedBeforeHash,
          cySecVerifiedBeforeHash: integrity.cySecVerifiedBeforeHash,
        },
      };

      const endpoint =
        form.dataset.upstreamPath || form.action || CONFIG.gatewayUrl;
      const response = await fetch(endpoint, {
        method: "POST",
        mode: "cors",
        credentials: "omit",
        cache: "no-store",
        redirect: "error",
        referrerPolicy: "no-referrer",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "X-Gabo-Origin": window.location.origin,
          "X-Gabo-Source": CONFIG.expectedSource,
          "X-Ops-Asset-Id": CONFIG.expectedAssetId,
          "X-Gabo-Repo-Id": CONFIG.expectedRepoId,
          "X-Gabo-Session-Id": session.sessionId,
          "X-Gabo-Nonce": session.nonce,
          "X-Gabo-Integrity-SHA256": integrity.sha256,
          "X-Gabo-Header-Policy": CONFIG.headerPolicy,
          "X-Gabo-Client": "contact/repo-worker.js",
        },
        body: JSON.stringify(payload),
      });

      const data = await safeJson(response);

      if (!response.ok || !data.ok) {
        throw new Error(data.message || data.code || "Contact handoff failed.");
      }

      setStatus(
        form,
        data.message || "Your message was received securely.",
        "success",
      );
      form.reset();
      tiny.clearInvalidFields(form);
    } catch (error) {
      setStatus(
        form,
        getErrorMessage(error) || "Contact handoff failed.",
        "error",
      );
    } finally {
      setBusy(form, submitButton, false);
    }
  }

  function getTiny() {
    return window.GaboContactTinyML || null;
  }

  function findSubmitButton(form) {
    const found = form.querySelector(
      'button[type="submit"], input[type="submit"], button:not([type])',
    );
    return found instanceof HTMLButtonElement ||
      found instanceof HTMLInputElement
      ? found
      : null;
  }

  function setBusy(form, button, busy) {
    form.dataset.contactBusy = busy ? "true" : "false";

    if (button) {
      button.disabled = busy;
      button.setAttribute("aria-busy", busy ? "true" : "false");
    }
  }

  function setStatus(form, message, type) {
    const status = form.querySelector(CONFIG.statusSelector);

    if (status) {
      status.textContent = message;
      status.dataset.contactStatus = type || "info";
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

  async function safeJson(response) {
    try {
      return await response.json();
    } catch {
      return {
        ok: false,
        message: "Invalid contact gateway response.",
      };
    }
  }

  function getErrorMessage(error) {
    if (!error) return "";
    if (typeof error === "string") return error;
    if (typeof error === "object" && "message" in error)
      return String(error.message || "");
    return String(error);
  }
})();
