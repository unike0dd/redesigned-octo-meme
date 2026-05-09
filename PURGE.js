#!/usr/bin/env node
/**
 * PURGE archive
 *
 * This script is intentionally disconnected from the website runtime. It keeps
 * redundant/non-functional code that was removed from active bundles so those
 * lines no longer execute, bind events, or depend on missing page triggers.
 *
 * Run with `node PURGE.js` to inspect the archived fragments. Do not
 * load this file from HTML pages or production workers.
 */
"use strict";

const PURGED_FRAGMENTS = [
  {
    id: "assets-main-service-letter-scramble",
    removedFrom: "assets/main.js",
    reason:
      "Disconnected because no page declares data-scramble targets and the initializer was never called, leaving this animation without a trigger or runtime purpose.",
    disconnected: true,
    archivedAt: "2026-05-09",
    code: String.raw`  function activateServiceLetterScramble() {
    const targets = document.querySelectorAll("[data-scramble]");
    if (!targets.length) return;
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    function randomLetter() {
      return alphabet[Math.floor(Math.random() * alphabet.length)];
    }

    function scrambleToText(node) {
      const finalText = (
        node.dataset.scramble ||
        node.textContent ||
        ""
      ).trim();
      if (!finalText) return;

      let frame = 0;
      const totalFrames = Math.max(20, finalText.replace(/\s/g, "").length * 3);
      const interval = setInterval(() => {
        const revealCount = Math.floor(
          (frame / totalFrames) * finalText.length,
        );
        let output = "";
        for (let i = 0; i < finalText.length; i += 1) {
          const char = finalText[i];
          if (char === " ") {
            output += " ";
          } else if (i < revealCount) {
            output += char;
          } else {
            output += randomLetter();
          }
        }
        node.textContent = output;
        frame += 1;

        if (frame > totalFrames) {
          clearInterval(interval);
          node.textContent = finalText;
        }
      }, 45);
    }

    targets.forEach((node, idx) => {
      const delay = idx * 220;
      const finalText = (
        node.dataset.scramble ||
        node.textContent ||
        ""
      ).trim();

      node.textContent = finalText;
      node.textContent = finalText.replace(/[A-Za-z]/g, () => randomLetter());
      setTimeout(() => scrambleToText(node), delay);
    });
  }
`,
  },
];

function listPurgedFragments() {
  return PURGED_FRAGMENTS.map(
    ({ id, removedFrom, reason, disconnected, archivedAt }) => ({
      id,
      removedFrom,
      reason,
      disconnected,
      archivedAt,
    }),
  );
}

if (require.main === module) {
  process.stdout.write(`${JSON.stringify(listPurgedFragments(), null, 2)}\n`);
}

module.exports = { PURGED_FRAGMENTS, listPurgedFragments };
