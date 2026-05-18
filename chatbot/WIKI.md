# gabo io Wiki (EN + ES)

This wiki is **chatbot-only knowledge** for CX and lead generation.

## Files
- `chatbot/wiki.json`: generated knowledge base consumed by `chatbot/embed.js`.
- `tools/update-chatbot-wiki.mjs`: generator script.

## Update workflow
Whenever website copy is updated, regenerate the chatbot wiki:

```bash
node tools/update-chatbot-wiki.mjs
```

This rebuilds EN/ES knowledge from:
- `assets/i18n.js` translations,
- all public website HTML page text digests.

The chatbot loads `/chatbot/wiki.json`, caches it client-side, and uses it first for answers before endpoint fallback.
