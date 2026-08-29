import { fireEvent, waitFor, within } from "@testing-library/dom";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { mountChat } from "../../src/standalone.js";
import { createV1Harness } from "../helpers/agents.js";
import { FakeChatController } from "../helpers/controller.js";

describe("standalone mount", () => {
  it("refuses to reuse a host-owned shadow root", async () => {
    const harness = createV1Harness();
    const target = document.createElement("div");
    const shadow = target.attachShadow({ mode: "open" });
    const hostContent = document.createElement("span");
    hostContent.textContent = "host-owned";
    shadow.append(hostContent);

    expect(() =>
      mountChat(target, {
        options: {
          connector: harness.connector,
          session: { cwd: "/standalone" },
        },
      }),
    ).toThrow(/shadow root/i);
    expect(shadow.textContent).toBe("host-owned");
    expect(harness.attempts).toHaveLength(0);
    await harness.close();
  });

  it("rejects a duplicate mount and keeps a replacement safe from an old handle", async () => {
    const firstHarness = createV1Harness();
    const secondHarness = createV1Harness();
    const target = document.createElement("div");
    const first = mountChat(target, {
      options: {
        connector: firstHarness.connector,
        session: { cwd: "/first" },
      },
    });
    await first.ready;

    expect(() =>
      mountChat(target, {
        options: {
          connector: secondHarness.connector,
          session: { cwd: "/duplicate" },
        },
      }),
    ).toThrow(/already mounted/i);
    await first.unmount();

    const second = mountChat(target, {
      options: {
        connector: secondHarness.connector,
        session: { cwd: "/second" },
      },
    });
    await second.ready;
    await waitFor(() =>
      expect(target.shadowRoot?.querySelector(".pretty-aui")).toBeTruthy(),
    );
    await first.unmount();
    expect(target.shadowRoot?.querySelector(".pretty-aui")).toBeTruthy();

    await second.unmount();
    await firstHarness.close();
    await secondHarness.close();
  });

  it("mounts the shared composition with presentation options in Shadow DOM", async () => {
    const harness = createV1Harness();
    const target = document.createElement("div");
    target.style.setProperty("--pretty-aui-color-background", "rgb(1 2 3)");
    document.body.append(target);
    const mounted = mountChat(target, {
      options: {
        connector: harness.connector,
        session: { cwd: "/standalone" },
      },
      surface: "sidebar",
      colorScheme: "dark",
      labels: { composerPlaceholder: "Standalone prompt" },
    });

    await mounted.ready;
    await waitFor(() =>
      expect(target.shadowRoot!.querySelector(".pretty-aui")).toBeTruthy(),
    );
    const root = target.shadowRoot!.querySelector(".pretty-aui")!;
    expect(root).toHaveAttribute("data-surface", "sidebar");
    expect(root).toHaveAttribute("data-scheme", "dark");
    expect(target.shadowRoot!.querySelector("textarea")).toHaveAttribute(
      "aria-label",
      "Standalone prompt",
    );
    expect(target.shadowRoot!.querySelector("style")).toBeInTheDocument();
    const stylesheet = readFileSync(resolve("src/styles.css"), "utf8");
    expect(stylesheet).toMatch(/var\(\s*--pretty-aui-color-background\s*,/);
    expect(stylesheet).not.toMatch(/--pretty-aui-color-background\s*:/);
    expect(stylesheet).not.toMatch(/\bdvh\b/);
    expect(stylesheet).toContain(
      ".pretty-aui-standalone-root > .pretty-aui {\n  height: 100%;\n  min-height: 0;\n}",
    );
    expect(target.style.getPropertyValue("--pretty-aui-color-background")).toBe(
      "rgb(1 2 3)",
    );

    await mounted.unmount();
    await mounted.unmount();
    expect(target.shadowRoot!.childNodes).toHaveLength(0);
    await waitFor(() => expect(harness.abortedAttempts).toBe(1));
    await harness.close();
    target.remove();
  });

  it("destroys an owned controller when its connected host is removed", async () => {
    const harness = createV1Harness();
    const target = document.createElement("div");
    document.body.append(target);
    const mounted = mountChat(target, {
      options: {
        connector: harness.connector,
        session: { cwd: "/removed" },
      },
    });
    await mounted.ready;

    target.remove();

    await waitFor(() => expect(harness.abortedAttempts).toBe(1));
    expect(target.shadowRoot?.childNodes).toHaveLength(0);
    await mounted.unmount();
    await harness.close();
  });

  it("observes only the connected host ancestry for automatic cleanup", async () => {
    const observe = vi.spyOn(MutationObserver.prototype, "observe");
    const harness = createV1Harness();
    const ancestor = document.createElement("section");
    const target = document.createElement("div");
    ancestor.append(target);
    document.body.append(ancestor);
    const mounted = mountChat(target, {
      options: {
        connector: harness.connector,
        session: { cwd: "/scoped-observer" },
      },
    });
    await mounted.ready;

    expect(observe).not.toHaveBeenCalledWith(
      document.documentElement,
      expect.objectContaining({ subtree: true }),
    );

    ancestor.remove();
    await waitFor(() => expect(harness.abortedAttempts).toBe(1));
    await mounted.unmount();
    await harness.close();
    observe.mockRestore();
  });

  it("keeps the session drawer focus trap inside its ShadowRoot", async () => {
    const harness = createV1Harness();
    const target = document.createElement("div");
    document.body.append(target);
    const mounted = mountChat(target, {
      options: {
        connector: harness.connector,
        session: { cwd: "/shadow-focus" },
      },
    });
    try {
      await mounted.ready;
      await mounted.controller.newSession();
      const shadow = target.shadowRoot!;
      const shadowQueries = within(shadow as unknown as HTMLElement);
      await waitFor(() =>
        expect(
          shadowQueries.getByRole("button", { name: "Sessions" }),
        ).toBeTruthy(),
      );
      fireEvent.click(shadowQueries.getByRole("button", { name: "Sessions" }));
      const dialog = await shadowQueries.findByRole("dialog");
      await waitFor(() =>
        expect(dialog.querySelectorAll("button").length).toBeGreaterThan(1),
      );
      const focusable = [
        ...dialog.querySelectorAll<HTMLButtonElement>("button"),
      ].filter((button) => !button.disabled);
      const middle = focusable[1];
      if (!middle)
        throw new Error("Fixture did not render a second drawer action");
      middle.focus();
      expect(shadow.activeElement).toBe(middle);

      fireEvent.keyDown(window, { key: "Tab" });

      expect(shadow.activeElement).toBe(middle);
    } finally {
      await mounted.unmount();
      await harness.close();
      target.remove();
    }
  });

  it("cleans owned nodes even when controller destruction rejects", async () => {
    const harness = createV1Harness();
    const target = document.createElement("div");
    document.body.append(target);
    const mounted = mountChat(target, {
      options: {
        connector: harness.connector,
        session: { cwd: "/destroy-failure" },
      },
    });
    await mounted.ready;
    const destroy = mounted.controller.destroy.bind(mounted.controller);
    Object.defineProperty(mounted.controller, "destroy", {
      configurable: true,
      value: vi.fn().mockRejectedValue(new Error("destroy failed")),
    });
    try {
      await expect(mounted.unmount()).rejects.toThrow("destroy failed");
      expect(target.shadowRoot?.childNodes).toHaveLength(0);
      await mounted.unmount();
    } finally {
      await destroy();
      await harness.close();
      target.remove();
    }
  });

  it("observes host ancestry when mounted beneath a foreign ShadowRoot", async () => {
    const harness = createV1Harness();
    const ancestor = document.createElement("section");
    const foreignHost = document.createElement("div");
    const foreignShadow = foreignHost.attachShadow({ mode: "open" });
    const target = document.createElement("div");
    foreignShadow.append(target);
    ancestor.append(foreignHost);
    document.body.append(ancestor);
    const mounted = mountChat(target, {
      options: {
        connector: harness.connector,
        session: { cwd: "/nested-shadow" },
      },
    });
    try {
      await mounted.ready;

      ancestor.remove();

      await waitFor(() => expect(harness.abortedAttempts).toBe(1), {
        timeout: 250,
      });
      expect(target.shadowRoot?.childNodes).toHaveLength(0);
    } finally {
      await mounted.unmount();
      await harness.close();
    }
  });

  it("borrows a controller without destroying it on explicit or automatic unmount", async () => {
    const controller = new FakeChatController();
    const firstTarget = document.createElement("div");
    document.body.append(firstTarget);
    const first = mountChat(firstTarget, { controller });
    await first.ready;

    await first.unmount();
    expect(controller.destroyCalls).toBe(0);

    const secondTarget = document.createElement("div");
    document.body.append(secondTarget);
    const second = mountChat(secondTarget, { controller });
    await second.ready;
    secondTarget.remove();

    await waitFor(() =>
      expect(secondTarget.shadowRoot?.childNodes).toHaveLength(0),
    );
    expect(controller.destroyCalls).toBe(0);
    await second.unmount();
    firstTarget.remove();
  });

  it("applies a CSP nonce and exposes bounded composer controls", async () => {
    const controller = new FakeChatController();
    const target = document.createElement("div");
    document.body.append(target);
    const mounted = mountChat(target, {
      controller,
      styleNonce: "test-nonce_123=",
    });
    await mounted.ready;
    const textarea = await within(
      target.shadowRoot as unknown as HTMLElement,
    ).findByRole("combobox");

    expect(target.shadowRoot?.querySelector("style")).toHaveAttribute(
      "nonce",
      "test-nonce_123=",
    );
    mounted.setDraft("host supplied draft", { focus: true });
    expect(textarea).toHaveValue("host supplied draft");
    expect(target.shadowRoot?.activeElement).toBe(textarea);
    textarea.blur();
    mounted.focusComposer();
    expect(target.shadowRoot?.activeElement).toBe(textarea);
    expect(() => mounted.setDraft("x".repeat(1_048_577))).toThrow(/draft/i);

    await mounted.unmount();
    expect(() => mounted.focusComposer()).toThrow(/unmounted/i);
  });

  it("rejects invalid standalone boundary options before touching the host", () => {
    const controller = new FakeChatController();
    const target = document.createElement("div");

    expect(() =>
      mountChat(target, { controller, styleNonce: "not a nonce!" }),
    ).toThrow(/nonce/i);
    expect(target.shadowRoot).toBeNull();
    expect(() =>
      mountChat(target, {
        controller,
        options: {} as never,
      } as never),
    ).toThrow(/exactly one/i);
    expect(target.shadowRoot).toBeNull();
  });
});
