import { expect, test, type Page } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light", reducedMotion: "reduce" });
});

test("empty inline light matches the reviewed baseline", async ({ page }) => {
  await page.goto("/?scheme=light");
  await expect(page.getByLabel("Ask anything…")).toBeEnabled();
  await expect(chat(page)).toHaveScreenshot("empty-inline-light.png", {
    animations: "disabled",
  });
});

test("populated inline light matches the reviewed baseline", async ({
  page,
}) => {
  await openPopulated(page, "light");
  await expect(chat(page)).toHaveScreenshot("populated-inline-light.png", {
    animations: "disabled",
  });
});

test("populated inline dark matches the reviewed baseline", async ({
  page,
}) => {
  await openPopulated(page, "dark");
  await expect(chat(page)).toHaveScreenshot("populated-inline-dark.png", {
    animations: "disabled",
  });
});

test("390px narrow composition matches the reviewed baseline", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openPopulated(page, "light");
  await expect(chat(page)).toHaveScreenshot("narrow-390-light.png", {
    animations: "disabled",
  });
});

test("360px sidebar composition matches the reviewed baseline", async ({
  page,
}) => {
  await page.setViewportSize({ width: 440, height: 820 });
  await page.goto("/?scheme=light&surface=sidebar");
  await page.locator(".demo-stage").evaluate((element) => {
    const stage = element as HTMLElement;
    stage.style.width = "360px";
    stage.style.maxWidth = "none";
    stage.style.padding = "0";
  });
  await expect(page.getByLabel("Ask anything…")).toBeEnabled();
  await expect(chat(page)).toHaveScreenshot("sidebar-360-light.png", {
    animations: "disabled",
  });
});

test("permission interaction matches the reviewed baseline", async ({
  page,
}) => {
  await page.goto("/?scheme=light");
  const composer = page.getByLabel("Ask anything…");
  await expect(composer).toBeEnabled();
  await composer.fill("permission");
  await composer.press("Enter");
  await expect(
    page.getByRole("alertdialog", { name: "Read project notes" }),
  ).toBeVisible();
  await expect(chat(page)).toHaveScreenshot("permission-inline-light.png", {
    animations: "disabled",
  });
  await page.getByRole("button", { name: "Reject" }).click();
});

test("concurrent session states match the reviewed baseline", async ({
  page,
}) => {
  await page.goto("/?scheme=light&subagentDelay=5000");
  const composer = page.getByLabel("Ask anything…");
  await expect(composer).toBeEnabled();

  await composer.fill("Use a subagent to inspect the client");
  await composer.press("Enter");
  await expect(page.locator('[data-kind="subagent"]')).toBeVisible();

  await page.getByRole("button", { name: "New chat" }).click();
  await composer.fill("permission");
  await composer.press("Enter");
  await expect(
    page.getByRole("alertdialog", { name: "Read project notes" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "New chat" }).click();
  await page.getByRole("button", { name: "Sessions" }).click();
  await expect(page.getByText("Running", { exact: true })).toBeVisible();
  await expect(
    page.locator(".paui-session__meta").filter({ hasText: "Awaiting User" }),
  ).toBeVisible();
  await expect(page.getByText("Idle", { exact: true })).toBeVisible();
  await expect(chat(page)).toHaveScreenshot("concurrent-sessions-light.png", {
    animations: "disabled",
  });
});

test("streaming thought row matches the reviewed DSH baseline", async ({
  page,
}) => {
  await page.goto("/?scheme=light&thoughtDelay=5000");
  const composer = page.getByLabel("Ask anything…");
  await expect(composer).toBeEnabled();
  await composer.fill("streaming tail");
  await composer.press("Enter");
  await expect(page.locator(".paui-thought")).toHaveAttribute(
    "data-running",
    "true",
  );
  await expect(chat(page)).toHaveScreenshot("streaming-thought-light.png", {
    animations: "disabled",
  });
});

test("collapsed Context injection matches the reviewed baseline", async ({
  page,
}) => {
  await openContext(page);
  await expect(chat(page)).toHaveScreenshot(
    "context-injection-collapsed-light.png",
    { animations: "disabled" },
  );
});

test("expanded Context injection matches the reviewed baseline", async ({
  page,
}) => {
  await openContext(page);
  const summary = page.locator('[data-kind="context"] summary');
  await summary.focus();
  await summary.press("Enter");
  await expect(page.locator('[data-kind="context"] details')).toHaveAttribute(
    "open",
    "",
  );
  await expect(page.locator(".paui-context-injection__body")).toHaveCSS(
    "max-height",
    "141px",
  );
  await expect(page.locator(".paui-context-injection__body")).toHaveCSS(
    "overflow-y",
    "auto",
  );
  await centerContext(page);
  await expect(chat(page)).toHaveScreenshot(
    "context-injection-expanded-light.png",
    { animations: "disabled" },
  );
});

test("narrow Context injection matches the reviewed baseline", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openContext(page);
  await page.locator('[data-kind="context"] summary').click();
  await centerContext(page);
  await expect(chat(page)).toHaveScreenshot(
    "context-injection-narrow-light.png",
    { animations: "disabled" },
  );
});

test("multiple composer contexts match the reviewed baseline", async ({
  page,
}) => {
  await page.goto("/?scheme=light&composerContext=1");
  await expect(page.getByLabel("Ask anything…")).toBeEnabled();
  await expect(
    page.locator('[data-pretty-aui-slot="composer-context-item"]'),
  ).toHaveCount(2);
  await expect(chat(page)).toHaveScreenshot("composer-context-light.png", {
    animations: "disabled",
  });
});

test("multiple composer contexts wrap on a narrow surface", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/?scheme=light&composerContext=1");
  await expect(page.getByLabel("Ask anything…")).toBeEnabled();
  await expect(
    page.locator('[data-pretty-aui-slot="composer-context-item"]'),
  ).toHaveCount(2);
  await expect(chat(page)).toHaveScreenshot(
    "composer-context-narrow-light.png",
    { animations: "disabled" },
  );
});

test("streaming Agent row matches the reviewed DSH baseline", async ({
  page,
}) => {
  await openAgent(page);
  await expect(chat(page)).toHaveScreenshot("agent-inline-light.png", {
    animations: "disabled",
  });
});

test("390px Agent composition matches the reviewed baseline", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openAgent(page);
  await expect(chat(page)).toHaveScreenshot("agent-narrow-390-light.png", {
    animations: "disabled",
  });
});

test("sidebar Agent composition matches the reviewed baseline", async ({
  page,
}) => {
  await page.clock.install({ time: new Date("2026-08-26T00:00:00Z") });
  await page.setViewportSize({ width: 440, height: 820 });
  await page.goto("/?scheme=light&surface=sidebar&subagentDelay=5000");
  await page.locator(".demo-stage").evaluate((element) => {
    const stage = element as HTMLElement;
    stage.style.width = "360px";
    stage.style.maxWidth = "none";
    stage.style.padding = "0";
  });
  const composer = page.getByLabel("Ask anything…");
  await expect(composer).toBeEnabled();
  await composer.fill("Use a subagent to inspect the client");
  await composer.press("Enter");
  await expect(page.locator('[data-kind="subagent"]')).toBeVisible();
  await expect(page.getByText("Observed 0s")).toBeVisible();
  await expect(chat(page)).toHaveScreenshot("agent-sidebar-360-light.png", {
    animations: "disabled",
  });
});

function chat(page: Page) {
  return page.locator('[data-pretty-aui-slot="root"]');
}

async function openPopulated(page: Page, scheme: "light" | "dark") {
  await page.goto(`/?scheme=${scheme}`);
  const composer = page.getByLabel("Ask anything…");
  await expect(composer).toBeEnabled();
  await composer.fill("Review the current page and summarize what you found.");
  await composer.press("Enter");
  await expect(page.getByText("Ready", { exact: true })).toBeVisible();
  await page.getByText("Read project notes").click();
}

async function openAgent(page: Page) {
  await page.clock.install({ time: new Date("2026-08-26T00:00:00Z") });
  await page.goto("/?scheme=light&subagentDelay=5000");
  const composer = page.getByLabel("Ask anything…");
  await expect(composer).toBeEnabled();
  await composer.fill("Use a subagent to inspect the client");
  await composer.press("Enter");
  await expect(page.locator('[data-kind="subagent"]')).toBeVisible();
  await expect(page.getByText("Observed 0s")).toBeVisible();
}

async function openContext(page: Page) {
  await page.goto("/?scheme=light&context=1");
  const composer = page.getByLabel("Ask anything…");
  await expect(composer).toBeEnabled();
  await composer.fill("Review the injected evidence.");
  await composer.press("Enter");
  await expect(page.locator('[data-kind="context"]')).toBeVisible();
  await expect(page.getByText("Ready", { exact: true })).toBeVisible();
  await centerContext(page);
}

async function centerContext(page: Page) {
  await page.locator('[data-kind="context"]').evaluate((element) => {
    element.scrollIntoView({ block: "center" });
  });
}
