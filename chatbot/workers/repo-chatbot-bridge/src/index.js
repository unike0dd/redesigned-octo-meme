import { STANDARD_PERMISSIONS_POLICY, STANDARD_SECURITY_HEADERS, safeText, parseJsonArrayEnv } from "../../shared-common.js";

const ROUTE_CHAT = "/api/gabo-io-chat";

const SECURITY_HEADERS = Object.freeze({
  "Content-Security-Policy": "default-src 'none'; base-uri 'none'; object-src 'none'; frame-ancestors 'none'; form-action 'none'; script-src 'none'; style-src 'none'; img-src 'none'; font-src 'none'; connect-src 'none'; frame-src 'none'; worker-src 'none'; manifest-src 'none'; upgrade-insecure-requests; block-all-mixed-content",
  ...STANDARD_SECURITY_HEADERS,
  "Permissions-Policy": STANDARD_PERMISSIONS_POLICY
});

function allowedOrigins(env) {
  const fallback = [safeText(env.PUBLIC_SITE_ORIGIN, 300), safeText(env.PUBLIC_SITE_ORIGIN_ALT, 300)].filter(Boolean);
  const configured = parseJsonArrayEnv(env, "ALLOWED_ORIGINS_JSON", (value) => safeText(value, 300));
  if (configured.length) return new Set(configured);
  return new Set(fallback);
}

function cors(request, env) {
  const origin = safeText(request.headers.get("Origin"), 300);
  const allowed = allowedOrigins(env);
  const headers = new Headers();
  if (origin && allowed.has(origin)) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Vary", "Origin");
  }
    const methods = (() => {
    const p = parseJsonArrayEnv(env, "ALLOWED_METHODS_JSON", (x) => safeText(x, 20).toUpperCase()); if (p.length) return p.join(", ");
    return "POST, OPTIONS";
  })();
  const allowHeaders = (() => {
    const p = parseJsonArrayEnv(env, "ALLOWED_HEADERS_JSON", (x) => safeText(x, 60).toLowerCase()); if (p.length) return p.join(", ");
    return "content-type, accept, x-gabo-integrity-sha256, x-gabo-client, x-gabo-session-id";
  })();
  headers.set("Access-Control-Allow-Methods", methods);
  headers.set("Access-Control-Allow-Headers", allowHeaders);
  headers.set("Access-Control-Max-Age", "86400");
  return headers;
}


function buildLeadContext(body, request) {
  const source = safeText((body && body.source) || request.headers.get("X-Gabo-Client") || "web", 80);
  const campaign = safeText((body && body.campaign) || (body && body.utmCampaign) || "", 120);
  const intent = safeText((body && body.intent) || "", 120);
  const name = safeText((body && body.name) || "", 120);
  const email = safeText((body && body.email) || "", 180).toLowerCase();
  const company = safeText((body && body.company) || "", 160);
  const role = safeText((body && body.role) || "", 120);
  const interest = safeText((body && body.interest) || "", 200);
  return { source, campaign, intent, contact: { name, email, company, role, interest } };
}

function responseJson(request, env, status, body) {
  const headers = new Headers(SECURITY_HEADERS);
  cors(request, env).forEach((v, k) => headers.set(k, v));
  headers.set("Content-Type", "application/json; charset=utf-8");
  return new Response(JSON.stringify(body), { status, headers });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      const headers = new Headers(SECURITY_HEADERS);
      cors(request, env).forEach((v, k) => headers.set(k, v));
      return new Response(null, { status: 204, headers });
    }

    if (url.pathname !== ROUTE_CHAT) return responseJson(request, env, 404, { ok: false, error: "not_found" });
    if (request.method !== "POST") return responseJson(request, env, 405, { ok: false, error: "method_not_allowed" });

    const origin = safeText(request.headers.get("Origin"), 300);
    const allowed = allowedOrigins(env);
    if (!origin) return responseJson(request, env, 403, { ok: false, error: "origin_required" });
    if (!allowed.has(origin)) return responseJson(request, env, 403, { ok: false, error: "origin_not_allowed" });

    const raw = await request.text().catch(() => "");
    const maxBody = Number(env.MAX_BODY_CHARS || 24000);
    const maxMessage = Number(env.MAX_MESSAGE_CHARS || 1200);
    const maxWiki = Number(env.MAX_WIKI_CHARS || 8000);

    if (!raw) return responseJson(request, env, 400, { ok: false, error: "empty_body" });
    if (raw.length > maxBody) return responseJson(request, env, 413, { ok: false, error: "request_too_large" });

    let body;
    try { body = JSON.parse(raw); } catch { return responseJson(request, env, 400, { ok: false, error: "invalid_json" }); }
    const message = safeText(body && body.message, maxMessage);
    const honeypot = safeText((body && (body.honeypot || body.website)) || "", 300);
    const integrity = safeText(body && body.integrity, 128);
    const wikiContext = safeText(body && body.wikiContext, maxWiki + 1);

    if (!message) return responseJson(request, env, 400, { ok: false, error: "message_required" });
    if (honeypot) return responseJson(request, env, 403, { ok: false, error: "session_blocked" });
    if (!integrity) return responseJson(request, env, 400, { ok: false, error: "integrity_required" });
    if (wikiContext.length > maxWiki) return responseJson(request, env, 413, { ok: false, error: "wiki_too_large" });

    const gatewayUrl = `${safeText(env.CHATBOT_GATEWAY_ORIGIN, 300)}${safeText(env.CHATBOT_GATEWAY_CHAT_PATH, 100) || "/api/chat"}`;

    let upstream;
    try {
      upstream = await fetch(gatewayUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "X-Gabo-Integrity-SHA256": safeText(request.headers.get("X-Gabo-Integrity-SHA256"), 128),
          "X-Gabo-Client": safeText(request.headers.get("X-Gabo-Client"), 64) || safeText(env.CHATBOT_CLIENT_NAME, 64),
          "X-Gabo-Session-Id": safeText(request.headers.get("X-Gabo-Session-Id"), 160)
        },
        body: JSON.stringify({
          ...body,
          message,
          wikiContext,
          leadContext: buildLeadContext(body, request),
          cx: {
            quality: "high",
            askClarifyingQuestion: true,
            tone: safeText((body && body.tone) || "professional-friendly", 50)
          }
        })
      });
    } catch {
      return responseJson(request, env, 502, { ok: false, error: "gateway_unavailable" });
    }

    let data;
    try { data = await upstream.json(); } catch { data = { ok: false, error: "gateway_invalid_response" }; }
    return responseJson(request, env, upstream.ok ? upstream.status : 502, data);
  }
};
