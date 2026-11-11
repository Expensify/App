/** Safe preview packaging shared by the CI deployment CLI and standalone workerd tests. */
import {cpSync, existsSync, lstatSync, mkdirSync, mkdtempSync, readdirSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';

type BuildIdentity = {sha: string; runID: string; runAttempt: string};
type WorkerRuntime = {compatibility_date: string; compatibility_flags: string[]};
type ExtractAssets = (archive: string, destination: string) => void | Promise<void>;

const STATUS_PATH = '/__expensify_preview';
// cspell:ignore expensfy -- Matches the configured Cloudflare Worker name.
const WORKER_NAME = 'new-expensfy-adhoc';

function getTarget(prNumber: unknown) {
    if ((typeof prNumber !== 'string' && typeof prNumber !== 'number') || !/^[1-9]\d*$/.test(String(prNumber)) || !Number.isSafeInteger(Number(prNumber))) {
        throw new Error('A positive numeric PR number is required');
    }
    return {name: String(prNumber), hostname: `${prNumber}.adhoc.expensify.com`};
}

function getPreviewCommand(prNumber: unknown, configPath: string, environment: Record<string, string | undefined>) {
    // A CI environment override must not redirect publication to another parent Worker.
    const env = {...environment};
    delete env.WRANGLER_CI_OVERRIDE_NAME;
    return {
        args: ['preview', '--worker-name', WORKER_NAME, '--name', getTarget(prNumber).name, '--ignore-base-config', '--config', configPath],
        env,
    };
}

function getIdentity(sha: unknown, runID: unknown, runAttempt: unknown): BuildIdentity {
    if (typeof sha !== 'string' || typeof runID !== 'string' || typeof runAttempt !== 'string' || !/^[a-f0-9]{40}$/.test(sha) || !/^\d+$/.test(runID) || !/^[1-9]\d*$/.test(runAttempt)) {
        throw new Error('An immutable SHA, run ID and run attempt are required');
    }
    return {sha, runID, runAttempt};
}

function isWorkerRuntime(runtime: unknown): runtime is WorkerRuntime {
    return (
        typeof runtime === 'object' &&
        runtime !== null &&
        'compatibility_date' in runtime &&
        typeof runtime.compatibility_date === 'string' &&
        /^\d{4}-\d{2}-\d{2}$/.test(runtime.compatibility_date) &&
        'compatibility_flags' in runtime &&
        Array.isArray(runtime.compatibility_flags) &&
        runtime.compatibility_flags.every((flag) => typeof flag === 'string')
    );
}

function createConfig(runtime: unknown) {
    // Only runtime settings are accepted from the build artifact, never names, routes, hooks, vars or bindings.
    if (!isWorkerRuntime(runtime)) {
        throw new Error('Invalid Worker runtime settings');
    }
    return {
        name: WORKER_NAME,
        main: 'worker/__preview_entry.mjs',
        base_dir: 'worker',
        compatibility_date: runtime.compatibility_date,
        compatibility_flags: runtime.compatibility_flags,
        no_bundle: true,
        find_additional_modules: true,
        rules: [
            {type: 'ESModule', globs: ['**/*.js', '**/*.mjs'], fallthrough: true},
            {type: 'CompiledWasm', globs: ['**/*.wasm'], fallthrough: true},
        ],
        previews: {vars: {ENVIRONMENT: 'staging'}},
        assets: {directory: 'dist', binding: 'ASSETS', not_found_handling: 'single-page-application', html_handling: 'none', run_worker_first: true},
    };
}

type PreviewConfig = ReturnType<typeof createConfig>;

function createWrapper(identity: BuildIdentity): string {
    // A separate health endpoint identifies the build without changing the app's Brotli responses or CSP nonces.
    return `import worker from './index.js';
export default {
    fetch(request, env, ctx) {
        if (new URL(request.url).pathname === '${STATUS_PATH}') {
            return Response.json(${JSON.stringify(identity)}, {headers: {'Cache-Control': 'no-store'}});
        }
        return worker.fetch(request, env, ctx);
    }
};\n`;
}

function validateBundle(directory: string): void {
    for (const entry of readdirSync(directory, {withFileTypes: true})) {
        const entryPath = path.join(directory, entry.name);
        if (entry.isDirectory()) {
            validateBundle(entryPath);
        } else if (!entry.isFile() || entry.name === '__preview_entry.mjs' || !/\.(?:m?js|wasm|map)$/.test(entry.name)) {
            throw new Error(`Unexpected Worker artifact: ${entry.name}`);
        }
    }
    // The entry point is checked separately at the root, not in recursive subdirectories.
}

async function prepareDirectory(bundleDirectory: string, assetsArchive: string, config: PreviewConfig, identity: BuildIdentity, extractAssets: ExtractAssets): Promise<string> {
    const root = mkdtempSync(path.join(tmpdir(), 'adhoc-deploy-'));
    const workerDirectory = path.join(root, 'worker');
    // runtime.json is data, not a module. Do not copy any configuration or build scripts from the artifact.
    mkdirSync(workerDirectory);
    for (const entry of readdirSync(bundleDirectory, {withFileTypes: true})) {
        if (entry.name === 'runtime.json' || entry.name === 'README.md') {
            continue;
        }
        cpSync(path.join(bundleDirectory, entry.name), path.join(workerDirectory, entry.name), {dereference: false, recursive: true});
    }
    validateBundle(workerDirectory);
    if (!existsSync(path.join(workerDirectory, 'index.js')) || !lstatSync(path.join(workerDirectory, 'index.js')).isFile()) {
        throw new Error('The Worker artifact must contain index.js');
    }
    await extractAssets(assetsArchive, path.join(root, 'dist'));
    writeFileSync(path.join(root, 'dist/preview-build.json'), JSON.stringify(identity));
    writeFileSync(path.join(root, 'dist/.assetsignore'), '*.map\n');
    writeFileSync(path.join(root, 'worker/__preview_entry.mjs'), createWrapper(identity));
    writeFileSync(path.join(root, 'wrangler.json'), JSON.stringify(config));
    return root;
}

export {createConfig, createWrapper, getIdentity, getPreviewCommand, getTarget, prepareDirectory, STATUS_PATH};
export type {BuildIdentity};
