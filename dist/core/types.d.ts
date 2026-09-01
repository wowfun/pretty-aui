export type AcpProtocolVersion = 1 | 2;
export type AcpProtocolPolicy = AcpProtocolVersion | "auto";
export type AcpWireMessage = unknown;
export interface AcpWireStream {
    readonly readable: ReadableStream<AcpWireMessage>;
    readonly writable: WritableStream<AcpWireMessage>;
}
export interface AcpConnectorOpenOptions {
    /** ACP version requested for this physical connection. */
    readonly protocol: AcpProtocolVersion;
    /** One-based attempt number within the current connection operation. */
    readonly attempt: number;
    /** Aborts transport setup and the lifetime of the returned stream. */
    readonly signal: AbortSignal;
}
/**
 * Factory for decoded ACP JSON message streams.
 *
 * Each call must return a fresh stream pair. Reconnects and automatic protocol
 * fallback cannot reuse a previously opened transport.
 */
export interface AcpConnector {
    open(options: AcpConnectorOpenOptions): Promise<AcpWireStream> | AcpWireStream;
}
export interface WebSocketConnectorOptions {
    readonly protocols?: readonly string[];
    readonly cookies?: "include" | "omit";
    readonly headers?: Readonly<Record<string, string>>;
    readonly WebSocket?: new (url: string, protocols?: string | string[], options?: {
        headers?: Record<string, string>;
    }) => unknown;
}
export interface StreamableHttpConnectorOptions {
    readonly fetch?: typeof globalThis.fetch;
    readonly headers?: Readonly<Record<string, string>>;
    readonly cookies?: "include" | "omit";
}
export interface ClientInfo {
    readonly name?: string;
    readonly version?: string;
    readonly title?: string;
}
export interface ContentAnnotations {
    readonly audience?: readonly ("user" | "assistant")[];
    readonly priority?: number;
    readonly lastModified?: string;
}
interface ContentBlockBase {
    readonly annotations?: ContentAnnotations | null;
    readonly _meta?: Readonly<Record<string, unknown>> | null;
}
export interface TextContentBlock extends ContentBlockBase {
    readonly type: "text";
    readonly text: string;
}
export interface ImageContentBlock extends ContentBlockBase {
    readonly type: "image";
    readonly data: string;
    readonly mimeType: string;
}
export interface AudioContentBlock extends ContentBlockBase {
    readonly type: "audio";
    readonly data: string;
    readonly mimeType: string;
}
export interface ResourceLinkContentBlock extends ContentBlockBase {
    readonly type: "resource_link";
    readonly uri: string;
    readonly name: string;
    readonly title?: string | null | undefined;
    readonly description?: string | null | undefined;
    readonly mimeType?: string | null | undefined;
    readonly size?: number | null | undefined;
    readonly icons?: readonly Readonly<Record<string, unknown>>[] | null | undefined;
}
export interface ResourceContentBlock extends ContentBlockBase {
    readonly type: "resource";
    readonly resource: {
        readonly uri: string;
        readonly mimeType?: string | null;
        readonly text?: string;
        readonly blob?: string;
        readonly _meta?: Readonly<Record<string, unknown>> | null;
    };
}
export interface UnknownContentBlock extends ContentBlockBase {
    readonly type: string;
    readonly [key: string]: unknown;
}
export type ContentBlock = TextContentBlock | ImageContentBlock | AudioContentBlock | ResourceLinkContentBlock | ResourceContentBlock | UnknownContentBlock;
export interface ContextItem {
    readonly id: string;
    readonly label: string;
    readonly content: readonly ContentBlock[];
}
/** Host-owned reference selected for the next prompt. */
export interface ContextSelectionItem {
    readonly id: string;
    readonly label: string;
}
export interface ContextRequest {
    readonly sessionId?: string;
    readonly input: readonly ContentBlock[];
    /** Ordered selection frozen when this turn was started. */
    readonly selection: readonly ContextSelectionItem[];
    readonly protocolVersion?: AcpProtocolVersion;
    /** Prompt content the initialized agent accepts for this turn. */
    readonly capabilities: PromptCapabilities;
    readonly signal: AbortSignal;
}
/** Observable host adapter for selecting and resolving prompt context. */
export interface ContextProvider {
    getSelection(): readonly ContextSelectionItem[];
    subscribe(listener: () => void): () => void;
    resolve(request: ContextRequest): readonly ContextItem[] | Promise<readonly ContextItem[]>;
    add?(): void | Promise<void>;
    remove?(id: string): void | Promise<void>;
}
export interface StdioMcpServer {
    readonly type: "stdio";
    readonly name: string;
    readonly command: string;
    readonly args?: readonly string[];
    readonly env?: readonly {
        readonly name: string;
        readonly value: string;
    }[];
}
export interface HttpMcpServer {
    readonly type: "http";
    readonly name: string;
    readonly url: string;
    readonly headers?: readonly {
        readonly name: string;
        readonly value: string;
    }[];
}
export interface SseMcpServer {
    readonly type: "sse";
    readonly name: string;
    readonly url: string;
    readonly headers?: readonly {
        readonly name: string;
        readonly value: string;
    }[];
}
export type McpServer = StdioMcpServer | HttpMcpServer | SseMcpServer;
export interface SessionOptions {
    /** Absolute working directory sent to the agent. */
    readonly cwd: string;
    /** Additional absolute directories, when advertised by the agent. */
    readonly additionalDirectories?: readonly string[];
    /** MCP servers passed through ACP session configuration. */
    readonly mcpServers?: readonly McpServer[];
}
export interface PromptCapabilities {
    readonly image: boolean;
    readonly audio: boolean;
    readonly embeddedContext: boolean;
}
export type InitialSession = {
    readonly type: "new";
} | {
    readonly type: "none";
} | {
    readonly type: "open";
    readonly sessionId: string;
};
export type HostHandler = (params: Readonly<Record<string, unknown>>) => unknown | Promise<unknown>;
export interface FileSystemHost {
    readonly readTextFile?: HostHandler;
    readonly writeTextFile?: HostHandler;
}
export interface TerminalHost {
    readonly create: HostHandler;
    readonly output: HostHandler;
    readonly release: HostHandler;
    readonly waitForExit: HostHandler;
    readonly kill: HostHandler;
}
export type TerminalAuthHandler = (method: AuthMethod) => void | Promise<void>;
/** Host implementations for agent-to-client operations. */
export interface ChatHost {
    /** Handles terminal authentication methods advertised by either driver. */
    readonly terminalAuth?: TerminalAuthHandler;
    /** Client capabilities implemented only by the stable ACP v1 driver. */
    readonly v1?: {
        readonly filesystem?: FileSystemHost;
        readonly terminal?: TerminalHost;
    };
}
/** Optional host adapter for restoring the model used by new sessions. */
export interface ModelPreferenceStore {
    /** Returns the last bounded model value saved in the host's own scope. */
    get(): string | undefined;
    /** Saves the normalized model value of the currently selected session. */
    set(value: string): void;
}
/** Framework-neutral construction options for a chat controller. */
export interface ChatOptions {
    /** Factory that opens a fresh decoded transport for each attempt. */
    readonly connector: AcpConnector;
    /** Protocol selection policy. Defaults to stable ACP v1. */
    readonly protocol?: AcpProtocolPolicy;
    /** Working directory and agent-owned MCP session configuration. */
    readonly session: SessionOptions;
    /** Initial session action after connection. Defaults to a new session. */
    readonly initialSession?: InitialSession;
    /** Best-effort host persistence for the model inherited by new sessions. */
    readonly modelPreference?: ModelPreferenceStore;
    /** Agent-advertised mode applied to every genuinely new session. */
    readonly newSessionMode?: string;
    /** Fixed or per-turn context resolved before each prompt is sent. */
    readonly context?: readonly ContextItem[] | ContextProvider;
    /** Whether agent-advertised browser authentication may be used. */
    readonly allowAuthentication?: boolean;
    /** Optional implementations of supported agent-to-client operations. */
    readonly host?: ChatHost;
    /** Client identity sent during ACP initialization. */
    readonly clientInfo?: ClientInfo;
    /** Receives lifecycle, raw protocol, diagnostic, and error events. */
    readonly onEvent?: (event: ChatEvent) => void;
}
export type ChatPhase = "connecting" | "auth_required" | "idle" | "running" | "awaiting_user" | "cancelling" | "error" | "closed";
export type MessageRole = "user" | "assistant" | "thought";
export interface ChatMessage {
    readonly type: "message";
    /** Stable UI identity; distinct for each normalized message role. */
    readonly id: string;
    readonly role: MessageRole;
    readonly content: readonly ContentBlock[];
    /**
     * Reliable local event time in Unix epoch milliseconds. Present for a
     * locally submitted user message or a live assistant answer when its turn
     * completes; omitted when ACP history does not provide an original time.
     */
    readonly timestamp?: number | undefined;
    readonly pending?: boolean;
}
/** Bounded child-session semantics recognized from an agent task tool. */
export interface ChatSubagentInfo {
    readonly agent?: string | undefined;
    readonly description?: string | undefined;
    readonly sessionId?: string | undefined;
    readonly background: boolean;
}
export interface ChatToolCall {
    readonly type: "tool";
    readonly id: string;
    readonly title: string;
    readonly kind?: string | undefined;
    readonly status: string;
    readonly content: readonly unknown[];
    readonly locations: readonly Readonly<Record<string, unknown>>[];
    readonly rawInput?: unknown;
    readonly rawOutput?: unknown;
    readonly subagent?: ChatSubagentInfo | undefined;
}
export interface ChatPlanEntry {
    readonly content: string;
    readonly priority?: string | undefined;
    readonly status: string;
}
export interface ChatPlan {
    readonly type: "plan";
    readonly id: string;
    readonly entries: readonly ChatPlanEntry[];
}
export interface ChatTerminal {
    readonly type: "terminal";
    readonly id: string;
    readonly title: string;
    readonly output: string;
    readonly exited: boolean;
}
export interface UnsupportedActivity {
    readonly type: "unsupported";
    readonly id: string;
    readonly kind: string;
}
/** Context that was actually submitted with one accepted turn. */
export interface ChatContextActivity {
    readonly type: "context";
    /** Timeline identity generated by the owning controller. */
    readonly id: string;
    /** Per-turn identity supplied by the ContextProvider. */
    readonly contextId: string;
    readonly label: string;
    readonly content: readonly ContentBlock[];
}
/** Host-owned, controller-local transcript notice. */
export interface ChatNoticeActivity {
    readonly type: "notice";
    readonly id: string;
    readonly text: string;
    readonly level: "info" | "error";
}
export type ChatActivity = ChatMessage | ChatContextActivity | ChatNoticeActivity | ChatToolCall | ChatPlan | ChatTerminal | UnsupportedActivity;
export interface ChatConfigOption {
    readonly id: string;
    readonly name: string;
    readonly description?: string | undefined;
    readonly category?: string | undefined;
    readonly type: "select" | "boolean" | "unknown";
    readonly currentValue: string | boolean;
    readonly options?: readonly {
        readonly value: string;
        readonly name: string;
        readonly description?: string | undefined;
    }[];
}
export interface ChatCommand {
    readonly name: string;
    readonly description: string;
    readonly inputHint?: string | undefined;
}
export interface SessionInfo {
    readonly sessionId: string;
    readonly title?: string | undefined;
    readonly updatedAt?: string | undefined;
    readonly cwd?: string | undefined;
}
export interface SessionPage {
    readonly sessions: readonly SessionInfo[];
    readonly nextCursor?: string;
}
export type ChatSessionPhase = "idle" | "running" | "awaiting_user" | "cancelling" | "error";
export interface LoadedChatSession extends SessionInfo {
    readonly phase: ChatSessionPhase;
    readonly interactionCount: number;
    readonly error?: ChatErrorState;
}
export interface AuthMethod {
    readonly id: string;
    readonly name: string;
    readonly description?: string | undefined;
    readonly type: string;
    readonly raw: unknown;
}
export interface PermissionOption {
    readonly id: string;
    readonly name: string;
    readonly kind: string;
}
export interface PermissionInteraction {
    readonly type: "permission";
    readonly id: string;
    readonly title: string;
    readonly description?: string | undefined;
    readonly options: readonly PermissionOption[];
}
export interface ElicitationInteraction {
    readonly type: "elicitation";
    readonly id: string;
    /** Agent identity used to correlate URL completion notifications. */
    readonly elicitationId?: string | undefined;
    readonly mode: "form" | "url" | "unknown";
    readonly message: string;
    readonly url?: string | undefined;
    readonly requestedSchema?: Readonly<Record<string, unknown>> | undefined;
}
export type ChatInteraction = PermissionInteraction | ElicitationInteraction;
export interface UsageInfo {
    readonly used: number;
    readonly size: number;
    readonly cost?: {
        readonly amount: number;
        readonly currency: string;
    };
}
export interface ChatCapabilities {
    readonly listSessions: boolean;
    readonly loadSession: boolean;
    readonly resumeSession: boolean;
    readonly closeSession: boolean;
    readonly deleteSession: boolean;
}
export interface ChatErrorState {
    readonly code: string;
    readonly message: string;
    readonly retryable: boolean;
    readonly accepted?: boolean;
    readonly completionUnknown?: boolean;
}
export interface ChatSnapshot {
    readonly phase: ChatPhase;
    readonly protocolVersion?: AcpProtocolVersion;
    readonly agentName?: string;
    /** Bounded summaries for every session retained by this controller. */
    readonly loadedSessions: readonly LoadedChatSession[];
    readonly sessionId?: string;
    /**
     * Opaque identity of the selected loaded record. It changes when a fresh
     * local record replaces the same Agent session ID and survives restoration
     * of the same logical session.
     */
    readonly sessionInstanceId?: string;
    /**
     * Agent-owned title displayed by the header. Session notifications are
     * authoritative; session-list catalogs provide a fallback when absent.
     */
    readonly sessionTitle?: string;
    /** Ancestors captured while entering child sessions from Agent activities. */
    readonly sessionTrail: readonly SessionInfo[];
    readonly historyGap: boolean;
    readonly activities: readonly ChatActivity[];
    readonly configOptions: readonly ChatConfigOption[];
    readonly commands: readonly ChatCommand[];
    readonly contextSelection: {
        readonly items: readonly ContextSelectionItem[];
        readonly canAdd: boolean;
        readonly canRemove: boolean;
        readonly busy: boolean;
    };
    readonly interactions: readonly ChatInteraction[];
    readonly authMethods: readonly AuthMethod[];
    readonly sessions?: SessionPage;
    readonly capabilities: ChatCapabilities;
    readonly usage?: UsageInfo;
    readonly stopReason?: string;
    readonly error?: ChatErrorState;
}
export interface ChatTurnResult {
    readonly stopReason: string;
}
export interface ChatTurnHandle {
    readonly id: string;
    readonly done: Promise<ChatTurnResult>;
}
export type ChatInput = string | ContentBlock | readonly ContentBlock[];
/** Host notice with text bounded to 16 KiB in UTF-8 bytes. */
export interface ChatNoticeInput {
    readonly text: string;
    readonly level: "info" | "error";
    /** Non-empty when supplied; defaults to the selected session. */
    readonly sessionId?: string | undefined;
}
export type PermissionDecision = {
    readonly outcome: "selected";
    readonly optionId: string;
} | {
    readonly outcome: "cancelled";
};
export type ElicitationDecision = {
    readonly action: "accept";
    readonly content?: Readonly<Record<string, string | number | boolean | readonly string[]>>;
} | {
    readonly action: "decline" | "cancel";
};
export type ChatEvent = {
    readonly type: "connected";
    readonly protocolVersion: AcpProtocolVersion;
} | {
    readonly type: "session_changed";
    readonly sessionId?: string;
} | {
    readonly type: "turn_started";
    readonly sessionId: string;
    readonly turnId: string;
} | {
    readonly type: "turn_completed";
    readonly sessionId: string;
    readonly turnId: string;
    readonly stopReason: string;
} | {
    readonly type: "protocol";
    readonly protocolVersion: AcpProtocolVersion;
    readonly method: string;
    readonly raw: unknown;
} | {
    readonly type: "diagnostic";
    readonly sessionId?: string;
    readonly code: string;
    readonly message: string;
} | {
    readonly type: "error";
    readonly sessionId?: string;
    readonly error: ChatErrorState;
};
/**
 * Framework-neutral chat lifecycle and state interface.
 *
 * A controller starts connecting when it is created, supports one turn per
 * loaded session, and must be destroyed by the scope that owns it.
 */
export interface ChatController {
    /**
     * Settles after initial setup, or rejects if setup fails, authentication is
     * required, or ownership ends. An authentication rejection accompanies an
     * `auth_required` snapshot. Once destroyed, the controller remains closed
     * and ignores late work.
     */
    readonly ready: Promise<void>;
    /**
     * Returns the current immutable snapshot. Identity stays stable until state
     * changes; every subscription notification exposes a new snapshot identity.
     */
    getSnapshot(): ChatSnapshot;
    /** Subscribes to snapshot changes and returns an unsubscribe function. */
    subscribe(listener: () => void): () => void;
    /**
     * Appends a transient host notice to a loaded session. Returns false when
     * the target record is unavailable or this controller has been destroyed;
     * malformed input throws `INVALID_CONFIGURATION`.
     */
    appendNotice(input: ChatNoticeInput): boolean;
    /**
     * Starts one foreground turn and returns its completion handle. Foreseeable
     * input validation failures use `INVALID_CONFIGURATION`.
     */
    send(input: ChatInput): ChatTurnHandle;
    /** Asks the host context adapter to capture its current context. */
    addContext(): Promise<void>;
    /** Removes one selected context reference by its stable identity. */
    removeContext(id: string): Promise<void>;
    /**
     * Cancels local preparation, resolves pending interactions as cancelled, and
     * requests remote cancellation once a prompt has been submitted.
     */
    cancel(sessionId?: string): Promise<void>;
    /**
     * Opens a fresh transport and reattaches the active session through resume
     * or history load; otherwise creates a new session. Reconnect is a
     * single-flight session operation and rejects while a turn or interaction is
     * active. A fallback new session starts with an empty transcript.
     */
    reconnect(): Promise<void>;
    /** Creates and activates a new session; session mutations are single-flight. */
    newSession(): Promise<void>;
    /**
     * Loads one page of sessions and stores it in the current snapshot. Page
     * requests are single-flight so responses cannot commit out of order.
     */
    listSessions(cursor?: string): Promise<SessionPage>;
    /**
     * Loads or resumes an existing session and makes it active; session
     * mutations are single-flight.
     */
    openSession(sessionId: string): Promise<void>;
    /** Opens a child transcript and appends the active session to its trail. */
    openChildSession(sessionId: string): Promise<void>;
    /** Returns to an ancestor already present in the active child trail. */
    openAncestorSession(sessionId: string): Promise<void>;
    /** Closes a target or active session after acknowledgement. */
    closeSession(sessionId?: string): Promise<void>;
    /** Deletes a non-active session when the agent supports deletion. */
    deleteSession(sessionId: string): Promise<void>;
    /** Applies an agent-provided select or boolean configuration value. */
    setConfigOption(id: string, value: string | boolean): Promise<void>;
    /** Runs one authentication method advertised by the agent. */
    authenticate(methodId: string): Promise<void>;
    /** Logs out after remote acknowledgement; rejection preserves the active session. */
    logout(): Promise<void>;
    /** Resolves a pending permission exactly once. */
    respondPermission(id: string, decision: PermissionDecision): boolean;
    /**
     * Resolves a pending elicitation exactly once. URL elicitations may also be
     * resolved by the agent's correlated completion notification.
     */
    respondElicitation(id: string, decision: ElicitationDecision): boolean;
    /** Closes transports and interactions. Repeated calls are safe. */
    destroy(): Promise<void>;
}
export {};
//# sourceMappingURL=types.d.ts.map