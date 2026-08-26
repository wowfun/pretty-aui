import { expect, test } from "@playwright/test";

test("streams ACP activity and keeps the package-owned content safe", async ({
  page,
}) => {
  await page.goto("/?scheme=light");
  const root = page.locator('[data-pretty-aui-slot="root"]');
  await expect(root).toHaveAttribute("data-surface", "inline");
  const composer = page.getByLabel("Ask anything…");
  await expect(composer).toBeEnabled();
  const composerRegion = page.locator('[data-pretty-aui-slot="composer"]');
  await expect(composerRegion).toHaveAttribute("data-placement", "hero");
  const composerHandle = await composerRegion.elementHandle();

  await composer.fill("xss visual check");
  await composer.press("Enter");
  await expect(page.getByText("answer", { exact: true })).toBeVisible();
  await expect(composerRegion).toHaveAttribute("data-placement", "docked");
  expect(
    await composerRegion.evaluate(
      (element, previous) => element === previous,
      composerHandle,
    ),
  ).toBe(true);
  expect(await root.evaluate((element) => element.scrollTop)).toBe(0);
  const thought = page.locator(".paui-thought");
  await expect(thought).not.toHaveAttribute("open", "");
  await expect(thought.locator(".paui-flow-preview")).toHaveText(
    "Checking the request against the workspace.",
  );
  await page.getByText("Think", { exact: true }).click();
  await expect(thought).toHaveAttribute("open", "");
  await expect(page.locator(".paui-thought .paui-markdown")).toHaveText(
    "Checking the request against the workspace.",
  );
  await expect(
    page.locator('[data-pretty-aui-slot="message"][data-role="assistant"]'),
  ).toHaveCount(1);
  const tool = page.locator(".paui-tool");
  await expect(tool).not.toHaveAttribute("open", "");
  await expect(tool.locator(".paui-flow-title")).toHaveText("Read");
  await expect(tool.locator(".paui-flow-preview")).toHaveText(
    "Read project notes",
  );
  await tool.locator("summary").click();
  await expect(tool).toHaveAttribute("open", "");
  await expect(tool.locator(".paui-disclosure__body")).toContainText(
    "Found 3 relevant notes.",
  );
  await expect(page.locator("img[onerror]")).toHaveCount(0);
  await expect(root).toHaveAttribute("data-phase", "idle");
});

test("uses the host surface and scheme without changing global page layout", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/?scheme=dark&surface=sidebar");
  const root = page.locator('[data-pretty-aui-slot="root"]');
  await expect(root).toHaveAttribute("data-scheme", "dark");
  await expect(root).toHaveAttribute("data-surface", "sidebar");
  await expect(page.getByLabel("Ask anything…")).toBeInViewport();
  await expect(root).toHaveCSS("overflow", "clip");
  await expect(page.locator("body")).toHaveCSS("overflow", "visible");
  const overflow = await root.evaluate(
    (element) => element.scrollWidth - element.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
});

test("scrolls a long session list over a transparent backdrop", async ({
  page,
}) => {
  await page.goto("/?scheme=light");
  await expect(page.getByLabel("Ask anything…")).toBeEnabled();
  await page.evaluate(async () => {
    const controller = (
      window as typeof window & {
        __PRETTY_AUI__?: { newSession(): Promise<void> };
      }
    ).__PRETTY_AUI__;
    if (!controller) throw new Error("Demo controller is unavailable");
    for (let index = 0; index < 24; index += 1) {
      await controller.newSession();
    }
  });

  await page.getByRole("button", { name: "Sessions" }).click();
  const list = page.locator(".paui-session-list");
  await expect(page.getByText("Conversation 1", { exact: true })).toBeVisible();
  const geometry = await list.evaluate((element) => {
    const node = element as HTMLElement;
    const style = getComputedStyle(node);
    node.scrollTop = node.scrollHeight;
    return {
      backdropHeight: document
        .querySelector(".paui-drawer-backdrop")!
        .getBoundingClientRect().height,
      clientHeight: node.clientHeight,
      overflowY: style.overflowY,
      rootHeight: document.querySelector(".pretty-aui")!.getBoundingClientRect()
        .height,
      scrollHeight: node.scrollHeight,
      scrollTop: node.scrollTop,
    };
  });
  expect(geometry.overflowY).toBe("auto");
  expect(geometry.backdropHeight).toBeGreaterThanOrEqual(
    geometry.rootHeight - 2,
  );
  expect(geometry.clientHeight).toBeGreaterThan(200);
  expect(geometry.scrollHeight).toBeGreaterThan(geometry.clientHeight);
  expect(geometry.scrollTop).toBeGreaterThan(0);

  const backdrop = page.locator(".paui-drawer-backdrop");
  await expect(backdrop).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  await expect(backdrop).toHaveCSS("backdrop-filter", "none");
});

test("reopens a demo session without a pre-injected user message", async ({
  page,
}) => {
  await page.goto("/?scheme=light");
  const composer = page.getByLabel("Ask anything…");
  await expect(composer).toBeEnabled();
  await composer.fill("Only the words I entered");
  await composer.press("Enter");
  await expect(page.getByText("Ready", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "New chat" }).click();
  await page.getByRole("button", { name: "Sessions" }).click();
  await page.getByRole("button", { name: /Conversation 1/ }).click();
  await expect(
    page.getByText("Replayed history", { exact: true }),
  ).toBeVisible();

  const userMessage = page.locator(
    '[data-pretty-aui-slot="message"][data-role="user"]',
  );
  await expect(userMessage).toHaveCount(1);
  await expect(userMessage).toContainText("Only the words I entered");
  await expect(userMessage).not.toContainText(
    "The user is viewing the pretty-aui integration guide.",
  );
});

test("updates the header when the agent publishes a session title", async ({
  page,
}) => {
  await page.goto("/?scheme=light");
  const header = page.locator('[data-pretty-aui-slot="header"]');
  await expect(
    header.getByText("Untitled session", { exact: true }),
  ).toBeVisible();

  const composer = page.getByLabel("Ask anything…");
  await composer.fill("Publish the session title");
  await composer.press("Enter");

  await expect(
    header.getByText("Conversation 1", { exact: true }),
  ).toBeVisible();
  await expect(
    header.getByText("Untitled session", { exact: true }),
  ).toHaveCount(0);
});

test("runs the typechecked manual macro composition", async ({ page }) => {
  await page.goto("/?composition=manual&surface=sidebar");
  await expect(page.locator('[data-pretty-aui-slot="header"]')).toBeVisible();
  await expect(
    page.locator('[data-pretty-aui-slot="transcript"]'),
  ).toBeVisible();
  await expect(
    page.locator('[data-pretty-aui-slot="interactions"]'),
  ).toBeAttached();
  await expect(page.locator('[data-pretty-aui-slot="composer"]')).toBeVisible();
});

test("matches the DSH primary send and stop control contract", async ({
  page,
}) => {
  await page.goto("/?scheme=light");
  const composer = page.getByLabel("Ask anything…");
  await expect(composer).toBeEnabled();
  await composer.fill("permission");
  await expect(composer).toHaveCSS("outline-style", "none");
  const composerCard = page.locator(".paui-composer");
  await expect(composerCard).toHaveCSS("border-radius", "22px");
  await expect(composer).toHaveCSS("min-height", "52px");
  await expect(composer).toHaveCSS("max-height", "336px");
  expect((await composerCard.boundingBox())?.width).toBe(780);

  const send = page.getByRole("button", { name: "Send" });
  await expect(send).toBeEnabled();
  await expect(send).toHaveCSS("width", "34px");
  await expect(send).toHaveCSS("height", "34px");
  await expect(send).toHaveCSS("border-radius", "999px");
  await expect(send).toHaveCSS("background-color", "rgb(65, 118, 230)");
  await expect(send).toHaveCSS("color", "rgb(255, 255, 255)");
  await expect(send).toHaveCSS("transform", "matrix(1, 0, 0, 1, 0, -2)");
  await expect(send.locator("path")).toHaveAttribute(
    "d",
    "M8.3125.9802c.3552.0729.6665.224 0.9502.4521.2245.1807.4676.4256.7168.6748L14.707 6.8347 13.293 8.2487 9 3.9558v11.0859H7V3.9558L2.707 8.2487 1.293 6.8347l4.7275-4.7276c.2492-.2492.4923-.4941.7168-.6748.2393-.1924.5471-.3883.9502-.4521.2098-.0332.4156-.025.625 0Z",
  );
  await send.hover();
  await expect(send).toHaveCSS("background-color", "rgb(103, 158, 254)");

  await composer.press("Enter");
  const stop = page.getByRole("button", { name: "Stop" });
  await expect(stop).toBeVisible();
  await expect(stop).toHaveCSS("width", "34px");
  await expect(stop).toHaveCSS("height", "34px");
  await expect(stop.locator("rect")).toHaveAttribute("width", "10");
  await expect(stop.locator("rect")).toHaveAttribute("height", "10");
  await expect(stop.locator("rect")).toHaveAttribute("rx", "3");
  await page.getByRole("button", { name: "Reject" }).click();
});

test("follows the trailing line of a live DSH reasoning row", async ({
  page,
}) => {
  await page.goto("/?scheme=light&thoughtDelay=5000");
  const composer = page.getByLabel("Ask anything…");
  await expect(composer).toBeEnabled();
  await composer.fill("streaming tail");
  await composer.press("Enter");

  const thought = page.locator(".paui-thought");
  await expect(thought).toHaveAttribute("data-running", "true");
  await expect(thought).not.toHaveAttribute("open", "");
  const preview = thought.locator(".paui-flow-preview");
  await expect(preview).toHaveText(
    "The newest live reasoning fragment stays visible at the trailing edge while more tokens arrive, keeping the live tail anchored without wrapping or replacing the expanded reasoning body.",
  );
  const scroll = await preview.evaluate((element) => ({
    clientWidth: element.clientWidth,
    scrollLeft: element.scrollLeft,
    scrollWidth: element.scrollWidth,
  }));
  expect(scroll.scrollWidth).toBeGreaterThan(scroll.clientWidth);
  expect(scroll.scrollLeft + scroll.clientWidth).toBeGreaterThanOrEqual(
    scroll.scrollWidth - 1,
  );
  const summary = thought.locator("summary");
  await expect(summary).toHaveCSS("height", "24px");
  await expect(thought.locator(".paui-flow-leading")).toHaveCSS(
    "width",
    "16px",
  );
  await expect(thought.locator(".paui-flow-leading")).toHaveCSS(
    "height",
    "16px",
  );
  await expect(thought.locator(".paui-flow-title")).toHaveCSS(
    "font-size",
    "14px",
  );
  await expect(thought.locator(".paui-flow-title")).toHaveCSS(
    "line-height",
    "24px",
  );
  const separator = thought.locator(".paui-flow-separator");
  await expect(separator).toHaveCSS("width", "2px");
  await expect(separator).toHaveCSS("height", "2px");
  await thought.locator("summary").click();
  await expect(thought).toHaveAttribute("open", "");
  const body = thought.locator(".paui-thought__body");
  await expect(body).toContainText("Opening context");
  await expect(body).toHaveCSS("padding-left", "22px");
  await expect(body).toHaveCSS("font-size", "14px");
  await expect(body).toHaveCSS("line-height", "24px");
});

test("shows a truthful Agent state, opens its child transcript, and returns through the lineage", async ({
  page,
}) => {
  await page.goto("/?scheme=light&subagentDelay=2200");
  const composer = page.getByLabel("Ask anything…");
  await expect(composer).toBeEnabled();
  await composer.fill("Use a subagent to inspect the client");
  await composer.press("Enter");

  const row = page.locator('[data-kind="subagent"]');
  const agent = row.locator(".paui-subagent");
  await expect(agent).toHaveAttribute("data-running", "true");
  await expect(agent.locator(".paui-flow-title")).toHaveText("Explore Agent");
  await expect(agent.locator(".paui-flow-preview")).toHaveText(
    "Inspect the client packages",
  );
  await expect(agent.locator(".paui-subagent-status")).toContainText(
    /OngoingObserved [12]s/,
  );
  await expect(
    page.getByRole("button", { name: "Open child session" }),
  ).toHaveCount(0);
  await expect(agent.locator("summary")).toHaveCSS("height", "24px");
  await expect(agent.locator(".paui-flow-title")).toHaveCSS(
    "font-size",
    "14px",
  );

  const openChild = page.getByRole("button", { name: "Open child session" });
  await expect(openChild).toBeEnabled();
  await expect(agent).not.toHaveAttribute("data-running", "true");
  await expect(agent.locator(".paui-subagent-status")).toHaveText("Completed");
  await openChild.click();

  await expect(
    page.getByText(
      "Child agent inspected the client package and reported its structure.",
      { exact: true },
    ),
  ).toBeVisible();
  const header = page.locator('[data-pretty-aui-slot="header"]');
  await expect(
    header.getByText("Explore client package architecture and ownership", {
      exact: true,
    }),
  ).toBeVisible();
  await header.getByRole("button", { name: "Conversation 1" }).click();
  await expect(
    header.getByText("Conversation 1", { exact: true }),
  ).toBeVisible();
  await expect(
    page
      .locator('[data-role="user"]')
      .getByText("Use a subagent to inspect the client", { exact: true }),
  ).toBeVisible();
});

test("uses a static ongoing Agent marker with reduced motion", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/?scheme=light&subagentDelay=5000");
  const composer = page.getByLabel("Ask anything…");
  await expect(composer).toBeEnabled();
  await composer.fill("Use a subagent with reduced motion");
  await composer.press("Enter");

  const status = page.locator('[data-kind="subagent"] .paui-subagent-status');
  await expect(status).toContainText("Ongoing");
  await expect(status.locator(".paui-subagent-status__spinner")).toHaveCSS(
    "animation-name",
    "none",
  );
});

for (const compact of [
  { name: "390px narrow", url: "/?scheme=light", stageWidth: undefined },
  {
    name: "sidebar",
    url: "/?scheme=light&surface=sidebar",
    stageWidth: 360,
  },
] as const) {
  test(`uses compact child lineage in the ${compact.name} composition`, async ({
    page,
  }) => {
    await page.setViewportSize({
      width: compact.stageWidth ? 440 : 390,
      height: 844,
    });
    await page.goto(compact.url);
    if (compact.stageWidth) {
      await page.locator(".demo-stage").evaluate((element, width) => {
        const stage = element as HTMLElement;
        stage.style.width = `${width}px`;
        stage.style.maxWidth = "none";
        stage.style.padding = "0";
      }, compact.stageWidth);
    }
    const composer = page.getByLabel("Ask anything…");
    await expect(composer).toBeEnabled();
    await composer.fill("Use a subagent to inspect the client");
    await composer.press("Enter");
    await page.getByRole("button", { name: "Open child session" }).click();

    const header = page.locator('[data-pretty-aui-slot="header"]');
    await expect(
      header.getByRole("button", { name: "Back to Conversation 1" }),
    ).toBeVisible();
    await expect(header.locator(".paui-lineage__ancestor")).toBeHidden();
    const title = header.locator(".paui-lineage__titles strong");
    await expect(title).toHaveCSS("text-overflow", "ellipsis");
    await expect(title).toHaveCSS("white-space", "nowrap");
    const geometry = await title.evaluate((element) => ({
      clientWidth: element.clientWidth,
      scrollWidth: element.scrollWidth,
      rootOverflow:
        document.querySelector(".pretty-aui")!.scrollWidth -
        document.querySelector(".pretty-aui")!.clientWidth,
    }));
    expect(geometry.scrollWidth).toBeGreaterThan(geometry.clientWidth);
    expect(geometry.rootOverflow).toBeLessThanOrEqual(0);
  });
}

for (const width of [320, 390, 560, 1024]) {
  test(`fits a ${width}px host container without horizontal overflow`, async ({
    page,
  }) => {
    await page.setViewportSize({
      width: Math.max(width + 80, 420),
      height: 840,
    });
    await page.goto("/?scheme=light");
    await page.locator(".demo-stage").evaluate((element, hostWidth) => {
      const stage = element as HTMLElement;
      stage.style.width = `${hostWidth}px`;
      stage.style.maxWidth = "none";
      stage.style.padding = "0";
    }, width);
    const root = page.locator('[data-pretty-aui-slot="root"]');
    const geometry = await root.evaluate((element) => ({
      clientWidth: element.clientWidth,
      scrollWidth: element.scrollWidth,
      bodyPosition: getComputedStyle(document.body).position,
    }));
    expect(geometry.clientWidth).toBeGreaterThanOrEqual(width - 4);
    expect(geometry.clientWidth).toBeLessThanOrEqual(width);
    expect(geometry.scrollWidth).toBeLessThanOrEqual(geometry.clientWidth);
    expect(geometry.bodyPosition).toBe("static");
  });
}
