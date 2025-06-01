const getPipeline = async () => {
  if (
    typeof self !== "undefined" &&
    self.constructor?.name === "DedicatedWorkerGlobalScope"
  ) {
    return await import(
      // @ts-expect-error
      "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.5.2/+esm"
    );
  } else {
    return await import("@huggingface/transformers");
  }
};

export default getPipeline;
