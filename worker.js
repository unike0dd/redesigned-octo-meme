async function sha256(input) {
  const data = new TextEncoder().encode(String(input || ""));
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function sanitizeMessage(value) {
  return String(value || "")
    .normalize("NFKC")
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/[<>`{}]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 256);
}

export default {
  async fetch(request, env) {
    if (request.method !== "POST") return new Response("Method not allowed", { status: 405 });

    const url = new URL(request.url);
    const route = env.API_ROUTE || "/api/gabo-io-chat";
    if (url.pathname !== route) return new Response("Not found", { status: 404 });

    let payload;
    try {
      payload = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    if (String(payload.website || "").trim()) {
      return new Response(JSON.stringify({ error: "Blocked" }), { status: 403, headers: { "Content-Type": "application/json" } });
    }

    const cleanMessage = sanitizeMessage(payload.message);
    if (!cleanMessage) {
      return new Response(JSON.stringify({ error: "Message is required" }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    const canonical = JSON.stringify({ chatbot: "gabo io", message: cleanMessage, lang: "en" });
    const recomputed = await sha256(canonical);
    const provided = String(payload.integrity || request.headers.get("X-Gabo-Integrity-SHA256") || "");

    if (!provided || provided !== recomputed) {
      return new Response(JSON.stringify({ error: "Integrity verification failed" }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ reply: `${env.CHATBOT_NAME || "gabo io"}: Received your message: ${cleanMessage}` }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        "Referrer-Policy": "no-referrer"
      }
    });
  }
};
