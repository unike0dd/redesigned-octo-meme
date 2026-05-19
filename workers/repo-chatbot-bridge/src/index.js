const ROUTE_CHAT = "/api/gabo-io-chat";

const SECURITY_HEADERS = {
  "Content-Security-Policy": "default-src 'none'; base-uri 'none'; object-src 'none'; frame-ancestors 'none'; form-action 'none'; script-src 'none'; style-src 'none'; img-src 'none'; font-src 'none'; connect-src 'none'; frame-src 'none'; worker-src 'none'; manifest-src 'none'; upgrade-insecure-requests; block-all-mixed-content",
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Resource-Policy": "same-origin",
  "Permissions-Policy": "accelerometer=(), ambient-light-sensor=(), autoplay=(), battery=(), bluetooth=(), browsing-topics=(), camera=(), display-capture=(), encrypted-media=(), fullscreen=(self), gamepad=(), geolocation=(), gyroscope=(), hid=(), idle-detection=(), local-fonts=(), magnetometer=(), microphone=(), midi=(), otp-credentials=(), payment=(), picture-in-picture=(), publickey-credentials-create=(), publickey-credentials-get=(self), screen-wake-lock=(), serial=(), speaker-selection=(), storage-access=(), usb=(), web-share=(), xr-spatial-tracking=()",
  "X-Permitted-Cross-Domain-Policies": "none",
  "X-DNS-Prefetch-Control": "off",
  "X-Robots-Tag": "noindex, nofollow",
  "Cache-Control": "no-store, no-transform"
};

function safeText(value, max = 1200) {
  return String(value || "").normalize("NFKC").replace(/[\u0000-\u001F\u007F]/g, " ").replace(/\s+/g, " ").trim().slice(0, max);
}

function allowedOrigins(env) {
  const fallback = [safeText(env.PUBLIC_SITE_ORIGIN, 300), safeText(env.PUBLIC_SITE_ORIGIN_ALT, 300)].filter(Boolean);
  return new Set(parseJsonArray(env.ALLOWED_ORIGINS_JSON, fallback).map((x) => x.toLowerCase()));
}


function parseJsonArray(text, fallback) {
  try {
    const value = JSON.parse(String(text || ""));
    if (Array.isArray(value) && value.length) return value.map((v) => safeText(v, 300).toLowerCase()).filter(Boolean);
  } catch {}
  return fallback;
}

function cors(request, env) {
  const origin = safeText(request.headers.get("Origin"), 300);
  const allowed = allowedOrigins(env);
  const headers = new Headers();
  if (origin && allowed.has(origin)) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Vary", "Origin");
  }
  const allowMethods = parseJsonArray(env.ALLOWED_METHODS_JSON, ["post", "options"]).map((x) => x.toUpperCase()).join(", ");
  const allowHeaders = parseJsonArray(env.ALLOWED_HEADERS_JSON, ["content-type", "accept", "x-gabo-integrity-sha256", "x-gabo-client", "x-gabo-session-id"]).join(", ");
  headers.set("Access-Control-Allow-Methods", allowMethods);
  headers.set("Access-Control-Allow-Headers", allowHeaders);
  headers.set("Access-Control-Max-Age", "86400");
  return headers;
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
    if (!allowed.has(origin.toLowerCase())) return responseJson(request, env, 403, { ok: false, error: "origin_not_allowed" });

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
        body: raw
      });
    } catch {
      return responseJson(request, env, 502, { ok: false, error: "gateway_unavailable" });
    }

    let data;
    try { data = await upstream.json(); } catch { data = { ok: false, error: "gateway_invalid_response" }; }
    return responseJson(request, env, upstream.ok ? upstream.status : 502, data);
  }
};
