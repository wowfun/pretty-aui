import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const environment = { ...process.env };
delete environment.FORCE_COLOR;
delete environment.NO_COLOR;

const cliPath = fileURLToPath(import.meta.resolve("@playwright/test/cli"));
const args = process.argv.slice(2);
if (args[0] === "--") {
  args.shift();
}
const result = spawnSync(process.execPath, [cliPath, "test", ...args], {
  env: environment,
  stdio: "inherit",
});

if (result.error) {
  throw result.error;
}

process.exitCode = result.status ?? 1;
