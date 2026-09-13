// Redirects the two RuleTester packages to ruleTesterStub.mjs, so importing an upstream test file
// collects its cases instead of running them. `@typescript-eslint/rule-tester` is not installed here at
// all. Only requests FROM a test file are redirected: `@typescript-eslint/utils` requires `eslint` for
// real, and handed the stub its LegacyESLint static initializer dies on `ESLint.version`.
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';

const STUB = pathToFileURL(path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'ruleTesterStub.mjs')).href;
const REDIRECTED = new Set(['eslint', '@typescript-eslint/rule-tester']);

function resolve(specifier, context, nextResolve) {
    if (REDIRECTED.has(specifier) && (context.parentURL ?? '').endsWith('.test.js')) {
        return {url: STUB, shortCircuit: true, format: 'module'};
    }
    return nextResolve(specifier, context);
}

export {resolve};
