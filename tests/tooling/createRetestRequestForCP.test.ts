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
    getCherryPickRetestMarker,
    getCherryPicks,
    getDeployedCommits,
    getLinkedIssueNumbers,
    getPreviousChecklistTag,
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
            for (let page = 0; page < 3; page++) {
                compareCommits.mockResolvedValueOnce(createMock<CompareResponse>({data: {commits: ordinaryCommits.slice(page * 100, (page + 1) * 100)}}));
            }
            compareCommits.mockResolvedValueOnce(
                createMock<CompareResponse>({
                    data: {
                        commits: [
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
            expect(compareCommits).toHaveBeenCalledTimes(4);
            expect(compareCommits).toHaveBeenLastCalledWith(expect.objectContaining({base: '9.5.23-3-staging', head: 'deployed-sha', per_page: 100, page: 4}));
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
    });

    describe('staging deploy', () => {
        it('does not scan release history when all blockers are resolved', async () => {
            // Given the checklist contains a PR but its only blocker has already been verified
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
                    `- [x] ${CONST.APP_REPO_URL}/issues/201`,
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
            // Given three blocker fixes were picked before a successful deploy, plus a resolved blocker and a PR outside the checklist
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
                    ...[101, 102, 103, 104].map((number) => `- [ ] ${CONST.APP_REPO_URL}/pull/${number}`),
                    '',
                    '',
                    '**Deploy Blockers:**',
                    ...[201, 202, 203].map((number) => `- [ ] ${CONST.APP_REPO_URL}/issues/${number}`),
                    `- [x] ${CONST.APP_REPO_URL}/issues/204`,
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
            ];
            const compare = async (): Promise<CompareResponse> =>
                createMock<CompareResponse>({
                    data: {commits: picks.map((pick) => ({sha: pick.sha, commit: {message: `(cherry picked from commit ${pick.source})\n\n(cherry-picked to staging by ${pick.actor})`}}))},
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
            getAllComments.mockImplementation(async (number) => comments.get(number) ?? []);
            const createComment = jest.spyOn(GithubUtils, 'createComment').mockImplementation(async (_repo, number, body) => {
                comments.set(number, [...(comments.get(number) ?? []), body]);
                return createMock<Awaited<ReturnType<typeof GithubUtils.createComment>>>({});
            });
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

                // Then each outstanding fix has exactly one request, and resolved or unrelated PRs have none
                expect(postWebhook).toHaveBeenCalledTimes(3);
                expect(createComment).toHaveBeenCalledTimes(3);
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
                expect(payloads.map((payload) => payload.cpLink)).toEqual([101, 102, 103].map((number) => `${CONST.APP_REPO_URL}/pull/${number}`));
                expect(payloads.map((payload) => payload.author)).toEqual(['first', 'second', 'third']);
                expect(comments.get(101)?.[0]).toContain(getCherryPickRetestMarker('pick-a'));

                // When the first PR is picked again after a revert
                picks.push({source: 'aaaaaaa', sha: 'new-pick-a', pr: 101, actor: 'new-requester'});
                process.argv = ['bun', 'script', '--deploy-sha=third-sha', '--deploy-tag=9.5.24-7-staging'];
                await run();

                // Then only the new pick gets another retest request
                expect(postWebhook).toHaveBeenCalledTimes(4);
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
