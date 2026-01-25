#!/usr/bin/env ts-node
/* eslint-disable max-classes-per-file */
/**
 * React Compiler Compliance Checker
 *
 * This script tracks which components can be compiled by React Compiler and which cannot.
 * It provides both CI and local development tools to enforce Rules of React compliance.
 */
import {execSync} from 'child_process';
import fs, {readFileSync} from 'fs';
import path from 'path';
import type {TupleToUnion} from 'type-fest';
import CLI from './utils/CLI';
import EslintUtils from './utils/EslintUtils';
import FileUtils from './utils/FileUtils';
import Git from './utils/Git';
import type {DiffResult} from './utils/Git';
import {log, bold as logBold, error as logError, info as logInfo, note as logNote, success as logSuccess, warn as logWarn} from './utils/Logger';

type CompilerResults = {
    success: Set<string>;
    errors: Map<string, CompilerError>;
    errorsForAddedFiles: Map<string, CompilerError>;
    errorsForModifiedFiles: Map<string, CompilerError>;
    manualMemoErrors: Map<string, ManualMemoizationError[]>;
    suppressedErrors: Map<string, CompilerError>;
};

type CompilerError = {
    file: string;
    line: number;
    column: number;
    reason?: string;
};

type ManualMemoizationError = {
    keyword: string;
    line: number;
    column: number;
};

type CheckMode = 'static' | 'incremental';

type BaseCheckParameters = {
    remote?: string;
    verbose?: boolean;
};

type CheckParameters = BaseCheckParameters & {
    mode?: CheckMode;
    files?: string[];
};

type CheckOptions = {
    mode: CheckMode;
    verbose: boolean;
};

/**
 * Handles running react-compiler-healthcheck and parsing its output.
 */
class ReactCompilerHealthcheck {
    private static readonly SUPPRESSED_ERRORS = [
        // This error is caused by an internal limitation of React Compiler
        // https://github.com/facebook/react/issues/29583
        '(BuildHIR::lowerExpression) Expected Identifier, got MemberExpression key in ObjectExpression',
    ] as const;

    private static readonly OUTPUT_REGEXES = {
        SUCCESS: /Successfully compiled (?:hook|component) \[([^\]]+)\]\(([^)]+)\)/,
        ERROR_WITH_REASON: /Failed to compile ([^:]+):(\d+):(\d+)\. Reason: (.+)/,
        ERROR_WITHOUT_REASON: /Failed to compile ([^:]+):(\d+):(\d+)\./,
        REASON: /Reason: (.+)/,
    } as const;

    /**
     * Run the react-compiler-healthcheck CLI tool and parse its output.
     */
    static run(src?: string): CompilerResults {
        const srcArg = src ? `--src "${src}"` : '';
        const output = execSync(`npx react-compiler-healthcheck ${srcArg} --verbose`, {
            encoding: 'utf8',
            cwd: process.cwd(),
        });

        return this.parseOutput(output);
    }

    /**
     * Parse the output of the react-compiler-healthcheck command.
     */
    private static parseOutput(output: string): CompilerResults {
        const lines = output.split('\n');

        const results: CompilerResults = {
            success: new Set(),
            errors: new Map(),
            errorsForAddedFiles: new Map(),
            errorsForModifiedFiles: new Map(),
            manualMemoErrors: new Map(),
            suppressedErrors: new Map(),
        };

        let currentErrorWithoutReason: CompilerError | null = null;

        for (const line of lines) {
            const successMatch = line.match(this.OUTPUT_REGEXES.SUCCESS);
            if (successMatch) {
                const filePath = successMatch[2];
                results.success.add(filePath);
                continue;
            }

            const errorWithReasonMatch = line.match(this.OUTPUT_REGEXES.ERROR_WITH_REASON);
            if (errorWithReasonMatch) {
                const newError: CompilerError = {
                    file: errorWithReasonMatch[1],
                    line: parseInt(errorWithReasonMatch[2], 10),
                    column: parseInt(errorWithReasonMatch[3], 10),
                    reason: errorWithReasonMatch[4],
                };

                currentErrorWithoutReason = null;

                if (this.shouldSuppressError(newError.reason)) {
                    this.addOrUpdateError(results.suppressedErrors, newError);
                    continue;
                }

                this.addOrUpdateError(results.errors, newError);
            }

            const errorWithoutReasonMatch = line.match(this.OUTPUT_REGEXES.ERROR_WITHOUT_REASON);
            if (errorWithoutReasonMatch) {
                const newError: CompilerError = {
                    file: errorWithoutReasonMatch[1],
                    line: parseInt(errorWithoutReasonMatch[2], 10),
                    column: parseInt(errorWithoutReasonMatch[3], 10),
                };

                currentErrorWithoutReason = newError;
                this.addOrUpdateError(results.errors, newError);
                continue;
            }

            const reasonMatch = line.match(this.OUTPUT_REGEXES.REASON);
            if (reasonMatch && currentErrorWithoutReason) {
                const reason = reasonMatch[1];

                const currentError: CompilerError = {
                    file: currentErrorWithoutReason.file,
                    line: currentErrorWithoutReason.line,
                    column: currentErrorWithoutReason.column,
                    reason,
                };

                currentErrorWithoutReason = null;

                if (this.shouldSuppressError(reason)) {
                    this.addOrUpdateError(results.suppressedErrors, currentError);
                    continue;
                }

                this.addOrUpdateError(results.errors, currentError);
            }
        }

        results.success = new Set(Array.from(results.success).sort((a, b) => a.localeCompare(b)));
        results.errors = this.sortErrors(results.errors);
        results.suppressedErrors = this.sortErrors(results.suppressedErrors);

        return results;
    }

    private static addOrUpdateError(errorMap: Map<string, CompilerError>, newError: CompilerError): boolean {
        const key = this.getErrorKey(newError);
        const existingError = errorMap.get(key);

        if (existingError) {
            const isReasonSet = !!existingError.reason;
            const isNewReasonSet = !!newError.reason;
            if (!isReasonSet && isNewReasonSet) {
                errorMap.set(key, newError);
                return true;
            }

            return false;
        }

        errorMap.set(key, newError);
        return true;
    }

    private static sortErrors(errors: Map<string, CompilerError>) {
        const arr = Array.from(errors.entries());
        arr.sort(([, a], [, b]) => {
            const keyA = this.getErrorKey(a);
            const keyB = this.getErrorKey(b);
            return keyA.localeCompare(keyB);
        });
        return new Map(arr);
    }

    private static shouldSuppressError(reason: string | undefined): boolean {
        if (!reason) {
            return false;
        }

        return this.SUPPRESSED_ERRORS.some((suppressedError) => reason.includes(suppressedError));
    }

    static getErrorKey({file, line, column}: CompilerError): string {
        const isLineSet = line !== undefined;
        const isLineAndColumnSet = isLineSet && column !== undefined;

        return file + (isLineSet ? `:${line}` : '') + (isLineAndColumnSet ? `:${column}` : '');
    }

    static getErrorsByFile(errors: Map<string, CompilerError>) {
        const errorsByFile = new Map<string, Map<string, CompilerError>>();
        for (const [key, error] of errors.entries()) {
            if (!errorsByFile.has(error.file)) {
                errorsByFile.set(error.file, new Map());
            }
            errorsByFile.get(error.file)?.set(key, error);
        }

        const filesWithErrors = new Set<string>(errorsByFile.keys());

        return {
            errorsByFile,
            filesWithErrors,
        };
    }
}

/**
 * Analyzes git diffs to filter compiler results to only changed lines.
 */
class DiffAnalyzer {
    private static readonly ESLINT_LINT_RULES = ['react-hooks'] as const;

    /**
     * Filter compiler results to only include errors for lines that were changed in the git diff.
     */
    static async filterResultsByDiff(results: CompilerResults, mainBaseCommitHash: string, diffResult: DiffResult, {verbose}: CheckOptions): Promise<CompilerResults> {
        logInfo(`Filtering results by diff between ${mainBaseCommitHash} and the working tree...`);

        if (!diffResult.hasChanges) {
            return {
                success: new Set(),
                errors: new Map(),
                errorsForAddedFiles: new Map(),
                errorsForModifiedFiles: new Map(),
                manualMemoErrors: new Map(),
                suppressedErrors: new Map(),
            };
        }

        const changedLinesMap = this.buildChangedLinesMap(diffResult);
        const {filesWithEslintDisable, linesWithEslintDisableNextLine} = this.detectEslintDisables(diffResult);

        const filterErrorsByChangedLines = (errors: Map<string, CompilerError>) => {
            const filteredErrors = new Map<string, CompilerError>();

            for (const [key, error] of errors) {
                const changedLines = changedLinesMap.get(error.file);

                if (!changedLines) {
                    continue;
                }

                if (filesWithEslintDisable.has(error.file)) {
                    filteredErrors.set(key, error);
                    continue;
                }

                if (error.line !== undefined) {
                    const isLineChanged = changedLines.has(error.line);
                    const isLineEslintDisabled = linesWithEslintDisableNextLine.get(error.file)?.has(error.line);

                    if (isLineChanged || isLineEslintDisabled) {
                        filteredErrors.set(key, error);
                    }
                    continue;
                }

                filteredErrors.set(key, error);
            }

            return filteredErrors;
        };

        const filteredErrors = filterErrorsByChangedLines(results.errors);
        const filteredSuppressedErrors = filterErrorsByChangedLines(results.suppressedErrors);

        const changedFiles = new Set(diffResult.files.map((file) => file.filePath));
        const filteredSuccesses = new Set<string>();
        for (const file of results.success) {
            if (!changedFiles.has(file)) {
                continue;
            }
            filteredSuccesses.add(file);
        }

        if (filteredErrors.size === 0) {
            logInfo('No errors remain after filtering by diff.');
        } else {
            logInfo(`${filteredErrors.size} out of ${results.errors.size} errors remain after filtering by diff.`);
        }

        if (verbose) {
            if (filteredSuppressedErrors.size === 0) {
                logInfo('No suppressed errors remain after filtering by diff.');
            } else {
                logInfo(`${filteredSuppressedErrors.size} out of ${results.suppressedErrors.size} successes remain after filtering by diff.`);
            }

            if (filteredSuccesses.size === 0) {
                logInfo('No successes remain after filtering by diff.');
            } else {
                logInfo(`${filteredSuccesses.size} out of ${results.success.size} successes remain after filtering by diff.`);
            }
        }

        return {
            success: filteredSuccesses,
            errors: filteredErrors,
            errorsForAddedFiles: new Map(),
            errorsForModifiedFiles: new Map(),
            manualMemoErrors: new Map(),
            suppressedErrors: filteredSuppressedErrors,
        };
    }

    private static buildChangedLinesMap(diffResult: DiffResult): Map<string, Set<number>> {
        const changedLinesMap = new Map<string, Set<number>>();

        for (const file of diffResult.files) {
            const changedLines = new Set([...file.addedLines, ...file.modifiedLines]);
            changedLinesMap.set(file.filePath, changedLines);
        }

        return changedLinesMap;
    }

    private static detectEslintDisables(diffResult: DiffResult): {
        filesWithEslintDisable: Set<string>;
        linesWithEslintDisableNextLine: Map<string, Set<number>>;
    } {
        const filesWithEslintDisable = new Set<string>();
        const linesWithEslintDisableNextLine = new Map<string, Set<number>>();

        for (const file of diffResult.files) {
            for (const hunk of file.hunks) {
                for (const line of hunk.lines) {
                    if (EslintUtils.hasEslintDisableComment(line.content, true, [...this.ESLINT_LINT_RULES])) {
                        filesWithEslintDisable.add(file.filePath);
                    }

                    if (EslintUtils.hasEslintDisableComment(line.content, false, [...this.ESLINT_LINT_RULES])) {
                        if (!linesWithEslintDisableNextLine.has(file.filePath)) {
                            linesWithEslintDisableNextLine.set(file.filePath, new Set());
                        }

                        const disabledLines = linesWithEslintDisableNextLine.get(file.filePath);
                        if (!disabledLines) {
                            continue;
                        }

                        const reactCompilerErrorLineNumber = line.type === 'removed' ? line.number + hunk.newCount : line.number + hunk.newCount + 1;
                        disabledLines.add(reactCompilerErrorLineNumber);
                    }
                }
            }
        }

        return {filesWithEslintDisable, linesWithEslintDisableNextLine};
    }
}

/**
 * Checks for manual memoization in files that should use automatic memoization.
 */
class ManualMemoizationChecker {
    static readonly PATTERNS = {
        memo: /\b(?:React\.)?memo\s*\(/g,
        useMemo: /\b(?:React\.)?useMemo\s*\(/g,
        useCallback: /\b(?:React\.)?useCallback\s*\(/g,
    } as const;

    private static readonly FILE_EXTENSIONS = ['.tsx', '.jsx'] as const;

    private static readonly NO_MEMO_DIRECTIVE_PATTERN = /["']use no memo["']\s*;?/;

    static getErrorMessage(keyword: keyof typeof this.PATTERNS): string {
        return `Found a manual memoization usage of \`${keyword}\`. Newly added React component files must not contain any manual memoization and instead be auto-memoized by React Compiler. Remove \`${keyword}\` or disable automatic memoization by adding the \`"use no memo";\` directive at the beginning of the component and give a reason why automatic memoization is not applicable.`;
    }

    /**
     * Split errors by file diff type and check for manual memoization violations.
     */
    static splitErrorsBasedOnFileDiffType({success, errors: reactCompilerErrors}: CompilerResults, diffResult: DiffResult) {
        const {filesWithErrors, errorsByFile} = ReactCompilerHealthcheck.getErrorsByFile(reactCompilerErrors);

        const {addedFiles, enforcedAutoMemoFiles} = this.categorizeFiles(diffResult, success, filesWithErrors);

        const reactCompilerErrorsForModifiedFiles = reactCompilerErrors;
        const reactCompilerErrorsForAddedFiles = new Map<string, CompilerError>();

        for (const file of filesWithErrors) {
            if (enforcedAutoMemoFiles.has(file)) {
                continue;
            }

            const errors = errorsByFile.get(file);

            if (addedFiles.has(file)) {
                for (const [errorKey, error] of errors?.entries() ?? []) {
                    reactCompilerErrorsForAddedFiles.set(errorKey, error);
                    reactCompilerErrors.delete(errorKey);
                }
            }
        }

        const manualMemoErrors = this.findViolations(enforcedAutoMemoFiles);

        return {
            manualMemoErrors,
            reactCompilerErrorsForModifiedFiles,
            reactCompilerErrorsForAddedFiles,
        };
    }

    private static categorizeFiles(
        diffResult: DiffResult,
        successFiles: Set<string>,
        filesWithErrors: Set<string>,
    ): {
        addedFiles: Set<string>;
        enforcedAutoMemoFiles: Set<string>;
    } {
        const enforcedAutoMemoFiles = new Set<string>();
        const addedFiles = new Set<string>();

        for (const file of diffResult.files) {
            const filePath = file.filePath;

            filesWithErrors.add(filePath);

            const isAddedFile = file.diffType === 'added';
            if (isAddedFile) {
                addedFiles.add(filePath);
            }

            const isReactComponentSourceFile = this.FILE_EXTENSIONS.some((extension) => filePath.endsWith(extension));
            const isSuccessfullyCompiled = successFiles.has(filePath);

            if (isReactComponentSourceFile && isSuccessfullyCompiled && isAddedFile) {
                enforcedAutoMemoFiles.add(filePath);
            }
        }

        return {addedFiles, enforcedAutoMemoFiles};
    }

    private static findViolations(files: Set<string>): Map<string, ManualMemoizationError[]> {
        const manualMemoErrors = new Map<string, ManualMemoizationError[]>();

        for (const file of files) {
            let source: string | null = null;
            try {
                const absolutePath = path.join(process.cwd(), file);
                source = readFileSync(absolutePath, 'utf8');
            } catch (error) {
                logWarn(`Unable to read ${file} while enforcing new component rules.`, error);
            }

            if (!source || this.NO_MEMO_DIRECTIVE_PATTERN.test(source)) {
                continue;
            }

            const manualMemoizationMatches = this.findMatches(source);

            if (manualMemoizationMatches.length === 0) {
                continue;
            }

            manualMemoErrors.set(file, manualMemoizationMatches);
        }

        return manualMemoErrors;
    }

    private static findMatches(source: string): ManualMemoizationError[] {
        const matches: ManualMemoizationError[] = [];

        for (const keyword of Object.keys(this.PATTERNS) as Array<keyof typeof this.PATTERNS>) {
            const regex = this.PATTERNS[keyword];
            const regexMatches = source.matchAll(regex);

            for (const regexMatch of regexMatches) {
                const matchIndex = regexMatch.index;
                if (matchIndex === undefined) {
                    continue;
                }
                const {line, column} = FileUtils.getLineAndColumnFromIndex(source, matchIndex);
                matches.push({keyword, line, column});
            }
        }

        matches.sort((a, b) => {
            if (a.line !== b.line) {
                return a.line - b.line;
            }
            return a.column - b.column;
        });

        return matches;
    }
}

/**
 * Handles printing compiler results to the console.
 */
class ResultsPrinter {
    private static readonly TAB = '    ';

    /**
     * Print all results and determine pass/fail status.
     */
    static printResults({success, errorsForAddedFiles, errorsForModifiedFiles, suppressedErrors, manualMemoErrors}: CompilerResults, {verbose}: CheckOptions): boolean {
        this.printSuccesses(success, verbose);
        this.printSuppressedErrors(suppressedErrors, verbose);

        const {hasModifiedFilesErrors, hasAddedFilesErrors} = this.printCompilerErrors(errorsForModifiedFiles, errorsForAddedFiles);
        const hasManualMemoErrors = this.printManualMemoErrors(manualMemoErrors);

        if ((hasModifiedFilesErrors || hasAddedFilesErrors) && !hasManualMemoErrors) {
            log();
        }

        const didCheckForAddedFilesPass = errorsForAddedFiles.size === 0;
        const isPassed = didCheckForAddedFilesPass && !hasManualMemoErrors;

        if (isPassed) {
            if (hasModifiedFilesErrors) {
                logWarn(`React Compiler compliance check passed with warnings! The warnings must NOT be fixed and can get ignored.`);
            }

            logSuccess('React Compiler compliance check passed!');
            return true;
        }

        log();
        logError(
            `The files above failed the React Compiler compliance check. Do not remove any manual memoization patterns, unless a file is already able to compile with React Compiler. You can use the "React Compiler Marker" VS Code extension to check whether a file is being compiled with React Compiler.`,
        );

        return false;
    }

    private static printSuccesses(success: Set<string>, verbose: boolean): void {
        if (!verbose || success.size === 0) {
            return;
        }

        log();
        logSuccess(`Successfully compiled ${success.size} files with React Compiler:`);
        log();

        for (const successFile of success) {
            logSuccess(`${successFile}`);
        }

        log();
    }

    private static printSuppressedErrors(suppressedErrors: Map<string, CompilerError>, verbose: boolean): void {
        if (!verbose || suppressedErrors.size === 0) {
            return;
        }

        const suppressedErrorMap = new Map<string, CompilerError[]>();
        for (const [, error] of suppressedErrors) {
            if (!error.reason) {
                continue;
            }

            if (!suppressedErrorMap.has(error.reason)) {
                suppressedErrorMap.set(error.reason, []);
            }

            suppressedErrorMap.get(error.reason)?.push(error);
        }

        log();
        logWarn(`Suppressed the following errors in these files:`);
        log();

        for (const [error, suppressedErrorFiles] of suppressedErrorMap) {
            logBold(error);
            const filesLine = suppressedErrorFiles.map((suppressedError) => ReactCompilerHealthcheck.getErrorKey(suppressedError)).join(', ');
            logNote(`${this.TAB} - ${filesLine}`);
        }

        log();
    }

    private static printCompilerErrors(
        errorsForModifiedFiles: Map<string, CompilerError>,
        errorsForAddedFiles: Map<string, CompilerError>,
    ): {hasModifiedFilesErrors: boolean; hasAddedFilesErrors: boolean} {
        const hasModifiedFilesErrors = errorsForModifiedFiles.size > 0;
        const hasAddedFilesErrors = errorsForAddedFiles.size > 0;

        if (hasModifiedFilesErrors) {
            const {filesWithErrors} = ReactCompilerHealthcheck.getErrorsByFile(errorsForModifiedFiles);

            if (filesWithErrors.size > 0) {
                log();
                logWarn(`Failed to compile ${filesWithErrors.size} modified files with React Compiler:`);
                log();

                this.printErrors(errorsForModifiedFiles);
            }
        }

        if (hasAddedFilesErrors) {
            const {filesWithErrors} = ReactCompilerHealthcheck.getErrorsByFile(errorsForAddedFiles);

            if (filesWithErrors.size > 0) {
                log();
                logError(`Failed to compile ${filesWithErrors.size} added files with React Compiler:`);
                log();

                this.printErrors(errorsForAddedFiles);
            }
        }

        return {hasModifiedFilesErrors, hasAddedFilesErrors};
    }

    private static printManualMemoErrors(manualMemoErrors: Map<string, ManualMemoizationError[]>): boolean {
        const hasManualMemoErrors = manualMemoErrors.size > 0;

        if (!hasManualMemoErrors) {
            return false;
        }

        log();
        logError(`The following newly added components should be auto memoized by the React Compiler (manual memoization is not allowed):`);

        for (const [filePath, manualMemoizationMatches] of manualMemoErrors) {
            log();

            for (const manualMemoizationMatch of manualMemoizationMatches) {
                const location = manualMemoizationMatch.line && manualMemoizationMatch.column ? `:${manualMemoizationMatch.line}:${manualMemoizationMatch.column}` : '';
                logBold(`${filePath}${location}`);
                logNote(`${this.TAB}${ManualMemoizationChecker.getErrorMessage(manualMemoizationMatch.keyword as keyof typeof ManualMemoizationChecker.PATTERNS)}`);
            }
        }

        return true;
    }

    private static printErrors(errorsToPrint: Map<string, CompilerError>, level = 0) {
        for (const error of errorsToPrint.values()) {
            const location = error.line && error.column ? `:${error.line}:${error.column}` : '';
            logBold(`${this.TAB.repeat(level)}${error.file}${location}`);
            logNote(`${this.TAB.repeat(level + 1)}${error.reason ?? 'No reason provided'}`);
        }
    }
}

/**
 * Generates JSON reports of compiler results.
 */
class ReportGenerator {
    /**
     * Generate a report and save it to /tmp.
     */
    static generate({success, errors, suppressedErrors, manualMemoErrors, errorsForAddedFiles, errorsForModifiedFiles}: CompilerResults): void {
        const timestamp = new Date().toISOString().replaceAll(/[:.]/g, '-');
        const reportFileName = `react-compiler-compliance-check-report-${timestamp}.json`;
        const reportFile = path.join('/tmp', reportFileName);

        const resultsObject = {
            success: Array.from(success),
            errors: Object.fromEntries(errors.entries()),
            errorsForAddedFiles: Object.fromEntries(errorsForAddedFiles.entries()),
            errorsForModifiedFiles: Object.fromEntries(errorsForModifiedFiles.entries()),
            manualMemoErrors: Object.fromEntries(manualMemoErrors.entries()),
            suppressedErrors: Object.fromEntries(suppressedErrors.entries()),
        } satisfies Record<keyof CompilerResults, Record<string, unknown> | string[]>;

        fs.writeFileSync(
            reportFile,
            JSON.stringify(
                {
                    timestamp: new Date().toISOString(),
                    results: resultsObject,
                },
                null,
                2,
            ),
        );

        log();
        logInfo(`Report saved to: ${reportFile}`);
    }
}

/**
 * Main checker orchestrates the compliance check workflow.
 */
class Checker {
    /**
     * Check changed files for React Compiler compliance.
     */
    static async checkChangedFiles({remote, ...restOptions}: BaseCheckParameters): Promise<boolean> {
        logInfo('Checking changed files for React Compiler compliance...');

        const mainBaseCommitHash = await Git.getMainBranchCommitHash(remote);
        const changedFiles = await Git.getChangedFileNames(mainBaseCommitHash, undefined, true);

        if (changedFiles.length === 0) {
            logSuccess('No React files changed, skipping check.');
            return true;
        }

        return this.check({mode: 'incremental', files: changedFiles, ...restOptions});
    }

    /**
     * Check specific files or all files for React Compiler compliance.
     */
    static async check({mode = 'static', files, remote, verbose = false}: CheckParameters): Promise<boolean> {
        const options: CheckOptions = {mode, verbose};

        if (files) {
            logInfo(`Running React Compiler check for ${files.length} files or glob patterns...`);
        } else {
            logInfo('Running React Compiler check for all files...');
        }

        let results = ReactCompilerHealthcheck.run(this.createFilesGlob(files));

        const mainBaseCommitHash = await Git.getMainBranchCommitHash(remote);
        const diffResult = Git.diff(mainBaseCommitHash, undefined, undefined, true);

        if (mode === 'incremental') {
            results = await DiffAnalyzer.filterResultsByDiff(results, mainBaseCommitHash, diffResult, options);
        }

        const {reactCompilerErrorsForModifiedFiles, reactCompilerErrorsForAddedFiles, manualMemoErrors} = ManualMemoizationChecker.splitErrorsBasedOnFileDiffType(results, diffResult);

        results.manualMemoErrors = manualMemoErrors;
        results.errorsForAddedFiles = reactCompilerErrorsForAddedFiles;
        results.errorsForModifiedFiles = reactCompilerErrorsForModifiedFiles;

        const isPassed = ResultsPrinter.printResults(results, options);

        ReportGenerator.generate(results);

        return isPassed;
    }

    /**
     * Create a glob pattern from an array of file paths.
     */
    private static createFilesGlob(files?: string[]): string | undefined {
        if (!files || files.length === 0) {
            return undefined;
        }

        if (files.length === 1) {
            return files.at(0);
        }

        return `**/+(${files.join('|')})`;
    }
}

const CLI_COMMANDS = ['check', 'check-changed'] as const;
type CliCommand = TupleToUnion<typeof CLI_COMMANDS>;

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
        },
        flags: {
            verbose: {
                description: 'Print logs of successes and suppressed errors',
                required: false,
                default: false,
            },
        },
    });

    const {command, file} = cli.positionalArgs;
    const {remote} = cli.namedArgs;
    const {verbose} = cli.flags;

    const commonOptions: BaseCheckParameters = {
        verbose,
    };

    async function runCommand() {
        switch (command) {
            case 'check':
                return Checker.check({files: file ? [file] : undefined, ...commonOptions});
            case 'check-changed':
                return Checker.checkChangedFiles({remote, ...commonOptions});
            default:
                logError(`Unknown command: ${String(command)}`);
                return Promise.resolve(false);
        }
    }

    try {
        const isPassed = await runCommand();
        process.exit(isPassed ? 0 : 1);
    } catch (error) {
        logError('Error running react-compiler-compliance-check:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

export default Checker;
