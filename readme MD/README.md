# Gabriel Services Website

This repository contains a clean, deployable static website for Gabriel Services. The site is structured for production deployment, with fixed internal navigation, dedicated asset folders, bilingual legal pages, and CI workflows.

## What changed
- Restored the real website homepage and supporting pages
- Moved site assets into `assets/`
- Added page metadata and cleaned broken chatbot/service links
- Created a working GitHub Actions audit and deploy workflow
- Added CSS formatting and HTML quality checks using Prettier and HTMLHint
- Added `robots.txt` and `sitemap.xml` for SEO indexing
- Consolidated legal content into one page per legal item under `legal/`, with EN and ES language controls

## Browser console diagnostics

Chrome can report `Unchecked runtime.lastError: A listener indicated an asynchronous response by returning true, but the message channel closed before a response was received` while viewing the site. The website code does not call `chrome.runtime`, `browser.runtime`, or extension messaging APIs; this warning is usually emitted by a browser extension content script that injects itself into the page.

The client runtime now registers a narrow diagnostic guard for this known extension-message-channel noise so it does not break site observability or mask first-party application errors. If the warning persists, validate the page in an incognito/private window with extensions disabled, then re-enable extensions one at a time to identify the source.

## Deploy
This repository is ready for GitHub Pages deployment via `.github/workflows/deploy-pages.yml`. The site publishes the repository root to the `gh-pages` branch automatically on every push to `main`.

## Pages

### Main pages
- `index.html`
- `about.html`
- `careers.html`
- `contact.html`
- `services.html`
- `learning.html`

### Service pages
- `services/logistics-operations.html`
- `services/administrative-backoffice.html`
- `services/customer-relations.html`
- `services/it-support.html`

### Learning pages
- `learning/logistics-operations.html`
- `learning/administrative-backoffice.html`
- `learning/customer-relations.html`
- `learning/it-support.html`

### Legal pages
- `legal/privacy-gdpr.html`
- `legal/terms.html`
- `legal/cookies.html`

Top-level legacy legal pages such as `privacy-gdpr.html` and `terms.html` were removed so there is no redirect-only legal content. The active legal pages are the bilingual EN/ES pages under `legal/`.
