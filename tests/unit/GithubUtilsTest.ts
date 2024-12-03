/* eslint-disable @typescript-eslint/naming-convention */

/**
 * @jest-environment node
 */
import * as core from '@actions/core';
import type {Writable} from 'type-fest';
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
    const moctokit = {
        rest: {
            issues: {
                create: jest.fn().mockImplementation((arg: Parameters<OctokitCreateIssue>[0]) =>
                    Promise.resolve({
                        data: {
                            ...arg,
                            html_url: 'https://github.com/Expensify/App/issues/29',
                        },
                    }),
                ),
                listForRepo: mockListIssues,
            },
        },
        paginate: jest.fn().mockImplementation(<T>(objectMethod: () => Promise<ObjectMethodData<T>>) => objectMethod().then(({data}) => data)),
    } as unknown as InternalOctokit;

    GithubUtils.internalOctokit = moctokit;
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
                    node_id: 'MDU6TGFiZWwyNzgzODQ3Nzgy',
                    url: 'https://api.github.com/repos/Andrew-Test-Org/Public-Test-Repo/labels/StagingDeployCash',
                    name: 'StagingDeployCash',
                    color: '6FC269',
                    default: false,
                    description: '',
                },
            ],
            // eslint-disable-next-line max-len
            body: '**Release Version:** `1.0.1-47`\r\n**Compare Changes:** https://github.com/Expensify/App/compare/production...staging\r\n\r\n**This release contains changes from the following pull requests:**\r\n- [ ] https://github.com/Expensify/App/pull/21\r\n- [x] https://github.com/Expensify/App/pull/22\r\n- [ ] https://github.com/Expensify/App/pull/23\r\n\r\n',
        };
        const issueWithDeployBlockers = {...baseIssue};
        // eslint-disable-next-line max-len
        issueWithDeployBlockers.body +=
            '\r\n**Deploy Blockers:**\r\n- [ ] https://github.com/Expensify/App/issues/1\r\n- [x] https://github.com/Expensify/App/issues/2\r\n- [ ] https://github.com/Expensify/App/pull/1234\r\n';

        const baseExpectedResponse: Partial<Awaited<ReturnType<typeof GithubUtils.getStagingDeployCash>>> = {
            PRList: [
                {
                    url: 'https://github.com/Expensify/App/pull/21',
                    number: 21,
                    isVerified: false,
                },
                {
                    url: 'https://github.com/Expensify/App/pull/22',
                    number: 22,
                    isVerified: true,
                },
                {
                    url: 'https://github.com/Expensify/App/pull/23',
                    number: 23,
                    isVerified: false,
                },
            ],
            labels: [
                {
                    color: '6FC269',
                    default: false,
                    description: '',
                    id: 2783847782,
                    name: 'StagingDeployCash',
                    node_id: 'MDU6TGFiZWwyNzgzODQ3Nzgy',
                    url: 'https://api.github.com/repos/Andrew-Test-Org/Public-Test-Repo/labels/StagingDeployCash',
                },
            ],
            tag: '1.0.1-47',
            title: 'Andrew Test Issue',
            url: 'https://api.github.com/repos/Andrew-Test-Org/Public-Test-Repo/issues/29',
            number: 29,
            deployBlockers: [],
            internalQAPRList: [],
            isTimingDashboardChecked: false,
            isFirebaseChecked: false,
            isGHStatusChecked: false,
        };
        const expectedResponseWithDeployBlockers = {...baseExpectedResponse};
        expectedResponseWithDeployBlockers.deployBlockers = [
            {
                url: 'https://github.com/Expensify/App/issues/1',
                number: 1,
                isResolved: false,
            },
            {
                url: 'https://github.com/Expensify/App/issues/2',
                number: 2,
                isResolved: true,
            },
            {
                url: 'https://github.com/Expensify/App/pull/1234',
                number: 1234,
                isResolved: false,
            },
        ];

        test('Test finding an open issue with no PRs successfully', () => {
            const bareIssue: Issue = {
                ...baseIssue,
                // eslint-disable-next-line max-len
                body: '**Release Version:** `1.0.1-47`\r\n**Compare Changes:** https://github.com/Expensify/App/compare/production...staging\r\n\r\ncc @Expensify/applauseleads\n',
            };

            const bareExpectedResponse: Partial<Awaited<ReturnType<typeof GithubUtils.getStagingDeployCash>>> = {
                ...baseExpectedResponse,
                PRList: [],
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
            modifiedIssueWithDeployBlockers.body = modifiedIssueWithDeployBlockers.body.replace(/\r/g, '');

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
                ['https://github.com/Expensify/App/pull/1644', 1644],
                ['https://github.com/Expensify/expensify-common/pull/346', 346],
                ['https://api.github.com/repos/Expensify/Expensify/pull/156369', 156369],
                ['https://api.github.com/repos/Expensify/App/pull/1644', 1644],
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
                ['https://github.com/Expensify/App/issues/1644', 1644],
                ['https://github.com/Expensify/expensify-common/issues/346', 346],
                ['https://api.github.com/repos/Expensify/Expensify/issues/156369', 156369],
                ['https://api.github.com/repos/Expensify/App/issues/1644', 1644],
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
                ['https://github.com/Expensify/App/issues/1644', 1644],
                ['https://github.com/Expensify/expensify-common/issues/346', 346],
                ['https://github.com/Expensify/Expensify/pull/156369', 156369],
                ['https://github.com/Expensify/App/pull/1644', 1644],
                ['https://github.com/Expensify/expensify-common/pull/346', 346],
                ['https://api.github.com/repos/Expensify/Expensify/issues/156369', 156369],
                ['https://api.github.com/repos/Expensify/App/issues/1644', 1644],
                ['https://api.github.com/repos/Expensify/expensify-common/issues/346', 346],
                ['https://api.github.com/repos/Expensify/Expensify/pull/156369', 156369],
                ['https://api.github.com/repos/Expensify/App/pull/1644', 1644],
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
                html_url: 'https://github.com/Expensify/App/pull/1',
                user: {login: 'testUser'},
                labels: [],
            },
            {
                number: 2,
                title: 'Test PR 2',
                html_url: 'https://github.com/Expensify/App/pull/2',
                user: {login: 'testUser'},
                labels: [],
            },
            {
                number: 3,
                title: 'Test PR 3',
                html_url: 'https://github.com/Expensify/App/pull/3',
                user: {login: 'testUser'},
                labels: [],
            },
            {
                number: 4,
                title: '[NO QA] Test No QA PR uppercase',
                html_url: 'https://github.com/Expensify/App/pull/4',
                user: {login: 'testUser'},
                labels: [],
            },
            {
                number: 5,
                title: '[NoQa] Test No QA PR Title Case',
                html_url: 'https://github.com/Expensify/App/pull/5',
                user: {login: 'testUser'},
                labels: [],
            },
            {
                number: 6,
                title: '[Internal QA] Another Test Internal QA PR',
                html_url: 'https://github.com/Expensify/App/pull/6',
                user: {login: 'testUser'},
                labels: [
                    {
                        id: 1234,
                        node_id: 'MDU6TGFiZWwyMDgwNDU5NDY=',
                        url: 'https://api.github.com/Expensify/App/labels/InternalQA',
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
                html_url: 'https://github.com/Expensify/App/pull/7',
                user: {login: 'testUser'},
                labels: [
                    {
                        id: 1234,
                        node_id: 'MDU6TGFiZWwyMDgwNDU5NDY=',
                        url: 'https://api.github.com/Expensify/App/labels/InternalQA',
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
            'https://github.com/Expensify/App/pull/2',
            'https://github.com/Expensify/App/pull/3',
            'https://github.com/Expensify/App/pull/1',
            'https://github.com/Expensify/App/pull/3', // This is an intentional duplicate for testing duplicates
            'https://github.com/Expensify/App/pull/4', // No QA
            'https://github.com/Expensify/App/pull/5', // No QA
        ];

        const internalQAPRList = [
            'https://github.com/Expensify/App/pull/6', // Internal QA
            'https://github.com/Expensify/App/pull/7', // Internal QA
        ];

        const baseDeployBlockerList = ['https://github.com/Expensify/App/pull/3', 'https://github.com/Expensify/App/issues/4'];

        // eslint-disable-next-line max-len
        const baseExpectedOutput = `**Release Version:** \`${tag}\`\r\n**Compare Changes:** https://github.com/Expensify/App/compare/production...staging\r\n\r\n**This release contains changes from the following pull requests:**\r\n`;
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
        const timingDashboardVerification =
            'I checked the [App Timing Dashboard](https://graphs.expensify.com/grafana/d/yj2EobAGz/app-timing?orgId=1) and verified this release does not cause a noticeable performance regression.';
        // eslint-disable-next-line max-len
        const firebaseVerification =
            'I checked [Firebase Crashlytics](https://console.firebase.google.com/u/0/project/expensify-chat/crashlytics/app/android:com.expensify.chat/issues?state=open&time=last-seven-days&tag=all) and verified that this release does not introduce any new crashes. More detailed instructions on this verification can be found [here](https://stackoverflowteams.com/c/expensify/questions/15095/15096).';
        // eslint-disable-next-line max-len
        const ghVerification = 'I checked [GitHub Status](https://www.githubstatus.com/) and verified there is no reported incident with Actions.';

        // Valid output which will be reused in the deploy blocker tests
        const allVerifiedExpectedOutput =
            `${baseExpectedOutput}` +
            `${closedCheckbox}${basePRList[2]}` +
            `${lineBreak}${closedCheckbox}${basePRList[0]}` +
            `${lineBreak}${closedCheckbox}${basePRList[1]}` +
            `${lineBreak}${closedCheckbox}${basePRList[4]}` +
            `${lineBreak}${closedCheckbox}${basePRList[5]}` +
            `${lineBreak}`;

        test('Test no verified PRs', () => {
            githubUtils.generateStagingDeployCashBodyAndAssignees(tag, basePRList).then((issue) => {
                if (typeof issue !== 'object') {
                    return;
                }
                expect(issue.issueBody).toBe(
                    `${baseExpectedOutput}` +
                        `${openCheckbox}${basePRList[2]}` +
                        `${lineBreak}${openCheckbox}${basePRList[0]}` +
                        `${lineBreak}${openCheckbox}${basePRList[1]}` +
                        `${lineBreak}${closedCheckbox}${basePRList[4]}` +
                        `${lineBreak}${closedCheckbox}${basePRList[5]}` +
                        `${lineBreakDouble}${deployerVerificationsHeader}` +
                        `${lineBreak}${openCheckbox}${timingDashboardVerification}` +
                        `${lineBreak}${openCheckbox}${firebaseVerification}` +
                        `${lineBreak}${openCheckbox}${ghVerification}` +
                        `${lineBreakDouble}${ccApplauseLeads}`,
                );
                expect(issue.issueAssignees).toEqual([]);
            });
        });

        test('Test some verified PRs', () => {
            githubUtils.generateStagingDeployCashBodyAndAssignees(tag, basePRList, [basePRList[0]]).then((issue) => {
                if (typeof issue !== 'object') {
                    return;
                }

                expect(issue.issueBody).toBe(
                    `${baseExpectedOutput}` +
                        `${openCheckbox}${basePRList[2]}` +
                        `${lineBreak}${closedCheckbox}${basePRList[0]}` +
                        `${lineBreak}${openCheckbox}${basePRList[1]}` +
                        `${lineBreak}${closedCheckbox}${basePRList[4]}` +
                        `${lineBreak}${closedCheckbox}${basePRList[5]}` +
                        `${lineBreakDouble}${deployerVerificationsHeader}` +
                        `${lineBreak}${openCheckbox}${timingDashboardVerification}` +
                        `${lineBreak}${openCheckbox}${firebaseVerification}` +
                        `${lineBreak}${openCheckbox}${ghVerification}` +
                        `${lineBreakDouble}${ccApplauseLeads}`,
                );
                expect(issue.issueAssignees).toEqual([]);
            });
        });

        test('Test all verified PRs', () => {
            githubUtils.generateStagingDeployCashBodyAndAssignees(tag, basePRList, basePRList).then((issue) => {
                if (typeof issue !== 'object') {
                    return;
                }

                expect(issue.issueBody).toBe(
                    `${allVerifiedExpectedOutput}` +
                        `${lineBreak}${deployerVerificationsHeader}` +
                        `${lineBreak}${openCheckbox}${timingDashboardVerification}` +
                        `${lineBreak}${openCheckbox}${firebaseVerification}` +
                        `${lineBreak}${openCheckbox}${ghVerification}` +
                        `${lineBreakDouble}${ccApplauseLeads}`,
                );
                expect(issue.issueAssignees).toEqual([]);
            });
        });

        test('Test no resolved deploy blockers', () => {
            githubUtils.generateStagingDeployCashBodyAndAssignees(tag, basePRList, basePRList, baseDeployBlockerList).then((issue) => {
                if (typeof issue !== 'object') {
                    return;
                }

                expect(issue.issueBody).toBe(
                    `${allVerifiedExpectedOutput}` +
                        `${lineBreak}${deployBlockerHeader}` +
                        `${lineBreak}${openCheckbox}${baseDeployBlockerList[0]}` +
                        `${lineBreak}${openCheckbox}${baseDeployBlockerList[1]}` +
                        `${lineBreakDouble}${deployerVerificationsHeader}` +
                        `${lineBreak}${openCheckbox}${timingDashboardVerification}` +
                        `${lineBreak}${openCheckbox}${firebaseVerification}` +
                        `${lineBreak}${openCheckbox}${ghVerification}${lineBreak}` +
                        `${lineBreak}${ccApplauseLeads}`,
                );
                expect(issue.issueAssignees).toEqual([]);
            });
        });

        test('Test some resolved deploy blockers', () => {
            githubUtils.generateStagingDeployCashBodyAndAssignees(tag, basePRList, basePRList, baseDeployBlockerList, [baseDeployBlockerList[0]]).then((issue) => {
                if (typeof issue !== 'object') {
                    return;
                }

                expect(issue.issueBody).toBe(
                    `${allVerifiedExpectedOutput}` +
                        `${lineBreak}${deployBlockerHeader}` +
                        `${lineBreak}${closedCheckbox}${baseDeployBlockerList[0]}` +
                        `${lineBreak}${openCheckbox}${baseDeployBlockerList[1]}` +
                        `${lineBreakDouble}${deployerVerificationsHeader}` +
                        `${lineBreak}${openCheckbox}${timingDashboardVerification}` +
                        `${lineBreak}${openCheckbox}${firebaseVerification}` +
                        `${lineBreak}${openCheckbox}${ghVerification}` +
                        `${lineBreakDouble}${ccApplauseLeads}`,
                );
                expect(issue.issueAssignees).toEqual([]);
            });
        });

        test('Test all resolved deploy blockers', () => {
            githubUtils.generateStagingDeployCashBodyAndAssignees(tag, basePRList, basePRList, baseDeployBlockerList, baseDeployBlockerList).then((issue) => {
                if (typeof issue !== 'object') {
                    return;
                }
                expect(issue.issueBody).toBe(
                    `${baseExpectedOutput}` +
                        `${closedCheckbox}${basePRList[2]}` +
                        `${lineBreak}${closedCheckbox}${basePRList[0]}` +
                        `${lineBreak}${closedCheckbox}${basePRList[1]}` +
                        `${lineBreak}${closedCheckbox}${basePRList[4]}` +
                        `${lineBreak}${closedCheckbox}${basePRList[5]}` +
                        `${lineBreakDouble}${deployBlockerHeader}` +
                        `${lineBreak}${closedCheckbox}${baseDeployBlockerList[0]}` +
                        `${lineBreak}${closedCheckbox}${baseDeployBlockerList[1]}` +
                        `${lineBreakDouble}${deployerVerificationsHeader}` +
                        `${lineBreak}${openCheckbox}${timingDashboardVerification}` +
                        `${lineBreak}${openCheckbox}${firebaseVerification}` +
                        `${lineBreak}${openCheckbox}${ghVerification}` +
                        `${lineBreakDouble}${ccApplauseLeads}`,
                );
                expect(issue.issueAssignees).toEqual([]);
            });
        });

        test('Test internalQA PRs', () => {
            githubUtils.generateStagingDeployCashBodyAndAssignees(tag, [...basePRList, ...internalQAPRList]).then((issue) => {
                if (typeof issue !== 'object') {
                    return;
                }

                expect(issue.issueBody).toBe(
                    `${baseExpectedOutput}` +
                        `${openCheckbox}${basePRList[2]}` +
                        `${lineBreak}${openCheckbox}${basePRList[0]}` +
                        `${lineBreak}${openCheckbox}${basePRList[1]}` +
                        `${lineBreak}${closedCheckbox}${basePRList[4]}` +
                        `${lineBreak}${closedCheckbox}${basePRList[5]}` +
                        `${lineBreak}${internalQAHeader}` +
                        `${lineBreak}${openCheckbox}${internalQAPRList[0]}${assignOctocat}` +
                        `${lineBreak}${openCheckbox}${internalQAPRList[1]}${assignOctocat}` +
                        `${lineBreakDouble}${deployerVerificationsHeader}` +
                        `${lineBreak}${openCheckbox}${timingDashboardVerification}` +
                        `${lineBreak}${openCheckbox}${firebaseVerification}` +
                        `${lineBreak}${openCheckbox}${ghVerification}` +
                        `${lineBreakDouble}${ccApplauseLeads}`,
                );
                expect(issue.issueAssignees).toEqual(['octocat']);
            });
        });

        test('Test some verified internalQA PRs', () => {
            githubUtils.generateStagingDeployCashBodyAndAssignees(tag, [...basePRList, ...internalQAPRList], [], [], [], [internalQAPRList[0]]).then((issue) => {
                if (typeof issue !== 'object') {
                    return;
                }

                expect(issue.issueBody).toBe(
                    `${baseExpectedOutput}` +
                        `${openCheckbox}${basePRList[2]}` +
                        `${lineBreak}${openCheckbox}${basePRList[0]}` +
                        `${lineBreak}${openCheckbox}${basePRList[1]}` +
                        `${lineBreak}${closedCheckbox}${basePRList[4]}` +
                        `${lineBreak}${closedCheckbox}${basePRList[5]}` +
                        `${lineBreak}${internalQAHeader}` +
                        `${lineBreak}${closedCheckbox}${internalQAPRList[0]}${assignOctocat}` +
                        `${lineBreak}${openCheckbox}${internalQAPRList[1]}${assignOctocat}` +
                        `${lineBreakDouble}${deployerVerificationsHeader}` +
                        `${lineBreak}${openCheckbox}${timingDashboardVerification}` +
                        `${lineBreak}${openCheckbox}${firebaseVerification}` +
                        `${lineBreak}${openCheckbox}${ghVerification}` +
                        `${lineBreakDouble}${ccApplauseLeads}`,
                );
                expect(issue.issueAssignees).toEqual(['octocat']);
            });
        });
    });

    describe('getPullRequestURLFromNumber', () => {
        test.each([
            [1234, 'https://github.com/Expensify/App/pull/1234'],
            [54321, 'https://github.com/Expensify/App/pull/54321'],
        ])('getPullRequestNumberFromURL("%s")', (input, expectedOutput) => expect(GithubUtils.getPullRequestURLFromNumber(input)).toBe(expectedOutput));
    });
});
