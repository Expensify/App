#!/usr/bin/env ts-node
/**
 * `@actions/core`, `@actions/github`, and a handful of `@octokit/*` plugins we import directly (see
 * jest.config.js's moduleNameMapper) ship as pure ESM: their package.json sets `"type": "module"` and their
 * "exports" map has no "require"/"default" fallback. Jest's `require()`-based module system refuses to load
 * such a module synchronously (`Must use import to load ES Module`), no matter how transformIgnorePatterns is
 * configured, because that check happens before any transform runs.
 *
 * Rather than trying to run Jest's test files themselves in native ESM mode (which would ripple out to every
 * test and every setup file), we pre-bundle each of these packages into a small, fully self-contained CJS file
 * with esbuild, and point Jest's moduleNameMapper at the bundle instead of the real package. This script
 * (re)generates those bundles; run it with `npm run build-jest-shims` whenever one of the source packages is
 * upgraded.
 */
import {build} from 'esbuild';
import path from 'path';

const OUT_DIR = path.resolve(__dirname, 'shims');

const SHIMS: Array<{outfile: string; entryPoint: string}> = [
    {outfile: 'actions-core.cjs', entryPoint: '@actions/core'},
    {outfile: 'actions-github.cjs', entryPoint: '@actions/github'},
    {outfile: 'actions-github-utils.cjs', entryPoint: '@actions/github/lib/utils'},
    {outfile: 'octokit-plugin-paginate-rest.cjs', entryPoint: '@octokit/plugin-paginate-rest'},
    {outfile: 'octokit-plugin-throttling.cjs', entryPoint: '@octokit/plugin-throttling'},
    {outfile: 'octokit-request-error.cjs', entryPoint: '@octokit/request-error'},
];

// esbuild's CJS output defines each export via a non-configurable getter (to preserve ESM's live-binding
// semantics), but jest.spyOn() (used e.g. on `@actions/core`'s exports in jest/setup.ts, and on this same module
// from multiple test/source files that must all observe the same mock) replaces a property via
// Object.defineProperty, which requires it to be configurable. Flattening into a plain object with `{...}`
// snapshots the current values as ordinary writable/configurable data properties, which is fine here since none
// of our shimmed packages mutate their own exports after initialization. `{...}` only copies *enumerable*
// properties though, and esbuild marks its synthesized `__esModule` flag as non-enumerable, so it must be
// restored explicitly — otherwise Babel's CJS/ESM interop (used by babel-jest) treats the shim as a non-ES
// module and re-wraps it independently on every import, breaking spies set up from a different file than the
// one under test.
const FLATTEN_EXPORTS_FOOTER = "module.exports = {...module.exports}; Object.defineProperty(module.exports, '__esModule', {value: true});";

async function buildShim(outfile: string, entryPoint: string): Promise<void> {
    await build({
        entryPoints: [entryPoint],
        outfile: path.join(OUT_DIR, outfile),
        bundle: true,
        platform: 'node',
        target: 'node20',
        format: 'cjs',
        splitting: false,
        sourcemap: false,
        footer: {js: FLATTEN_EXPORTS_FOOTER},
        logLevel: 'silent',
    });
}

async function main(): Promise<void> {
    const results = await Promise.allSettled(SHIMS.map(({outfile, entryPoint}) => buildShim(outfile, entryPoint)));

    let hasFailure = false;
    for (let i = 0; i < results.length; i++) {
        const result = results.at(i);
        if (result?.status === 'rejected') {
            hasFailure = true;
            console.error(`❌ Failed to build shim ${SHIMS.at(i)?.outfile}:`, result.reason);
        }
    }

    if (hasFailure) {
        process.exit(1);
    }

    console.error(`✅ Built ${SHIMS.length} Jest ESM shims in ${OUT_DIR}`);
}

main();
