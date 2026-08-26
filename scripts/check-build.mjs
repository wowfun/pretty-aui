import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";

const dist = new URL("../dist/", import.meta.url);
const before = await snapshot(dist);
const command = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
const child = spawn(command, ["build"], { stdio: "inherit" });
const result = await new Promise((resolvePromise) => {
  child.once("error", (error) => resolvePromise({ error }));
  child.once("exit", (code, signal) => resolvePromise({ code, signal }));
});
if (result.error) throw result.error;
if (result.code !== 0) process.exit(result.code ?? 1);

const after = await snapshot(dist);
const changed = new Set([...before.keys(), ...after.keys()]);
const differences = [...changed]
  .filter((path) => before.get(path) !== after.get(path))
  .sort();
if (differences.length) {
  console.error("Generated dist was stale before the build:");
  for (const path of differences) console.error(`  dist/${path}`);
  process.exitCode = 1;
} else {
  console.log("Generated dist matches a clean rebuild");
}

async function snapshot(directory, prefix = "") {
  const result = new Map();
  let entries;
  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch (error) {
    if (error && typeof error === "object" && error.code === "ENOENT")
      return result;
    throw error;
  }
  for (const entry of entries.sort((left, right) =>
    left.name.localeCompare(right.name),
  )) {
    const path = `${prefix}${entry.name}`;
    const url = new URL(
      entry.name + (entry.isDirectory() ? "/" : ""),
      directory,
    );
    if (entry.isDirectory()) {
      for (const [childPath, hash] of await snapshot(url, `${path}/`))
        result.set(childPath, hash);
    } else if (entry.isFile()) {
      result.set(
        path,
        createHash("sha256")
          .update(await readFile(url))
          .digest("hex"),
      );
    } else {
      result.set(path, `unsupported:${entry.isSymbolicLink()}`);
    }
  }
  return result;
}
