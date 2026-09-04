import {$} from 'bun';

import type {LintFileResult, LintMessage, LintSeverity, LinterResult} from '../types';

import Linter from '../Linter';

const ESLINT_RULE_ID_KEY = 'ruleId' as const;

type ESLintJSONMessage = {
    // ESLint's JSON output uses this key; normalize it to ruleID below.
    [ESLINT_RULE_ID_KEY]: string | null;
    severity: number;
    message: string;
    line?: number;
    column?: number;
    endLine?: number;
    endColumn?: number;
    suggestions?: unknown;
    fix?: unknown;
};

type ESLintJSONResult = {
    filePath: string;
    messages: ESLintJSONMessage[];
    source?: string;
    suppressedMessages?: unknown[];
};

type ESLintLinterOptions = {
    projectRoot: string;
    useCache: boolean;
    fix: boolean;
    concurrency?: string;
    nodeOptions?: string;
};

const PARSE_FAILURE_EXIT_CODE = 2;

function normalizeSeverity(severity: number): LintSeverity {
    return severity >= 2 ? 2 : 1;
}

function isESLintJSONResult(value: unknown): value is ESLintJSONResult {
    return typeof value === 'object' && value !== null && 'filePath' in value && 'messages' in value;
}

function normalizeESLintResults(results: ESLintJSONResult[]): LintFileResult[] {
    return results.map((result) => ({
        filePath: result.filePath,
        source: result.source,
        messages: result.messages.map(
            (message): LintMessage => ({
                filePath: result.filePath,
                ruleID: message[ESLINT_RULE_ID_KEY],
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

/** Babel / file-progress may write to stdout around the JSON array. */
function extractJSONArray(text: string): string | null {
    const start = text.indexOf('[');
    const end = text.lastIndexOf(']');
    if (start < 0 || end <= start) {
        return null;
    }
    return text.slice(start, end + 1);
}

function parseFailureOutput(stdout: string, stderr: string, exitCode: number): LinterResult {
    return {
        files: [],
        exitCode: Math.max(PARSE_FAILURE_EXIT_CODE, exitCode),
        stderr: `${stderr}\nFailed to parse ESLint JSON output.\n${stdout.slice(0, 500)}`,
    };
}

/**
 * Turn ESLint stdout into structured results. A missing/invalid JSON payload is
 * fatal (`exitCode > 1`) even when ESLint itself exited 0 or 1 — otherwise
 * the pipeline would flatten zero messages and report a clean pass.
 */
function parseESLintStdout(stdout: string, stderr: string, exitCode: number): LinterResult {
    const jsonText = extractJSONArray(stdout);
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

    return {files: normalizeESLintResults(parsed.filter(isESLintJSONResult)), exitCode, stderr};
}

/**
 * Spawn ESLint as a JSON producer. Processors are not wired in the ESLint
 * config — this is the raw linter output the pipeline consumes.
 *
 * `--no-inline-config` is intentionally *not* passed: disable comments must
 * still work. `--quiet` is also not passed here; the formatter filters
 * warnings after seatbelt demotes grandfathered errors.
 */
class ESLintLinter extends Linter {
    readonly name = 'eslint';

    constructor(private readonly options: ESLintLinterOptions) {
        super();
    }

    async run(targets: string[]): Promise<LinterResult> {
        const eslintArgs: string[] = ['--format', 'json', '--no-warn-ignored'];
        if (this.options.useCache) {
            eslintArgs.push('--cache', '--cache-location=node_modules/.cache/eslint', '--cache-strategy', 'content');
        }
        if (this.options.fix) {
            eslintArgs.push('--fix');
        }
        eslintArgs.push(`--concurrency=${this.options.concurrency ?? process.env.ESLINT_CONCURRENCY ?? 'auto'}`, ...targets);

        const nodeOptions = this.options.nodeOptions ?? process.env.NODE_OPTIONS ?? '--max_old_space_size=8192';
        const result = await $`npx eslint ${eslintArgs}`
            .cwd(this.options.projectRoot)
            .env({...process.env, NODE_OPTIONS: nodeOptions, LINT_PIPELINE: '1'})
            .nothrow()
            .quiet();

        return parseESLintStdout(result.stdout.toString(), result.stderr.toString(), result.exitCode);
    }
}

export default ESLintLinter;
export {normalizeESLintResults, parseESLintStdout};
export type {ESLintJSONResult, ESLintLinterOptions};
