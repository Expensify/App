/**
 * @jest-environment node
 */
import {execSync} from 'child_process';
import fs from 'fs';
import dedent from '@libs/StringUtils/dedent';
import Git from '@scripts/utils/Git';

// Mock execSync to control git diff output
jest.mock('child_process');
const mockExecSync = execSync as jest.MockedFunction<typeof execSync>;

// Test constants for untracked files tests
const MOCK_COMPONENT_CONTENT = 'const Component = () => null;\n';
const MOCK_MULTI_LINE_COMPONENT_CONTENT = 'const Component = () => {\n  return <div>Hello</div>;\n};\n\nexport default Component;\n';
const UNTRACKED_FILE_PATH = 'src/untracked.tsx';

/**
 * Helper to create a mock implementation for execSync that handles both git diff and git ls-files commands.
 */
function createMockExecSync(diffOutput: string, untrackedFilesOutput: string) {
    return (command: string) => {
        if (command.includes('git diff')) {
            return diffOutput;
        }
        if (command.includes('git ls-files')) {
            return untrackedFilesOutput;
        }
        return '';
    };
}

describe('Git', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    describe('isValidRef', () => {
        it('returns true for valid git references', () => {
            mockExecSync.mockReturnValue('abc123def456\n');

            const result = Git.isValidRef('main');

            expect(result).toBe(true);
            expect(mockExecSync).toHaveBeenCalledWith('git rev-parse --verify "main^{object}"', {
                encoding: 'utf8',
                cwd: process.cwd(),
                stdio: 'pipe',
            });
        });

        it('returns false for invalid git references', () => {
            mockExecSync.mockImplementation(() => {
                throw new Error("fatal: bad revision 'invalid-ref'");
            });

            const result = Git.isValidRef('invalid-ref');

            expect(result).toBe(false);
        });

        it('returns true for commit hashes', () => {
            mockExecSync.mockReturnValue('abc123def456\n');

            const result = Git.isValidRef('abc123def456');

            expect(result).toBe(true);
        });

        it('returns true for tags', () => {
            mockExecSync.mockReturnValue('abc123def456\n');

            const result = Git.isValidRef('v1.0.0');

            expect(result).toBe(true);
        });
    });

    describe('diff', () => {
        it('returns empty result when no changes exist', () => {
            mockExecSync.mockReturnValue('');

            const result = Git.diff('main');

            expect(result).toEqual({
                files: [],
                hasChanges: false,
            });
            expect(mockExecSync).toHaveBeenCalledWith('git diff -U0 main', {
                encoding: 'utf8',
                cwd: process.cwd(),
            });
        });

        it('handles simple single file diff with additions and removals', () => {
            const mockDiffOutput = dedent(`
                diff --git a/src/file.ts b/src/file.ts
                index 1234567..abcdefg 100644
                --- a/src/file.ts
                +++ b/src/file.ts
                @@ -2,1 +2,2 @@
                -const farewell = 'Goodbye';
                +const farewell = 'Farewell';
                +const newLine = 'New';
            `);

            mockExecSync.mockReturnValue(mockDiffOutput);

            const result = Git.diff('main', 'feature');

            expect(result.hasChanges).toBe(true);
            expect(result.files).toHaveLength(1);

            const file = result.files.at(0);
            expect(file).toBeDefined();
            if (!file) {
                return;
            }

            expect(file.filePath).toBe('src/file.ts');
            expect(file.hunks).toHaveLength(1);

            const hunk = file.hunks.at(0);
            expect(hunk).toBeDefined();
            if (!hunk) {
                return;
            }
            expect(hunk.oldStart).toBe(2);
            expect(hunk.oldCount).toBe(1);
            expect(hunk.newStart).toBe(2);
            expect(hunk.newCount).toBe(2);

            expect(hunk.lines).toHaveLength(3);
            expect(hunk.lines.at(0)).toEqual({
                number: 2,
                type: 'removed',
                content: "const farewell = 'Goodbye';",
            });
            expect(hunk.lines.at(1)).toEqual({
                number: 2,
                type: 'added',
                content: "const farewell = 'Farewell';",
            });
            expect(hunk.lines.at(2)).toEqual({
                number: 3,
                type: 'added',
                content: "const newLine = 'New';",
            });

            // 1 removed, 2 added = 1 modified + 1 added
            expect(file.modifiedLines.size).toBe(1);
            expect(Array.from(file.addedLines)).toEqual([3]);
            expect(Array.from(file.removedLines)).toEqual([]);
        });

        it('handles multiple hunks in a single file', () => {
            const mockDiffOutput = dedent(`
                diff --git a/src/file.ts b/src/file.ts
                index 1234567..abcdefg 100644
                --- a/src/file.ts
                +++ b/src/file.ts
                @@ -1,1 +1,1 @@
                -const old1 = 'old';
                +const new1 = 'new';
                @@ -10,1 +10,2 @@
                -const old2 = 'old';
                +const new2 = 'new';
                +const added = 'added';
            `);

            mockExecSync.mockReturnValue(mockDiffOutput);

            const result = Git.diff('main');

            expect(result.hasChanges).toBe(true);
            expect(result.files).toHaveLength(1);

            const file = result.files.at(0);
            expect(file).toBeDefined();
            if (!file) {
                return;
            }
            expect(file.hunks).toHaveLength(2);

            // First hunk
            const firstHunk = file.hunks.at(0);
            expect(firstHunk).toBeDefined();
            if (firstHunk) {
                expect(firstHunk.oldStart).toBe(1);
                expect(firstHunk.newStart).toBe(1);
            }

            // Second hunk
            const secondHunk = file.hunks.at(1);
            expect(secondHunk).toBeDefined();
            if (secondHunk) {
                expect(secondHunk.oldStart).toBe(10);
                expect(secondHunk.newStart).toBe(10);
            }

            // First hunk: 1 removed, 1 added = 1 modified
            // Second hunk: 1 removed, 2 added = 1 modified + 1 added
            expect(file.modifiedLines.size).toBe(2);
            expect(Array.from(file.addedLines)).toEqual([11]);
            expect(Array.from(file.removedLines)).toEqual([]);
        });

        it('handles multiple files in diff', () => {
            const mockDiffOutput = dedent(`
                diff --git a/src/file1.ts b/src/file1.ts
                index 1234567..abcdefg 100644
                --- a/src/file1.ts
                +++ b/src/file1.ts
                @@ -1,1 +1,1 @@
                -old content
                +new content
                diff --git a/src/file2.ts b/src/file2.ts
                index 7890abc..word123 100644
                --- a/src/file2.ts
                +++ b/src/file2.ts
                @@ -2,0 +2,1 @@
                +added line
            `);

            mockExecSync.mockReturnValue(mockDiffOutput);

            const result = Git.diff('main', 'HEAD');

            expect(result.hasChanges).toBe(true);
            expect(result.files).toHaveLength(2);

            const file1 = result.files.at(0);
            const file2 = result.files.at(1);
            expect(file1).toBeDefined();
            expect(file2).toBeDefined();
            if (!file1 || !file2) {
                return;
            }

            expect(file1.filePath).toBe('src/file1.ts');
            expect(file2.filePath).toBe('src/file2.ts');

            // 1 removed, 1 added = 1 modified
            expect(file1.modifiedLines.size).toBe(1);
            expect(Array.from(file1.addedLines)).toEqual([]);
            expect(Array.from(file1.removedLines)).toEqual([]);

            expect(Array.from(file2.addedLines)).toEqual([2]);
            expect(file2.removedLines.size).toBe(0);
        });

        it('handles diff with specific file path', () => {
            const mockDiffOutput = dedent(`
                diff --git a/src/languages/en.ts b/src/languages/en.ts
                index 1234567..abcdefg 100644
                --- a/src/languages/en.ts
                +++ b/src/languages/en.ts
                @@ -6,0 +6,1 @@
                +    newKey: 'New value',
            `);

            mockExecSync.mockReturnValue(mockDiffOutput);

            const result = Git.diff('main', undefined, 'src/languages/en.ts');

            expect(mockExecSync).toHaveBeenCalledWith('git diff -U0 main -- "src/languages/en.ts"', {
                encoding: 'utf8',
                cwd: process.cwd(),
            });

            expect(result.hasChanges).toBe(true);
            expect(result.files).toHaveLength(1);
            const file = result.files.at(0);
            expect(file).toBeDefined();
            if (!file) {
                return;
            }
            expect(file.filePath).toBe('src/languages/en.ts');
            expect(Array.from(file.addedLines)).toEqual([6]);
        });

        it('throws error when git command fails with invalid ref', () => {
            mockExecSync.mockImplementation(() => {
                const error = new Error("fatal: bad revision 'invalid-ref'") as Error & {status: number};
                // Simulate execSync behavior with non-zero exit code
                error.status = 128;
                throw error;
            });

            expect(() => Git.diff('invalid-ref')).toThrow("fatal: bad revision 'invalid-ref'");
        });

        it('throws error when git command fails with other errors', () => {
            mockExecSync.mockImplementation(() => {
                const error = new Error('fatal: not a git repository') as Error & {status: number};
                error.status = 128;
                throw error;
            });

            expect(() => Git.diff('main')).toThrow('fatal: not a git repository');
        });

        it('throws error when file path does not exist', () => {
            mockExecSync.mockImplementation(() => {
                const error = new Error("fatal: pathspec 'nonexistent.ts' did not match any files") as Error & {status: number};
                error.status = 1;
                throw error;
            });

            expect(() => Git.diff('main', undefined, 'nonexistent.ts')).toThrow("fatal: pathspec 'nonexistent.ts' did not match any files");
        });

        it('handles unified diff format without context lines', () => {
            const mockDiffOutput = dedent(`
                diff --git a/test.ts b/test.ts
                index 1234567..abcdefg 100644
                --- a/test.ts
                +++ b/test.ts
                @@ -4,1 +4,2 @@
                -line 1 old
                +line 1 new
                +line 2 added
            `);

            mockExecSync.mockReturnValue(mockDiffOutput);

            const result = Git.diff('HEAD~1');

            const file = result.files.at(0);
            expect(file).toBeDefined();
            if (!file) {
                return;
            }

            const hunk = file.hunks.at(0);
            expect(hunk).toBeDefined();
            if (!hunk) {
                return;
            }

            expect(hunk.lines).toHaveLength(3);

            // Check removed line
            expect(hunk.lines.at(0)).toEqual({
                number: 4,
                type: 'removed',
                content: 'line 1 old',
            });

            // Check added lines
            expect(hunk.lines.at(1)).toEqual({
                number: 4,
                type: 'added',
                content: 'line 1 new',
            });
            expect(hunk.lines.at(2)).toEqual({
                number: 5,
                type: 'added',
                content: 'line 2 added',
            });
        });

        it('calculates modified lines correctly when lines are replaced', () => {
            // 2 lines removed, 2 lines added = 2 modified lines
            const mockDiffOutput = dedent(`
                diff --git a/test.ts b/test.ts
                index 1234567..abcdefg 100644
                --- a/test.ts
                +++ b/test.ts
                @@ -2,2 +2,2 @@
                -old line1
                -old line2
                +new line1
                +new line2
            `);

            mockExecSync.mockReturnValue(mockDiffOutput);

            const result = Git.diff('main');
            const file = result.files.at(0);
            expect(file).toBeDefined();
            if (!file) {
                return;
            }

            // Should have 2 modified lines (the minimum of 2 removed and 2 added)
            expect(file.modifiedLines.size).toBe(2);
            expect(file.addedLines.size).toBe(0); // No net additions since all were modifications
            expect(file.removedLines.size).toBe(0); // No net removals since all were modifications
        });

        it('calculates modified lines with net additions', () => {
            // 1 line removed, 3 lines added = 1 modified line + 2 added lines
            const mockDiffOutput = dedent(`
                diff --git a/test.ts b/test.ts
                index 1234567..abcdefg 100644
                --- a/test.ts
                +++ b/test.ts
                @@ -2,1 +2,3 @@
                -old line1
                +new line1
                +additional line2
                +additional line3
            `);

            mockExecSync.mockReturnValue(mockDiffOutput);

            const result = Git.diff('main');
            const file = result.files.at(0);
            expect(file).toBeDefined();
            if (!file) {
                return;
            }

            // Should have 1 modified line + 2 net additions
            expect(file.modifiedLines.size).toBe(1);
            expect(file.addedLines.size).toBe(2);
            expect(file.removedLines.size).toBe(0);
        });

        it('calculates modified lines with net removals', () => {
            // 3 lines removed, 1 line added = 1 modified line + 2 removed lines
            const mockDiffOutput = dedent(`
                diff --git a/test.ts b/test.ts
                index 1234567..abcdefg 100644
                --- a/test.ts
                +++ b/test.ts
                @@ -2,3 +2,1 @@
                -old line1
                -old line2
                -old line3
                +new line1
            `);

            mockExecSync.mockReturnValue(mockDiffOutput);

            const result = Git.diff('main');
            const file = result.files.at(0);
            expect(file).toBeDefined();
            if (!file) {
                return;
            }

            // Should have 1 modified line + 2 net removals
            expect(file.modifiedLines.size).toBe(1);
            expect(file.addedLines.size).toBe(0);
            expect(file.removedLines.size).toBe(2);
        });

        it('handles pure additions correctly', () => {
            // 0 lines removed, 2 lines added = 0 modified lines + 2 added lines
            const mockDiffOutput = dedent(`
                diff --git a/test.ts b/test.ts
                index 1234567..abcdefg 100644
                --- a/test.ts
                +++ b/test.ts
                @@ -2,0 +3,2 @@
                +new line1
                +new line2
            `);

            mockExecSync.mockReturnValue(mockDiffOutput);

            const result = Git.diff('main');
            const file = result.files.at(0);
            expect(file).toBeDefined();
            if (!file) {
                return;
            }

            expect(file.modifiedLines.size).toBe(0);
            expect(file.addedLines.size).toBe(2);
            expect(file.removedLines.size).toBe(0);
        });

        it('handles pure removals correctly', () => {
            // 2 lines removed, 0 lines added = 0 modified lines + 2 removed lines
            const mockDiffOutput = dedent(`
                diff --git a/test.ts b/test.ts
                index 1234567..abcdefg 100644
                --- a/test.ts
                +++ b/test.ts
                @@ -3,2 +3,0 @@
                -line1
                -line2
            `);

            mockExecSync.mockReturnValue(mockDiffOutput);

            const result = Git.diff('main');
            const file = result.files.at(0);
            expect(file).toBeDefined();
            if (!file) {
                return;
            }

            expect(file.modifiedLines.size).toBe(0);
            expect(file.addedLines.size).toBe(0);
            expect(file.removedLines.size).toBe(2);
        });

        it('handles interleaved additions and removals correctly', () => {
            // Non-consecutive additions and removals within a hunk (with -U0, they're in separate hunks)
            const mockDiffOutput = dedent(`
                diff --git a/test.ts b/test.ts
                index 1234567..abcdefg 100644
                --- a/test.ts
                +++ b/test.ts
                @@ -1,1 +1,1 @@
                -removed1
                +added1
                @@ -3,1 +3,2 @@
                -removed2
                +added2
                +added3
            `);

            mockExecSync.mockReturnValue(mockDiffOutput);

            const result = Git.diff('main');
            const file = result.files.at(0);
            expect(file).toBeDefined();
            if (!file) {
                return;
            }

            // 2 removed, 3 added = 2 modified + 1 added
            expect(file.modifiedLines.size).toBe(2);
            expect(file.addedLines.size).toBe(1);
            expect(file.removedLines.size).toBe(0);
        });

        it('handles "No newline at end of file" markers correctly', () => {
            const mockDiffOutput = dedent(`
                diff --git a/file.ts b/file.ts
                index 1234567..abcdefg 100644
                --- a/file.ts
                +++ b/file.ts
                @@ -1,1 +1,1 @@
                -const old = 'value';
                \\ No newline at end of file
                +const new = 'value';
            `);

            mockExecSync.mockReturnValue(mockDiffOutput);

            const result = Git.diff('main');
            const file = result.files.at(0);
            expect(file).toBeDefined();
            if (!file) {
                return;
            }

            expect(file.filePath).toBe('file.ts');
            expect(file.hunks).toHaveLength(1);
            expect(file.modifiedLines.size).toBe(1);
            // The "No newline" marker should be ignored, not counted as a line
            expect(file.hunks.at(0)?.lines.length).toBe(2); // One removed, one added
        });
    });

    describe('fileDiffType', () => {
        it('returns "added" for newly added files with single hunk starting at line 0', () => {
            const mockDiffOutput = dedent(`
                diff --git a/new-file.ts b/new-file.ts
                new file mode 100644
                index 0000000..1234567
                --- /dev/null
                +++ b/new-file.ts
                @@ -0,0 +1,3 @@
                +const hello = 'world';
                +const foo = 'bar';
                +const baz = 'qux';
            `);

            mockExecSync.mockReturnValue(mockDiffOutput);

            const result = Git.diff('main');
            const file = result.files.at(0);
            expect(file).toBeDefined();
            if (!file) {
                return;
            }

            expect(file.diffType).toBe('added');
        });

        it('returns "added" for newly added files with single line', () => {
            const mockDiffOutput = dedent(`
                diff --git a/single-line.ts b/single-line.ts
                new file mode 100644
                index 0000000..1234567
                --- /dev/null
                +++ b/single-line.ts
                @@ -0,0 +1,1 @@
                +export const test = 'value';
            `);

            mockExecSync.mockReturnValue(mockDiffOutput);

            const result = Git.diff('main');
            const file = result.files.at(0);
            expect(file).toBeDefined();
            if (!file) {
                return;
            }

            expect(file.diffType).toBe('added');
        });

        it('returns "added" for files with multiple hunks that are completely new', () => {
            const mockDiffOutput = dedent(`
                diff --git a/multi-hunk.ts b/multi-hunk.ts
                new file mode 100644
                index 0000000..1234567
                --- /dev/null
                +++ b/multi-hunk.ts
                @@ -0,0 +1,2 @@
                +const first = 'value';
                +const second = 'value';
                @@ -0,0 +3,2 @@
                +const third = 'value';
                +const fourth = 'value';
            `);

            mockExecSync.mockReturnValue(mockDiffOutput);

            const result = Git.diff('main');
            const file = result.files.at(0);
            expect(file).toBeDefined();
            if (!file) {
                return;
            }

            expect(file.diffType).toBe('added');
        });

        it('returns "modified" for files with modified lines', () => {
            const mockDiffOutput = dedent(`
                diff --git a/modified.ts b/modified.ts
                index 1234567..abcdefg 100644
                --- a/modified.ts
                +++ b/modified.ts
                @@ -1,1 +1,1 @@
                -const old = 'value';
                +const new = 'value';
            `);

            mockExecSync.mockReturnValue(mockDiffOutput);

            const result = Git.diff('main');
            const file = result.files.at(0);
            expect(file).toBeDefined();
            if (!file) {
                return;
            }

            expect(file.diffType).toBe('modified');
        });

        it('returns "modified" for files with removed lines', () => {
            const mockDiffOutput = dedent(`
                diff --git a/removed.ts b/removed.ts
                index 1234567..abcdefg 100644
                --- a/removed.ts
                +++ b/removed.ts
                @@ -2,2 +2,0 @@
                -const removed1 = 'value1';
                -const removed2 = 'value2';
            `);

            mockExecSync.mockReturnValue(mockDiffOutput);

            const result = Git.diff('main');
            const file = result.files.at(0);
            expect(file).toBeDefined();
            if (!file) {
                return;
            }

            expect(file.diffType).toBe('modified');
        });

        it('returns "modified" for files with both added and modified lines', () => {
            const mockDiffOutput = dedent(`
                diff --git a/mixed.ts b/mixed.ts
                index 1234567..abcdefg 100644
                --- a/mixed.ts
                +++ b/mixed.ts
                @@ -1,1 +1,2 @@
                -const old = 'value';
                +const new = 'value';
                +const added = 'new';
            `);

            mockExecSync.mockReturnValue(mockDiffOutput);

            const result = Git.diff('main');
            const file = result.files.at(0);
            expect(file).toBeDefined();
            if (!file) {
                return;
            }

            expect(file.diffType).toBe('modified');
        });

        it('returns "modified" for files with both added and removed lines', () => {
            const mockDiffOutput = dedent(`
                diff --git a/mixed.ts b/mixed.ts
                index 1234567..abcdefg 100644
                --- a/mixed.ts
                +++ b/mixed.ts
                @@ -1,1 +1,1 @@
                -const removed = 'value';
                +const added = 'value';
                @@ -3,0 +4,1 @@
                +const newLine = 'new';
            `);

            mockExecSync.mockReturnValue(mockDiffOutput);

            const result = Git.diff('main');
            const file = result.files.at(0);
            expect(file).toBeDefined();
            if (!file) {
                return;
            }

            expect(file.diffType).toBe('modified');
        });

        it('returns "modified" for files with added lines but oldStart !== 0', () => {
            const mockDiffOutput = dedent(`
                diff --git a/inserted.ts b/inserted.ts
                index 1234567..abcdefg 100644
                --- a/inserted.ts
                +++ b/inserted.ts
                @@ -5,0 +6,2 @@
                +const inserted1 = 'value1';
                +const inserted2 = 'value2';
            `);

            mockExecSync.mockReturnValue(mockDiffOutput);

            const result = Git.diff('main');
            const file = result.files.at(0);
            expect(file).toBeDefined();
            if (!file) {
                return;
            }

            expect(file.diffType).toBe('modified');
        });

        it('returns "modified" for files with added lines but oldCount !== 0', () => {
            const mockDiffOutput = dedent(`
                diff --git a/partial.ts b/partial.ts
                index 1234567..abcdefg 100644
                --- a/partial.ts
                +++ b/partial.ts
                @@ -1,1 +1,2 @@
                 const existing = 'value';
                +const added = 'new';
            `);

            mockExecSync.mockReturnValue(mockDiffOutput);

            const result = Git.diff('main');
            const file = result.files.at(0);
            expect(file).toBeDefined();
            if (!file) {
                return;
            }

            expect(file.diffType).toBe('modified');
        });

        it('returns "modified" for files with no added lines', () => {
            const mockDiffOutput = dedent(`
                diff --git a/no-additions.ts b/no-additions.ts
                index 1234567..abcdefg 100644
                --- a/no-additions.ts
                +++ b/no-additions.ts
                @@ -1,2 +1,0 @@
                -const removed1 = 'value1';
                -const removed2 = 'value2';
            `);

            mockExecSync.mockReturnValue(mockDiffOutput);

            const result = Git.diff('main');
            const file = result.files.at(0);
            expect(file).toBeDefined();
            if (!file) {
                return;
            }

            expect(file.diffType).toBe('modified');
        });

        it('returns "modified" for files with only modified lines and no additions', () => {
            const mockDiffOutput = dedent(`
                diff --git a/modified-only.ts b/modified-only.ts
                index 1234567..abcdefg 100644
                --- a/modified-only.ts
                +++ b/modified-only.ts
                @@ -1,1 +1,1 @@
                -const old = 'old';
                +const new = 'new';
            `);

            mockExecSync.mockReturnValue(mockDiffOutput);

            const result = Git.diff('main');
            const file = result.files.at(0);
            expect(file).toBeDefined();
            if (!file) {
                return;
            }

            expect(file.diffType).toBe('modified');
        });

        it('returns "modified" for existing files with a single line added at the beginning', () => {
            const mockDiffOutput = dedent(`
                diff --git a/existing-file.ts b/existing-file.ts
                index 1234567..abcdefg 100644
                --- a/existing-file.ts
                +++ b/existing-file.ts
                @@ -0,0 +1,1 @@
                +/* eslint-disable rulesdir/no-deep-equal-in-memo */
            `);

            mockExecSync.mockReturnValue(mockDiffOutput);

            const result = Git.diff('main');
            const file = result.files.at(0);
            expect(file).toBeDefined();
            if (!file) {
                return;
            }

            // Should be "modified" not "added" because the file existed before (--- a/existing-file.ts)
            expect(file.diffType).toBe('modified');
        });

        it('returns "removed" for completely removed files', () => {
            const mockDiffOutput = dedent(`
                diff --git a/removed-file.ts b/removed-file.ts
                deleted file mode 100644
                index 1234567..0000000
                --- a/removed-file.ts
                +++ /dev/null
                @@ -1,3 +0,0 @@
                -const hello = 'world';
                -const foo = 'bar';
                -const baz = 'qux';
            `);

            mockExecSync.mockReturnValue(mockDiffOutput);

            const result = Git.diff('main');
            const file = result.files.at(0);
            expect(file).toBeDefined();
            if (!file) {
                return;
            }

            expect(file.diffType).toBe('removed');
        });

        it('returns "removed" for single-line files that are deleted', () => {
            const mockDiffOutput = dedent(`
                diff --git a/single-line-file.ts b/single-line-file.ts
                deleted file mode 100644
                index 1234567..0000000
                --- a/single-line-file.ts
                +++ /dev/null
                @@ -1,1 +0,0 @@
                -export const test = 'value';
            `);

            mockExecSync.mockReturnValue(mockDiffOutput);

            const result = Git.diff('main');
            const file = result.files.at(0);
            expect(file).toBeDefined();
            if (!file) {
                return;
            }

            expect(file.diffType).toBe('removed');
            expect(file.filePath).toBe('single-line-file.ts');
        });

        it('returns "removed" for files with multiple hunks that are deleted', () => {
            const mockDiffOutput = dedent(`
                diff --git a/multi-hunk-removed.ts b/multi-hunk-removed.ts
                deleted file mode 100644
                index 1234567..0000000
                --- a/multi-hunk-removed.ts
                +++ /dev/null
                @@ -1,2 +0,0 @@
                -const first = 'value';
                -const second = 'value';
                @@ -5,3 +0,0 @@
                -const third = 'value';
                -const fourth = 'value';
                -const fifth = 'value';
            `);

            mockExecSync.mockReturnValue(mockDiffOutput);

            const result = Git.diff('main');
            const file = result.files.at(0);
            expect(file).toBeDefined();
            if (!file) {
                return;
            }

            expect(file.diffType).toBe('removed');
            expect(file.filePath).toBe('multi-hunk-removed.ts');
            expect(file.hunks.length).toBeGreaterThan(1);
        });

        it('uses the old file path for removed files (not /dev/null)', () => {
            const mockDiffOutput = dedent(`
                diff --git a/src/utils/helper.ts b/src/utils/helper.ts
                deleted file mode 100644
                index 1234567..0000000
                --- a/src/utils/helper.ts
                +++ /dev/null
                @@ -1,2 +0,0 @@
                -export const helper = () => {};
                -export const another = () => {};
            `);

            mockExecSync.mockReturnValue(mockDiffOutput);

            const result = Git.diff('main');
            const file = result.files.at(0);
            expect(file).toBeDefined();
            if (!file) {
                return;
            }

            expect(file.diffType).toBe('removed');
            expect(file.filePath).toBe('src/utils/helper.ts');
            expect(file.filePath).not.toBe('/dev/null');
        });

        it('correctly populates removedLines for deleted files', () => {
            const mockDiffOutput = dedent(`
                diff --git a/deleted.ts b/deleted.ts
                deleted file mode 100644
                index 1234567..0000000
                --- a/deleted.ts
                +++ /dev/null
                @@ -1,5 +0,0 @@
                -const line1 = 'value1';
                -const line2 = 'value2';
                -const line3 = 'value3';
                -const line4 = 'value4';
                -const line5 = 'value5';
            `);

            mockExecSync.mockReturnValue(mockDiffOutput);

            const result = Git.diff('main');
            const file = result.files.at(0);
            expect(file).toBeDefined();
            if (!file) {
                return;
            }

            expect(file.diffType).toBe('removed');
            expect(file.removedLines.size).toBe(5);
            expect(file.addedLines.size).toBe(0);
            expect(file.modifiedLines.size).toBe(0);
        });
    });

    describe('getUntrackedFiles', () => {
        it('returns array of untracked file paths', () => {
            mockExecSync.mockReturnValue('src/new-file.ts\nsrc/another-file.tsx\n');

            const result = Git.getUntrackedFiles();

            expect(result).toEqual(['src/new-file.ts', 'src/another-file.tsx']);
            expect(mockExecSync).toHaveBeenCalledWith('git ls-files --others --exclude-standard', {
                encoding: 'utf8',
                cwd: process.cwd(),
                stdio: 'pipe',
            });
        });

        it('filters untracked files by file paths (single and multiple)', () => {
            mockExecSync.mockReturnValue('src/file1.ts\nsrc/file2.tsx\nsrc/components/Button.tsx\n');

            // Single file path
            expect(Git.getUntrackedFiles('src/file1.ts')).toEqual(['src/file1.ts']);

            // Multiple file paths
            expect(Git.getUntrackedFiles(['src/file1.ts', 'src/components/Button.tsx'])).toEqual(['src/file1.ts', 'src/components/Button.tsx']);

            // Directory path
            expect(Git.getUntrackedFiles('src/components')).toEqual(['src/components/Button.tsx']);
        });

        it('returns empty array when git command fails or no untracked files exist', () => {
            mockExecSync.mockReturnValue('');
            expect(Git.getUntrackedFiles()).toEqual([]);

            mockExecSync.mockImplementation(() => {
                throw new Error('fatal: not a git repository');
            });
            expect(Git.getUntrackedFiles()).toEqual([]);
        });
    });

    describe('diff with shouldIncludeUntrackedFiles', () => {
        let mockExistsSync: jest.SpyInstance;
        let mockReadFileSync: jest.SpyInstance;

        beforeEach(() => {
            jest.clearAllMocks();
            mockExistsSync = jest.spyOn(fs, 'existsSync').mockReturnValue(true);
            jest.spyOn(fs, 'statSync').mockReturnValue({isFile: () => true} as fs.Stats);
            mockReadFileSync = jest.spyOn(fs, 'readFileSync');
        });

        afterEach(() => {
            jest.restoreAllMocks();
        });

        it('does not include untracked files by default or when shouldIncludeUntrackedFiles is false', () => {
            mockExecSync.mockReturnValue('');

            // Default (not provided)
            Git.diff('main');
            expect(mockExecSync).toHaveBeenCalledTimes(1);

            jest.clearAllMocks();

            // Explicit false
            Git.diff('main', undefined, undefined, false);
            expect(mockExecSync).toHaveBeenCalledTimes(1);

            // Verify git ls-files was not called
            const calls = mockExecSync.mock.calls.map((call) => call[0]);
            expect(calls).not.toContain(expect.stringContaining('git ls-files'));
        });

        it('does not include untracked files when toRef is provided even if shouldIncludeUntrackedFiles is true', () => {
            mockExecSync.mockReturnValue('');

            Git.diff('main', 'HEAD', undefined, true);

            expect(mockExecSync).toHaveBeenCalledTimes(1);
            const calls = mockExecSync.mock.calls.map((call) => call[0]);
            expect(calls).not.toContain(expect.stringContaining('git ls-files'));
        });

        it('includes untracked files when shouldIncludeUntrackedFiles is true and toRef is undefined', () => {
            mockExecSync.mockImplementation(createMockExecSync('', `${UNTRACKED_FILE_PATH}\n`));
            mockReadFileSync.mockReturnValue(MOCK_COMPONENT_CONTENT);

            const result = Git.diff('main', undefined, undefined, true);

            expect(result.hasChanges).toBe(true);
            expect(result.files).toHaveLength(1);

            const file = result.files.at(0);
            expect(file?.filePath).toBe(UNTRACKED_FILE_PATH);
            expect(file?.diffType).toBe('added');
            expect(file?.hunks).toHaveLength(1);
            expect(Array.from(file?.addedLines ?? [])).toEqual([1, 2]);
        });

        it('merges tracked changes with untracked files', () => {
            const mockDiffOutput = dedent(`
                diff --git a/src/tracked.ts b/src/tracked.ts
                index 1234567..abcdefg 100644
                --- a/src/tracked.ts
                +++ b/src/tracked.ts
                @@ -1,1 +1,1 @@
                -old
                +new
            `);

            mockExecSync.mockImplementation(createMockExecSync(mockDiffOutput, `${UNTRACKED_FILE_PATH}\n`));
            mockReadFileSync.mockReturnValue(MOCK_COMPONENT_CONTENT);

            const result = Git.diff('main', undefined, undefined, true);

            expect(result.hasChanges).toBe(true);
            expect(result.files).toHaveLength(2);

            const trackedFile = result.files.find((f) => f.filePath === 'src/tracked.ts');
            const untrackedFile = result.files.find((f) => f.filePath === UNTRACKED_FILE_PATH);

            expect(trackedFile?.diffType).toBe('modified');
            expect(untrackedFile?.diffType).toBe('added');
        });

        it('filters untracked files by filePaths parameter', () => {
            mockExecSync.mockImplementation(createMockExecSync('', 'src/file1.tsx\nsrc/file2.tsx\nsrc/file3.tsx\n'));
            mockReadFileSync.mockReturnValue(MOCK_COMPONENT_CONTENT);

            const result = Git.diff('main', undefined, ['src/file1.tsx', 'src/file3.tsx'], true);

            expect(result.files).toHaveLength(2);
            expect(result.files.some((f) => f.filePath === 'src/file1.tsx')).toBe(true);
            expect(result.files.some((f) => f.filePath === 'src/file3.tsx')).toBe(true);
            expect(result.files.some((f) => f.filePath === 'src/file2.tsx')).toBe(false);
        });

        it('handles multi-line untracked files correctly', () => {
            mockExecSync.mockImplementation(createMockExecSync('', `${UNTRACKED_FILE_PATH}\n`));
            mockReadFileSync.mockReturnValue(MOCK_MULTI_LINE_COMPONENT_CONTENT);

            const result = Git.diff('main', undefined, undefined, true);

            const file = result.files.at(0);
            expect(file?.hunks.at(0)?.newCount).toBe(6);
            expect(file?.hunks.at(0)?.lines).toHaveLength(6);
            expect(Array.from(file?.addedLines ?? [])).toEqual([1, 2, 3, 4, 5, 6]);
        });

        it('skips untracked files that do not exist or cannot be read', () => {
            mockExecSync.mockImplementation(createMockExecSync('', 'src/nonexistent.tsx\n'));

            // File does not exist
            mockExistsSync.mockReturnValue(false);
            expect(Git.diff('main', undefined, undefined, true).files).toHaveLength(0);

            // File cannot be read
            mockExistsSync.mockReturnValue(true);
            mockReadFileSync.mockImplementation(() => {
                throw new Error('Permission denied');
            });
            expect(Git.diff('main', undefined, undefined, true).files).toHaveLength(0);
        });

        it('handles git ls-files command failure gracefully', () => {
            mockExecSync.mockImplementation((command: string) => {
                if (command.includes('git diff')) {
                    return '';
                }
                if (command.includes('git ls-files')) {
                    throw new Error('fatal: not a git repository');
                }
                return '';
            });

            const result = Git.diff('main', undefined, undefined, true);

            expect(result.hasChanges).toBe(false);
            expect(result.files).toHaveLength(0);
        });
    });
});
