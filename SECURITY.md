# Security Policy

## Public repository rules

- Do not commit secrets, API keys, bearer tokens, private endpoint credentials, service-account JSON, `.env` files, `.dev.vars`, or internal incident details.
- Browser JavaScript in this repository is public by design. Treat every value in HTML, CSS, and JS as visible to users.
- Public form endpoints must validate, sanitize, rate-limit, and authorize server-side. Browser-side TinyML/sanitization is defense-in-depth and user experience support only.
- Keep endpoint contracts documented in code, but never include private infrastructure secrets or privileged routes.

## Security-header expectations

`_headers` is the deployment source of truth for HTTP security headers. Production deployments should serve at least:

- `Strict-Transport-Security`
- `Content-Security-Policy`
- `X-Content-Type-Options`
- `X-Frame-Options`
- `Referrer-Policy`
- `Permissions-Policy`
- cross-origin isolation/resource policies where compatible with required third-party services

Verify deployed headers after every hosting or `_headers` change:

```bash
curl -I https://www.gabo.services/
```

## Form endpoint security

Canonical browser submit scripts are:

- Contact: `contact/tiny-ml.js` and `contact/secure-submit.js`
- Careers: `careers/tiny-ml.js` and `careers/secure-submit.js`

Expected controls:

- Honeypot/bot-trap checks
- Client-side normalization and risk scoring
- Submit throttling/locking
- Nonce/session identifiers
- Integrity hash headers
- Strict JSON POST payloads
- Server-side validation that repeats or exceeds browser-side controls

Do not reintroduce a second generic Careers submit handler in `assets/main.js`; Careers submit behavior belongs to `careers/secure-submit.js`.

## Chatbot security

- Production chatbot runtime lives only in `assets/gabo-io-chatbot.js`.
- Production chatbot styles live only in `assets/gabo-io-chatbot.css`.
- Do not log chatbot payloads, session identifiers, lead metadata, or sanitized request bodies to the public browser console.
- Chatbot requests must avoid credentials unless the backend contract explicitly requires and documents them.

## Reporting a vulnerability

If you identify a vulnerability:

1. Do not open a public issue with exploit details.
2. Contact the repository owner/maintainer through the private support channel listed for the project or organization.
3. Include the affected route/file, impact, reproduction steps, and any safe proof-of-concept details.
4. Allow maintainers time to validate, patch, and deploy before public disclosure.

## Maintenance expectations

Before release, run the validation checklist in `README.md`, verify deployed headers, and confirm no duplicate runtime assets or stale submit handlers were reintroduced.
