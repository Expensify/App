import {file} from 'bun';
import {rename} from 'node:fs/promises';
import path from 'node:path';

import type {LintMessage, ProcessorContext, SeatbeltOptions, SeatbeltRuleSet} from '../types';

import TSVUtils from '../../utils/TSVUtils';
import Processor from '../Processor';

const SEATBELT_NAME = 'eslint-seatbelt';
const SEATBELT_TSV_RELATIVE = 'config/eslint/eslint.seatbelt.tsv';
const DEFAULT_FILE_HEADER = `# ${SEATBELT_NAME} temporarily allowed errors
# docs: https://github.com/justjake/${SEATBELT_NAME}#readme`;

type SeatbeltFileLine = {
    filename: string;
    ruleID: string;
    maxErrors: number;
};

type SeatbeltFileData = {
    maxErrors?: Map<string, number>;
    lines: SeatbeltFileLine[];
};

type SeatbeltApplyResult = {
    messages: LintMessage[];
    tsv: string;
    wrote: boolean;
    changed: boolean;
};

function ruleSetHas(ruleSet: SeatbeltRuleSet, ruleID: string): boolean {
    return ruleSet === 'all' || ruleSet.has(ruleID);
}

function asSeatbeltLine(row: unknown[], lineNumber: number): SeatbeltFileLine {
    if (row.length !== 3) {
        throw new Error(`Expected 3 tab-separated JSON values at line ${lineNumber}, instead have ${row.length}`);
    }
    const [filename, ruleID, maxErrors] = row;
    if (typeof filename !== 'string') {
        throw new Error(`Expected filename to be a JSON string at line ${lineNumber}`);
    }
    if (typeof ruleID !== 'string') {
        throw new Error(`Expected ruleID to be a JSON string at line ${lineNumber}`);
    }
    if (typeof maxErrors !== 'number') {
        throw new Error(`Expected maxErrors to be a JSON number at line ${lineNumber}`);
    }
    return {filename, ruleID, maxErrors};
}

function parseMaxErrors(lines: SeatbeltFileLine[]): Map<string, number> {
    const maxErrors = new Map<string, number>();
    for (const row of lines) {
        maxErrors.set(row.ruleID, row.maxErrors);
    }
    return maxErrors;
}

function toRelativePath(seatbeltFile: string, filename: string): string {
    if (!path.isAbsolute(filename)) {
        return filename;
    }
    return path.relative(path.dirname(seatbeltFile), filename);
}

function toAbsolutePath(seatbeltFile: string, filename: string): string {
    if (path.isAbsolute(filename)) {
        return filename;
    }
    return path.resolve(path.dirname(seatbeltFile), filename);
}

function parseSeatbeltTSV(text: string): {data: Map<string, SeatbeltFileData>; comments: string} {
    const parsed = TSVUtils.parse(text);
    const data = new Map<string, SeatbeltFileData>();
    for (const [index, row] of parsed.rows.entries()) {
        const line = asSeatbeltLine(row.cells, index + 1);
        let fileState = data.get(line.filename);
        if (!fileState) {
            fileState = {maxErrors: undefined, lines: []};
            data.set(line.filename, fileState);
        }
        fileState.lines.push(line);
    }
    return {data, comments: parsed.leadingComments};
}

function serializeSeatbeltTSV(data: Map<string, SeatbeltFileData>, comments: string): string {
    const rows: Array<{cells: unknown[]; comments: string}> = [];
    for (const [filename, fileState] of data) {
        if (fileState.maxErrors) {
            fileState.lines = [];
            for (const [ruleID, maxErrorCount] of fileState.maxErrors) {
                fileState.lines.push({filename, ruleID, maxErrors: maxErrorCount});
            }
        }
        for (const line of fileState.lines) {
            rows.push({cells: [line.filename, line.ruleID, line.maxErrors], comments: ''});
        }
    }
    return TSVUtils.serialize({leadingComments: comments, trailingComments: '', rows}, {sort: true});
}

function getMaxErrors(data: Map<string, SeatbeltFileData>, relativeFilename: string): Map<string, number> | undefined {
    const fileState = data.get(relativeFilename);
    if (!fileState) {
        return undefined;
    }
    fileState.maxErrors ??= parseMaxErrors(fileState.lines);
    return fileState.maxErrors;
}

function isCountableError(message: LintMessage): message is LintMessage & {ruleID: string} {
    return message.severity >= 2 && !!message.ruleID;
}

function countRuleIDs(messages: readonly LintMessage[]): Map<string, number> {
    const counts = new Map<string, number>();
    for (const message of messages) {
        if (!isCountableError(message)) {
            continue;
        }
        counts.set(message.ruleID, (counts.get(message.ruleID) ?? 0) + 1);
    }
    return counts;
}

function pluralErrors(count: number): string {
    return count === 1 ? 'error' : 'errors';
}

function compareMessages(a: LintMessage, b: LintMessage): number {
    if (a.filePath !== b.filePath) {
        return a.filePath < b.filePath ? -1 : 1;
    }
    if (a.ruleID === null) {
        return b.ruleID === null ? 0 : -1;
    }
    if (b.ruleID === null) {
        return 1;
    }
    if (a.ruleID !== b.ruleID) {
        return a.ruleID < b.ruleID ? -1 : 1;
    }
    if (a.line !== b.line) {
        return a.line - b.line;
    }
    return a.column - b.column;
}

function verboseLog(options: SeatbeltOptions, makeMessage: () => string): void {
    if (!options.verbose) {
        return;
    }
    console.error(`[${SEATBELT_NAME}]:`, makeMessage());
}

function messageOverMaxErrorCount(message: LintMessage, errorCount: number, maxErrorCount: number): LintMessage {
    return {
        ...message,
        message: `${message.message}
[${SEATBELT_NAME}]: There are ${errorCount} ${pluralErrors(errorCount)} of this type, but only ${maxErrorCount} are allowed.
Remove ${errorCount - maxErrorCount} to turn these errors into warnings.`.trim(),
    };
}

function messageOverMaxErrorCountButIncreaseAllowed(message: LintMessage, errorCount: number, maxErrorCount: number): LintMessage {
    const increaseCount = errorCount - maxErrorCount;
    return {
        ...message,
        severity: 1,
        message: `${message.message}
[${SEATBELT_NAME}]: SEATBELT_INCREASE: Temporarily allowing ${increaseCount} new ${pluralErrors(increaseCount)} of this type.`.trim(),
    };
}

function messageAtMaxErrorCount(message: LintMessage, errorCount: number): LintMessage {
    return {
        ...message,
        severity: 1,
        message: `${message.message}
[${SEATBELT_NAME}]: This file is temporarily allowed to have ${errorCount} ${pluralErrors(errorCount)} of this type.
Please tend the garden by fixing if you have the time.`.trim(),
    };
}

function messageUnderMaxErrorCount(message: LintMessage, errorCount: number, maxErrorCount: number): LintMessage {
    const fixed = maxErrorCount - errorCount;
    const fixedMessage = fixed === 1 ? 'one' : `${fixed} errors`;
    return {
        ...message,
        severity: 1,
        message: `${message.message}
[${SEATBELT_NAME}]: This file is temporarily allowed to have ${maxErrorCount} ${pluralErrors(maxErrorCount)} of this type.
Thank you for fixing ${fixedMessage}, it really helps.`.trim(),
    };
}

function messageFrozenUnderMaxErrorCountText(seatbeltFilename: string, errorCount: number, maxErrorCount: number): string {
    const fixed = maxErrorCount - errorCount;
    const fixedMessage = fixed === 1 ? 'error' : 'errors';
    return `[${SEATBELT_NAME}]: SEATBELT_FROZEN: Expected ${maxErrorCount} ${pluralErrors(maxErrorCount)}, found ${errorCount}.
If you fixed ${fixed} ${fixedMessage}, thank you, but you'll need to update the seatbelt file to match.
Try running eslint, then committing ${seatbeltFilename}.`.trim();
}

function messageFrozenUnderMaxErrorCount(message: LintMessage, seatbeltFilename: string, errorCount: number, maxErrorCount: number): LintMessage {
    return {
        ...message,
        severity: 1,
        message: `${message.message}\n${messageFrozenUnderMaxErrorCountText(seatbeltFilename, errorCount, maxErrorCount)}`,
    };
}

function transformMessages(options: SeatbeltOptions, data: Map<string, SeatbeltFileData>, filename: string, messages: LintMessage[]): LintMessage[] {
    const relativeFilename = toRelativePath(options.seatbeltFile, filename);
    const ruleToMaxErrorCount = getMaxErrors(data, relativeFilename);
    const allowIncrease = options.allowIncreaseRules === 'all' || options.allowIncreaseRules.size > 0;
    if (!ruleToMaxErrorCount && !allowIncrease) {
        return messages;
    }

    const ruleToErrorCount = countRuleIDs(messages);
    const demoteRemaining = new Map<string, number>();
    const seenVerbose = new Set<string>();

    return messages.flatMap((message) => {
        if (message.ruleID === null) {
            verboseLog(options, () => `${filename}:${message.line}:${message.column}: cannot transform message with null ruleID`);
            return message;
        }
        if (!isCountableError(message)) {
            return message;
        }

        const errorCount = ruleToErrorCount.get(message.ruleID);
        if (errorCount === undefined) {
            throw new Error(`${SEATBELT_NAME} bug: errorCount not found for rule ${message.ruleID}`);
        }

        const maxErrorCount = ruleToMaxErrorCount?.get(message.ruleID) ?? 0;
        const allowThisIncrease = ruleSetHas(options.allowIncreaseRules, message.ruleID);
        if (maxErrorCount === 0 && !allowThisIncrease) {
            return message;
        }

        if (errorCount > maxErrorCount) {
            if (allowThisIncrease) {
                if (options.quiet) {
                    return [];
                }
                return messageOverMaxErrorCountButIncreaseAllowed(message, errorCount, maxErrorCount);
            }
            if (options.verbose && !seenVerbose.has(message.ruleID)) {
                seenVerbose.add(message.ruleID);
                verboseLog(options, () => `${filename}: rule ${message.ruleID}: error: ${errorCount} ${pluralErrors(errorCount)} found > max ${maxErrorCount}`);
            }
            const remaining = demoteRemaining.get(message.ruleID) ?? maxErrorCount;
            if (remaining > 0) {
                demoteRemaining.set(message.ruleID, remaining - 1);
                if (options.quiet) {
                    return [];
                }
                return messageAtMaxErrorCount(message, maxErrorCount);
            }
            return messageOverMaxErrorCount(message, errorCount, maxErrorCount);
        }

        if (errorCount === maxErrorCount) {
            if (options.verbose && !seenVerbose.has(message.ruleID)) {
                seenVerbose.add(message.ruleID);
                verboseLog(options, () => `${filename}: rule ${message.ruleID}: ok: ${errorCount} ${pluralErrors(errorCount)} found == max ${maxErrorCount}`);
            }
            if (options.quiet) {
                return [];
            }
            return messageAtMaxErrorCount(message, errorCount);
        }

        if (options.frozen) {
            return messageFrozenUnderMaxErrorCount(message, options.seatbeltFile, errorCount, maxErrorCount);
        }
        if (options.quiet) {
            return [];
        }
        return messageUnderMaxErrorCount(message, errorCount, maxErrorCount);
    });
}

function updateMaxErrors(
    options: SeatbeltOptions,
    data: Map<string, SeatbeltFileData>,
    filename: string,
    ruleToErrorCount: ReadonlyMap<string, number>,
): {removedRules: Set<string>; changed: boolean} {
    const removedRules = new Set<string>();
    let increasedRulesCount = 0;
    let decreasedRulesCount = 0;
    const relativeFilename = toRelativePath(options.seatbeltFile, filename);
    getMaxErrors(data, relativeFilename);
    const existing = data.get(relativeFilename)?.maxErrors;
    const maxErrors = new Map(existing ?? []);

    for (const [ruleID, errorCount] of ruleToErrorCount) {
        const maxErrorCount = maxErrors.get(ruleID) ?? 0;
        if (errorCount === maxErrorCount) {
            continue;
        }
        if (errorCount < maxErrorCount || ruleSetHas(options.allowIncreaseRules, ruleID)) {
            verboseLog(options, () =>
                options.frozen
                    ? `${filename}: rule ${ruleID}: SEATBELT_FROZEN: didn't update max errors ${maxErrorCount} -> ${errorCount}`
                    : `${filename}: rule ${ruleID}: update max errors ${maxErrorCount} -> ${errorCount}`,
            );
            maxErrors.set(ruleID, errorCount);
            if (errorCount > maxErrorCount) {
                increasedRulesCount++;
            } else {
                decreasedRulesCount++;
            }
        }
    }

    if (options.verbose || options.keepRules !== 'all') {
        for (const [ruleID, maxErrorCount] of [...maxErrors]) {
            const shouldRemove = maxErrorCount === 0 || !ruleToErrorCount.has(ruleID);
            if (!shouldRemove) {
                continue;
            }
            if (ruleSetHas(options.keepRules, ruleID)) {
                verboseLog(options, () => `${filename}: rule ${ruleID}: SEATBELT_KEEP: didn't update max errors ${maxErrorCount} -> 0`);
                continue;
            }
            verboseLog(options, () =>
                options.frozen
                    ? `${filename}: rule ${ruleID}: SEATBELT_FROZEN: didn't update max errors ${maxErrorCount} -> 0`
                    : `${filename}: rule ${ruleID}: update max errors ${maxErrorCount} -> 0`,
            );
            maxErrors.delete(ruleID);
            removedRules.add(ruleID);
        }
    }

    const changed = increasedRulesCount > 0 || decreasedRulesCount > 0 || removedRules.size > 0;
    if (changed && !options.frozen) {
        const fileState = data.get(relativeFilename);
        if (fileState) {
            fileState.maxErrors = maxErrors;
        } else {
            data.set(relativeFilename, {maxErrors, lines: []});
        }
    }

    return {removedRules, changed: changed && !options.frozen};
}

function frozenRemovedRuleMessages(filename: string, seatbeltFile: string, removedRules: Set<string>, maxErrorsBefore: ReadonlyMap<string, number> | undefined): LintMessage[] {
    if (removedRules.size === 0) {
        return [];
    }
    return [...removedRules].map((ruleID) => {
        const maxErrorCount = maxErrorsBefore?.get(ruleID);
        if (maxErrorCount === undefined) {
            throw new Error(`${SEATBELT_NAME} bug: maxErrorCount not found for removed frozen rule ${ruleID}`);
        }
        return {
            filePath: filename,
            ruleID,
            column: 0,
            line: 1,
            severity: 2 as const,
            message: messageFrozenUnderMaxErrorCountText(seatbeltFile, 0, maxErrorCount),
        };
    });
}

/**
 * Sort by (filename, ruleID, line, column) so "the first N of M" demotions are
 * deterministic regardless of the linter's thread order.
 */
function canonicalizeMessages(messages: LintMessage[]): LintMessage[] {
    return [...messages].sort(compareMessages);
}

async function writeTSVAtomically(seatbeltFile: string, tsv: string): Promise<void> {
    const tempPath = `${seatbeltFile}.${process.pid}.${Date.now()}.tmp`;
    await Bun.write(tempPath, tsv);
    try {
        await rename(tempPath, seatbeltFile);
    } catch (error) {
        if (error instanceof Error && 'code' in error && error.code === 'EXDEV') {
            await Bun.write(seatbeltFile, tsv);
            await file(tempPath)
                .unlink()
                .catch(() => undefined);
            return;
        }
        throw error;
    }
}

class Seatbelt extends Processor {
    readonly name = 'seatbelt';

    constructor(private readonly options: SeatbeltOptions) {
        super();
    }

    async process(messages: LintMessage[], context: ProcessorContext): Promise<LintMessage[]> {
        const result = await applySeatbelt(messages, this.options, context.lintedFiles);
        return result.messages;
    }
}

async function applySeatbelt(messages: LintMessage[], options: SeatbeltOptions, lintedFilenames: Iterable<string>): Promise<SeatbeltApplyResult> {
    if (options.disable) {
        const existing = await file(options.seatbeltFile)
            .text()
            .catch(() => DEFAULT_FILE_HEADER);
        return {messages, tsv: existing.endsWith('\n') || existing.length === 0 ? existing : `${existing}\n`, wrote: false, changed: false};
    }

    const existingText = await file(options.seatbeltFile)
        .text()
        .catch(() => '');
    const {data, comments} = existingText ? parseSeatbeltTSV(existingText) : {data: new Map<string, SeatbeltFileData>(), comments: DEFAULT_FILE_HEADER};

    const canonical = canonicalizeMessages(messages);
    const byFile = new Map<string, LintMessage[]>();
    for (const message of canonical) {
        const list = byFile.get(message.filePath) ?? [];
        list.push(message);
        byFile.set(message.filePath, list);
    }

    for (const filename of lintedFilenames) {
        if (!byFile.has(filename)) {
            byFile.set(filename, []);
        }
    }

    const transformed: LintMessage[] = [];
    let anyChanged = false;

    for (const [filename, fileMessages] of byFile) {
        const relativeFilename = toRelativePath(options.seatbeltFile, filename);
        const maxErrorsBefore = getMaxErrors(data, relativeFilename);
        const maxErrorsBeforeCopy = maxErrorsBefore ? new Map(maxErrorsBefore) : undefined;
        const after = transformMessages(options, data, filename, fileMessages);
        const ruleToErrorCount = countRuleIDs(fileMessages);
        const {removedRules, changed} = updateMaxErrors(options, data, filename, ruleToErrorCount);
        anyChanged ||= changed;
        if (options.frozen && removedRules.size > 0) {
            transformed.push(...after, ...frozenRemovedRuleMessages(filename, options.seatbeltFile, removedRules, maxErrorsBeforeCopy));
        } else {
            transformed.push(...after);
        }
    }

    // Dead-row prune: drop baseline rows whose source file no longer exists.
    // Native fix for justjake/eslint-seatbelt#15 — previously a post-hoc pass in scripts/lint.ts.
    let pruned = 0;
    for (const relativeFilename of [...data.keys()]) {
        const absolute = toAbsolutePath(options.seatbeltFile, relativeFilename);
        if (await file(absolute).exists()) {
            continue;
        }
        if (options.frozen) {
            verboseLog(options, () => `${relativeFilename}: SEATBELT_FROZEN: didn't remove max errors`);
            continue;
        }
        verboseLog(options, () => `${relativeFilename}: remove max errors`);
        data.delete(relativeFilename);
        anyChanged = true;
        pruned++;
    }
    const tsv = serializeSeatbeltTSV(data, comments || DEFAULT_FILE_HEADER);
    const shouldWrite = anyChanged && !options.frozen && !options.readOnly;
    if (pruned > 0) {
        const verb = shouldWrite ? 'removed' : 'would remove';
        console.log(`eslint-seatbelt: ${verb} ${pruned} baseline row(s) for deleted files`);
    }
    if (shouldWrite) {
        await writeTSVAtomically(options.seatbeltFile, tsv);
    }

    return {messages: canonicalizeMessages(transformed), tsv, wrote: shouldWrite, changed: anyChanged};
}

/**
 * Mirrors eslint-seatbelt's boolean env parsing: unset/empty is unset, "0"/"false"/"no"
 * (case-insensitive) is false, anything else is true.
 */
function readBooleanEnvVar(value: string | undefined): boolean | undefined {
    if (value === undefined || value === '') {
        return undefined;
    }
    return !['0', 'false', 'no'].includes(value.toLowerCase());
}

/**
 * Mirrors eslint-seatbelt's rule-set env parsing: unset is unset, empty is [],
 * "all"/"1"/"true" is "all", otherwise a whitespace-or-comma-separated list.
 */
function parseRuleSetEnvVar(value: string | undefined): SeatbeltRuleSet | undefined {
    if (value === undefined) {
        return undefined;
    }
    if (!value) {
        return new Set();
    }
    const lower = value.toLowerCase();
    if (lower === 'all' || lower === '1' || lower === 'true') {
        return 'all';
    }
    return new Set(value.split(/[\s,]+/g).filter(Boolean));
}

/**
 * Seatbelt env/config:
 * - `SEATBELT_FROZEN` defaults to false (the wrapper forces `0` so `CI=true` does not freeze).
 * - `readOnly` defaults to `!CI`; `SEATBELT_INCREASE` forces writes.
 */
function resolveSeatbeltOptions(projectRoot: string, env: NodeJS.ProcessEnv = process.env): SeatbeltOptions {
    const allowIncreaseRules = parseRuleSetEnvVar(env.SEATBELT_INCREASE) ?? new Set();
    const isIncreaseSet = allowIncreaseRules === 'all' || allowIncreaseRules.size > 0;
    return {
        seatbeltFile: `${projectRoot}/${SEATBELT_TSV_RELATIVE}`,
        projectRoot,
        disable: readBooleanEnvVar(env.SEATBELT_DISABLE) ?? false,
        frozen: readBooleanEnvVar(env.SEATBELT_FROZEN) ?? false,
        readOnly: isIncreaseSet ? false : (readBooleanEnvVar(env.SEATBELT_READ_ONLY) ?? !env.CI),
        allowIncreaseRules,
        keepRules: parseRuleSetEnvVar(env.SEATBELT_KEEP) ?? new Set(),
        quiet: readBooleanEnvVar(env.SEATBELT_QUIET) ?? false,
        verbose: readBooleanEnvVar(env.SEATBELT_VERBOSE) ?? false,
    };
}

export default Seatbelt;
export {
    applySeatbelt,
    canonicalizeMessages,
    compareMessages,
    countRuleIDs,
    parseSeatbeltTSV,
    resolveSeatbeltOptions,
    serializeSeatbeltTSV,
    toRelativePath,
    transformMessages,
    updateMaxErrors,
};
export type {SeatbeltApplyResult, SeatbeltFileData};
