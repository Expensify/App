// Redirects the two RuleTester packages to ruleTesterStub.mjs, so importing an upstream test file
// collects its cases instead of running them.
//
// `@typescript-eslint/rule-tester` is redirected as well as `eslint`: it is not even installed in
// this repo, which is why 4 of the 35 upstream test files cannot be imported without this hook.
//
// Only requests coming FROM a test file are redirected. The hook also sees CJS `require`, and
// `@typescript-eslint/utils` requires `eslint` for real: handed the stub, its LegacyESLint static
// initializer dies on `ESLint.version`. Keying on the importer keeps the redirect to the one edge
// that needs it.
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';

const STUB = pathToFileURL(path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'ruleTesterStub.mjs')).href;
const REDIRECTED = new Set(['eslint', '@typescript-eslint/rule-tester']);

/** Synchronous resolve hook, registered through module.registerHooks. */
function resolve(specifier, context, nextResolve) {
    if (REDIRECTED.has(specifier) && (context.parentURL ?? '').endsWith('.test.js')) {
        return {url: STUB, shortCircuit: true, format: 'module'};
    }
    return nextResolve(specifier, context);
}

export {resolve};
