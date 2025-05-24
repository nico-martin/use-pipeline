import React from "react";
import workerCode from "./worker?raw";

const usePipeline = () => {
  const workerRef = React.useRef<Worker | null>(null);
  const [count, setCount] = React.useState<number>(1);

  React.useEffect(() => {
    const blob = new Blob([workerCode], { type: "application/javascript" });
    const worker = new Worker(URL.createObjectURL(blob), { type: "module" });
    workerRef.current = worker;
    worker.onmessage = (e) => {
      if (e.data.type === "countUpdated") setCount(e.data.value);
    };

    return () => worker.terminate();
  }, []);

  return {
    count,
    updateCount: (newCount: number) => {
      workerRef.current?.postMessage({
        type: "updateCount",
        payload: newCount,
      });
    },
  };
};

export default usePipeline;
