let workerInstance: Worker;

const getDefaultWorkerUrl = () => {
  if (typeof document !== "undefined") {
    const currentScript = document.currentScript as HTMLScriptElement | null;
    if (currentScript) {
      const src = currentScript.src;
      const base = src.substring(0, src.lastIndexOf("/"));
      return `${base}/worker/worker.compiled.js`;
    }
  }
  if (typeof import.meta !== "undefined" && import.meta.url) {
    return new URL("./worker/worker.compiled.js", import.meta.url).toString();
  }
  return "/node_modules/use-pipeline/dist/worker/worker.compiled.js";
};

const getLazyWorker = (): Worker => {
  if (!workerInstance) {
    workerInstance = new Worker(getDefaultWorkerUrl(), { type: "module" });
  }
  return workerInstance;
};

export default getLazyWorker;
