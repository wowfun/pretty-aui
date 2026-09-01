import { StrictMode, useState } from "react";
import { addHook, removeHook } from "isomorphic-dompurify";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import {
  Chat,
  ChatComposer,
  ChatHeader,
  ChatInteractions,
  ChatRoot,
  ChatTranscript,
  formatSessionAge,
} from "../../src/react/Chat.js";
import { formatMessageTimestamp } from "../../src/react/MessageActions.js";
import type {
  ChatActivity,
  ChatSnapshot,
  ChatToolCall,
  SessionPage,
} from "../../src/core/index.js";
import { createV1Harness } from "../helpers/agents.js";
import { FakeChatController } from "../helpers/controller.js";

describe("Chat composition", () => {
  it("uses one root subscription for a manual composition", () => {
    const controller = new FakeChatController();
    const view = render(
      <ChatRoot controller={controller}>
        <ChatHeader />
        <aside>Host-owned region</aside>
        <ChatTranscript />
        <ChatInteractions />
        <ChatComposer />
      </ChatRoot>,
    );

    expect(screen.getByText("Host-owned region")).toBeInTheDocument();
    expect(controller.subscribeCalls).toBe(1);
    expect(
      view.container.querySelectorAll("[data-pretty-aui-slot]"),
    ).not.toHaveLength(0);

    view.unmount();
    expect(controller.unsubscribeCalls).toBe(1);
    expect(controller.destroyCalls).toBe(0);
  });

  it("coalesces bursty browser snapshots to the latest animation frame", () => {
    const frames = new Map<number, FrameRequestCallback>();
    let frameId = 0;
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
      const id = ++frameId;
      frames.set(id, callback);
      return id;
    });
    vi.stubGlobal("cancelAnimationFrame", (id: number) => frames.delete(id));
    const controller = new FakeChatController({
      phase: "running",
      activities: [message("assistant", "initial")],
    });
    const view = render(<Chat controller={controller} />);

    act(() => {
      controller.setSnapshot({
        activities: [message("assistant", "intermediate")],
      });
      controller.setSnapshot({
        activities: [message("assistant", "latest")],
      });
    });

    expect(screen.getByText("initial")).toBeInTheDocument();
    expect(frames.size).toBe(1);
    act(() => {
      const [id, callback] = [...frames][0]!;
      frames.delete(id);
      callback(performance.now());
    });
    expect(screen.getByText("latest")).toBeInTheDocument();
    expect(screen.queryByText("intermediate")).not.toBeInTheDocument();

    view.unmount();
    vi.unstubAllGlobals();
  });

  it.each([
    ["ChatHeader", <ChatHeader />],
    ["ChatTranscript", <ChatTranscript />],
    ["ChatInteractions", <ChatInteractions />],
    ["ChatComposer", <ChatComposer />],
  ])("rejects %s outside ChatRoot", (name, macro) => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    expect(() => render(macro)).toThrow(
      `pretty-aui: ${name} must be rendered inside a ChatRoot.`,
    );
    consoleError.mockRestore();
  });

  it("creates unique dialog IDs for multiple roots", () => {
    const snapshot: Partial<ChatSnapshot> = {
      sessions: { sessions: [] },
      interactions: [
        {
          type: "permission",
          id: "shared-permission",
          title: "Shared title",
          options: [],
        },
      ],
      capabilities: {
        listSessions: true,
        loadSession: false,
        resumeSession: false,
        closeSession: false,
        deleteSession: false,
      },
    };
    render(
      <>
        <Chat controller={new FakeChatController(snapshot)} />
        <Chat controller={new FakeChatController(snapshot)} />
      </>,
    );
    const buttons = screen.getAllByRole("button", { name: "Sessions" });
    fireEvent.click(buttons[0]!);
    fireEvent.click(buttons[1]!);
    const dialogs = screen.getAllByRole("dialog");
    const ids = dialogs.map((dialog) => dialog.getAttribute("aria-labelledby"));
    expect(new Set(ids).size).toBe(2);
    for (const [index, id] of ids.entries()) {
      expect(id).toBeTruthy();
      expect(within(dialogs[index]!).getByText("Sessions")).toHaveAttribute(
        "id",
        id,
      );
    }
    const interactionIds = screen
      .getAllByRole("alertdialog")
      .map((dialog) => dialog.getAttribute("aria-labelledby"));
    expect(new Set(interactionIds).size).toBe(2);
  });

  it("traps focus in the modal session drawer and restores its opener", () => {
    const controller = new FakeChatController({
      sessions: { sessions: [] },
      capabilities: {
        listSessions: true,
        loadSession: false,
        resumeSession: false,
        closeSession: false,
        deleteSession: false,
      },
    });
    render(<Chat controller={controller} />);
    const opener = screen.getByRole("button", { name: "Sessions" });
    opener.focus();
    fireEvent.click(opener);
    const close = within(screen.getByRole("dialog")).getByRole("button", {
      name: "Close",
    });
    expect(close).toHaveFocus();

    fireEvent.keyDown(close, { key: "Tab", shiftKey: true });
    expect(close).toHaveFocus();
    fireEvent.keyDown(close, { key: "Tab" });
    expect(close).toHaveFocus();
    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(opener).toHaveFocus();
  });

  it("keeps session pagination single-flight while loading more", async () => {
    const gate = deferred<SessionPage>();
    const controller = new FakeChatController({
      sessions: {
        sessions: [{ sessionId: "older", cwd: "/workspace" }],
        nextCursor: "page-2",
      },
      capabilities: {
        listSessions: true,
        loadSession: false,
        resumeSession: false,
        closeSession: false,
        deleteSession: false,
      },
    });
    controller.listSessionsResult = gate.promise;
    render(<Chat controller={controller} />);
    fireEvent.click(screen.getByRole("button", { name: "Sessions" }));
    const loadMore = screen.getByRole("button", { name: "Load more" });

    fireEvent.click(loadMore);
    fireEvent.click(loadMore);

    expect(controller.listSessionsCalls).toEqual(["page-2"]);
    expect(loadMore).toBeDisabled();
    gate.resolve({ sessions: [] });
    await waitFor(() => expect(loadMore).not.toBeDisabled());
  });

  it("keeps session state discoverable and exposes only supported delete actions", async () => {
    const controller = new FakeChatController({
      sessionId: "active",
      sessionTitle: "Active work",
      loadedSessions: [
        {
          sessionId: "active",
          title: "Active work",
          phase: "running",
          interactionCount: 0,
        },
        {
          sessionId: "background",
          phase: "awaiting_user",
          interactionCount: 2,
        },
        {
          sessionId: "closable",
          title: "Closable work",
          phase: "idle",
          interactionCount: 0,
        },
      ],
      sessions: {
        sessions: [
          { sessionId: "background", title: "Background review" },
          { sessionId: "archived", title: "Archived" },
        ],
      },
      capabilities: {
        listSessions: true,
        loadSession: true,
        resumeSession: true,
        closeSession: true,
        deleteSession: true,
      },
    });
    render(<Chat controller={controller} />);
    fireEvent.click(screen.getByRole("button", { name: "Sessions" }));
    const dialog = screen.getByRole("dialog");
    const active = within(dialog)
      .getByText("Active work")
      .closest(".paui-session")!;
    const background = within(dialog)
      .getByText("Background review")
      .closest(".paui-session")!;
    const closable = within(dialog)
      .getByText("Closable work")
      .closest(".paui-session")!;

    const activeSpinner = active.querySelector(".paui-session__spinner");
    expect(activeSpinner).toBeVisible();
    expect(activeSpinner).toHaveAttribute("aria-hidden", "true");
    expect(
      background.querySelector(".paui-session__spinner"),
    ).not.toBeInTheDocument();
    expect(
      closable.querySelector(".paui-session__spinner"),
    ).not.toBeInTheDocument();
    expect(
      within(background as HTMLElement).getByText("Awaiting User"),
    ).toBeVisible();
    expect(
      within(background as HTMLElement).getByText("2 pending interactions"),
    ).toBeVisible();
    expect(
      background.querySelector(".paui-session__meta-separator"),
    ).toHaveTextContent("·");
    expect(
      within(active as HTMLElement).queryByRole("button", {
        name: "Actions for Active work",
      }),
    ).not.toBeInTheDocument();
    expect(
      within(dialog).queryByRole("button", { name: "Close session" }),
    ).not.toBeInTheDocument();

    const backgroundActions = within(background as HTMLElement).getByRole(
      "button",
      { name: "Actions for Background review" },
    );
    fireEvent.click(backgroundActions);
    expect(controller.openedSessions).toEqual([]);
    const disabledDelete = within(dialog).getByRole("menuitem", {
      name: "Delete session",
    });
    expect(disabledDelete).toHaveAttribute("aria-disabled", "true");
    await waitFor(() => expect(disabledDelete).toHaveFocus());
    const outerEscape = vi.fn();
    document.addEventListener("keydown", outerEscape);
    fireEvent.keyDown(disabledDelete, { key: "Escape" });
    document.removeEventListener("keydown", outerEscape);
    expect(outerEscape).not.toHaveBeenCalled();
    expect(within(dialog).queryByRole("menu")).not.toBeInTheDocument();
    expect(backgroundActions).toHaveFocus();
    expect(dialog).toBeInTheDocument();

    const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
    const closableActions = within(closable as HTMLElement).getByRole(
      "button",
      { name: "Actions for Closable work" },
    );
    fireEvent.click(closableActions);
    const deleteItem = within(dialog).getByRole("menuitem", {
      name: "Delete session",
    });
    expect(deleteItem).toHaveAttribute("aria-disabled", "false");
    fireEvent.click(deleteItem);
    expect(confirm).toHaveBeenCalledWith("Delete “Closable work”?");
    expect(controller.deletedSessions).toEqual([]);
    expect(closableActions).toHaveFocus();

    confirm.mockReturnValue(true);
    fireEvent.click(closableActions);
    fireEvent.click(
      within(dialog).getByRole("menuitem", { name: "Delete session" }),
    );
    await waitFor(() =>
      expect(controller.deletedSessions).toEqual(["closable"]),
    );
    expect(controller.closedSessions).toEqual([]);
    expect(within(dialog).queryByRole("menu")).not.toBeInTheDocument();
    confirm.mockRestore();
  });

  it("keeps the drawer open and reports a session deletion failure", async () => {
    const controller = new FakeChatController({
      sessions: {
        sessions: [{ sessionId: "older", title: "Older work" }],
      },
      capabilities: {
        listSessions: true,
        loadSession: true,
        resumeSession: true,
        closeSession: true,
        deleteSession: true,
      },
    });
    controller.deleteSessionError = new Error("Delete was rejected");
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(true);
    render(<Chat controller={controller} />);
    fireEvent.click(screen.getByRole("button", { name: "Sessions" }));
    fireEvent.click(
      screen.getByRole("button", { name: "Actions for Older work" }),
    );
    fireEvent.click(screen.getByRole("menuitem", { name: "Delete session" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Delete was rejected",
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(controller.deletedSessions).toEqual([]);
    confirm.mockRestore();
  });

  it("formats compact relative session ages at bounded units", () => {
    const now = new Date("2026-08-30T12:00:00Z").valueOf();
    const ago = (milliseconds: number) =>
      new Date(now - milliseconds).toISOString();
    const minute = 60_000;
    const hour = 60 * minute;
    const day = 24 * hour;

    expect(formatSessionAge(undefined, now)).toBe("");
    expect(formatSessionAge("not-a-date", now)).toBe("not-a-date");
    expect(formatSessionAge(new Date(now + day).toISOString(), now)).toBe(
      "now",
    );
    expect(formatSessionAge(ago(minute - 1), now)).toBe("now");
    expect(formatSessionAge(ago(5 * minute), now)).toBe("5m");
    expect(formatSessionAge(ago(3 * hour), now)).toBe("3h");
    expect(formatSessionAge(ago(2 * day), now)).toBe("2d");
    expect(formatSessionAge(ago(60 * day), now)).toBe("2mo");
    expect(formatSessionAge(ago(400 * day), now)).toBe("1y");
  });

  it("formats catalog session ages through the host labels", () => {
    render(
      <Chat
        controller={
          new FakeChatController({
            sessions: {
              sessions: [
                {
                  sessionId: "future-session",
                  title: "Localized age",
                  updatedAt: "2999-01-01T00:00:00.000Z",
                },
              ],
            },
            capabilities: {
              listSessions: true,
              loadSession: true,
              resumeSession: true,
              closeSession: false,
              deleteSession: false,
            },
          })
        }
        labels={{
          sessionAge: (value, unit) => `${unit}:${value}`,
        }}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Sessions" }));

    expect(screen.getByText("now:0")).toBeInTheDocument();
  });

  it("allows a new session while the selected session is running", () => {
    const controller = new FakeChatController({
      phase: "running",
      loadedSessions: [
        {
          sessionId: "session-1",
          phase: "running",
          interactionCount: 0,
        },
      ],
    });
    render(<Chat controller={controller} />);

    fireEvent.click(screen.getByRole("button", { name: "New chat" }));

    expect(controller.newSessionCalls).toBe(1);
  });

  it("shows bounded session usage in the header", () => {
    const controller = new FakeChatController({
      usage: { used: 1_024, size: 8_192 },
    });
    render(<Chat controller={controller} />);

    expect(screen.getByText("1,024 / 8,192")).toBeInTheDocument();

    act(() => {
      controller.setSnapshot({
        usage: { used: Number.MAX_VALUE, size: Number.MAX_VALUE },
      });
    });
    expect(screen.getByText("1.80e+308 / 1.80e+308")).toBeInTheDocument();
  });

  it("keeps construction options immutable and destroys only its owned controller", async () => {
    const first = createV1Harness();
    const replacement = createV1Harness();
    const view = render(
      <Chat
        options={{
          connector: first.connector,
          session: { cwd: "/first" },
        }}
      />,
    );
    await waitFor(() => expect(first.attempts).toHaveLength(1));
    view.rerender(
      <Chat
        options={{
          connector: replacement.connector,
          session: { cwd: "/replacement" },
        }}
      />,
    );
    expect(replacement.attempts).toHaveLength(0);

    view.unmount();
    await waitFor(() => expect(first.abortedAttempts).toBe(1));
    await first.close();
    await replacement.close();
  });

  it("does not leak an owned controller through StrictMode setup replay", async () => {
    const harness = createV1Harness();
    const view = render(
      <StrictMode>
        <Chat
          options={{
            connector: harness.connector,
            session: { cwd: "/strict" },
          }}
        />
      </StrictMode>,
    );

    await waitFor(() => expect(harness.attempts).toHaveLength(2));
    await waitFor(() => expect(harness.abortedAttempts).toBe(1));
    view.unmount();
    await waitFor(() => expect(harness.abortedAttempts).toBe(2));
    await harness.close();
  });

  it("surfaces an owned connector failure instead of leaving a connecting shell", async () => {
    render(
      <Chat
        options={{
          connector: {
            open() {
              throw new Error("connector exploded");
            },
          },
          session: { cwd: "/broken" },
        }}
      />,
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "connector exploded",
    );
  });

  it("exposes presentation state and host label overrides at stable slots", () => {
    const controller = new FakeChatController({ phase: "running" });
    const { container } = render(
      <Chat
        controller={controller}
        surface="sidebar"
        colorScheme="dark"
        labels={{ composerPlaceholder: "Describe the change" }}
      />,
    );
    const root = container.querySelector('[data-pretty-aui-slot="root"]');
    expect(root).toHaveAttribute("data-surface", "sidebar");
    expect(root).toHaveAttribute("data-scheme", "dark");
    expect(root).toHaveAttribute("data-phase", "running");
    expect(
      container.querySelector('[data-pretty-aui-slot="composer-input"]'),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Describe the change")).toBeInTheDocument();
  });

  it("renders the ordered next-turn context selection above the prompt", () => {
    const controller = new FakeChatController({
      contextSelection: {
        items: [
          { id: "page", label: "Current page" },
          { id: "task", label: "Current task" },
        ],
        canAdd: true,
        canRemove: true,
        busy: false,
      },
    });
    const { container } = render(<Chat controller={controller} />);
    const selection = container.querySelector(
      '[data-pretty-aui-slot="composer-context"]',
    );
    const input = screen.getByLabelText("Ask anything…");

    expect(selection).toBeInTheDocument();
    expect(
      selection!.compareDocumentPosition(input) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      container.querySelectorAll(
        '[data-pretty-aui-slot="composer-context-item"]',
      ),
    ).toHaveLength(2);
    fireEvent.click(screen.getByRole("button", { name: "Add context" }));
    fireEvent.click(
      screen.getByRole("button", { name: "Remove context: Current page" }),
    );
    expect(controller.addContextCalls).toBe(1);
    expect(controller.removedContextIds).toEqual(["page"]);
  });

  it("shows the current session title and follows later title updates", () => {
    const controller = new FakeChatController({
      agentName: "OpenCode",
      sessionTitle: "Initial session title",
    });
    const { container } = render(<Chat controller={controller} />);
    const header = container.querySelector<HTMLElement>(
      '[data-pretty-aui-slot="header"]',
    )!;

    expect(within(header).getByText("Initial session title")).toBeVisible();
    expect(within(header).queryByText("OpenCode")).not.toBeInTheDocument();

    act(() => {
      controller.setSnapshot({ sessionTitle: "Updated session title" });
    });

    expect(within(header).getByText("Updated session title")).toBeVisible();
    expect(
      within(header).queryByText("Initial session title"),
    ).not.toBeInTheDocument();
  });
});

describe("Transcript", () => {
  it("renders a streamed ACP turn in order and sanitizes agent markdown", async () => {
    const harness = createV1Harness();
    const view = render(
      <Chat
        options={{
          connector: harness.connector,
          session: { cwd: "/workspace" },
        }}
      />,
    );
    const composer = await screen.findByLabelText("Ask anything…");
    await waitFor(() => expect(composer).not.toBeDisabled());
    fireEvent.input(composer, { target: { value: "xss" } });
    fireEvent.keyDown(composer, { key: "Enter", code: "Enter" });
    await waitFor(() => expect(screen.getByText("answer")).toBeInTheDocument());
    expect(
      view.container.querySelectorAll(".paui-thought .paui-markdown"),
    ).toHaveLength(1);
    expect(
      view.container.querySelectorAll(
        ".paui-message[data-role='assistant'] .paui-markdown",
      ),
    ).toHaveLength(1);
    expect(view.container.querySelector("img[onerror]")).toBeNull();
    const user = screen.getByText("xss");
    const tool = view.container.querySelector<HTMLElement>(
      ".paui-tool .paui-flow-preview",
    )!;
    const answer = screen.getByText("answer");
    expect(user.compareDocumentPosition(tool)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
    expect(tool.compareDocumentPosition(answer)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
    view.unmount();
    await harness.close();
  });

  it("shows copy actions for users and only each settled turn's final answer", () => {
    const controller = new FakeChatController({
      activities: [
        message("user", "first question", 1_000),
        message("assistant", "intermediate answer"),
        message("assistant", "first final answer", 2_000),
        message("user", "second question", 3_000),
        message("thought", "private reasoning"),
        message("assistant", "second final answer", 4_000),
      ],
    });
    render(<Chat controller={controller} />);

    expect(screen.getAllByRole("button", { name: "Copy" })).toHaveLength(4);
    expect(
      within(
        screen.getByText("intermediate answer").closest(".paui-message")!,
      ).queryByRole("button", { name: "Copy" }),
    ).toBeNull();
    expect(
      within(document.querySelector<HTMLElement>(".paui-thought")!).queryByRole(
        "button",
        { name: "Copy" },
      ),
    ).toBeNull();
  });

  it("withholds final-answer actions until the active turn settles", () => {
    const controller = new FakeChatController({
      phase: "running",
      activities: [
        message("user", "question", 1_000),
        message("assistant", "streaming answer"),
      ],
    });
    render(<Chat controller={controller} />);

    expect(screen.getAllByRole("button", { name: "Copy" })).toHaveLength(1);

    act(() => controller.setSnapshot({ phase: "idle" }));

    expect(screen.getAllByRole("button", { name: "Copy" })).toHaveLength(2);
  });

  it("keeps a mid-turn host notice from finalizing a streaming answer", () => {
    const controller = new FakeChatController({
      phase: "running",
      activities: [
        message("user", "question", 1_000),
        message("assistant", "answer before notice"),
        {
          type: "notice",
          id: "host-notice",
          text: "Still connected",
          level: "info",
        },
        message("assistant", "answer after notice"),
      ],
    });
    render(<Chat controller={controller} />);

    expect(screen.getAllByRole("button", { name: "Copy" })).toHaveLength(1);

    act(() => controller.setSnapshot({ phase: "idle" }));

    expect(screen.getAllByRole("button", { name: "Copy" })).toHaveLength(2);
    expect(
      within(
        screen.getByText("answer before notice").closest(".paui-message")!,
      ).queryByRole("button", { name: "Copy" }),
    ).toBeNull();
    expect(
      within(
        screen.getByText("answer after notice").closest(".paui-message")!,
      ).getByRole("button", { name: "Copy" }),
    ).toBeInTheDocument();
  });

  it("places the user clock before copy and the answer clock after copy", () => {
    const now = new Date(2026, 6, 29, 17, 30).getTime();
    const { container } = render(
      <Chat
        controller={
          new FakeChatController({
            activities: [
              message("user", "clock order", now),
              message("assistant", "clock answer", now),
            ],
          })
        }
      />,
    );
    const rows = container.querySelectorAll<HTMLElement>(
      '[data-pretty-aui-slot="message-actions"]',
    );

    expect(rows).toHaveLength(2);
    expect(rows[0]).toHaveAttribute("data-clock", "start");
    expect(rows[0]?.firstElementChild?.tagName).toBe("TIME");
    expect(rows[0]?.lastElementChild?.tagName).toBe("BUTTON");
    expect(rows[1]).toHaveAttribute("data-clock", "end");
    expect(rows[1]?.firstElementChild?.tagName).toBe("BUTTON");
    expect(rows[1]?.lastElementChild?.tagName).toBe("TIME");
  });

  it("copies only ordered text blocks and reports success for one second", async () => {
    vi.useFakeTimers();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    try {
      render(
        <Chat
          controller={
            new FakeChatController({
              activities: [
                {
                  type: "message",
                  id: "copy-source",
                  role: "user",
                  content: [
                    { type: "text", text: "first" },
                    {
                      type: "resource_link",
                      uri: "https://example.com",
                      name: "ignored",
                    },
                    { type: "text", text: " second" },
                  ],
                  timestamp: Date.now(),
                },
              ],
            })
          }
          labels={{ copy: "Duplicate", copied: "Done" }}
        />,
      );
      const copy = screen.getByRole("button", { name: "Duplicate" });
      fireEvent.click(copy);
      fireEvent.click(copy);
      expect(writeText).toHaveBeenCalledTimes(1);
      expect(writeText).toHaveBeenCalledWith("first second");

      await act(async () => {
        await Promise.resolve();
        await Promise.resolve();
      });
      expect(screen.getByRole("button", { name: "Done" })).toBeInTheDocument();
      fireEvent.click(screen.getByRole("button", { name: "Done" }));
      expect(writeText).toHaveBeenCalledTimes(1);

      act(() => vi.advanceTimersByTime(1_000));
      expect(
        screen.getByRole("button", { name: "Duplicate" }),
      ).toBeInTheDocument();
    } finally {
      vi.useRealTimers();
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: undefined,
      });
    }
  });

  it("falls back to execCommand and never claims a rejected clipboard write", async () => {
    const originalExecCommand = Object.getOwnPropertyDescriptor(
      document,
      "execCommand",
    );
    let fallbackParent: ParentNode | null | undefined;
    let fallbackRoot: Element | null | undefined;
    const execute = vi.fn(() => {
      const fallback = [
        ...document.querySelectorAll<HTMLTextAreaElement>("textarea[readonly]"),
      ].find((textarea) => textarea.style.left === "-9999px");
      fallbackParent = fallback?.parentNode;
      fallbackRoot = fallback?.closest(".pretty-aui");
      return true;
    });
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: undefined,
    });
    Object.defineProperty(document, "execCommand", {
      configurable: true,
      value: execute,
    });
    const fallback = render(
      <Chat
        controller={
          new FakeChatController({ activities: [message("user", "fallback")] })
        }
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Copy" }));
    expect(execute).toHaveBeenCalledWith("copy");
    expect(fallbackParent).not.toBe(document.body);
    expect(fallbackRoot).not.toBeNull();
    fallback.unmount();

    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: vi.fn().mockRejectedValue(new Error("denied")) },
    });
    render(
      <Chat
        controller={
          new FakeChatController({ activities: [message("user", "rejected")] })
        }
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Copy" }));
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(screen.getByRole("button", { name: "Copy" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Copied" })).toBeNull();

    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: undefined,
    });
    if (originalExecCommand) {
      Object.defineProperty(document, "execCommand", originalExecCommand);
    } else {
      delete (document as unknown as { execCommand?: unknown }).execCommand;
    }
  });

  it("cleans up pending copy feedback and the shared calendar timer", async () => {
    vi.useFakeTimers();
    let resolveWrite!: () => void;
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: vi.fn(
          () =>
            new Promise<void>((resolve) => {
              resolveWrite = resolve;
            }),
        ),
      },
    });
    try {
      const view = render(
        <Chat
          controller={
            new FakeChatController({ activities: [message("user", "pending")] })
          }
        />,
      );
      fireEvent.click(screen.getByRole("button", { name: "Copy" }));
      view.unmount();
      await act(async () => {
        resolveWrite();
        await Promise.resolve();
        await Promise.resolve();
      });
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: undefined,
      });
    }
  });

  it("formats local message time across day and year boundaries", () => {
    const now = new Date(2026, 6, 29, 10, 0).getTime();
    expect(
      formatMessageTimestamp(new Date(2026, 6, 29, 14, 24).getTime(), now),
    ).toBe("14:24");
    const sameYear = formatMessageTimestamp(
      new Date(2026, 0, 1, 14, 24).getTime(),
      now,
    );
    expect(sameYear).toMatch(/14:24$/);
    expect(sameYear).not.toContain("2026");
    const otherYear = formatMessageTimestamp(
      new Date(2025, 11, 31, 9, 5).getTime(),
      now,
    );
    expect(otherYear).toMatch(/09:05$/);
    expect(otherYear).toContain("2025");
  });

  it("widens a same-day clock after local midnight", () => {
    vi.useFakeTimers();
    const beforeMidnight = new Date(2026, 6, 29, 23, 59, 59).getTime();
    vi.setSystemTime(beforeMidnight);
    try {
      const { container } = render(
        <Chat
          controller={
            new FakeChatController({
              activities: [
                message(
                  "user",
                  "midnight",
                  new Date(2026, 6, 29, 14, 24).getTime(),
                ),
              ],
            })
          }
        />,
      );
      const time = container.querySelector("time")!;
      expect(time).toHaveTextContent("14:24");

      act(() => vi.advanceTimersByTime(1_001));

      expect(time.textContent).toMatch(/14:24$/);
      expect(time.textContent).not.toBe("14:24");
    } finally {
      vi.useRealTimers();
    }
  });

  it("allows safe links and removes active unsafe URLs", () => {
    const controller = new FakeChatController({
      activities: [
        message(
          "assistant",
          "[safe](https://example.com) [unsafe](javascript:alert(1))",
        ),
        {
          type: "message",
          id: "resource",
          role: "assistant",
          content: [
            {
              type: "resource_link",
              uri: "file:///etc/passwd",
              name: "unsafe resource",
            },
          ],
        },
      ],
    });
    render(<Chat controller={controller} />);
    expect(screen.getByRole("link", { name: "safe" })).toHaveAttribute(
      "href",
      "https://example.com",
    );
    expect(screen.getByRole("link", { name: "safe" })).toHaveAttribute(
      "target",
      "_blank",
    );
    expect(screen.getByRole("link", { name: "safe" })).toHaveAttribute(
      "rel",
      "noopener noreferrer",
    );
    expect(screen.getByText("unsafe").closest("a")).toBeNull();
    expect(
      screen.getByText("Unsupported agent content: unsafe resource link"),
    ).toBeInTheDocument();
  });

  it("renders agent Markdown images without initiating a network image load", () => {
    const controller = new FakeChatController({
      activities: [
        message(
          "assistant",
          "Before ![tracking pixel](https://evil.example/pixel) after",
        ),
      ],
    });
    const { container } = render(<Chat controller={controller} />);

    expect(container.querySelector("img")).toBeNull();
    expect(screen.getByText(/tracking pixel/)).toBeInTheDocument();
  });

  it("renders GFM tables semantically inside a package-owned overflow region", () => {
    const controller = new FakeChatController({
      activities: [
        message(
          "assistant",
          "| Name | Status | Count |\n| :--- | :---: | ---: |\n| Alpha | Ready | 3 |",
        ),
      ],
    });
    const { container } = render(<Chat controller={controller} />);

    const region = container.querySelector(".paui-markdown-table");
    expect(region).not.toBeNull();
    const table = screen.getByRole("table");
    expect(region).toContainElement(table);
    expect(screen.getByRole("columnheader", { name: "Name" })).toHaveAttribute(
      "align",
      "left",
    );
    expect(
      screen.getByRole("columnheader", { name: "Status" }),
    ).toHaveAttribute("align", "center");
    expect(screen.getByRole("columnheader", { name: "Count" })).toHaveAttribute(
      "align",
      "right",
    );
    expect(screen.getByRole("cell", { name: "Alpha" })).toBeVisible();
  });

  it("does not reparse unchanged Markdown for unrelated snapshot updates", () => {
    const beforeSanitize = vi.fn();
    addHook("beforeSanitizeElements", beforeSanitize);
    const controller = new FakeChatController({
      activities: [message("assistant", "**stable**")],
    });
    render(<Chat controller={controller} />);
    const calls = beforeSanitize.mock.calls.length;

    act(() => controller.setSnapshot({ phase: "running" }));

    expect(beforeSanitize).toHaveBeenCalledTimes(calls);
    removeHook("beforeSanitizeElements", beforeSanitize);
  });

  it("keeps reasoning collapsed and follows the latest streaming line", async () => {
    const thought = (text: string): ChatActivity => ({
      type: "message",
      id: "thought-1",
      role: "thought",
      content: [{ type: "text", text }],
    });
    const controller = new FakeChatController({
      phase: "running",
      activities: [thought("Opening context\nfirst live tail")],
    });
    const { container } = render(<Chat controller={controller} />);
    const details =
      container.querySelector<HTMLDetailsElement>(".paui-thought")!;
    expect(details.open).toBe(false);
    expect(details.querySelector(".paui-flow-preview")).toHaveTextContent(
      "first live tail",
    );

    act(() => {
      controller.setSnapshot({
        activities: [thought("Opening context\nnewest live tail")],
      });
    });
    await waitFor(() =>
      expect(details.querySelector(".paui-flow-preview")).toHaveTextContent(
        "newest live tail",
      ),
    );

    act(() => {
      controller.setSnapshot({ phase: "idle" });
    });
    expect(details.querySelector(".paui-flow-preview")).toHaveTextContent(
      "Opening context",
    );
    fireEvent.click(details.querySelector("summary")!);
    expect(details.open).toBe(true);
  });

  it("shows submitted context as a collapsed inert disclosure", () => {
    const controller = new FakeChatController({
      activities: [
        message("user", "Inspect this evaluation"),
        {
          type: "context",
          id: "context-turn-1-page",
          contextId: "page",
          label: "Current page",
          content: [
            {
              type: "text",
              text: "<system-reminder>literal</system-reminder>",
            },
            {
              type: "resource",
              resource: {
                uri: "peval://source/cell-1",
                mimeType: "application/json",
                text: '{"score":0}',
              },
            },
          ],
        },
        message("assistant", "Reviewed"),
      ],
    });
    const { container } = render(<Chat controller={controller} />);
    const row = container.querySelector<HTMLElement>(
      '[data-pretty-aui-slot="activity"][data-kind="context"]',
    )!;
    const details = row.querySelector<HTMLDetailsElement>("details")!;

    expect(details.open).toBe(false);
    expect(within(row).getByText("Context injection")).toBeInTheDocument();
    expect(within(row).getByText("Current page")).toBeInTheDocument();
    fireEvent.click(details.querySelector("summary")!);
    expect(details.open).toBe(true);
    expect(within(row).getByText(/<system-reminder>/)).toBeInTheDocument();
    expect(row.querySelector("system-reminder")).toBeNull();
    expect(within(row).getByText("peval://source/cell-1")).toBeInTheDocument();
    expect(within(row).getByText("application/json")).toBeInTheDocument();
    expect(within(row).getByText('{"score":0}')).toBeInTheDocument();
    expect(row.querySelector("a, img, audio")).toBeNull();
  });

  it("renders consecutive host notices as one independent compact flow group", () => {
    const controller = new FakeChatController({
      phase: "running",
      activities: [
        message("user", "Run the evaluation"),
        message("assistant", "Working"),
        {
          type: "notice",
          id: "notice-info",
          text: "Context attached",
          level: "info",
        },
        {
          type: "notice",
          id: "notice-error",
          text: "Background session failed",
          level: "error",
        },
      ],
    });
    const { container } = render(<Chat controller={controller} />);
    const groups = container.querySelectorAll(".paui-notice-group");
    const rows = groups[0]!.querySelectorAll<HTMLElement>(
      '[data-pretty-aui-slot="activity"][data-kind="notice"]',
    );

    expect(groups).toHaveLength(1);
    expect(rows).toHaveLength(2);
    expect(rows[0]).toHaveAttribute("data-level", "info");
    expect(rows[1]).toHaveAttribute("data-level", "error");
    expect(screen.getByRole("status")).toHaveTextContent("Context attached");
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Background session failed",
    );
    expect(groups[0]!.closest(".paui-turn")).toBeNull();
    expect(groups[0]!.querySelector("button")).toBeNull();
    expect(
      container.querySelector(
        '[data-pretty-aui-slot="message"][data-role="assistant"]',
      ),
    ).toHaveAttribute("aria-live", "polite");
  });

  it("keeps notice-only sessions in the hero composer layout", () => {
    const controller = new FakeChatController({
      activities: [
        {
          type: "notice",
          id: "notice-only",
          text: "Connected",
          level: "info",
        },
      ],
    });
    const { container } = render(<Chat controller={controller} />);

    expect(
      container.querySelector('[data-pretty-aui-slot="composer"]'),
    ).toHaveAttribute("data-placement", "hero");
    expect(container.querySelector(".paui-empty")).toBeNull();
    expect(screen.getByRole("status")).toHaveTextContent("Connected");
  });

  it("bounds context disclosure text without changing the activity", () => {
    const text = "x".repeat(20_001);
    const activity: ChatActivity = {
      type: "context",
      id: "context-turn-1-large",
      contextId: "large",
      label: "Large context",
      content: [{ type: "text", text }],
    };
    const { container } = render(
      <Chat controller={new FakeChatController({ activities: [activity] })} />,
    );

    const literal = container.querySelector<HTMLElement>(".paui-context-text")!;
    expect(literal.textContent).toHaveLength(20_000);
    expect(
      screen.getByText("Context display truncated (20,001 characters total)."),
    ).toBeInTheDocument();
    expect(activity.content).toEqual([{ type: "text", text }]);
  });

  it("renders context links, media, blobs, and unknown blocks as inert text", () => {
    const controller = new FakeChatController({
      activities: [
        {
          type: "context",
          id: "context-turn-1-inert",
          contextId: "inert",
          label: "Inert blocks",
          content: [
            {
              type: "resource_link",
              name: "Evidence link",
              uri: "https://example.com/evidence",
              mimeType: "text/plain",
              description: "Captured upstream",
            },
            {
              type: "resource",
              resource: {
                uri: "peval://binary",
                blob: "YWJj",
              },
            },
            { type: "image", mimeType: "image/png", data: "aGVsbG8=" },
            { type: "audio", mimeType: "audio/ogg", data: "aGVsbG8=" },
            { type: "future_context", payload: { literal: "<b>raw</b>" } },
          ],
        },
      ],
    });
    const { container } = render(<Chat controller={controller} />);
    const row = container.querySelector<HTMLElement>('[data-kind="context"]')!;

    expect(within(row).getByText("Evidence link")).toBeInTheDocument();
    expect(
      within(row).getByText("https://example.com/evidence"),
    ).toBeInTheDocument();
    expect(within(row).getByText(/4 base64 characters/)).toBeInTheDocument();
    expect(within(row).getByText(/image\/png/)).toBeInTheDocument();
    expect(within(row).getByText(/audio\/ogg/)).toBeInTheDocument();
    expect(within(row).getByText(/<b>raw<\/b>/)).toBeInTheDocument();
    expect(row.querySelector("a, img, audio, video, source")).toBeNull();
  });

  it("uses the Thinking label for thought activity", () => {
    render(
      <Chat
        controller={
          new FakeChatController({
            activities: [
              {
                type: "message",
                id: "thought-label",
                role: "thought",
                content: [{ type: "text", text: "Inspecting" }],
              },
            ],
          })
        }
      />,
    );

    expect(screen.getByText("Thinking", { exact: true })).toBeInTheDocument();
    expect(screen.queryByText("Think", { exact: true })).toBeNull();
  });

  it("follows only while pinned and offers a return-to-bottom control", () => {
    const controller = new FakeChatController({
      activities: [message("assistant", "one")],
    });
    const { container } = render(<Chat controller={controller} />);
    const scroller = container.querySelector<HTMLElement>(
      '[data-pretty-aui-slot="transcript"]',
    )!;
    Object.defineProperties(scroller, {
      scrollHeight: { configurable: true, value: 1_000 },
      clientHeight: { configurable: true, value: 400 },
    });
    scroller.scrollTop = 600;
    fireEvent.scroll(scroller);
    scroller.scrollTop = 100;
    fireEvent.scroll(scroller);
    const latest = screen.getByRole("button", {
      name: "Scroll to latest message",
    });
    expect(scroller).not.toContainElement(latest);
    act(() => {
      controller.setSnapshot({
        activities: [
          message("assistant", "one"),
          {
            type: "notice",
            id: "notice-unpinned",
            text: "Background update",
            level: "info",
          },
        ],
      });
    });
    expect(scroller.scrollTop).toBe(100);
    fireEvent.click(latest);
    expect(scroller.scrollTop).toBe(1_000);

    scroller.scrollTop = 580;
    fireEvent.scroll(scroller);
    act(() => {
      controller.setSnapshot({
        activities: [
          message("assistant", "one"),
          {
            type: "notice",
            id: "notice-unpinned",
            text: "Background update",
            level: "info",
          },
          {
            type: "notice",
            id: "notice-pinned",
            text: "Latest update",
            level: "info",
          },
        ],
      });
    });
    expect(scroller.scrollTop).toBe(1_000);
    expect(
      screen.queryByRole("button", { name: "Scroll to latest message" }),
    ).not.toBeInTheDocument();
  });

  it("restores transcript scroll state per loaded session", () => {
    const controller = new FakeChatController({
      sessionId: "session-1",
      activities: [message("assistant", "one")],
    });
    const { container } = render(<Chat controller={controller} />);
    const scroller = container.querySelector<HTMLElement>(
      '[data-pretty-aui-slot="transcript"]',
    )!;
    Object.defineProperties(scroller, {
      scrollHeight: { configurable: true, value: 1_000 },
      clientHeight: { configurable: true, value: 400 },
    });
    scroller.scrollTop = 600;
    fireEvent.scroll(scroller);
    scroller.scrollTop = 100;
    fireEvent.scroll(scroller);

    act(() => {
      controller.setSnapshot({
        sessionId: "session-2",
        activities: [message("assistant", "two")],
      });
    });
    scroller.scrollTop = 300;
    fireEvent.scroll(scroller);
    act(() => {
      controller.setSnapshot({
        sessionId: "session-1",
        activities: [message("assistant", "one")],
      });
    });

    expect(scroller.scrollTop).toBe(100);
  });

  it("does not restore scroll state into a new incarnation of the same session ID", () => {
    const controller = new FakeChatController({
      sessionId: "reused-session",
      sessionInstanceId: "instance-1",
      activities: [message("assistant", "one")],
    });
    const { container } = render(<Chat controller={controller} />);
    const scroller = container.querySelector<HTMLElement>(
      '[data-pretty-aui-slot="transcript"]',
    )!;
    Object.defineProperties(scroller, {
      scrollHeight: { configurable: true, value: 1_000 },
      clientHeight: { configurable: true, value: 400 },
    });
    scroller.scrollTop = 100;
    fireEvent.scroll(scroller);

    act(() => {
      controller.setSnapshot({
        sessionId: "reused-session",
        sessionInstanceId: "instance-2",
        activities: [],
      });
    });

    expect(scroller.scrollTop).toBe(1_000);
  });
});

describe("Tool rendering seam", () => {
  const tool: Extract<ChatActivity, { type: "tool" }> = {
    type: "tool",
    id: "tool-1",
    title: "Search workspace",
    kind: "search",
    status: "failed",
    content: [
      { type: "content", content: { type: "text", text: "Built-in result" } },
    ],
    locations: [],
  };

  it("receives a normalized tool and preserves the package wrapper", () => {
    const renderer = vi.fn(() => <div>Custom result</div>);
    const { container } = render(
      <Chat
        controller={new FakeChatController({ activities: [tool] })}
        toolActivityRenderer={renderer}
      />,
    );
    expect(renderer).toHaveBeenCalledWith(tool);
    expect(screen.getByText("Custom result")).toBeInTheDocument();
    expect(screen.getByText("Search workspace")).toBeInTheDocument();
    expect(
      container.querySelector('[data-pretty-aui-slot="activity"]'),
    ).toHaveAttribute("data-status", "failed");
    const details = container.querySelector<HTMLDetailsElement>(".paui-tool")!;
    expect(details.open).toBe(false);
    fireEvent.click(details.querySelector("summary")!);
    expect(details.open).toBe(true);
  });

  it("falls back to bounded raw tool input and output", () => {
    const controller = new FakeChatController({
      activities: [
        {
          type: "tool",
          id: "raw-tool",
          title: "Custom tool",
          kind: "custom",
          status: "completed",
          content: [],
          locations: [],
          rawInput: { query: "needle" },
          rawOutput: { matches: 3 },
        },
      ],
    });
    render(<Chat controller={controller} />);

    fireEvent.click(screen.getByText("Custom tool"));
    expect(screen.getByText("Input")).toBeInTheDocument();
    expect(screen.getByText(/"query": "needle"/)).toBeInTheDocument();
    expect(screen.getByText("Output")).toBeInTheDocument();
    expect(screen.getByText(/"matches": 3/)).toBeInTheDocument();
  });

  it("renders Execute as a terminal card and copies only the original output", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    try {
      const controller = new FakeChatController({
        activities: [
          {
            type: "tool",
            id: "execute-tool",
            title: "Execute checks",
            kind: "execute",
            status: "completed",
            content: [
              {
                type: "content",
                content: {
                  type: "text",
                  text: "\u001b[32mone\u001b[0m\ntwo",
                },
              },
            ],
            locations: [],
            rawInput: { command: "printf one\nprintf two", cwd: "/workspace" },
          },
        ],
      });
      const { container } = render(<Chat controller={controller} />);

      fireEvent.click(screen.getByText("Execute checks"));
      const card = container.querySelector('[data-tool-block="terminal"]')!;
      expect(card).toHaveTextContent("/workspace");
      expect(card).toHaveTextContent("printf one");
      expect(card).toHaveTextContent("one");
      fireEvent.click(
        within(card as HTMLElement).getByRole("button", { name: "Copy" }),
      );
      expect(writeText).toHaveBeenCalledWith("\u001b[32mone\u001b[0m\ntwo");

      await act(async () => {
        await Promise.resolve();
        await Promise.resolve();
      });
      expect(
        within(card as HTMLElement).getByRole("button", { name: "Copied" }),
      ).toBeInTheDocument();

      act(() => {
        controller.setSnapshot({
          activities: [
            {
              ...controller.getSnapshot().activities[0]!,
              type: "tool",
              content: [
                {
                  type: "content",
                  content: { type: "text", text: "replacement" },
                },
              ],
            } as ChatToolCall,
          ],
        });
      });
      expect(screen.getByRole("button", { name: "Copy" })).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Copied" })).toBeNull();
    } finally {
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: undefined,
      });
    }
  });

  it("keeps a running Execute card to its command banner", () => {
    const { container } = render(
      <Chat
        controller={
          new FakeChatController({
            activities: [
              {
                type: "tool",
                id: "running-execute",
                title: "Execute build",
                kind: "execute",
                status: "in_progress",
                content: [],
                locations: [],
                rawInput: { command: "pnpm build", cwd: "/workspace" },
              },
            ],
          })
        }
      />,
    );

    fireEvent.click(screen.getByText("Execute build"));
    const card = container.querySelector('[data-tool-block="terminal"]')!;
    expect(card).toHaveAttribute("data-state", "running");
    expect(card).toHaveTextContent("pnpm build");
    expect(
      within(card as HTMLElement).queryByRole("button", { name: "Copy" }),
    ).toBeNull();
    expect(within(card as HTMLElement).queryByText("No output")).toBeNull();
  });

  it("folds a long Read window while copying the full body without line numbers", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    const body = Array.from(
      { length: 10 },
      (_, index) => `line ${index + 1}`,
    ).join("\n");
    try {
      const { container } = render(
        <Chat
          controller={
            new FakeChatController({
              activities: [
                {
                  type: "tool",
                  id: "read-tool",
                  title: "Read LICENSE",
                  kind: "read",
                  status: "completed",
                  content: [],
                  locations: [{ path: "/workspace/LICENSE" }],
                  rawInput: { filePath: "/workspace/LICENSE", offset: 11 },
                  rawOutput: {
                    metadata: { display: { type: "file", text: body } },
                  },
                },
              ],
            })
          }
        />,
      );

      fireEvent.click(container.querySelector("summary")!);
      const card = container.querySelector('[data-tool-block="read"]')!;
      expect(within(card as HTMLElement).queryByText("line 5")).toBeNull();
      const expand = within(card as HTMLElement).getByRole("button", {
        name: "... more 2 lines",
      });
      expect(expand).toHaveAttribute("aria-expanded", "false");
      fireEvent.click(expand);
      expect(
        within(card as HTMLElement).getByText("line 5"),
      ).toBeInTheDocument();
      expect(
        within(card as HTMLElement).getByRole("button", { name: "Show less" }),
      ).toHaveAttribute("aria-expanded", "true");

      fireEvent.click(
        within(card as HTMLElement).getByRole("button", { name: "Copy" }),
      );
      expect(writeText).toHaveBeenCalledWith(body);
    } finally {
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: undefined,
      });
    }
  });

  it("renders ACP Diff statistics and copies its full patch", () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    const patch = "--- a/a.ts\n+++ b/a.ts\n-old\n+new";
    try {
      const { container } = render(
        <Chat
          controller={
            new FakeChatController({
              activities: [
                {
                  type: "tool",
                  id: "diff-tool",
                  title: "Edit a.ts",
                  kind: "edit",
                  status: "completed",
                  content: [
                    {
                      type: "diff",
                      changes: [{ operation: "modify", path: "a.ts" }],
                      patch,
                    },
                  ],
                  locations: [{ path: "a.ts" }],
                },
              ],
            })
          }
        />,
      );

      fireEvent.click(screen.getByText("Edit a.ts"));
      const card = container.querySelector('[data-tool-block="diff"]')!;
      expect(card).toHaveTextContent("+1 −1 · 1 Changed files");
      expect(card.querySelectorAll('[data-line-kind="add"]')).toHaveLength(1);
      expect(card.querySelectorAll('[data-line-kind="delete"]')).toHaveLength(
        1,
      );
      fireEvent.click(
        within(card as HTMLElement).getByRole("button", { name: "Copy" }),
      );
      expect(writeText).toHaveBeenCalledWith(patch);
    } finally {
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: undefined,
      });
    }
  });

  it("gives generic IN and OUT sections independent semantic copies", () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    try {
      const { container } = render(
        <Chat
          controller={
            new FakeChatController({
              activities: [
                {
                  type: "tool",
                  id: "io-tool",
                  title: "Search",
                  kind: "search",
                  status: "completed",
                  content: [
                    {
                      type: "content",
                      content: { type: "text", text: "three matches" },
                    },
                  ],
                  locations: [],
                  rawInput: { query: "needle" },
                },
              ],
            })
          }
        />,
      );

      fireEvent.click(container.querySelector("summary")!);
      const card = container.querySelector('[data-tool-block="io"]')!;
      const sections = card.querySelectorAll<HTMLElement>("section");
      fireEvent.click(
        within(sections[0]!).getByRole("button", { name: "Copy" }),
      );
      fireEvent.click(
        within(sections[1]!).getByRole("button", { name: "Copy" }),
      );
      expect(writeText).toHaveBeenNthCalledWith(1, '{\n  "query": "needle"\n}');
      expect(writeText).toHaveBeenNthCalledWith(2, "three matches");
    } finally {
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: undefined,
      });
    }
  });

  it("uses the built-in body when a custom renderer returns undefined", () => {
    render(
      <Chat
        controller={new FakeChatController({ activities: [tool] })}
        toolActivityRenderer={() => undefined}
      />,
    );
    expect(screen.getByText("Built-in result")).toBeInTheDocument();
  });

  it("preserves custom renderer state across streamed tool updates", () => {
    function StatefulTool({ value }: { value: typeof tool }) {
      const [count, setCount] = useState(0);
      return (
        <button
          type="button"
          onClick={() => setCount((current) => current + 1)}
        >
          State {count}; chunks {value.content.length}
        </button>
      );
    }
    const controller = new FakeChatController({ activities: [tool] });
    render(
      <Chat
        controller={controller}
        toolActivityRenderer={(value) => (
          <StatefulTool value={value as typeof tool} />
        )}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /State 0/ }));

    act(() => {
      controller.setSnapshot({
        activities: [
          {
            ...tool,
            status: "completed",
            content: [
              ...tool.content,
              {
                type: "content",
                content: { type: "text", text: "Streamed result" },
              },
            ],
          },
        ],
      });
    });

    expect(
      screen.getByRole("button", { name: "State 1; chunks 2" }),
    ).toBeInTheDocument();
  });

  it("falls back and emits a diagnostic when a renderer throws", () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    render(
      <Chat
        controller={new FakeChatController({ activities: [tool] })}
        toolActivityRenderer={() => {
          throw new Error("renderer exploded");
        }}
      />,
    );
    expect(screen.getByText("Built-in result")).toBeInTheDocument();
    expect(consoleError).toHaveBeenCalledWith(
      "pretty-aui: custom tool renderer failed",
      expect.objectContaining({ message: "renderer exploded" }),
    );
    consoleError.mockRestore();
  });

  it("latches a failed custom renderer for one tool activity", () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const controller = new FakeChatController({ activities: [tool] });
    const renderer = vi.fn((value: ChatToolCall) => {
      if (value.content.length === 1) throw new Error("partial tool");
      return <div>Recovered renderer</div>;
    });
    render(<Chat controller={controller} toolActivityRenderer={renderer} />);
    expect(screen.getByText("Built-in result")).toBeInTheDocument();
    const callsAfterFailure = renderer.mock.calls.length;
    const logsAfterFailure = consoleError.mock.calls.length;

    act(() => {
      controller.setSnapshot({
        activities: [
          {
            ...tool,
            content: [
              ...tool.content,
              {
                type: "content",
                content: { type: "text", text: "Complete tool data" },
              },
            ],
          },
        ],
      });
    });

    expect(screen.queryByText("Recovered renderer")).not.toBeInTheDocument();
    expect(screen.getByText("Built-in result")).toBeInTheDocument();
    expect(renderer).toHaveBeenCalledTimes(callsAfterFailure);
    expect(consoleError).toHaveBeenCalledTimes(logsAfterFailure);
    consoleError.mockRestore();
  });
});

describe("Agent activity", () => {
  it("renders an OpenCode task as a collapsed Agent row while preserving the custom body seam", () => {
    const renderer = vi.fn(() => <div>Custom child details</div>);
    const activity = agentTool({ status: "completed", sessionId: "child-1" });
    const { container } = render(
      <Chat
        controller={new FakeChatController({ activities: [activity] })}
        toolActivityRenderer={renderer}
      />,
    );

    const row = container.querySelector<HTMLElement>(
      '[data-pretty-aui-slot="activity"]',
    )!;
    const details = row.querySelector<HTMLDetailsElement>(".paui-subagent")!;
    expect(row).toHaveAttribute("data-kind", "subagent");
    expect(within(row).queryByText("Think")).not.toBeInTheDocument();
    expect(within(row).getByText("Explore Agent")).toBeInTheDocument();
    expect(within(row).getByText("Inspect the client")).toBeInTheDocument();
    expect(within(row).getByText("Completed")).toBeInTheDocument();
    expect(details.open).toBe(false);
    expect(renderer).toHaveBeenCalledWith(activity);

    fireEvent.click(details.querySelector("summary")!);
    expect(details.open).toBe(true);
    expect(screen.getByText("Custom child details")).toBeInTheDocument();
  });

  it("updates UI-observed time without exposing it as a live region", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-26T00:00:00Z"));
    try {
      render(
        <Chat
          controller={
            new FakeChatController({
              phase: "running",
              activities: [agentTool({ status: "in_progress" })],
            })
          }
        />,
      );
      expect(screen.getByText("Observed 0s")).toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(12_000);
      });
      const observed = screen.getByText("Observed 12s");
      expect(observed).toBeInTheDocument();
      expect(observed).not.toHaveAttribute("aria-live");
      expect(observed.closest("[aria-live]")).toBeNull();
    } finally {
      vi.useRealTimers();
    }
  });

  it.each([
    ["completed", false, "Completed"],
    ["failed", false, "Failed"],
    ["cancelled", false, "Cancelled"],
    ["completed", true, "Started in background"],
  ])("maps %s background=%s to %s", (status, background, expected) => {
    render(
      <Chat
        controller={
          new FakeChatController({
            activities: [
              agentTool({
                status,
                background,
                sessionId: "child-1",
              }),
            ],
          })
        }
      />,
    );
    expect(screen.getByText(expected)).toBeInTheDocument();
    expect(screen.queryByText(/Observed/)).not.toBeInTheDocument();
  });

  it("gates child navigation by protocol capability and controller phase", () => {
    const activity = agentTool({ status: "completed", sessionId: "child-1" });
    const unsupported = render(
      <Chat controller={new FakeChatController({ activities: [activity] })} />,
    );
    expect(
      screen.getByRole("button", { name: "Open child session" }),
    ).toBeDisabled();
    unsupported.unmount();

    const controller = new FakeChatController({
      activities: [activity],
      capabilities: {
        listSessions: false,
        loadSession: true,
        resumeSession: false,
        closeSession: false,
        deleteSession: false,
      },
    });
    render(<Chat controller={controller} />);

    const open = screen.getByRole("button", { name: "Open child session" });
    expect(open).toBeEnabled();
    fireEvent.click(open);
    expect(controller.openedChildSessions).toEqual(["child-1"]);

    act(() => controller.setSnapshot({ phase: "running" }));
    expect(open).toBeDisabled();
  });

  it("surfaces a child navigation failure through the existing action error", async () => {
    const controller = new FakeChatController({
      activities: [agentTool({ status: "completed", sessionId: "child-1" })],
      capabilities: {
        listSessions: false,
        loadSession: true,
        resumeSession: false,
        closeSession: false,
        deleteSession: false,
      },
    });
    controller.openChildSessionError = new Error(
      "Child transcript unavailable",
    );
    render(<Chat controller={controller} />);

    fireEvent.click(screen.getByRole("button", { name: "Open child session" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Child transcript unavailable",
    );
  });
});

describe("Child session header", () => {
  it("shows a compact lineage and lets ancestors navigate through the controller", () => {
    const controller = new FakeChatController({
      sessionId: "child-2",
      sessionTitle: "Current child transcript",
      sessionTrail: [
        { sessionId: "root", title: "Root conversation" },
        { sessionId: "child-1", title: "Explore files" },
      ],
    });
    const { container } = render(<Chat controller={controller} />);
    const header = container.querySelector<HTMLElement>(
      '[data-pretty-aui-slot="header"]',
    )!;

    expect(within(header).getByText("Current child transcript")).toBeVisible();
    fireEvent.click(
      within(header).getByRole("button", { name: "Root conversation" }),
    );
    expect(controller.openedAncestorSessions).toEqual(["root"]);
    expect(
      within(header).getByRole("button", { name: "Back to Explore files" }),
    ).toBeInTheDocument();
    expect(header.querySelector(".paui-lineage")).toHaveAttribute(
      "data-depth",
      "2",
    );
  });
});

describe("Interactions", () => {
  it("runs an advertised authentication method", () => {
    const controller = new FakeChatController({
      phase: "auth_required",
      authMethods: [
        {
          id: "terminal-login",
          name: "Sign in in terminal",
          type: "terminal",
          raw: {},
        },
      ],
    });
    render(<Chat controller={controller} />);
    fireEvent.click(
      screen.getByRole("button", { name: "Sign in in terminal" }),
    );
    expect(controller.authenticatedMethods).toEqual(["terminal-login"]);
  });

  it("returns exact permission and elicitation decisions", () => {
    const controller = new FakeChatController({
      interactions: [
        {
          type: "permission",
          id: "permission-1",
          title: "Read secrets?",
          options: [
            { id: "allow-once", name: "Allow once", kind: "allow_once" },
            { id: "reject-once", name: "Reject", kind: "reject_once" },
          ],
        },
        {
          type: "elicitation",
          id: "form-1",
          mode: "form",
          message: "Choose values",
          requestedSchema: {
            type: "object",
            properties: {
              count: { type: "integer", title: "Count" },
              optionalCount: { type: "number", title: "Optional count" },
              enabled: { type: "boolean", title: "Enabled" },
              note: { type: "string", title: "Note" },
            },
            required: ["count"],
          },
        },
      ],
    });
    render(<Chat controller={controller} />);
    fireEvent.click(screen.getByRole("button", { name: "Allow once" }));
    expect(controller.permissionDecisions).toEqual([
      {
        id: "permission-1",
        decision: { outcome: "selected", optionId: "allow-once" },
      },
    ]);

    fireEvent.change(screen.getByLabelText("Count"), {
      target: { value: "3" },
    });
    fireEvent.click(screen.getByLabelText("Enabled"));
    fireEvent.change(screen.getByLabelText("Note"), {
      target: { value: "Keep it short" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    expect(controller.elicitationDecisions).toEqual([
      {
        id: "form-1",
        decision: {
          action: "accept",
          content: { count: 3, enabled: true, note: "Keep it short" },
        },
      },
    ]);
  });

  it("moves focus to the first action of a newly shown interaction", () => {
    const controller = new FakeChatController({
      phase: "awaiting_user",
      interactions: [
        {
          type: "permission",
          id: "permission-focus",
          title: "Allow this action?",
          options: [{ id: "allow", name: "Allow", kind: "allow_once" }],
        },
      ],
    });
    render(<Chat controller={controller} />);

    expect(screen.getByRole("button", { name: "Allow" })).toHaveFocus();
  });

  it("returns explicit declines from URL and form elicitations", () => {
    const controller = new FakeChatController({
      interactions: [
        {
          type: "elicitation",
          id: "url-decline",
          mode: "url",
          message: "Finish in browser",
          url: "https://example.com/finish",
        },
        {
          type: "elicitation",
          id: "form-decline",
          mode: "form",
          message: "Provide details",
          requestedSchema: { type: "object", properties: {} },
        },
      ],
    });
    render(<Chat controller={controller} />);

    for (const decline of screen.getAllByRole("button", { name: "Decline" })) {
      fireEvent.click(decline);
    }

    expect(controller.elicitationDecisions).toEqual([
      { id: "url-decline", decision: { action: "decline" } },
      { id: "form-decline", decision: { action: "decline" } },
    ]);
  });

  it("reconnects only retryable errors", () => {
    const controller = new FakeChatController({
      error: { code: "BROKEN", message: "Connection lost", retryable: true },
    });
    render(<Chat controller={controller} />);
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(controller.reconnectCalls).toBe(1);
  });

  it("never opens an unsafe elicitation URL", () => {
    const open = vi.spyOn(window, "open").mockImplementation(() => null);
    const controller = new FakeChatController({
      interactions: [
        {
          type: "elicitation",
          id: "url-1",
          mode: "url",
          message: "Complete authentication",
          url: "javascript:alert(1)",
        },
      ],
    });
    render(<Chat controller={controller} />);
    expect(screen.getByRole("button", { name: "Open link" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "I've finished" }));
    expect(open).not.toHaveBeenCalled();
    expect(controller.elicitationDecisions).toEqual([
      { id: "url-1", decision: { action: "accept" } },
    ]);
    open.mockRestore();
  });
});

describe("Composer", () => {
  it("preserves a draft when the initial session becomes ready", () => {
    const controller = new FakeChatController({ phase: "connecting" });
    controller.clearSession();
    render(<Chat controller={controller} />);
    const composer = screen.getByLabelText("Ask anything…");
    fireEvent.input(composer, { target: { value: "first session draft" } });

    act(() => {
      controller.setSnapshot({ phase: "idle", sessionId: "session-1" });
    });

    expect(composer).toHaveValue("first session draft");
  });

  it("clears the draft when controller identity changes", () => {
    const first = new FakeChatController({ sessionId: "shared-session" });
    const second = new FakeChatController({ sessionId: "shared-session" });
    const view = render(<Chat controller={first} />);
    const composer = screen.getByLabelText("Ask anything…");
    fireEvent.input(composer, { target: { value: "belongs to first" } });

    view.rerender(<Chat controller={second} />);

    expect(screen.getByLabelText("Ask anything…")).toHaveValue("");
  });

  it("does not send during IME composition", () => {
    const controller = new FakeChatController();
    render(<Chat controller={controller} />);
    const composer = screen.getByLabelText("Ask anything…");
    fireEvent.input(composer, { target: { value: "你好" } });
    fireEvent.keyDown(composer, { key: "Enter", repeat: true });
    expect(controller.sent).toHaveLength(0);
    fireEvent.compositionStart(composer);
    fireEvent.keyDown(composer, { key: "Enter" });
    expect(controller.sent).toHaveLength(0);
    fireEvent.compositionEnd(composer);
    fireEvent.keyDown(composer, { key: "Enter" });
    expect(controller.sent).toEqual(["你好"]);
  });

  it("restores a draft after synchronous and asynchronous send failures", async () => {
    const synchronous = new FakeChatController();
    synchronous.sendError = new Error("not ready");
    const first = render(<Chat controller={synchronous} />);
    const firstComposer = screen.getByLabelText("Ask anything…");
    fireEvent.input(firstComposer, { target: { value: "keep sync" } });
    fireEvent.keyDown(firstComposer, { key: "Enter" });
    expect(firstComposer).toHaveValue("keep sync");
    first.unmount();

    const asynchronous = new FakeChatController();
    asynchronous.turnDone = Promise.reject(new Error("turn failed"));
    render(<Chat controller={asynchronous} />);
    const secondComposer = screen.getByLabelText("Ask anything…");
    fireEvent.input(secondComposer, { target: { value: "keep async" } });
    fireEvent.keyDown(secondComposer, { key: "Enter" });
    await waitFor(() => expect(secondComposer).toHaveValue("keep async"));
  });

  it("cancels a running turn", () => {
    const controller = new FakeChatController({ phase: "running" });
    render(<Chat controller={controller} />);
    fireEvent.click(screen.getByRole("button", { name: "Stop" }));
    expect(controller.cancelCalls).toBe(1);
  });

  it("surfaces an asynchronous cancellation failure", async () => {
    const controller = new FakeChatController({ phase: "running" });
    controller.cancelError = new Error("cancel transport failed");
    render(<Chat controller={controller} />);

    fireEvent.click(screen.getByRole("button", { name: "Stop" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "cancel transport failed",
    );
  });

  it("restores drafts per session while keeping one composer DOM node", () => {
    const controller = new FakeChatController();
    const { container } = render(<Chat controller={controller} />);
    const composer = screen.getByLabelText("Ask anything…");
    const region = container.querySelector(
      '[data-pretty-aui-slot="composer"]',
    )!;
    expect(region).toHaveAttribute("data-placement", "hero");
    fireEvent.input(composer, { target: { value: "session draft" } });

    act(() => {
      controller.setSnapshot({
        sessionId: "session-2",
        activities: [message("assistant", "new session activity")],
      });
    });
    expect(composer).toHaveValue("");
    expect(container.querySelector('[data-pretty-aui-slot="composer"]')).toBe(
      region,
    );
    expect(region).toHaveAttribute("data-placement", "docked");

    fireEvent.input(composer, { target: { value: "second draft" } });
    act(() => {
      controller.setSnapshot({
        sessionId: "session-1",
        activities: [],
      });
    });
    expect(composer).toHaveValue("session draft");
    act(() => {
      controller.setSnapshot({
        sessionId: "session-2",
        activities: [message("assistant", "new session activity")],
      });
    });
    expect(composer).toHaveValue("second draft");
  });

  it("does not restore a draft into a new incarnation of the same session ID", () => {
    const controller = new FakeChatController({
      sessionId: "reused-session",
      sessionInstanceId: "instance-1",
    });
    render(<Chat controller={controller} />);
    const composer = screen.getByLabelText("Ask anything…");
    fireEvent.input(composer, { target: { value: "old incarnation draft" } });

    act(() => {
      controller.setSnapshot({
        sessionId: "reused-session",
        sessionInstanceId: "instance-2",
      });
    });

    expect(composer).toHaveValue("");
  });

  it("applies commands and configuration through controller methods", () => {
    const controller = new FakeChatController({
      commands: [{ name: "review", description: "Review the workspace" }],
      configOptions: [
        {
          id: "model",
          name: "Model",
          type: "select",
          currentValue: "balanced",
          options: [
            { value: "fast", name: "Fast" },
            { value: "balanced", name: "Balanced" },
          ],
        },
      ],
    });
    render(<Chat controller={controller} />);
    const composer = screen.getByLabelText("Ask anything…");
    fireEvent.input(composer, { target: { value: "/rev" } });
    fireEvent.click(screen.getByRole("option", { name: /\/review/ }));
    expect(composer).toHaveValue("/review ");
    const model = screen.getByRole("combobox", { name: "Model" });
    fireEvent.click(model);
    fireEvent.click(screen.getByRole("option", { name: "Fast" }));
    expect(controller.configChanges).toEqual([{ id: "model", value: "fast" }]);
  });

  it("lets the host localize the normalized mode configuration label", () => {
    const controller = new FakeChatController({
      configOptions: [
        {
          id: "mode",
          name: "Mode",
          category: "mode",
          type: "select",
          currentValue: "plan",
          options: [
            { value: "plan", name: "Plan" },
            { value: "build", name: "Build" },
          ],
        },
      ],
    });

    render(<Chat controller={controller} labels={{ mode: "模式" }} />);

    expect(screen.getByRole("combobox", { name: "模式" })).toBeVisible();
    expect(screen.queryByRole("combobox", { name: "Mode" })).toBeNull();
  });

  it("keeps focus on package-owned configuration listboxes", () => {
    const controller = new FakeChatController({
      configOptions: [
        {
          id: "model",
          name: "Model",
          type: "select",
          currentValue: "balanced",
          options: [
            { value: "fast", name: "Fast" },
            { value: "balanced", name: "Balanced" },
          ],
        },
      ],
    });
    render(<Chat controller={controller} />);
    const model = screen.getByRole("combobox", { name: "Model" });
    model.focus();

    fireEvent.keyDown(model, { key: "ArrowUp" });
    expect(model).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("option", { name: "Fast" })).toHaveAttribute(
      "data-active",
      "true",
    );
    expect(document.activeElement).toBe(model);

    fireEvent.keyDown(model, { key: "Escape" });
    expect(screen.queryByRole("listbox", { name: "Model" })).toBeNull();
    expect(document.activeElement).toBe(model);

    fireEvent.keyDown(model, { key: "ArrowUp" });
    fireEvent.keyDown(model, { key: "Enter" });
    expect(controller.configChanges).toEqual([{ id: "model", value: "fast" }]);
    expect(document.activeElement).toBe(model);
  });

  it("navigates and dismisses command suggestions from the keyboard", () => {
    const controller = new FakeChatController({
      commands: [
        { name: "review", description: "Review the workspace" },
        { name: "rename", description: "Rename a symbol" },
      ],
    });
    render(<Chat controller={controller} />);
    const composer = screen.getByLabelText("Ask anything…");
    fireEvent.input(composer, { target: { value: "/r" } });
    const options = screen.getAllByRole("option");
    expect(options[0]).toHaveAttribute("aria-selected", "true");
    fireEvent.keyDown(composer, { key: "ArrowDown" });
    expect(options[1]).toHaveAttribute("aria-selected", "true");

    const reverseTab = new KeyboardEvent("keydown", {
      key: "Tab",
      shiftKey: true,
      bubbles: true,
      cancelable: true,
    });
    fireEvent(composer, reverseTab);
    expect(reverseTab.defaultPrevented).toBe(false);
    expect(composer).toHaveValue("/r");
    expect(screen.getByRole("listbox", { name: "Commands" })).toBeVisible();

    fireEvent.keyDown(composer, { key: "Tab" });
    expect(composer).toHaveValue("/rename ");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();

    fireEvent.input(composer, { target: { value: "/r" } });
    fireEvent.keyDown(composer, { key: "Escape" });
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("keeps every matching slash command available in the listbox", () => {
    const controller = new FakeChatController({
      commands: Array.from({ length: 12 }, (_, index) => ({
        name: `command-${String(index + 1).padStart(2, "0")}`,
        description: `Run command ${index + 1}`,
      })),
    });
    render(<Chat controller={controller} />);
    const composer = screen.getByLabelText("Ask anything…");

    fireEvent.input(composer, { target: { value: "/command" } });

    expect(screen.getAllByRole("option")).toHaveLength(12);
    expect(
      screen.getByRole("option", { name: /command-12/ }),
    ).toBeInTheDocument();
  });

  it("submits slash-command arguments instead of replacing them", () => {
    const controller = new FakeChatController({
      commands: [{ name: "greet", description: "Greet someone" }],
    });
    render(<Chat controller={controller} />);
    const composer = screen.getByLabelText("Ask anything…");
    fireEvent.input(composer, { target: { value: "/greet Bob world" } });

    fireEvent.keyDown(composer, { key: "Enter" });

    expect(controller.sent).toEqual(["/greet Bob world"]);
  });

  it("exposes keyboard semantics for command entry and transcript scrolling", () => {
    const controller = new FakeChatController({
      commands: [{ name: "review", description: "Review" }],
    });
    const { container } = render(<Chat controller={controller} />);
    const composer = screen.getByLabelText("Ask anything…");
    fireEvent.input(composer, { target: { value: "/rev" } });

    expect(composer).toHaveAttribute("role", "combobox");
    expect(composer).toHaveAttribute("aria-autocomplete", "list");
    expect(
      container.querySelector('[data-pretty-aui-slot="transcript"]'),
    ).toHaveAttribute("tabindex", "0");
  });
});

function message(
  role: "user" | "assistant" | "thought",
  text: string,
  timestamp?: number,
): Extract<ChatActivity, { type: "message" }> {
  return {
    type: "message",
    id: `${role}-${text}`,
    role,
    content: [{ type: "text", text }],
    ...(timestamp !== undefined ? { timestamp } : {}),
  };
}

function agentTool({
  status,
  sessionId,
  background = false,
}: {
  readonly status: string;
  readonly sessionId?: string;
  readonly background?: boolean;
}): Extract<ChatActivity, { type: "tool" }> {
  return {
    type: "tool",
    id: `agent-${status}-${sessionId ?? "pending"}`,
    title: "Inspect the client",
    kind: "think",
    status,
    content: [],
    locations: [],
    rawInput: {
      subagent_type: "explore",
      description: "Inspect the client",
    },
    subagent: {
      agent: "explore",
      description: "Inspect the client",
      ...(sessionId ? { sessionId } : {}),
      background,
    },
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
