import {describe, expect, it} from 'bun:test';

import {compare} from '@callstack/reassure-compare';
import fs from 'fs';
import os from 'os';
import path from 'path';

/**
 * Guards patches/@callstack/reassure-compare: a selective PR run must not report the scenarios Jest
 * didn't select as removed, while scenarios the PR really deleted still are.
 */

type Output = {removed: Array<{name: string}>; meaningless: Array<{name: string}>};

const entry = (name: string, testPath?: string) => ({name, type: 'render', testPath, runs: 1, meanDuration: 1, stdevDuration: 0, durations: [1], meanCount: 1, stdevCount: 0, counts: [1]});
const toPerf = (entries: Array<ReturnType<typeof entry>>) => [{metadata: {}}, ...entries].map((line) => JSON.stringify(line)).join('\n');

describe('reassure-compare with a selective run', () => {
    it('reports only scenarios whose test file ran or was deleted as removed', async () => {
        // Given test files the PR ran, kept but didn't select, and deleted
        const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'reassure-'));
        const ran = path.join(dir, 'ran.perf-test.tsx');
        const unselected = path.join(dir, 'unselected.perf-test.tsx');
        fs.writeFileSync(ran, '');
        fs.writeFileSync(unselected, '');
        const deleted = path.join(dir, 'deleted.perf-test.tsx');
        fs.writeFileSync(
            path.join(dir, 'baseline.perf'),
            toPerf([entry('Kept', ran), entry('Deleted scenario', ran), entry('Unselected', unselected), entry('Deleted file', deleted), entry('Written before the patch')]),
        );
        fs.writeFileSync(path.join(dir, 'current.perf'), toPerf([entry('Kept', ran)]));

        // When the PR's run is compared with the full baseline
        const outputFile = path.join(dir, 'output.json');
        await compare({baselineFile: path.join(dir, 'baseline.perf'), currentFile: path.join(dir, 'current.perf'), outputFile, outputFormat: 'json'});
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- reassure-compare's output.json
        const output = JSON.parse(fs.readFileSync(outputFile, 'utf8')) as Output;

        // Then the unselected scenario is neither compared nor removed, and real removals still show
        expect(output.meaningless.map(({name}) => name)).toEqual(['Kept']);
        expect(output.removed.map(({name}) => name)).toEqual(['Deleted file', 'Deleted scenario', 'Written before the patch']);
    });
});
