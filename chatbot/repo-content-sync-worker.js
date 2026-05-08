const DEFAULT_CONTENT_INDEX_PATH = "chatbot/gabo-io-content-index.json";
const DEFAULT_CONTENT_DIRECTORY = "/chatbot/";
const DEFAULT_CHATBOT_WORKER_PATH = "/api/ops-online-chat";

const SERVICE_LEARNING_BRIEFS = [
  {
    domain: "logistics-operations",
    title: "Logistics Operations",
    serviceUrl: "/services/logistics-operations.html",
    learningUrl: "/learning/logistics-operations.html",
    briefs: {
      en: "chatbot/logistics-operations-learning-en.md",
      es: "chatbot/logistics-operations-learning-es.md",
    },
  },
  {
    domain: "customer-relations",
    title: "Customer Relations Operations",
    serviceUrl: "/services/customer-relations.html",
    learningUrl: "/learning/customer-relations.html",
    briefs: {
      en: "chatbot/customer-relations-learning-en.md",
      es: "chatbot/customer-relations-learning-es.md",
    },
  },
  {
    domain: "administrative-backoffice",
    title: "Administrative Back Office",
    serviceUrl: "/services/administrative-backoffice.html",
    learningUrl: "/learning/administrative-backoffice.html",
    briefs: {
      en: "chatbot/administrative-backoffice-en.md",
      es: "chatbot/administrative-backoffice-es.md",
    },
  },
  {
    domain: "it-support",
    title: "IT Support",
    serviceUrl: "/services/it-support.html",
    learningUrl: "/learning/it-support.html",
    briefs: {
      en: "chatbot/it-support-en.md",
      es: "chatbot/it-support-es.md",
    },
  },
];

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

function getRepoRawUrl(env, path) {
  return `${getRepoRawBase(env)}/${String(path || "").replace(/^\/+/, "")}`;
}

function getIndexUrl(env) {
  return getRepoRawUrl(env, env.CONTENT_INDEX_PATH || DEFAULT_CONTENT_INDEX_PATH);
}

function getHealthIndexUrl(env) {
  if (!env.REPO_RAW_BASE) return null;
  return getIndexUrl(env);
}

function getChatbotWorkerUrl(request, env) {
  if (env.CF_CHATBOT_WORKER_URL) return env.CF_CHATBOT_WORKER_URL;
  return new URL(DEFAULT_CHATBOT_WORKER_PATH, request.url).toString();
}

async function fetchRepoAsset(url, accept) {
  const response = await fetch(url, {
    headers: {
      Accept: accept,
      "User-Agent": "gabo-io-repo-content-sync-worker",
    },
    cf: { cacheTtl: 0, cacheEverything: false },
  });

  if (!response.ok) {
    throw new Error(`Unable to fetch ${url}: ${response.status}`);
  }

  return response;
}

async function fetchJson(url) {
  const response = await fetchRepoAsset(url, "application/json");
  return response.json();
}

async function fetchText(url) {
  const response = await fetchRepoAsset(url, "text/markdown, text/plain");
  return response.text();
}

function summarizeEntry(entry) {
  return {
    id: entry.id,
    language: entry.language,
    title: entry.title,
    sourceUrl: entry.sourceUrl,
    sourceUrls: entry.sourceUrls,
    intents: entry.intents,
    answer: entry.answer,
    leadGenerationPrompt: entry.leadGenerationPrompt,
    recommendedCta: entry.recommendedCta,
  };
}

async function fetchServiceLearningBriefs(env) {
  const domains = await Promise.all(
    SERVICE_LEARNING_BRIEFS.map(async (domain) => {
      const localizedBriefs = await Promise.all(
        Object.entries(domain.briefs).map(async ([language, path]) => ({
          language,
          path,
          rawUrl: getRepoRawUrl(env, path),
          markdown: await fetchText(getRepoRawUrl(env, path)),
        })),
      );

      return {
        domain: domain.domain,
        title: domain.title,
        serviceUrl: domain.serviceUrl,
        learningUrl: domain.learningUrl,
        briefs: localizedBriefs,
      };
    }),
  );

  return {
    purpose:
      "Markdown retrieval briefs that connect Services and Learning content for CX responses and lead-generation guidance.",
    contentDirectory: DEFAULT_CONTENT_DIRECTORY,
    domains,
  };
}

async function buildSyncPayload(index, request, env) {
  const entries = Array.isArray(index.entries) ? index.entries : [];
  const languages = Array.from(new Set(entries.map((entry) => entry.language).filter(Boolean))).sort();
  const serviceLearningBriefs = await fetchServiceLearningBriefs(env);

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
    serviceLearningBriefs,
    interactionBridge: {
      endpoint: "/chat",
      chatbotWorkerUrl: getChatbotWorkerUrl(request, env),
      purpose:
        "Forward sanitized chatbot/end-user interactions to the Cloudflare Chatbot Worker with repo-grounded service and learning Markdown context.",
      domains: SERVICE_LEARNING_BRIEFS.map(({ domain, serviceUrl, learningUrl }) => ({
        domain,
        serviceUrl,
        learningUrl,
      })),
    },
    metadata: {
      repository: index.repository || "chatbot/gabo-io-only",
      updated: index.updated,
      workerUrl: new URL(request.url).origin,
    },
  };
}

async function pushToChatbotWorker(request, env) {
  const index = await fetchJson(getIndexUrl(env));
  const payload = await buildSyncPayload(index, request, env);
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
      briefDomains: payload.serviceLearningBriefs.domains.map((domain) => domain.domain),
    },
    chatbotWorkerResponse: responseText.slice(0, 2000),
  };
}

async function readJsonRequest(request) {
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    return {};
  }
  return request.json();
}

async function forwardChatInteraction(request, env) {
  const [body, index, serviceLearningBriefs] = await Promise.all([
    readJsonRequest(request),
    fetchJson(getIndexUrl(env)),
    fetchServiceLearningBriefs(env),
  ]);
  const entries = Array.isArray(index.entries) ? index.entries : [];
  const lang = body.lang || body.language || "en";
  const chatbotWorkerUrl = getChatbotWorkerUrl(request, env);

  const payload = {
    ...body,
    type: "chatbot-end-user-interaction",
    source: "gabriel-services-repo-worker",
    lang,
    retrieval: {
      ...(body.retrieval || {}),
      contentDirectory: DEFAULT_CONTENT_DIRECTORY,
      contentIndexUrl: getIndexUrl(env),
      sourceOfTruth: "repo-services-learning-md-en-es",
      languages: Array.from(new Set(entries.map((entry) => entry.language).filter(Boolean))).sort(),
      serviceLearningBriefs,
      entries: entries.map(summarizeEntry),
    },
  };

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

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: {
      "Content-Type": response.headers.get("Content-Type") || "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
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
      serviceLearningBriefs: SERVICE_LEARNING_BRIEFS.map(({ domain, serviceUrl, learningUrl, briefs }) => ({
        domain,
        serviceUrl,
        learningUrl,
        markdownPaths: briefs,
      })),
      endpoints: ["GET /health", "GET /briefs", "GET /manifest", "POST /sync", "POST /chat"],
    });
  }

  if (request.method === "GET" && url.pathname === "/briefs") {
    return jsonResponse(await fetchServiceLearningBriefs(env));
  }

  if (request.method === "GET" && url.pathname === "/manifest") {
    const index = await fetchJson(getIndexUrl(env));
    return jsonResponse(await buildSyncPayload(index, request, env));
  }

  if (request.method === "POST" && url.pathname === "/sync") {
    const result = await pushToChatbotWorker(request, env);
    return jsonResponse(result, { status: result.ok ? 200 : 502 });
  }

  if (request.method === "POST" && ["/chat", "/interaction"].includes(url.pathname)) {
    return forwardChatInteraction(request, env);
  }

  return jsonResponse(
    {
      ok: false,
      error: "Not found. Use GET /health, GET /briefs, GET /manifest, POST /sync, or POST /chat.",
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
