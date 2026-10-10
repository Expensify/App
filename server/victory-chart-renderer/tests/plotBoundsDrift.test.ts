import {afterAll, beforeAll, describe, expect, test} from 'bun:test';

import type {ChartBounds} from 'victory-native';

import bundleWithRnStubs from '@server/libs/bundleWithRnStubs';
import {spawnSync} from 'node:child_process';
import {mkdtempSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join, resolve} from 'node:path';
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
        await bundleWithRnStubs({
            packageRoot,
            entrypoint: fileURLToPath(import.meta.resolve('./probes/plotBoundsProbe.tsx')),
            outFile: bundlePath,
        });

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
        // Given a real chart laid out the way the vertical bar chart is, whose padding and axes the line chart shares, drawn headless by the probe
        // When its reported plot bounds are compared with the ones predicted from its width
        // Then they match, so a victory-native upgrade that moves the plot fails here instead of misplacing labels
        expect(probeOutput.predicted).toEqual(probeOutput.reported);
    });
});
