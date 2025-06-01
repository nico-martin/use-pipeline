# usePipeline

This is a react hook that wraps the transformers.js pipeline API.

## getting started
```
npm i use-pipeline @huggingface/transformers
```

## minimal example
You can use the hook with just the task and the model_id of the model you want to use. 
```javascript
// App.jsx
const App = () => {
    const { pipe} = usePipeline(
        "text-classification", // task
        "Xenova/distilbert-base-uncased-finetuned-sst-2-english", // model_id
    );
    return <button onClick={() => pipe(['I love transformers.js']).then(console.log)}>run</button>;
}
```
A WebWorker is then automatically instantiated in the background, in which the calculations are performed.

## use your own WebWorker

If you want to you can also use your own WebWorker.  
Since working with WebWorkers is often a bit unfamiliar, I have tried to make it as simple as possible. In the WebWorker, all you need to do is to call the `webWorkerPipelineHandler().onmessage`.  
As you can see, all the messaging between the app and the worker is abstracted away by the library.

### Vite

```javascript
// App.jsx
import { usePipeline } from "use-pipeline";

const App = () => {
    const worker = React.useMemo(
        () => new Worker(new URL("./worker.ts", import.meta.url), {
            type: "module",
        }),
        [],
    );
    
    const { pipe} = usePipeline(
        "text-classification", // task
        "Xenova/distilbert-base-uncased-finetuned-sst-2-english", // model_id
        {}, // transformers.js pipeline options
        worker
    );
    return <button onClick={() => pipe(['I love transformers.js']).then(console.log)}>run</button>;
}
```
```javascript
// worker.js
import { webWorkerPipelineHandler } from "use-pipeline";
self.onmessage = webWorkerPipelineHandler().onmessage
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
    return <button onClick={() => pipe(['I love transformers.js']).then(console.log)}>run</button>;
}
```
```javascript
// pipeline.worker.js
import { webWorkerPipelineHandler } from "use-pipeline";
self.onmessage = webWorkerPipelineHandler().onmessage
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