#!/usr/bin/env ts-node
/**
 * React Compiler Compliance Check
 *
 * Checks whether React components and hooks compile with React Compiler.
 * Two modes:
 *   - `check <files...>` -- check specific files, report per-file status
 *   - `check-changed`    -- check files changed in a PR, enforce two rules:
 *       1. New files with components/hooks must compile
 *       2. Modified files must not regress (compiled on main -> must compile on PR)
 */
import {transformSync} from '@babel/core';
import fs from 'fs';
import path from 'path';
import CLI from './utils/CLI';
import FileUtils from './utils/FileUtils';
import Git from './utils/Git';
import {error as logError, errorDetail as logErrorDetail, info as logInfo, success as logSuccess, warn as logWarn} from './utils/Logger';

// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-assignment
const ReactCompilerConfig = require('../config/babel/reactCompilerConfig');

type SourceLocation = {
    start: {line: number; column: number};
    end: {line: number; column: number};
};

type CompilerError = {
    reason: string;
    severity: string;
    loc?: SourceLocation;
    fnLoc?: SourceLocation;
};

type CompilationResult = {
    status: 'compiled' | 'failed' | 'no-components';
    errors: CompilerError[];
};

type CompilerLogEvent = {
    kind: string;
    fnLoc?: SourceLocation;
    fnName?: string;
    detail?: {
        severity?: string;
        reason?: string;
        loc?: SourceLocation;
    };
};

const FILE_EXTENSIONS = ['.ts', '.tsx'];

const IS_CI = process.env.CI === 'true';

/**
 * Check if a source string compiles with React Compiler.
 * Returns the compilation status and any errors with their details.
 */
function checkReactCompilerCompliance(source: string, filename: string): CompilationResult {
    let hasError = false;
    let hasSuccess = false;
    const errors: CompilerError[] = [];

    try {
        transformSync(source, {
            filename,
            ast: false,
            code: false,
            configFile: false,
            babelrc: false,
            parserOpts: {
                plugins: ['typescript', 'jsx'],
            },
            plugins: [
                [
                    'babel-plugin-react-compiler',
                    {
                        ...ReactCompilerConfig,
                        panicThreshold: 'none',
                        noEmit: true,
                        logger: {
                            logEvent(_filename: string, event: CompilerLogEvent) {
                                if (event.kind === 'CompileError') {
                                    hasError = true;
                                    if (event.detail?.reason) {
                                        errors.push({
                                            reason: event.detail.reason ?? 'Unknown compiler error',
                                            severity: event.detail.severity ?? 'Error',
                                            loc: event.detail.loc,
                                            fnLoc: event.fnLoc,
                                        });
                                    }
                                }
                                if (event.kind === 'CompileSuccess') {
                                    hasSuccess = true;
                                }
                            },
                        },
                    },
                ],
            ],
        });
    } catch (e) {
        hasError = true;
        errors.push({
            reason: e instanceof Error ? e.message : String(e),
            severity: 'Error',
        });
    }

    if (hasError) {
        return {status: 'failed', errors};
    }
    if (hasSuccess) {
        return {status: 'compiled', errors: []};
    }
    return {status: 'no-components', errors: []};
}

function formatErrorLocation(filename: string, error: CompilerError): string {
    const loc = error.loc ?? error.fnLoc;
    if (loc) {
        return `${loc.start.line}:${loc.start.column}`;
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
        const result = checkReactCompilerCompliance(source, file);

        switch (result.status) {
            case 'compiled':
                logSuccess(`COMPILED  ${file}`);
                break;
            case 'failed':
                logError(`FAILED  ${file}`);
                printErrors(file, result.errors);
                hasFailure = true;
                break;
            case 'no-components':
            default:
                if (verbose) {
                    logInfo(`SKIPPED  ${file} (no components or hooks)`);
                }
                break;
        }
    }

    return !hasFailure;
}

/**
 * Check files changed in a PR for React Compiler compliance.
 * Rule 1: New files with components/hooks must compile.
 * Rule 2: Modified files must not regress (compiled on main -> must compile on PR).
 */
async function checkChangedFiles(remote: string, verbose: boolean): Promise<boolean> {
    const mainBaseCommitHash = await Git.getMainBranchCommitHash(remote);
    const changedFiles = await Git.getChangedFilesWithStatus(mainBaseCommitHash);

    const reactFiles = changedFiles.filter((f) => FILE_EXTENSIONS.some((ext) => f.filename.endsWith(ext)) && f.status !== 'removed');

    if (reactFiles.length === 0) {
        logSuccess('No React files changed, skipping check.');
        return true;
    }

    logInfo(`Checking ${reactFiles.length} changed React files...`);

    const failures: Array<{file: string; reason: string; errors: CompilerError[]}> = [];

    for (const {filename, status, previousFilename} of reactFiles) {
        const absolutePath = path.resolve(filename);
        if (!fs.existsSync(absolutePath)) {
            continue;
        }

        const source = fs.readFileSync(absolutePath, 'utf8');
        const result = checkReactCompilerCompliance(source, absolutePath);

        if (status === 'added') {
            if (result.status === 'failed') {
                failures.push({file: filename, reason: 'New file contains components/hooks that fail to compile with React Compiler', errors: result.errors});
                logError(`FAILED   ${filename} (new file must compile)`);
                printErrors(filename, result.errors);
            } else if (verbose) {
                const label = result.status === 'compiled' ? 'COMPILED' : 'SKIPPED ';
                logSuccess(`${label} ${filename}`);
            }
            continue;
        }

        // Modified or renamed files: check for regression
        if (result.status === 'failed') {
            let mainStatus: CompilationResult['status'] = 'no-components';
            const mainPath = previousFilename ?? filename;
            try {
                const mainSource = Git.show('origin/main', mainPath);
                mainStatus = checkReactCompilerCompliance(mainSource, mainPath).status;
            } catch {
                mainStatus = 'no-components';
            }

            if (mainStatus === 'compiled') {
                failures.push({file: filename, reason: 'File compiled on main but fails to compile on this branch (regression)', errors: result.errors});
                logError(`FAILED  ${filename} (regression: compiled on main)`);
                printErrors(filename, result.errors);
            } else if (verbose) {
                logWarn(`WARNING  ${filename} (fails to compile, but also failed on main)`);
            }
        } else if (verbose) {
            const label = result.status === 'compiled' ? 'COMPILED' : 'SKIPPED ';
            logSuccess(`${label} ${filename}`);
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

export {checkReactCompilerCompliance};
export type {CompilationResult, CompilerError};
