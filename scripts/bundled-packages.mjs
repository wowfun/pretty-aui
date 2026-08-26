import { readFile, readdir } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);

export async function bundledPackages(standaloneDirectory) {
  const sourceMaps = await sourceMapFiles(standaloneDirectory);
  const names = new Set();
  for (const sourceMap of sourceMaps) {
    const parsed = JSON.parse(await readFile(sourceMap, "utf8"));
    for (const source of parsed.sources ?? []) {
      const match = source.match(
        /node_modules\/(?:\.pnpm\/[^/]+\/node_modules\/)?((?:@[^/]+\/)?[^/]+)/,
      );
      if (match?.[1]) names.add(match[1]);
    }
  }
  const sortedNames = [...names].sort();
  const roots = await findPackageRoots(sortedNames);
  return Promise.all(
    sortedNames.map(async (name) => {
      const root = roots.get(name);
      if (!root) throw new Error(`Unable to locate package root for ${name}`);
      const manifest = JSON.parse(
        await readFile(join(root, "package.json"), "utf8"),
      );
      const license = String(manifest.license ?? "UNKNOWN").replace(
        /^\((.*)\)$/,
        "$1",
      );
      return {
        name,
        version: String(manifest.version ?? "UNKNOWN"),
        root,
        license,
        outputName: `${safeSegment(name)}-${safeSegment(license)}.txt`,
      };
    }),
  );
}

async function sourceMapFiles(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const url = new URL(
      entry.name + (entry.isDirectory() ? "/" : ""),
      directory,
    );
    if (entry.isDirectory()) files.push(...(await sourceMapFiles(url)));
    else if (entry.name.endsWith(".js.map")) files.push(url);
  }
  return files;
}

async function findPackageRoots(packageNames) {
  const roots = new Map();
  const unresolved = new Set(packageNames);
  const resolvers = [require];
  while (unresolved.size) {
    let progressed = false;
    for (const packageName of unresolved) {
      const root = await findPackageRoot(packageName, resolvers);
      if (!root) continue;
      roots.set(packageName, root);
      unresolved.delete(packageName);
      resolvers.push(createRequire(join(root, "package.json")));
      progressed = true;
    }
    if (!progressed) {
      throw new Error(
        `Unable to locate package roots for ${[...unresolved].join(", ")}`,
      );
    }
  }
  return roots;
}

async function findPackageRoot(packageName, resolvers) {
  for (const resolver of resolvers) {
    let directory;
    try {
      directory = dirname(resolver.resolve(packageName));
    } catch {
      continue;
    }
    while (true) {
      try {
        const manifest = JSON.parse(
          await readFile(join(directory, "package.json"), "utf8"),
        );
        if (manifest.name === packageName) return directory;
      } catch {
        // Continue toward the package root.
      }
      const parent = dirname(directory);
      if (parent === directory) break;
      directory = parent;
    }
  }
  return undefined;
}

function safeSegment(value) {
  return value.replace(/^@/, "").replaceAll(/[^a-zA-Z0-9.-]+/g, "-");
}
