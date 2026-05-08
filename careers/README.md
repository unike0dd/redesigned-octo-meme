# Careers form edge scripts

This directory contains the Careers-specific browser TinyML sanitizer and repo worker.

## Required handoff order

Every Careers submission is configured so TinyML is the first touch before any repo or Cloudflare Worker receives user-provided content:

1. `careers/tiny-ml.js` runs in the browser first, blocks honeypot sessions, sanitizes each field, signs the cleaned payload, and sends only the sanitized envelope to `/api/careers`.
2. `careers/repo-worker.js` receives the sanitized envelope, repeats the TinyML cleanse server-side, verifies the integrity fingerprint, and refuses residual risk before any upstream handoff.
3. When `CAREERS_CF_TINY_WORKER_URL` or `CF_TINY_WORKER_URL` is configured, the repo worker posts the verified envelope to the CF Tiny Worker next. If that configured Tiny Worker rejects or fails, the handoff stops before the CF Worker.
4. When `CAREERS_CF_WORKER_URL` or `CF_WORKER_URL` is configured, the repo worker posts the Tiny Worker-validated envelope to the final CF Worker. GitHub repository dispatch remains the fallback when no final CF Worker is configured, or can be enabled after the CF Worker with `FORWARD_TO_REPOSITORY_AFTER_CF=true`.

## Files

- `tiny-ml.js` runs in the browser, applies the same security-header policy values used by `_headers`, cleanses every Careers form field, blocks bot honeypot sessions, signs the sanitized payload with SHA-256, and sends only the cleansed envelope to `/api/careers`.
- `repo-worker.js` is the Careers Cloudflare Worker entrypoint. It mirrors the `_headers` policy in every response, validates the origin, re-cleanses the submitted payload server-side, verifies the client fingerprint when present, and enforces the `browser TinyML → repo worker → CF Tiny Worker → CF Worker` order before optional repository dispatch.

## Environment variables

- `CAREERS_CF_TINY_WORKER_URL` or `CF_TINY_WORKER_URL` (optional): CF Tiny Worker URL that must run after the repo worker and before the final CF Worker.
- `CAREERS_CF_TINY_WORKER_TOKEN` or `CF_TINY_WORKER_TOKEN` (optional): bearer token for the CF Tiny Worker handoff.
- `CAREERS_CF_WORKER_URL` or `CF_WORKER_URL` (optional): final CF Worker URL that receives the Tiny Worker-validated Careers envelope.
- `CAREERS_CF_WORKER_TOKEN` or `CF_WORKER_TOKEN` (optional): bearer token for the final CF Worker handoff.
- `FORWARD_TO_REPOSITORY_AFTER_CF` (optional): set to `true` to also dispatch to GitHub after the final CF Worker accepts the handoff.
