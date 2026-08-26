import { spawn } from "node:child_process";
import { randomBytes, timingSafeEqual } from "node:crypto";
import { WebSocket, WebSocketServer } from "ws";

const host = process.env.PRETTY_AUI_ACP_HOST ?? "127.0.0.1";
const port = Number(process.env.PRETTY_AUI_ACP_PORT ?? 7331);
const cwd = process.env.PRETTY_AUI_LIVE_CWD ?? process.cwd();
const executable = process.env.PRETTY_AUI_OPENCODE ?? "opencode";
const token =
  process.env.PRETTY_AUI_ACP_TOKEN ?? randomBytes(32).toString("base64url");
const tokenExpiresAt =
  Date.now() +
  Math.min(
    positiveInteger(process.env.PRETTY_AUI_ACP_TOKEN_TTL_MS, 10 * 60 * 1000),
    60 * 60 * 1000,
  );
const acpProtocol = "pretty-aui-acp";
const tokenProtocolPrefix = "pretty-aui-token.";
const allowedOrigins = new Set(
  (process.env.PRETTY_AUI_ACP_ORIGINS ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean),
);
const maxConnections = positiveInteger(
  process.env.PRETTY_AUI_ACP_MAX_CONNECTIONS,
  1,
);
const maxPayload = 1024 * 1024;
const maxStdoutBuffer = 1024 * 1024;
const maxStdinBuffer = 1024 * 1024;
const childEnvironment = { ...process.env };
delete childEnvironment.PRETTY_AUI_ACP_TOKEN;
if (!loopbackHost(host)) {
  throw new Error("PRETTY_AUI_ACP_HOST must be a loopback address");
}
if (!/^[A-Za-z0-9_-]{32,128}$/.test(token)) {
  throw new Error(
    "PRETTY_AUI_ACP_TOKEN must contain 32-128 base64url characters",
  );
}
const server = new WebSocketServer({
  host,
  port,
  path: "/acp",
  maxPayload,
  handleProtocols(protocols) {
    return protocols.has(acpProtocol) ? acpProtocol : false;
  },
  verifyClient(info, done) {
    if (server.clients.size >= maxConnections) {
      done(false, 503, "ACP bridge is busy");
      return;
    }
    const offeredToken = tokenFromProtocols(
      info.req.headers["sec-websocket-protocol"],
    );
    if (
      Date.now() >= tokenExpiresAt ||
      !secureEqual(offeredToken, token) ||
      !originAllowed(info.origin, allowedOrigins) ||
      !loopbackPeer(info.req.socket.remoteAddress)
    ) {
      done(false, 403, "ACP bridge rejected");
      return;
    }
    done(true);
  },
});
const children = new Set();

server.on("connection", (socket) => {
  const child = spawn(executable, ["acp", "--pure", "--cwd", cwd], {
    cwd,
    env: childEnvironment,
    stdio: ["pipe", "pipe", "pipe"],
  });
  children.add(child);
  let stdout = "";
  child.stdout.setEncoding("utf8");
  child.stdout.on("data", (chunk) => {
    stdout += chunk;
    if (Buffer.byteLength(stdout) > maxStdoutBuffer) {
      socket.close(1009, "OpenCode output exceeded the line limit");
      terminateChild(child);
      return;
    }
    while (true) {
      const newline = stdout.indexOf("\n");
      if (newline < 0) break;
      const line = stdout.slice(0, newline).trim();
      stdout = stdout.slice(newline + 1);
      if (line && socket.readyState === WebSocket.OPEN) {
        if (Buffer.byteLength(line) + socket.bufferedAmount > maxStdoutBuffer) {
          socket.close(1009, "ACP output exceeded the bridge buffer limit");
          terminateChild(child);
          return;
        }
        socket.send(line, (error) => {
          if (error) terminateChild(child);
        });
      }
    }
  });
  child.stderr.setEncoding("utf8");
  child.stderr.on("data", (chunk) =>
    process.stderr.write(`[opencode:${child.pid}] ${chunk}`),
  );
  child.stdin.on("error", () => {
    if (socket.readyState === WebSocket.OPEN)
      socket.close(1011, "OpenCode input failed");
    terminateChild(child);
  });
  child.on("exit", (code, signal) => {
    children.delete(child);
    if (socket.readyState === WebSocket.OPEN)
      socket.close(1011, `OpenCode exited (${signal ?? code ?? "unknown"})`);
  });
  child.on("error", (error) => {
    children.delete(child);
    console.error(`Unable to start OpenCode: ${error.message}`);
    if (socket.readyState === WebSocket.OPEN)
      socket.close(1011, "Unable to start OpenCode");
  });
  socket.on("message", (data, binary) => {
    if (binary) {
      socket.close(1003, "ACP requires JSON text frames");
      return;
    }
    const text = data.toString();
    if (
      Buffer.byteLength(text) + 1 + child.stdin.writableLength >
      maxStdinBuffer
    ) {
      socket.close(1009, "ACP input exceeded the bridge buffer limit");
      terminateChild(child);
      return;
    }
    try {
      const value = JSON.parse(text);
      if ((!value || typeof value !== "object") && !Array.isArray(value))
        throw new Error("not an object");
      child.stdin.write(`${text}\n`);
    } catch {
      socket.close(1007, "Invalid ACP JSON");
    }
  });
  socket.on("close", () => terminateChild(child));
  socket.on("error", () => terminateChild(child));
});

server.on("listening", () => {
  console.log(
    `OpenCode ACP WebSocket bridge: ws://${displayHost(host)}:${port}/acp`,
  );
});
server.on("error", (error) => {
  console.error(error);
  process.exitCode = 1;
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.once(signal, () => {
    for (const socket of server.clients) socket.close(1001, "Bridge stopping");
    for (const child of children) terminateChild(child);
    server.close(() => process.exit(0));
  });
}

function tokenFromProtocols(header) {
  if (typeof header !== "string") return undefined;
  const tokens = header
    .split(",")
    .map((value) => value.trim())
    .filter((value) => value.startsWith(tokenProtocolPrefix));
  if (tokens.length !== 1) return undefined;
  return tokens[0].slice(tokenProtocolPrefix.length);
}

function secureEqual(candidate, expected) {
  if (typeof candidate !== "string") return false;
  const candidateBytes = Buffer.from(candidate);
  const expectedBytes = Buffer.from(expected);
  return (
    candidateBytes.length === expectedBytes.length &&
    timingSafeEqual(candidateBytes, expectedBytes)
  );
}

function originAllowed(origin, explicitOrigins) {
  if (!origin) return false;
  if (explicitOrigins.has(origin)) return true;
  try {
    const url = new URL(origin);
    return (
      (url.protocol === "http:" || url.protocol === "https:") &&
      (url.hostname === "localhost" ||
        url.hostname === "127.0.0.1" ||
        url.hostname === "[::1]")
    );
  } catch {
    return false;
  }
}

function loopbackHost(value) {
  return value === "localhost" || value === "127.0.0.1" || value === "::1";
}

function loopbackPeer(address) {
  return (
    address === "127.0.0.1" ||
    address === "::1" ||
    address?.startsWith("::ffff:127.") === true
  );
}

function displayHost(value) {
  return value.includes(":") ? `[${value}]` : value;
}

const terminatingChildren = new WeakSet();

function terminateChild(child) {
  if (
    terminatingChildren.has(child) ||
    child.exitCode !== null ||
    child.signalCode !== null
  ) {
    return;
  }
  terminatingChildren.add(child);
  child.kill("SIGTERM");
  const timer = setTimeout(() => {
    if (child.exitCode === null && child.signalCode === null)
      child.kill("SIGKILL");
  }, 5_000);
  timer.unref();
  const cleanup = () => clearTimeout(timer);
  child.once("exit", cleanup);
  child.once("error", cleanup);
}

function positiveInteger(value, fallback) {
  const parsed = Number(value ?? fallback);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : fallback;
}
