import { STANDARD_PERMISSIONS_POLICY, STANDARD_SECURITY_HEADERS, toStr, safeText, normalizeOrigin } from "../../shared-common.js";

const PUBLIC_NAME = "chatbot.gabo.services";
const CHATBOT_NAME = "gabo io";
const HEADER_INTEGRITY = "x-gabo-integrity-sha256";
const HEADER_CLIENT = "x-gabo-client";
const HEADER_SESSION = "x-gabo-session-id";
const HEADER_REPO_SYNC = "x-gabo-repo-sync";
const HEADER_ASSET_ID = "x-ops-asset-id";
const SECRET_LIKE_HEADERS = new Set([
  "authorization",
  "cookie",
  "x-api-key",
  "x-worker-secret",
  "x-shared-secret",
  "x-gabo-internal-secret",
  "x-con-artist-shared-secret",
  "io-pro",
  "io_pro"
]);

const DEFAULT_SYNC_CONFIG = Object.freeze({
  publicWorker: { chatApi: "/api/chat", healthApi: "/health" },
  repo: {
    clientName: "gabo-io",
    repoSync: "io-pro-chatbot-v1",
    assetId: "redesigned-octo-meme-chatbot",
    chatbotName: "gabo io",
    allowedOrigins: ["https://unike0dd.github.io", "https://gabo.services", "https://www.gabo.services"]
  },
  cors: {
    allowedMethods: ["POST", "OPTIONS"],
    allowedRequestHeaders: ["content-type", "accept", HEADER_INTEGRITY, HEADER_CLIENT, HEADER_SESSION, HEADER_REPO_SYNC, HEADER_ASSET_ID],
    exposedResponseHeaders: ["x-gabo-chatbot-gateway", "x-gabo-integrity-verified", "x-gabo-repo-sync-verified"],
    maxAgeSeconds: 86400
  },
  limits: { maxBodyChars: 24000, maxMessageChars: 1200, maxWikiChars: 8000, maxRiskScore: 60 },
  repoRequestBody: { requiredFields: ["chatbot", "message", "sessionId", "integrity"] }
});

const CSP =
  "default-src 'none'; base-uri 'none'; object-src 'none'; frame-ancestors 'none'; form-action 'none'; " +
  "script-src 'none'; style-src 'none'; img-src 'none'; font-src 'none'; media-src 'none'; frame-src 'none'; " +
  "connect-src 'self' https://chatbot.gabo.services https://unike0dd.github.io https://gabo.services https://www.gabo.services; worker-src 'none'; manifest-src 'none'; " +
  "upgrade-insecure-requests; block-all-mixed-content";

const RISK_SIGNATURES = Object.freeze([
  { label: "script-tag", weight: 25, pattern: /<\s*\/?\s*script\b/gi },
  { label: "dangerous-html", weight: 20, pattern: /<\s*\/?\s*(iframe|object|embed|applet|meta|link|base|svg|math|template|style|form|input|button)\b/gi },
  { label: "event-handler", weight: 18, pattern: /\bon[a-z]{3,}\s*=/gi },
  { label: "active-uri", weight: 22, pattern: /\b(javascript|vbscript|data)\s*:/gi },
  { label: "eval", weight: 20, pattern: /\b(eval|Function|setTimeout|setInterval)\s*\(/gi }
]);
const SESSION_MEMORY = new Map();
const SESSION_TTL_MS = 30 * 60 * 1000;
const DEFAULT_CONVERSATION_RULES = Object.freeze({
  greetingReplyEs: "Qué tal, un gusto verte aquí. ¿Me podrías decir tu nombre?",
  nameReplyTemplateEs: "Mucho gusto y gracias por visitarnos, {{name}}. Dime, ¿en qué puedo asistirte?",
  serviceAnswerEs: "Ofrecemos soporte operativo en: Operaciones Logísticas, Back Office Administrativo, Operaciones de Relación con Clientes y Soporte de TI (Nivel I y Nivel II). Si quieres, te explico cuál encaja mejor con tu necesidad.",
  serviceAnswerEn: "We provide operational support in: Logistics Operations, Administrative Back Office, Customer Relations Operations, and IT Support (Level I and Level II). If you want, I can help you identify which one fits your needs best."
});
const DEFAULT_BEHAVIOR_POLICY = Object.freeze({
  supportedLanguages: ["en", "es"],
  safeIdentity: "Gabo io is the website assistant for Gabo Services."
});
const LANGUAGE_GUARD = Object.freeze({
  fallbackIdentity: "Gabo io is the website assistant for Gabo Services.",
  unclearMixed: "That looks like unclear or mixed-language wording. Please continue in English or Spanish.",
  unclearMixedEs: "Ese texto parece poco claro o mezclado. Por favor continúa en inglés o español.",
  tagalogLike: "That looks like unclear Filipino/Tagalog-style wording. It probably means: ‘Who created Gabo io?’ Gabo io is the website assistant for Gabo Services. You can ask me in English or Spanish, and I’ll help you with the services on this website.",
  tagalogConfidence: "It looks similar to Filipino/Tagalog, but the sentence is not written in clean standard Tagalog. A clearer version would be: ‘Sino ang gumawa ng Gabo io?’ which means ‘Who created Gabo io?’ in English.",
  tagalogLanguageAnswer: "That looks like Filipino/Tagalog-style wording, although it is not written clearly. It is not code.",
  tagalogEnglishMeaning: "It roughly means: ‘Who created Gabo io?’"
});

function asArray(value, fallback = []) { return Array.isArray(value) ? value : fallback; }
function normalizeHeaderName(name) { return safeText(name || "", 200).trim().toLowerCase(); }
function requestedPreflightHeaders(request) { return safeText(request.headers.get("Access-Control-Request-Headers") || "", 2000).split(",").map((h) => normalizeHeaderName(h)).filter(Boolean); }
function requestedPreflightMethod(request) { return normalizeHeaderName(request.headers.get("Access-Control-Request-Method") || ""); }
function loadAllowedOrigins(config) {
  const defaultOrigins = asArray(DEFAULT_SYNC_CONFIG.repo.allowedOrigins, []);
  const configuredOrigins = asArray(config?.repo?.allowedOrigins, []);
  const previewOrigins = asArray(config?.repo?.previewAllowedOrigins, []);
  const origins = [...defaultOrigins, ...configuredOrigins, ...previewOrigins];
  return new Set(origins.map(normalizeOrigin).filter(Boolean));
}

function isAllowedPreflightMethod(config, request) {
  const method = requestedPreflightMethod(request);
  if (!method) return true;
  const cors = config?.cors || DEFAULT_SYNC_CONFIG.cors;
  const allowed = asArray(cors.allowedMethods, DEFAULT_SYNC_CONFIG.cors.allowedMethods).map((item) => normalizeHeaderName(item));
  return allowed.includes(method);
}

function areAllowedPreflightHeaders(config, request) {
  const requested = requestedPreflightHeaders(request);
  if (!requested.length) return true;
  const cors = config?.cors || DEFAULT_SYNC_CONFIG.cors;
  const allowed = new Set(asArray(cors.allowedRequestHeaders, DEFAULT_SYNC_CONFIG.cors.allowedRequestHeaders).map((item) => normalizeHeaderName(item)));
  return requested.every((header) => allowed.has(header));
}

function hasSecretLikeHeaders(request) {
  for (const [name] of request.headers) if (SECRET_LIKE_HEADERS.has(normalizeHeaderName(name))) return true;
  return false;
}

function loadContract(env) {
  try {
    const raw = safeText(env.CHATBOT_SYNC_CONFIG_JSON || env.CHATBOT_REPO_CONTRACT_JSON || "", 50000);
    if (!raw) return DEFAULT_SYNC_CONFIG;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_SYNC_CONFIG,
      ...parsed,
      publicWorker: { ...DEFAULT_SYNC_CONFIG.publicWorker, ...(parsed.publicWorker || {}) },
      repo: { ...DEFAULT_SYNC_CONFIG.repo, ...(parsed.repo || {}) },
      cors: { ...DEFAULT_SYNC_CONFIG.cors, ...(parsed.cors || {}) },
      limits: { ...DEFAULT_SYNC_CONFIG.limits, ...(parsed.limits || {}) },
      repoRequestBody: { ...DEFAULT_SYNC_CONFIG.repoRequestBody, ...(parsed.repoRequestBody || {}) }
    };
  } catch {
    return DEFAULT_SYNC_CONFIG;
  }
}

function allowedOriginsFromEnv(env) {
  try {
    const raw = safeText(env.ALLOWED_ORIGINS_JSON || "", 20000);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((x) => normalizeOrigin(x)).filter(Boolean);
  } catch {
    return [];
  }
}

function allowedOrigins(contract, env) {
  const contractAllowed = Array.isArray(contract?.repo?.allowedOrigins) ? contract.repo.allowedOrigins : [];
  const merged = [...contractAllowed, ...allowedOriginsFromEnv(env)].map((x) => normalizeOrigin(x)).filter(Boolean);
  return new Set(merged);
}

function securityHeaders(extra = {}) { const h = new Headers(extra); h.set("Content-Security-Policy", CSP); Object.entries(STANDARD_SECURITY_HEADERS).forEach(([key, value]) => h.set(key, value)); h.set("Permissions-Policy", STANDARD_PERMISSIONS_POLICY); h.set("Cross-Origin-Embedder-Policy", "require-corp"); return h; }
function corsHeaders(config, request) { const allowed = loadAllowedOrigins(config); const origin = normalizeOrigin(request.headers.get("Origin") || ""); const h = new Headers(); h.set("Vary", "Origin"); if (origin && allowed.has(origin)) h.set("Access-Control-Allow-Origin", origin); h.set("Access-Control-Allow-Methods", asArray(config?.cors?.allowedMethods, DEFAULT_SYNC_CONFIG.cors.allowedMethods).join(", ")); h.set("Access-Control-Allow-Headers", asArray(config?.cors?.allowedRequestHeaders, DEFAULT_SYNC_CONFIG.cors.allowedRequestHeaders).join(", ")); h.set("Access-Control-Expose-Headers", asArray(config?.cors?.exposedResponseHeaders, DEFAULT_SYNC_CONFIG.cors.exposedResponseHeaders).join(", ")); h.set("Access-Control-Max-Age", String(Number(config?.cors?.maxAgeSeconds || DEFAULT_SYNC_CONFIG.cors.maxAgeSeconds))); return h; }
function json(config, request, status, body, extra = {}) { const h = securityHeaders(extra); corsHeaders(config, request).forEach((v, k) => h.set(k, v)); h.set("content-type", "application/json; charset=utf-8"); return new Response(JSON.stringify(body), { status, headers: h }); }
function reject(config, request, status, error) { return json(config, request, status, { ok: false, error }); }
function scanRisk(value) { const text = toStr(value); let score = 0; for (const sig of RISK_SIGNATURES) { sig.pattern.lastIndex = 0; const matches = text.match(sig.pattern); if (!matches) continue; score += matches.length * sig.weight; } return { score }; }
function sanitize(value, max = 1200) { return toStr(value).normalize("NFKC").replace(/```[\s\S]*?```|~~~[\s\S]*?~~~/g, " ").replace(/`[^`\n]{1,500}`/g, " ").replace(/<\s*(script|style|iframe|object|embed|applet|svg|math|template)[\s\S]*?<\s*\/\s*\1\s*>/gi, " ").replace(/<[^>]+>/g, " ").replace(/\bon[a-z]{3,}\s*=\s*("[^"]*"|'[^']*'|[^\s>]*)/gi, " ").replace(/\b(javascript|vbscript|data)\s*:[^\s,;)]*/gi, " ").replace(/[<>`{}()[\];|\\]/g, " ").replace(/[\u0000-\u001F\u007F]/g, " ").replace(/\s+/g, " ").trim().slice(0, max); }
function loadConversationRules(env) { try { const raw = safeText(env.GABO_IO_CONVERSATION_RULES_JSON || "", 10000); return raw ? { ...DEFAULT_CONVERSATION_RULES, ...(JSON.parse(raw) || {}) } : DEFAULT_CONVERSATION_RULES; } catch { return DEFAULT_CONVERSATION_RULES; } }
function loadBehaviorPolicy(env) { try { const raw = safeText(env.GABO_IO_BEHAVIOR_POLICY_JSON || "", 10000); return raw ? { ...DEFAULT_BEHAVIOR_POLICY, ...(JSON.parse(raw) || {}) } : DEFAULT_BEHAVIOR_POLICY; } catch { return DEFAULT_BEHAVIOR_POLICY; } }
function isSpanishGreeting(text) { return /\b(hola|buenas|buenos d[ií]as|buenas tardes|buenas noches|qué tal|que tal)\b/i.test(text); }
function isServiceQuestion(text) { return /\b(me gustar[ií]a saber|qué ofreces|que ofreces|cu[aá]les son tus servicios|que servicios ofrecen|qué servicios ofrecen|qué tienes|que tienes)\b/i.test(text); }
function extractName(text) { const m = text.match(/\b(mi nombre es|me llamo|soy)\s+([a-záéíóúüñ][a-záéíóúüñ\s'-]{1,60})/i); return m && m[2] ? sanitize(m[2], 80).replace(/\b(y|and|pero|but)\b.*$/i, "").trim() : ""; }
function sessionGet(sessionId) { const entry = SESSION_MEMORY.get(sessionId); if (!entry) return null; if (Date.now() - entry.updatedAt > SESSION_TTL_MS) { SESSION_MEMORY.delete(sessionId); return null; } return entry; }
function sessionPut(sessionId, patch) { const prev = sessionGet(sessionId) || {}; SESSION_MEMORY.set(sessionId, { ...prev, ...patch, updatedAt: Date.now() }); }
async function sha256Hex(value) { const data = new TextEncoder().encode(toStr(value)); const hash = await crypto.subtle.digest("SHA-256", data); return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join(""); }
function canonicalPayload({ chatbot, message, lang, wikiContext, sessionId }) { return JSON.stringify({ chatbot: safeText(chatbot, 64), message: safeText(message, 1200), lang: safeText(lang || "en", 8), wikiContext: safeText(wikiContext || "", 8000), sessionId: safeText(sessionId || "", 160) }); }
function timingSafeEq(a, b) { const x = toStr(a); const y = toStr(b); if (x.length !== y.length) return false; let out = 0; for (let i = 0; i < x.length; i++) out |= x.charCodeAt(i) ^ y.charCodeAt(i); return out === 0; }
function requireBinding(env) { if (!env.graymatter || typeof env.graymatter.fetch !== "function") throw new Error("relay_unavailable"); return env.graymatter; }
function requireSharedSecret(env) { const secret = safeText(env.GRAYMATTER_SHARED_SECRET || "", 500); if (!secret) throw new Error("relay_unavailable"); return secret; }
async function forwardToBinding(env, clean) { const binding = requireBinding(env); const sharedSecret = requireSharedSecret(env); return binding.fetch("https://graymatter.local/api/chat", { method: "POST", headers: { "content-type": "application/json", "accept": "application/json", "x-gabo-hop": PUBLIC_NAME, "x-gabo-shared-secret": sharedSecret }, body: JSON.stringify({ chatbot: CHATBOT_NAME, lang: clean.lang, messages: [{ role: "user", content: clean.message }], context: { page: clean.page, wiki: clean.wikiContext, leadContext: clean.leadContext } }) }); }
function gracefulReply() { return "gabo io: Temporary gateway issue. Please retry in a moment. If it persists, use the contact page for a human follow-up."; }
function looksSpanish(text) { return /\b(el|la|los|las|de|que|para|con|servicios|hola|gracias|por favor)\b|[¿¡ñáéíóú]/i.test(text); }
function looksEnglish(text) { return /\b(the|what|who|is|are|in|and|please|services|hello|thanks)\b/i.test(text); }
function tagalogLike(text) { return /\b(kiun|gawa|sino|gumawa|ang)\b/i.test(text); }
function isWhoCreatedQuestion(text) { return /\b(who created gabo io|quien cre[oó] gabo io|quién cre[oó] gabo io|kiun ang gawa ng gabo io)\b/i.test(text); }
function inferLanguage(text) {
  const es = looksSpanish(text);
  const en = looksEnglish(text);
  if (es && !en) return "es";
  if (en && !es) return "en";
  if (es && en) return "mixed";
  return "unknown";
}
function guardReplyForMessage(message, behaviorPolicy) {
  const text = toStr(message).trim();
  const lower = text.toLowerCase();
  if (!text) return "";
  if (/\bwhat does that mean in english\??\b/i.test(text)) return LANGUAGE_GUARD.tagalogEnglishMeaning;
  if (/\bwhat language are those\??\b/i.test(text)) return LANGUAGE_GUARD.tagalogLanguageAnswer;
  if (/\bis that tagalog\??\b/i.test(text)) return LANGUAGE_GUARD.tagalogConfidence;
  if (tagalogLike(text)) return LANGUAGE_GUARD.tagalogLike;
  if (isWhoCreatedQuestion(text)) return LANGUAGE_GUARD.fallbackIdentity;
  const lang = inferLanguage(text);
  if (lang === "mixed") return LANGUAGE_GUARD.unclearMixed;
  const letters = (lower.match(/[a-záéíóúñ]/gi) || []).length;
  const nonLatin = (lower.match(/[^\x00-\x7f]/g) || []).length;
  if (letters > 0 && nonLatin > 0) return lang === "es" ? LANGUAGE_GUARD.unclearMixedEs : LANGUAGE_GUARD.unclearMixed;
  if (!behaviorPolicy.supportedLanguages.includes(lang) && lang !== "unknown") return LANGUAGE_GUARD.unclearMixed;
  return "";
}
function guardReplyForUpstream(cleanMessage, upstreamReply) {
  const msg = toStr(cleanMessage);
  const reply = toStr(upstreamReply).trim();
  if (!reply) return "";
  if (/\b(json|javascript|code|snippet)\b/i.test(reply) && !/[`{}();<>]|function\s*\(/i.test(msg)) return LANGUAGE_GUARD.tagalogLanguageAnswer;
  if (isWhoCreatedQuestion(msg) && !/website assistant for gabo services/i.test(reply)) return LANGUAGE_GUARD.fallbackIdentity;
  return reply;
}

export default { async fetch(request, env) {
  const config = loadContract(env);
  const url = new URL(request.url);
  const chatRoute = config.publicWorker?.chatApi || DEFAULT_SYNC_CONFIG.publicWorker.chatApi;

  if (request.method === "OPTIONS") {
    const origin = normalizeOrigin(request.headers.get("Origin") || "");
    const allowedOrigins = loadAllowedOrigins(config);

    if (url.pathname !== chatRoute) return reject(config, request, 404, "not_found");
    if (!origin || !allowedOrigins.has(origin)) return reject(config, request, 403, "origin_not_allowed");
    if (hasSecretLikeHeaders(request)) return reject(config, request, 403, "preflight_headers_not_allowed");
    if (!isAllowedPreflightMethod(config, request)) return reject(config, request, 405, "preflight_method_not_allowed");
    if (!areAllowedPreflightHeaders(config, request)) return reject(config, request, 403, "preflight_headers_not_allowed");

    const headers = securityHeaders();
    corsHeaders(config, request).forEach((value, key) => headers.set(key, value));
    return new Response(null, { status: 204, headers });
  }

  if (url.pathname === config.publicWorker.healthApi || url.pathname === "/") {
    return json(config, request, 200, { ok: true, worker: PUBLIC_NAME, api: chatRoute, repoSync: config.repo.repoSync, assetId: config.repo.assetId, ioProConfigured: Boolean(safeText(env.IO_PRO || "", 1)) });
  }

  if (url.pathname !== chatRoute) return reject(config, request, 404, "not_found");
  if (request.method !== "POST") return reject(config, request, 405, "method_not_allowed");

  const origin = normalizeOrigin(request.headers.get("Origin") || "");
  const allowed = loadAllowedOrigins(config);
  if (!origin || !allowed.has(origin)) return reject(config, request, 403, "request_blocked");
  if (hasSecretLikeHeaders(request)) return reject(config, request, 403, "request_blocked");
  if (!safeText(env.IO_PRO || "", 2048)) {
    const reply = gracefulReply();
    return json(config, request, 200, { ok: true, degraded: true, reply, error: "sync_not_configured" }, { "x-gabo-chatbot-gateway": "1", "x-gabo-integrity-verified": "0", "x-gabo-repo-sync-verified": "0", "x-gabo-degraded": "1" });
  }

  const clientName = safeText(request.headers.get("X-Gabo-Client"), 64);
  const repoSync = safeText(request.headers.get("X-Gabo-Repo-Sync"), 64);
  const assetId = safeText(request.headers.get("X-Ops-Asset-Id"), 120);
  const sessionId = safeText(request.headers.get("X-Gabo-Session-Id"), 160);
  const headerIntegrity = safeText(request.headers.get("X-Gabo-Integrity-SHA256"), 128);
  if (clientName !== safeText(config.repo.clientName, 64)) return reject(config, request, 403, "request_blocked");
  if (repoSync !== safeText(config.repo.repoSync, 64)) return reject(config, request, 403, "request_blocked");
  if (assetId !== safeText(config.repo.assetId, 120)) return reject(config, request, 403, "request_blocked");
  if (!sessionId || !headerIntegrity) return reject(config, request, 403, "request_blocked");

  const maxBody = Number(config.limits?.maxBodyChars || 24000);
  const maxMessage = Number(config.limits?.maxMessageChars || 1200);
  const maxWiki = Number(config.limits?.maxWikiChars || 8000);
  const maxRisk = Number(config.limits?.maxRiskScore || 60);
  const raw = await request.text().catch(() => "");
  if (!raw || raw.length > maxBody) return reject(config, request, 400, "request_blocked");

  let body;
  try { body = JSON.parse(raw); } catch { return reject(config, request, 400, "request_blocked"); }
  const required = config.repoRequestBody?.requiredFields || [];
  if (!required.every((key) => Object.prototype.hasOwnProperty.call(body || {}, key))) return reject(config, request, 400, "request_blocked");

  const honeypot = safeText(body.honeypot || body.website || "", 300);
  if (honeypot) return reject(config, request, 403, "request_blocked");

  const cleanMessage = sanitize(body.message || "", maxMessage);
  const cleanWiki = sanitize(body.wikiContext || "", maxWiki);
  const cleanLang = safeText(body.lang || "en", 8);
  const risk = scanRisk(`${cleanMessage} ${cleanWiki}`);
  if (!cleanMessage || risk.score >= maxRisk) return reject(config, request, 403, "request_blocked");

  const canonical = canonicalPayload({ chatbot: body.chatbot, message: cleanMessage, lang: cleanLang, wikiContext: cleanWiki, sessionId: safeText(body.sessionId || sessionId, 160) });
  const serverIntegrity = await sha256Hex(canonical);
  const clientIntegrity = safeText(body.integrity || headerIntegrity, 128);
  if (!clientIntegrity || !timingSafeEq(clientIntegrity, serverIntegrity)) return reject(config, request, 403, "request_blocked");

  const clean = { message: cleanMessage, wikiContext: cleanWiki, lang: cleanLang, sessionId, page: safeText(body.page || "", 300), leadContext: body.leadContext || {} };
  const rules = loadConversationRules(env);
  const behaviorPolicy = loadBehaviorPolicy(env);
  const priorSession = sessionGet(sessionId);
  if (isSpanishGreeting(cleanMessage)) return json(config, request, 200, { ok: true, reply: rules.greetingReplyEs, integrity: serverIntegrity }, { "x-gabo-chatbot-gateway": "1", "x-gabo-integrity-verified": "1", "x-gabo-repo-sync-verified": "1" });
  const capturedName = extractName(cleanMessage);
  if (capturedName) { sessionPut(sessionId, { name: capturedName }); return json(config, request, 200, { ok: true, reply: rules.nameReplyTemplateEs.replace("{{name}}", capturedName), integrity: serverIntegrity }, { "x-gabo-chatbot-gateway": "1", "x-gabo-integrity-verified": "1", "x-gabo-repo-sync-verified": "1" }); }
  if (isServiceQuestion(cleanMessage)) {
    const prefix = priorSession && priorSession.name ? `${priorSession.name}, ` : "";
    const serviceReply = cleanLang === "es" ? rules.serviceAnswerEs : rules.serviceAnswerEn;
    return json(config, request, 200, { ok: true, reply: `${prefix}${serviceReply}`.trim(), integrity: serverIntegrity }, { "x-gabo-chatbot-gateway": "1", "x-gabo-integrity-verified": "1", "x-gabo-repo-sync-verified": "1" });
  }
  const guardedLocalReply = guardReplyForMessage(cleanMessage, behaviorPolicy);
  if (guardedLocalReply) {
    return json(config, request, 200, { ok: true, reply: guardedLocalReply, integrity: serverIntegrity }, { "x-gabo-chatbot-gateway": "1", "x-gabo-integrity-verified": "1", "x-gabo-repo-sync-verified": "1" });
  }
  if (priorSession && priorSession.name) clean.leadContext = { ...(clean.leadContext || {}), sessionName: priorSession.name };
  let upstream;
  try {
    upstream = await forwardToBinding(env, clean);
  } catch {
    const reply = gracefulReply();
    return json(config, request, 200, { ok: true, degraded: true, reply, integrity: serverIntegrity }, { "x-gabo-chatbot-gateway": "1", "x-gabo-integrity-verified": "1", "x-gabo-repo-sync-verified": "1", "x-gabo-degraded": "1" });
  }
  if (!upstream.ok) {
    const reply = gracefulReply();
    return json(config, request, 200, { ok: true, degraded: true, reply, integrity: serverIntegrity }, { "x-gabo-chatbot-gateway": "1", "x-gabo-integrity-verified": "1", "x-gabo-repo-sync-verified": "1", "x-gabo-degraded": "1" });
  }
  let data = {}; try { data = await upstream.json(); } catch { data = {}; }
  const upstreamReply = sanitize(data.reply || data.message || "", 1600);
  const reply = guardReplyForUpstream(cleanMessage, upstreamReply) || "gabo io: I received your message. I can help repair, fix, or update—please share what you want to change.";
  return json(config, request, 200, { ok: true, reply, integrity: serverIntegrity }, { "x-gabo-chatbot-gateway": "1", "x-gabo-integrity-verified": "1", "x-gabo-repo-sync-verified": "1" });
} };
