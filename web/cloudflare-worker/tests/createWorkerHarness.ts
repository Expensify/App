import {cpSync, mkdtempSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {createTestHarness, experimental_readRawConfig} from 'wrangler';

const WORKER_DIR = path.resolve(import.meta.dirname, '..');
const FIXTURE_BUILD_DIR = path.join(import.meta.dirname, 'fixtures', 'webBuild');

type WorkerHarness = {
    server: ReturnType<typeof createTestHarness>;
    cleanup: () => Promise<void>;
};

/**
 * Runs the real wrangler.jsonc against a copy of the fixture build. The harness has no option to override the
 * assets directory, so this writes a temporary config that changes `main` and `assets.directory`, and copies
 * .assetsignore itself in place of the `build` command.
 */
function createWorkerHarness(env?: 'staging' | 'production'): WorkerHarness {
    const tempDir = mkdtempSync(path.join(tmpdir(), 'new-expensify-worker-'));
    const assetsDir = path.join(tempDir, 'dist');
    cpSync(FIXTURE_BUILD_DIR, assetsDir, {recursive: true});
    cpSync(path.join(WORKER_DIR, '.assetsignore'), path.join(assetsDir, '.assetsignore'));

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
