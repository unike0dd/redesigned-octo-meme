#!/usr/bin/env node
/**
 * PURGE archive
 *
 * This is the single purge document for disconnected findings. It stores only
 * neutral audit metadata so removed runtime fragments are not duplicated here
 * and this archive does not retain source paths, URLs, or live references.
 */
"use strict";

const PURGE_FINDINGS = Object.freeze([
  Object.freeze({
    id: "unused-letter-scramble-animation",
    category: "untriggered-ui-animation",
    reason:
      "Archived because no active page trigger exists for the animation target selector.",
    action: "removed-from-runtime",
    archivedAt: "2026-05-09",
    sourceReferencesRemoved: true,
  }),
  Object.freeze({
    id: "server-header-diagnostics-in-client-bundle",
    category: "server-only-policy-metadata",
    reason:
      "Archived because browser code cannot apply server response headers or use server CORS metadata directly.",
    action: "removed-from-runtime",
    archivedAt: "2026-05-15",
    sourceReferencesRemoved: true,
  }),
  Object.freeze({
    id: "orphaned-generic-secure-form-runtime",
    category: "superseded-form-security-runtime",
    reason:
      "Archived because page-specific protection relays own the active form triggers, leaving the generic runtime without an active path.",
    action: "removed-from-runtime",
    archivedAt: "2026-05-15",
    sourceReferencesRemoved: true,
  }),
]);

function listPurgeFindings() {
  return PURGE_FINDINGS.map((finding) => ({ ...finding }));
}

if (require.main === module) {
  process.stdout.write(`${JSON.stringify(listPurgeFindings(), null, 2)}\n`);
}

module.exports = { PURGE_FINDINGS, listPurgeFindings };
