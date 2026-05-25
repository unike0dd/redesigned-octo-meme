# gabo io chatbot module

This directory isolates the frontend chatbot module files while preserving the existing website behavior and compatibility.

- `gabo-io-chatbot.js`: chatbot FAB, DOM, language handling, state cache, and request flow.
- `gabo-io-chatbot.css`: chatbot FAB/overlay/layout responsive styles.
- `gabo-io-chatbot.html`: minimal loader example (`main.js` first, then chatbot script).

Production pages load:
1. `assets/main.js`
2. `assets/gabo-io-chatbot.js`

And include `assets/gabo-io-chatbot.css`.
