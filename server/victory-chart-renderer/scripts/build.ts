/*
 * Cross-compiles the victory-chart-renderer CLI into a standalone binary.
 *
 * Like dev.ts, this bundles src/cli.tsx with rnStubPlugin so hoisted victory-native does
 * not pull real react-native into the graph. Unlike dev.ts, Bun.build uses `compile` to
 * emit a platform-specific executable (--target, --outfile) rather than a .dev/cli.js
 * bundle run under Bun.
 *
 * Required --target and --outfile select the Bun compile target and output path. The script
 * exits after writing the binary; it does not run it.
 */
import parseCompileTarget from '@server/libs/parseCompileTarget';
import createRnStubPlugin from '@server/plugins/rnStubPlugin';
import {join, resolve} from 'node:path';
import CLI from '@scripts/utils/CLI';

const packageRoot = resolve(import.meta.dir, '..');
const stubRoot = resolve(packageRoot, '../stubs');

const cli = new CLI({
    namedArgs: {
        target: {
            description: 'Bun compile target (e.g. bun-darwin-arm64, bun-linux-x64)',
            parse: parseCompileTarget,
        },
        outfile: {
            description: 'Path for the compiled binary output',
        },
    },
});

const {target, outfile} = cli.namedArgs;

const buildResult = await Bun.build({
    entrypoints: [join(packageRoot, 'src/cli.tsx')],
    compile: {
        target,
        outfile,
    },
    packages: 'bundle',
    conditions: ['react-native'],
    plugins: [createRnStubPlugin(stubRoot)],
});

if (!buildResult.success) {
    for (const log of buildResult.logs) {
        console.error(log);
    }
    throw new Error(`Failed to compile victory-chart-renderer for ${target}`);
}
