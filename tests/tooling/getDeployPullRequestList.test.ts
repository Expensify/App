/// <reference types="bun" />

import {afterEach, describe, expect, it, jest} from 'bun:test';

import * as core from '@actions/core';

import run from '../../.github/actions/javascript/getDeployPullRequestList/getDeployPullRequestList';
import GithubUtils from '../../.github/libs/GithubUtils';

const getInputSpy = jest.spyOn(core, 'getInput').mockImplementation((name: string) => {
    if (name === 'TAG') {
        return '1.0.0';
    }
    return 'false';
});
const setFailedSpy = jest.spyOn(core, 'setFailed').mockImplementation(() => {});
const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
GithubUtils.initOctokitWithToken('test-token');
const testOctokit = GithubUtils.internalOctokit;
if (!testOctokit) {
    throw new Error('GithubUtils did not initialize Octokit');
}
const paginateSpy = jest.spyOn(testOctokit, 'paginate');

const rejectionCases = [
    {name: 'Error', rejection: new Error('release lookup failed'), expectedConsoleValue: 'release lookup failed'},
    {name: 'string', rejection: 'release lookup failed', expectedConsoleValue: 'release lookup failed'},
    {name: 'null', rejection: null, expectedConsoleValue: 'null'},
    {name: 'plain object', rejection: {reason: 'release lookup failed'}, expectedConsoleValue: '[object Object]'},
];

afterEach(() => {
    getInputSpy.mockClear();
    setFailedSpy.mockClear();
    consoleErrorSpy.mockClear();
    paginateSpy.mockReset();
});

describe('getDeployPullRequestList', () => {
    for (const {name, rejection, expectedConsoleValue} of rejectionCases) {
        it(`reports a rejected ${name} without a secondary failure`, async () => {
            paginateSpy.mockRejectedValueOnce(rejection);

            await expect(run()).resolves.toBeUndefined();

            expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
            expect(consoleErrorSpy).toHaveBeenCalledWith(expectedConsoleValue);
            expect(setFailedSpy).toHaveBeenCalledTimes(1);
            expect(setFailedSpy).toHaveBeenCalledWith(rejection instanceof Error ? rejection : expectedConsoleValue);
        });
    }
});
