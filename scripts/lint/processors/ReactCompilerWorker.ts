// The compiler helper is ESM (.mjs); Bun resolves it without the extension.
// eslint-disable-next-line import/extensions
import checkReactCompilerWithOxc from '../../../config/reactCompiler/checkWithOxc.mjs';

type WorkerRequest = {
    filename: string;
    source: string;
};

type WorkerResponse = {
    filename: string;
    memoized: boolean;
    cacheable: boolean;
};

declare const self: Worker;

self.onmessage = (event: MessageEvent<WorkerRequest>) => {
    const {filename, source} = event.data;
    try {
        const response: WorkerResponse = {filename, memoized: checkReactCompilerWithOxc(source, filename).memoized, cacheable: true};
        postMessage(response);
    } catch {
        // Conservative: treat a compiler crash as "not memoized" so this file
        // keeps its suppressible messages instead of aborting the whole lint.
        // Do not cache this — a transient OOM/crash must not stick as a miss.
        const response: WorkerResponse = {filename, memoized: false, cacheable: false};
        postMessage(response);
    }
};
