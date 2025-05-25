import React from "react";
import { createRoot } from "react-dom/client";

import usePipeline, { UsePipelineStatus } from "../src/usePipeline";

function App() {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const [result, setResult] = React.useState<
    Array<{ label: string; score: number }>
  >([]);
  const { pipe, status, progress } = usePipeline<
    string,
    Array<{ label: string; score: number }>
  >(
    "text-classification",
    "", //"Xenova/bert-base-multilingual-uncased-sentiment",
    {
      progress_callback: console.log,
      device: "webgpu",
      dtype: "q4",
    },
    new Worker(new URL("./worker.ts", import.meta.url), {
      type: "module",
    }),
  );

  return (
    <div>
      <h1>usePipeline Demo2</h1>
      <textarea ref={textareaRef} defaultValue="I love Transformers.js" />
      <button
        disabled={status === UsePipelineStatus.LOADING}
        onClick={async () => {
          const text = textareaRef?.current?.value || "";
          const res = await pipe(text);
          setResult(res);
        }}
      >
        {status === UsePipelineStatus.LOADING
          ? `loading (${Math.round(progress)}%)`
          : "Lets go"}
      </button>
      <h3>Result</h3>
      <ul>
        {result.map(({ label, score }) => (
          <li key={label}>
            {label}: {score}
          </li>
        ))}
      </ul>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
