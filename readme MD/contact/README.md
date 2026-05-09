# Contact form edge scripts

This Markdown document describes the Contact-specific browser TinyML sanitizer and repo worker. Runtime scripts remain in the `contact/` directory.

## Required handoff order

Every Contact submission is configured so TinyML is the first touch before any repo or Cloudflare Worker receives user-provided content:

1. `contact/tiny-ml.js` runs in the browser first, blocks honeypot sessions, sanitizes each field, signs the cleaned payload, and sends only the sanitized envelope to `https://contact-api.gabo.services/api/contact`.
2. `contact/repo-worker.js` receives the sanitized envelope, repeats the TinyML cleanse server-side, verifies the integrity fingerprint, and refuses residual risk before any upstream handoff.
3. The repo worker posts the verified envelope to `CONTACT_CF_TINYML_URL` (defaulting to `https://contacto.gabo.services/__ops/contact/tinyml`) and includes the server-only `CONTACT_REPO_TO_TINYML_SECRET` as a worker-to-worker handoff header. If the CF TinyML worker rejects or fails, the handoff stops.

## Files

- `tiny-ml.js` runs in the browser, applies the same security-header policy values used by `_headers`, cleanses every Contact form field, blocks bot honeypot sessions, signs the sanitized payload with SHA-256, and sends only the cleansed envelope to `https://contact-api.gabo.services/api/contact`.
- `repo-worker.js` is the Contact Cloudflare Worker entrypoint. It mirrors the `_headers` policy in every response, validates the origin, re-cleanses the submitted payload server-side, verifies the client fingerprint when present, computes `X-Gabo-Repo-Sanitized-SHA256` from the repaired `contacto.gabo.services` integrity base, and enforces the `browser TinyML → repo worker → CF TinyML worker` order.
- `functions/api/contact.js` is the Cloudflare Pages Function adapter for `POST /api/contact`; it delegates the Pages route to `contact/repo-worker.js` so the endpoint is executable when the site is deployed on Cloudflare Pages instead of remaining a static file.
- `wrangler.toml` is the deployable Cloudflare Worker configuration for the repo-side Contact gateway. It points Wrangler at `contact/repo-worker.js` and pins the non-secret upstream URL to `https://contacto.gabo.services/__ops/contact/tinyml`.

## Environment variables

- `CONTACT_CF_TINYML_URL` (optional): CF TinyML URL. Defaults to `https://contacto.gabo.services/__ops/contact/tinyml` when the binding is not set.
- `CONTACT_REPO_TO_TINYML_SECRET` (required secret): server-side shared secret sent only by `contact/repo-worker.js` to the CF TinyML worker. Do not place this value in `contact.html`, browser JavaScript, repository docs, or any client-visible asset.

## Cloudflare configuration

GitHub Pages cannot execute `POST /api/contact`; it returns `405 Method Not Allowed` because `/api/contact` is not an executable static asset route on `unike0dd.github.io`. The browser Contact form therefore posts to the deployed repo-side Cloudflare Worker endpoint at `https://contact-api.gabo.services/api/contact`, which then forwards the verified envelope to `https://contacto.gabo.services/__ops/contact/tinyml`.

`/api/contact` is still supported only by executable Cloudflare deployments, such as Cloudflare Pages Functions or a Worker route on a Cloudflare-proxied custom domain. Do not configure the GitHub Pages browser form to expect `https://unike0dd.github.io/api/contact` to process Contact submissions.

The browser is allowed to send only the public headers listed in `contact/tiny-ml.js`: `Content-Type`, `X-Gabo-Origin`, `X-Gabo-Source`, `X-Ops-Asset-Id`, `X-Gabo-Repo-Id`, `X-Gabo-Session-Id`, `X-Gabo-Nonce`, and `X-Gabo-Integrity-SHA256`. The repo-side Worker adds `X-Gabo-Repo-Sanitized-SHA256`, `X-Gabo-Headers-Policy: contact-repo-tinyml-v1`, and `X-Gabo-Repo-To-TinyML-Secret` server-side before forwarding to `https://contacto.gabo.services/__ops/contact/tinyml`.

Set the URL as a normal Worker or Pages variable and the shared secret as a Worker or Pages secret. The secret value must stay server-side and should never be committed:

```sh
wrangler secret put CONTACT_REPO_TO_TINYML_SECRET
wrangler deploy --config wrangler.toml
```

Example non-secret variable value:

```txt
CONTACT_CF_TINYML_URL=https://contacto.gabo.services/__ops/contact/tinyml
```
