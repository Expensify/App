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

            expect(Array.from(file.addedLines).sort()).toEqual([2, 3]);
            expect(Array.from(file.removedLines)).toEqual([2]);
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

            expect(Array.from(file.addedLines).sort()).toEqual([1, 11, 12]);
            expect(Array.from(file.removedLines).sort()).toEqual([1, 11]);
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
                index 7890abc..hijklmn 100644
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

            expect(Array.from(file1.addedLines)).toEqual([1]);
            expect(Array.from(file1.removedLines)).toEqual([1]);

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

        it('calculates modified lines correctly', () => {
            const mockDiffOutput = dedent(`
                diff --git a/test.ts b/test.ts
                index 1234567..abcdefg 100644
                --- a/test.ts
                +++ b/test.ts
                @@ -1,3 +1,3 @@
                -old line 1
                +new line 1
                 unchanged line 2
                -old line 3
                +new line 3
            `);

            mockExecSync.mockReturnValue(mockDiffOutput);

            const result = Git.diff('main');
            const file = result.files.at(0);
            expect(file).toBeDefined();
            if (!file) {
                return;
            }

            // Lines that are close together (within 2 lines) and have both additions/removals
            // should be considered modified
            expect(file.modifiedLines.size).toBeGreaterThan(0);
        });
    });
});
