# Contact form edge scripts

This Markdown document describes the Contact-specific browser TinyML sanitizer and repo worker. Runtime scripts remain in the `contact/` directory, with a Cloudflare Pages route shim in `functions/api/contact.js` for `/api/contact` deployments.

## Required handoff order

Every Contact submission is configured so TinyML is the first touch before any repo or Cloudflare Worker receives user-provided content:

1. `contact/tiny-ml.js` runs in the browser first, blocks honeypot sessions, sanitizes each field, signs the cleaned payload, and sends only the sanitized envelope to `/api/contact`.
2. `/api/contact` is handled by the deployed repo Worker or by the Cloudflare Pages Function shim in `functions/api/contact.js`; a static copy of `contact/repo-worker.js` is documentation/source only until deployed.
3. `contact/repo-worker.js` receives the sanitized envelope, repeats the TinyML cleanse server-side, verifies the integrity fingerprint, calculates `X-Gabo-Repo-Sanitized-SHA256` from the sorted canonical Contact hash base, and refuses residual risk before any upstream handoff.
4. The repo worker posts the verified envelope to `https://contacto.gabo.services/__ops/contact/tinyml` and includes the server-only `CONTACT_REPO_TO_TINYML_SECRET` as the `X-Gabo-Repo-To-TinyML-Secret` worker-to-worker handoff header. If the CF TinyML worker rejects or fails, the handoff stops.

## Files

- `tiny-ml.js` runs in the browser, applies the same security-header policy values used by `_headers`, cleanses every Contact form field, blocks bot honeypot sessions, signs the sanitized payload with SHA-256, and sends only the cleansed envelope plus public headers to `/api/contact`.
- `repo-worker.js` is the Contact Cloudflare Worker entrypoint. It mirrors the `_headers` policy in every response, validates the origin, re-cleanses the submitted payload server-side, verifies the client fingerprint, and enforces the `browser TinyML → repo worker → contacto.gabo.services TinyML worker` order.
- `functions/api/contact.js` maps Cloudflare Pages `POST /api/contact` requests into the repo worker so Pages deployments execute the Worker logic instead of serving `contact/repo-worker.js` as a static asset.

## Environment variables

- `CONTACT_REPO_TO_TINYML_SECRET` (required secret): server-side shared secret sent only by `contact/repo-worker.js` to the CF TinyML worker. Do not place this value in `contact.html`, browser JavaScript, repository docs, JSON files, or any client-visible asset.

## Cloudflare configuration

Deploy `contact/repo-worker.js` as the repo Contact Worker or deploy the repository through Cloudflare Pages so `functions/api/contact.js` owns `/api/contact`. Then set the shared secret as a Worker/Pages secret. The secret value must stay server-side and should never be committed:

```sh
wrangler secret put CONTACT_REPO_TO_TINYML_SECRET
```
