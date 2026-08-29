import {
  createStreamableHttpConnector,
  createWebSocketConnector,
  type AcpWireStream,
} from "../../src/core/index.js";

describe("built-in connector boundaries", () => {
  it("omits an undefined browser WebSocket subprotocol", async () => {
    const protocols: (string | string[] | undefined)[] = [];
    const owner = new AbortController();
    const connector = createWebSocketConnector("ws://127.0.0.1/acp", {
      WebSocket: class extends FakeWebSocket {
        constructor(
          _url: string,
          value?: string | string[],
          _options?: { headers?: Record<string, string> },
        ) {
          super();
          protocols.push(value);
        }
      },
    });

    await open(
      connector.open({ protocol: 1, attempt: 1, signal: owner.signal }),
    );
    owner.abort();

    expect(protocols).toEqual([[]]);
  });

  it("closes a WebSocket transport when its owning signal aborts", async () => {
    const sockets: FakeWebSocket[] = [];
    const connector = createWebSocketConnector("ws://127.0.0.1/acp", {
      WebSocket: class extends FakeWebSocket {
        constructor() {
          super();
          sockets.push(this);
        }
      },
    });
    const owner = new AbortController();

    await open(
      connector.open({ protocol: 1, attempt: 1, signal: owner.signal }),
    );
    owner.abort();
    await Promise.resolve();

    expect(sockets).toHaveLength(1);
    expect(sockets[0]?.closeCalls).toBe(1);
  });

  it("never forwards caller auth headers through a cross-origin redirect", async () => {
    const requests: { url: string; authorization: string | null }[] = [];
    const fetch: typeof globalThis.fetch = vi.fn(async (input, init) => {
      const url = String(input);
      requests.push({
        url,
        authorization: new Headers(init?.headers).get("authorization"),
      });
      if (url === "https://trusted.example/acp") {
        if (init?.redirect === "manual") {
          return new Response(null, {
            status: 307,
            headers: { location: "https://evil.example/collect" },
          });
        }
        requests.push({
          url: "https://evil.example/collect",
          authorization: new Headers(init?.headers).get("authorization"),
        });
      }
      return new Response("rejected", { status: 500 });
    });
    const connector = createStreamableHttpConnector(
      "https://trusted.example/acp",
      { fetch, headers: { Authorization: "Bearer secret" } },
    );
    const owner = new AbortController();
    const stream = await open(
      connector.open({ protocol: 1, attempt: 1, signal: owner.signal }),
    );
    const writer = stream.writable.getWriter();

    await expect(
      writer.write({
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: { protocolVersion: 1 },
      }),
    ).rejects.toThrow();
    writer.releaseLock();
    owner.abort();

    expect(requests).toEqual([
      {
        url: "https://trusted.example/acp",
        authorization: "Bearer secret",
      },
    ]);
  });

  it("reports an opaque browser redirect instead of passing it to the ACP SDK", async () => {
    const fetch: typeof globalThis.fetch = vi.fn(
      async () =>
        ({
          body: null,
          headers: new Headers(),
          ok: false,
          redirected: false,
          status: 0,
          statusText: "",
          type: "opaqueredirect",
          url: "https://trusted.example/acp",
        }) as Response,
    );
    const connector = createStreamableHttpConnector(
      "https://trusted.example/acp",
      { fetch },
    );
    const owner = new AbortController();
    const stream = await open(
      connector.open({ protocol: 1, attempt: 1, signal: owner.signal }),
    );
    const writer = stream.writable.getWriter();

    await expect(
      writer.write({ jsonrpc: "2.0", id: 1, method: "initialize" }),
    ).rejects.toMatchObject({
      code: "INVALID_CONFIGURATION",
      phase: "transport/redirect",
    });
    writer.releaseLock();
    owner.abort();
  });

  it("rejects a decoded wire message larger than 2 MiB", async () => {
    const sockets: FakeWebSocket[] = [];
    const connector = createWebSocketConnector("ws://127.0.0.1/acp", {
      WebSocket: class extends FakeWebSocket {
        constructor() {
          super();
          sockets.push(this);
        }
      },
    });
    const owner = new AbortController();
    const stream = await open(
      connector.open({ protocol: 1, attempt: 1, signal: owner.signal }),
    );
    const reader = stream.readable.getReader();
    sockets[0]?.receive(
      JSON.stringify({
        jsonrpc: "2.0",
        method: "session/update",
        params: { text: "x".repeat(2 * 1024 * 1024 + 1) },
      }),
    );

    await expect(reader.read()).rejects.toMatchObject({
      code: "PROTOCOL_VIOLATION",
    });
  });

  it("rejects an outbound decoded wire message larger than 2 MiB", async () => {
    const connector = createWebSocketConnector("ws://127.0.0.1/acp", {
      WebSocket: FakeWebSocket,
    });
    const owner = new AbortController();
    const stream = await open(
      connector.open({ protocol: 1, attempt: 1, signal: owner.signal }),
    );
    const writer = stream.writable.getWriter();

    await expect(
      writer.write({
        jsonrpc: "2.0",
        id: 1,
        method: "session/prompt",
        params: { text: "x".repeat(2 * 1024 * 1024) },
      }),
    ).rejects.toMatchObject({
      code: "PROTOCOL_VIOLATION",
      phase: "transport/output",
    });
    owner.abort();
  });

  it("measures decoded wire string budgets in UTF-8 bytes", async () => {
    const sockets: FakeWebSocket[] = [];
    const connector = createWebSocketConnector("ws://127.0.0.1/acp", {
      WebSocket: class extends FakeWebSocket {
        constructor() {
          super();
          sockets.push(this);
        }
      },
    });
    const owner = new AbortController();
    const stream = await open(
      connector.open({ protocol: 1, attempt: 1, signal: owner.signal }),
    );
    const reader = stream.readable.getReader();
    sockets[0]?.receive(
      JSON.stringify({
        jsonrpc: "2.0",
        method: "session/update",
        params: { text: "😀".repeat(550_000) },
      }),
    );

    await expect(reader.read()).rejects.toMatchObject({
      code: "PROTOCOL_VIOLATION",
    });
  });
});

async function open(
  value: AcpWireStream | Promise<AcpWireStream>,
): Promise<AcpWireStream> {
  return value;
}

class FakeWebSocket extends EventTarget {
  readyState = 0;
  closeCalls = 0;

  send(): void {}

  receive(data: string): void {
    this.dispatchEvent(new MessageEvent("message", { data }));
  }

  close(): void {
    this.closeCalls += 1;
    this.readyState = 3;
    this.dispatchEvent(new Event("close"));
  }
}
