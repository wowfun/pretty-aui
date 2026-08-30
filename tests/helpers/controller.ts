import type {
  ChatController,
  ChatInput,
  ChatNoticeInput,
  ChatSnapshot,
  ChatTurnHandle,
  ElicitationDecision,
  PermissionDecision,
  SessionPage,
} from "../../src/core/index.js";

const EMPTY_SNAPSHOT: ChatSnapshot = {
  phase: "idle",
  loadedSessions: [],
  protocolVersion: 1,
  agentName: "Fixture Agent",
  sessionId: "session-1",
  sessionTrail: [],
  historyGap: false,
  activities: [],
  configOptions: [],
  commands: [],
  contextSelection: {
    items: [],
    canAdd: false,
    canRemove: false,
    busy: false,
  },
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
  readonly appendedNotices: ChatNoticeInput[] = [];
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
  addContextCalls = 0;
  readonly removedContextIds: string[] = [];
  reconnectCalls = 0;
  newSessionCalls = 0;
  readonly openedSessions: string[] = [];
  readonly closedSessions: (string | undefined)[] = [];
  readonly deletedSessions: string[] = [];
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
  deleteSessionError: unknown;
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

  appendNotice(input: ChatNoticeInput): boolean {
    this.appendedNotices.push(input);
    return true;
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

  async addContext(): Promise<void> {
    this.addContextCalls += 1;
  }

  async removeContext(id: string): Promise<void> {
    this.removedContextIds.push(id);
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

  async openSession(sessionId: string): Promise<void> {
    this.openedSessions.push(sessionId);
  }

  async openChildSession(sessionId: string): Promise<void> {
    if (this.openChildSessionError) throw this.openChildSessionError;
    this.openedChildSessions.push(sessionId);
  }

  async openAncestorSession(sessionId: string): Promise<void> {
    if (this.openAncestorSessionError) throw this.openAncestorSessionError;
    this.openedAncestorSessions.push(sessionId);
  }

  async closeSession(sessionId?: string): Promise<void> {
    this.closedSessions.push(sessionId);
  }

  async deleteSession(sessionId: string): Promise<void> {
    if (this.deleteSessionError) throw this.deleteSessionError;
    this.deletedSessions.push(sessionId);
  }

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
