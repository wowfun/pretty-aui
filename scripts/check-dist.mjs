import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import { bundledLicenseText } from "./bundled-packages.mjs";

const dist = new URL("../dist/", import.meta.url);
const expectedModules = [
  "index.js",
  "index.js.map",
  "index.d.ts",
  "index.d.ts.map",
  "presentation.js",
  "presentation.d.ts",
  "presentation.d.ts.map",
  "core/index.js",
  "core/index.d.ts",
  "core/chat-controller.js",
  "core/chat-controller.d.ts",
  "core/chat-controller.js.map",
  "core/errors.d.ts",
  "core/transport.d.ts",
  "core/types.d.ts",
  "core/protocol/connect.d.ts",
  "core/protocol/interactions.d.ts",
  "core/protocol/normalize.d.ts",
  "core/protocol/types.d.ts",
  "core/protocol/v1.js",
  "core/protocol/v1.d.ts",
  "core/protocol/v2.js",
  "core/protocol/v2.d.ts",
  "react/Chat.js",
  "react/Chat.d.ts",
  "react/index.js",
  "react/index.d.ts",
  "react/types.js",
  "react/types.d.ts",
  "styles.css",
  "styles.css.d.ts",
  "standalone.d.ts.map",
  "standalone/pretty-aui.js",
  "standalone/pretty-aui.js.map",
  "standalone/chunks/types.js",
  "standalone/chunks/v2.js",
  "standalone/chunks/v2.js.map",
  "standalone/LICENSE",
  "standalone/THIRD_PARTY_LICENSES.txt",
];

await Promise.all(expectedModules.map((path) => access(new URL(path, dist))));
await assertMissing("chunks");
await assertMissing("standalone.js");
await assertMissing("standalone/licenses");
assert.equal(
  await readFile(new URL("standalone/THIRD_PARTY_LICENSES.txt", dist), "utf8"),
  await bundledLicenseText(new URL("standalone/", dist)),
);

const [
  indexSource,
  controllerSource,
  chatSource,
  sourceStyles,
  builtStyles,
  standaloneTypes,
  cssTypes,
  packageManifest,
  root,
  core,
  react,
  standalone,
] = await Promise.all([
  readFile(new URL("index.js", dist), "utf8"),
  readFile(new URL("core/chat-controller.js", dist), "utf8"),
  readFile(new URL("react/Chat.js", dist), "utf8"),
  readFile(new URL("../src/styles.css", import.meta.url), "utf8"),
  readFile(new URL("styles.css", dist), "utf8"),
  readFile(new URL("standalone.d.ts", dist), "utf8"),
  readFile(new URL("styles.css.d.ts", dist), "utf8"),
  readFile(new URL("../package.json", import.meta.url), "utf8").then(
    JSON.parse,
  ),
  import(new URL("index.js", dist).href),
  import(new URL("core/index.js", dist).href),
  import(new URL("react/index.js", dist).href),
  import(new URL("standalone/pretty-aui.js", dist).href),
]);

assert.doesNotMatch(indexSource, /chunks\//);
assert.doesNotMatch(indexSource, /from ["']react(?:\/|["'])/);
assert.match(controllerSource, /export function createChat\(/);
assert.match(chatSource, /export function Chat\(/);
assert.equal(builtStyles, sourceStyles);
assert.doesNotMatch(standaloneTypes, /from ["']react(?:\/|["'])/);
assert.match(standaloneTypes, /\.\/presentation\.js/);
assert.match(cssTypes, /export default stylesheet/);
assert(packageManifest.files.includes("docs"));
assert.equal(root.Chat, undefined);
assert.equal(typeof root.defaultLabels, "object");
assert.equal(typeof root.createChat, "function");
assert.equal(typeof root.PrettyAuiError, "function");
assert.equal(typeof core.createChat, "function");
assert.equal(core.defaultLabels, undefined);
assert.equal(typeof react.Chat, "function");
assert.equal(typeof react.ChatRoot, "function");
assert.equal(typeof react.ChatHeader, "function");
assert.equal(typeof react.ChatTranscript, "function");
assert.equal(typeof react.ChatInteractions, "function");
assert.equal(typeof react.ChatComposer, "function");
assert.equal(typeof react.createChat, "function");
assert.equal(typeof standalone.mountChat, "function");
assert.equal(typeof standalone.createWebSocketConnector, "function");

const coreSources = await javascriptSources(new URL("core/", dist));
for (const [path, source] of coreSources) {
  assert.doesNotMatch(source, /from ["']react(?:\/|["'])/, path);
}

console.log("Distribution smoke check passed");

async function assertMissing(path) {
  try {
    await access(new URL(path, dist));
  } catch (error) {
    if (error && typeof error === "object" && error.code === "ENOENT") return;
    throw error;
  }
  assert.fail(`Unexpected generated file: dist/${path}`);
}

async function javascriptSources(directory) {
  const result = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const url = new URL(
      entry.name + (entry.isDirectory() ? "/" : ""),
      directory,
    );
    if (entry.isDirectory()) result.push(...(await javascriptSources(url)));
    else if (entry.name.endsWith(".js"))
      result.push([url.pathname, await readFile(url, "utf8")]);
  }
  return result;
}
