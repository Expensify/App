import type {Mock} from 'bun:test';
import {afterEach, beforeEach, describe, expect, it, jest} from 'bun:test';

import run from '@github/actions/javascript/validateReassureOutput/validateReassureOutput';

import type {CompareResult, MeasureEntry} from '@callstack/reassure-compare';

import * as core from '@actions/core';
import fs from 'fs';
import os from 'os';
import path from 'path';

type Entry = Pick<MeasureEntry, 'meanCount' | 'meanDuration'>;

type CountChangedEntry = Pick<CompareResult['countChanged'][number], 'name'> & {baseline: Entry; current: Entry};

function buildOutput(countChanged: CountChangedEntry[] | undefined) {
    return JSON.stringify({countChanged});
}

describe('validateReassureOutput', () => {
    let setFailed: Mock<typeof core.setFailed>;
    let originalCwd: string;
    let tempDir: string;

    // The action reads `.reassure/output.json` relative to the working directory, so run it from a temp directory.
    const writeOutput = (content: string) => {
        fs.mkdirSync(path.join(tempDir, '.reassure'), {recursive: true});
        fs.writeFileSync(path.join(tempDir, '.reassure', 'output.json'), content);
    };

    beforeEach(() => {
        originalCwd = process.cwd();
        tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'validate-reassure-output-'));
        process.chdir(tempDir);

        // Real ESM module namespace exports are read-only live bindings, so spy on them instead of reassigning.
        jest.spyOn(core, 'getInput').mockImplementation((name: string) => (name === 'COUNT_DEVIATION' ? '0' : ''));
        setFailed = jest.spyOn(core, 'setFailed').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
        process.chdir(originalCwd);
        fs.rmSync(tempDir, {recursive: true, force: true});
    });

    it('passes when the render count drops, even if the duration grows by 500%', () => {
        // Given a scenario whose render count went down by 1 and whose mean duration grew by 500%
        // This is the only shape the removed duration check could fire on, because a duration-only change never enters countChanged
        writeOutput(buildOutput([{name: 'Scenario', baseline: {meanCount: 5, meanDuration: 10}, current: {meanCount: 4, meanDuration: 60}}]));

        // When the output is validated
        run();

        // Then the run is not failed, because durations are reported but not gated
        expect(setFailed).not.toHaveBeenCalled();
    });

    it('fails when the render count grows by more than the allowed deviation', () => {
        // Given a scenario whose render count went up by 1 and the allowed deviation is 0
        writeOutput(buildOutput([{name: 'Scenario', baseline: {meanCount: 4, meanDuration: 10}, current: {meanCount: 5, meanDuration: 10}}]));

        // When the output is validated
        run();

        // Then the run is failed on the render count
        expect(setFailed).toHaveBeenCalledTimes(1);
        expect(setFailed.mock.calls.at(0)?.at(0)).toContain('Render count difference exceeded');
    });

    it('passes when countChanged is missing', () => {
        // Given an output without countChanged
        writeOutput(buildOutput(undefined));

        // When the output is validated
        run();

        // Then the run is not failed
        expect(setFailed).not.toHaveBeenCalled();
    });

    it('passes when countChanged is empty', () => {
        // Given an output with an empty countChanged
        writeOutput(buildOutput([]));

        // When the output is validated
        run();

        // Then the run is not failed
        expect(setFailed).not.toHaveBeenCalled();
    });
});
