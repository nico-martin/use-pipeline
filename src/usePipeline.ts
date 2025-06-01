import React from "react";
import webWorkerPipeline from "./webWorkerPipeline/webWorkerPipeline";
import {
  pipeline,
  PipelineType,
  PretrainedModelOptions,
} from "@huggingface/transformers";
import getSupportedDevice from "./deviceSupport/getSupportedDevice";
import rawDefaultWorker from "../dist/worker.compiled.js?raw";
import { DeviceType } from "@huggingface/transformers/types/utils/devices";

type PipelineFn<T extends PipelineType> = Awaited<
  ReturnType<typeof pipeline<T>>
>;
type PipelineInput<T extends PipelineType> = Parameters<PipelineFn<T>>;
type PipelineOutput<T extends PipelineType> = Awaited<
  ReturnType<PipelineFn<T>>
>;

interface ModelOptions extends Omit<PretrainedModelOptions, "device"> {
  device: DeviceType | Array<DeviceType>;
}

export enum UsePipelineStatus {
  PRELOAD,
  LOADING,
  READY,
}

const usePipeline = <T extends PipelineType>(
  task: T,
  model_id: string,
  options?: ModelOptions,
  outsideWorker: Worker | boolean = true,
): {
  pipe: (data: PipelineInput<T>) => Promise<PipelineOutput<T>>;
  status: UsePipelineStatus;
  progress: number;
} => {
  const [status, setStatus] = React.useState<UsePipelineStatus>(
    UsePipelineStatus.PRELOAD,
  );
  const defaultWorkerRef = React.useRef<Worker>(null);
  const pipeRef = React.useRef<any>(null);
  const progressElements = React.useRef<
    Record<string, { loaded: number; total: number }>
  >({});
  const [progress, setProgress] = React.useState<number>(0);
  const optionsKey = React.useMemo(() => JSON.stringify(options), [options]);
  const worker: Worker = React.useMemo(() => {
    if (outsideWorker === true) {
      if (!defaultWorkerRef?.current) {
        const blob = new Blob([rawDefaultWorker], {
          type: "application/javascript",
        });
        defaultWorkerRef.current = new Worker(URL.createObjectURL(blob), {
          type: "module",
        });
      }
      return defaultWorkerRef.current;
    } else if (outsideWorker === false) {
      return null;
    }
    return outsideWorker;
  }, [outsideWorker]);

  const hasWorker = React.useMemo(() => Boolean(worker), [worker]);

  React.useEffect(() => {
    pipeRef.current = null;
    setStatus(UsePipelineStatus.PRELOAD);
  }, [task, model_id, optionsKey, hasWorker]);

  const pipe = async (data: PipelineInput<T>) => {
    if (!pipeRef.current) {
      setStatus(UsePipelineStatus.LOADING);

      const o: PretrainedModelOptions = {
        ...options,
        progress_callback: (data: any) => {
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
            hasOnnxFile &&
              setProgress(Math.round((allLoaded / allTotal) * 100));
          }
        },
        device: await getSupportedDevice(options.device),
      };

      pipeRef.current = worker
        ? await webWorkerPipeline(worker, task, model_id, o)
        : await pipeline(task, model_id, o);
      setStatus(UsePipelineStatus.READY);
    }
    return pipeRef.current(...data);
  };

  return {
    progress,
    pipe,
    status,
  };
};

export default usePipeline;
