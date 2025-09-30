import {execSync, exec as execWithCallback} from 'child_process';
import {promisify} from 'util';

const exec = promisify(execWithCallback);

/**
 * Represents a single changed line in a git diff.
 * With -U0, only added and removed lines are present (no context).
 */
type DiffLine = {
    number: number;
    type: 'added' | 'removed';
    content: string;
};

/**
 * Represents a hunk in a git diff (a contiguous block of changes).
 */
type DiffHunk = {
    oldStart: number;
    oldCount: number;
    newStart: number;
    newCount: number;
    lines: DiffLine[];
};

/**
 * Represents a structured git diff for a single file.
 */
type FileDiff = {
    filePath: string;
    hunks: DiffHunk[];
    addedLines: Set<number>;
    removedLines: Set<number>;
    modifiedLines: Set<number>;
};

/**
 * Represents the result of a git diff operation.
 */
type DiffResult = {
    files: FileDiff[];
    hasChanges: boolean;
};

/**
 * Utility class for git operations.
 */
class Git {
    /**
     * Check if a git reference is valid.
     *
     * @param ref - The git reference to validate (branch, tag, commit hash, etc.)
     * @returns true if the reference exists, false otherwise
     */
    static isValidRef(ref: string): boolean {
        try {
            execSync(`git rev-parse --verify "${ref}"`, {
                encoding: 'utf8',
                cwd: process.cwd(),
                stdio: 'pipe', // Suppress output
            });
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Execute a git diff between two refs and return structured diff information.
     *
     * @param fromRef - The starting reference (commit, branch, tag, etc.)
     * @param toRef - The ending reference (defaults to working directory if not provided)
     * @param filePaths - Optional specific file path(s) to diff (relative to git repo root)
     * @returns Structured diff result with line numbers and change information
     * @throws Error when git command fails (invalid refs, not a git repo, file not found, etc.)
     */
    static diff(fromRef: string, toRef?: string, filePaths?: string | string[]): DiffResult {
        // Build git diff command (with 0 context lines for easier parsing)
        let command = `git diff -U0 ${fromRef}`;
        if (toRef) {
            command += ` ${toRef}`;
        }
        if (filePaths) {
            const pathsArray = Array.isArray(filePaths) ? filePaths : [filePaths];
            const quotedPaths = pathsArray.map((path) => `"${path}"`).join(' ');
            command += ` -- ${quotedPaths}`;
        }

        // Execute git diff with unified format - let errors bubble up
        const diffOutput = execSync(command, {
            encoding: 'utf8',
            cwd: process.cwd(),
        });

        return Git.parseDiff(diffOutput);
    }

    /**
     * Parse git diff output into structured format.
     *
     * @param diffOutput - Raw git diff output string
     * @returns Structured diff result with line numbers and change information
     */
    static parseDiff(diffOutput: string): DiffResult {
        // Parse the diff output inline
        if (!diffOutput.trim()) {
            return {
                files: [],
                hasChanges: false,
            };
        }

        const lines = diffOutput.split('\n');
        const files: FileDiff[] = [];
        let currentFile: FileDiff | null = null;
        let currentHunk: DiffHunk | null = null;

        for (const line of lines) {
            // File header: diff --git a/file b/file
            if (line.startsWith('diff --git')) {
                if (currentFile) {
                    // Push the current hunk to the current file before processing the new file
                    if (currentHunk) {
                        currentFile.hunks.push(currentHunk);
                    }
                    files.push(currentFile);
                }
                currentFile = null;
                currentHunk = null;
                continue;
            }

            // File path: +++ b/file
            if (line.startsWith('+++ b/')) {
                const diffFilePath = line.slice(6); // Remove '+++ b/'
                currentFile = {
                    filePath: diffFilePath,
                    hunks: [],
                    addedLines: new Set(),
                    removedLines: new Set(),
                    modifiedLines: new Set(),
                };
                continue;
            }

            // Hunk header: @@ -oldStart,oldCount +newStart,newCount @@
            if (line.startsWith('@@')) {
                const hunkMatch = line.match(/^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/);
                if (hunkMatch && currentFile) {
                    if (currentHunk) {
                        currentFile.hunks.push(currentHunk);
                    }

                    const oldStart = parseInt(hunkMatch[1], 10);
                    const oldCount = hunkMatch[2] ? parseInt(hunkMatch[2], 10) : 1;
                    const newStart = parseInt(hunkMatch[3], 10);
                    const newCount = hunkMatch[4] ? parseInt(hunkMatch[4], 10) : 1;

                    currentHunk = {
                        oldStart,
                        oldCount,
                        newStart,
                        newCount,
                        lines: [],
                    };
                }
                continue;
            }

            // Diff content lines
            if (currentHunk && currentFile && line.length > 0) {
                const firstChar = line[0];
                const content = line.slice(1); // Remove the +/- prefix

                if (firstChar === '+') {
                    // For added lines, use new file line numbers
                    const lineNumber = this.calculateLineNumber(currentHunk, 'added');

                    currentHunk.lines.push({
                        number: lineNumber,
                        type: 'added',
                        content,
                    });
                } else if (firstChar === '-') {
                    // For removed lines, use old file line numbers
                    const lineNumber = this.calculateLineNumber(currentHunk, 'removed');

                    currentHunk.lines.push({
                        number: lineNumber,
                        type: 'removed',
                        content,
                    });
                } else {
                    throw new Error(`Unknown line type! First character of line is ${firstChar}`);
                }
            }
        }

        // Add the last file and hunk
        if (currentHunk && currentFile) {
            currentFile.hunks.push(currentHunk);
        }
        if (currentFile) {
            files.push(currentFile);
        }

        // Calculate modified, added, and removed lines
        for (const file of files) {
            for (const hunk of file.hunks) {
                // Collect all removed and added lines from this hunk
                const removedLines = hunk.lines.filter((line) => line.type === 'removed');
                const addedLines = hunk.lines.filter((line) => line.type === 'added');

                const removedCount = removedLines.length;
                const addedCount = addedLines.length;
                const modifiedCount = Math.min(removedCount, addedCount);

                // Mark modified lines (use added line numbers for the new file)
                for (let j = 0; j < modifiedCount; j++) {
                    const addedLine = addedLines.at(j);
                    if (addedLine) {
                        file.modifiedLines.add(addedLine.number);
                    }
                }

                // Handle net additions
                for (let j = modifiedCount; j < addedCount; j++) {
                    const addedLine = addedLines.at(j);
                    if (addedLine) {
                        file.addedLines.add(addedLine.number);
                    }
                }

                // Handle net removals
                for (let j = modifiedCount; j < removedCount; j++) {
                    const removedLine = removedLines.at(j);
                    if (removedLine) {
                        file.removedLines.add(removedLine.number);
                    }
                }
            }
        }

        return {
            files,
            hasChanges: files.length > 0,
        };
    }

    /**
     * Calculate the line number for a diff line based on the hunk and line type.
     */
    private static calculateLineNumber(hunk: DiffHunk, lineType: 'added' | 'removed'): number {
        const addedCount = hunk.lines.filter((l) => l.type === 'added').length;
        const removedCount = hunk.lines.filter((l) => l.type === 'removed').length;

        switch (lineType) {
            case 'added':
                return hunk.newStart + addedCount;
            case 'removed':
                return hunk.oldStart + removedCount;
            default:
                throw new Error(`Unknown line type: ${String(lineType)}`);
        }
    }

    /**
     * Get the content of a file at a specific git reference.
     */
    static show(ref: string, filePath: string): string {
        try {
            return execSync(`git show ${ref}:${filePath}`, {encoding: 'utf8'});
        } catch (error) {
            throw new Error(`Failed to get file content from git: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * Ensure a git reference is available locally, fetching it if necessary.
     *
     * @param ref - The git reference to ensure is available (commit hash, branch, tag, etc.)
     * @param remote - The remote to fetch from (defaults to 'origin')
     * @throws Error when the reference cannot be fetched or is invalid
     */
    static async ensureRef(ref: string, remote = 'origin'): Promise<void> {
        if (this.isValidRef(ref)) {
            return; // Reference is already available locally
        }

        try {
            console.log(`🔄 Fetching missing ref: ${ref}`);
            await exec(`git fetch --no-tags --depth=1 ${remote} ${ref}`, {
                encoding: 'utf8',
                cwd: process.cwd(),
            });

            // Verify the ref is now available
            if (!this.isValidRef(ref)) {
                throw new Error(`Reference ${ref} is still not valid after fetching`);
            }
        } catch (error) {
            throw new Error(`Failed to fetch git reference ${ref}: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}

export default Git;
export type {DiffResult, FileDiff, DiffHunk, DiffLine};
