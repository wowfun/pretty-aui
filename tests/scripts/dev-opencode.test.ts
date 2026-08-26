import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import { createServer } from "node:net";
import { resolve } from "node:path";

const script = resolve("scripts/dev-opencode.mjs");
const children = new Set<ChildProcessWithoutNullStreams>();

afterEach(async () => {
  await Promise.all(
    [...children].map(async (child) => {
      if (child.exitCode === null && child.signalCode === null) {
        child.kill("SIGTERM");
        await waitForExit(child).catch(() => undefined);
      }
    }),
  );
  children.clear();
});

describe("OpenCode development command", () => {
  it("starts the live page and releases the bridge port on termination", async () => {
    const [port, vitePort] = await unusedPorts(2);
    const bridgeToken = `dev-token-${"x".repeat(40)}`;
    const child = startDev(
      {
        PRETTY_AUI_ACP_PORT: String(port),
        PRETTY_AUI_ACP_TOKEN: bridgeToken,
        PRETTY_AUI_OPENCODE: process.execPath,
      },
      ["--host", "127.0.0.1", "--port", String(vitePort), "--strictPort"],
    );

    const output = await waitForOutput(child, "pretty-aui OpenCode ready:");
    expect(output).toContain(`http://127.0.0.1:${vitePort}/?surface=inline`);
    expect(output).not.toContain(bridgeToken);
    expect(output).not.toContain("live=");
    const page = await fetch(`http://127.0.0.1:${vitePort}/?surface=inline`);
    const html = await page.text();
    expect(html).toContain(bridgeToken);
    expect(html).toContain("pretty-aui-token.");

    child.kill("SIGTERM");
    await expect(waitForExit(child)).resolves.toMatchObject({ code: 0 });
    await expect(canListen(port)).resolves.toBe(true);
  });

  it("passes the OpenCode working directory to the live page", async () => {
    const [port, vitePort] = await unusedPorts(2);
    const liveCwd = resolve("workspace with spaces");
    const child = startDev(
      {
        PRETTY_AUI_ACP_PORT: String(port),
        PRETTY_AUI_LIVE_CWD: liveCwd,
        PRETTY_AUI_OPENCODE: process.execPath,
      },
      ["--host", "127.0.0.1", "--port", String(vitePort), "--strictPort"],
    );

    await waitForOutput(child, "pretty-aui OpenCode ready:");
    const page = await fetch(`http://127.0.0.1:${vitePort}/`);
    expect(await page.text()).toContain(JSON.stringify(liveCwd).slice(1, -1));

    child.kill("SIGTERM");
    await expect(waitForExit(child)).resolves.toMatchObject({ code: 0 });
  });

  it("forwards sidebar, host, and port to the live page server", async () => {
    const [bridgePort, vitePort] = await unusedPorts(2);
    const child = startDev(
      {
        PRETTY_AUI_ACP_PORT: String(bridgePort),
        PRETTY_AUI_OPENCODE: process.execPath,
      },
      [
        "--surface",
        "sidebar",
        "--host",
        "127.0.0.1",
        "--port",
        String(vitePort),
        "--strictPort",
      ],
    );

    const output = await waitForOutput(child, "pretty-aui OpenCode ready:");
    expect(output).toContain(`http://127.0.0.1:${vitePort}/?surface=sidebar`);
    expect(output).not.toContain("live=");

    child.kill("SIGTERM");
    await expect(waitForExit(child)).resolves.toMatchObject({ code: 0 });
  });

  it("fails before starting services when OpenCode is unavailable", async () => {
    const port = await unusedPort();
    const child = startDev({
      PRETTY_AUI_ACP_PORT: String(port),
      PRETTY_AUI_OPENCODE: resolve("does-not-exist-opencode"),
    });
    const output = captureOutput(child);

    await expect(waitForExit(child)).resolves.toMatchObject({ code: 1 });
    expect(output.value).toContain("Unable to start OpenCode");
    await expect(canListen(port)).resolves.toBe(true);
  });

  it("fails instead of changing ports when the bridge port is occupied", async () => {
    const blocker = createServer();
    await new Promise<void>((resolvePromise, reject) => {
      blocker.once("error", reject);
      blocker.listen(0, "127.0.0.1", resolvePromise);
    });
    const address = blocker.address();
    if (!address || typeof address === "string") {
      throw new Error("Unable to reserve a local test port");
    }
    const child = startDev({
      PRETTY_AUI_ACP_PORT: String(address.port),
      PRETTY_AUI_OPENCODE: process.execPath,
    });
    const output = captureOutput(child);

    try {
      await expect(waitForExit(child)).resolves.toMatchObject({ code: 1 });
      expect(output.value).toContain("EADDRINUSE");
    } finally {
      await new Promise<void>((resolvePromise, reject) =>
        blocker.close((error) => (error ? reject(error) : resolvePromise())),
      );
    }
  });

  it("resolves repository paths independently of the caller cwd", async () => {
    const [bridgePort, vitePort] = await unusedPorts(2);
    const child = startDev(
      {
        PRETTY_AUI_ACP_PORT: String(bridgePort),
        PRETTY_AUI_OPENCODE: process.execPath,
      },
      ["--host", "127.0.0.1", "--port", String(vitePort), "--strictPort"],
      "/tmp",
    );

    const output = await waitForOutput(child, "pretty-aui OpenCode ready:");
    expect(output).toContain(`http://127.0.0.1:${vitePort}/?surface=inline`);

    child.kill("SIGTERM");
    await expect(waitForExit(child)).resolves.toMatchObject({ code: 0 });
  });

  it("refuses a non-loopback bridge bind", async () => {
    const port = await unusedPort();
    const child = startDev({
      PRETTY_AUI_ACP_HOST: "0.0.0.0",
      PRETTY_AUI_ACP_PORT: String(port),
      PRETTY_AUI_OPENCODE: process.execPath,
    });
    const output = captureOutput(child);

    await expect(waitForExit(child, 2_000)).resolves.toMatchObject({ code: 1 });
    expect(output.value).toContain("loopback");
  });
});

function startDev(
  environment: Record<string, string>,
  args: readonly string[] = [],
  cwd = process.cwd(),
): ChildProcessWithoutNullStreams {
  const child = spawn(process.execPath, [script, ...args], {
    cwd,
    env: {
      ...process.env,
      BROWSER: "none",
      NO_COLOR: "1",
      ...environment,
    },
    stdio: "pipe",
  });
  children.add(child);
  return child;
}

function waitForOutput(
  child: ChildProcessWithoutNullStreams,
  expected: string,
  timeout = 10_000,
): Promise<string> {
  return new Promise((resolvePromise, reject) => {
    let output = "";
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error(`Timed out waiting for ${expected}:\n${output}`));
    }, timeout);
    const append = (chunk: Buffer) => {
      output += chunk.toString();
      if (output.includes(expected)) {
        cleanup();
        resolvePromise(output);
      }
    };
    const exited = (code: number | null, signal: NodeJS.Signals | null) => {
      cleanup();
      reject(
        new Error(
          `Development command exited before readiness (${signal ?? code}):\n${output}`,
        ),
      );
    };
    const cleanup = () => {
      clearTimeout(timer);
      child.stdout.off("data", append);
      child.stderr.off("data", append);
      child.off("exit", exited);
    };
    child.stdout.on("data", append);
    child.stderr.on("data", append);
    child.once("exit", exited);
  });
}

function captureOutput(child: ChildProcessWithoutNullStreams): {
  readonly value: string;
} {
  let output = "";
  const append = (chunk: Buffer) => {
    output += chunk.toString();
  };
  child.stdout.on("data", append);
  child.stderr.on("data", append);
  return {
    get value() {
      return output;
    },
  };
}

function waitForExit(
  child: ChildProcessWithoutNullStreams,
  timeout = 5_000,
): Promise<{ code: number | null; signal: NodeJS.Signals | null }> {
  if (child.exitCode !== null || child.signalCode !== null) {
    return Promise.resolve({ code: child.exitCode, signal: child.signalCode });
  }
  return new Promise((resolvePromise, reject) => {
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error("Timed out waiting for development command to exit"));
    }, timeout);
    const exited = (code: number | null, signal: NodeJS.Signals | null) => {
      cleanup();
      children.delete(child);
      resolvePromise({ code, signal });
    };
    const cleanup = () => {
      clearTimeout(timer);
      child.off("exit", exited);
    };
    child.once("exit", exited);
  });
}

async function unusedPort(): Promise<number> {
  return (await unusedPorts(1))[0];
}

async function unusedPorts(count: 1): Promise<readonly [number]>;
async function unusedPorts(count: 2): Promise<readonly [number, number]>;
async function unusedPorts(count: number): Promise<readonly number[]> {
  const servers = Array.from({ length: count }, () => createServer());
  try {
    for (const server of servers) {
      await new Promise<void>((resolvePromise, reject) => {
        server.once("error", reject);
        server.listen(0, "127.0.0.1", resolvePromise);
      });
    }
    return servers.map((server) => {
      const address = server.address();
      if (!address || typeof address === "string") {
        throw new Error("Unable to allocate a local test port");
      }
      return address.port;
    });
  } finally {
    await Promise.all(
      servers.map(
        (server) =>
          new Promise<void>((resolvePromise, reject) => {
            if (!server.listening) {
              resolvePromise();
              return;
            }
            server.close((error) => (error ? reject(error) : resolvePromise()));
          }),
      ),
    );
  }
}

async function canListen(port: number): Promise<boolean> {
  const server = createServer();
  return new Promise((resolvePromise) => {
    server.once("error", () => resolvePromise(false));
    server.listen(port, "127.0.0.1", () => {
      server.close(() => resolvePromise(true));
    });
  });
}
