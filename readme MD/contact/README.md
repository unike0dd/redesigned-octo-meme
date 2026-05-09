# Contact form edge scripts

This Markdown document describes the Contact-specific browser TinyML sanitizer and repo worker. Runtime scripts remain in the `contact/` directory.

## Required handoff order

Every Contact submission is configured so TinyML is the first touch before any repo or Cloudflare Worker receives user-provided content:

1. `contact/tiny-ml.js` runs in the browser first, blocks honeypot sessions, sanitizes each field, signs the cleaned payload, and sends only the sanitized envelope to `/api/contact`.
2. `contact/repo-worker.js` receives the sanitized envelope, repeats the TinyML cleanse server-side, verifies the integrity fingerprint, and refuses residual risk before any upstream handoff.
3. The repo worker posts the verified envelope to `CONTACT_CF_TINYML_URL` (defaulting to `https://contacto.gabo.services/__ops/contact/tinyml`) and includes the server-only `CONTACT_REPO_TO_TINYML_SECRET` as a worker-to-worker handoff header. If the CF TinyML worker rejects or fails, the handoff stops.

## Files

- `tiny-ml.js` runs in the browser, applies the same security-header policy values used by `_headers`, cleanses every Contact form field, blocks bot honeypot sessions, signs the sanitized payload with SHA-256, and sends only the cleansed envelope to `/api/contact`.
- `repo-worker.js` is the Contact Cloudflare Worker entrypoint. It mirrors the `_headers` policy in every response, validates the origin, re-cleanses the submitted payload server-side, verifies the client fingerprint when present, and enforces the `browser TinyML → repo worker → CF TinyML guard` order.

## Environment variables

- `CONTACT_CF_TINYML_URL` (optional): CF TinyML guard URL. Defaults to `https://contacto.gabo.services/__ops/contact/tinyml` when the binding is not set.
- `CONTACT_REPO_TO_TINYML_SECRET` (required secret): server-side shared secret sent only by `contact/repo-worker.js` to the CF TinyML guard. Do not place this value in `contact.html`, browser JavaScript, repository docs, or any client-visible asset.

## Cloudflare configuration

Set the URL as a normal Worker variable and the shared secret as a Worker secret. The secret value must stay server-side and should never be committed:

```sh
wrangler secret put CONTACT_REPO_TO_TINYML_SECRET
```

Example non-secret variable value:

```txt
CONTACT_CF_TINYML_URL=https://contacto.gabo.services/__ops/contact/tinyml
```
