export default {
  async fetch(request, env) {
    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    const url = new URL(request.url);
    if (url.pathname !== (env.API_ROUTE || "/api/gabo-io-chat")) {
      return new Response("Not found", { status: 404 });
    }

    let payload = {};

    try {
      payload = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const message = String(payload.message || "").trim();
    if (!message) {
      return new Response(JSON.stringify({ error: "Message is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const botName = env.CHATBOT_NAME || "gabo io";

    return new Response(
      JSON.stringify({
        reply: `${botName}: Received your message: ${message}`
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
};
