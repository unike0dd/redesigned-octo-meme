# gabo io chatbot content notes

This documentation folder is reserved for **gabo io ONLY** retrieval briefs. The Markdown files describe approved English and Spanish content that supports website answers for Gabriel Services visitors.

## Content purpose

- Store bilingual EN/ES website answer content for the gabo io chatbot.
- Keep service and learning summaries aligned with the Gabriel Services website.
- Support concise, privacy-aware customer experience and lead-generation answers.
- Keep this folder out of public site navigation.

## Content files

- `gabo-io-content-index.json`: bilingual answer index for website visitor responses.
- `*-en.md`: English retrieval briefs for service, learning, contact, and lead-generation coverage.
- `*-es.md`: Spanish retrieval briefs for service, learning, contact, and lead-generation coverage.

## Retrieval rules

- Use this content only for gabo io chatbot responses.
- Match the active site language first: English (`en`) or Spanish (`es`).
- Prefer direct, website-grounded answers from the matching service or learning brief.
- Add lead-generation guidance only when the visitor asks for help, pricing, availability, training, or follow-up.
- Keep answers limited to approved Gabriel Services content and avoid exposing internal implementation details.

## Secure interaction controls

- The chatbot must load `chatbot/gabo-io-content-index.json` first and use this Markdown directory as the approved retrieval brief source for CX and lead-generation answers.
- The browser TinyML gate and repository content gateway only accept conversational words, questions, queries, or requests related to Gabriel Services website content.
- Each interaction is decoded, cleaned, scanned, sanitized, and re-scanned before any handoff; residual code, markup, template injection, script URLs, shell/runtime commands, or SQL-like payloads block the session.
- The hidden honeypot field is checked before normal handling; if it contains a value, the session is immediately blocked, cleared, and discarded.
- Typing telemetry must remain within a human typing pace. Pasted or automation-speed messages are blocked before retrieval or handoff.
- The controls support OWASP input-validation and injection-defense practices, CISA Cyber Essentials safeguards, NIST CSF Protect/Detect outcomes, and PCI DSS-style logging/minimization by avoiding sensitive data in the browser response path and forwarding only sanitized interaction context.
