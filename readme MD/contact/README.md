# Contact intake security flow

The Contact page now uses a clean, explicit pipeline:

```text
repo Contact page
  -> Submit
  -> repo TinyML/CySec sanitizer
  -> repo communication bridge
  -> https://contacto.gabo.services/api/contact
  -> Contact Intake Worker verification
  -> env.CONTACT_BRIDGE service binding
```

## Browser-side order

1. `contact.html` renders the Contact form and points the intended upstream to `https://contacto.gabo.services/api/contact`.
2. `contact/tiny-ml.js` runs first in the browser. It collects form fields, clears and sanitizes text, removes malicious/programming-code patterns, scores risk, blocks honeypot sessions, and creates the SHA-256 integrity proof only after sanitizer and CySec checks pass.
3. `contact/repo-worker.js` is the repo-side browser communication bridge. It prevents the native submit, requires the TinyML/CySec pass, sends only the sanitized JSON envelope, and attaches the public integrity headers expected by the Worker.
4. `contact/intake-worker.js` is the public Cloudflare Worker module for `https://contacto.gabo.services`. It repeats server-side sanitation, verifies the post-sanitizer SHA-256 hash, performs risk inspection, optionally runs Cloudflare AI/Llama Guard when `env.AI` is available, and relays privately with `env.CONTACT_BRIDGE.fetch(...)`.

## Security and compliance controls

The Contact pipeline maps to these control families:

- **OWASP ASVS**: input validation, output-safe JSON responses, security headers, no credentials in browser requests, and integrity verification.
- **CISA CPG**: secure-by-design intake, bot/honeypot protection, denied private headers, and least-privilege private relay.
- **NIST CSF**: Protect and Detect through sanitation/risk scoring; Respond through deterministic rejection codes and no-store responses.
- **PCI DSS 4.0**: secure development, no client-side secrets, logging-ready request IDs, integrity checks, and least-privilege service binding relay.
- **CySec**: browser and Worker both clear, clean, scan, sanitize, remove malicious/programming-code patterns, and verify integrity before delivery.

## Public headers sent by the browser

The browser bridge sends only these public headers:

- `Content-Type`
- `X-Gabo-Origin`
- `X-Gabo-Source`
- `X-Ops-Asset-Id`
- `X-Gabo-Repo-Id`
- `X-Gabo-Session-Id`
- `X-Gabo-Nonce`
- `X-Gabo-Integrity-SHA256`
- `X-Gabo-Header-Policy`
- `X-Gabo-Client`

The browser must never send internal relay headers, bridge tokens, Apps Script secrets, cookies, or authorization headers.

## Cloudflare deployment

`wrangler.toml` points at `contact/intake-worker.js` and binds the public custom domain route `contacto.gabo.services`. Configure the private downstream service binding in Cloudflare as `CONTACT_BRIDGE`; do not forward by public URL.

```sh
wrangler deploy --config wrangler.toml
```

Health checks:

```sh
curl -sS https://contacto.gabo.services/
curl -sS https://contacto.gabo.services/health
```

The `/health` route reports `binding_ready` only when the private `CONTACT_BRIDGE` service binding is available.
