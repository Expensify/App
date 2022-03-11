/**
 * @jest-environment node
 */
const {Octokit} = require('@octokit/rest');
const GithubUtils = require('../../.github/libs/GithubUtils');

beforeEach(() => {
    GithubUtils.octokitInternal = new Octokit();
});

describe('GithubUtils', () => {
    describe('getStagingDeployCash', () => {
        const baseIssue = {
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
            body: '**Release Version:** `1.0.1-47`\r\n**Compare Changes:** https://github.com/Expensify/App/compare/production...staging\r\n\r\n**This release contains changes from the following pull requests:**\r\n- https://github.com/Expensify/App/pull/21\r\n  - [ ] QA\r\n  - [ ] Accessibility\r\n\r\n- https://github.com/Expensify/App/pull/22\r\n  - [x] QA\r\n  - [ ] Accessibility\r\n\r\n- https://github.com/Expensify/App/pull/23\r\n  - [ ] QA\r\n  - [ ] Accessibility\r\n\r\n',
        };
        const issueWithDeployBlockers = {...baseIssue};
        // eslint-disable-next-line max-len
        issueWithDeployBlockers.body += '\r\n**Deploy Blockers:**\r\n- [ ] https://github.com/Expensify/App/issues/1\r\n- [x] https://github.com/Expensify/App/issues/2\r\n- [ ] https://github.com/Expensify/App/pull/1234\r\n';

        const baseExpectedResponse = {
            PRList: [
                {
                    url: 'https://github.com/Expensify/App/pull/21',
                    number: 21,
                    isVerified: false,
                    isAccessible: false,
                },
                {
                    url: 'https://github.com/Expensify/App/pull/22',
                    number: 22,
                    isVerified: true,
                    isAccessible: false,
                },
                {
                    url: 'https://github.com/Expensify/App/pull/23',
                    number: 23,
                    isVerified: false,
                    isAccessible: false,
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
            const bareIssue = {
                ...baseIssue,
                // eslint-disable-next-line max-len
                body: '**Release Version:** `1.0.1-47`\r\n**Compare Changes:** https://github.com/Expensify/App/compare/production...staging\r\n\r\ncc @Expensify/applauseleads\n',
            };

            const bareExpectedResponse = {
                ...baseExpectedResponse,
                PRList: [],
            };

            GithubUtils.octokit.issues.listForRepo = jest.fn().mockResolvedValue({data: [bareIssue]});
            return GithubUtils.getStagingDeployCash().then(data => expect(data).toStrictEqual(bareExpectedResponse));
        });

        test('Test finding an open issue successfully', () => {
            GithubUtils.octokit.issues.listForRepo = jest.fn().mockResolvedValue({data: [baseIssue]});
            return GithubUtils.getStagingDeployCash().then(data => expect(data).toStrictEqual(baseExpectedResponse));
        });

        test('Test finding an open issue successfully and parsing with deploy blockers', () => {
            GithubUtils.octokit.issues.listForRepo = jest.fn().mockResolvedValue({data: [issueWithDeployBlockers]});
            return GithubUtils.getStagingDeployCash()
                .then(data => expect(data).toStrictEqual(expectedResponseWithDeployBlockers));
        });

        test('Test finding an open issue successfully and parsing with blockers w/o carriage returns', () => {
            const modifiedIssueWithDeployBlockers = {...issueWithDeployBlockers};
            modifiedIssueWithDeployBlockers.body = modifiedIssueWithDeployBlockers.body.replace(/\r/g, '');

            GithubUtils.octokit.issues.listForRepo = jest.fn().mockResolvedValue({
                data: [modifiedIssueWithDeployBlockers],
            });
            return GithubUtils.getStagingDeployCash()
                .then(data => expect(data).toStrictEqual(expectedResponseWithDeployBlockers));
        });

        test('Test finding an open issue without a body', () => {
            const noBodyIssue = baseIssue;
            noBodyIssue.body = '';

            GithubUtils.octokit.issues.listForRepo = jest.fn().mockResolvedValue({data: [noBodyIssue]});
            return GithubUtils.getStagingDeployCash()
                .catch(e => expect(e).toEqual(new Error('Unable to find StagingDeployCash issue with correct data.')));
        });

        test('Test finding more than one issue', () => {
            GithubUtils.octokit.issues.listForRepo = jest.fn().mockResolvedValue({data: [{a: 1}, {b: 2}]});
            return GithubUtils.getStagingDeployCash()
                .catch(e => expect(e).toEqual(new Error('Found more than one StagingDeployCash issue.')));
        });

        test('Test finding no issues', () => {
            GithubUtils.octokit.issues.listForRepo = jest.fn().mockResolvedValue({data: []});
            return GithubUtils.getStagingDeployCash()
                .catch(e => expect(e).toEqual(new Error('Unable to find StagingDeployCash issue.')));
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
                expect(() => GithubUtils.getPullRequestNumberFromURL(input))
                    .toThrow(new Error(`Provided URL ${input} is not a Github Pull Request!`));
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
                expect(() => GithubUtils.getIssueNumberFromURL(input))
                    .toThrow(new Error(`Provided URL ${input} is not a Github Issue!`));
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
            test.each([
                ['https://www.google.com/'],
                ['https://docs.google.com/document/d/1mMFh-m1seOES48r3zNqcvfuTvr3qOAsY6n5rP4ejdXE/edit?ts=602420d2#'],
            ])('getIssueOrPullRequestNumberFromURL("%s")', (input) => {
                expect(() => GithubUtils.getIssueOrPullRequestNumberFromURL(input))
                    .toThrow(new Error(`Provided URL ${input} is not a valid Github Issue or Pull Request!`));
            });
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
                title: 'Test Automated PR',
                html_url: 'https://github.com/Expensify/App/pull/4',
                user: {login: 'OSBotify'},
                labels: [{name: 'automerge'}],
            },
            {
                number: 5,
                title: '[No QA] Test No QA PR uppercase',
                html_url: 'https://github.com/Expensify/App/pull/5',
                user: {login: 'testUser'},
                labels: [],
            },
            {
                number: 6,
                title: '[No QA] Test No QA PR Title Case',
                html_url: 'https://github.com/Expensify/App/pull/6',
                user: {login: 'testUser'},
                labels: [],
            },
            {
                number: 7,
                title: '[Internal QA] Test Internal QA PR',
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
                assignees: [
                    {
                        login: 'octocat',
                    },
                    {
                        login: 'hubot',
                    },
                ],
            },
            {
                number: 8,
                title: '[Internal QA] Another Test Internal QA PR',
                html_url: 'https://github.com/Expensify/App/pull/8',
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
                assignees: [
                    {
                        login: 'octocat',
                    },
                    {
                        login: 'hubot',
                    },
                ],
            },
        ];
        const mockGithub = jest.fn(() => ({
            getOctokit: () => ({
                repos: {
                    listTags: jest.fn().mockResolvedValue({data: mockTags}),
                },
                pulls: {
                    list: jest.fn().mockResolvedValue({data: mockPRs}),
                },
                paginate: jest.fn().mockImplementation(objectMethod => objectMethod().then(({data}) => data)),
            }),
        }));

        const octokit = mockGithub().getOctokit();
        const githubUtils = class extends GithubUtils { };
        githubUtils.octokitInternal = octokit;
        const tag = '1.0.2-12';
        const basePRList = [
            'https://github.com/Expensify/App/pull/2',
            'https://github.com/Expensify/App/pull/3',
            'https://github.com/Expensify/App/pull/1',
            'https://github.com/Expensify/App/pull/4', // Automated
            'https://github.com/Expensify/App/pull/3', // This is an intentional duplicate for testing duplicates
            'https://github.com/Expensify/App/pull/5', // No QA
            'https://github.com/Expensify/App/pull/6', // No QA
        ];

        const internalQAPRList = [
            'https://github.com/Expensify/App/pull/7', // Internal QA
            'https://github.com/Expensify/App/pull/8', // Internal QA
        ];

        const baseDeployBlockerList = [
            'https://github.com/Expensify/App/pull/3',
            'https://github.com/Expensify/App/issues/4',
        ];

        // eslint-disable-next-line max-len
        const baseExpectedOutput = `**Release Version:** \`${tag}\`\r\n**Compare Changes:** https://github.com/Expensify/App/compare/production...staging\r\n\r\n**This release contains changes from the following pull requests:**`;
        const openCheckbox = '- [ ] ';
        const closedCheckbox = '- [x] ';
        const listStart = '- ';
        const QA = 'QA';
        const accessibility = 'Accessibility';
        const ccApplauseLeads = 'cc @Expensify/applauseleads\r\n';
        const deployBlockerHeader = '\r\n**Deploy Blockers:**';
        const internalQAHeader = '\r\n**Internal QA:**';
        const lineBreak = '\r\n';
        const lineBreakDouble = '\r\n\r\n';
        const indent = '  ';
        const assignOctocatHubot = ' - @octocat @hubot';

        // Valid output which will be reused in the deploy blocker tests
        const allVerifiedExpectedOutput = `${baseExpectedOutput}`
                + `${lineBreakDouble}${listStart}${basePRList[2]}${lineBreak}${indent}${closedCheckbox}${QA}${lineBreak}${indent}${openCheckbox}${accessibility}`
                + `${lineBreakDouble}${listStart}${basePRList[0]}${lineBreak}${indent}${closedCheckbox}${QA}${lineBreak}${indent}${openCheckbox}${accessibility}`
                + `${lineBreakDouble}${listStart}${basePRList[1]}${lineBreak}${indent}${closedCheckbox}${QA}${lineBreak}${indent}${openCheckbox}${accessibility}`
                + `${lineBreakDouble}${listStart}${basePRList[5]}${lineBreak}${indent}${closedCheckbox}${QA}${lineBreak}${indent}${closedCheckbox}${accessibility}`
                + `${lineBreakDouble}${listStart}${basePRList[6]}${lineBreak}${indent}${closedCheckbox}${QA}${lineBreak}${indent}${closedCheckbox}${accessibility}`;

        test('Test no verified PRs', () => (
            githubUtils.generateStagingDeployCashBody(tag, basePRList)
                .then((issueBody) => {
                    expect(issueBody).toBe(
                        `${baseExpectedOutput}`
                        + `${lineBreakDouble}${listStart}${basePRList[2]}${lineBreak}${indent}${openCheckbox}${QA}${lineBreak}${indent}${openCheckbox}${accessibility}`
                        + `${lineBreakDouble}${listStart}${basePRList[0]}${lineBreak}${indent}${openCheckbox}${QA}${lineBreak}${indent}${openCheckbox}${accessibility}`
                        + `${lineBreakDouble}${listStart}${basePRList[1]}${lineBreak}${indent}${openCheckbox}${QA}${lineBreak}${indent}${openCheckbox}${accessibility}`
                        + `${lineBreakDouble}${listStart}${basePRList[5]}${lineBreak}${indent}${closedCheckbox}${QA}${lineBreak}${indent}${closedCheckbox}${accessibility}`
                        + `${lineBreakDouble}${listStart}${basePRList[6]}${lineBreak}${indent}${closedCheckbox}${QA}${lineBreak}${indent}${closedCheckbox}${accessibility}`
                        + `${lineBreakDouble}${ccApplauseLeads}`,
                    );
                })
        ));

        test('Test some verified PRs', () => (
            githubUtils.generateStagingDeployCashBody(tag, basePRList, [basePRList[0]])
                .then((issueBody) => {
                    expect(issueBody).toBe(
                        `${baseExpectedOutput}`
                        + `${lineBreakDouble}${listStart}${basePRList[2]}${lineBreak}${indent}${openCheckbox}${QA}${lineBreak}${indent}${openCheckbox}${accessibility}`
                        + `${lineBreakDouble}${listStart}${basePRList[0]}${lineBreak}${indent}${closedCheckbox}${QA}${lineBreak}${indent}${openCheckbox}${accessibility}`
                        + `${lineBreakDouble}${listStart}${basePRList[1]}${lineBreak}${indent}${openCheckbox}${QA}${lineBreak}${indent}${openCheckbox}${accessibility}`
                        + `${lineBreakDouble}${listStart}${basePRList[5]}${lineBreak}${indent}${closedCheckbox}${QA}${lineBreak}${indent}${closedCheckbox}${accessibility}`
                        + `${lineBreakDouble}${listStart}${basePRList[6]}${lineBreak}${indent}${closedCheckbox}${QA}${lineBreak}${indent}${closedCheckbox}${accessibility}`
                        + `${lineBreakDouble}${ccApplauseLeads}`,
                    );
                })
        ));

        test('Test some accessibility verified PRs', () => (
            githubUtils.generateStagingDeployCashBody(tag, basePRList, [basePRList[0]], [basePRList[1]])
                .then((issueBody) => {
                    expect(issueBody).toBe(
                        `${baseExpectedOutput}`
                        + `${lineBreakDouble}${listStart}${basePRList[2]}${lineBreak}${indent}${openCheckbox}${QA}${lineBreak}${indent}${openCheckbox}${accessibility}`
                        + `${lineBreakDouble}${listStart}${basePRList[0]}${lineBreak}${indent}${closedCheckbox}${QA}${lineBreak}${indent}${openCheckbox}${accessibility}`
                        + `${lineBreakDouble}${listStart}${basePRList[1]}${lineBreak}${indent}${openCheckbox}${QA}${lineBreak}${indent}${closedCheckbox}${accessibility}`
                        + `${lineBreakDouble}${listStart}${basePRList[5]}${lineBreak}${indent}${closedCheckbox}${QA}${lineBreak}${indent}${closedCheckbox}${accessibility}`
                        + `${lineBreakDouble}${listStart}${basePRList[6]}${lineBreak}${indent}${closedCheckbox}${QA}${lineBreak}${indent}${closedCheckbox}${accessibility}`
                        + `${lineBreakDouble}${ccApplauseLeads}`,
                    );
                })
        ));

        test('Test all verified PRs', () => (
            githubUtils.generateStagingDeployCashBody(tag, basePRList, basePRList)
                .then((issueBody) => {
                    expect(issueBody).toBe(
                        `${allVerifiedExpectedOutput}${lineBreakDouble}${ccApplauseLeads}`,
                    );
                })
        ));

        test('Test no resolved deploy blockers', () => (
            githubUtils.generateStagingDeployCashBody(tag, basePRList, basePRList, [], baseDeployBlockerList)
                .then((issueBody) => {
                    expect(issueBody).toBe(
                        `${allVerifiedExpectedOutput}`
                        + `${lineBreakDouble}${deployBlockerHeader}`
                        + `${lineBreak}${openCheckbox}${baseDeployBlockerList[0]}`
                        + `${lineBreak}${openCheckbox}${baseDeployBlockerList[1]}`
                        + `${lineBreakDouble}${ccApplauseLeads}`,
                    );
                })
        ));

        test('Test some resolved deploy blockers', () => (
            githubUtils.generateStagingDeployCashBody(tag, basePRList, basePRList, [], baseDeployBlockerList, [baseDeployBlockerList[0]])
                .then((issueBody) => {
                    expect(issueBody).toBe(
                        `${allVerifiedExpectedOutput}`
                        + `${lineBreakDouble}${deployBlockerHeader}`
                        + `${lineBreak}${closedCheckbox}${baseDeployBlockerList[0]}`
                        + `${lineBreak}${openCheckbox}${baseDeployBlockerList[1]}`
                        + `${lineBreakDouble}${ccApplauseLeads}`,
                    );
                })
        ));

        test('Test all resolved deploy blockers', () => (
            githubUtils.generateStagingDeployCashBody(tag, basePRList, basePRList, baseDeployBlockerList, baseDeployBlockerList, baseDeployBlockerList)
                .then((issueBody) => {
                    expect(issueBody).toBe(
                        `${baseExpectedOutput}`
                        + `${lineBreakDouble}${listStart}${basePRList[2]}${lineBreak}${indent}${closedCheckbox}${QA}${lineBreak}${indent}${openCheckbox}${accessibility}`
                        + `${lineBreakDouble}${listStart}${basePRList[0]}${lineBreak}${indent}${closedCheckbox}${QA}${lineBreak}${indent}${openCheckbox}${accessibility}`
                        + `${lineBreakDouble}${listStart}${basePRList[1]}${lineBreak}${indent}${closedCheckbox}${QA}${lineBreak}${indent}${closedCheckbox}${accessibility}`
                        + `${lineBreakDouble}${listStart}${basePRList[5]}${lineBreak}${indent}${closedCheckbox}${QA}${lineBreak}${indent}${closedCheckbox}${accessibility}`
                        + `${lineBreakDouble}${listStart}${basePRList[6]}${lineBreak}${indent}${closedCheckbox}${QA}${lineBreak}${indent}${closedCheckbox}${accessibility}`
                        + `${lineBreakDouble}${deployBlockerHeader}`
                        + `${lineBreak}${closedCheckbox}${baseDeployBlockerList[0]}`
                        + `${lineBreak}${closedCheckbox}${baseDeployBlockerList[1]}`
                        + `${lineBreakDouble}${ccApplauseLeads}`,
                    );
                })
        ));

        test('Test internalQA PRs', () => (
            githubUtils.generateStagingDeployCashBody(tag, [...basePRList, ...internalQAPRList])
                .then((issueBody) => {
                    expect(issueBody).toBe(
                        `${baseExpectedOutput}`
                        + `${lineBreakDouble}${listStart}${basePRList[2]}${lineBreak}${indent}${openCheckbox}${QA}${lineBreak}${indent}${openCheckbox}${accessibility}`
                        + `${lineBreakDouble}${listStart}${basePRList[0]}${lineBreak}${indent}${openCheckbox}${QA}${lineBreak}${indent}${openCheckbox}${accessibility}`
                        + `${lineBreakDouble}${listStart}${basePRList[1]}${lineBreak}${indent}${openCheckbox}${QA}${lineBreak}${indent}${openCheckbox}${accessibility}`
                        + `${lineBreakDouble}${listStart}${basePRList[5]}${lineBreak}${indent}${closedCheckbox}${QA}${lineBreak}${indent}${closedCheckbox}${accessibility}`
                        + `${lineBreakDouble}${listStart}${basePRList[6]}${lineBreak}${indent}${closedCheckbox}${QA}${lineBreak}${indent}${closedCheckbox}${accessibility}`
                        + `${lineBreakDouble}${internalQAHeader}`
                        + `${lineBreak}${openCheckbox}${internalQAPRList[0]}${assignOctocatHubot}`
                        + `${lineBreak}${openCheckbox}${internalQAPRList[1]}${assignOctocatHubot}`
                        + `${lineBreakDouble}${ccApplauseLeads}`,
                    );
                })
        ));

        test('Test some verified internalQA PRs', () => (
            githubUtils.generateStagingDeployCashBody(tag, [...basePRList, ...internalQAPRList], [internalQAPRList[0]])
                .then((issueBody) => {
                    expect(issueBody).toBe(
                        `${baseExpectedOutput}`
                        + `${lineBreakDouble}${listStart}${basePRList[2]}${lineBreak}${indent}${openCheckbox}${QA}${lineBreak}${indent}${openCheckbox}${accessibility}`
                        + `${lineBreakDouble}${listStart}${basePRList[0]}${lineBreak}${indent}${openCheckbox}${QA}${lineBreak}${indent}${openCheckbox}${accessibility}`
                        + `${lineBreakDouble}${listStart}${basePRList[1]}${lineBreak}${indent}${openCheckbox}${QA}${lineBreak}${indent}${openCheckbox}${accessibility}`
                        + `${lineBreakDouble}${listStart}${basePRList[5]}${lineBreak}${indent}${closedCheckbox}${QA}${lineBreak}${indent}${closedCheckbox}${accessibility}`
                        + `${lineBreakDouble}${listStart}${basePRList[6]}${lineBreak}${indent}${closedCheckbox}${QA}${lineBreak}${indent}${closedCheckbox}${accessibility}`
                        + `${lineBreakDouble}${internalQAHeader}`
                        + `${lineBreak}${closedCheckbox}${internalQAPRList[0]}${assignOctocatHubot}`
                        + `${lineBreak}${openCheckbox}${internalQAPRList[1]}${assignOctocatHubot}`
                        + `${lineBreakDouble}${ccApplauseLeads}`,
                    );
                })
        ));
    });

    describe('getPullRequestURLFromNumber', () => {
        test.each([
            [1234, 'https://github.com/Expensify/App/pull/1234'],
            [54321, 'https://github.com/Expensify/App/pull/54321'],
        ])('getPullRequestNumberFromURL("%s")', (input, expectedOutput) => (
            expect(GithubUtils.getPullRequestURLFromNumber(input)).toBe(expectedOutput)
        ));
    });

    describe('getReleaseBody', () => {
        test.each([
            // eslint-disable-next-line max-len
            [[1, 2, 3], '- https://github.com/Expensify/App/pull/1\r\n- https://github.com/Expensify/App/pull/2\r\n- https://github.com/Expensify/App/pull/3'],
            [[], ''],
            [[12345], '- https://github.com/Expensify/App/pull/12345'],
        ])('getReleaseBody("%s")', (input, expectedOutput) => (
            expect(GithubUtils.getReleaseBody(input)).toBe(expectedOutput)
        ));
    });
});
