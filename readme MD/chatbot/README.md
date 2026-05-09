# gabo io chatbot

This documentation folder centralizes the **gabo io ONLY** Markdown retrieval briefs and chatbot operating notes while the runtime assets remain in `chatbot/`. The browser chatbot still appears on every page through `assets/main.js`, which dynamically loads `chatbot/gabo-io.js`.

## Runtime architecture

- `gabo-io.js`: browser chatbot widget. It renders the gabo io floating action button and chat panel, loads the `chatbot/gabo-io-content-index.json` content index, applies browser TinyML as the first touch, sends only the sanitized visitor message plus grounded retrieval context to the repo worker route mounted at `/api/ops-online-chat`, and falls back to local grounded EN/ES content if the Worker chain is unavailable.
- `gabo-io-content-index.json`: repository-grounded bilingual EN/ES content index used by the chatbot and Worker to answer with confidence and provide relevant source-aware context.
- `repo-content-sync-worker.js`: Cloudflare Worker module for repo-to-chatbot synchronization and interaction bridging. It fetches the latest `gabo-io-content-index.json` directly from the repository raw URL, repeats TinyML checks before repository retrieval for end-user chat, posts configured interactions to the CF Tiny Worker first, and only then hands the validated payload to the Cloudflare Chatbot Worker.
- `*.md`: supporting retrieval briefs for service, learning, contact, and lead-generation responses. The EN/ES domain briefs for Logistics Operations, IT Support, Administrative Back Office, and Customer Relations must each combine their matching `/services/...` page content and `/learning/...` page content so chatbot answers can cover service support and learning guidance alike.

## Retrieval rules

- Use this content only for gabo io chatbot responses.
- Keep answers concise, privacy-aware, and tied to Gabriel Services website content from the matching Services and Learning pages for Logistics Operations, IT Support, Administrative Back Office, and Customer Relations.
- Prefer the entry `answer` for direct responses and append the `leadGenerationPrompt` only when the visitor shows buying intent, asks for help, or needs follow-up.
- Match the active site language first (`en` or `es`) and only fall back to all entries when a language-specific match is not available.
- Do not treat this Markdown documentation folder as a public site navigation section.

## TinyML submit gateway

Every Submit/Enter action passes through the browser TinyML sanitation gateway before any upstream request is allowed. The gateway:

- Reads a hidden honeypot field placed before the visible chat input. If the honeypot contains any value, the session is immediately closed, disabled, and blocked without contacting the Cloudflare Worker.
- Decodes and cleans the user message, removes code blocks, inline code, dangerous tags, event-handler attributes, JavaScript/VB/data/file/blob URI vectors, executable browser tokens, SQLi-style fragments, template-injection markers, shell/runtime commands, and dense code-like lines.
- Runs risk scanning before and after sanitation for XSS, code injection, SQLi-style patterns, programming payloads, encoded payloads, and dense code punctuation.
- Blocks the session when dangerous artifacts remain after sanitation or when the original message risk is too high.
- Verifies the same-origin gateway path and chatbot asset context before forwarding only the sanitized message to the repo worker route mounted at `/api/ops-online-chat`.

## Cloudflare Chatbot Worker handoff

The chatbot interaction order is now fixed as `browser TinyML → repo worker → CF Tiny Worker → Cloudflare Chatbot Worker`. The browser still posts to the public route `/api/ops-online-chat`, but that route should be mounted to the repo worker so repository grounding and server TinyML checks happen before the CF Tiny Worker and final Cloudflare Chatbot Worker. The repo worker can also bridge end-user chat requests through `POST /chat` when deployed in front of the CF Tiny Worker and Cloudflare Chatbot Worker. Each request includes:

- `message`: the end user's sanitized message text from the chat input.
- `lang`: the active website language (`en` or `es`).
- `retrieval.contentDirectory`: `/readme MD/chatbot/`, so the Worker can identify the dedicated chatbot knowledge directory.
- `retrieval.contentIndexUrl`: the active URL for `gabo-io-content-index.json`.
- `retrieval.sourceOfTruth`: `repo-en-es` from the browser widget or `repo-services-learning-md-en-es` from the repo worker, indicating the response context comes from the repository EN/ES index and service/learning Markdown briefs.
- `retrieval.assetId` and `retrieval.origin`: same-origin asset context for Worker-side validation.
- `retrieval.languages`: supported chatbot languages.
- `retrieval.matches`: the top local website-content matches with confidence scores.
- `retrieval.serviceLearningBriefs`: when routed through the repo worker, the Logistics, Customer Relations, Administrative Back Office, and IT Support Markdown briefs grouped by domain and language for CX and lead-generation grounding.
- `tinyMl`: browser first-touch and repo-worker TinyML reports so the CF Tiny Worker and final Chatbot Worker can verify that sanitation occurred before they received the interaction.
- `handoff.order`: the explicit `chatbot-browser-tiny-ml → gabo-io-repo-content-sync-worker → gabo-io-cf-tiny-worker → gabo-io-cloudflare-chatbot-worker` sequence.

If the Worker cannot be reached, `gabo-io.js` answers directly from `gabo-io-content-index.json` so the chatbot remains available on each website page.

## Repo sync worker

Deploy `repo-content-sync-worker.js` as a Cloudflare Worker when you need the repository to push the latest chatbot content into the Cloudflare Chatbot Worker or bridge chatbot/end-user interactions with repo-grounded Markdown context.

### Environment variables

- `REPO_RAW_BASE` (required): raw repository base URL, for example `https://raw.githubusercontent.com/<owner>/<repo>/<branch>`.
- `CONTENT_INDEX_PATH` (optional): path to the content index inside the repo. Defaults to `chatbot/gabo-io-content-index.json`.
- `CF_CHATBOT_TINY_WORKER_URL` or `CF_TINY_WORKER_URL` (optional): CF Tiny Worker URL that receives repo-validated chatbot interactions before the final Cloudflare Chatbot Worker. If configured and it rejects/fails, the repo worker stops the handoff.
- `CF_CHATBOT_WORKER_URL` (optional): full final Cloudflare Chatbot Worker URL. If omitted, the worker posts to `/api/ops-online-chat` on the same origin.
- `CHATBOT_SYNC_TOKEN` (optional): bearer token added to sync requests for authenticated Worker-to-Worker updates.
- `SCHEDULED_SYNC_URL` (optional): URL used internally by scheduled events.

### Endpoints

- `GET /health`: confirms the repo worker is online and shows the active content index, chatbot worker URL, and configured service/learning Markdown paths.
- `GET /briefs`: fetches the Logistics, Customer Relations, Administrative Back Office, and IT Support EN/ES Markdown briefs from the repo raw URL and returns them grouped by domain.
- `GET /manifest`: fetches the latest repository EN/ES index plus service/learning Markdown briefs and returns the complete sync payload without pushing it.
- `POST /sync`: fetches the latest repository EN/ES index plus service/learning Markdown briefs and posts them to the Cloudflare Chatbot Worker.
- `POST /chat` or `POST /api/ops-online-chat`: runs repo-worker TinyML before repository retrieval, forwards a chatbot/end-user interaction to the configured CF Tiny Worker when present, then forwards the validated payload to the Cloudflare Chatbot Worker with the repository index and the four domain Markdown brief groups attached under `retrieval.serviceLearningBriefs`.

### Scheduled updates

Attach a Cloudflare Cron Trigger to the repo worker to call its scheduled handler. The handler fetches the latest repository content and pushes it to the configured Cloudflare Chatbot Worker, keeping CX and lead-generation retrieval current without manual redeploys.
