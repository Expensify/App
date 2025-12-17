import {context} from '@actions/github';
import {exec as execWithCallback, execSync as originalExecSync} from 'child_process';
import type {ExecSyncOptionsWithStringEncoding, ExecOptions as ExecWithCallbackOptions} from 'child_process';
import fs from 'fs';
import path from 'path';
import {promisify} from 'util';
import CONST from '@github/libs/CONST';
import GitHubUtils from '@github/libs/GithubUtils';
import {log, error as logError, warn as logWarn} from './Logger';

type ExecOptions = Omit<ExecWithCallbackOptions, 'encoding'> & {cwd?: ExecWithCallbackOptions['cwd']};
function exec(command: string, options?: ExecOptions) {
    const optionsWithEncoding = {
        encoding: 'utf8',
        cwd: process.cwd(),
        ...options,
    };

    return promisify(execWithCallback)(command, optionsWithEncoding);
}

type ExecSyncOptions = Omit<ExecSyncOptionsWithStringEncoding, 'encoding' | 'cwd'> & {
    encoding?: ExecSyncOptionsWithStringEncoding['encoding'];
    cwd?: ExecSyncOptionsWithStringEncoding['cwd'];
};

function execSync(command: string, options?: ExecSyncOptions) {
    const optionsWithEncoding: ExecSyncOptionsWithStringEncoding = {
        ...options,
        encoding: 'utf8',
        cwd: process.cwd(),
    };

    return originalExecSync(command, optionsWithEncoding);
}

const IS_CI = process.env.CI === 'true';
const GITHUB_BASE_REF = process.env.GITHUB_BASE_REF as string | undefined;

/**
 * Represents a single changed line in a git diff.
 * Only added and removed lines are tracked (context lines are skipped during parsing).
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
    diffType: 'added' | 'removed' | 'modified';
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
            execSync(`git rev-parse --verify "${ref}^{object}"`, {
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
    static diff(fromRef: string, toRef?: string, filePaths?: string | string[], shouldIncludeUntrackedFiles = false): DiffResult {
        // Build git diff command (with 0 context lines for easier parsing)
        let command = `git diff -U0 ${fromRef}`;
        if (toRef) {
            command += ` ${toRef}`;
        }
        if (filePaths) {
            const pathsArray = Array.isArray(filePaths) ? filePaths : [filePaths];
            const quotedPaths = pathsArray.map((filePath) => `"${filePath}"`).join(' ');
            command += ` -- ${quotedPaths}`;
        }

        // Execute git diff with unified format - let errors bubble up
        const diffOutput = execSync(command);

        const diffResult = Git.parseDiff(diffOutput);

        // Include untracked files when diffing against working directory
        if (!toRef && shouldIncludeUntrackedFiles) {
            const untrackedFiles = Git.getUntrackedFiles(filePaths);
            const untrackedFileDiffs = Git.createFileDiffsForUntrackedFiles(untrackedFiles);

            // Merge untracked files into the diff result
            if (untrackedFileDiffs.length > 0) {
                diffResult.files.push(...untrackedFileDiffs);
                diffResult.hasChanges = true;
            }
        }

        return diffResult;
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
        let oldFilePath: string | null = null; // Track old file path to determine fileDiffType

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
                oldFilePath = null; // Reset for next file
                continue;
            }

            // Old file path: --- a/file or --- /dev/null (for new files)
            // This comes before +++ in git diff output
            if (line.startsWith('--- ')) {
                oldFilePath = line.slice(4); // Store the old file path (remove '--- ')
                continue;
            }

            // New file path: +++ b/file or +++ /dev/null (for removed files)
            if (line.startsWith('+++ ')) {
                const newFilePath = line.slice(4); // Remove '+++ '

                // Determine fileDiffType based on old and new file paths
                // Note: oldFilePath should always be set by the time we see +++, but handle null for type safety
                let fileDiffType: 'added' | 'removed' | 'modified' = 'modified';
                let diffFilePath: string;

                const oldPath = oldFilePath ?? '';

                if (oldPath === '/dev/null') {
                    // New file: use the new file path
                    fileDiffType = 'added';
                    diffFilePath = newFilePath.startsWith('b/') ? newFilePath.slice(2) : newFilePath;
                } else if (newFilePath === '/dev/null') {
                    // Removed file: use the old file path
                    fileDiffType = 'removed';
                    diffFilePath = oldPath.startsWith('a/') ? oldPath.slice(2) : oldPath;
                } else {
                    // Modified file: use the new file path
                    fileDiffType = 'modified';
                    diffFilePath = newFilePath.startsWith('b/') ? newFilePath.slice(2) : newFilePath;
                }

                currentFile = {
                    filePath: diffFilePath,
                    diffType: fileDiffType,
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
                } else if (firstChar === ' ') {
                    // Context line - skip it (we only care about added/removed lines)
                    continue;
                } else if (firstChar === '\\') {
                    // "No newline at end of file" marker - skip it (metadata, not content)
                    continue;
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
            return execSync(`git show ${ref}:${filePath}`);
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
            log(`🔄 Fetching missing ref: ${ref}`);
            await exec(`git fetch ${remote} ${ref} --no-tags --depth=1 --quiet`);

            // Verify the ref is now available
            if (!this.isValidRef(ref)) {
                throw new Error(`Reference ${ref} is still not valid after fetching from remote ${remote}`);
            }
        } catch (error) {
            throw new Error(`Failed to fetch git reference ${ref}: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    static async getMainBranchCommitHash(remote?: string): Promise<string> {
        const baseRefName = GITHUB_BASE_REF ?? 'main';

        // Fetch the main branch from the specified remote (or locally) to ensure it's available
        if (IS_CI || remote) {
            await exec(`git fetch ${remote ?? 'origin'} ${baseRefName} --no-tags --depth=1`);
        }

        // In CI, use a simpler approach - just use the remote main branch directly
        // This avoids issues with shallow clones and merge-base calculations
        if (IS_CI) {
            const mainBaseRef = remote ? `${remote}/${baseRefName}` : `origin/${baseRefName}`;

            try {
                const {stdout: revParseOutput} = await exec(`git rev-parse ${mainBaseRef}`);
                const mergeBaseHash = revParseOutput.trim();

                // Validate the output is a proper SHA hash
                if (!mergeBaseHash || !/^[a-fA-F0-9]{40}$/.test(mergeBaseHash)) {
                    throw new Error(`git rev-parse returned unexpected output: ${mergeBaseHash}`);
                }

                return mergeBaseHash;
            } catch (error) {
                logError(`Failed to get commit hash for ${mainBaseRef}:`, error);
                throw new Error(`Could not get commit hash for ${mainBaseRef}`);
            }
        }

        const mainBaseRef = remote ? `${remote}/${baseRefName}` : baseRefName;

        // For local development, try to find the actual merge base
        let mergeBaseHash: string;
        try {
            const {stdout: mergeBaseOutput} = await exec(`git merge-base ${mainBaseRef} HEAD`);
            mergeBaseHash = mergeBaseOutput.trim();
        } catch {
            logWarn(`Warning: Could not find merge base between ${mainBaseRef} and HEAD.`);

            // If merge-base fails locally, fall back to using the remote main branch
            try {
                const {stdout: revParseOutput} = await exec(`git rev-parse ${mainBaseRef}`);
                mergeBaseHash = revParseOutput.trim();
            } catch (fallbackError) {
                logError(`Failed to find merge base with ${mainBaseRef}:`, fallbackError);
                throw new Error(`Could not determine merge base with ${mainBaseRef}`);
            }
        }

        // Validate the output is a proper SHA hash
        if (!mergeBaseHash || !/^[a-fA-F0-9]{40}$/.test(mergeBaseHash)) {
            throw new Error(`git merge-base returned unexpected output: ${mergeBaseHash}`);
        }

        return mergeBaseHash;
    }

    /**
     * Check if there are any uncommitted changes (both staged and unstaged).
     *
     * @returns true if there are uncommitted changes, false otherwise
     */
    static async hasUncommittedChanges(): Promise<boolean> {
        try {
            const {stdout} = await exec('git status --porcelain');
            const status = stdout.trim();
            return status.length > 0;
        } catch (error) {
            return false;
        }
    }

    static async getChangedFileNames(fromRef: string, toRef?: string, shouldIncludeUntrackedFiles = false): Promise<string[]> {
        if (IS_CI) {
            const {data: changedFiles} = await GitHubUtils.octokit.pulls.listFiles({
                owner: CONST.GITHUB_OWNER,
                repo: CONST.APP_REPO,
                // eslint-disable-next-line @typescript-eslint/naming-convention
                pull_number: context.payload.pull_request?.number ?? 0,
            });

            return changedFiles.map((file) => file.filename);
        }

        // Get the diff output and check status
        const diffResult = this.diff(fromRef, toRef, undefined, shouldIncludeUntrackedFiles);
        const files = diffResult.files.map((file) => file.filePath);
        return files;
    }

    /**
     * Get list of untracked files from git.
     *
     * @param filePaths - Optional specific file path(s) to filter by (relative to git repo root)
     * @returns Array of untracked file paths
     */
    static getUntrackedFiles(filePaths?: string | string[]): string[] {
        try {
            // Get all untracked files
            const untrackedOutput = execSync('git ls-files --others --exclude-standard', {
                stdio: 'pipe',
            });

            if (!untrackedOutput.trim()) {
                return [];
            }

            let untrackedFiles = untrackedOutput
                .trim()
                .split('\n')
                .filter((file) => file.length > 0);

            // Filter by filePaths if provided
            if (filePaths) {
                const pathsArray = Array.isArray(filePaths) ? filePaths : [filePaths];
                const normalizedPaths = pathsArray.map((p) => path.normalize(p));
                untrackedFiles = untrackedFiles.filter((file) => {
                    const normalizedFile = path.normalize(file);
                    return normalizedPaths.some((p) => normalizedFile === p || normalizedFile.startsWith(p + path.sep));
                });
            }

            return untrackedFiles;
        } catch (error) {
            // If command fails, return empty array (e.g., not a git repo)
            return [];
        }
    }

    /**
     * Create FileDiff entries for untracked files by reading their content and treating all lines as added.
     *
     * @param untrackedFiles - Array of untracked file paths (relative to git repo root)
     * @returns Array of FileDiff entries for untracked files
     */
    private static createFileDiffsForUntrackedFiles(untrackedFiles: string[]): FileDiff[] {
        const fileDiffs: FileDiff[] = [];

        for (const filePath of untrackedFiles) {
            const absolutePath = path.join(process.cwd(), filePath);

            // Check if file exists and is readable
            if (!fs.existsSync(absolutePath) || !fs.statSync(absolutePath).isFile()) {
                continue;
            }

            let fileContent: string;
            try {
                fileContent = fs.readFileSync(absolutePath, 'utf8');
            } catch (error) {
                // Skip files that can't be read
                continue;
            }

            // Split content into lines
            const lines = fileContent.split('\n');
            const addedLines = new Set<number>();

            // Create a single hunk with all lines as added
            const diffLines: DiffLine[] = [];
            for (let i = 0; i < lines.length; i++) {
                const lineNumber = i + 1;
                addedLines.add(lineNumber);
                diffLines.push({
                    number: lineNumber,
                    type: 'added',
                    content: lines.at(i) ?? '',
                });
            }

            // Create a single hunk for the entire file
            const hunk: DiffHunk = {
                oldStart: 0,
                oldCount: 0,
                newStart: 1,
                newCount: lines.length,
                lines: diffLines,
            };

            const fileDiff: FileDiff = {
                filePath,
                diffType: 'added',
                hunks: [hunk],
                addedLines,
                removedLines: new Set(),
                modifiedLines: new Set(),
            };

            fileDiffs.push(fileDiff);
        }

        return fileDiffs;
    }
}

export default Git;
export type {DiffResult, FileDiff, DiffHunk, DiffLine};
