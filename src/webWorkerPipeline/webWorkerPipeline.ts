import { PipelineType } from "@huggingface/transformers";

const webWorkerPipeline = <PayloadType = any, ResultType = any>(
  worker: Worker,
  task: PipelineType,
  model_id: string,
  options: Record<string, any> = {},
) =>
  new Promise((resolve, reject) => {
    const callbackMap = new Map<string, Function>();

    const messagesResolversMap = new Map<
      number | "init",
      { resolve: Function; reject: Function }
    >();
    let messageIdCounter = 0;

    const serializeOptions = (options: Record<string, any>) => {
      const out: Record<string, any> = {};
      Object.entries(options ?? {}).forEach(([key, value]) => {
        if (typeof value === "function") {
          const functionId = `cb_${key}`;
          callbackMap.set(functionId, value);
          out[key] = { __fn: true, functionId };
        } else {
          out[key] = value;
        }
      });
      return out;
    };

    worker.onmessage = (e) => {
      const msg = e.data;
      if (msg?.type === "invokeCallback") {
        const { functionId, args } = msg;
        const fn = callbackMap.get(functionId);
        if (fn) {
          fn(...args);
        }
      }
      if (msg?.type === "result") {
        if (msg?.id === "init") {
          resolve((data: PayloadType, pipeOptions: Record<string, any>) => {
            return new Promise<any>((resolve, reject) => {
              const id = messageIdCounter++;
              messagesResolversMap.set(id, { resolve, reject });
              worker.postMessage({
                id,
                type: "tfjs_pipe",
                data,
                task,
                model_id,
                options: options ? serializeOptions(options) : {},
                pipeOptions,
              });
            });
          });
        } else {
          const resolver = messagesResolversMap.get(msg.id);
          if (resolver) {
            if (msg.error) resolver.reject(msg.error);
            else resolver.resolve(msg.result);
            messagesResolversMap.delete(msg.id);
          }
        }
      }
    };

    messagesResolversMap.set("init", { resolve, reject });
    worker.postMessage({
      id: "init",
      type: "tfjs_pipe",
      data: null,
      task: task ?? "",
      model_id: model_id ?? "",
      options: options ? serializeOptions(options) : {},
    });
  });
export default webWorkerPipeline;
