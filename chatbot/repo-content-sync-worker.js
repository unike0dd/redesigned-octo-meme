const DEFAULT_CONTENT_INDEX_PATH = "chatbot/gabo-io-content-index.json";
const DEFAULT_CONTENT_DIRECTORY = "/chatbot/";
const DEFAULT_CHATBOT_WORKER_PATH = "/api/ops-online-chat";

function jsonResponse(body, init = {}) {
  return new Response(JSON.stringify(body, null, 2), {
    ...init,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...(init.headers || {}),
    },
  });
}

function trimSlash(value) {
  return String(value || "").replace(/\/+$/, "");
}

function getRepoRawBase(env) {
  if (!env.REPO_RAW_BASE) {
    throw new Error("REPO_RAW_BASE is required, for example https://raw.githubusercontent.com/<owner>/<repo>/<branch>");
  }
  return trimSlash(env.REPO_RAW_BASE);
}

function getIndexUrl(env) {
  return `${getRepoRawBase(env)}/${env.CONTENT_INDEX_PATH || DEFAULT_CONTENT_INDEX_PATH}`;
}

function getHealthIndexUrl(env) {
  if (!env.REPO_RAW_BASE) return null;
  return getIndexUrl(env);
}

function getChatbotWorkerUrl(request, env) {
  if (env.CF_CHATBOT_WORKER_URL) return env.CF_CHATBOT_WORKER_URL;
  return new URL(DEFAULT_CHATBOT_WORKER_PATH, request.url).toString();
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "gabo-io-repo-content-sync-worker",
    },
    cf: { cacheTtl: 0, cacheEverything: false },
  });

  if (!response.ok) {
    throw new Error(`Unable to fetch ${url}: ${response.status}`);
  }

  return response.json();
}

function buildSyncPayload(index, request, env) {
  const entries = Array.isArray(index.entries) ? index.entries : [];
  const languages = Array.from(new Set(entries.map((entry) => entry.language).filter(Boolean))).sort();

  return {
    type: "repo-content-sync",
    source: "gabriel-services-repo",
    contentDirectory: DEFAULT_CONTENT_DIRECTORY,
    contentIndexUrl: getIndexUrl(env),
    syncedAt: new Date().toISOString(),
    languages,
    entryCount: entries.length,
    purpose:
      "Keep the Cloudflare Chatbot Worker current with repository-grounded EN and ES CX and lead-generation content.",
    index,
    metadata: {
      repository: index.repository || "chatbot/gabo-io-only",
      updated: index.updated,
      workerUrl: new URL(request.url).origin,
    },
  };
}

async function pushToChatbotWorker(request, env) {
  const index = await fetchJson(getIndexUrl(env));
  const payload = buildSyncPayload(index, request, env);
  const chatbotWorkerUrl = getChatbotWorkerUrl(request, env);

  const response = await fetch(chatbotWorkerUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(env.CHATBOT_SYNC_TOKEN
        ? { Authorization: `Bearer ${env.CHATBOT_SYNC_TOKEN}` }
        : {}),
    },
    body: JSON.stringify(payload),
  });

  const responseText = await response.text();
  return {
    ok: response.ok,
    status: response.status,
    chatbotWorkerUrl,
    payloadSummary: {
      entryCount: payload.entryCount,
      languages: payload.languages,
      contentIndexUrl: payload.contentIndexUrl,
      syncedAt: payload.syncedAt,
    },
    chatbotWorkerResponse: responseText.slice(0, 2000),
  };
}

async function handleRequest(request, env) {
  const url = new URL(request.url);

  if (request.method === "GET" && ["/", "/health"].includes(url.pathname)) {
    return jsonResponse({
      ok: true,
      worker: "gabo-io-repo-content-sync-worker",
      contentDirectory: DEFAULT_CONTENT_DIRECTORY,
      configured: Boolean(env.REPO_RAW_BASE),
      contentIndexUrl: getHealthIndexUrl(env),
      chatbotWorkerUrl: getChatbotWorkerUrl(request, env),
    });
  }

  if (request.method === "GET" && url.pathname === "/manifest") {
    const index = await fetchJson(getIndexUrl(env));
    return jsonResponse(buildSyncPayload(index, request, env));
  }

  if (request.method === "POST" && url.pathname === "/sync") {
    const result = await pushToChatbotWorker(request, env);
    return jsonResponse(result, { status: result.ok ? 200 : 502 });
  }

  return jsonResponse(
    {
      ok: false,
      error: "Not found. Use GET /health, GET /manifest, or POST /sync.",
    },
    { status: 404 },
  );
}

export default {
  fetch(request, env) {
    return handleRequest(request, env).catch((error) =>
      jsonResponse({ ok: false, error: error.message }, { status: 500 }),
    );
  },

  async scheduled(_event, env, ctx) {
    const request = new Request(env.SCHEDULED_SYNC_URL || "https://repo-worker.local/sync", {
      method: "POST",
    });
    ctx.waitUntil(pushToChatbotWorker(request, env));
  },
};
