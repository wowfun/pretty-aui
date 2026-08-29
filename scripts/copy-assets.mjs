import { copyFile, mkdir, rm, writeFile } from "node:fs/promises";
import { bundledLicenseText } from "./bundled-packages.mjs";

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
await copyFile(
  new URL("../LICENSE", import.meta.url),
  new URL("LICENSE", standalone),
);
await rm(new URL("licenses/", standalone), { recursive: true, force: true });
await writeFile(
  new URL("THIRD_PARTY_LICENSES.txt", standalone),
  await bundledLicenseText(standalone),
  "utf8",
);
