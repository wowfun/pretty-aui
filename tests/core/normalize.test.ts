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
