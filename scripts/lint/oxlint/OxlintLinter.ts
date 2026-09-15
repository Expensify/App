import {$} from 'bun';
import os from 'node:os';
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
    shards?: string;
};

const FATAL_EXIT_CODE = 2;
const OXLINT_WARNING_SEVERITIES = new Set(['warning', 'advice']);

// Workaround for oxlint running every JS plugin on a single thread (upstream oxc#26621 open), which
// leaves `--threads` doing nothing for the 180 sidecar rules this repo enables. Sharding into several
// `oxlint --threads=1` processes over disjoint file buckets is the only way to parallelize them today.
// Sized by cores and free memory below.
const SHARD_MEM_BUDGET_GB = 2;

function defaultShardCount(): number {
    const byCpu = Math.floor(os.cpus().length / 2);
    const byMem = Math.floor(os.freemem() / 1073741824 / SHARD_MEM_BUDGET_GB);
    return Math.max(1, Math.min(byCpu, byMem));
}

function resolveShardCount(override: string | undefined): number {
    if (override === undefined || override.trim() === '') {
        return defaultShardCount();
    }
    const parsed = Number.parseInt(override, 10);
    return Number.isFinite(parsed) && parsed >= 1 ? parsed : 1;
}

function shardFiles(files: readonly string[], count: number): string[][] {
    if (count <= 1) {
        return [files.slice()];
    }
    const size = Math.ceil(files.length / count);
    const shards: string[][] = [];
    for (let start = 0; start < files.length; start += size) {
        shards.push(files.slice(start, start + size));
    }
    return shards;
}

function mergeShardResults(results: LinterResult[]): LinterResult {
    const fatalShard = results.find((result) => result.exitCode >= FATAL_EXIT_CODE);
    if (fatalShard) {
        return fatalShard;
    }
    return {
        files: results.flatMap((result) => result.files),
        exitCode: results.reduce((worst, result) => Math.max(worst, result.exitCode), 0),
        stderr: results
            .map((result) => result.stderr)
            .filter(Boolean)
            .join('\n'),
    };
}

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

/**
 * Did this shard produce no JSON object at all? That is the signature of a process that died: an
 * OOM kill writes no stdout. A config error looks identical from here, which is fine, because the
 * two want the same treatment for different reasons -- a dead shard usually passes on a second run,
 * and a config error fails again for the price of one extra process.
 *
 * Deliberately narrower than "the shard was fatal". A shard that returned codeless diagnostics threw
 * inside a JS plugin, and a shard that matched no files is a mistyped path; both are deterministic,
 * so retrying them buys nothing and only doubles the wait.
 *
 * Retries are issued one shard at a time, never as a second parallel pass. Shard count is derived
 * from `os.freemem()` at invocation (`defaultShardCount`), so a shard the OS killed under memory
 * pressure would most likely be killed again by a concurrent retry. Serialising is the part that
 * makes the retry worth having, not the retry itself.
 */
function producedNoJSON(stdout: string): boolean {
    return extractJSONObject(stdout) === null;
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

    /**
     * The file list is gathered by its own `npx oxlint --debug=files` process, before any shard runs,
     * and it is exposed to the same transient death as a shard: if it is killed, it writes nothing and
     * an empty list is indistinguishable from a genuinely unmatched path. That reads as
     * `Oxlint matched no files`, which sends you looking at your targets instead of at memory.
     *
     * So an empty list is asked for a second time. A mistyped path answers empty again, for the cost
     * of one more short process; a killed lister answers with the files.
     */
    private async listLintedFilesWithRetry(targets: string[]): Promise<{files: string[]; retried: boolean}> {
        const files = await this.listLintedFiles(targets);
        if (files.length > 0) {
            return {files, retried: false};
        }
        return {files: await this.listLintedFiles(targets), retried: true};
    }

    async run(targets: string[]): Promise<LinterResult> {
        const {files: lintedFiles, retried: listerRetried} = await this.listLintedFilesWithRetry(targets);
        if (lintedFiles.length === 0) {
            return fatal(`Oxlint matched no files for: ${targets.join(' ')} (asked twice, in case the first listing died)`, '', '', FATAL_EXIT_CODE);
        }

        const shardCount = resolveShardCount(this.options.shards ?? process.env.OXLINT_SHARDS);
        const buckets = shardFiles(lintedFiles, shardCount);
        const sharded = buckets.length > 1;

        const baseArgs: string[] = ['--format', 'json'];
        if (this.options.fix) {
            baseArgs.push('--fix');
        }
        if (!sharded) {
            const threads = this.options.threads ?? process.env.OXLINT_THREADS;
            if (threads) {
                baseArgs.push(`--threads=${threads}`);
            }
        }

        const runBucket = (bucket: string[]) => {
            const args = sharded ? ['--threads=1', ...baseArgs, ...bucket] : [...baseArgs, ...bucket];
            return $`npx oxlint ${args}`
                .cwd(this.options.projectRoot)
                .env({...process.env, LINT_PIPELINE: '1'})
                .nothrow()
                .quiet();
        };

        const attempts = await Promise.all(buckets.map(async (bucket) => ({bucket, output: await runBucket(bucket)})));
        const parsed = attempts.map(({bucket, output}) => parseOxlintStdout(output.stdout.toString(), output.stderr.toString(), output.exitCode, this.options.projectRoot, bucket));

        const notes: string[] = [];
        if (listerRetried) {
            notes.push(`Oxlint listed no files on the first attempt and ${lintedFiles.length} on the second, so that listing died rather than matching nothing.`);
        }
        for (const [index, {bucket, output}] of attempts.entries()) {
            if (!producedNoJSON(output.stdout.toString())) {
                continue;
            }
            const retry = await runBucket(bucket);
            const recovered = !producedNoJSON(retry.stdout.toString());
            parsed[index] = parseOxlintStdout(retry.stdout.toString(), retry.stderr.toString(), retry.exitCode, this.options.projectRoot, bucket);
            notes.push(`Oxlint shard ${index + 1} of ${attempts.length} produced no JSON and was retried once: ${recovered ? 'recovered' : 'failed again'}.`);
        }

        try {
            const merged = mergeShardResults(parsed);
            if (notes.length === 0) {
                return merged;
            }
            // Never silent: a run that only passed because of a retry says so, otherwise a machine that
            // is quietly one shard away from failing looks exactly like a healthy one.
            return {...merged, stderr: [merged.stderr, ...notes].filter(Boolean).join('\n')};
        } catch (error) {
            return fatal(error instanceof Error ? error.message : String(error), '', '', FATAL_EXIT_CODE);
        }
    }
}

export default OxlintLinter;
export {defaultShardCount, extractJSONObject, joinDiagnosticText, mergeShardResults, normalizeOxlintDiagnostics, parseOxlintStdout, producedNoJSON, resolveShardCount, shardFiles};
export type {OxlintDiagnostic, OxlintLinterOptions};
