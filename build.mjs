import { build } from "esbuild";
import esbuildRawPlugin from "./esbuild/esbuildRawPlugin.mjs";

const mainConfig = {
  bundle: true,
  minify: true,
  minifySyntax: true,
  treeShaking: true,
  logLevel: "info",
  plugins: [esbuildRawPlugin()],
};

await build({
  ...mainConfig,
  outfile: "dist/worker.compiled.js",
  platform: "browser",
  format: "esm",
  external: ["react", "@huggingface/transformers"],
  entryPoints: ["./src/worker.ts"],
  define: {
    __IS_WORKER__: "true",
  },
});

const usePipelineConfig = {
  ...mainConfig,
  entryPoints: ["src/index.ts"],
  platform: "neutral",
  external: ["react"],
  define: {
    __IS_WORKER__: "false",
  },
};

await build({
  ...usePipelineConfig,
  format: "esm",
  outfile: "dist/use-pipeline.es.js",
});

await build({
  ...usePipelineConfig,
  format: "cjs",
  outfile: "dist/use-pipeline.cjs.js",
});
