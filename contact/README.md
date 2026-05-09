# Contact form edge scripts

This directory contains the Contact-specific browser TinyML sanitizer and repo worker.

## Required handoff order

Every Contact submission is configured so TinyML is the first touch before any repo or Cloudflare Worker receives user-provided content:

1. `contact/tiny-ml.js` runs in the browser first, blocks honeypot sessions, sanitizes each field, signs the cleaned payload, and sends only the sanitized envelope to `/api/contact`.
2. `contact/repo-worker.js` receives the sanitized envelope, repeats the TinyML cleanse server-side, verifies the integrity fingerprint, and refuses residual risk before any upstream handoff.
3. The repo worker posts the verified envelope to the CF TinyML endpoint at `POST /__ops/contact/tinyml` next. It includes `X-Gabo-Origin: https://unike0dd.github.io`, the browser/client hash, the post-sanitizer repo hash in `X-Gabo-Repo-Sanitized-SHA256`, the `contact-repo-tinyml-v1` header policy, and the server-side `CONTACT_REPO_TO_TINYML_SECRET`. If that TinyML worker rejects or fails, the handoff stops before the CF Worker.
4. When `CONTACT_CF_WORKER_URL` or `CF_WORKER_URL` is configured, the repo worker posts the Tiny Worker-validated envelope to the final CF Worker. GitHub repository dispatch remains the fallback when no final CF Worker is configured, or can be enabled after the CF Worker with `FORWARD_TO_REPOSITORY_AFTER_CF=true`.

## Files

- `tiny-ml.js` runs in the browser, applies the same security-header policy values used by `_headers`, cleanses every Contact form field, blocks bot honeypot sessions, signs the sanitized payload with SHA-256, and sends only the cleansed envelope to `/api/contact`.
- `repo-worker.js` is the Contact Cloudflare Worker entrypoint. It mirrors the `_headers` policy in every response, validates the origin, re-cleanses the submitted payload server-side, verifies the client fingerprint when present, and enforces the `browser TinyML → repo worker → CF Tiny Worker → CF Worker` order before optional repository dispatch.

## Repo sanitizer integrity base

The repo worker calculates `X-Gabo-Repo-Sanitized-SHA256` only after building the sanitized Contact package, using the stable JSON string of this exact base:

```json
{
  "formType": "<formType>",
  "route": "<route>",
  "site": "<site>",
  "repo": "<repo>",
  "request_id": "<request_id>",
  "source": "<source>",
  "fields": {},
  "lists": {},
  "security": {
    "lane": "<lane>",
    "origin": "<origin>",
    "repo_id": "<repo_id>",
    "asset_id": "<asset_id>",
    "session_id": "<session_id>"
  }
}
```

## Environment variables

- `CONTACT_CF_TINYML_URL` (optional): CF TinyML URL that must run after the repo worker and before the final CF Worker. Defaults to `https://contact-guard.gabo.services/__ops/contact/tinyml`; the worker normalizes this URL to the required `/__ops/contact/tinyml` path before posting.
- `CONTACT_REPO_TO_TINYML_SECRET` (required): server-side shared secret sent only by the repo worker to CF TinyML as `X-Gabo-Repo-To-TinyML-Secret`.
- `CONTACT_CF_WORKER_URL` or `CF_WORKER_URL` (optional): final CF Worker URL that receives the Tiny Worker-validated Contact envelope.
- `CONTACT_CF_WORKER_TOKEN` or `CF_WORKER_TOKEN` (optional): bearer token for the final CF Worker handoff.
- `FORWARD_TO_REPOSITORY_AFTER_CF` (optional): set to `true` to also dispatch to GitHub after the final CF Worker accepts the handoff.
