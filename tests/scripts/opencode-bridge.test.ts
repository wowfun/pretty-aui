import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import { createServer } from "node:net";
import { resolve } from "node:path";
import { WebSocket } from "ws";

const script = resolve("scripts/opencode-ws-bridge.mjs");
const agentFixture = resolve("tests/fixtures/opencode-bridge-agent.mjs");
const children = new Set<ChildProcessWithoutNullStreams>();
const token = `test-token-${"x".repeat(40)}`;
const tokenProtocol = `pretty-aui-token.${token}`;

afterEach(async () => {
  await Promise.all([...children].map(stopChild));
  children.clear();
});

describe("OpenCode WebSocket bridge boundary", () => {
  it("rejects a connection without the per-process token", async () => {
    const port = await unusedPort();
    startBridge(port, token);
    await waitForBridge(port);

    await expect(connect(port, "/acp", "http://127.0.0.1:5173")).resolves.toBe(
      403,
    );
  });

  it("rejects a browser connection from a non-loopback origin", async () => {
    const port = await unusedPort();
    startBridge(port, token);
    await waitForBridge(port);

    await expect(
      connect(port, `/acp?token=${token}`, "https://evil.example", [
        "pretty-aui-acp",
        tokenProtocol,
      ]),
    ).resolves.toBe(403);
  });

  it("rejects a headerless client even when it has the token", async () => {
    const port = await unusedPort();
    startBridge(port, token);
    await waitForBridge(port);

    await expect(
      connect(port, "/acp", undefined, ["pretty-aui-acp", tokenProtocol]),
    ).resolves.toBe(403);
  });

  it("does not accept the bridge token from the request URL", async () => {
    const port = await unusedPort();
    startBridge(port, token);
    await waitForBridge(port);

    await expect(
      connect(port, `/acp?token=${token}`, "http://127.0.0.1:5173"),
    ).resolves.toBe(403);
  });

  it("does not print the bridge token", async () => {
    const port = await unusedPort();
    const child = startBridge(port, token);

    const output = await waitForBridge(port);

    expect(output).not.toContain(token);
    expect(child.exitCode).toBeNull();
  });

  it("expires the bridge token", async () => {
    const port = await unusedPort();
    startBridge(port, token, { PRETTY_AUI_ACP_TOKEN_TTL_MS: "10" });
    await waitForBridge(port);
    await new Promise((resolvePromise) => setTimeout(resolvePromise, 30));

    await expect(
      connect(port, "/acp", "http://127.0.0.1:5173", [
        "pretty-aui-acp",
        tokenProtocol,
      ]),
    ).resolves.toBe(403);
  });

  it("does not expose the bridge token to the spawned OpenCode process", async () => {
    const port = await unusedPort();
    startBridge(port, token, {
      PRETTY_AUI_OPENCODE: agentFixture,
      PRETTY_AUI_TEST_AGENT_MODE: "report-token",
    });
    await waitForBridge(port);
    const socket = await openSocket(port);

    const message = await nextMessage(socket);

    expect(JSON.parse(message)).toEqual({ token: null });
    socket.close();
  });

  it("contains an OpenCode stdin EPIPE without crashing the bridge", async () => {
    const port = await unusedPort();
    const bridge = startBridge(port, token, {
      PRETTY_AUI_OPENCODE: agentFixture,
      PRETTY_AUI_TEST_AGENT_MODE: "close-stdin",
    });
    await waitForBridge(port);
    const socket = await openSocket(port);
    await nextMessage(socket);
    await new Promise((resolvePromise) => setTimeout(resolvePromise, 50));

    socket.send('{"jsonrpc":"2.0","id":1,"method":"initialize"}');

    const close = await socketClose(socket);
    expect(close.code).toBe(1011);
    expect(bridge.exitCode).toBeNull();
  });

  it("closes a slow browser before WebSocket output becomes unbounded", async () => {
    const port = await unusedPort();
    startBridge(port, token, {
      PRETTY_AUI_OPENCODE: agentFixture,
      PRETTY_AUI_TEST_AGENT_MODE: "flood-stdout",
    });
    await waitForBridge(port);
    const socket = await openSocket(port);
    await nextMessage(socket);
    const networkSocket = (
      socket as unknown as { _socket: { pause(): void; resume(): void } }
    )._socket;
    networkSocket.pause();
    const closing = socketClose(socket);
    await new Promise((resolvePromise) => setTimeout(resolvePromise, 150));
    networkSocket.resume();

    await expect(closing).resolves.toMatchObject({ code: 1009 });
  });
});

function startBridge(
  port: number,
  bridgeToken: string,
  environment: Record<string, string> = {},
): ChildProcessWithoutNullStreams {
  const child = spawn(process.execPath, [script], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      PRETTY_AUI_ACP_PORT: String(port),
      PRETTY_AUI_ACP_TOKEN: bridgeToken,
      PRETTY_AUI_OPENCODE: process.execPath,
      ...environment,
    },
    stdio: "pipe",
  });
  children.add(child);
  return child;
}

async function waitForBridge(port: number): Promise<string> {
  const child = [...children].at(-1);
  if (!child) throw new Error("Bridge process was not started");
  return new Promise<string>((resolvePromise, reject) => {
    let output = "";
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error(`Timed out waiting for bridge:\n${output}`));
    }, 5_000);
    const append = (chunk: Buffer) => {
      output += chunk.toString();
      if (output.includes(`:${port}/acp`)) {
        cleanup();
        resolvePromise(output);
      }
    };
    const cleanup = () => {
      clearTimeout(timer);
      child.stdout.off("data", append);
      child.stderr.off("data", append);
    };
    child.stdout.on("data", append);
    child.stderr.on("data", append);
  });
}

function connect(
  port: number,
  path: string,
  origin: string | undefined,
  protocols: readonly string[] = [],
): Promise<number> {
  return new Promise((resolvePromise, reject) => {
    const socket = new WebSocket(
      `ws://127.0.0.1:${port}${path}`,
      [...protocols],
      origin ? { origin } : {},
    );
    socket.once("unexpected-response", (_request, response) => {
      resolvePromise(response.statusCode ?? 0);
    });
    socket.once("open", () => {
      socket.close();
      resolvePromise(101);
    });
    socket.once("error", reject);
  });
}

function openSocket(port: number): Promise<WebSocket> {
  return new Promise((resolvePromise, reject) => {
    const socket = new WebSocket(
      `ws://127.0.0.1:${port}/acp`,
      ["pretty-aui-acp", tokenProtocol],
      { origin: "http://127.0.0.1:5173" },
    );
    socket.once("open", () => resolvePromise(socket));
    socket.once("error", reject);
  });
}

function nextMessage(socket: WebSocket): Promise<string> {
  return new Promise((resolvePromise, reject) => {
    socket.once("message", (data) => resolvePromise(data.toString()));
    socket.once("error", reject);
  });
}

function socketClose(
  socket: WebSocket,
): Promise<{ readonly code: number; readonly reason: string }> {
  return new Promise((resolvePromise, reject) => {
    const timer = setTimeout(() => {
      socket.terminate();
      reject(new Error("Timed out waiting for bridge socket closure"));
    }, 2_000);
    socket.once("close", (code, reason) => {
      clearTimeout(timer);
      resolvePromise({ code, reason: reason.toString() });
    });
    socket.once("error", reject);
  });
}

async function stopChild(child: ChildProcessWithoutNullStreams): Promise<void> {
  if (child.exitCode !== null || child.signalCode !== null) return;
  const exited = new Promise<void>((resolvePromise) =>
    child.once("exit", () => resolvePromise()),
  );
  child.kill("SIGTERM");
  await exited;
}

async function unusedPort(): Promise<number> {
  const server = createServer();
  await new Promise<void>((resolvePromise, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolvePromise);
  });
  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("Unable to allocate bridge port");
  }
  await new Promise<void>((resolvePromise, reject) =>
    server.close((error) => (error ? reject(error) : resolvePromise())),
  );
  return address.port;
}
