import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "tests/e2e",
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: "http://127.0.0.1:4173",
    trace: "retain-on-failure",
  },
  webServer: [
    {
      command: "pnpm dev --host 127.0.0.1 --port 4173",
      wait: { stdout: /Local:\s+http:\/\/127\.0\.0\.1:4173\// },
    },
    {
      command: "pnpm build && node scripts/serve-dist-test.mjs",
      wait: {
        stdout: /pretty-aui dist fixture: http:\/\/127\.0\.0\.1:4174\//,
      },
    },
  ],
  projects: [
    {
      name: "chromium",
      ...(process.platform === "linux"
        ? {}
        : { testIgnore: /visual\.spec\.ts/ }),
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      testIgnore: /visual\.spec\.ts/,
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      testIgnore: /visual\.spec\.ts/,
      use: { ...devices["Desktop Safari"] },
    },
  ],
});
