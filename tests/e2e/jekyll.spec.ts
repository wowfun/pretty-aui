import { expect, test } from "@playwright/test";

const jekyllUrl = process.env.PRETTY_AUI_JEKYLL_URL;
const liveWs = process.env.PRETTY_AUI_LIVE_WS;
const liveToken = process.env.PRETTY_AUI_LIVE_TOKEN;
const liveCwd = process.env.PRETTY_AUI_LIVE_CWD ?? process.cwd();

test("mounts the standalone ESM build inside a generated Jekyll site", async ({
  page,
}, testInfo) => {
  test.skip(
    !jekyllUrl || !liveWs || !liveToken,
    "Set the Jekyll URL, bridge URL, and bridge token for this integration check",
  );
  await page.addInitScript(
    ({ url, token, cwd }) => {
      window.__PRETTY_AUI_LIVE__ = {
        url,
        protocols: ["pretty-aui-acp", `pretty-aui-token.${token}`],
        cwd,
      };
    },
    { url: liveWs!, token: liveToken!, cwd: liveCwd },
  );
  await page.goto(`${jekyllUrl}/?surface=sidebar&scheme=dark`);
  const chat = page.locator("#chat .pretty-aui");
  await expect(chat).toHaveAttribute("aria-label", "OpenCode", {
    timeout: 30_000,
  });
  await expect(chat).toHaveAttribute("data-surface", "sidebar");
  await expect(chat).toHaveAttribute("data-scheme", "dark");
  await expect(chat.locator(".paui-protocol")).toHaveText("ACP v1");
  await expect(chat.getByLabel("Ask anything…")).toBeEnabled();
  await page.screenshot({
    path: testInfo.outputPath("jekyll-opencode-ready.png"),
    fullPage: true,
  });
});
