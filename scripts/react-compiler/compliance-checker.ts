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

const REACT_COMPILER_CONFIG_FILENAME = 'react-compiler-config.json';

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

type CompilerFailure = {
    file: string;
    line?: number;
    column?: number;
    reason: string;
};

type DetailedCompilerResults = {
    success: string[];
    failures: CompilerFailure[];
};

function runCheck(filesToCheck?: string[]) {
    if (filesToCheck) {
        console.log(`🔍 Running React Compiler check for ${filesToCheck.length} files...`);
    } else {
        console.log('🔍 Running React Compiler check for all files...');
    }

    const {failures} = runCompilerHealthcheck(true);
    // if (filesToCheck.length === 0) {
    //     console.log('✅ No React files changed, skipping check.');
    //     return true;
    // }

    const failedFileNames = new Set<string>();
    failures.forEach((failure) => {
        const isFileToCheck = filesToCheck?.includes(failure.file) ?? true;
        if (failedFileNames.has(failure.file) || !isFileToCheck) {
            return;
        }

        failedFileNames.add(failure.file);
    });

    const isPassed = failedFileNames.size === 0;

    if (isPassed) {
        console.log('✅ All changed files pass React Compiler compliance check!');
        return true;
    }

    printFailureSummary(failures, Array.from(failedFileNames));

    return false;
}

function checkChangedFiles(): boolean {
    console.log('🔍 Checking changed files for React Compiler compliance...');

    const changedFiles = getChangedFiles();
    const newFiles = getNewFiles();
    const filesToCheck = [...new Set([...changedFiles, ...newFiles])];

    return runCheck(filesToCheck);
}

function checkSpecificFile(filePath: string): boolean {
    console.log(`🔍 Checking ${filePath} for React Compiler compliance...`);

    // Check if file should be processed by React Compiler
    if (!shouldProcessFile(filePath)) {
        console.log(`⚠️  ${filePath} is not processed by React Compiler (configured in ${REACT_COMPILER_CONFIG_FILENAME})`);
        return true; // Return true since it's not expected to be compiled
    }

    const results = runCompilerHealthcheck(true);
    const isPassed = results.success.includes(filePath);

    if (isPassed) {
        console.log(`✅ ${filePath} can be compiled by React Compiler`);
        return true;
    }

    console.log(`❌ ${filePath} cannot be compiled by React Compiler`);
    return false;
}

function getDetailedFailureInfo(filePath: string): CompilerFailure | null {
    const results = runCompilerHealthcheck(true);
    return results.failures.find((failure) => failure.file === filePath) ?? null;
}

function generateReport(): void {
    const results = runCompilerHealthcheck(true);

    console.log('\n📋 React Compiler Report:');

    if (results.failures.length > 0) {
        printFailureSummary(
            results.failures,
            results.failures.map((f) => f.file),
        );
    }

    // Save detailed report
    const reportFile = join(process.cwd(), 'react-compiler-report.json');
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

    console.log(`\n📄 Detailed report saved to: ${reportFile}`);
}

function runCompilerHealthcheck(detailed: false, src?: string): CompilerResults;
function runCompilerHealthcheck(detailed: true, src?: string): DetailedCompilerResults;
function runCompilerHealthcheck(detailed: boolean, src?: string): CompilerResults | DetailedCompilerResults {
    try {
        console.log('🔍 Running React Compiler healthcheck...');
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
    const failures: CompilerFailure[] = [];

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
            // Save previous failure if exists
            if (currentFailure) {
                failures.push(currentFailure);
            }

            failures.push({
                file: failureWithReasonMatch[1],
                line: parseInt(failureWithReasonMatch[2], 10),
                column: parseInt(failureWithReasonMatch[3], 10),
                reason: failureWithReasonMatch[4],
            });
            currentFailure = null;
            continue;
        }

        // Parse failed compilation with file and location only (fallback)
        const failureMatch = line.match(/Failed to compile ([^:]+):(\d+):(\d+)\./);
        if (failureMatch) {
            // Save previous failure if exists
            if (currentFailure) {
                failures.push(currentFailure);
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
            failures.push(currentFailure);
            currentFailure = null;
            continue;
        }
    }

    // Add any remaining failure
    if (currentFailure) {
        failures.push(currentFailure);
    }

    return {success, failures};
}

function printFailureSummary(failures: CompilerFailure[], failedFileNames: string[]): void {
    console.log(`❌ Failed to compile ${failures.length} components:`);

    // Group failures by file and line to avoid duplicates
    const uniqueFailures = new Map<string, CompilerFailure>();

    failures
        .filter((failure) => failedFileNames.includes(failure.file))
        .forEach((failure) => {
            const key = `${failure.file}:${failure.line}:${failure.column}`;
            if (!uniqueFailures.has(key)) {
                uniqueFailures.set(key, failure);
            }
        });

    // Print unique failures
    Array.from(uniqueFailures.values()).forEach((failure) => {
        const location = failure.line && failure.column ? `:${failure.line}:${failure.column}` : '';
        console.log(`  - ${failure.file}${location}`);
        if (failure.reason) {
            console.log(`    Reason: ${failure.reason}`);
        }
    });

    console.log('\n❌ Please fix the following files which cannot be compiled by React Compiler:');
    failedFileNames.forEach((file) => console.log(`  - ${file}`));
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
    runCheck,
    checkChangedFiles,
    checkSpecificFile,
    getDetailedFailureInfo,
    generateReport,
};

// CLI interface
function main() {
    const args = process.argv.slice(2);
    const command = args.at(0);
    let isPassed = false;

    try {
        switch (command) {
            case 'full-check':
                isPassed = Checker.runCheck();
                process.exit(isPassed ? 0 : 1);
                break;

            case 'check-changed':
                isPassed = Checker.checkChangedFiles();
                process.exit(isPassed ? 0 : 1);
                break;

            case 'check-file':
                // eslint-disable-next-line no-case-declarations
                const filePath = args.at(1);
                if (!filePath) {
                    console.error('❌ Please provide a file path: npm run react-compiler-compliance-checker check-file <path>');
                    process.exit(1);
                }
                isPassed = Checker.checkSpecificFile(filePath);
                process.exit(isPassed ? 0 : 1);
                break;

            case 'report':
                Checker.generateReport();
                break;

            default:
                console.log(`
🔧 React Compiler Compliance Checker

Usage:
  npm run react-compiler-compliance-checker <command> [options]

Commands:
  full-check     Run a full check of all components
  check-changed  Check only changed files (for CI)
  check-file     Check a specific file
  report         Generate a detailed report

Examples:
  npm run react-compiler-compliance-checker full-check
  npm run react-compiler-compliance-checker check-changed
  npm run react-compiler-compliance-checker check-file src/components/MyComponent.tsx
  npm run react-compiler-compliance-checker report
        `);
                break;
        }
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

export {shouldProcessFile, REACT_COMPILER_CONFIG};
export type {ReactCompilerConfig};
