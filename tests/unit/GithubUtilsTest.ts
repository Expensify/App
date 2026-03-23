/**
 * @jest-environment node
 */
/* eslint-disable @typescript-eslint/naming-convention */
import * as core from '@actions/core';
import {RequestError} from '@octokit/request-error';
import type {Writable} from 'type-fest';
import CONST from '@github/libs/CONST';
import type {InternalOctokit} from '@github/libs/GithubUtils';
import GithubUtils from '@github/libs/GithubUtils';

const mockGetInput = jest.fn();
const mockListIssues = jest.fn();

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
                                date: '2024-01-01T00:00:00Z',
                            },
                            committer: {
                                date: '2024-01-01T00:00:00Z',
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
                date: '2024-01-01T00:00:00Z',
            },
        ],
        multipleCommitsResponse: {
            data: {
                commits: [
                    {
                        sha: 'abc123',
                        commit: {
                            message: 'First commit',
                            author: {name: 'Author One', date: '2024-01-02T00:00:00Z'},
                            committer: {date: '2024-01-02T00:00:00Z'},
                        },
                    },
                    {
                        sha: 'def456',
                        commit: {
                            message: 'Second commit',
                            author: {name: 'Author Two', date: '2024-01-03T00:00:00Z'},
                            committer: {date: '2024-01-03T00:00:00Z'},
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
                date: '2024-01-02T00:00:00Z',
            });
            expect(result.at(1)).toEqual({
                commit: 'def456',
                subject: 'Second commit',
                authorName: 'Author Two',
                date: '2024-01-03T00:00:00Z',
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
