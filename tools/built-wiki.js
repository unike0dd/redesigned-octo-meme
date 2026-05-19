#!/usr/bin/env node
require('node:child_process').execFileSync(
  process.execPath,
  [require('node:path').join(__dirname, 'go-to.mjs')],
  { stdio: 'inherit' }
);
