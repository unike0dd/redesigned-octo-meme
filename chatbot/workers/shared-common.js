export const STANDARD_PERMISSIONS_POLICY =
  "accelerometer=(), ambient-light-sensor=(), autoplay=(), battery=(), bluetooth=(), browsing-topics=(), camera=(), display-capture=(), encrypted-media=(), fullscreen=(self), gamepad=(), geolocation=(), gyroscope=(), hid=(), idle-detection=(), local-fonts=(), magnetometer=(), microphone=(), midi=(), otp-credentials=(), payment=(), picture-in-picture=(), publickey-credentials-create=(), publickey-credentials-get=(self), screen-wake-lock=(), serial=(), speaker-selection=(), storage-access=(), usb=(), web-share=(), xr-spatial-tracking=()";

export const STANDARD_SECURITY_HEADERS = Object.freeze({
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Resource-Policy": "same-origin",
  "Permissions-Policy": STANDARD_PERMISSIONS_POLICY,
  "X-Permitted-Cross-Domain-Policies": "none",
  "X-DNS-Prefetch-Control": "off",
  "X-Robots-Tag": "noindex, nofollow",
  "Cache-Control": "no-store, no-transform"
});

export function toStr(value) {
  return typeof value === "string" ? value : value == null ? "" : String(value);
}

export function safeText(value, max = 1200) {
  return toStr(value)
    .normalize("NFKC")
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

export function normalizeOrigin(value) {
  const raw = safeText(value, 300);
  if (!raw || raw === "null") return "";
  try {
    return new URL(raw).origin.toLowerCase();
  } catch {
    return raw.replace(/\/$/, "").toLowerCase();
  }
}

export function parseJsonArrayEnv(env, key, mapFn = (value) => value) {
  try {
    const parsed = JSON.parse(toStr(env[key] || ""));
    if (Array.isArray(parsed) && parsed.length) return parsed.map(mapFn).filter(Boolean);
  } catch {}
  return [];
}
