import type { AcpProtocolVersion, ChatErrorState } from "./types.js";

export type PrettyAuiErrorCode =
  | "AUTO_NEGOTIATION_REQUIRES_FACTORY"
  | "AUTHENTICATION_REQUIRED"
  | "CAPABILITY_REQUIRED"
  | "CONNECTION_CLOSED"
  | "CONTEXT_FAILED"
  | "INITIALIZE_REJECTED"
  | "INVALID_CONFIGURATION"
  | "INVALID_WIRE_FRAME"
  | "METHOD_NOT_AVAILABLE"
  | "PROTOCOL_VERSION_MISMATCH"
  | "PROTOCOL_VIOLATION"
  | "SESSION_BUSY"
  | "SESSION_NOT_READY"
  | "TURN_INTERRUPTED"
  | "UNSUPPORTED_PROTOCOL";

/** Structured error raised by controller and protocol operations. */
export class PrettyAuiError extends Error {
  readonly code: PrettyAuiErrorCode;
  readonly protocol?: AcpProtocolVersion;
  readonly phase: string;
  readonly retryable: boolean;
  readonly accepted?: boolean;
  readonly completionUnknown?: boolean;

  constructor(
    code: PrettyAuiErrorCode,
    message: string,
    options: {
      cause?: unknown;
      protocol?: AcpProtocolVersion | undefined;
      phase?: string;
      retryable?: boolean;
      accepted?: boolean;
      completionUnknown?: boolean;
    } = {},
  ) {
    super(message, { cause: options.cause });
    this.name = "PrettyAuiError";
    this.code = code;
    this.phase = options.phase ?? "unknown";
    this.retryable = options.retryable ?? false;
    if (options.protocol !== undefined) this.protocol = options.protocol;
    if (options.accepted !== undefined) this.accepted = options.accepted;
    if (options.completionUnknown !== undefined)
      this.completionUnknown = options.completionUnknown;
  }
}

export function toChatError(error: unknown): ChatErrorState {
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
