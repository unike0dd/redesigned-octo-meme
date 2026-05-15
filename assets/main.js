(function () {
  const CLIENT_SECURITY_POLICY =
    "default-src 'self'; base-uri 'self'; object-src 'none'; form-action 'self' https://gabo.services https://www.gabo.services https://contacto.gabo.services https://careers.gabo.services; upgrade-insecure-requests; block-all-mixed-content; script-src 'self' https://static.cloudflareinsights.com https://challenges.cloudflare.com; style-src 'self'; img-src 'self' data: blob: https:; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https://gabo.services https://www.gabo.services https://contacto.gabo.services https://careers.gabo.services; frame-src 'self' https://challenges.cloudflare.com; worker-src 'self'; manifest-src 'self'; media-src 'self';";

  const CLIENT_SECURITY_POLICIES = {
    "Content-Security-Policy": CLIENT_SECURITY_POLICY,
  };

  const EXTENSION_MESSAGE_CHANNEL_CLOSED =
    /(?:runtime\.lastError.*message channel closed before a response was received|listener indicated an asynchronous response.*message channel closed)/i;

  function isKnownExtensionRuntimeNoise(reason) {
    const text = String(reason?.message || reason || "");
    return EXTENSION_MESSAGE_CHANNEL_CLOSED.test(text);
  }

  function initRuntimeErrorDiagnostics() {
    window.addEventListener("error", (event) => {
      if (!isKnownExtensionRuntimeNoise(event.message || event.error)) return;
      event.preventDefault();
    });

    window.addEventListener("unhandledrejection", (event) => {
      if (!isKnownExtensionRuntimeNoise(event.reason)) return;
      event.preventDefault();
    });
  }

  function enforceClientSecurityPolicy() {
    Object.entries(CLIENT_SECURITY_POLICIES).forEach(([name, content]) => {
      const selector = `meta[http-equiv="${name}"], meta[name="${name}"]`;
      let meta = document.head.querySelector(selector);
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute("http-equiv", name);
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", content);
    });
  }

  function getSiteBasePath() {
    const parts = window.location.pathname.split("/").filter(Boolean);
    const repoName = "redesigned-octo-meme";
    return parts[0] === repoName ? `/${repoName}` : "";
  }

  function loadGaboChatbot() {
    if (window.GaboChatbot?.init) {
      window.GaboChatbot.init();
      return;
    }

    if (document.querySelector('script[data-gabo-chatbot="true"]')) return;

    const script = document.createElement("script");
    script.src = `${getSiteBasePath()}/chatbot/gabo-io.js`;
    script.defer = true;
    script.dataset.gaboChatbot = "true";
    document.body.appendChild(script);
  }

  function initSecurityRuntime() {
    enforceClientSecurityPolicy();
    initRuntimeErrorDiagnostics();
  }

  function ensurePrimaryNav() {
    if (document.querySelector(".main-nav")) return;
    const topbar = document.querySelector("header .topbar");
    if (!topbar) return;
    const nav = document.createElement("nav");
    nav.className = "main-nav";
    nav.innerHTML = `
      <a href="./about/">About</a>
      <a href="careers.html">Careers</a>
      <a href="contact.html">Contact</a>
      <a href="./learning/">Learning</a>
    `;
    topbar.appendChild(nav);
  }

  function ensureMobileNav() {
    const existingMobileNav = document.querySelector(".mobile-nav");
    const mobileNav = existingMobileNav || document.createElement("nav");
    const basePath = getSiteBasePath();

    mobileNav.className = "mobile-nav";
    mobileNav.setAttribute("aria-label", "Mobile Navigation");
    mobileNav.setAttribute("data-i18n-aria-label", "mobileNavigation");
    mobileNav.innerHTML = `
      <div id="services-dropup" class="services-dropup">
        <a href="${basePath}/learning.html" data-i18n="logisticsOps">Logistics</a>
        <a href="${basePath}/learning.html" data-i18n="adminBackOffice">Admin Back Office</a>
        <a href="${basePath}/learning.html" data-i18n="customerRelations">Customer Relations</a>
        <a href="${basePath}/learning.html" data-i18n="itSupport">IT Support</a>
      </div>
      <div class="menu">
        <a href="${basePath}/" data-i18n="home">Home</a>
        <button id="mobile-services-toggle" type="button" data-i18n="services">Services</button>
        <div class="mobile-preference-controls" aria-label="Quick preferences">
          <button
            id="mobile-language-toggle"
            type="button"
            class="mobile-preference-toggle"
            data-language-toggle="mobile"
            aria-label="Switch to Spanish"
            data-i18n-aria-label="switchToSpanish"
          >EN</button>
          <button
            id="mobile-theme-toggle"
            type="button"
            class="mobile-preference-toggle"
            data-theme-toggle="mobile"
            aria-label="Switch to dark theme"
          >SUN</button>
        </div>
        <a href="${basePath}/careers.html" data-i18n="careers">Careers</a>
        <a href="${basePath}/contact.html" data-i18n="contact">Contact</a>
      </div>
    `;

    if (!existingMobileNav) {
      document.body.appendChild(mobileNav);
    }

    if (window.I18N && typeof I18N.applyLanguage === "function") {
      I18N.applyLanguage();
      window.dispatchEvent(
        new CustomEvent("language:changed", {
          detail: { language: I18N.currentLanguage },
        }),
      );
    }
    if (window.THEME?.current) {
      window.dispatchEvent(
        new CustomEvent("theme:changed", { detail: { theme: THEME.current } }),
      );
    }
  }

  function ensureSkipLink() {
    if (document.querySelector(".skip-link")) return;
    const target =
      document.querySelector("main") ||
      document.querySelector(".hero") ||
      document.querySelector(".section") ||
      document.body.firstElementChild;
    if (!target) return;
    if (!target.id) target.id = "main-content";
    const skipLink = document.createElement("a");
    skipLink.className = "skip-link";
    skipLink.href = "#" + target.id;
    skipLink.textContent = "Skip to main content";
    document.body.insertAdjacentElement("afterbegin", skipLink);
  }

  function setupFloatingField(field) {
    if (!field || field.dataset.floatingFieldReady === "true") return;

    const controls = Array.from(field.querySelectorAll("input, textarea"));
    if (!controls.length) return;

    const updateValueState = () => {
      field.classList.toggle(
        "has-value",
        controls.some((control) => Boolean(control.value)),
      );
    };

    field.addEventListener("focusin", () => {
      field.classList.add("is-focused");
    });

    field.addEventListener("focusout", () => {
      field.classList.remove("is-focused");
      updateValueState();
    });

    controls.forEach((control) => {
      control.addEventListener("input", updateValueState);
      control.addEventListener("change", updateValueState);
    });

    const form = controls[0].form;
    if (form) {
      form.addEventListener("reset", () => window.setTimeout(updateValueState, 0));
    }

    field.dataset.floatingFieldReady = "true";
    updateValueState();
    window.setTimeout(updateValueState, 150);
  }

  function initFloatingFields(root = document) {
    root.querySelectorAll(".floating-field").forEach(setupFloatingField);
  }

  function initRepeatableEntryGroups() {
    const groups = document.querySelectorAll("[data-repeatable-group]");
    if (!groups.length) return;

    groups.forEach((group) => {
      const list = group.querySelector("[data-repeat-list]");
      const addBtn = group.querySelector("[data-repeat-add]");
      const removeBtn = group.querySelector("[data-repeat-remove]");
      if (!list || !addBtn || !removeBtn) return;

      const templateRow = list.querySelector(".entry-row");
      const focusableSelector = "input, select, textarea";

      const clearRowValues = (row) => {
        row.querySelectorAll("input, textarea").forEach((field) => {
          field.value = "";
          field.dispatchEvent(new Event("input", { bubbles: true }));
        });
        row.querySelectorAll("select").forEach((field) => {
          field.selectedIndex = 0;
          field.dispatchEvent(new Event("change", { bubbles: true }));
        });
      };

      if (!templateRow) return;

      addBtn.addEventListener("click", () => {
        const row = templateRow.cloneNode(true);
        clearRowValues(row);
        list.appendChild(row);
        initFloatingFields(row);
        window.I18N?.applyLanguage?.();
        row.querySelector(focusableSelector)?.focus();
      });

      removeBtn.addEventListener("click", () => {
        const rows = list.querySelectorAll(".entry-row");
        if (rows.length <= 1) {
          const onlyRow = rows[0];
          if (onlyRow) {
            clearRowValues(onlyRow);
            initFloatingFields(onlyRow);
            onlyRow.querySelector(focusableSelector)?.focus();
          }
          return;
        }
        rows[rows.length - 1].remove();
      });
    });
  }

  function initNumericOnlyInputs() {
    const numericInputs = document.querySelectorAll("input[data-numeric-only]");
    if (!numericInputs.length) return;

    const keepOnlyDigits = (value) => value.replace(/\D+/g, "");

    numericInputs.forEach((input) => {
      input.addEventListener("input", () => {
        const sanitized = keepOnlyDigits(input.value);
        if (input.value !== sanitized) {
          input.value = sanitized;
        }
      });

      input.addEventListener("paste", (event) => {
        event.preventDefault();
        const clipboardText = event.clipboardData?.getData("text") || "";
        const sanitized = keepOnlyDigits(clipboardText);
        if (document.queryCommandSupported?.("insertText")) {
          document.execCommand("insertText", false, sanitized);
          return;
        }
        const start = input.selectionStart ?? input.value.length;
        const end = input.selectionEnd ?? input.value.length;
        input.value =
          input.value.slice(0, start) + sanitized + input.value.slice(end);
      });
    });
  }

  function initMobileServiceMenu() {
    const serviceBtn = document.getElementById("mobile-services-toggle");
    const dropup = document.getElementById("services-dropup");
    if (!serviceBtn || !dropup) return;

    serviceBtn.setAttribute("aria-expanded", "false");
    serviceBtn.setAttribute("aria-controls", "services-dropup");
    serviceBtn.addEventListener("click", () => {
      const isOpen = dropup.classList.toggle("open");
      serviceBtn.setAttribute("aria-expanded", String(isOpen));
    });
  }

  function initScrollLazyLoad() {
    const lazyTargets = Array.from(
      document.querySelectorAll(".section, .card, .footer-grid > div"),
    );
    if (!lazyTargets.length) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduceMotion || !("IntersectionObserver" in window)) {
      lazyTargets.forEach((target) => target.classList.add("is-visible"));
      return;
    }

    lazyTargets.forEach((target, index) => {
      if (index < 2) {
        target.classList.add("is-visible");
        return;
      }
      target.classList.add("lazy-on-scroll");
    });

    const observer = new IntersectionObserver(
      (entries, intersectionObserver) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          intersectionObserver.unobserve(entry.target);
        });
      },
      {
        rootMargin: "0px 0px 120px 0px",
        threshold: 0.12,
      },
    );

    lazyTargets
      .filter((target) => target.classList.contains("lazy-on-scroll"))
      .forEach((target) => observer.observe(target));
  }

  function initRoyalDarkPointerEffects() {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduceMotion) return;

    window.addEventListener(
      "pointermove",
      () => {
        document.body.classList.add("mouse-active");
      },
      { passive: true },
    );

    window.addEventListener("pointerleave", () => {
      document.body.classList.remove("mouse-active");
    });
  }

  function initPage() {
    initSecurityRuntime();
    ensurePrimaryNav();
    ensureMobileNav();
    ensureSkipLink();
    initFloatingFields();
    initRepeatableEntryGroups();
    initNumericOnlyInputs();
    initMobileServiceMenu();
    initScrollLazyLoad();
    initRoyalDarkPointerEffects();
    loadGaboChatbot();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initPage);
  } else {
    initPage();
  }
})();
