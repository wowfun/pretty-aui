import { PrettyAuiError, toChatError } from "./errors.js";
import { connectProtocol } from "./protocol/connect.js";
import { TimelineStore } from "./protocol/normalize.js";
import { validatePrompt } from "./protocol/types.js";
const NO_CAPABILITIES = {
    listSessions: false,
    loadSession: false,
    resumeSession: false,
    closeSession: false,
    deleteSession: false,
};
/**
 * Creates a framework-neutral chat controller and starts ACP initialization.
 *
 * The caller owns the returned controller and must call `destroy()` when its
 * lifetime ends.
 */
export function createChat(options) {
    return new DefaultChatController(options);
}
class DefaultChatController {
    ready;
    #options;
    #listeners = new Set();
    #timeline = new TimelineStore();
    #connectionAbort;
    #permissions = new Map();
    #elicitations = new Map();
    #driver;
    #snapshot;
    #activeTurn;
    #staging;
    #counter = 0;
    #destroyed = false;
    #connecting;
    #connectionGeneration = 0;
    #sessionMutation;
    #sessionListRequest;
    constructor(options) {
        this.#options = options;
        this.#snapshot = {
            phase: "connecting",
            historyGap: false,
            activities: [],
            contextItems: [],
            configOptions: [],
            commands: [],
            interactions: [],
            authMethods: [],
            capabilities: NO_CAPABILITIES,
            sessionTrail: [],
        };
        this.ready = this.#connect(true);
        void this.ready.catch(() => undefined);
    }
    getSnapshot() {
        return this.#snapshot;
    }
    subscribe(listener) {
        this.#listeners.add(listener);
        return () => this.#listeners.delete(listener);
    }
    send(input) {
        this.#assertUsableSession();
        if (this.#activeTurn ||
            this.#snapshot.phase === "running" ||
            this.#snapshot.phase === "cancelling") {
            throw new PrettyAuiError("SESSION_BUSY", "Wait for the current turn to finish", {
                protocol: this.#driver?.version,
                phase: "prompt",
            });
        }
        const blocks = normalizeInput(input);
        if (!blocks.length ||
            blocks.every((block) => block.type === "text" &&
                typeof block.text === "string" &&
                !block.text.trim())) {
            throw new PrettyAuiError("INVALID_CONFIGURATION", "A prompt cannot be empty", { phase: "prompt" });
        }
        validatePrompt(blocks, this.#requireDriver().initialized.promptCapabilities, this.#requireDriver().version);
        const turnId = `turn-${++this.#counter}`;
        const abort = new AbortController();
        const turn = {
            id: turnId,
            abort,
            cancelled: false,
            submitted: false,
        };
        this.#activeTurn = turn;
        this.#timeline.beginTurn();
        this.#timeline.addUserMessage(blocks, true);
        this.#setSnapshot({
            phase: "running",
            activities: this.#timeline.activities,
            stopReason: undefined,
            error: undefined,
        });
        this.#emit({ type: "turn_started", turnId });
        const done = this.#runTurn(turn, blocks);
        void done.catch(() => undefined);
        return { id: turnId, done };
    }
    async cancel() {
        const turn = this.#activeTurn;
        if (!turn || turn.cancelled)
            return;
        turn.cancelled = true;
        turn.abort.abort(TURN_CANCELLED);
        this.#resolveInteractions();
        this.#setSnapshot({ phase: "cancelling" });
        if (!turn.submitted)
            return;
        const sessionId = this.#snapshot.sessionId;
        const driver = this.#driver;
        if (sessionId && driver) {
            try {
                await driver.cancel(sessionId);
            }
            catch (error) {
                if (this.#activeTurn === turn) {
                    turn.cancelled = false;
                    this.#fail(error);
                }
                throw error;
            }
        }
    }
    async reconnect() {
        await this.#withSessionOperation("connection/reconnect", () => this.#connect(false));
    }
    async newSession() {
        await this.#withSessionMutation("session/new", async (driver) => {
            const session = await driver.newSession(this.#options.session);
            this.#assertDriverCurrent(driver);
            this.#resolveInteractions();
            this.#timeline.reset();
            this.#applySession(session, this.#timeline);
        });
    }
    async listSessions(cursor) {
        if (this.#sessionListRequest) {
            throw new PrettyAuiError("SESSION_BUSY", "Wait for the current session-list request to finish", { protocol: this.#driver?.version, phase: "session/list" });
        }
        const driver = this.#requireDriver();
        const request = Symbol("session/list");
        this.#sessionListRequest = request;
        try {
            const page = await driver.listSessions(this.#options.session.cwd, cursor);
            this.#assertDriverCurrent(driver);
            const sessions = cursor && this.#snapshot.sessions
                ? {
                    sessions: deduplicateSessions([
                        ...this.#snapshot.sessions.sessions,
                        ...page.sessions,
                    ]).slice(0, 1_000),
                    ...(page.nextCursor ? { nextCursor: page.nextCursor } : {}),
                }
                : page;
            this.#setSnapshot({ sessions });
            return sessions;
        }
        finally {
            if (this.#sessionListRequest === request)
                this.#sessionListRequest = undefined;
        }
    }
    async openSession(sessionId) {
        await this.#withSessionMutation("session/open", async (driver) => {
            if (sessionId === this.#snapshot.sessionId) {
                this.#setSnapshot({ sessionTrail: [] });
                return;
            }
            await this.#openSession(driver, sessionId, []);
        });
    }
    async openChildSession(sessionId) {
        await this.#withSessionMutation("session/open-child", async (driver) => {
            const currentSessionId = this.#snapshot.sessionId;
            if (!currentSessionId) {
                throw new PrettyAuiError("SESSION_NOT_READY", "No active session", {
                    phase: "session/open-child",
                });
            }
            if (sessionId === currentSessionId)
                return;
            const current = {
                sessionId: currentSessionId,
                ...(this.#snapshot.sessionTitle
                    ? { title: this.#snapshot.sessionTitle }
                    : {}),
            };
            await this.#openSession(driver, sessionId, [
                ...this.#snapshot.sessionTrail,
                current,
            ]);
        });
    }
    async openAncestorSession(sessionId) {
        await this.#withSessionMutation("session/open-ancestor", async (driver) => {
            const ancestorIndex = this.#snapshot.sessionTrail.findIndex((session) => session.sessionId === sessionId);
            if (ancestorIndex < 0) {
                throw new PrettyAuiError("INVALID_CONFIGURATION", `Session '${sessionId}' is not an ancestor of the active session`, { phase: "session/open-ancestor" });
            }
            await this.#openSession(driver, sessionId, this.#snapshot.sessionTrail.slice(0, ancestorIndex));
        });
    }
    async closeSession() {
        await this.#withSessionMutation("session/close", async (driver) => {
            const sessionId = this.#snapshot.sessionId;
            if (!sessionId)
                return;
            await driver.closeSession(sessionId);
            this.#assertDriverCurrent(driver);
            this.#resolveInteractions();
            this.#timeline.reset();
            this.#setSnapshot({
                sessionId: undefined,
                sessionTitle: undefined,
                sessionTrail: [],
                historyGap: false,
                activities: [],
                configOptions: [],
                commands: [],
                phase: "idle",
            });
        });
    }
    async deleteSession(sessionId) {
        if (sessionId === this.#snapshot.sessionId) {
            throw new PrettyAuiError("INVALID_CONFIGURATION", "The active session cannot be deleted", { phase: "session/delete" });
        }
        await this.#withSessionMutation("session/delete", async (driver) => {
            await driver.deleteSession(sessionId);
            this.#assertDriverCurrent(driver);
            if (this.#snapshot.sessions) {
                this.#setSnapshot({
                    sessions: {
                        ...this.#snapshot.sessions,
                        sessions: this.#snapshot.sessions.sessions.filter((session) => session.sessionId !== sessionId),
                    },
                });
            }
        });
    }
    async setConfigOption(id, value) {
        await this.#withSessionMutation("session/set-config", async (driver) => {
            const sessionId = this.#snapshot.sessionId;
            if (!sessionId)
                throw new PrettyAuiError("SESSION_NOT_READY", "No active session");
            const returned = await driver.setConfigOption(sessionId, id, value);
            this.#assertDriverCurrent(driver);
            const configOptions = returned.length
                ? returned
                : this.#snapshot.configOptions.map((option) => option.id === id ? { ...option, currentValue: value } : option);
            this.#setSnapshot({ configOptions });
        });
    }
    async authenticate(methodId) {
        const method = this.#snapshot.authMethods.find((candidate) => candidate.id === methodId);
        if (!method)
            throw new PrettyAuiError("INVALID_CONFIGURATION", `Unknown authentication method '${methodId}'`);
        await this.#withSessionMutation("auth/login", async (driver) => {
            this.#setSnapshot({ phase: "connecting", error: undefined });
            try {
                await driver.authenticate(method);
                this.#assertDriverCurrent(driver);
                const session = await driver.newSession(this.#options.session);
                this.#assertDriverCurrent(driver);
                this.#timeline.reset();
                this.#applySession(session, this.#timeline);
            }
            catch (error) {
                this.#fail(error);
                throw error;
            }
        });
    }
    async logout() {
        await this.#withSessionMutation("auth/logout", async (driver) => {
            await driver.logout();
            this.#assertDriverCurrent(driver);
            this.#resolveInteractions();
            this.#timeline.reset();
            this.#setSnapshot({
                phase: "auth_required",
                sessionId: undefined,
                sessionTrail: [],
                activities: [],
                configOptions: [],
                commands: [],
            });
        });
    }
    respondPermission(id, decision) {
        const pending = this.#permissions.get(id);
        if (!pending)
            return false;
        this.#permissions.delete(id);
        pending.resolve(decision);
        this.#removeInteraction(id);
        return true;
    }
    respondElicitation(id, decision) {
        const pending = this.#elicitations.get(id);
        if (!pending)
            return false;
        this.#elicitations.delete(id);
        pending.resolve(decision);
        this.#removeInteraction(id);
        return true;
    }
    async destroy() {
        if (this.#destroyed)
            return;
        this.#destroyed = true;
        this.#connectionGeneration += 1;
        this.#connectionAbort?.abort();
        this.#activeTurn?.abort.abort(new PrettyAuiError("TURN_INTERRUPTED", "Chat was destroyed before the turn completed", { phase: "destroy", retryable: false }));
        this.#resolveInteractions();
        const driver = this.#driver;
        this.#driver = undefined;
        this.#staging = undefined;
        this.#setSnapshot({ phase: "closed" });
        await driver?.close().catch(() => undefined);
        this.#listeners.clear();
    }
    onUpdate(sessionId, update) {
        if (this.#destroyed)
            return;
        const target = this.#staging?.sessionId === sessionId ? this.#staging : undefined;
        if (!target && sessionId !== this.#snapshot.sessionId)
            return;
        const timeline = target?.timeline ?? this.#timeline;
        const effect = timeline.reduce(update, this.#driver?.version ?? 1);
        if (target) {
            this.#applyStagingEffect(target, effect);
            return;
        }
        this.#applyEffect(effect);
        this.#setSnapshot({ activities: timeline.activities });
    }
    onPermission(sessionId, interaction, _raw) {
        if (this.#destroyed ||
            !this.#activeTurn ||
            sessionId !== this.#snapshot.sessionId) {
            return Promise.resolve({ outcome: "cancelled" });
        }
        if (!this.#hasInteractionCapacity()) {
            return Promise.resolve({ outcome: "cancelled" });
        }
        const id = `permission-${++this.#counter}`;
        const complete = { ...interaction, id };
        return new Promise((resolve) => {
            this.#permissions.set(id, { interaction: complete, resolve });
            this.#addInteraction(complete);
        });
    }
    onElicitation(sessionId, interaction, _raw) {
        if (this.#destroyed ||
            (sessionId !== undefined && sessionId !== this.#snapshot.sessionId) ||
            (interaction.elicitationId !== undefined &&
                this.#findElicitation(interaction.elicitationId) !== undefined)) {
            return Promise.resolve({ action: "cancel" });
        }
        if (!this.#hasInteractionCapacity()) {
            return Promise.resolve({ action: "cancel" });
        }
        const id = `elicitation-${++this.#counter}`;
        const complete = { ...interaction, id };
        return new Promise((resolve) => {
            this.#elicitations.set(id, { interaction: complete, resolve });
            this.#addInteraction(complete);
        });
    }
    onElicitationComplete(elicitationId) {
        if (this.#destroyed)
            return;
        const id = this.#findElicitation(elicitationId);
        if (!id)
            return;
        const pending = this.#elicitations.get(id);
        if (!pending)
            return;
        this.#elicitations.delete(id);
        pending.resolve({ action: "accept" });
        this.#removeInteraction(id);
    }
    onProtocol(method, raw) {
        const protocolVersion = this.#driver?.version;
        if (protocolVersion)
            this.#emit({ type: "protocol", protocolVersion, method, raw });
    }
    onDisconnect() {
        if (this.#destroyed)
            return;
        this.#resolveInteractions();
        this.#fail(new PrettyAuiError("CONNECTION_CLOSED", "The ACP connection closed", {
            protocol: this.#driver?.version,
            phase: "connection",
            retryable: true,
        }));
    }
    async #connect(createSession) {
        if (this.#connecting)
            return this.#connecting;
        const connecting = this.#connectInner(createSession);
        this.#connecting = connecting;
        void connecting.then(() => {
            if (this.#connecting === connecting)
                this.#connecting = undefined;
        }, () => {
            if (this.#connecting === connecting)
                this.#connecting = undefined;
        });
        return connecting;
    }
    async #connectInner(createSession) {
        if (this.#destroyed)
            throw connectionClosedError();
        const generation = ++this.#connectionGeneration;
        this.#connectionAbort?.abort();
        const connectionAbort = new AbortController();
        this.#connectionAbort = connectionAbort;
        this.#setSnapshot({ phase: "connecting", error: undefined });
        const previous = this.#driver;
        const previousSessionId = this.#snapshot.sessionId;
        if (previous) {
            this.#driver = undefined;
            await previous.close().catch(() => undefined);
            this.#assertConnectionCurrent(generation);
        }
        let driver;
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
            this.#setSnapshot({
                protocolVersion: driver.version,
                agentName: driver.initialized.agentName,
                authMethods: driver.initialized.authMethods,
                capabilities: driver.initialized.capabilities,
            });
            this.#emit({ type: "connected", protocolVersion: driver.version });
            let session;
            const reopeningSession = !createSession &&
                previousSessionId &&
                (driver.initialized.capabilities.resumeSession ||
                    driver.initialized.capabilities.loadSession);
            if (reopeningSession) {
                session = await driver.openSession(previousSessionId, this.#options.session, driver.initialized.capabilities.resumeSession ? "none" : "all");
            }
            else {
                session = await driver.newSession(this.#options.session);
            }
            this.#assertConnectionCurrent(generation, driver);
            if (createSession || !reopeningSession)
                this.#timeline.reset();
            this.#applySession(session, this.#timeline, undefined, [], reopeningSession ? this.#snapshot.sessionTrail : []);
        }
        catch (error) {
            if (!this.#isConnectionCurrent(generation)) {
                if (driver && this.#driver === driver)
                    this.#driver = undefined;
                await driver?.close().catch(() => undefined);
                throw connectionClosedError();
            }
            if (error instanceof PrettyAuiError &&
                error.code === "AUTHENTICATION_REQUIRED" &&
                this.#snapshot.authMethods.length) {
                this.#setSnapshot({ phase: "auth_required", error: undefined });
                throw new PrettyAuiError("AUTHENTICATION_REQUIRED", "Authentication is required before a session can be created", {
                    cause: error,
                    protocol: driver?.version,
                    phase: "session/new",
                });
            }
            this.#fail(error);
            throw error;
        }
    }
    async #runTurn(turn, input) {
        try {
            const driver = this.#requireDriver();
            const sessionId = this.#snapshot.sessionId;
            if (!sessionId)
                throw new PrettyAuiError("SESSION_NOT_READY", "No active session");
            const contextItems = await this.#resolveContext(input, turn.abort.signal);
            throwIfAborted(turn.abort.signal);
            const prompt = [
                ...contextItems.flatMap((item) => item.content.map((block) => withContextMeta(block, item))),
                ...input,
            ];
            validatePrompt(prompt, driver.initialized.promptCapabilities, driver.version);
            this.#setSnapshot({
                contextItems: contextItems.map(({ id, label }) => ({ id, label })),
            });
            throwIfAborted(turn.abort.signal);
            turn.submitted = true;
            const stopReason = await driver.prompt(sessionId, prompt, () => {
                if (this.#destroyed)
                    return;
                this.#timeline.markUserAccepted();
                this.#setSnapshot({ activities: this.#timeline.activities });
            });
            return this.#completeTurn(turn, turn.cancelled ? "cancelled" : stopReason);
        }
        catch (error) {
            if (turn.cancelled || error === TURN_CANCELLED) {
                return this.#completeTurn(turn, "cancelled");
            }
            if (this.#activeTurn === turn)
                this.#activeTurn = undefined;
            this.#fail(error);
            throw error;
        }
    }
    async #resolveContext(input, signal) {
        try {
            const source = this.#options.context;
            if (!source)
                return [];
            const items = typeof source === "function"
                ? await abortable(source({
                    ...(this.#snapshot.sessionId
                        ? { sessionId: this.#snapshot.sessionId }
                        : {}),
                    input,
                    ...(this.#snapshot.protocolVersion
                        ? { protocolVersion: this.#snapshot.protocolVersion }
                        : {}),
                    signal,
                }), signal)
                : source;
            const ids = new Set();
            if (items.length > 64)
                throw new Error("Context is limited to 64 items per turn");
            for (const item of items) {
                if (!item.id || ids.has(item.id))
                    throw new Error(`Context item IDs must be unique: '${item.id}'`);
                ids.add(item.id);
            }
            return items;
        }
        catch (error) {
            if (signal.aborted)
                throw signal.reason ?? error;
            throw new PrettyAuiError("CONTEXT_FAILED", "Context could not be prepared; the prompt was not sent", {
                cause: error,
                protocol: this.#driver?.version,
                phase: "context",
                retryable: true,
            });
        }
    }
    #applySession(session, timeline, title, commands = [], sessionTrail = []) {
        if (this.#destroyed)
            return;
        this.#snapshot = cleanSnapshot({
            ...this.#snapshot,
            phase: "idle",
            sessionId: session.sessionId,
            sessionTitle: title,
            sessionTrail: [...sessionTrail],
            historyGap: session.historyGap ?? false,
            activities: timeline.activities,
            configOptions: session.configOptions,
            commands,
            interactions: [],
            contextItems: [],
            stopReason: undefined,
            error: undefined,
        });
        this.#notify();
        this.#emit({ type: "session_changed", sessionId: session.sessionId });
    }
    async #openSession(driver, sessionId, sessionTrail) {
        const staging = {
            sessionId,
            timeline: new TimelineStore(),
            configOptions: [],
            commands: [],
            sessionTitle: undefined,
        };
        this.#staging = staging;
        try {
            const session = await driver.openSession(sessionId, this.#options.session, "all");
            this.#assertDriverCurrent(driver);
            const oldSessionId = this.#snapshot.sessionId;
            this.#resolveInteractions();
            this.#timeline = staging.timeline;
            this.#applySession({
                ...session,
                configOptions: session.configOptions.length
                    ? session.configOptions
                    : staging.configOptions,
            }, staging.timeline, staging.sessionTitle, staging.commands, sessionTrail);
            if (oldSessionId && driver.initialized.capabilities.closeSession) {
                await driver.closeSession(oldSessionId).catch(() => undefined);
            }
        }
        finally {
            if (this.#staging === staging)
                this.#staging = undefined;
        }
    }
    #applyEffect(effect) {
        const patch = {};
        if (effect.state && !this.#activeTurn) {
            this.#emit({
                type: "diagnostic",
                code: "STALE_SESSION_STATE",
                message: `Ignored ${effect.state} state without an active turn`,
            });
        }
        else {
            if (effect.state === "running")
                patch.phase = "running";
            if (effect.state === "requires_action")
                patch.phase = "awaiting_user";
            if (effect.state === "idle") {
                patch.phase = "idle";
                if (effect.stopReason)
                    patch.stopReason = effect.stopReason;
            }
        }
        if (effect.commands)
            patch.commands = effect.commands;
        if (effect.configOptions)
            patch.configOptions = effect.configOptions;
        if (effect.sessionTitle !== undefined)
            patch.sessionTitle = effect.sessionTitle ?? undefined;
        if (effect.usage)
            patch.usage = effect.usage;
        if (effect.unsupported) {
            this.#emit({
                type: "diagnostic",
                code: "UNSUPPORTED_UPDATE",
                message: effect.unsupported,
            });
        }
        if (Object.keys(patch).length)
            this.#setSnapshot(patch);
    }
    #hasInteractionCapacity() {
        if (this.#permissions.size + this.#elicitations.size < 16)
            return true;
        this.#emit({
            type: "diagnostic",
            code: "INTERACTION_LIMIT",
            message: "Cancelled an interaction beyond the 16-interaction limit",
        });
        return false;
    }
    #applyStagingEffect(staging, effect) {
        if (effect.commands)
            staging.commands = effect.commands;
        if (effect.configOptions)
            staging.configOptions = effect.configOptions;
        if (effect.sessionTitle !== undefined)
            staging.sessionTitle = effect.sessionTitle ?? undefined;
    }
    #addInteraction(interaction) {
        this.#setSnapshot({
            phase: "awaiting_user",
            interactions: [...this.#snapshot.interactions, interaction],
        });
    }
    #removeInteraction(id) {
        const interactions = this.#snapshot.interactions.filter((interaction) => interaction.id !== id);
        this.#setSnapshot({
            interactions,
            phase: interactions.length
                ? "awaiting_user"
                : this.#activeTurn
                    ? "running"
                    : "idle",
        });
    }
    #resolveInteractions() {
        for (const pending of this.#permissions.values())
            pending.resolve({ outcome: "cancelled" });
        for (const pending of this.#elicitations.values())
            pending.resolve({ action: "cancel" });
        this.#permissions.clear();
        this.#elicitations.clear();
        if (this.#snapshot.interactions.length)
            this.#setSnapshot({ interactions: [] });
    }
    #findElicitation(elicitationId) {
        for (const [id, pending] of this.#elicitations) {
            if (pending.interaction.type === "elicitation" &&
                pending.interaction.elicitationId === elicitationId) {
                return id;
            }
        }
        return undefined;
    }
    #assertUsableSession() {
        if (this.#destroyed)
            throw new PrettyAuiError("CONNECTION_CLOSED", "Chat has been destroyed");
        if (!this.#driver || !this.#snapshot.sessionId) {
            throw new PrettyAuiError("SESSION_NOT_READY", "The chat session is not ready", { phase: "prompt" });
        }
        if (this.#snapshot.phase === "auth_required") {
            throw new PrettyAuiError("SESSION_NOT_READY", "Authenticate before sending a prompt", { phase: "prompt" });
        }
    }
    #assertIdleForSessionChange() {
        if (this.#destroyed)
            throw connectionClosedError();
        if (this.#activeTurn ||
            this.#permissions.size ||
            this.#elicitations.size ||
            this.#snapshot.interactions.length ||
            this.#snapshot.phase === "running" ||
            this.#snapshot.phase === "cancelling") {
            throw new PrettyAuiError("SESSION_BUSY", "Finish the current turn or interaction first", { phase: "session" });
        }
    }
    #requireDriver() {
        if (this.#destroyed)
            throw connectionClosedError();
        if (!this.#driver)
            throw new PrettyAuiError("SESSION_NOT_READY", "The ACP connection is not ready");
        return this.#driver;
    }
    #fail(error) {
        if (this.#destroyed)
            return;
        const normalized = toChatError(error);
        this.#setSnapshot({ phase: "error", error: normalized });
        this.#emit({ type: "error", error: normalized });
    }
    #setSnapshot(patch) {
        if (this.#destroyed && patch.phase !== "closed")
            return;
        this.#snapshot = cleanSnapshot({ ...this.#snapshot, ...patch });
        this.#notify();
    }
    #notify() {
        for (const listener of this.#listeners) {
            try {
                listener();
            }
            catch {
                // Consumer subscribers cannot interrupt state fan-out.
            }
        }
    }
    #emit(event) {
        if (this.#destroyed)
            return;
        try {
            this.#options.onEvent?.(event);
        }
        catch {
            // Consumer callbacks cannot corrupt protocol state.
        }
    }
    #completeTurn(turn, stopReason) {
        if (this.#destroyed)
            throw connectionClosedError();
        if (this.#activeTurn === turn)
            this.#activeTurn = undefined;
        this.#setSnapshot({
            phase: "idle",
            stopReason,
            activities: this.#timeline.activities,
        });
        this.#emit({ type: "turn_completed", turnId: turn.id, stopReason });
        return { stopReason };
    }
    async #withSessionMutation(phase, operation) {
        return this.#withSessionOperation(phase, () => operation(this.#requireDriver()));
    }
    async #withSessionOperation(phase, operation) {
        this.#assertIdleForSessionChange();
        if (this.#sessionMutation) {
            throw new PrettyAuiError("SESSION_BUSY", "Wait for the current session operation to finish", { protocol: this.#driver?.version, phase });
        }
        const mutation = Symbol(phase);
        this.#sessionMutation = mutation;
        try {
            return await operation();
        }
        finally {
            if (this.#sessionMutation === mutation)
                this.#sessionMutation = undefined;
        }
    }
    #assertDriverCurrent(driver) {
        if (this.#destroyed || this.#driver !== driver)
            throw connectionClosedError();
    }
    #isConnectionCurrent(generation) {
        return !this.#destroyed && this.#connectionGeneration === generation;
    }
    #assertConnectionCurrent(generation, driver) {
        if (!this.#isConnectionCurrent(generation) ||
            (driver !== undefined && this.#driver !== driver)) {
            throw connectionClosedError();
        }
    }
}
function cleanSnapshot(input) {
    const result = { ...input };
    for (const [key, value] of Object.entries(result)) {
        if (value === undefined)
            delete result[key];
    }
    return result;
}
function normalizeInput(input) {
    if (typeof input === "string")
        return [{ type: "text", text: input }];
    return Array.isArray(input) ? [...input] : [input];
}
function withContextMeta(block, item) {
    return {
        ...block,
        _meta: {
            ...(block._meta ?? {}),
            "pretty-aui/context": { id: item.id, label: item.label },
        },
    };
}
function deduplicateSessions(sessions) {
    const seen = new Set();
    return sessions.filter((session) => {
        if (seen.has(session.sessionId))
            return false;
        seen.add(session.sessionId);
        return true;
    });
}
const TURN_CANCELLED = Symbol("turn-cancelled");
function throwIfAborted(signal) {
    if (signal.aborted)
        throw signal.reason ?? TURN_CANCELLED;
}
function abortable(value, signal) {
    if (signal.aborted)
        return Promise.reject(signal.reason ?? TURN_CANCELLED);
    return new Promise((resolve, reject) => {
        const onAbort = () => {
            reject(signal.reason ?? TURN_CANCELLED);
        };
        signal.addEventListener("abort", onAbort, { once: true });
        void Promise.resolve(value).then((result) => {
            signal.removeEventListener("abort", onAbort);
            resolve(result);
        }, (error) => {
            signal.removeEventListener("abort", onAbort);
            reject(error);
        });
    });
}
function connectionClosedError() {
    return new PrettyAuiError("CONNECTION_CLOSED", "Chat ownership ended before the operation completed", { phase: "connection", retryable: false });
}
//# sourceMappingURL=chat-controller.js.map