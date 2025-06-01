const getPipeline = async () => {
  if (__IS_WORKER__) {
    console.log("transformers from cdn");
    return await import(
      "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.5.2/+esm"
    );
  } else {
    console.log("transformers internal");
    return await import("@huggingface/transformers");
  }
};

export default getPipeline;
