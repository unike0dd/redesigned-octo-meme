(function () {
  function footerMarkup() {
    return `
      <div class="container footer-grid" data-footer-sitemap>
        <div>
          <h4>Company</h4>
          <a href="./" data-footer-link="home">Home</a>
          <a href="./about/" data-footer-link="about">About</a>
          <a href="learning.html" data-footer-link="services">Services Overview</a>
          <a href="./careers/" data-footer-link="careers">Careers</a>
        </div>
        <div>
          <h4>Service Pages</h4>
          <a href="learning.html" data-footer-link="logistics-operations">Logistics Operations</a>
          <a href="learning.html" data-footer-link="administrative-backoffice">Administrative Back Office</a>
          <a href="learning.html" data-footer-link="customer-relations">Customer Relations</a>
          <a href="learning.html" data-footer-link="it-support">IT Support</a>
        </div>
        <div>
          <h4>Support & Learning</h4>
          <a href="./contact/" data-footer-link="contact">Contact</a>
          <a href="./learning/" data-footer-link="learning">Learning</a>
          <a href="./sitemap.xml" data-footer-link="sitemap">Sitemap</a>
        </div>
        <div>
          <h4>Legal</h4>
          <a href="./legal/terms.html" data-footer-link="terms">Terms & Conditions</a>
          <a href="./legal/cookies.html" data-footer-link="cookies">Cookies Consent</a>
          <a href="./legal/privacy-gdpr.html" data-footer-link="privacy">Privacy & GDPR</a>
        </div>
      </div>
      <div class="container footer-meta">
        <small>© 2026 Gabriel Services</small>
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

  ensureGlobalFooter();
  initFooterEvents();
})();
