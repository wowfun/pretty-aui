import { readFile } from "node:fs/promises";

describe("CI package scripts", () => {
  it("references scripts that exist in package.json", async () => {
    const [workflow, packageText] = await Promise.all([
      readFile(".github/workflows/ci.yml", "utf8"),
      readFile("package.json", "utf8"),
    ]);
    const scripts = Object.keys(
      (JSON.parse(packageText) as { scripts: Record<string, string> }).scripts,
    );
    const builtIns = new Set(["exec", "install"]);
    const referenced = [...workflow.matchAll(/^\s*- run: pnpm ([\w:-]+)\s*$/gm)]
      .map((match) => match[1]!)
      .filter((script) => !builtIns.has(script));

    expect(referenced).not.toHaveLength(0);
    expect(referenced.filter((script) => !scripts.includes(script))).toEqual(
      [],
    );
  });
});
