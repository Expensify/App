import {join, resolve} from 'node:path';
import createRnStubPlugin from './rnStubPlugin';

const packageRoot = resolve(import.meta.dir, '..');
const stubRoot = resolve(packageRoot, '../stubs');

const target = process.argv.at(2);
const outfile = process.argv.at(3);

if (!target || !outfile) {
    throw new Error('Usage: bun run scripts/build.ts <bun-target> <outfile>');
}

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
