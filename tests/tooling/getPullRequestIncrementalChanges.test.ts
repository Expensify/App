import type {Mock} from 'bun:test';
import {beforeAll, beforeEach, describe, expect, it, jest} from 'bun:test';

import run from '@github/actions/javascript/getPullRequestIncrementalChanges/getPullRequestIncrementalChanges';
import GitHubUtils from '@github/libs/GithubUtils';
import type {InternalOctokit} from '@github/libs/GithubUtils';

import Git from '@scripts/utils/Git';

import * as core from '@actions/core';
import {context} from '@actions/github';

import createMock from '../utils/createMock';

type ListFilesMethod = InternalOctokit['rest']['pulls']['listFiles'];
type ListFilesResponse = Awaited<ReturnType<ListFilesMethod>>;
type PaginateMethod = InternalOctokit['paginate'];

let internalOctokit: InternalOctokit;
let paginateSpy: Mock<PaginateMethod>;

const mockGetInput = jest.fn<typeof core.getInput>();

// Bun has no equivalent of `jest.mock(path)`'s automock, so stub the @actions/core functions this action calls
// explicitly. `@actions/github`'s `context` needs no stub: it is a plain mutable object, and beforeEach below
// overwrites every field this action reads, so whatever the real constructor loaded from the environment is
// irrelevant.
jest.spyOn(core, 'getInput').mockImplementation(mockGetInput);
const mockSetOutput = jest.spyOn(core, 'setOutput').mockImplementation(() => {});
jest.spyOn(core, 'warning').mockImplementation(() => {});
jest.spyOn(core, 'startGroup').mockImplementation(() => {});
jest.spyOn(core, 'endGroup').mockImplementation(() => {});
jest.spyOn(core, 'setFailed').mockImplementation(() => {});

// Mock Git methods. `Git`'s default export is a plain mutable object, so its methods can be overridden in place.
const mockGitEnsureRef = jest.fn();
const mockGitDiff = jest.fn();
const mockGitParseDiff = jest.fn();

Git.ensureRef = mockGitEnsureRef;
Git.diff = mockGitDiff;
Git.parseDiff = mockGitParseDiff;

// Mock GitHubUtils methods
const mockGetPullRequestDiff = jest.fn<typeof GitHubUtils.getPullRequestDiff>();

beforeAll(() => {
    GitHubUtils.initOctokitWithToken('fake_token');
    const initializedOctokit = GitHubUtils.internalOctokit;
    if (!initializedOctokit) {
        throw new Error('Expected GithubUtils to initialize an Octokit client.');
    }

    internalOctokit = initializedOctokit;
    paginateSpy = jest.spyOn(internalOctokit, 'paginate');
    jest.spyOn(GitHubUtils, 'getPullRequestDiff').mockImplementation(mockGetPullRequestDiff);
});

describe('getPullRequestIncrementalChanges', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        // Set up default context for synchronize events
        context.eventName = 'pull_request';
        context.payload = {
            action: 'synchronize',
            // eslint-disable-next-line @typescript-eslint/naming-convention
            pull_request: {number: 123},
            before: 'abc123',
            after: 'def456',
        };

        // Default mocks
        mockGetInput.mockReturnValue('');
        mockGitEnsureRef.mockResolvedValue(undefined);
        mockGetPullRequestDiff.mockReset();
        paginateSpy.mockReset();
        paginateSpy.mockResolvedValue([]);
    });

    it('returns empty array when no local changes', async () => {
        mockGitDiff.mockReturnValue({files: [], hasChanges: false});

        await run();

        expect(mockSetOutput).toHaveBeenCalledWith('CHANGED_FILES', JSON.stringify([]));
        expect(mockGetPullRequestDiff).not.toHaveBeenCalled();
    });

    it('detects overlapping content changes', async () => {
        // Local diff has a file with specific content
        mockGitDiff.mockReturnValue({
            files: [
                {
                    filePath: 'test.ts',
                    hunks: [
                        {
                            oldStart: 1,
                            oldCount: 0,
                            newStart: 1,
                            newCount: 1,
                            lines: [{lineNumber: 1, type: 'added', content: 'new content'}],
                        },
                    ],
                    addedLines: new Set([1]),
                    removedLines: new Set(),
                    modifiedLines: new Set(),
                },
            ],
            hasChanges: true,
        });

        // PR diff has the same content
        mockGitParseDiff.mockReturnValue({
            files: [
                {
                    filePath: 'test.ts',
                    hunks: [
                        {
                            oldStart: 1,
                            oldCount: 0,
                            newStart: 1,
                            newCount: 1,
                            lines: [{lineNumber: 1, type: 'added', content: 'new content'}],
                        },
                    ],
                    addedLines: new Set([1]),
                    removedLines: new Set(),
                    modifiedLines: new Set(),
                },
            ],
            hasChanges: true,
        });

        mockGetPullRequestDiff.mockResolvedValue('mock-diff-string');

        await run();

        expect(mockSetOutput).toHaveBeenCalledWith('CHANGED_FILES', JSON.stringify(['test.ts']));
    });

    it('filters out non-overlapping changes', async () => {
        // Local diff has different content than PR diff
        mockGitDiff.mockReturnValue({
            files: [
                {
                    filePath: 'test.ts',
                    hunks: [
                        {
                            oldStart: 1,
                            oldCount: 0,
                            newStart: 1,
                            newCount: 1,
                            lines: [{lineNumber: 1, type: 'added', content: 'local content'}],
                        },
                    ],
                    addedLines: new Set([1]),
                    removedLines: new Set(),
                    modifiedLines: new Set(),
                },
            ],
            hasChanges: true,
        });

        // PR diff has different content
        mockGitParseDiff.mockReturnValue({
            files: [
                {
                    filePath: 'test.ts',
                    hunks: [
                        {
                            oldStart: 1,
                            oldCount: 0,
                            newStart: 1,
                            newCount: 1,
                            lines: [{lineNumber: 1, type: 'added', content: 'pr content'}],
                        },
                    ],
                    addedLines: new Set([1]),
                    removedLines: new Set(),
                    modifiedLines: new Set(),
                },
            ],
            hasChanges: true,
        });

        mockGetPullRequestDiff.mockResolvedValue('mock-diff-string');

        await run();

        expect(mockSetOutput).toHaveBeenCalledWith('CHANGED_FILES', JSON.stringify([]));
    });

    it('handles error when Git.ensureRef fails', async () => {
        mockGitEnsureRef.mockRejectedValue(new Error('Failed to fetch ref'));

        await expect(run()).rejects.toThrow('Failed to fetch ref');
    });

    it('handles error when Git.diff fails', async () => {
        mockGitDiff.mockImplementation(() => {
            throw new Error('Git diff failed');
        });

        await expect(run()).rejects.toThrow('Git diff failed');
    });

    it('handles opened action correctly', async () => {
        // Set up opened action context
        context.payload = {
            action: 'opened',
            // eslint-disable-next-line @typescript-eslint/naming-convention
            pull_request: {number: 123},
        };

        // Mock paginate to return PR files
        paginateSpy.mockResolvedValue(createMock<ListFilesResponse['data']>([{filename: 'src/file1.ts'}, {filename: 'src/file2.ts'}]));

        await run();

        expect(mockSetOutput).toHaveBeenCalledWith('CHANGED_FILES', JSON.stringify(['src/file1.ts', 'src/file2.ts']));
        expect(mockGitDiff).not.toHaveBeenCalled(); // Should not do git operations for opened
    });

    it('validates event type', async () => {
        context.eventName = 'push';

        await expect(run()).rejects.toThrow('This action can only be run on pull_request events, but was run on: push');
    });

    it('validates action type', async () => {
        // Reset mocks to default behavior for this test
        mockGitDiff.mockReturnValue({files: [], hasChanges: false});

        context.payload = {
            action: 'closed',
            // eslint-disable-next-line @typescript-eslint/naming-convention
            pull_request: {number: 123},
        };

        await expect(run()).rejects.toThrow('This action can only be run on pull_request opened or synchronize events, but was run on: closed');
    });

    it('works with PULL_REQUEST_NUMBER input on non-pull_request events', async () => {
        // Set up a non-pull_request event
        context.eventName = 'workflow_dispatch';
        context.payload = {};

        // Provide PULL_REQUEST_NUMBER input
        mockGetInput.mockImplementation((inputName: string) => {
            if (inputName === 'PULL_REQUEST_NUMBER') {
                return '456';
            }
            return '';
        });

        // Mock paginate to return PR files
        paginateSpy.mockResolvedValue(createMock<ListFilesResponse['data']>([{filename: 'src/test.ts'}]));

        await run();

        expect(mockSetOutput).toHaveBeenCalledWith('CHANGED_FILES', JSON.stringify(['src/test.ts']));
        expect(mockGitDiff).not.toHaveBeenCalled(); // Should not do git operations when PR number is provided
    });

    it('throws error when no PULL_REQUEST_NUMBER and not pull_request event', async () => {
        context.eventName = 'workflow_dispatch';
        context.payload = {};

        await expect(run()).rejects.toThrow(
            'This action can only be run on pull_request events, but was run on: workflow_dispatch. Provide PULL_REQUEST_NUMBER input to use with other event types.',
        );
    });
});
