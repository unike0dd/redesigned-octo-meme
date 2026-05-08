# gabo io chatbot

This directory is dedicated to **gabo io ONLY** for the website chatbot runtime, repo-grounded retrieval content, and the repository worker that keeps the Cloudflare Chatbot Worker current. It keeps chatbot assets separated from shared site utilities while preserving the chatbot's presence on every page through `assets/main.js`, which dynamically loads `chatbot/gabo-io.js`.

## Runtime architecture

- `gabo-io.js`: browser chatbot widget. It renders the gabo io floating action button and chat panel, loads this directory's content index, sends the visitor message plus grounded retrieval context to the Cloudflare Worker endpoint `/api/ops-online-chat`, and falls back to local grounded EN/ES content if the Worker is unavailable.
- `gabo-io-content-index.json`: repository-grounded bilingual EN/ES content index used by the chatbot and Worker to answer with confidence and provide relevant source-aware context.
- `repo-content-sync-worker.js`: Cloudflare Worker module for repo-to-chatbot synchronization. It fetches the latest `gabo-io-content-index.json` directly from the repository raw URL and posts the EN/ES retrieval payload to the Cloudflare Chatbot Worker.
- `*.md`: supporting retrieval briefs for service, learning, contact, and lead-generation responses.

## Retrieval rules

- Use this content only for gabo io chatbot responses.
- Keep answers concise, privacy-aware, and tied to Gabriel Services website content.
- Prefer the entry `answer` for direct responses and append the `leadGenerationPrompt` only when the visitor shows buying intent, asks for help, or needs follow-up.
- Match the active site language first (`en` or `es`) and only fall back to all entries when a language-specific match is not available.
- Do not treat this directory as a public site navigation section.

## TinyML submit gateway

Every Submit/Enter action passes through the browser TinyML sanitation gateway before any upstream request is allowed. The gateway:

- Reads a hidden honeypot field placed before the visible chat input. If the honeypot contains any value, the session is immediately closed, disabled, and blocked without contacting the Cloudflare Worker.
- Decodes and cleans the user message, removes code blocks, inline code, dangerous tags, event-handler attributes, JavaScript/VB/data/file/blob URI vectors, executable browser tokens, SQLi-style fragments, template-injection markers, shell/runtime commands, and dense code-like lines.
- Runs risk scanning before and after sanitation for XSS, code injection, SQLi-style patterns, programming payloads, encoded payloads, and dense code punctuation.
- Blocks the session when dangerous artifacts remain after sanitation or when the original message risk is too high.
- Verifies the same-origin gateway path and chatbot asset context before forwarding only the sanitized message to `/api/ops-online-chat`.

## Cloudflare Chatbot Worker handoff

The browser chatbot continues communicating with the Cloudflare Chatbot Worker at `/api/ops-online-chat`. Each request includes:

- `message`: the end user's sanitized message text from the chat input.
- `lang`: the active website language (`en` or `es`).
- `retrieval.contentDirectory`: `/chatbot/`, so the Worker can identify the dedicated chatbot knowledge directory.
- `retrieval.contentIndexUrl`: the active URL for `gabo-io-content-index.json`.
- `retrieval.sourceOfTruth`: `repo-en-es`, indicating the response context comes from the repository EN/ES index.
- `retrieval.assetId` and `retrieval.origin`: same-origin asset context for Worker-side validation.
- `retrieval.languages`: supported chatbot languages.
- `retrieval.matches`: the top local website-content matches with confidence scores.

If the Worker cannot be reached, `gabo-io.js` answers directly from `gabo-io-content-index.json` so the chatbot remains available on each website page.

## Repo sync worker

Deploy `repo-content-sync-worker.js` as a Cloudflare Worker when you need the repository to push the latest chatbot content into the Cloudflare Chatbot Worker.

### Environment variables

- `REPO_RAW_BASE` (required): raw repository base URL, for example `https://raw.githubusercontent.com/<owner>/<repo>/<branch>`.
- `CONTENT_INDEX_PATH` (optional): path to the content index inside the repo. Defaults to `chatbot/gabo-io-content-index.json`.
- `CF_CHATBOT_WORKER_URL` (optional): full Cloudflare Chatbot Worker URL. If omitted, the worker posts to `/api/ops-online-chat` on the same origin.
- `CHATBOT_SYNC_TOKEN` (optional): bearer token added to sync requests for authenticated Worker-to-Worker updates.
- `SCHEDULED_SYNC_URL` (optional): URL used internally by scheduled events.

### Endpoints

- `GET /health`: confirms the repo worker is online and shows the active content index and chatbot worker URLs.
- `GET /manifest`: fetches the latest repository EN/ES index and returns the complete sync payload without pushing it.
- `POST /sync`: fetches the latest repository EN/ES index and posts it to the Cloudflare Chatbot Worker.

### Scheduled updates

Attach a Cloudflare Cron Trigger to the repo worker to call its scheduled handler. The handler fetches the latest repository content and pushes it to the configured Cloudflare Chatbot Worker, keeping CX and lead-generation retrieval current without manual redeploys.
