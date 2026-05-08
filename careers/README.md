# Careers form edge scripts

This directory contains the Careers-specific browser TinyML sanitizer and repo worker.

- `tiny-ml.js` runs in the browser, applies the same security-header policy values used by `_headers`, cleanses every Careers form field, blocks bot honeypot sessions, signs the sanitized payload with SHA-256, and sends only the cleansed envelope to `/api/careers`.
- `repo-worker.js` is the Careers Cloudflare Worker entrypoint. It mirrors the `_headers` policy in every response, validates the origin, re-cleanses the submitted payload server-side, verifies the client fingerprint when present, and can forward the sanitized envelope to GitHub repository dispatch when `GITHUB_TOKEN` is configured.

The HTML form is fail-closed: its native `action` points back to the page, while `tiny-ml.js` reads the Cloudflare Worker URL from `data-cf-worker-url` only after the Careers-specific scanner has passed and replaced form values with cleansed data.

The repo worker also rejects requests without the matching page-specific TinyML proof (`beforeWorker` plus the page scanner id), so Contact and Careers submissions cannot share a scanner path.
