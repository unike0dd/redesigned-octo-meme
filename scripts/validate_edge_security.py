#!/usr/bin/env python3
"""Validate the static host header policy used at the Cloudflare edge."""

from __future__ import annotations

from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
HEADERS_FILE = ROOT / "_headers"


def parse_header_blocks(text: str) -> dict[str, dict[str, str]]:
    blocks: dict[str, dict[str, str]] = {}
    current_route: str | None = None

    for line_number, raw_line in enumerate(text.splitlines(), start=1):
        line = raw_line.rstrip()
        if not line or line.lstrip().startswith("#"):
            continue

        if not line[0].isspace():
            current_route = line.strip()
            if current_route in blocks:
                raise ValueError(f"duplicate route block {current_route!r} on line {line_number}")
            blocks[current_route] = {}
            continue

        if current_route is None:
            raise ValueError(f"header appears before a route block on line {line_number}")

        header = line.strip()
        if ":" not in header:
            raise ValueError(f"malformed header on line {line_number}: {header!r}")
        name, value = header.split(":", 1)
        normalized_name = name.strip().lower()
        if normalized_name in blocks[current_route]:
            raise ValueError(
                f"duplicate {name.strip()!r} header in {current_route!r} on line {line_number}"
            )
        blocks[current_route][normalized_name] = value.strip()

    return blocks


def parse_directives(policy: str) -> dict[str, tuple[str, ...]]:
    directives: dict[str, tuple[str, ...]] = {}
    for raw_directive in policy.split(";"):
        parts = raw_directive.split()
        if not parts:
            continue
        name = parts[0].lower()
        if name in directives:
            raise ValueError(f"duplicate Content-Security-Policy directive: {name}")
        directives[name] = tuple(parts[1:])
    return directives


def require_header(headers: dict[str, str], name: str, expected: str | None = None) -> str:
    value = headers.get(name.lower())
    if value is None:
        raise ValueError(f"missing required edge header: {name}")
    if expected is not None and value.lower() != expected.lower():
        raise ValueError(f"{name} must be {expected!r}, found {value!r}")
    return value


def validate() -> None:
    if not HEADERS_FILE.is_file():
        raise ValueError("the deployment header source `_headers` is missing")

    blocks = parse_header_blocks(HEADERS_FILE.read_text(encoding="utf-8"))
    root_headers = blocks.get("/*")
    if root_headers is None:
        raise ValueError("_headers must define a global /* policy")

    hsts = require_header(root_headers, "Strict-Transport-Security")
    hsts_tokens = {token.strip().lower() for token in hsts.split(";")}
    if not {"includesubdomains", "preload"}.issubset(hsts_tokens):
        raise ValueError("HSTS must include includeSubDomains and preload")
    max_age = next((token for token in hsts_tokens if token.startswith("max-age=")), "")
    try:
        max_age_seconds = int(max_age.split("=", 1)[1])
    except (IndexError, ValueError) as error:
        raise ValueError("HSTS must contain a numeric max-age") from error
    if max_age_seconds < 31_536_000:
        raise ValueError("HSTS max-age must be at least one year")

    exact_headers = {
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        "Referrer-Policy": "strict-origin-when-cross-origin",
        "X-Permitted-Cross-Domain-Policies": "none",
        "Cross-Origin-Opener-Policy": "same-origin",
        "Cross-Origin-Resource-Policy": "same-origin",
        "X-XSS-Protection": "0",
    }
    for name, expected in exact_headers.items():
        require_header(root_headers, name, expected)

    permissions_policy = require_header(root_headers, "Permissions-Policy").lower()
    for disabled_capability in ("camera=()", "geolocation=()", "microphone=()", "payment=()"):
        if disabled_capability not in permissions_policy:
            raise ValueError(f"Permissions-Policy must disable {disabled_capability[:-3]}")

    csp = parse_directives(require_header(root_headers, "Content-Security-Policy"))
    required_csp = {
        "default-src": {"'self'"},
        "base-uri": {"'self'"},
        "object-src": {"'none'"},
        "script-src": {"'self'"},
        "style-src": {"'self'"},
        "worker-src": {"'self'"},
        "manifest-src": {"'self'"},
    }
    for directive, required_values in required_csp.items():
        values = set(csp.get(directive, ()))
        if not values:
            raise ValueError(f"Content-Security-Policy is missing {directive}")
        missing_values = required_values - values
        if missing_values:
            missing = ", ".join(sorted(missing_values))
            raise ValueError(f"Content-Security-Policy {directive} is missing {missing}")

    for valueless_directive in ("upgrade-insecure-requests", "block-all-mixed-content"):
        if valueless_directive not in csp:
            raise ValueError(f"Content-Security-Policy is missing {valueless_directive}")

    cache_expectations = {
        "/assets/*": ("public", "max-age="),
        "/service-worker.js": ("no-store",),
        "/manifest.webmanifest": ("public", "max-age="),
        "/offline.html": ("no-store",),
        "/*.html": ("no-store",),
    }
    for route, expected_tokens in cache_expectations.items():
        route_headers = blocks.get(route)
        if route_headers is None:
            raise ValueError(f"_headers is missing the cache policy for {route}")
        cache_control = require_header(route_headers, "Cache-Control").lower()
        for token in expected_tokens:
            if token not in cache_control:
                raise ValueError(f"{route} Cache-Control must contain {token!r}")

    service_worker_headers = blocks["/service-worker.js"]
    require_header(service_worker_headers, "Service-Worker-Allowed", "/")
    manifest_headers = blocks["/manifest.webmanifest"]
    manifest_type = require_header(manifest_headers, "Content-Type").lower()
    if not manifest_type.startswith("application/manifest+json"):
        raise ValueError("manifest.webmanifest must use application/manifest+json")

    print(
        "Validated Cloudflare-compatible edge policy: "
        f"{len(root_headers)} global headers, {len(csp)} CSP directives, "
        f"and {len(cache_expectations)} cache routes."
    )


if __name__ == "__main__":
    try:
        validate()
    except ValueError as error:
        raise SystemExit(f"Edge security validation failed: {error}") from error
