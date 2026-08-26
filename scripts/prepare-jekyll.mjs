import { cp, mkdir, rm } from "node:fs/promises";

const vendor = new URL("../examples/jekyll/assets/vendor/", import.meta.url);
await rm(vendor, { recursive: true, force: true });
await mkdir(vendor, { recursive: true });
await cp(new URL("../dist/standalone/", import.meta.url), vendor, {
  recursive: true,
});
