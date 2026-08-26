import * as acp from "@agentclientprotocol/sdk";
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
  normalizeModes,
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

export async function connectV1(
  options: DriverConnectOptions,
): Promise<ProtocolDriver> {
  const { sink, host } = options;
  let app = acp.client({ name: options.clientInfo.name });

  app = app
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
    })
    .onNotification(acp.methods.client.elicitation.complete, ({ params }) => {
      sink.onProtocol(acp.methods.client.elicitation.complete, params);
      sink.onElicitationComplete(params.elicitationId);
    });

  const filesystem = host?.v1?.filesystem;
  if (filesystem?.readTextFile) {
    app = app.onRequest(
      acp.methods.client.fs.readTextFile,
      async ({ params }) =>
        (await filesystem.readTextFile!(
          params as unknown as Readonly<Record<string, unknown>>,
        )) as never,
    );
  }
  if (filesystem?.writeTextFile) {
    app = app.onRequest(
      acp.methods.client.fs.writeTextFile,
      async ({ params }) =>
        (await filesystem.writeTextFile!(
          params as unknown as Readonly<Record<string, unknown>>,
        )) as never,
    );
  }
  const terminal = host?.v1?.terminal;
  if (terminal) {
    app = app
      .onRequest(
        acp.methods.client.terminal.create,
        async ({ params }) =>
          (await terminal.create(
            params as unknown as Readonly<Record<string, unknown>>,
          )) as never,
      )
      .onRequest(
        acp.methods.client.terminal.output,
        async ({ params }) =>
          (await terminal.output(
            params as unknown as Readonly<Record<string, unknown>>,
          )) as never,
      )
      .onRequest(
        acp.methods.client.terminal.release,
        async ({ params }) =>
          (await terminal.release(
            params as unknown as Readonly<Record<string, unknown>>,
          )) as never,
      )
      .onRequest(
        acp.methods.client.terminal.waitForExit,
        async ({ params }) =>
          (await terminal.waitForExit(
            params as unknown as Readonly<Record<string, unknown>>,
          )) as never,
      )
      .onRequest(
        acp.methods.client.terminal.kill,
        async ({ params }) =>
          (await terminal.kill(
            params as unknown as Readonly<Record<string, unknown>>,
          )) as never,
      );
  }

  const connection = app.connect(options.stream as acp.Stream);
  let closedByClient = false;
  void connection.closed.then(() => {
    if (!closedByClient) sink.onDisconnect();
  });

  let response: acp.InitializeResponse;
  try {
    response = await connection.agent.request(acp.methods.agent.initialize, {
      protocolVersion: 1,
      clientInfo: {
        name: options.clientInfo.name,
        version: options.clientInfo.version,
        ...(options.clientInfo.title
          ? { title: options.clientInfo.title }
          : {}),
      },
      clientCapabilities: {
        fs: {
          readTextFile: Boolean(filesystem?.readTextFile),
          writeTextFile: Boolean(filesystem?.writeTextFile),
        },
        terminal: Boolean(terminal),
        session: { configOptions: { boolean: {} } },
        auth: { terminal: Boolean(host?.terminalAuth) },
        elicitation: { form: {}, url: {} },
      },
    });
  } catch (error) {
    connection.close(error);
    throw new PrettyAuiError(
      "INITIALIZE_REJECTED",
      "ACP v1 initialization failed",
      {
        cause: error,
        protocol: 1,
        phase: "initialize",
        retryable: true,
      },
    );
  }
  if (response.protocolVersion !== 1) {
    connection.close();
    throw new PrettyAuiError(
      "PROTOCOL_VERSION_MISMATCH",
      `Requested ACP v1 but agent selected v${response.protocolVersion}`,
      { protocol: 1, phase: "initialize" },
    );
  }

  const capabilities = response.agentCapabilities;
  const sessionCapabilities = capabilities?.sessionCapabilities;
  const initialization: ProtocolInitialization = {
    protocolVersion: 1,
    ...(response.agentInfo?.title || response.agentInfo?.name
      ? { agentName: response.agentInfo.title ?? response.agentInfo.name }
      : {}),
    authMethods: normalizeAuthMethods(response.authMethods),
    capabilities: {
      listSessions: sessionCapabilities?.list != null,
      loadSession: capabilities?.loadSession === true,
      resumeSession: sessionCapabilities?.resume != null,
      closeSession: sessionCapabilities?.close != null,
      deleteSession: sessionCapabilities?.delete != null,
    },
    promptCapabilities: {
      image: capabilities?.promptCapabilities?.image === true,
      audio: capabilities?.promptCapabilities?.audio === true,
      embeddedContext:
        capabilities?.promptCapabilities?.embeddedContext === true,
    },
    additionalDirectories: sessionCapabilities?.additionalDirectories != null,
    mcp: {
      stdio: true,
      http: capabilities?.mcpCapabilities?.http === true,
      sse: capabilities?.mcpCapabilities?.sse === true,
    },
  };

  return new V1Driver(connection, initialization, sink, host, () => {
    closedByClient = true;
  });
}

class V1Driver implements ProtocolDriver {
  readonly version = 1 as const;
  #modeOnly = false;

  constructor(
    private readonly connection: acp.ClientConnection,
    readonly initialized: ProtocolInitialization,
    private readonly sink: DriverConnectOptions["sink"],
    private readonly host: ChatHost | undefined,
    private readonly markClosed: () => void,
  ) {}

  async newSession(options: SessionOptions): Promise<ProtocolSession> {
    validateSessionOptions(options, this.initialized, 1, "session/new");
    const response = await requestSessionWithAuthMapping(
      () =>
        this.connection.agent.request(
          acp.methods.agent.session.new,
          toV1SessionRequest(options),
        ),
      1,
      "session/new",
    );
    this.#modeOnly = !response.configOptions?.length && Boolean(response.modes);
    return sessionFromResponse(
      response.sessionId,
      response.configOptions,
      response.modes,
    );
  }

  async openSession(
    sessionId: string,
    options: SessionOptions,
    history: "all" | "none",
  ): Promise<ProtocolSession> {
    validateSessionOptions(options, this.initialized, 1, "session/open");
    const request = { ...toV1SessionRequest(options), sessionId };
    if (history === "all" && this.initialized.capabilities.loadSession) {
      const response = await requestSessionWithAuthMapping(
        () =>
          this.connection.agent.request(
            acp.methods.agent.session.load,
            request,
          ),
        1,
        "session/open",
      );
      return sessionFromResponse(
        sessionId,
        response.configOptions,
        response.modes,
      );
    }
    if (!this.initialized.capabilities.resumeSession) {
      throw new PrettyAuiError(
        "CAPABILITY_REQUIRED",
        "The agent cannot open existing sessions",
        {
          protocol: 1,
          phase: "session/resume",
        },
      );
    }
    const response = await requestSessionWithAuthMapping(
      () =>
        this.connection.agent.request(
          acp.methods.agent.session.resume,
          request,
        ),
      1,
      "session/open",
    );
    return sessionFromResponse(
      sessionId,
      response.configOptions,
      response.modes,
      history === "all",
    );
  }

  async listSessions(cwd: string, cursor?: string): Promise<SessionPage> {
    if (!this.initialized.capabilities.listSessions) {
      throw new PrettyAuiError(
        "CAPABILITY_REQUIRED",
        "The agent does not support session/list",
        { protocol: 1 },
      );
    }
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
        { protocol: 1 },
      );
    }
    await this.connection.agent.request(acp.methods.agent.session.delete, {
      sessionId,
    });
  }

  async closeSession(sessionId: string): Promise<void> {
    if (!this.initialized.capabilities.closeSession) return;
    await this.connection.agent.request(acp.methods.agent.session.close, {
      sessionId,
    });
  }

  async prompt(
    sessionId: string,
    prompt: readonly ContentBlock[],
    onAccepted: () => void,
  ): Promise<string> {
    const pending = this.connection.agent.request(
      acp.methods.agent.session.prompt,
      {
        sessionId,
        prompt: prompt as acp.ContentBlock[],
      },
    );
    onAccepted();
    const response = await pending;
    return response.stopReason;
  }

  async cancel(sessionId: string): Promise<void> {
    await this.connection.agent.notify(acp.methods.agent.session.cancel, {
      sessionId,
    });
  }

  async setConfigOption(
    sessionId: string,
    id: string,
    value: string | boolean,
  ): Promise<readonly ChatConfigOption[]> {
    if (this.#modeOnly && id === "mode" && typeof value === "string") {
      await this.connection.agent.request(acp.methods.agent.session.setMode, {
        sessionId,
        modeId: value,
      });
      return [];
    }
    const response = await this.connection.agent.request(
      acp.methods.agent.session.setConfigOption,
      {
        sessionId,
        configId: id,
        value,
        ...(typeof value === "boolean" ? { type: "boolean" as const } : {}),
      },
    );
    return normalizeConfigOptions(
      (response as { configOptions?: unknown }).configOptions,
    );
  }

  async authenticate(method: AuthMethod): Promise<void> {
    if (method.type === "terminal") {
      if (!this.host?.terminalAuth) {
        throw new PrettyAuiError(
          "CAPABILITY_REQUIRED",
          "Terminal authentication needs a host handler",
          { protocol: 1 },
        );
      }
      await this.host.terminalAuth(method);
      return;
    }
    await this.connection.agent.request(acp.methods.agent.authenticate, {
      methodId: method.id,
    });
  }

  async logout(): Promise<void> {
    await this.connection.agent.request(acp.methods.agent.logout, {});
  }

  async close(error?: unknown): Promise<void> {
    this.markClosed();
    this.connection.close(error);
    await this.connection.closed;
  }
}

function toV1SessionRequest(options: SessionOptions): acp.NewSessionRequest {
  return {
    cwd: options.cwd,
    mcpServers: (options.mcpServers ?? []).map(toV1Mcp),
    ...(options.additionalDirectories?.length
      ? { additionalDirectories: [...options.additionalDirectories] }
      : {}),
  };
}

function toV1Mcp(server: McpServer): acp.McpServer {
  if (server.type === "stdio") {
    return {
      name: server.name,
      command: server.command,
      args: [...(server.args ?? [])],
      env: [...(server.env ?? [])],
    };
  }
  return {
    type: server.type,
    name: server.name,
    url: server.url,
    headers: [...(server.headers ?? [])],
  };
}

function sessionFromResponse(
  sessionId: string,
  configOptions: unknown,
  modes: unknown,
  historyGap = false,
): ProtocolSession {
  const configs = normalizeConfigOptions(configOptions);
  return {
    sessionId,
    configOptions: configs.length ? configs : normalizeModes(modes),
    ...(historyGap ? { historyGap } : {}),
  };
}

function normalizePermission(
  raw: unknown,
): Omit<import("../types.js").PermissionInteraction, "id"> {
  const params = isRecord(raw) ? raw : {};
  const toolCall = isRecord(params.toolCall) ? params.toolCall : {};
  return {
    type: "permission",
    title: asString(toolCall.title) ?? "Permission required",
    options: normalizePermissionOptions(params.options),
  };
}
