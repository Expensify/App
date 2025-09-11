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

type ReactCompilerConfig = {
    excludedFolderPatterns: string[];
    checkedFileEndings: string[];
};

const REACT_COMPILER_CONFIG = JSON.parse(readFileSync(join(process.cwd(), 'react-compiler-config.json'), 'utf8')) as ReactCompilerConfig;

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

type ComponentStatus = {
    file: string;
    canCompile: boolean;
    lastChecked: string;
};

type ComplianceCheckResults = {
    components: Record<string, ComponentStatus>;
    lastFullCheck: string;
    version: string;
};

const COMPILER_OUTPUT_FILE = join(process.cwd(), 'react-compiler-output.json');

class ReactCompilerComplianceChecker {
    private complianceCheckResults: ComplianceCheckResults;

    constructor() {
        this.complianceCheckResults = {
            components: {},
            lastFullCheck: '',
            version: '1.0.0',
        };
    }

    public runFullCheck() {
        console.log('🚀 Running full React Compiler check...');

        const results = this.runCompilerHealthcheck();
        const now = new Date().toISOString();

        // Update all component statuses
        results.success.forEach((file) => {
            this.updateComponentStatus(file, true);
        });

        results.failure.forEach((file) => {
            this.updateComponentStatus(file, false);
        });

        this.complianceCheckResults.lastFullCheck = now;

        console.log(`✅ Full check completed. Found ${results.success.length} compilable and ${results.failure.length} non-compilable components.`);
    }

    public checkChangedFiles(): {passed: boolean; failures: string[]} {
        console.log('🔍 Checking changed files for React Compiler compliance...');

        const changedFiles = this.getChangedFiles();
        const newFiles = this.getNewFiles();
        const filesToCheck = [...new Set([...changedFiles, ...newFiles])];

        if (filesToCheck.length === 0) {
            console.log('✅ No React files changed, skipping check.');
            return {passed: true, failures: []};
        }

        console.log(`📝 Checking ${filesToCheck.length} changed files...`);

        const results = this.runDetailedCompilerHealthcheck();
        const failures: string[] = [];
        const nonCompilableFiles: string[] = [];

        // Check each changed file
        for (const file of filesToCheck) {
            const canCompile = results.success.includes(file);
            const isNewFile = newFiles.includes(file);

            this.updateComponentStatus(file, canCompile);

            // For new files, they must be compilable
            if (isNewFile && !canCompile) {
                failures.push(file);
                nonCompilableFiles.push(file);
            } else if (!canCompile) {
                nonCompilableFiles.push(file);
            }
        }

        // Print summary statistics
        this.printSummaryStats(results.success.length, results.failures.length);

        // Print detailed failure information for non-compilable files
        if (nonCompilableFiles.length > 0) {
            this.printDetailedFailures(results.failures, nonCompilableFiles);
        }

        const passed = failures.length === 0;
        if (passed) {
            console.log('✅ All changed files pass React Compiler compliance check!');
        } else {
            console.log(`❌ ${failures.length} new files fail React Compiler compliance check.`);
        }

        return {passed, failures};
    }

    public checkSpecificFile(filePath: string): boolean {
        console.log(`🔍 Checking specific file: ${filePath}`);

        // Check if file should be processed by React Compiler
        if (!shouldProcessFile(filePath)) {
            console.log(`⚠️  ${filePath} is not processed by React Compiler (excluded by babel config)`);
            return true; // Return true since it's not expected to be compiled
        }

        const results = this.runCompilerHealthcheck();
        const canCompile = results.success.includes(filePath);

        this.updateComponentStatus(filePath, canCompile);

        if (canCompile) {
            console.log(`✅ ${filePath} can be compiled by React Compiler`);
        } else {
            console.log(`❌ ${filePath} cannot be compiled by React Compiler`);
        }

        return canCompile;
    }

    public getDetailedFailureInfo(filePath: string): CompilerFailure | null {
        const results = this.runDetailedCompilerHealthcheck();
        return results.failures.find((failure) => failure.file === filePath) ?? null;
    }

    public getStatus(): void {
        console.log('📊 React Compiler Compliance Check Status:');
        console.log(`Last full check: ${this.complianceCheckResults.lastFullCheck || 'Never'}`);
        console.log(`Total tracked components: ${Object.keys(this.complianceCheckResults.components).length}`);

        const compilable = Object.values(this.complianceCheckResults.components).filter((c) => c.canCompile).length;
        const nonCompilable = Object.values(this.complianceCheckResults.components).filter((c) => !c.canCompile).length;

        console.log(`Compilable: ${compilable}`);
        console.log(`Non-compilable: ${nonCompilable}`);

        if (nonCompilable > 0) {
            console.log('\n❌ Non-compilable components:');
            Object.values(this.complianceCheckResults.components)
                .filter((c) => !c.canCompile)
                .forEach((c) => console.log(`  - ${c.file} (last checked: ${c.lastChecked})`));
        }
    }

    public generateReport(): void {
        const results = this.runDetailedCompilerHealthcheck();

        console.log('\n📋 React Compiler Report:');
        this.printSummaryStats(results.success.length, results.failures.length);

        if (results.failures.length > 0) {
            console.log('\n❌ Failed components with reasons:');
            this.printDetailedFailures(
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

    private runCompilerHealthcheck(): CompilerResults {
        try {
            console.log('🔍 Running React Compiler healthcheck...');
            const output = execSync('npx react-compiler-healthcheck --json', {
                encoding: 'utf8',
                cwd: process.cwd(),
            });

            // Save raw output for debugging
            writeFileSync(COMPILER_OUTPUT_FILE, output);

            return JSON.parse(output) as CompilerResults;
        } catch (error) {
            console.error('❌ Failed to run React Compiler healthcheck:', error);
            throw error;
        }
    }

    public runDetailedCompilerHealthcheck(): DetailedCompilerResults {
        try {
            console.log('🔍 Running detailed React Compiler healthcheck...');
            const output = execSync('npx react-compiler-healthcheck --verbose --json', {
                encoding: 'utf8',
                cwd: process.cwd(),
            });

            return this.parseCombinedOutput(output);
        } catch (error) {
            console.error('❌ Failed to run detailed React Compiler healthcheck:', error);
            throw error;
        }
    }

    private parseCombinedOutput(output: string): DetailedCompilerResults {
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
                console.log(`📊 Parsed ${jsonResult.success.length} successful compilations from JSON`);
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

        console.log(`📊 Parsed ${failures.length} failures with detailed reasons`);
        return {success, failures};
    }

    private updateComponentStatus(file: string, canCompile: boolean): void {
        this.complianceCheckResults.components[file] = {
            file,
            canCompile,
            lastChecked: new Date().toISOString(),
        };
    }

    private printSummaryStats(successCount: number, failureCount: number): void {
        console.log(`✅ Successfully compiled: ${successCount} components`);
        console.log(`❌ Failed to compile: ${failureCount} components`);
    }

    private printDetailedFailures(failures: CompilerFailure[], filesToShow: string[]): void {
        console.log('\n❌ Failed components with reasons:');
        failures
            .filter((failure) => filesToShow.includes(failure.file))
            .forEach((failure) => {
                const location = failure.line && failure.column ? `:${failure.line}:${failure.column}` : '';
                console.log(`  - ${failure.file}${location}`);
                if (failure.reason) {
                    console.log(`    Reason: ${failure.reason}`);
                }
            });
    }

    private getMainBranchRemote(): string {
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

    private getChangedFiles(): string[] {
        try {
            // Get files changed in the current branch/commit
            const remote = this.getMainBranchRemote();
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

    private getNewFiles(): string[] {
        try {
            // Get files that are new (not in main branch)
            const remote = this.getMainBranchRemote();
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
}

// CLI interface
function main() {
    const args = process.argv.slice(2);
    const command = args.at(0);
    const checker = new ReactCompilerComplianceChecker();

    try {
        switch (command) {
            case 'full-check':
                checker.runFullCheck();
                break;

            case 'check-changed':
                // eslint-disable-next-line no-case-declarations
                const result = checker.checkChangedFiles();
                if (!result.passed) {
                    console.log('\n❌ CI Check Failed!');
                    console.log('The following new files cannot be compiled by React Compiler:');
                    result.failures.forEach((file) => console.log(`  - ${file}`));
                    console.log('\nPlease fix these files to follow the Rules of React.');
                    process.exit(1);
                }
                break;

            case 'check-file':
                // eslint-disable-next-line no-case-declarations
                const filePath = args.at(1);
                if (!filePath) {
                    console.error('❌ Please provide a file path: npm run react-compiler-compliance-checker check-file <path>');
                    process.exit(1);
                }
                // eslint-disable-next-line no-case-declarations
                const canCompile = checker.checkSpecificFile(filePath);
                process.exit(canCompile ? 0 : 1);
                break;

            case 'status':
                checker.getStatus();
                break;

            case 'report':
                checker.generateReport();
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
  status         Show current compliance checker status
  report         Generate a detailed report

Examples:
  npm run react-compiler-compliance-checker full-check
  npm run react-compiler-compliance-checker check-changed
  npm run react-compiler-compliance-checker check-file src/components/MyComponent.tsx
  npm run react-compiler-compliance-checker status
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

export default ReactCompilerComplianceChecker;
export {shouldProcessFile, REACT_COMPILER_CONFIG};
export type {ReactCompilerConfig};
