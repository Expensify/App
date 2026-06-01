import {join, resolve} from 'node:path';
import CLI from '@scripts/utils/CLI';
import createRnStubPlugin from './rnStubPlugin';

const packageRoot = resolve(import.meta.dir, '..');
const stubRoot = resolve(packageRoot, '../stubs');

const cli = new CLI({
    namedArgs: {
        target: {
            description: 'Bun compile target (e.g. bun-darwin-arm64, bun-linux-x64)',
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
        target: target as Bun.Build.CompileTarget,
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
