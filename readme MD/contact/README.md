# Contact form edge scripts

This Markdown document describes the Contact-specific browser TinyML sanitizer and Contact API Gateway Worker. Runtime scripts remain in the `contact/` directory.

## Required handoff order

Every Contact submission is configured so browser TinyML is the first touch before the Contact API Gateway Worker or any downstream Cloudflare Worker receives user-provided content:

1. `contact/tiny-ml.js` runs in the browser first, blocks honeypot sessions, sanitizes each field, signs the cleaned payload, and sends only the sanitized envelope to `https://contact-api.gabo.services/api/contact`.
2. `contact/repo-worker.js` runs as the Contact API Gateway Worker, receives the sanitized envelope, repeats the TinyML cleanse server-side, verifies the integrity fingerprint, and refuses residual risk before any upstream handoff.
3. The Contact API Gateway Worker reads `env.CONTACT_REPO_TO_TINYML_SECRET` from Cloudflare Worker secrets, injects that value only into the server-to-server `X-Gabo-Repo-To-TinyML-Secret` header, and forwards the verified envelope to `CONTACT_CF_TINYML_URL` (defaulting to `https://contacto.gabo.services/__ops/contact/tinyml`). If the CF TinyML worker rejects or fails, the handoff stops.

## Files

- `tiny-ml.js` runs in the browser, applies the same security-header policy values used by `_headers`, cleanses every Contact form field, blocks bot honeypot sessions, signs the sanitized payload with SHA-256, and sends only the cleansed envelope to `https://contact-api.gabo.services/api/contact`.
- `repo-worker.js` is the Contact API Gateway Worker entrypoint for `https://contact-api.gabo.services`. It mirrors the `_headers` policy in every response, exposes `/health`, validates the origin, re-cleanses the submitted payload server-side, verifies the client fingerprint when present, computes `X-Gabo-Repo-Sanitized-SHA256` from the repaired `contacto.gabo.services` integrity base, and enforces the `browser TinyML → Contact API Gateway Worker → CF TinyML worker` order.
- `functions/api/contact.js` is the Cloudflare Pages Function adapter for `POST /api/contact`; it delegates the Pages route to `contact/repo-worker.js` so the endpoint is executable when the site is deployed on Cloudflare Pages instead of remaining a static file.
- `wrangler.toml` is the deployable Cloudflare Worker configuration for the Contact API Gateway Worker. It points Wrangler at `contact/repo-worker.js`, names the deployable worker `contact-api-gabo-services`, binds the custom domain route `contact-api.gabo.services`, and pins the non-secret upstream URL to `https://contacto.gabo.services/__ops/contact/tinyml`.

## Environment variables

- `CONTACT_CF_TINYML_URL` (optional): CF TinyML URL. Defaults to `https://contacto.gabo.services/__ops/contact/tinyml` when the binding is not set.
- `CONTACT_REPO_TO_TINYML_SECRET` (required Cloudflare Worker secret): server-side shared secret read as `env.CONTACT_REPO_TO_TINYML_SECRET` and sent only by the Contact API Gateway Worker to the CF TinyML worker. Store the actual value only in Cloudflare Worker secrets. Do not place the actual value in `contact.html`, browser JavaScript, `_headers`, JSON files, public config files, repository docs, or any client-visible asset.

## Cloudflare configuration

GitHub Pages cannot execute `POST /api/contact`; it returns `405 Method Not Allowed` because `/api/contact` is not an executable static asset route on `unike0dd.github.io`. The browser Contact form therefore posts to the deployed Contact API Gateway Worker endpoint at `https://contact-api.gabo.services/api/contact`, which then forwards the verified envelope to `https://contacto.gabo.services/__ops/contact/tinyml`.

`/api/contact` is still supported only by executable Cloudflare deployments, such as Cloudflare Pages Functions or a Worker route on a Cloudflare-proxied custom domain. Do not configure the GitHub Pages browser form to expect `https://unike0dd.github.io/api/contact` to process Contact submissions.

The browser is allowed to send only the public headers listed in `contact/tiny-ml.js`: `Content-Type`, `X-Gabo-Origin`, `X-Gabo-Source`, `X-Ops-Asset-Id`, `X-Gabo-Repo-Id`, `X-Gabo-Session-Id`, `X-Gabo-Nonce`, and `X-Gabo-Integrity-SHA256`. The Contact API Gateway Worker calculates `X-Gabo-Repo-Sanitized-SHA256`, adds `X-Gabo-Headers-Policy: contact-repo-tinyml-v1`, and injects `X-Gabo-Repo-To-TinyML-Secret` server-side before forwarding to `https://contacto.gabo.services/__ops/contact/tinyml`.

The browser must not send private gateway or downstream secret headers, secret variable names, or Apps Script configuration. `contact/tiny-ml.js` intentionally sends only the public headers listed above.

Set the URL as a normal Worker variable and the shared secret as a Cloudflare Worker secret. The secret value must stay server-side and must never be committed:

```sh
wrangler secret put CONTACT_REPO_TO_TINYML_SECRET
wrangler deploy --config wrangler.toml
```

Example non-secret variable value:

```txt
CONTACT_CF_TINYML_URL=https://contacto.gabo.services/__ops/contact/tinyml
```

## Health checks and downstream Workers

After deploying `wrangler.toml` and assigning the custom domain, verify the Contact API Gateway Worker with:

```sh
curl -sS https://contact-api.gabo.services/health
```

The response should include `"ok": true`, `"worker": "contact-api.gabo.services"`, `"route": "contact"`, and `"status": "online"`. If the hostname still returns `ERR_NAME_NOT_RESOLVED`, create or repair the Cloudflare Worker custom domain/DNS record before retesting.

The downstream Workers are outside this repository, but the expected operational checks remain:

```sh
curl -sS https://bridgeapp.gabo.services/health
curl -sS https://apps.gabo.services/health
```

Expected downstream JSON shape for both health checks is `{"ok":true,"worker":"<hostname>","route":"contact","status":"online"}`. Keep those domains out of browser `connect-src`; the public browser flow should contact only `contact-api.gabo.services`, while `contacto.gabo.services` remains allowed for health/debug visibility.

### Downstream enforcement contract

The downstream Bridge and Apps Workers are not browser-visible and are outside this repository. Store their secret values only in their Cloudflare Worker environments, never in this public repository or browser-visible assets. The Bridge Worker must accept only `X-Ops-Internal-Hop: contacto.gabo.services`, use its `AI` binding for final TinyML/Llama Guard checks, and forward only through its Apps service binding. The Apps Worker must accept only `X-Ops-Internal-Hop: bridgeapp.gabo.services` and forward only to its configured Apps Script endpoint.
