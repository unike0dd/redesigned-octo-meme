const PAGE_NAME = "contact";
const WORKER_NAME = "gabo-contact-repo-worker";

const ACCEPTED_PATHS = new Set([
  "/",
  "/health",
  "/api/contact"
]);

const EXPECTED_ASSET_ID = "redesigned-octo-meme-contact";
const EXPECTED_REPO_ID = "CONTACTO";

const DEFAULT_CF_TINYML_URL = "https://contact-guard.gabo.services/__ops/contact/tinyml";

const MAX_BODY_BYTES = 24 * 1024;
const MAX_FIELD_LENGTH = 5000;
const MAX_DEPTH = 8;
const MAX_RISK_SCORE = 55;

const HEADER_POLICY_ID = "redesigned-octo-meme-contact-headers-v1";
const REPO_GATE_VALUE = "contact-repo-worker";

const ALLOWED_ORIGINS = new Set([
  "https://unike0dd.github.io",
  "https://www.gabo.services",
  "https://gabo.services"
]);

const RESPONSE_HEADERS = {
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
  "Content-Security-Policy": [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "form-action 'self' https://gabo.services https://www.gabo.services",
    "upgrade-insecure-requests",
    "block-all-mixed-content",
    "script-src 'self' https://static.cloudflareinsights.com https://challenges.cloudflare.com",
    "style-src 'self'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data: https://fonts.gstatic.com",
    "connect-src 'self' https://gabo.services https://www.gabo.services https://demo.gabo.services https://contact-guard.gabo.services https://contacto.gabo.services",
    "frame-src 'self' https://challenges.cloudflare.com",
    "worker-src 'self'",
    "manifest-src 'self'",
    "media-src 'self'"
  ].join("; "),
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "X-XSS-Protection": "0",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Cross-Origin-Resource-Policy": "same-site",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Permissions-Policy": [
    "accelerometer=()",
    "ambient-light-sensor=()",
    "autoplay=()",
    "battery=()",
    "bluetooth=()",
    "browsing-topics=()",
    "camera=()",
    "clipboard-read=()",
    "clipboard-write=(self)",
    "display-capture=()",
    "encrypted-media=()",
    "fullscreen=(self)",
    "gamepad=()",
    "geolocation=()",
    "gyroscope=()",
    "hid=()",
    "idle-detection=()",
    "interest-cohort=()",
    "local-fonts=()",
    "magnetometer=()",
    "microphone=()",
    "midi=()",
    "otp-credentials=()",
    "payment=()",
    "picture-in-picture=()",
    "publickey-credentials-create=()",
    "publickey-credentials-get=(self)",
    "screen-wake-lock=()",
    "serial=()",
    "speaker-selection=()",
    "storage-access=()",
    "usb=()",
    "web-share=()",
    "xr-spatial-tracking=()"
  ].join(", "),
  "X-Permitted-Cross-Domain-Policies": "none",
  "X-DNS-Prefetch-Control": "off",
  "X-Download-Options": "noopen",
  "Cache-Control": "no-store, no-transform",
  "Vary": "Origin"
};

const ALLOWED_REQUEST_HEADERS = [
  "Content-Type",
  "X-Gabo-Origin",
  "X-Gabo-Source",

  "X-Ops-Asset-Id",
  "X-Gabo-Repo-Id",
  "X-Gabo-Session-Id",
  "X-Gabo-Nonce",
  "X-Gabo-Integrity-SHA256",

  "X-Gabo-Asset-ID",
  "X-Gabo-Repo-ID"
];

const RISK_PATTERNS = [
  "javascript:",
  "data:text/html",
  "<script",
  "</script",
  "<iframe",
  "<object",
  "<embed",
  "<svg",
  "<math",
  "srcdoc=",
  "onerror=",
  "onload=",
  "onclick=",
  "document.",
  "window.",
  "document.cookie",
  "localstorage",
  "sessionstorage",
  "eval(",
  "new function",
  "function(",
  "constructor",
  "__proto__",
  "prototype",
  "globalthis",
  "process.",
  "require(",
  "import ",
  "export ",
  "select * from",
  "union select",
  "drop table",
  "../",
  "${",
  "{{",
  "}}"
];

export default {
  async fetch(request, env) {
    try {
      return await handleRequest(request, env || {});
    } catch (error) {
      return jsonResponse(request, 500, {
        ok: false,
        worker: WORKER_NAME,
        page: PAGE_NAME,
        message: "Contact repo worker failed.",
        error: cleanText(error && error.message ? error.message : error)
      });
    }
  }
};

async function handleRequest(request, env) {
  const url = new URL(request.url);

  if (!ACCEPTED_PATHS.has(url.pathname)) {
    return jsonResponse(request, 404, {
      ok: false,
      worker: WORKER_NAME,
      message: "Route not found."
    });
  }

  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: responseHeaders(request)
    });
  }

  if (request.method === "GET" || request.method === "HEAD") {
    return jsonResponse(request, 200, {
      ok: true,
      worker: WORKER_NAME,
      page: PAGE_NAME,
      accepted_paths: Array.from(ACCEPTED_PATHS),
      next_hop: "cf-tinyml-contact",
      header_policy: HEADER_POLICY_ID
    });
  }

  if (request.method !== "POST") {
    return jsonResponse(request, 405, {
      ok: false,
      worker: WORKER_NAME,
      message: "Method not allowed."
    });
  }

  if (url.pathname !== "/api/contact") {
    return jsonResponse(request, 404, {
      ok: false,
      worker: WORKER_NAME,
      message: "Use POST /api/contact."
    });
  }

  return handleContactPost(request, env);
}

async function handleContactPost(request, env) {
  const origin = getRequestOrigin(request);
  const originCheck = validateOrigin(origin, env);

  if (!originCheck.ok) {
    return jsonResponse(request, 403, {
      ok: false,
      worker: WORKER_NAME,
      message: "Origin not allowed."
    });
  }

  const identity = validateIdentity(request);

  if (!identity.ok) {
    return jsonResponse(request, 403, {
      ok: false,
      worker: WORKER_NAME,
      message: identity.message
    });
  }

  const contentType = request.headers.get("Content-Type") || "";

  if (!contentType.toLowerCase().includes("application/json")) {
    return jsonResponse(request, 415, {
      ok: false,
      worker: WORKER_NAME,
      message: "Content-Type must be application/json."
    });
  }

  const declaredLength = Number(request.headers.get("Content-Length") || "0");

  if (declaredLength && declaredLength > MAX_BODY_BYTES) {
    return jsonResponse(request, 413, {
      ok: false,
      worker: WORKER_NAME,
      message: "Contact payload is too large."
    });
  }

  const rawBody = await request.text().catch(() => "");

  if (!rawBody) {
    return jsonResponse(request, 400, {
      ok: false,
      worker: WORKER_NAME,
      message: "Empty request body."
    });
  }

  const bodySize = new TextEncoder().encode(rawBody).length;

  if (bodySize > MAX_BODY_BYTES) {
    return jsonResponse(request, 413, {
      ok: false,
      worker: WORKER_NAME,
      message: "Contact payload is too large."
    });
  }

  let incoming;

  try {
    incoming = JSON.parse(rawBody);
  } catch {
    return jsonResponse(request, 400, {
      ok: false,
      worker: WORKER_NAME,
      message: "Invalid JSON body."
    });
  }

  const sessionCheck = validateSessionHeaders(request, incoming);

  if (!sessionCheck.ok) {
    return jsonResponse(request, 403, {
      ok: false,
      worker: WORKER_NAME,
      message: sessionCheck.message
    });
  }

  const cleaned = cleanDeep(incoming);
  const inspection = inspectPayload(cleaned);

  if (!inspection.ok) {
    return jsonResponse(request, 400, {
      ok: false,
      worker: WORKER_NAME,
      message: "Contact repo worker rejected the payload during security inspection.",
      flags: inspection.flags
    });
  }

  const integrity = await verifyClientIntegrity(request, cleaned, origin, sessionCheck);

  if (!integrity.ok) {
    return jsonResponse(request, 403, {
      ok: false,
      worker: WORKER_NAME,
      message: integrity.message
    });
  }

  const canonical = buildContactPackage(cleaned, {
    origin,
    assetId: identity.assetId,
    repoId: identity.repoId,
    sessionId: sessionCheck.sessionId,
    nonce: sessionCheck.nonce,
    clientIntegritySha256: integrity.clientSha256,
    repoIntegritySha256: integrity.repoSha256,
    inspection
  });

  const validation = validateContact(canonical);

  if (!validation.ok) {
    return jsonResponse(request, 400, {
      ok: false,
      worker: WORKER_NAME,
      message: validation.message
    });
  }

  const forwardResult = await forwardToCfTinyMl(request, env, canonical, {
    origin,
    assetId: identity.assetId,
    repoId: identity.repoId,
    sessionId: sessionCheck.sessionId,
    nonce: sessionCheck.nonce,
    clientIntegritySha256: integrity.clientSha256,
    repoIntegritySha256: integrity.repoSha256
  });

  if (!forwardResult.ok) {
    return jsonResponse(request, forwardResult.status || 502, {
      ok: false,
      worker: WORKER_NAME,
      message: forwardResult.message || "Contact repo worker could not complete the CF TinyML handoff."
    });
  }

  return jsonResponse(request, 200, {
    ok: true,
    worker: WORKER_NAME,
    message: "Contact repo worker accepted and forwarded the cleaned submission.",
    request_id: canonical.request_id,
    next_hop: "cf-tinyml-contact"
  });
}

async function forwardToCfTinyMl(request, env, canonical, ctx) {
  const targetUrl = cleanText(env.CONTACT_CF_TINYML_URL || DEFAULT_CF_TINYML_URL);

  if (!targetUrl) {
    return {
      ok: false,
      status: 500,
      message: "Contact CF TinyML URL is not configured."
    };
  }

  const sharedSecret = cleanText(env.CONTACT_REPO_TO_TINYML_SECRET || "");

  if (!sharedSecret) {
    return {
      ok: false,
      status: 500,
      message: "CONTACT_REPO_TO_TINYML_SECRET must be configured on the repo worker only."
    };
  }

  const headers = {
    "Content-Type": "application/json",
    "Accept": "application/json",

    "X-Gabo-Origin": ctx.origin,
    "X-Gabo-Source": "contact.html",
    "X-Ops-Asset-Id": ctx.assetId,
    "X-Gabo-Repo-Id": ctx.repoId,
    "X-Gabo-Session-Id": ctx.sessionId,
    "X-Gabo-Nonce": ctx.nonce,
    "X-Gabo-Integrity-SHA256": ctx.clientIntegritySha256,
    "X-Gabo-Repo-Integrity-SHA256": ctx.repoIntegritySha256,
    "X-Gabo-Headers-Policy": HEADER_POLICY_ID,
    "X-Gabo-Repo-Gate": REPO_GATE_VALUE,
    "X-Gabo-Repo-To-TinyML-Secret": sharedSecret
  };

  const response = await fetch(targetUrl, {
    method: "POST",
    headers,
    body: JSON.stringify(canonical)
  }).catch(() => null);

  if (!response) {
    return {
      ok: false,
      status: 502,
      message: "CF TinyML Contact worker is unreachable."
    };
  }

  const responseText = await response.text().catch(() => "");
  const responseJson = parseMaybeJson(responseText);

  if (!response.ok || !responseJson || responseJson.ok !== true) {
    return {
      ok: false,
      status: 502,
      message: "CF TinyML Contact worker rejected the handoff."
    };
  }

  return {
    ok: true,
    status: response.status
  };
}

function buildContactPackage(input, ctx) {
  const now = new Date().toISOString();

  const sourceFields =
    input.fields && typeof input.fields === "object"
      ? input.fields
      : input.rawFields && typeof input.rawFields === "object"
        ? input.rawFields
        : input;

  const rawFields =
    input.rawFields && typeof input.rawFields === "object"
      ? input.rawFields
      : sourceFields;

  const fields = {
    fullName: pick(sourceFields, rawFields, ["fullName", "full_name", "name"]),
    emailAddress: pick(sourceFields, rawFields, ["emailAddress", "email", "email_address"]),
    countryCode: pick(sourceFields, rawFields, ["countryCode", "country_code"]),
    contactNumber: pick(sourceFields, rawFields, ["contactNumber", "phone", "contact_number"]),
    city: pick(sourceFields, rawFields, ["city"]),
    stateProvince: pick(sourceFields, rawFields, ["stateProvince", "state", "province", "state_province"]),
    spaceSuiteApt: pick(sourceFields, rawFields, ["spaceSuiteApt", "suite", "apt", "apartment", "space_suite_apt"]),
    countryZipCode: pick(sourceFields, rawFields, ["countryZipCode", "zipCode", "postalCode", "country_zip_code"]),
    bestContactDate: pick(sourceFields, rawFields, ["bestContactDate", "best_contact_date"]),
    bestContactTime: pick(sourceFields, rawFields, ["bestContactTime", "best_contact_time"]),
    inquiryAbout: pick(sourceFields, rawFields, ["inquiryAbout", "subject", "topic", "contactInterest"]),
    message: pick(sourceFields, rawFields, ["message", "comments", "details"])
  };

  const listsSource =
    input.lists && typeof input.lists === "object"
      ? input.lists
      : rawFields;

  const lists = {
    skills: pickList(listsSource, ["skills", "skills[]"]),
    areasOfInterest: pickList(listsSource, ["areasOfInterest", "areaOfInterest", "areaOfInterest[]", "interests"]),
    experienceLevels: pickList(listsSource, ["experienceLevels", "experienceLevel", "experienceLevel[]", "experience"]),
    education: pickList(listsSource, ["education", "education[]"]),
    languages: pickList(listsSource, ["languages", "languages[]"])
  };

  return {
    formType: "contact",
    route: "contact",
    site: "Gabriel Services",
    repo: "redesigned-octo-meme",
    request_id: cleanText(input.request_id || input.requestId || crypto.randomUUID()).slice(0, 120),

    submittedAt: cleanText(input.submittedAt || ""),
    received_at: now,
    source: cleanText(input.pageUrl || input.source || ""),
    source_worker: WORKER_NAME,

    fields,
    lists,
    rawFields,

    clientSession: {
      id: ctx.sessionId,
      nonce: ctx.nonce
    },

    security: {
      gateway: "repo-worker",
      worker: WORKER_NAME,
      lane: "contact",
      origin: ctx.origin,
      repo: "redesigned-octo-meme",
      repo_id: ctx.repoId,
      asset_id: ctx.assetId,
      header_policy: HEADER_POLICY_ID,
      next_hop: "cf-tinyml-contact"
    },

    integrity: {
      checked: true,
      checked_at: now,
      risk_score: ctx.inspection.riskScore,
      flags: ctx.inspection.flags,
      body_length: ctx.inspection.bodyLength,
      client_sha256: ctx.clientIntegritySha256,
      repo_sha256: ctx.repoIntegritySha256,
      browser_tinyml: "passed",
      repo_worker: "passed"
    }
  };
}

function validateContact(payload) {
  const fields = payload.fields || {};

  if (!fields.fullName) {
    return {
      ok: false,
      message: "Full name is required."
    };
  }

  if (!isValidEmail(fields.emailAddress)) {
    return {
      ok: false,
      message: "A valid email address is required."
    };
  }

  if (!fields.message) {
    return {
      ok: false,
      message: "Message is required."
    };
  }

  return { ok: true };
}

function validateOrigin(origin, env) {
  const extraOrigins = String(env.EXTRA_ALLOWED_ORIGINS || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  const allowed = new Set([...ALLOWED_ORIGINS, ...extraOrigins]);

  return {
    ok: !!origin && allowed.has(origin)
  };
}

function validateIdentity(request) {
  const assetId =
    cleanText(request.headers.get("X-Ops-Asset-Id") || "") ||
    cleanText(request.headers.get("X-Gabo-Asset-ID") || "");

  const repoId =
    cleanText(request.headers.get("X-Gabo-Repo-Id") || "") ||
    cleanText(request.headers.get("X-Gabo-Repo-ID") || "");

  if (assetId !== EXPECTED_ASSET_ID) {
    return {
      ok: false,
      message: "Asset identity rejected."
    };
  }

  if (repoId !== EXPECTED_REPO_ID) {
    return {
      ok: false,
      message: "Repo identity rejected."
    };
  }

  return {
    ok: true,
    assetId,
    repoId
  };
}

function validateSessionHeaders(request, body) {
  const headerSessionId = cleanText(request.headers.get("X-Gabo-Session-Id") || "");
  const headerNonce = cleanText(request.headers.get("X-Gabo-Nonce") || "");

  const bodySession =
    body &&
    body.clientSession &&
    typeof body.clientSession === "object"
      ? body.clientSession
      : {};

  const bodySessionId = cleanText(bodySession.id || bodySession.sessionId || "");
  const bodyNonce = cleanText(bodySession.nonce || "");

  const sessionId = headerSessionId || bodySessionId;
  const nonce = headerNonce || bodyNonce;

  if (!sessionId || sessionId.length < 12) {
    return {
      ok: false,
      message: "Session ID is required."
    };
  }

  if (!nonce || nonce.length < 32) {
    return {
      ok: false,
      message: "Nonce is required."
    };
  }

  if (headerSessionId && bodySessionId && headerSessionId !== bodySessionId) {
    return {
      ok: false,
      message: "Session ID mismatch."
    };
  }

  if (headerNonce && bodyNonce && headerNonce !== bodyNonce) {
    return {
      ok: false,
      message: "Nonce mismatch."
    };
  }

  return {
    ok: true,
    sessionId,
    nonce
  };
}

async function verifyClientIntegrity(request, cleanedBody, origin, sessionCheck) {
  const clientSha256 =
    cleanText(request.headers.get("X-Gabo-Integrity-SHA256") || "") ||
    cleanText(cleanedBody?.clientIntegrity?.sha256 || "");

  if (!clientSha256) {
    return {
      ok: false,
      message: "Client integrity SHA-256 is required."
    };
  }

  const sourcePath = cleanText(cleanedBody.source || cleanedBody.sourcePath || "/contact.html");

  const cleanedFields =
    cleanedBody.rawFields && typeof cleanedBody.rawFields === "object"
      ? cleanedBody.rawFields
      : cleanedBody.fields && typeof cleanedBody.fields === "object"
        ? cleanedBody.fields
        : {};

  const expectedBase = {
    page: PAGE_NAME,
    origin,
    path: sourcePath,
    cleanedFields,
    sessionId: sessionCheck.sessionId,
    nonce: sessionCheck.nonce
  };

  const expectedSha256 = await sha256Hex(stableStringify(expectedBase));

  if (!timingSafeEqual(clientSha256, expectedSha256)) {
    return {
      ok: false,
      message: "Client integrity SHA-256 mismatch."
    };
  }

  const repoSha256 = await sha256Hex(stableStringify({
    page: PAGE_NAME,
    origin,
    sessionId: sessionCheck.sessionId,
    nonce: sessionCheck.nonce,
    payload: cleanedBody,
    checkedAt: "repo-worker"
  }));

  return {
    ok: true,
    clientSha256,
    expectedSha256,
    repoSha256
  };
}

function inspectPayload(payload) {
  const text = JSON.stringify(payload || "").toLowerCase();
  const flags = [];
  let riskScore = 0;

  for (const pattern of RISK_PATTERNS) {
    if (text.includes(pattern)) {
      riskScore += 20;
      flags.push(pattern);
    }
  }

  if (text.length < 30) {
    riskScore += 10;
    flags.push("short_payload");
  }

  if (text.length > 24000) {
    riskScore += 20;
    flags.push("large_payload");
  }

  if ((text.match(/https?:\/\//g) || []).length > 8) {
    riskScore += 15;
    flags.push("excessive_links");
  }

  return {
    ok: riskScore <= MAX_RISK_SCORE,
    riskScore,
    flags,
    bodyLength: text.length
  };
}

function cleanDeep(value, depth = 0) {
  if (depth > MAX_DEPTH) return "";

  if (Array.isArray(value)) {
    return value
      .slice(0, 100)
      .map((item) => cleanDeep(item, depth + 1))
      .filter((item) => item !== "");
  }

  if (value && typeof value === "object") {
    const output = {};

    for (const [key, item] of Object.entries(value)) {
      const cleanKey = cleanText(key).slice(0, 80);

      if (!cleanKey) continue;

      output[cleanKey] = cleanDeep(item, depth + 1);
    }

    return output;
  }

  return cleanText(value).slice(0, MAX_FIELD_LENGTH);
}

function cleanText(value) {
  return String(value ?? "")
    .normalize("NFKC")
    .replace(/\u0000/g, "")
    .replace(/[\u0001-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, " ")
    .replace(/[<>]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function pick(primarySource, secondarySource, keys) {
  for (const key of keys) {
    if (primarySource && primarySource[key] !== undefined && primarySource[key] !== null) {
      const value = normalizeScalar(primarySource[key]);

      if (value) return value;
    }

    if (secondarySource && secondarySource[key] !== undefined && secondarySource[key] !== null) {
      const value = normalizeScalar(secondarySource[key]);

      if (value) return value;
    }
  }

  return "";
}

function pickList(source, keys) {
  for (const key of keys) {
    if (!source || source[key] === undefined || source[key] === null) continue;

    const value = source[key];

    if (Array.isArray(value)) {
      return value
        .map(normalizeScalar)
        .filter(Boolean)
        .slice(0, 100);
    }

    const scalar = normalizeScalar(value);

    if (scalar) return [scalar];
  }

  return [];
}

function normalizeScalar(value) {
  if (Array.isArray(value)) {
    return value.map(cleanText).filter(Boolean).join(", ");
  }

  return cleanText(value);
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(value || "").trim());
}

function getRequestOrigin(request) {
  return normalizeOrigin(
    request.headers.get("Origin") ||
    request.headers.get("X-Gabo-Origin") ||
    ""
  );
}

function normalizeOrigin(value) {
  const raw = cleanText(value);

  if (!raw) return "";

  try {
    return new URL(raw).origin.toLowerCase();
  } catch {
    return raw.replace(/\/$/, "").toLowerCase();
  }
}

function responseHeaders(request, extra = {}) {
  const headers = new Headers(RESPONSE_HEADERS);
  const origin = getRequestOrigin(request);

  if (ALLOWED_ORIGINS.has(origin)) {
    headers.set("Access-Control-Allow-Origin", origin);
  } else {
    headers.set("Access-Control-Allow-Origin", "https://www.gabo.services");
  }

  headers.set("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS, POST");
  headers.set("Access-Control-Allow-Headers", ALLOWED_REQUEST_HEADERS.join(", "));
  headers.set("Access-Control-Expose-Headers", "X-Gabo-Request-Id, X-Gabo-Repo-Gate");
  headers.set("Access-Control-Max-Age", "86400");

  for (const [key, value] of Object.entries(extra)) {
    headers.set(key, value);
  }

  return headers;
}

function jsonResponse(request, status, body, extraHeaders = {}) {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: responseHeaders(request, {
      "Content-Type": "application/json; charset=utf-8",
      ...extraHeaders
    })
  });
}

function parseMaybeJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

async function sha256Hex(value) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(String(value || ""))
  );

  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function stableStringify(value) {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return "[" + value.map(stableStringify).join(",") + "]";
  }

  const keys = Object.keys(value).sort();

  return (
    "{" +
    keys
      .map((key) => JSON.stringify(key) + ":" + stableStringify(value[key]))
      .join(",") +
    "}"
  );
}

function timingSafeEqual(a, b) {
  const x = String(a || "");
  const y = String(b || "");

  if (x.length !== y.length) return false;

  let diff = 0;

  for (let i = 0; i < x.length; i++) {
    diff |= x.charCodeAt(i) ^ y.charCodeAt(i);
  }

  return diff === 0;
}
