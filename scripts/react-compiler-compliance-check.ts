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
import shouldReactCompilerProcessFile from './shouldReactCompilerProcessFile';
import CLI from './utils/CLI';
import {bold, info, log, error as logError, success as logSuccess, note, warn} from './utils/Logger';

const DEFAULT_REPORT_FILENAME = 'react-compiler-report.json';

const ERRORS = {
    FAILED_TO_FETCH_FROM_REMOTE: 'Failed to fetch from remote',
} as const;

// Detect if running in CI environment
const IS_CI = process.env.CI === 'true';

type CompilerResults = {
    success: string[];
    failure: string[];
};

type DetailedCompilerResults = {
    success: string[];
    failures: CompilerFailure[];
};

type CompilerFailure = {
    file: string;
    line?: number;
    column?: number;
    reason: string;
};

/** Commands */

function check(filesToCheck?: string[], shouldGenerateReport = false) {
    if (filesToCheck) {
        if (filesToCheck.length === 0) {
            logSuccess('No React files changed, skipping check.');
            return true;
        }

        info(`Running React Compiler check for ${filesToCheck.length} file(s)...`);
    } else {
        info('Running React Compiler check for all files...');
    }

    const results = runCompilerHealthcheck(true);
    const {success, failures} = results;

    const successFileNames = getDistinctFileNames(success, (s) => s, filesToCheck);
    const failedFileNames = getDistinctFileNames(failures, (f) => f.file, filesToCheck);

    const isPassed = failedFileNames.length === 0;

    if (isPassed) {
        logSuccess('All changed files pass React Compiler compliance check!');
        return true;
    }

    printFailureSummary({success, failures}, successFileNames, failedFileNames);

    if (shouldGenerateReport) {
        generateReport(results, DEFAULT_REPORT_FILENAME);
    }

    return false;
}

function checkChangedFiles(remote: string): boolean {
    info('Checking changed files for React Compiler compliance...');

    try {
        const changedFiles = getChangedFiles(remote);
        const filesToCheck = [...new Set(changedFiles)];

        return check(filesToCheck);
    } catch (error) {
        if (error instanceof Error && error.message === ERRORS.FAILED_TO_FETCH_FROM_REMOTE) {
            logError(`Could not fetch from remote ${remote}. If your base remote is not ${remote}, please specify another remote with the --remote flag.`);
            throw error;
        }

        logError('Could not determine changed files:', error);
        throw error;
    }
}

/** Helper functions */

function runCompilerHealthcheck(detailed: false, src?: string): CompilerResults;
function runCompilerHealthcheck(detailed: true, src?: string): DetailedCompilerResults;
function runCompilerHealthcheck(detailed: boolean, src?: string): CompilerResults | DetailedCompilerResults {
    try {
        const output = execSync(`npx react-compiler-healthcheck --json ${detailed ? '--verbose' : ''} ${src ? `--src ${src}` : ''}`, {
            encoding: 'utf8',
            cwd: process.cwd(),
        });

        if (detailed) {
            return parseCombinedOutput(output);
        }

        return JSON.parse(output) as CompilerResults;
    } catch (error) {
        logError('Failed to run React Compiler healthcheck:', error);
        throw error;
    }
}

function parseCombinedOutput(output: string): DetailedCompilerResults {
    const lines = output.split('\n');
    const success: string[] = [];
    const failure = new Map<string, CompilerFailure>();

    // First, try to extract JSON from the output
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

    // Parse JSON if found
    if (jsonStart !== -1 && jsonEnd !== -1) {
        try {
            const jsonLines = lines.slice(jsonStart, jsonEnd + 1);
            const jsonStr = jsonLines.join('\n');
            const jsonResult = JSON.parse(jsonStr) as CompilerResults;
            success.push(...jsonResult.success);
        } catch (error) {
            warn('Failed to parse JSON from combined output:', error);
        }
    } else {
        warn('No JSON found in combined output, parsing verbose text only');
    }

    // Parse verbose output for detailed failure information
    let currentFailure: CompilerFailure | null = null;

    for (const line of lines) {
        // Parse successful compilation from verbose output
        const successMatch = line.match(/Successfully compiled (?:hook|component) \[([^\]]+)\]\(([^)]+)\)/);
        if (successMatch) {
            const filePath = successMatch[2];
            if (!success.includes(filePath)) {
                success.push(filePath);
            }
            continue;
        }

        // Parse failed compilation with file, location, and reason all on one line
        const failureWithReasonMatch = line.match(/Failed to compile ([^:]+):(\d+):(\d+)\. Reason: (.+)/);
        if (failureWithReasonMatch) {
            const newFailure = {
                file: failureWithReasonMatch[1],
                line: parseInt(failureWithReasonMatch[2], 10),
                column: parseInt(failureWithReasonMatch[3], 10),
                reason: failureWithReasonMatch[4],
            };

            const key = getUniqueFileKey(newFailure);
            // Only add if not already exists, or if existing one has no reason
            const existing = failure.get(key);
            if (!existing?.reason) {
                failure.set(key, newFailure);
            }
            currentFailure = null;
            continue;
        }

        // Parse failed compilation with file and location only (fallback)
        const failureMatch = line.match(/Failed to compile ([^:]+):(\d+):(\d+)\./);
        if (failureMatch) {
            // Save previous failure if exists
            if (currentFailure) {
                const key = getUniqueFileKey(currentFailure);
                const existing = failure.get(key);
                if (!existing?.reason) {
                    failure.set(key, currentFailure);
                }
            }

            const key = getUniqueFileKey({
                file: failureMatch[1],
                line: parseInt(failureMatch[2], 10),
                column: parseInt(failureMatch[3], 10),
                reason: '',
            });

            // Only create new failure if it doesn't exist
            if (failure.has(key)) {
                // Use existing failure if it exists
                const existingFailure = failure.get(key);
                if (existingFailure) {
                    currentFailure = existingFailure;
                }
                continue;
            }

            currentFailure = {
                file: failureMatch[1],
                line: parseInt(failureMatch[2], 10),
                column: parseInt(failureMatch[3], 10),
                reason: '',
            };
            continue;
        }

        // Parse reason line (fallback for multi-line reasons)
        const reasonMatch = line.match(/Reason: (.+)/);
        if (reasonMatch && currentFailure) {
            // Only update reason if it's not already set
            if (!currentFailure.reason) {
                currentFailure.reason = reasonMatch[1];
                failure.set(getUniqueFileKey(currentFailure), currentFailure);
            }
            currentFailure = null;
            continue;
        }
    }

    // Add any remaining failure
    if (currentFailure) {
        const key = getUniqueFileKey(currentFailure);
        const existing = failure.get(key);
        if (!existing?.reason) {
            failure.set(key, currentFailure);
        }
    }

    return {success, failures: Array.from(failure.values())};
}

function getUniqueFileKey(failure: CompilerFailure): string {
    return `${failure.file}:${failure.line}:${failure.column}`;
}

function getDistinctFileNames<T>(items: T[], getFile: (item: T) => string, filesToCheck?: string[]): string[] {
    const distinctFileNames = new Set<string>();
    items.forEach((item) => {
        const file = getFile(item);

        const isFileToCheck = filesToCheck?.includes(file) ?? true;
        if (distinctFileNames.has(file) || !isFileToCheck) {
            return;
        }

        distinctFileNames.add(file);
    });

    return Array.from(distinctFileNames);
}

function printFailureSummary({success, failures}: DetailedCompilerResults, successFileNames: string[], failedFileNames: string[]): void {
    logSuccess(`Successfully compiled ${success.length} files with React Compiler:`);
    logError(`Failed to compile ${failedFileNames.length} files with React Compiler:\n\n`);
    failedFileNames.forEach((file) => bold(file));

    // Print unique failures for the files that were checked
    info('Detailed reasons for failures:\n\n');
    failures
        .filter((failure) => failedFileNames.includes(failure.file))
        .forEach((failure) => {
            const location = failure.line && failure.column ? `:${failure.line}:${failure.column}` : '';
            bold(`${failure.file}${location}`);
            if (failure.reason) {
                note(`    ${failure.reason}`);
            }
        });

    log('\n');
    logError('The files above failed to compile with React Compiler, probably because of Rules of React violations. Please fix the issues and run the check again.');
}

function generateReport(results: DetailedCompilerResults, outputFileName = DEFAULT_REPORT_FILENAME): void {
    log('\n');
    info('Creating React Compiler Compliance Check report:');

    // Save detailed report
    const reportFile = join(process.cwd(), outputFileName);
    writeFileSync(
        reportFile,
        JSON.stringify(
            {
                timestamp: new Date().toISOString(),
                summary: {
                    total: results.success.length + results.failures.length,
                    success: results.success.length,
                    failure: results.failures.length,
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

function getMainBaseCommitHash(remote: string): string {
    // Fetch the main branch from the specified remote to ensure it's available
    try {
        execSync(`git fetch ${remote} main --no-tags -q`, {encoding: 'utf8'});
    } catch (error) {
        throw new Error(ERRORS.FAILED_TO_FETCH_FROM_REMOTE);
    }

    // In CI, use a simpler approach - just use the remote main branch directly
    // This avoids issues with shallow clones and merge-base calculations
    if (IS_CI) {
        try {
            const mergeBaseHash = execSync(`git rev-parse ${remote}/main`, {encoding: 'utf8'}).trim();

            // Validate the output is a proper SHA hash
            if (!mergeBaseHash || !/^[a-fA-F0-9]{40}$/.test(mergeBaseHash)) {
                throw new Error(`git rev-parse returned unexpected output: ${mergeBaseHash}`);
            }

            return mergeBaseHash;
        } catch (error) {
            logError(`Failed to get commit hash for ${remote}/main:`, error);
            throw new Error(`Could not get commit hash for ${remote}/main`);
        }
    }

    // For local development, try to find the actual merge base
    let mergeBaseHash: string;
    try {
        mergeBaseHash = execSync(`git merge-base ${remote}/main HEAD`, {encoding: 'utf8'}).trim();
    } catch (error) {
        // If merge-base fails locally, fall back to using the remote main branch
        try {
            mergeBaseHash = execSync(`git rev-parse ${remote}/main`, {encoding: 'utf8'}).trim();
            logError(`Warning: Could not find merge base between ${remote}/main and HEAD. Using ${remote}/main as base.`);
        } catch (fallbackError) {
            logError(`Failed to find merge base with ${remote}/main:`, error);
            logError(`Fallback also failed:`, fallbackError);
            throw new Error(`Could not determine merge base with ${remote}/main`);
        }
    }

    // Validate the output is a proper SHA hash
    if (!mergeBaseHash || !/^[a-fA-F0-9]{40}$/.test(mergeBaseHash)) {
        throw new Error(`git merge-base returned unexpected output: ${mergeBaseHash}`);
    }

    return mergeBaseHash;
}

function getChangedFiles(remote: string): string[] {
    try {
        // Get files changed in the current branch/commit
        const mainBaseCommitHash = getMainBaseCommitHash(remote);

        // Get the diff output and check status
        const gitDiffOutput = execSync(`git diff --diff-filter=AMR --name-only ${mainBaseCommitHash} HEAD`, {
            encoding: 'utf8',
        });

        const files = gitDiffOutput.trim().split('\n');
        const changedFiles = files.filter(shouldReactCompilerProcessFile);
        return changedFiles;
    } catch (error) {
        if (error instanceof Error && error.message === ERRORS.FAILED_TO_FETCH_FROM_REMOTE) {
            throw error;
        }

        logError('Could not determine changed files:', error);
        throw error;
    }
}

const Checker = {
    check,
    checkChangedFiles,
};

const CLI_COMMANDS = ['check', 'check-changed'] as const;
type CliCommand = TupleToUnion<typeof CLI_COMMANDS>;

function isValidCliCommand(command: string): command is CliCommand {
    return CLI_COMMANDS.includes(command as CliCommand);
}

// CLI interface
function main() {
    const cli = new CLI({
        positionalArgs: [
            {
                name: 'command',
                description: 'Command to run',
                required: true,
                parse: (val) => {
                    if (!isValidCliCommand(val)) {
                        throw new Error(`Invalid command. Must be one of: ${CLI_COMMANDS.join(', ')}`);
                    }
                    return val;
                },
            },
        ],
        namedArgs: {
            files: {
                description: 'File path(s) to check (required for check command)',
                required: false,
                parse: (val) => val.split(',').map((f) => f.trim()),
            },
            remote: {
                description: 'Git remote name to use for main branch (default: origin)',
                required: false,
                default: 'origin',
            },
        },
        flags: {
            report: {
                description: 'Generate a report of the results',
                required: false,
                default: false,
            },
        },
    });

    const {command} = cli.positionalArgs;
    const {files, remote} = cli.namedArgs;
    const {report: shouldGenerateReport} = cli.flags;

    let isPassed = false;
    try {
        switch (command) {
            case 'check':
                isPassed = Checker.check(files, shouldGenerateReport);
                break;
            case 'check-changed':
                isPassed = Checker.checkChangedFiles(remote);
                break;
            default:
                logError(`Unknown command: ${String(command)}`);
                isPassed = false;
        }
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
