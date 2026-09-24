// The compiler helper is ESM (.mjs); Bun resolves it without the extension.
// eslint-disable-next-line import/extensions
import {didBothCompilersMemoizeFile} from '../../../config/reactCompiler/checkBoth.mjs';

type WorkerRequest = {
    filename: string;
    source: string;
};

type WorkerResponse = {
    filename: string;
    bothMemoized: boolean;
    cacheable: boolean;
};

declare const self: Worker;

self.onmessage = (event: MessageEvent<WorkerRequest>) => {
    const {filename, source} = event.data;
    try {
        const response: WorkerResponse = {filename, bothMemoized: didBothCompilersMemoizeFile(source, filename), cacheable: true};
        postMessage(response);
    } catch {
        // Conservative: treat a compiler crash as "not memoized" so this file
        // keeps its suppressible messages instead of aborting the whole lint.
        // Do not cache this — a transient OOM/crash must not stick as a miss.
        const response: WorkerResponse = {filename, bothMemoized: false, cacheable: false};
        postMessage(response);
    }
};
