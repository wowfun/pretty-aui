import { parseDevArgs, parseViteServerArgs } from "../../scripts/dev-args.mjs";

describe("development arguments", () => {
  it("defaults to inline without changing Vite arguments", () => {
    expect(parseDevArgs(["--host", "127.0.0.1", "--port=4173"])).toEqual({
      surface: "inline",
      viteArgs: ["--host", "127.0.0.1", "--port=4173"],
    });
  });

  it.each([
    [["--surface", "inline"], "inline"],
    [["--surface=sidebar"], "sidebar"],
    [["--", "--surface", "sidebar"], "sidebar"],
  ] as const)("accepts %j", (args, surface) => {
    expect(parseDevArgs(args)).toEqual({ surface, viteArgs: [] });
  });

  it.each([
    [[], "inline"],
    [["--surface", "wide"], "Invalid surface"],
    [["--surface"], "--surface requires"],
  ] as const)("validates %j", (args, expected) => {
    if (expected === "inline") {
      expect(parseDevArgs(args).surface).toBe(expected);
    } else {
      expect(() => parseDevArgs(args)).toThrow(expected);
    }
  });

  it("maps forwarded host and port arguments for the live Vite server", () => {
    expect(
      parseViteServerArgs([
        "--host",
        "127.0.0.1",
        "--port=4199",
        "--strictPort",
        "--force",
      ]),
    ).toEqual({
      server: { host: "127.0.0.1", port: 4199, strictPort: true },
      force: true,
    });
  });

  it("rejects arguments that cannot be forwarded by dev:opencode", () => {
    expect(() => parseViteServerArgs(["--base", "/demo/"])).toThrow(
      "Unsupported Vite argument",
    );
  });
});
