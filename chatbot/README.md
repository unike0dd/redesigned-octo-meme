# gabo io chatbot demo loader

This directory is demo-only. It does not own production chatbot runtime code.

Production pages load and maintain a single source of truth:

1. `assets/main.js` for shared sanitizer/hash utilities.
2. `assets/gabo-io-chatbot.js` for chatbot behavior.
3. `assets/gabo-io-chatbot.css` for chatbot styles.

`gabo-io-chatbot.html` is a minimal loader example that imports those production assets.
Do not add duplicate chatbot JavaScript or CSS copies in this folder.
