import { PrettyAuiError, toChatError } from "./errors.js";
import {
  createUserMessageEnvelopeToken,
  envelopeUserPrompt,
} from "./prompt-envelope.js";
import { connectProtocol } from "./protocol/connect.js";
import {
  boundedRecord,
  isRecord,
  TimelineStore,
  type ReducerEffect,
} from "./protocol/normalize.js";
import type {
  ProtocolDriver,
  ProtocolSession,
  ProtocolSink,
} from "./protocol/types.js";
import { validatePrompt } from "./protocol/types.js";
import {
  utf8StringWithinBudget,
  wireMessageWithinBudget,
} from "./wire-budget.js";
import type {
  AuthMethod,
  ChatCapabilities,
  ChatConfigOption,
  ChatController,
  ChatEvent,
  ChatInput,
  ChatInteraction,
  ChatNoticeInput,
  ChatOptions,
  ChatSessionPhase,
  ChatSnapshot,
  ChatTurnHandle,
  ContentBlock,
  ContextItem,
  ContextProvider,
  ContextSelectionItem,
  ElicitationDecision,
  ElicitationInteraction,
  PermissionDecision,
  PermissionInteraction,
  SessionInfo,
  SessionPage,
} from "./types.js";

const NO_CAPABILITIES: ChatCapabilities = {
  listSessions: false,
  loadSession: false,
  resumeSession: false,
  closeSession: false,
  deleteSession: false,
};
const MAX_MODEL_PREFERENCE_LENGTH = 16 * 1024;
const MAX_NOTICE_LENGTH = 16 * 1024;
const MAX_CONTEXT_FAILURE_DETAIL_LENGTH = 1_024;

interface PendingInteraction<Decision> {
  readonly sessionId?: string;
  readonly interaction: ChatInteraction;
  readonly resolve: (decision: Decision) => void;
}

interface ActiveTurn {
  readonly id: string;
  readonly sessionId: string;
  readonly abort: AbortController;
  readonly contextSelection: readonly ContextSelectionItem[];
  cancelled: boolean;
  submitted: boolean;
}

interface ManagedSession {
  readonly sessionId: string;
  readonly instanceId: string;
  readonly timeline: TimelineStore;
  phase: ChatSessionPhase;
  activeTurn: ActiveTurn | undefined;
  configOptions: ChatSnapshot["configOptions"];
  commands: ChatSnapshot["commands"];
  interactions: ChatSnapshot["interactions"];
  sessionTitle: string | undefined;
  sessionTitleSource: "catalog" | "notification" | undefined;
  historyGap: boolean;
  usage: ChatSnapshot["usage"];
  stopReason: string | undefined;
  error: ChatSnapshot["error"];
  lastSelected: number;
}

interface StagingSession {
  readonly sessionId: string;
  readonly timeline: TimelineStore;
  configOptions: ChatSnapshot["configOptions"];
  commands: ChatSnapshot["commands"];
  sessionTitle: string | undefined;
  sessionTitleSource: "catalog" | "notification" | undefined;
}

/**
 * Creates a framework-neutral chat controller and starts ACP initialization.
 *
 * The caller owns the returned controller and must call `destroy()` when its
 * lifetime ends.
 */
export function createChat(options: ChatOptions): ChatController {
  return new DefaultChatController(options);
}

class DefaultChatController implements ChatController, ProtocolSink {
  readonly ready: Promise<void>;
  readonly #options: ChatOptions;
  readonly #listeners = new Set<() => void>();
  #contextUnsubscribe: (() => void) | undefined;
  #contextMutation: symbol | undefined;
  #contextSelection: readonly ContextSelectionItem[];
  readonly #sessions = new Map<string, ManagedSession>();
  readonly #staging = new Map<string, StagingSession>();
  #connectionAbort: AbortController | undefined;
  readonly #permissions = new Map<
    string,
    PendingInteraction<PermissionDecision>
  >();
  readonly #elicitations = new Map<
    string,
    PendingInteraction<ElicitationDecision>
  >();
  #connectionInteractions: ChatSnapshot["interactions"] = [];
  #driver: ProtocolDriver | undefined;
  #snapshot: ChatSnapshot;
  #counter = 0;
  #selectionCounter = 0;
  #sessionInstanceCounter = 0;
  #selectionRequest = 0;
  #destroyed = false;
  #connecting: Promise<void> | undefined;
  #connectionGeneration = 0;
  #connectionPhase:
    "connecting" | "ready" | "auth_required" | "error" | "closed" =
    "connecting";
  #connectionError: ChatSnapshot["error"];
  #sessionTrail: ChatSnapshot["sessionTrail"] = [];
  #modelPreference: string | undefined;
  readonly #newSessionMode: string | undefined;
  #newSessionMutation: symbol | undefined;
  readonly #sessionMutations = new Map<string, symbol>();
  #sessionListRequest:
    | {
        readonly cursor: string | undefined;
        readonly operation: Promise<SessionPage>;
        readonly token: symbol;
      }
    | undefined;
  #sessionTitleRefresh: Promise<void> | undefined;
  #sessionTitleRefreshRequested = false;

  constructor(options: ChatOptions) {
    this.#options = options;
    this.#modelPreference = this.#readModelPreference();
    this.#newSessionMode = this.#readNewSessionMode();
    this.#contextSelection = readContextSelection(options.context);
    this.#snapshot = {
      phase: "connecting",
      loadedSessions: [],
      historyGap: false,
      activities: [],
      configOptions: [],
      commands: [],
      contextSelection: this.#contextProjection(),
      interactions: [],
      authMethods: [],
      capabilities: NO_CAPABILITIES,
      sessionTrail: [],
    };
    if (isContextProvider(options.context)) {
      this.#contextUnsubscribe = options.context.subscribe(() => {
        if (this.#destroyed) return;
        this.#syncContextSelection();
      });
    }
    this.ready = this.#connect(true);
    void this.ready.catch(() => undefined);
  }

  getSnapshot(): ChatSnapshot {
    return this.#snapshot;
  }

  subscribe(listener: () => void): () => void {
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  }

  appendNotice(input: ChatNoticeInput): boolean {
    if (this.#destroyed) return false;
    if (
      !isRecord(input) ||
      typeof input.text !== "string" ||
      input.text.length === 0 ||
      !utf8StringWithinBudget(input.text, MAX_NOTICE_LENGTH) ||
      (input.level !== "info" && input.level !== "error") ||
      (input.sessionId !== undefined &&
        (typeof input.sessionId !== "string" ||
          input.sessionId.trim().length === 0))
    ) {
      throw new PrettyAuiError(
        "INVALID_CONFIGURATION",
        `Notice text must contain 1 to ${MAX_NOTICE_LENGTH} UTF-8 bytes, use an info or error level, and target a non-empty session ID when provided`,
        { phase: "notice" },
      );
    }
    const sessionId = input.sessionId ?? this.#snapshot.sessionId;
    if (!sessionId) return false;
    const session = this.#sessions.get(sessionId);
    if (!session) return false;
    session.timeline.addNotice({
      type: "notice",
      id: `host-notice-${++this.#counter}`,
      text: input.text,
      level: input.level,
    });
    this.#refreshSession(session);
    return true;
  }

  send(input: ChatInput): ChatTurnHandle {
    this.#assertUsableSession();
    const session = this.#requireSession();
    if (this.#sessionMutations.has(session.sessionId)) {
      throw new PrettyAuiError(
        "SESSION_BUSY",
        `Wait for the current operation on session '${session.sessionId}'`,
        { protocol: this.#driver?.version, phase: "prompt" },
      );
    }
    if (session.activeTurn) {
      throw new PrettyAuiError(
        "SESSION_BUSY",
        "Wait for the current turn to finish",
        {
          protocol: this.#driver?.version,
          phase: "prompt",
        },
      );
    }
    if (
      session.phase !== "idle" ||
      !this.#requireDriver().promptReady(session.sessionId)
    ) {
      throw new PrettyAuiError(
        "SESSION_BUSY",
        `Session '${session.sessionId}' is not ready for another prompt`,
        { protocol: this.#driver?.version, phase: "prompt" },
      );
    }
    const blocks = normalizeInput(input);
    if (
      blocks.some(
        (block) =>
          block._meta !== null &&
          block._meta !== undefined &&
          Object.hasOwn(block._meta, "pretty-aui/context"),
      )
    ) {
      throw new PrettyAuiError(
        "INVALID_CONFIGURATION",
        "Prompt input cannot use the reserved pretty-aui/context metadata key",
        { phase: "prompt" },
      );
    }
    if (
      !blocks.length ||
      blocks.every(
        (block) =>
          block.type === "text" &&
          typeof block.text === "string" &&
          !block.text.trim(),
      )
    ) {
      throw new PrettyAuiError(
        "INVALID_CONFIGURATION",
        "A prompt cannot be empty",
        { phase: "prompt" },
      );
    }
    validatePrompt(
      blocks,
      this.#requireDriver().initialized.promptCapabilities,
      this.#requireDriver().version,
    );
    const turnId = `turn-${++this.#counter}`;
    const abort = new AbortController();
    const turn: ActiveTurn = {
      id: turnId,
      sessionId: session.sessionId,
      abort,
      contextSelection: this.#contextSelection,
      cancelled: false,
      submitted: false,
    };
    session.activeTurn = turn;
    session.timeline.beginTurn();
    session.timeline.addUserMessage(blocks, true, Date.now());
    session.phase = "running";
    session.stopReason = undefined;
    session.error = undefined;
    this.#refreshSession(session, true);
    this.#emit({ type: "turn_started", sessionId: session.sessionId, turnId });
    const done = this.#runTurn(turn, blocks);
    void done.catch(() => undefined);
    return { id: turnId, done };
  }

  async addContext(): Promise<void> {
    const provider = this.#contextProvider("add");
    if (!provider.add) {
      throw new PrettyAuiError(
        "METHOD_NOT_AVAILABLE",
        "The context provider does not support adding context",
        { phase: "context/add" },
      );
    }
    await this.#mutateContext("context/add", () => provider.add!());
  }

  async removeContext(id: string): Promise<void> {
    const provider = this.#contextProvider("remove");
    if (!provider.remove) {
      throw new PrettyAuiError(
        "METHOD_NOT_AVAILABLE",
        "The context provider does not support removing context",
        { phase: "context/remove" },
      );
    }
    if (!this.#contextSelection.some((item) => item.id === id)) {
      throw new PrettyAuiError(
        "INVALID_CONFIGURATION",
        `Unknown context selection '${id}'`,
        { phase: "context/remove" },
      );
    }
    await this.#mutateContext("context/remove", () => provider.remove!(id));
  }

  async cancel(sessionId?: string): Promise<void> {
    const session = this.#requireSession(sessionId);
    const turn = session.activeTurn;
    if (!turn || turn.cancelled) return;
    turn.cancelled = true;
    turn.abort.abort(TURN_CANCELLED);
    this.#resolveInteractions(session.sessionId);
    session.phase = "cancelling";
    this.#refreshSession(session, true);
    if (!turn.submitted) return;
    const driver = this.#driver;
    if (driver) {
      try {
        await driver.cancel(session.sessionId);
      } catch (error) {
        if (session.activeTurn === turn) {
          turn.cancelled = false;
          this.#fail(error, session.sessionId);
        }
        throw error;
      }
    }
  }

  async reconnect(): Promise<void> {
    this.#assertConnectionReplaceable();
    await this.#withNewSessionOperation("connection/reconnect", () =>
      this.#connect(false),
    );
  }

  async newSession(): Promise<void> {
    this.#assertSessionCapacity();
    try {
      await this.#withNewSessionOperation("session/new", async () => {
        const driver = this.#requireDriver();
        const session = await this.#newSession(driver);
        const managed = this.#createSession(session);
        this.#selectSession(managed);
      });
    } catch (error) {
      throw this.#mapAuthenticationFailure(error, "session/new");
    }
  }

  async listSessions(cursor?: string): Promise<SessionPage> {
    const active = this.#sessionListRequest;
    if (active) {
      if (active.cursor === cursor) return active.operation;
      throw new PrettyAuiError(
        "SESSION_BUSY",
        "Wait for the current session-list request to finish",
        { protocol: this.#driver?.version, phase: "session/list" },
      );
    }
    const driver = this.#requireDriver();
    const token = Symbol("session/list");
    const operation = Promise.resolve().then(async () => {
      try {
        const page = await driver.listSessions(
          this.#options.session.cwd,
          cursor,
        );
        this.#assertDriverCurrent(driver);
        const sessions =
          cursor && this.#snapshot.sessions
            ? {
                sessions: deduplicateSessions([
                  ...this.#snapshot.sessions.sessions,
                  ...page.sessions,
                ]).slice(0, 1_000),
                ...(page.nextCursor ? { nextCursor: page.nextCursor } : {}),
              }
            : page;
        this.#reconcileCatalogTitles(sessions.sessions);
        this.#snapshot = cleanSnapshot({ ...this.#snapshot, sessions });
        this.#publish();
        return sessions;
      } finally {
        if (this.#sessionListRequest?.token === token)
          this.#sessionListRequest = undefined;
      }
    });
    this.#sessionListRequest = { cursor, operation, token };
    return operation;
  }

  async openSession(sessionId: string): Promise<void> {
    const request = ++this.#selectionRequest;
    const loaded = this.#sessions.get(sessionId);
    if (loaded) {
      if (request === this.#selectionRequest) this.#selectSession(loaded);
      return;
    }
    this.#assertSessionCapacity();
    await this.#withTargetSessionOperation(
      sessionId,
      "session/open",
      async () =>
        this.#openSession(this.#requireDriver(), sessionId, [], request),
    );
  }

  async openChildSession(sessionId: string): Promise<void> {
    const current = this.#requireSession();
    this.#assertSessionIdle(current, "session/open-child");
    if (sessionId === current.sessionId) return;
    const trail = [
      ...this.#snapshot.sessionTrail,
      {
        sessionId: current.sessionId,
        ...(current.sessionTitle ? { title: current.sessionTitle } : {}),
      },
    ];
    const request = ++this.#selectionRequest;
    const loaded = this.#sessions.get(sessionId);
    if (loaded) {
      this.#selectSession(loaded, trail);
      return;
    }
    this.#assertSessionCapacity();
    await this.#withTargetSessionOperation(
      sessionId,
      "session/open-child",
      async () =>
        this.#openSession(this.#requireDriver(), sessionId, trail, request),
    );
  }

  async openAncestorSession(sessionId: string): Promise<void> {
    this.#assertSessionIdle(this.#requireSession(), "session/open-ancestor");
    const ancestorIndex = this.#snapshot.sessionTrail.findIndex(
      (session) => session.sessionId === sessionId,
    );
    if (ancestorIndex < 0) {
      throw new PrettyAuiError(
        "INVALID_CONFIGURATION",
        `Session '${sessionId}' is not an ancestor of the active session`,
        { phase: "session/open-ancestor" },
      );
    }
    const trail = this.#snapshot.sessionTrail.slice(0, ancestorIndex);
    const request = ++this.#selectionRequest;
    const loaded = this.#sessions.get(sessionId);
    if (loaded) {
      this.#selectSession(loaded, trail);
      return;
    }
    this.#assertSessionCapacity();
    await this.#withTargetSessionOperation(
      sessionId,
      "session/open-ancestor",
      async () =>
        this.#openSession(this.#requireDriver(), sessionId, trail, request),
    );
  }

  async closeSession(sessionId?: string): Promise<void> {
    const target = this.#requireSession(sessionId);
    this.#assertSessionIdle(target, "session/close");
    await this.#withTargetSessionOperation(
      target.sessionId,
      "session/close",
      async () => {
        const driver = this.#requireDriver();
        await driver.closeSession(target.sessionId);
        this.#assertDriverCurrent(driver);
        this.#resolveInteractions(target.sessionId);
        this.#sessions.delete(target.sessionId);
        if (this.#snapshot.sessionId === target.sessionId) {
          const fallback = [...this.#sessions.values()].sort(
            (left, right) => right.lastSelected - left.lastSelected,
          )[0];
          if (fallback) this.#selectSession(fallback);
          else this.#clearSelection();
        } else {
          this.#publish();
        }
      },
    );
  }

  async deleteSession(sessionId: string): Promise<void> {
    if (sessionId === this.#snapshot.sessionId) {
      throw new PrettyAuiError(
        "INVALID_CONFIGURATION",
        "The active session cannot be deleted",
        { phase: "session/delete" },
      );
    }
    const loaded = this.#sessions.get(sessionId);
    if (loaded) this.#assertSessionIdle(loaded, "session/delete");
    await this.#withTargetSessionOperation(
      sessionId,
      "session/delete",
      async () => {
        const driver = this.#requireDriver();
        await driver.deleteSession(sessionId);
        this.#assertDriverCurrent(driver);
        if (loaded) {
          this.#resolveInteractions(sessionId);
          this.#sessions.delete(sessionId);
        }
        if (this.#snapshot.sessions) {
          this.#snapshot = cleanSnapshot({
            ...this.#snapshot,
            sessions: {
              ...this.#snapshot.sessions,
              sessions: this.#snapshot.sessions.sessions.filter(
                (session) => session.sessionId !== sessionId,
              ),
            },
          });
        }
        this.#publish();
      },
    );
  }

  async setConfigOption(id: string, value: string | boolean): Promise<void> {
    const session = this.#requireSession();
    this.#assertSessionIdle(session, "session/set-config");
    await this.#withTargetSessionOperation(
      session.sessionId,
      "session/set-config",
      async () => {
        const driver = this.#requireDriver();
        const returned = await driver.setConfigOption(
          session.sessionId,
          id,
          value,
        );
        this.#assertDriverCurrent(driver);
        session.configOptions = returned.length
          ? returned
          : session.configOptions.map((option) =>
              option.id === id ? { ...option, currentValue: value } : option,
            );
        this.#syncModelPreference(session);
        this.#refreshSession(session);
      },
    );
  }

  async authenticate(methodId: string): Promise<void> {
    if (this.#options.allowAuthentication === false) {
      throw new PrettyAuiError(
        "AUTHENTICATION_DISABLED",
        "Agent authentication is disabled by the host",
        { phase: "auth/login" },
      );
    }
    const method = this.#snapshot.authMethods.find(
      (candidate) => candidate.id === methodId,
    );
    if (!method)
      throw new PrettyAuiError(
        "INVALID_CONFIGURATION",
        `Unknown authentication method '${methodId}'`,
      );
    await this.#withNewSessionOperation("auth/login", async () => {
      const driver = this.#requireDriver();
      this.#connectionPhase = "connecting";
      this.#connectionError = undefined;
      this.#publish();
      try {
        await driver.authenticate(method);
        this.#assertDriverCurrent(driver);
        const session = await this.#newSession(driver);
        this.#connectionPhase = "ready";
        const managed = this.#createSession(session);
        this.#selectSession(managed);
      } catch (error) {
        this.#fail(error);
        throw error;
      }
    });
  }

  async logout(): Promise<void> {
    this.#assertConnectionReplaceable();
    await this.#withNewSessionOperation("auth/logout", async () => {
      const driver = this.#requireDriver();
      await driver.logout();
      this.#assertDriverCurrent(driver);
      this.#resolveInteractions();
      this.#sessions.clear();
      this.#connectionPhase = "auth_required";
      this.#clearSelection();
    });
  }

  respondPermission(id: string, decision: PermissionDecision): boolean {
    const pending = this.#permissions.get(id);
    if (!pending) return false;
    this.#permissions.delete(id);
    pending.resolve(decision);
    this.#removeInteraction(id, pending.sessionId);
    return true;
  }

  respondElicitation(id: string, decision: ElicitationDecision): boolean {
    const pending = this.#elicitations.get(id);
    if (!pending) return false;
    this.#elicitations.delete(id);
    pending.resolve(decision);
    this.#removeInteraction(id, pending.sessionId);
    return true;
  }

  async destroy(): Promise<void> {
    if (this.#destroyed) return;
    this.#destroyed = true;
    this.#contextUnsubscribe?.();
    this.#contextUnsubscribe = undefined;
    this.#contextMutation = undefined;
    this.#connectionGeneration += 1;
    this.#connectionAbort?.abort();
    const interrupted = new PrettyAuiError(
      "TURN_INTERRUPTED",
      "Chat was destroyed before the turn completed",
      { phase: "destroy", retryable: false },
    );
    for (const session of this.#sessions.values()) {
      session.activeTurn?.abort.abort(interrupted);
    }
    this.#resolveInteractions();
    const driver = this.#driver;
    this.#driver = undefined;
    this.#staging.clear();
    this.#connectionPhase = "closed";
    this.#publish();
    await driver?.close().catch(() => undefined);
    this.#listeners.clear();
  }

  onUpdate(sessionId: string, update: unknown): void {
    if (this.#destroyed) return;
    const staging = this.#staging.get(sessionId);
    const session = this.#sessions.get(sessionId);
    if (!staging && !session) {
      this.#emit({
        type: "diagnostic",
        sessionId,
        code: "UNKNOWN_SESSION_UPDATE",
        message: `Ignored an update for unloaded session '${sessionId}'`,
      });
      return;
    }
    const timeline = staging?.timeline ?? session!.timeline;
    const effect = timeline.reduce(update, this.#driver?.version ?? 1);
    if (staging) {
      this.#applyStagingEffect(staging, effect);
      return;
    }
    const summaryChanged = this.#applyEffect(session!, effect);
    this.#refreshSession(session!, summaryChanged);
  }

  onPermission(
    sessionId: string,
    interaction: Omit<PermissionInteraction, "id">,
    _raw: unknown,
  ): Promise<PermissionDecision> {
    const session = this.#sessions.get(sessionId);
    if (this.#destroyed || !session?.activeTurn) {
      return Promise.resolve({ outcome: "cancelled" });
    }
    if (!this.#hasInteractionCapacity()) {
      return Promise.resolve({ outcome: "cancelled" });
    }
    const id = `permission-${++this.#counter}`;
    const complete: PermissionInteraction = { ...interaction, id };
    return new Promise((resolve) => {
      this.#permissions.set(id, { sessionId, interaction: complete, resolve });
      this.#addInteraction(complete, sessionId);
    });
  }

  onElicitation(
    sessionId: string | undefined,
    interaction: Omit<ElicitationInteraction, "id">,
    _raw: unknown,
  ): Promise<ElicitationDecision> {
    if (
      this.#destroyed ||
      (sessionId !== undefined && !this.#sessions.has(sessionId)) ||
      (interaction.elicitationId !== undefined &&
        this.#findElicitation(interaction.elicitationId) !== undefined)
    ) {
      return Promise.resolve({ action: "cancel" });
    }
    if (!this.#hasInteractionCapacity()) {
      return Promise.resolve({ action: "cancel" });
    }
    const id = `elicitation-${++this.#counter}`;
    const complete: ElicitationInteraction = { ...interaction, id };
    return new Promise((resolve) => {
      this.#elicitations.set(id, {
        ...(sessionId === undefined ? {} : { sessionId }),
        interaction: complete,
        resolve,
      });
      this.#addInteraction(complete, sessionId);
    });
  }

  onElicitationComplete(elicitationId: string): void {
    if (this.#destroyed) return;
    const id = this.#findElicitation(elicitationId);
    if (!id) return;
    const pending = this.#elicitations.get(id);
    if (!pending) return;
    this.#elicitations.delete(id);
    pending.resolve({ action: "accept" });
    this.#removeInteraction(id, pending.sessionId);
  }

  onProtocol(method: string, raw: unknown): void {
    const protocolVersion = this.#driver?.version;
    if (protocolVersion)
      this.#emit({ type: "protocol", protocolVersion, method, raw });
  }

  onDisconnect(): void {
    if (this.#destroyed) return;
    this.#resolveInteractions();
    this.#fail(
      new PrettyAuiError("CONNECTION_CLOSED", "The ACP connection closed", {
        protocol: this.#driver?.version,
        phase: "connection",
        retryable: true,
      }),
    );
  }

  async #connect(createSession: boolean): Promise<void> {
    if (this.#connecting) return this.#connecting;
    const connecting = this.#connectInner(createSession);
    this.#connecting = connecting;
    void connecting.then(
      () => {
        if (this.#connecting === connecting) this.#connecting = undefined;
      },
      () => {
        if (this.#connecting === connecting) this.#connecting = undefined;
      },
    );
    return connecting;
  }

  async #connectInner(createSession: boolean): Promise<void> {
    if (this.#destroyed) throw connectionClosedError();
    const generation = ++this.#connectionGeneration;
    this.#connectionAbort?.abort();
    const connectionAbort = new AbortController();
    this.#connectionAbort = connectionAbort;
    this.#connectionPhase = "connecting";
    this.#connectionError = undefined;
    this.#publish();
    const previous = this.#driver;
    const previousSessionId = this.#snapshot.sessionId;
    const previousTrail = this.#sessionTrail;
    const previousSessions = [...this.#sessions.values()];
    if (previous) {
      this.#driver = undefined;
      await previous.close().catch(() => undefined);
      this.#assertConnectionCurrent(generation);
    }
    let driver: ProtocolDriver | undefined;
    try {
      driver = await connectProtocol({
        connector: this.#options.connector,
        protocol: this.#options.protocol ?? 1,
        signal: connectionAbort.signal,
        sink: this,
        clientInfo: {
          name: this.#options.clientInfo?.name ?? "pretty-aui",
          version: this.#options.clientInfo?.version ?? "0.1.0",
          ...(this.#options.clientInfo?.title
            ? { title: this.#options.clientInfo.title }
            : {}),
        },
        ...(this.#options.host ? { host: this.#options.host } : {}),
      });
      if (!this.#isConnectionCurrent(generation)) {
        await driver.close().catch(() => undefined);
        throw connectionClosedError();
      }
      this.#driver = driver;
      this.#snapshot = cleanSnapshot({
        ...this.#snapshot,
        protocolVersion: driver.version,
        agentName: driver.initialized.agentName,
        authMethods:
          this.#options.allowAuthentication === false
            ? []
            : driver.initialized.authMethods,
        capabilities: driver.initialized.capabilities,
      });
      this.#publish();
      this.#emit({ type: "connected", protocolVersion: driver.version });
      if (createSession) {
        const initial = this.#options.initialSession ?? {
          type: "new" as const,
        };
        if (initial.type === "none") {
          this.#sessions.clear();
          this.#connectionPhase = "ready";
          this.#clearSelection();
          return;
        }
        if (initial.type === "open") {
          this.#assertSessionCapacity();
          await this.#openSession(
            driver,
            initial.sessionId,
            [],
            ++this.#selectionRequest,
          );
          this.#connectionPhase = "ready";
          this.#publish();
          return;
        }
        const opened = await this.#newSession(driver);
        this.#assertConnectionCurrent(generation, driver);
        this.#sessions.clear();
        this.#connectionPhase = "ready";
        this.#selectSession(this.#createSession(opened));
        return;
      }

      if (!previousSessions.length) {
        this.#connectionPhase = "ready";
        this.#clearSelection();
        return;
      }
      if (
        !driver.initialized.capabilities.resumeSession &&
        !driver.initialized.capabilities.loadSession
      ) {
        const opened = await this.#newSession(driver);
        this.#assertConnectionCurrent(generation, driver);
        this.#sessions.clear();
        this.#connectionPhase = "ready";
        this.#selectSession(this.#createSession(opened));
        return;
      }

      const ordered = [...previousSessions].sort((left, right) => {
        if (left.sessionId === previousSessionId) return -1;
        if (right.sessionId === previousSessionId) return 1;
        return right.lastSelected - left.lastSelected;
      });
      for (const oldSession of ordered) {
        try {
          const history = driver.initialized.capabilities.resumeSession
            ? "none"
            : "all";
          const timeline =
            history === "none" ? oldSession.timeline : new TimelineStore();
          const staging: StagingSession = {
            sessionId: oldSession.sessionId,
            timeline,
            configOptions: oldSession.configOptions,
            commands: oldSession.commands,
            sessionTitle: oldSession.sessionTitle,
            sessionTitleSource: oldSession.sessionTitleSource,
          };
          this.#staging.set(oldSession.sessionId, staging);
          const restored = await driver.openSession(
            oldSession.sessionId,
            this.#options.session,
            history,
          );
          this.#assertConnectionCurrent(generation, driver);
          if (history === "all") {
            this.#applyStagingEffect(staging, timeline.finalizeReplay());
          }
          const managed = this.#createSession(
            restored,
            timeline,
            staging,
            oldSession.instanceId,
          );
          managed.lastSelected = oldSession.lastSelected;
          managed.usage = oldSession.usage;
          if (oldSession.sessionId === previousSessionId) {
            this.#selectSession(managed, previousTrail);
          }
        } catch (error) {
          if (oldSession.sessionId === previousSessionId) throw error;
          oldSession.phase = "error";
          oldSession.error = toChatError(error);
          this.#sessions.set(oldSession.sessionId, oldSession);
        } finally {
          this.#staging.delete(oldSession.sessionId);
        }
      }
      this.#connectionPhase = "ready";
      this.#publish();
    } catch (error) {
      if (!this.#isConnectionCurrent(generation)) {
        if (driver && this.#driver === driver) this.#driver = undefined;
        await driver?.close().catch(() => undefined);
        throw connectionClosedError();
      }
      if (
        error instanceof PrettyAuiError &&
        error.code === "AUTHENTICATION_REQUIRED" &&
        driver?.initialized.authMethods.length
      ) {
        if (this.#options.allowAuthentication === false) {
          const disabled = new PrettyAuiError(
            "AUTHENTICATION_DISABLED",
            "The agent requires authentication disabled by the host",
            { cause: error, protocol: driver?.version, phase: "session/new" },
          );
          this.#fail(disabled);
          throw disabled;
        }
        this.#connectionPhase = "auth_required";
        this.#connectionError = undefined;
        this.#publish();
        throw new PrettyAuiError(
          "AUTHENTICATION_REQUIRED",
          "Authentication is required before a session can be created",
          {
            cause: error,
            protocol: driver?.version,
            phase: "session/new",
          },
        );
      }
      this.#fail(error);
      throw error;
    }
  }

  async #runTurn(
    turn: ActiveTurn,
    input: readonly ContentBlock[],
  ): Promise<{ stopReason: string }> {
    try {
      const driver = this.#requireDriver();
      const session = this.#requireSession(turn.sessionId);
      const contextItems = await this.#resolveContext(
        session.sessionId,
        input,
        turn.contextSelection,
        turn.abort.signal,
      );
      throwIfAborted(turn.abort.signal);
      const submittedContext = contextItems.map((item) => ({
        ...item,
        content: item.content.map((block) => withContextMeta(block, item)),
      }));
      const promptInput = submittedContext.length
        ? envelopeUserPrompt(input, createUserMessageEnvelopeToken())
        : input;
      const prompt = [
        ...submittedContext.flatMap((item) => item.content),
        ...promptInput,
      ];
      validatePrompt(
        prompt,
        driver.initialized.promptCapabilities,
        driver.version,
      );
      if (
        !wireMessageWithinBudget({
          jsonrpc: "2.0",
          id: Number.MAX_SAFE_INTEGER,
          method: "session/prompt",
          params: { sessionId: session.sessionId, prompt },
        })
      ) {
        throw new PrettyAuiError(
          "INVALID_CONFIGURATION",
          "The prepared ACP prompt exceeds the 2 MiB wire-message limit",
          { protocol: driver.version, phase: "prompt" },
        );
      }
      throwIfAborted(turn.abort.signal);
      turn.submitted = true;
      const stopReason = await driver.prompt(session.sessionId, prompt, () => {
        if (this.#destroyed) return;
        session.timeline.markUserAccepted(submittedContext);
        this.#refreshSession(session);
      });
      return this.#completeTurn(
        turn,
        turn.cancelled ? "cancelled" : stopReason,
      );
    } catch (error) {
      if (turn.cancelled || error === TURN_CANCELLED) {
        return this.#completeTurn(turn, "cancelled");
      }
      const session = this.#sessions.get(turn.sessionId);
      if (session?.activeTurn === turn) {
        session.activeTurn = undefined;
        session.timeline.finishTurn();
      }
      this.#fail(error, turn.sessionId);
      throw error;
    }
  }

  async #resolveContext(
    sessionId: string,
    input: readonly ContentBlock[],
    selection: readonly ContextSelectionItem[],
    signal: AbortSignal,
  ): Promise<readonly ContextItem[]> {
    try {
      const source = this.#options.context;
      if (!source) return [];
      const items = isContextProvider(source)
        ? await abortable(
            source.resolve({
              sessionId,
              input,
              selection,
              ...(this.#snapshot.protocolVersion
                ? { protocolVersion: this.#snapshot.protocolVersion }
                : {}),
              capabilities:
                this.#requireDriver().initialized.promptCapabilities,
              signal,
            }),
            signal,
          )
        : source;
      if (
        isContextProvider(source) &&
        (items.length !== selection.length ||
          items.some((item, index) => item.id !== selection[index]?.id))
      ) {
        throw new Error(
          "Resolved context IDs must match the frozen selection order",
        );
      }
      const ids = new Set<string>();
      if (items.length > 64)
        throw new Error("Context is limited to 64 items per turn");
      for (const item of items) {
        if (
          !isRecord(item) ||
          typeof item.id !== "string" ||
          !item.id.trim() ||
          item.id.length > 16 * 1024
        ) {
          throw new Error("Context item IDs must be non-empty bounded strings");
        }
        if (ids.has(item.id))
          throw new Error(`Context item IDs must be unique: '${item.id}'`);
        if (
          typeof item.label !== "string" ||
          !item.label.trim() ||
          item.label.length > 16 * 1024
        ) {
          throw new Error(
            "Context item labels must be non-empty bounded strings",
          );
        }
        if (!Array.isArray(item.content) || !item.content.length) {
          throw new Error(
            "Context items must contain at least one content block",
          );
        }
        ids.add(item.id);
      }
      const canonical = items.map((item) => ({
        id: item.id,
        label: item.label,
        content: item.content.map(canonicalContextBlock),
      }));
      const driver = this.#requireDriver();
      validatePrompt(
        canonical.flatMap((item) => item.content),
        driver.initialized.promptCapabilities,
        driver.version,
      );
      return canonical;
    } catch (error) {
      if (signal.aborted) throw signal.reason ?? error;
      throw new PrettyAuiError("CONTEXT_FAILED", contextFailureMessage(error), {
        cause: error,
        protocol: this.#driver?.version,
        phase: "context",
        retryable: true,
      });
    }
  }

  async #openSession(
    driver: ProtocolDriver,
    sessionId: string,
    sessionTrail: ChatSnapshot["sessionTrail"],
    selectionRequest: number,
  ): Promise<void> {
    const staging: StagingSession = {
      sessionId,
      timeline: new TimelineStore(),
      configOptions: [],
      commands: [],
      sessionTitle: undefined,
      sessionTitleSource: undefined,
    };
    this.#staging.set(sessionId, staging);
    try {
      const session = await driver.openSession(
        sessionId,
        this.#options.session,
        "all",
      );
      this.#assertDriverCurrent(driver);
      this.#applyStagingEffect(staging, staging.timeline.finalizeReplay());
      const managed = this.#createSession(session, staging.timeline, staging);
      if (selectionRequest === this.#selectionRequest) {
        this.#selectSession(managed, sessionTrail);
      } else {
        this.#publish();
      }
    } finally {
      if (this.#staging.get(sessionId) === staging)
        this.#staging.delete(sessionId);
    }
  }

  async #newSession(driver: ProtocolDriver): Promise<ProtocolSession> {
    let session = await driver.newSession(this.#options.session);
    this.#assertDriverCurrent(driver);
    session = await this.#applyNewSessionMode(driver, session);
    const model = findModelOption(session.configOptions);
    const preferred = this.#modelPreference;
    if (
      !model ||
      !preferred ||
      model.currentValue === preferred ||
      !model.options?.some((option) => option.value === preferred)
    ) {
      return session;
    }
    try {
      const returned = await driver.setConfigOption(
        session.sessionId,
        model.id,
        preferred,
      );
      this.#assertDriverCurrent(driver);
      return updateSessionConfigOption(session, model, preferred, returned);
    } catch (error) {
      this.#assertDriverCurrent(driver);
      if (this.#connectionPhase === "error") throw connectionClosedError();
      this.#emit({
        type: "diagnostic",
        sessionId: session.sessionId,
        code: "MODEL_PREFERENCE_APPLY_FAILED",
        message:
          "The preferred model could not be applied; using the Agent default",
      });
      return session;
    }
  }

  async #applyNewSessionMode(
    driver: ProtocolDriver,
    session: ProtocolSession,
  ): Promise<ProtocolSession> {
    const mode = findModeOption(session.configOptions);
    const preferred = this.#newSessionMode;
    if (
      !mode ||
      !preferred ||
      mode.currentValue === preferred ||
      !mode.options?.some((option) => option.value === preferred)
    ) {
      return session;
    }
    try {
      const returned = await driver.setConfigOption(
        session.sessionId,
        mode.id,
        preferred,
      );
      this.#assertDriverCurrent(driver);
      return updateSessionConfigOption(session, mode, preferred, returned);
    } catch (error) {
      this.#assertDriverCurrent(driver);
      if (this.#connectionPhase === "error") throw connectionClosedError();
      this.#emit({
        type: "diagnostic",
        sessionId: session.sessionId,
        code: "NEW_SESSION_MODE_APPLY_FAILED",
        message:
          "The fixed new-session mode could not be applied; using the Agent default",
      });
      return session;
    }
  }

  #applyEffect(session: ManagedSession, effect: ReducerEffect): boolean {
    let summaryChanged = false;
    if (
      effect.state &&
      !session.activeTurn &&
      !(session.phase === "cancelling" && effect.state === "idle")
    ) {
      this.#emit({
        type: "diagnostic",
        sessionId: session.sessionId,
        code: "STALE_SESSION_STATE",
        message: `Ignored ${effect.state} state without an active turn`,
      });
    } else {
      if (effect.state === "running") {
        session.phase = "running";
        summaryChanged = true;
      }
      if (effect.state === "requires_action") {
        session.phase = "awaiting_user";
        summaryChanged = true;
      }
      if (effect.state === "idle") {
        session.phase = "idle";
        if (effect.stopReason) session.stopReason = effect.stopReason;
        summaryChanged = true;
      }
    }
    if (effect.commands) session.commands = effect.commands;
    if (effect.configOptions) session.configOptions = effect.configOptions;
    if (effect.sessionTitle !== undefined) {
      session.sessionTitle = effect.sessionTitle ?? undefined;
      session.sessionTitleSource = "notification";
      summaryChanged = true;
    }
    if (effect.usage) session.usage = effect.usage;
    if (effect.unsupported) {
      this.#emit({
        type: "diagnostic",
        sessionId: session.sessionId,
        code: "UNSUPPORTED_UPDATE",
        message: effect.unsupported,
      });
    }
    this.#emitTimelineDiagnostics(session.sessionId, effect);
    return summaryChanged;
  }

  #hasInteractionCapacity(): boolean {
    if (this.#permissions.size + this.#elicitations.size < 16) return true;
    this.#emit({
      type: "diagnostic",
      code: "INTERACTION_LIMIT",
      message: "Cancelled an interaction beyond the 16-interaction limit",
    });
    return false;
  }

  #applyStagingEffect(staging: StagingSession, effect: ReducerEffect): void {
    if (effect.commands) staging.commands = effect.commands;
    if (effect.configOptions) staging.configOptions = effect.configOptions;
    if (effect.sessionTitle !== undefined) {
      staging.sessionTitle = effect.sessionTitle ?? undefined;
      staging.sessionTitleSource = "notification";
    }
    this.#emitTimelineDiagnostics(staging.sessionId, effect);
  }

  #emitTimelineDiagnostics(sessionId: string, effect: ReducerEffect): void {
    for (const diagnostic of effect.diagnostics ?? []) {
      this.#emit({
        type: "diagnostic",
        sessionId,
        code: diagnostic.code,
        message: diagnostic.message,
      });
    }
  }

  #addInteraction(
    interaction: ChatInteraction,
    sessionId: string | undefined,
  ): void {
    if (sessionId === undefined) {
      this.#connectionInteractions = [
        ...this.#connectionInteractions,
        interaction,
      ];
      this.#publish();
      return;
    }
    const session = this.#sessions.get(sessionId);
    if (!session) return;
    session.interactions = [...session.interactions, interaction];
    session.phase = "awaiting_user";
    this.#refreshSession(session, true);
  }

  #removeInteraction(id: string, sessionId: string | undefined): void {
    if (sessionId === undefined) {
      this.#connectionInteractions = this.#connectionInteractions.filter(
        (interaction) => interaction.id !== id,
      );
      this.#publish();
      return;
    }
    const session = this.#sessions.get(sessionId);
    if (!session) return;
    session.interactions = session.interactions.filter(
      (interaction) => interaction.id !== id,
    );
    session.phase = session.interactions.length
      ? "awaiting_user"
      : session.activeTurn
        ? "running"
        : "idle";
    this.#refreshSession(session, true);
  }

  #resolveInteractions(sessionId?: string): void {
    for (const [id, pending] of this.#permissions) {
      if (sessionId !== undefined && pending.sessionId !== sessionId) continue;
      this.#permissions.delete(id);
      pending.resolve({ outcome: "cancelled" });
    }
    for (const [id, pending] of this.#elicitations) {
      if (sessionId !== undefined && pending.sessionId !== sessionId) continue;
      this.#elicitations.delete(id);
      pending.resolve({ action: "cancel" });
    }
    if (sessionId === undefined) {
      this.#connectionInteractions = [];
      for (const session of this.#sessions.values()) {
        session.interactions = [];
        if (!session.activeTurn) session.phase = "idle";
      }
      this.#publish();
      return;
    }
    const session = this.#sessions.get(sessionId);
    if (!session) return;
    session.interactions = [];
    session.phase = session.activeTurn ? "running" : "idle";
    this.#refreshSession(session, true);
  }

  #findElicitation(elicitationId: string): string | undefined {
    for (const [id, pending] of this.#elicitations) {
      if (
        pending.interaction.type === "elicitation" &&
        pending.interaction.elicitationId === elicitationId
      ) {
        return id;
      }
    }
    return undefined;
  }

  #assertUsableSession(): void {
    if (this.#destroyed)
      throw new PrettyAuiError("CONNECTION_CLOSED", "Chat has been destroyed");
    if (
      this.#connectionPhase !== "ready" ||
      !this.#driver ||
      !this.#snapshot.sessionId
    ) {
      throw new PrettyAuiError(
        "SESSION_NOT_READY",
        "The chat session is not ready",
        { phase: "prompt" },
      );
    }
    if (this.#snapshot.phase === "auth_required") {
      throw new PrettyAuiError(
        "SESSION_NOT_READY",
        "Authenticate before sending a prompt",
        { phase: "prompt" },
      );
    }
  }

  #assertSessionIdle(session: ManagedSession, phase: string): void {
    if (session.activeTurn || session.interactions.length) {
      throw new PrettyAuiError(
        "SESSION_BUSY",
        `Finish session '${session.sessionId}' before changing it`,
        { phase },
      );
    }
  }

  #assertConnectionReplaceable(): void {
    if (this.#destroyed) throw connectionClosedError();
    if (
      this.#connectionInteractions.length ||
      [...this.#sessions.values()].some(
        (session) => session.activeTurn || session.interactions.length,
      )
    ) {
      throw new PrettyAuiError(
        "SESSION_BUSY",
        "Finish all turns and interactions before replacing the connection",
        { phase: "connection/reconnect" },
      );
    }
  }

  #assertSessionCapacity(): void {
    const reservations = [...this.#staging.keys()].filter(
      (sessionId) => !this.#sessions.has(sessionId),
    ).length;
    if (this.#sessions.size + reservations < 16) return;
    throw new PrettyAuiError(
      "SESSION_LIMIT",
      "Close a loaded session before opening another one",
      { phase: "session" },
    );
  }

  #mapAuthenticationFailure(error: unknown, phase: string): unknown {
    if (
      !(error instanceof PrettyAuiError) ||
      error.code !== "AUTHENTICATION_REQUIRED" ||
      !this.#driver?.initialized.authMethods.length
    ) {
      return error;
    }
    if (this.#options.allowAuthentication === false) {
      const disabled = new PrettyAuiError(
        "AUTHENTICATION_DISABLED",
        "The agent requires authentication disabled by the host",
        { cause: error, protocol: this.#driver.version, phase },
      );
      this.#fail(disabled);
      return disabled;
    }
    this.#connectionPhase = "auth_required";
    this.#connectionError = undefined;
    this.#publish();
    return new PrettyAuiError(
      "AUTHENTICATION_REQUIRED",
      "Authentication is required before a session can be created",
      { cause: error, protocol: this.#driver.version, phase },
    );
  }

  #requireDriver(): ProtocolDriver {
    if (this.#destroyed) throw connectionClosedError();
    if (!this.#driver)
      throw new PrettyAuiError(
        "SESSION_NOT_READY",
        "The ACP connection is not ready",
      );
    return this.#driver;
  }

  #fail(error: unknown, sessionId?: string): void {
    if (this.#destroyed) return;
    const normalized = toChatError(error);
    const session = sessionId ? this.#sessions.get(sessionId) : undefined;
    if (session) {
      session.phase = "error";
      session.error = normalized;
      this.#refreshSession(session, true);
      this.#emit({
        type: "error",
        sessionId: session.sessionId,
        error: normalized,
      });
      return;
    }
    this.#connectionPhase = "error";
    this.#connectionError = normalized;
    this.#publish();
    this.#emit({ type: "error", error: normalized });
  }

  #selectedSession(): ManagedSession | undefined {
    const sessionId = this.#snapshot.sessionId;
    return sessionId ? this.#sessions.get(sessionId) : undefined;
  }

  #requireSession(sessionId = this.#snapshot.sessionId): ManagedSession {
    if (!sessionId) {
      throw new PrettyAuiError("SESSION_NOT_READY", "No active session", {
        phase: "session",
      });
    }
    const session = this.#sessions.get(sessionId);
    if (!session) {
      throw new PrettyAuiError(
        "SESSION_NOT_READY",
        `Session '${sessionId}' is not loaded`,
        { phase: "session" },
      );
    }
    return session;
  }

  #createSession(
    session: ProtocolSession,
    timeline = new TimelineStore(),
    staging?: StagingSession,
    instanceId = `session-instance-${++this.#sessionInstanceCounter}`,
  ): ManagedSession {
    const catalogTitle = this.#snapshot.sessions?.sessions.find(
      (candidate) => candidate.sessionId === session.sessionId,
    )?.title;
    const notificationTitle = staging?.sessionTitleSource === "notification";
    const sessionTitle = notificationTitle
      ? staging?.sessionTitle
      : (staging?.sessionTitle ?? catalogTitle);
    const managed: ManagedSession = {
      sessionId: session.sessionId,
      instanceId,
      timeline,
      phase: "idle",
      activeTurn: undefined,
      configOptions: session.configOptions.length
        ? session.configOptions
        : (staging?.configOptions ?? []),
      commands: staging?.commands ?? session.commands ?? [],
      interactions: [],
      sessionTitle,
      sessionTitleSource: notificationTitle
        ? "notification"
        : sessionTitle !== undefined
          ? "catalog"
          : undefined,
      historyGap: session.historyGap ?? false,
      usage: undefined,
      stopReason: undefined,
      error: undefined,
      lastSelected: 0,
    };
    this.#sessions.set(session.sessionId, managed);
    return managed;
  }

  #selectSession(
    session: ManagedSession,
    trail: ChatSnapshot["sessionTrail"] = [],
  ): void {
    session.lastSelected = ++this.#selectionCounter;
    this.#syncModelPreference(session);
    this.#sessionTrail = [...trail];
    this.#snapshot = cleanSnapshot({
      ...this.#snapshot,
      sessionId: session.sessionId,
    });
    this.#publish();
    this.#emit({ type: "session_changed", sessionId: session.sessionId });
    if (
      session.sessionTitle === undefined &&
      session.sessionTitleSource !== "notification"
    ) {
      this.#queueSessionTitleRefresh();
    }
  }

  #clearSelection(): void {
    this.#sessionTrail = [];
    this.#snapshot = cleanSnapshot({
      ...this.#snapshot,
      sessionId: undefined,
    });
    this.#publish();
    this.#emit({ type: "session_changed" });
  }

  #refreshSession(session: ManagedSession, summaryChanged = false): void {
    if (this.#snapshot.sessionId === session.sessionId) {
      this.#syncModelPreference(session);
      this.#publish();
    } else if (summaryChanged) {
      this.#publish();
    }
  }

  #syncModelPreference(session: ManagedSession): void {
    const model = findModelOption(session.configOptions);
    if (
      !model ||
      typeof model.currentValue !== "string" ||
      !validModelPreference(model.currentValue) ||
      this.#modelPreference === model.currentValue
    )
      return;
    this.#modelPreference = model.currentValue;
    try {
      this.#options.modelPreference?.set(model.currentValue);
    } catch {
      this.#emit({
        type: "diagnostic",
        sessionId: session.sessionId,
        code: "MODEL_PREFERENCE_WRITE_FAILED",
        message: "The host could not persist the current model preference",
      });
    }
  }

  #readModelPreference(): string | undefined {
    let value: unknown;
    try {
      value = this.#options.modelPreference?.get();
    } catch {
      this.#emit({
        type: "diagnostic",
        code: "MODEL_PREFERENCE_READ_FAILED",
        message: "The host model preference could not be read",
      });
      return undefined;
    }
    if (value === undefined) return undefined;
    if (validModelPreference(value)) return value;
    this.#emit({
      type: "diagnostic",
      code: "INVALID_MODEL_PREFERENCE",
      message: "Ignored an invalid host model preference",
    });
    return undefined;
  }

  #readNewSessionMode(): string | undefined {
    const value = this.#options.newSessionMode;
    if (value === undefined) return undefined;
    if (validConfigValue(value)) return value;
    this.#emit({
      type: "diagnostic",
      code: "INVALID_NEW_SESSION_MODE",
      message: "Ignored an invalid fixed new-session mode",
    });
    return undefined;
  }

  #contextProvider(operation: string): ContextProvider {
    if (this.#destroyed) throw connectionClosedError();
    const provider = this.#options.context;
    if (!isContextProvider(provider)) {
      throw new PrettyAuiError(
        "METHOD_NOT_AVAILABLE",
        "The configured context is not mutable",
        { phase: `context/${operation}` },
      );
    }
    return provider;
  }

  async #mutateContext(
    phase: string,
    operation: () => void | Promise<void>,
  ): Promise<void> {
    if (this.#destroyed) throw connectionClosedError();
    if (this.#contextMutation) {
      throw new PrettyAuiError(
        "SESSION_BUSY",
        "Wait for the current context change to finish",
        { phase },
      );
    }
    const token = Symbol(phase);
    this.#contextMutation = token;
    this.#publish();
    try {
      await operation();
      if (this.#destroyed || this.#contextMutation !== token) {
        throw connectionClosedError();
      }
      this.#syncContextSelection();
    } catch (error) {
      if (this.#destroyed) throw connectionClosedError();
      throw new PrettyAuiError(
        "CONTEXT_FAILED",
        "Context selection could not be changed",
        { cause: error, phase, retryable: true },
      );
    } finally {
      if (this.#contextMutation === token) {
        this.#contextMutation = undefined;
        this.#publish();
      }
    }
  }

  #syncContextSelection(): void {
    this.#contextSelection = readContextSelection(this.#options.context);
    this.#publish();
  }

  #contextProjection(): ChatSnapshot["contextSelection"] {
    const provider = this.#options.context;
    return {
      items: this.#contextSelection,
      canAdd: Boolean(isContextProvider(provider) && provider.add),
      canRemove: Boolean(isContextProvider(provider) && provider.remove),
      busy: this.#contextMutation !== undefined,
    };
  }

  #publish(): void {
    if (this.#destroyed && this.#connectionPhase !== "closed") return;
    const selected = this.#selectedSession();
    const connectionPhase = this.#connectionPhase;
    const phase =
      connectionPhase === "ready"
        ? (selected?.phase ?? "idle")
        : connectionPhase;
    const error =
      connectionPhase === "error" ? this.#connectionError : selected?.error;
    this.#snapshot = cleanSnapshot({
      protocolVersion: this.#snapshot.protocolVersion,
      agentName: this.#snapshot.agentName,
      loadedSessions: [...this.#sessions.values()].map((session) => ({
        sessionId: session.sessionId,
        ...(session.sessionTitle ? { title: session.sessionTitle } : {}),
        phase: session.phase,
        interactionCount: session.interactions.length,
        ...(session.error ? { error: session.error } : {}),
      })),
      sessionId: selected?.sessionId,
      sessionInstanceId: selected?.instanceId,
      sessionTitle: selected?.sessionTitle,
      sessionTrail: this.#sessionTrail,
      historyGap: selected?.historyGap ?? false,
      activities: selected?.timeline.activities ?? [],
      configOptions: selected?.configOptions ?? [],
      commands: selected?.commands ?? [],
      contextSelection: this.#contextProjection(),
      interactions: [
        ...(selected?.interactions ?? []),
        ...this.#connectionInteractions,
      ],
      authMethods: this.#snapshot.authMethods,
      sessions: this.#snapshot.sessions,
      capabilities: this.#snapshot.capabilities,
      usage: selected?.usage,
      stopReason: selected?.stopReason,
      error,
      phase,
    });
    this.#notify();
  }

  #notify(): void {
    for (const listener of this.#listeners) {
      try {
        listener();
      } catch {
        // Consumer subscribers cannot interrupt state fan-out.
      }
    }
  }

  #emit(event: ChatEvent): void {
    if (this.#destroyed) return;
    try {
      this.#options.onEvent?.(event);
    } catch {
      // Consumer callbacks cannot corrupt protocol state.
    }
  }

  #completeTurn(
    turn: ActiveTurn,
    stopReason: string,
  ): { readonly stopReason: string } {
    if (this.#destroyed) throw connectionClosedError();
    const session = this.#requireSession(turn.sessionId);
    if (session.activeTurn === turn) session.activeTurn = undefined;
    session.timeline.finishTurn(
      stopReason === "cancelled" ? undefined : Date.now(),
    );
    session.phase = this.#driver?.promptReady(session.sessionId)
      ? "idle"
      : "cancelling";
    session.stopReason = stopReason;
    this.#refreshSession(session, true);
    this.#emit({
      type: "turn_completed",
      sessionId: session.sessionId,
      turnId: turn.id,
      stopReason,
    });
    if (
      stopReason !== "cancelled" &&
      session.sessionTitleSource !== "notification"
    ) {
      this.#queueSessionTitleRefresh();
    }
    return { stopReason };
  }

  #reconcileCatalogTitles(sessions: readonly SessionInfo[]): void {
    for (const catalog of sessions) {
      if (catalog.title === undefined) continue;
      const loaded = this.#sessions.get(catalog.sessionId);
      if (!loaded || loaded.sessionTitleSource === "notification") continue;
      loaded.sessionTitle = catalog.title;
      loaded.sessionTitleSource = "catalog";
    }
  }

  #queueSessionTitleRefresh(): void {
    if (
      this.#destroyed ||
      !this.#snapshot.capabilities.listSessions ||
      !this.#driver
    ) {
      return;
    }
    this.#sessionTitleRefreshRequested = true;
    if (this.#sessionTitleRefresh) return;
    const driver = this.#driver;
    const operation = Promise.resolve()
      .then(async () => {
        while (this.#sessionTitleRefreshRequested && !this.#destroyed) {
          this.#sessionTitleRefreshRequested = false;
          const active = this.#sessionListRequest;
          let firstPageSatisfied = false;
          if (active) {
            try {
              await active.operation;
              firstPageSatisfied = active.cursor === undefined;
            } catch {
              // The best-effort refresh gets one independent first-page try.
            }
          }
          if (this.#destroyed || this.#driver !== driver) return;
          if (firstPageSatisfied) continue;
          try {
            await this.listSessions();
          } catch {
            if (this.#destroyed || this.#driver !== driver) return;
            this.#emit({
              type: "diagnostic",
              code: "SESSION_TITLE_REFRESH_FAILED",
              message:
                "The session title could not be refreshed from the Agent catalog",
            });
          }
        }
      })
      .finally(() => {
        if (this.#sessionTitleRefresh !== operation) return;
        this.#sessionTitleRefresh = undefined;
        if (this.#sessionTitleRefreshRequested) {
          this.#queueSessionTitleRefresh();
        }
      });
    this.#sessionTitleRefresh = operation;
  }

  async #withNewSessionOperation<Value>(
    phase: string,
    operation: () => Promise<Value>,
  ): Promise<Value> {
    if (this.#destroyed) throw connectionClosedError();
    if (this.#newSessionMutation) {
      throw new PrettyAuiError(
        "SESSION_BUSY",
        "Wait for the current connection-level session operation to finish",
        { protocol: this.#driver?.version, phase },
      );
    }
    if (this.#sessionMutations.size) {
      throw new PrettyAuiError(
        "SESSION_BUSY",
        "Wait for target-session operations to finish",
        { protocol: this.#driver?.version, phase },
      );
    }
    const mutation = Symbol(phase);
    this.#newSessionMutation = mutation;
    try {
      return await operation();
    } finally {
      if (this.#newSessionMutation === mutation)
        this.#newSessionMutation = undefined;
    }
  }

  async #withTargetSessionOperation<Value>(
    sessionId: string,
    phase: string,
    operation: () => Promise<Value>,
  ): Promise<Value> {
    if (this.#destroyed) throw connectionClosedError();
    if (this.#newSessionMutation) {
      throw new PrettyAuiError(
        "SESSION_BUSY",
        "Wait for the current connection-level session operation to finish",
        { protocol: this.#driver?.version, phase },
      );
    }
    if (this.#sessionMutations.has(sessionId)) {
      throw new PrettyAuiError(
        "SESSION_BUSY",
        `Wait for the current operation on session '${sessionId}'`,
        { protocol: this.#driver?.version, phase },
      );
    }
    const mutation = Symbol(phase);
    this.#sessionMutations.set(sessionId, mutation);
    try {
      return await operation();
    } finally {
      if (this.#sessionMutations.get(sessionId) === mutation)
        this.#sessionMutations.delete(sessionId);
    }
  }

  #assertDriverCurrent(driver: ProtocolDriver): void {
    if (this.#destroyed || this.#driver !== driver)
      throw connectionClosedError();
  }

  #isConnectionCurrent(generation: number): boolean {
    return !this.#destroyed && this.#connectionGeneration === generation;
  }

  #assertConnectionCurrent(generation: number, driver?: ProtocolDriver): void {
    if (
      !this.#isConnectionCurrent(generation) ||
      (driver !== undefined && this.#driver !== driver)
    ) {
      throw connectionClosedError();
    }
  }
}

function isContextProvider(
  value: ChatOptions["context"],
): value is ContextProvider {
  return (
    !Array.isArray(value) &&
    isRecord(value) &&
    typeof value.getSelection === "function" &&
    typeof value.subscribe === "function" &&
    typeof value.resolve === "function"
  );
}

function readContextSelection(
  source: ChatOptions["context"],
): readonly ContextSelectionItem[] {
  if (!source) return Object.freeze([]);
  const values = isContextProvider(source)
    ? source.getSelection()
    : (source as readonly ContextItem[]);
  if (!Array.isArray(values)) {
    throw new PrettyAuiError(
      "INVALID_CONFIGURATION",
      "Context selection must be an array",
      { phase: "context/selection" },
    );
  }
  if (values.length > 64) {
    throw new PrettyAuiError(
      "INVALID_CONFIGURATION",
      "Context is limited to 64 selected items",
      { phase: "context/selection" },
    );
  }
  const ids = new Set<string>();
  const items = values.map((value) => {
    if (
      !isRecord(value) ||
      typeof value.id !== "string" ||
      !value.id.trim() ||
      value.id.length > 16 * 1024
    ) {
      throw new PrettyAuiError(
        "INVALID_CONFIGURATION",
        "Context selection IDs must be non-empty bounded strings",
        { phase: "context/selection" },
      );
    }
    if (ids.has(value.id)) {
      throw new PrettyAuiError(
        "INVALID_CONFIGURATION",
        `Context selection IDs must be unique: '${value.id}'`,
        { phase: "context/selection" },
      );
    }
    if (
      typeof value.label !== "string" ||
      !value.label.trim() ||
      value.label.length > 16 * 1024
    ) {
      throw new PrettyAuiError(
        "INVALID_CONFIGURATION",
        "Context selection labels must be non-empty bounded strings",
        { phase: "context/selection" },
      );
    }
    ids.add(value.id);
    return Object.freeze({ id: value.id, label: value.label });
  });
  return Object.freeze(items);
}

function cleanSnapshot(input: object): ChatSnapshot {
  const result = { ...input } as Record<string, unknown>;
  for (const [key, value] of Object.entries(result)) {
    if (value === undefined) delete result[key];
  }
  return result as unknown as ChatSnapshot;
}

function normalizeInput(input: ChatInput): ContentBlock[] {
  if (typeof input === "string") return [{ type: "text", text: input }];
  return Array.isArray(input) ? [...input] : [input as ContentBlock];
}

function withContextMeta(block: ContentBlock, item: ContextItem): ContentBlock {
  return {
    ...block,
    _meta: {
      ...(block._meta ?? {}),
      "pretty-aui/context": {
        version: 1,
        id: item.id,
        label: item.label,
      },
    },
  };
}

function canonicalContextBlock(value: unknown): ContentBlock {
  if (!isRecord(value) || typeof value.type !== "string" || !value.type) {
    throw new Error("Context content blocks require a type");
  }
  if (
    isRecord(value._meta) &&
    Object.hasOwn(value._meta, "pretty-aui/context")
  ) {
    throw new Error("Context blocks cannot use reserved pretty-aui metadata");
  }
  const base = canonicalContentBase(value);
  switch (value.type) {
    case "text":
      if (typeof value.text !== "string")
        throw new Error("Context text blocks require text");
      return { ...base, type: "text", text: value.text };
    case "image":
    case "audio":
      if (typeof value.data !== "string" || typeof value.mimeType !== "string")
        throw new Error(
          `Context ${value.type} blocks require data and mimeType`,
        );
      return {
        ...base,
        type: value.type,
        data: value.data,
        mimeType: value.mimeType,
      };
    case "resource_link":
      if (typeof value.uri !== "string" || typeof value.name !== "string")
        throw new Error("Context resource links require uri and name");
      return {
        ...base,
        type: "resource_link",
        uri: value.uri,
        name: value.name,
        ...(typeof value.title === "string" || value.title === null
          ? { title: value.title }
          : {}),
        ...(typeof value.description === "string" || value.description === null
          ? { description: value.description }
          : {}),
        ...(typeof value.mimeType === "string" || value.mimeType === null
          ? { mimeType: value.mimeType }
          : {}),
        ...(typeof value.size === "number" && Number.isFinite(value.size)
          ? { size: value.size }
          : {}),
        ...(Array.isArray(value.icons)
          ? {
              icons: value.icons.slice(0, 256).flatMap((icon) => {
                const bounded = boundedRecord(icon);
                return bounded ? [bounded] : [];
              }),
            }
          : {}),
      };
    case "resource": {
      if (!isRecord(value.resource) || typeof value.resource.uri !== "string")
        throw new Error("Context resources require a uri");
      const resource = value.resource;
      const uri = resource.uri;
      const resourceMetadata = boundedRecord(resource._meta);
      return {
        ...base,
        type: "resource",
        resource: {
          uri,
          ...(typeof resource.mimeType === "string" ||
          resource.mimeType === null
            ? { mimeType: resource.mimeType }
            : {}),
          ...(typeof resource.text === "string" ? { text: resource.text } : {}),
          ...(typeof resource.blob === "string" ? { blob: resource.blob } : {}),
          ...(resourceMetadata ? { _meta: resourceMetadata } : {}),
        },
      };
    }
    default: {
      const bounded = boundedRecord(value);
      return { ...(bounded ?? {}), ...base, type: value.type };
    }
  }
}

function canonicalContentBase(value: Record<string, unknown>): {
  readonly annotations?: NonNullable<ContentBlock["annotations"]>;
  readonly _meta?: Readonly<Record<string, unknown>>;
} {
  const metadata = boundedRecord(value._meta);
  const annotations = isRecord(value.annotations)
    ? {
        ...(Array.isArray(value.annotations.audience)
          ? {
              audience: value.annotations.audience.filter(
                (item): item is "user" | "assistant" =>
                  item === "user" || item === "assistant",
              ),
            }
          : {}),
        ...(typeof value.annotations.priority === "number" &&
        Number.isFinite(value.annotations.priority)
          ? { priority: value.annotations.priority }
          : {}),
        ...(typeof value.annotations.lastModified === "string"
          ? { lastModified: value.annotations.lastModified.slice(0, 16 * 1024) }
          : {}),
      }
    : undefined;
  return {
    ...(annotations ? { annotations } : {}),
    ...(metadata ? { _meta: metadata } : {}),
  };
}

function findModelOption(
  options: readonly ChatConfigOption[],
): ChatConfigOption | undefined {
  return (
    options.find(
      (option) => option.category === "model" && option.type === "select",
    ) ??
    options.find((option) => option.id === "model" && option.type === "select")
  );
}

function contextFailureMessage(error: unknown): string {
  const summary = "Context could not be prepared; the prompt was not sent";
  if (!(error instanceof Error)) return summary;
  const detail = error.message.trim();
  if (!detail) return summary;
  let bounded = detail.slice(0, MAX_CONTEXT_FAILURE_DETAIL_LENGTH);
  const trailing = bounded.charCodeAt(bounded.length - 1);
  if (trailing >= 0xd800 && trailing <= 0xdbff) bounded = bounded.slice(0, -1);
  if (detail.length > MAX_CONTEXT_FAILURE_DETAIL_LENGTH) bounded += "…";
  return `${summary}: ${bounded}`;
}

function findModeOption(
  options: readonly ChatConfigOption[],
): ChatConfigOption | undefined {
  return (
    options.find(
      (option) => option.category === "mode" && option.type === "select",
    ) ??
    options.find((option) => option.id === "mode" && option.type === "select")
  );
}

function updateSessionConfigOption(
  session: ProtocolSession,
  option: ChatConfigOption,
  value: string,
  returned: readonly ChatConfigOption[],
): ProtocolSession {
  return {
    ...session,
    configOptions: returned.length
      ? returned
      : session.configOptions.map((candidate) =>
          candidate.id === option.id
            ? { ...candidate, currentValue: value }
            : candidate,
        ),
  };
}

function validModelPreference(value: unknown): value is string {
  return validConfigValue(value);
}

function validConfigValue(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    utf8StringWithinBudget(value, MAX_MODEL_PREFERENCE_LENGTH)
  );
}

function deduplicateSessions(
  sessions: SessionPage["sessions"],
): SessionPage["sessions"] {
  const seen = new Set<string>();
  return sessions.filter((session) => {
    if (seen.has(session.sessionId)) return false;
    seen.add(session.sessionId);
    return true;
  });
}

const TURN_CANCELLED = Symbol("turn-cancelled");

function throwIfAborted(signal: AbortSignal): void {
  if (signal.aborted) throw signal.reason ?? TURN_CANCELLED;
}

function abortable<Value>(
  value: Value | PromiseLike<Value>,
  signal: AbortSignal,
): Promise<Value> {
  if (signal.aborted) return Promise.reject(signal.reason ?? TURN_CANCELLED);
  return new Promise<Value>((resolve, reject) => {
    const onAbort = () => {
      reject(signal.reason ?? TURN_CANCELLED);
    };
    signal.addEventListener("abort", onAbort, { once: true });
    void Promise.resolve(value).then(
      (result) => {
        signal.removeEventListener("abort", onAbort);
        resolve(result);
      },
      (error: unknown) => {
        signal.removeEventListener("abort", onAbort);
        reject(error);
      },
    );
  });
}

function connectionClosedError(): PrettyAuiError {
  return new PrettyAuiError(
    "CONNECTION_CLOSED",
    "Chat ownership ended before the operation completed",
    { phase: "connection", retryable: false },
  );
}
