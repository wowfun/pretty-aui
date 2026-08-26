// @vitest-environment node

import { renderToString } from "react-dom/server";
import { Chat } from "../../src/react/Chat.js";
import { FakeChatController } from "../helpers/controller.js";

vi.mock("marked", () => ({
  Marked: class {
    use() {}

    parse() {
      return '<form><input name="owned"><script>alert(1)</script></form><p>answer</p>';
    }
  },
  Renderer: class {},
}));

describe("React server-rendered Markdown sanitizer", () => {
  it("sanitizes parser output even when a renderer defense regresses", () => {
    const controller = new FakeChatController({
      activities: [
        {
          type: "message",
          id: "answer",
          role: "assistant",
          content: [{ type: "text", text: "agent answer" }],
        },
      ],
    });

    const html = renderToString(<Chat controller={controller} />);

    expect(html).toContain("answer");
    expect(html).not.toMatch(/<(?:form|input|script)\b/i);
  });
});
