#!/usr/bin/env ts-node

/**
 * React Compiler Compliance Checker
 *
 * This script tracks which components can be compiled by React Compiler and which cannot.
 * It provides both CI and local development tools to enforce Rules of React compliance.
 */
import {execSync} from 'child_process';
import {readFileSync, writeFileSync} from 'fs';
import {join} from 'path';
import type {TupleToUnion} from 'type-fest';
import CLI from './utils/CLI';

const REACT_COMPILER_CONFIG_FILENAME = 'react-compiler-config.json';
const DEFAULT_REPORT_FILENAME = 'react-compiler-report.json';

type ReactCompilerConfig = {
    excludedFolderPatterns: string[];
    checkedFileEndings: string[];
};

const REACT_COMPILER_CONFIG = JSON.parse(readFileSync(join(process.cwd(), REACT_COMPILER_CONFIG_FILENAME), 'utf8')) as ReactCompilerConfig;

/**
 * Check if a file should be processed by React Compiler
 * Matches the same logic as babel.config.js ReactCompilerConfig.sources
 */
function shouldProcessFile(filePath: string): boolean {
    // Check if file is in any excluded folder
    return !REACT_COMPILER_CONFIG.excludedFolderPatterns.some((pattern) => filePath.includes(pattern));
}

type CompilerResults = {
    success: string[];
    failure: string[];
};

type DetailedCompilerResults = {
    success: string[];
    failure: CompilerFailure[];
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
            console.log('✅ No React files changed, skipping check.');
            return true;
        }

        console.log(`🔍 Running React Compiler check for ${filesToCheck.length} file(s)...`);
    } else {
        console.log('🔍 Running React Compiler check for all files...');
    }

    const results = runCompilerHealthcheck(true);
    const {failure: failures} = results;
    const failedFileNames = getFailedFileNames(failures, filesToCheck);
    const isPassed = failedFileNames.length === 0;

    if (isPassed) {
        console.log('✅ All changed files pass React Compiler compliance check!');
        return true;
    }

    printSummary(results, failedFileNames);

    if (shouldGenerateReport) {
        generateReport(results, DEFAULT_REPORT_FILENAME);
    }

    return false;
}

function checkChangedFiles(): boolean {
    console.log('🔍 Checking changed files for React Compiler compliance...');

    const changedFiles = getChangedFiles();
    const newFiles = getNewFiles();
    const filesToCheck = [...new Set([...changedFiles, ...newFiles])];

    return check(filesToCheck);
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
        console.error('❌ Failed to run React Compiler healthcheck:', error);
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
            console.warn('Failed to parse JSON from combined output:', error);
        }
    } else {
        console.log('⚠️  No JSON found in combined output, parsing verbose text only');
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

            failure.set(getUniqueFileKey(newFailure), newFailure);
            currentFailure = null;
            continue;
        }

        // Parse failed compilation with file and location only (fallback)
        const failureMatch = line.match(/Failed to compile ([^:]+):(\d+):(\d+)\./);
        if (failureMatch) {
            // Save previous failure if exists
            if (currentFailure) {
                failure.set(getUniqueFileKey(currentFailure), currentFailure);
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
            currentFailure.reason = reasonMatch[1];
            failure.set(getUniqueFileKey(currentFailure), currentFailure);
            currentFailure = null;
            continue;
        }
    }

    // Add any remaining failure
    if (currentFailure) {
        failure.set(getUniqueFileKey(currentFailure), currentFailure);
    }

    return {success, failure: Array.from(failure.values())};
}

function getUniqueFileKey(failure: CompilerFailure): string {
    return `${failure.file}:${failure.line}:${failure.column}`;
}

function getFailedFileNames(failures: CompilerFailure[], filesToCheck?: string[]): string[] {
    const failedFileNames = new Set<string>();
    failures.forEach((failure) => {
        const isFileToCheck = filesToCheck?.includes(failure.file) ?? true;
        if (failedFileNames.has(failure.file) || !isFileToCheck) {
            return;
        }

        failedFileNames.add(failure.file);
    });

    return Array.from(failedFileNames);
}

function printSummary({success, failure: failures}: DetailedCompilerResults, failedFileNames: string[]): void {
    console.log(`✅ Successfully compiled ${success.length} files with React Compiler:`);
    success.forEach((file) => console.log(`  - ${file}`));
    console.log('\n\n');

    console.log(`❌ Failed to compile ${failedFileNames.length} files with React Compiler:\n`);
    failedFileNames.forEach((file) => console.log(`  - ${file}`));
    console.log('\n\n');

    // Group failures by file and line to avoid duplicates

    // Print unique failures
    console.log('\n\n');
    console.log(`📜 Detailed reasons for failures:`);
    failures.forEach((failure) => {
        const location = failure.line && failure.column ? `:${failure.line}:${failure.column}` : '';
        console.log(`  - ${failure.file}${location}`);
        if (failure.reason) {
            console.log(`    Reason: ${failure.reason}`);
        }
    });

    console.log('\n\n');
    console.log(`❌ The files above failed to compile with React Compiler, probably because of Rules of React violations. Please fix the issues and run the check again.`);
}

function generateReport(results: DetailedCompilerResults, outputFileName = DEFAULT_REPORT_FILENAME): void {
    console.log('\n📋 Creating React Compiler Compliance Check report:');

    // Save detailed report
    const reportFile = join(process.cwd(), outputFileName);
    writeFileSync(
        reportFile,
        JSON.stringify(
            {
                timestamp: new Date().toISOString(),
                summary: {
                    total: results.success.length + results.failure.length,
                    success: results.success.length,
                    failure: results.failure.length,
                },
                success: results.success,
                failures: results.failure,
            },
            null,
            2,
        ),
    );

    console.log(`\n📄 Detailed report saved to: ${reportFile}`);
}

function getMainBranchRemote(): string {
    // Determine the remote that contains the main branch, fallback to 'origin'
    let remote = 'origin';
    try {
        const remotesOutput = execSync('git remote', {encoding: 'utf8'}).trim().split('\n');
        for (const r of remotesOutput) {
            try {
                const branches = execSync(`git ls-remote --heads ${r} main`, {encoding: 'utf8'}).trim();
                if (branches.length > 0) {
                    remote = r;
                    break;
                }
            } catch {
                // ignore errors for remotes that don't have main
            }
        }
    } catch {
        // fallback to 'origin'
    }
    return remote;
}

function getChangedFiles(): string[] {
    try {
        // Get files changed in the current branch/commit
        const remote = getMainBranchRemote();
        // Compare against the main branch on the detected remote
        const output = execSync(`git diff --name-only --diff-filter=AMR ${remote}/main...HEAD`, {
            encoding: 'utf8',
        });
        return output
            .trim()
            .split('\n')
            .filter((file) => file.length > 0)
            .filter((file) => REACT_COMPILER_CONFIG.checkedFileEndings.some((ending) => file.endsWith(ending)))
            .filter((file) => shouldProcessFile(file));
    } catch (error) {
        console.warn('Could not determine changed files:', error);
        return [];
    }
}

function getNewFiles(): string[] {
    try {
        // Get files that are new (not in main branch)
        const remote = getMainBranchRemote();
        const output = execSync(`git diff --name-only --diff-filter=A ${remote}/main...HEAD`, {
            encoding: 'utf8',
        });
        return output
            .trim()
            .split('\n')
            .filter((file) => file.length > 0)
            .filter((file) => REACT_COMPILER_CONFIG.checkedFileEndings.some((ending) => file.endsWith(ending)))
            .filter((file) => shouldProcessFile(file));
    } catch (error) {
        console.warn('Could not determine new files:', error);
        return [];
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
    const {files} = cli.namedArgs;
    const {report: shouldGenerateReport} = cli.flags;

    let isPassed = false;
    try {
        switch (command) {
            case 'check':
                isPassed = Checker.check(files, shouldGenerateReport);
                break;
            case 'check-changed':
                isPassed = Checker.checkChangedFiles();
                break;
            default:
                console.error(`❌ Unknown command: ${String(command)}`);
                isPassed = false;
        }
    } catch (error) {
        console.error('❌ Error:', error);
        isPassed = false;
    } finally {
        process.exit(isPassed ? 0 : 1);
    }
}

if (require.main === module) {
    main();
}

export default Checker;
export {shouldProcessFile, REACT_COMPILER_CONFIG};
export type {ReactCompilerConfig};
