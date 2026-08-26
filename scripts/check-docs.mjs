import { readFile, readdir, stat } from "node:fs/promises";
import { dirname, extname, resolve } from "node:path";

const root = process.cwd();
const documents = [
  resolve(root, "README.md"),
  ...(await markdownFiles(resolve(root, "docs"))),
];
const failures = [];

for (const document of documents) {
  const source = await readFile(document, "utf8");
  const searchable = source.replace(/```[\s\S]*?```/g, "");
  const inlineLinks = [
    ...searchable.matchAll(/!?\[[^\]]*\]\((<[^>]+>|[^\s)]+)(?:\s+"[^"]*")?\)/g),
  ];
  const referenceLinks = [
    ...searchable.matchAll(/^ {0,3}\[[^\]]+\]:\s*(<[^>]+>|\S+)/gm),
  ];
  for (const match of [...inlineLinks, ...referenceLinks]) {
    const destination = match[1]?.replace(/^<|>$/g, "");
    if (!destination || /^(?:https?:|mailto:)/i.test(destination)) continue;
    const [rawPath, rawAnchor] = destination.split("#", 2);
    const target = rawPath
      ? resolve(dirname(document), decodeURIComponent(rawPath))
      : document;
    if (!(await exists(target))) {
      failures.push(`${relative(document)} -> missing ${destination}`);
      continue;
    }
    if (rawAnchor && extname(target).toLowerCase() === ".md") {
      const targetSource = await readFile(target, "utf8");
      if (!anchors(targetSource).has(decodeURIComponent(rawAnchor))) {
        failures.push(`${relative(document)} -> missing anchor ${destination}`);
      }
    }
  }
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Checked ${documents.length} Markdown documents.`);
}

async function markdownFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await markdownFiles(path)));
    else if (entry.isFile() && entry.name.endsWith(".md")) files.push(path);
  }
  return files.sort();
}

function anchors(source) {
  const result = new Set();
  const counts = new Map();
  for (const match of source.matchAll(/^#{1,6}\s+(.+?)\s*#*$/gm)) {
    const base = slug(match[1] ?? "");
    const count = counts.get(base) ?? 0;
    counts.set(base, count + 1);
    result.add(count ? `${base}-${count}` : base);
  }
  return result;
}

function slug(heading) {
  return heading
    .toLowerCase()
    .replace(/<[^>]*>/g, "")
    .replace(/[\`*_{}\[\]()#+.!,:;?'"/\\&]/g, "")
    .trim()
    .replace(/\s/g, "-");
}

async function exists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

function relative(path) {
  return path.slice(root.length + 1);
}
