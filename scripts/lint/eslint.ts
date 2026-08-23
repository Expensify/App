import {$} from 'bun';

import type {LintFileResult, LintMessage, LintSeverity, RawLintOutput} from './types';

type EslintJsonMessage = {
    ruleId: string | null;
    severity: number;
    message: string;
    line?: number;
    column?: number;
    endLine?: number;
    endColumn?: number;
    suggestions?: unknown;
    fix?: unknown;
};

type EslintJsonResult = {
    filePath: string;
    messages: EslintJsonMessage[];
    source?: string;
    suppressedMessages?: unknown[];
};

type RunEslintOptions = {
    projectRoot: string;
    targets: string[];
    useCache: boolean;
    fix: boolean;
    concurrency?: string;
    nodeOptions?: string;
};

function normalizeSeverity(severity: number): LintSeverity {
    return severity >= 2 ? 2 : 1;
}

function isEslintJsonResult(value: unknown): value is EslintJsonResult {
    return typeof value === 'object' && value !== null && 'filePath' in value && 'messages' in value;
}

function normalizeEslintResults(results: EslintJsonResult[]): LintFileResult[] {
    return results.map((result) => ({
        filePath: result.filePath,
        source: result.source,
        messages: result.messages.map(
            (message): LintMessage => ({
                filePath: result.filePath,
                ruleId: message.ruleId,
                severity: normalizeSeverity(message.severity),
                message: message.message,
                line: message.line ?? 0,
                column: message.column ?? 0,
                endLine: message.endLine,
                endColumn: message.endColumn,
                suggestions: message.suggestions,
                fix: message.fix,
            }),
        ),
    }));
}

function flattenResults(results: LintFileResult[]): LintMessage[] {
    return results.flatMap((result) => result.messages);
}

/** Babel / file-progress may write to stdout around the JSON array. */
function extractJsonArray(text: string): string | null {
    const start = text.indexOf('[');
    const end = text.lastIndexOf(']');
    if (start < 0 || end <= start) {
        return null;
    }
    return text.slice(start, end + 1);
}

/**
 * Spawn ESLint as a JSON producer. Processors (react-compiler, stratify,
 * seatbelt) are *not* wired in the ESLint config — this is the raw linter
 * output the post-process pipeline consumes.
 *
 * `--no-inline-config` is intentionally *not* passed: disable comments must
 * still work. `--quiet` is also not passed here; the reporter filters
 * warnings after seatbelt demotes grandfathered errors.
 */
async function runEslint(options: RunEslintOptions): Promise<RawLintOutput> {
    const eslintArgs: string[] = ['--format', 'json', '--no-warn-ignored'];
    if (options.useCache) {
        eslintArgs.push('--cache', '--cache-location=node_modules/.cache/eslint', '--cache-strategy', 'content');
    }
    if (options.fix) {
        eslintArgs.push('--fix');
    }
    eslintArgs.push(`--concurrency=${options.concurrency ?? process.env.ESLINT_CONCURRENCY ?? 'auto'}`, ...options.targets);

    const nodeOptions = options.nodeOptions ?? process.env.NODE_OPTIONS ?? '--max_old_space_size=8192';
    const result = await $`npx eslint ${eslintArgs}`
        .cwd(options.projectRoot)
        .env({...process.env, NODE_OPTIONS: nodeOptions, LINT_PIPELINE: '1'})
        .nothrow()
        .quiet();

    return parseEslintStdout(result.stdout.toString(), result.stderr.toString(), result.exitCode);
}

const PARSE_FAILURE_EXIT_CODE = 2;

function parseFailureOutput(stdout: string, stderr: string, exitCode: number): RawLintOutput {
    return {
        results: [],
        linterExitCode: Math.max(PARSE_FAILURE_EXIT_CODE, exitCode),
        stderr: `${stderr}\nFailed to parse ESLint JSON output.\n${stdout.slice(0, 500)}`,
    };
}

/**
 * Turn ESLint stdout into structured results. A missing/invalid JSON payload is
 * fatal (`linterExitCode > 1`) even when ESLint itself exited 0 or 1 — otherwise
 * the pipeline would flatten zero messages and report a clean pass.
 */
function parseEslintStdout(stdout: string, stderr: string, exitCode: number): RawLintOutput {
    const jsonText = extractJsonArray(stdout);
    if (!jsonText) {
        return parseFailureOutput(stdout, stderr, exitCode);
    }

    let parsed: unknown;
    try {
        parsed = JSON.parse(jsonText);
    } catch {
        return parseFailureOutput(stdout, stderr, exitCode);
    }
    if (!Array.isArray(parsed)) {
        return parseFailureOutput(stdout, stderr, exitCode);
    }

    return {results: normalizeEslintResults(parsed.filter(isEslintJsonResult)), linterExitCode: exitCode, stderr};
}

export {flattenResults, normalizeEslintResults, parseEslintStdout, runEslint};
export type {EslintJsonResult, RunEslintOptions};
