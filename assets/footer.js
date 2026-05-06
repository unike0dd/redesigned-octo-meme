(function () {
  function getSiteBasePath() {
    const parts = window.location.pathname.split("/").filter(Boolean);
    const repoName = "redesigned-octo-meme";
    return parts[0] === repoName ? `/${repoName}` : "";
  }

  function footerMarkup() {
    const basePath = getSiteBasePath();
    return `
      <div class="container footer-grid" data-footer-sitemap>
        <div>
          <h4 data-i18n="company">Company</h4>
          <a href="${basePath}/" data-footer-link="home" data-i18n="home">Home</a>
          <a href="${basePath}/about.html" data-footer-link="about" data-i18n="about">About</a>
          <a href="${basePath}/services.html" data-footer-link="services" data-i18n="servicesOverview">Services Overview</a>
          <a href="${basePath}/careers.html" data-footer-link="careers" data-i18n="careers">Careers</a>
        </div>
        <div>
          <h4 data-i18n="servicePagesLabel">Service Pages</h4>
          <a href="${basePath}/services/logistics-operations.html" data-footer-link="logistics-operations" data-i18n="logisticsOps">Logistics Operations</a>
          <a href="${basePath}/services/administrative-backoffice.html" data-footer-link="administrative-backoffice" data-i18n="adminBackOffice">Administrative Back Office</a>
          <a href="${basePath}/services/customer-relations.html" data-footer-link="customer-relations" data-i18n="customerRelations">Customer Relations</a>
          <a href="${basePath}/services/it-support.html" data-footer-link="it-support" data-i18n="itSupport">IT Support</a>
        </div>
        <div>
          <h4 data-i18n="supportLearning">Support & Learning</h4>
          <a href="${basePath}/contact.html" data-footer-link="contact" data-i18n="contact">Contact</a>
          <a href="${basePath}/learning.html" data-footer-link="learning" data-i18n="learning">Learning</a>
          <a href="${basePath}/sitemap.xml" data-footer-link="sitemap" data-i18n="sitemap">Sitemap</a>
        </div>
        <div>
          <h4 data-i18n="legal">Legal</h4>
          <a href="${basePath}/legal/terms.html" data-footer-link="terms" data-i18n="termsConditions">Terms & Conditions</a>
          <a href="${basePath}/legal/cookies.html" data-footer-link="cookies" data-i18n="cookiesConsent">Cookies Consent</a>
          <a href="${basePath}/legal/privacy-gdpr.html" data-footer-link="privacy" data-i18n="privacyGdpr">Privacy & GDPR</a>
        </div>
      </div>
      <div class="container footer-meta">
        <small data-i18n="copyright">© 2026 Gabriel Services</small>
      </div>
    `;
  }

  function ensureGlobalFooter() {
    let footer = document.querySelector("footer");
    if (!footer) {
      footer = document.createElement("footer");
      document.body.appendChild(footer);
    }
    footer.innerHTML = footerMarkup();
    // Re-apply language to footer elements after they're added
    if (window.I18N && typeof I18N.applyLanguage === "function") {
      I18N.applyLanguage();
    }
  }

  function trackFooterAction(event) {
    const link = event.target.closest("[data-footer-link]");
    if (!link) return;
    const detail = {
      page: link.getAttribute("data-footer-link"),
      href: link.getAttribute("href"),
      text: link.textContent?.trim() || "",
      action: "navigate",
      trigger: "footer_click",
    };
    document.dispatchEvent(new CustomEvent("footer:navigate", { detail }));
    window.dispatchEvent(new CustomEvent("footer:action", { detail }));
  }

  function initFooterEvents() {
    const footer = document.querySelector("footer");
    if (!footer) return;
    footer.removeEventListener("click", trackFooterAction);
    footer.addEventListener("click", trackFooterAction);
  }

  // Ensure footer is created when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      ensureGlobalFooter();
      initFooterEvents();
    });
  } else {
    ensureGlobalFooter();
    initFooterEvents();
  }

  // Re-create footer when language changes
  if (typeof window !== "undefined") {
    window.addEventListener("language:changed", () => {
      ensureGlobalFooter();
      initFooterEvents();
    });
  }
})();
