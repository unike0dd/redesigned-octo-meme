# Contact form edge scripts

This directory contains the Contact-specific browser TinyML sanitizer and repo worker.

- `tiny-ml.js` runs in the browser, applies the same security-header policy values used by `_headers`, cleanses every Contact form field, blocks bot honeypot sessions, signs the sanitized payload with SHA-256, and sends only the cleansed envelope to `/api/contact`.
- `repo-worker.js` is the Contact Cloudflare Worker entrypoint. It mirrors the `_headers` policy in every response, validates the origin, re-cleanses the submitted payload server-side, verifies the client fingerprint when present, and can forward the sanitized envelope to GitHub repository dispatch when `GITHUB_TOKEN` is configured.
