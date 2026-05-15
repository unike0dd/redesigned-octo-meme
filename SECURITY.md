# Gabo Services API Gateway Model

Use a provider-neutral, subdomain-separated Gabo Services API Gateway model:

```text
www.gabo.services              = website
contacto.gabo.services         = Contact security gateway
careers.gabo.services          = Careers security gateway
future chatbot.gabo.services   = Chatbot security gateway
```

## Phase 1 — Clean public security picture only

- Keep the Contact and Careers gateway domains separated and explicitly allowlisted.
- Keep public site metadata aligned to `https://www.gabo.services`.
- Keep the public security policy limited to `self` plus approved `gabo.services` gateway subdomains.
- Keep script and asset caching short while security and gateway contracts are being cleaned.

## Phase 2 — Clean Contact and Careers form contracts

- Keep Contact submissions flowing through `https://contacto.gabo.services/api/contact`.
- Keep Careers submissions flowing through `https://careers.gabo.services/api/careers`.
- Keep browser-visible form validation aligned with the gateway validation contract.
- Keep response handling compatible with `{ "ok": true }` success responses.

## Phase 3 — Gateway hardening

- Gateways should enforce strict allowed origins, allowed methods, allowed headers, body-size limits, sanitization, replay resistance, and safe JSON responses.
- Gateway health responses should stay minimal and avoid exposing internal routing details.
- Gateway failures should return safe user-facing messages without exposing private implementation details.

## Phase 4 — Chatbot gateway preparation

- Reserve `https://chatbot.gabo.services` as the public Chatbot security gateway.
- Keep the Chatbot gateway separated from Contact and Careers so it can be maintained, rate-limited, and blocked independently.

## What should not be done

- Do not add `package.json`.
- Do not add a web app manifest file.
- Do not add YAML deployment files.
- Do not collapse Contact, Careers, and Chatbot into one browser-facing API route.
- Do not expose private gateway implementation details in browser code, metadata, or public health responses.
