import {describe, expect, it} from 'bun:test';

import filterReassureBaseline from '../../.github/scripts/filterReassureBaseline';

const header = JSON.stringify({metadata: {branch: 'main'}});
const scenario = (name: string) => JSON.stringify({name, type: 'render', meanDuration: 1});
const jest = (files: Array<[string, string[]]>) => ({
    testResults: files.map(([name, tests]) => ({name, assertionResults: tests.map((fullName) => ({fullName}))})),
});

describe('filterReassureBaseline', () => {
    // Given a full baseline from main covering three perf test files
    const baselinePerf = [header, scenario('Selected kept'), scenario('Selected deleted'), scenario('Unselected'), scenario('Deleted file')].join('\n');
    const baselineJest = jest([
        ['/w/selected.perf-test.tsx', ['Selected kept', 'Selected deleted']],
        ['/w/unselected.perf-test.tsx', ['Unselected']],
        ['/w/deleted.perf-test.tsx', ['Deleted file']],
    ]);
    // and a PR that ran only selected.perf-test.tsx and deleted deleted.perf-test.tsx
    const branchJest = jest([['/w/selected.perf-test.tsx', ['Selected kept']]]);
    const fileExists = (path: string) => path !== '/w/deleted.perf-test.tsx';

    // When the baseline is filtered for that PR
    const names = filterReassureBaseline(baselinePerf, baselineJest, branchJest, fileExists)
        .trim()
        .split('\n')
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- every .perf line is a JSON object
        .map((line) => (JSON.parse(line) as {name?: string}).name);

    it('keeps the header and what the PR measured or really removed', () => {
        // Then scenarios the PR ran, deleted from a run file, or lost with their file stay, so the comparison shows real removals
        expect(names).toEqual([undefined, 'Selected kept', 'Selected deleted', 'Deleted file']);
    });

    it('drops scenarios in test files the PR did not select', () => {
        // Then a scenario Jest skipped is not reported as removed
        expect(names).not.toContain('Unselected');
    });
});
