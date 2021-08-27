/**
 * @jest-environment node
 */
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

afterEach(() => {
    mockSetOutput.mockClear();
    mockGetIssue.mockClear();
    mockListComments.mockClear();
});

afterAll(() => {
    jest.clearAllMocks();
});

describe('checkDeployBlockers', () => {
    const baseIssue = {
        data: {
            number: 1,
            title: 'Scott\'s Unfinished QA Checklist',
            body: 'Checklist for Deploy #668\r\n'
            + '- [x] @foo https://github.com/Expensify/App/issues/1',
        },
    };

    const baseComments = {
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

    describe('checkDeployBlockers', () => {
        test('Test an issue with a checked item and :shipit:', () => {
            mockGetIssue.mockResolvedValue(baseIssue);
            mockListComments.mockResolvedValue(baseComments);
            return run().then(() => {
                expect(mockSetOutput).toHaveBeenCalledWith('HAS_DEPLOY_BLOCKERS', false);
            });
        });

        test('Test an issue with an unchecked item and :shipit:', () => {
            const uncheckedItemIssue = baseIssue;
            uncheckedItemIssue.data.body += '\r\n- [ ] @bar https://github.com/Expensify/App/issues/23';
            mockGetIssue.mockResolvedValue(uncheckedItemIssue);
            mockListComments.mockResolvedValue(baseComments);
            return run().then(() => {
                expect(mockSetOutput).toHaveBeenCalledWith('HAS_DEPLOY_BLOCKERS', true);
            });
        });

        test('Test an issue with all boxes checked but no :shipit:', () => {
            const checkedBoxesNoShipitIssue = baseIssue;
            checkedBoxesNoShipitIssue.data.body = 'Checklist for Deploy #668:\r\n'
                + '- [x] @bar https://github.com/Expensify/App/issues/23\r\n'
                + '- [x] @baz https://github.com/Expensify/App/issues/42';
            mockGetIssue.mockResolvedValue(checkedBoxesNoShipitIssue);
            // eslint-disable-next-line max-len
            baseComments.data.push({body: 'This issue either has unchecked QA steps or has not yet been stamped with a :shipit: comment. Reopening!'});
            baseComments.data.push({body: 'This is another comment!'});
            mockListComments.mockResolvedValue(baseComments);
            return run().then(() => {
                expect(mockSetOutput).toHaveBeenCalledWith('HAS_DEPLOY_BLOCKERS', true);
            });
        });

        test('Test an issue with all boxes checked but no comments', () => {
            mockGetIssue.mockResolvedValue(baseIssue);
            mockListComments.mockResolvedValue({data: []});
            return run().then(() => {
                expect(mockSetOutput).toHaveBeenCalledWith('HAS_DEPLOY_BLOCKERS', true);
            });
        });
    });
});
