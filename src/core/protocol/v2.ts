import * as acp from "@agentclientprotocol/sdk/experimental/v2";
import { PrettyAuiError } from "../errors.js";
import type {
  AuthMethod,
  ChatConfigOption,
  ChatHost,
  ContentBlock,
  ElicitationDecision,
  McpServer,
  PermissionDecision,
  SessionOptions,
  SessionPage,
} from "../types.js";
import {
  asString,
  isRecord,
  normalizeAuthMethods,
  normalizeConfigOptions,
  normalizeSessions,
} from "./normalize.js";
import {
  elicitationResponse,
  normalizeElicitation,
  normalizePermissionOptions,
  permissionResponse,
} from "./interactions.js";
import type {
  DriverConnectOptions,
  ProtocolDriver,
  ProtocolInitialization,
  ProtocolSession,
} from "./types.js";
import {
  requestSessionWithAuthMapping,
  validateSessionOptions,
} from "./types.js";

export async function connectV2(
  options: DriverConnectOptions,
): Promise<ProtocolDriver> {
  const { sink } = options;
  let driver: V2Driver | undefined;
  const app = acp
    .client({ name: options.clientInfo.name })
    .onRequest(
      acp.methods.client.session.requestPermission,
      async ({ params }) => {
        const raw = params as unknown;
        const decision = await sink.onPermission(
          params.sessionId,
          normalizePermission(raw),
          raw,
        );
        return permissionResponse(decision);
      },
    )
    .onRequest(acp.methods.client.elicitation.create, async ({ params }) => {
      const raw = params as unknown;
      const decision = await sink.onElicitation(
        "sessionId" in params && typeof params.sessionId === "string"
          ? params.sessionId
          : undefined,
        normalizeElicitation(raw),
        raw,
      );
      return elicitationResponse(decision);
    })
    .onNotification(acp.methods.client.session.update, ({ params }) => {
      sink.onProtocol(acp.methods.client.session.update, params);
      sink.onUpdate(params.sessionId, params.update);
      driver?.handleUpdate(params.sessionId, params.update);
    })
    .onNotification(acp.methods.client.elicitation.complete, ({ params }) => {
      sink.onProtocol(acp.methods.client.elicitation.complete, params);
      sink.onElicitationComplete(params.elicitationId);
    });

  const connection = app.connect(options.stream as acp.Stream);
  let closedByClient = false;
  void connection.closed.then(() => {
    driver?.handleClose();
    if (!closedByClient) sink.onDisconnect();
  });

  let response: acp.InitializeResponse;
  try {
    response = await connection.agent.request(acp.methods.agent.initialize, {
      protocolVersion: 2,
      info: {
        name: options.clientInfo.name,
        version: options.clientInfo.version,
        ...(options.clientInfo.title
          ? { title: options.clientInfo.title }
          : {}),
      },
      capabilities: {
        auth: { ...(options.host?.terminalAuth ? { terminal: {} } : {}) },
        elicitation: { form: {}, url: {} },
      },
    });
  } catch (error) {
    connection.close(error);
    throw new PrettyAuiError(
      "INITIALIZE_REJECTED",
      "ACP v2 initialization failed",
      {
        cause: error,
        protocol: 2,
        phase: "initialize",
        retryable: true,
      },
    );
  }
  if (response.protocolVersion !== 2) {
    connection.close();
    throw new PrettyAuiError(
      "PROTOCOL_VERSION_MISMATCH",
      `Requested ACP v2 but agent selected v${response.protocolVersion}`,
      { protocol: 2, phase: "initialize" },
    );
  }
  if (response.capabilities?.session == null) {
    connection.close();
    throw new PrettyAuiError(
      "CAPABILITY_REQUIRED",
      "The ACP v2 agent does not advertise the session surface",
      {
        protocol: 2,
        phase: "initialize",
      },
    );
  }

  const sessionCapabilities = response.capabilities.session;
  const initialization: ProtocolInitialization = {
    protocolVersion: 2,
    agentName: response.info.title ?? response.info.name,
    authMethods: normalizeAuthMethods(response.authMethods),
    capabilities: {
      listSessions: true,
      loadSession: true,
      resumeSession: true,
      closeSession: true,
      deleteSession: sessionCapabilities.delete != null,
    },
    promptCapabilities: {
      image: sessionCapabilities.prompt?.image != null,
      audio: sessionCapabilities.prompt?.audio != null,
      embeddedContext: sessionCapabilities.prompt?.embeddedContext != null,
    },
    additionalDirectories: sessionCapabilities.additionalDirectories != null,
    mcp: {
      stdio: sessionCapabilities.mcp?.stdio != null,
      http: sessionCapabilities.mcp?.http != null,
      sse: false,
    },
  };
  driver = new V2Driver(connection, initialization, options.host, () => {
    closedByClient = true;
  });
  return driver;
}

class V2Driver implements ProtocolDriver {
  readonly version = 2 as const;
  #pendingTurn:
    | {
        readonly sessionId: string;
        accepted: boolean;
        readonly promise: Promise<string>;
        readonly resolve: (stopReason: string) => void;
        readonly reject: (error: unknown) => void;
      }
    | undefined;

  constructor(
    private readonly connection: acp.ClientConnection,
    readonly initialized: ProtocolInitialization,
    private readonly host: ChatHost | undefined,
    private readonly markClosed: () => void,
  ) {}

  async newSession(options: SessionOptions): Promise<ProtocolSession> {
    validateSessionOptions(options, this.initialized, 2, "session/new");
    const response = await requestSessionWithAuthMapping(
      () =>
        this.connection.agent.request(
          acp.methods.agent.session.new,
          toV2SessionRequest(options),
        ),
      2,
      "session/new",
    );
    return {
      sessionId: response.sessionId,
      configOptions: normalizeConfigOptions(response.configOptions),
    };
  }

  async openSession(
    sessionId: string,
    options: SessionOptions,
    history: "all" | "none",
  ): Promise<ProtocolSession> {
    validateSessionOptions(options, this.initialized, 2, "session/open");
    const response = await requestSessionWithAuthMapping(
      () =>
        this.connection.agent.request(acp.methods.agent.session.resume, {
          ...toV2SessionRequest(options),
          sessionId,
          ...(history === "all"
            ? { replayFrom: { type: "start" as const } }
            : {}),
        }),
      2,
      "session/open",
    );
    return {
      sessionId,
      configOptions: normalizeConfigOptions(response.configOptions),
    };
  }

  async listSessions(cwd: string, cursor?: string): Promise<SessionPage> {
    const response = await this.connection.agent.request(
      acp.methods.agent.session.list,
      {
        cwd,
        ...(cursor ? { cursor } : {}),
      },
    );
    return normalizeSessions(response);
  }

  async deleteSession(sessionId: string): Promise<void> {
    if (!this.initialized.capabilities.deleteSession) {
      throw new PrettyAuiError(
        "CAPABILITY_REQUIRED",
        "The agent does not support session/delete",
        { protocol: 2 },
      );
    }
    await this.connection.agent.request(acp.methods.agent.session.delete, {
      sessionId,
    });
  }

  async closeSession(sessionId: string): Promise<void> {
    await this.connection.agent.request(acp.methods.agent.session.close, {
      sessionId,
    });
  }

  async prompt(
    sessionId: string,
    prompt: readonly ContentBlock[],
    onAccepted: () => void,
  ): Promise<string> {
    if (this.#pendingTurn) {
      throw new PrettyAuiError(
        "SESSION_BUSY",
        "Only one foreground turn is supported",
        { protocol: 2 },
      );
    }
    let resolve!: (stopReason: string) => void;
    let reject!: (error: unknown) => void;
    const promise = new Promise<string>((resolvePromise, rejectPromise) => {
      resolve = resolvePromise;
      reject = rejectPromise;
    });
    this.#pendingTurn = {
      sessionId,
      accepted: false,
      promise,
      resolve,
      reject,
    };
    try {
      const acknowledgement = this.connection.agent.request(
        acp.methods.agent.session.prompt,
        {
          sessionId,
          prompt: prompt as acp.ContentBlock[],
        },
      );
      if (this.#pendingTurn) this.#pendingTurn.accepted = true;
      onAccepted();
      await acknowledgement;
      return await promise;
    } catch (error) {
      if (this.#pendingTurn?.promise === promise) this.#pendingTurn = undefined;
      throw error;
    }
  }

  async cancel(sessionId: string): Promise<void> {
    await this.connection.agent.notify(acp.methods.agent.session.cancel, {
      sessionId,
    });
    const pending = this.#pendingTurn;
    if (!pending || pending.sessionId !== sessionId) return;
    this.#pendingTurn = undefined;
    pending.resolve("cancelled");
  }

  async setConfigOption(
    sessionId: string,
    id: string,
    value: string | boolean,
  ): Promise<readonly ChatConfigOption[]> {
    const response = await this.connection.agent.request(
      acp.methods.agent.session.setConfigOption,
      {
        sessionId,
        configId: id,
        type: typeof value === "boolean" ? "boolean" : "id",
        value,
      },
    );
    return normalizeConfigOptions(response.configOptions);
  }

  async authenticate(method: AuthMethod): Promise<void> {
    if (method.type === "terminal") {
      if (!this.host?.terminalAuth) {
        throw new PrettyAuiError(
          "CAPABILITY_REQUIRED",
          "Terminal authentication needs a host handler",
          { protocol: 2 },
        );
      }
      await this.host.terminalAuth(method);
      return;
    }
    await this.connection.agent.request(acp.methods.agent.auth.login, {
      methodId: method.id,
    });
  }

  async logout(): Promise<void> {
    await this.connection.agent.request(acp.methods.agent.auth.logout, {});
  }

  handleUpdate(sessionId: string, update: unknown): void {
    if (
      !this.#pendingTurn ||
      this.#pendingTurn.sessionId !== sessionId ||
      !isRecord(update)
    )
      return;
    if (update.sessionUpdate !== "state_update" || update.state !== "idle")
      return;
    const pending = this.#pendingTurn;
    this.#pendingTurn = undefined;
    pending.resolve(asString(update.stopReason) ?? "end_turn");
  }

  handleClose(): void {
    if (!this.#pendingTurn) return;
    const pending = this.#pendingTurn;
    this.#pendingTurn = undefined;
    pending.reject(
      new PrettyAuiError(
        "TURN_INTERRUPTED",
        "Connection closed before the turn completed",
        {
          protocol: 2,
          phase: "prompt",
          retryable: true,
          accepted: pending.accepted,
          completionUnknown: pending.accepted,
        },
      ),
    );
  }

  async close(error?: unknown): Promise<void> {
    this.markClosed();
    this.handleClose();
    this.connection.close(error);
    await this.connection.closed;
  }
}

function toV2SessionRequest(options: SessionOptions): acp.NewSessionRequest {
  return {
    cwd: options.cwd as acp.AbsolutePath,
    ...(options.additionalDirectories?.length
      ? {
          additionalDirectories: [
            ...options.additionalDirectories,
          ] as acp.AbsolutePath[],
        }
      : {}),
    ...(options.mcpServers?.length
      ? { mcpServers: options.mcpServers.map(toV2Mcp) }
      : {}),
  };
}

function toV2Mcp(server: McpServer): acp.McpServer {
  if (server.type === "sse") {
    throw new PrettyAuiError(
      "INVALID_CONFIGURATION",
      "SSE MCP servers are not part of ACP v2",
      { protocol: 2 },
    );
  }
  if (server.type === "stdio") {
    return {
      type: "stdio",
      name: server.name,
      command: server.command as acp.AbsolutePath,
      ...(server.args?.length ? { args: [...server.args] } : {}),
      ...(server.env?.length ? { env: [...server.env] } : {}),
    };
  }
  return {
    type: "http",
    name: server.name,
    url: server.url,
    ...(server.headers?.length ? { headers: [...server.headers] } : {}),
  };
}

function normalizePermission(
  raw: unknown,
): Omit<import("../types.js").PermissionInteraction, "id"> {
  const params = isRecord(raw) ? raw : {};
  const description = asString(params.description);
  return {
    type: "permission",
    title: asString(params.title) ?? "Permission required",
    ...(description ? { description } : {}),
    options: normalizePermissionOptions(params.options),
  };
}
