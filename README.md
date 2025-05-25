# usePipeline

This is a react hook that wraps the transformers.js pipeline API.

## minimal example
You can use the hook with just the task and the model_id of the model you want to use. 
```javascript
// App.jsx
const App = () => {
    const { pipe} = usePipeline(
        "text-classification", // task
        "Xenova/distilbert-base-uncased-finetuned-sst-2-english", // model_id
    );
    return <button onClick={() => pipe('I love transformers.js').then(console.log)}>run</button>;
}
```
## worker example (recommended)

However, it is highly recommended to use the "worker-mode", where the model runs in a separate worker-thread.  
To make the experience for you as delightful as possible while also giving you the flexibility to choose the build tool you want, we split the logic in two parts.
As you can see, all the messaging between the app and the worker is abstracted away by the library.

### Vite

```javascript
// App.jsx
import { usePipeline } from "use-pipeline";

const App = () => {
    const { pipe} = usePipeline(
        "text-classification", // task
        "Xenova/distilbert-base-uncased-finetuned-sst-2-english", // model_id
        {}, // transformers.js pipeline options
        new Worker(new URL("./worker.js", import.meta.url), {
            type: "module",
        })
    );
    return <button onClick={() => pipe('I love transformers.js').then(console.log)}>run</button>;
}
```
```javascript
// worker.js
import { webWorkerPipelineHandler } from "use-pipeline";
self.onmessage = webWorkerPipelineHandler().handler
```
### Webpack

```javascript
// webpack.config.js
module.exports = {
    experiments: {
        outputModule: true,
    },
    module: {
        rules: [
            {
                test: /\.worker\.js$/,
                loader: 'worker-loader',
                options: { type: 'module' },
            },
        ],
    },
};

````

```javascript
// App.jsx
import { usePipeline } from "use-pipeline";
import Worker from './pipeline.worker.js';

const App = () => {
    const { pipe} = usePipeline(
        "text-classification", // task
        "Xenova/distilbert-base-uncased-finetuned-sst-2-english", // model_id
        {}, // transformers.js pipeline options
        Worker
    );
    return <button onClick={() => pipe('I love transformers.js').then(console.log)}>run</button>;
}
```
```javascript
// pipeline.worker.js
import { webWorkerPipelineHandler } from "use-pipeline";
self.onmessage = webWorkerPipelineHandler().handler
```

## options.device
There is one addition to the transformers.js pipeline API. The `device` option also accepts an array of devices instead of just one device as string. The library will then try to find the first device in the array that is supported by the client: 
```javascript
const { pipe} = usePipeline(
    "text-classification", // task
    "Xenova/distilbert-base-uncased-finetuned-sst-2-english", // model_id
    {
        device: ['webgpu', 'wasm']
    },
);
```

In this case, if the client supports WebGPU, it will use WebGPU, otherwise it will use wasm.

> !!! This feature is highly experimental. For now, only the `webgpu` check does work. It might change in the future or will be removed.