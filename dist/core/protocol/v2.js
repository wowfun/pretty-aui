import * as acp from "@agentclientprotocol/sdk/experimental/v2";
import { PrettyAuiError } from "../errors.js";
import { asString, isRecord, normalizeAuthMethods, normalizeConfigOptions, normalizeSessions, } from "./normalize.js";
import { elicitationResponse, normalizeElicitation, normalizePermissionOptions, permissionResponse, } from "./interactions.js";
import { requestSessionWithAuthMapping, validateSessionOptions, } from "./types.js";
export async function connectV2(options) {
    const { sink } = options;
    let driver;
    const app = acp
        .client({ name: options.clientInfo.name })
        .onRequest(acp.methods.client.session.requestPermission, async ({ params }) => {
        const raw = params;
        const decision = await sink.onPermission(params.sessionId, normalizePermission(raw), raw);
        return permissionResponse(decision);
    })
        .onRequest(acp.methods.client.elicitation.create, async ({ params }) => {
        const raw = params;
        const decision = await sink.onElicitation("sessionId" in params && typeof params.sessionId === "string"
            ? params.sessionId
            : undefined, normalizeElicitation(raw), raw);
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
    const connection = app.connect(options.stream);
    let closedByClient = false;
    void connection.closed.then(() => {
        driver?.handleClose();
        if (!closedByClient)
            sink.onDisconnect();
    });
    let response;
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
    }
    catch (error) {
        connection.close(error);
        throw new PrettyAuiError("INITIALIZE_REJECTED", "ACP v2 initialization failed", {
            cause: error,
            protocol: 2,
            phase: "initialize",
            retryable: true,
        });
    }
    if (response.protocolVersion !== 2) {
        connection.close();
        throw new PrettyAuiError("PROTOCOL_VERSION_MISMATCH", `Requested ACP v2 but agent selected v${response.protocolVersion}`, { protocol: 2, phase: "initialize" });
    }
    if (response.capabilities?.session == null) {
        connection.close();
        throw new PrettyAuiError("CAPABILITY_REQUIRED", "The ACP v2 agent does not advertise the session surface", {
            protocol: 2,
            phase: "initialize",
        });
    }
    const sessionCapabilities = response.capabilities.session;
    const initialization = {
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
class V2Driver {
    connection;
    initialized;
    host;
    markClosed;
    version = 2;
    #pendingTurns = new Map();
    #cancelledSessions = new Set();
    constructor(connection, initialized, host, markClosed) {
        this.connection = connection;
        this.initialized = initialized;
        this.host = host;
        this.markClosed = markClosed;
    }
    async newSession(options) {
        validateSessionOptions(options, this.initialized, 2, "session/new");
        const response = await requestSessionWithAuthMapping(() => this.connection.agent.request(acp.methods.agent.session.new, toV2SessionRequest(options)), 2, "session/new");
        return {
            sessionId: response.sessionId,
            configOptions: normalizeConfigOptions(response.configOptions),
        };
    }
    async openSession(sessionId, options, history) {
        validateSessionOptions(options, this.initialized, 2, "session/open");
        const response = await requestSessionWithAuthMapping(() => this.connection.agent.request(acp.methods.agent.session.resume, {
            ...toV2SessionRequest(options),
            sessionId,
            ...(history === "all"
                ? { replayFrom: { type: "start" } }
                : {}),
        }), 2, "session/open");
        return {
            sessionId,
            configOptions: normalizeConfigOptions(response.configOptions),
        };
    }
    async listSessions(cwd, cursor) {
        const response = await this.connection.agent.request(acp.methods.agent.session.list, {
            cwd,
            ...(cursor ? { cursor } : {}),
        });
        return normalizeSessions(response);
    }
    async deleteSession(sessionId) {
        if (!this.initialized.capabilities.deleteSession) {
            throw new PrettyAuiError("CAPABILITY_REQUIRED", "The agent does not support session/delete", { protocol: 2 });
        }
        await this.connection.agent.request(acp.methods.agent.session.delete, {
            sessionId,
        });
    }
    async closeSession(sessionId) {
        await this.connection.agent.request(acp.methods.agent.session.close, {
            sessionId,
        });
    }
    promptReady(sessionId) {
        return !this.#cancelledSessions.has(sessionId);
    }
    async prompt(sessionId, prompt, onAccepted) {
        if (this.#pendingTurns.has(sessionId)) {
            throw new PrettyAuiError("SESSION_BUSY", `Session '${sessionId}' already has a foreground turn`, { protocol: 2 });
        }
        let resolve;
        let reject;
        const promise = new Promise((resolvePromise, rejectPromise) => {
            resolve = resolvePromise;
            reject = rejectPromise;
        });
        const pendingTurn = {
            sessionId,
            accepted: false,
            promise,
            resolve,
            reject,
        };
        this.#pendingTurns.set(sessionId, pendingTurn);
        try {
            const acknowledgement = this.connection.agent.request(acp.methods.agent.session.prompt, {
                sessionId,
                prompt: prompt,
            });
            if (this.#pendingTurns.get(sessionId) === pendingTurn)
                pendingTurn.accepted = true;
            onAccepted();
            await acknowledgement;
            return await promise;
        }
        catch (error) {
            if (this.#pendingTurns.get(sessionId) === pendingTurn)
                this.#pendingTurns.delete(sessionId);
            throw error;
        }
    }
    async cancel(sessionId) {
        const pending = this.#pendingTurns.get(sessionId);
        if (pending)
            this.#cancelledSessions.add(sessionId);
        try {
            await this.connection.agent.notify(acp.methods.agent.session.cancel, {
                sessionId,
            });
        }
        catch (error) {
            this.#cancelledSessions.delete(sessionId);
            throw error;
        }
        if (!pending || this.#pendingTurns.get(sessionId) !== pending)
            return;
        this.#pendingTurns.delete(sessionId);
        pending.resolve("cancelled");
    }
    async setConfigOption(sessionId, id, value) {
        const response = await this.connection.agent.request(acp.methods.agent.session.setConfigOption, {
            sessionId,
            configId: id,
            type: typeof value === "boolean" ? "boolean" : "id",
            value,
        });
        return normalizeConfigOptions(response.configOptions);
    }
    async authenticate(method) {
        if (method.type === "terminal") {
            if (!this.host?.terminalAuth) {
                throw new PrettyAuiError("CAPABILITY_REQUIRED", "Terminal authentication needs a host handler", { protocol: 2 });
            }
            await this.host.terminalAuth(method);
            return;
        }
        await this.connection.agent.request(acp.methods.agent.auth.login, {
            methodId: method.id,
        });
    }
    async logout() {
        await this.connection.agent.request(acp.methods.agent.auth.logout, {});
    }
    handleUpdate(sessionId, update) {
        if (!isRecord(update))
            return;
        if (update.sessionUpdate !== "state_update" || update.state !== "idle")
            return;
        if (this.#cancelledSessions.delete(sessionId))
            return;
        if (!this.#pendingTurns.has(sessionId))
            return;
        const pending = this.#pendingTurns.get(sessionId);
        if (!pending)
            return;
        this.#pendingTurns.delete(sessionId);
        pending.resolve(asString(update.stopReason) ?? "end_turn");
    }
    handleClose() {
        for (const pending of this.#pendingTurns.values()) {
            pending.reject(new PrettyAuiError("TURN_INTERRUPTED", "Connection closed before the turn completed", {
                protocol: 2,
                phase: "prompt",
                retryable: true,
                accepted: pending.accepted,
                completionUnknown: pending.accepted,
            }));
        }
        this.#pendingTurns.clear();
        this.#cancelledSessions.clear();
    }
    async close(error) {
        this.markClosed();
        this.handleClose();
        this.connection.close(error);
        await this.connection.closed;
    }
}
function toV2SessionRequest(options) {
    return {
        cwd: options.cwd,
        ...(options.additionalDirectories?.length
            ? {
                additionalDirectories: [
                    ...options.additionalDirectories,
                ],
            }
            : {}),
        ...(options.mcpServers?.length
            ? { mcpServers: options.mcpServers.map(toV2Mcp) }
            : {}),
    };
}
function toV2Mcp(server) {
    if (server.type === "sse") {
        throw new PrettyAuiError("INVALID_CONFIGURATION", "SSE MCP servers are not part of ACP v2", { protocol: 2 });
    }
    if (server.type === "stdio") {
        return {
            type: "stdio",
            name: server.name,
            command: server.command,
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
function normalizePermission(raw) {
    const params = isRecord(raw) ? raw : {};
    const description = asString(params.description);
    return {
        type: "permission",
        title: asString(params.title) ?? "Permission required",
        ...(description ? { description } : {}),
        options: normalizePermissionOptions(params.options),
    };
}
//# sourceMappingURL=v2.js.map