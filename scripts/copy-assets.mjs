import { copyFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { bundledPackages } from "./bundled-packages.mjs";

const dist = new URL("../dist/", import.meta.url);
await mkdir(dist, { recursive: true });
await copyFile(
  new URL("../src/styles.css", import.meta.url),
  new URL("styles.css", dist),
);
await copyFile(
  new URL("../src/styles.css.d.ts", import.meta.url),
  new URL("styles.css.d.ts", dist),
);

const standalone = new URL("standalone/", dist);
const licenses = new URL("licenses/", standalone);
await mkdir(licenses, { recursive: true });
await copyFile(
  new URL("../LICENSE", import.meta.url),
  new URL("LICENSE", standalone),
);
for (const bundledPackage of await bundledPackages(standalone)) {
  await copyFile(
    join(bundledPackage.root, "LICENSE"),
    new URL(bundledPackage.outputName, licenses),
  );
}
