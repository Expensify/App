import {execSync} from 'child_process';

/**
 * Represents a single changed line in a git diff.
 */
type DiffLine = {
    lineNumber: number;
    type: 'added' | 'removed' | 'context';
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
     * @param filePath - Optional specific file path to diff (relative to git repo root)
     * @returns Structured diff result with line numbers and change information
     * @throws Error when git command fails (invalid refs, not a git repo, file not found, etc.)
     */
    static diff(fromRef: string, toRef?: string, filePath?: string): DiffResult {
        // Build git diff command
        let command = `git diff ${fromRef}`;
        if (toRef) {
            command += ` ${toRef}`;
        }
        if (filePath) {
            command += ` -- "${filePath}"`;
        }

        // Execute git diff with unified format - let errors bubble up
        const diffOutput = execSync(command, {
            encoding: 'utf8',
            cwd: process.cwd(),
        });

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
                        lineNumber,
                        type: 'added',
                        content,
                    });
                    currentFile.addedLines.add(lineNumber);
                } else if (firstChar === '-') {
                    // For removed lines, use old file line numbers
                    const lineNumber = this.calculateLineNumber(currentHunk, 'removed');

                    currentHunk.lines.push({
                        lineNumber,
                        type: 'removed',
                        content,
                    });
                    currentFile.removedLines.add(lineNumber);
                } else if (firstChar === ' ') {
                    // For context lines, use new file line numbers
                    const lineNumber = this.calculateLineNumber(currentHunk, 'context');

                    currentHunk.lines.push({
                        lineNumber,
                        type: 'context',
                        content,
                    });
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
                const segments: Array<{type: 'removed' | 'added'; lines: DiffLine[]}> = [];
                let currentSegment: {type: 'removed' | 'added'; lines: DiffLine[]} | null = null;

                // Group consecutive additions and removals into segments
                for (const line of hunk.lines) {
                    if (line.type === 'context') {
                        // Context lines end the current segment
                        if (currentSegment) {
                            segments.push(currentSegment);
                            currentSegment = null;
                        }
                        continue;
                    }

                    if (line.type === 'added' || line.type === 'removed') {
                        if (!currentSegment || currentSegment.type !== line.type) {
                            // Start a new segment
                            if (currentSegment) {
                                segments.push(currentSegment);
                            }
                            currentSegment = {
                                type: line.type,
                                lines: [line],
                            };
                        } else {
                            // Continue the current segment
                            currentSegment.lines.push(line);
                        }
                    }
                }

                // Add the final segment
                if (currentSegment) {
                    segments.push(currentSegment);
                }

                // Remove lines that were added during parsing - we'll recalculate them properly
                for (const line of hunk.lines) {
                    if (line.type === 'added') {
                        file.addedLines.delete(line.lineNumber);
                    } else if (line.type === 'removed') {
                        file.removedLines.delete(line.lineNumber);
                    }
                }

                // Process segments to determine modifications vs additions/removals
                let i = 0;
                while (i < segments.length) {
                    const currentSeg = segments.at(i);
                    if (!currentSeg) {
                        break;
                    }

                    if (currentSeg.type === 'removed' && i + 1 < segments.length && segments.at(i + 1)?.type === 'added') {
                        // Adjacent removed and added segments - calculate modifications
                        const removedSeg = currentSeg;
                        const addedSeg = segments.at(i + 1);
                        if (!addedSeg) {
                            break;
                        }

                        const removedCount = removedSeg.lines.length;
                        const addedCount = addedSeg.lines.length;
                        const modifiedCount = Math.min(removedCount, addedCount);

                        // Mark lines as modified (use the added line numbers for modified lines in the new file)
                        for (let j = 0; j < modifiedCount; j++) {
                            const addedLine = addedSeg.lines.at(j);
                            if (addedLine) {
                                file.modifiedLines.add(addedLine.lineNumber);
                            }
                        }

                        // Handle remaining lines as pure additions or removals
                        if (addedCount > removedCount) {
                            // Net additions
                            for (let j = modifiedCount; j < addedCount; j++) {
                                const addedLine = addedSeg.lines.at(j);
                                if (addedLine) {
                                    file.addedLines.add(addedLine.lineNumber);
                                }
                            }
                        } else if (removedCount > addedCount) {
                            // Net removals
                            for (let j = modifiedCount; j < removedCount; j++) {
                                const removedLine = removedSeg.lines.at(j);
                                if (removedLine) {
                                    file.removedLines.add(removedLine.lineNumber);
                                }
                            }
                        }

                        i += 2; // Skip both segments
                    } else {
                        // Pure addition or removal
                        for (const line of currentSeg.lines) {
                            if (currentSeg.type === 'added') {
                                file.addedLines.add(line.lineNumber);
                            } else {
                                file.removedLines.add(line.lineNumber);
                            }
                        }
                        i += 1;
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
    private static calculateLineNumber(hunk: DiffHunk, lineType: 'added' | 'removed' | 'context'): number {
        const addedCount = hunk.lines.filter((l) => l.type === 'added').length;
        const contextCount = hunk.lines.filter((l) => l.type === 'context').length;
        const removedCount = hunk.lines.filter((l) => l.type === 'removed').length;

        switch (lineType) {
            case 'added':
            case 'context':
                return hunk.newStart + addedCount + contextCount;
            case 'removed':
                return hunk.oldStart + removedCount + contextCount;
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
}

export default Git;
export type {DiffResult, FileDiff, DiffHunk, DiffLine};
