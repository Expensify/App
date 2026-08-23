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
};

declare const self: Worker;

self.onmessage = (event: MessageEvent<WorkerRequest>) => {
    const {filename, source} = event.data;
    let bothMemoized = false;
    try {
        bothMemoized = didBothCompilersMemoizeFile(source, filename);
    } catch {
        // Conservative: treat a compiler crash as "not memoized" so this file
        // keeps its suppressible messages instead of aborting the whole lint.
    }
    const response: WorkerResponse = {filename, bothMemoized};
    postMessage(response);
};
