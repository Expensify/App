// The compiler helper is ESM (.mjs); Bun resolves it without the extension.
// eslint-disable-next-line import/extensions
import {didBothCompilersMemoizeFile} from '../../config/reactCompiler/checkBoth.mjs';

type WorkerRequest = {
    filename: string;
    source: string;
};

type WorkerResponse = {
    filename: string;
    bothMemoized: boolean;
};

declare const self: Worker;

self.onmessage = (event: MessageEvent<WorkerRequest>) => {
    const {filename, source} = event.data;
    const bothMemoized = didBothCompilersMemoizeFile(source, filename);
    const response: WorkerResponse = {filename, bothMemoized};
    postMessage(response);
};
