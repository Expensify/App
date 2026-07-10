import run from '@github/actions/javascript/getPullRequestIncrementalChanges/getPullRequestIncrementalChanges';
import type {InternalOctokit} from '@github/libs/GithubUtils';
import GitHubUtils from '@github/libs/GithubUtils';

import Git from '@scripts/utils/Git';

import * as core from '@actions/core';
import {context} from '@actions/github';
import {afterAll, beforeEach, describe, expect, it, jest} from 'bun:test';

const mockGetInput = jest.fn();

// Mock @actions/core. Real ESM module namespace exports are read-only live bindings, so these can't be reassigned
// directly (unlike Jest's Babel-transpiled CJS interop); spy on them instead. `@actions/github`'s `context` is a
// plain mutable object instance (not a live binding itself), and its constructor is a no-op without
// GITHUB_EVENT_PATH set, so it's safe to mutate directly below without mocking the module.
jest.spyOn(core, 'getInput').mockImplementation(mockGetInput);
const mockSetOutput = jest.spyOn(core, 'setOutput').mockImplementation(() => {});
jest.spyOn(core, 'warning').mockImplementation(() => {});
jest.spyOn(core, 'startGroup').mockImplementation(() => {});
jest.spyOn(core, 'endGroup').mockImplementation(() => {});
jest.spyOn(core, 'setFailed').mockImplementation(() => {});

// Mock Git methods. `Git`'s default export is a plain mutable object (unlike named exports on a module namespace,
// which are read-only live bindings), so its static-like methods can be overridden in place.
// eslint-disable-next-line @typescript-eslint/unbound-method -- captured only for restoration in afterAll, never called unbound
const originalGitEnsureRef = Git.ensureRef;
// eslint-disable-next-line @typescript-eslint/unbound-method -- captured only for restoration in afterAll, never called unbound
const originalGitDiff = Git.diff;
// eslint-disable-next-line @typescript-eslint/unbound-method -- captured only for restoration in afterAll, never called unbound
const originalGitParseDiff = Git.parseDiff;
const mockGitEnsureRef = jest.fn();
const mockGitDiff = jest.fn();
const mockGitParseDiff = jest.fn();

Git.ensureRef = mockGitEnsureRef;
Git.diff = mockGitDiff;
Git.parseDiff = mockGitParseDiff;

// Mock GitHubUtils methods
// eslint-disable-next-line @typescript-eslint/unbound-method -- captured only for restoration in afterAll, never called unbound
const originalGetPullRequestDiff = GitHubUtils.getPullRequestDiff;
const mockGetPullRequestDiff = jest.fn();
GitHubUtils.getPullRequestDiff = mockGetPullRequestDiff;

afterAll(() => {
    Git.ensureRef = originalGitEnsureRef;
    Git.diff = originalGitDiff;
    Git.parseDiff = originalGitParseDiff;
    GitHubUtils.getPullRequestDiff = originalGetPullRequestDiff;
    // `bun test` runs all files in one process sharing GithubUtils' module-level state, unlike Jest's per-file
    // module registry; reset it so later test files re-initialize their own octokit mock from scratch.
    GitHubUtils.internalOctokit = undefined;
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
        mockGetInput.mockReturnValue(null);
        mockGitEnsureRef.mockResolvedValue(undefined);
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

        // Mock paginate/octokit to return PR files. `GitHubUtils.paginate`/`.octokit` are getters derived from
        // `internalOctokit` with no setter, so they can't be reassigned directly; set the backing field instead.
        const mockPaginate = jest.fn().mockResolvedValue([{filename: 'src/file1.ts'}, {filename: 'src/file2.ts'}]);
        GitHubUtils.internalOctokit = {rest: {pulls: {listFiles: jest.fn()}}, paginate: mockPaginate} as unknown as InternalOctokit;

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
            return null;
        });

        // Mock paginate/octokit to return PR files. `GitHubUtils.paginate`/`.octokit` are getters derived from
        // `internalOctokit` with no setter, so they can't be reassigned directly; set the backing field instead.
        const mockPaginate = jest.fn().mockResolvedValue([{filename: 'src/test.ts'}]);
        GitHubUtils.internalOctokit = {rest: {pulls: {listFiles: jest.fn()}}, paginate: mockPaginate} as unknown as InternalOctokit;

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
