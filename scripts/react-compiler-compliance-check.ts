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
import type {DiffResult} from './utils/Git';
import {log, bold as logBold, error as logError, info as logInfo, note as logNote, success as logSuccess, warn as logWarn} from './utils/Logger';

const DEFAULT_REPORT_FILENAME = 'react-compiler-report.json';

const SUPPRESSED_COMPILER_ERRORS = [
    // This error is caused by an internal limitation of React Compiler
    // https://github.com/facebook/react/issues/29583
    '(BuildHIR::lowerExpression) Expected Identifier, got MemberExpression key in ObjectExpression',
] as const satisfies string[];

const VERBOSE_OUTPUT_LINE_REGEXES = {
    SUCCESS: /Successfully compiled (?:hook|component) \[([^\]]+)\]\(([^)]+)\)/,
    FAILURE_WITH_REASON: /Failed to compile ([^:]+):(\d+):(\d+)\. Reason: (.+)/,
    FAILURE_WITHOUT_REASON: /Failed to compile ([^:]+):(\d+):(\d+)\./,
    REASON: /Reason: (.+)/,
} as const satisfies Record<string, RegExp>;

type HealthcheckJsonResults = {
    success: string[];
    failure: string[];
};

type CompilerResults = {
    success: Set<string>;
    failures: Map<string, CompilerFailure>;
};

type CompilerFailure = {
    file: string;
    line?: number;
    column?: number;
    reason?: string;
};

type DiffFilteringCommits = {
    from: string;
    to: string;
};

type CommonCheckOptions = {
    remote?: string;
    shouldGenerateReport?: boolean;
    reportFileName?: string;
    shouldFilterByDiff?: boolean;
    shouldPrintSuccesses?: boolean;
};

type PrintResultsOptions = {
    shouldPrintSuccesses: boolean;
};

type CheckOptions = CommonCheckOptions & {
    filesToCheck?: string[];
};

async function check({
    filesToCheck,
    shouldGenerateReport = false,
    reportFileName = DEFAULT_REPORT_FILENAME,
    shouldFilterByDiff = false,
    remote,
    shouldPrintSuccesses = false,
}: CheckOptions): Promise<boolean> {
    if (filesToCheck) {
        logInfo(`Running React Compiler check for ${filesToCheck.length} files or glob patterns...`);
    } else {
        logInfo('Running React Compiler check for all files...');
    }

    const src = createFilesGlob(filesToCheck);
    let results = runCompilerHealthcheck(src);

    if (shouldFilterByDiff) {
        const mainBaseCommitHash = await Git.getMainBranchCommitHash(remote);
        const headCommitHash = 'HEAD';
        const diffFilteringCommits: DiffFilteringCommits = {from: mainBaseCommitHash, to: headCommitHash};
        results = await filterResultsByDiff(results, diffFilteringCommits, {shouldPrintSuccesses});
    }

    printResults(results, {shouldPrintSuccesses});

    if (shouldGenerateReport) {
        generateReport(results, reportFileName);
    }

    const isPassed = results.failures.size === 0;
    return isPassed;
}

type CheckChangedFilesOptions = CommonCheckOptions & {
    reportFileName?: string;
};

async function checkChangedFiles({remote, ...restOptions}: CheckChangedFilesOptions): Promise<boolean> {
    logInfo('Checking changed files for React Compiler compliance...');

    try {
        const mainBaseCommitHash = await Git.getMainBranchCommitHash(remote);
        const changedFiles = await Git.getChangedFileNames(mainBaseCommitHash);
        const filesToCheck = [...new Set(changedFiles)];

        if (filesToCheck.length === 0) {
            logSuccess('No React files changed, skipping check.');
            return true;
        }

        return await check({filesToCheck, ...restOptions});
    } catch {
        return false;
    }
}

function runCompilerHealthcheck(src?: string): CompilerResults {
    let srcString = src;
    if (srcString) {
        srcString = srcString?.startsWith('"') ? srcString : `"${srcString}`;
        srcString = srcString?.endsWith('"') ? srcString : `${srcString}"`;
    }

    const command = `npx react-compiler-healthcheck ${src ? `--src ${srcString}` : ''} --json --verbose `;
    const output = execSync(command, {
        encoding: 'utf8',
        cwd: process.cwd(),
    });

    const results = parseHealthcheckOutput(output);
    return results;
}

function parseHealthcheckOutput(output: string): CompilerResults {
    const lines = output.split('\n');

    const initialResults: CompilerResults = {
        success: new Set<string>(),
        failures: new Map<string, CompilerFailure>(),
    };

    const verboseResults = parseVerboseOutput(lines, initialResults);
    const finalResults = parseJsonOutput(lines, verboseResults);

    return finalResults;
}

function parseJsonOutput(lines: string[], results: CompilerResults): CompilerResults {
    let jsonStart = -1;
    let jsonEnd = -1;
    for (let i = 0; i < lines.length; i++) {
        if (lines.at(i)?.trim().startsWith('{')) {
            jsonStart = i;
        }
        if (jsonStart !== -1 && lines.at(i)?.trim().endsWith('}')) {
            jsonEnd = i;
            break;
        }
    }

    if (jsonStart === -1 || jsonEnd === -1) {
        logWarn('No JSON found in combined output, parsing verbose text only');

        return results;
    }

    // Parse JSON if found
    try {
        const jsonLines = lines.slice(jsonStart, jsonEnd + 1);
        const jsonStr = jsonLines.join('\n');
        const jsonResult = JSON.parse(jsonStr) as HealthcheckJsonResults;

        // Process successful compilations from JSON
        jsonResult.success.forEach((successfulFile) => results.success.add(successfulFile));

        // Process failures from JSON
        jsonResult.failure.forEach((failedFile) => {
            // Get all failures for this file (all lines and columns)
            const fileFailures = Array.from(results.failures.entries()).filter(([, failure]) => failure.file === failedFile);

            // Only add JSON file failure if no failure for this file exists already (all lines and columns)
            if (fileFailures.length > 0) {
                return;
            }

            const newFailure: CompilerFailure = {
                file: failedFile,
            };
            const key = getUniqueFileKey(newFailure);
            results.failures.set(key, newFailure);
        });
    } catch (error) {
        logWarn('Failed to parse JSON from combined react-compiler-healthcheck output:', error);
    }

    return results;
}

function parseVerboseOutput(lines: string[], results: CompilerResults): CompilerResults {
    let currentFailureWithoutReason: CompilerFailure | null = null;

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
                continue;
            }

            // Only add if not already exists, or if existing one has no reason
            const key = getUniqueFileKey(newFailure);
            const existing = results.failures.get(key);
            if (!existing?.reason) {
                results.failures.set(key, newFailure);
            }

            continue;
        }

        // Parse failed compilation with file and location only (fallback)
        const failureMatch = line.match(VERBOSE_OUTPUT_LINE_REGEXES.FAILURE_WITHOUT_REASON);
        if (failureMatch) {
            const newFailure: CompilerFailure = {
                file: failureMatch[1],
                line: parseInt(failureMatch[2], 10),
                column: parseInt(failureMatch[3], 10),
            };

            // Only create new failure if it doesn't exist
            const key = getUniqueFileKey(newFailure);
            if (results.failures.has(key)) {
                continue;
            }

            results.failures.set(key, newFailure);
            currentFailureWithoutReason = newFailure;
            continue;
        }

        // Parse reason line (fallback for multi-line reasons)
        const reasonMatch = line.match(VERBOSE_OUTPUT_LINE_REGEXES.REASON);
        if (reasonMatch && currentFailureWithoutReason) {
            const reason = reasonMatch[1];

            // Only update reason if it's not already set
            if (currentFailureWithoutReason.reason) {
                currentFailureWithoutReason = null;
                continue;
            }

            if (shouldSuppressCompilerError(reason)) {
                currentFailureWithoutReason = null;
                continue;
            }

            const newFailure: CompilerFailure = {
                file: currentFailureWithoutReason.file,
                line: currentFailureWithoutReason.line,
                column: currentFailureWithoutReason.column,
                reason,
            };

            results.failures.set(getUniqueFileKey(newFailure), newFailure);

            currentFailureWithoutReason = null;
            continue;
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

function createFilesGlob(filesToCheck?: string[]): string | undefined {
    if (!filesToCheck || filesToCheck.length === 0) {
        return undefined;
    }

    if (filesToCheck.length === 1) {
        return filesToCheck.at(0);
    }

    return `**/+(${filesToCheck.join('|')})`;
}

/**
 * Filters compiler results to only include failures for lines that were changed in the git diff.
 * This helps focus on new issues introduced by the current changes rather than pre-existing issues.
 *
 * @param results - The compiler results to filter
 * @param diffFilteringCommits - The commit range to diff (from and to)
 * @returns Filtered compiler results containing only failures in changed lines
 */
async function filterResultsByDiff(results: CompilerResults, diffFilteringCommits: DiffFilteringCommits, {shouldPrintSuccesses}: PrintResultsOptions): Promise<CompilerResults> {
    // Check for uncommitted changes and warn if any exist
    if (await Git.hasUncommittedChanges()) {
        logWarn('Warning: You have uncommitted changes. The diff results may not accurately reflect your current working directory.');
    }

    logInfo(`Filtering results by diff between ${diffFilteringCommits.from} and ${diffFilteringCommits.to}...`);

    // Get the diff between the two commits
    const diffResult: DiffResult = Git.diff(diffFilteringCommits.from, diffFilteringCommits.to);

    // If there are no changes, return empty results
    if (!diffResult.hasChanges) {
        return {
            success: new Set(),
            failures: new Map(),
        };
    }

    // Create a map of file paths to changed line numbers for quick lookup
    const changedLinesMap = new Map<string, Set<number>>();
    for (const file of diffResult.files) {
        const changedLines = new Set<number>();
        file.addedLines.forEach((line) => changedLines.add(line));
        file.modifiedLines.forEach((line) => changedLines.add(line));
        changedLinesMap.set(file.filePath, changedLines);
    }

    // Filter failures to only include those on changed lines
    const filteredFailures = new Map<string, CompilerFailure>();
    results.failures.forEach((failure, key) => {
        const changedLines = changedLinesMap.get(failure.file);

        // If the file is not in the diff, skip this failure
        if (!changedLines) {
            return;
        }

        // If the failure has a line number, check if it's in the changed lines
        if (failure.line !== undefined) {
            const isLineChanged = changedLines.has(failure.line);
            if (isLineChanged) {
                filteredFailures.set(key, failure);
            }
            return;
        }

        // If there's no line number, include the failure if the file has changes
        filteredFailures.set(key, failure);
    });

    // Filter success set to only include files that are in the diff
    const changedFiles = new Set(diffResult.files.map((file) => file.filePath));
    const filteredSuccesses = new Set<string>();
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

    if (filteredFailures.size === 0) {
        logInfo('No failures remain after filtering by diff.');
    } else {
        logInfo(`${filteredFailures.size} out of ${results.failures.size} failures remain after filtering by diff.`);
    }

    return {
        success: filteredSuccesses,
        failures: filteredFailures,
    };
}

function printResults({success, failures}: CompilerResults, {shouldPrintSuccesses}: PrintResultsOptions): void {
    const isPassed = failures.size === 0;
    if (isPassed) {
        logSuccess('All changed files pass React Compiler compliance check!');
        return;
    }

    const tab = '    ';

    const distinctFileNames = new Set<string>();
    failures.forEach((failure) => {
        distinctFileNames.add(failure.file);
    });

    if (shouldPrintSuccesses) {
        log();
        logSuccess(`Successfully compiled ${success.size} files with React Compiler:`);
        log();

        success.forEach((successFile) => {
            logSuccess(`${successFile}`);
        });
    }

    log();
    logError(`Failed to compile ${distinctFileNames.size} files with React Compiler:`);
    log();

    failures.forEach((failure) => {
        const location = failure.line && failure.column ? `:${failure.line}:${failure.column}` : '';
        logBold(`${failure.file}${location}`);
        logNote(`${tab}${failure.reason ?? 'No reason provided'}`);
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
        },
    });

    const {command, file} = cli.positionalArgs;
    const {remote, reportFileName} = cli.namedArgs;
    const {report: shouldGenerateReport, filterByDiff: shouldFilterByDiff, printSuccesses: shouldPrintSuccesses} = cli.flags;

    const commonOptions: CommonCheckOptions = {shouldGenerateReport, reportFileName, shouldFilterByDiff, shouldPrintSuccesses};

    let isPassed = false;

    async function runCommand() {
        switch (command) {
            case 'check':
                return Checker.check({filesToCheck: file !== '' ? [file] : undefined, ...commonOptions});
            case 'check-changed':
                return Checker.checkChangedFiles({remote, ...commonOptions});
            default:
                logError(`Unknown command: ${String(command)}`);
                return Promise.resolve(false);
        }
    }

    try {
        isPassed = await runCommand();
    } catch (error) {
        isPassed = false;
    } finally {
        process.exit(isPassed ? 0 : 1);
    }
}

if (require.main === module) {
    main();
}

export default Checker;
