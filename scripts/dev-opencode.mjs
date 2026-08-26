import { spawn } from "node:child_process";
import { randomBytes } from "node:crypto";
import { resolve } from "node:path";
import { createServer } from "vite";
import { parseDevArgs, parseViteServerArgs } from "./dev-args.mjs";

const projectRoot = resolve(import.meta.dirname, "..");
const executable = process.env.PRETTY_AUI_OPENCODE ?? "opencode";
const bridgeHost = process.env.PRETTY_AUI_ACP_HOST ?? "127.0.0.1";
const bridgePort = parsePort(process.env.PRETTY_AUI_ACP_PORT ?? "7331");
const bridgeToken =
  process.env.PRETTY_AUI_ACP_TOKEN ?? randomBytes(32).toString("base64url");
const bridgeUrl = new URL(`ws://${browserHost(bridgeHost)}:${bridgePort}/acp`);
const liveCwd = process.env.PRETTY_AUI_LIVE_CWD ?? projectRoot;
const { surface, viteArgs } = parseDevArgs(process.argv.slice(2));
const viteOptions = parseViteServerArgs(viteArgs);
const livePath = `/?surface=${surface}`;
const liveConfig = {
  url: bridgeUrl.href,
  protocols: ["pretty-aui-acp", `pretty-aui-token.${bridgeToken}`],
  cwd: liveCwd,
};

let bridge;
let vite;
let shuttingDown = false;

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.once(signal, () => {
    void shutdown(0).then(() => process.exit(0));
  });
}

try {
  await checkOpenCode();
  bridge = spawn(
    process.execPath,
    [resolve(import.meta.dirname, "opencode-ws-bridge.mjs")],
    {
      cwd: projectRoot,
      env: { ...process.env, PRETTY_AUI_ACP_TOKEN: bridgeToken },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  bridge.stdout.pipe(process.stdout);
  bridge.stderr.pipe(process.stderr);
  await waitForBridge(bridge);

  vite = await createServer({
    configFile: resolve(projectRoot, "examples/react/vite.config.ts"),
    force: viteOptions.force,
    plugins: [liveConfigPlugin(liveConfig)],
    server: { ...viteOptions.server, open: livePath },
  });
  await vite.listen();
  vite.printUrls();

  const pageUrl = new URL(livePath, localViteUrl(vite)).href;
  console.log(`pretty-aui OpenCode ready: ${pageUrl}`);

  bridge.once("exit", (code, signal) => {
    if (!shuttingDown) {
      void fail(
        new Error(`OpenCode bridge exited (${signal ?? code ?? "unknown"})`),
      );
    }
  });
} catch (error) {
  await fail(error);
}

async function checkOpenCode() {
  const child = spawn(executable, ["--version"], {
    cwd: projectRoot,
    stdio: ["ignore", "ignore", "pipe"],
  });
  let stderr = "";
  child.stderr.setEncoding("utf8");
  child.stderr.on("data", (chunk) => {
    stderr = (stderr + chunk).slice(-4_000);
  });
  const result = await childResult(child);
  if (result.error) {
    throw new Error(
      `Unable to start OpenCode (${executable}): ${result.error.message}`,
    );
  }
  if (result.code !== 0) {
    throw new Error(
      `OpenCode preflight failed (${result.signal ?? result.code ?? "unknown"})${stderr.trim() ? `: ${stderr.trim()}` : ""}`,
    );
  }
}

function waitForBridge(child, timeout = 10_000) {
  return new Promise((resolvePromise, reject) => {
    let output = "";
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error("Timed out waiting for the OpenCode bridge"));
    }, timeout);
    const read = (chunk) => {
      output = (output + chunk.toString()).slice(-4_000);
      if (output.includes("OpenCode ACP WebSocket bridge:")) {
        cleanup();
        resolvePromise();
      }
    };
    const exited = (code, signal) => {
      cleanup();
      reject(
        new Error(
          `OpenCode bridge exited before readiness (${signal ?? code ?? "unknown"})`,
        ),
      );
    };
    const failed = (error) => {
      cleanup();
      reject(
        new Error(`Unable to start the OpenCode bridge: ${error.message}`),
      );
    };
    const cleanup = () => {
      clearTimeout(timer);
      child.stdout.off("data", read);
      child.off("exit", exited);
      child.off("error", failed);
    };
    child.stdout.on("data", read);
    child.once("exit", exited);
    child.once("error", failed);
  });
}

async function fail(error) {
  console.error(error instanceof Error ? error.message : error);
  await shutdown(1);
  process.exit(1);
}

async function shutdown(exitCode) {
  if (shuttingDown) return;
  shuttingDown = true;
  process.exitCode = exitCode;
  await vite?.close().catch(() => undefined);
  if (bridge && bridge.exitCode === null && bridge.signalCode === null) {
    const exited = childResult(bridge);
    bridge.kill("SIGTERM");
    const result = await Promise.race([
      exited,
      new Promise((resolvePromise) =>
        setTimeout(() => resolvePromise(undefined), 5_000),
      ),
    ]);
    if (!result && bridge.exitCode === null && bridge.signalCode === null) {
      bridge.kill("SIGKILL");
      await exited;
    }
  }
}

function childResult(child) {
  return new Promise((resolvePromise) => {
    const failed = (error) => {
      cleanup();
      resolvePromise({ code: null, signal: null, error });
    };
    const exited = (code, signal) => {
      cleanup();
      resolvePromise({ code, signal, error: undefined });
    };
    const cleanup = () => {
      child.off("error", failed);
      child.off("exit", exited);
    };
    child.once("error", failed);
    child.once("exit", exited);
  });
}

function localViteUrl(server) {
  const url = server.resolvedUrls?.local[0];
  if (!url) throw new Error("Vite did not expose a local development URL");
  return url;
}

function parsePort(value) {
  const port = Number(value);
  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error(`Invalid PRETTY_AUI_ACP_PORT: ${value}`);
  }
  return port;
}

function browserHost(host) {
  if (!host) throw new Error("PRETTY_AUI_ACP_HOST must not be empty");
  if (host !== "localhost" && host !== "127.0.0.1" && host !== "::1") {
    throw new Error("PRETTY_AUI_ACP_HOST must be a loopback address");
  }
  return host.includes(":") ? `[${host}]` : host;
}

function liveConfigPlugin(config) {
  const serialized = JSON.stringify(config).replaceAll("<", "\\u003c");
  return {
    name: "pretty-aui-live-config",
    transformIndexHtml() {
      return [
        {
          tag: "script",
          children: `window.__PRETTY_AUI_LIVE__=${serialized};`,
          injectTo: "head-prepend",
        },
      ];
    },
  };
}
