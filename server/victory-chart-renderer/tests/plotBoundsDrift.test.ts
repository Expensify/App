import {afterAll, beforeAll, describe, expect, test} from 'bun:test';

import type {ChartBounds} from 'victory-native';

import assertBuildSuccess from '@server/libs/assertBuildSuccess';
import createRnStubPlugin from '@server/plugins/rnStubPlugin';
import {spawnSync} from 'node:child_process';
import {mkdtempSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {basename, join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

import {packageRoot} from './testUtils';

type PlotBounds = Pick<ChartBounds, 'left' | 'right'>;

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
            entrypoints: [fileURLToPath(import.meta.resolve('./probes/plotBoundsProbe.tsx'))],
            target: 'bun',
            packages: 'bundle',
            conditions: ['react-native'],
            tsconfig: join(packageRoot, 'tsconfig.json'),
            plugins: [createRnStubPlugin(resolve(packageRoot, '../stubs'))],
        });

        assertBuildSuccess(buildResult, 'Failed to bundle the plot bounds probe');

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

    afterAll(() => {
        rmSync(runDir, {recursive: true, force: true});
    });

    test('should predict the plot bounds victory-native reports', () => {
        // Given a real chart laid out the way the line and vertical bar charts are, drawn headless by the probe
        // When its reported plot bounds are compared with the ones predicted from its width
        // Then they match, so a victory-native upgrade that moves the plot fails here instead of misplacing labels
        expect(probeOutput.predicted).toEqual(probeOutput.reported);
    });
});
