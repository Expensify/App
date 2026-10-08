import {cpSync, mkdirSync, mkdtempSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {createTestHarness, experimental_readRawConfig} from 'wrangler';

const WORKER_DIR = path.resolve(import.meta.dirname, '..');

/** A minimal stand-in for `dist/`, with one file per naming scheme or behavior the Worker treats differently. */
const FAKE_WEB_BUILD: Record<string, string> = {
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
    'main-0123456789abcdef.bundle.js': 'window.fixtureBundle = true;',
    'main-0123456789abcdef.bundle.js.br': 'stands in for a Brotli twin',
    'main.0123456789.css': '#root {}',
    'merged-source-map.js.map': '{"version":3,"sources":[],"mappings":""}',
    'service-worker.js': 'self.fixtureServiceWorker = true;',
    'workbox-01234567.js': 'self.fixtureWorkbox = true;',
    'version.json': '{"version":"1.0.0-0"}',
    '.well-known/apple-app-site-association': '{"applinks":{"details":[]}}',
};

type WorkerHarness = {
    server: ReturnType<typeof createTestHarness>;
    cleanup: () => Promise<void>;
};

function writeFakeWebBuild(assetsDir: string) {
    for (const [filePath, contents] of Object.entries(FAKE_WEB_BUILD)) {
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
function createWorkerHarness(env?: 'staging' | 'production'): WorkerHarness {
    const tempDir = mkdtempSync(path.join(tmpdir(), 'new-expensify-worker-'));
    const assetsDir = path.join(tempDir, 'dist');
    writeFakeWebBuild(assetsDir);

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

    const server = createTestHarness({workers: [{configPath, env}]});
    return {
        server,
        cleanup: async () => {
            await server.close();
            rmSync(tempDir, {recursive: true, force: true});
        },
    };
}

export default createWorkerHarness;
