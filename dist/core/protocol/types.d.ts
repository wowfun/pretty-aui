import type { AcpProtocolVersion, AcpWireStream, AuthMethod, ChatCapabilities, ChatCommand, ChatConfigOption, ContentBlock, ElicitationDecision, ElicitationInteraction, PermissionDecision, PermissionInteraction, SessionOptions, SessionPage } from "../types.js";
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
    onPermission(sessionId: string, interaction: Omit<PermissionInteraction, "id">, raw: unknown): Promise<PermissionDecision>;
    onElicitation(sessionId: string | undefined, interaction: Omit<ElicitationInteraction, "id">, raw: unknown): Promise<ElicitationDecision>;
    onElicitationComplete(elicitationId: string): void;
    onProtocol(method: string, raw: unknown): void;
    onDisconnect(): void;
}
export interface ProtocolDriver {
    readonly version: AcpProtocolVersion;
    readonly initialized: ProtocolInitialization;
    newSession(options: SessionOptions): Promise<ProtocolSession>;
    openSession(sessionId: string, options: SessionOptions, history: "all" | "none"): Promise<ProtocolSession>;
    listSessions(cwd: string, cursor?: string): Promise<SessionPage>;
    deleteSession(sessionId: string): Promise<void>;
    closeSession(sessionId: string): Promise<void>;
    prompt(sessionId: string, prompt: readonly ContentBlock[], 
    /** Called once request dispatch has begun; it is not a remote success ack. */
    onAccepted: () => void): Promise<string>;
    cancel(sessionId: string): Promise<void>;
    setConfigOption(sessionId: string, id: string, value: string | boolean): Promise<readonly ChatConfigOption[]>;
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
export declare function validateSessionOptions(options: SessionOptions, initialization: ProtocolInitialization, protocol: AcpProtocolVersion, phase: "session/new" | "session/open"): void;
export declare function validatePrompt(blocks: readonly ContentBlock[], capabilities: PromptCapabilities, protocol?: AcpProtocolVersion): void;
export declare function requestSessionWithAuthMapping<Value>(request: () => Promise<Value>, protocol: AcpProtocolVersion, phase: "session/new" | "session/open"): Promise<Value>;
//# sourceMappingURL=types.d.ts.map