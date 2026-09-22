#!/usr/bin/env bun
/**
 * React Compiler Compliance Check
 *
 * Checks how React components and hooks fare under the React Compiler (oxc-transform-react).
 * Two modes:
 *   - `check <files...>` -- check specific files, report per-file status
 *   - `check-changed`    -- check files changed in a PR, enforce:
 *       1. New files with components/hooks must compile
 *       2. Modified files must not regress (compiled on main -> must compile on PR)
 */
import CLI from 'expensify-common/CLI';
import fs from 'fs';
import path from 'path';

// The compiler helper is ESM (.mjs); the explicit extension is required for bun's ESM resolution.
// eslint-disable-next-line import/extensions
import checkReactCompilerWithOxc from '../config/reactCompiler/checkWithOxc.mjs';
import FileUtils from './utils/FileUtils';
import Git from './utils/Git';
import {error as logError, errorDetail as logErrorDetail, info as logInfo, success as logSuccess, warn as logWarn} from './utils/Logger';

type SourceLocation = {
    start: {line: number; column: number};
    end: {line: number; column: number};
};

type CompilerError = {
    reason: string;
    severity: string;
    loc?: SourceLocation;
};

type CompilationResult = {
    status: 'compiled' | 'failed' | 'no-components';
    memoized: boolean;
    errors: CompilerError[];
};

const FILE_EXTENSIONS = ['.ts', '.tsx'];

const IS_CI = process.env.CI === 'true';

function formatErrorLocation(filename: string, error: CompilerError): string {
    if (error.loc) {
        return `${error.loc.start.line}:${error.loc.start.column}`;
    }
    return filename;
}

function printErrors(filename: string, errors: CompilerError[]): void {
    if (IS_CI) {
        console.log(`::group::${filename} (${errors.length} error${errors.length === 1 ? '' : 's'})`);
    }
    for (const error of errors) {
        const location = formatErrorLocation(filename, error);
        logErrorDetail(`${location}: ${error.reason}`);
    }
    if (IS_CI) {
        console.log('::endgroup::');
    }
}

/**
 * Check specific files and report per-file status.
 */
function checkFiles(inputs: string[], verbose: boolean): boolean {
    const files = FileUtils.resolveFilePaths(inputs, FILE_EXTENSIONS);

    if (files.length === 0) {
        logWarn(`No ${FILE_EXTENSIONS.join('/')} files found matching the provided paths.`);
        return true;
    }

    let hasFailure = false;

    for (const file of files) {
        const source = fs.readFileSync(file, 'utf8');
        const result = checkReactCompilerWithOxc(source, file);

        if (result.status === 'failed') {
            logError(`FAILED  ${file}`);
            printErrors(file, result.errors);
            hasFailure = true;
        } else if (verbose) {
            if (result.status === 'compiled') {
                logSuccess(`COMPILED  ${file}`);
            } else {
                logInfo(`SKIPPED  ${file} (no components or hooks)`);
            }
        }
    }

    return !hasFailure;
}

/**
 * Resolve the source of a file on the base branch, returning undefined if it did not exist.
 */
function getMainSource(ref: string, mainPath: string): string | undefined {
    try {
        return Git.show(ref, mainPath);
    } catch {
        return undefined;
    }
}

/**
 * Check files changed in a PR for React Compiler compliance.
 * Rule 1: New files with components/hooks must compile.
 * Rule 2: Modified files must not regress (compiled on main -> must compile on PR).
 */
async function checkChangedFiles(remote: string, verbose: boolean): Promise<boolean> {
    const mainBaseCommitHash = await Git.getMainBranchCommitHash(remote);
    const changedFiles = await Git.getChangedFilesWithStatus(mainBaseCommitHash, undefined, true, FILE_EXTENSIONS);

    const reactFiles = changedFiles.filter((f) => FILE_EXTENSIONS.some((ext) => f.filename.endsWith(ext)) && f.status !== 'removed');

    if (reactFiles.length === 0) {
        logSuccess('No React files changed, skipping check.');
        return true;
    }

    logInfo(`Checking ${reactFiles.length} changed React files...`);

    const failures: Array<{file: string; reason: string}> = [];

    for (const {filename, status, previousFilename} of reactFiles) {
        const absolutePath = path.resolve(filename);
        if (!fs.existsSync(absolutePath)) {
            continue;
        }

        const source = fs.readFileSync(absolutePath, 'utf8');
        const branchResult: CompilationResult = checkReactCompilerWithOxc(source, absolutePath);

        if (branchResult.status === 'failed') {
            if (status === 'added') {
                failures.push({file: filename, reason: 'New file fails to compile with the React Compiler'});
                logError(`FAILED   ${filename} (new file must compile)`);
                printErrors(filename, branchResult.errors);
            } else {
                // Modified/renamed: only a regression from the base branch counts.
                // Use the resolved base commit hash (which honors GITHUB_BASE_REF) rather than a hardcoded `main`,
                // so grandfathering/regression detection works for PRs targeting any base branch.
                const mainPath = previousFilename ?? filename;
                const mainSource = getMainSource(mainBaseCommitHash, mainPath);
                const mainCompiled = mainSource !== undefined && checkReactCompilerWithOxc(mainSource, mainPath).status === 'compiled';

                if (mainCompiled) {
                    failures.push({file: filename, reason: 'File compiled on main but fails to compile on this branch (regression)'});
                    logError(`FAILED  ${filename} (regression: compiled on main)`);
                    printErrors(filename, branchResult.errors);
                } else if (verbose) {
                    logWarn(`WARNING  ${filename} (fails to compile, but also failed on main)`);
                }
            }
        } else if (verbose) {
            logSuccess(`OK  ${filename} (${branchResult.status})`);
        }
    }

    console.log();
    if (failures.length > 0) {
        logError(`React Compiler compliance check failed with ${failures.length} error(s).`);
        console.log();
        logInfo('See contributingGuides/REACT_COMPILER.md for help fixing these errors.');
        return false;
    }

    logSuccess('React Compiler compliance check passed!');
    return true;
}

const CLI_COMMANDS = ['check', 'check-changed'] as const;

async function main() {
    const cli = new CLI({
        positionalArgs: [
            {
                name: 'command',
                description: 'Command to run (check or check-changed)',
                default: 'check',
                parse: (val) => {
                    if (!(CLI_COMMANDS as readonly string[]).includes(val)) {
                        throw new Error(`Invalid command. Must be one of: ${CLI_COMMANDS.join(', ')}`);
                    }
                    return val;
                },
            },
            {
                name: 'files',
                description: 'File paths, directories, or glob patterns to check (only for "check" command)',
                variadic: true,
                default: [],
            },
        ],
        namedArgs: {
            remote: {
                description: 'Git remote name (default: origin in CI, none locally)',
                required: false,
            },
        },
        flags: {
            verbose: {
                description: 'Show detailed output including skipped files',
            },
        },
    });

    const {command} = cli.positionalArgs;
    const files = cli.positionalArgs.files as string[];
    const {remote} = cli.namedArgs;
    const {verbose} = cli.flags;

    let passed = false;

    switch (command) {
        case 'check':
            if (files.length === 0) {
                logError('No paths specified. Usage: npm run react-compiler-compliance-check check <files|dirs|globs...>');
                process.exit(1);
            }
            passed = checkFiles(files, verbose);
            break;
        case 'check-changed':
            passed = await checkChangedFiles(remote ?? 'origin', verbose);
            break;
        default:
            logError(`Unknown command: ${String(command)}`);
            process.exit(1);
    }

    process.exit(passed ? 0 : 1);
}

if (require.main === module) {
    main().catch((error: unknown) => {
        logError('Unexpected error:', error);
        process.exit(1);
    });
}

export type {CompilationResult, CompilerError};
