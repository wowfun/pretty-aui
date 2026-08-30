import { parseViteServerArgs } from "../../scripts/dev-args.mjs";

describe("OpenCode development server arguments", () => {
  it("maps forwarded host and port arguments for the live Vite server", () => {
    expect(
      parseViteServerArgs([
        "--",
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

  it.each([["--base", "/demo/"], ["--surface=sidebar"]])(
    "rejects arguments that cannot be forwarded by dev:opencode: %j",
    (...args) => {
      expect(() => parseViteServerArgs(args)).toThrow(
        "Unsupported Vite argument",
      );
    },
  );

  it("validates the forwarded Vite port", () => {
    expect(() => parseViteServerArgs(["--port", "70000"])).toThrow(
      "Invalid Vite port",
    );
  });
});
