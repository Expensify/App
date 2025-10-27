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
import Git, {GIT_ERRORS} from './utils/Git';
import {bold, info, log, error as logError, success as logSuccess, note, warn} from './utils/Logger';

const DEFAULT_REPORT_FILENAME = 'react-compiler-report.json';

type HealthcheckJsonResults = {
    success: string[];
    failures: CompilerFailure;
};

type CompilerResults = {
    success: Set<string>;
    failures: Map<string, CompilerFailure>;
};

type CompilerFailure = {
    file: string;
    line?: number;
    column?: number;
    reason: string;
};

function check(filesToCheck?: string[], shouldGenerateReport = false) {
    if (filesToCheck) {
        info(`Running React Compiler check for ${filesToCheck.length} files or glob patterns...`);
    } else {
        info('Running React Compiler check for all files...');
    }

    const src = createFilesGlob(filesToCheck);
    const results = runCompilerHealthcheck(src);

    const isPassed = results.failures.size === 0;
    if (isPassed) {
        logSuccess('All changed files pass React Compiler compliance check!');
        return true;
    }

    printFailureSummary(results);

    if (shouldGenerateReport) {
        generateReport(results, DEFAULT_REPORT_FILENAME);
    }

    return false;
}

async function checkChangedFiles(remote: string): Promise<boolean> {
    info('Checking changed files for React Compiler compliance...');

    try {
        const changedFiles = await Git.getChangedFiles(remote);
        const filesToCheck = [...new Set(changedFiles)];

        if (filesToCheck.length === 0) {
            logSuccess('No React files changed, skipping check.');
            return true;
        }

        return check(filesToCheck);
    } catch (error) {
        if (error instanceof Error && error.message === GIT_ERRORS.FAILED_TO_FETCH_FROM_REMOTE) {
            logError(`Could not fetch from remote ${remote}. If your base remote is not ${remote}, please specify another remote with the --remote flag.`);
        }

        logError('Could not determine changed files:', error);
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

    // Parse and then normalize via Set/Map to ensure true uniqueness
    const parsed = parseCombinedOutput(output);

    // Use Set to deduplicate success entries
    const successSet = new Set(parsed.success);

    // Use Map keyed by unique file key to deduplicate failures
    const failureMap = new Map<string, CompilerFailure>();
    parsed.failures.forEach((failure) => {
        const key = getUniqueFileKey(failure);
        // Prefer the first occurrence that has a reason
        const existing = failureMap.get(key);
        if (!existing) {
            failureMap.set(key, failure);
            return;
        }
        if (!existing.reason && failure.reason) {
            failureMap.set(key, failure);
        }
    });

    return {success: successSet, failures: failureMap};
}

function parseCombinedOutput(output: string): CompilerResults {
    const lines = output.split('\n');
    const successSet = new Set<string>();
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
            const jsonResult = JSON.parse(jsonStr) as HealthcheckJsonResults;
            jsonResult.success.forEach((success) => successSet.add(success));
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
            successSet.add(filePath);
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

    return {success: successSet, failures: failure};
}

function getUniqueFileKey(failure: CompilerFailure): string {
    return `${failure.file}:${failure.line}:${failure.column}`;
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

function printFailureSummary({success, failures}: CompilerResults): void {
    // const failedFileNames = getDistinctFileNames(Array.from(failures.values()), (f) => f.file, fileToCheck);

    if (success.size > 0) {
        log();
        logSuccess(`Successfully compiled ${success.size} files with React Compiler:`);
    }

    const tab = '    ';

    const distinctFileNames = new Set<string>();
    failures.forEach((failure) => {
        distinctFileNames.add(failure.file);
    });

    log();
    logError(`Failed to compile ${distinctFileNames.size} files with React Compiler:`);
    log();

    // Print unique failures for the files that were checked
    failures.forEach((failure) => {
        const location = failure.line && failure.column ? `:${failure.line}:${failure.column}` : '';
        bold(`${failure.file}${location}`);
        if (failure.reason) {
            note(`${tab}${failure.reason}`);
        }
    });

    log();
    logError('The files above failed to compile with React Compiler, probably because of Rules of React violations. Please fix the issues and run the check again.');
}

function generateReport(results: CompilerResults, outputFileName = DEFAULT_REPORT_FILENAME): void {
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
                description: 'Git remote name to use for main branch (default: origin)',
                required: false,
                supersedes: ['check-changed'],
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

    const {command, file} = cli.positionalArgs;
    const {remote} = cli.namedArgs;
    const {report: shouldGenerateReport} = cli.flags;

    let isPassed = false;
    try {
        switch (command) {
            case 'check':
                isPassed = Checker.check(file !== '' ? [file] : undefined, shouldGenerateReport);
                break;
            case 'check-changed':
                isPassed = await Checker.checkChangedFiles(remote);
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
