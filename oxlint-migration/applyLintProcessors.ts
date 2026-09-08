#!/usr/bin/env bun

/**
 * Apply the repo's lint processors to an ESLint JSON report, in place, and print the same shape back.
 *
 *   npx eslint --format json src/foo.tsx | bun oxlint-migration/applyLintProcessors.ts
 *   bun oxlint-migration/applyLintProcessors.ts --in raw.json --out filtered.json
 *
 * Why this exists: `npx eslint --format json` is no longer what the repo's lint gate reports. The
 * React Compiler suppression and the `@typescript-eslint/no-deprecated` stratification used to be
 * ESLint processors wired into `config/eslint/eslint.config.mjs`, so any script that shelled out to
 * ESLint got them for free. They are now pipeline stages in `scripts/lint/`, which runs them on
 * ESLint's output rather than inside it (see `scripts/lint/index.ts`). A parity harness that
 * compares raw ESLint against Oxlint is therefore comparing Oxlint to something the repo never
 * actually reports.
 *
 * Piping through here restores the old meaning without duplicating either stage: it imports the
 * production processors and runs them over the report. It is not a second implementation, and it
 * dies with this directory.
 *
 * The third stage, `Seatbelt`, is deliberately NOT run. It is a ratchet on pre-existing debt rather
 * than a lint semantic, so demoting grandfathered errors here would compare a filtered ESLint set
 * against an unfiltered Oxlint one. `compareFullRepo.sh` passed `SEATBELT_DISABLE=1` for the same
 * reason back when seatbelt was an ESLint processor.
 */

import type {ESLintJSONResult} from '../scripts/lint/eslint/ESLintLinter';
import type {LintMessage} from '../scripts/lint/types';

import {normalizeESLintResults} from '../scripts/lint/eslint/ESLintLinter';
import ReactCompilerFilter from '../scripts/lint/processors/ReactCompilerFilter';
import StratifyNoDeprecated from '../scripts/lint/processors/StratifyNoDeprecated';
import {LINT_SEVERITY} from '../scripts/lint/types';

const projectRoot = `${import.meta.dir}/..`;

/** ESLint's own JSON shape. Only the fields this script reads or rewrites are named. */
type ESLintJSONFile = ESLintJSONResult & {
    errorCount?: number;
    fatalErrorCount?: number;
    warningCount?: number;
    fixableErrorCount?: number;
    fixableWarningCount?: number;
};

function readArgument(name: string): string | undefined {
    const index = process.argv.indexOf(name);
    return index < 0 ? undefined : process.argv[index + 1];
}

/**
 * Identity of a finding, stable across `normalizeESLintResults`. The processors filter rather than
 * rewrite, so surviving messages can be matched back to the entries they came from. Serialized
 * rather than joined on a separator, so a message containing the separator cannot collide with a
 * different finding. `line`/`column` mirror the `?? 0` fallback the normalizer applies to messages
 * ESLint reports without a position.
 */
function keyOf(filePath: string, ruleID: string | null, line: number | undefined, column: number | undefined, message: string): string {
    return JSON.stringify([filePath, ruleID ?? '', line ?? 0, column ?? 0, message]);
}

function keyOfMessage(message: LintMessage): string {
    return keyOf(message.filePath, message.ruleID, message.line, message.column, message.message);
}

const inputPath = readArgument('--in');
const outputPath = readArgument('--out');
const rawText = inputPath ? await Bun.file(inputPath).text() : await Bun.stdin.text();

let report: ESLintJSONFile[];
try {
    report = JSON.parse(rawText) as ESLintJSONFile[];
} catch {
    console.error(`applyLintProcessors: input is not JSON. First 600 chars:\n${rawText.slice(0, 600)}`);
    process.exit(2);
}
if (!Array.isArray(report)) {
    console.error('applyLintProcessors: expected an ESLint JSON array (`--format json`).');
    process.exit(2);
}

const normalized = normalizeESLintResults(report);
let messages = normalized.flatMap((file) => file.messages);
const context = {projectRoot, lintedFiles: normalized.map((file) => file.filePath)};

for (const processor of [new ReactCompilerFilter(), new StratifyNoDeprecated()]) {
    messages = await processor.process(messages, context);
}

const survivors = new Set(messages.map(keyOfMessage));
const filtered = report.map((file) => {
    const kept = file.messages.filter((message) => survivors.has(keyOf(file.filePath, message.ruleId, message.line, message.column, message.message)));
    const errorCount = kept.filter((message) => message.severity >= LINT_SEVERITY.ERROR).length;
    return {
        ...file,
        messages: kept,
        errorCount,
        fatalErrorCount: kept.filter((message) => message.severity >= LINT_SEVERITY.ERROR && !message.ruleId).length,
        warningCount: kept.length - errorCount,
        fixableErrorCount: kept.filter((message) => !!message.fix && message.severity >= LINT_SEVERITY.ERROR).length,
        fixableWarningCount: kept.filter((message) => !!message.fix && message.severity < LINT_SEVERITY.ERROR).length,
    };
});

const outputText = JSON.stringify(filtered);
if (outputPath) {
    await Bun.write(outputPath, outputText);
} else {
    console.log(outputText);
}
