self.onmessage = async (event) => {
  const { type, payload } = event.data;

  if (type === "updateCount") {
    postMessage({ type: "countUpdated", value: payload * 2 });
  }
};
