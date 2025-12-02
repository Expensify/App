/**
 * @jest-environment node
 */

/* eslint-disable @typescript-eslint/naming-convention */
import * as core from '@actions/core';
import {RequestError} from '@octokit/request-error';
import type {Writable} from 'type-fest';
import CONST from '@github/libs/CONST';
import type {InternalOctokit, ListForRepoMethod} from '@github/libs/GithubUtils';
import GithubUtils from '@github/libs/GithubUtils';

const mockGetInput = jest.fn();
const mockListIssues = jest.fn();

type Label = {
    id: number;
    number?: number;
    isVerified?: boolean;
    node_id: string;
    url: string;
    name: string;
    color: string;
    default: boolean;
    description: string;
};

type Issue = {
    url: string;
    title: string;
    labels: Label[];
    body: string;
};

type ObjectMethodData<T> = {
    data: T;
};

type OctokitCreateIssue = InternalOctokit['rest']['issues']['create'];

const asMutable = <T>(value: T): Writable<T> => value as Writable<T>;

beforeAll(() => {
    // Mock core module
    asMutable(core).getInput = mockGetInput;

    // Mock octokit module
    const mockOctokit = {
        rest: {
            issues: {
                create: jest.fn().mockImplementation((arg: Parameters<OctokitCreateIssue>[0]) =>
                    Promise.resolve({
                        data: {
                            ...arg,
                            html_url: `https://github.com/${process.env.GITHUB_REPOSITORY}/issues/29`,
                        },
                    }),
                ),
                listForRepo: mockListIssues,
            },
        },
        paginate: jest.fn().mockImplementation(<T>(objectMethod: () => Promise<ObjectMethodData<T>>) => objectMethod().then(({data}) => data)),
    } as unknown as InternalOctokit;

    GithubUtils.internalOctokit = mockOctokit;
});

afterEach(() => {
    mockGetInput.mockClear();
    mockListIssues.mockClear();
});

describe('GithubUtils', () => {
    describe('getStagingDeployCash', () => {
        const baseIssue: Issue = {
            url: 'https://api.github.com/repos/Andrew-Test-Org/Public-Test-Repo/issues/29',
            title: 'Andrew Test Issue',
            labels: [
                {
                    id: 2783847782,
                    // cspell:disable-next-line
                    node_id: 'MDU6TGFiZWwyNzgzODQ3Nzgy',
                    url: 'https://api.github.com/repos/Andrew-Test-Org/Public-Test-Repo/labels/StagingDeployCash',
                    name: 'StagingDeployCash',
                    color: '6FC269',
                    default: false,
                    description: '',
                },
            ],
            // eslint-disable-next-line max-len
            body: `**Release Version:** \`1.0.1-47\`\r\n**Compare Changes:** https://github.com/${process.env.GITHUB_REPOSITORY}/compare/production...staging\r\n\r\n**This release contains changes from the following pull requests:**\r\n- [ ] https://github.com/${process.env.GITHUB_REPOSITORY}/pull/21\r\n- [x] https://github.com/${process.env.GITHUB_REPOSITORY}/pull/22\r\n- [ ] https://github.com/${process.env.GITHUB_REPOSITORY}/pull/23\r\n\r\n`,
        };
        const issueWithDeployBlockers = {...baseIssue};
        // eslint-disable-next-line max-len
        issueWithDeployBlockers.body += `\r\n**Deploy Blockers:**\r\n- [ ] https://github.com/${process.env.GITHUB_REPOSITORY}/issues/1\r\n- [x] https://github.com/${process.env.GITHUB_REPOSITORY}/issues/2\r\n- [ ] https://github.com/${process.env.GITHUB_REPOSITORY}/pull/1234\r\n`;

        const baseExpectedResponse: Partial<Awaited<ReturnType<typeof GithubUtils.getStagingDeployCash>>> = {
            PRList: [
                {
                    url: `https://github.com/${process.env.GITHUB_REPOSITORY}/pull/21`,
                    number: 21,
                    isVerified: false,
                },
                {
                    url: `https://github.com/${process.env.GITHUB_REPOSITORY}/pull/22`,
                    number: 22,
                    isVerified: true,
                },
                {
                    url: `https://github.com/${process.env.GITHUB_REPOSITORY}/pull/23`,
                    number: 23,
                    isVerified: false,
                },
            ],
            PRListMobileExpensify: [],
            labels: [
                {
                    color: '6FC269',
                    default: false,
                    description: '',
                    id: 2783847782,
                    name: 'StagingDeployCash',
                    // cspell:disable-next-line
                    node_id: 'MDU6TGFiZWwyNzgzODQ3Nzgy',
                    url: 'https://api.github.com/repos/Andrew-Test-Org/Public-Test-Repo/labels/StagingDeployCash',
                },
            ],
            version: '1.0.1-47',
            tag: '1.0.1-47-staging',
            title: 'Andrew Test Issue',
            url: 'https://api.github.com/repos/Andrew-Test-Org/Public-Test-Repo/issues/29',
            number: 29,
            deployBlockers: [],
            internalQAPRList: [],
            isFirebaseChecked: false,
            isGHStatusChecked: false,
        };
        const expectedResponseWithDeployBlockers = {...baseExpectedResponse};
        expectedResponseWithDeployBlockers.deployBlockers = [
            {
                url: `https://github.com/${process.env.GITHUB_REPOSITORY}/issues/1`,
                number: 1,
                isResolved: false,
            },
            {
                url: `https://github.com/${process.env.GITHUB_REPOSITORY}/issues/2`,
                number: 2,
                isResolved: true,
            },
            {
                url: `https://github.com/${process.env.GITHUB_REPOSITORY}/pull/1234`,
                number: 1234,
                isResolved: false,
            },
        ];

        test('Test finding an open issue with no PRs successfully', () => {
            const bareIssue: Issue = {
                ...baseIssue,
                // eslint-disable-next-line max-len
                body: `**Release Version:** \`1.0.1-47\`\r\n**Compare Changes:** https://github.com/${process.env.GITHUB_REPOSITORY}/compare/production...staging\r\n\r\ncc @Expensify/applauseleads\n`,
            };

            const bareExpectedResponse: Partial<Awaited<ReturnType<typeof GithubUtils.getStagingDeployCash>>> = {
                ...baseExpectedResponse,
                PRList: [],
                PRListMobileExpensify: [],
            };

            GithubUtils.octokit.issues.listForRepo = jest.fn().mockResolvedValue({data: [bareIssue]}) as unknown as ListForRepoMethod;
            return GithubUtils.getStagingDeployCash().then((data) => expect(data).toStrictEqual(bareExpectedResponse));
        });

        test('Test finding an open issue successfully', () => {
            GithubUtils.octokit.issues.listForRepo = jest.fn().mockResolvedValue({data: [baseIssue]}) as unknown as ListForRepoMethod;
            return GithubUtils.getStagingDeployCash().then((data) => expect(data).toStrictEqual(baseExpectedResponse));
        });

        test('Test finding an open issue successfully and parsing with deploy blockers', () => {
            GithubUtils.octokit.issues.listForRepo = jest.fn().mockResolvedValue({data: [issueWithDeployBlockers]}) as unknown as ListForRepoMethod;
            return GithubUtils.getStagingDeployCash().then((data) => expect(data).toStrictEqual(expectedResponseWithDeployBlockers));
        });

        test('Test finding an open issue successfully and parsing with blockers w/o carriage returns', () => {
            const modifiedIssueWithDeployBlockers = {...issueWithDeployBlockers};
            modifiedIssueWithDeployBlockers.body = modifiedIssueWithDeployBlockers.body.replaceAll('\r', '');

            GithubUtils.octokit.issues.listForRepo = jest.fn().mockResolvedValue({
                data: [modifiedIssueWithDeployBlockers],
            }) as unknown as ListForRepoMethod;
            return GithubUtils.getStagingDeployCash().then((data) => expect(data).toStrictEqual(expectedResponseWithDeployBlockers));
        });

        test('Test finding an open issue without a body', () => {
            const noBodyIssue = baseIssue;
            noBodyIssue.body = '';

            GithubUtils.octokit.issues.listForRepo = jest.fn().mockResolvedValue({data: [noBodyIssue]}) as unknown as ListForRepoMethod;
            return GithubUtils.getStagingDeployCash().catch((e) => expect(e).toEqual(new Error('Unable to find StagingDeployCash issue with correct data.')));
        });

        test('Test finding more than one issue', () => {
            GithubUtils.octokit.issues.listForRepo = jest.fn().mockResolvedValue({data: [{a: 1}, {b: 2}]}) as unknown as ListForRepoMethod;
            return GithubUtils.getStagingDeployCash().catch((e) => expect(e).toEqual(new Error('Found more than one StagingDeployCash issue.')));
        });

        test('Test finding no issues', () => {
            GithubUtils.octokit.issues.listForRepo = jest.fn().mockResolvedValue({data: []}) as unknown as ListForRepoMethod;
            return GithubUtils.getStagingDeployCash().catch((e) => expect(e).toEqual(new Error('Unable to find StagingDeployCash issue.')));
        });
    });

    describe('getPullRequestNumberFromURL', () => {
        describe('valid pull requests', () => {
            test.each([
                ['https://github.com/Expensify/Expensify/pull/156369', 156369],
                [`https://github.com/${process.env.GITHUB_REPOSITORY}/pull/1644`, 1644],
                ['https://github.com/Expensify/expensify-common/pull/346', 346],
                ['https://api.github.com/repos/Expensify/Expensify/pull/156369', 156369],
                [`https://api.github.com/repos/${process.env.GITHUB_REPOSITORY}/pull/1644`, 1644],
                ['https://api.github.com/repos/Expensify/expensify-common/pull/346', 346],
            ])('getPullRequestNumberFromURL("%s")', (input, expected) => {
                expect(GithubUtils.getPullRequestNumberFromURL(input)).toBe(expected);
            });
        });

        describe('invalid pull requests', () => {
            test.each([
                ['https://www.google.com/'],
                ['https://github.com/Expensify/Expensify/issues/156481'],
                ['https://docs.google.com/document/d/1mMFh-m1seOES48r3zNqcvfuTvr3qOAsY6n5rP4ejdXE/edit?ts=602420d2#'],
            ])('getPullRequestNumberFromURL("%s")', (input) => {
                expect(() => {
                    GithubUtils.getPullRequestNumberFromURL(input);
                }).toThrow(new Error(`Provided URL ${input} is not a Github Pull Request!`));
            });
        });
    });

    describe('getIssueNumberFromURL', () => {
        describe('valid issues', () => {
            test.each([
                ['https://github.com/Expensify/Expensify/issues/156369', 156369],
                [`https://github.com/${process.env.GITHUB_REPOSITORY}/issues/1644`, 1644],
                ['https://github.com/Expensify/expensify-common/issues/346', 346],
                ['https://api.github.com/repos/Expensify/Expensify/issues/156369', 156369],
                [`https://api.github.com/repos/${process.env.GITHUB_REPOSITORY}/issues/1644`, 1644],
                ['https://api.github.com/repos/Expensify/expensify-common/issues/346', 346],
            ])('getIssueNumberFromURL("%s")', (input, expected) => {
                expect(GithubUtils.getIssueNumberFromURL(input)).toBe(expected);
            });
        });

        describe('invalid issues', () => {
            test.each([
                ['https://www.google.com/'],
                ['https://github.com/Expensify/Expensify/pull/156481'],
                ['https://docs.google.com/document/d/1mMFh-m1seOES48r3zNqcvfuTvr3qOAsY6n5rP4ejdXE/edit?ts=602420d2#'],
            ])('getIssueNumberFromURL("%s")', (input) => {
                expect(() => {
                    GithubUtils.getIssueNumberFromURL(input);
                }).toThrow(new Error(`Provided URL ${input} is not a Github Issue!`));
            });
        });
    });

    describe('getIssueOrPullRequestNumberFromURL', () => {
        describe('valid issues and pull requests', () => {
            test.each([
                ['https://github.com/Expensify/Expensify/issues/156369', 156369],
                [`https://github.com/${process.env.GITHUB_REPOSITORY}/issues/1644`, 1644],
                ['https://github.com/Expensify/expensify-common/issues/346', 346],
                ['https://github.com/Expensify/Expensify/pull/156369', 156369],
                [`https://github.com/${process.env.GITHUB_REPOSITORY}/pull/1644`, 1644],
                ['https://github.com/Expensify/expensify-common/pull/346', 346],
                ['https://api.github.com/repos/Expensify/Expensify/issues/156369', 156369],
                [`https://api.github.com/repos/${process.env.GITHUB_REPOSITORY}/issues/1644`, 1644],
                ['https://api.github.com/repos/Expensify/expensify-common/issues/346', 346],
                ['https://api.github.com/repos/Expensify/Expensify/pull/156369', 156369],
                [`https://api.github.com/repos/${process.env.GITHUB_REPOSITORY}/pull/1644`, 1644],
                ['https://api.github.com/repos/Expensify/expensify-common/pull/346', 346],
            ])('getIssueOrPullRequestNumberFromURL("%s")', (input, expected) => {
                expect(GithubUtils.getIssueOrPullRequestNumberFromURL(input)).toBe(expected);
            });
        });

        describe('invalid issues/pull requests', () => {
            test.each([['https://www.google.com/'], ['https://docs.google.com/document/d/1mMFh-m1seOES48r3zNqcvfuTvr3qOAsY6n5rP4ejdXE/edit?ts=602420d2#']])(
                'getIssueOrPullRequestNumberFromURL("%s")',
                (input) => {
                    expect(() => {
                        GithubUtils.getIssueOrPullRequestNumberFromURL(input);
                    }).toThrow(new Error(`Provided URL ${input} is not a valid Github Issue or Pull Request!`));
                },
            );
        });
    });

    describe('generateStagingDeployCashBody', () => {
        const mockTags = [{name: '1.0.2-0'}, {name: '1.0.2-12'}];
        const mockPRs = [
            {
                number: 1,
                title: 'Test PR 1',
                html_url: `https://github.com/${process.env.GITHUB_REPOSITORY}/pull/1`,
                user: {login: 'username'},
                labels: [],
            },
            {
                number: 2,
                title: 'Test PR 2',
                html_url: `https://github.com/${process.env.GITHUB_REPOSITORY}/pull/2`,
                user: {login: 'username'},
                labels: [],
            },
            {
                number: 3,
                title: 'Test PR 3',
                html_url: `https://github.com/${process.env.GITHUB_REPOSITORY}/pull/3`,
                user: {login: 'username'},
                labels: [],
            },
            {
                number: 4,
                title: '[NO QA] Test No QA PR uppercase',
                html_url: `https://github.com/${process.env.GITHUB_REPOSITORY}/pull/4`,
                user: {login: 'username'},
                labels: [],
            },
            {
                number: 5,
                title: '[NoQa] Test No QA PR Title Case',
                html_url: `https://github.com/${process.env.GITHUB_REPOSITORY}/pull/5`,
                user: {login: 'username'},
                labels: [],
            },
            {
                number: 6,
                title: '[Internal QA] Another Test Internal QA PR',
                html_url: `https://github.com/${process.env.GITHUB_REPOSITORY}/pull/6`,
                user: {login: 'username'},
                labels: [
                    {
                        id: 1234,
                        node_id: 'MDU6TGFiZWwyMDgwNDU5NDY=',
                        url: `https://api.github.com/${process.env.GITHUB_REPOSITORY}/labels/InternalQA`,
                        name: 'InternalQA',
                        description: 'An Expensifier needs to test this.',
                        color: 'f29513',
                    },
                ],
                assignees: [],
            },
            {
                number: 7,
                title: '[Internal QA] Another Test Internal QA PR',
                html_url: `https://github.com/${process.env.GITHUB_REPOSITORY}/pull/7`,
                user: {login: 'username'},
                labels: [
                    {
                        id: 1234,
                        node_id: 'MDU6TGFiZWwyMDgwNDU5NDY=',
                        url: `https://api.github.com/${process.env.GITHUB_REPOSITORY}/labels/InternalQA`,
                        name: 'InternalQA',
                        description: 'An Expensifier needs to test this.',
                        color: 'f29513',
                    },
                ],
                assignees: [],
            },
        ];
        const mockInternalQaPR = {
            merged_by: {login: 'octocat'},
        };
        const mockGithub = jest.fn(() => ({
            getOctokit: () => ({
                rest: {
                    repos: {
                        listTags: jest.fn().mockResolvedValue({data: mockTags}),
                    },
                    pulls: {
                        list: jest.fn().mockResolvedValue({data: mockPRs}),
                        get: jest.fn().mockResolvedValue({data: mockInternalQaPR}),
                    },
                },
                paginate: jest.fn().mockImplementation(<T>(objectMethod: () => Promise<ObjectMethodData<T>>) => objectMethod().then(({data}) => data)),
            }),
        }));

        const octokit = mockGithub().getOctokit();
        const githubUtils = class extends GithubUtils {};
        githubUtils.internalOctokit = octokit as unknown as InternalOctokit;
        const tag = '1.0.2-12';
        const basePRList = [
            `https://github.com/${process.env.GITHUB_REPOSITORY}/pull/2`,
            `https://github.com/${process.env.GITHUB_REPOSITORY}/pull/3`,
            `https://github.com/${process.env.GITHUB_REPOSITORY}/pull/1`,
            `https://github.com/${process.env.GITHUB_REPOSITORY}/pull/3`, // This is an intentional duplicate for testing duplicates
            `https://github.com/${process.env.GITHUB_REPOSITORY}/pull/4`, // No QA
            `https://github.com/${process.env.GITHUB_REPOSITORY}/pull/5`, // No QA
        ];
        const PRListMobileExpensify = [
            `https://github.com/Expensify/Mobile-Expensify/pull/1`,
            `https://github.com/Expensify/Mobile-Expensify/pull/2`,
            `https://github.com/Expensify/Mobile-Expensify/pull/3`,
        ];
        const internalQAPRList = [
            `https://github.com/${process.env.GITHUB_REPOSITORY}/pull/6`, // Internal QA
            `https://github.com/${process.env.GITHUB_REPOSITORY}/pull/7`, // Internal QA
        ];

        const baseDeployBlockerList = [`https://github.com/${process.env.GITHUB_REPOSITORY}/pull/3`, `https://github.com/${process.env.GITHUB_REPOSITORY}/issues/4`];

        // eslint-disable-next-line max-len
        const baseExpectedOutput = `**Release Version:** \`${tag}\`\r\n**Compare Changes:** https://github.com/${process.env.GITHUB_REPOSITORY}/compare/production...staging\r\n\r\n**This release contains changes from the following pull requests:**\r\n`;
        const openCheckbox = '- [ ] ';
        const closedCheckbox = '- [x] ';
        const ccApplauseLeads = 'cc @Expensify/applauseleads\r\n';
        const deployBlockerHeader = '\r\n**Deploy Blockers:**';
        const internalQAHeader = '\r\n\r\n**Internal QA:**';
        const lineBreak = '\r\n';
        const lineBreakDouble = '\r\n\r\n';
        const assignOctocat = ' - @octocat';
        const deployerVerificationsHeader = '\r\n**Deployer verifications:**';
        // eslint-disable-next-line max-len
        const firebaseVerificationCurrentRelease =
            'I checked [Firebase Crashlytics](https://console.firebase.google.com/u/0/project/expensify-mobile-app/crashlytics/app/ios:com.expensify.expensifylite/issues?state=open&time=last-seven-days&types=crash&tag=all&sort=eventCount) for **this release version** and verified that this release does not introduce any new crashes. More detailed instructions on this verification can be found [here](https://stackoverflowteams.com/c/expensify/questions/15095/15096).';
        // eslint-disable-next-line max-len
        const firebaseVerificationPreviousRelease =
            'I checked [Firebase Crashlytics](https://console.firebase.google.com/u/0/project/expensify-mobile-app/crashlytics/app/android:org.me.mobiexpensifyg/issues?state=open&time=last-seven-days&types=crash&tag=all&sort=eventCount) for **the previous release version** and verified that the release did not introduce any new crashes. More detailed instructions on this verification can be found [here](https://stackoverflowteams.com/c/expensify/questions/15095/15096).';
        // eslint-disable-next-line max-len
        const ghVerification = 'I checked [GitHub Status](https://www.githubstatus.com/) and verified there is no reported incident with Actions.';

        // Valid output which will be reused in the deploy blocker tests
        const allVerifiedExpectedOutput =
            `${baseExpectedOutput}` +
            `${closedCheckbox}${basePRList.at(2)}` +
            `${lineBreak}${closedCheckbox}${basePRList.at(0)}` +
            `${lineBreak}${closedCheckbox}${basePRList.at(1)}` +
            `${lineBreak}${closedCheckbox}${basePRList.at(4)}` +
            `${lineBreak}${closedCheckbox}${basePRList.at(5)}` +
            `${lineBreak}`;

        test('Test no verified PRs', () => {
            githubUtils.generateStagingDeployCashBodyAndAssignees(tag, basePRList, PRListMobileExpensify).then((issue) => {
                if (typeof issue !== 'object') {
                    return;
                }
                const expectedOutputWithMobileExpensify = `**Release Version:** \`${tag}\`\r\n**Compare Changes:** https://github.com/${process.env.GITHUB_REPOSITORY}/compare/production...staging\r\n**Mobile-Expensify Changes:** https://github.com/Expensify/Mobile-Expensify/compare/production...staging\r\n\r\n**This release contains changes from the following pull requests:**\r\n`;
                expect(issue.issueBody).toBe(
                    `${expectedOutputWithMobileExpensify}` +
                        `${openCheckbox}${basePRList.at(2)}` +
                        `${lineBreak}${openCheckbox}${basePRList.at(0)}` +
                        `${lineBreak}${openCheckbox}${basePRList.at(1)}` +
                        `${lineBreak}${closedCheckbox}${basePRList.at(4)}` +
                        `${lineBreak}${closedCheckbox}${basePRList.at(5)}` +
                        `${lineBreak}${lineBreakDouble}**Mobile-Expensify PRs:**` +
                        `${lineBreak}${openCheckbox}${PRListMobileExpensify.at(0)}` +
                        `${lineBreak}${openCheckbox}${PRListMobileExpensify.at(1)}` +
                        `${lineBreak}${openCheckbox}${PRListMobileExpensify.at(2)}` +
                        `${lineBreakDouble}${deployerVerificationsHeader}` +
                        `${lineBreak}${openCheckbox}${firebaseVerificationCurrentRelease}` +
                        `${lineBreak}${openCheckbox}${firebaseVerificationPreviousRelease}` +
                        `${lineBreak}${openCheckbox}${ghVerification}` +
                        `${lineBreakDouble}${ccApplauseLeads}`,
                );
                expect(issue.issueAssignees).toEqual([]);
            });
        });

        test('Test Mobile-Expensify compare link with Mobile-Expensify PRs', () => {
            githubUtils.generateStagingDeployCashBodyAndAssignees(tag, basePRList, PRListMobileExpensify).then((issue) => {
                if (typeof issue !== 'object') {
                    return;
                }
                // Should include Mobile-Expensify compare link since we have Mobile-Expensify PRs
                expect(issue.issueBody).toContain('**Mobile-Expensify Changes:** https://github.com/Expensify/Mobile-Expensify/compare/production...staging');
                expect(issue.issueBody).toContain('**Mobile-Expensify PRs:**');
            });
        });

        test('Test no Mobile-Expensify compare link without Mobile-Expensify PRs', () => {
            githubUtils.generateStagingDeployCashBodyAndAssignees(tag, basePRList, []).then((issue) => {
                if (typeof issue !== 'object') {
                    return;
                }
                // Should NOT include Mobile-Expensify compare link since we don't have Mobile-Expensify PRs
                expect(issue.issueBody).not.toContain('**Mobile-Expensify Changes:**');
                expect(issue.issueBody).not.toContain('**Mobile-Expensify PRs:**'); // And should not have PRs section either
            });
        });

        test('Test some verified PRs', () => {
            githubUtils.generateStagingDeployCashBodyAndAssignees(tag, basePRList, [], [basePRList.at(0) ?? '']).then((issue) => {
                if (typeof issue !== 'object') {
                    return;
                }

                expect(issue.issueBody).toBe(
                    `${baseExpectedOutput}` +
                        `${openCheckbox}${basePRList.at(2)}` +
                        `${lineBreak}${closedCheckbox}${basePRList.at(0)}` +
                        `${lineBreak}${openCheckbox}${basePRList.at(1)}` +
                        `${lineBreak}${closedCheckbox}${basePRList.at(4)}` +
                        `${lineBreak}${closedCheckbox}${basePRList.at(5)}` +
                        `${lineBreakDouble}${deployerVerificationsHeader}` +
                        `${lineBreak}${openCheckbox}${firebaseVerificationCurrentRelease}` +
                        `${lineBreak}${openCheckbox}${firebaseVerificationPreviousRelease}` +
                        `${lineBreak}${openCheckbox}${ghVerification}` +
                        `${lineBreakDouble}${ccApplauseLeads}`,
                );
                expect(issue.issueAssignees).toEqual([]);
            });
        });

        test('Test all verified PRs', () => {
            githubUtils.generateStagingDeployCashBodyAndAssignees(tag, basePRList, [], basePRList).then((issue) => {
                if (typeof issue !== 'object') {
                    return;
                }

                expect(issue.issueBody).toBe(
                    `${allVerifiedExpectedOutput}` +
                        `${lineBreak}${deployerVerificationsHeader}` +
                        `${lineBreak}${openCheckbox}${firebaseVerificationCurrentRelease}` +
                        `${lineBreak}${openCheckbox}${firebaseVerificationPreviousRelease}` +
                        `${lineBreak}${openCheckbox}${ghVerification}` +
                        `${lineBreakDouble}${ccApplauseLeads}`,
                );
                expect(issue.issueAssignees).toEqual([]);
            });
        });

        test('Test no resolved deploy blockers', () => {
            githubUtils.generateStagingDeployCashBodyAndAssignees(tag, basePRList, [], basePRList, [], baseDeployBlockerList).then((issue) => {
                if (typeof issue !== 'object') {
                    return;
                }

                expect(issue.issueBody).toBe(
                    `${allVerifiedExpectedOutput}` +
                        `${lineBreak}${deployBlockerHeader}` +
                        `${lineBreak}${openCheckbox}${baseDeployBlockerList.at(0)}` +
                        `${lineBreak}${openCheckbox}${baseDeployBlockerList.at(1)}` +
                        `${lineBreakDouble}${deployerVerificationsHeader}` +
                        `${lineBreak}${openCheckbox}${firebaseVerificationCurrentRelease}` +
                        `${lineBreak}${openCheckbox}${firebaseVerificationPreviousRelease}` +
                        `${lineBreak}${openCheckbox}${ghVerification}${lineBreak}` +
                        `${lineBreak}${ccApplauseLeads}`,
                );
                expect(issue.issueAssignees).toEqual([]);
            });
        });

        test('Test some resolved deploy blockers', () => {
            githubUtils.generateStagingDeployCashBodyAndAssignees(tag, basePRList, [], basePRList, [], baseDeployBlockerList, [baseDeployBlockerList.at(0) ?? '']).then((issue) => {
                if (typeof issue !== 'object') {
                    return;
                }

                expect(issue.issueBody).toBe(
                    `${allVerifiedExpectedOutput}` +
                        `${lineBreak}${deployBlockerHeader}` +
                        `${lineBreak}${closedCheckbox}${baseDeployBlockerList.at(0)}` +
                        `${lineBreak}${openCheckbox}${baseDeployBlockerList.at(1)}` +
                        `${lineBreakDouble}${deployerVerificationsHeader}` +
                        `${lineBreak}${openCheckbox}${firebaseVerificationCurrentRelease}` +
                        `${lineBreak}${openCheckbox}${firebaseVerificationPreviousRelease}` +
                        `${lineBreak}${openCheckbox}${ghVerification}` +
                        `${lineBreakDouble}${ccApplauseLeads}`,
                );
                expect(issue.issueAssignees).toEqual([]);
            });
        });

        test('Test all resolved deploy blockers', () => {
            githubUtils.generateStagingDeployCashBodyAndAssignees(tag, basePRList, [], basePRList, [], baseDeployBlockerList, baseDeployBlockerList).then((issue) => {
                if (typeof issue !== 'object') {
                    return;
                }
                expect(issue.issueBody).toBe(
                    `${baseExpectedOutput}` +
                        `${closedCheckbox}${basePRList.at(2)}` +
                        `${lineBreak}${closedCheckbox}${basePRList.at(0)}` +
                        `${lineBreak}${closedCheckbox}${basePRList.at(1)}` +
                        `${lineBreak}${closedCheckbox}${basePRList.at(4)}` +
                        `${lineBreak}${closedCheckbox}${basePRList.at(5)}` +
                        `${lineBreakDouble}${deployBlockerHeader}` +
                        `${lineBreak}${closedCheckbox}${baseDeployBlockerList.at(0)}` +
                        `${lineBreak}${closedCheckbox}${baseDeployBlockerList.at(1)}` +
                        `${lineBreakDouble}${deployerVerificationsHeader}` +
                        `${lineBreak}${openCheckbox}${firebaseVerificationCurrentRelease}` +
                        `${lineBreak}${openCheckbox}${firebaseVerificationPreviousRelease}` +
                        `${lineBreak}${openCheckbox}${ghVerification}` +
                        `${lineBreakDouble}${ccApplauseLeads}`,
                );
                expect(issue.issueAssignees).toEqual([]);
            });
        });

        test('Test internalQA PRs', () => {
            githubUtils.generateStagingDeployCashBodyAndAssignees(tag, [...basePRList, ...internalQAPRList], PRListMobileExpensify).then((issue) => {
                if (typeof issue !== 'object') {
                    return;
                }

                const expectedOutputWithMobileExpensify = `**Release Version:** \`${tag}\`\r\n**Compare Changes:** https://github.com/${process.env.GITHUB_REPOSITORY}/compare/production...staging\r\n**Mobile-Expensify Changes:** https://github.com/Expensify/Mobile-Expensify/compare/production...staging\r\n\r\n**This release contains changes from the following pull requests:**\r\n`;
                expect(issue.issueBody).toBe(
                    `${expectedOutputWithMobileExpensify}` +
                        `${openCheckbox}${basePRList.at(2)}` +
                        `${lineBreak}${openCheckbox}${basePRList.at(0)}` +
                        `${lineBreak}${openCheckbox}${basePRList.at(1)}` +
                        `${lineBreak}${closedCheckbox}${basePRList.at(4)}` +
                        `${lineBreak}${closedCheckbox}${basePRList.at(5)}` +
                        `${lineBreak}${lineBreakDouble}**Mobile-Expensify PRs:**` +
                        `${lineBreak}${openCheckbox}${PRListMobileExpensify.at(0)}` +
                        `${lineBreak}${openCheckbox}${PRListMobileExpensify.at(1)}` +
                        `${lineBreak}${openCheckbox}${PRListMobileExpensify.at(2)}` +
                        `${lineBreak}${internalQAHeader}` +
                        `${lineBreak}${openCheckbox}${internalQAPRList.at(0)}${assignOctocat}` +
                        `${lineBreak}${openCheckbox}${internalQAPRList.at(1)}${assignOctocat}` +
                        `${lineBreakDouble}${deployerVerificationsHeader}` +
                        `${lineBreak}${openCheckbox}${firebaseVerificationCurrentRelease}` +
                        `${lineBreak}${openCheckbox}${firebaseVerificationPreviousRelease}` +
                        `${lineBreak}${openCheckbox}${ghVerification}` +
                        `${lineBreakDouble}${ccApplauseLeads}`,
                );
                expect(issue.issueAssignees).toEqual(['octocat']);
            });
        });

        test('Test some verified internalQA PRs', () => {
            githubUtils.generateStagingDeployCashBodyAndAssignees(tag, [...basePRList, ...internalQAPRList], [], [], [], [], [], [internalQAPRList.at(0) ?? '']).then((issue) => {
                if (typeof issue !== 'object') {
                    return;
                }

                expect(issue.issueBody).toBe(
                    `${baseExpectedOutput}` +
                        `${openCheckbox}${basePRList.at(2)}` +
                        `${lineBreak}${openCheckbox}${basePRList.at(0)}` +
                        `${lineBreak}${openCheckbox}${basePRList.at(1)}` +
                        `${lineBreak}${closedCheckbox}${basePRList.at(4)}` +
                        `${lineBreak}${closedCheckbox}${basePRList.at(5)}` +
                        `${lineBreak}${internalQAHeader}` +
                        `${lineBreak}${closedCheckbox}${internalQAPRList.at(0)}${assignOctocat}` +
                        `${lineBreak}${openCheckbox}${internalQAPRList.at(1)}${assignOctocat}` +
                        `${lineBreakDouble}${deployerVerificationsHeader}` +
                        `${lineBreak}${openCheckbox}${firebaseVerificationCurrentRelease}` +
                        `${lineBreak}${openCheckbox}${firebaseVerificationPreviousRelease}` +
                        `${lineBreak}${openCheckbox}${ghVerification}` +
                        `${lineBreakDouble}${ccApplauseLeads}`,
                );
                expect(issue.issueAssignees).toEqual(['octocat']);
            });
        });
    });

    const commitHistoryData = {
        emptyResponse: {
            data: {
                commits: [],
            },
        },
        singleCommit: {
            data: {
                commits: [
                    {
                        sha: 'abc123',
                        commit: {
                            message: 'Test commit message',
                            author: {
                                name: 'Test Author',
                            },
                        },
                        author: {
                            login: 'username',
                        },
                    },
                ],
            },
        },
        expectedFormattedCommit: [
            {
                commit: 'abc123',
                subject: 'Test commit message',
                authorName: 'Test Author',
            },
        ],
        multipleCommitsResponse: {
            data: {
                commits: [
                    {
                        sha: 'abc123',
                        commit: {
                            message: 'First commit',
                            author: {name: 'Author One'},
                        },
                    },
                    {
                        sha: 'def456',
                        commit: {
                            message: 'Second commit',
                            author: {name: 'Author Two'},
                        },
                    },
                ],
            },
        },
    };

    describe('getCommitHistoryBetweenTags', () => {
        let mockCompareCommits: jest.Mock;

        beforeEach(() => {
            jest.spyOn(core, 'getInput').mockImplementation((name) => {
                if (name === 'GITHUB_TOKEN') {
                    return 'mock-token';
                }
                return '';
            });

            // Prepare the mocked GitHub API
            mockCompareCommits = jest.fn();
            const mockOctokitInstance = {
                rest: {
                    repos: {
                        compareCommits: mockCompareCommits,
                    },
                },
                paginate: jest.fn(),
            } as unknown as InternalOctokit;

            // Replace the real initOctokit with our mocked one
            jest.spyOn(GithubUtils, 'initOctokit').mockImplementation(() => {});
            GithubUtils.internalOctokit = mockOctokitInstance;
        });

        afterEach(() => {
            jest.restoreAllMocks();
        });

        test('should call GitHub API with correct parameters', async () => {
            mockCompareCommits.mockResolvedValue(commitHistoryData.emptyResponse);

            await GithubUtils.getCommitHistoryBetweenTags('v1.0.0', 'v1.0.1', CONST.APP_REPO);

            expect(mockCompareCommits).toHaveBeenCalledWith({
                owner: CONST.GITHUB_OWNER,
                repo: CONST.APP_REPO,
                base: 'v1.0.0',
                head: 'v1.0.1',
                page: 1,
                per_page: 250,
            });
        });

        test('should return empty array when no commits found', async () => {
            mockCompareCommits.mockResolvedValue(commitHistoryData.emptyResponse);

            const result = await GithubUtils.getCommitHistoryBetweenTags('1.0.0', '1.0.1', CONST.APP_REPO);
            expect(result).toEqual([]);
        });

        test('should return formatted commit history when commits exist', async () => {
            mockCompareCommits.mockResolvedValue(commitHistoryData.singleCommit);

            const result = await GithubUtils.getCommitHistoryBetweenTags('1.0.0', '1.0.1', CONST.APP_REPO);
            expect(result).toEqual(commitHistoryData.expectedFormattedCommit);
        });

        test('should handle multiple commits correctly', async () => {
            mockCompareCommits.mockResolvedValue(commitHistoryData.multipleCommitsResponse);

            const result = await GithubUtils.getCommitHistoryBetweenTags('1.0.0', '1.0.1', CONST.APP_REPO);

            expect(result).toHaveLength(2);
            expect(result.at(0)).toEqual({
                commit: 'abc123',
                subject: 'First commit',
                authorName: 'Author One',
            });
            expect(result.at(1)).toEqual({
                commit: 'def456',
                subject: 'Second commit',
                authorName: 'Author Two',
            });
        });

        test('should handle 404 RequestError with specific error message', async () => {
            const coreErrorSpy = jest.spyOn(core, 'error').mockImplementation();
            const requestError = new RequestError('Not Found', 404, {
                request: {
                    method: 'GET',
                    url: '/repos/compare',
                    headers: {},
                },
            });

            mockCompareCommits.mockRejectedValue(requestError);

            await expect(GithubUtils.getCommitHistoryBetweenTags('1.0.0', '1.0.1', CONST.APP_REPO)).rejects.toThrow(requestError);
            expect(coreErrorSpy).toHaveBeenCalledWith(
                expect.stringContaining(
                    "❓❓ Failed to get commits with the GitHub API. The base tag ('1.0.0') or head tag ('1.0.1') likely doesn't exist on the remote repository. If this is the case, create or push them.",
                ),
            );
        });

        test('should handle generic API errors gracefully', async () => {
            mockCompareCommits.mockRejectedValue(new Error('API Error'));

            await expect(GithubUtils.getCommitHistoryBetweenTags('1.0.0', '1.0.1', CONST.APP_REPO)).rejects.toThrow('API Error');
        });
    });

    describe('getPullRequestURLFromNumber', () => {
        test.each([
            [1234, `https://github.com/${process.env.GITHUB_REPOSITORY}/pull/1234`],
            [54321, `https://github.com/${process.env.GITHUB_REPOSITORY}/pull/54321`],
        ])('getPullRequestNumberFromURL("%s")', (input, expectedOutput) => expect(GithubUtils.getPullRequestURLFromNumber(input, CONST.APP_REPO_URL)).toBe(expectedOutput));
        test.each([
            [1234, `https://github.com/Expensify/Mobile-Expensify/pull/1234`],
            [54321, `https://github.com/Expensify/Mobile-Expensify/pull/54321`],
        ])('getPullRequestNumberFromURL("%s")', (input, expectedOutput) => expect(GithubUtils.getPullRequestURLFromNumber(input, CONST.MOBILE_EXPENSIFY_URL)).toBe(expectedOutput));
    });
});
