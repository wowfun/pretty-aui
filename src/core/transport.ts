import { createHttpStream } from "@agentclientprotocol/sdk/experimental/http-client";
import { createWebSocketStream } from "@agentclientprotocol/sdk/experimental/ws-client";
import { PrettyAuiError } from "./errors.js";
import type {
  AcpConnector,
  AcpWireStream,
  StreamableHttpConnectorOptions,
  WebSocketConnectorOptions,
} from "./types.js";
import { wireMessageWithinBudget } from "./wire-budget.js";

/**
 * Creates an ACP connector backed by the SDK Streamable HTTP transport.
 *
 * Browser CORS and credential rules still apply to the configured endpoint.
 * Redirects are followed only while they remain on the endpoint's origin so
 * caller-provided authorization headers cannot cross an origin boundary.
 */
export function createStreamableHttpConnector(
  url: string,
  options: StreamableHttpConnectorOptions = {},
): AcpConnector {
  const fetchImpl = sameOriginFetch(url, options.fetch ?? globalThis.fetch);
  return {
    open({ signal }) {
      const stream = createHttpStream(url, {
        fetch: fetchImpl,
        ...(options.headers ? { headers: { ...options.headers } } : {}),
        ...(options.cookies ? { cookies: options.cookies } : {}),
      }) as unknown as AcpWireStream;
      return bindLifetime(stream, signal);
    },
  };
}

/**
 * Creates an ACP connector backed by the SDK WebSocket transport.
 *
 * Native browser WebSocket constructors ignore custom request headers. An
 * injected constructor such as Node `ws` may support them.
 */
export function createWebSocketConnector(
  url: string,
  options: WebSocketConnectorOptions = {},
): AcpConnector {
  return {
    open({ signal }) {
      const stream = createWebSocketStream(url, {
        // The SDK always passes its protocols value as WebSocket's second
        // argument. Native browsers stringify an explicit `undefined` to the
        // bogus subprotocol "undefined"; an empty list omits the header.
        protocols: [...(options.protocols ?? [])],
        ...(options.headers ? { headers: { ...options.headers } } : {}),
        ...(options.cookies ? { cookies: options.cookies } : {}),
        ...(options.WebSocket ? { WebSocket: options.WebSocket as never } : {}),
      }) as unknown as AcpWireStream;
      return bindLifetime(stream, signal);
    },
  };
}

function sameOriginFetch(
  endpoint: string,
  fetchImpl: typeof globalThis.fetch | undefined,
): typeof globalThis.fetch {
  if (!fetchImpl) {
    throw new PrettyAuiError(
      "INVALID_CONFIGURATION",
      "Streamable HTTP requires a fetch implementation",
      { phase: "transport/http" },
    );
  }
  const endpointUrl = absoluteUrl(endpoint);
  const guardedFetch: typeof globalThis.fetch = async (input, init) => {
    let requestUrl = requestUrlOf(input, endpointUrl);
    for (let redirects = 0; redirects <= 5; redirects += 1) {
      const response = await fetchImpl(input, { ...init, redirect: "manual" });
      if (response.type === "opaqueredirect") {
        throw new PrettyAuiError(
          "INVALID_CONFIGURATION",
          "ACP HTTP redirects are opaque in browsers; configure a redirect-free endpoint",
          { phase: "transport/redirect" },
        );
      }
      if (!isRedirect(response.status)) return response;
      const location = response.headers.get("location");
      if (!location) return response;
      const redirected = new URL(location, requestUrl);
      if (redirected.origin !== endpointUrl.origin) {
        throw new PrettyAuiError(
          "INVALID_CONFIGURATION",
          `ACP HTTP redirect crossed an origin boundary: ${redirected.origin}`,
          { phase: "transport/redirect" },
        );
      }
      if (redirects === 5) {
        throw new PrettyAuiError(
          "INVALID_CONFIGURATION",
          "ACP HTTP exceeded the redirect limit",
          { phase: "transport/redirect" },
        );
      }
      input = redirected.href;
      requestUrl = redirected;
    }
    throw new Error("Unreachable redirect state");
  };
  return guardedFetch;
}

function bindLifetime(
  stream: AcpWireStream,
  signal: AbortSignal,
): AcpWireStream {
  const reader = stream.readable.getReader();
  const writer = stream.writable.getWriter();
  let readableController: ReadableStreamDefaultController<unknown> | undefined;
  let stopped = false;
  const stop = (reason?: unknown) => {
    if (stopped) return;
    stopped = true;
    signal.removeEventListener("abort", onAbort);
    try {
      readableController?.error(reason);
    } catch {
      // The consumer may already have closed the proxy readable.
    }
    void writer
      .abort(reason)
      .catch(() => reader.cancel(reason))
      .catch(() => undefined);
  };
  const onAbort = () => stop(signal.reason);
  signal.addEventListener("abort", onAbort, { once: true });
  const readable = new ReadableStream<unknown>({
    start(controller) {
      readableController = controller;
      if (signal.aborted) stop(signal.reason);
    },
    async pull(controller) {
      if (stopped) return;
      const result = await reader.read();
      if (result.done) {
        stopped = true;
        signal.removeEventListener("abort", onAbort);
        controller.close();
        return;
      }
      if (!wireMessageWithinBudget(result.value)) {
        stop(
          new PrettyAuiError(
            "PROTOCOL_VIOLATION",
            "ACP wire message exceeded the 2 MiB decoded input limit",
            { phase: "transport/input" },
          ),
        );
        return;
      }
      controller.enqueue(result.value);
    },
    cancel(reason) {
      stop(reason);
    },
  });
  const writable = new WritableStream<unknown>({
    write(message) {
      if (stopped) throw new Error("ACP transport lifetime has ended");
      if (!wireMessageWithinBudget(message)) {
        throw new PrettyAuiError(
          "PROTOCOL_VIOLATION",
          "ACP wire message exceeded the 2 MiB decoded output limit",
          { phase: "transport/output" },
        );
      }
      return writer.write(message);
    },
    async close() {
      if (stopped) return;
      stopped = true;
      signal.removeEventListener("abort", onAbort);
      await writer.close();
    },
    abort(reason) {
      stop(reason);
    },
  });
  return { readable, writable };
}

function absoluteUrl(value: string): URL {
  try {
    return new URL(
      value,
      typeof globalThis.location === "undefined"
        ? undefined
        : globalThis.location.href,
    );
  } catch (cause) {
    throw new PrettyAuiError(
      "INVALID_CONFIGURATION",
      `ACP HTTP endpoint must be an absolute URL: ${value}`,
      { cause, phase: "transport/http" },
    );
  }
}

function requestUrlOf(input: RequestInfo | URL, fallback: URL): URL {
  if (typeof input === "string") return new URL(input, fallback);
  if (input instanceof URL) return input;
  return new URL(input.url, fallback);
}

function isRedirect(status: number): boolean {
  return status >= 300 && status <= 399;
}
