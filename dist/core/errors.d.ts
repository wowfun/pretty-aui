import type { AcpProtocolVersion, ChatErrorState } from "./types.js";
export type PrettyAuiErrorCode = "AUTO_NEGOTIATION_REQUIRES_FACTORY" | "AUTHENTICATION_REQUIRED" | "AUTHENTICATION_DISABLED" | "CAPABILITY_REQUIRED" | "CONNECTION_CLOSED" | "CONTEXT_FAILED" | "INITIALIZE_REJECTED" | "INVALID_CONFIGURATION" | "INVALID_WIRE_FRAME" | "METHOD_NOT_AVAILABLE" | "PROTOCOL_VERSION_MISMATCH" | "PROTOCOL_VIOLATION" | "SESSION_BUSY" | "SESSION_LIMIT" | "SESSION_NOT_READY" | "SESSION_REJECTED" | "TURN_INTERRUPTED" | "UNSUPPORTED_PROTOCOL";
/** Structured error raised by controller and protocol operations. */
export declare class PrettyAuiError extends Error {
    readonly code: PrettyAuiErrorCode;
    readonly protocol?: AcpProtocolVersion;
    readonly phase: string;
    readonly retryable: boolean;
    readonly accepted?: boolean;
    readonly completionUnknown?: boolean;
    constructor(code: PrettyAuiErrorCode, message: string, options?: {
        cause?: unknown;
        protocol?: AcpProtocolVersion | undefined;
        phase?: string;
        retryable?: boolean;
        accepted?: boolean;
        completionUnknown?: boolean;
    });
}
export declare function toChatError(error: unknown): ChatErrorState;
//# sourceMappingURL=errors.d.ts.map