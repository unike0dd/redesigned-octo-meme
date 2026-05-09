const WORKER_NAME = "contacto-gabo-services-worker";
const ACCEPTED_PATHS = new Set(["/", "/health", "/__ops/contact/tinyml"]);
const SHARED_SECRET_HEADER = "X-Gabo-Repo-To-TinyML-Secret";

const SECURITY_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store, no-transform",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Cross-Origin-Resource-Policy": "same-site"
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (!ACCEPTED_PATHS.has(url.pathname)) {
      return jsonResponse(404, {
        ok: false,
        worker: WORKER_NAME,
        message: "Not found."
      });
    }

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: SECURITY_HEADERS
      });
    }

    if (url.pathname === "/" || url.pathname === "/health") {
      return jsonResponse(200, {
        ok: true,
        worker: WORKER_NAME,
        message: "Contact TinyML worker is healthy."
      });
    }

    if (request.method !== "POST") {
      return jsonResponse(405, {
        ok: false,
        worker: WORKER_NAME,
        message: "Method not allowed."
      });
    }

    const identity = validateIdentity(request);

    if (!identity.ok) {
      return jsonResponse(403, {
        ok: false,
        message: identity.message
      });
    }

    const secret = validateRepoToTinyMlSecret(request, env || {});

    if (!secret.ok) {
      return jsonResponse(403, {
        ok: false,
        message: secret.message
      });
    }

    return jsonResponse(200, {
      ok: true,
      worker: WORKER_NAME,
      message: "Contact TinyML handoff accepted.",
      repo_id: identity.repoId
    });
  }
};

function validateIdentity(request) {
  const repoId = cleanText(request.headers.get("X-Gabo-Repo-Id") || "");

  if (repoId !== "CONTACTO") {
    return {
      ok: false,
      message: "Repo identity rejected."
    };
  }

  return {
    ok: true,
    repoId
  };
}

function validateRepoToTinyMlSecret(request, env) {
  const expectedSecret = cleanText(env.CONTACT_REPO_TO_TINYML_SECRET || "");
  const receivedSecret = cleanText(request.headers.get(SHARED_SECRET_HEADER) || "");

  if (!expectedSecret || receivedSecret !== expectedSecret) {
    return {
      ok: false,
      message: "Repo-to-TinyML secret rejected."
    };
  }

  return { ok: true };
}

function jsonResponse(status, payload) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: SECURITY_HEADERS
  });
}

function cleanText(value) {
  return String(value ?? "")
    .normalize("NFKC")
    .replace(/\u0000/g, "")
    .replace(/[\u0001-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
