(function () {
  "use strict";

  const LIMIT = Object.freeze({
    maxLength: 256
  });

  const RISK_PATTERNS = Object.freeze([
    /<\s*script/i,
    /javascript\s*:/i,
    /\b(eval|Function|XMLHttpRequest|fetch)\b/i,
    /\b(drop\s+table|union\s+select|rm\s+-rf)\b/i
  ]);

  function sanitizeMessage(value) {
    return String(value || "")
      .normalize("NFKC")
      .replace(/[\u0000-\u001F\u007F]/g, " ")
      .replace(/[<>`{}]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, LIMIT.maxLength);
  }

  function scanRisk(value) {
    const text = String(value || "");
    let score = 0;

    for (const pattern of RISK_PATTERNS) {
      pattern.lastIndex = 0;
      if (pattern.test(text)) score += 25;
    }

    return {
      score,
      blocked: score >= 50
    };
  }

  window.GaboIoTinyML = {
    sanitizeMessage,
    scanRisk
  };
})();
