const CONFIG = Object.freeze({
  serviceName: "contact-api-gabo-services",
  customDomain: "contact-api.gabo.services",
  publicBaseUrl: "https://contact-api.gabo.services",
  apiPath: "/api/contact",
});

const RESPONSE_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
};

function jsonResponse(body, init = {}) {
  return new Response(JSON.stringify(body, null, 2), {
    ...init,
    headers: {
      ...RESPONSE_HEADERS,
      ...(init.headers || {}),
    },
  });
}

function serviceMetadata(env = {}) {
  return {
    ok: true,
    service: CONFIG.serviceName,
    customDomain: CONFIG.customDomain,
    publicBaseUrl: CONFIG.publicBaseUrl,
    apiEndpoint: `${CONFIG.publicBaseUrl}${CONFIG.apiPath}`,
    routes: ["/", "/health", CONFIG.apiPath],
    forwardMode: env.CONTACT_FORWARD_URL ? "forward_enabled" : "validate_only",
  };
}

async function forwardContactRequest(request, env) {
  if (!env.CONTACT_FORWARD_URL) {
    return jsonResponse({
      ...serviceMetadata(env),
      accepted: true,
      message: "Contact API validated the request; CONTACT_FORWARD_URL is not configured.",
    }, { status: 202 });
  }

  const response = await fetch(env.CONTACT_FORWARD_URL, {
    method: "POST",
    headers: request.headers,
    body: request.body,
    redirect: "manual",
  });

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });
}

export async function onRequest(context) {
  const request = context.request;
  const env = context.env || {};
  const url = new URL(request.url);

  if (!["/", "/health", CONFIG.apiPath].includes(url.pathname)) {
    return jsonResponse({ ok: false, error: `Use ${CONFIG.apiPath} or /health.` }, { status: 404 });
  }

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: RESPONSE_HEADERS });
  }

  if (request.method === "GET" || request.method === "HEAD") {
    return jsonResponse(serviceMetadata(env));
  }

  if (request.method === "POST" && url.pathname === CONFIG.apiPath) {
    return forwardContactRequest(request, env);
  }

  return jsonResponse({ ok: false, error: "Method not allowed" }, { status: 405 });
}
