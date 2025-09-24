/**
 * @jest-environment node
 */
import * as core from '@actions/core';
import {context} from '@actions/github';
import {execSync} from 'child_process';
import run from '@github/actions/javascript/getPullRequestIncrementalChanges/getPullRequestIncrementalChanges';
import GitHubUtils from '@github/libs/GithubUtils';
import dedent from '@libs/StringUtils/dedent';

// Mock dependencies
jest.mock('child_process');
jest.mock('@actions/core');
jest.mock('@actions/github');
jest.mock('@github/libs/GithubUtils');

const mockExecSync = execSync as jest.MockedFunction<typeof execSync>;
const mockSetOutput = core.setOutput as jest.MockedFunction<typeof core.setOutput>;
const mockGetInput = jest.fn();
const mockGetPullRequestDiff = GitHubUtils.getPullRequestDiff as jest.MockedFunction<typeof GitHubUtils.getPullRequestDiff>;
const mockPaginate = jest.fn();

// Mock GitHubUtils.paginate
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
(GitHubUtils as any).paginate = mockPaginate;

// Mock @actions/core getInput function
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
(core as any).getInput = mockGetInput;

describe('getPullRequestIncrementalChanges', () => {
    const mockContext = {
        eventName: 'pull_request',
        payload: {
            action: 'synchronize',
            // eslint-disable-next-line @typescript-eslint/naming-convention
            pull_request: {
                number: 123,
            },
            before: 'abc123',
            after: 'def456',
        },
    };

    beforeEach(() => {
        jest.clearAllMocks();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        (context as any).eventName = mockContext.eventName;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        (context as any).payload = mockContext.payload;
        mockGetInput.mockReturnValue(null); // Default: no FILE_PATHS input
    });

    describe('event validation', () => {
        it('throws error when not run on pull_request event', async () => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            (context as any).eventName = 'push';

            await expect(run()).rejects.toThrow('This action can only be run on pull_request events, but was run on: push');
        });

        it('throws error when action is not opened or synchronize', async () => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            (context as any).payload = {...mockContext.payload, action: 'closed'};

            await expect(run()).rejects.toThrow('This action can only be run on pull_request opened or synchronize events, but was run on: closed');
        });
    });

    describe('opened action', () => {
        it('returns all PR files when action is opened', async () => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            (context as any).payload = {...mockContext.payload, action: 'opened'};

            // Mock GitHubUtils.paginate to return PR files
            mockPaginate.mockResolvedValue([{filename: 'src/file1.ts'}, {filename: 'src/file2.ts'}, {filename: 'package.json'}]);

            await run();

            expect(mockSetOutput).toHaveBeenCalledWith('CHANGED_FILES', JSON.stringify(['src/file1.ts', 'src/file2.ts', 'package.json']));
            expect(mockExecSync).not.toHaveBeenCalled(); // Should not do git operations for 'opened'
        });

        it('filters PR files when FILE_PATHS is provided for opened action', async () => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            (context as any).payload = {...mockContext.payload, action: 'opened'};
            mockGetInput.mockReturnValue('["src/file1.ts", "package.json"]');

            mockPaginate.mockResolvedValue([{filename: 'src/file1.ts'}, {filename: 'src/file2.ts'}, {filename: 'package.json'}]);

            await run();

            expect(mockSetOutput).toHaveBeenCalledWith('CHANGED_FILES', JSON.stringify(['src/file1.ts', 'package.json']));
        });
    });

    describe('git ref handling', () => {
        it('fetches missing beforeSha when not available locally', async () => {
            // Mock: beforeSha is not valid initially, but becomes valid after fetch
            let beforeShaValid = false;
            mockExecSync.mockImplementation((command: string) => {
                if (command.includes('git rev-parse --verify "abc123"')) {
                    if (beforeShaValid) {
                        return 'abc123\n';
                    }
                    throw new Error("fatal: bad revision 'abc123'");
                }
                if (command.includes('git fetch --no-tags --depth=1 origin abc123')) {
                    beforeShaValid = true;
                    return '';
                }
                if (command.includes('git rev-parse --verify "def456"')) {
                    return 'def456\n';
                }
                return '';
            });

            mockGetPullRequestDiff.mockResolvedValue('');

            await run();

            expect(mockExecSync).toHaveBeenCalledWith('git fetch --no-tags --depth=1 origin abc123', {
                encoding: 'utf8',
                cwd: process.cwd(),
            });
        });

        it('throws error when ref cannot be fetched', async () => {
            mockExecSync.mockImplementation((command: string) => {
                if (command.includes('git rev-parse --verify "abc123"')) {
                    throw new Error("fatal: bad revision 'abc123'");
                }
                if (command.includes('git fetch --no-tags --depth=1 origin abc123')) {
                    return ''; // Fetch succeeds but ref still invalid
                }
                return '';
            });

            await expect(run()).rejects.toThrow('Reference abc123 is still not valid after fetching');
        });
    });

    describe('no local changes scenarios', () => {
        it('returns empty array when no files changed locally', async () => {
            // Mock valid refs
            mockExecSync.mockImplementation((command: string) => {
                if (command.includes('git rev-parse --verify')) {
                    return 'valid-sha\n';
                }
                if (command.includes('git diff -U0 abc123 def456')) {
                    return ''; // No changes
                }
                return '';
            });

            await run();

            expect(mockSetOutput).toHaveBeenCalledWith('CHANGED_FILES', JSON.stringify([]));
            expect(mockGetPullRequestDiff).not.toHaveBeenCalled(); // Should skip API calls
        });

        it('returns empty array when specified files have no local changes', async () => {
            mockGetInput.mockReturnValue('["src/languages/en.ts", "package.json"]');

            mockExecSync.mockImplementation((command: string) => {
                if (command.includes('git rev-parse --verify')) {
                    return 'valid-sha\n';
                }
                if (command.includes('git diff -U0 abc123 def456 -- "src/languages/en.ts" "package.json"')) {
                    return ''; // No changes in specified files
                }
                return '';
            });

            await run();

            expect(mockSetOutput).toHaveBeenCalledWith('CHANGED_FILES', JSON.stringify([]));
            expect(mockGetPullRequestDiff).not.toHaveBeenCalled();
        });
    });

    describe('file change detection', () => {
        it('detects actual PR changes when content overlaps', async () => {
            mockExecSync.mockImplementation((command: string) => {
                if (command.includes('git rev-parse --verify')) {
                    return 'valid-sha\n';
                }
                if (command.includes('git diff -U0 abc123 def456')) {
                    return dedent(`
                        diff --git a/src/languages/en.ts b/src/languages/en.ts
                        index 1234567..abcdefg 100644
                        --- a/src/languages/en.ts
                        +++ b/src/languages/en.ts
                        @@ -100,0 +100,1 @@
                        +    newKey: 'New translation',
                    `);
                }
                return '';
            });

            // Mock PR diff with the same content
            mockGetPullRequestDiff.mockResolvedValue(
                dedent(`
                diff --git a/src/languages/en.ts b/src/languages/en.ts
                index 7890abc..xyz789 100644
                --- a/src/languages/en.ts
                +++ b/src/languages/en.ts
                @@ -95,0 +95,1 @@
                +    newKey: 'New translation',
            `),
            );

            await run();

            expect(mockSetOutput).toHaveBeenCalledWith('CHANGED_FILES', JSON.stringify(['src/languages/en.ts']));
        });

        it('filters out changes from merged commits when content does not overlap', async () => {
            mockExecSync.mockImplementation((command: string) => {
                if (command.includes('git rev-parse --verify')) {
                    return 'valid-sha\n';
                }
                if (command.includes('git diff -U0 abc123 def456')) {
                    return dedent(`
                        diff --git a/src/languages/en.ts b/src/languages/en.ts
                        index 1234567..abcdefg 100644
                        --- a/src/languages/en.ts
                        +++ b/src/languages/en.ts
                        @@ -100,0 +100,1 @@
                        +    equalTo: 'Equal to',
                    `);
                }
                return '';
            });

            // Mock PR diff with different content (actual PR changes)
            mockGetPullRequestDiff.mockResolvedValue(
                dedent(`
                diff --git a/src/languages/en.ts b/src/languages/en.ts
                index 7890abc..xyz789 100644
                --- a/src/languages/en.ts
                +++ b/src/languages/en.ts
                @@ -95,0 +95,1 @@
                +    myFeature: 'My Feature',
            `),
            );

            await run();

            expect(mockSetOutput).toHaveBeenCalledWith('CHANGED_FILES', JSON.stringify([]));
        });

        it('handles mixed scenario with some overlapping and some non-overlapping changes', async () => {
            mockExecSync.mockImplementation((command: string) => {
                if (command.includes('git rev-parse --verify')) {
                    return 'valid-sha\n';
                }
                if (command.includes('git diff -U0 abc123 def456')) {
                    return dedent(`
                        diff --git a/src/languages/en.ts b/src/languages/en.ts
                        index 1234567..abcdefg 100644
                        --- a/src/languages/en.ts
                        +++ b/src/languages/en.ts
                        @@ -100,0 +100,2 @@
                        +    equalTo: 'Equal to',
                        +    myFeature: 'My Feature',
                        diff --git a/package.json b/package.json
                        index 7890abc..xyz789 100644
                        --- a/package.json
                        +++ b/package.json
                        @@ -5,1 +5,1 @@
                        -  "version": "1.0.0",
                        +  "version": "1.0.1",
                    `);
                }
                return '';
            });

            // Mock PR diff with only some overlapping content
            mockGetPullRequestDiff.mockResolvedValue(
                dedent(`
                diff --git a/src/languages/en.ts b/src/languages/en.ts
                index 7890abc..xyz789 100644
                --- a/src/languages/en.ts
                +++ b/src/languages/en.ts
                @@ -95,0 +95,1 @@
                +    myFeature: 'My Feature',
            `),
            );

            await run();

            // Only en.ts should be detected (has overlapping content), package.json should not (not in PR diff)
            expect(mockSetOutput).toHaveBeenCalledWith('CHANGED_FILES', JSON.stringify(['src/languages/en.ts']));
        });

        it('handles removals and additions with overlapping content', async () => {
            mockExecSync.mockImplementation((command: string) => {
                if (command.includes('git rev-parse --verify')) {
                    return 'valid-sha\n';
                }
                if (command.includes('git diff -U0 abc123 def456')) {
                    return dedent(`
                        diff --git a/src/file.ts b/src/file.ts
                        index 1234567..abcdefg 100644
                        --- a/src/file.ts
                        +++ b/src/file.ts
                        @@ -10,1 +10,1 @@
                        -    oldValue: 'Old',
                        +    newValue: 'New',
                    `);
                }
                return '';
            });

            // Mock PR diff where the same content was removed (different context)
            mockGetPullRequestDiff.mockResolvedValue(
                dedent(`
                diff --git a/src/file.ts b/src/file.ts
                index 7890abc..xyz789 100644
                --- a/src/file.ts
                +++ b/src/file.ts
                @@ -8,1 +8,0 @@
                -    oldValue: 'Old',
            `),
            );

            await run();

            // Should detect overlap because 'oldValue: 'Old'' appears in both diffs
            expect(mockSetOutput).toHaveBeenCalledWith('CHANGED_FILES', JSON.stringify(['src/file.ts']));
        });
    });

    describe('file path filtering', () => {
        it('checks only specified files when FILE_PATHS is provided', async () => {
            mockGetInput.mockReturnValue('["src/languages/en.ts"]');

            mockExecSync.mockImplementation((command: string) => {
                if (command.includes('git rev-parse --verify')) {
                    return 'valid-sha\n';
                }
                if (command.includes('git diff -U0 abc123 def456 -- "src/languages/en.ts"')) {
                    return dedent(`
                        diff --git a/src/languages/en.ts b/src/languages/en.ts
                        index 1234567..abcdefg 100644
                        --- a/src/languages/en.ts
                        +++ b/src/languages/en.ts
                        @@ -100,0 +100,1 @@
                        +    newKey: 'New value',
                    `);
                }
                return '';
            });

            mockGetPullRequestDiff.mockResolvedValue(
                dedent(`
                diff --git a/src/languages/en.ts b/src/languages/en.ts
                index 7890abc..xyz789 100644
                --- a/src/languages/en.ts
                +++ b/src/languages/en.ts
                @@ -95,0 +95,1 @@
                +    newKey: 'New value',
                diff --git a/other/file.ts b/other/file.ts
                index 111222..333444 100644
                --- a/other/file.ts
                +++ b/other/file.ts
                @@ -1,0 +1,1 @@
                +    ignoredChange: 'This should be ignored',
            `),
            );

            await run();

            // Should only check the specified file, ignore others in PR diff
            expect(mockSetOutput).toHaveBeenCalledWith('CHANGED_FILES', JSON.stringify(['src/languages/en.ts']));
            expect(mockExecSync).toHaveBeenCalledWith(expect.stringContaining('-- "src/languages/en.ts"'), expect.any(Object));
        });

        it('checks all files when FILE_PATHS is not provided', async () => {
            mockGetInput.mockReturnValue(null);

            mockExecSync.mockImplementation((command: string) => {
                if (command.includes('git rev-parse --verify')) {
                    return 'valid-sha\n';
                }
                if (command.includes('git diff -U0 abc123 def456') && !command.includes('--')) {
                    return dedent(`
                        diff --git a/src/file1.ts b/src/file1.ts
                        index 1234567..abcdefg 100644
                        --- a/src/file1.ts
                        +++ b/src/file1.ts
                        @@ -1,0 +1,1 @@
                        +    change1: 'Change 1',
                        diff --git a/src/file2.ts b/src/file2.ts
                        index 7890abc..xyz789 100644
                        --- a/src/file2.ts
                        +++ b/src/file2.ts
                        @@ -1,0 +1,1 @@
                        +    change2: 'Change 2',
                    `);
                }
                return '';
            });

            mockGetPullRequestDiff.mockResolvedValue(
                dedent(`
                diff --git a/src/file1.ts b/src/file1.ts
                index 1234567..abcdefg 100644
                --- a/src/file1.ts
                +++ b/src/file1.ts
                @@ -1,0 +1,1 @@
                +    change1: 'Change 1',
            `),
            );

            await run();

            // Should detect file1 (overlapping content) but not file2 (not in PR diff)
            expect(mockSetOutput).toHaveBeenCalledWith('CHANGED_FILES', JSON.stringify(['src/file1.ts']));
            expect(mockExecSync).toHaveBeenCalledWith('git diff -U0 abc123 def456', expect.any(Object));
        });
    });

    describe('edge cases', () => {
        it('handles empty PR diff', async () => {
            mockExecSync.mockImplementation((command: string) => {
                if (command.includes('git rev-parse --verify')) {
                    return 'valid-sha\n';
                }
                if (command.includes('git diff -U0 abc123 def456')) {
                    return dedent(`
                        diff --git a/src/file.ts b/src/file.ts
                        index 1234567..abcdefg 100644
                        --- a/src/file.ts
                        +++ b/src/file.ts
                        @@ -1,0 +1,1 @@
                        +    change: 'Local change',
                    `);
                }
                return '';
            });

            mockGetPullRequestDiff.mockResolvedValue(''); // Empty PR diff

            await run();

            expect(mockSetOutput).toHaveBeenCalledWith('CHANGED_FILES', JSON.stringify([]));
        });

        it('handles malformed PR diff response', async () => {
            mockExecSync.mockImplementation((command: string) => {
                if (command.includes('git rev-parse --verify')) {
                    return 'valid-sha\n';
                }
                return '';
            });

            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
            mockGetPullRequestDiff.mockResolvedValue(123 as any); // Invalid response type

            await expect(run()).rejects.toThrow('Expected PR diff to be a string, but got: number');
        });

        it('handles complex diff with multiple hunks and files', async () => {
            mockExecSync.mockImplementation((command: string) => {
                if (command.includes('git rev-parse --verify')) {
                    return 'valid-sha\n';
                }
                if (command.includes('git diff -U0 abc123 def456')) {
                    return dedent(`
                        diff --git a/src/file1.ts b/src/file1.ts
                        index 1234567..abcdefg 100644
                        --- a/src/file1.ts
                        +++ b/src/file1.ts
                        @@ -10,1 +10,1 @@
                        -    oldLine: 'old',
                        +    newLine: 'new',
                        @@ -20,0 +20,1 @@
                        +    addedLine: 'added',
                        diff --git a/src/file2.ts b/src/file2.ts
                        index 7890abc..xyz789 100644
                        --- a/src/file2.ts
                        +++ b/src/file2.ts
                        @@ -5,1 +5,0 @@
                        -    removedLine: 'removed',
                    `);
                }
                return '';
            });

            mockGetPullRequestDiff.mockResolvedValue(
                dedent(`
                diff --git a/src/file1.ts b/src/file1.ts
                index 1234567..abcdefg 100644
                --- a/src/file1.ts
                +++ b/src/file1.ts
                @@ -15,0 +15,1 @@
                +    newLine: 'new',
                @@ -25,0 +25,1 @@
                +    addedLine: 'added',
                diff --git a/src/file3.ts b/src/file3.ts
                index 111222..333444 100644
                --- a/src/file3.ts
                +++ b/src/file3.ts
                @@ -1,0 +1,1 @@
                +    unrelatedChange: 'unrelated',
            `),
            );

            await run();

            // Only file1 should be detected (has overlapping content)
            // file2 has local changes but not in PR diff
            // file3 is in PR diff but no local changes
            expect(mockSetOutput).toHaveBeenCalledWith('CHANGED_FILES', JSON.stringify(['src/file1.ts']));
        });
    });

    describe('error handling', () => {
        it('fails when git diff command fails', async () => {
            mockExecSync.mockImplementation((command: string) => {
                if (command.includes('git rev-parse --verify')) {
                    return 'valid-sha\n';
                }
                if (command.includes('git diff -U0')) {
                    throw new Error('fatal: not a git repository');
                }
                return '';
            });

            await expect(run()).rejects.toThrow('fatal: not a git repository');
        });

        it('fails when GitHub API call fails', async () => {
            mockExecSync.mockImplementation((command: string) => {
                if (command.includes('git rev-parse --verify')) {
                    return 'valid-sha\n';
                }
                if (command.includes('git diff -U0 abc123 def456')) {
                    return dedent(`
                        diff --git a/src/file.ts b/src/file.ts
                        index 1234567..abcdefg 100644
                        --- a/src/file.ts
                        +++ b/src/file.ts
                        @@ -1,0 +1,1 @@
                        +    change: 'change',
                    `);
                }
                return '';
            });

            mockGetPullRequestDiff.mockRejectedValue(new Error('API rate limit exceeded'));

            await expect(run()).rejects.toThrow('API rate limit exceeded');
        });
    });
});
