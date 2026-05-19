const ROUTES = Object.freeze({
  health: "/health",
  chat: "/api/chat",
  handshake: "/__repo/handshake"
});

const PUBLIC_NAME = "chatbot.gabo.services";
const CHATBOT_NAME = "gabo io";

const HEADER_INTEGRITY = "x-gabo-integrity-sha256";
const HEADER_CLIENT = "x-gabo-client";
const HEADER_SESSION = "x-gabo-session-id";

const STANDARD_PERMISSIONS_POLICY =
  "accelerometer=(), ambient-light-sensor=(), autoplay=(), battery=(), bluetooth=(), browsing-topics=(), camera=(), display-capture=(), encrypted-media=(), fullscreen=(self), gamepad=(), geolocation=(), gyroscope=(), hid=(), idle-detection=(), local-fonts=(), magnetometer=(), microphone=(), midi=(), otp-credentials=(), payment=(), picture-in-picture=(), publickey-credentials-create=(), publickey-credentials-get=(self), screen-wake-lock=(), serial=(), speaker-selection=(), storage-access=(), usb=(), web-share=(), xr-spatial-tracking=()";

const CSP =
  "default-src 'none'; base-uri 'none'; object-src 'none'; frame-ancestors 'none'; form-action 'none'; " +
  "script-src 'none'; style-src 'none'; img-src 'none'; font-src 'none'; media-src 'none'; frame-src 'none'; " +
  "connect-src 'self' https://gabo.services https://www.gabo.services; worker-src 'none'; manifest-src 'none'; " +
  "upgrade-insecure-requests; block-all-mixed-content";

const RISK_SIGNATURES = Object.freeze([
  { label: "script-tag", weight: 25, pattern: /<\s*\/?\s*script\b/gi },
  { label: "dangerous-html", weight: 20, pattern: /<\s*\/?\s*(iframe|object|embed|applet|meta|link|base|svg|math|template|style|form|input|button)\b/gi },
  { label: "event-handler", weight: 18, pattern: /\bon[a-z]{3,}\s*=/gi },
  { label: "active-uri", weight: 22, pattern: /\b(javascript|vbscript|data)\s*:/gi },
  { label: "eval", weight: 20, pattern: /\b(eval|Function|setTimeout|setInterval)\s*\(/gi },
  { label: "dom-access", weight: 14, pattern: /\b(document\.|window\.|localStorage|sessionStorage|XMLHttpRequest|fetch\s*\()/gi },
  { label: "code-block", weight: 18, pattern: /```[\s\S]*?```|~~~[\s\S]*?~~~/g },
  { label: "inline-code", weight: 10, pattern: /`[^`\n]{2,}`/g },
  { label: "programming-token", weight: 12, pattern: /\b(import|export|require|function|class|const|let|var|return|await|async|public\s+class|def|lambda)\b/gi },
  { label: "sql-injection", weight: 20, pattern: /\b(union\s+select|select\s+.+\s+from|insert\s+into|update\s+.+\s+set|delete\s+from|drop\s+(table|database)|truncate\s+table|or\s+1\s*=\s*1)\b/gi },
  { label: "shell-token", weight: 18, pattern: /(\.\.\/|\b(curl|wget|bash|sh|powershell|cmd\.exe|chmod|sudo|rm\s+-rf|nc\s+-|python\s+-c|node\s+-e)\b|\|\||&&)/gi },
  { label: "template-injection", weight: 18, pattern: /(\$\{[\s\S]*?\}|\{\{[\s\S]*?\}\}|<%[\s\S]*?%>)/g },
  { label: "dense-code-punctuation", weight: 12, pattern: /[{}()[\];=<>|&$]{6,}/g }
]);

function toStr(value) { return typeof value === "string" ? value : value == null ? "" : String(value); }
function safeText(value, max = 1200) { return toStr(value).normalize("NFKC").replace(/[\u0000-\u001F\u007F]/g, " ").replace(/\s+/g, " ").trim().slice(0, max); }
function normalizeOrigin(value) { const raw = safeText(value, 300); if (!raw || raw === "null") return ""; try { return new URL(raw).origin.toLowerCase(); } catch { return raw.replace(/\/$/, "").toLowerCase(); } }
function loadAllowedOrigins(env) { const fallback = ["https://www.gabo.services", "https://gabo.services"]; try { const parsed = JSON.parse(toStr(env.ALLOWED_ORIGINS_JSON || "")); if (Array.isArray(parsed) && parsed.length) return new Set(parsed.map(normalizeOrigin).filter(Boolean)); } catch {} return new Set(fallback.map(normalizeOrigin)); }
function securityHeaders(extra = {}) { const h = new Headers(extra); h.set("Content-Security-Policy", CSP); h.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload"); h.set("X-Content-Type-Options", "nosniff"); h.set("X-Frame-Options", "DENY"); h.set("Referrer-Policy", "strict-origin-when-cross-origin"); h.set("Cross-Origin-Opener-Policy", "same-origin"); h.set("Cross-Origin-Resource-Policy", "same-origin"); h.set("Cross-Origin-Embedder-Policy", "require-corp"); h.set("Permissions-Policy", STANDARD_PERMISSIONS_POLICY); h.set("X-Permitted-Cross-Domain-Policies", "none"); h.set("X-DNS-Prefetch-Control", "off"); h.set("X-Robots-Tag", "noindex, nofollow"); h.set("Cache-Control", "no-store, no-transform"); return h; }
function corsHeaders(env, request) { const allowed = loadAllowedOrigins(env); const origin = normalizeOrigin(request.headers.get("Origin") || ""); const h = new Headers(); if (origin && allowed.has(origin)) h.set("Access-Control-Allow-Origin", origin); h.set("Vary", "Origin, Access-Control-Request-Method, Access-Control-Request-Headers"); h.set("Access-Control-Allow-Methods", "POST, OPTIONS"); h.set("Access-Control-Allow-Headers", ["content-type", "accept", HEADER_INTEGRITY, HEADER_CLIENT, HEADER_SESSION].join(", ")); h.set("Access-Control-Expose-Headers", "x-gabo-chatbot-gateway, x-gabo-integrity-verified"); h.set("Access-Control-Max-Age", "600"); return h; }
function json(env, request, status, body, extra = {}) { const h = securityHeaders(extra); corsHeaders(env, request).forEach((v, k) => h.set(k, v)); h.set("content-type", "application/json; charset=utf-8"); return new Response(JSON.stringify(body), { status, headers: h }); }
function scanRisk(value) { const text = toStr(value); const reasons = []; let score = 0; for (const sig of RISK_SIGNATURES) { sig.pattern.lastIndex = 0; const matches = text.match(sig.pattern); if (!matches) continue; score += matches.length * sig.weight; reasons.push(sig.label); } const punctuation = text.replace(/[\w\s.,'"@:+/#?!-]/g, "").length; const density = text.length ? punctuation / text.length : 0; if (text.length > 24 && density > 0.22) { score += 10; reasons.push("punctuation-density"); } return { score, reasons: Array.from(new Set(reasons)) }; }
function sanitize(value, max = 1200) { return toStr(value).normalize("NFKC").replace(/```[\s\S]*?```|~~~[\s\S]*?~~~/g, " ").replace(/`[^`\n]{1,500}`/g, " ").replace(/<\s*(script|style|iframe|object|embed|applet|svg|math|template)[\s\S]*?<\s*\/\s*\1\s*>/gi, " ").replace(/<[^>]+>/g, " ").replace(/\bon[a-z]{3,}\s*=\s*("[^"]*"|'[^']*'|[^\s>]*)/gi, " ").replace(/\b(javascript|vbscript|data)\s*:[^\s,;)]*/gi, " ").replace(/\b(eval|Function|setTimeout|setInterval|XMLHttpRequest|fetch|import|export|require)\b/gi, " ").replace(/\b(function|class|const|let|var|return|await|async|def|lambda)\b/gi, " ").replace(/\b(union\s+select|drop\s+table|insert\s+into|delete\s+from|truncate\s+table)\b/gi, " ").replace(/\b(curl|wget|powershell|cmd\.exe|bash|sudo|chmod|rm\s+-rf|node\s+-e|python\s+-c)\b/gi, " ").replace(/(\.\.\/|\$\{|\{\{|<%|%>)/g, " ").replace(/[<>`{}()[\];|\\]/g, " ").replace(/[\u0000-\u001F\u007F]/g, " ").replace(/\s+/g, " ").trim().slice(0, max); }
function hasResidualDanger(value) { const text = toStr(value); return [/<[^>]+>/i,/\bon[a-z]{3,}\s*=/i,/\b(javascript|vbscript|data)\s*:/i,/\beval\s*\(/i,/\bnew\s+Function\b/i,/\bdocument\.(cookie|write)\b/i,/\bunion\s+select\b/i,/\bdrop\s+table\b/i].some((pattern) => pattern.test(text)); }
function luhnCheck(digits) { let sum = 0; let doubleDigit = false; for (let i = digits.length - 1; i >= 0; i--) { let n = Number(digits[i]); if (doubleDigit) { n *= 2; if (n > 9) n -= 9; } sum += n; doubleDigit = !doubleDigit; } return sum % 10 === 0; }
function hasPaymentCardData(value) { const matches = toStr(value).match(/\b(?:\d[ -]?){13,19}\b/g) || []; return matches.some((candidate) => { const digits = candidate.replace(/\D/g, ""); return digits.length >= 13 && digits.length <= 19 && luhnCheck(digits); }); }
async function sha256Hex(value) { const data = new TextEncoder().encode(toStr(value)); const hash = await crypto.subtle.digest("SHA-256", data); return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join(""); }
function canonicalPayload({ chatbot, message, lang, wikiContext, sessionId }) { return JSON.stringify({ chatbot: safeText(chatbot, 64), message: safeText(message, 1200), lang: safeText(lang || "en", 8), wikiContext: safeText(wikiContext || "", 8000), sessionId: safeText(sessionId || "", 160) }); }
function timingSafeEq(a, b) { const x = toStr(a); const y = toStr(b); if (x.length !== y.length) return false; let out = 0; for (let i = 0; i < x.length; i++) out |= x.charCodeAt(i) ^ y.charCodeAt(i); return out === 0; }
function requireBinding(env) { if (!env.graymatter || typeof env.graymatter.fetch !== "function") throw new Error("relay_unavailable"); return env.graymatter; }
function requireSharedSecret(env) { const secret = safeText(env.GRAYMATTER_SHARED_SECRET || "", 500); if (!secret) throw new Error("relay_unavailable"); return secret; }
async function forwardToBinding(env, clean) { const binding = requireBinding(env); const sharedSecret = requireSharedSecret(env); return binding.fetch("https://graymatter.local/api/chat", { method: "POST", headers: { "content-type": "application/json", "accept": "application/json", "x-gabo-hop": PUBLIC_NAME, "x-gabo-shared-secret": sharedSecret }, body: JSON.stringify({ chatbot: CHATBOT_NAME, lang: clean.lang, messages: [{ role: "user", content: clean.message }], context: { page: clean.page, wiki: clean.wikiContext, leadContext: clean.leadContext } }) }); }
function cleanBotReply(value) { const cleaned = sanitize(value, 1600); const risk = scanRisk(cleaned); if (!cleaned || risk.score >= 60 || hasResidualDanger(cleaned)) return "gabo io: I received your message securely. Please use the contact page for a human follow-up."; return cleaned; }
export default { async fetch(request, env) { const url = new URL(request.url); if (request.method === "OPTIONS") { const h = securityHeaders(); corsHeaders(env, request).forEach((v, k) => h.set(k, v)); return new Response(null, { status: 204, headers: h }); }
if (url.pathname === "/" || url.pathname === ROUTES.health) return json(env, request, 200, { ok: true, worker: PUBLIC_NAME, purpose: "gabo io security gateway", routes: { chat: ROUTES.chat, health: ROUTES.health } });
if (url.pathname !== ROUTES.chat) return json(env, request, 404, { ok: false, error: "not_found" });
if (request.method !== "POST") return json(env, request, 405, { ok: false, error: "method_not_allowed" });
const allowed = loadAllowedOrigins(env); const origin = normalizeOrigin(request.headers.get("Origin") || ""); if (!origin || !allowed.has(origin)) return json(env, request, 403, { ok: false, error: "origin_not_allowed" });
const maxBody = Number(env.MAX_BODY_CHARS || 24000); const maxMessage = Number(env.MAX_MESSAGE_CHARS || 1200); const maxWiki = Number(env.MAX_WIKI_CHARS || 8000); const maxRisk = Number(env.MAX_RISK_SCORE || 60);
const raw = await request.text().catch(() => ""); if (!raw) return json(env, request, 400, { ok: false, error: "empty_body" }); if (raw.length > maxBody) return json(env, request, 413, { ok: false, error: "request_too_large" });
let body; try { body = JSON.parse(raw); } catch { return json(env, request, 400, { ok: false, error: "invalid_json" }); }
const honeypot = safeText(body.honeypot || body.website || "", 300); if (honeypot) return json(env, request, 403, { ok: false, error: "session_blocked" });
const rawMessage = toStr(body.message || ""); const rawWiki = toStr(body.wikiContext || ""); const rawLang = safeText(body.lang || "en", 8); const rawSessionId = safeText(body.sessionId || request.headers.get(HEADER_SESSION) || "", 160);
if (hasPaymentCardData(rawMessage) || hasPaymentCardData(rawWiki)) return json(env, request, 403, { ok: false, error: "payment_data_blocked" });
const preRisk = scanRisk([rawMessage, rawWiki].join(" ")); const cleanMessage = sanitize(rawMessage, maxMessage); const cleanWiki = sanitize(rawWiki, maxWiki); const cleanLang = rawLang === "es" ? "es" : "en"; const postRisk = scanRisk([cleanMessage, cleanWiki].join(" "));
if (!cleanMessage) return json(env, request, 400, { ok: false, error: "message_required" });
if (preRisk.score >= maxRisk || postRisk.score >= maxRisk || hasResidualDanger(cleanMessage) || hasResidualDanger(cleanWiki)) return json(env, request, 403, { ok: false, error: "blocked_by_tinyml", reason: "unsafe_input" });
const serverCanonical = canonicalPayload({ chatbot: CHATBOT_NAME, message: cleanMessage, lang: cleanLang, wikiContext: cleanWiki, sessionId: rawSessionId });
const serverIntegrity = await sha256Hex(serverCanonical); const clientIntegrity = safeText(body.integrity || request.headers.get(HEADER_INTEGRITY) || "", 128);
if (!clientIntegrity || !timingSafeEq(clientIntegrity, serverIntegrity)) return json(env, request, 403, { ok: false, error: "integrity_failed" });
const clean = { message: cleanMessage, wikiContext: cleanWiki, lang: cleanLang, sessionId: rawSessionId, page: safeText(body.page || "", 300), leadContext: { source: "gabo_io", origin } };
let upstream; try { upstream = await forwardToBinding(env, clean); } catch { return json(env, request, 502, { ok: false, error: "relay_unavailable" }); }
if (!upstream.ok) return json(env, request, 502, { ok: false, error: "relay_error" });
let data = {}; try { data = await upstream.json(); } catch { data = {}; }
const reply = cleanBotReply(data.reply || data.message || "");
return json(env, request, 200, { ok: true, reply, integrity: serverIntegrity }, { "x-gabo-chatbot-gateway": "1", "x-gabo-integrity-verified": "1" }); } };
