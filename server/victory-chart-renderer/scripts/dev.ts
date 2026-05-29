import {spawnSync} from 'node:child_process';
import {mkdirSync} from 'node:fs';
import {join, resolve} from 'node:path';
import createRnStubPlugin from './rnStubPlugin';

const packageRoot = resolve(import.meta.dir, '..');
const repoRoot = resolve(packageRoot, '../..');
const stubRoot = resolve(packageRoot, '../stubs');
const outFile = resolve(packageRoot, '.dev/cli.js');

mkdirSync(join(packageRoot, '.dev'), {recursive: true});

const buildResult = await Bun.build({
    entrypoints: [resolve(packageRoot, 'src/cli.tsx')],
    target: 'bun',
    packages: 'bundle',
    conditions: ['react-native'],
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
