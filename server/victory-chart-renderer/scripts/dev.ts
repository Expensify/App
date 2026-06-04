/*
 * Development runner for the victory-chart-renderer CLI.
 *
 * victory-native is hoisted to the App repo root, so a bare `bun run src/cli.tsx` would
 * resolve real react-native native sources that Bun cannot bundle. This script bundles
 * src/cli.tsx with rnStubPlugin (redirecting RN imports to server/stubs), writes the
 * bundle to .dev/cli.js, then executes it under the current Bun binary.
 *
 * process.argv entries after this script are forwarded unchanged to the bundled CLI.
 * The child process cwd is the App repository root (two levels above this package).
 *
 * For a standalone executable instead of a Bun-run bundle, use build.ts.
 */
import createRnStubPlugin from '@server/plugins/rnStubPlugin';
import {spawnSync} from 'node:child_process';
import {mkdirSync} from 'node:fs';
import {join, resolve} from 'node:path';

const packageRoot = resolve(import.meta.dir, '..');
const repoRoot = resolve(packageRoot, '../..');
const stubRoot = resolve(packageRoot, '../stubs');
const tsconfigPath = join(packageRoot, 'tsconfig.json');
const outFile = resolve(packageRoot, '.dev/cli.js');

mkdirSync(join(packageRoot, '.dev'), {recursive: true});

const buildResult = await Bun.build({
    entrypoints: [resolve(packageRoot, 'src/bootstrap.tsx')],
    target: 'bun',
    packages: 'bundle',
    conditions: ['react-native'],
    tsconfig: tsconfigPath,
    plugins: [createRnStubPlugin(stubRoot)],
});

if (!buildResult.success) {
    for (const log of buildResult.logs) {
        console.error(log);
    }
    throw new Error('Failed to bundle victory-chart-renderer CLI');
}

const [bundle] = buildResult.outputs;
if (!bundle) {
    throw new Error('Bundled CLI output is missing');
}

await Bun.write(outFile, bundle);

const runResult = spawnSync(process.execPath, [outFile, ...process.argv.slice(2)], {
    cwd: repoRoot,
    stdio: 'inherit',
});

process.exit(runResult.status ?? 1);
