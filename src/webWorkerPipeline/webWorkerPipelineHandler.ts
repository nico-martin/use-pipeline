import getPipeline from "../utils/getPipeline";

const pipelines = new Map();

const webWorkerPipelineHandler = () => {
  const unserializeOptions = (options: Record<string, any>) => {
    const out: Record<string, any> = {};
    Object.entries(options ?? {}).forEach(([key, value]) => {
      if (typeof value === "object" && value && "__fn" in value && value.__fn) {
        out[key] = (...args: Array<any>) =>
          self.postMessage({
            type: "invokeCallback",
            functionId: "functionId" in value ? value.functionId : null,
            args,
          });
      } else {
        out[key] = value;
      }
    });
    return out;
  };

  return {
    onmessage: async (event: MessageEvent) => {
      if (!event?.data || event.data?.type !== "tfjs_pipe") return;
      const {
        id,
        data,
        task,
        model_id,
        options,
        pipeOptions = {},
      } = event.data;
      const key = JSON.stringify({ task, model_id, options });
      let pipe = pipelines.get(key);
      if (!pipe) {
        const { pipeline } =
          (await getPipeline()) as typeof import("@huggingface/transformers");
        pipe = await pipeline(task, model_id, unserializeOptions(options));
        pipelines.set(key, pipe);
      }
      self.postMessage({ id, type: "ready" });
      const result = data ? await pipe(data, pipeOptions) : null;
      self.postMessage({ id, type: "result", result });
    },
  };
};

export default webWorkerPipelineHandler;
