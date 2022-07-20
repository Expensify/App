/**
 * @jest-environment node
 */
const _ = require('underscore');
const core = require('@actions/core');
const GithubUtils = require('../../.github/libs/GithubUtils');
const run = require('../../.github/actions/checkDeployBlockers/checkDeployBlockers');

// Static mock function for core.getInput
const mockGetInput = jest.fn().mockImplementation((arg) => {
    if (arg === 'GITHUB_TOKEN') {
        return 'fake_token';
    }

    if (arg === 'ISSUE_NUMBER') {
        return 1;
    }
});

const mockSetOutput = jest.fn();
const mockGetIssue = jest.fn();
const mockListComments = jest.fn();

beforeAll(() => {
    // Mock core module
    core.getInput = mockGetInput;
    core.setOutput = mockSetOutput;

    // Mock octokit module
    const mocktokit = {
        issues: {
            get: mockGetIssue,
            listComments: mockListComments,
        },
    };
    GithubUtils.octokitInternal = mocktokit;
});

let baseComments = [];
beforeEach(() => {
    baseComments = {
        data: [
            {
                body: 'foo',
            },
            {
                body: 'bar',
            },
            {
                body: ':shipit:',
            },
        ],
    };
});

afterEach(() => {
    mockSetOutput.mockClear();
    mockGetIssue.mockClear();
    mockListComments.mockClear();
});

afterAll(() => {
    jest.clearAllMocks();
});

function checkbox(isClosed) {
    return isClosed ? '[x]' : '[ ]';
}

function mockIssue(prList, deployBlockerList) {
    return {
        data: {
            number: 1,
            title: 'Scott\'s QA Checklist',
            body: `
**Release Version:** \`1.1.31-2\`
**Compare Changes:** https://github.com/Expensify/App/compare/production...staging

**This release contains changes from the following pull requests:**
${_.map(prList, ({url, isQASuccess, isAccessibilitySuccess}) => `
- ${url}
  - ${checkbox(isQASuccess)} QA
  - ${checkbox(isAccessibilitySuccess)} Accessibility
`)}
${!_.isEmpty(deployBlockerList) ? `

**Deploy Blockers:**` : ''}  
${_.map(deployBlockerList, ({url, isQASuccess}) => `
- ${checkbox(isQASuccess)} ${url}
`)}
cc @Expensify/applauseleads
`,
        },
    };
}

describe('checkDeployBlockers', () => {
    const allClearIssue = mockIssue([{url: 'https://github.com/Expensify/App/pull/6882', isQASuccess: true, isAccessibilitySuccess: true}]);

    describe('checkDeployBlockers', () => {
        test('Test an issue with all checked items and :shipit:', () => {
            mockGetIssue.mockResolvedValue(allClearIssue);
            mockListComments.mockResolvedValue(baseComments);
            return run().then(() => {
                expect(mockSetOutput).toHaveBeenCalledWith('HAS_DEPLOY_BLOCKERS', false);
            });
        });

        test('Test an issue with all boxes checked but no :shipit:', () => {
            mockGetIssue.mockResolvedValue(allClearIssue);
            const extraComments = {
                data: [
                    ...baseComments.data,
                    {body: 'This issue either has unchecked QA steps or has not yet been stamped with a :shipit: comment. Reopening!'},
                ],
            };
            mockListComments.mockResolvedValue(extraComments);
            return run().then(() => {
                expect(mockSetOutput).toHaveBeenCalledWith('HAS_DEPLOY_BLOCKERS', true);
            });
        });

        test('Test an issue with all boxes checked but no comments', () => {
            mockGetIssue.mockResolvedValue(allClearIssue);
            mockListComments.mockResolvedValue({data: []});
            return run().then(() => {
                expect(mockSetOutput).toHaveBeenCalledWith('HAS_DEPLOY_BLOCKERS', true);
            });
        });

        test('Test an issue with all QA checked but no accessibility', () => {
            mockGetIssue.mockResolvedValue(mockIssue([{url: 'https://github.com/Expensify/App/pull/6882', isQASuccess: true, isAccessibilitySuccess: false}]));
            mockListComments.mockResolvedValue(baseComments);
            return run().then(() => {
                expect(mockSetOutput).toHaveBeenCalledWith('HAS_DEPLOY_BLOCKERS', false);
            });
        });

        test('Test an issue with all QA checked but not all deploy blockers', () => {
            mockGetIssue.mockResolvedValue(mockIssue(
                [{url: 'https://github.com/Expensify/App/pull/6882', isQASuccess: true, isAccessibilitySuccess: false}],
                [{url: 'https://github.com/Expensify/App/pull/6883', isQASuccess: false}],
            ));
            mockListComments.mockResolvedValue(baseComments);
            return run().then(() => {
                expect(mockSetOutput).toHaveBeenCalledWith('HAS_DEPLOY_BLOCKERS', true);
            });
        });

        test('Test an issue with all QA checked and all deploy blockers resolved', () => {
            mockGetIssue.mockResolvedValue(mockIssue(
                [{url: 'https://github.com/Expensify/App/pull/6882', isQASuccess: true, isAccessibilitySuccess: false}],
                [{url: 'https://github.com/Expensify/App/pull/6883', isQASuccess: true}],
            ));
            mockListComments.mockResolvedValue(baseComments);
            return run().then(() => {
                expect(mockSetOutput).toHaveBeenCalledWith('HAS_DEPLOY_BLOCKERS', false);
            });
        });
    });
});
