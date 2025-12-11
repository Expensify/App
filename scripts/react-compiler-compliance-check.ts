#!/usr/bin/env ts-node

/**
 * React Compiler Compliance Checker
 *
 * This script tracks which components can be compiled by React Compiler and which cannot.
 * It provides both CI and local development tools to enforce Rules of React compliance.
 */
import {execSync} from 'child_process';
import fs, {readFileSync} from 'fs';
import path from 'path';
import type {TupleToUnion} from 'type-fest';
import CLI from './utils/CLI';
import FileUtils from './utils/FileUtils';
import Git from './utils/Git';
import type {DiffResult} from './utils/Git';
import {log, bold as logBold, error as logError, info as logInfo, note as logNote, success as logSuccess, warn as logWarn} from './utils/Logger';

const TAB = '    ';

const SUPPRESSED_COMPILER_ERRORS = [
    // This error is caused by an internal limitation of React Compiler
    // https://github.com/facebook/react/issues/29583
    '(BuildHIR::lowerExpression) Expected Identifier, got MemberExpression key in ObjectExpression',
] as const satisfies string[];

const MANUAL_MEMOIZATION_PATTERNS = {
    memo: /\b(?:React\.)?memo\s*\(/g,
    useMemo: /\b(?:React\.)?useMemo\s*\(/g,
    useCallback: /\b(?:React\.)?useCallback\s*\(/g,
} as const satisfies Record<string, RegExp>;

const MANUAL_MEMOIZATION_FILE_EXTENSIONS = ['.tsx', '.jsx'] as const satisfies string[];

type ManualMemoizationKeyword = keyof typeof MANUAL_MEMOIZATION_PATTERNS;

const MANUAL_MEMOIZATION_FAILURE_MESSAGE = (manualMemoizationKeyword: ManualMemoizationKeyword) =>
    `Found a manual memoization usage of \`${manualMemoizationKeyword}\`. Newly added React component files must not contain any manual memoization and instead be auto-memoized by React Compiler. Remove \`${manualMemoizationKeyword}\` or disable automatic memoization by adding the \`"use no memo";\` directive at the beginning of the component and give a reason why automatic memoization is not applicable.`;

const NO_MANUAL_MEMO_DIRECTIVE_PATTERN = /["']use no memo["']\s*;?/;

const ESLINT_DISABLE_PATTERNS = {
    FILE_KEYWORDS: ['// eslint-disable ', '/* eslint-disable '],
    LINE_KEYWORDS: ['// eslint-disable-next-line ', '/* eslint-disable-next-line '],
    LINT_RULES: ['react-compiler/react-compiler', 'react-hooks'],
} as const;

const REACT_COMPILER_HEALTHCHECK_OUTPUT_REGEXES = {
    SUCCESS: /Successfully compiled (?:hook|component) \[([^\]]+)\]\(([^)]+)\)/,
    FAILURE_WITH_REASON: /Failed to compile ([^:]+):(\d+):(\d+)\. Reason: (.+)/,
    FAILURE_WITHOUT_REASON: /Failed to compile ([^:]+):(\d+):(\d+)\./,
    REASON: /Reason: (.+)/,
} as const satisfies Record<string, RegExp>;

type CompilerResults = {
    success: Set<string>;
    failures: Map<string, CompilerFailure>;
    suppressedFailures: Map<string, CompilerFailure>;
    manualMemoFailures?: Map<string, ManualMemoizationError[]>;
};

type CompilerFailure = {
    file: string;
    line?: number;
    column?: number;
    reason?: string;
};

type ManualMemoizationError = {
    keyword: ManualMemoizationKeyword;
    line: number;
    column: number;
};

type CheckMode = 'static' | 'incremental';

type BaseCheckParameters = {
    remote?: string;
    verbose?: boolean;
};

type CheckParameters = BaseCheckParameters & {
    mode?: CheckMode;
    files?: string[];
};

type CheckOptions = {
    mode: CheckMode;
    verbose: boolean;
};

async function checkChangedFiles({remote, ...restOptions}: BaseCheckParameters): Promise<boolean> {
    logInfo('Checking changed files for React Compiler compliance...');

    const mainBaseCommitHash = await Git.getMainBranchCommitHash(remote);
    const changedFiles = await Git.getChangedFileNames(mainBaseCommitHash, undefined, true);

    if (changedFiles.length === 0) {
        logSuccess('No React files changed, skipping check.');
        return true;
    }

    return check({mode: 'incremental', files: changedFiles, ...restOptions});
}

async function check({mode = 'static', files, remote, verbose = false}: CheckParameters): Promise<boolean> {
    const options: CheckOptions = {mode, verbose};

    if (files) {
        logInfo(`Running React Compiler check for ${files.length} files or glob patterns...`);
    } else {
        logInfo('Running React Compiler check for all files...');
    }

    let results = runCompilerHealthcheck(createFilesGlob(files));

    const mainBaseCommitHash = await Git.getMainBranchCommitHash(remote);
    const diffResult = Git.diff(mainBaseCommitHash, undefined, undefined, true);

    // If we are in incremental mode, we only want to show errors for lines
    // that were directly modified in the git diff, not for the whole file.
    if (mode === 'incremental') {
        results = await filterResultsByDiff(results, mainBaseCommitHash, diffResult, options);
    }

    // Enforce automatic memoization for added files that are successfully compiled with React Compiler
    const {reactCompilerFailures, manualMemoFailures} = enforceAutomaticMemoization(results, diffResult);

    results.manualMemoFailures = manualMemoFailures;
    results.failures = reactCompilerFailures;

    const isPassed = printResults(results, options);

    generateReport(results);

    return isPassed;
}

function runCompilerHealthcheck(src?: string): CompilerResults {
    let srcString = src;
    if (srcString) {
        srcString = srcString?.startsWith('"') ? srcString : `"${srcString}`;
        srcString = srcString?.endsWith('"') ? srcString : `${srcString}"`;
    }

    const command = `npx react-compiler-healthcheck ${src ? `--src ${srcString}` : ''} --verbose`;
    const output = execSync(command, {
        encoding: 'utf8',
        cwd: process.cwd(),
    });

    return parseHealthcheckOutput(output);
}

// eslint-disable-next-line rulesdir/no-negated-variables
function addFailureIfDoesNotExist(failureMap: Map<string, CompilerFailure>, newFailure: CompilerFailure): boolean {
    const key = getFailureKey(newFailure);
    const existingFailure = failureMap.get(key);

    if (existingFailure) {
        const isReasonSet = !!existingFailure.reason;
        const isNewReasonSet = !!newFailure.reason;
        if (!isReasonSet && isNewReasonSet) {
            failureMap.set(key, newFailure);
            return true;
        }

        return false;
    }

    failureMap.set(key, newFailure);
    return true;
}

/**
 * Parses the output of the react-compiler-healthcheck command and returns the compiler results.
 * @param output - The output of the react-compiler-healthcheck command
 * @returns The compiler results
 */
function parseHealthcheckOutput(output: string): CompilerResults {
    const lines = output.split('\n');

    const results: CompilerResults = {
        success: new Set(),
        failures: new Map(),
        suppressedFailures: new Map(),
    };

    let currentFailureWithoutReason: CompilerFailure | null = null;

    // Parse verbose output
    for (const line of lines) {
        // Parse successful file paths
        const successMatch = line.match(REACT_COMPILER_HEALTHCHECK_OUTPUT_REGEXES.SUCCESS);
        if (successMatch) {
            const filePath = successMatch[2];
            results.success.add(filePath);
            continue;
        }

        // Parse failed file paths with file, location, and reason all on one line
        const failureWithReasonMatch = line.match(REACT_COMPILER_HEALTHCHECK_OUTPUT_REGEXES.FAILURE_WITH_REASON);
        if (failureWithReasonMatch) {
            const newFailure: CompilerFailure = {
                file: failureWithReasonMatch[1],
                line: parseInt(failureWithReasonMatch[2], 10),
                column: parseInt(failureWithReasonMatch[3], 10),
                reason: failureWithReasonMatch[4],
            };

            // If we already have a reason, we don't want to set the reason again
            currentFailureWithoutReason = null;

            if (shouldSuppressCompilerError(newFailure.reason)) {
                addFailureIfDoesNotExist(results.suppressedFailures, newFailure);
                continue;
            }

            // Only add if failure does not exist already, or if existing one has no reason
            addFailureIfDoesNotExist(results.failures, newFailure);
        }

        // Parse failed compilation with file and location only (fallback)
        const failureWithoutReasonMatch = line.match(REACT_COMPILER_HEALTHCHECK_OUTPUT_REGEXES.FAILURE_WITHOUT_REASON);
        if (failureWithoutReasonMatch) {
            const newFailure: CompilerFailure = {
                file: failureWithoutReasonMatch[1],
                line: parseInt(failureWithoutReasonMatch[2], 10),
                column: parseInt(failureWithoutReasonMatch[3], 10),
            };

            currentFailureWithoutReason = newFailure;

            // Only create new failure if it doesn't exist
            addFailureIfDoesNotExist(results.failures, newFailure);

            continue;
        }

        // Parse reason line (fallback for multi-line reasons)
        const reasonMatch = line.match(REACT_COMPILER_HEALTHCHECK_OUTPUT_REGEXES.REASON);
        if (reasonMatch && currentFailureWithoutReason) {
            const reason = reasonMatch[1];

            const currentFailure: CompilerFailure = {
                file: currentFailureWithoutReason.file,
                line: currentFailureWithoutReason.line,
                column: currentFailureWithoutReason.column,
                reason,
            };

            currentFailureWithoutReason = null;

            if (shouldSuppressCompilerError(reason)) {
                addFailureIfDoesNotExist(results.suppressedFailures, currentFailure);
                continue;
            }

            addFailureIfDoesNotExist(results.failures, currentFailure);
        }
    }

    // Sort results by file name, line number, and column number
    results.success = new Set(Array.from(results.success).sort((a, b) => a.localeCompare(b)));
    results.failures = sortFailures(results.failures);
    results.suppressedFailures = sortFailures(results.suppressedFailures);

    return results;
}

function sortFailures(failures: Map<string, CompilerFailure>) {
    const arr = Array.from(failures.entries());
    arr.sort(([, a], [, b]) => {
        const keyA = getFailureKey(a);
        const keyB = getFailureKey(b);
        return keyA.localeCompare(keyB);
    });
    return new Map(arr);
}

/**
 * Checks if a compiler error should be suppressed based on the error reason.
 * @param reason - The reason for the compiler error
 * @returns True if the error should be suppressed, false otherwise
 */
function shouldSuppressCompilerError(reason: string | undefined): boolean {
    if (!reason) {
        return false;
    }

    // Check if the error reason matches any of the suppressed error patterns
    return SUPPRESSED_COMPILER_ERRORS.some((suppressedError) => reason.includes(suppressedError));
}

/**
 * Creates a unique key for a compiler failure by combining the file path, line number, and column number.
 * @param failure - The compiler failure to create a unique key for
 * @returns A unique key for the compiler failure
 */
function getFailureKey({file, line, column}: CompilerFailure): string {
    const isLineSet = line !== undefined;
    const isLineAndColumnSet = isLineSet && column !== undefined;

    return file + (isLineSet ? `:${line}` : '') + (isLineAndColumnSet ? `:${column}` : '');
}

/**
 * Creates a glob pattern from an array of file paths.
 * @param files - The file paths to create a glob pattern from
 * @returns A glob pattern string
 */
function createFilesGlob(files?: string[]): string | undefined {
    if (!files || files.length === 0) {
        return undefined;
    }

    if (files.length === 1) {
        return files.at(0);
    }

    return `**/+(${files.join('|')})`;
}

function getDistinctFailureFileNames(failures: Map<string, CompilerFailure>) {
    const distinctFileNames = new Set<string>();
    for (const [, failure] of failures) {
        distinctFileNames.add(failure.file);
    }

    return distinctFileNames;
}

/**
 * Filters compiler results to only include failures for lines that were changed in the git diff.
 * This helps focus on new issues introduced by the current changes rather than pre-existing issues.
 *
 * Additionally includes failures when:
 * - Any chunk in a file contains eslint-disable react-compiler/react-compiler comment
 * - A line contains eslint-disable-next-line react-compiler/react-compiler comment (includes the next line)
 *
 * @param results - The compiler results to filter
 * @param diffFilteringCommits - The commit range to diff (from and to)
 * @returns Filtered compiler results containing only failures in changed lines or eslint-disabled areas
 */
async function filterResultsByDiff(results: CompilerResults, mainBaseCommitHash: string, diffResult: DiffResult, {verbose}: CheckOptions): Promise<CompilerResults> {
    logInfo(`Filtering results by diff between ${mainBaseCommitHash} and the working tree...`);

    // If there are no changes, return empty results
    if (!diffResult.hasChanges) {
        return {
            success: new Set(),
            failures: new Map(),
            suppressedFailures: new Map(),
        };
    }

    // Create a map of file paths to changed line numbers for quick lookup
    const changedLinesMap = new Map<string, Set<number>>();

    // Track files with eslint-disable comments and lines with eslint-disable-next-line
    const filesWithEslintDisable = new Set<string>();
    const linesWithEslintDisableNextLine = new Map<string, Set<number>>();

    for (const file of diffResult.files) {
        const changedLines = new Set([...file.addedLines, ...file.modifiedLines]);
        changedLinesMap.set(file.filePath, changedLines);

        for (const hunk of file.hunks) {
            for (const line of hunk.lines) {
                function doesLineIncludeEslintDisableComment(isFileLevel: boolean): boolean {
                    const trimmedContent = line.content.trim();

                    let includesKeyword = false;
                    if (isFileLevel) {
                        includesKeyword = ESLINT_DISABLE_PATTERNS.FILE_KEYWORDS.some((keyword) => trimmedContent.startsWith(keyword));
                    } else {
                        includesKeyword = ESLINT_DISABLE_PATTERNS.LINE_KEYWORDS.some((keyword) => trimmedContent.startsWith(keyword));
                    }

                    return includesKeyword && ESLINT_DISABLE_PATTERNS.LINT_RULES.some((rule) => trimmedContent.includes(rule));
                }

                // Check for file-level eslint-disable comment
                if (doesLineIncludeEslintDisableComment(true)) {
                    filesWithEslintDisable.add(file.filePath);
                }

                // Check for line-level eslint-disable-next-line comment
                if (doesLineIncludeEslintDisableComment(false)) {
                    if (!linesWithEslintDisableNextLine.has(file.filePath)) {
                        linesWithEslintDisableNextLine.set(file.filePath, new Set());
                    }
                    // Include the next line (current line + 1)
                    const disabledLines = linesWithEslintDisableNextLine.get(file.filePath);

                    if (!disabledLines) {
                        continue;
                    }

                    // When the eslint-disable-next-line comment is removed, the react compiler error line number is the line number of the next line
                    const reactCompilerErrorLineNumber = line.type === 'removed' ? line.number + hunk.newCount : line.number + hunk.newCount + 1;
                    disabledLines.add(reactCompilerErrorLineNumber);
                }
            }
        }
    }

    /**
     * Filter failures to only include those on changed lines and files/chunks for which an eslint-disable comment is was removed
     * @param failures - The unfiltered compiler failures
     * @returns The filtered compiler failures
     */
    function filterFailuresByChangedLines(failures: Map<string, CompilerFailure>) {
        // Filter failures to only include those on changed lines
        const filteredFailures = new Map<string, CompilerFailure>();

        for (const [key, failure] of failures) {
            const changedLines = changedLinesMap.get(failure.file);

            // If the file is not in the diff, skip this failure
            if (!changedLines) {
                continue;
            }

            // If the file has eslint-disable comment, include ALL failures for this file
            if (filesWithEslintDisable.has(failure.file)) {
                filteredFailures.set(key, failure);
                continue;
            }

            // If the failure has a line number, check if it's in the changed lines or eslint-disable-next-line
            if (failure.line !== undefined) {
                const isLineChanged = changedLines.has(failure.line);
                const isLineEslintDisabled = linesWithEslintDisableNextLine.get(failure.file)?.has(failure.line);

                if (isLineChanged || isLineEslintDisabled) {
                    filteredFailures.set(key, failure);
                }
                continue;
            }

            // If there's no line number, include the failure if the file has changes
            filteredFailures.set(key, failure);
        }

        return filteredFailures;
    }

    // Filter failures to only include those on changed lines
    const filteredFailures = filterFailuresByChangedLines(results.failures);
    const filteredSuppressedFailures = filterFailuresByChangedLines(results.suppressedFailures);

    // Filter success set to only include files that are in the diff
    const changedFiles = new Set(diffResult.files.map((file) => file.filePath));
    const filteredSuccesses = new Set<string>();
    for (const file of results.success) {
        if (!changedFiles.has(file)) {
            continue;
        }
        filteredSuccesses.add(file);
    }

    if (filteredFailures.size === 0) {
        logInfo('No failures remain after filtering by diff.');
    } else {
        logInfo(`${filteredFailures.size} out of ${results.failures.size} failures remain after filtering by diff.`);
    }

    if (verbose) {
        if (filteredSuppressedFailures.size === 0) {
            logInfo('No suppressed errors remain after filtering by diff.');
        } else {
            logInfo(`${filteredSuppressedFailures.size} out of ${results.suppressedFailures.size} successes remain after filtering by diff.`);
        }

        if (filteredSuccesses.size === 0) {
            logInfo('No successes remain after filtering by diff.');
        } else {
            logInfo(`${filteredSuccesses.size} out of ${results.success.size} successes remain after filtering by diff.`);
        }
    }

    return {
        success: filteredSuccesses,
        failures: filteredFailures,
        suppressedFailures: filteredSuppressedFailures,
    };
}

/**
 * Enforces automatic memoization by checking for manual memoization keywords in already compiled files and attaching React compiler errors.
 * @param results - The compiler results to enforce automatic memoization on
 * @param diffResult - The diff result to check for added files
 * @returns The compiler results partitioned into manual memo errors and react compiler errors
 */
function enforceAutomaticMemoization({success, failures: reactCompilerFailures}: CompilerResults, diffResult: DiffResult) {
    const distinctFailureFileNames = getDistinctFailureFileNames(reactCompilerFailures);

    // Add added files from the diff that are already compiled successfully,
    // to a list of files that should have automatic memoization enforced
    const enforcedAutoMemoFiles = new Set<string>();
    for (const file of diffResult.files) {
        const filePath = file.filePath;

        const isReactComponentSourceFile = MANUAL_MEMOIZATION_FILE_EXTENSIONS.some((extension) => filePath.endsWith(extension));

        // We enforce automatic memoization for all successfully compiled files.
        const isSuccessfullyCompiled = success.has(filePath);
        if (isReactComponentSourceFile && isSuccessfullyCompiled) {
            enforcedAutoMemoFiles.add(filePath);
            distinctFailureFileNames.add(filePath);
        }
    }

    // Check all files whether we are enforcing automatic memoization, if so, log an error if manual memoization keywords are found and attach React compiler errors.
    const manualMemoFailures = new Map<string, ManualMemoizationError[]>();
    for (const file of distinctFailureFileNames) {
        if (!enforcedAutoMemoFiles.has(file)) {
            continue;
        }

        let source: string | null = null;
        try {
            const absolutePath = path.join(process.cwd(), file);
            source = readFileSync(absolutePath, 'utf8');
        } catch (error) {
            logWarn(`Unable to read ${file} while enforcing new component rules.`, error);
        }

        if (!source || NO_MANUAL_MEMO_DIRECTIVE_PATTERN.test(source)) {
            continue;
        }

        const manualMemoizationMatches = findManualMemoizationMatches(source);

        if (manualMemoizationMatches.length === 0) {
            continue;
        }

        manualMemoFailures.set(file, manualMemoizationMatches);
    }

    return {
        manualMemoFailures,
        reactCompilerFailures,
    };
}

/**
 * Finds all manual memoization keywords matches in source file and returns their line and column numbers.
 * @param source - The source code to search for manual memoization matches
 * @returns An array of manual memoization matches
 */
function findManualMemoizationMatches(source: string): ManualMemoizationError[] {
    const matches: ManualMemoizationError[] = [];

    for (const keyword of Object.keys(MANUAL_MEMOIZATION_PATTERNS) as ManualMemoizationKeyword[]) {
        const regex = MANUAL_MEMOIZATION_PATTERNS[keyword];
        const regexMatches = source.matchAll(regex);

        for (const regexMatch of regexMatches) {
            const matchIndex = regexMatch.index;
            if (matchIndex === undefined) {
                continue;
            }
            const {line, column} = FileUtils.getLineAndColumnFromIndex(source, matchIndex);
            matches.push({keyword, line, column});
        }
    }

    // Sort matches by line number first, then by column number
    matches.sort((a, b) => {
        if (a.line !== b.line) {
            return a.line - b.line;
        }
        return a.column - b.column;
    });

    return matches;
}

/**
 * Prints the results of the React Compiler compliance check.
 * @param results - The compiler results to print
 * @param options - The options for printing the results
 */
function printResults({success, failures, suppressedFailures, manualMemoFailures}: CompilerResults, {mode, verbose}: CheckOptions): boolean {
    if (verbose && success.size > 0) {
        log();
        logSuccess(`Successfully compiled ${success.size} files with React Compiler:`);
        log();

        for (const successFile of success) {
            logSuccess(`${successFile}`);
        }

        log();
    }

    if (verbose && suppressedFailures.size > 0) {
        // Create a Map of suppressed error type -> Failure[] with distinct errors and a list of failures with that error
        const suppressedErrorMap = new Map<string, CompilerFailure[]>();
        for (const [, failure] of suppressedFailures) {
            if (!failure.reason) {
                continue;
            }

            if (!suppressedErrorMap.has(failure.reason)) {
                suppressedErrorMap.set(failure.reason, []);
            }

            suppressedErrorMap.get(failure.reason)?.push(failure);
        }

        log();
        logWarn(`Suppressed the following errors in these files:`);
        log();

        for (const [error, suppressedErrorFiles] of suppressedErrorMap) {
            logBold(error);
            const filesLine = suppressedErrorFiles.map((failure) => getFailureKey(failure)).join(', ');
            logNote(`${TAB} - ${filesLine}`);
        }

        log();
    }

    // In Phase 1, we print all errors on modified lines and files as warnings.
    // TODO: Starting in Phase 2, always print errors instead.
    const shouldTreatReactCompilerErrorsAsWarnings = mode === 'incremental';

    const didRegularCheckPass = failures.size === 0 || shouldTreatReactCompilerErrorsAsWarnings;
    const hasManualMemoErrors = manualMemoFailures && manualMemoFailures.size > 0;
    const isPassed = didRegularCheckPass && !hasManualMemoErrors;

    if (failures.size > 0) {
        const distinctFailureFileNames = getDistinctFailureFileNames(failures);

        if (distinctFailureFileNames.size > 0) {
            const logMethod = shouldTreatReactCompilerErrorsAsWarnings ? logWarn : logError;
            log();
            logMethod(`Failed to compile ${distinctFailureFileNames.size} files with React Compiler:`);
            log();

            printFailures(failures);

            if (shouldTreatReactCompilerErrorsAsWarnings) {
                log();
                logWarn('React Compiler errors were printed as warnings for transparency, but these must NOT be fixed and can get ignored.');
            }
        }
    }

    // Print an extra empty line if no enforced errors are printed.
    if (shouldTreatReactCompilerErrorsAsWarnings && !hasManualMemoErrors) {
        log();
    }

    if (hasManualMemoErrors) {
        log();
        logError(`The following newly added components should be auto memoized by the React Compiler (manual memoization is not allowed):`);

        for (const [filePath, manualMemoizationMatches] of manualMemoFailures) {
            log();

            for (const manualMemoizationMatch of manualMemoizationMatches) {
                const location = manualMemoizationMatch.line && manualMemoizationMatch.column ? `:${manualMemoizationMatch.line}:${manualMemoizationMatch.column}` : '';
                logBold(`${filePath}${location}`);
                logNote(`${TAB}${MANUAL_MEMOIZATION_FAILURE_MESSAGE(manualMemoizationMatch.keyword)}`);
            }
        }
    }

    if (isPassed) {
        logSuccess('All files pass React Compiler compliance check!');
        return true;
    }

    log();
    logError(
        `The files above failed the React Compiler compliance check. Do not remove any manual memoization patterns, unless a file is already able to compile with React Compiler. You can use the "React Compiler Marker" VS Code extension to check whether a file is being compiled with React Compiler.`,
    );

    return false;
}

function printFailures(failuresToPrint: Map<string, CompilerFailure>, level = 0) {
    for (const failure of failuresToPrint.values()) {
        const location = failure.line && failure.column ? `:${failure.line}:${failure.column}` : '';
        logBold(`${TAB.repeat(level)}${failure.file}${location}`);
        logNote(`${TAB.repeat(level + 1)}${failure.reason ?? 'No reason provided'}`);
    }
}

/**
 * Generates a report of the React Compiler compliance check and saves it to /tmp.
 * @param results - The compiler results to generate a report for
 */
function generateReport({success, failures, suppressedFailures, manualMemoFailures}: CompilerResults): void {
    // Generate a unique filename with timestamp
    const timestamp = new Date().toISOString().replaceAll(/[:.]/g, '-');
    const reportFileName = `react-compiler-compliance-check-report-${timestamp}.json`;
    const reportFile = path.join('/tmp', reportFileName);

    const resultsObject = {
        success: Array.from(success),
        failures: Object.fromEntries(failures.entries()),
        suppressedFailures: Object.fromEntries(suppressedFailures.entries()),
        manualMemoFailures: Object.fromEntries(manualMemoFailures?.entries() ?? []),
    } satisfies Record<keyof CompilerResults, Record<string, unknown> | string[]>;

    fs.writeFileSync(
        reportFile,
        JSON.stringify(
            {
                timestamp: new Date().toISOString(),
                results: resultsObject,
            },
            null,
            2,
        ),
    );

    log();
    logInfo(`Report saved to: ${reportFile}`);
}

const Checker = {
    check,
    checkChangedFiles,
};

const CLI_COMMANDS = ['check', 'check-changed'] as const;
type CliCommand = TupleToUnion<typeof CLI_COMMANDS>;

// CLI interface
async function main() {
    const cli = new CLI({
        positionalArgs: [
            {
                name: 'command',
                description: 'Command to run',
                required: false,
                default: 'check',
                parse: (val) => {
                    if (!CLI_COMMANDS.includes(val as CliCommand)) {
                        throw new Error(`Invalid command. Must be one of: ${CLI_COMMANDS.join(', ')}`);
                    }
                    return val;
                },
            },
            {
                name: 'file',
                description: 'File path or glob pattern to check',
                required: false,
                default: '',
            },
        ],
        namedArgs: {
            remote: {
                description: 'Git remote name to use for main branch (default: no remote locally and origin in CI)',
                required: false,
                supersedes: ['check-changed'],
            },
        },
        flags: {
            verbose: {
                description: 'Print logs of successes and suppressed errors',
                required: false,
                default: false,
            },
        },
    });

    const {command, file} = cli.positionalArgs;
    const {remote} = cli.namedArgs;
    const {verbose} = cli.flags;

    const commonOptions: BaseCheckParameters = {
        verbose,
    };

    async function runCommand() {
        switch (command) {
            case 'check':
                return Checker.check({files: file ? [file] : undefined, ...commonOptions});
            case 'check-changed':
                return Checker.checkChangedFiles({remote, ...commonOptions});
            default:
                logError(`Unknown command: ${String(command)}`);
                return Promise.resolve(false);
        }
    }

    try {
        const isPassed = await runCommand();
        process.exit(isPassed ? 0 : 1);
    } catch (error) {
        logError('Error running react-compiler-compliance-check:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

export default Checker;
