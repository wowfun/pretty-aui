import { expect, test } from "@playwright/test";

test("runs the built standalone bundle against an offline ACP fixture", async ({
  page,
}) => {
  await page.goto("http://127.0.0.1:4174/");
  await expect(page.locator("body")).toHaveAttribute("data-ready", "true");
  const chat = page.locator("#chat .pretty-aui");
  await expect(chat).toHaveAttribute("aria-label", "Production Fixture");
  const composer = chat.getByLabel("Ask anything…");
  await composer.fill("Use the production bundle");
  const send = chat.getByRole("button", { name: "Send" });
  await expect(send).toBeEnabled();
  await send.click();
  await expect(chat.getByText("Production bundle answered.")).toBeVisible();
});
