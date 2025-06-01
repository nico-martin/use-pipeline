import webWorkerPipelineHandler from "../../src/webWorkerPipeline/webWorkerPipelineHandler";

const handler = webWorkerPipelineHandler();
self.onmessage = (msg: MessageEvent) => {
  handler.onmessage(msg);
};
