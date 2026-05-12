const PAGE_NAME = "careers";
const PAGE_ENV_PREFIX = PAGE_NAME.toUpperCase();
const ACCEPTED_PATHS = new Set(["/api/careers", "/", "/health"]);
const RESPONSE_HEADERS = {
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
  "Content-Security-Policy":
    "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self' https://gabo.services https://www.gabo.services https://contacto.gabo.services; upgrade-insecure-requests; block-all-mixed-content; script-src 'self' https://static.cloudflareinsights.com https://challenges.cloudflare.com; style-src 'self'; img-src 'self' data: blob: https:; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https://gabo.services https://www.gabo.services https://contacto.gabo.services; frame-src 'self' https://challenges.cloudflare.com; worker-src 'self'; manifest-src 'self'; media-src 'self';",
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "X-XSS-Protection": "0",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Cross-Origin-Resource-Policy": "same-site",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Permissions-Policy":
    "accelerometer=(), ambient-light-sensor=(), autoplay=(), battery=(), bluetooth=(), browsing-topics=(), camera=(), clipboard-read=(), clipboard-write=(self), display-capture=(), encrypted-media=(), fullscreen=(self), gamepad=(), geolocation=(), gyroscope=(), hid=(), idle-detection=(), interest-cohort=(), local-fonts=(), magnetometer=(), microphone=(), midi=(), otp-credentials=(), payment=(), picture-in-picture=(), publickey-credentials-create=(), publickey-credentials-get=(self), screen-wake-lock=(), serial=(), speaker-selection=(), storage-access=(), usb=(), web-share=(), xr-spatial-tracking=()",
  "X-Permitted-Cross-Domain-Policies": "none",
  "X-DNS-Prefetch-Control": "off",
  "X-Download-Options": "noopen",
  "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS, POST",
  "Access-Control-Allow-Headers": "Content-Type, X-Gabo-Origin, X-Gabo-Source, X-Gabo-Asset-ID, X-Gabo-Repo-ID, X-Gabo-Session-Id, X-Gabo-Nonce, X-Gabo-Integrity-SHA256, X-Gabo-Repo-Sanitized-SHA256",
  Vary: "Origin",
};
const ALLOWED_ORIGINS = new Set([
  "https://www.gabo.services",
  "https://gabo.services",
  "https://unike0dd.github.io",
]);
const MAX_FIELD_LENGTH = 2000;
const RISK_THRESHOLD = 3;
const RESIDUAL_THRESHOLD = 1;
const RISK_SIGNATURES = [
  { label: "script-tag", weight: 4, pattern: /<\s*\/?\s*script\b/gi },
  {
    label: "dangerous-html-tag",
    weight: 3,
    pattern:
      /<\s*\/?\s*(?:iframe|object|embed|applet|meta|link|base|form|input|button|svg|math|template|style)\b/gi,
  },
  { label: "event-handler", weight: 3, pattern: /\bon[a-z]{3,}\s*=/gi },
  { label: "active-uri", weight: 4, pattern: /\b(?:javascript|vbscript|data)\s*:/gi },
  { label: "html-tag", weight: 2, pattern: /<\/?[a-z][\s\S]*?>/gi },
  { label: "code-block", weight: 4, pattern: /```[\s\S]*?```|~~~[\s\S]*?~~~/g },
  { label: "js-code-token", weight: 3, pattern: /\b(?:eval|Function|setTimeout|setInterval|fetch|XMLHttpRequest|document\.|window\.|localStorage|sessionStorage|import\s|require\s*\(|process\.)\b/gi },
  { label: "sql-injection", weight: 3, pattern: /(?:\bunion\s+(?:all\s+)?select\b|\bselect\b[\s\S]{0,80}\bfrom\b|\binsert\s+into\b|\bdelete\s+from\b|\bdrop\s+table\b|--\s*$)/gim },
  { label: "shell-command", weight: 3, pattern: /\b(?:curl|wget|bash|powershell|cmd\.exe|rm\s+-rf)\b/gi },
];

function getEnvValue(env, ...keys) {
  for (const key of keys) {
    const value = env?.[key];
    if (value) return value;
  }
  return "";
}

function getOptionalWorkerUrl(request, env, ...keys) {
  const configured = getEnvValue(env, ...keys);
  return configured ? new URL(configured, request.url).toString() : "";
}

function corsOrigin(request) {
  const origin = request.headers.get("Origin") || "";
  return ALLOWED_ORIGINS.has(origin) ? origin : "https://www.gabo.services";
}

function withHeaders(request, headers = {}) {
  return {
    ...RESPONSE_HEADERS,
    "Access-Control-Allow-Origin": corsOrigin(request),
    "Cache-Control": "no-store",
    ...headers,
  };
}

function jsonResponse(request, body, init = {}) {
  return new Response(JSON.stringify(body, null, 2), {
    ...init,
    headers: withHeaders(request, {
      "Content-Type": "application/json; charset=utf-8",
      ...(init.headers || {}),
    }),
  });
}

function decodeHtmlEntities(value) {
  return String(value || "")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&amp;/gi, "&");
}

function threatSummary(value) {
  const text = decodeHtmlEntities(value);
  const reasons = [];
  const score = RISK_SIGNATURES.reduce((total, signature) => {
    const matches = text.match(signature.pattern);
    if (!matches) return total;
    reasons.push(signature.label);
    return total + matches.length * signature.weight;
  }, 0);
  const punctuation = text.replace(/[\w\s.,'"@:+/#-]/g, "").length;
  const density = text.length ? punctuation / text.length : 0;
  if (text.length > 24 && density > 0.22) reasons.push("punctuation-density");
  return { score: score + (text.length > 24 && density > 0.22 ? 2 : 0), reasons: Array.from(new Set(reasons)) };
}

function cleanseText(value) {
  return decodeHtmlEntities(value)
    .split(/\r?\n/)
    .filter((line) => !/^\s*(?:const|let|var|function|class|def|import|export|return|if|for|while)\b/i.test(line))
    .join(" ")
    .replace(/```[\s\S]*?```|~~~[\s\S]*?~~~/g, " ")
    .replace(/<\s*(script|style|iframe|object|embed|applet|svg|math|template)[\s\S]*?<\s*\/\s*\1\s*>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\b(?:javascript|vbscript|data)\s*:[^\s,;)]*/gi, " ")
    .replace(/\bon[a-z]{3,}\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/gi, " ")
    .replace(/(?:\/\*[\s\S]*?\*\/|<!--|-->|--\s*$)/gm, " ")
    .replace(/[<>`{}()[\];|\\]/g, " ")
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_FIELD_LENGTH);
}

function scanField(value) {
  const raw = String(value || "");
  const cleaned = cleanseText(raw);
  const rawThreat = threatSummary(raw);
  const residualThreat = threatSummary(cleaned);
  return {
    cleaned,
    threatScore: rawThreat.score,
    residualThreatScore: residualThreat.score,
    removedCharacters: Math.max(raw.length - cleaned.length, 0),
    reasons: Array.from(new Set([...rawThreat.reasons, ...residualThreat.reasons])),
    blocked: rawThreat.score >= RISK_THRESHOLD || residualThreat.score >= RESIDUAL_THRESHOLD,
  };
}

function scanPayload(payload = {}) {
  const cleaned = {};
  const report = Object.entries(payload).map(([key, value]) => {
    const result = scanField(value);
    cleaned[key] = result.cleaned;
    return { key, ...result };
  });
  return { cleaned, report, blocked: report.some((entry) => entry.blocked) };
}

function stableStringify(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  return `{${Object.keys(value)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`)
    .join(",")}}`;
}

async function sha256Hex(value) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(String(value || "")));
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function timingSafeEqual(left, right) {
  const a = String(left || "");
  const b = String(right || "");
  if (!a || !b || a.length !== b.length) return false;
  let diff = 0;
  for (let index = 0; index < a.length; index += 1) {
    diff |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }
  return diff === 0;
}

function getRequestOrigin(request, body) {
  return request.headers.get("Origin") || request.headers.get("X-Gabo-Origin") || body?.origin || "";
}

function getClientSession(request, body) {
  const bodySession = body?.clientSession && typeof body.clientSession === "object" ? body.clientSession : {};
  return {
    sessionId: request.headers.get("X-Gabo-Session-Id") || bodySession.id || bodySession.sessionId || "",
    nonce: request.headers.get("X-Gabo-Nonce") || bodySession.nonce || "",
  };
}

async function verifyClientIntegrity(request, body, cleanedFields) {
  const clientFingerprint = body.clientIntegrity?.sha256 || body.integritySha256 || request.headers.get("X-Gabo-Integrity-SHA256") || "";
  if (!clientFingerprint) {
    return { ok: false, message: "Client integrity SHA-256 is required." };
  }

  const session = getClientSession(request, body);
  const origin = getRequestOrigin(request, body);
  const source = body.src || body.source || request.headers.get("X-Gabo-Source") || `/${PAGE_NAME}.html`;

  if (session.sessionId && session.nonce) {
    const expectedBase = {
      route: PAGE_NAME,
      origin,
      source,
      session_id: session.sessionId,
      nonce: session.nonce,
      cleanedFields,
    };
    const expectedSha256 = await sha256Hex(stableStringify(expectedBase));
    return {
      ok: timingSafeEqual(clientFingerprint, expectedSha256),
      message: "Client integrity SHA-256 mismatch.",
      clientFingerprint,
      expectedSha256,
      fingerprintBase: "route+origin+source+session_id+nonce+cleanedFields",
      session,
    };
  }

  const legacySha256 = await sha256Hex(JSON.stringify(cleanedFields));
  return {
    ok: timingSafeEqual(clientFingerprint, legacySha256),
    message: "Client integrity SHA-256 mismatch.",
    clientFingerprint,
    expectedSha256: legacySha256,
    fingerprintBase: "legacy-cleanedFields-json",
    session,
  };
}

function assertOrigin(request, env) {
  const origin = request.headers.get("Origin") || request.headers.get("X-Gabo-Origin") || "";
  const extraOrigins = String(env.EXTRA_ALLOWED_ORIGINS || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const allowed = new Set([...ALLOWED_ORIGINS, ...extraOrigins]);
  if (origin && !allowed.has(origin)) {
    throw new Error(`Origin is not allowed for ${PAGE_NAME} repo worker.`);
  }
}

async function postJsonWorker(url, envelope, token, userAgent) {
  if (!url) return { forwarded: false, reason: "worker URL not configured" };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "User-Agent": userAgent,
      "X-Gabo-Origin": envelope.origin || "",
      "X-Gabo-Source": envelope.src || envelope.source || `/${PAGE_NAME}.html`,
      "X-Gabo-Asset-ID": envelope.assetId || "",
      "X-Gabo-Repo-ID": envelope.repoId || "",
      "X-Gabo-Session-Id": envelope.clientSession?.id || "",
      "X-Gabo-Nonce": envelope.clientSession?.nonce || "",
      "X-Gabo-Integrity-SHA256": envelope.serverTinyMl?.clientFingerprint || envelope.integritySha256 || "",
      "X-Gabo-Repo-Sanitized-SHA256": envelope.serverTinyMl?.repoSanitizedFingerprint || "",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(envelope),
  });
  const responseText = await response.text();
  let responseJson = null;
  try {
    responseJson = responseText ? JSON.parse(responseText) : null;
  } catch (error) {
    responseJson = null;
  }

  return {
    forwarded: response.ok,
    status: response.status,
    url,
    response: responseText.slice(0, 1000),
    envelope: responseJson?.envelope || responseJson?.sanitizedEnvelope || responseJson?.payload || null,
  };
}

async function forwardToCfTinyWorker(request, env, envelope) {
  const url = getOptionalWorkerUrl(
    request,
    env,
    `${PAGE_ENV_PREFIX}_CF_TINY_WORKER_URL`,
    "CF_TINY_WORKER_URL",
  );
  return postJsonWorker(
    url,
    {
      ...envelope,
      handoff: {
        ...(envelope.handoff || {}),
        current: `gabo-${PAGE_NAME}-repo-worker`,
        next: `gabo-${PAGE_NAME}-cf-tiny-worker`,
        final: `gabo-${PAGE_NAME}-cf-worker`,
      },
    },
    getEnvValue(env, `${PAGE_ENV_PREFIX}_CF_TINY_WORKER_TOKEN`, "CF_TINY_WORKER_TOKEN"),
    `gabo-${PAGE_NAME}-repo-worker-to-cf-tiny`,
  );
}

async function forwardToCfWorker(request, env, envelope) {
  const url = getOptionalWorkerUrl(
    request,
    env,
    `${PAGE_ENV_PREFIX}_CF_WORKER_URL`,
    "CF_WORKER_URL",
  );
  return postJsonWorker(
    url,
    envelope,
    getEnvValue(env, `${PAGE_ENV_PREFIX}_CF_WORKER_TOKEN`, "CF_WORKER_TOKEN"),
    `gabo-${PAGE_NAME}-repo-worker-to-cf-worker`,
  );
}

async function forwardToRepository(env, envelope) {
  if (!env.GITHUB_TOKEN) {
    return { forwarded: false, reason: "GITHUB_TOKEN not configured" };
  }
  const repository = env.GITHUB_REPOSITORY || envelope.repoId || "unike0dd/redesigned-octo-meme";
  const eventType = env.GITHUB_EVENT_TYPE || `${PAGE_NAME}-form-submission`;
  const response = await fetch(`https://api.github.com/repos/${repository}/dispatches`, {
    method: "POST",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      "Content-Type": "application/json",
      "User-Agent": `gabo-${PAGE_NAME}-repo-worker`,
      "X-GitHub-Api-Version": "2022-11-28",
    },
    body: JSON.stringify({ event_type: eventType, client_payload: envelope }),
  });
  return { forwarded: response.ok, status: response.status, response: (await response.text()).slice(0, 1000) };
}

async function handlePost(request, env) {
  assertOrigin(request, env);
  const body = await request.json();
  const scan = scanPayload(body.payload || {});
  if (scan.blocked) {
    return jsonResponse(request, {
      ok: false,
      worker: `gabo-${PAGE_NAME}-repo-worker`,
      error: "TinyML server cleanse blocked residual risk.",
      report: scan.report,
    }, { status: 422 });
  }
  const integrity = await verifyClientIntegrity(request, body, scan.cleaned);
  if (!integrity.ok) {
    return jsonResponse(request, {
      ok: false,
      worker: `gabo-${PAGE_NAME}-repo-worker`,
      error: integrity.message,
    }, { status: 403 });
  }
  const repoSanitizedFingerprint = await sha256Hex(stableStringify({
    type: body.type || `${PAGE_NAME}-form-submission`,
    route: PAGE_NAME,
    repoId: body.repoId || "",
    assetId: body.assetId || "",
    src: body.src || body.source || request.headers.get("X-Gabo-Source") || `/${PAGE_NAME}.html`,
    origin: getRequestOrigin(request, body),
    payload: scan.cleaned,
    security: {
      lane: PAGE_NAME,
      session_id: integrity.session.sessionId,
    },
  }));
  const envelope = {
    ...body,
    payload: scan.cleaned,
    clientSession: {
      ...(body.clientSession || {}),
      id: integrity.session.sessionId || body.clientSession?.id,
      nonce: integrity.session.nonce || body.clientSession?.nonce,
    },
    serverTinyMl: {
      page: PAGE_NAME,
      policy: `${PAGE_NAME}-repo-worker-cleanse-v1`,
      report: scan.report,
      serverFingerprint: integrity.expectedSha256,
      clientFingerprint: integrity.clientFingerprint,
      integrityMatched: true,
      fingerprintBase: integrity.fingerprintBase,
      repoSanitizedFingerprint,
    },
    receivedAt: new Date().toISOString(),
  };
  const integrityMatched = true;
  const cfTinyWorkerResult = await forwardToCfTinyWorker(request, env, envelope);
  if (cfTinyWorkerResult.url && !cfTinyWorkerResult.forwarded) {
    return jsonResponse(request, {
      ok: false,
      worker: `gabo-${PAGE_NAME}-repo-worker`,
      error: "CF Tiny Worker rejected or failed the TinyML handoff.",
      cfTinyWorkerResult,
      serverTinyMl: envelope.serverTinyMl,
    }, { status: 502 });
  }
  const tinyValidatedEnvelope = cfTinyWorkerResult.envelope || envelope;
  const cfWorkerResult = await forwardToCfWorker(request, env, tinyValidatedEnvelope);
  const shouldForwardRepository = !cfWorkerResult.forwarded || env.FORWARD_TO_REPOSITORY_AFTER_CF === "true";
  const repositoryResult = shouldForwardRepository
    ? await forwardToRepository(env, tinyValidatedEnvelope)
    : { forwarded: false, reason: "CF Worker accepted the TinyML-validated handoff" };

  return jsonResponse(request, {
    ok: true,
    worker: `gabo-${PAGE_NAME}-repo-worker`,
    flow: [
      `${PAGE_NAME}-browser-tiny-ml`,
      `gabo-${PAGE_NAME}-repo-worker`,
      `gabo-${PAGE_NAME}-cf-tiny-worker`,
      `gabo-${PAGE_NAME}-cf-worker`,
    ],
    integrityMatched,
    cfTinyWorkerResult,
    cfWorkerResult,
    repositoryResult,
    serverTinyMl: envelope.serverTinyMl,
  });
}

async function handleRequest(request, env) {
  const url = new URL(request.url);
  if (!ACCEPTED_PATHS.has(url.pathname)) {
    return jsonResponse(request, { ok: false, error: `Use POST /api/careers or GET /health for ${PAGE_NAME}.` }, { status: 404 });
  }
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: withHeaders(request) });
  if (request.method === "GET" || request.method === "HEAD") {
    return jsonResponse(request, {
      ok: true,
      worker: `gabo-${PAGE_NAME}-repo-worker`,
      page: PAGE_NAME,
      acceptedPaths: Array.from(ACCEPTED_PATHS),
      headersPolicy: RESPONSE_HEADERS,
      firstTouch: `${PAGE_NAME}-browser-tiny-ml`,
      handoffOrder: [
        `${PAGE_NAME}-browser-tiny-ml`,
        `gabo-${PAGE_NAME}-repo-worker`,
        `gabo-${PAGE_NAME}-cf-tiny-worker`,
        `gabo-${PAGE_NAME}-cf-worker`,
      ],
      cfTinyWorkerConfigured: Boolean(getEnvValue(env, `${PAGE_ENV_PREFIX}_CF_TINY_WORKER_URL`, "CF_TINY_WORKER_URL")),
      cfWorkerConfigured: Boolean(getEnvValue(env, `${PAGE_ENV_PREFIX}_CF_WORKER_URL`, "CF_WORKER_URL")),
    });
  }
  if (request.method === "POST") return handlePost(request, env);
  return jsonResponse(request, { ok: false, error: "Method not allowed" }, { status: 405 });
}

export default {
  fetch(request, env) {
    return handleRequest(request, env || {}).catch((error) =>
      jsonResponse(request, { ok: false, worker: `gabo-${PAGE_NAME}-repo-worker`, error: error.message }, { status: 500 }),
    );
  },
};
