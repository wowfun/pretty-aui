import {
  asHttpUrl,
  normalizeConfigOptions,
  normalizeContent,
  normalizeUsage,
  TimelineStore,
} from "../../src/core/protocol/normalize.js";

describe("TimelineStore", () => {
  it("bounds retained activities to the newest 1,000 items", () => {
    const timeline = new TimelineStore();
    for (let index = 0; index < 1_100; index += 1) {
      timeline.reduce(
        {
          sessionUpdate: "agent_message",
          messageId: `message-${index}`,
          content: [{ type: "text", text: String(index) }],
        },
        2,
      );
    }

    expect(timeline.activities).toHaveLength(1_000);
    expect(timeline.activities[0]?.id).toBe("message:assistant:message-100");
    expect(timeline.activities.at(-1)?.id).toBe(
      "message:assistant:message-1099",
    );
  });

  it("keeps 64 transient notices without consuming the Agent activity budget", () => {
    const timeline = new TimelineStore();
    for (let index = 0; index < 1_000; index += 1) {
      timeline.reduce(
        {
          sessionUpdate: "agent_message",
          messageId: `message-${index}`,
          content: [{ type: "text", text: String(index) }],
        },
        2,
      );
    }
    for (let index = 0; index < 70; index += 1) {
      timeline.addNotice({
        type: "notice",
        id: `notice-${index}`,
        text: String(index),
        level: "info",
      });
    }

    const activities = timeline.activities;
    expect(
      activities.filter((activity) => activity.type !== "notice"),
    ).toHaveLength(1_000);
    const notices = activities.filter((activity) => activity.type === "notice");
    expect(notices).toHaveLength(64);
    expect(notices[0]?.id).toBe("notice-6");
    expect(notices.at(-1)?.id).toBe("notice-69");
    expect(activities[0]?.id).toBe("message:assistant:message-0");
  });

  it("drops transient notices with a full timeline reset", () => {
    const timeline = new TimelineStore();
    timeline.addNotice({
      type: "notice",
      id: "notice-1",
      text: "Connected",
      level: "info",
    });

    timeline.reset();

    expect(timeline.activities).toEqual([]);
  });

  it("caps a streamed text content block at 1 MiB", () => {
    const timeline = new TimelineStore();
    timeline.reduce(
      {
        sessionUpdate: "agent_message_chunk",
        messageId: "large-message",
        content: { type: "text", text: "x".repeat(1024 * 1024 + 1_000) },
      },
      2,
    );

    const message = timeline.activities[0];
    expect(message).toMatchObject({ type: "message" });
    if (message?.type !== "message") throw new Error("Message was not kept");
    expect(message.content[0]).toMatchObject({ type: "text" });
    expect((message.content[0] as { text: string }).text).toHaveLength(
      1024 * 1024,
    );
  });

  it("reduces 1 MiB of terminal output incrementally", () => {
    const timeline = new TimelineStore();
    const content = Buffer.alloc(1024 * 1024, 120);
    const chunkSize = Math.ceil(content.byteLength / 4_000);
    const started = performance.now();

    for (let offset = 0; offset < content.byteLength; offset += chunkSize) {
      timeline.reduce(
        {
          sessionUpdate: "terminal_output_chunk",
          terminalId: "terminal-1",
          data: content
            .subarray(offset, Math.min(offset + chunkSize, content.byteLength))
            .toString("base64"),
        },
        2,
      );
    }

    const elapsed = performance.now() - started;
    expect(timeline.activities[0]).toMatchObject({
      type: "terminal",
      output: "x".repeat(1024 * 1024),
    });
    expect(elapsed).toBeLessThan(2_000);
  });

  it("stops accepting terminal output after the per-terminal chunk budget", () => {
    const timeline = new TimelineStore();
    timeline.reduce(
      {
        sessionUpdate: "terminal_output_chunk",
        terminalId: "terminal-1",
        data: Buffer.alloc(1024 * 1024, 120).toString("base64"),
      },
      2,
    );
    for (let index = 1; index < 4_096; index += 1) {
      timeline.reduce(
        {
          sessionUpdate: "terminal_output_chunk",
          terminalId: "terminal-1",
          data: Buffer.from("y").toString("base64"),
        },
        2,
      );
    }
    timeline.reduce(
      {
        sessionUpdate: "terminal_output_chunk",
        terminalId: "terminal-1",
        data: Buffer.from("sentinel").toString("base64"),
      },
      2,
    );

    expect(timeline.activities[0]).toMatchObject({ type: "terminal" });
    const terminal = timeline.activities[0];
    if (terminal?.type !== "terminal") throw new Error("Terminal was not kept");
    expect(terminal.output.endsWith("sentinel")).toBe(false);
  });

  it("rejects active URI schemes while preserving supported resources", () => {
    expect(
      normalizeContent([
        { type: "resource_link", name: "bad", uri: "javascript:alert(1)" },
        { type: "resource", resource: { uri: "data:text/html,bad" } },
        { type: "resource_link", name: "web", uri: "https://example.com/x" },
        { type: "resource", resource: { uri: "file:///workspace/a.ts" } },
      ]),
    ).toEqual([
      {
        type: "resource_link",
        name: "web",
        uri: "https://example.com/x",
      },
      { type: "resource", resource: { uri: "file:///workspace/a.ts" } },
    ]);
  });

  it("retains only valid reserved context metadata for replay recovery", () => {
    const contextMeta = {
      "pretty-aui/context": {
        version: 1,
        id: "trial",
        label: "Evaluation trial",
      },
    };
    expect(
      normalizeContent([
        {
          type: "resource",
          resource: { uri: "peval://source/trial", text: "evidence" },
          _meta: contextMeta,
        },
        {
          type: "resource_link",
          name: "inert identifier",
          uri: "javascript:alert(1)",
          _meta: contextMeta,
        },
        {
          type: "text",
          text: "ordinary",
          _meta: { untrusted: { active: true } },
        },
        {
          type: "resource",
          resource: { uri: "javascript:alert(1)" },
          _meta: {
            "pretty-aui/context": { version: 1, id: "", label: "invalid" },
          },
        },
        {
          type: "resource_link",
          name: "invalid-version",
          uri: "javascript:alert(1)",
          _meta: {
            "pretty-aui/context": {
              version: "1",
              id: "trial",
              label: "invalid",
            },
          },
        },
      ]),
    ).toEqual([
      {
        type: "resource",
        resource: { uri: "peval://source/trial", text: "evidence" },
        _meta: contextMeta,
      },
      {
        type: "resource_link",
        name: "inert identifier",
        uri: "javascript:alert(1)",
        _meta: contextMeta,
      },
      { type: "text", text: "ordinary" },
    ]);
  });

  it("accepts only absolute web URLs for active agent flows", () => {
    expect(asHttpUrl("https://example.com/finish")).toBe(
      "https://example.com/finish",
    );
    expect(asHttpUrl("javascript:alert(1)")).toBeUndefined();
    expect(asHttpUrl("file:///workspace/secret")).toBeUndefined();
    expect(asHttpUrl("/relative")).toBeUndefined();
  });

  it("rejects non-finite or negative usage values", () => {
    expect(normalizeUsage({ used: Number.NaN, size: 10 })).toBeUndefined();
    expect(
      normalizeUsage({ used: 1, size: Number.POSITIVE_INFINITY }),
    ).toBeUndefined();
    expect(normalizeUsage({ used: -1, size: 10 })).toBeUndefined();
    expect(
      normalizeUsage({
        used: 1,
        size: 10,
        cost: { amount: Number.NEGATIVE_INFINITY, currency: "USD" },
      }),
    ).toEqual({ used: 1, size: 10 });
  });

  it("bounds retained config values, currencies, and unsupported diagnostics", () => {
    const huge = "x".repeat(32 * 1024);
    expect(
      normalizeConfigOptions([
        { id: "model", type: "select", currentValue: huge },
      ])[0]?.currentValue,
    ).toHaveLength(16 * 1024);
    expect(
      normalizeUsage({
        used: 1,
        size: 2,
        cost: { amount: 3, currency: huge },
      })?.cost?.currency,
    ).toHaveLength(16 * 1024);
    const timeline = new TimelineStore();
    expect(
      timeline.reduce({ sessionUpdate: huge }, 2).unsupported,
    ).toHaveLength(16 * 1024);
  });

  it("rejects negative zero in usage fields", () => {
    expect(normalizeUsage({ used: -0, size: 1 })).toBeUndefined();
    expect(normalizeUsage({ used: 1, size: -0 })).toBeUndefined();
    expect(
      normalizeUsage({
        used: 1,
        size: 2,
        cost: { amount: -0, currency: "USD" },
      }),
    ).toEqual({ used: 1, size: 2 });
  });

  it("does not leave a dangling surrogate when truncating text", () => {
    const text = `${"x".repeat(1024 * 1024 - 1)}😀`;
    const [block] = normalizeContent([{ type: "text", text }]);
    expect(block).toEqual({ type: "text", text: "x".repeat(1024 * 1024 - 1) });
  });

  it("shares one structured-node budget across tool collection items", () => {
    const timeline = new TimelineStore();
    timeline.reduce(
      {
        sessionUpdate: "tool_call",
        toolCallId: "wide-structured-content",
        content: Array.from({ length: 256 }, (_, outer) =>
          Array.from({ length: 32 }, (_, inner) => ({ outer, inner })),
        ),
      },
      2,
    );

    const tool = timeline.activities[0];
    expect(tool?.type).toBe("tool");
    if (tool?.type !== "tool") throw new Error("Tool was not retained");
    expect(countStructuredNodes(tool.content)).toBeLessThanOrEqual(4_096);
  });

  it("coalesces adjacent streamed text chunks into one message block", () => {
    const timeline = new TimelineStore();
    timeline.beginTurn();

    for (const text of ["Which workspace", " are you in?"]) {
      timeline.reduce(
        {
          sessionUpdate: "agent_thought_chunk",
          messageId: "thought-1",
          content: { type: "text", text },
        },
        1,
      );
    }

    expect(timeline.activities).toEqual([
      {
        type: "message",
        id: expect.any(String),
        role: "thought",
        content: [{ type: "text", text: "Which workspace are you in?" }],
      },
    ]);
  });

  it("retains the newest text when a streamed message exceeds its budget", () => {
    const timeline = new TimelineStore();
    timeline.reduce(
      {
        sessionUpdate: "agent_message_chunk",
        messageId: "long-stream",
        content: { type: "text", text: "a".repeat(1024 * 1024) },
      },
      2,
    );
    timeline.reduce(
      {
        sessionUpdate: "agent_message_chunk",
        messageId: "long-stream",
        content: { type: "text", text: "FINAL CONCLUSION" },
      },
      2,
    );

    const message = timeline.activities[0];
    if (message?.type !== "message") throw new Error("Message was not kept");
    expect((message.content[0] as { text: string }).text).toHaveLength(
      1024 * 1024,
    );
    expect((message.content[0] as { text: string }).text).toMatch(
      /FINAL CONCLUSION$/,
    );
  });

  it("keeps thought and assistant output separate when a wire ID is shared", () => {
    const timeline = new TimelineStore();
    timeline.beginTurn();

    timeline.reduce(
      {
        sessionUpdate: "agent_thought_chunk",
        messageId: "shared-message",
        content: { type: "text", text: "Checking the workspace." },
      },
      1,
    );
    timeline.reduce(
      {
        sessionUpdate: "agent_message_chunk",
        messageId: "shared-message",
        content: { type: "text", text: "/workspace/pretty-aui" },
      },
      1,
    );

    const messages = timeline.activities.filter(
      (activity) => activity.type === "message",
    );
    expect(messages).toMatchObject([
      {
        role: "thought",
        content: [{ type: "text", text: "Checking the workspace." }],
      },
      {
        role: "assistant",
        content: [{ type: "text", text: "/workspace/pretty-aui" }],
      },
    ]);
    expect(new Set(messages.map((message) => message.id)).size).toBe(2);
  });

  it("preserves a reliable local user timestamp through ACP echoes", () => {
    const v1Timeline = new TimelineStore();
    v1Timeline.addUserMessage(
      [{ type: "text", text: "local v1" }],
      true,
      1_000,
    );
    v1Timeline.reduce(
      {
        sessionUpdate: "user_message_chunk",
        messageId: "v1-user",
        content: { type: "text", text: "local v1" },
      },
      1,
    );

    const v2Timeline = new TimelineStore();
    v2Timeline.addUserMessage(
      [{ type: "text", text: "local v2" }],
      true,
      2_000,
    );
    v2Timeline.reduce(
      {
        sessionUpdate: "user_message",
        messageId: "v2-user",
        content: [{ type: "text", text: "local v2" }],
      },
      2,
    );

    expect(v1Timeline.activities[0]).toMatchObject({ timestamp: 1_000 });
    expect(v2Timeline.activities[0]).toMatchObject({ timestamp: 2_000 });
  });

  it("retains Agent user updates after the canonical local turn settles", () => {
    const timeline = new TimelineStore();
    timeline.addUserMessage(
      [{ type: "text", text: "local prompt" }],
      true,
      1_000,
    );
    timeline.reduce(
      {
        sessionUpdate: "user_message",
        messageId: "local-echo",
        content: [{ type: "text", text: "local prompt" }],
      },
      2,
    );
    timeline.reduce(
      {
        sessionUpdate: "agent_message",
        messageId: "answer",
        content: [{ type: "text", text: "answer" }],
      },
      2,
    );
    timeline.finishTurn(2_000);

    timeline.reduce(
      {
        sessionUpdate: "user_message",
        messageId: "later-user",
        content: [{ type: "text", text: "later user update" }],
      },
      2,
    );

    expect(
      timeline.activities.flatMap((activity) =>
        activity.type === "message" && activity.role === "user"
          ? [activity.content]
          : [],
      ),
    ).toEqual([
      [{ type: "text", text: "local prompt" }],
      [{ type: "text", text: "later user update" }],
    ]);
  });

  it("keeps the active canonical user in place at activity capacity", () => {
    const echoes = [
      {
        protocol: 1 as const,
        update: {
          sessionUpdate: "user_message_chunk",
          messageId: "wire-v1-user",
          content: { type: "text", text: "locally submitted" },
        },
      },
      {
        protocol: 2 as const,
        update: {
          sessionUpdate: "user_message",
          messageId: "wire-v2-user",
          content: [{ type: "text", text: "locally submitted" }],
        },
      },
    ];

    for (const { protocol, update } of echoes) {
      const timeline = new TimelineStore();
      timeline.addUserMessage(
        [{ type: "text", text: "locally submitted" }],
        true,
        1_000,
      );
      for (let index = 0; index < 1_000; index += 1) {
        timeline.reduce(
          {
            sessionUpdate: "agent_message",
            messageId: `capacity-${index}`,
            content: [{ type: "text", text: String(index) }],
          },
          2,
        );
      }

      expect(timeline.activities).toHaveLength(1_000);
      expect(timeline.activities[0]).toMatchObject({
        role: "user",
        content: [{ type: "text", text: "locally submitted" }],
        timestamp: 1_000,
      });
      expect(timeline.activities[1]?.id).toBe("message:assistant:capacity-1");

      timeline.reduce(update, protocol);

      expect(timeline.activities[0]).toMatchObject({
        role: "user",
        content: [{ type: "text", text: "locally submitted" }],
        timestamp: 1_000,
      });
    }
  });

  it("omits invalid local event times at the timeline boundary", () => {
    const timeline = new TimelineStore();
    for (const timestamp of [-1, Number.NaN, Infinity, 8.64e15 + 1]) {
      timeline.addUserMessage(
        [{ type: "text", text: String(timestamp) }],
        false,
        timestamp,
      );
    }
    expect(
      timeline.activities.every(
        (activity) =>
          activity.type !== "message" || activity.timestamp === undefined,
      ),
    ).toBe(true);

    const answerTimeline = new TimelineStore();
    answerTimeline.addUserMessage([{ type: "text", text: "question" }], false);
    answerTimeline.reduce(
      {
        sessionUpdate: "agent_message",
        messageId: "answer",
        content: [{ type: "text", text: "answer" }],
      },
      2,
    );
    answerTimeline.markFinalAnswer(Number.NaN);
    expect(answerTimeline.activities.at(-1)).not.toHaveProperty("timestamp");
  });

  it("timestamps only the final live answer when explicitly completed", () => {
    const timeline = new TimelineStore();
    timeline.addUserMessage([{ type: "text", text: "question" }], false);
    timeline.reduce(
      {
        sessionUpdate: "agent_message_chunk",
        messageId: "intermediate",
        content: { type: "text", text: "intermediate" },
      },
      2,
    );
    timeline.reduce(
      {
        sessionUpdate: "agent_message",
        messageId: "final",
        content: [{ type: "text", text: "final" }],
      },
      2,
    );

    expect(
      timeline.activities.filter((activity) => activity.type === "message"),
    ).toEqual([
      expect.not.objectContaining({ timestamp: expect.anything() }),
      expect.not.objectContaining({ timestamp: expect.anything() }),
      expect.not.objectContaining({ timestamp: expect.anything() }),
    ]);

    timeline.markFinalAnswer(3_000);

    expect(timeline.activities[1]).not.toHaveProperty("timestamp");
    expect(timeline.activities[2]).toMatchObject({ timestamp: 3_000 });
  });

  it("normalizes an OpenCode task as a subagent and adds its settled child session", () => {
    const timeline = new TimelineStore();
    timeline.reduce(
      {
        sessionUpdate: "tool_call",
        toolCallId: "task-1",
        title: "Inspect the client",
        kind: "think",
        status: "pending",
        rawInput: {
          description: "Inspect the client",
          prompt: "Read the client packages and report their structure.",
          subagent_type: "explore",
        },
      },
      1,
    );

    expect(timeline.activities).toEqual([
      expect.objectContaining({
        type: "tool",
        id: "tool:task-1",
        subagent: {
          agent: "explore",
          description: "Inspect the client",
          background: false,
        },
      }),
    ]);

    timeline.reduce(
      {
        sessionUpdate: "tool_call_update",
        toolCallId: "task-1",
        status: "completed",
        rawOutput: {
          output: "Done",
          metadata: {
            sessionId: "child-session-1",
            background: false,
          },
        },
      },
      1,
    );

    expect(timeline.activities[0]).toMatchObject({
      type: "tool",
      status: "completed",
      subagent: {
        agent: "explore",
        description: "Inspect the client",
        sessionId: "child-session-1",
        background: false,
      },
    });
  });

  it("uses settled task metadata over a resumed child and records background intent", () => {
    const timeline = new TimelineStore();
    timeline.reduce(
      {
        sessionUpdate: "tool_call",
        toolCallId: "task-resume",
        title: "Continue review",
        kind: "think",
        status: "in_progress",
        rawInput: {
          description: "Continue review",
          prompt: "Continue reviewing the patch.",
          subagent_type: "review",
          task_id: "old-child",
          background: true,
        },
      },
      2,
    );
    expect(timeline.activities[0]).toMatchObject({
      subagent: {
        agent: "review",
        sessionId: "old-child",
        background: true,
      },
    });

    timeline.reduce(
      {
        sessionUpdate: "tool_call_update",
        toolCallId: "task-resume",
        status: "completed",
        rawOutput: {
          metadata: { sessionId: "actual-child", background: true },
        },
      },
      2,
    );
    expect(timeline.activities[0]).toMatchObject({
      subagent: { sessionId: "actual-child", background: true },
    });
  });

  it("does not create child navigation from generic or invalid task data", () => {
    const timeline = new TimelineStore();
    timeline.reduce(
      {
        sessionUpdate: "tool_call",
        toolCallId: "generic-think",
        title: "Analyze",
        kind: "think",
        status: "in_progress",
        rawInput: { prompt: "Analyze without delegating." },
      },
      2,
    );
    timeline.reduce(
      {
        sessionUpdate: "tool_call",
        toolCallId: "incomplete-task-shape",
        title: "Delegate",
        kind: "think",
        status: "in_progress",
        rawInput: {
          prompt: "Missing the required short description.",
          subagent_type: "explore",
        },
      },
      2,
    );
    timeline.reduce(
      {
        sessionUpdate: "tool_call",
        toolCallId: "oversized-child",
        title: "Delegate",
        kind: "think",
        status: "completed",
        rawInput: {
          description: "Delegate this work",
          prompt: "Delegate this work.",
          subagent_type: "explore",
        },
        rawOutput: {
          metadata: { sessionId: "x".repeat(16 * 1024 + 1) },
        },
      },
      2,
    );

    expect(timeline.activities[0]).not.toHaveProperty("subagent");
    expect(timeline.activities[1]).not.toHaveProperty("subagent");
    expect(timeline.activities[2]).toMatchObject({
      subagent: { agent: "explore", background: false },
    });
    expect(timeline.activities[2]).not.toHaveProperty("subagent.sessionId");
  });

  it("keeps Agent semantics without inventing navigation from malformed settled metadata", () => {
    const timeline = new TimelineStore();
    timeline.reduce(
      {
        sessionUpdate: "tool_call",
        toolCallId: "failed-task",
        title: "Review the patch",
        kind: "think",
        status: "in_progress",
        rawInput: {
          prompt: "Review the patch carefully.",
          description: "Review the patch",
          subagent_type: "review",
        },
      },
      2,
    );
    timeline.reduce(
      {
        sessionUpdate: "tool_call_update",
        toolCallId: "failed-task",
        status: "failed",
        rawOutput: { metadata: { sessionId: 42, background: "yes" } },
      },
      2,
    );

    expect(timeline.activities[0]).toMatchObject({
      status: "failed",
      rawInput: {
        description: "Review the patch",
        subagent_type: "review",
      },
      subagent: {
        agent: "review",
        description: "Review the patch",
        background: false,
      },
    });
    expect(timeline.activities[0]).not.toHaveProperty("subagent.sessionId");
  });

  it("starts a new anonymous v1 message at each turn boundary", () => {
    const timeline = new TimelineStore();
    timeline.beginTurn();
    timeline.addUserMessage([{ type: "text", text: "one" }], false);
    timeline.reduce(
      {
        sessionUpdate: "agent_message_chunk",
        content: { type: "text", text: "First" },
      },
      1,
    );

    timeline.beginTurn();
    timeline.addUserMessage([{ type: "text", text: "two" }], false);
    timeline.reduce(
      {
        sessionUpdate: "agent_message_chunk",
        content: { type: "text", text: "Second" },
      },
      1,
    );

    const replies = timeline.activities.filter(
      (activity) =>
        activity.type === "message" && activity.role === "assistant",
    );
    expect(replies).toHaveLength(2);
    expect(replies[0]?.id).not.toBe(replies[1]?.id);
  });
});

function countStructuredNodes(value: unknown): number {
  if (value === null || typeof value !== "object") return 1;
  if (Array.isArray(value)) {
    return (
      1 + value.reduce((total, item) => total + countStructuredNodes(item), 0)
    );
  }
  return (
    1 +
    Object.values(value).reduce(
      (total, item) => total + countStructuredNodes(item),
      0,
    )
  );
}
