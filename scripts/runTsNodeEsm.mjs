#!/usr/bin/env node
/**
 * Bootstrap for running a single .ts file as real ESM under ts-node.
 *
 * `node --loader ts-node/esm some-file.ts` can't be used directly: on Node 20, having the entry point itself be a
 * loader-transpiled .ts file throws `ERR_REQUIRE_CYCLE_MODULE` (https://github.com/TypeStrong/ts-node/issues/2158).
 * The documented workaround is to register the loader from a plain .mjs entry point and dynamically `import()` the
 * real .ts file from there, which is what this file does.
 *
 * Usage: node scripts/runTsNodeEsm.mjs <path/to/file.ts> [...args]
 * `[...args]` are forwarded via `process.argv`, exactly as if `file.ts` had been run directly with `ts-node`.
 */
import {register} from 'node:module';
import path from 'node:path';
import {pathToFileURL} from 'node:url';

register('ts-node/esm', pathToFileURL('./'));

const [entryPoint, ...args] = process.argv.slice(2);
if (!entryPoint) {
    console.error('Usage: node scripts/runTsNodeEsm.mjs <path/to/file.ts> [...args]');
    process.exit(1);
}

const resolvedEntryPoint = path.resolve(entryPoint);
process.argv = [process.argv[0], resolvedEntryPoint, ...args];

try {
    await import(pathToFileURL(resolvedEntryPoint).href);
} catch (error) {
    console.error(error);
    process.exit(1);
}
