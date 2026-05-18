(function () {
  "use strict";

  const LIMIT = Object.freeze({
    maxLength: 256,
    maxRiskScore: 60,
    maxSessionBlocks: 1
  });

  const SESSION = Object.freeze({
    blockedKey: "gabo_io_tinyml_blocked_v1",
    reasonKey: "gabo_io_tinyml_reason_v1"
  });

  const RISK_PATTERNS = Object.freeze([
    /<\s*script/i,
    /<\s*\/\s*script/i,
    /javascript\s*:/i,
    /vbscript\s*:/i,
    /data\s*:\s*text\/html/i,
    /\bon[a-z]{3,}\s*=/i,
    /\beval\s*\(/i,
    /\bnew\s+Function\b/i,
    /\bFunction\s*\(/i,
    /\bXMLHttpRequest\b/i,
    /\bfetch\s*\(/i,
    /\b(import|export|require)\b/i,
    /\b(select\s+\*\s+from|union\s+select|drop\s+table|insert\s+into|delete\s+from)\b/i,
    /\b(curl|wget|powershell|cmd\.exe|bash|rm\s+-rf|sudo|chmod)\b/i,
    /\.\.\//,
    /\$\{/,
    /\{\{/,
    /<%/
  ]);

  function cleanText(value) {
    return String(value || "")
      .normalize("NFKC")
      .replace(/[\u0000-\u001F\u007F]/g, " ")
      .replace(/[<>`{}]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, LIMIT.maxLength);
  }

  function sanitizeMessage(value) {
    return cleanText(value)
      .replace(/\bon[a-z]{3,}\s*=/gi, " ")
      .replace(/\b(javascript|vbscript)\s*:/gi, " ")
      .replace(/\b(eval|Function|XMLHttpRequest|fetch|import|export|require)\b/gi, " ")
      .replace(/\b(select\s+\*\s+from|union\s+select|drop\s+table|insert\s+into|delete\s+from)\b/gi, " ")
      .replace(/[;|&$]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function scanRisk(value) {
    const text = String(value || "");
    let score = 0;
    const reasons = [];

    for (const pattern of RISK_PATTERNS) {
      pattern.lastIndex = 0;
      if (pattern.test(text)) {
        score += 15;
        reasons.push("malicious_or_programming_pattern");
      }
    }

    if ((text.match(/https?:\/\//gi) || []).length > 3) {
      score += 15;
      reasons.push("too_many_links");
    }

    return { score, blocked: score >= LIMIT.maxRiskScore, reasons: Array.from(new Set(reasons)) };
  }

  async function sha256(input) {
    const data = new TextEncoder().encode(String(input || ""));
    const hash = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  async function integrityAfterCySec(payload) {
    const canonical = JSON.stringify({
      chatbot: String(payload.chatbot || "gabo io"),
      message: sanitizeMessage(payload.message),
      lang: cleanText(payload.lang || "en")
    });

    return sha256(canonical);
  }

  function checkHoneypot(value) {
    const filled = String(value || "").trim().length > 0;
    if (filled) {
      sessionStorage.setItem(SESSION.blockedKey, String(LIMIT.maxSessionBlocks));
      sessionStorage.setItem(SESSION.reasonKey, "honeypot_triggered");
      return { blocked: true, reason: "honeypot_triggered" };
    }

    return { blocked: false, reason: "" };
  }

  function isSessionBlocked() {
    return sessionStorage.getItem(SESSION.blockedKey) === String(LIMIT.maxSessionBlocks);
  }

  function getBlockReason() {
    return sessionStorage.getItem(SESSION.reasonKey) || "";
  }

  window.GaboIoTinyML = {
    sanitizeMessage,
    scanRisk,
    integrityAfterCySec,
    checkHoneypot,
    isSessionBlocked,
    getBlockReason
  };
})();
