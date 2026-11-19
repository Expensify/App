import {cpSync, mkdirSync, mkdtempSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {brotliCompressSync} from 'node:zlib';
import {createTestHarness, experimental_readRawConfig} from 'wrangler';

const WORKER_DIR = path.resolve(import.meta.dirname, '..');

const MAIN_BUNDLE = 'window.fixtureBundle = true;';
const SERVICE_WORKER = 'self.fixtureServiceWorker = true;';

/** A minimal stand-in for `dist/`, with one file per naming scheme or behavior the Worker treats differently. */
const FAKE_WEB_BUILD: Record<string, string | Uint8Array> = {
    'index.html': [
        '<!doctype html>',
        '<html>',
        '    <head>',
        '        <title>New Expensify fixture</title>',
        "        <script nonce='nonce-random-value'>window.fixtureInlineScript = true;</script>",
        '        <script defer src="/main-0123456789abcdef.bundle.js"></script>',
        '    </head>',
        '    <body>',
        '        <div id="root"></div>',
        '    </body>',
        '</html>',
    ].join('\n'),
    'main-0123456789abcdef.bundle.js': MAIN_BUNDLE,
    'main-0123456789abcdef.bundle.js.br': brotliCompressSync(MAIN_BUNDLE),
    'main.0123456789.css': '#root {}',
    'merged-source-map.js.map': '{"version":3,"sources":[],"mappings":""}',
    'service-worker.js': SERVICE_WORKER,
    'service-worker.js.br': brotliCompressSync(SERVICE_WORKER),
    'workbox-01234567.js': 'self.fixtureWorkbox = true;',
    'version.json': '{"version":"1.0.0-0"}',
    '.well-known/apple-app-site-association': '{"applinks":{"details":[]}}',
};

type PreviousBuildFile = {
    path: string;
    contents: string | Uint8Array;
    contentType: string;
};

/** The part of the R2 binding the tests use; the full Workers types conflict with Node's globals in this project. */
type PreviousBuildsEnv = {
    PREVIOUS_BUILDS?: {put: (key: string, value: string | Uint8Array, options: {httpMetadata: {contentType: string}}) => Promise<unknown>};
};

type WorkerHarness = {
    server: ReturnType<typeof createTestHarness>;
    /** Stores files in the Worker's local PREVIOUS_BUILDS bucket, as a deploy of an earlier build would have. */
    addPreviousBuildFiles: (files: PreviousBuildFile[]) => Promise<void>;
    cleanup: () => Promise<void>;
};

function writeFakeWebBuild(assetsDir: string, omittedFiles: string[]) {
    for (const [filePath, contents] of Object.entries(FAKE_WEB_BUILD)) {
        if (omittedFiles.includes(filePath)) {
            continue;
        }
        const absolutePath = path.join(assetsDir, filePath);
        mkdirSync(path.dirname(absolutePath), {recursive: true});
        writeFileSync(absolutePath, contents);
    }
    cpSync(path.join(WORKER_DIR, '.assetsignore'), path.join(assetsDir, '.assetsignore'));
}

/**
 * Runs the real wrangler.jsonc against a fake web build in a temporary directory. The harness has no option to
 * override the assets directory, so this writes a temporary config that changes `main` and `assets.directory`, and
 * copies .assetsignore itself in place of the `build` command.
 */
function createWorkerHarness(env?: 'test-staging' | 'staging' | 'production', {omittedFiles = [], vars = {}}: {omittedFiles?: string[]; vars?: Record<string, string>} = {}): WorkerHarness {
    const tempDir = mkdtempSync(path.join(tmpdir(), 'new-expensify-worker-'));
    const assetsDir = path.join(tempDir, 'dist');
    writeFakeWebBuild(assetsDir, omittedFiles);

    const {rawConfig} = experimental_readRawConfig({config: path.join(WORKER_DIR, 'wrangler.jsonc')});
    const {$schema: _schema, build: _build, ...config} = rawConfig;
    const configPath = path.join(tempDir, 'wrangler.json');
    writeFileSync(
        configPath,
        JSON.stringify({
            ...config,
            main: path.join(WORKER_DIR, rawConfig.main ?? ''),
            assets: {...rawConfig.assets, directory: assetsDir},
        }),
    );

    const server = createTestHarness({workers: [{configPath, env, vars}]});
    const workerName = (env ? rawConfig.env?.[env]?.name : undefined) ?? rawConfig.name ?? '';
    return {
        server,
        addPreviousBuildFiles: async (files) => {
            const {PREVIOUS_BUILDS: previousBuilds} = await server.getWorker<PreviousBuildsEnv>(workerName).getEnv();
            if (!previousBuilds) {
                throw new Error(`The ${env ?? 'default'} environment has no PREVIOUS_BUILDS binding`);
            }
            for (const file of files) {
                await previousBuilds.put(file.path, file.contents, {httpMetadata: {contentType: file.contentType}});
            }
        },
        cleanup: async () => {
            await server.close();
            rmSync(tempDir, {recursive: true, force: true});
        },
    };
}

export default createWorkerHarness;
