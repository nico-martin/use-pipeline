import React from "react";
import webWorkerPipeline from "./webWorkerPipeline/webWorkerPipeline";
import { pipeline, PipelineType } from "@huggingface/transformers";
import getSupportedDevice from "./deviceSupport/getSupportedDevice";
import getLazyWorker from "./utils/getLazyWorker";

export enum UsePipelineStatus {
  PRELOAD,
  LOADING,
  READY,
}

const usePipeline = <PayloadType = any, ResultType = any>(
  task: PipelineType,
  model_id: string,
  options: Record<string, any> = {},
  worker?: Worker | true,
): {
  pipe: (
    data: PayloadType,
    options?: Record<string, any>,
  ) => Promise<ResultType>;
  status: UsePipelineStatus;
  progress: number;
} => {
  const [status, setStatus] = React.useState<UsePipelineStatus>(
    UsePipelineStatus.PRELOAD,
  );
  const pipeRef = React.useRef<any>(null);
  const progressElements = React.useRef<
    Record<string, { loaded: number; total: number }>
  >({});
  const [progress, setProgress] = React.useState<number>(0);
  const optionsKey = React.useMemo(() => JSON.stringify(options), [options]);
  const hasWorker = React.useMemo(() => Boolean(worker), [worker]);

  React.useEffect(() => {
    pipeRef.current = null;
    setStatus(UsePipelineStatus.PRELOAD);
  }, [task, model_id, optionsKey, hasWorker]);

  const pipe = async (
    data: PayloadType,
    pipeOptions: Record<string, any> = {},
  ) => {
    if (!pipeRef.current) {
      setStatus(UsePipelineStatus.LOADING);

      const o = { ...options };
      o.progress_callback = (data: any) => {
        if ("progress_callback" in options) {
          options.progress_callback(data);
        }
        if (
          typeof data === "object" &&
          "status" in data &&
          data.status === "progress"
        ) {
          progressElements.current[data.file] = {
            loaded: data.loaded,
            total: data.total,
          };
          let allTotal = 0;
          let allLoaded = 0;
          Object.entries(progressElements.current).forEach(
            ([file, { loaded, total }]) => {
              allTotal += total;
              allLoaded += loaded;
            },
          );
          const hasOnnxFile = Boolean(
            Object.keys(progressElements.current).find((file) =>
              file.endsWith(".onnx"),
            ),
          );
          hasOnnxFile && setProgress(Math.round((allLoaded / allTotal) * 100));
        }
      };

      if (o.device) {
        o.device = await getSupportedDevice(o.device);
      }

      if (worker === true) {
        worker = await getLazyWorker();
      }

      pipeRef.current = worker
        ? await webWorkerPipeline(worker, task, model_id, o)
        : await pipeline(task, model_id, o);
      setStatus(UsePipelineStatus.READY);
    }
    return pipeRef.current(data, pipeOptions);
  };

  return {
    progress,
    pipe,
    status,
  };
};

export default usePipeline;
