import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  root: resolve(import.meta.dirname),
  plugins: [react()],
  server: {
    fs: { allow: [resolve(import.meta.dirname, "../..")] },
  },
});
