import { PrettyAuiError } from "../errors.js";
import type {
  AcpProtocolVersion,
  AcpWireStream,
  AuthMethod,
  ChatCapabilities,
  ChatCommand,
  ChatConfigOption,
  ContentBlock,
  ElicitationDecision,
  ElicitationInteraction,
  McpServer,
  PermissionDecision,
  PermissionInteraction,
  SessionOptions,
  SessionPage,
} from "../types.js";
import { MAX_CONTENT_TEXT, MAX_MEDIA_BASE64 } from "./normalize.js";

export interface ProtocolSession {
  readonly sessionId: string;
  readonly configOptions: readonly ChatConfigOption[];
  readonly commands?: readonly ChatCommand[];
  readonly historyGap?: boolean;
}

export interface PromptCapabilities {
  readonly image: boolean;
  readonly audio: boolean;
  readonly embeddedContext: boolean;
}

export interface ProtocolInitialization {
  readonly protocolVersion: AcpProtocolVersion;
  readonly agentName?: string;
  readonly authMethods: readonly AuthMethod[];
  readonly capabilities: ChatCapabilities;
  readonly promptCapabilities: PromptCapabilities;
  readonly additionalDirectories: boolean;
  readonly mcp: {
    readonly stdio: boolean;
    readonly http: boolean;
    readonly sse: boolean;
  };
}

export interface ProtocolSink {
  onUpdate(sessionId: string, update: unknown): void;
  onPermission(
    sessionId: string,
    interaction: Omit<PermissionInteraction, "id">,
    raw: unknown,
  ): Promise<PermissionDecision>;
  onElicitation(
    sessionId: string | undefined,
    interaction: Omit<ElicitationInteraction, "id">,
    raw: unknown,
  ): Promise<ElicitationDecision>;
  onElicitationComplete(elicitationId: string): void;
  onProtocol(method: string, raw: unknown): void;
  onDisconnect(): void;
}

export interface ProtocolDriver {
  readonly version: AcpProtocolVersion;
  readonly initialized: ProtocolInitialization;
  newSession(options: SessionOptions): Promise<ProtocolSession>;
  openSession(
    sessionId: string,
    options: SessionOptions,
    history: "all" | "none",
  ): Promise<ProtocolSession>;
  listSessions(cwd: string, cursor?: string): Promise<SessionPage>;
  deleteSession(sessionId: string): Promise<void>;
  closeSession(sessionId: string): Promise<void>;
  prompt(
    sessionId: string,
    prompt: readonly ContentBlock[],
    /** Called once request dispatch has begun; it is not a remote success ack. */
    onAccepted: () => void,
  ): Promise<string>;
  cancel(sessionId: string): Promise<void>;
  setConfigOption(
    sessionId: string,
    id: string,
    value: string | boolean,
  ): Promise<readonly ChatConfigOption[]>;
  authenticate(method: AuthMethod): Promise<void>;
  logout(): Promise<void>;
  close(error?: unknown): Promise<void>;
}

export interface DriverConnectOptions {
  readonly stream: AcpWireStream;
  readonly sink: ProtocolSink;
  readonly clientInfo: {
    readonly name: string;
    readonly version: string;
    readonly title?: string;
  };
  readonly host?: import("../types.js").ChatHost;
}

export function validateSessionOptions(
  options: SessionOptions,
  initialization: ProtocolInitialization,
  protocol: AcpProtocolVersion,
  phase: "session/new" | "session/open",
): void {
  if (!isAbsolutePath(options.cwd)) {
    throw invalidConfiguration(
      `ACP cwd must be an absolute path: ${options.cwd}`,
      protocol,
      phase,
    );
  }
  if (options.additionalDirectories?.some((path) => !isAbsolutePath(path))) {
    throw invalidConfiguration(
      "ACP additionalDirectories must contain only absolute paths",
      protocol,
      phase,
    );
  }
  if (
    options.additionalDirectories?.length &&
    !initialization.additionalDirectories
  ) {
    throw invalidConfiguration(
      "The agent does not support additionalDirectories",
      protocol,
      phase,
    );
  }
  if ((options.additionalDirectories?.length ?? 0) > 64) {
    throw invalidConfiguration(
      "ACP additionalDirectories is limited to 64 entries",
      protocol,
      phase,
    );
  }
  if ((options.mcpServers?.length ?? 0) > 32) {
    throw invalidConfiguration(
      "ACP MCP configuration is limited to 32 servers",
      protocol,
      phase,
    );
  }
  for (const server of options.mcpServers ?? [])
    validateMcpServer(server, initialization, protocol, phase);
}

export function validatePrompt(
  blocks: readonly ContentBlock[],
  capabilities: PromptCapabilities,
  protocol?: AcpProtocolVersion,
): void {
  if (blocks.length > 256)
    throw invalidConfiguration(
      "ACP prompts are limited to 256 content blocks",
      protocol,
      "prompt",
    );
  for (const block of blocks) {
    validateContentBlockBounds(block, protocol);
    if (block.type === "text" || block.type === "resource_link") continue;
    if (block.type === "image" && capabilities.image) continue;
    if (block.type === "audio" && capabilities.audio) continue;
    if (block.type === "resource" && capabilities.embeddedContext) continue;
    throw invalidConfiguration(
      `The agent does not support prompt content type '${block.type}'`,
      protocol,
      "prompt",
    );
  }
}

export async function requestSessionWithAuthMapping<Value>(
  request: () => Promise<Value>,
  protocol: AcpProtocolVersion,
  phase: "session/new" | "session/open",
): Promise<Value> {
  try {
    return await request();
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === -32000) {
      throw new PrettyAuiError(
        "AUTHENTICATION_REQUIRED",
        "The agent requires authentication for this session operation",
        { cause: error, protocol, phase },
      );
    }
    throw error;
  }
}

function validateContentBlockBounds(
  block: ContentBlock,
  protocol?: AcpProtocolVersion,
): void {
  if (
    block.type === "text" &&
    typeof block.text === "string" &&
    block.text.length > MAX_CONTENT_TEXT
  ) {
    throw invalidConfiguration(
      "ACP text content is limited to 1 MiB",
      protocol,
      "prompt",
    );
  }
  if (
    (block.type === "image" || block.type === "audio") &&
    typeof block.data === "string" &&
    block.data.length > MAX_MEDIA_BASE64
  ) {
    throw invalidConfiguration(
      "ACP media content is limited to 8 MiB of base64 data",
      protocol,
      "prompt",
    );
  }
  if (
    block.type === "resource" &&
    typeof block.resource === "object" &&
    block.resource !== null
  ) {
    const resource = block.resource as Readonly<Record<string, unknown>>;
    if (
      typeof resource.text === "string" &&
      resource.text.length > MAX_CONTENT_TEXT
    ) {
      throw invalidConfiguration(
        "ACP embedded resource text is limited to 1 MiB",
        protocol,
        "prompt",
      );
    }
    if (
      typeof resource.blob === "string" &&
      resource.blob.length > MAX_MEDIA_BASE64
    ) {
      throw invalidConfiguration(
        "ACP embedded resource data is limited to 8 MiB",
        protocol,
        "prompt",
      );
    }
  }
}

function validateMcpServer(
  server: McpServer,
  initialization: ProtocolInitialization,
  protocol: AcpProtocolVersion,
  phase: "session/new" | "session/open",
): void {
  if (server.type === "sse" && protocol !== 1) {
    throw invalidConfiguration(
      "SSE MCP servers are available only with protocol: 1",
      protocol,
      phase,
    );
  }
  if (!initialization.mcp[server.type]) {
    throw invalidConfiguration(
      `The agent does not support ${server.type} MCP servers`,
      protocol,
      phase,
    );
  }
}

function invalidConfiguration(
  message: string,
  protocol: AcpProtocolVersion | undefined,
  phase: string,
): PrettyAuiError {
  return new PrettyAuiError("INVALID_CONFIGURATION", message, {
    ...(protocol === undefined ? {} : { protocol }),
    phase,
  });
}

function isAbsolutePath(value: string): boolean {
  return (
    value.startsWith("/") ||
    /^[A-Za-z]:[\\/]/.test(value) ||
    value.startsWith("\\\\")
  );
}
