import { PrettyAuiError } from "../errors.js";
import { connectV1 } from "./v1.js";
export async function connectProtocol(options) {
    if (options.protocol === 1)
        return connectVersion(1, 1, options);
    if (options.protocol === 2)
        return connectVersion(2, 1, options);
    const original = await options.connector.open({
        protocol: 2,
        attempt: 1,
        signal: options.signal,
    });
    const observed = observeInitialize(original);
    try {
        return await connectV2Dynamic(observed.stream, options);
    }
    catch (error) {
        if (observed.negotiatedVersion() !== 1)
            throw error;
        await closeStream(original);
        return connectVersion(1, 2, options);
    }
}
async function connectVersion(version, attempt, options) {
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
async function connectV2Dynamic(stream, options) {
    const { connectV2 } = await import("./v2.js");
    return connectV2({
        stream,
        sink: options.sink,
        clientInfo: options.clientInfo,
        ...(options.host ? { host: options.host } : {}),
    });
}
function observeInitialize(source) {
    let initializeId;
    let version;
    const writable = source.writable;
    const readable = source.readable;
    const wrappedWritable = new WritableStream({
        async write(message) {
            const request = findInitializeRequest(message);
            if (request)
                initializeId = request.id;
            const writer = writable.getWriter();
            try {
                await writer.write(message);
            }
            finally {
                writer.releaseLock();
            }
        },
        async close() {
            const writer = writable.getWriter();
            try {
                await writer.close();
            }
            finally {
                writer.releaseLock();
            }
        },
        async abort(reason) {
            const writer = writable.getWriter();
            try {
                await writer.abort(reason);
            }
            finally {
                writer.releaseLock();
            }
        },
    });
    const wrappedReadable = readable.pipeThrough(new TransformStream({
        transform(message, controller) {
            const messages = Array.isArray(message) ? message : [message];
            for (const candidate of messages) {
                if (!isRecord(candidate) ||
                    candidate.id !== initializeId ||
                    !isRecord(candidate.result))
                    continue;
                if (typeof candidate.result.protocolVersion === "number")
                    version = candidate.result.protocolVersion;
            }
            controller.enqueue(message);
        },
    }));
    return {
        stream: { readable: wrappedReadable, writable: wrappedWritable },
        negotiatedVersion: () => version,
    };
}
function findInitializeRequest(message) {
    const messages = Array.isArray(message) ? message : [message];
    for (const candidate of messages) {
        if (isRecord(candidate) &&
            candidate.method === "initialize" &&
            Object.hasOwn(candidate, "id")) {
            return { id: candidate.id };
        }
    }
    return undefined;
}
function isRecord(value) {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}
async function closeStream(stream) {
    try {
        const writer = stream.writable.getWriter();
        try {
            await writer.close();
        }
        finally {
            writer.releaseLock();
        }
    }
    catch {
        // The failed protocol adapter may already have closed the transport.
    }
}
//# sourceMappingURL=connect.js.map