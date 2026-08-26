// @vitest-environment node

import { renderToString } from "react-dom/server";
import { Chat, ChatRoot } from "../../src/react/Chat.js";
import { FakeChatController } from "../helpers/controller.js";

describe("React server rendering", () => {
  it("renders borrowed-controller Markdown without a browser DOM", () => {
    const controller = new FakeChatController({
      activities: [
        {
          type: "message",
          id: "answer",
          role: "assistant",
          content: [{ type: "text", text: "**Server answer**" }],
        },
      ],
    });

    expect(renderToString(<Chat controller={controller} />)).toContain(
      "Server answer",
    );
  });

  it("renders GFM task markers without agent-controlled form controls", () => {
    const controller = new FakeChatController({
      activities: [
        {
          type: "message",
          id: "tasks",
          role: "assistant",
          content: [{ type: "text", text: "- [ ] pending\n- [x] complete" }],
        },
      ],
    });

    const html = renderToString(<Chat controller={controller} />);

    expect(html).not.toContain("<input");
    expect(html).toContain("[ ]");
    expect(html).toContain("[x]");
  });

  it("keeps all active Markdown sinks inert without a server DOM", () => {
    const controller = new FakeChatController({
      activities: [
        {
          type: "message",
          id: "hostile-markdown",
          role: "assistant",
          content: [
            {
              type: "text",
              text: [
                '<form><input name="x"><script>alert(1)</script></form>',
                "![pixel](https://evil.example/pixel)",
                "[unsafe](javascript:alert(1))",
                "[safe](https://example.com)",
              ].join("\n\n"),
            },
          ],
        },
      ],
    });

    const html = renderToString(<Chat controller={controller} />);

    expect(html).not.toMatch(/<(?:form|input|script|img)\b/i);
    expect(html).not.toContain('href="javascript:');
    expect(html).toContain(
      'href="https://example.com" target="_blank" rel="noopener noreferrer"',
    );
  });

  it("preserves manual-composition children in the owned connecting shell", () => {
    const html = renderToString(
      <ChatRoot
        options={{
          connector: {
            open() {
              throw new Error("SSR must not open a transport");
            },
          },
          session: { cwd: "/ssr" },
        }}
      >
        <span>Host composition</span>
      </ChatRoot>,
    );

    expect(html).toContain("Host composition");
  });
});
