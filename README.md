# Gabriel Services Website

This repository contains a clean, deployable static website for Gabriel Services. The site is now structured for production deployment, with fixed internal navigation, dedicated asset folders, and CI workflows.

## What changed
- Restored the real website homepage and supporting pages
- Moved site assets into `assets/`
- Added page metadata and cleaned broken chatbot/service links
- Created a working GitHub Actions audit and deploy workflow
- Added CSS formatting and HTML quality checks using Prettier and HTMLHint
- Added `robots.txt` and `sitemap.xml` for SEO indexing

## Deploy
This repository is ready for GitHub Pages deployment via `.github/workflows/deploy-pages.yml`. The site publishes the repository root to the `gh-pages` branch automatically on every push to `main`.

## Pages
- `index.html`
- `about.html`
- `careers.html`
- `contact.html`
- `learning.html`
- `privacy-gdpr.html`
- `terms.html`
