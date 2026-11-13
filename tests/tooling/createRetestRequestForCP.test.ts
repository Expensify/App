// cspell:ignore Julesssss jasperhuangg GYJH
// Slack API fields use snake case.
/* eslint-disable @typescript-eslint/naming-convention */
import type {Mock} from 'bun:test';
import {afterAll, afterEach, beforeAll, describe, expect, it, jest} from 'bun:test';

import CONST from '@github/libs/CONST';
import GithubUtils from '@github/libs/GithubUtils';
import type {InternalOctokit} from '@github/libs/GithubUtils';

import run, {
    buildRetestLinkReply,
    buildRetestPayload,
    fileRetestRequests,
    filterRevertedCherryPicks,
    getCherryPickRetestMarker,
    getCherryPicks,
    getDeployedCommits,
    getLinkedIssueNumbers,
    getPreviousChecklistTag,
    getPendingRetestMarker,
    getRevertedPullNumbers,
    getRetestMarker,
    getRetestRequestReference,
    getRequestedRetestTag,
    getSlackAuthor,
    isCherryPickRequest,
} from '@scripts/createRetestRequestForCP';
import type {RetestHit, SlackMessage} from '@scripts/createRetestRequestForCP';

import fs from 'fs';

import createMock from '../utils/createMock';
import materializeOctokitNamespace from '../utils/materializeOctokitNamespace';

type CompareCommits = InternalOctokit['rest']['repos']['compareCommits'];
type CompareResponse = Awaited<ReturnType<CompareCommits>>;
type ListForRepo = InternalOctokit['rest']['issues']['listForRepo'];
type ListForRepoResponse = Awaited<ReturnType<ListForRepo>>;
type ListPulls = InternalOctokit['rest']['repos']['listPullRequestsAssociatedWithCommit'];
type GetPull = InternalOctokit['rest']['pulls']['get'];
type UpdateComment = InternalOctokit['rest']['issues']['updateComment'];

let compareCommits: Mock<CompareCommits>;
let listForRepo: Mock<ListForRepo>;
let getAllComments: Mock<typeof GithubUtils.getAllComments>;
let octokit: InternalOctokit;
let compareStatics: Pick<CompareCommits, 'endpoint' | 'defaults'>;
let listStatics: Pick<ListForRepo, 'endpoint' | 'defaults'>;

beforeAll(() => {
    GithubUtils.initOctokitWithToken('fake_token');
    if (!GithubUtils.internalOctokit) {
        throw new Error('Expected GithubUtils to initialize an Octokit client.');
    }
    octokit = GithubUtils.internalOctokit;
    octokit.rest.issues = materializeOctokitNamespace(octokit.rest.issues);
    octokit.rest.repos = materializeOctokitNamespace(octokit.rest.repos);
    octokit.rest.pulls = materializeOctokitNamespace(octokit.rest.pulls);
    compareStatics = {endpoint: octokit.rest.repos.compareCommits.endpoint, defaults: octokit.rest.repos.compareCommits.defaults};
    listStatics = {endpoint: octokit.rest.issues.listForRepo.endpoint, defaults: octokit.rest.issues.listForRepo.defaults};
    compareCommits = jest.spyOn(octokit.rest.repos, 'compareCommits');
    listForRepo = jest.spyOn(octokit.rest.issues, 'listForRepo');
    getAllComments = jest.spyOn(GithubUtils, 'getAllComments');
});

afterEach(() => {
    compareCommits.mockReset();
    listForRepo.mockReset();
    getAllComments.mockReset();
});

afterAll(() => {
    jest.restoreAllMocks();
});

describe('createRetestRequestForCP', () => {
    describe('getCherryPicks', () => {
        it('pulls the source SHA and the requester out of the trailers', () => {
            // Given a deployed cherry-pick with both Git trailers
            const message = 'Fix the thing\n\n(cherry picked from commit 1234567890abcdef1234567890abcdef12345678)\n\n(cherry-picked to staging by Julesssss)';

            // When the deploy is inspected
            const result = getCherryPicks([{sha: 'picked-sha', message}]);

            // Then the request keeps the original PR, the exact pick, and its requester
            expect(result).toEqual([{sourceSHA: '1234567890abcdef1234567890abcdef12345678', cherryPickSHA: 'picked-sha', actor: 'Julesssss'}]);
        });

        it('uses the latest pick and requester if a PR is picked again after a revert', () => {
            // Given two PRs and a second pick of the first PR
            const commits = [
                {sha: 'first-pick', message: '(cherry picked from commit aaaaaaa)\n\n(cherry-picked to staging by mountiny)'},
                {sha: 'second-pick', message: '(cherry picked from commit bbbbbbb)\n\n(cherry-picked to staging by Julesssss)'},
                {sha: 're-pick', message: '(cherry picked from commit aaaaaaa)\n\n(cherry-picked to staging by someoneElse)'},
            ];

            // When the release is scanned for cherry-picks
            const result = getCherryPicks(commits);

            // Then the re-applied fix can receive a new retest with the correct requester
            expect(result).toEqual([
                {sourceSHA: 'bbbbbbb', cherryPickSHA: 'second-pick', actor: 'Julesssss'},
                {sourceSHA: 'aaaaaaa', cherryPickSHA: 're-pick', actor: 'someoneElse'},
            ]);
        });

        it('still returns the SHA when the requester trailer is missing', () => {
            // Given a manually resolved pick without a requester trailer
            const commits = [{sha: 'picked-sha', message: '(cherry picked from commit aaaaaaa)'}];

            // When the release is scanned
            const result = getCherryPicks(commits);

            // Then the fix remains eligible for a retest
            expect(result).toEqual([{sourceSHA: 'aaaaaaa', cherryPickSHA: 'picked-sha', actor: ''}]);
        });

        it('returns nothing when no commit was cherry-picked', () => {
            // Given a staging deploy with only ordinary commits
            const commits = [
                {sha: 'merge', message: 'Merge pull request #1 from foo/bar'},
                {sha: 'version', message: 'Update version to 1.2.3-4'},
            ];

            // When the release is scanned
            const result = getCherryPicks(commits);

            // Then no retest is requested
            expect(result).toEqual([]);
        });
    });

    describe('release commit range', () => {
        it('finds the preceding checklist even when it is on the next page', async () => {
            // Given the current checklist is the last entry on a GitHub page
            const checklists = Array.from({length: 100}, (_, index) => ({number: 1000 - index}));
            listForRepo.mockResolvedValueOnce(createMock<ListForRepoResponse>({data: checklists}));
            listForRepo.mockResolvedValueOnce(
                createMock<ListForRepoResponse>({
                    data: [{number: 900, url: 'https://api.github.com/repos/Expensify/App/issues/900', body: '**Release Version:** `9.5.23-3`'}],
                }),
            );

            // When the scan finds the start of the current release
            const tag = await getPreviousChecklistTag(901);

            // Then it uses the preceding checklist instead of a tag from a canceled deploy
            expect(tag).toBe('9.5.23-3-staging');
            expect(listForRepo).toHaveBeenCalledTimes(2);
        });

        it('fails rather than silently missing picks if the previous checklist is unavailable', async () => {
            // Given GitHub cannot find a previous checklist
            listForRepo.mockResolvedValueOnce(createMock<ListForRepoResponse>({data: [{number: 901}]}));

            // When the release boundary is requested
            const result = getPreviousChecklistTag(901);

            // Then the failure is surfaced instead of hiding picks from canceled deploys
            await expect(result).rejects.toThrow('Could not find the deploy checklist before #901.');
        });

        it('fetches picks beyond GitHub’s unpaginated comparison limit', async () => {
            // Given a large release where three consecutive picks appear after the first 300 commits
            const ordinaryCommits = Array.from({length: 300}, (_, index) => ({sha: `commit-${index}`, commit: {message: 'A normal commit'}}));
            compareCommits.mockResolvedValueOnce(createMock<CompareResponse>({data: {commits: ordinaryCommits.slice(0, 250)}}));
            compareCommits.mockResolvedValueOnce(
                createMock<CompareResponse>({
                    data: {
                        commits: [
                            ...ordinaryCommits.slice(250),
                            {sha: 'pick-a', commit: {message: '(cherry picked from commit aaaaaaa)\n\n(cherry-picked to staging by first)'}},
                            {sha: 'pick-b', commit: {message: '(cherry picked from commit bbbbbbb)\n\n(cherry-picked to staging by second)'}},
                            {sha: 'pick-c', commit: {message: '(cherry picked from commit ccccccc)\n\n(cherry-picked to staging by third)'}},
                        ],
                    },
                }),
            );

            // When the successful deploy scans the entire release
            const commits = await getDeployedCommits('9.5.23-3-staging', 'deployed-sha');

            // Then picks from both canceled deploys and the last deploy are found with their own requesters
            expect(getCherryPicks(commits)).toEqual([
                {sourceSHA: 'aaaaaaa', cherryPickSHA: 'pick-a', actor: 'first'},
                {sourceSHA: 'bbbbbbb', cherryPickSHA: 'pick-b', actor: 'second'},
                {sourceSHA: 'ccccccc', cherryPickSHA: 'pick-c', actor: 'third'},
            ]);
            expect(compareCommits).toHaveBeenCalledTimes(2);
            expect(compareCommits).toHaveBeenLastCalledWith(expect.objectContaining({base: '9.5.23-3-staging', head: 'deployed-sha', per_page: 250, page: 2}));
        });
    });

    describe('reverted cherry-picks', () => {
        const sourceSHA = 'a'.repeat(40);
        const pickSHA = 'b'.repeat(40);
        const revertSHA = 'c'.repeat(40);
        const pick = {sourceSHA, cherryPickSHA: pickSHA, actor: 'first'};
        const pickedCommit = {sha: pickSHA, message: `Merge pull request #101 from example/fix\n\nFix\n\n(cherry picked from commit ${sourceSHA})`};

        it('drops a pick reverted by its staged commit SHA or original merge SHA', async () => {
            // Given the fix was picked and then reverted before the successful deploy
            const candidates = new Map([[101, pick]]);

            // When Git's revert trailer names either form of the commit
            const byPick = await filterRevertedCherryPicks([pickedCommit, {sha: revertSHA, message: `Revert "Fix"\n\nThis reverts commit ${pickSHA}.`}], candidates);
            const bySource = await filterRevertedCherryPicks([pickedCommit, {sha: revertSHA, message: `Revert "Fix"\n\nThis reverts commit ${sourceSHA}.`}], candidates);
            const byShortSHA = await filterRevertedCherryPicks([pickedCommit, {sha: revertSHA, message: `Revert "Fix"\n\nThis reverts commit ${pickSHA.slice(0, 7)}.`}], candidates);

            // Then QA is not asked to test a fix missing from the deployed tree
            expect([...byPick]).toEqual([]);
            expect([...bySource]).toEqual([]);
            expect([...byShortSHA]).toEqual([]);
        });

        it('ignores unrelated revert PRs from before the first candidate pick', async () => {
            // Given an older revert has no bearing on a later cherry-pick
            const earlierRevert = {sha: revertSHA, message: 'Merge pull request #102 from example/revert\n\nRevert an older change'};
            const getPull = jest.spyOn(octokit.rest.pulls, 'get');

            try {
                // When the release history is scanned
                const active = await filterRevertedCherryPicks([earlierRevert, pickedCommit], new Map([[101, pick]]));

                // Then the fix remains eligible without looking up the unrelated revert
                expect([...active]).toEqual([[101, pick]]);
                expect(getPull).not.toHaveBeenCalled();
            } finally {
                getPull.mockRestore();
            }
        });

        it('keeps a later re-pick of a reverted fix', async () => {
            // Given the original pick was reverted and then picked again
            const newPickSHA = 'd'.repeat(40);
            const commits = [
                pickedCommit,
                {sha: revertSHA, message: `Revert "Fix"\n\nThis reverts commit ${pickSHA}.`},
                {sha: newPickSHA, message: `Merge pull request #101 from example/fix\n\nFix\n\n(cherry picked from commit ${sourceSHA})`},
            ];
            const candidates = new Map([[101, {...pick, cherryPickSHA: newPickSHA, actor: 'second'}]]);

            // When the deployed history is inspected
            const active = await filterRevertedCherryPicks(commits, candidates);

            // Then the re-applied fix remains eligible for a retest
            expect([...active]).toEqual([[101, {...pick, cherryPickSHA: newPickSHA, actor: 'second'}]]);
        });

        it('keeps a pick when its revert was itself reverted', async () => {
            // Given a revert was undone before the successful deployment
            const commits = [
                pickedCommit,
                {sha: revertSHA, message: `Revert "Fix"\n\nThis reverts commit ${pickSHA}.`},
                {sha: 'd'.repeat(40), message: `Revert "Revert Fix"\n\nThis reverts commit ${revertSHA}.`},
            ];

            // When the history is inspected from the deployed commit backwards
            const active = await filterRevertedCherryPicks(commits, new Map([[101, pick]]));

            // Then the restored fix is still retested
            expect([...active]).toEqual([[101, pick]]);
        });

        it('recognizes a cherry-picked revert PR even when its commit has no revert trailer', async () => {
            // Given the revert PR describes its target, as GitHub-generated App revert PRs do
            const revertSource = 'd'.repeat(40);
            const revertPick = {sourceSHA: revertSource, cherryPickSHA: revertSHA, actor: 'second'};
            const commits = [
                pickedCommit,
                {sha: revertSHA, message: `Merge pull request #102 from example/revert\n\n[CP Staging] Revert "Fix"\n\n(cherry picked from commit ${revertSource})`},
            ];
            const getPull = jest
                .spyOn(octokit.rest.pulls, 'get')
                .mockResolvedValueOnce(createMock<Awaited<ReturnType<GetPull>>>({data: {title: '[CP Staging] Revert "Fix"', body: 'Reverts Expensify/App#101.'}}));
            const listCommits = jest
                .spyOn(octokit.rest.pulls, 'listCommits')
                .mockResolvedValueOnce(createMock<Awaited<ReturnType<InternalOctokit['rest']['pulls']['listCommits']>>>({data: [{commit: {message: 'Revert "Fix"'}}]}));

            try {
                // When the deploy includes both the fix and its revert
                const active = await filterRevertedCherryPicks(
                    commits,
                    new Map([
                        [101, pick],
                        [102, revertPick],
                    ]),
                );

                // Then only the revert PR remains eligible, since it may itself fix a blocker
                expect([...active]).toEqual([[102, revertPick]]);
                expect(getPull).toHaveBeenCalledWith(expect.objectContaining({pull_number: 102}));
            } finally {
                getPull.mockRestore();
                listCommits.mockRestore();
            }
        });

        it('reads a revert PR’s individual commits when its merge message lost the trailers', async () => {
            // Given a revert PR has no explicit PR link but its original commit names the reverted merge
            const revert = {sha: revertSHA, message: 'Merge pull request #102 from example/revert\n\nRevert "Fix"'};
            const getPull = jest.spyOn(octokit.rest.pulls, 'get').mockResolvedValueOnce(createMock<Awaited<ReturnType<GetPull>>>({data: {title: 'Revert "Fix"', body: ''}}));
            const listCommits = jest
                .spyOn(octokit.rest.pulls, 'listCommits')
                .mockResolvedValueOnce(
                    createMock<Awaited<ReturnType<InternalOctokit['rest']['pulls']['listCommits']>>>({data: [{commit: {message: `Revert "Fix"\n\nThis reverts commit ${sourceSHA}.`}}]}),
                );

            try {
                // When the successful deploy contains the cherry-picked revert
                const active = await filterRevertedCherryPicks([pickedCommit, revert], new Map([[101, pick]]));

                // Then the original fix is excluded even though the deployed merge has no trailer
                expect([...active]).toEqual([]);
                expect(listCommits).toHaveBeenCalledWith(expect.objectContaining({pull_number: 102}));
            } finally {
                getPull.mockRestore();
                listCommits.mockRestore();
            }
        });

        it('handles a revert PR that undoes several merged fixes', async () => {
            // Given one revert PR contains separate Git reverts for two cherry-picked fixes
            const otherSource = 'd'.repeat(40);
            const otherPick = {sourceSHA: otherSource, cherryPickSHA: 'e'.repeat(40), actor: 'second'};
            const commits = [
                pickedCommit,
                {sha: otherPick.cherryPickSHA, message: `Merge pull request #103 from example/other\n\nOther fix\n\n(cherry picked from commit ${otherSource})`},
                {sha: revertSHA, message: 'Merge pull request #102 from example/revert\n\nRevert both fixes'},
            ];
            const getPull = jest.spyOn(octokit.rest.pulls, 'get').mockResolvedValueOnce(createMock<Awaited<ReturnType<GetPull>>>({data: {title: 'Revert both fixes', body: ''}}));
            const listCommits = jest.spyOn(octokit.rest.pulls, 'listCommits').mockResolvedValueOnce(
                createMock<Awaited<ReturnType<InternalOctokit['rest']['pulls']['listCommits']>>>({
                    data: [{commit: {message: `This reverts commit ${sourceSHA}.`}}, {commit: {message: `This reverts commit ${otherSource}.`}}],
                }),
            );

            try {
                // When the deployed revert is inspected
                const active = await filterRevertedCherryPicks(
                    commits,
                    new Map([
                        [101, pick],
                        [103, otherPick],
                    ]),
                );

                // Then neither missing fix is sent to QA
                expect([...active]).toEqual([]);
            } finally {
                getPull.mockRestore();
                listCommits.mockRestore();
            }
        });

        it('keeps the original pick when a revert PR is reverted by another PR', async () => {
            // Given the fix was reverted in one PR and that revert was itself reverted in another
            const revertSource = 'd'.repeat(40);
            const restoreSHA = 'e'.repeat(40);
            const restoreSource = 'f'.repeat(40);
            const revertPick = {sourceSHA: revertSource, cherryPickSHA: revertSHA, actor: 'second'};
            const restorePick = {sourceSHA: restoreSource, cherryPickSHA: restoreSHA, actor: 'third'};
            const commits = [
                pickedCommit,
                {sha: revertSHA, message: `Merge pull request #102 from example/revert\n\nRevert "Fix"\n\n(cherry picked from commit ${revertSource})`},
                {sha: restoreSHA, message: `Merge pull request #103 from example/restore\n\nRevert "Revert Fix"\n\n(cherry picked from commit ${restoreSource})`},
            ];
            const getPull = jest
                .spyOn(octokit.rest.pulls, 'get')
                .mockResolvedValueOnce(createMock<Awaited<ReturnType<GetPull>>>({data: {title: 'Revert "Fix"', body: 'Reverts Expensify/App#101.'}}))
                .mockResolvedValueOnce(createMock<Awaited<ReturnType<GetPull>>>({data: {title: 'Revert "Revert Fix"', body: 'Reverts Expensify/App#102.'}}));
            const listCommits = jest.spyOn(octokit.rest.pulls, 'listCommits').mockResolvedValue(createMock<Awaited<ReturnType<InternalOctokit['rest']['pulls']['listCommits']>>>({data: []}));

            try {
                // When the final staging deploy is examined
                const active = await filterRevertedCherryPicks(
                    commits,
                    new Map([
                        [101, pick],
                        [102, revertPick],
                        [103, restorePick],
                    ]),
                );

                // Then the restored fix and the second revert remain, but the first revert is excluded
                expect([...active]).toEqual([
                    [101, pick],
                    [103, restorePick],
                ]);
            } finally {
                getPull.mockRestore();
                listCommits.mockRestore();
            }
        });

        it('finds explicit revert links without treating other context as reverted PRs', () => {
            // Given a revert lists its target and mentions other PRs for context
            const text = `Reverts Expensify/App#101. Its base, Expensify/App#102, was reverted first in Expensify/App#103.\n\nDirectly reverts the follow-ups:\n\n- ${CONST.APP_REPO_URL}/pull/104\n- ${CONST.APP_REPO_URL}/pull/105\n\nMore context: ${CONST.APP_REPO_URL}/pull/106`;

            // When the revert references are parsed
            const numbers = getRevertedPullNumbers(text);

            // Then only the explicitly reverted PRs are excluded
            expect(numbers).toEqual([101, 104, 105]);
            expect(getRevertedPullNumbers(`Reverts [the original fix](${CONST.APP_REPO_URL}/pull/107).`)).toEqual([107]);
            expect(getRevertedPullNumbers('Reverts OtherOrg/OtherRepo#108.')).toEqual([]);
        });

        it('fails safely when a revert PR does not identify what it undoes', async () => {
            // Given the revert has neither a PR reference nor a Git revert trailer
            const revert = {sha: revertSHA, message: 'Merge pull request #102 from example/revert\n\nRevert "Fix"'};
            const getPull = jest.spyOn(octokit.rest.pulls, 'get').mockResolvedValueOnce(createMock<Awaited<ReturnType<GetPull>>>({data: {title: 'Revert "Fix"', body: ''}}));
            const listCommits = jest
                .spyOn(octokit.rest.pulls, 'listCommits')
                .mockResolvedValueOnce(createMock<Awaited<ReturnType<InternalOctokit['rest']['pulls']['listCommits']>>>({data: [{commit: {message: 'Revert "Fix"'}}]}));

            try {
                // When the deploy is inspected
                const result = filterRevertedCherryPicks([pickedCommit, revert], new Map([[101, pick]]));

                // Then the job reports the ambiguity rather than requesting an invalid retest
                await expect(result).rejects.toThrow('Could not identify the target of revert PR #102.');
            } finally {
                getPull.mockRestore();
                listCommits.mockRestore();
            }
        });
    });

    describe('existing retest requests', () => {
        it('recognizes the same pick across different deploy tags', async () => {
            // Given a previous deploy already requested the retest before it was superseded
            getAllComments.mockResolvedValueOnce([`${getRetestMarker('9.5.24-3-staging')}\n${getCherryPickRetestMarker('pick-a')}`]);

            // When the next deploy includes the same cherry-pick
            const tag = await getRequestedRetestTag(123, 'pick-a', '9.5.24-5-staging');

            // Then it keeps the old request instead of filing another one
            expect(tag).toBe('9.5.24-3-staging');
            expect(compareCommits).not.toHaveBeenCalled();
        });

        it('allows a new retest when the same PR is cherry-picked again', async () => {
            // Given a request for an earlier pick of this PR
            getAllComments.mockResolvedValueOnce([`${getRetestMarker('9.5.24-3-staging')}\n${getCherryPickRetestMarker('old-pick')}`]);

            // When the PR is re-applied after a revert
            const tag = await getRequestedRetestTag(123, 'new-pick', '9.5.24-5-staging');

            // Then the old request does not suppress the new retest
            expect(tag).toBeUndefined();
            expect(compareCommits).not.toHaveBeenCalled();
        });

        it('recognizes a tag-only marker when that deployment contained the pick', async () => {
            // Given a request created before commit-specific markers were introduced
            getAllComments.mockResolvedValueOnce([getRetestMarker('9.5.24-3-staging')]);
            compareCommits.mockResolvedValueOnce(createMock<CompareResponse>({data: {status: 'ahead'}}));

            // When a later deploy includes that same pick
            const tag = await getRequestedRetestTag(123, 'pick-a', '9.5.24-5-staging');

            // Then the earlier tag is reused to avoid a duplicate
            expect(tag).toBe('9.5.24-3-staging');
            expect(compareCommits).toHaveBeenCalledWith(expect.objectContaining({base: 'pick-a', head: '9.5.24-3-staging', per_page: 1}));
        });

        it('does not match a tag-only marker from before a new pick', async () => {
            // Given an old request whose deployment did not contain the new pick
            getAllComments.mockResolvedValueOnce([getRetestMarker('9.5.24-3-staging')]);
            compareCommits.mockResolvedValueOnce(createMock<CompareResponse>({data: {status: 'behind'}}));

            // When a new cherry-pick of the PR is deployed
            const tag = await getRequestedRetestTag(123, 'new-pick', '9.5.24-5-staging');

            // Then it remains eligible for another retest
            expect(tag).toBeUndefined();
        });

        it('recognizes a tag-only marker on a rerun of the same deploy', async () => {
            // Given a legacy request on the deployment being rerun
            getAllComments.mockResolvedValueOnce([getRetestMarker('9.5.24-5-staging')]);

            // When the same deploy is processed again
            const tag = await getRequestedRetestTag(123, 'pick-a', '9.5.24-5-staging');

            // Then the request is reused without another GitHub comparison
            expect(tag).toBe('9.5.24-5-staging');
            expect(compareCommits).not.toHaveBeenCalled();
        });

        it('does not risk a duplicate if a legacy tag cannot be checked', async () => {
            // Given an earlier tag-only marker and a GitHub API error
            getAllComments.mockResolvedValueOnce([getRetestMarker('9.5.24-3-staging')]);
            compareCommits.mockRejectedValueOnce(new Error('GitHub unavailable'));

            // When the earlier request is checked
            const result = getRequestedRetestTag(123, 'pick-a', '9.5.24-5-staging');

            // Then the scan fails instead of filing an unverified duplicate
            await expect(result).rejects.toThrow('GitHub unavailable');
        });

        it('checks exact markers before comparing an older missing tag', async () => {
            // Given a deleted legacy tag appears before a completed marker for this exact pick
            getAllComments.mockResolvedValueOnce([getRetestMarker('deleted-staging'), `${getRetestMarker('9.5.24-5-staging')}\n${getCherryPickRetestMarker('pick-a')}`]);

            // When the existing request is located
            const tag = await getRequestedRetestTag(123, 'pick-a', '9.5.24-6-staging');

            // Then the exact marker prevents a needless lookup of the deleted tag
            expect(tag).toBe('9.5.24-5-staging');
            expect(compareCommits).not.toHaveBeenCalled();
        });

        it('checks later legacy markers when an earlier tag is missing', async () => {
            // Given one legacy tag was deleted but a later tagged deploy contains the pick
            getAllComments.mockResolvedValueOnce([getRetestMarker('deleted-staging'), getRetestMarker('9.5.24-5-staging')]);
            compareCommits.mockRejectedValueOnce(Object.assign(new Error('Tag not found'), {status: 404}));
            compareCommits.mockResolvedValueOnce(createMock<CompareResponse>({data: {status: 'ahead'}}));

            // When the old requests are compared to the pick
            const tag = await getRequestedRetestTag(123, 'pick-a', '9.5.24-6-staging');

            // Then the valid marker is reused rather than failing or filing a duplicate
            expect(tag).toBe('9.5.24-5-staging');
            expect(compareCommits).toHaveBeenCalledTimes(2);
        });

        it('prefers a completed marker to an older pending marker for the same pick', async () => {
            // Given a pending request was later confirmed in a separate comment
            getAllComments.mockResolvedValueOnce([
                `${getRetestMarker('9.5.24-3-staging')}\n${getPendingRetestMarker('pick-a')}`,
                `${getRetestMarker('9.5.24-3-staging')}\n${getCherryPickRetestMarker('pick-a')}`,
            ]);

            // When the next deploy checks for an existing request
            const tag = await getRequestedRetestTag(123, 'pick-a', '9.5.24-5-staging');

            // Then the completed marker wins and no duplicate is posted
            expect(tag).toBe('9.5.24-3-staging');
        });

        it('continues the batch when a legacy tag is missing without duplicating that request', async () => {
            // Given one PR has an unresolvable old marker and another needs a retest
            const hit: RetestHit = {
                prNumber: 101,
                prURL: `${CONST.APP_REPO_URL}/pull/101`,
                prAuthor: 'author',
                cherryPickSHA: 'pick-a',
                blockerIssueURLs: [`${CONST.APP_REPO_URL}/issues/201`],
                prTitle: 'First fix',
                author: 'first',
            };
            getAllComments.mockImplementation(async (number) => (number === 101 ? [getRetestMarker('deleted-staging')] : []));
            compareCommits.mockRejectedValueOnce(Object.assign(new Error('Tag not found'), {status: 404}));
            const createComment = jest.spyOn(GithubUtils, 'createComment').mockResolvedValue(createMock<Awaited<ReturnType<typeof GithubUtils.createComment>>>({data: {id: 1}}));
            const updateComment = jest.spyOn(octokit.rest.issues, 'updateComment').mockResolvedValue(createMock<Awaited<ReturnType<UpdateComment>>>({}));
            const mockFetch = Object.assign(async () => new Response('', {status: 200}), {preconnect: globalThis.fetch.preconnect});
            const postWebhook = jest.spyOn(globalThis, 'fetch').mockImplementation(mockFetch);

            try {
                // When the batch processes both PRs
                const result = fileRetestRequests(
                    [hit, {...hit, prNumber: 102, prURL: `${CONST.APP_REPO_URL}/pull/102`, cherryPickSHA: 'pick-b'}],
                    'current-staging',
                    'https://example.com/retest',
                );

                // Then the other request is filed and the uncertain PR is reported for manual attention
                await expect(result).rejects.toThrow('Could not process retest requests for PRs #101.');
                expect(postWebhook).toHaveBeenCalledTimes(1);
                expect(createComment).toHaveBeenCalledTimes(1);
                expect(createComment.mock.calls[0]?.[1]).toBe(102);
                expect(updateComment).toHaveBeenCalledTimes(1);
            } finally {
                createComment.mockRestore();
                updateComment.mockRestore();
                postWebhook.mockRestore();
            }
        });

        it('does not post again when Slack accepted a request but the confirmation update failed', async () => {
            // Given Slack accepts a request after its pending marker was saved, but GitHub cannot confirm it
            const hit: RetestHit = {
                prNumber: 101,
                prURL: `${CONST.APP_REPO_URL}/pull/101`,
                prAuthor: 'author',
                cherryPickSHA: 'pick-a',
                blockerIssueURLs: [`${CONST.APP_REPO_URL}/issues/201`],
                prTitle: 'First fix',
                author: 'first',
            };
            const comments: string[] = [];
            getAllComments.mockImplementation(async () => comments);
            const createComment = jest.spyOn(GithubUtils, 'createComment').mockImplementation(async (_repo, _number, body) => {
                comments.push(body);
                return createMock<Awaited<ReturnType<typeof GithubUtils.createComment>>>({data: {id: 1}});
            });
            const updateComment = jest.spyOn(octokit.rest.issues, 'updateComment').mockRejectedValueOnce(new Error('GitHub unavailable'));
            const mockFetch = Object.assign(
                async () => {
                    expect(comments[0]).toContain(getPendingRetestMarker('pick-a'));
                    return new Response('', {status: 200});
                },
                {preconnect: globalThis.fetch.preconnect},
            );
            const postWebhook = jest.spyOn(globalThis, 'fetch').mockImplementation(mockFetch);

            try {
                // When the failed deployment is followed by a different staging deploy without Slack lookup credentials
                await expect(fileRetestRequests([hit], 'first-staging', 'https://example.com/retest')).rejects.toThrow('Could not process retest requests for PRs #101.');
                await expect(fileRetestRequests([hit], 'second-staging', 'https://example.com/retest')).rejects.toThrow('Could not process retest requests for PRs #101.');

                // Then the pending marker prevents a second webhook and leaves the uncertain request for follow-up
                expect(postWebhook).toHaveBeenCalledTimes(1);
                expect(comments[0]).toContain(getPendingRetestMarker('pick-a'));
            } finally {
                createComment.mockRestore();
                updateComment.mockRestore();
                postWebhook.mockRestore();
            }
        });

        it('retries a request after Slack confirms it was rejected', async () => {
            // Given Slack rejects the first webhook with a client error
            const hit: RetestHit = {
                prNumber: 101,
                prURL: `${CONST.APP_REPO_URL}/pull/101`,
                prAuthor: 'author',
                cherryPickSHA: 'pick-a',
                blockerIssueURLs: [`${CONST.APP_REPO_URL}/issues/201`],
                prTitle: 'First fix',
                author: 'first',
            };
            const comments: string[] = [];
            getAllComments.mockImplementation(async () => comments);
            const createComment = jest.spyOn(GithubUtils, 'createComment').mockImplementation(async (_repo, _number, body) => {
                comments.push(body);
                return createMock<Awaited<ReturnType<typeof GithubUtils.createComment>>>({data: {id: comments.length}});
            });
            const updateCommentStatics = {endpoint: octokit.rest.issues.updateComment.endpoint, defaults: octokit.rest.issues.updateComment.defaults};
            const updateCommentBody = async (parameters?: Parameters<UpdateComment>[0]): Promise<Awaited<ReturnType<UpdateComment>>> => {
                if (!parameters || !('comment_id' in parameters) || !('body' in parameters) || typeof parameters.body !== 'string') {
                    throw new Error('Expected a comment update.');
                }
                comments[parameters.comment_id - 1] = parameters.body;
                return createMock<Awaited<ReturnType<UpdateComment>>>({data: {id: parameters.comment_id}});
            };
            const updateComment = jest.spyOn(octokit.rest.issues, 'updateComment').mockImplementation(Object.assign(updateCommentBody, updateCommentStatics));
            const fetchSpy = jest
                .spyOn(globalThis, 'fetch')
                .mockResolvedValueOnce(new Response('Rejected', {status: 400}))
                .mockResolvedValueOnce(new Response('', {status: 200}));

            try {
                // When the failed request is followed by another staging deploy
                await expect(fileRetestRequests([hit], 'first-staging', 'https://example.com/retest')).rejects.toThrow('Could not process retest requests for PRs #101.');
                expect(comments[0]).not.toContain(getPendingRetestMarker('pick-a'));
                await fileRetestRequests([hit], 'second-staging', 'https://example.com/retest');

                // Then the confirmed rejection can be retried and the new request is recorded
                expect(fetchSpy).toHaveBeenCalledTimes(2);
                expect(comments[1]).toContain(getCherryPickRetestMarker('pick-a'));
            } finally {
                createComment.mockRestore();
                updateComment.mockRestore();
                fetchSpy.mockRestore();
            }
        });

        it.each([408, 499, 503])('keeps a pending marker when webhook status %i is ambiguous', async (status) => {
            // Given the webhook result does not prove whether Slack accepted the request
            const hit: RetestHit = {
                prNumber: 101,
                prURL: `${CONST.APP_REPO_URL}/pull/101`,
                prAuthor: 'author',
                cherryPickSHA: 'pick-a',
                blockerIssueURLs: [`${CONST.APP_REPO_URL}/issues/201`],
                prTitle: 'First fix',
                author: 'first',
            };
            const comments: string[] = [];
            getAllComments.mockImplementation(async () => comments);
            const createComment = jest.spyOn(GithubUtils, 'createComment').mockImplementation(async (_repo, _number, body) => {
                comments.push(body);
                return createMock<Awaited<ReturnType<typeof GithubUtils.createComment>>>({data: {id: 1}});
            });
            const updateComment = jest.spyOn(octokit.rest.issues, 'updateComment').mockResolvedValue(createMock<Awaited<ReturnType<UpdateComment>>>({}));
            const fetchSpy = jest.spyOn(globalThis, 'fetch').mockResolvedValueOnce(new Response('Uncertain', {status}));

            try {
                // When a later deploy tries again without Slack lookup credentials
                await expect(fileRetestRequests([hit], 'first-staging', 'https://example.com/retest')).rejects.toThrow('Could not process retest requests for PRs #101.');
                await expect(fileRetestRequests([hit], 'second-staging', 'https://example.com/retest')).rejects.toThrow('Could not process retest requests for PRs #101.');

                // Then the pending marker prevents another webhook until the outcome is checked
                expect(fetchSpy).toHaveBeenCalledTimes(1);
                expect(updateComment).not.toHaveBeenCalled();
                expect(comments[0]).toContain(getPendingRetestMarker('pick-a'));
            } finally {
                createComment.mockRestore();
                updateComment.mockRestore();
                fetchSpy.mockRestore();
            }
        });

        it('recovers an exact pending request from an older Slack history page and reuses it for the link', async () => {
            // Given the newest history page has a different PR with the same number prefix
            const hit: RetestHit = {
                prNumber: 101,
                prURL: `${CONST.APP_REPO_URL}/pull/101`,
                prAuthor: 'author',
                cherryPickSHA: 'pick-a',
                blockerIssueURLs: [`${CONST.APP_REPO_URL}/issues/201`],
                prTitle: 'First fix',
                author: 'first',
            };
            getAllComments.mockResolvedValueOnce([`${getRetestMarker('first-staging')}\n${getPendingRetestMarker('pick-a')}`]);
            const createComment = jest.spyOn(GithubUtils, 'createComment').mockResolvedValue(createMock<Awaited<ReturnType<typeof GithubUtils.createComment>>>({data: {id: 1}}));
            const retestPermalink = 'https://example.com/retest-message';
            const fetchSpy = jest
                .spyOn(globalThis, 'fetch')
                .mockResolvedValueOnce(
                    new Response(JSON.stringify({ok: true, messages: [{ts: '111.111', text: 'Retest ID: first-staging / App PR #1010'}], response_metadata: {next_cursor: 'next-page'}}), {
                        status: 200,
                    }),
                )
                .mockResolvedValueOnce(new Response(JSON.stringify({ok: true, messages: [{ts: '123.456', text: 'Retest ID: first-staging / App PR #101\n'}]}), {status: 200}))
                .mockResolvedValueOnce(new Response(JSON.stringify({ok: true, permalink: retestPermalink}), {status: 200}))
                .mockResolvedValueOnce(
                    new Response(JSON.stringify({ok: true, messages: [{ts: '789.000', text: `*Cherry Pick Request* Link to PR: <${hit.prURL}> *Where:* staging`}]}), {status: 200}),
                )
                .mockResolvedValueOnce(new Response(JSON.stringify({ok: true, messages: [{ts: '789.000', text: 'Parent request'}]}), {status: 200}))
                .mockResolvedValueOnce(new Response('', {status: 200}));

            try {
                // When the later deploy recovers and links the pending request
                await fileRetestRequests([hit], 'second-staging', 'https://example.com/retest', 'slack-token', 'https://example.com/deployer');

                // Then it finds PR 101 on the second page, reuses that message, and never fires the retest webhook
                expect(fetchSpy.mock.calls.map((call) => call[0])).toEqual([
                    'https://slack.com/api/conversations.history',
                    'https://slack.com/api/conversations.history',
                    'https://slack.com/api/chat.getPermalink',
                    'https://slack.com/api/conversations.history',
                    'https://slack.com/api/conversations.replies',
                    'https://example.com/deployer',
                ]);
                const secondPageBody = fetchSpy.mock.calls[1]?.[1]?.body;
                if (typeof secondPageBody !== 'string') {
                    throw new Error('Expected the Slack history request.');
                }
                const secondPage: unknown = JSON.parse(secondPageBody);
                expect(secondPage).toEqual(expect.objectContaining({cursor: 'next-page'}));
                expect(createComment.mock.calls[0]?.[2]).toContain(getCherryPickRetestMarker('pick-a'));
            } finally {
                createComment.mockRestore();
                fetchSpy.mockRestore();
            }
        });
    });

    describe('staging deploy', () => {
        it('does not scan release history when there are no checklist blockers', async () => {
            // Given the checklist contains a PR but no deploy blockers
            const checklist = {
                number: 901,
                url: 'https://api.github.com/repos/Expensify/App/issues/901',
                title: 'Current checklist',
                labels: [],
                body: [
                    '**Release Version:** `9.5.24-5`',
                    '',
                    '**This release contains changes from the following pull requests:**',
                    `- [ ] ${CONST.APP_REPO_URL}/pull/101`,
                    '',
                    '',
                    '**Deploy Blockers:**',
                    '',
                ].join('\n'),
            };
            listForRepo.mockResolvedValueOnce(createMock<ListForRepoResponse>({data: [checklist]}));
            const originalArgv = process.argv;
            const originalWebhook = process.env.SLACK_RETEST_WEBHOOK;

            try {
                process.argv = ['bun', 'script', '--deploy-sha=deployed-sha', '--deploy-tag=9.5.24-5-staging'];
                process.env.SLACK_RETEST_WEBHOOK = 'https://example.com/retest';

                // When a fully deployed staging build looks for retests
                await run();

                // Then it avoids reading the release history or filing another request
                expect(listForRepo).toHaveBeenCalledTimes(1);
                expect(compareCommits).not.toHaveBeenCalled();
            } finally {
                process.argv = originalArgv;
                if (originalWebhook === undefined) {
                    delete process.env.SLACK_RETEST_WEBHOOK;
                } else {
                    process.env.SLACK_RETEST_WEBHOOK = originalWebhook;
                }
            }
        });

        it('requests every outstanding pick once, including picks from canceled deploys', async () => {
            // Given several blocker fixes were picked before a successful deploy, including a checked blocker and a subsequently reverted fix
            const previousChecklist = {
                number: 900,
                url: 'https://api.github.com/repos/Expensify/App/issues/900',
                title: 'Previous checklist',
                body: '**Release Version:** `9.5.23-3`',
                labels: [],
            };
            const checklist = {
                number: 901,
                url: 'https://api.github.com/repos/Expensify/App/issues/901',
                title: 'Current checklist',
                labels: [],
                body: [
                    '**Release Version:** `9.5.24-5`',
                    '',
                    '**This release contains changes from the following pull requests:**',
                    ...[101, 102, 103, 104, 106].map((number) => `- [ ] ${CONST.APP_REPO_URL}/pull/${number}`),
                    '',
                    '',
                    '**Deploy Blockers:**',
                    ...[201, 202, 203].map((number) => `- [ ] ${CONST.APP_REPO_URL}/issues/${number}`),
                    `- [x] ${CONST.APP_REPO_URL}/issues/204`,
                    `- [ ] ${CONST.APP_REPO_URL}/issues/206`,
                    '',
                ].join('\n'),
            };
            const listIssues = async (parameters?: Parameters<ListForRepo>[0]): Promise<ListForRepoResponse> =>
                createMock<ListForRepoResponse>({data: parameters && 'state' in parameters && parameters.state === 'all' ? [checklist, previousChecklist] : [checklist]});
            listForRepo.mockImplementation(Object.assign(listIssues, listStatics));

            const picks = [
                {source: 'aaaaaaa', sha: 'pick-a', pr: 101, actor: 'first'},
                {source: 'bbbbbbb', sha: 'pick-b', pr: 102, actor: 'second'},
                {source: 'ccccccc', sha: 'pick-c', pr: 103, actor: 'third'},
                {source: 'ddddddd', sha: 'pick-d', pr: 104, actor: 'fourth'},
                {source: 'eeeeeee', sha: 'pick-e', pr: 105, actor: 'fifth'},
                {source: 'fffffff', sha: 'f'.repeat(40), pr: 106, actor: 'sixth'},
            ];
            const compare = async (): Promise<CompareResponse> =>
                createMock<CompareResponse>({
                    data: {
                        commits: [
                            ...picks.map((pick) => ({sha: pick.sha, commit: {message: `(cherry picked from commit ${pick.source})\n\n(cherry-picked to staging by ${pick.actor})`}})),
                            {sha: 'd'.repeat(40), commit: {message: `Revert "Sixth fix"\n\nThis reverts commit ${'f'.repeat(40)}.`}},
                        ],
                    },
                });
            compareCommits.mockImplementation(Object.assign(compare, compareStatics));
            let includeChecklistPRs = false;
            const listPullsStatics = {endpoint: octokit.rest.repos.listPullRequestsAssociatedWithCommit.endpoint, defaults: octokit.rest.repos.listPullRequestsAssociatedWithCommit.defaults};
            const listPullsForCommit = async (parameters?: Parameters<ListPulls>[0]): Promise<Awaited<ReturnType<ListPulls>>> => {
                const pick = picks.find((item) => item.source === (parameters && 'commit_sha' in parameters ? parameters.commit_sha : undefined));
                return createMock<Awaited<ReturnType<ListPulls>>>({data: pick && (includeChecklistPRs || pick.pr === 105) ? [{number: pick.pr}] : []});
            };
            const listPulls = jest.spyOn(octokit.rest.repos, 'listPullRequestsAssociatedWithCommit').mockImplementation(Object.assign(listPullsForCommit, listPullsStatics));
            const getPullStatics = {endpoint: octokit.rest.pulls.get.endpoint, defaults: octokit.rest.pulls.get.defaults};
            const getPullForNumber = async (parameters?: Parameters<GetPull>[0]): Promise<Awaited<ReturnType<GetPull>>> => {
                const number = parameters && 'pull_number' in parameters ? parameters.pull_number : 0;
                return createMock<Awaited<ReturnType<GetPull>>>({
                    data: {html_url: `${CONST.APP_REPO_URL}/pull/${number}`, body: `${CONST.APP_REPO_URL}/issues/${number + 100}`, title: `Fix ${number}`, user: {login: 'author'}},
                });
            };
            const getPull = jest.spyOn(octokit.rest.pulls, 'get').mockImplementation(Object.assign(getPullForNumber, getPullStatics));
            const getContent = jest
                .spyOn(octokit.rest.repos, 'getContent')
                .mockResolvedValue(createMock<Awaited<ReturnType<InternalOctokit['rest']['repos']['getContent']>>>({data: {content: ''}}));
            const comments = new Map<number, string[]>();
            const commentLocations = new Map<number, {prNumber: number; index: number}>();
            let nextCommentID = 1;
            getAllComments.mockImplementation(async (number) => comments.get(number) ?? []);
            const createComment = jest.spyOn(GithubUtils, 'createComment').mockImplementation(async (_repo, number, body) => {
                const entries = [...(comments.get(number) ?? []), body];
                comments.set(number, entries);
                const id = nextCommentID++;
                commentLocations.set(id, {prNumber: number, index: entries.length - 1});
                return createMock<Awaited<ReturnType<typeof GithubUtils.createComment>>>({data: {id}});
            });
            const updateCommentStatics = {endpoint: octokit.rest.issues.updateComment.endpoint, defaults: octokit.rest.issues.updateComment.defaults};
            const updateCommentBody = async (parameters?: Parameters<UpdateComment>[0]): Promise<Awaited<ReturnType<UpdateComment>>> => {
                if (!parameters || !('comment_id' in parameters) || !('body' in parameters) || typeof parameters.body !== 'string') {
                    throw new Error('Expected a comment update.');
                }
                const location = commentLocations.get(parameters.comment_id);
                const entries = location ? comments.get(location.prNumber) : undefined;
                if (!location || !entries) {
                    throw new Error('Expected the pending comment.');
                }
                entries[location.index] = parameters.body;
                return createMock<Awaited<ReturnType<UpdateComment>>>({data: {id: parameters.comment_id}});
            };
            const updateComment = jest.spyOn(octokit.rest.issues, 'updateComment').mockImplementation(Object.assign(updateCommentBody, updateCommentStatics));
            const mockFetch = Object.assign(async () => new Response('', {status: 200}), {preconnect: globalThis.fetch.preconnect});
            const postWebhook = jest.spyOn(globalThis, 'fetch').mockImplementation(mockFetch);
            const originalArgv = process.argv;
            const originalWebhook = process.env.SLACK_RETEST_WEBHOOK;
            const originalToken = process.env.SLACK_RETEST_USER_TOKEN;
            const originalDeployerWebhook = process.env.SLACK_WEBHOOK;

            try {
                process.env.SLACK_RETEST_WEBHOOK = 'https://example.com/retest';
                delete process.env.SLACK_RETEST_USER_TOKEN;
                delete process.env.SLACK_WEBHOOK;
                process.argv = ['bun', 'script', '--deploy-sha=deployed-sha', '--deploy-tag=9.5.24-5-staging'];

                // When no deployed pick belongs to the checklist
                await run();

                // Then the deploy does not read the employee whitelist or notify QA
                expect(getContent).not.toHaveBeenCalled();
                expect(postWebhook).not.toHaveBeenCalled();
                includeChecklistPRs = true;

                // When the last deploy processes the whole release and a later deploy repeats the scan
                await run();
                process.argv = ['bun', 'script', '--deploy-sha=next-sha', '--deploy-tag=9.5.24-6-staging'];
                await run();

                // Then every deployed fix gets one request, including checked blockers, while reverted and unrelated PRs get none
                expect(postWebhook).toHaveBeenCalledTimes(4);
                expect(createComment).toHaveBeenCalledTimes(4);
                expect(updateComment).toHaveBeenCalledTimes(4);
                const payloads = postWebhook.mock.calls.map((call) => {
                    const body = call[1]?.body;
                    if (typeof body !== 'string') {
                        throw new Error('Expected a JSON webhook body.');
                    }
                    const payload: unknown = JSON.parse(body);
                    if (
                        typeof payload !== 'object' ||
                        !payload ||
                        !('cpLink' in payload) ||
                        typeof payload.cpLink !== 'string' ||
                        !('author' in payload) ||
                        typeof payload.author !== 'string'
                    ) {
                        throw new Error('Expected the retest webhook payload.');
                    }
                    return {cpLink: payload.cpLink, author: payload.author};
                });
                expect(payloads.map((payload) => payload.cpLink)).toEqual([101, 102, 103, 104].map((number) => `${CONST.APP_REPO_URL}/pull/${number}`));
                expect(payloads.map((payload) => payload.author)).toEqual(['first', 'second', 'third', 'fourth']);
                expect(comments.get(101)?.[0]).toContain(getCherryPickRetestMarker('pick-a'));

                // When the first PR is picked again after a revert
                picks.push({source: 'aaaaaaa', sha: 'new-pick-a', pr: 101, actor: 'new-requester'});
                process.argv = ['bun', 'script', '--deploy-sha=third-sha', '--deploy-tag=9.5.24-7-staging'];
                await run();

                // Then only the new pick gets another retest request
                expect(postWebhook).toHaveBeenCalledTimes(5);
                expect(comments.get(101)?.[1]).toContain(getCherryPickRetestMarker('new-pick-a'));
            } finally {
                process.argv = originalArgv;
                if (originalWebhook === undefined) {
                    delete process.env.SLACK_RETEST_WEBHOOK;
                } else {
                    process.env.SLACK_RETEST_WEBHOOK = originalWebhook;
                }
                if (originalToken === undefined) {
                    delete process.env.SLACK_RETEST_USER_TOKEN;
                } else {
                    process.env.SLACK_RETEST_USER_TOKEN = originalToken;
                }
                if (originalDeployerWebhook === undefined) {
                    delete process.env.SLACK_WEBHOOK;
                } else {
                    process.env.SLACK_WEBHOOK = originalDeployerWebhook;
                }
                listPulls.mockRestore();
                getPull.mockRestore();
                getContent.mockRestore();
                createComment.mockRestore();
                updateComment.mockRestore();
                postWebhook.mockRestore();
            }
        });

        it('runs after any successful staging deployment and its checklist update', () => {
            // Given a regular staging deploy can supersede a canceled cherry-pick deploy
            const workflow = fs.readFileSync('.github/workflows/deploy.yml', 'utf8');
            const retestJob = workflow.split('  autoRetestRequestForCP:')[1]?.split('\n  createRelease:')[0] ?? '';

            // When the retest job conditions are checked
            const conditions = retestJob.split('\n').find((line) => line.trimStart().startsWith('if:')) ?? '';

            // Then it waits for all platforms and the checklist without requiring the latest push to be a cherry-pick
            expect(conditions).toContain("needs.prep.outputs.DEPLOY_ENV == 'staging'");
            expect(conditions).toContain("needs.deployChecklist.result == 'success'");
            expect(conditions).toContain('needs.checkDeploymentSuccess.outputs.IS_ALL_PLATFORMS_DEPLOYED');
            expect(conditions).toContain('!cancelled()');
            expect(conditions).not.toContain('IS_CHERRY_PICK');
            expect(retestJob).toContain('needs: [prep, deployChecklist, checkDeploymentSuccess]');
        });
    });

    describe('getSlackAuthor', () => {
        const slackIDs = new Map([['jasperhuangg', 'U01N2A6GYJH']]);

        it('sends the raw member ID, since the retest workflow builds the mention itself', () => {
            expect(getSlackAuthor('jasperhuangg', slackIDs)).toBe('U01N2A6GYJH');
        });

        it('falls back to the plain login for people outside the whitelist', () => {
            expect(getSlackAuthor('some-oss-contributor', slackIDs)).toBe('some-oss-contributor');
        });

        it('sends N/A when there is no login at all', () => {
            expect(getSlackAuthor('', slackIDs)).toBe('N/A');
        });
    });

    describe('getLinkedIssueNumbers', () => {
        it('finds App issue links in the PR body', () => {
            const body = `Fixes ${CONST.APP_REPO_URL}/issues/42 and also ${CONST.APP_REPO_URL}/issues/99`;
            expect(getLinkedIssueNumbers(body)).toEqual([42, 99]);
        });

        it('ignores PR links and other repos', () => {
            const body = `See ${CONST.APP_REPO_URL}/pull/7 and ${CONST.MOBILE_EXPENSIFY_URL}/issues/5`;
            expect(getLinkedIssueNumbers(body)).toEqual([]);
        });

        it('handles an empty body', () => {
            expect(getLinkedIssueNumbers(null)).toEqual([]);
            expect(getLinkedIssueNumbers('')).toEqual([]);
        });
    });

    describe('buildRetestPayload', () => {
        const deployTag = '9.1.2-3-staging';
        const hit: RetestHit = {
            prNumber: 123,
            prURL: `${CONST.APP_REPO_URL}/pull/123`,
            prAuthor: 'octocat',
            cherryPickSHA: 'pick-a',
            blockerIssueURLs: [`${CONST.APP_REPO_URL}/issues/42`],
            prTitle: 'Fix crash on staging',
            author: 'U01N2A6GYJH',
        };

        it('maps a hit to the exact Slack workflow variables', () => {
            expect(buildRetestPayload(hit, deployTag)).toEqual({
                isDb: 'dbTrue',
                whereToRetest: 'Staging',
                notes: 'Auto-filed after cherry-pick to staging: "Fix crash on staging"\n\nRetest ID: 9.1.2-3-staging / App PR #123',
                ghIssueLink: `${CONST.APP_REPO_URL}/issues/42`,
                adhocLink: 'N/A',
                requesterName: 'octocat',
                author: 'U01N2A6GYJH',
                cpLink: `${CONST.APP_REPO_URL}/pull/123`,
                platforms: 'Android, iOS, Web',
            });
        });

        it('puts every blocker a PR fixes into one request, space-separated (Slack field rejects newlines)', () => {
            const multi = {...hit, blockerIssueURLs: [`${CONST.APP_REPO_URL}/issues/42`, `${CONST.APP_REPO_URL}/issues/99`]};
            expect(buildRetestPayload(multi, deployTag).ghIssueLink).toBe(`${CONST.APP_REPO_URL}/issues/42 ${CONST.APP_REPO_URL}/issues/99`);
        });

        it('sends N/A for a missing requester so Slack does not reject an empty value', () => {
            expect(buildRetestPayload({...hit, prAuthor: ''}, deployTag).requesterName).toBe('N/A');
        });
    });

    describe('Cherry Pick Request links', () => {
        const hit: RetestHit = {
            prNumber: 123,
            prURL: `${CONST.APP_REPO_URL}/pull/123`,
            prAuthor: 'octocat',
            cherryPickSHA: 'pick-a',
            blockerIssueURLs: [`${CONST.APP_REPO_URL}/issues/42`],
            prTitle: 'Fix crash on staging',
            author: 'U01N2A6GYJH',
        };

        it('finds the staging Cherry Pick Request regardless of who ran the cherry-pick', () => {
            // Given a Cherry Pick Request for the deployed PR from a different person
            const request: SlackMessage = {
                ts: '1790800323.327539',
                thread_ts: '1790800323.327539',
                text: `:cherries: *Cherry Pick Request* :cherries: from <@U99OTHER|rory>\n\nLink to PR: <${hit.prURL}>\n\n*Where:* staging`,
            };

            // When the retest workflow looks for the originating request
            const result = isCherryPickRequest(request, hit);

            // Then it selects that request's parent message
            expect(result).toBe(true);
        });

        it('does not link a production request or a reply in an unrelated thread', () => {
            // Given request-shaped messages that do not identify the staging parent
            const messages: SlackMessage[] = [
                {
                    ts: '1790800323.327539',
                    text: `*Cherry Pick Request* from <@U01N2A6GYJH|jasper>\nLink to PR: <${hit.prURL}>\n*Where:* production`,
                },
                {
                    ts: '1790800333.919019',
                    thread_ts: '1790800323.327539',
                    text: `*Cherry Pick Request* from <@U01N2A6GYJH|jasper>\nLink to PR: <${hit.prURL}>\n*Where:* staging`,
                },
            ];

            // When the retest workflow evaluates them
            const results = messages.map((message) => isCherryPickRequest(message, hit));

            // Then neither can receive the retest reply
            expect(results).toEqual([false, false]);
        });

        it('adds a stable reference and a readable threaded reply', () => {
            // Given the staging deploy tag and its retest permalink
            const reference = getRetestRequestReference(hit, '9.1.2-3-staging');
            const retestPermalink = 'https://expensify.slack.com/archives/C09V78U42D8/p1790718982451049';

            // When the retest is located and linked to its Cherry Pick Request
            const reply = buildRetestLinkReply('1790800323.327539', retestPermalink);

            // Then Slack receives a uniquely searchable retest reference and a threaded link
            expect(reference).toBe('Retest ID: 9.1.2-3-staging / App PR #123');
            expect(reply).toEqual({
                thread_ts: '1790800323.327539',
                text: `🔁 Automated retest request: <${retestPermalink}|Open retest request>.`,
            });
        });
    });

    describe('getRetestMarker', () => {
        it('is unique per staging tag so a re-deploy does not double-file', () => {
            expect(getRetestMarker('9.1.2-3-staging')).toBe('<!-- retest-requested:9.1.2-3-staging -->');
            expect(getRetestMarker('9.1.2-3-staging')).not.toBe(getRetestMarker('9.1.2-4-staging'));
        });
    });
});
