import type {Plugin} from 'esbuild';

/**
 * Bundles an engine benchmark entry (tests/perf-local/engine/*.ts) into one plain JS file that Node and the Hermes CLI can both run.
 * App code is bundled as is; packages that need a native runtime (React Native, Onyx storage, Sentry, ...) are replaced by
 * stubs, which is fine for benchmarks of pure functions that only import them for unrelated module-level setup.
 *
 * Usage: bun scripts/bundleEngineBench.ts <entry.ts> <out.js> [--hermes]
 *   --hermes also compiles the bundle to Hermes bytecode (<out>.hbc) with the hermesc the app build uses.
 */
import {rspack} from '@rspack/core';
import {build} from 'esbuild';
import {spawnSync} from 'node:child_process';
import {existsSync, readFileSync, writeFileSync} from 'node:fs';
import {resolve} from 'node:path';

// Matched against bare import specifiers; everything here is swapped for a stub that absorbs any property access or call.
const STUBBED_PACKAGES = [
    /^react-native($|\/)/,
    /^react-native-/,
    /^@react-native/,
    /^@react-navigation\//,
    /^@sentry\//,
    /^@expensify\/react-native-/,
    /^@shopify\//,
    /^expo($|-|\/)/,
    /^@expo\//,
    /^react($|\/|-dom)/,
    /^@ua\//,
    /^@react-ng\//,
    /^@fullstory\//,
    /^@invertase\//,
    /^@firebase\//,
    /^@rnmapbox\//,
    /^pusher-js/,
];

const ASSET_EXTENSIONS = ['.svg', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.lottie', '.riv', '.mp3', '.mp4', '.ttf', '.otf', '.woff', '.woff2', '.pdf'];

// One object that absorbs any property access, call or `new`, so module-level setup code runs without a native runtime.
// Used for stubbed packages and for missing runtime globals alike.
const STUB_PROXY_SOURCE = `
const handler = {get: (target, key) => (key === Symbol.toPrimitive ? () => '' : key === Symbol.iterator ? [][Symbol.iterator] : stub), apply: () => stub, construct: () => stub};
const stub = new Proxy(function () {}, handler);
`;

const STUB_CORE_SOURCE = `${STUB_PROXY_SOURCE}export default stub;\n`;

const STUB_CORE_PATH = 'native-stub-core';
const STUB_PATH_SEPARATOR = '|';
const IDENTIFIER = /^[A-Za-z_$][\w$]*$/;

function escapeRegExp(text: string): string {
    return text.replaceAll(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** The imported name from one `{...}` entry: "type Foo" and "Foo as Bar" both give "Foo". */
function getLocalName(part: string): string {
    return (
        part
            .replace(/^\s*type\s+/, '')
            .split(/\s+as\s+/)[0]
            ?.trim() ?? ''
    );
}

/** Names a file imports or re-exports from one package, read off its import lines, so the stub can export exactly those. */
function getImportedNames(importerSource: string, specifier: string): Set<string> {
    const names = new Set<string>();
    const from = `\\s+from\\s*['"]${escapeRegExp(specifier)}['"]`;
    for (const match of importerSource.matchAll(new RegExp(`\\bimport\\s+(?:type\\s+)?((?:(?!\\bimport\\b)[^;])*?)${from}`, 'g'))) {
        const clause = match[1] ?? '';
        const namespace = /\*\s+as\s+([\w$]+)/.exec(clause)?.[1];
        if (namespace) {
            for (const access of importerSource.matchAll(new RegExp(`\\b${escapeRegExp(namespace)}\\.([\\w$]+)`, 'g'))) {
                names.add(access[1] ?? '');
            }
        }
        for (const part of /\{([^}]*)\}/.exec(clause)?.[1]?.split(',') ?? []) {
            names.add(getLocalName(part));
        }
    }
    for (const match of importerSource.matchAll(new RegExp(`export\\s*(?:type\\s*)?\\{([^}]*)\\}${from}`, 'g'))) {
        for (const part of match[1]?.split(',') ?? []) {
            names.add(getLocalName(part));
        }
    }
    names.delete('default');
    return new Set([...names].filter((name) => IDENTIFIER.test(name)));
}

const stubNativePackages: Plugin = {
    name: 'stub-native-packages',
    setup(pluginBuild) {
        pluginBuild.onResolve({filter: new RegExp(`^${STUB_CORE_PATH}$`)}, () => ({path: STUB_CORE_PATH, namespace: 'native-stub-core'}));
        pluginBuild.onLoad({filter: /.*/, namespace: 'native-stub-core'}, () => ({contents: STUB_CORE_SOURCE, loader: 'js'}));

        // One stub module per importing file, since each file asks for different named exports.
        pluginBuild.onResolve({filter: /^[^./]/}, (args) =>
            STUBBED_PACKAGES.some((pattern) => pattern.test(args.path)) ? {path: `${args.path}${STUB_PATH_SEPARATOR}${args.importer}`, namespace: 'native-stub'} : undefined,
        );
        pluginBuild.onLoad({filter: /.*/, namespace: 'native-stub'}, (args) => {
            const separatorIndex = args.path.indexOf(STUB_PATH_SEPARATOR);
            const specifier = args.path.slice(0, separatorIndex);
            const importer = args.path.slice(separatorIndex + 1);
            const names = importer && existsSync(importer) ? getImportedNames(readFileSync(importer, 'utf8'), specifier) : new Set<string>();
            const exports = [...names].map((name) => `export const ${name} = stub;`).join('\n');
            return {contents: `import stub from '${STUB_CORE_PATH}';\nexport default stub;\n${exports}\n`, loader: 'js', resolveDir: process.cwd()};
        });
    },
};

const RUNTIME_GLOBAL_STUBS = [
    'AbortController',
    'AbortSignal',
    'fetch',
    'Headers',
    'Request',
    'Response',
    'FormData',
    'URL',
    'URLSearchParams',
    'Blob',
    'File',
    'FileReader',
    'XMLHttpRequest',
    'WebSocket',
    'TextEncoder',
    'TextDecoder',
    'Event',
    'EventTarget',
    'CustomEvent',
    'localStorage',
    'sessionStorage',
    'crypto',
    'atob',
    'btoa',
    'nativeFabricUIManager',
];

// What React Native's InitializeCore sets up before app code runs; the Hermes CLI only provides `print`.
const RUNTIME_PRELUDE = `
globalThis.window = globalThis;
globalThis.navigator = globalThis.navigator || {product: 'ReactNative', userAgent: ''};
globalThis.process = globalThis.process || {env: {NODE_ENV: 'production'}};
(() => {
    ${STUB_PROXY_SOURCE}
    // Web APIs React Native polyfills; app modules touch them at import time, the code under test never does.
    // No document/location/history: React Native has none, and libraries such as jQuery check for them.
    for (const name of ${JSON.stringify(RUNTIME_GLOBAL_STUBS)}) {
        if (typeof globalThis[name] === 'undefined') {
            globalThis[name] = stub;
        }
    }
    // The Hermes CLI has no process.exit and runs leftover app timers (logging, Pusher) after the last result, which then
    // fail against the stubs. Benchmarks are synchronous, so under Hermes timers are dropped instead.
    const isHermes = typeof HermesInternal === 'object';
    for (const name of ['setTimeout', 'setInterval', 'setImmediate', 'requestAnimationFrame']) {
        if (isHermes || typeof globalThis[name] === 'undefined') {
            globalThis[name] = () => 0;
        }
    }
    for (const name of ['clearTimeout', 'clearInterval', 'clearImmediate', 'cancelAnimationFrame']) {
        if (typeof globalThis[name] === 'undefined') {
            globalThis[name] = () => {};
        }
    }
    if (typeof globalThis.queueMicrotask === 'undefined') {
        globalThis.queueMicrotask = (callback) => Promise.resolve().then(callback);
    }
})();
if (typeof console === 'undefined') {
    const write = (...args) => print(args.map(String).join(' '));
    globalThis.console = {log: write, info: write, warn: write, error: write, debug: () => {}, trace: () => {}, time: () => {}, timeEnd: () => {}, group: () => {}, groupEnd: () => {}};
}
`;

async function run() {
    const [entry, outFile, ...flags] = process.argv.slice(2);
    if (!entry || !outFile) {
        throw new Error('Usage: bun scripts/bundleEngineBench.ts <entry.ts> <out.js> [--hermes]');
    }
    const isHermes = flags.includes('--hermes');

    await build({
        entryPoints: [entry],
        outfile: outFile,
        bundle: true,
        format: 'iife',
        platform: 'browser',
        mainFields: ['react-native', 'module', 'main'],
        // The iOS variants, as the app bundle resolves them, for both engines, so Node and Hermes time the same code.
        resolveExtensions: ['.ios.ts', '.ios.tsx', '.native.ts', '.native.tsx', '.ts', '.tsx', '.ios.js', '.native.js', '.js', '.jsx', '.json'],
        // One syntax level for both engines, so the comparison isn't skewed by one side running transpiled code.
        target: 'es2019',
        banner: {js: RUNTIME_PRELUDE},
        // Built from entries: the keys are dotted global names, which the naming-convention lint rule rejects as object keys.
        define: Object.fromEntries([
            ['process.env.NODE_ENV', '"production"'],
            ['__DEV__', 'false'],
            ['global', 'globalThis'],
        ]),
        plugins: [stubNativePackages],
        // Icons, images and animations are only referenced, never read, by the code under test.
        loader: Object.fromEntries(ASSET_EXTENSIONS.map((extension) => [extension, 'empty'])),
        logLevel: 'error',
        legalComments: 'none',
    });

    // Hermes shares one let/const binding across loop iterations and can't parse async generators, so the app build lowers
    // both with SWC before hermesc (config/repack/cjs-inline-requires-loader.mjs). Same lowering here, for both engines.
    const lowered = await rspack.experiments.swc.transform(readFileSync(outFile, 'utf8'), {
        filename: outFile,
        isModule: false,
        env: {targets: {node: 24}, include: ['transform-block-scoping', 'transform-async-to-generator', 'transform-async-generator-functions']},
    });
    writeFileSync(outFile, lowered.code);

    if (isHermes) {
        // Same compiler and -O level the release app bundle uses, so the timed bytecode matches what ships.
        const hermesc = resolve('node_modules/hermes-compiler/hermesc', process.platform === 'darwin' ? 'osx-bin' : 'linux64-bin', 'hermesc');
        const result = spawnSync(hermesc, ['-O', '-emit-binary', '-out', outFile.replace(/\.js$/, '.hbc'), outFile], {encoding: 'utf8'});
        if (result.status !== 0) {
            throw new Error(`hermesc failed:\n${result.error?.message ?? ''}\n${result.stdout ?? ''}\n${result.stderr ?? ''}`);
        }
    }
}

run().catch((error: unknown) => {
    console.error(error);
    process.exit(1);
});
