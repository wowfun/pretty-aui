import { expect, test } from "@playwright/test";

const liveUrl = process.env.PRETTY_AUI_LIVE_WS;
const liveToken = process.env.PRETTY_AUI_LIVE_TOKEN;
const liveModel =
  process.env.PRETTY_AUI_LIVE_MODEL ?? "opencode/x-preview-f-free";
const liveCwd = process.env.PRETTY_AUI_LIVE_CWD ?? process.cwd();

test("connects a browser client to local OpenCode ACP", async ({
  page,
}, testInfo) => {
  test.skip(
    !liveUrl || !liveToken,
    "Set PRETTY_AUI_LIVE_WS and PRETTY_AUI_LIVE_TOKEN to run the local OpenCode ACP check",
  );
  const composer = await openLivePage(page);
  await expect(composer).toBeEnabled({ timeout: 30_000 });
  await expect(page.locator(".pretty-aui")).toHaveAttribute(
    "aria-label",
    "OpenCode",
  );
  await expect(page.locator(".paui-protocol")).toHaveText("ACP v1");
  await selectModel(page);
  await page.screenshot({
    path: testInfo.outputPath("opencode-ready.png"),
    fullPage: true,
  });
});

test("runs an optional browser prompt through local OpenCode ACP", async ({
  page,
}) => {
  test.skip(
    !liveUrl || !liveToken || process.env.PRETTY_AUI_LIVE_PROMPT !== "1",
    "Enable only when a live provider turn is desired",
  );
  test.setTimeout(210_000);
  const composer = await openLivePage(page);
  await expect(composer).toBeEnabled({ timeout: 30_000 });
  await selectModel(page);
  await composer.fill(
    "Reply with exactly PRETTY_AUI_BROWSER_LIVE_OK and nothing else. Do not use tools.",
  );
  await composer.press("Enter");

  await page.waitForFunction(
    () => {
      const snapshot = window.__PRETTY_AUI__?.getSnapshot();
      return (
        snapshot?.error ||
        snapshot?.activities.some(
          (activity) =>
            activity.type === "message" &&
            activity.role === "assistant" &&
            activity.content.some(
              (block) =>
                block.type === "text" &&
                typeof block.text === "string" &&
                block.text.includes("PRETTY_AUI_BROWSER_LIVE_OK"),
            ),
        )
      );
    },
    undefined,
    { timeout: 180_000 },
  );
  const error = await page.evaluate(
    () => window.__PRETTY_AUI__?.getSnapshot().error,
  );
  expect(error).toBeUndefined();
  await expect(
    page.getByText("PRETTY_AUI_BROWSER_LIVE_OK", { exact: true }),
  ).toBeVisible();
  await expect(page.locator(".paui-presence")).toHaveAttribute(
    "data-phase",
    "idle",
  );
});

test("runs a real OpenCode explore task and opens its child transcript", async ({
  page,
}, testInfo) => {
  test.skip(
    !liveUrl || !liveToken || process.env.PRETTY_AUI_LIVE_SUBAGENT !== "1",
    "Enable only when a live provider-backed OpenCode child task is desired",
  );
  test.setTimeout(420_000);
  const composer = await openLivePage(page);
  await expect(composer).toBeEnabled({ timeout: 30_000 });
  await selectModel(page);
  await composer.fill(
    'Use the task tool exactly once with subagent_type "explore" and description "Inspect client architecture". Ask it to inspect package.json, src/core/index.ts, and src/react/index.ts in this workspace, then wait for it and reply with one short summary sentence.',
  );
  await composer.press("Enter");

  const agent = page.locator('[data-kind="subagent"] .paui-subagent');
  await expect(agent).toBeVisible({ timeout: 180_000 });
  await expect(agent).toHaveAttribute("data-running", "true");
  await expect(agent.locator(".paui-subagent-status")).toContainText(
    "Observed",
  );
  await page.screenshot({
    path: testInfo.outputPath("opencode-agent-running.png"),
    fullPage: true,
  });

  const openChild = page.getByRole("button", { name: "Open child session" });
  await expect(openChild).toBeEnabled({ timeout: 240_000 });
  await expect(agent.locator(".paui-subagent-status")).toHaveText("Completed");
  await page.screenshot({
    path: testInfo.outputPath("opencode-agent-completed.png"),
    fullPage: true,
  });

  await openChild.click();
  await expect(page.locator(".paui-lineage")).toHaveAttribute(
    "data-depth",
    "1",
    { timeout: 60_000 },
  );
  await expect(
    page.locator('[data-pretty-aui-slot="message"][data-role="assistant"]'),
  ).not.toHaveCount(0);
  await page.screenshot({
    path: testInfo.outputPath("opencode-child-transcript.png"),
    fullPage: true,
  });

  await page.locator(".paui-lineage__ancestor button").first().click();
  await expect(page.locator(".paui-lineage")).toHaveCount(0);
});

async function openLivePage(page: import("@playwright/test").Page) {
  await page.addInitScript(
    ({ url, token, cwd }) => {
      window.__PRETTY_AUI_LIVE__ = {
        url,
        protocols: ["pretty-aui-acp", `pretty-aui-token.${token}`],
        cwd,
      };
    },
    { url: liveUrl!, token: liveToken!, cwd: liveCwd },
  );
  await page.goto("/?scheme=light");
  return page.getByLabel("Ask anything…");
}

async function selectModel(page: import("@playwright/test").Page) {
  const model = page.locator(".paui-config select").first();
  await expect(model.locator(`option[value="${liveModel}"]`)).toHaveCount(1, {
    timeout: 30_000,
  });
  await model.selectOption(liveModel);
  await page.waitForFunction(
    (modelId) =>
      window.__PRETTY_AUI__
        ?.getSnapshot()
        .configOptions.some(
          (option) => option.id === "model" && option.currentValue === modelId,
        ),
    liveModel,
  );
}
