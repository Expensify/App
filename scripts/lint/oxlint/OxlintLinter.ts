import {$} from 'bun';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import type {LintFileResult, LintMessage, LintSeverity, LinterResult} from '../types';

// eslint-disable-next-line import/extensions
import {oxlintCodeToESLintRuleID} from '../../../config/oxlint/ruleNames.mjs';
import Linter from '../Linter';
import {LINT_SEVERITY} from '../types';

const OXLINT_FILE_COUNT_KEY = 'number_of_files' as const;
const OXLINT_CONFIG_FILE = '.oxlintrc.json';
// Not `npx`: it passes the command to `sh -c` as one string, and Linux caps a single argv element at
// 128 KB, so a shard's file list fails to exec with E2BIG (exit 249). macOS has no per-element cap.
const OXLINT_BIN = path.join('node_modules', '.bin', 'oxlint');

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

type OxlintJSPlugin = string | {name: string; specifier: string};

type OxlintRules = Record<string, unknown>;

type OxlintOverride = {
    files?: string[];
    jsPlugins?: OxlintJSPlugin[];
    rules?: OxlintRules;
    [key: string]: unknown;
};

type OxlintConfig = {
    jsPlugins?: OxlintJSPlugin[];
    options?: Record<string, unknown>;
    rules?: OxlintRules;
    overrides?: OxlintOverride[];
    [key: string]: unknown;
};

type OxlintLinterOptions = {
    projectRoot: string;
    fix: boolean;
    threads?: string;
    shards?: string;
};

type OxlintLeg = {
    label: string;
    args: string[];
    lintedFiles: readonly string[];
};

const FATAL_EXIT_CODE = 2;
const SIGNAL_EXIT_CODE = 128;
const OXLINT_WARNING_SEVERITIES = new Set(['warning', 'advice']);
const GIB = 1073741824;

// Workaround for oxlint running every JS plugin on one thread (oxc#26621): JS-plugin rules are fanned
// across `--threads=1` processes with type information off, and type-aware rules run once in a separate
// process, because each oxlint process spawns its own multi-GB `oxlint-tsgolint` type program.
const JS_SHARD_MEM_GB = 2;
const TYPE_AWARE_MEM_GB = 10;

// On macOS `os.freemem()` counts only free pages and ignores the inactive, speculative and purgeable
// pages the kernel reclaims on demand, so it reads a few GB on an idle machine with tens of GB available.
function availableMemoryBytes(): number {
    if (process.platform === 'darwin') {
        const vmStat = Bun.spawnSync(['vm_stat']);
        if (vmStat.success) {
            const text = vmStat.stdout.toString();
            const pageSize = Number(/page size of (\d+)/.exec(text)?.[1]);
            const pages = (name: string) => Number(new RegExp(`^Pages ${name}:\\s+(\\d+)`, 'm').exec(text)?.[1] ?? 0);
            if (pageSize > 0) {
                return (pages('free') + pages('inactive') + pages('speculative') + pages('purgeable')) * pageSize;
            }
        }
    }
    return os.freemem();
}

function defaultShardCount(cpus = os.availableParallelism(), availableBytes = availableMemoryBytes()): number {
    const byCpu = Math.floor(cpus / 2);
    const byMem = Math.floor((availableBytes / GIB - TYPE_AWARE_MEM_GB) / JS_SHARD_MEM_GB);
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
    const shards: string[][] = Array.from({length: Math.min(count, files.length)}, () => []);
    for (const [index, file] of files.entries()) {
        shards.at(index % shards.length)?.push(file);
    }
    return shards;
}

// Mirrors how oxlint names a package plugin: `eslint-plugin-lodash` -> `lodash`, `@scope/eslint-plugin-x` -> `@scope/x`.
function jsPluginName(plugin: OxlintJSPlugin): string {
    if (typeof plugin !== 'string') {
        return plugin.name;
    }
    return plugin.replace(/(^|\/)eslint-plugin(-|$)/, '$1').replace(/\/$/, '');
}

function withoutRulesFrom(rules: OxlintRules | undefined, pluginNames: ReadonlySet<string>): OxlintRules {
    return Object.fromEntries(Object.entries(rules ?? {}).filter(([rule]) => ![...pluginNames].some((name) => rule.startsWith(`${name}/`))));
}

function deriveLegConfigs(config: OxlintConfig): {
    jsPlugins: OxlintConfig;
    typeAware: OxlintConfig;
} {
    const pluginNames = new Set([...(config.jsPlugins ?? []), ...(config.overrides ?? []).flatMap((override) => override.jsPlugins ?? [])].map(jsPluginName));
    const typeAware: OxlintConfig = {
        ...config,
        rules: withoutRulesFrom(config.rules, pluginNames),
        overrides: (config.overrides ?? []).map((override) => {
            const stripped: OxlintOverride = {
                ...override,
                rules: withoutRulesFrom(override.rules, pluginNames),
            };
            delete stripped.jsPlugins;
            return stripped;
        }),
    };
    delete typeAware.jsPlugins;
    return {
        jsPlugins: {...config, options: {...config.options, typeAware: false}},
        typeAware,
    };
}

function messageKey(message: LintMessage): string {
    return [message.ruleID, message.severity, message.line, message.column, message.message].join('\u0000');
}

function mergeShardResults(results: LinterResult[]): LinterResult {
    const fatalShard = results.find((result) => result.exitCode >= FATAL_EXIT_CODE);
    if (fatalShard) {
        return fatalShard;
    }
    const byFile = new Map<string, {seen: Set<string>; messages: LintMessage[]}>();
    for (const result of results) {
        for (const file of result.files) {
            const entry = byFile.get(file.filePath) ?? {
                seen: new Set<string>(),
                messages: [],
            };
            entry.messages.push(...file.messages.filter((message) => !entry.seen.has(messageKey(message))));
            for (const message of file.messages) {
                entry.seen.add(messageKey(message));
            }
            byFile.set(file.filePath, entry);
        }
    }
    return {
        files: [...byFile].map(([filePath, {messages}]) => ({
            filePath,
            messages,
        })),
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

// A killed oxlint writes nothing; a killed `oxlint-tsgolint` makes oxlint print
// `Error running tsgolint: "exit status: exit status: 1"` instead of a report and exit 1.
function producedNoJSON(stdout: string): boolean {
    return extractJSONObject(stdout) === null;
}

function isTransientFailure(stdout: string, exitCode: number): boolean {
    return producedNoJSON(stdout) || exitCode >= SIGNAL_EXIT_CODE;
}

function fatal(reason: string, stdout: string, stderr: string, exitCode: number): LinterResult {
    return {
        files: [],
        exitCode: Math.max(FATAL_EXIT_CODE, exitCode),
        stderr: `${stderr}\n${reason}\n${stdout.slice(0, 500)}`.trim(),
    };
}

function isOxlintConfig(value: unknown): value is OxlintConfig {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
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

    return {
        files: normalizeOxlintDiagnostics(parsed.diagnostics, projectRoot, lintedFiles),
        exitCode,
        stderr,
    };
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
        const result = await $`${OXLINT_BIN} --debug=files ${targets}`.cwd(this.options.projectRoot).nothrow().quiet();
        return result.stdout
            .toString()
            .split('\n')
            .map((line) => line.trim())
            .filter(Boolean);
    }

    private async listLintedFilesWithRetry(targets: string[]): Promise<{files: string[]; retried: boolean}> {
        const files = await this.listLintedFiles(targets);
        if (files.length > 0) {
            return {files, retried: false};
        }
        return {files: await this.listLintedFiles(targets), retried: true};
    }

    private runOxlint(args: string[]) {
        return $`${OXLINT_BIN} ${args}`
            .cwd(this.options.projectRoot)
            .env({...process.env, LINT_PIPELINE: '1'})
            .nothrow()
            .quiet();
    }

    private readConfig(): OxlintConfig {
        const parsed: unknown = Bun.JSONC.parse(fs.readFileSync(path.join(this.options.projectRoot, OXLINT_CONFIG_FILE), 'utf8'));
        if (!isOxlintConfig(parsed)) {
            throw new Error(`${OXLINT_CONFIG_FILE} is not a JSON object`);
        }
        return parsed;
    }

    private writeLegConfigs(): {
        jsPluginsConfig: string;
        typeAwareConfig: string;
        remove: () => void;
    } {
        const {jsPlugins, typeAware} = deriveLegConfigs(this.readConfig());
        const jsPluginsConfig = `.oxlintrc.js-plugins.${process.pid}.json`;
        const typeAwareConfig = `.oxlintrc.type-aware.${process.pid}.json`;
        fs.writeFileSync(path.join(this.options.projectRoot, jsPluginsConfig), JSON.stringify(jsPlugins));
        fs.writeFileSync(path.join(this.options.projectRoot, typeAwareConfig), JSON.stringify(typeAware));
        return {
            jsPluginsConfig,
            typeAwareConfig,
            remove: () => {
                fs.rmSync(path.join(this.options.projectRoot, jsPluginsConfig), {
                    force: true,
                });
                fs.rmSync(path.join(this.options.projectRoot, typeAwareConfig), {
                    force: true,
                });
            },
        };
    }

    private async runLegs(legs: OxlintLeg[], notes: string[]): Promise<LinterResult> {
        const outputs = [];
        if (this.options.fix) {
            for (const leg of legs) {
                outputs.push(await this.runOxlint(leg.args));
            }
        } else {
            outputs.push(...(await Promise.all(legs.map((leg) => this.runOxlint(leg.args)))));
        }

        const parsed: LinterResult[] = [];
        for (const [index, leg] of legs.entries()) {
            let output = outputs.at(index);
            if (!output) {
                throw new Error(`Missing output for oxlint ${leg.label}`);
            }
            if (isTransientFailure(output.stdout.toString(), output.exitCode)) {
                const how = `exit ${output.exitCode}, ${producedNoJSON(output.stdout.toString()) ? 'no JSON' : 'JSON present'}`;
                output = await this.runOxlint(leg.args);
                const recovered = !isTransientFailure(output.stdout.toString(), output.exitCode);
                notes.push(`Oxlint ${leg.label} died (${how}) and was retried once, serially: ${recovered ? 'recovered' : 'failed again'}.`);
            }
            const result = parseOxlintStdout(output.stdout.toString(), output.stderr.toString(), output.exitCode, this.options.projectRoot, leg.lintedFiles);
            parsed.push(result.exitCode >= FATAL_EXIT_CODE ? {...result, stderr: `Oxlint ${leg.label}:\n${result.stderr}`} : result);
        }
        return mergeShardResults(parsed);
    }

    async run(targets: string[]): Promise<LinterResult> {
        const {files: lintedFiles, retried: listerRetried} = await this.listLintedFilesWithRetry(targets);
        if (lintedFiles.length === 0) {
            return fatal(`Oxlint matched no files for: ${targets.join(' ')} (asked twice, in case the first listing died)`, '', '', FATAL_EXIT_CODE);
        }

        const notes: string[] = [];
        if (listerRetried) {
            notes.push(`Oxlint listed no files on the first attempt and ${lintedFiles.length} on the second, so that listing died rather than matching nothing.`);
        }

        const baseArgs: string[] = ['--format', 'json'];
        if (this.options.fix) {
            baseArgs.push('--fix');
        }

        const shardCount = resolveShardCount(this.options.shards ?? process.env.OXLINT_SHARDS);
        let plan: string;
        let merged: LinterResult;
        try {
            if (shardCount <= 1) {
                const threads = this.options.threads ?? process.env.OXLINT_THREADS;
                const args = threads ? [`--threads=${threads}`, ...baseArgs] : baseArgs;
                plan = 'Oxlint plan: 1 process, stock config.';
                merged = await this.runLegs([{label: 'process', args: [...args, ...lintedFiles], lintedFiles}], notes);
            } else {
                const buckets = shardFiles(lintedFiles, shardCount);
                plan = `Oxlint plan: ${buckets.length} JS-plugin shards plus 1 type-aware process (cores ${os.availableParallelism()}, available memory ${(availableMemoryBytes() / GIB).toFixed(1)} GB).`;
                const configs = this.writeLegConfigs();
                try {
                    const legs: OxlintLeg[] = buckets.map((bucket, index) => ({
                        label: `JS-plugin shard ${index + 1} of ${buckets.length}`,
                        args: ['-c', configs.jsPluginsConfig, '--threads=1', ...baseArgs, ...bucket],
                        lintedFiles: bucket,
                    }));
                    legs.push({
                        label: 'type-aware process',
                        args: ['-c', configs.typeAwareConfig, ...baseArgs, ...targets],
                        lintedFiles,
                    });
                    merged = await this.runLegs(legs, notes);
                } finally {
                    configs.remove();
                }
            }
        } catch (error) {
            return fatal(error instanceof Error ? error.message : String(error), '', '', FATAL_EXIT_CODE);
        }

        if (notes.length === 0 && merged.exitCode < FATAL_EXIT_CODE) {
            return merged;
        }
        return {
            ...merged,
            stderr: [merged.stderr, ...notes, plan].filter(Boolean).join('\n'),
        };
    }
}

export default OxlintLinter;
export {
    defaultShardCount,
    deriveLegConfigs,
    extractJSONObject,
    isOxlintConfig,
    isTransientFailure,
    joinDiagnosticText,
    jsPluginName,
    mergeShardResults,
    normalizeOxlintDiagnostics,
    parseOxlintStdout,
    producedNoJSON,
    resolveShardCount,
    shardFiles,
};
export type {OxlintConfig, OxlintDiagnostic, OxlintLinterOptions};
