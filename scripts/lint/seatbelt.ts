import {file} from 'bun';
import {rename} from 'node:fs/promises';
import path from 'node:path';

import type {LintMessage, SeatbeltOptions, SeatbeltRuleSet} from './types';

const SEATBELT_NAME = 'eslint-seatbelt';
const COMMENT_LINE_REGEX = /^\s*#/;
const NON_EMPTY_LINE_REGEX = /\S+/;
const DEFAULT_FILE_HEADER = `# ${SEATBELT_NAME} temporarily allowed errors
# docs: https://github.com/justjake/${SEATBELT_NAME}#readme`;

type SeatbeltFileLine = {
    encoded?: string;
    filename: string;
    ruleId: string;
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

function ruleSetHas(ruleSet: SeatbeltRuleSet, ruleId: string): boolean {
    return ruleSet === 'all' || ruleSet.has(ruleId);
}

function encodeLine(line: SeatbeltFileLine): string {
    return `${JSON.stringify(line.filename)}\t${JSON.stringify(line.ruleId)}\t${line.maxErrors}\n`;
}

function parseJsonString(value: string | undefined, column: string, index: number): string {
    if (value === undefined) {
        throw new Error(`Missing ${column} at line ${index + 1}`);
    }
    const parsed: unknown = JSON.parse(value);
    if (typeof parsed !== 'string') {
        throw new Error(`Expected ${column} to be a JSON string at line ${index + 1}`);
    }
    return parsed;
}

function parseJsonNumber(value: string | undefined, column: string, index: number): number {
    if (value === undefined) {
        throw new Error(`Missing ${column} at line ${index + 1}`);
    }
    const parsed: unknown = JSON.parse(value);
    if (typeof parsed !== 'number') {
        throw new Error(`Expected ${column} to be a JSON number at line ${index + 1}`);
    }
    return parsed;
}

function decodeLine(line: string, index: number): SeatbeltFileLine {
    const lineParts = line.split('\t');
    if (lineParts.length !== 3) {
        throw new Error(`Expected 3 tab-separated JSON strings at line ${index + 1}, instead have ${lineParts.length}`);
    }
    return {
        encoded: line,
        filename: parseJsonString(lineParts.at(0), 'filename', index),
        ruleId: parseJsonString(lineParts.at(1), 'ruleId', index),
        maxErrors: parseJsonNumber(lineParts.at(2), 'maxErrors', index),
    };
}

function parseMaxErrors(lines: SeatbeltFileLine[]): Map<string, number> {
    const maxErrors = new Map<string, number>();
    for (const row of lines) {
        maxErrors.set(row.ruleId, row.maxErrors);
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

function parseSeatbeltTsv(text: string): {data: Map<string, SeatbeltFileData>; comments: string} {
    const data = new Map<string, SeatbeltFileData>();
    const split = text.split(/(?<=\n)/);
    const lines = split.filter((line) => NON_EMPTY_LINE_REGEX.test(line) && !COMMENT_LINE_REGEX.test(line)).map(decodeLine);
    const comments = split.filter((line) => COMMENT_LINE_REGEX.test(line)).join('');
    for (const line of lines) {
        let fileState = data.get(line.filename);
        if (!fileState) {
            fileState = {maxErrors: undefined, lines: []};
            data.set(line.filename, fileState);
        }
        fileState.lines.push(line);
    }
    return {data, comments: comments.trim()};
}

function serializeSeatbeltTsv(data: Map<string, SeatbeltFileData>, comments: string): string {
    const lines: string[] = [];
    for (const [filename, fileState] of data) {
        if (fileState.maxErrors) {
            fileState.lines = [];
            for (const [ruleId, maxErrorCount] of fileState.maxErrors) {
                fileState.lines.push({filename, ruleId, maxErrors: maxErrorCount});
            }
            fileState.lines.sort((a, b) => a.ruleId.localeCompare(b.ruleId));
        }
        for (const line of fileState.lines) {
            line.encoded ??= encodeLine(line);
            lines.push(line.encoded);
        }
    }
    lines.sort();
    return comments ? `${comments}\n\n${lines.join('')}` : lines.join('');
}

function getMaxErrors(data: Map<string, SeatbeltFileData>, relativeFilename: string): Map<string, number> | undefined {
    const fileState = data.get(relativeFilename);
    if (!fileState) {
        return undefined;
    }
    fileState.maxErrors ??= parseMaxErrors(fileState.lines);
    return fileState.maxErrors;
}

function isCountableError(message: LintMessage): message is LintMessage & {ruleId: string} {
    return message.severity >= 2 && !!message.ruleId;
}

function countRuleIds(messages: readonly LintMessage[]): Map<string, number> {
    const counts = new Map<string, number>();
    for (const message of messages) {
        if (!isCountableError(message)) {
            continue;
        }
        counts.set(message.ruleId, (counts.get(message.ruleId) ?? 0) + 1);
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
    const aRule = a.ruleId ?? '';
    const bRule = b.ruleId ?? '';
    if (aRule !== bRule) {
        return aRule < bRule ? -1 : 1;
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

    const ruleToErrorCount = countRuleIds(messages);
    const demoteRemaining = new Map<string, number>();
    const seenVerbose = new Set<string>();

    return messages.flatMap((message) => {
        if (message.ruleId === null) {
            verboseLog(options, () => `${filename}:${message.line}:${message.column}: cannot transform message with null ruleId`);
            return message;
        }
        if (!isCountableError(message)) {
            return message;
        }

        const errorCount = ruleToErrorCount.get(message.ruleId);
        if (errorCount === undefined) {
            throw new Error(`${SEATBELT_NAME} bug: errorCount not found for rule ${message.ruleId}`);
        }

        const maxErrorCount = ruleToMaxErrorCount?.get(message.ruleId) ?? 0;
        const allowThisIncrease = ruleSetHas(options.allowIncreaseRules, message.ruleId);
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
            if (options.verbose && !seenVerbose.has(message.ruleId)) {
                seenVerbose.add(message.ruleId);
                verboseLog(options, () => `${filename}: rule ${message.ruleId}: error: ${errorCount} ${pluralErrors(errorCount)} found > max ${maxErrorCount}`);
            }
            const remaining = demoteRemaining.get(message.ruleId) ?? maxErrorCount;
            if (remaining > 0) {
                demoteRemaining.set(message.ruleId, remaining - 1);
                if (options.quiet) {
                    return [];
                }
                return messageAtMaxErrorCount(message, maxErrorCount);
            }
            return messageOverMaxErrorCount(message, errorCount, maxErrorCount);
        }

        if (errorCount === maxErrorCount) {
            if (options.verbose && !seenVerbose.has(message.ruleId)) {
                seenVerbose.add(message.ruleId);
                verboseLog(options, () => `${filename}: rule ${message.ruleId}: ok: ${errorCount} ${pluralErrors(errorCount)} found == max ${maxErrorCount}`);
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

    for (const [ruleId, errorCount] of ruleToErrorCount) {
        const maxErrorCount = maxErrors.get(ruleId) ?? 0;
        if (errorCount === maxErrorCount) {
            continue;
        }
        if (errorCount < maxErrorCount || ruleSetHas(options.allowIncreaseRules, ruleId)) {
            verboseLog(options, () =>
                options.frozen
                    ? `${filename}: rule ${ruleId}: SEATBELT_FROZEN: didn't update max errors ${maxErrorCount} -> ${errorCount}`
                    : `${filename}: rule ${ruleId}: update max errors ${maxErrorCount} -> ${errorCount}`,
            );
            maxErrors.set(ruleId, errorCount);
            if (errorCount > maxErrorCount) {
                increasedRulesCount++;
            } else {
                decreasedRulesCount++;
            }
        }
    }

    if (options.verbose || options.keepRules !== 'all') {
        for (const [ruleId, maxErrorCount] of [...maxErrors]) {
            const shouldRemove = maxErrorCount === 0 || !ruleToErrorCount.has(ruleId);
            if (!shouldRemove) {
                continue;
            }
            if (ruleSetHas(options.keepRules, ruleId)) {
                verboseLog(options, () => `${filename}: rule ${ruleId}: SEATBELT_KEEP: didn't update max errors ${maxErrorCount} -> 0`);
                continue;
            }
            verboseLog(options, () =>
                options.frozen
                    ? `${filename}: rule ${ruleId}: SEATBELT_FROZEN: didn't update max errors ${maxErrorCount} -> 0`
                    : `${filename}: rule ${ruleId}: update max errors ${maxErrorCount} -> 0`,
            );
            maxErrors.delete(ruleId);
            removedRules.add(ruleId);
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

function frozenRemovedRuleMessages(filename: string, removedRules: Set<string>, maxErrorsBefore: ReadonlyMap<string, number> | undefined): LintMessage[] {
    if (removedRules.size === 0) {
        return [];
    }
    return [...removedRules].map((ruleId) => {
        const maxErrorCount = maxErrorsBefore?.get(ruleId);
        if (maxErrorCount === undefined) {
            throw new Error(`${SEATBELT_NAME} bug: maxErrorCount not found for removed frozen rule ${ruleId}`);
        }
        return {
            filePath: filename,
            ruleId,
            column: 0,
            line: 1,
            severity: 2 as const,
            message: messageFrozenUnderMaxErrorCountText(filename, 0, maxErrorCount),
        };
    });
}

/**
 * Sort by (filename, ruleId, line, column) so "the first N of M" demotions are
 * deterministic regardless of the linter's thread order.
 */
function canonicalizeMessages(messages: LintMessage[]): LintMessage[] {
    return [...messages].sort(compareMessages);
}

async function writeTsvAtomically(seatbeltFile: string, tsv: string): Promise<void> {
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
    const {data, comments} = existingText ? parseSeatbeltTsv(existingText) : {data: new Map<string, SeatbeltFileData>(), comments: DEFAULT_FILE_HEADER};

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
        const ruleToErrorCount = countRuleIds(fileMessages);
        const {removedRules, changed} = updateMaxErrors(options, data, filename, ruleToErrorCount);
        anyChanged ||= changed;
        if (options.frozen && removedRules.size > 0) {
            transformed.push(...after, ...frozenRemovedRuleMessages(filename, removedRules, maxErrorsBeforeCopy));
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
    if (pruned > 0) {
        console.log(`eslint-seatbelt: removed ${pruned} baseline row(s) for deleted files`);
    }

    const tsv = serializeSeatbeltTsv(data, comments || DEFAULT_FILE_HEADER);
    const shouldWrite = anyChanged && !options.frozen && !options.readOnly;
    if (shouldWrite) {
        await writeTsvAtomically(options.seatbeltFile, tsv);
    }

    return {messages: canonicalizeMessages(transformed), tsv, wrote: shouldWrite, changed: anyChanged};
}

export {applySeatbelt, canonicalizeMessages, compareMessages, countRuleIds, parseSeatbeltTsv, serializeSeatbeltTsv, toRelativePath, transformMessages, updateMaxErrors};
export type {SeatbeltApplyResult, SeatbeltFileData};
