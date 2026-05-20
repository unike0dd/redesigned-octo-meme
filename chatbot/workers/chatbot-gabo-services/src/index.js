import { STANDARD_PERMISSIONS_POLICY, STANDARD_SECURITY_HEADERS, toStr, safeText, normalizeOrigin } from "../../shared-common.js";

const PUBLIC_NAME = "chatbot.gabo.services";
const CHATBOT_NAME = "gabo io";
const HEADER_INTEGRITY = "x-gabo-integrity-sha256";
const HEADER_CLIENT = "x-gabo-client";
const HEADER_SESSION = "x-gabo-session-id";
const HEADER_REPO_SYNC = "x-gabo-repo-sync";
const HEADER_ASSET_ID = "x-ops-asset-id";

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
  { label: "eval", weight: 20, pattern: /\b(eval|Function|setTimeout|setInterval)\s*\(/gi }
]);

function loadContract(env) {
  try {
    const raw = safeText(env.CHATBOT_REPO_CONTRACT_JSON || "", 50000);
    if (!raw) throw new Error("missing_contract");
    const parsed = JSON.parse(raw);
    return parsed;
  } catch {
    return null;
  }
}

function securityHeaders(extra = {}) { const h = new Headers(extra); h.set("Content-Security-Policy", CSP); Object.entries(STANDARD_SECURITY_HEADERS).forEach(([key, value]) => h.set(key, value)); h.set("Permissions-Policy", STANDARD_PERMISSIONS_POLICY); h.set("Cross-Origin-Embedder-Policy", "require-corp"); return h; }
function corsHeaders(contract, request) { const allowed = new Set((contract?.repo?.allowedOrigins || []).map((x) => normalizeOrigin(x))); const origin = normalizeOrigin(request.headers.get("Origin") || ""); const h = new Headers(); if (origin && allowed.has(origin)) h.set("Access-Control-Allow-Origin", origin); h.set("Vary", "Origin"); h.set("Access-Control-Allow-Methods", (contract?.cors?.allowedMethods || ["POST", "OPTIONS"]).join(", ")); h.set("Access-Control-Allow-Headers", (contract?.cors?.allowedRequestHeaders || ["content-type", "accept", HEADER_INTEGRITY, HEADER_CLIENT, HEADER_SESSION, HEADER_REPO_SYNC, HEADER_ASSET_ID]).join(", ")); h.set("Access-Control-Expose-Headers", (contract?.cors?.exposedResponseHeaders || ["x-gabo-chatbot-gateway", "x-gabo-integrity-verified", "x-gabo-repo-sync-verified"]).join(", ")); h.set("Access-Control-Max-Age", String(Number(contract?.cors?.maxAgeSeconds || 86400))); return h; }
function json(contract, request, status, body, extra = {}) { const h = securityHeaders(extra); corsHeaders(contract, request).forEach((v, k) => h.set(k, v)); h.set("content-type", "application/json; charset=utf-8"); return new Response(JSON.stringify(body), { status, headers: h }); }
function scanRisk(value) { const text = toStr(value); let score = 0; for (const sig of RISK_SIGNATURES) { sig.pattern.lastIndex = 0; const matches = text.match(sig.pattern); if (!matches) continue; score += matches.length * sig.weight; } return { score }; }
function sanitize(value, max = 1200) { return toStr(value).normalize("NFKC").replace(/```[\s\S]*?```|~~~[\s\S]*?~~~/g, " ").replace(/`[^`\n]{1,500}`/g, " ").replace(/<\s*(script|style|iframe|object|embed|applet|svg|math|template)[\s\S]*?<\s*\/\s*\1\s*>/gi, " ").replace(/<[^>]+>/g, " ").replace(/\bon[a-z]{3,}\s*=\s*("[^"]*"|'[^']*'|[^\s>]*)/gi, " ").replace(/\b(javascript|vbscript|data)\s*:[^\s,;)]*/gi, " ").replace(/[<>`{}()[\];|\\]/g, " ").replace(/[\u0000-\u001F\u007F]/g, " ").replace(/\s+/g, " ").trim().slice(0, max); }
async function sha256Hex(value) { const data = new TextEncoder().encode(toStr(value)); const hash = await crypto.subtle.digest("SHA-256", data); return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join(""); }
function canonicalPayload({ chatbot, message, lang, wikiContext, sessionId }) { return JSON.stringify({ chatbot: safeText(chatbot, 64), message: safeText(message, 1200), lang: safeText(lang || "en", 8), wikiContext: safeText(wikiContext || "", 8000), sessionId: safeText(sessionId || "", 160) }); }
function timingSafeEq(a, b) { const x = toStr(a); const y = toStr(b); if (x.length !== y.length) return false; let out = 0; for (let i = 0; i < x.length; i++) out |= x.charCodeAt(i) ^ y.charCodeAt(i); return out === 0; }
function requireBinding(env) { if (!env.graymatter || typeof env.graymatter.fetch !== "function") throw new Error("relay_unavailable"); return env.graymatter; }
function requireSharedSecret(env) { const secret = safeText(env.GRAYMATTER_SHARED_SECRET || "", 500); if (!secret) throw new Error("relay_unavailable"); return secret; }
async function forwardToBinding(env, clean) { const binding = requireBinding(env); const sharedSecret = requireSharedSecret(env); return binding.fetch("https://graymatter.local/api/chat", { method: "POST", headers: { "content-type": "application/json", "accept": "application/json", "x-gabo-hop": PUBLIC_NAME, "x-gabo-shared-secret": sharedSecret }, body: JSON.stringify({ chatbot: CHATBOT_NAME, lang: clean.lang, messages: [{ role: "user", content: clean.message }], context: { page: clean.page, wiki: clean.wikiContext, leadContext: clean.leadContext } }) }); }

export default { async fetch(request, env) {
  const contract = loadContract(env);
  if (!contract) return json({}, request, 503, { ok: false, error: "sync_not_configured" });
  const url = new URL(request.url);

  if (request.method === "OPTIONS" && url.pathname === contract.publicWorker.chatApi) {
    const h = securityHeaders();
    corsHeaders(contract, request).forEach((v, k) => h.set(k, v));
    return new Response(null, { status: 204, headers: h });
  }

  if (url.pathname === contract.publicWorker.healthApi || url.pathname === "/") {
    return json(contract, request, 200, { ok: true, worker: PUBLIC_NAME, api: contract.publicWorker.chatApi, repoSync: contract.repo.repoSync, assetId: contract.repo.assetId, ioProConfigured: Boolean(safeText(env.IO_PRO || "", 1)) });
  }

  if (url.pathname !== contract.publicWorker.chatApi) return json(contract, request, 404, { ok: false, error: "not_found" });
  if (request.method !== "POST") return json(contract, request, 405, { ok: false, error: "method_not_allowed" });

  const origin = normalizeOrigin(request.headers.get("Origin") || "");
  const allowed = new Set((contract.repo.allowedOrigins || []).map((x) => normalizeOrigin(x)));
  if (!origin) return json(contract, request, 403, { ok: false, error: "request_blocked" });
  if (!allowed.has(origin)) return json(contract, request, 403, { ok: false, error: "request_blocked" });
  if (!safeText(env.IO_PRO || "", 2048)) return json(contract, request, 503, { ok: false, error: "sync_not_configured" });

  const clientName = safeText(request.headers.get("X-Gabo-Client"), 64);
  const repoSync = safeText(request.headers.get("X-Gabo-Repo-Sync"), 64);
  const assetId = safeText(request.headers.get("X-Ops-Asset-Id"), 120);
  const sessionId = safeText(request.headers.get("X-Gabo-Session-Id"), 160);
  const headerIntegrity = safeText(request.headers.get("X-Gabo-Integrity-SHA256"), 128);
  if (clientName !== safeText(contract.repo.clientName, 64)) return json(contract, request, 403, { ok: false, error: "request_blocked" });
  if (repoSync !== safeText(contract.repo.repoSync, 64)) return json(contract, request, 403, { ok: false, error: "request_blocked" });
  if (assetId !== safeText(contract.repo.assetId, 120)) return json(contract, request, 403, { ok: false, error: "request_blocked" });
  if (!sessionId || !headerIntegrity) return json(contract, request, 403, { ok: false, error: "request_blocked" });

  const maxBody = Number(contract.limits?.maxBodyChars || 24000);
  const maxMessage = Number(contract.limits?.maxMessageChars || 1200);
  const maxWiki = Number(contract.limits?.maxWikiChars || 8000);
  const maxRisk = Number(contract.limits?.maxRiskScore || 60);
  const raw = await request.text().catch(() => "");
  if (!raw || raw.length > maxBody) return json(contract, request, 400, { ok: false, error: "request_blocked" });

  let body;
  try { body = JSON.parse(raw); } catch { return json(contract, request, 400, { ok: false, error: "request_blocked" }); }
  const required = contract.repoRequestBody?.requiredFields || [];
  if (!required.every((key) => Object.prototype.hasOwnProperty.call(body || {}, key))) return json(contract, request, 400, { ok: false, error: "request_blocked" });

  const honeypot = safeText(body.honeypot || body.website || "", 300);
  if (honeypot) return json(contract, request, 403, { ok: false, error: "request_blocked" });

  const cleanMessage = sanitize(body.message || "", maxMessage);
  const cleanWiki = sanitize(body.wikiContext || "", maxWiki);
  const cleanLang = safeText(body.lang || "en", 8);
  const risk = scanRisk(`${cleanMessage} ${cleanWiki}`);
  if (!cleanMessage || risk.score >= maxRisk) return json(contract, request, 403, { ok: false, error: "request_blocked" });

  const canonical = canonicalPayload({ chatbot: body.chatbot, message: cleanMessage, lang: cleanLang, wikiContext: cleanWiki, sessionId: safeText(body.sessionId || sessionId, 160) });
  const serverIntegrity = await sha256Hex(canonical);
  const clientIntegrity = safeText(body.integrity || headerIntegrity, 128);
  if (!clientIntegrity || !timingSafeEq(clientIntegrity, serverIntegrity)) return json(contract, request, 403, { ok: false, error: "request_blocked" });

  const clean = { message: cleanMessage, wikiContext: cleanWiki, lang: cleanLang, sessionId, page: safeText(body.page || "", 300), leadContext: body.leadContext || {} };
  let upstream; try { upstream = await forwardToBinding(env, clean); } catch { return json(contract, request, 502, { ok: false, error: "request_blocked" }); }
  if (!upstream.ok) return json(contract, request, 502, { ok: false, error: "request_blocked" });
  let data = {}; try { data = await upstream.json(); } catch { data = {}; }
  const reply = sanitize(data.reply || data.message || "", 1600) || "gabo io: I received your message securely. Please use the contact page for a human follow-up.";
  return json(contract, request, 200, { ok: true, reply, integrity: serverIntegrity }, { "x-gabo-chatbot-gateway": "1", "x-gabo-integrity-verified": "1", "x-gabo-repo-sync-verified": "1" });
} };
