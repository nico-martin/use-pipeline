const getPipeline = async () => {
  if (__IS_WORKER__) {
    return await import(
      "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.5.2/+esm"
    );
  } else {
    return await import("@huggingface/transformers");
  }
};

export default getPipeline;
