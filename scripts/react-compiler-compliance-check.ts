#!/usr/bin/env bun
/**
 * React Compiler Compliance Check
 *
 * Checks how React components and hooks fare under BOTH React Compilers: Babel
 * (babel-plugin-react-compiler, used by Metro/Jest) and OXC (oxc-transform, used
 * by the web build). Two modes:
 *   - `check <files...>` -- check specific files, report per-file dual status
 *   - `check-changed`    -- check files changed in a PR, enforce:
 *       1. New files with components/hooks must compile under both compilers
 *       2. Modified files must not regress (compiled on main -> must compile on PR) under either compiler
 *       3. Changed files must not introduce new memoization divergence (one compiler memoizes, the
 *          other does not) that did not already exist on main
 *
 * The Babel analysis lives inline here (kept OXC-free at module scope) because this module's
 * `checkReactCompilerCompliance` export is imported by a Jest unit test, and oxc-transform is
 * excluded from Jest's transform. The OXC analysis is loaded via a dynamic import that only runs
 * in the (bun) CLI paths, so importing this module in Jest never pulls in oxc-transform.
 */
import {transformSync} from '@babel/core';
import CLI from 'expensify-common/CLI';
import fs from 'fs';
import path from 'path';

import FileUtils from './utils/FileUtils';
import Git from './utils/Git';
import {error as logError, errorDetail as logErrorDetail, info as logInfo, success as logSuccess, warn as logWarn} from './utils/Logger';

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
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
    memoized: boolean;
    errors: CompilerError[];
};

type CompilerLogEvent = {
    kind: string;
    fnLoc?: SourceLocation;
    fnName?: string;
    memoBlocks?: number;
    detail?: {
        severity?: string;
        reason?: string;
        loc?: SourceLocation;
    };
};

type OxcChecker = (source: string, filename: string) => CompilationResult;

type DualResult = {
    babel: CompilationResult;
    oxc: CompilationResult;
    isDivergent: boolean;
};

const FILE_EXTENSIONS = ['.ts', '.tsx'];

const IS_CI = process.env.CI === 'true';

/**
 * Check a source string with the Babel React Compiler.
 * Returns the compile-health status, whether the compiler actually memoized anything, and any errors.
 */
function checkReactCompilerCompliance(source: string, filename: string): CompilationResult {
    let hasError = false;
    let hasSuccess = false;
    let memoBlocks = 0;
    const errors: CompilerError[] = [];

    try {
        // Analyze with noEmit (no code generation) -- cheap, and the CompileSuccess event's
        // memoBlocks count tells us whether memoization was actually applied. With panicThreshold
        // 'none', Rules-of-React violations are reported via the logger rather than thrown.
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
                                    memoBlocks += event.memoBlocks ?? 0;
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

    const memoized = memoBlocks > 0;

    if (hasError) {
        return {status: 'failed', memoized, errors};
    }
    if (hasSuccess) {
        return {status: 'compiled', memoized, errors: []};
    }
    return {status: 'no-components', memoized, errors: []};
}

/**
 * Run both compilers against a single file and report whether they disagree on memoization.
 * A file is divergent when exactly one compiler emits memoization (`memoized` XOR).
 */
function checkBoth(source: string, filename: string, checkOxc: OxcChecker): DualResult {
    const babel = checkReactCompilerCompliance(source, filename);
    const oxc = checkOxc(source, filename);
    return {
        babel,
        oxc,
        isDivergent: babel.memoized !== oxc.memoized,
    };
}

function divergenceLabel(result: DualResult): string {
    if (result.babel.memoized) {
        return `Babel memoizes this file but OXC does not (oxc=${result.oxc.status}) -- it will not be memoized on web`;
    }
    return `OXC memoizes this file but Babel does not (babel=${result.babel.status}) -- it will not be memoized on native`;
}

function formatErrorLocation(filename: string, error: CompilerError): string {
    const loc = error.loc ?? error.fnLoc;
    if (loc) {
        return `${loc.start.line}:${loc.start.column}`;
    }
    return filename;
}

function printErrors(filename: string, label: string, errors: CompilerError[]): void {
    if (IS_CI) {
        console.log(`::group::${filename} ${label} (${errors.length} error${errors.length === 1 ? '' : 's'})`);
    }
    for (const error of errors) {
        const location = formatErrorLocation(filename, error);
        logErrorDetail(`${label} ${location}: ${error.reason}`);
    }
    if (IS_CI) {
        console.log('::endgroup::');
    }
}

/**
 * Check specific files and report per-file status for both compilers.
 */
function checkFiles(inputs: string[], verbose: boolean, checkOxc: OxcChecker): boolean {
    const files = FileUtils.resolveFilePaths(inputs, FILE_EXTENSIONS);

    if (files.length === 0) {
        logWarn(`No ${FILE_EXTENSIONS.join('/')} files found matching the provided paths.`);
        return true;
    }

    let hasFailure = false;

    for (const file of files) {
        const source = fs.readFileSync(file, 'utf8');
        const {babel, oxc, isDivergent} = checkBoth(source, file, checkOxc);

        if (babel.status === 'failed') {
            logError(`FAILED (babel)  ${file}`);
            printErrors(file, '[babel]', babel.errors);
            hasFailure = true;
        }
        if (oxc.status === 'failed') {
            logError(`FAILED (oxc)  ${file}`);
            printErrors(file, '[oxc]', oxc.errors);
            hasFailure = true;
        }

        if (babel.status !== 'failed' && oxc.status !== 'failed') {
            if (isDivergent) {
                logWarn(`DIVERGENT  ${file}: ${divergenceLabel({babel, oxc, isDivergent})}`);
            } else if (verbose) {
                if (babel.status === 'compiled' || oxc.status === 'compiled') {
                    logSuccess(`COMPILED  ${file} (babel=${babel.status}, oxc=${oxc.status})`);
                } else {
                    logInfo(`SKIPPED  ${file} (no components or hooks)`);
                }
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
 * Check files changed in a PR for React Compiler compliance under both compilers.
 * Rule 1: New files with components/hooks must compile under both compilers.
 * Rule 2: Modified files must not regress (compiled on main -> must compile on PR) under either compiler.
 * Rule 3: Changed files must not introduce new memoization divergence that did not exist on main.
 */
async function checkChangedFiles(remote: string, verbose: boolean, checkOxc: OxcChecker): Promise<boolean> {
    const mainBaseCommitHash = await Git.getMainBranchCommitHash(remote);
    const changedFiles = await Git.getChangedFilesWithStatus(mainBaseCommitHash);

    const reactFiles = changedFiles.filter((f) => FILE_EXTENSIONS.some((ext) => f.filename.endsWith(ext)) && f.status !== 'removed');

    if (reactFiles.length === 0) {
        logSuccess('No React files changed, skipping check.');
        return true;
    }

    logInfo(`Checking ${reactFiles.length} changed React files with both compilers (Babel + OXC)...`);

    const mainRef = remote ? `${remote}/main` : 'origin/main';
    const failures: Array<{file: string; reason: string}> = [];

    for (const {filename, status, previousFilename} of reactFiles) {
        const absolutePath = path.resolve(filename);
        if (!fs.existsSync(absolutePath)) {
            continue;
        }

        const source = fs.readFileSync(absolutePath, 'utf8');
        const branchResult = checkBoth(source, absolutePath, checkOxc);

        // Rule 1 + 2: compile failures.
        for (const [compiler, result] of [
            ['babel', branchResult.babel],
            ['oxc', branchResult.oxc],
        ] as const) {
            if (result.status !== 'failed') {
                continue;
            }

            if (status === 'added') {
                failures.push({file: filename, reason: `New file fails to compile with the ${compiler} React Compiler`});
                logError(`FAILED   ${filename} (new file must compile, ${compiler})`);
                printErrors(filename, `[${compiler}]`, result.errors);
                continue;
            }

            // Modified/renamed: only a regression from main counts.
            const mainPath = previousFilename ?? filename;
            const mainSource = getMainSource(mainRef, mainPath);
            const mainResult = mainSource !== undefined ? checkBoth(mainSource, mainPath, checkOxc) : undefined;
            const mainCompiledHere = compiler === 'babel' ? mainResult?.babel.status === 'compiled' : mainResult?.oxc.status === 'compiled';

            if (mainCompiledHere) {
                failures.push({file: filename, reason: `File compiled on main but fails to compile on this branch with the ${compiler} React Compiler (regression)`});
                logError(`FAILED  ${filename} (regression: compiled on main, ${compiler})`);
                printErrors(filename, `[${compiler}]`, result.errors);
            } else if (verbose) {
                logWarn(`WARNING  ${filename} (fails to compile with ${compiler}, but also failed on main)`);
            }
        }

        // Rule 3: newly-introduced memoization divergence. Existing main divergences are grandfathered.
        if (branchResult.isDivergent) {
            let wasDivergentOnMain = false;
            if (status !== 'added') {
                const mainPath = previousFilename ?? filename;
                const mainSource = getMainSource(mainRef, mainPath);
                wasDivergentOnMain = mainSource !== undefined ? checkBoth(mainSource, mainPath, checkOxc).isDivergent : false;
            }

            if (!wasDivergentOnMain) {
                const introduced = status === 'added' ? 'new file is memoization-divergent' : 'introduces new memoization divergence';
                failures.push({file: filename, reason: `${introduced}: ${divergenceLabel(branchResult)}`});
                logError(`FAILED  ${filename} (${introduced})`);
                logErrorDetail(divergenceLabel(branchResult));
            } else if (verbose) {
                logWarn(`WARNING  ${filename} (memoization-divergent, but was already divergent on main)`);
            }
        } else if (verbose) {
            logSuccess(`OK  ${filename} (babel=${branchResult.babel.status}, oxc=${branchResult.oxc.status})`);
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

    // Dynamically import the OXC checker so that importing this module in Jest (where oxc-transform
    // is not transformable) never pulls it in -- the CLI paths below are never executed under Jest.
    // The explicit .mjs extension is required for Node/bun ESM resolution of this JS module.
    // eslint-disable-next-line import/extensions
    const checkReactCompilerWithOxc = ((await import('../config/reactCompiler/checkWithOxc.mjs')) as {default: OxcChecker}).default;

    let passed = false;

    switch (command) {
        case 'check':
            if (files.length === 0) {
                logError('No paths specified. Usage: npm run react-compiler-compliance-check check <files|dirs|globs...>');
                process.exit(1);
            }
            passed = checkFiles(files, verbose, checkReactCompilerWithOxc);
            break;
        case 'check-changed':
            passed = await checkChangedFiles(remote ?? 'origin', verbose, checkReactCompilerWithOxc);
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
