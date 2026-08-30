import type { ChatToolCall } from "../../src/core/types.js";
import {
  deriveToolBlock,
  formatToolValue,
} from "../../src/react/tool-block-model.js";

describe("tool block presentation model", () => {
  it.each(["pending", "in_progress"])(
    "derives a running Execute terminal for %s",
    (status) => {
      const model = deriveToolBlock(
        tool({
          kind: "execute",
          status,
          rawInput: { command: "pwd\nls -la", cwd: "/workspace" },
        }),
      );

      expect(model).toMatchObject({
        kind: "terminal",
        command: "pwd\nls -la",
        cwd: "/workspace",
        output: "",
        running: true,
        failed: false,
      });
    },
  );

  it.each([
    ["completed", false],
    ["failed", true],
    ["cancelled", true],
  ])("derives a settled Execute terminal for %s", (status, failed) => {
    const media = {
      type: "content",
      content: { type: "image", mimeType: "image/png", data: "AA==" },
    };
    const model = deriveToolBlock(
      tool({
        kind: "execute",
        status,
        rawInput: { cmd: "printf ok", workdir: "/tmp" },
        rawOutput: { output: "ignored raw output" },
        content: [
          {
            type: "content",
            content: { type: "text", text: "\u001b[32mok\u001b[0m" },
          },
          media,
        ],
      }),
    );

    expect(model).toMatchObject({
      kind: "terminal",
      command: "printf ok",
      cwd: "/tmp",
      output: "\u001b[32mok\u001b[0m",
      displayOutput: "ok",
      running: false,
      failed,
      supplementary: [media],
    });
  });

  it("falls back from an ambiguous Execute without a command", () => {
    expect(
      deriveToolBlock(
        tool({
          kind: "execute",
          rawInput: { script: "echo unsafe guess" },
          rawOutput: { output: "result" },
        }),
      ),
    ).toMatchObject({ kind: "io" });
  });

  it("derives an explicit file Read with the correct line window", () => {
    const model = deriveToolBlock(
      tool({
        kind: "read",
        title: "Read LICENSE",
        rawInput: { filePath: "/workspace/LICENSE", offset: 13 },
        rawOutput: {
          metadata: {
            display: { type: "file", text: "alpha\nbeta\ngamma\n" },
          },
        },
      }),
    );

    expect(model).toEqual({
      kind: "read",
      label: "Read LICENSE",
      lines: [
        { number: 13, text: "alpha" },
        { number: 14, text: "beta" },
        { number: 15, text: "gamma" },
      ],
      copyText: "alpha\nbeta\ngamma",
      supplementary: [],
    });
  });

  it("separates a strict numbered Read window from its gutter", () => {
    const model = deriveToolBlock(
      tool({
        kind: "read",
        title: "Read source",
        content: [
          {
            type: "content",
            content: { type: "text", text: "21: first\n22: second" },
          },
        ],
      }),
    );

    expect(model).toMatchObject({
      kind: "read",
      lines: [
        { number: 21, text: "first" },
        { number: 22, text: "second" },
      ],
      copyText: "first\nsecond",
    });
  });

  it.each([
    {
      rawOutput: {
        metadata: { display: { type: "directory", text: "a\nb" } },
      },
    },
    { content: [{ type: "content", content: { type: "text", text: "a\nb" } }] },
  ])("falls back from a non-file or ambiguous Read", (fields) => {
    expect(
      deriveToolBlock(tool({ kind: "read", title: "Read", ...fields })),
    ).toMatchObject({ kind: "io" });
  });

  it("derives ACP v1 Diff rows and preserves supplementary content", () => {
    const note = {
      type: "content",
      content: { type: "text", text: "Applied cleanly" },
    };
    const model = deriveToolBlock(
      tool({
        kind: "edit",
        content: [
          {
            type: "diff",
            path: "/workspace/a.ts",
            oldText: "old one\nold two",
            newText: "new one",
          },
          note,
        ],
      }),
    );

    expect(model).toMatchObject({
      kind: "diff",
      added: 1,
      removed: 2,
      files: 1,
      supplementary: [note],
    });
    expect(model.kind === "diff" ? model.copyText : "").toContain(
      "/workspace/a.ts",
    );
  });

  it.each([
    "--- a/a.ts\n+++ b/a.ts\n-old\n+new",
    { text: "--- a/a.ts\n+++ b/a.ts\n-old\n+new" },
  ])("derives ACP v2 Diff from a patch shape", (patch) => {
    const model = deriveToolBlock(
      tool({
        content: [
          {
            type: "diff",
            changes: [{ operation: "modify", path: "a.ts" }],
            patch,
          },
        ],
      }),
    );

    expect(model).toMatchObject({
      kind: "diff",
      added: 1,
      removed: 1,
      files: 1,
      copyText: "--- a/a.ts\n+++ b/a.ts\n-old\n+new",
    });
  });

  it("falls back from a malformed Diff without dropping its payload", () => {
    const malformed = { type: "diff", changes: [{ path: "a.ts" }] };
    expect(deriveToolBlock(tool({ content: [malformed] }))).toEqual({
      kind: "io",
      output: { values: [malformed], copyText: "" },
    });
  });

  it.each([
    { type: "diff", path: "", oldText: "old", newText: "new" },
    {
      type: "diff",
      changes: [{ operation: "modify", path: "" }],
      patch: "-old\n+new",
    },
  ])("falls back from a Diff without a trustworthy path", (malformed) => {
    expect(deriveToolBlock(tool({ content: [malformed] }))).toEqual({
      kind: "io",
      output: { values: [malformed], copyText: "" },
    });
  });

  it("prefers normalized content in generic OUT and bounds opaque text", () => {
    const content = {
      type: "content",
      content: { type: "text", text: "normalized" },
    };
    expect(
      deriveToolBlock(
        tool({ rawInput: "in", rawOutput: "opaque", content: [content] }),
      ),
    ).toEqual({
      kind: "io",
      input: { text: "in", copyText: "in" },
      output: { values: [content], copyText: "normalized" },
    });
    expect(formatToolValue("x".repeat(100_001))).toHaveLength(100_000);
  });
});

function tool(fields: Partial<ChatToolCall>): ChatToolCall {
  return {
    type: "tool",
    id: "tool-1",
    title: "Tool",
    status: "completed",
    content: [],
    locations: [],
    ...fields,
  };
}
