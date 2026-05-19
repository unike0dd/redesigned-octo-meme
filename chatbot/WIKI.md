# gabo io Wiki (EN + ES)

This wiki is **chatbot-only knowledge** for CX and lead generation.

## Scripts (centralized to 3 only)
- `tools/go-to.mjs`: canonical go-to generator script.
- `tools/chatbot-wiki.mjs`: compatibility entrypoint that runs the canonical script.
- `tools/built-wiki.js`: compatibility entrypoint that runs the canonical script.

## Generated files
- `chatbot/wiki.json`: generated EN/ES knowledge base consumed by `chatbot/embed.js`.
- `chatbot/wiki-index.json`: generated EN/ES compact index for fast lookup.

## Update workflow
Whenever website copy is updated, regenerate the chatbot wiki:

```bash
node tools/go-to.mjs
```

This rebuilds EN/ES knowledge from:
- `assets/i18n.js` translations,
- all public website HTML page text digests.

The chatbot loads `/chatbot/wiki.json`, caches it client-side, and uses it first for answers before endpoint fallback.
