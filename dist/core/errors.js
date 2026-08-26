/** Structured error raised by controller and protocol operations. */
export class PrettyAuiError extends Error {
    code;
    protocol;
    phase;
    retryable;
    accepted;
    completionUnknown;
    constructor(code, message, options = {}) {
        super(message, { cause: options.cause });
        this.name = "PrettyAuiError";
        this.code = code;
        this.phase = options.phase ?? "unknown";
        this.retryable = options.retryable ?? false;
        if (options.protocol !== undefined)
            this.protocol = options.protocol;
        if (options.accepted !== undefined)
            this.accepted = options.accepted;
        if (options.completionUnknown !== undefined)
            this.completionUnknown = options.completionUnknown;
    }
}
export function toChatError(error) {
    if (error instanceof PrettyAuiError) {
        return {
            code: error.code,
            message: error.message,
            retryable: error.retryable,
            ...(error.accepted === undefined ? {} : { accepted: error.accepted }),
            ...(error.completionUnknown === undefined
                ? {}
                : { completionUnknown: error.completionUnknown }),
        };
    }
    return {
        code: "UNKNOWN",
        message: error instanceof Error ? error.message : String(error),
        retryable: false,
    };
}
//# sourceMappingURL=errors.js.map