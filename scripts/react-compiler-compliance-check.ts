#!/usr/bin/env ts-node

/**
 * React Compiler Compliance Checker
 *
 * This script tracks which components can be compiled by React Compiler and which cannot.
 * It provides both CI and local development tools to enforce Rules of React compliance.
 */
import {execSync} from 'child_process';
import {writeFileSync} from 'fs';
import {join} from 'path';
import type {TupleToUnion} from 'type-fest';
import CLI from './utils/CLI';
import Git from './utils/Git';
import {log, bold as logBold, error as logError, info as logInfo, note as logNote, success as logSuccess, warn as logWarn} from './utils/Logger';

const TAB = '    ';

const DEFAULT_REPORT_FILENAME = 'react-compiler-report.json';

const SUPPRESSED_COMPILER_ERRORS = [
    // This error is caused by an internal limitation of React Compiler
    // https://github.com/facebook/react/issues/29583
    '(BuildHIR::lowerExpression) Expected Identifier, got MemberExpression key in ObjectExpression',
] as const satisfies string[];

const ESLINT_DISABLE_PATTERNS = {
    FILE_KEYWORDS: ['// eslint-disable ', '/* eslint-disable '],
    LINE_KEYWORDS: ['// eslint-disable-next-line ', '/* eslint-disable-next-line '],
    LINT_RULES: ['react-compiler/react-compiler', 'react-hooks'],
} as const;

const VERBOSE_OUTPUT_LINE_REGEXES = {
    SUCCESS: /Successfully compiled (?:hook|component) \[([^\]]+)\]\(([^)]+)\)/,
    FAILURE_WITH_REASON: /Failed to compile ([^:]+):(\d+):(\d+)\. Reason: (.+)/,
    FAILURE_WITHOUT_REASON: /Failed to compile ([^:]+):(\d+):(\d+)\./,
    REASON: /Reason: (.+)/,
} as const satisfies Record<string, RegExp>;

type FailureMap = Map<string, CompilerFailure>;

type CompilerResults = {
    success: Set<string>;
    failures: FailureMap;
    suppressedFailures: FailureMap;
};

type CompilerFailure = {
    file: string;
    line?: number;
    column?: number;
    reason?: string;
};

type DiffFilteringCommits = {
    fromRef: string;
    toRef?: string;
};

type PrintResultsOptions = {
    shouldPrintSuccesses: boolean;
    shouldPrintSuppressedErrors: boolean;
};

type BaseCheckOptions = PrintResultsOptions & {
    remote?: string;
    reportFileName?: string;
    shouldGenerateReport?: boolean;
    shouldFilterByDiff?: boolean;
};

type CheckOptions = BaseCheckOptions & {
    files?: string[];
};

async function check({
    files,
    shouldGenerateReport = false,
    reportFileName = DEFAULT_REPORT_FILENAME,
    shouldFilterByDiff = false,
    remote,
    shouldPrintSuccesses = false,
    shouldPrintSuppressedErrors = false,
}: CheckOptions): Promise<boolean> {
    if (files) {
        logInfo(`Running React Compiler check for ${files.length} files or glob patterns...`);
    } else {
        logInfo('Running React Compiler check for all files...');
    }

    const src = createFilesGlob(files);
    let results = runCompilerHealthcheck(src);

    if (shouldFilterByDiff) {
        const mainBaseCommitHash = await Git.getMainBranchCommitHash(remote);
        const diffFilteringCommits: DiffFilteringCommits = {fromRef: mainBaseCommitHash};

        results = await filterResultsByDiff(results, diffFilteringCommits, {shouldPrintSuccesses, shouldPrintSuppressedErrors});
    }

    printResults(results, {shouldPrintSuccesses, shouldPrintSuppressedErrors});

    if (shouldGenerateReport) {
        generateReport(results, reportFileName);
    }

    const isPassed = results.failures.size === 0;
    return isPassed;
}

async function checkChangedFiles({remote, ...restOptions}: BaseCheckOptions): Promise<boolean> {
    logInfo('Checking changed files for React Compiler compliance...');

    const mainBaseCommitHash = await Git.getMainBranchCommitHash(remote);
    const changedFiles = await Git.getChangedFileNames(mainBaseCommitHash);

    if (changedFiles.length === 0) {
        logSuccess('No React files changed, skipping check.');
        return true;
    }

    return check({files: changedFiles, ...restOptions});
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
function addFailureIfDoesNotExist(failureMap: FailureMap, newFailure: CompilerFailure): boolean {
    const key = getUniqueFileKey(newFailure);
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
        const successMatch = line.match(VERBOSE_OUTPUT_LINE_REGEXES.SUCCESS);
        if (successMatch) {
            const filePath = successMatch[2];
            results.success.add(filePath);
            continue;
        }

        // Parse failed file paths with file, location, and reason all on one line
        const failureWithReasonMatch = line.match(VERBOSE_OUTPUT_LINE_REGEXES.FAILURE_WITH_REASON);
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
        const failureWithoutReasonMatch = line.match(VERBOSE_OUTPUT_LINE_REGEXES.FAILURE_WITHOUT_REASON);
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
        const reasonMatch = line.match(VERBOSE_OUTPUT_LINE_REGEXES.REASON);
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

    return results;
}

function shouldSuppressCompilerError(reason: string | undefined): boolean {
    if (!reason) {
        return false;
    }

    // Check if the error reason matches any of the suppressed error patterns
    return SUPPRESSED_COMPILER_ERRORS.some((suppressedError) => reason.includes(suppressedError));
}

function getUniqueFileKey({file, line, column}: CompilerFailure): string {
    const isLineSet = line !== undefined;
    const isLineAndColumnSet = isLineSet && column !== undefined;

    return file + (isLineSet ? `:${line}` : '') + (isLineAndColumnSet ? `:${column}` : '');
}

function createFilesGlob(files?: string[]): string | undefined {
    if (!files || files.length === 0) {
        return undefined;
    }

    if (files.length === 1) {
        return files.at(0);
    }

    return `**/+(${files.join('|')})`;
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
async function filterResultsByDiff(
    results: CompilerResults,
    diffFilteringCommits: DiffFilteringCommits,
    {shouldPrintSuccesses, shouldPrintSuppressedErrors}: PrintResultsOptions,
): Promise<CompilerResults> {
    logInfo(`Filtering results by diff between ${diffFilteringCommits.fromRef} and ${diffFilteringCommits.toRef ?? 'the working tree'}...`);

    // Get the diff between the base ref and the working tree
    const diffResult = Git.diff(diffFilteringCommits.fromRef, diffFilteringCommits.toRef);

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

    // Filter failures to only include those on changed lines and files/chunks for which an eslint-disable comment is was removed
    function filterFailuresByChangedLines(failures: Map<string, CompilerFailure>) {
        // Filter failures to only include those on changed lines
        const filteredFailures = new Map<string, CompilerFailure>();

        // eslint-disable-next-line unicorn/no-array-for-each
        failures.forEach((failure, key) => {
            const changedLines = changedLinesMap.get(failure.file);

            // If the file is not in the diff, skip this failure
            if (!changedLines) {
                return;
            }

            // If the file has eslint-disable comment, include ALL failures for this file
            if (filesWithEslintDisable.has(failure.file)) {
                filteredFailures.set(key, failure);
                return;
            }

            // If the failure has a line number, check if it's in the changed lines or eslint-disable-next-line
            if (failure.line !== undefined) {
                const isLineChanged = changedLines.has(failure.line);
                const isLineEslintDisabled = linesWithEslintDisableNextLine.get(failure.file)?.has(failure.line);

                if (isLineChanged || isLineEslintDisabled) {
                    filteredFailures.set(key, failure);
                }
                return;
            }

            // If there's no line number, include the failure if the file has changes
            filteredFailures.set(key, failure);
        });

        return filteredFailures;
    }

    // Filter failures to only include those on changed lines
    const filteredFailures = filterFailuresByChangedLines(results.failures);
    const filteredSuppressedFailures = filterFailuresByChangedLines(results.suppressedFailures);

    // Filter success set to only include files that are in the diff
    const changedFiles = new Set(diffResult.files.map((file) => file.filePath));
    const filteredSuccesses = new Set<string>();
    // eslint-disable-next-line unicorn/no-array-for-each
    results.success.forEach((file) => {
        if (!changedFiles.has(file)) {
            return;
        }
        filteredSuccesses.add(file);
    });

    if (shouldPrintSuccesses) {
        if (filteredSuccesses.size === 0) {
            logInfo('No successes remain after filtering by diff.');
        } else {
            logInfo(`${filteredSuccesses.size} out of ${results.success.size} successes remain after filtering by diff.`);
        }
    }

    if (shouldPrintSuppressedErrors) {
        if (filteredSuppressedFailures.size === 0) {
            logInfo('No suppressed errors remain after filtering by diff.');
        } else {
            logInfo(`${filteredSuppressedFailures.size} out of ${results.suppressedFailures.size} successes remain after filtering by diff.`);
        }
    }

    if (filteredFailures.size === 0) {
        logInfo('No failures remain after filtering by diff.');
    } else {
        logInfo(`${filteredFailures.size} out of ${results.failures.size} failures remain after filtering by diff.`);
    }

    return {
        success: filteredSuccesses,
        failures: filteredFailures,
        suppressedFailures: filteredSuppressedFailures,
    };
}

function printResults({success, failures, suppressedFailures}: CompilerResults, {shouldPrintSuccesses, shouldPrintSuppressedErrors}: PrintResultsOptions): void {
    if (shouldPrintSuccesses && success.size > 0) {
        log();
        logSuccess(`Successfully compiled ${success.size} files with React Compiler:`);
        log();

        // eslint-disable-next-line unicorn/no-array-for-each
        success.forEach((successFile) => {
            logSuccess(`${successFile}`);
        });

        log();
    }

    if (shouldPrintSuppressedErrors && suppressedFailures.size > 0) {
        // Create a Map of suppressed error type -> Failure[] with distinct errors and a list of failures with that error
        const suppressedErrorMap = new Map<string, CompilerFailure[]>();
        // eslint-disable-next-line unicorn/no-array-for-each
        suppressedFailures.forEach((failure) => {
            if (!failure.reason) {
                return;
            }

            if (!suppressedErrorMap.has(failure.reason)) {
                suppressedErrorMap.set(failure.reason, []);
            }

            suppressedErrorMap.get(failure.reason)?.push(failure);
        });

        log();
        logWarn(`Suppressed the following errors in these files:`);
        log();

        for (const [error, suppressedErrorFiles] of suppressedErrorMap.entries()) {
            logBold(error);
            const filesLine = suppressedErrorFiles.map((failure) => getUniqueFileKey(failure)).join(', ');
            logNote(`${TAB} - ${filesLine}`);
        }

        log();
    }

    const isPassed = failures.size === 0;
    if (isPassed) {
        logSuccess('All files pass React Compiler compliance check!');
        return;
    }

    const distinctFileNames = new Set<string>();
    // eslint-disable-next-line unicorn/no-array-for-each
    failures.forEach((failure) => {
        distinctFileNames.add(failure.file);
    });

    log();
    logError(`Failed to compile ${distinctFileNames.size} files with React Compiler:`);
    log();

    // eslint-disable-next-line unicorn/no-array-for-each
    failures.forEach((failure) => {
        const location = failure.line && failure.column ? `:${failure.line}:${failure.column}` : '';
        logBold(`${failure.file}${location}`);
        logNote(`${TAB}${failure.reason ?? 'No reason provided'}`);
    });

    log();
    logError('The files above failed to compile with React Compiler, probably because of Rules of React violations. Please fix the issues and run the check again.');
}

function generateReport(results: CompilerResults, outputFileName = DEFAULT_REPORT_FILENAME): void {
    log('\n');
    logInfo('Creating React Compiler Compliance Check report:');

    // Save detailed report
    const reportFile = join(process.cwd(), outputFileName);
    writeFileSync(
        reportFile,
        JSON.stringify(
            {
                timestamp: new Date().toISOString(),
                summary: {
                    total: results.success.size + results.failures.size,
                    success: results.success.size,
                    failure: results.failures.size,
                },
                success: results.success,
                failures: results.failures,
            },
            null,
            2,
        ),
    );

    logSuccess(`Detailed report saved to: ${reportFile}`);
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
            reportFileName: {
                description: 'File name to save the report to',
                required: false,
                default: DEFAULT_REPORT_FILENAME,
            },
        },
        flags: {
            filterByDiff: {
                description: 'Filter the files to check by the diff between the current commit/PR and the main branch',
                required: false,
                default: false,
            },
            report: {
                description: 'Generate a report of the results',
                required: false,
                default: false,
            },
            printSuccesses: {
                description: 'Print the successes',
                required: false,
                default: false,
            },
            printSuppressedErrors: {
                description: 'Print suppressed errors',
                required: false,
                default: false,
            },
        },
    });

    const {command, file} = cli.positionalArgs;
    const {remote, reportFileName} = cli.namedArgs;
    const {report: shouldGenerateReport, filterByDiff: shouldFilterByDiff, printSuccesses: shouldPrintSuccesses, printSuppressedErrors: shouldPrintSuppressedErrors} = cli.flags;

    const commonOptions: BaseCheckOptions = {shouldGenerateReport, reportFileName, shouldFilterByDiff, shouldPrintSuccesses, shouldPrintSuppressedErrors};

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
