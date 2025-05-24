import React from "react";
import { createRoot } from "react-dom/client";

// 👇 this is your local hook
import usePipeline from "../src/usePipeline";

function App() {
  const { count, updateCount } = usePipeline();

  return (
    <div>
      <h1>usePipeline Demo</h1>
      <button onClick={() => updateCount(count)}>{count}</button>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
