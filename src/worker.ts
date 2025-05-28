import webWorkerPipelineHandler from "./webWorkerPipeline/webWorkerPipelineHandler";

self.onmessage = webWorkerPipelineHandler().onmessage;
