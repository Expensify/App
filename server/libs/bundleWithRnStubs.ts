import assertBuildSuccess from '@server/libs/assertBuildSuccess';
import createRnStubPlugin from '@server/plugins/rnStubPlugin';
import {basename, dirname, join, resolve} from 'node:path';

type BundleWithRnStubsOptions = {
    packageRoot: string;
    entrypoint: string;
    outFile: string;
};

/** Every output is written beside outFile, because the bundle loads CanvasKit's wasm from beside itself. */
async function bundleWithRnStubs({packageRoot, entrypoint, outFile}: BundleWithRnStubsOptions): Promise<void> {
    const buildResult = await Bun.build({
        entrypoints: [entrypoint],
        target: 'bun',
        packages: 'bundle',
        conditions: ['react-native'],
        tsconfig: join(packageRoot, 'tsconfig.json'),
        plugins: [createRnStubPlugin(resolve(packageRoot, '../stubs'))],
    });

    assertBuildSuccess(buildResult, `Failed to bundle ${entrypoint}`);

    if (buildResult.outputs.length === 0) {
        throw new Error(`Bundled output of ${entrypoint} is missing`);
    }

    for (const output of buildResult.outputs) {
        await Bun.write(output.kind === 'entry-point' ? outFile : join(dirname(outFile), basename(output.path)), output);
    }
}

export default bundleWithRnStubs;
