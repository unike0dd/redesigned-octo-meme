# [PURGE] Chatbot Redundancy Archive

This file tracks intentionally removed or quarantined chatbot code that had no unique runtime purpose.

## 2026-05-20

### Removed from `chatbot/embed.js`

```js
async function sha256(input) {
  return hashText(input);
}
```

**Why removed:**
- It was a pure pass-through wrapper around `hashText`.
- It introduced duplicate hashing paths without adding validation, transform logic, or abstraction value.
- `computeIntegrity` now calls `hashText` directly, preserving behavior and reducing surface area.

## Purge policy for this directory
- Keep only code that has a clear trigger/action path (UI event, API call, policy enforcement, telemetry, or state mutation).
- Archive removed snippets here before deleting when they are potentially useful for audit/history.
