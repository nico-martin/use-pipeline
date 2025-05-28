import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  build: {
    emptyOutDir: false,
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "usePipeline",
      formats: ["es", "cjs"],
      fileName: (format) => `use-pipeline.${format}.js`,
    },
    rollupOptions: {
      external: ["react", "@huggingface/transformers"],
      output: {
        globals: {
          react: "React",
        },
      },
    },
  },
});
