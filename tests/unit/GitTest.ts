/**
 * @jest-environment node
 */
import {execSync} from 'child_process';
import dedent from '@libs/StringUtils/dedent';
import Git from '@scripts/utils/Git';

// Mock execSync to control git diff output
jest.mock('child_process');
const mockExecSync = execSync as jest.MockedFunction<typeof execSync>;

describe('Git', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('isValidRef', () => {
        it('returns true for valid git references', () => {
            mockExecSync.mockReturnValue('abc123def456\n');

            const result = Git.isValidRef('main');

            expect(result).toBe(true);
            expect(mockExecSync).toHaveBeenCalledWith('git rev-parse --verify "main"', {
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
            expect(mockExecSync).toHaveBeenCalledWith('git diff main', {
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
                @@ -1,3 +1,4 @@
                 const greeting = 'Hello';
                -const farewell = 'Goodbye';
                +const farewell = 'Farewell';
                +const newLine = 'New';
                 export default greeting;
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
            expect(hunk.oldStart).toBe(1);
            expect(hunk.oldCount).toBe(3);
            expect(hunk.newStart).toBe(1);
            expect(hunk.newCount).toBe(4);

            expect(hunk.lines).toHaveLength(5); // Updated based on actual output
            expect(hunk.lines.at(0)).toEqual({
                lineNumber: 1,
                type: 'context',
                content: "const greeting = 'Hello';",
            });
            expect(hunk.lines.at(1)).toEqual({
                lineNumber: 2,
                type: 'removed',
                content: "const farewell = 'Goodbye';",
            });
            expect(hunk.lines.at(2)).toEqual({
                lineNumber: 2,
                type: 'added',
                content: "const farewell = 'Farewell';",
            });
            expect(hunk.lines.at(3)).toEqual({
                lineNumber: 3,
                type: 'added',
                content: "const newLine = 'New';",
            });
            expect(hunk.lines.at(4)).toEqual({
                lineNumber: 4,
                type: 'context',
                content: 'export default greeting;',
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
                @@ -1,2 +1,2 @@
                -const old1 = 'old';
                +const new1 = 'new';
                 const unchanged = 'same';
                @@ -10,2 +10,3 @@
                 const middle = 'middle';
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
            expect(Array.from(file.addedLines)).toEqual([12]);
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
                @@ -1,1 +1,2 @@
                 existing line
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
                @@ -5,1 +5,2 @@
                     greeting: 'Hello',
                +    newKey: 'New value',
                 };
            `);

            mockExecSync.mockReturnValue(mockDiffOutput);

            const result = Git.diff('main', undefined, 'src/languages/en.ts');

            expect(mockExecSync).toHaveBeenCalledWith('git diff main -- "src/languages/en.ts"', {
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

        it('handles unified diff format with context lines', () => {
            const mockDiffOutput = dedent(`
                diff --git a/test.ts b/test.ts
                index 1234567..abcdefg 100644
                --- a/test.ts
                +++ b/test.ts
                @@ -2,5 +2,6 @@
                 line 1
                 line 2
                -line 3 old
                +line 3 new
                +line 4 added
                 line 5
                 line 6
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

            expect(hunk.lines).toHaveLength(7);

            // Check context lines
            expect(hunk.lines.at(0)).toEqual({
                lineNumber: 2,
                type: 'context',
                content: 'line 1',
            });
            expect(hunk.lines.at(1)).toEqual({
                lineNumber: 3,
                type: 'context',
                content: 'line 2',
            });

            // Check removed line
            expect(hunk.lines.at(2)).toEqual({
                lineNumber: 4,
                type: 'removed',
                content: 'line 3 old',
            });

            // Check added lines
            expect(hunk.lines.at(3)).toEqual({
                lineNumber: 4,
                type: 'added',
                content: 'line 3 new',
            });
            expect(hunk.lines.at(4)).toEqual({
                lineNumber: 5,
                type: 'added',
                content: 'line 4 added',
            });

            // Check remaining context lines
            expect(hunk.lines.at(5)).toEqual({
                lineNumber: 6,
                type: 'context',
                content: 'line 5',
            });
            expect(hunk.lines.at(6)).toEqual({
                lineNumber: 7,
                type: 'context',
                content: 'line 6',
            });
        });

        it('calculates modified lines correctly when lines are replaced', () => {
            // 2 lines removed, 2 lines added = 2 modified lines
            const mockDiffOutput = dedent(`
                diff --git a/test.ts b/test.ts
                index 1234567..abcdefg 100644
                --- a/test.ts
                +++ b/test.ts
                @@ -1,4 +1,4 @@
                 line1
                -old line2
                -old line3
                +new line2
                +new line3
                 line4
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
                @@ -1,3 +1,5 @@
                 line1
                -old line2
                +new line2
                +additional line3
                +additional line4
                 line3
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
                @@ -1,5 +1,3 @@
                 line1
                -old line2
                -old line3
                -old line4
                +new line2
                 line5
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
                @@ -1,2 +1,4 @@
                 line1
                 line2
                +new line3
                +new line4
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
                @@ -1,4 +1,2 @@
                 line1
                 line2
                -line3
                -line4
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
            // Non-consecutive additions and removals within a hunk
            const mockDiffOutput = dedent(`
                diff --git a/test.ts b/test.ts
                index 1234567..abcdefg 100644
                --- a/test.ts
                +++ b/test.ts
                @@ -1,6 +1,6 @@
                -removed1
                +added1
                 context1
                -removed2
                 context2
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
    });
});
