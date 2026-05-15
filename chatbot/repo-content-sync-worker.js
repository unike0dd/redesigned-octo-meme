const DEFAULT_CONTENT_INDEX_PATH = "chatbot/gabo-io-content-index.json";
const DEFAULT_CONTENT_DIRECTORY = "/readme MD/chatbot/";
const DEFAULT_CHATBOT_WORKER_PATH = "/api/ops-online-chat";
const MAX_SANITIZED_MESSAGE_LENGTH = 220;
const MIN_TYPING_INTERVAL_MS = 45;
const MIN_WORD_LIKE_RATIO = 0.62;

const SERVICE_LEARNING_BRIEFS = [
  {
    domain: "logistics-operations",
    title: "Logistics Operations",
    serviceUrl: "/services/logistics-operations.html",
    learningUrl: "/learning/logistics-operations.html",
    briefs: {
      en: "readme MD/chatbot/logistics-operations-learning-en.md",
      es: "readme MD/chatbot/logistics-operations-learning-es.md",
    },
  },
  {
    domain: "customer-relations",
    title: "Customer Relations Operations",
    serviceUrl: "/services/customer-relations.html",
    learningUrl: "/learning/customer-relations.html",
    briefs: {
      en: "readme MD/chatbot/customer-relations-learning-en.md",
      es: "readme MD/chatbot/customer-relations-learning-es.md",
    },
  },
  {
    domain: "administrative-backoffice",
    title: "Administrative Back Office",
    serviceUrl: "/services/administrative-backoffice.html",
    learningUrl: "/learning/administrative-backoffice.html",
    briefs: {
      en: "readme MD/chatbot/administrative-backoffice-en.md",
      es: "readme MD/chatbot/administrative-backoffice-es.md",
    },
  },
  {
    domain: "it-support",
    title: "IT Support",
    serviceUrl: "/services/it-support.html",
    learningUrl: "/learning/it-support.html",
    briefs: {
      en: "readme MD/chatbot/it-support-en.md",
      es: "readme MD/chatbot/it-support-es.md",
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

function encodeRepoPath(path) {
  return String(path || "")
    .replace(/^\/+/, "")
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

function getRepoRawUrl(env, path) {
  return `${getRepoRawBase(env)}/${encodeRepoPath(path)}`;
}

function getIndexUrl(env) {
  return getRepoRawUrl(env, env.CONTENT_INDEX_PATH || DEFAULT_CONTENT_INDEX_PATH);
}

function getHealthIndexUrl(env) {
  if (!env.REPO_RAW_BASE) return null;
  return getIndexUrl(env);
}

function getChatbotWorkerUrl(request, env) {
  const configured = getEnvValue(env, "EDGE_CHATBOT_SERVICE_URL", "APPROVED_CHATBOT_SERVICE_URL", "LEGACY_CHATBOT_SERVICE_URL");
  return configured ? new URL(configured, request.url).toString() : new URL(DEFAULT_CHATBOT_WORKER_PATH, request.url).toString();
}

function getEnvValue(env, ...keys) {
  for (const key of keys) {
    const value = env?.[key];
    if (value) return value;
  }
  return "";
}

function getEdgeTinyGateUrl(request, env) {
  const configured = getEnvValue(env, "EDGE_TINY_GATE_URL", "EDGE_CHATBOT_TINY_GATE_URL", "LEGACY_CHATBOT_TINY_GATE_URL", "LEGACY_TINY_GATE_URL");
  return configured ? new URL(configured, request.url).toString() : "";
}

function decodeHtmlEntities(value) {
  return String(value || "")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&amp;/gi, "&");
}

function squeezeWhitespace(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function tinyMlScanRisk(value) {
  const text = String(value || "");
  const signatures = [
    { name: "codeBlock", weight: 8, pattern: /```|~~~|<\/?code\b|<\/?pre\b/i },
    { name: "dangerousTag", weight: 10, pattern: /<\/?(?:script|iframe|object|embed|svg|math|link|meta|base|form|input|button|textarea|style|video|audio|source)\b/i },
    { name: "eventHandler", weight: 9, pattern: /\bon[a-z]{3,}\s*=/i },
    { name: "dangerousUri", weight: 9, pattern: /\b(?:javascript|vbscript|data|file|blob):/i },
    { name: "domAccess", weight: 7, pattern: /\b(?:document|window|localStorage|sessionStorage|indexedDB|navigator|location)\s*\./i },
    { name: "execution", weight: 9, pattern: /\b(?:eval|Function|setTimeout|setInterval|fetch|XMLHttpRequest|importScripts|postMessage)\s*\(/i },
    { name: "programmingKeyword", weight: 5, pattern: /\b(?:function|class|const|let|var|import|export|return|async|await|=>|require|module\.exports)\b/i },
    { name: "shellOrRuntime", weight: 8, pattern: /(?:^|\s)(?:npm|pnpm|yarn|node|python|python3|bash|sh|powershell|curl|wget|chmod|sudo|rm\s+-rf|docker|kubectl)\b/i },
    { name: "sqli", weight: 9, pattern: /(?:\bunion\s+select\b|\bselect\b.+\bfrom\b|\binsert\s+into\b|\bdrop\s+table\b|\bdelete\s+from\b|\bor\s+1\s*=\s*1\b|--|\/\*|\*\/)/i },
    { name: "templateInjection", weight: 8, pattern: /(?:\$\{|\{\{|\}\}|<%|%>|#\{|\[\[|\]\])/ },
    { name: "encodedPayload", weight: 5, pattern: /(?:%3c|%3e|%27|%22|&#x?[0-9a-f]+;|\\x[0-9a-f]{2}|\\u[0-9a-f]{4})/i },
  ];
  const matches = signatures.filter((signature) => signature.pattern.test(text));
  const punctuationCount = (text.match(/[{}()[\];=<>`|&$]/g) || []).length;
  const denseCodePunctuation = punctuationCount / Math.max(text.length, 1) > 0.16 && punctuationCount >= 6;
  const codeLikeLines = text.split(/\r?\n/).filter((line) => {
    const trimmed = line.trim();
    if (!trimmed) return false;
    const punctuation = (trimmed.match(/[{}()[\];=<>`|&$]/g) || []).length;
    return punctuation / Math.max(trimmed.length, 1) > 0.12 && punctuation >= 3;
  });
  return {
    riskScore: matches.reduce((score, match) => score + match.weight, 0)
      + codeLikeLines.length * 4
      + (denseCodePunctuation ? 6 : 0)
      + (text.toLowerCase().includes("</") ? 4 : 0),
    matches: matches.map((match) => match.name),
    codeLikeLines: codeLikeLines.length,
    denseCodePunctuation,
  };
}

function tinyMlSanitizeMessage(value) {
  return squeezeWhitespace(decodeHtmlEntities(value)
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/~~~[\s\S]*?~~~/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<\/?(?:script|iframe|object|embed|svg|math|link|meta|base|form|input|button|textarea|style|video|audio|source)[^>]*>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\bon[a-z]{3,}\s*=\s*(?:"[^"]*"|'[^']*'|\S+)/gi, " ")
    .replace(/\b(?:javascript|vbscript|data|file|blob):\S*/gi, " ")
    .replace(/\b(?:eval|Function|setTimeout|setInterval|fetch|XMLHttpRequest|importScripts|postMessage)\s*\([^)]*\)/gi, " ")
    .replace(/(?:\$\{|\{\{|\}\}|<%|%>|#\{|\[\[|\]\])/g, " ")
    .replace(/\b(?:function|class|const|let|var|import|export|module\.exports|require|async|await|return)\b/gi, " ")
    .replace(/\b(?:union\s+select|select\s+.+\s+from|insert\s+into|drop\s+table|delete\s+from|or\s+1\s*=\s*1)\b/gi, " ")
    .replace(/(?:--|\/\*|\*\/)/g, " ")
    .replace(/[^\p{L}\p{N}\s.,?!¿¡'’"()\-:/]/gu, " ")
    .slice(0, MAX_SANITIZED_MESSAGE_LENGTH));
}

function classifyTinyMlInteraction(value) {
  const sanitized = squeezeWhitespace(value);
  const letters = (sanitized.match(/[\p{L}]/gu) || []).length;
  const wordTokens = sanitized.match(/[\p{L}\p{N}][\p{L}\p{N}'’\-]*/gu) || [];
  const allowedCharacters = (sanitized.match(/[\p{L}\p{N}\s.,?!¿¡'’"()\-:/]/gu) || []).length;
  const wordLikeRatio = sanitized.length ? allowedCharacters / sanitized.length : 0;
  const hasQuestion = /[?¿]/.test(sanitized) || /\b(?:what|when|where|why|how|can|could|would|do|does|is|are|cu[aá]l|qu[eé]|c[oó]mo|d[oó]nde|cu[aá]ndo|puede|puedo|tienen?)\b/i.test(sanitized);
  const hasRequest = /\b(?:help|need|want|request|quote|consult|contact|price|pricing|available|service|support|schedule|demo|ayuda|necesito|quiero|solicito|cotizaci[oó]n|consulta|contacto|precio|servicio|soporte|disponible)\b/i.test(sanitized);

  return {
    accepted: letters > 0 && wordTokens.length > 0 && wordLikeRatio >= MIN_WORD_LIKE_RATIO,
    category: hasQuestion ? "question" : hasRequest ? "request" : wordTokens.length <= 5 ? "query" : "words",
    wordCount: wordTokens.length,
    wordLikeRatio: Number(wordLikeRatio.toFixed(2)),
  };
}

function inspectTypingPace(body = {}, sanitized = "") {
  const telemetry = body.typingPace || body.typingTelemetry || {};
  const characterCount = Math.max(0, Number(telemetry.characterCount) || 0);
  const durationMs = Math.max(0, Number(telemetry.durationMs) || 0);
  const averageIntervalMs = Math.max(0, Number(telemetry.averageIntervalMs) || 0);
  const sanitizedLength = String(sanitized || "").length;
  const tooFast = sanitizedLength >= 4 && (characterCount < Math.min(3, sanitizedLength)
    || durationMs < Math.min(650, sanitizedLength * MIN_TYPING_INTERVAL_MS)
    || averageIntervalMs < MIN_TYPING_INTERVAL_MS);

  return {
    accepted: !tooFast,
    characterCount,
    durationMs,
    averageIntervalMs,
    minimumAverageIntervalMs: MIN_TYPING_INTERVAL_MS,
  };
}

function inspectTinyMlInteraction(body = {}) {
  const original = String(body.message || body.prompt || body.text || "");
  const originalRisk = tinyMlScanRisk(original);
  const sanitized = tinyMlSanitizeMessage(original);
  const residualRisk = tinyMlScanRisk(sanitized);
  const classification = classifyTinyMlInteraction(sanitized);
  const typingPace = inspectTypingPace(body, sanitized);
  const honeypotValue = squeezeWhitespace(body.website || body.companyWebsite || body.honeypot || body.hp || "");
  const removedCharacters = Math.max(0, original.length - sanitized.length);
  const removedRatio = original.length ? removedCharacters / original.length : 0;
  const blocked = Boolean(honeypotValue)
    || !sanitized
    || !classification.accepted
    || !typingPace.accepted
    || residualRisk.riskScore >= 7
    || residualRisk.matches.length > 0
    || originalRisk.riskScore >= 18
    || (originalRisk.riskScore >= 10 && removedRatio > 0.35);

  return {
    blocked,
    reason: blocked ? (honeypotValue ? "honeypot" : !typingPace.accepted ? "typing-pace" : !classification.accepted ? "non-conversational" : "tinyml-risk") : "clean",
    sanitized,
    classification,
    typingPace,
    report: {
      original: originalRisk,
      residual: residualRisk,
      removedCharacters,
      removedRatio: Number(removedRatio.toFixed(2)),
    },
  };
}

async function fetchRepoAsset(url, accept) {
  const response = await fetch(url, {
    headers: {
      Accept: accept,
      "User-Agent": "repo-content-gateway",
    },
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


function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function uniqueTerms(value) {
  return Array.from(new Set(normalize(value).split(" ").filter((term) => term.length > 2)));
}

function scoreEntryScope(entry, message) {
  const normalizedMessage = normalize(message);
  const terms = uniqueTerms(message);
  const intents = Array.isArray(entry.intents) ? entry.intents : [];
  const searchable = normalize([
    entry.title,
    entry.sourceUrl,
    entry.answer,
    entry.leadGenerationPrompt,
    entry.recommendedCta,
    intents.join(" "),
  ].filter(Boolean).join(" "));

  let score = 0;
  intents.forEach((intent) => {
    const normalizedIntent = normalize(intent);
    if (!normalizedIntent) return;
    if (normalizedMessage === normalizedIntent) score += 1;
    if (normalizedMessage.includes(normalizedIntent)) score += 0.7;
    if (searchable.includes(normalizedIntent) && normalizedMessage.includes(normalizedIntent.split(" ")[0])) score += 0.2;
  });
  score += Math.min(0.5, terms.filter((term) => searchable.includes(term)).length * 0.08);
  return score;
}

function findRepoGroundedScope(entries, message, lang) {
  const localized = entries.filter((entry) => entry.language === lang);
  const pool = localized.length ? localized : entries;
  const ranked = pool
    .map((entry) => ({ entry, score: scoreEntryScope(entry, message) }))
    .filter((candidate) => candidate.score > 0)
    .sort((a, b) => b.score - a.score);
  const best = ranked[0];

  return {
    accepted: Boolean(best && best.score >= 0.28),
    confidence: best ? Math.min(0.99, Number(best.score.toFixed(2))) : 0,
    matches: ranked.slice(0, 3).map((candidate) => ({
      id: candidate.entry.id,
      title: candidate.entry.title,
      sourceUrl: candidate.entry.sourceUrl,
      confidence: Math.min(0.99, Number(candidate.score.toFixed(2))),
    })),
  };
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
      "Keep the approved chatbot content service current with repository-grounded EN and ES CX and lead-generation content.",
    index,
    serviceLearningBriefs,
    interactionBridge: {
      endpoint: "/chat",
      chatbotWorkerUrl: getChatbotWorkerUrl(request, env),
      edgeTinyGateUrl: getEdgeTinyGateUrl(request, env),
      firstTouch: "browser-safety-gate",
      handoffOrder: [
        "browser-safety-gate",
        "repo-content-gateway",
        "edge-safety-gate",
        "approved-chatbot-service",
      ],
      purpose:
        "Forward sanitized chatbot/end-user interactions to the approved chatbot content service with repo-grounded service and learning Markdown context.",
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
  const body = await readJsonRequest(request);
  const tinyMl = inspectTinyMlInteraction(body);

  if (tinyMl.blocked) {
    return jsonResponse({
      ok: false,
      worker: "repo-content-gateway",
      error: "TinyML blocked the chatbot interaction before repository retrieval.",
      tinyMl,
    }, { status: 422 });
  }

  const [index, serviceLearningBriefs] = await Promise.all([
    fetchJson(getIndexUrl(env)),
    fetchServiceLearningBriefs(env),
  ]);
  const entries = Array.isArray(index.entries) ? index.entries : [];
  const lang = body.lang || body.language || "en";
  const repoScope = findRepoGroundedScope(entries, tinyMl.sanitized, lang);

  if (!repoScope.accepted) {
    return jsonResponse({
      ok: false,
      worker: "repo-content-gateway",
      error: "The interaction is outside approved Gabriel Services website content.",
      tinyMl,
      repoScope,
    }, { status: 422 });
  }

  const chatbotWorkerUrl = getChatbotWorkerUrl(request, env);
  const edgeTinyGateUrl = getEdgeTinyGateUrl(request, env);

  const payload = {
    ...body,
    message: tinyMl.sanitized,
    type: "chatbot-end-user-interaction",
    source: "gabriel-services-repo-worker",
    lang,
    tinyMl: {
      firstTouch: "browser-safety-gate",
      repoWorkerCheck: "repo-content-gateway-tinyml-v1",
      ...tinyMl,
    },
    handoff: {
      ...(body.handoff || {}),
      order: [
        "browser-safety-gate",
        "repo-content-gateway",
        "edge-safety-gate",
        "approved-chatbot-service",
      ],
      current: "repo-content-gateway",
      next: edgeTinyGateUrl ? "edge-safety-gate" : "approved-chatbot-service",
      final: "approved-chatbot-service",
    },
    retrieval: {
      ...(body.retrieval || {}),
      contentDirectory: DEFAULT_CONTENT_DIRECTORY,
      contentIndexUrl: getIndexUrl(env),
      sourceOfTruth: "repo-services-learning-md-en-es",
      languages: Array.from(new Set(entries.map((entry) => entry.language).filter(Boolean))).sort(),
      serviceLearningBriefs,
      scope: repoScope,
      entries: entries.map(summarizeEntry),
    },
  };

  if (edgeTinyGateUrl) {
    const tinyResponse = await fetch(edgeTinyGateUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-Gabo-Next-Service": chatbotWorkerUrl,
        ...(env.CHATBOT_SYNC_TOKEN
          ? { Authorization: `Bearer ${env.CHATBOT_SYNC_TOKEN}` }
          : {}),
      },
      body: JSON.stringify(payload),
    });

    if (!tinyResponse.ok) {
      return jsonResponse({
        ok: false,
        worker: "repo-content-gateway",
        error: "Edge safety gate rejected or failed the chatbot handoff.",
        status: tinyResponse.status,
        edgeTinyGateResponse: (await tinyResponse.text()).slice(0, 2000),
      }, { status: 502 });
    }
  }

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
      "X-Gabo-Handoff-Order": payload.handoff.order.join(" > "),
    },
  });
}

async function handleRequest(request, env) {
  const url = new URL(request.url);

  if (request.method === "GET" && ["/", "/health"].includes(url.pathname)) {
    return jsonResponse({
      ok: true,
      gateway: "gabo-services-chatbot-gateway",
      publicDomain: "https://chatbot.gabo.services",
      configured: Boolean(env.REPO_RAW_BASE),
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

  if (request.method === "POST" && ["/chat", "/interaction", DEFAULT_CHATBOT_WORKER_PATH].includes(url.pathname)) {
    return forwardChatInteraction(request, env);
  }

  return jsonResponse(
    {
      ok: false,
      error: `Not found. Use GET /health, GET /briefs, GET /manifest, POST /sync, POST /chat, or POST ${DEFAULT_CHATBOT_WORKER_PATH}.`,
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
