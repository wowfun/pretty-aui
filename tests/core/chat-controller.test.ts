import { createChat } from "../../src/core/index.js";
import type {
  ContextItem,
  ContextProvider,
  ContextRequest,
  ContextSelectionItem,
} from "../../src/core/index.js";
import { createV1Harness, createV2Harness } from "../helpers/agents.js";

describe("ChatController protocol interface", () => {
  it("can connect without creating an orphan initial session", async () => {
    const harness = createV1Harness();
    const controller = createChat({
      connector: harness.connector,
      session: { cwd: "/workspace" },
      initialSession: { type: "none" },
    });
    try {
      await controller.ready;
      expect(controller.getSnapshot()).toMatchObject({
        phase: "idle",
        loadedSessions: [],
      });
      expect(controller.getSnapshot().sessionId).toBeUndefined();
      expect(harness.newSessionRequests).toBe(0);
      expect(() => controller.send("not yet")).toThrow(
        expect.objectContaining({ code: "SESSION_NOT_READY" }),
      );

      await controller.newSession();
      expect(harness.newSessionRequests).toBe(1);
      expect(controller.getSnapshot().loadedSessions).toHaveLength(1);
    } finally {
      await controller.destroy();
      await harness.close();
    }
  });

  it("surfaces authentication required by a later session creation", async () => {
    const harness = createV1Harness({ authenticationRequired: true });
    const controller = createChat({
      connector: harness.connector,
      session: { cwd: "/workspace" },
      initialSession: { type: "none" },
    });
    try {
      await controller.ready;
      expect(controller.getSnapshot().phase).toBe("idle");

      await expect(controller.newSession()).rejects.toMatchObject({
        code: "AUTHENTICATION_REQUIRED",
      });
      expect(controller.getSnapshot()).toMatchObject({
        phase: "auth_required",
        authMethods: [expect.objectContaining({ id: "login" })],
      });

      await controller.authenticate("login");
      expect(controller.getSnapshot().phase).toBe("idle");
      expect(controller.getSnapshot().sessionId).toBeDefined();
    } finally {
      await controller.destroy();
      await harness.close();
    }
  });

  it("rejects ready while exposing an authentication-required snapshot", async () => {
    const harness = createV1Harness({ authenticationRequired: true });
    const controller = createChat({
      connector: harness.connector,
      session: { cwd: "/workspace" },
    });

    await expect(controller.ready).rejects.toMatchObject({
      code: "AUTHENTICATION_REQUIRED",
    });
    expect(controller.getSnapshot()).toMatchObject({
      phase: "auth_required",
      authMethods: [expect.objectContaining({ id: "login" })],
    });
    expect(controller.getSnapshot().sessionId).toBeUndefined();

    await controller.authenticate("login");
    expect(controller.getSnapshot().phase).toBe("idle");
    await controller.destroy();
    await harness.close();
  });

  it("preserves the structured phase of a rejected initial session open", async () => {
    const harness = createV1Harness({
      loadOnly: true,
      beforeLoadSession: () => Promise.reject(new Error("missing session")),
    });
    const controller = createChat({
      connector: harness.connector,
      session: { cwd: "/workspace" },
      initialSession: { type: "open", sessionId: "stale-session" },
    });
    try {
      await expect(controller.ready).rejects.toMatchObject({
        code: "SESSION_REJECTED",
        phase: "session/open",
        retryable: true,
      });
    } finally {
      await controller.destroy();
      await harness.close();
    }
  });

  it("fails closed when the host forbids agent authentication", async () => {
    const harness = createV1Harness({ authenticationRequired: true });
    const controller = createChat({
      connector: harness.connector,
      session: { cwd: "/workspace" },
      allowAuthentication: false,
    });
    try {
      await expect(controller.ready).rejects.toMatchObject({
        code: "AUTHENTICATION_DISABLED",
      });
      expect(controller.getSnapshot()).toMatchObject({
        phase: "error",
        authMethods: [],
        error: { code: "AUTHENTICATION_DISABLED" },
      });
      await expect(controller.authenticate("login")).rejects.toMatchObject({
        code: "AUTHENTICATION_DISABLED",
      });
    } finally {
      await controller.destroy();
      await harness.close();
    }
  });

  it("surfaces an ACP authentication request failure", async () => {
    const harness = createV1Harness({
      authenticationRequired: true,
      authenticationFailure: true,
    });
    const controller = createChat({
      connector: harness.connector,
      protocol: 1,
      session: { cwd: "/workspace" },
    });
    try {
      await expect(controller.ready).rejects.toMatchObject({
        code: "AUTHENTICATION_REQUIRED",
      });

      await expect(controller.authenticate("login")).rejects.toThrow(
        /Fixture authentication failed/,
      );
      expect(controller.getSnapshot()).toMatchObject({
        phase: "error",
        error: {
          code: "UNKNOWN",
          message: expect.stringMatching(/Fixture authentication failed/),
        },
      });
      expect(controller.getSnapshot().sessionId).toBeUndefined();
    } finally {
      await controller.destroy();
      await harness.close();
    }
  });

  it("keeps session state atomic when close or logout is rejected", async () => {
    const harness = createV1Harness({
      closeSessionFailure: true,
      logoutFailure: true,
    });
    const controller = createChat({
      connector: harness.connector,
      protocol: 1,
      session: { cwd: "/workspace" },
    });
    try {
      await controller.ready;
      const before = controller.getSnapshot();

      await expect(controller.closeSession()).rejects.toThrow(
        "Fixture session close failed",
      );
      expect(controller.getSnapshot()).toBe(before);

      await expect(controller.logout()).rejects.toThrow(
        "Fixture logout failed",
      );
      expect(controller.getSnapshot()).toBe(before);
    } finally {
      await controller.destroy();
      await harness.close();
    }
  });

  it("passes and merges session-list cursors through both protocol drivers", async () => {
    const cases = [
      {
        protocol: 1 as const,
        harness: createV1Harness({ paginatedSessions: true }),
      },
      {
        protocol: 2 as const,
        harness: createV2Harness(0, { paginatedSessions: true }),
      },
    ];

    for (const { protocol, harness } of cases) {
      const controller = createChat({
        connector: harness.connector,
        protocol,
        session: { cwd: "/workspace" },
      });
      try {
        await controller.ready;
        const first = await controller.listSessions();
        expect(first).toMatchObject({
          sessions: [{ sessionId: "listed-1" }],
          nextCursor: "page-2",
        });

        const second = await controller.listSessions(first.nextCursor);
        expect(second.sessions.map((session) => session.sessionId)).toEqual([
          "listed-1",
          "listed-2",
        ]);
        expect(harness.listSessionCursors).toEqual([undefined, "page-2"]);
        expect(controller.getSnapshot().sessions).toEqual(second);
      } finally {
        await controller.destroy();
        await harness.close();
      }
    }
  });

  it("stays closed when destroyed during initialization", async () => {
    const gate = deferred<void>();
    const harness = createV1Harness({ beforeInitialize: () => gate.promise });
    const controller = createChat({
      connector: harness.connector,
      protocol: 1,
      session: { cwd: "/workspace" },
    });
    await waitFor(() => harness.attempts.length === 1);

    await controller.destroy();
    gate.resolve();

    await expect(controller.ready).rejects.toMatchObject({
      code: "CONNECTION_CLOSED",
    });
    expect(controller.getSnapshot().phase).toBe("closed");
    await harness.close();
  });

  it("moves to a retryable error when the active transport disconnects", async () => {
    const harness = createV1Harness();
    const controller = createChat({
      connector: harness.connector,
      session: { cwd: "/workspace" },
    });
    await controller.ready;

    await harness.disconnect();

    await waitFor(() => controller.getSnapshot().phase === "error");
    expect(controller.getSnapshot().error).toMatchObject({
      code: "CONNECTION_CLOSED",
      retryable: true,
    });
    await controller.destroy();
    await harness.close();
  });

  it("isolates throwing snapshot subscribers during notification fan-out", async () => {
    const harness = createV1Harness();
    const controller = createChat({
      connector: harness.connector,
      session: { cwd: "/workspace" },
    });
    await controller.ready;
    const observed = vi.fn();
    const removeThrowing = controller.subscribe(() => {
      throw new Error("subscriber failed");
    });
    const removeObserved = controller.subscribe(observed);
    try {
      const sink = controller as unknown as {
        onUpdate(sessionId: string, update: unknown): void;
      };
      expect(() =>
        sink.onUpdate(controller.getSnapshot().sessionId!, {
          sessionUpdate: "session_info_update",
          title: "Subscriber-safe title",
        }),
      ).not.toThrow();
      expect(observed).toHaveBeenCalled();
      expect(controller.getSnapshot().sessionTitle).toBe(
        "Subscriber-safe title",
      );
    } finally {
      removeThrowing();
      removeObserved();
      await controller.destroy();
      await harness.close();
    }
  });

  it("does not submit a prompt after cancellation during async context", async () => {
    const gate = deferred<readonly []>();
    let contextStarted = false;
    const harness = createV1Harness();
    const controller = createChat({
      connector: harness.connector,
      session: { cwd: "/workspace" },
      context: testContextProvider([], async () => {
        contextStarted = true;
        return gate.promise;
      }),
    });
    await controller.ready;
    const turn = controller.send("cancel before prompt");
    await waitFor(() => contextStarted);

    await controller.cancel();
    gate.resolve([]);

    await expect(turn.done).resolves.toEqual({ stopReason: "cancelled" });
    expect(harness.prompts).toHaveLength(0);
    expect(controller.getSnapshot().phase).toBe("idle");
    await controller.destroy();
    await harness.close();
  });

  it("cancels permission requests for a different session", async () => {
    const harness = createV1Harness({ permissionSessionId: "other-session" });
    const controller = createChat({
      connector: harness.connector,
      session: { cwd: "/workspace" },
    });
    try {
      await controller.ready;
      const turn = controller.send("permission please");
      void turn.done.catch(() => undefined);
      await waitFor(() => harness.prompts.length === 1);
      await waitFor(() => harness.permissionResponses.length === 1);
      expect(controller.getSnapshot().interactions).toHaveLength(0);
      await expect(turn.done).resolves.toEqual({ stopReason: "end_turn" });
      expect(harness.permissionResponses[0]).toMatchObject({
        outcome: { outcome: "cancelled" },
      });
    } finally {
      await controller.destroy();
      await harness.close();
    }
  });

  it("keeps a background permission with its loaded session", async () => {
    const harness = createV1Harness();
    const controller = createChat({
      connector: harness.connector,
      session: { cwd: "/workspace" },
    });
    try {
      await controller.ready;
      const firstSessionId = controller.getSnapshot().sessionId!;
      await controller.newSession();
      const secondSessionId = controller.getSnapshot().sessionId!;
      await controller.openSession(firstSessionId);

      const turn = controller.send("permission please");
      await waitFor(() => controller.getSnapshot().interactions.length === 1);
      await controller.openSession(secondSessionId);

      expect(controller.getSnapshot().interactions).toEqual([]);
      expect(controller.getSnapshot().loadedSessions).toContainEqual(
        expect.objectContaining({
          sessionId: firstSessionId,
          phase: "awaiting_user",
          interactionCount: 1,
        }),
      );

      await controller.openSession(firstSessionId);
      const interaction = controller.getSnapshot().interactions[0];
      expect(interaction?.type).toBe("permission");
      if (interaction?.type === "permission") {
        expect(
          controller.respondPermission(interaction.id, {
            outcome: "selected",
            optionId: "allow-once",
          }),
        ).toBe(true);
      }
      await expect(turn.done).resolves.toEqual({ stopReason: "end_turn" });
    } finally {
      await controller.destroy();
      await harness.close();
    }
  });

  it("rejects a concurrent session mutation before issuing it", async () => {
    const gate = deferred<void>();
    const harness = createV1Harness({
      beforeNewSession: (ordinal) =>
        ordinal === 2 ? gate.promise : Promise.resolve(),
    });
    const controller = createChat({
      connector: harness.connector,
      session: { cwd: "/workspace" },
    });
    await controller.ready;
    const first = controller.newSession();
    await waitFor(() => harness.newSessionRequests === 2);

    await expect(controller.newSession()).rejects.toMatchObject({
      code: "SESSION_BUSY",
    });
    expect(harness.newSessionRequests).toBe(2);

    gate.resolve();
    await first;
    await controller.destroy();
    await harness.close();
  });

  it("does not start a prompt while its session is closing", async () => {
    const gate = deferred<void>();
    let closeStarted = false;
    const harness = createV1Harness({
      beforeCloseSession: async () => {
        closeStarted = true;
        await gate.promise;
      },
    });
    const controller = createChat({
      connector: harness.connector,
      session: { cwd: "/workspace" },
    });
    try {
      await controller.ready;
      const closing = controller.closeSession();
      await waitFor(() => closeStarted);

      expect(() => controller.send("too late")).toThrow(
        expect.objectContaining({ code: "SESSION_BUSY" }),
      );

      gate.resolve();
      await closing;
      expect(controller.getSnapshot().sessionId).toBeUndefined();
      expect(controller.getSnapshot().phase).toBe("idle");
    } finally {
      gate.resolve();
      await controller.destroy();
      await harness.close();
    }
  });

  it("keeps connection replacement atomic with target-session mutations", async () => {
    const gate = deferred<void>();
    const harness = createV1Harness({
      loadOnly: true,
      beforeLoadSession: () => gate.promise,
    });
    const controller = createChat({
      connector: harness.connector,
      session: { cwd: "/workspace" },
    });
    try {
      await controller.ready;
      const sessionId = controller.getSnapshot().sessionId!;
      const reconnecting = controller.reconnect();
      await waitFor(() => harness.loadSessionRequests === 1);

      await expect(controller.closeSession(sessionId)).rejects.toMatchObject({
        code: "SESSION_BUSY",
      });

      gate.resolve();
      await reconnecting;
      expect(controller.getSnapshot().sessionId).toBe(sessionId);
      expect(controller.getSnapshot().loadedSessions).toHaveLength(1);
    } finally {
      gate.resolve();
      await controller.destroy();
      await harness.close();
    }
  });

  it("runs turns concurrently in loaded sessions without mixing transcripts", async () => {
    const harness = createV2Harness(30);
    const controller = createChat({
      connector: harness.connector,
      protocol: 2,
      session: { cwd: "/workspace" },
    });
    try {
      await controller.ready;
      const firstSessionId = controller.getSnapshot().sessionId!;
      await controller.newSession();
      const secondSessionId = controller.getSnapshot().sessionId!;

      expect(
        controller
          .getSnapshot()
          .loadedSessions.map((session) => session.sessionId),
      ).toEqual([firstSessionId, secondSessionId]);

      await controller.openSession(firstSessionId);
      const firstTurn = controller.send("prompt for first session");
      await controller.openSession(secondSessionId);
      const secondTurn = controller.send("prompt for second session");

      await expect(
        Promise.all([firstTurn.done, secondTurn.done]),
      ).resolves.toEqual([
        { stopReason: "end_turn" },
        { stopReason: "end_turn" },
      ]);
      expect(harness.prompts.map(({ sessionId }) => sessionId)).toEqual([
        firstSessionId,
        secondSessionId,
      ]);

      await controller.openSession(firstSessionId);
      expect(messageText(controller.getSnapshot(), "user")).toContain(
        "prompt for first session",
      );
      expect(messageText(controller.getSnapshot(), "user")).not.toContain(
        "prompt for second session",
      );

      await controller.openSession(secondSessionId);
      expect(messageText(controller.getSnapshot(), "user")).toContain(
        "prompt for second session",
      );
      expect(messageText(controller.getSnapshot(), "user")).not.toContain(
        "prompt for first session",
      );
    } finally {
      await controller.destroy();
      await harness.close();
    }
  });

  it("keeps ACP v1 mode-only configuration scoped to its session", async () => {
    const harness = createV1Harness({ modeOnlySessionOrdinals: [1] });
    const controller = createChat({
      connector: harness.connector,
      protocol: 1,
      session: { cwd: "/workspace" },
    });
    try {
      await controller.ready;
      const modeOnlySessionId = controller.getSnapshot().sessionId!;
      await controller.newSession();
      const configSessionId = controller.getSnapshot().sessionId!;

      await controller.openSession(modeOnlySessionId);
      await controller.setConfigOption("mode", "fast");
      await controller.openSession(configSessionId);
      await controller.setConfigOption("mode", "balanced");

      expect(harness.modeUpdates).toEqual([
        { sessionId: modeOnlySessionId, value: "fast" },
      ]);
      expect(harness.configUpdates).toEqual([
        { sessionId: configSessionId, id: "mode", value: "balanced" },
      ]);
    } finally {
      await controller.destroy();
      await harness.close();
    }
  });

  it("rejects a seventeenth loaded session before a remote side effect", async () => {
    const harness = createV1Harness();
    const controller = createChat({
      connector: harness.connector,
      session: { cwd: "/workspace" },
    });
    try {
      await controller.ready;
      const firstSessionId = controller.getSnapshot().sessionId!;
      for (let index = 1; index < 16; index += 1) {
        await controller.newSession();
      }
      expect(controller.getSnapshot().loadedSessions).toHaveLength(16);
      expect(harness.newSessionRequests).toBe(16);

      await expect(controller.newSession()).rejects.toMatchObject({
        code: "SESSION_LIMIT",
      });
      expect(harness.newSessionRequests).toBe(16);

      await controller.closeSession(firstSessionId);
      await controller.newSession();
      expect(harness.newSessionRequests).toBe(17);
      expect(controller.getSnapshot().loadedSessions).toHaveLength(16);
    } finally {
      await controller.destroy();
      await harness.close();
    }
  });

  it("reserves capacity atomically across new and open operations", async () => {
    const gate = deferred<void>();
    const harness = createV1Harness({
      loadOnly: true,
      beforeNewSession: (ordinal) =>
        ordinal === 16 ? gate.promise : Promise.resolve(),
    });
    const controller = createChat({
      connector: harness.connector,
      session: { cwd: "/workspace" },
    });
    try {
      await controller.ready;
      for (let index = 1; index < 15; index += 1) {
        await controller.newSession();
      }
      const creating = controller.newSession();
      await waitFor(() => harness.newSessionRequests === 16);

      await expect(
        controller.openSession("parallel-open"),
      ).rejects.toMatchObject({ code: "SESSION_BUSY" });

      gate.resolve();
      await creating;
      expect(controller.getSnapshot().loadedSessions).toHaveLength(16);
      expect(harness.loadSessionRequests).toBe(0);
    } finally {
      gate.resolve();
      await controller.destroy();
      await harness.close();
    }
  });

  it("tracks nested child sessions and truncates the trail when returning to an ancestor", async () => {
    const harness = createV1Harness({ loadOnly: true });
    const controller = createChat({
      connector: harness.connector,
      session: { cwd: "/workspace" },
    });
    try {
      await controller.ready;
      const rootSessionId = controller.getSnapshot().sessionId!;

      await controller.openChildSession("child-1");
      expect(controller.getSnapshot()).toMatchObject({
        sessionId: "child-1",
        sessionTrail: [{ sessionId: rootSessionId }],
      });

      await controller.openChildSession("child-2");
      expect(controller.getSnapshot()).toMatchObject({
        sessionId: "child-2",
        sessionTrail: [{ sessionId: rootSessionId }, { sessionId: "child-1" }],
      });

      await controller.openAncestorSession("child-1");
      expect(controller.getSnapshot()).toMatchObject({
        sessionId: "child-1",
        sessionTrail: [{ sessionId: rootSessionId }],
      });

      await controller.openAncestorSession(rootSessionId);
      expect(controller.getSnapshot()).toMatchObject({
        sessionId: rootSessionId,
        sessionTrail: [],
      });
    } finally {
      await controller.destroy();
      await harness.close();
    }
  });

  it("changes a child trail only after a session load succeeds", async () => {
    const gate = deferred<void>();
    const harness = createV1Harness({
      loadOnly: true,
      beforeLoadSession: (sessionId) =>
        sessionId === "broken-child"
          ? Promise.reject(new Error("Child load failed"))
          : sessionId === "slow-child"
            ? gate.promise
            : Promise.resolve(),
    });
    const controller = createChat({
      connector: harness.connector,
      session: { cwd: "/workspace" },
    });
    try {
      await controller.ready;
      const rootSessionId = controller.getSnapshot().sessionId!;

      await expect(
        controller.openChildSession("broken-child"),
      ).rejects.toBeDefined();
      expect(controller.getSnapshot()).toMatchObject({
        sessionId: rootSessionId,
        sessionTrail: [],
      });

      const opening = controller.openChildSession("slow-child");
      await waitFor(() => harness.loadSessionRequests === 2);
      expect(controller.getSnapshot()).toMatchObject({
        sessionId: rootSessionId,
        sessionTrail: [],
      });
      await controller.openChildSession("other-child");
      expect(controller.getSnapshot()).toMatchObject({
        sessionId: "other-child",
        sessionTrail: [{ sessionId: rootSessionId }],
      });
      gate.resolve();
      await opening;
      expect(controller.getSnapshot()).toMatchObject({
        sessionId: "other-child",
        sessionTrail: [{ sessionId: rootSessionId }],
      });
      expect(
        controller
          .getSnapshot()
          .loadedSessions.map((session) => session.sessionId),
      ).toEqual([rootSessionId, "other-child", "slow-child"]);
    } finally {
      await controller.destroy();
      await harness.close();
    }
  });

  it("does not let a stale open override a newer loaded ancestor selection", async () => {
    const gate = deferred<void>();
    const harness = createV1Harness({
      loadOnly: true,
      beforeLoadSession: (sessionId) =>
        sessionId === "slow-session" ? gate.promise : Promise.resolve(),
    });
    const controller = createChat({
      connector: harness.connector,
      session: { cwd: "/workspace" },
    });
    try {
      await controller.ready;
      const rootSessionId = controller.getSnapshot().sessionId!;
      await controller.openChildSession("child-session");

      const opening = controller.openSession("slow-session");
      await waitFor(() => harness.loadSessionRequests === 2);
      await controller.openAncestorSession(rootSessionId);
      gate.resolve();
      await opening;

      expect(controller.getSnapshot()).toMatchObject({
        sessionId: rootSessionId,
        sessionTrail: [],
      });
    } finally {
      gate.resolve();
      await controller.destroy();
      await harness.close();
    }
  });

  it("changes session incarnation when an unloaded ID is opened again", async () => {
    const harness = createV1Harness({ loadOnly: true });
    const controller = createChat({
      connector: harness.connector,
      session: { cwd: "/workspace" },
    });
    try {
      await controller.ready;
      const sessionId = controller.getSnapshot().sessionId!;
      const firstInstance = controller.getSnapshot().sessionInstanceId;
      expect(firstInstance).toBeDefined();

      await controller.closeSession(sessionId);
      await controller.openSession(sessionId);

      expect(controller.getSnapshot().sessionId).toBe(sessionId);
      expect(controller.getSnapshot().sessionInstanceId).toBeDefined();
      expect(controller.getSnapshot().sessionInstanceId).not.toBe(
        firstInstance,
      );
    } finally {
      await controller.destroy();
      await harness.close();
    }
  });

  it("clears child navigation on ordinary session changes and preserves it on reconnect", async () => {
    const harness = createV1Harness({ loadOnly: true });
    const controller = createChat({
      connector: harness.connector,
      session: { cwd: "/workspace" },
    });
    try {
      await controller.ready;
      await controller.openChildSession("child-1");

      await controller.reconnect();
      expect(controller.getSnapshot()).toMatchObject({
        sessionId: "child-1",
        sessionTrail: [expect.objectContaining({ sessionId: "v1-session-1" })],
      });

      await controller.openSession("ordinary-session");
      expect(controller.getSnapshot()).toMatchObject({
        sessionId: "ordinary-session",
        sessionTrail: [],
      });

      await controller.openChildSession("ordinary-child");
      await controller.newSession();
      expect(controller.getSnapshot().sessionTrail).toEqual([]);
    } finally {
      await controller.destroy();
      await harness.close();
    }
  });

  it("rejects non-ancestor navigation without changing the active child", async () => {
    const harness = createV1Harness({ loadOnly: true });
    const controller = createChat({
      connector: harness.connector,
      session: { cwd: "/workspace" },
    });
    try {
      await controller.ready;
      await controller.openChildSession("child-1");
      const before = controller.getSnapshot();

      await expect(
        controller.openAncestorSession("not-an-ancestor"),
      ).rejects.toMatchObject({ code: "INVALID_CONFIGURATION" });
      expect(controller.getSnapshot()).toBe(before);
    } finally {
      await controller.destroy();
      await harness.close();
    }
  });

  it("captures the active title in the child trail and clears it on close", async () => {
    const harness = createV1Harness({ loadOnly: true });
    const controller = createChat({
      connector: harness.connector,
      session: { cwd: "/workspace" },
    });
    try {
      await controller.ready;
      await controller.send("name this session").done;
      const rootSessionId = controller.getSnapshot().sessionId!;

      await controller.openChildSession("child-1");
      expect(controller.getSnapshot().sessionTrail).toEqual([
        { sessionId: rootSessionId, title: "Conversation 1" },
      ]);

      await controller.closeSession();
      expect(controller.getSnapshot()).toMatchObject({ sessionTrail: [] });
      expect(controller.getSnapshot().sessionId).toBe(rootSessionId);
    } finally {
      await controller.destroy();
      await harness.close();
    }
  });

  it("rejects child navigation during an active turn without changing the trail", async () => {
    const harness = createV1Harness({ loadOnly: true });
    const controller = createChat({
      connector: harness.connector,
      session: { cwd: "/workspace" },
    });
    try {
      await controller.ready;
      const turn = controller.send("permission please");
      await waitFor(() => controller.getSnapshot().interactions.length === 1);

      await expect(
        controller.openChildSession("child-1"),
      ).rejects.toMatchObject({ code: "SESSION_BUSY" });
      expect(controller.getSnapshot().sessionTrail).toEqual([]);

      const interaction = controller.getSnapshot().interactions[0];
      if (interaction?.type === "permission") {
        controller.respondPermission(interaction.id, { outcome: "cancelled" });
      }
      await turn.done;
    } finally {
      await controller.destroy();
      await harness.close();
    }
  });

  it("ignores a child load result that arrives after controller destruction", async () => {
    const gate = deferred<void>();
    const harness = createV1Harness({
      loadOnly: true,
      beforeLoadSession: (sessionId) =>
        sessionId === "grandchild" ? gate.promise : Promise.resolve(),
    });
    const controller = createChat({
      connector: harness.connector,
      session: { cwd: "/workspace" },
    });
    await controller.ready;
    await controller.openChildSession("child-1");
    const trail = controller.getSnapshot().sessionTrail;
    const opening = controller.openChildSession("grandchild");
    await waitFor(() => harness.loadSessionRequests === 2);

    await controller.destroy();
    gate.resolve();

    await expect(opening).rejects.toThrow(/ACP connection closed/);
    expect(controller.getSnapshot()).toMatchObject({
      phase: "closed",
      sessionId: "child-1",
      sessionTrail: trail,
    });
    await harness.close();
  });

  it("keeps reconnect inside the session single-flight and preserves a pending interaction", async () => {
    const harness = createV1Harness();
    const controller = createChat({
      connector: harness.connector,
      session: { cwd: "/workspace" },
    });
    try {
      await controller.ready;
      const turn = controller.send("permission please");
      void turn.done.catch(() => undefined);
      await waitFor(() => controller.getSnapshot().interactions.length === 1);

      await expect(controller.reconnect()).rejects.toMatchObject({
        code: "SESSION_BUSY",
      });
      expect(harness.attempts).toHaveLength(1);
      const interaction = controller.getSnapshot().interactions[0];
      expect(interaction?.type).toBe("permission");
      if (interaction?.type === "permission") {
        controller.respondPermission(interaction.id, { outcome: "cancelled" });
      }
      await expect(turn.done).resolves.toEqual({ stopReason: "end_turn" });
    } finally {
      await controller.destroy();
      await harness.close();
    }
  });

  it("rejects reconnect while a turn-independent elicitation is pending", async () => {
    const harness = createV1Harness();
    const controller = createChat({
      connector: harness.connector,
      session: { cwd: "/workspace" },
    });
    try {
      await controller.ready;
      const response = harness.requestStandaloneElicitation();
      await waitFor(() => controller.getSnapshot().interactions.length === 1);

      await expect(controller.reconnect()).rejects.toMatchObject({
        code: "SESSION_BUSY",
      });
      expect(harness.attempts).toHaveLength(1);
      expect(controller.getSnapshot().interactions).toHaveLength(1);

      const interaction = controller.getSnapshot().interactions[0];
      expect(interaction?.type).toBe("elicitation");
      if (interaction?.type === "elicitation") {
        controller.respondElicitation(interaction.id, { action: "cancel" });
      }
      await expect(response).resolves.toMatchObject({ action: "cancel" });
    } finally {
      await controller.destroy();
      await harness.close();
    }
  });

  it("clears the previous transcript when reconnect must create a new session", async () => {
    const harness = createV1Harness({ noSessionReopen: true });
    const controller = createChat({
      connector: harness.connector,
      protocol: 1,
      session: { cwd: "/workspace" },
    });
    try {
      await controller.ready;
      await controller.send("Old session message").done;
      const previousSessionId = controller.getSnapshot().sessionId;
      expect(controller.getSnapshot().activities.length).toBeGreaterThan(0);

      await controller.reconnect();

      expect(controller.getSnapshot().sessionId).not.toBe(previousSessionId);
      expect(controller.getSnapshot().activities).toEqual([]);
      expect(harness.newSessionRequests).toBe(2);
    } finally {
      await controller.destroy();
      await harness.close();
    }
  });

  it("coalesces an overlapping session-list request for the same cursor", async () => {
    const gate = deferred<void>();
    const harness = createV1Harness({
      beforeListSessions: (ordinal) =>
        ordinal === 1 ? gate.promise : Promise.resolve(),
    });
    const controller = createChat({
      connector: harness.connector,
      session: { cwd: "/workspace" },
    });
    try {
      await controller.ready;
      const first = controller.listSessions();
      await waitFor(() => harness.listSessionCursors.length === 1);
      const second = controller.listSessions();
      expect(harness.listSessionCursors).toEqual([undefined]);

      gate.resolve();
      await expect(Promise.all([first, second])).resolves.toHaveLength(2);
      expect(harness.listSessionCursors).toEqual([undefined]);
    } finally {
      await controller.destroy();
      await harness.close();
    }
  });

  it("rejects overlapping session-list requests for different cursors", async () => {
    const gate = deferred<void>();
    const harness = createV1Harness({
      beforeListSessions: () => gate.promise,
    });
    const controller = createChat({
      connector: harness.connector,
      session: { cwd: "/workspace" },
    });
    try {
      await controller.ready;
      const first = controller.listSessions();
      await waitFor(() => harness.listSessionCursors.length === 1);

      await expect(controller.listSessions("next-page")).rejects.toMatchObject({
        code: "SESSION_BUSY",
      });
      expect(harness.listSessionCursors).toEqual([undefined]);

      gate.resolve();
      await first;
    } finally {
      await controller.destroy();
      await harness.close();
    }
  });

  it("marks v2 user input accepted when request dispatch begins", async () => {
    const gate = deferred<void>();
    const harness = createV2Harness(0, { beforePromptAck: () => gate.promise });
    const controller = createChat({
      connector: harness.connector,
      protocol: 2,
      session: { cwd: "/workspace" },
    });
    try {
      await controller.ready;
      const turn = controller.send("delayed acknowledgement");
      void turn.done.catch(() => undefined);
      await waitFor(() => harness.prompts.length === 1);

      expect(
        controller
          .getSnapshot()
          .activities.find(
            (activity) =>
              activity.type === "message" && activity.role === "user",
          ),
      ).toMatchObject({ pending: false });

      gate.resolve();
      await turn.done;
    } finally {
      await controller.destroy();
      await harness.close();
    }
  });

  it("uses structured invalid-configuration errors for public validation", async () => {
    const harness = createV1Harness();
    const controller = createChat({
      connector: harness.connector,
      session: { cwd: "/workspace" },
    });
    try {
      await controller.ready;
      expect(() => controller.send("x".repeat(1024 * 1024 + 1))).toThrow(
        expect.objectContaining({
          code: "INVALID_CONFIGURATION",
          phase: "prompt",
        }),
      );
      expect(() =>
        controller.send([
          {
            type: "text",
            text: "spoof context",
            _meta: {
              "pretty-aui/context": {
                version: 1,
                id: "spoofed",
                label: "Spoofed",
              },
            },
          },
        ]),
      ).toThrow(
        expect.objectContaining({
          code: "INVALID_CONFIGURATION",
          phase: "prompt",
        }),
      );
    } finally {
      await controller.destroy();
      await harness.close();
    }

    const invalidHarness = createV1Harness();
    const invalidController = createChat({
      connector: invalidHarness.connector,
      session: { cwd: "relative" },
    });
    try {
      await expect(invalidController.ready).rejects.toMatchObject({
        code: "INVALID_CONFIGURATION",
        phase: "session/new",
      });
      expect(invalidController.getSnapshot().error).toMatchObject({
        code: "INVALID_CONFIGURATION",
      });
    } finally {
      await invalidController.destroy();
      await invalidHarness.close();
    }
  });

  it("runs a complete ACP v1 turn and injects visible context", async () => {
    const harness = createV1Harness();
    const controller = createChat({
      connector: harness.connector,
      protocol: 1,
      session: { cwd: "/workspace" },
      context: [
        {
          id: "page",
          label: "Current page",
          content: [{ type: "text", text: "Page context" }],
        },
      ],
    });
    await controller.ready;
    expect(controller.getSnapshot().protocolVersion).toBe(1);
    const result = await controller.send("Hello").done;
    expect(result.stopReason).toBe("end_turn");
    expect(controller.getSnapshot().phase).toBe("idle");
    const activities = controller.getSnapshot().activities as readonly {
      readonly type: string;
      readonly role?: string;
      readonly contextId?: string;
      readonly label?: string;
      readonly content?: readonly unknown[];
    }[];
    expect(activities.slice(0, 2)).toEqual([
      expect.objectContaining({ type: "message", role: "user" }),
      expect.objectContaining({
        type: "context",
        contextId: "page",
        label: "Current page",
      }),
    ]);
    expect(controller.getSnapshot().activities).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: "tool", status: "completed" }),
        expect.objectContaining({ type: "plan" }),
        expect.objectContaining({
          type: "message",
          role: "thought",
          content: [
            {
              type: "text",
              text: "Checking the request against the workspace.",
            },
          ],
        }),
        expect.objectContaining({
          type: "message",
          role: "assistant",
          content: [
            {
              type: "text",
              text: "## Ready\n\nThe fixture agent completed the request.",
            },
          ],
        }),
      ]),
    );
    expect(harness.prompts[0]?.prompt.map((block) => block.type)).toEqual([
      "text",
      "text",
    ]);
    expect(harness.prompts[0]?.prompt[0]?._meta).toMatchObject({
      "pretty-aui/context": {
        version: 1,
        id: "page",
        label: "Current page",
      },
    });
    expect(activities[1]?.content).toEqual([harness.prompts[0]?.prompt[0]]);
    await controller.destroy();
    await harness.close();
  });

  it("projects an observable context selection and exposes add and remove actions", async () => {
    const harness = createV1Harness();
    let selection = [{ id: "page", label: "Current page" }];
    const listeners = new Set<() => void>();
    const provider = {
      getSelection: () => selection,
      subscribe(listener: () => void) {
        listeners.add(listener);
        return () => listeners.delete(listener);
      },
      add() {
        selection = [...selection, { id: "task", label: "Current task" }];
        for (const listener of listeners) listener();
      },
      remove(id: string) {
        selection = selection.filter((item) => item.id !== id);
        for (const listener of listeners) listener();
      },
      resolve: async () => [],
    };
    const controller = createChat({
      connector: harness.connector,
      session: { cwd: "/workspace" },
      context: provider as never,
    });
    const mutable = controller as typeof controller & {
      addContext(): Promise<void>;
      removeContext(id: string): Promise<void>;
    };
    try {
      await controller.ready;
      expect(controller.getSnapshot()).toMatchObject({
        contextSelection: {
          items: [{ id: "page", label: "Current page" }],
          canAdd: true,
          canRemove: true,
          busy: false,
        },
      });

      await mutable.addContext();
      expect(controller.getSnapshot()).toMatchObject({
        contextSelection: {
          items: [
            { id: "page", label: "Current page" },
            { id: "task", label: "Current task" },
          ],
        },
      });

      await mutable.removeContext("page");
      expect(controller.getSnapshot()).toMatchObject({
        contextSelection: {
          items: [{ id: "task", label: "Current task" }],
        },
      });
    } finally {
      await controller.destroy();
      await harness.close();
      expect(listeners.size).toBe(0);
    }
  });

  it("does not commit a context selection mutation after controller destruction", async () => {
    const harness = createV1Harness();
    const gate = deferred<void>();
    let selection = [{ id: "page", label: "Current page" }];
    const listeners = new Set<() => void>();
    let started = false;
    const controller = createChat({
      connector: harness.connector,
      session: { cwd: "/workspace" },
      context: {
        getSelection: () => selection,
        subscribe(listener) {
          listeners.add(listener);
          return () => listeners.delete(listener);
        },
        async add() {
          started = true;
          await gate.promise;
          selection = [...selection, { id: "task", label: "Current task" }];
          for (const listener of listeners) listener();
        },
        resolve: async () => [],
      },
    });
    try {
      await controller.ready;
      const mutation = controller.addContext();
      await waitFor(() => started);
      await controller.destroy();
      gate.resolve();

      await expect(mutation).rejects.toMatchObject({
        code: "CONNECTION_CLOSED",
      });
      expect(controller.getSnapshot()).toMatchObject({
        phase: "closed",
        contextSelection: {
          items: [{ id: "page", label: "Current page" }],
          busy: false,
        },
      });
    } finally {
      gate.resolve();
      await controller.destroy();
      await harness.close();
    }
  });

  it("freezes the ordered context selection before resolving and dispatching a turn", async () => {
    const harness = createV1Harness();
    let selection = [
      { id: "page", label: "Current page" },
      { id: "task", label: "Current task" },
    ];
    const listeners = new Set<() => void>();
    let release: (() => void) | undefined;
    const requests: {
      readonly selection: readonly { readonly id: string }[];
    }[] = [];
    const controller = createChat({
      connector: harness.connector,
      session: { cwd: "/workspace" },
      context: {
        getSelection: () => selection,
        subscribe(listener) {
          listeners.add(listener);
          return () => listeners.delete(listener);
        },
        async resolve(request) {
          requests.push(request);
          await new Promise<void>((resolve) => {
            release = resolve;
          });
          return request.selection.map((item) => ({
            ...item,
            content: [{ type: "text" as const, text: `${item.label} content` }],
          }));
        },
      },
    });
    try {
      await controller.ready;
      const turn = controller.send("Inspect both");
      await waitFor(() => release !== undefined);
      selection = [{ id: "page", label: "Current page" }];
      for (const listener of listeners) listener();
      release!();
      await turn.done;

      expect(requests).toEqual([
        expect.objectContaining({
          selection: [
            { id: "page", label: "Current page" },
            { id: "task", label: "Current task" },
          ],
        }),
      ]);
      expect(
        harness.prompts[0]?.prompt.map((block) =>
          block.type === "text" ? block.text : block.type,
        ),
      ).toEqual([
        "Current page content",
        "Current task content",
        "Inspect both",
      ]);
      expect(
        controller
          .getSnapshot()
          .activities.filter((activity) => activity.type === "context")
          .map((activity) => activity.contextId),
      ).toEqual(["page", "task"]);
      expect(controller.getSnapshot().contextSelection.items).toEqual([
        { id: "page", label: "Current page" },
      ]);
    } finally {
      await controller.destroy();
      await harness.close();
    }
  });

  it("rejects resolved context that diverges from the frozen selection", async () => {
    const harness = createV1Harness();
    const controller = createChat({
      connector: harness.connector,
      session: { cwd: "/workspace" },
      context: testContextProvider(
        [
          { id: "page", label: "Current page" },
          { id: "task", label: "Current task" },
        ],
        () => [
          {
            id: "task",
            label: "Current task",
            content: [{ type: "text", text: "Task content" }],
          },
          {
            id: "page",
            label: "Current page",
            content: [{ type: "text", text: "Page content" }],
          },
        ],
      ),
    });
    try {
      await controller.ready;
      await expect(controller.send("Inspect").done).rejects.toMatchObject({
        code: "CONTEXT_FAILED",
        phase: "context",
      });
      expect(harness.prompts).toHaveLength(0);
      expect(
        controller
          .getSnapshot()
          .activities.filter((activity) => activity.type === "context"),
      ).toHaveLength(0);
    } finally {
      await controller.destroy();
      await harness.close();
    }
  });

  it("gives context providers the owning session and prompt capabilities", async () => {
    const requests: {
      sessionId?: string;
      capabilities: {
        image: boolean;
        audio: boolean;
        embeddedContext: boolean;
      };
    }[] = [];
    const harness = createV1Harness();
    const controller = createChat({
      connector: harness.connector,
      session: { cwd: "/workspace" },
      context: testContextProvider([], (request) => {
        requests.push(request);
        return [];
      }),
    });
    try {
      await controller.ready;
      const sessionId = controller.getSnapshot().sessionId!;
      await controller.send("capabilities").done;

      expect(requests).toEqual([
        expect.objectContaining({
          sessionId,
          capabilities: {
            image: true,
            audio: true,
            embeddedContext: true,
          },
        }),
      ]);
    } finally {
      await controller.destroy();
      await harness.close();
    }
  });

  it("rejects malformed context before dispatch or timeline commit", async () => {
    const harness = createV1Harness();
    const controller = createChat({
      connector: harness.connector,
      session: { cwd: "/workspace" },
      context: testContextProvider(
        [{ id: "page", label: "Current page" }],
        () => [
          {
            id: "page",
            label: "",
            content: [],
          },
        ],
      ),
    });
    try {
      await controller.ready;
      await expect(controller.send("Inspect").done).rejects.toMatchObject({
        code: "CONTEXT_FAILED",
      });
      expect(harness.prompts).toHaveLength(0);
      expect(
        controller
          .getSnapshot()
          .activities.some((activity) => activity.type === "context"),
      ).toBe(false);
    } finally {
      await controller.destroy();
      await harness.close();
    }
  });

  it("rejects aggregate context beyond the ACP wire-message budget", async () => {
    const selection = Array.from({ length: 16 }, (_, index) => ({
      id: `context-${index}`,
      label: `Context ${index}`,
    }));
    const harness = createV1Harness();
    const controller = createChat({
      connector: harness.connector,
      session: { cwd: "/workspace" },
      context: testContextProvider(selection, () =>
        selection.map((item) => ({
          ...item,
          content: [{ type: "text", text: "x".repeat(128 * 1024) }],
        })),
      ),
    });
    try {
      await controller.ready;
      await expect(controller.send("Inspect").done).rejects.toMatchObject({
        code: "INVALID_CONFIGURATION",
        phase: "prompt",
      });
      expect(harness.prompts).toHaveLength(0);
      expect(
        controller
          .getSnapshot()
          .activities.some((activity) => activity.type === "context"),
      ).toBe(false);
    } finally {
      await controller.destroy();
      await harness.close();
    }
  });

  it("keeps submitted context out of the canonical v2 user message", async () => {
    const harness = createV2Harness();
    const controller = createChat({
      connector: harness.connector,
      protocol: 2,
      session: { cwd: "/workspace" },
      context: [
        {
          id: "page",
          label: "Current page",
          content: [{ type: "text", text: "Page context" }],
        },
      ],
    });
    try {
      await controller.ready;
      await controller.send("Only the user prompt").done;

      const activities = controller.getSnapshot().activities;
      expect(
        activities.filter((activity) => activity.type === "context"),
      ).toHaveLength(1);
      expect(
        activities.find(
          (activity) => activity.type === "message" && activity.role === "user",
        ),
      ).toMatchObject({
        content: [{ type: "text", text: "Only the user prompt" }],
      });
    } finally {
      await controller.destroy();
      await harness.close();
    }
  });

  it("records every accepted turn from the resolved context snapshot", async () => {
    let generation = 0;
    const harness = createV1Harness();
    const controller = createChat({
      connector: harness.connector,
      session: { cwd: "/workspace" },
      context: testContextProvider(
        [
          { id: "page", label: "Current page" },
          { id: "task", label: "Current task" },
        ],
        () => {
          generation += 1;
          return [
            {
              id: "page",
              label: "Current page",
              content: [{ type: "text", text: `Page ${generation}` }],
            },
            {
              id: "task",
              label: "Current task",
              content: [{ type: "text", text: `Task ${generation}` }],
            },
          ];
        },
      ),
    });
    try {
      await controller.ready;
      await controller.send("First").done;
      await controller.send("Second").done;

      const contexts = controller
        .getSnapshot()
        .activities.filter((activity) => activity.type === "context");
      expect(contexts.map((activity) => activity.contextId)).toEqual([
        "page",
        "task",
        "page",
        "task",
      ]);
      expect(contexts.map((activity) => activity.id)).toEqual(
        expect.arrayContaining([
          expect.stringMatching(/^local-context-/),
          expect.stringMatching(/^local-context-/),
          expect.stringMatching(/^local-context-/),
          expect.stringMatching(/^local-context-/),
        ]),
      );
      expect(new Set(contexts.map((activity) => activity.id))).toHaveProperty(
        "size",
        4,
      );
      expect(
        contexts.map((activity) =>
          activity.content.map((block) =>
            block.type === "text" ? block.text : block.type,
          ),
        ),
      ).toEqual([["Page 1"], ["Task 1"], ["Page 2"], ["Task 2"]]);
    } finally {
      await controller.destroy();
      await harness.close();
    }
  });

  it("owns a deep snapshot of provider context after dispatch", async () => {
    const resource = {
      type: "resource" as const,
      resource: {
        uri: "peval://source/cell-1",
        mimeType: "application/json",
        text: "Original context",
      },
    };
    const harness = createV1Harness();
    const controller = createChat({
      connector: harness.connector,
      session: { cwd: "/workspace" },
      context: [{ id: "page", label: "Current page", content: [resource] }],
    });
    try {
      await controller.ready;
      const turn = controller.send("Inspect");
      await waitFor(() => harness.prompts.length === 1);
      resource.resource.text = "Mutated after dispatch";
      await turn.done;

      expect(harness.prompts[0]?.prompt[0]).toMatchObject({
        resource: { text: "Original context" },
      });
      expect(
        controller
          .getSnapshot()
          .activities.find((activity) => activity.type === "context"),
      ).toMatchObject({
        content: [
          expect.objectContaining({
            resource: expect.objectContaining({ text: "Original context" }),
          }),
        ],
      });
    } finally {
      await controller.destroy();
      await harness.close();
    }
  });

  it("never auto-approves permission requests", async () => {
    const harness = createV1Harness();
    const controller = createChat({
      connector: harness.connector,
      session: { cwd: "/workspace" },
    });
    await controller.ready;
    const turn = controller.send("permission please");
    await waitFor(() => controller.getSnapshot().interactions.length === 1);
    const interaction = controller.getSnapshot().interactions[0];
    expect(interaction?.type).toBe("permission");
    expect(controller.getSnapshot().phase).toBe("awaiting_user");
    if (interaction?.type === "permission") {
      expect(
        controller.respondPermission(interaction.id, {
          outcome: "selected",
          optionId: "allow-once",
        }),
      ).toBe(true);
      expect(
        controller.respondPermission(interaction.id, { outcome: "cancelled" }),
      ).toBe(false);
    }
    await expect(turn.done).resolves.toEqual({ stopReason: "end_turn" });
    await controller.destroy();
    await harness.close();
  });

  it("resolves pending interactions locally when a turn is cancelled", async () => {
    const harness = createV1Harness();
    const controller = createChat({
      connector: harness.connector,
      session: { cwd: "/workspace" },
    });
    await controller.ready;
    const turn = controller.send("permission please");
    await waitFor(() => controller.getSnapshot().interactions.length === 1);

    await controller.cancel();

    expect(controller.getSnapshot().interactions).toHaveLength(0);
    await expect(turn.done).resolves.toEqual({ stopReason: "cancelled" });
    expect(harness.permissionResponses[0]).toMatchObject({
      outcome: { outcome: "cancelled" },
    });
    await controller.destroy();
    await harness.close();
  });

  it("diagnoses and cancels interactions beyond the visible interaction limit", async () => {
    const events: { type: string; code?: string }[] = [];
    const harness = createV1Harness();
    const controller = createChat({
      connector: harness.connector,
      session: { cwd: "/workspace" },
      onEvent: (event) => events.push(event),
    });
    await controller.ready;
    const turn = controller.send("permission please");
    await waitFor(() => controller.getSnapshot().interactions.length === 1);
    const sink = controller as unknown as {
      onPermission(
        sessionId: string,
        interaction: {
          type: "permission";
          title: string;
          options: readonly [];
        },
        raw: unknown,
      ): Promise<{ outcome: string }>;
    };
    const sessionId = controller.getSnapshot().sessionId!;
    for (let index = 1; index < 16; index += 1) {
      void sink.onPermission(
        sessionId,
        { type: "permission", title: `Permission ${index}`, options: [] },
        {},
      );
    }

    await expect(
      sink.onPermission(
        sessionId,
        { type: "permission", title: "Overflow", options: [] },
        {},
      ),
    ).resolves.toEqual({ outcome: "cancelled" });
    expect(controller.getSnapshot().interactions).toHaveLength(16);
    expect(events).toContainEqual(
      expect.objectContaining({
        type: "diagnostic",
        code: "INTERACTION_LIMIT",
      }),
    );

    await controller.cancel();
    await expect(turn.done).resolves.toEqual({ stopReason: "cancelled" });
    await controller.destroy();
    await harness.close();
  });

  it("ignores and diagnoses session state arriving without an active turn", async () => {
    const events: { type: string; code?: string }[] = [];
    const harness = createV1Harness();
    const controller = createChat({
      connector: harness.connector,
      session: { cwd: "/workspace" },
      onEvent: (event) => events.push(event),
    });
    await controller.ready;
    const sink = controller as unknown as {
      onUpdate(sessionId: string, update: unknown): void;
    };

    sink.onUpdate(controller.getSnapshot().sessionId!, {
      sessionUpdate: "state_update",
      state: "running",
    });

    expect(controller.getSnapshot().phase).toBe("idle");
    expect(events).toContainEqual(
      expect.objectContaining({
        type: "diagnostic",
        code: "STALE_SESSION_STATE",
      }),
    );
    await controller.destroy();
    await harness.close();
  });

  it("diagnoses an unknown-session update without allocating state", async () => {
    const events: { type: string; code?: string; sessionId?: string }[] = [];
    const harness = createV1Harness();
    const controller = createChat({
      connector: harness.connector,
      session: { cwd: "/workspace" },
      onEvent: (event) => events.push(event),
    });
    try {
      await controller.ready;
      const before = controller.getSnapshot().loadedSessions;
      const sink = controller as unknown as {
        onUpdate(sessionId: string, update: unknown): void;
      };

      sink.onUpdate("not-loaded", {
        sessionUpdate: "agent_message_chunk",
        content: { type: "text", text: "untrusted" },
      });

      expect(controller.getSnapshot().loadedSessions).toBe(before);
      expect(events).toContainEqual(
        expect.objectContaining({
          type: "diagnostic",
          code: "UNKNOWN_SESSION_UPDATE",
          sessionId: "not-loaded",
        }),
      );
    } finally {
      await controller.destroy();
      await harness.close();
    }
  });

  it("correlates and resolves a URL elicitation completed by the agent", async () => {
    const gate = deferred<void>();
    const harness = createV1Harness({
      beforeElicitationComplete: () => gate.promise,
    });
    const controller = createChat({
      connector: harness.connector,
      protocol: 1,
      session: { cwd: "/workspace" },
    });
    try {
      await controller.ready;
      const turn = controller.send("url elicitation");
      void turn.done.catch(() => undefined);
      await waitFor(() => controller.getSnapshot().interactions.length === 1);
      expect(controller.getSnapshot().interactions[0]).toMatchObject({
        type: "elicitation",
        mode: "url",
        elicitationId: "agent-url-1",
      });

      gate.resolve();

      await waitFor(() => harness.elicitationResponses.length === 1);
      expect(harness.elicitationResponses[0]).toMatchObject({
        action: "accept",
      });
      await expect(turn.done).resolves.toEqual({ stopReason: "end_turn" });
      expect(controller.getSnapshot().interactions).toHaveLength(0);
    } finally {
      gate.resolve();
      await controller.cancel().catch(() => undefined);
      await controller.destroy();
      await harness.close();
    }
  });

  it("correlates URL completion through the ACP v2 adapter", async () => {
    const gate = deferred<void>();
    const harness = createV2Harness(0, {
      beforeElicitationComplete: () => gate.promise,
    });
    const controller = createChat({
      connector: harness.connector,
      protocol: 2,
      session: { cwd: "/workspace" },
    });
    try {
      await controller.ready;
      const turn = controller.send("url elicitation");
      void turn.done.catch(() => undefined);
      await waitFor(() => controller.getSnapshot().interactions.length === 1);
      expect(controller.getSnapshot().interactions[0]).toMatchObject({
        type: "elicitation",
        elicitationId: "agent-url-v2",
      });

      gate.resolve();

      await waitFor(() => harness.elicitationResponses.length === 1);
      await expect(turn.done).resolves.toEqual({ stopReason: "end_turn" });
    } finally {
      gate.resolve();
      await controller.cancel().catch(() => undefined);
      await controller.destroy();
      await harness.close();
    }
  });

  it("waits for v2 idle instead of resolving on the prompt acknowledgement", async () => {
    const harness = createV2Harness(30);
    const controller = createChat({
      connector: harness.connector,
      protocol: 2,
      session: { cwd: "/workspace" },
    });
    await controller.ready;
    const turn = controller.send("Hello v2");
    let settled = false;
    void turn.done.finally(() => {
      settled = true;
    });
    await new Promise((resolve) => setTimeout(resolve, 5));
    expect(settled).toBe(false);
    await expect(turn.done).resolves.toEqual({ stopReason: "end_turn" });
    const message = controller
      .getSnapshot()
      .activities.find(
        (activity) =>
          activity.type === "message" && activity.role === "assistant",
      );
    expect(message).toMatchObject({
      content: [{ type: "text", text: "Final answer" }],
    });
    expect(
      controller
        .getSnapshot()
        .activities.filter(
          (activity) => activity.type === "message" && activity.role === "user",
        ),
    ).toHaveLength(1);
    await controller.destroy();
    await harness.close();
  });

  it("accepts a v2 turn when idle precedes the prompt acknowledgement", async () => {
    const harness = createV2Harness(0, { idleBeforePromptAck: true });
    const controller = createChat({
      connector: harness.connector,
      protocol: 2,
      session: { cwd: "/workspace" },
    });
    try {
      await controller.ready;

      await expect(controller.send("early idle").done).resolves.toEqual({
        stopReason: "end_turn",
      });

      expect(controller.getSnapshot().phase).toBe("idle");
      expect(
        controller
          .getSnapshot()
          .activities.filter(
            (activity) =>
              activity.type === "message" && activity.role === "user",
          ),
      ).toHaveLength(1);
    } finally {
      await controller.destroy();
      await harness.close();
    }
  });

  it("settles a cancelled v2 turn locally and fences an omitted idle", async () => {
    const harness = createV2Harness(0, {
      cancelWithoutIdle: true,
      omitIdleAfterPrompt: true,
    });
    const controller = createChat({
      connector: harness.connector,
      protocol: 2,
      session: { cwd: "/workspace" },
    });
    try {
      await controller.ready;
      const turn = controller.send("lost idle");
      await waitFor(() => harness.prompts.length === 1);
      await new Promise((resolve) => setTimeout(resolve, 10));

      await controller.cancel();

      await expect(settleWithin(turn.done, 100)).resolves.toEqual({
        stopReason: "cancelled",
      });
      expect(controller.getSnapshot().phase).toBe("cancelling");
      expect(() => controller.send("next turn")).toThrow(
        expect.objectContaining({ code: "SESSION_BUSY" }),
      );

      await controller.reconnect();
      expect(controller.getSnapshot().phase).toBe("idle");
      const next = controller.send("next turn");
      await waitFor(() => harness.prompts.length === 2);
      await new Promise((resolve) => setTimeout(resolve, 10));
      await controller.cancel();
      await expect(settleWithin(next.done, 100)).resolves.toEqual({
        stopReason: "cancelled",
      });
    } finally {
      await controller.destroy();
      await harness.close();
    }
  });

  it("fences a replacement v2 turn until cancellation reaches idle", async () => {
    const harness = createV2Harness(100, {
      cancelIdleDelayMs: 30,
      omitIdleAfterPrompt: true,
    });
    const controller = createChat({
      connector: harness.connector,
      protocol: 2,
      session: { cwd: "/workspace" },
    });
    try {
      await controller.ready;
      const first = controller.send("cancel first");
      await waitFor(() => harness.prompts.length === 1);
      await controller.cancel();
      await expect(first.done).resolves.toEqual({ stopReason: "cancelled" });

      expect(controller.getSnapshot().phase).toBe("cancelling");
      expect(() => controller.send("too early")).toThrow(
        expect.objectContaining({ code: "SESSION_BUSY" }),
      );

      await waitFor(() => controller.getSnapshot().phase === "idle");
      const second = controller.send("after idle");
      await waitFor(() => harness.prompts.length === 2);
      await new Promise((resolve) => setTimeout(resolve, 20));
      let settled = false;
      void second.done.finally(() => {
        settled = true;
      });
      expect(settled).toBe(false);
      await controller.cancel();
      await expect(second.done).resolves.toEqual({ stopReason: "cancelled" });
    } finally {
      await controller.destroy();
      await harness.close();
    }
  });

  it("reconnects a load-only ACP v1 agent to the same session", async () => {
    const harness = createV1Harness({ loadOnly: true });
    const controller = createChat({
      connector: harness.connector,
      protocol: 1,
      session: { cwd: "/workspace" },
    });
    try {
      await controller.ready;
      const sessionId = controller.getSnapshot().sessionId;

      await controller.reconnect();

      expect(controller.getSnapshot().sessionId).toBe(sessionId);
      expect(harness.loadSessionRequests).toBe(1);
      expect(controller.getSnapshot().configOptions).toEqual([
        expect.objectContaining({ id: "model", currentValue: "loaded" }),
      ]);
      expect(
        controller
          .getSnapshot()
          .activities.some(
            (activity) =>
              activity.type === "message" &&
              activity.role === "assistant" &&
              activity.content.some(
                (block) =>
                  block.type === "text" && block.text === "Replayed history",
              ),
          ),
      ).toBe(true);
    } finally {
      await controller.destroy();
      await harness.close();
    }
  });

  it("does not accept a prompt while loaded sessions are reconnecting", async () => {
    const gate = deferred<void>();
    const harness = createV1Harness({
      loadOnly: true,
      beforeLoadSession: () => gate.promise,
    });
    const controller = createChat({
      connector: harness.connector,
      protocol: 1,
      session: { cwd: "/workspace" },
    });
    try {
      await controller.ready;
      const reconnecting = controller.reconnect();
      await waitFor(() => harness.loadSessionRequests === 1);

      expect(() => controller.send("too early")).toThrow(
        expect.objectContaining({ code: "SESSION_NOT_READY" }),
      );

      gate.resolve();
      await reconnecting;
      await expect(controller.send("after reconnect").done).resolves.toEqual({
        stopReason: "end_turn",
      });
    } finally {
      gate.resolve();
      await controller.destroy();
      await harness.close();
    }
  });

  it("restores every loaded session while preserving the selected session", async () => {
    const harness = createV1Harness({ loadOnly: true });
    const controller = createChat({
      connector: harness.connector,
      protocol: 1,
      session: { cwd: "/workspace" },
    });
    try {
      await controller.ready;
      const firstSessionId = controller.getSnapshot().sessionId!;
      await controller.send("first before reconnect").done;
      await controller.newSession();
      const secondSessionId = controller.getSnapshot().sessionId!;
      await controller.send("second before reconnect").done;

      await controller.reconnect();

      expect(controller.getSnapshot().sessionId).toBe(secondSessionId);
      expect(controller.getSnapshot().loadedSessions).toHaveLength(2);
      expect(harness.loadSessionRequests).toBe(2);
      expect(messageText(controller.getSnapshot(), "user")).toContain(
        "second before reconnect",
      );

      await controller.openSession(firstSessionId);
      expect(messageText(controller.getSnapshot(), "user")).toContain(
        "first before reconnect",
      );
      expect(messageText(controller.getSnapshot(), "user")).not.toContain(
        "second before reconnect",
      );
    } finally {
      await controller.destroy();
      await harness.close();
    }
  });

  it("uses a fresh v1 connection when auto negotiation selects v1", async () => {
    const harness = createV1Harness();
    const controller = createChat({
      connector: harness.connector,
      protocol: "auto",
      session: { cwd: "/workspace" },
    });
    await controller.ready;
    expect(controller.getSnapshot().protocolVersion).toBe(1);
    expect(harness.attempts).toEqual([
      { protocol: 2, attempt: 1 },
      { protocol: 1, attempt: 2 },
    ]);
    await controller.destroy();
    await harness.close();
  });
});

async function waitFor(
  condition: () => boolean,
  timeout = 1000,
): Promise<void> {
  const started = Date.now();
  while (!condition()) {
    if (Date.now() - started > timeout)
      throw new Error("Timed out waiting for condition");
    await new Promise((resolve) => setTimeout(resolve, 1));
  }
}

function testContextProvider(
  selection: readonly ContextSelectionItem[],
  resolve: (
    request: ContextRequest,
  ) => readonly ContextItem[] | Promise<readonly ContextItem[]>,
): ContextProvider {
  return {
    getSelection: () => selection,
    subscribe: () => () => undefined,
    resolve,
  };
}

function deferred<Value>() {
  let resolve!: (value: Value | PromiseLike<Value>) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<Value>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

async function settleWithin<Value>(
  promise: Promise<Value>,
  timeoutMs: number,
): Promise<Value> {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<never>((_resolve, reject) => {
        timeout = setTimeout(
          () => reject(new Error("Promise did not settle")),
          timeoutMs,
        );
      }),
    ]);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

function messageText(
  snapshot: ReturnType<ReturnType<typeof createChat>["getSnapshot"]>,
  role: "user" | "assistant" | "thought",
): string {
  return snapshot.activities
    .filter((activity) => activity.type === "message" && activity.role === role)
    .flatMap((activity) =>
      activity.type === "message"
        ? activity.content.flatMap((block) =>
            block.type === "text" ? [block.text] : [],
          )
        : [],
    )
    .join("\n");
}
