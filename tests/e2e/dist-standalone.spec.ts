import { expect, test } from "@playwright/test";

test("runs the built standalone bundle against an offline ACP fixture", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const target = window as typeof window & { __CSP_VIOLATIONS__?: string[] };
    target.__CSP_VIOLATIONS__ = [];
    document.addEventListener("securitypolicyviolation", (event) => {
      target.__CSP_VIOLATIONS__?.push(
        `${event.effectiveDirective}:${event.blockedURI}`,
      );
    });
  });
  const response = await page.goto("http://127.0.0.1:4174/");
  expect(response?.headers()["content-security-policy"]).toContain(
    "style-src 'nonce-pretty-aui-test'",
  );
  await expect(page.locator("body")).toHaveAttribute("data-ready", "true");
  const chat = page.locator("#chat .pretty-aui");
  expect(
    await page
      .locator("#chat")
      .locator("style")
      .evaluate((element) => (element as HTMLStyleElement).nonce),
  ).toBe("pretty-aui-test");
  await expect(chat).toHaveAttribute("aria-label", "Production Fixture");
  const composer = chat.getByLabel("Ask anything…");
  await composer.fill("Use the production bundle");
  const send = chat.getByRole("button", { name: "Send" });
  await expect(send).toBeEnabled();
  await send.click();
  await expect(chat.getByText(/Production bundle answered 1\./)).toBeVisible();
  expect(
    await page.evaluate(
      () =>
        (window as typeof window & { __CSP_VIOLATIONS__?: string[] })
          .__CSP_VIOLATIONS__,
    ),
  ).toEqual([]);
});

test("keeps a fixed-height standalone host scrollable with a long transcript", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const target = window as typeof window & { __CSP_VIOLATIONS__?: string[] };
    target.__CSP_VIOLATIONS__ = [];
    document.addEventListener("securitypolicyviolation", (event) => {
      target.__CSP_VIOLATIONS__?.push(
        `${event.effectiveDirective}:${event.blockedURI}`,
      );
    });
  });
  await page.goto("http://127.0.0.1:4174/");
  await expect(page.locator("body")).toHaveAttribute("data-ready", "true");
  const host = page.locator("#chat");
  const chat = host.locator(".pretty-aui");
  const composer = chat.getByLabel("Ask anything…");
  for (let index = 1; index <= 8; index += 1) {
    await composer.fill(`Production scroll turn ${index}`);
    await chat.getByRole("button", { name: "Send" }).click();
    await expect(
      chat.getByText(`Production bundle answered ${index}.`),
    ).toBeVisible();
  }

  const transcript = chat.locator('[data-pretty-aui-slot="transcript"]');
  const geometry = await host.evaluate((element) => {
    const shadow = element.shadowRoot!;
    const wrapper = shadow.querySelector<HTMLElement>(
      ".pretty-aui-standalone-root",
    )!;
    const root = shadow.querySelector<HTMLElement>(".pretty-aui")!;
    const body = shadow.querySelector<HTMLElement>(".paui-body")!;
    const composerRegion = shadow.querySelector<HTMLElement>(
      '[data-pretty-aui-slot="composer"]',
    )!;
    body.scrollTop = 0;
    return {
      bodyClientHeight: body.clientHeight,
      bodyOverflowY: getComputedStyle(body).overflowY,
      bodyScrollHeight: body.scrollHeight,
      composerBottom: composerRegion.getBoundingClientRect().bottom,
      hostHeight: element.getBoundingClientRect().height,
      outerClientHeight: document.documentElement.clientHeight,
      outerScrollHeight: document.documentElement.scrollHeight,
      rootHeight: root.getBoundingClientRect().height,
      wrapperHeight: wrapper.getBoundingClientRect().height,
    };
  });
  expect(geometry.wrapperHeight).toBeCloseTo(geometry.hostHeight, 0);
  expect(geometry.rootHeight).toBeCloseTo(geometry.hostHeight, 0);
  expect(geometry.bodyOverflowY).toBe("auto");
  expect(geometry.bodyScrollHeight).toBeGreaterThan(geometry.bodyClientHeight);
  expect(geometry.composerBottom).toBeLessThanOrEqual(
    page.viewportSize()!.height,
  );
  expect(geometry.outerScrollHeight).toBeLessThanOrEqual(
    geometry.outerClientHeight,
  );

  await transcript.hover();
  await page.mouse.wheel(0, 600);
  await expect
    .poll(() => transcript.evaluate((element) => element.scrollTop))
    .toBeGreaterThan(0);
  await expect(composer).toBeInViewport();
  expect(
    await page.evaluate(
      () =>
        (window as typeof window & { __CSP_VIOLATIONS__?: string[] })
          .__CSP_VIOLATIONS__,
    ),
  ).toEqual([]);
});

test("keeps the latest activity and return-to-bottom control next to the composer", async ({
  page,
}) => {
  await page.goto("http://127.0.0.1:4174/");
  await expect(page.locator("body")).toHaveAttribute("data-ready", "true");
  const chat = page.locator("#chat .pretty-aui");
  const composer = chat.getByLabel("Ask anything…");
  await composer.fill("Production bottom spacing");
  await chat.getByRole("button", { name: "Send" }).click();
  await expect(chat.getByText("Production bundle answered 1.")).toBeVisible();

  const transcript = chat.locator('[data-pretty-aui-slot="transcript"]');
  const lastActivity = chat.locator('[data-pretty-aui-slot="activity"]').last();
  await transcript.evaluate((element) => {
    element.scrollTop = element.scrollHeight;
  });
  await expect
    .poll(() =>
      transcript.evaluate(
        (element) =>
          element.scrollHeight - element.clientHeight - element.scrollTop,
      ),
    )
    .toBeLessThanOrEqual(1);

  const [transcriptBox, activityBox] = await Promise.all([
    transcript.boundingBox(),
    lastActivity.boundingBox(),
  ]);
  expect(transcriptBox).not.toBeNull();
  expect(activityBox).not.toBeNull();
  expect
    .soft(
      transcriptBox!.y +
        transcriptBox!.height -
        (activityBox!.y + activityBox!.height),
    )
    .toBeLessThanOrEqual(48);

  await transcript.evaluate((element) => {
    element.scrollTop = Math.max(
      0,
      element.scrollHeight - element.clientHeight - 160,
    );
    element.dispatchEvent(new Event("scroll"));
  });
  const latest = chat.getByRole("button", {
    name: "Scroll to latest message",
  });
  await expect(latest).toBeVisible();
  const [currentTranscriptBox, latestBox] = await Promise.all([
    transcript.boundingBox(),
    latest.boundingBox(),
  ]);
  expect(currentTranscriptBox).not.toBeNull();
  expect(latestBox).not.toBeNull();
  expect(latestBox!.y).toBeGreaterThanOrEqual(
    currentTranscriptBox!.y + currentTranscriptBox!.height,
  );
  expect
    .soft(
      currentTranscriptBox!.y +
        currentTranscriptBox!.height -
        (latestBox!.y + latestBox!.height),
    )
    .toBeLessThanOrEqual(24);
});

test("bounds a long standalone session list to the fixed-height host", async ({
  page,
}) => {
  await page.goto("http://127.0.0.1:4174/");
  await expect(page.locator("body")).toHaveAttribute("data-ready", "true");
  const host = page.locator("#chat");
  const chat = host.locator(".pretty-aui");
  const newChat = chat.getByRole("button", { name: "New chat" });
  for (let index = 0; index < 12; index += 1) {
    await newChat.click();
    await expect(newChat).toBeEnabled();
  }
  await chat.getByRole("button", { name: "Sessions" }).click();
  const list = chat.locator(".paui-session-list");
  await expect(list).toBeVisible();

  const geometry = await host.evaluate((element) => {
    const shadow = element.shadowRoot!;
    const root = shadow.querySelector<HTMLElement>(".pretty-aui")!;
    const backdrop = shadow.querySelector<HTMLElement>(
      ".paui-drawer-backdrop",
    )!;
    const drawer = shadow.querySelector<HTMLElement>(".paui-drawer")!;
    const list = shadow.querySelector<HTMLElement>(".paui-session-list")!;
    const hostBox = element.getBoundingClientRect();
    const rootBox = root.getBoundingClientRect();
    const backdropBox = backdrop.getBoundingClientRect();
    const drawerBox = drawer.getBoundingClientRect();
    const listBox = list.getBoundingClientRect();
    return {
      backdropBottom: backdropBox.bottom,
      backdropHeight: backdropBox.height,
      drawerBottom: drawerBox.bottom,
      hostBottom: hostBox.bottom,
      hostHeight: hostBox.height,
      listBottom: listBox.bottom,
      listClientHeight: list.clientHeight,
      listOverflowY: getComputedStyle(list).overflowY,
      listScrollHeight: list.scrollHeight,
      rootBottom: rootBox.bottom,
      rootHeight: rootBox.height,
    };
  });
  expect(geometry.rootHeight).toBeCloseTo(geometry.hostHeight, 0);
  expect(geometry.backdropHeight).toBeLessThanOrEqual(geometry.hostHeight + 1);
  expect(geometry.rootBottom).toBeLessThanOrEqual(geometry.hostBottom + 1);
  expect(geometry.backdropBottom).toBeLessThanOrEqual(geometry.hostBottom + 1);
  expect(geometry.drawerBottom).toBeLessThanOrEqual(geometry.hostBottom + 1);
  expect(geometry.listBottom).toBeLessThanOrEqual(geometry.drawerBottom + 1);
  expect(geometry.listClientHeight).toBeGreaterThan(200);
  expect(geometry.listOverflowY).toBe("auto");
  expect(geometry.listScrollHeight).toBeGreaterThan(geometry.listClientHeight);

  await list.evaluate((element) => {
    element.scrollTop = element.scrollHeight;
  });
  await expect
    .poll(() => list.evaluate((element) => element.scrollTop))
    .toBeGreaterThan(0);
});
