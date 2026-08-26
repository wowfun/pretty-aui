import type {
  ChatController,
  ChatInput,
  ChatSnapshot,
  ChatTurnHandle,
  ElicitationDecision,
  PermissionDecision,
  SessionPage,
} from "../../src/core/index.js";

const EMPTY_SNAPSHOT: ChatSnapshot = {
  phase: "idle",
  protocolVersion: 1,
  agentName: "Fixture Agent",
  sessionId: "session-1",
  sessionTrail: [],
  historyGap: false,
  activities: [],
  contextItems: [],
  configOptions: [],
  commands: [],
  interactions: [],
  authMethods: [],
  capabilities: {
    listSessions: false,
    loadSession: false,
    resumeSession: false,
    closeSession: false,
    deleteSession: false,
  },
};

export class FakeChatController implements ChatController {
  readonly ready = Promise.resolve();
  readonly sent: ChatInput[] = [];
  readonly permissionDecisions: {
    readonly id: string;
    readonly decision: PermissionDecision;
  }[] = [];
  readonly elicitationDecisions: {
    readonly id: string;
    readonly decision: ElicitationDecision;
  }[] = [];
  subscribeCalls = 0;
  unsubscribeCalls = 0;
  destroyCalls = 0;
  cancelCalls = 0;
  reconnectCalls = 0;
  newSessionCalls = 0;
  readonly openedChildSessions: string[] = [];
  readonly openedAncestorSessions: string[] = [];
  readonly listSessionsCalls: (string | undefined)[] = [];
  listSessionsResult: Promise<SessionPage> | SessionPage = { sessions: [] };
  readonly authenticatedMethods: string[] = [];
  readonly configChanges: {
    readonly id: string;
    readonly value: string | boolean;
  }[] = [];
  sendError: unknown;
  cancelError: unknown;
  openChildSessionError: unknown;
  openAncestorSessionError: unknown;
  turnDone: Promise<{ readonly stopReason: string }> = Promise.resolve({
    stopReason: "end_turn",
  });
  #snapshot: ChatSnapshot;
  readonly #listeners = new Set<() => void>();

  constructor(snapshot: Partial<ChatSnapshot> = {}) {
    this.#snapshot = { ...EMPTY_SNAPSHOT, ...snapshot };
  }

  getSnapshot(): ChatSnapshot {
    return this.#snapshot;
  }

  setSnapshot(snapshot: Partial<ChatSnapshot>) {
    this.#snapshot = { ...this.#snapshot, ...snapshot };
    for (const listener of this.#listeners) listener();
  }

  clearSession() {
    const { sessionId: _sessionId, ...snapshot } = this.#snapshot;
    this.#snapshot = snapshot;
    for (const listener of this.#listeners) listener();
  }

  subscribe(listener: () => void): () => void {
    this.subscribeCalls += 1;
    this.#listeners.add(listener);
    return () => {
      this.unsubscribeCalls += 1;
      this.#listeners.delete(listener);
    };
  }

  send(input: ChatInput): ChatTurnHandle {
    if (this.sendError) throw this.sendError;
    this.sent.push(input);
    return { id: `turn-${this.sent.length}`, done: this.turnDone };
  }

  async cancel(): Promise<void> {
    this.cancelCalls += 1;
    if (this.cancelError) throw this.cancelError;
  }

  async reconnect(): Promise<void> {
    this.reconnectCalls += 1;
  }

  async newSession(): Promise<void> {
    this.newSessionCalls += 1;
  }

  async listSessions(cursor?: string): Promise<SessionPage> {
    this.listSessionsCalls.push(cursor);
    return this.listSessionsResult;
  }

  async openSession(): Promise<void> {}

  async openChildSession(sessionId: string): Promise<void> {
    if (this.openChildSessionError) throw this.openChildSessionError;
    this.openedChildSessions.push(sessionId);
  }

  async openAncestorSession(sessionId: string): Promise<void> {
    if (this.openAncestorSessionError) throw this.openAncestorSessionError;
    this.openedAncestorSessions.push(sessionId);
  }

  async closeSession(): Promise<void> {}

  async deleteSession(): Promise<void> {}

  async setConfigOption(id: string, value: string | boolean): Promise<void> {
    this.configChanges.push({ id, value });
  }

  async authenticate(methodId: string): Promise<void> {
    this.authenticatedMethods.push(methodId);
  }

  async logout(): Promise<void> {}

  respondPermission(id: string, decision: PermissionDecision): boolean {
    this.permissionDecisions.push({ id, decision });
    return true;
  }

  respondElicitation(id: string, decision: ElicitationDecision): boolean {
    this.elicitationDecisions.push({ id, decision });
    return true;
  }

  async destroy(): Promise<void> {
    this.destroyCalls += 1;
  }
}
