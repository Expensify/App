/// <reference types="bun" />

/* eslint-disable @typescript-eslint/naming-convention -- GitHub release fixtures use the API's snake_case fields. */
import {afterEach, beforeEach, describe, expect, it, jest} from 'bun:test';

import * as core from '@actions/core';

import run from '../../.github/actions/javascript/getDeployPullRequestList/getDeployPullRequestList';
import CONST from '../../.github/libs/CONST';
import GithubUtils from '../../.github/libs/GithubUtils';
import GitUtils from '../../.github/libs/GitUtils';

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
const originalPaginate = testOctokit.paginate;
const paginateSpy = jest.spyOn(testOctokit, 'paginate');
const getPullRequestsSpy = jest.spyOn(GitUtils, 'getPullRequestsDeployedBetween');
const setOutputSpy = jest.spyOn(core, 'setOutput').mockImplementation(() => {});
let releases: Array<{tag_name: string; prerelease: boolean}> = [];

testOctokit.hook.wrap('request', async () => ({status: 200, url: 'https://api.github.com/repos/Expensify/App/releases', headers: {}, data: releases, retryCount: 0}));

beforeEach(() => {
    getInputSpy.mockImplementation((name: string) => (name === 'TAG' ? '9.5.25-0-staging' : 'false'));
    paginateSpy.mockImplementation(originalPaginate);
    releases = [];
});

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
    getPullRequestsSpy.mockReset();
    setOutputSpy.mockClear();
});

describe('getDeployPullRequestList', () => {
    it.each([false, true])('filters previously shipped cherry-picks in either environment (production: %s)', async (isProductionDeploy) => {
        // Given the new branch contains the original merge of a PR already shipped as a cherry-pick.
        const currentTag = isProductionDeploy ? '9.5.25-0' : '9.5.25-0-staging';
        const previousTag = '9.5.24-8';
        getInputSpy.mockImplementation((name: string) => (name === 'TAG' ? currentTag : String(isProductionDeploy)));
        releases = [
            {tag_name: currentTag, prerelease: !isProductionDeploy},
            {tag_name: previousTag, prerelease: false},
        ];
        getPullRequestsSpy.mockImplementation(async (fromTag, _toTag, repo) => {
            if (fromTag === currentTag) {
                return repo === CONST.APP_REPO ? [105297] : [14210];
            }
            return repo === CONST.APP_REPO ? [105297, 105300] : [14210, 14211];
        });

        // When deployment comments request PRs between the two releases.
        await run();

        // Then both environments exclude cherry-picks already shipped in their own prior release.
        expect(setFailedSpy).not.toHaveBeenCalled();
        expect(setOutputSpy).toHaveBeenCalledWith('PR_LIST', [105300]);
        expect(setOutputSpy).toHaveBeenCalledWith('MOBILE_EXPENSIFY_PR_LIST', [14211]);
        expect(getPullRequestsSpy).toHaveBeenCalledTimes(4);
        for (const repo of [CONST.APP_REPO, CONST.MOBILE_EXPENSIFY_REPO]) {
            expect(getPullRequestsSpy).toHaveBeenCalledWith(previousTag, currentTag, repo);
            expect(getPullRequestsSpy).toHaveBeenCalledWith(currentTag, previousTag, repo);
        }
    });

    it.each([false, true])('keeps newly shipped PRs when the previous tag is an ancestor (production: %s)', async (isProductionDeploy) => {
        // Given a genuine cherry-pick adds a PR and the reverse comparison has no commits.
        const currentTag = isProductionDeploy ? '9.5.24-8' : '9.5.24-8-staging';
        const previousTag = isProductionDeploy ? '9.5.24-7' : '9.5.24-7-staging';
        getInputSpy.mockImplementation((name: string) => (name === 'TAG' ? currentTag : String(isProductionDeploy)));
        releases = [
            {tag_name: currentTag, prerelease: !isProductionDeploy},
            {tag_name: previousTag, prerelease: !isProductionDeploy},
        ];
        getPullRequestsSpy.mockImplementation(async (fromTag, _toTag, repo) => (fromTag === previousTag && repo === CONST.APP_REPO ? [105297] : []));

        // When the first notification in this environment is generated.
        await run();

        // Then the new PR is retained and empty Mobile-Expensify history needs no reverse lookup.
        expect(setFailedSpy).not.toHaveBeenCalled();
        expect(setOutputSpy).toHaveBeenCalledWith('PR_LIST', [105297]);
        expect(setOutputSpy).toHaveBeenCalledWith('MOBILE_EXPENSIFY_PR_LIST', []);
        expect(getPullRequestsSpy).toHaveBeenCalledTimes(3);
    });

    it('fails instead of announcing unfiltered App PRs when the reverse comparison fails', async () => {
        // Given finding new merges succeeds but checking for prior cherry-picks fails.
        releases = [
            {tag_name: '9.5.25-0-staging', prerelease: true},
            {tag_name: '9.5.24-8', prerelease: false},
        ];
        const error = new Error('reverse comparison failed');
        getPullRequestsSpy.mockResolvedValueOnce([105297]).mockRejectedValueOnce(error);

        // When the action cannot establish whether a PR was already deployed.
        await run();

        // Then it reports the failure without emitting an unsafe notification list.
        expect(setFailedSpy).toHaveBeenCalledWith(error);
        expect(setOutputSpy).not.toHaveBeenCalled();
    });

    for (const {name, rejection, expectedConsoleValue} of rejectionCases) {
        it(`reports a rejected ${name} without a secondary failure`, async () => {
            // Given release lookup can reject with an Error or a non-Error value.
            paginateSpy.mockRejectedValueOnce(rejection);

            // When deployment-list generation encounters that rejection.
            await expect(run()).resolves.toBeUndefined();

            // Then reporting preserves Error identity and safely normalizes every other shape.
            expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
            expect(consoleErrorSpy).toHaveBeenCalledWith(expectedConsoleValue);
            expect(setFailedSpy).toHaveBeenCalledTimes(1);
            expect(setFailedSpy).toHaveBeenCalledWith(rejection instanceof Error ? rejection : expectedConsoleValue);
        });
    }
});
