import { resolve } from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      { find: /^isomorphic-dompurify$/, replacement: "dompurify" },
      { find: /^react-dom\/client$/, replacement: "preact/compat/client" },
      { find: /^react$/, replacement: "preact/compat" },
      { find: /^react-dom$/, replacement: "preact/compat" },
      { find: /^react\/jsx-runtime$/, replacement: "preact/jsx-runtime" },
    ],
  },
  build: {
    emptyOutDir: true,
    outDir: "dist/standalone",
    sourcemap: true,
    lib: {
      entry: resolve(import.meta.dirname, "src/standalone.tsx"),
      formats: ["es"],
      fileName: () => "pretty-aui.js",
    },
    rollupOptions: {
      output: {
        chunkFileNames: "chunks/[name].js",
        assetFileNames: "assets/[name][extname]",
      },
    },
  },
});
