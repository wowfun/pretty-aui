import { createHttpStream } from "@agentclientprotocol/sdk/experimental/http-client";
import { createWebSocketStream } from "@agentclientprotocol/sdk/experimental/ws-client";
import { PrettyAuiError } from "./errors.js";
/**
 * Creates an ACP connector backed by the SDK Streamable HTTP transport.
 *
 * Browser CORS and credential rules still apply to the configured endpoint.
 * Redirects are followed only while they remain on the endpoint's origin so
 * caller-provided authorization headers cannot cross an origin boundary.
 */
export function createStreamableHttpConnector(url, options = {}) {
    const fetchImpl = sameOriginFetch(url, options.fetch ?? globalThis.fetch);
    return {
        open({ signal }) {
            const stream = createHttpStream(url, {
                fetch: fetchImpl,
                ...(options.headers ? { headers: { ...options.headers } } : {}),
                ...(options.cookies ? { cookies: options.cookies } : {}),
            });
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
export function createWebSocketConnector(url, options = {}) {
    return {
        open({ signal }) {
            const stream = createWebSocketStream(url, {
                ...(options.protocols ? { protocols: [...options.protocols] } : {}),
                ...(options.headers ? { headers: { ...options.headers } } : {}),
                ...(options.cookies ? { cookies: options.cookies } : {}),
                ...(options.WebSocket ? { WebSocket: options.WebSocket } : {}),
            });
            return bindLifetime(stream, signal);
        },
    };
}
function sameOriginFetch(endpoint, fetchImpl) {
    if (!fetchImpl) {
        throw new PrettyAuiError("INVALID_CONFIGURATION", "Streamable HTTP requires a fetch implementation", { phase: "transport/http" });
    }
    const endpointUrl = absoluteUrl(endpoint);
    const guardedFetch = async (input, init) => {
        let requestUrl = requestUrlOf(input, endpointUrl);
        for (let redirects = 0; redirects <= 5; redirects += 1) {
            const response = await fetchImpl(input, { ...init, redirect: "manual" });
            if (response.type === "opaqueredirect") {
                throw new PrettyAuiError("INVALID_CONFIGURATION", "ACP HTTP redirects are opaque in browsers; configure a redirect-free endpoint", { phase: "transport/redirect" });
            }
            if (!isRedirect(response.status))
                return response;
            const location = response.headers.get("location");
            if (!location)
                return response;
            const redirected = new URL(location, requestUrl);
            if (redirected.origin !== endpointUrl.origin) {
                throw new PrettyAuiError("INVALID_CONFIGURATION", `ACP HTTP redirect crossed an origin boundary: ${redirected.origin}`, { phase: "transport/redirect" });
            }
            if (redirects === 5) {
                throw new PrettyAuiError("INVALID_CONFIGURATION", "ACP HTTP exceeded the redirect limit", { phase: "transport/redirect" });
            }
            input = redirected.href;
            requestUrl = redirected;
        }
        throw new Error("Unreachable redirect state");
    };
    return guardedFetch;
}
function bindLifetime(stream, signal) {
    const reader = stream.readable.getReader();
    const writer = stream.writable.getWriter();
    let readableController;
    let stopped = false;
    const stop = (reason) => {
        if (stopped)
            return;
        stopped = true;
        signal.removeEventListener("abort", onAbort);
        try {
            readableController?.error(reason);
        }
        catch {
            // The consumer may already have closed the proxy readable.
        }
        void writer
            .abort(reason)
            .catch(() => reader.cancel(reason))
            .catch(() => undefined);
    };
    const onAbort = () => stop(signal.reason);
    signal.addEventListener("abort", onAbort, { once: true });
    const readable = new ReadableStream({
        start(controller) {
            readableController = controller;
            if (signal.aborted)
                stop(signal.reason);
        },
        async pull(controller) {
            if (stopped)
                return;
            const result = await reader.read();
            if (result.done) {
                stopped = true;
                signal.removeEventListener("abort", onAbort);
                controller.close();
                return;
            }
            if (!wireMessageWithinBudget(result.value)) {
                stop(new PrettyAuiError("PROTOCOL_VIOLATION", "ACP wire message exceeded the 2 MiB decoded input limit", { phase: "transport/input" }));
                return;
            }
            controller.enqueue(result.value);
        },
        cancel(reason) {
            stop(reason);
        },
    });
    const writable = new WritableStream({
        write(message) {
            if (stopped)
                throw new Error("ACP transport lifetime has ended");
            return writer.write(message);
        },
        async close() {
            if (stopped)
                return;
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
function absoluteUrl(value) {
    try {
        return new URL(value, typeof globalThis.location === "undefined"
            ? undefined
            : globalThis.location.href);
    }
    catch (cause) {
        throw new PrettyAuiError("INVALID_CONFIGURATION", `ACP HTTP endpoint must be an absolute URL: ${value}`, { cause, phase: "transport/http" });
    }
}
function requestUrlOf(input, fallback) {
    if (typeof input === "string")
        return new URL(input, fallback);
    if (input instanceof URL)
        return input;
    return new URL(input.url, fallback);
}
function isRedirect(status) {
    return status >= 300 && status <= 399;
}
function wireMessageWithinBudget(value) {
    let bytes = 0;
    let nodes = 0;
    const seen = new WeakSet();
    const pending = [{ value, depth: 0 }];
    while (pending.length) {
        const current = pending.pop();
        if (!current)
            break;
        nodes += 1;
        if (nodes > 32_768 || current.depth > 64)
            return false;
        if (typeof current.value === "string") {
            bytes += utf8ByteLength(current.value, 2 * 1024 * 1024 - bytes);
        }
        else if (typeof current.value === "number") {
            bytes += 8;
        }
        else if (current.value !== null && typeof current.value === "object") {
            if (seen.has(current.value))
                return false;
            seen.add(current.value);
            if (Array.isArray(current.value)) {
                for (const item of current.value)
                    pending.push({ value: item, depth: current.depth + 1 });
            }
            else {
                for (const [key, item] of Object.entries(current.value)) {
                    bytes += utf8ByteLength(key, 2 * 1024 * 1024 - bytes);
                    pending.push({ value: item, depth: current.depth + 1 });
                }
            }
        }
        if (bytes > 2 * 1024 * 1024)
            return false;
    }
    return true;
}
function utf8ByteLength(value, remaining) {
    let bytes = 0;
    for (let index = 0; index < value.length; index += 1) {
        const code = value.charCodeAt(index);
        if (code <= 0x7f)
            bytes += 1;
        else if (code <= 0x7ff)
            bytes += 2;
        else if (code >= 0xd800 &&
            code <= 0xdbff &&
            index + 1 < value.length &&
            value.charCodeAt(index + 1) >= 0xdc00 &&
            value.charCodeAt(index + 1) <= 0xdfff) {
            bytes += 4;
            index += 1;
        }
        else {
            bytes += 3;
        }
        if (bytes > remaining)
            return bytes;
    }
    return bytes;
}
//# sourceMappingURL=transport.js.map