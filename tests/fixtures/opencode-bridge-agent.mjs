#!/usr/bin/env node

import { closeSync } from "node:fs";

const mode = process.env.PRETTY_AUI_TEST_AGENT_MODE ?? "idle";

if (mode === "report-token") {
  process.stdout.write(
    `${JSON.stringify({ token: process.env.PRETTY_AUI_ACP_TOKEN ?? null })}\n`,
  );
} else if (mode === "close-stdin") {
  closeSync(0);
  process.stdout.write('{"ready":true}\n');
} else if (mode === "flood-stdout") {
  process.stdout.write('{"ready":true}\n');
  setTimeout(() => {
    const line = `${JSON.stringify({ data: "x".repeat(64 * 1024) })}\n`;
    for (let index = 0; index < 512; index += 1) process.stdout.write(line);
  }, 50);
}

const keepAlive = setInterval(() => undefined, 1_000);
for (const signal of ["SIGINT", "SIGTERM"]) {
  process.once(signal, () => {
    clearInterval(keepAlive);
    process.exit(0);
  });
}
