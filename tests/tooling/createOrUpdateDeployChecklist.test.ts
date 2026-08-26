import type {Mock} from 'bun:test';
import {afterAll, afterEach, beforeAll, describe, expect, jest, mock, test} from 'bun:test';

import CONST from '@github/libs/CONST';
import * as DeployChecklistUtils from '@github/libs/DeployChecklistUtils';
import type {InternalOctokit, ListForRepoMethod} from '@github/libs/GithubUtils';
import GithubUtils from '@github/libs/GithubUtils';
import GitUtils from '@github/libs/GitUtils';

import * as core from '@actions/core';
import * as fns from 'date-fns';
import {fs as memfsFs, vol} from 'memfs';
import path from 'path';

import createMock from '../utils/createMock';
import materializeOctokitNamespace from '../utils/materializeOctokitNamespace';

/* eslint-disable @typescript-eslint/naming-convention */

// Must run before `createOrUpdateDeployChecklist` (which imports `fs` internally) is imported below: mock.module
// patches the shared module registry entry, and existing import bindings are live, but only if the patch happens
// before those bindings are first read.
await mock.module('fs', () => ({...memfsFs, default: memfsFs}));

// Must be imported after the mock.module() call above so it picks up the mock.
const {default: run} = await import('@scripts/createOrUpdateDeployChecklist');

type IssuesCreateResponse = Awaited<ReturnType<typeof GithubUtils.octokit.issues.create>>['data'];

const mockGetInput = jest.fn();

type ListForRepoParameters = Parameters<ListForRepoMethod>;
type ListForRepoResponse = Awaited<ReturnType<ListForRepoMethod>>;

type CreateIssueParameters = Parameters<InternalOctokit['rest']['issues']['create']>;
type CreateIssueResponse = Awaited<ReturnType<InternalOctokit['rest']['issues']['create']>>;
type UpdateIssueParameters = Parameters<InternalOctokit['rest']['issues']['update']>;
type UpdateIssueResponse = Awaited<ReturnType<InternalOctokit['rest']['issues']['update']>>;
type PullsListResponse = Awaited<ReturnType<InternalOctokit['rest']['pulls']['list']>>;

const PATH_TO_PACKAGE_JSON = path.resolve(__dirname, '../../package.json');

let mockCreateIssue: Mock<InternalOctokit['rest']['issues']['create']>;
let mockUpdateIssue: Mock<InternalOctokit['rest']['issues']['update']>;
let mockListIssues: Mock<ListForRepoMethod>;
let listForRepoStatics: Pick<ListForRepoMethod, 'defaults' | 'endpoint'>;
const mockGetMergedPRsDeployedBetween = jest.fn<typeof GitUtils.getMergedPRsDeployedBetween>();
const mockGetWorkflowRunURLForCommit = jest.fn().mockResolvedValue(undefined);

beforeAll(() => {
    // The action stamps the checklist title with today's date and the assertions below re-derive it, so pin the
    // clock: otherwise the two reads can straddle local midnight. Jest froze Date globally via fakeTimers.
    jest.setSystemTime(new Date('2026-02-03T12:00:00Z'));

    GithubUtils.initOctokitWithToken('fake_token');
    const mockOctokit = GithubUtils.internalOctokit;
    if (!mockOctokit) {
        throw new Error('GithubUtils failed to initialize Octokit.');
    }

    mockOctokit.rest.issues = materializeOctokitNamespace(mockOctokit.rest.issues);
    mockOctokit.rest.pulls = materializeOctokitNamespace(mockOctokit.rest.pulls);

    // Octokit endpoint methods carry `defaults`/`endpoint` statics. A Bun mock doesn't, and `paginate` reads them
    // off the method, so the real ones are copied back onto each mock and stub below.
    const createIssue = (...args: CreateIssueParameters): Promise<CreateIssueResponse> => {
        const [arg] = args;
        if (!arg) {
            throw new Error('GithubUtils issues.create mock requires request parameters.');
        }
        return Promise.resolve(
            createMock<CreateIssueResponse>({
                data: {
                    html_url: `https://github.com/${process.env.GITHUB_REPOSITORY}/issues/29`,
                },
            }),
        );
    };
    const updateIssue = (...args: UpdateIssueParameters): Promise<UpdateIssueResponse> => {
        const [arg] = args;
        if (!arg) {
            throw new Error('GithubUtils issues.update mock requires request parameters.');
        }
        return Promise.resolve(
            createMock<UpdateIssueResponse>({
                data: {
                    html_url: `https://github.com/${process.env.GITHUB_REPOSITORY}/issues/${arg.issue_number}`,
                },
            }),
        );
    };
    const {endpoint: createEndpoint, defaults: createDefaults} = mockOctokit.rest.issues.create;
    const {endpoint: updateEndpoint, defaults: updateDefaults} = mockOctokit.rest.issues.update;
    mockCreateIssue = jest.spyOn(mockOctokit.rest.issues, 'create').mockImplementation(Object.assign(createIssue, {endpoint: createEndpoint, defaults: createDefaults}));
    mockUpdateIssue = jest.spyOn(mockOctokit.rest.issues, 'update').mockImplementation(Object.assign(updateIssue, {endpoint: updateEndpoint, defaults: updateDefaults}));
    const {endpoint: listForRepoEndpoint, defaults: listForRepoDefaults} = mockOctokit.rest.issues.listForRepo;
    listForRepoStatics = {endpoint: listForRepoEndpoint, defaults: listForRepoDefaults};
    const {endpoint: pullsListEndpoint, defaults: pullsListDefaults} = mockOctokit.rest.pulls.list;
    mockListIssues = Object.assign(jest.spyOn(mockOctokit.rest.issues, 'listForRepo'), {endpoint: listForRepoEndpoint, defaults: listForRepoDefaults});
    const mockListPullRequests = Object.assign(jest.spyOn(mockOctokit.rest.pulls, 'list'), {endpoint: pullsListEndpoint, defaults: pullsListDefaults});
    mockListPullRequests.mockResolvedValue(createMock<PullsListResponse>({data: [], headers: {}}));
    GithubUtils.internalOctokit = mockOctokit;

    // Mock @actions/core for input handling and logging in tests. Real ESM module namespace exports are read-only
    // live bindings, so these can't be reassigned directly (unlike Jest's Babel-transpiled CJS interop); spy on
    // them instead.
    jest.spyOn(core, 'getInput').mockImplementation(mockGetInput);
    jest.spyOn(core, 'info').mockImplementation(() => {});
    jest.spyOn(core, 'startGroup').mockImplementation(() => {});
    jest.spyOn(core, 'endGroup').mockImplementation(() => {});
    jest.spyOn(core, 'setFailed').mockImplementation(() => {});

    // Mock GitUtils
    GitUtils.getMergedPRsDeployedBetween = mockGetMergedPRsDeployedBetween;
    GithubUtils.getWorkflowRunURLForCommit = mockGetWorkflowRunURLForCommit;
    mockGetInput.mockImplementation((arg) => (arg === 'GITHUB_TOKEN' ? 'fake_token' : ''));

    vol.reset();
    vol.fromJSON({
        [PATH_TO_PACKAGE_JSON]: JSON.stringify({version: '1.0.2-1'}),
    });
});

afterEach(() => {
    mockGetInput.mockClear();
    mockCreateIssue.mockClear();
    mockUpdateIssue.mockClear();
    mockListIssues.mockClear();
    mockGetMergedPRsDeployedBetween.mockClear();
    mockGetWorkflowRunURLForCommit.mockClear();
});

afterAll(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
});

function mockDeployChecklistIssuesByLabel(responseByLabel: Partial<Record<string, Parameters<typeof createMock<ListForRepoResponse>>[0]['data']>>) {
    const listForRepo = (...parameters: ListForRepoParameters): Promise<ListForRepoResponse> => {
        const receivedParameters = parameters[0];
        if (!receivedParameters) {
            throw new Error('GithubUtils issues.listForRepo mock requires request parameters.');
        }
        let labels: string | undefined;
        if ('url' in receivedParameters) {
            const {url} = receivedParameters;
            if (typeof url !== 'string') {
                throw new Error('GithubUtils issues.listForRepo request options require a string URL.');
            }
            labels = new URL(url).searchParams.get('labels') ?? undefined;
        } else {
            labels = receivedParameters.labels;
        }
        const data = labels === undefined ? [] : (responseByLabel[labels] ?? []);
        return Promise.resolve(createMock<ListForRepoResponse>({data, headers: {}}));
    };
    mockListIssues.mockImplementation(Object.assign(listForRepo, listForRepoStatics));
}

const LABELS = {
    STAGING_DEPLOY_CASH: {
        id: 2783847782,
        // cspell:disable-next-line
        node_id: 'MDU6TGFiZWwyNzgzODQ3Nzgy',
        url: `https://api.github.com/repos/${process.env.GITHUB_REPOSITORY}/labels/StagingDeployCash`,
        name: CONST.LABELS.STAGING_DEPLOY,
        color: '6FC269',
        default: false,
        description: '',
    },
    DEPLOY_BLOCKER_CASH: {
        id: 2810597462,
        // cspell:disable-next-line
        node_id: 'MDU6TGFiZWwyODEwNTk3NDYy',
        url: `https://api.github.com/repos/${process.env.GITHUB_REPOSITORY}/labels/DeployBlockerCash`,
        name: CONST.LABELS.DEPLOY_BLOCKER,
        color: '000000',
        default: false,
        description: 'This issue or pull request should block deployment',
    },
};

const basePRList = [
    `https://github.com/${process.env.GITHUB_REPOSITORY}/pull/1`,
    `https://github.com/${process.env.GITHUB_REPOSITORY}/pull/2`,
    `https://github.com/${process.env.GITHUB_REPOSITORY}/pull/3`,
    `https://github.com/${process.env.GITHUB_REPOSITORY}/pull/4`,
    `https://github.com/${process.env.GITHUB_REPOSITORY}/pull/5`,
    `https://github.com/${process.env.GITHUB_REPOSITORY}/pull/6`,
    `https://github.com/${process.env.GITHUB_REPOSITORY}/pull/7`,
    `https://github.com/${process.env.GITHUB_REPOSITORY}/pull/8`,
    `https://github.com/${process.env.GITHUB_REPOSITORY}/pull/9`,
    `https://github.com/${process.env.GITHUB_REPOSITORY}/pull/10`,
];

const baseMobileExpensifyPRList = [
    `https://github.com/${CONST.GITHUB_OWNER}/${CONST.MOBILE_EXPENSIFY_REPO}/pull/20`,
    `https://github.com/${CONST.GITHUB_OWNER}/${CONST.MOBILE_EXPENSIFY_REPO}/pull/21`,
    `https://github.com/${CONST.GITHUB_OWNER}/${CONST.MOBILE_EXPENSIFY_REPO}/pull/22`,
];

const issueURL = (n: number) => `https://github.com/${process.env.GITHUB_REPOSITORY}/issues/${n}`;

const baseExpectedOutput = (version = '1.0.2-1', includeMobileExpensifyCompare = true) =>
    // cspell:disable
    `**Release Version:** \`${version}\`\n**Compare Changes:** https://github.com/${process.env.GITHUB_REPOSITORY}/compare/production...staging\n${includeMobileExpensifyCompare ? `**Mobile-Expensify Changes:** https://github.com/${CONST.GITHUB_OWNER}/${CONST.MOBILE_EXPENSIFY_REPO}/compare/production...staging\n` : ''}\n**This release contains changes from the following pull requests:**\n`;
// cspell:enable
const openCheckbox = '- [ ] ';
const closedCheckbox = '- [x] ';
const deployerVerificationsHeader = '**Deployer verifications:**';

const sentryVerificationCurrentRelease = (version: string) =>
    `I checked [Sentry](https://expensify.sentry.io/releases/new.expensify%40${version}/?project=4510228107427840&environment=staging) for **this release version** and verified that this release does not introduce any new crashes. More detailed instructions on this verification can be found [here](https://stackoverflowteams.com/c/expensify/questions/15095/15096).`;

const sentryVerificationPreviousRelease = (version: string) =>
    `I checked [Sentry](https://expensify.sentry.io/releases/new.expensify%40${version}/?project=4510228107427840&environment=production) for **the previous release version** and verified that the release did not introduce any new crashes. Because mobile deploys use a phased rollout, completing this checklist will deploy the previous release version to 100% of users. More detailed instructions on this verification can be found [here](https://stackoverflowteams.com/c/expensify/questions/15095/15096).`;

const ghVerification = 'I checked [GitHub Status](https://www.githubstatus.com/) and verified there is no reported incident with Actions.';
const ccApplauseLeads = `cc @Expensify/applauseleads\n`;
const deployBlockerHeader = '**Deploy Blockers:**';
const lineBreak = '\n';
const lineBreakDouble = '\n\n';

describe('createOrUpdateDeployChecklist', () => {
    const closedDeployChecklist = {
        url: `https://api.github.com/repos/${process.env.GITHUB_REPOSITORY}/issues/28`,
        title: 'Test Deploy Checklist',
        number: 28,
        labels: [LABELS.STAGING_DEPLOY_CASH],
        html_url: `https://github.com/${process.env.GITHUB_REPOSITORY}/issues/29`,

        body:
            `${baseExpectedOutput('1.0.1-0')}` +
            `${closedCheckbox}${basePRList.at(0)}` +
            `${lineBreak}${closedCheckbox}${basePRList.at(1)}` +
            `${lineBreak}${closedCheckbox}${basePRList.at(2)}${lineBreak}` +
            `${lineBreakDouble}${deployBlockerHeader}` +
            `${lineBreak}${closedCheckbox}${basePRList.at(0)}` +
            `${lineBreak}${closedCheckbox}${basePRList.at(3)}` +
            `${lineBreak}${closedCheckbox}${basePRList.at(4)}` +
            `${lineBreakDouble}${ccApplauseLeads}`,
    };

    const baseNewPullRequests = [6, 7, 8];

    function toMergedPRs(prNumbers: number[]) {
        return {
            mergedPRs: prNumbers.map((num, index) => ({
                prNumber: num,
                date: `2024-01-${String(index + 1).padStart(2, '0')}T00:00:00Z`,
            })),
            submoduleUpdates: [],
        };
    }

    type ChronologicalEntry = {type: 'pr'; prNumber: number} | {type: 'submodule'; version: string; buildLink?: string; commit?: string; mobileExpensifyPRs?: number[]};

    function isNumberEntries(entries: number[] | ChronologicalEntry[]): entries is number[] {
        return entries.every((entry) => typeof entry === 'number');
    }

    function buildChronologicalSection(entries: number[] | ChronologicalEntry[], pendingMobileExpensifyPRs: number[] = []): string {
        let normalizedEntries: ChronologicalEntry[];
        if (entries.length === 0) {
            normalizedEntries = [];
        } else if (isNumberEntries(entries)) {
            normalizedEntries = entries.map((n): ChronologicalEntry => ({type: 'pr', prNumber: n}));
        } else {
            normalizedEntries = entries;
        }

        if (normalizedEntries.length === 0) {
            return '';
        }

        let section = '<details>\n<summary><b>Chronologically ordered merged PRs (oldest first)</b></summary>\n\n';
        let prIndex = 0;
        for (const entry of normalizedEntries) {
            if (entry.type === 'submodule') {
                prIndex++;
                const buildLink = entry.buildLink ? ` — [Adhoc Build](${entry.buildLink})` : ` — ${(entry.commit ?? '').substring(0, 7)}`;
                section += `${prIndex}. Mobile-Expensify submodule update to \`${entry.version}\`${buildLink}\n`;
                if (entry.mobileExpensifyPRs) {
                    for (const mobileExpensifyPR of entry.mobileExpensifyPRs) {
                        section += `   ↳ https://github.com/${CONST.GITHUB_OWNER}/${CONST.MOBILE_EXPENSIFY_REPO}/pull/${mobileExpensifyPR}\n`;
                    }
                }
            } else {
                prIndex++;
                section += `${prIndex}. https://github.com/${process.env.GITHUB_REPOSITORY}/pull/${entry.prNumber}\n`;
            }
        }
        if (pendingMobileExpensifyPRs.length > 0) {
            section += `\n--- PRs waiting for Mobile-Expensify submodule update\n`;
            for (const mobileExpensifyPR of pendingMobileExpensifyPRs) {
                section += `https://github.com/${CONST.GITHUB_OWNER}/${CONST.MOBILE_EXPENSIFY_REPO}/pull/${mobileExpensifyPR}\n`;
            }
        }
        section += '\n</details>\n';
        return section;
    }

    test('creates new issue when there is none open', async () => {
        vol.reset();
        vol.fromJSON({
            [PATH_TO_PACKAGE_JSON]: JSON.stringify({version: '1.0.2-1'}),
        });

        // cspell:disable-next-line
        mockGetMergedPRsDeployedBetween.mockImplementation(async (fromRef, toRef, repositoryName) => {
            if (fromRef === '1.0.1-0-staging' && toRef === '1.0.2-1-staging') {
                if (repositoryName === CONST.MOBILE_EXPENSIFY_REPO) {
                    return toMergedPRs([20, 21, 22]); // Mobile-Expensify PRs
                }
                return toMergedPRs(baseNewPullRequests); // App PRs
            }
            return {mergedPRs: [], submoduleUpdates: []};
        });

        mockDeployChecklistIssuesByLabel({
            [CONST.LABELS.STAGING_DEPLOY]: [closedDeployChecklist],
        });

        const result = await run();
        expect(mockCreateIssue).toHaveBeenCalledWith({
            owner: CONST.GITHUB_OWNER,
            repo: CONST.APP_REPO,
            title: `Deploy Checklist: New Expensify ${fns.format(new Date(), 'yyyy-MM-dd')}`,
            labels: [CONST.LABELS.STAGING_DEPLOY, CONST.LABELS.LOCK_DEPLOY, CONST.LABELS.DAILY],
            assignees: [CONST.APPLAUSE_BOT],
            body:
                `${baseExpectedOutput()}` +
                `${openCheckbox}${basePRList.at(5)}` +
                `${lineBreak}${openCheckbox}${basePRList.at(6)}` +
                `${lineBreak}${openCheckbox}${basePRList.at(7)}` +
                `${lineBreakDouble}**Mobile-Expensify PRs:**` +
                `${lineBreak}${openCheckbox}${baseMobileExpensifyPRList.at(0)}` +
                `${lineBreak}${openCheckbox}${baseMobileExpensifyPRList.at(1)}` +
                `${lineBreak}${openCheckbox}${baseMobileExpensifyPRList.at(2)}` +
                `${lineBreakDouble}${buildChronologicalSection(baseNewPullRequests, [20, 21, 22])}` +
                `${lineBreak}${deployerVerificationsHeader}` +
                `${lineBreak}${openCheckbox}${sentryVerificationCurrentRelease('1.0.2-1')}` +
                `${lineBreak}${openCheckbox}${sentryVerificationPreviousRelease('1.0.1-0')}` +
                `${lineBreak}${openCheckbox}${ghVerification}` +
                `${lineBreak}${ccApplauseLeads}`,
        });
        expect(result).toStrictEqual(
            createMock<IssuesCreateResponse>({
                html_url: `https://github.com/${process.env.GITHUB_REPOSITORY}/issues/29`,
            }),
        );
    });

    test('creates new issue when there are no Mobile-Expensify PRs', async () => {
        vol.reset();
        vol.fromJSON({
            [PATH_TO_PACKAGE_JSON]: JSON.stringify({version: '1.0.2-1'}),
        });

        // Mock: No Mobile-Expensify PRs found for this release
        mockGetMergedPRsDeployedBetween.mockImplementation(async (fromRef, toRef, repositoryName) => {
            if (fromRef === '1.0.1-0-staging' && toRef === '1.0.2-1-staging') {
                if (repositoryName === CONST.MOBILE_EXPENSIFY_REPO) {
                    return {mergedPRs: [], submoduleUpdates: []}; // No Mobile-Expensify PRs
                }
                return toMergedPRs(baseNewPullRequests); // App PRs
            }
            return {mergedPRs: [], submoduleUpdates: []};
        });

        mockDeployChecklistIssuesByLabel({
            [CONST.LABELS.STAGING_DEPLOY]: [closedDeployChecklist],
        });

        const result = await run();
        expect(mockCreateIssue).toHaveBeenCalledWith({
            owner: CONST.GITHUB_OWNER,
            repo: CONST.APP_REPO,
            title: `Deploy Checklist: New Expensify ${fns.format(new Date(), 'yyyy-MM-dd')}`,
            labels: [CONST.LABELS.STAGING_DEPLOY, CONST.LABELS.LOCK_DEPLOY, CONST.LABELS.DAILY],
            assignees: [CONST.APPLAUSE_BOT],
            body:
                `${baseExpectedOutput('1.0.2-1', false)}` +
                `${openCheckbox}${basePRList.at(5)}` +
                `${lineBreak}${openCheckbox}${basePRList.at(6)}` +
                `${lineBreak}${openCheckbox}${basePRList.at(7)}` +
                // Note: No Mobile-Expensify PRs section since there are none
                `${lineBreakDouble}${buildChronologicalSection(baseNewPullRequests)}` +
                `${lineBreak}${deployerVerificationsHeader}` +
                `${lineBreak}${openCheckbox}${sentryVerificationCurrentRelease('1.0.2-1')}` +
                `${lineBreak}${openCheckbox}${sentryVerificationPreviousRelease('1.0.1-0')}` +
                `${lineBreak}${openCheckbox}${ghVerification}` +
                `${lineBreak}${ccApplauseLeads}`,
        });
        expect(result).toStrictEqual(
            createMock<IssuesCreateResponse>({
                html_url: `https://github.com/${process.env.GITHUB_REPOSITORY}/issues/29`,
            }),
        );
    });

    describe('updates existing issue when there is one open', () => {
        const openDeployChecklistBefore = {
            url: `https://api.github.com/repos/${process.env.GITHUB_REPOSITORY}/issues/29`,
            title: 'Test Deploy Checklist',
            number: 29,
            labels: [LABELS.STAGING_DEPLOY_CASH],

            body:
                `${baseExpectedOutput()}` +
                `${openCheckbox}${basePRList.at(5)}` +
                `${lineBreak}${closedCheckbox}${basePRList.at(6)}` +
                `${lineBreak}${openCheckbox}${basePRList.at(7)}${lineBreak}` +
                `${lineBreakDouble}${deployBlockerHeader}` +
                `${lineBreak}${openCheckbox}${basePRList.at(5)}` +
                `${lineBreak}${openCheckbox}${basePRList.at(8)}` +
                `${lineBreak}${closedCheckbox}${basePRList.at(9)}${lineBreak}` +
                `${lineBreakDouble}${deployerVerificationsHeader}` +
                `${lineBreak}${closedCheckbox}${sentryVerificationCurrentRelease('1.0.2-1')}` +
                `${lineBreak}${closedCheckbox}${sentryVerificationPreviousRelease('1.0.1-0')}` +
                `${lineBreak}${closedCheckbox}${ghVerification}` +
                `${lineBreakDouble}${ccApplauseLeads}`,
            state: 'open',
        };

        const currentDeployBlockers = [
            {
                html_url: `https://github.com/${process.env.GITHUB_REPOSITORY}/pull/6`,
                number: 6,
                state: 'open',
                labels: [LABELS.DEPLOY_BLOCKER_CASH],
            },
            {
                html_url: `https://github.com/${process.env.GITHUB_REPOSITORY}/pull/9`,
                number: 9,
                state: 'open',
                labels: [LABELS.DEPLOY_BLOCKER_CASH],
            },
            {
                html_url: `https://github.com/${process.env.GITHUB_REPOSITORY}/pull/10`,
                number: 10,
                state: 'closed',
                labels: [LABELS.DEPLOY_BLOCKER_CASH],
            },
        ];

        test('with NPM_VERSION input, pull requests, and deploy blockers', async () => {
            vol.reset();
            vol.fromJSON({
                [PATH_TO_PACKAGE_JSON]: JSON.stringify({version: '1.0.2-2'}),
            });

            // New pull requests to add to the open deploy checklist
            const newPullRequests = [9, 10];
            mockGetMergedPRsDeployedBetween.mockImplementation(async (fromRef, toRef, repositoryName) => {
                if (fromRef === '1.0.1-0-staging' && toRef === '1.0.2-2-staging') {
                    if (repositoryName === CONST.MOBILE_EXPENSIFY_REPO) {
                        return toMergedPRs([20, 21, 22, 23, 24]); // Mobile-Expensify PRs
                    }
                    return toMergedPRs([...baseNewPullRequests, ...newPullRequests]);
                }
                return {mergedPRs: [], submoduleUpdates: []};
            });

            mockDeployChecklistIssuesByLabel({
                [CONST.LABELS.STAGING_DEPLOY]: [openDeployChecklistBefore, closedDeployChecklist],
                [CONST.LABELS.DEPLOY_BLOCKER]: [
                    ...currentDeployBlockers,
                    {
                        html_url: `https://github.com/${process.env.GITHUB_REPOSITORY}/issues/11`, // New
                        number: 11,
                        state: 'open',
                        labels: [LABELS.DEPLOY_BLOCKER_CASH],
                    },
                    {
                        html_url: `https://github.com/${process.env.GITHUB_REPOSITORY}/issues/12`, // New
                        number: 12,
                        state: 'open',
                        labels: [LABELS.DEPLOY_BLOCKER_CASH],
                    },
                ],
            });

            const result = await run();
            expect(mockUpdateIssue).toHaveBeenCalledWith({
                owner: CONST.GITHUB_OWNER,
                repo: CONST.APP_REPO,
                issue_number: openDeployChecklistBefore.number,

                body:
                    `${baseExpectedOutput('1.0.2-2')}` +
                    `${openCheckbox}${basePRList.at(5)}` +
                    `${lineBreak}${closedCheckbox}${basePRList.at(6)}` +
                    `${lineBreak}${openCheckbox}${basePRList.at(7)}` +
                    `${lineBreak}${openCheckbox}${basePRList.at(8)}` +
                    `${lineBreak}${openCheckbox}${basePRList.at(9)}` +
                    `${lineBreakDouble}**Mobile-Expensify PRs:**` +
                    `${lineBreak}${openCheckbox}${baseMobileExpensifyPRList.at(0)}` +
                    `${lineBreak}${openCheckbox}${baseMobileExpensifyPRList.at(1)}` +
                    `${lineBreak}${openCheckbox}${baseMobileExpensifyPRList.at(2)}` +
                    `${lineBreak}${openCheckbox}https://github.com/${CONST.GITHUB_OWNER}/${CONST.MOBILE_EXPENSIFY_REPO}/pull/23` +
                    `${lineBreak}${openCheckbox}https://github.com/${CONST.GITHUB_OWNER}/${CONST.MOBILE_EXPENSIFY_REPO}/pull/24` +
                    `${lineBreakDouble}${deployBlockerHeader}` +
                    `${lineBreak}${openCheckbox}${issueURL(6)}` +
                    `${lineBreak}${openCheckbox}${issueURL(9)}` +
                    `${lineBreak}${closedCheckbox}${issueURL(10)}` +
                    `${lineBreak}${openCheckbox}${issueURL(11)}` +
                    `${lineBreak}${openCheckbox}${issueURL(12)}` +
                    `${lineBreakDouble}${buildChronologicalSection([...baseNewPullRequests, ...newPullRequests], [20, 21, 22, 23, 24])}` +
                    `${lineBreak}${deployerVerificationsHeader}` +
                    `${lineBreak}${openCheckbox}${sentryVerificationCurrentRelease('1.0.2-2')}` +
                    `${lineBreak}${openCheckbox}${sentryVerificationPreviousRelease('1.0.1-0')}` +
                    `${lineBreak}${openCheckbox}${ghVerification}` +
                    `${lineBreak}${ccApplauseLeads}`,
            });
            expect(result).toStrictEqual(
                createMock<IssuesCreateResponse>({
                    html_url: `https://github.com/${process.env.GITHUB_REPOSITORY}/issues/${openDeployChecklistBefore.number}`,
                }),
            );
        });

        test('without NPM_VERSION input, just a new deploy blocker', async () => {
            vol.reset();
            vol.fromJSON({
                [PATH_TO_PACKAGE_JSON]: JSON.stringify({version: '1.0.2-1'}),
            });
            // cspell:disable-next-line
            mockGetMergedPRsDeployedBetween.mockImplementation(async (fromRef, toRef, repositoryName) => {
                if (fromRef === '1.0.1-0-staging' && toRef === '1.0.2-1-staging') {
                    if (repositoryName === CONST.MOBILE_EXPENSIFY_REPO) {
                        return toMergedPRs([20, 21, 22]); // Mobile-Expensify PRs
                    }
                    return toMergedPRs(baseNewPullRequests);
                }
                return {mergedPRs: [], submoduleUpdates: []};
            });
            mockDeployChecklistIssuesByLabel({
                [CONST.LABELS.STAGING_DEPLOY]: [openDeployChecklistBefore, closedDeployChecklist],
                [CONST.LABELS.DEPLOY_BLOCKER]: [
                    // Suppose the first deploy blocker is demoted, it should not be removed from the checklist and instead just be checked off
                    ...currentDeployBlockers.slice(1),
                    {
                        html_url: `https://github.com/${process.env.GITHUB_REPOSITORY}/issues/11`, // New
                        number: 11,
                        state: 'open',
                        labels: [LABELS.DEPLOY_BLOCKER_CASH],
                    },
                    {
                        html_url: `https://github.com/${process.env.GITHUB_REPOSITORY}/issues/12`, // New
                        number: 12,
                        state: 'open',
                        labels: [LABELS.DEPLOY_BLOCKER_CASH],
                    },
                ],
            });

            const result = await run();
            expect(mockUpdateIssue).toHaveBeenCalledWith({
                owner: CONST.GITHUB_OWNER,
                repo: CONST.APP_REPO,
                issue_number: openDeployChecklistBefore.number,

                body:
                    `${baseExpectedOutput('1.0.2-1')}` +
                    `${openCheckbox}${basePRList.at(5)}` +
                    `${lineBreak}${closedCheckbox}${basePRList.at(6)}` +
                    `${lineBreak}${openCheckbox}${basePRList.at(7)}` +
                    `${lineBreakDouble}**Mobile-Expensify PRs:**` +
                    `${lineBreak}${openCheckbox}${baseMobileExpensifyPRList.at(0)}` +
                    `${lineBreak}${openCheckbox}${baseMobileExpensifyPRList.at(1)}` +
                    `${lineBreak}${openCheckbox}${baseMobileExpensifyPRList.at(2)}` +
                    `${lineBreakDouble}${deployBlockerHeader}` +
                    `${lineBreak}${closedCheckbox}${issueURL(6)}` +
                    `${lineBreak}${openCheckbox}${issueURL(9)}` +
                    `${lineBreak}${closedCheckbox}${issueURL(10)}` +
                    `${lineBreak}${openCheckbox}${issueURL(11)}` +
                    `${lineBreak}${openCheckbox}${issueURL(12)}` +
                    `${lineBreakDouble}${buildChronologicalSection(baseNewPullRequests, [20, 21, 22])}` +
                    `${lineBreak}${deployerVerificationsHeader}` +
                    `${lineBreak}${closedCheckbox}${sentryVerificationCurrentRelease('1.0.2-1')}` +
                    `${lineBreak}${closedCheckbox}${sentryVerificationPreviousRelease('1.0.1-0')}` +
                    `${lineBreak}${closedCheckbox}${ghVerification}` +
                    `${lineBreak}${ccApplauseLeads}`,
            });
            expect(result).toStrictEqual(
                createMock<IssuesCreateResponse>({
                    html_url: `https://github.com/${process.env.GITHUB_REPOSITORY}/issues/${openDeployChecklistBefore.number}`,
                }),
            );
        });

        test('without Mobile-Expensify PRs, just app PRs and deploy blockers', async () => {
            vol.reset();
            vol.fromJSON({
                [PATH_TO_PACKAGE_JSON]: JSON.stringify({version: '1.0.2-1'}),
            });

            // Mock: No Mobile-Expensify PRs found for this release
            mockGetMergedPRsDeployedBetween.mockImplementation(async (fromRef, toRef, repositoryName) => {
                if (fromRef === '1.0.1-0-staging' && toRef === '1.0.2-1-staging') {
                    if (repositoryName === CONST.MOBILE_EXPENSIFY_REPO) {
                        return {mergedPRs: [], submoduleUpdates: []}; // No Mobile-Expensify PRs
                    }
                    return toMergedPRs(baseNewPullRequests);
                }
                return {mergedPRs: [], submoduleUpdates: []};
            });
            mockDeployChecklistIssuesByLabel({
                [CONST.LABELS.STAGING_DEPLOY]: [openDeployChecklistBefore, closedDeployChecklist],
                [CONST.LABELS.DEPLOY_BLOCKER]: currentDeployBlockers,
            });

            const result = await run();
            expect(mockUpdateIssue).toHaveBeenCalledWith({
                owner: CONST.GITHUB_OWNER,
                repo: CONST.APP_REPO,
                issue_number: openDeployChecklistBefore.number,

                body:
                    `${baseExpectedOutput('1.0.2-1', false)}` +
                    `${openCheckbox}${basePRList.at(5)}` +
                    `${lineBreak}${closedCheckbox}${basePRList.at(6)}` +
                    `${lineBreak}${openCheckbox}${basePRList.at(7)}` +
                    // Note: No Mobile-Expensify PRs section since there are none
                    `${lineBreakDouble}${deployBlockerHeader}` +
                    `${lineBreak}${openCheckbox}${issueURL(6)}` +
                    `${lineBreak}${openCheckbox}${issueURL(9)}` +
                    `${lineBreak}${closedCheckbox}${issueURL(10)}` +
                    `${lineBreakDouble}${buildChronologicalSection(baseNewPullRequests)}` +
                    `${lineBreak}${deployerVerificationsHeader}` +
                    `${lineBreak}${closedCheckbox}${sentryVerificationCurrentRelease('1.0.2-1')}` +
                    `${lineBreak}${closedCheckbox}${sentryVerificationPreviousRelease('1.0.1-0')}` +
                    `${lineBreak}${closedCheckbox}${ghVerification}` +
                    `${lineBreak}${ccApplauseLeads}`,
            });
            expect(result).toStrictEqual(
                createMock<IssuesCreateResponse>({
                    html_url: `https://github.com/${process.env.GITHUB_REPOSITORY}/issues/${openDeployChecklistBefore.number}`,
                }),
            );
        });
    });

    describe('cherry-pick filtering', () => {
        test('filters out PRs that were already included in previous checklist', async () => {
            vol.reset();
            vol.fromJSON({
                [PATH_TO_PACKAGE_JSON]: JSON.stringify({version: '1.0.3-0'}),
            });

            mockGetInput.mockImplementation((arg) => (arg === 'GITHUB_TOKEN' ? 'fake_token' : ''));
            // cspell:disable-next-line
            mockGetMergedPRsDeployedBetween.mockImplementation(async (fromRef, toRef, repositoryName) => {
                if (fromRef === '1.0.2-1-staging' && toRef === '1.0.3-0-staging') {
                    if (repositoryName === CONST.MOBILE_EXPENSIFY_REPO) {
                        return toMergedPRs([20, 22, 24, 25]); // Mobile-Expensify PRs
                    }
                    return toMergedPRs([6, 8, 10, 11]); // App PRs
                }
                return {mergedPRs: [], submoduleUpdates: []};
            });

            // Mock previous checklist containing PRs 6,8
            const mockGetDeployChecklistData = jest.spyOn(DeployChecklistUtils, 'getDeployChecklistData');
            mockGetDeployChecklistData.mockImplementation(() => ({
                title: 'Previous Checklist',
                url: `https://github.com/${process.env.GITHUB_REPOSITORY}/issues/29`,
                number: 29,
                labels: [LABELS.STAGING_DEPLOY_CASH],
                PRList: [
                    {url: `https://github.com/${process.env.GITHUB_REPOSITORY}/pull/6`, number: 6, isChecked: true},
                    {url: `https://github.com/${process.env.GITHUB_REPOSITORY}/pull/8`, number: 8, isChecked: true},
                ],
                PRListMobileExpensify: [
                    {url: `https://github.com/${CONST.GITHUB_OWNER}/${CONST.MOBILE_EXPENSIFY_REPO}/pull/20`, number: 20, isChecked: true},
                    {url: `https://github.com/${CONST.GITHUB_OWNER}/${CONST.MOBILE_EXPENSIFY_REPO}/pull/22`, number: 22, isChecked: true},
                ],
                deployBlockers: [],
                internalQAPRList: [],
                isTimingDashboardChecked: true,
                isSentryChecked: true,
                isGHStatusChecked: true,
                version: '1.0.2-1',
                tag: '1.0.2-1-staging',
            }));

            // Mock list of issues to return a closed previous checklist
            mockDeployChecklistIssuesByLabel({
                [CONST.LABELS.STAGING_DEPLOY]: [
                    {
                        number: 29,
                        state: 'closed',
                        labels: [LABELS.STAGING_DEPLOY_CASH],
                    },
                ],
            });

            const result = await run();
            expect(result).toStrictEqual(
                createMock<IssuesCreateResponse>({
                    html_url: `https://github.com/${process.env.GITHUB_REPOSITORY}/issues/29`,
                }),
            );
            const createCall = mockCreateIssue.mock.lastCall;
            if (!createCall || !createCall[0]) {
                throw new Error('Expected issues.create to receive a request payload.');
            }
            const createPayload = createCall[0];

            // Verify that only new PRs (10, 11) are included, not the previously included ones (6, 8)
            expect(createPayload.body).toContain('https://github.com/Expensify/App/pull/10');
            expect(createPayload.body).toContain('https://github.com/Expensify/App/pull/11');
            expect(createPayload.body).not.toContain('https://github.com/Expensify/App/pull/6');
            expect(createPayload.body).not.toContain('https://github.com/Expensify/App/pull/8');

            mockGetDeployChecklistData.mockRestore();
        });

        test('filters out PRs when no Mobile-Expensify PRs exist', async () => {
            vol.reset();
            vol.fromJSON({
                [PATH_TO_PACKAGE_JSON]: JSON.stringify({version: '1.0.3-0'}),
            });

            mockGetInput.mockImplementation((arg) => (arg === 'GITHUB_TOKEN' ? 'fake_token' : ''));
            // Mock: no Mobile-Expensify PRs found
            mockGetMergedPRsDeployedBetween.mockImplementation(async (fromRef, toRef, repositoryName) => {
                if (fromRef === '1.0.2-1-staging' && toRef === '1.0.3-0-staging') {
                    if (repositoryName === CONST.MOBILE_EXPENSIFY_REPO) {
                        return {mergedPRs: [], submoduleUpdates: []}; // No Mobile-Expensify PRs
                    }
                    return toMergedPRs([6, 8, 10, 11]); // App PRs
                }
                return {mergedPRs: [], submoduleUpdates: []};
            });

            // Mock previous checklist containing PRs 6,8 but no Mobile-Expensify PRs
            const mockGetDeployChecklistData = jest.spyOn(DeployChecklistUtils, 'getDeployChecklistData');
            mockGetDeployChecklistData.mockImplementation(() => ({
                title: 'Previous Checklist',
                url: `https://github.com/${process.env.GITHUB_REPOSITORY}/issues/29`,
                number: 29,
                labels: [LABELS.STAGING_DEPLOY_CASH],
                PRList: [
                    {url: `https://github.com/${process.env.GITHUB_REPOSITORY}/pull/6`, number: 6, isChecked: true},
                    {url: `https://github.com/${process.env.GITHUB_REPOSITORY}/pull/8`, number: 8, isChecked: true},
                ],
                PRListMobileExpensify: [], // No Mobile-Expensify PRs in previous checklist
                deployBlockers: [],
                internalQAPRList: [],
                isTimingDashboardChecked: true,
                isSentryChecked: true,
                isGHStatusChecked: true,
                tag: '1.0.2-1-staging',
                version: '1.0.2-1',
            }));

            mockDeployChecklistIssuesByLabel({
                [CONST.LABELS.STAGING_DEPLOY]: [
                    {
                        number: 29,
                        state: 'closed',
                        labels: [LABELS.STAGING_DEPLOY_CASH],
                    },
                ],
            });

            const result = await run();
            expect(result).toStrictEqual(
                createMock<IssuesCreateResponse>({
                    html_url: `https://github.com/${process.env.GITHUB_REPOSITORY}/issues/29`,
                }),
            );
            const createCall = mockCreateIssue.mock.lastCall;
            if (!createCall || !createCall[0]) {
                throw new Error('Expected issues.create to receive a request payload.');
            }
            const createPayload = createCall[0];

            // Verify that only new PRs (10, 11) are included, not the previously included ones (6, 8)
            expect(createPayload.body).toContain('https://github.com/Expensify/App/pull/10');
            expect(createPayload.body).toContain('https://github.com/Expensify/App/pull/11');
            expect(createPayload.body).not.toContain('https://github.com/Expensify/App/pull/6');
            expect(createPayload.body).not.toContain('https://github.com/Expensify/App/pull/8');

            // Verify no Mobile-Expensify PRs section exists
            expect(createPayload.body).not.toContain('**Mobile-Expensify PRs:**');
            expect(createPayload.body).not.toContain('Mobile-Expensify/pull/');

            mockGetDeployChecklistData.mockRestore();
        });
    });

    describe('chronological section with submodule updates', () => {
        test('interleaves submodule markers with PRs, groups Mobile-Expensify PRs, and renders build links', async () => {
            vol.reset();
            vol.fromJSON({
                [PATH_TO_PACKAGE_JSON]: JSON.stringify({version: '1.0.2-1'}),
            });

            const workflowRunURL = 'https://github.com/Expensify/App/actions/runs/12345';

            mockGetMergedPRsDeployedBetween.mockImplementation(async (fromRef, toRef, repositoryName) => {
                if (fromRef === '1.0.1-0-staging' && toRef === '1.0.2-1-staging') {
                    if (repositoryName === CONST.MOBILE_EXPENSIFY_REPO) {
                        return {
                            mergedPRs: [
                                {prNumber: 20, date: '2024-01-01T12:00:00Z'},
                                {prNumber: 21, date: '2024-01-02T12:00:00Z'},
                                {prNumber: 22, date: '2024-01-03T12:00:00Z'},
                            ],
                            submoduleUpdates: [],
                        };
                    }
                    return {
                        mergedPRs: [
                            {prNumber: 6, date: '2024-01-01T00:00:00Z'},
                            {prNumber: 7, date: '2024-01-03T00:00:00Z'},
                            {prNumber: 8, date: '2024-01-05T00:00:00Z'},
                        ],
                        submoduleUpdates: [
                            {version: '9.3.21-0', date: '2024-01-02T00:00:00Z', commit: 'abc1234567890'},
                            {version: '9f18fca', date: '2024-01-04T00:00:00Z', commit: 'def4567890123'},
                        ],
                    };
                }
                return {mergedPRs: [], submoduleUpdates: []};
            });

            mockGetWorkflowRunURLForCommit.mockImplementation(async (commit: string) => {
                if (commit === 'abc1234567890') {
                    return workflowRunURL;
                }
                return undefined;
            });

            mockDeployChecklistIssuesByLabel({
                [CONST.LABELS.STAGING_DEPLOY]: [closedDeployChecklist],
            });

            const result = await run();
            expect(result).toStrictEqual(
                createMock<IssuesCreateResponse>({
                    html_url: `https://github.com/${process.env.GITHUB_REPOSITORY}/issues/29`,
                }),
            );
            const createCall = mockCreateIssue.mock.lastCall;
            if (!createCall || !createCall[0]) {
                throw new Error('Expected issues.create to receive a request payload.');
            }
            const body = createCall[0].body;

            const expectedChronologicalSection = buildChronologicalSection([
                {type: 'pr', prNumber: 6},
                {type: 'submodule', version: '9.3.21-0', buildLink: workflowRunURL, mobileExpensifyPRs: [20]},
                {type: 'pr', prNumber: 7},
                {type: 'submodule', version: '9f18fca', commit: 'def4567890123', mobileExpensifyPRs: [21, 22]},
                {type: 'pr', prNumber: 8},
            ]);
            expect(body).toContain(expectedChronologicalSection);
        });

        test('Mobile-Expensify PRs after the last submodule update are listed as pending at the bottom', async () => {
            vol.reset();
            vol.fromJSON({
                [PATH_TO_PACKAGE_JSON]: JSON.stringify({version: '1.0.2-1'}),
            });

            mockGetWorkflowRunURLForCommit.mockResolvedValue(undefined);
            mockGetMergedPRsDeployedBetween.mockImplementation(async (fromRef, toRef, repositoryName) => {
                if (fromRef === '1.0.1-0-staging' && toRef === '1.0.2-1-staging') {
                    if (repositoryName === CONST.MOBILE_EXPENSIFY_REPO) {
                        return {
                            mergedPRs: [
                                {prNumber: 30, date: '2024-01-05T00:00:00Z'},
                                {prNumber: 31, date: '2024-01-06T00:00:00Z'},
                            ],
                            submoduleUpdates: [],
                        };
                    }
                    return {
                        mergedPRs: [{prNumber: 6, date: '2024-01-01T00:00:00Z'}],
                        submoduleUpdates: [{version: '9.3.21-0', date: '2024-01-02T00:00:00Z', commit: 'abc1234567890'}],
                    };
                }
                return {mergedPRs: [], submoduleUpdates: []};
            });

            mockDeployChecklistIssuesByLabel({
                [CONST.LABELS.STAGING_DEPLOY]: [closedDeployChecklist],
            });

            const result = await run();
            expect(result).toStrictEqual(
                createMock<IssuesCreateResponse>({
                    html_url: `https://github.com/${process.env.GITHUB_REPOSITORY}/issues/29`,
                }),
            );
            const createCall = mockCreateIssue.mock.lastCall;
            if (!createCall || !createCall[0]) {
                throw new Error('Expected issues.create to receive a request payload.');
            }
            const body = createCall[0].body;

            const expectedChronologicalSection = buildChronologicalSection(
                [
                    {type: 'pr', prNumber: 6},
                    {type: 'submodule', version: '9.3.21-0', commit: 'abc1234567890'},
                ],
                [30, 31],
            );
            expect(body).toContain(expectedChronologicalSection);
        });

        test('update existing checklist with submodule interleaving preserves verified state', async () => {
            vol.reset();
            vol.fromJSON({
                [PATH_TO_PACKAGE_JSON]: JSON.stringify({version: '1.0.2-2'}),
            });

            const workflowRunURL = 'https://github.com/Expensify/App/actions/runs/99999';

            mockGetMergedPRsDeployedBetween.mockImplementation(async (fromRef, toRef, repositoryName) => {
                if (fromRef === '1.0.1-0-staging' && toRef === '1.0.2-2-staging') {
                    if (repositoryName === CONST.MOBILE_EXPENSIFY_REPO) {
                        return {
                            mergedPRs: [
                                {prNumber: 20, date: '2024-01-01T12:00:00Z'},
                                {prNumber: 21, date: '2024-01-03T12:00:00Z'},
                            ],
                            submoduleUpdates: [],
                        };
                    }
                    return {
                        mergedPRs: [
                            {prNumber: 6, date: '2024-01-01T00:00:00Z'},
                            {prNumber: 7, date: '2024-01-03T00:00:00Z'},
                            {prNumber: 8, date: '2024-01-05T00:00:00Z'},
                        ],
                        submoduleUpdates: [{version: '9.3.21-0', date: '2024-01-02T00:00:00Z', commit: 'abc1234567890'}],
                    };
                }
                return {mergedPRs: [], submoduleUpdates: []};
            });

            mockGetWorkflowRunURLForCommit.mockImplementation(async () => workflowRunURL);

            const openDeployChecklistWithSubmodule = {
                url: `https://api.github.com/repos/${process.env.GITHUB_REPOSITORY}/issues/29`,
                title: 'Test Deploy Checklist',
                number: 29,
                labels: [LABELS.STAGING_DEPLOY_CASH],
                body:
                    `${baseExpectedOutput()}` +
                    `${openCheckbox}${basePRList.at(5)}` +
                    `${lineBreak}${closedCheckbox}${basePRList.at(6)}` +
                    `${lineBreak}${openCheckbox}${basePRList.at(7)}${lineBreak}` +
                    `${lineBreakDouble}${deployerVerificationsHeader}` +
                    `${lineBreak}${closedCheckbox}${sentryVerificationCurrentRelease('1.0.2-1')}` +
                    `${lineBreak}${closedCheckbox}${sentryVerificationPreviousRelease('1.0.1-0')}` +
                    `${lineBreak}${closedCheckbox}${ghVerification}` +
                    `${lineBreakDouble}${ccApplauseLeads}`,
                state: 'open',
            };

            mockDeployChecklistIssuesByLabel({
                [CONST.LABELS.STAGING_DEPLOY]: [openDeployChecklistWithSubmodule, closedDeployChecklist],
                [CONST.LABELS.DEPLOY_BLOCKER]: [],
            });

            const result = await run();
            expect(result).toStrictEqual(
                createMock<IssuesCreateResponse>({
                    html_url: `https://github.com/${process.env.GITHUB_REPOSITORY}/issues/29`,
                }),
            );
            const updateCall = mockUpdateIssue.mock.lastCall;
            if (!updateCall || !updateCall[0]) {
                throw new Error('Expected issues.update to receive a request payload.');
            }
            const updatePayload = updateCall[0];
            const body = updatePayload.body;

            // Verify the chronological section contains submodule interleaving.
            // Mobile-Expensify PR 21 (Jan 3 12:00) is after the only submodule bump (Jan 2), so it's pending.
            const expectedChronologicalSection = buildChronologicalSection(
                [
                    {type: 'pr', prNumber: 6},
                    {type: 'submodule', version: '9.3.21-0', buildLink: workflowRunURL, mobileExpensifyPRs: [20]},
                    {type: 'pr', prNumber: 7},
                    {type: 'pr', prNumber: 8},
                ],
                [21],
            );
            expect(body).toContain(expectedChronologicalSection);

            // Verify the existing verified state is preserved (PR 7 was verified in previous checklist)
            expect(body).toContain(`${closedCheckbox}${basePRList.at(6)}`);

            // Verify this is an update (not a create) by checking the issue_number
            expect(updatePayload.issue_number).toBe(29);
        });

        test('each Mobile-Expensify PR appears under exactly one submodule update, not duplicated across multiple', async () => {
            vol.reset();
            vol.fromJSON({
                [PATH_TO_PACKAGE_JSON]: JSON.stringify({version: '1.0.2-1'}),
            });

            mockGetWorkflowRunURLForCommit.mockResolvedValue(undefined);

            // Simulate many submodule updates with only 2 Mobile-Expensify PRs merged between them.
            // Mobile-Expensify PR #20 merged at 13:45 → should match submodule 9.3.21-2 (14:00), the first with date >= 13:45
            // Mobile-Expensify PR #21 merged at 15:30 → should match submodule 9.3.21-4 (16:00), the first with date >= 15:30
            // All other submodule updates should have NO Mobile-Expensify PRs underneath.
            mockGetMergedPRsDeployedBetween.mockImplementation(async (fromRef, toRef, repositoryName) => {
                if (fromRef === '1.0.1-0-staging' && toRef === '1.0.2-1-staging') {
                    if (repositoryName === CONST.MOBILE_EXPENSIFY_REPO) {
                        return {
                            mergedPRs: [
                                {prNumber: 20, date: '2024-01-01T13:45:00Z'},
                                {prNumber: 21, date: '2024-01-01T15:30:00Z'},
                            ],
                            submoduleUpdates: [],
                        };
                    }
                    return {
                        mergedPRs: [
                            {prNumber: 6, date: '2024-01-01T10:00:00Z'},
                            {prNumber: 7, date: '2024-01-01T17:00:00Z'},
                        ],
                        // cspell:disable
                        submoduleUpdates: [
                            {version: '9.3.21-0', date: '2024-01-01T11:00:00Z', commit: 'aabbccddee'},
                            {version: '9.3.21-1', date: '2024-01-01T12:00:00Z', commit: 'bbccddeeaa'},
                            {version: '9.3.21-2', date: '2024-01-01T14:00:00Z', commit: 'ccddeeffbb'},
                            {version: '9.3.21-3', date: '2024-01-01T15:00:00Z', commit: 'ddeeffaacc'},
                            {version: '9.3.21-4', date: '2024-01-01T16:00:00Z', commit: 'eeffaabbdd'},
                            {version: '9.3.21-5', date: '2024-01-01T18:00:00Z', commit: 'ffaabbccee'},
                        ],
                        // cspell:enable
                    };
                }
                return {mergedPRs: [], submoduleUpdates: []};
            });

            mockDeployChecklistIssuesByLabel({
                [CONST.LABELS.STAGING_DEPLOY]: [closedDeployChecklist],
            });

            const result = await run();
            expect(result).toStrictEqual(
                createMock<IssuesCreateResponse>({
                    html_url: `https://github.com/${process.env.GITHUB_REPOSITORY}/issues/29`,
                }),
            );
            const createCall = mockCreateIssue.mock.lastCall;
            if (!createCall || !createCall[0]) {
                throw new Error('Expected issues.create to receive a request payload.');
            }
            const body = createCall[0].body;
            if (body === undefined) {
                throw new Error('Expected issues.create to receive a request body.');
            }

            // Mobile-Expensify PR #20 should ONLY appear under 9.3.21-2, and PR #21 ONLY under 9.3.21-4
            // cspell:disable
            const expectedChronologicalSection = buildChronologicalSection([
                {type: 'pr', prNumber: 6},
                {type: 'submodule', version: '9.3.21-0', commit: 'aabbccddee'},
                {type: 'submodule', version: '9.3.21-1', commit: 'bbccddeeaa'},
                {type: 'submodule', version: '9.3.21-2', commit: 'ccddeeffbb', mobileExpensifyPRs: [20]},
                {type: 'submodule', version: '9.3.21-3', commit: 'ddeeffaacc'},
                {type: 'submodule', version: '9.3.21-4', commit: 'eeffaabbdd', mobileExpensifyPRs: [21]},
                {type: 'pr', prNumber: 7},
                {type: 'submodule', version: '9.3.21-5', commit: 'ffaabbccee'},
            ]);
            // cspell:enable
            expect(body).toContain(expectedChronologicalSection);

            // Verify no duplication: each Mobile-Expensify PR URL should appear exactly once in the chronological section
            const chronologicalMatch = body.match(/<details>[\s\S]*?<\/details>/);
            expect(chronologicalMatch).not.toBeNull();
            const chronologicalContent = chronologicalMatch?.[0] ?? '';
            expect(chronologicalContent.match(/Mobile-Expensify\/pull\/20/g)).toHaveLength(1);
            expect(chronologicalContent.match(/Mobile-Expensify\/pull\/21/g)).toHaveLength(1);
        });

        test('chronological section without submodule updates shows only PRs', async () => {
            vol.reset();
            vol.fromJSON({
                [PATH_TO_PACKAGE_JSON]: JSON.stringify({version: '1.0.2-1'}),
            });

            mockGetMergedPRsDeployedBetween.mockImplementation(async (fromRef, toRef, repositoryName) => {
                if (fromRef === '1.0.1-0-staging' && toRef === '1.0.2-1-staging') {
                    if (repositoryName === CONST.MOBILE_EXPENSIFY_REPO) {
                        return {mergedPRs: [], submoduleUpdates: []};
                    }
                    return {
                        mergedPRs: [
                            {prNumber: 6, date: '2024-01-01T00:00:00Z'},
                            {prNumber: 7, date: '2024-01-02T00:00:00Z'},
                        ],
                        submoduleUpdates: [],
                    };
                }
                return {mergedPRs: [], submoduleUpdates: []};
            });

            mockDeployChecklistIssuesByLabel({
                [CONST.LABELS.STAGING_DEPLOY]: [closedDeployChecklist],
            });

            const result = await run();
            expect(result).toStrictEqual(
                createMock<IssuesCreateResponse>({
                    html_url: `https://github.com/${process.env.GITHUB_REPOSITORY}/issues/29`,
                }),
            );
            const createCall = mockCreateIssue.mock.lastCall;
            if (!createCall || !createCall[0]) {
                throw new Error('Expected issues.create to receive a request payload.');
            }
            const body = createCall[0].body;

            const expectedChronologicalSection = buildChronologicalSection([6, 7]);
            expect(body).toContain(expectedChronologicalSection);
            expect(body).not.toContain('submodule update');
            expect(body).not.toContain('Adhoc Build');
        });
    });
});
