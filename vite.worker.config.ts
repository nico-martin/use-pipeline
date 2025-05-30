import { defineConfig } from "vite";

export default defineConfig({
  build: {
    outDir: "dist/worker",
    emptyOutDir: false,
    lib: {
      entry: "src/worker.ts",
      formats: ["iife"],
      name: "worker",
      fileName: () => `worker.compiled.js`,
    },
    target: "esnext",
    rollupOptions: {
      external: [],
      output: {
        globals: {},
      },
    },
  },
});
