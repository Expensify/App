import {$} from 'bun';
import path from 'node:path';

import type {LintFileResult, LintMessage, LintSeverity, LinterResult} from '../types';

// eslint-disable-next-line import/extensions
import {oxlintCodeToESLintRuleID} from '../../../config/oxlint/ruleNames.mjs';
import Linter from '../Linter';
import {LINT_SEVERITY} from '../types';

const OXLINT_FILE_COUNT_KEY = 'number_of_files' as const;

type OxlintSpan = {
    offset: number;
    length: number;
    line?: number;
    column?: number;
};

type OxlintLabel = {
    span?: OxlintSpan;
};

type OxlintDiagnostic = {
    message: string;
    code?: string | null;
    severity?: string;
    filename: string;
    help?: string;
    note?: string;
    labels?: OxlintLabel[];
};

type OxlintJSONReport = {
    diagnostics: OxlintDiagnostic[];
    [OXLINT_FILE_COUNT_KEY]?: number;
};

type OxlintLinterOptions = {
    projectRoot: string;
    fix: boolean;
    threads?: string;
};

const FATAL_EXIT_CODE = 2;
const OXLINT_WARNING_SEVERITIES = new Set(['warning', 'advice']);

function normalizeSeverity(severity: string | undefined): LintSeverity {
    return OXLINT_WARNING_SEVERITIES.has(severity ?? '') ? LINT_SEVERITY.WARNING : LINT_SEVERITY.ERROR;
}

/** Oxlint splits a finding across `message`, `help` and `note`; ESLint has only `message`. */
function joinDiagnosticText(diagnostic: OxlintDiagnostic): string {
    return [diagnostic.message, diagnostic.help, diagnostic.note].filter(Boolean).join('\n');
}

/** Oxlint reports cwd-relative paths. They must be absolute or every seatbelt row silently misses. */
function toAbsolute(projectRoot: string, filename: string): string {
    return path.isAbsolute(filename) ? filename : path.resolve(projectRoot, filename);
}

function toLintMessage(projectRoot: string, diagnostic: OxlintDiagnostic, ruleID: string): LintMessage {
    const span = diagnostic.labels?.at(0)?.span;
    return {
        filePath: toAbsolute(projectRoot, diagnostic.filename),
        ruleID,
        severity: normalizeSeverity(diagnostic.severity),
        message: joinDiagnosticText(diagnostic),
        line: span?.line ?? 0,
        column: span?.column ?? 0,
    };
}

/**
 * `lintedFiles` comes from a separate `--debug=files` pass because oxlint's JSON omits every file
 * that produced no diagnostic.
 */
function normalizeOxlintDiagnostics(diagnostics: OxlintDiagnostic[], projectRoot: string, lintedFiles: readonly string[]): LintFileResult[] {
    const byFile = new Map<string, LintMessage[]>();
    for (const filePath of lintedFiles) {
        byFile.set(toAbsolute(projectRoot, filePath), []);
    }

    for (const diagnostic of diagnostics) {
        const filePath = toAbsolute(projectRoot, diagnostic.filename);
        const messages = byFile.get(filePath) ?? [];
        messages.push(toLintMessage(projectRoot, diagnostic, oxlintCodeToESLintRuleID(diagnostic.code ?? '')));
        byFile.set(filePath, messages);
    }

    return [...byFile].map(([filePath, messages]) => ({filePath, messages}));
}

/** Oxlint prints warnings such as "No files found to lint." to stdout, ahead of the JSON. */
function extractJSONObject(text: string): string | null {
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start < 0 || end <= start) {
        return null;
    }
    return text.slice(start, end + 1);
}

function fatal(reason: string, stdout: string, stderr: string, exitCode: number): LinterResult {
    return {
        files: [],
        exitCode: Math.max(FATAL_EXIT_CODE, exitCode),
        stderr: `${stderr}\n${reason}\n${stdout.slice(0, 500)}`.trim(),
    };
}

function isOxlintReport(value: unknown): value is OxlintJSONReport {
    return typeof value === 'object' && value !== null && 'diagnostics' in value && Array.isArray(value.diagnostics);
}

/**
 * Oxlint exits 1 for findings, for no files matched, and for a config that failed to parse. Only
 * the first is a normal run, and `LintPipeline` treats everything at or below 1 as one, so the
 * other two are promoted here. A config error is recognizable by producing no JSON at all.
 */
function parseOxlintStdout(stdout: string, stderr: string, exitCode: number, projectRoot: string, lintedFiles: readonly string[]): LinterResult {
    const jsonText = extractJSONObject(stdout);
    if (!jsonText) {
        return fatal('Failed to parse Oxlint JSON output.', stdout, stderr, exitCode);
    }

    let parsed: unknown;
    try {
        parsed = JSON.parse(jsonText);
    } catch {
        return fatal('Failed to parse Oxlint JSON output.', stdout, stderr, exitCode);
    }
    if (!isOxlintReport(parsed)) {
        return fatal('Oxlint JSON output has no `diagnostics` array.', stdout, stderr, exitCode);
    }

    // A diagnostic with no `code` is a crashing JS plugin, not a finding.
    const codeless = parsed.diagnostics.filter((diagnostic) => !diagnostic.code);
    if (codeless.length > 0) {
        const sample = codeless
            .slice(0, 5)
            .map((diagnostic) => `  ${diagnostic.filename}: ${diagnostic.message}`)
            .join('\n');
        return fatal(`Oxlint reported ${codeless.length} diagnostic(s) with no rule code, which means a JS plugin threw:\n${sample}`, '', stderr, exitCode);
    }

    return {files: normalizeOxlintDiagnostics(parsed.diagnostics, projectRoot, lintedFiles), exitCode, stderr};
}

/**
 * `--type-aware` is not passed: `.oxlintrc.json` already sets `options.typeAware`.
 * `--no-error-on-unmatched-pattern` is not passed either, because it turns a mistyped path into a
 * silent clean pass; the empty-file-list case is detected explicitly instead.
 * Oxlint has no `--cache`, so the pipeline's `--no-cache` flag has no effect here.
 */
class OxlintLinter extends Linter {
    readonly name = 'oxlint';

    constructor(private readonly options: OxlintLinterOptions) {
        super();
    }

    private async listLintedFiles(targets: string[]): Promise<string[]> {
        const result = await $`npx oxlint --debug=files ${targets}`.cwd(this.options.projectRoot).nothrow().quiet();
        return result.stdout
            .toString()
            .split('\n')
            .map((line) => line.trim())
            .filter(Boolean);
    }

    async run(targets: string[]): Promise<LinterResult> {
        const lintedFiles = await this.listLintedFiles(targets);
        if (lintedFiles.length === 0) {
            return fatal(`Oxlint matched no files for: ${targets.join(' ')}`, '', '', FATAL_EXIT_CODE);
        }

        const oxlintArgs: string[] = ['--format', 'json'];
        if (this.options.fix) {
            oxlintArgs.push('--fix');
        }
        const threads = this.options.threads ?? process.env.OXLINT_THREADS;
        if (threads) {
            oxlintArgs.push(`--threads=${threads}`);
        }
        oxlintArgs.push(...targets);

        const result = await $`npx oxlint ${oxlintArgs}`
            .cwd(this.options.projectRoot)
            .env({...process.env, LINT_PIPELINE: '1'})
            .nothrow()
            .quiet();

        try {
            return parseOxlintStdout(result.stdout.toString(), result.stderr.toString(), result.exitCode, this.options.projectRoot, lintedFiles);
        } catch (error) {
            return fatal(error instanceof Error ? error.message : String(error), '', result.stderr.toString(), FATAL_EXIT_CODE);
        }
    }
}

export default OxlintLinter;
export {extractJSONObject, joinDiagnosticText, normalizeOxlintDiagnostics, parseOxlintStdout};
export type {OxlintDiagnostic, OxlintLinterOptions};
