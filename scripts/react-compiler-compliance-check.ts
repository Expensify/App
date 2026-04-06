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
import Git from './utils/Git';
import {log, error as logError, info as logInfo, success as logSuccess, warn as logWarn} from './utils/Logger';

// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-assignment
const ReactCompilerConfig = require('../config/babel/reactCompilerConfig');

type CompilationResult = 'compiled' | 'failed' | 'no-components';

const FILE_EXTENSIONS = ['.ts', '.tsx'];

/**
 * Check if a source string compiles with React Compiler.
 * Returns a three-state result indicating compilation success, failure, or no React code found.
 */
function checkReactCompilerCompliance(source: string, filename: string): CompilationResult {
    let hasError = false;
    let hasSuccess = false;

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
                            logEvent(_filename: string, event: {kind: string}) {
                                if (event.kind === 'CompileError') {
                                    hasError = true;
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
    } catch {
        hasError = true;
    }

    if (hasError) {
        return 'failed';
    }
    if (hasSuccess) {
        return 'compiled';
    }
    return 'no-components';
}

/**
 * Check specific files and report per-file status.
 */
function checkFiles(files: string[], verbose: boolean): boolean {
    let hasFailure = false;

    for (const file of files) {
        if (!FILE_EXTENSIONS.some((ext) => file.endsWith(ext))) {
            if (verbose) {
                logInfo(`SKIPPED  ${file} (not a .ts/.tsx file)`);
            }
            continue;
        }

        const absolutePath = path.resolve(file);
        if (!fs.existsSync(absolutePath)) {
            logWarn(`SKIPPED  ${file} (file not found)`);
            continue;
        }

        const source = fs.readFileSync(absolutePath, 'utf8');
        const result = checkReactCompilerCompliance(source, absolutePath);

        switch (result) {
            case 'compiled':
                logSuccess(`COMPILED ${file}`);
                break;
            case 'failed':
                logError(`FAILED   ${file}`);
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

    const failures: Array<{file: string; reason: string}> = [];

    for (const {filename, status} of reactFiles) {
        const absolutePath = path.resolve(filename);
        if (!fs.existsSync(absolutePath)) {
            continue;
        }

        const source = fs.readFileSync(absolutePath, 'utf8');
        const result = checkReactCompilerCompliance(source, absolutePath);

        if (status === 'added') {
            if (result === 'failed') {
                failures.push({file: filename, reason: 'New file contains components/hooks that fail to compile with React Compiler'});
                logError(`FAILED   ${filename} (new file must compile)`);
            } else if (verbose) {
                const label = result === 'compiled' ? 'COMPILED' : 'SKIPPED ';
                logSuccess(`${label} ${filename}`);
            }
            continue;
        }

        // Modified or renamed files: check for regression
        if (result === 'failed') {
            let mainResult: CompilationResult = 'no-components';
            try {
                const mainSource = Git.show(`origin/main`, filename);
                mainResult = checkReactCompilerCompliance(mainSource, filename);
            } catch {
                // File didn't exist on main (e.g. renamed from different path) -- treat as new
                mainResult = 'no-components';
            }

            if (mainResult === 'compiled') {
                failures.push({file: filename, reason: 'File compiled on main but fails to compile on this branch (regression)'});
                logError(`FAILED   ${filename} (regression: compiled on main)`);
            } else if (verbose) {
                logWarn(`WARNING  ${filename} (fails to compile, but also failed on main)`);
            }
        } else if (verbose) {
            const label = result === 'compiled' ? 'COMPILED' : 'SKIPPED ';
            logSuccess(`${label} ${filename}`);
        }
    }

    log();
    if (failures.length > 0) {
        logError(`React Compiler compliance check failed with ${failures.length} error(s):`);
        log();
        for (const {file, reason} of failures) {
            logError(`  ${file}`);
            logInfo(`    ${reason}`);
        }
        log();
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
                description: 'File paths to check (only for "check" command)',
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
                logError('No files specified. Usage: npm run react-compiler-compliance-check check <files...>');
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
    main();
}

export {checkReactCompilerCompliance};
export type {CompilationResult};
