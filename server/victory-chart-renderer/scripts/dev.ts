/*
 * Development runner for the victory-chart-renderer CLI.
 *
 * victory-native is hoisted to the App repo root, so a bare `bun run src/cli.tsx` would
 * resolve real react-native native sources that Bun cannot bundle.
 *
 * process.argv entries after this script are forwarded unchanged to the bundled CLI.
 * The child process cwd is the App repository root (two levels above this package).
 *
 * For a standalone executable instead of a Bun-run bundle, use build.ts.
 */
import bundleWithRnStubs from '@server/libs/bundleWithRnStubs';
import {spawnSync} from 'node:child_process';
import {mkdirSync} from 'node:fs';
import {join, resolve} from 'node:path';

const packageRoot = resolve(import.meta.dir, '..');
const repoRoot = resolve(packageRoot, '../..');
const outFile = resolve(packageRoot, '.dev/cli.js');

mkdirSync(join(packageRoot, '.dev'), {recursive: true});

await bundleWithRnStubs({packageRoot, entrypoint: resolve(packageRoot, 'src/bootstrap.tsx'), outFile});

const runResult = spawnSync(process.execPath, [outFile, ...process.argv.slice(2)], {
    cwd: repoRoot,
    stdio: 'inherit',
});

process.exit(runResult.status ?? 1);
