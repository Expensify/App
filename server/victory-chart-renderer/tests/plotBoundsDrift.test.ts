import {beforeAll, describe, expect, test} from 'bun:test';

import createRnStubPlugin from '@server/plugins/rnStubPlugin';
import {spawnSync} from 'node:child_process';
import {mkdtempSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {basename, join, resolve} from 'node:path';

import {packageRoot} from './testUtils';

type PlotBounds = {left: number; right: number};

type ProbeOutput = {
    predicted: PlotBounds;
    reported: PlotBounds;
};

const runDir = mkdtempSync(join(tmpdir(), 'vcr-plot-bounds-'));
const bundlePath = join(runDir, 'plotBoundsProbe.js');

function hasPlotBounds(value: unknown): value is PlotBounds {
    return typeof value === 'object' && value !== null && 'left' in value && typeof value.left === 'number' && 'right' in value && typeof value.right === 'number';
}

function parseProbeOutput(raw: string): ProbeOutput {
    const parsed: unknown = JSON.parse(raw);

    if (typeof parsed !== 'object' || parsed === null || !('predicted' in parsed) || !('reported' in parsed) || !hasPlotBounds(parsed.predicted) || !hasPlotBounds(parsed.reported)) {
        throw new Error(`Plot bounds probe printed unexpected output:\n${raw}`);
    }

    return {predicted: parsed.predicted, reported: parsed.reported};
}

let probeOutput: ProbeOutput;

describe('cartesian plot bounds', () => {
    beforeAll(async () => {
        const buildResult = await Bun.build({
            entrypoints: [join(import.meta.dir, 'probes/plotBoundsProbe.tsx')],
            target: 'bun',
            packages: 'bundle',
            conditions: ['react-native'],
            tsconfig: join(packageRoot, 'tsconfig.json'),
            plugins: [createRnStubPlugin(resolve(packageRoot, '../stubs'))],
        });

        if (!buildResult.success) {
            throw new Error(`Failed to bundle the plot bounds probe:\n${buildResult.logs.map(String).join('\n')}`);
        }

        if (buildResult.outputs.length === 0) {
            throw new Error('Bundled plot bounds probe output is missing');
        }

        // The bundle loads CanvasKit's wasm from beside itself, so every output has to land in the run directory.
        for (const output of buildResult.outputs) {
            await Bun.write(output.kind === 'entry-point' ? bundlePath : join(runDir, basename(output.path)), output);
        }

        const runResult = spawnSync(process.execPath, [bundlePath], {
            cwd: resolve(packageRoot, '../..'),
            encoding: 'utf8',
        });

        if (runResult.status !== 0) {
            throw new Error(`Plot bounds probe failed:\n${runResult.stderr}\n${runResult.stdout}`);
        }

        probeOutput = parseProbeOutput(runResult.stdout);
    }, 120_000);

    test('getCartesianPlotBounds matches the bounds victory-native reports', () => {
        expect(probeOutput.predicted).toEqual(probeOutput.reported);
    });
});
