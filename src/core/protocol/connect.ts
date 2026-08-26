import { PrettyAuiError } from "../errors.js";
import type {
  AcpConnector,
  AcpProtocolPolicy,
  AcpProtocolVersion,
  AcpWireMessage,
  AcpWireStream,
  ChatHost,
  ClientInfo,
} from "../types.js";
import type { ProtocolDriver, ProtocolSink } from "./types.js";
import { connectV1 } from "./v1.js";

export interface ConnectProtocolOptions {
  readonly connector: AcpConnector;
  readonly protocol: AcpProtocolPolicy;
  readonly signal: AbortSignal;
  readonly sink: ProtocolSink;
  readonly clientInfo: Required<Pick<ClientInfo, "name" | "version">> &
    Pick<ClientInfo, "title">;
  readonly host?: ChatHost;
}

export async function connectProtocol(
  options: ConnectProtocolOptions,
): Promise<ProtocolDriver> {
  if (options.protocol === 1) return connectVersion(1, 1, options);
  if (options.protocol === 2) return connectVersion(2, 1, options);

  const original = await options.connector.open({
    protocol: 2,
    attempt: 1,
    signal: options.signal,
  });
  const observed = observeInitialize(original);
  try {
    return await connectV2Dynamic(observed.stream, options);
  } catch (error) {
    if (observed.negotiatedVersion() !== 1) throw error;
    await closeStream(original);
    return connectVersion(1, 2, options);
  }
}

async function connectVersion(
  version: AcpProtocolVersion,
  attempt: number,
  options: ConnectProtocolOptions,
): Promise<ProtocolDriver> {
  const stream = await options.connector.open({
    protocol: version,
    attempt,
    signal: options.signal,
  });
  if (options.signal.aborted) {
    await closeStream(stream);
    throw new PrettyAuiError("CONNECTION_CLOSED", "Connection was cancelled", {
      protocol: version,
      retryable: true,
    });
  }
  if (version === 1) {
    return connectV1({
      stream,
      sink: options.sink,
      clientInfo: options.clientInfo,
      ...(options.host ? { host: options.host } : {}),
    });
  }
  return connectV2Dynamic(stream, options);
}

async function connectV2Dynamic(
  stream: AcpWireStream,
  options: ConnectProtocolOptions,
): Promise<ProtocolDriver> {
  const { connectV2 } = await import("./v2.js");
  return connectV2({
    stream,
    sink: options.sink,
    clientInfo: options.clientInfo,
    ...(options.host ? { host: options.host } : {}),
  });
}

interface ObservedStream {
  readonly stream: AcpWireStream;
  negotiatedVersion(): number | undefined;
}

function observeInitialize(source: AcpWireStream): ObservedStream {
  let initializeId: unknown;
  let version: number | undefined;
  const writable = source.writable;
  const readable = source.readable;
  const wrappedWritable = new WritableStream<AcpWireMessage>({
    async write(message) {
      const request = findInitializeRequest(message);
      if (request) initializeId = request.id;
      const writer = writable.getWriter();
      try {
        await writer.write(message);
      } finally {
        writer.releaseLock();
      }
    },
    async close() {
      const writer = writable.getWriter();
      try {
        await writer.close();
      } finally {
        writer.releaseLock();
      }
    },
    async abort(reason) {
      const writer = writable.getWriter();
      try {
        await writer.abort(reason);
      } finally {
        writer.releaseLock();
      }
    },
  });
  const wrappedReadable = readable.pipeThrough(
    new TransformStream<AcpWireMessage, AcpWireMessage>({
      transform(message, controller) {
        const messages = Array.isArray(message) ? message : [message];
        for (const candidate of messages) {
          if (
            !isRecord(candidate) ||
            candidate.id !== initializeId ||
            !isRecord(candidate.result)
          )
            continue;
          if (typeof candidate.result.protocolVersion === "number")
            version = candidate.result.protocolVersion;
        }
        controller.enqueue(message);
      },
    }),
  );
  return {
    stream: { readable: wrappedReadable, writable: wrappedWritable },
    negotiatedVersion: () => version,
  };
}

function findInitializeRequest(
  message: unknown,
): { readonly id: unknown } | undefined {
  const messages = Array.isArray(message) ? message : [message];
  for (const candidate of messages) {
    if (
      isRecord(candidate) &&
      candidate.method === "initialize" &&
      Object.hasOwn(candidate, "id")
    ) {
      return { id: candidate.id };
    }
  }
  return undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function closeStream(stream: AcpWireStream): Promise<void> {
  try {
    const writer = stream.writable.getWriter();
    try {
      await writer.close();
    } finally {
      writer.releaseLock();
    }
  } catch {
    // The failed protocol adapter may already have closed the transport.
  }
}
