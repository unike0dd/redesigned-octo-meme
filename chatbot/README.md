# gabo io chatbot

This directory is dedicated to **gabo io ONLY** for the website chatbot runtime and grounded retrieval content. It keeps the chatbot separated from the shared site utilities while preserving the chatbot's presence on every page through `assets/main.js`, which dynamically loads `chatbot/gabo-io.js`.

## Runtime architecture

- `gabo-io.js`: browser chatbot widget. It renders the existing gabo io floating action button and chat panel, loads this directory's content index, sends the visitor message plus grounded retrieval context to the Cloudflare Worker endpoint `/api/ops-online-chat`, and falls back to local grounded content if the Worker is unavailable.
- `gabo-io-content-index.json`: curated website content index used by the chatbot to answer with confidence and provide relevant source-aware context to the Worker.
- `*.md`: supporting retrieval briefs for service, learning, contact, and lead-generation responses.

## Retrieval rules

- Use this content only for gabo io chatbot responses.
- Keep answers concise, privacy-aware, and tied to Gabriel Services website content.
- Prefer the entry `answer` for direct responses and append the `leadGenerationPrompt` only when the visitor shows buying intent, asks for help, or needs follow-up.
- Do not treat this directory as a public site navigation section.

## Cloudflare Worker handoff

The chatbot continues communicating with the Cloudflare Worker at `/api/ops-online-chat`. Each request includes:

- `message`: the end user's sanitized message text from the chat input.
- `lang`: the active website language.
- `retrieval.contentDirectory`: `/chatbot/`, so the Worker can identify the dedicated chatbot knowledge directory.
- `retrieval.contentIndexUrl`: the active URL for `gabo-io-content-index.json`.
- `retrieval.matches`: the top local website-content matches with confidence scores.

If the Worker cannot be reached, `gabo-io.js` answers directly from `gabo-io-content-index.json` so the chatbot remains available on each website page.
