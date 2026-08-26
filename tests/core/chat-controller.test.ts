import { createChat } from "../../src/core/index.js";
import { createV1Harness, createV2Harness } from "../helpers/agents.js";

describe("ChatController protocol interface", () => {
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
      expect(observed).toHaveBeenCalledTimes(2);
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
      context: async () => {
        contextStarted = true;
        return gate.promise;
      },
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
      await expect(
        controller.openChildSession("other-child"),
      ).rejects.toMatchObject({ code: "SESSION_BUSY" });
      gate.resolve();
      await opening;
      expect(controller.getSnapshot()).toMatchObject({
        sessionId: "slow-child",
        sessionTrail: [{ sessionId: rootSessionId }],
      });
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
      expect(controller.getSnapshot().sessionId).toBeUndefined();
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

  it("rejects an overlapping session-list request before issuing it", async () => {
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

      await expect(controller.listSessions()).rejects.toMatchObject({
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
      "pretty-aui/context": { id: "page", label: "Current page" },
    });
    await controller.destroy();
    await harness.close();
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

  it("settles a cancelled v2 turn locally when the agent omits its idle update", async () => {
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
