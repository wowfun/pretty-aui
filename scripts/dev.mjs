import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { parseDevArgs } from "./dev-args.mjs";

try {
  const { surface, viteArgs } = parseDevArgs(process.argv.slice(2));
  const vite = fileURLToPath(
    new URL("../node_modules/vite/bin/vite.js", import.meta.url),
  );
  const child = spawn(
    process.execPath,
    [vite, "--config", "examples/react/vite.config.ts", ...viteArgs],
    {
      stdio: "inherit",
      env: { ...process.env, VITE_PRETTY_AUI_SURFACE: surface },
    },
  );
  for (const signal of ["SIGINT", "SIGTERM"]) {
    process.once(signal, () => child.kill(signal));
  }
  child.once("error", (error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
  child.once("exit", (code, signal) => {
    if (signal) process.kill(process.pid, signal);
    else process.exitCode = code ?? 1;
  });
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
