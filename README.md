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
