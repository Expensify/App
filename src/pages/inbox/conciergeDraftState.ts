import Parser from '@libs/Parser';
import type {ConciergeDraftEvent} from '@libs/Pusher/types';
import {getParsedComment} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import type {ReportAction} from '@src/types/onyx';

type ConciergeDraft = {
    /** Currently rendered markdown. Pusher pacing may intentionally lag this behind the latest server snapshot. */
    bodyMarkdown?: string;
    /** Current server markdown snapshot held by the Pusher pacer so remounts can resume revealing banked text. */
    pusherTargetBodyMarkdown?: string;
    /** Server event sequence for the current Pusher target snapshot. */
    pusherTargetSequence?: number;
    /** Newer server markdown snapshots queued behind the current Pusher target. */
    pusherQueuedTargetEvents?: ConciergeDraftEvent[];
    /** Completion event held while the Pusher pacer is still revealing banked text. */
    pusherPendingCompletionEvent?: ConciergeDraftEvent;
    /** Number of UTF-16 source units consumed from the current Pusher target. */
    pusherVisibleSourceOffset?: number;
    /** Source markdown prefix consumed from the current Pusher target, used to detect server-side corrections. */
    pusherVisibleSourceMarkdown?: string;
    reportAction: ReportAction;
    sequence: number;
    status: ConciergeDraftEvent['status'];
    streamSessionID: string;
    terminalReason?: string;
};

type BuildConciergeDraftReportActionParams = {
    actorAccountID?: number;
    bodyMarkdown?: string;
    created: string;
    finalRenderedHTML?: string;
    reportActionID: string;
    reportID: string;
};

type TextRange = {
    start: number;
    end: number;
};

type MarkdownConstruct = {
    closingDelimiter: string;
    contentEnd: number;
    contentStart: number;
    end: number;
    start: number;
    suffix?: string;
};

type VisibleConciergeDraftMarkdown = {
    bodyMarkdown: string;
    sourceMarkdown: string;
    sourceOffset: number;
};

const CODE_BLOCK_DELIMITER = '```';
const INLINE_CODE_DELIMITER = '`';
const BOLD_DELIMITER = '**';
const STRIKETHROUGH_DELIMITER = '~~';

function isInAnyRange(position: number, ranges: TextRange[]): boolean {
    return ranges.some((range) => position >= range.start && position < range.end);
}

function isEscaped(text: string, index: number): boolean {
    let slashCount = 0;
    let pos = index - 1;

    while (pos >= 0 && text[pos] === '\\') {
        slashCount++;
        pos--;
    }

    return slashCount % 2 !== 0;
}

function getCodeRanges(text: string): {ranges: TextRange[]; unclosedCodeBlockStart: number | null} {
    const ranges: TextRange[] = [];
    let unclosedCodeBlockStart: number | null = null;

    for (let pos = 0; pos <= text.length - CODE_BLOCK_DELIMITER.length; pos++) {
        if (!text.startsWith(CODE_BLOCK_DELIMITER, pos) || isEscaped(text, pos)) {
            continue;
        }

        if (unclosedCodeBlockStart === null) {
            unclosedCodeBlockStart = pos;
        } else {
            ranges.push({start: unclosedCodeBlockStart, end: pos + CODE_BLOCK_DELIMITER.length});
            unclosedCodeBlockStart = null;
        }
        pos += CODE_BLOCK_DELIMITER.length - 1;
    }

    let lineStart = 0;

    while (lineStart <= text.length) {
        const nextNewline = text.indexOf('\n', lineStart);
        const lineEnd = nextNewline === -1 ? text.length : nextNewline;
        let openingDelimiterIndex: number | null = null;

        for (let pos = lineStart; pos < lineEnd; pos++) {
            if (text[pos] !== INLINE_CODE_DELIMITER || isEscaped(text, pos) || isInAnyRange(pos, ranges)) {
                continue;
            }

            if (openingDelimiterIndex === null) {
                openingDelimiterIndex = pos;
            } else {
                ranges.push({start: openingDelimiterIndex, end: pos + INLINE_CODE_DELIMITER.length});
                openingDelimiterIndex = null;
            }
        }

        if (nextNewline === -1) {
            break;
        }
        lineStart = nextNewline + 1;
    }

    return {ranges, unclosedCodeBlockStart};
}

function getCodePointEnd(text: string, start: number): number {
    if (start >= text.length) {
        return text.length;
    }

    const codePoint = text.codePointAt(start);
    return Math.min(text.length, start + (codePoint && codePoint > 0xffff ? 2 : 1));
}

function findCodeBlockConstructAtOffset(text: string, offset: number): MarkdownConstruct | null {
    for (let pos = 0; pos <= text.length - CODE_BLOCK_DELIMITER.length; pos++) {
        if (!text.startsWith(CODE_BLOCK_DELIMITER, pos) || isEscaped(text, pos)) {
            continue;
        }

        const closingDelimiterIndex = text.indexOf(CODE_BLOCK_DELIMITER, pos + CODE_BLOCK_DELIMITER.length);
        if (closingDelimiterIndex === -1) {
            return null;
        }

        const end = closingDelimiterIndex + CODE_BLOCK_DELIMITER.length;
        if (offset >= pos && offset < end) {
            return {
                closingDelimiter: CODE_BLOCK_DELIMITER,
                contentEnd: closingDelimiterIndex,
                contentStart: pos + CODE_BLOCK_DELIMITER.length,
                end,
                start: pos,
            };
        }

        pos = end - 1;
    }

    return null;
}

function getCompleteCodeBlockRanges(text: string): TextRange[] {
    const ranges: TextRange[] = [];

    for (let pos = 0; pos <= text.length - CODE_BLOCK_DELIMITER.length; pos++) {
        if (!text.startsWith(CODE_BLOCK_DELIMITER, pos) || isEscaped(text, pos)) {
            continue;
        }

        const closingDelimiterIndex = text.indexOf(CODE_BLOCK_DELIMITER, pos + CODE_BLOCK_DELIMITER.length);
        if (closingDelimiterIndex === -1) {
            return ranges;
        }

        const end = closingDelimiterIndex + CODE_BLOCK_DELIMITER.length;
        ranges.push({start: pos, end});
        pos = end - 1;
    }

    return ranges;
}

function findInlineCodeConstructAtOffset(text: string, offset: number, ignoredRanges: TextRange[]): MarkdownConstruct | null {
    let lineStart = 0;

    while (lineStart <= text.length) {
        const nextNewline = text.indexOf('\n', lineStart);
        const lineEnd = nextNewline === -1 ? text.length : nextNewline;
        let openingDelimiterIndex: number | null = null;

        for (let pos = lineStart; pos < lineEnd; pos++) {
            if (text[pos] !== INLINE_CODE_DELIMITER || text.startsWith(CODE_BLOCK_DELIMITER, pos) || isEscaped(text, pos) || isInAnyRange(pos, ignoredRanges)) {
                continue;
            }

            if (openingDelimiterIndex === null) {
                openingDelimiterIndex = pos;
                continue;
            }

            const end = pos + INLINE_CODE_DELIMITER.length;
            if (offset >= openingDelimiterIndex && offset < end) {
                return {
                    closingDelimiter: INLINE_CODE_DELIMITER,
                    contentEnd: pos,
                    contentStart: openingDelimiterIndex + INLINE_CODE_DELIMITER.length,
                    end,
                    start: openingDelimiterIndex,
                };
            }

            openingDelimiterIndex = null;
        }

        if (nextNewline === -1) {
            break;
        }
        lineStart = nextNewline + 1;
    }

    return null;
}

function findLinkConstructAtOffset(text: string, offset: number, ignoredRanges: TextRange[]): MarkdownConstruct | null {
    for (let pos = 0; pos < text.length; pos++) {
        if (text[pos] !== '[' || isEscaped(text, pos) || isInAnyRange(pos, ignoredRanges)) {
            continue;
        }

        const closeBracketIndex = text.indexOf(']', pos + 1);
        if (closeBracketIndex === -1 || text[closeBracketIndex + 1] !== '(') {
            continue;
        }

        const closeParenIndex = text.indexOf(')', closeBracketIndex + 2);
        if (closeParenIndex === -1) {
            continue;
        }

        const start = pos > 0 && text[pos - 1] === '!' && !isEscaped(text, pos - 1) ? pos - 1 : pos;
        const end = closeParenIndex + 1;
        if (offset >= start && offset < end) {
            return {
                closingDelimiter: '',
                contentEnd: closeBracketIndex,
                contentStart: pos + 1,
                end,
                start,
                suffix: text.slice(closeBracketIndex, end),
            };
        }

        pos = end - 1;
    }

    return null;
}

function findDelimitedConstructAtOffset(text: string, offset: number, delimiter: string, ignoredRanges: TextRange[]): MarkdownConstruct | null {
    let openingDelimiterIndex: number | null = null;

    for (let pos = 0; pos <= text.length - delimiter.length; pos++) {
        if (!text.startsWith(delimiter, pos) || isEscaped(text, pos) || isInAnyRange(pos, ignoredRanges)) {
            continue;
        }

        if (openingDelimiterIndex === null) {
            openingDelimiterIndex = pos;
            pos += delimiter.length - 1;
            continue;
        }

        const end = pos + delimiter.length;
        if (offset >= openingDelimiterIndex && offset < end) {
            return {
                closingDelimiter: delimiter,
                contentEnd: pos,
                contentStart: openingDelimiterIndex + delimiter.length,
                end,
                start: openingDelimiterIndex,
            };
        }

        openingDelimiterIndex = null;
        pos += delimiter.length - 1;
    }

    return null;
}

function findCompleteMarkdownConstructAtOffset(text: string, offset: number): MarkdownConstruct | null {
    const codeBlockConstruct = findCodeBlockConstructAtOffset(text, offset);
    if (codeBlockConstruct) {
        return codeBlockConstruct;
    }

    const completeCodeBlockRanges = getCompleteCodeBlockRanges(text);
    const inlineCodeConstruct = findInlineCodeConstructAtOffset(text, offset, completeCodeBlockRanges);
    if (inlineCodeConstruct) {
        return inlineCodeConstruct;
    }

    const codeRanges = getCodeRanges(text).ranges;
    return (
        findLinkConstructAtOffset(text, offset, codeRanges) ??
        findDelimitedConstructAtOffset(text, offset, BOLD_DELIMITER, codeRanges) ??
        findDelimitedConstructAtOffset(text, offset, STRIKETHROUGH_DELIMITER, codeRanges)
    );
}

function getNextVisibleSourceOffset(targetBodyMarkdown: string, currentSourceOffset: number): number {
    if (currentSourceOffset >= targetBodyMarkdown.length) {
        return currentSourceOffset;
    }

    const construct = findCompleteMarkdownConstructAtOffset(targetBodyMarkdown, currentSourceOffset);
    if (!construct) {
        return getCodePointEnd(targetBodyMarkdown, currentSourceOffset);
    }

    if (currentSourceOffset < construct.contentStart) {
        return construct.contentStart >= construct.contentEnd ? construct.end : getCodePointEnd(targetBodyMarkdown, construct.contentStart);
    }

    if (currentSourceOffset < construct.contentEnd) {
        const nextSourceOffset = getCodePointEnd(targetBodyMarkdown, currentSourceOffset);
        return nextSourceOffset >= construct.contentEnd ? construct.end : nextSourceOffset;
    }

    return construct.end;
}

function buildVisibleMarkdownAtSourceOffset(targetBodyMarkdown: string, sourceOffset: number): string {
    if (sourceOffset >= targetBodyMarkdown.length) {
        return targetBodyMarkdown;
    }

    const construct = findCompleteMarkdownConstructAtOffset(targetBodyMarkdown, sourceOffset);
    if (!construct) {
        return targetBodyMarkdown.slice(0, sourceOffset);
    }

    if (sourceOffset >= construct.contentEnd) {
        return targetBodyMarkdown.slice(0, construct.end);
    }

    const visibleContentEnd = Math.max(construct.contentStart, sourceOffset);
    const suffix = construct.suffix ?? construct.closingDelimiter;
    return `${targetBodyMarkdown.slice(0, visibleContentEnd)}${suffix}`;
}

function stripUnpairedLastLineDelimiter(text: string, delimiter: string, ignoredRanges: TextRange[] = []): string {
    const lastNewline = text.lastIndexOf('\n');
    const lastLineStart = lastNewline + 1;
    const delimiterIndexes: number[] = [];

    for (let pos = lastLineStart; pos <= text.length - delimiter.length; pos++) {
        if (!text.startsWith(delimiter, pos) || isEscaped(text, pos) || isInAnyRange(pos, ignoredRanges)) {
            continue;
        }

        delimiterIndexes.push(pos);
        pos += delimiter.length - 1;
    }

    if (delimiterIndexes.length > 0 && delimiterIndexes.length % 2 !== 0) {
        return text.substring(0, delimiterIndexes.at(-1));
    }

    return text;
}

function getUnpairedLastLineDelimiterIndex(text: string, delimiter: string, ignoredRanges: TextRange[] = []): number | null {
    const lastNewline = text.lastIndexOf('\n');
    const lastLineStart = lastNewline + 1;
    const delimiterIndexes: number[] = [];

    for (let pos = lastLineStart; pos <= text.length - delimiter.length; pos++) {
        if (!text.startsWith(delimiter, pos) || isEscaped(text, pos) || isInAnyRange(pos, ignoredRanges)) {
            continue;
        }

        delimiterIndexes.push(pos);
        pos += delimiter.length - 1;
    }

    if (delimiterIndexes.length > 0 && delimiterIndexes.length % 2 !== 0) {
        return delimiterIndexes.at(-1) ?? null;
    }

    return null;
}

function getIncompleteLinkStartIndex(text: string, ignoredRanges: TextRange[]): number | null {
    for (let openBracketIndex = text.length - 1; openBracketIndex >= 0; openBracketIndex--) {
        if (text[openBracketIndex] !== '[' || isEscaped(text, openBracketIndex) || isInAnyRange(openBracketIndex, ignoredRanges)) {
            continue;
        }

        const closeBracketIndex = text.indexOf(']', openBracketIndex + 1);
        const stripFrom = openBracketIndex > 0 && text[openBracketIndex - 1] === '!' && !isEscaped(text, openBracketIndex - 1) ? openBracketIndex - 1 : openBracketIndex;

        if (closeBracketIndex === -1 || (text[closeBracketIndex + 1] === '(' && text.indexOf(')', closeBracketIndex + 2) === -1)) {
            return stripFrom;
        }
        break;
    }

    return null;
}

function getStreamableMarkdownSourceLength(markdown: string): number {
    if (!markdown) {
        return markdown.length;
    }

    const initialCodeState = getCodeRanges(markdown);
    let codeRanges = initialCodeState.ranges;
    let streamableLength = initialCodeState.unclosedCodeBlockStart ?? markdown.length;
    let streamableMarkdown = markdown.slice(0, streamableLength);

    codeRanges = codeRanges.filter((range) => range.end <= streamableLength);
    const incompleteInlineCodeStart = getUnpairedLastLineDelimiterIndex(streamableMarkdown, INLINE_CODE_DELIMITER, codeRanges);
    if (incompleteInlineCodeStart !== null) {
        streamableLength = incompleteInlineCodeStart;
        streamableMarkdown = markdown.slice(0, streamableLength);
    }

    codeRanges = getCodeRanges(streamableMarkdown).ranges;
    const incompleteLinkStart = getIncompleteLinkStartIndex(streamableMarkdown, codeRanges);
    if (incompleteLinkStart !== null) {
        streamableLength = incompleteLinkStart;
        streamableMarkdown = markdown.slice(0, streamableLength);
    }

    codeRanges = getCodeRanges(streamableMarkdown).ranges;
    const incompleteBoldStart = getUnpairedLastLineDelimiterIndex(streamableMarkdown, BOLD_DELIMITER, codeRanges);
    if (incompleteBoldStart !== null) {
        streamableLength = incompleteBoldStart;
        streamableMarkdown = markdown.slice(0, streamableLength);
    }

    codeRanges = getCodeRanges(streamableMarkdown).ranges;
    const incompleteStrikethroughStart = getUnpairedLastLineDelimiterIndex(streamableMarkdown, STRIKETHROUGH_DELIMITER, codeRanges);
    if (incompleteStrikethroughStart !== null) {
        streamableLength = incompleteStrikethroughStart;
    }

    return streamableLength;
}

function normalizeDelimiterForExpensiMark(text: string, delimiter: string, replacement: string, ignoredRanges: TextRange[] = []): string {
    let result = '';

    for (let pos = 0; pos < text.length; pos++) {
        if (text.startsWith(delimiter, pos) && !isEscaped(text, pos) && !isInAnyRange(pos, ignoredRanges)) {
            result += replacement;
            pos += delimiter.length - 1;
            continue;
        }

        result += text[pos];
    }

    return result;
}

/**
 * Strips incomplete markdown constructs from the tail of a streaming markdown
 * string so that ExpensiMark doesn't render raw syntax for half-finished
 * links, bold, strikethrough, or code blocks. Completed double-delimiter
 * emphasis is normalized to ExpensiMark's single-delimiter syntax so the text
 * stays styled without leaking raw delimiters while the server-rendered HTML is
 * still pending.
 */
function stripIncompleteMarkdown(markdown: string): string {
    if (!markdown) {
        return markdown;
    }

    const initialCodeState = getCodeRanges(markdown);
    let codeRanges = initialCodeState.ranges;
    let result = initialCodeState.unclosedCodeBlockStart === null ? markdown : markdown.substring(0, initialCodeState.unclosedCodeBlockStart);

    // Strip incomplete inline code before looking for other markdown so code
    // contents don't look like unfinished links or emphasis.
    codeRanges = codeRanges.filter((range) => range.end <= result.length);
    result = stripUnpairedLastLineDelimiter(result, INLINE_CODE_DELIMITER, codeRanges);

    codeRanges = getCodeRanges(result).ranges;
    for (let openBracketIndex = result.length - 1; openBracketIndex >= 0; openBracketIndex--) {
        if (result[openBracketIndex] !== '[' || isEscaped(result, openBracketIndex) || isInAnyRange(openBracketIndex, codeRanges)) {
            continue;
        }

        const closeBracketIndex = result.indexOf(']', openBracketIndex + 1);
        const stripFrom = openBracketIndex > 0 && result[openBracketIndex - 1] === '!' && !isEscaped(result, openBracketIndex - 1) ? openBracketIndex - 1 : openBracketIndex;

        if (closeBracketIndex === -1) {
            result = result.substring(0, stripFrom);
        } else if (result[closeBracketIndex + 1] === '(' && result.indexOf(')', closeBracketIndex + 2) === -1) {
            result = result.substring(0, stripFrom);
        }
        break;
    }

    codeRanges = getCodeRanges(result).ranges;
    result = stripUnpairedLastLineDelimiter(result, BOLD_DELIMITER, codeRanges);
    codeRanges = getCodeRanges(result).ranges;
    result = normalizeDelimiterForExpensiMark(result, BOLD_DELIMITER, '*', codeRanges);

    codeRanges = getCodeRanges(result).ranges;
    result = stripUnpairedLastLineDelimiter(result, STRIKETHROUGH_DELIMITER, codeRanges);
    codeRanges = getCodeRanges(result).ranges;
    result = normalizeDelimiterForExpensiMark(result, STRIKETHROUGH_DELIMITER, '~', codeRanges);

    return result;
}

function buildConciergeDraftReportAction({actorAccountID, bodyMarkdown, created, finalRenderedHTML, reportActionID, reportID}: BuildConciergeDraftReportActionParams): ReportAction | null {
    const html = finalRenderedHTML ?? (bodyMarkdown ? getParsedComment(stripIncompleteMarkdown(bodyMarkdown), {reportID}) : '');

    if (!html) {
        return null;
    }

    // Default to Concierge so existing call sites that don't pass an actor stay byte-identical.
    const resolvedActorAccountID = actorAccountID ?? CONST.ACCOUNT_ID.CONCIERGE;

    return {
        reportActionID,
        reportID,
        actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
        actorAccountID: resolvedActorAccountID,
        person: [{style: 'strong', text: CONST.CONCIERGE_DISPLAY_NAME, type: 'TEXT'}],
        created,
        message: [{type: CONST.REPORT.MESSAGE.TYPE.COMMENT, html, text: Parser.htmlToText(html)}],
        originalMessage: {html, whisperedTo: []},
        shouldShow: true,
    } as ReportAction;
}

function getNextVisibleConciergeDraftMarkdown(
    currentBodyMarkdown: string,
    targetBodyMarkdown: string,
    currentSourceOffset = currentBodyMarkdown.length,
    currentSourceMarkdown = currentBodyMarkdown,
): VisibleConciergeDraftMarkdown {
    const streamableSourceLength = getStreamableMarkdownSourceLength(targetBodyMarkdown);
    const normalizedCurrentSourceOffset = Math.min(currentSourceOffset, streamableSourceLength);

    if (!targetBodyMarkdown || normalizedCurrentSourceOffset >= streamableSourceLength) {
        if (currentSourceMarkdown && !targetBodyMarkdown.startsWith(currentSourceMarkdown)) {
            return {
                bodyMarkdown: targetBodyMarkdown,
                sourceMarkdown: targetBodyMarkdown,
                sourceOffset: targetBodyMarkdown.length,
            };
        }

        if (normalizedCurrentSourceOffset !== currentSourceOffset) {
            return {
                bodyMarkdown: buildVisibleMarkdownAtSourceOffset(targetBodyMarkdown, normalizedCurrentSourceOffset),
                sourceMarkdown: targetBodyMarkdown.slice(0, normalizedCurrentSourceOffset),
                sourceOffset: normalizedCurrentSourceOffset,
            };
        }

        return {
            bodyMarkdown: currentBodyMarkdown,
            sourceMarkdown: currentSourceMarkdown,
            sourceOffset: currentSourceOffset,
        };
    }

    if (currentSourceMarkdown && !targetBodyMarkdown.startsWith(currentSourceMarkdown)) {
        return {
            bodyMarkdown: targetBodyMarkdown,
            sourceMarkdown: targetBodyMarkdown,
            sourceOffset: targetBodyMarkdown.length,
        };
    }

    const nextSourceOffset = Math.min(getNextVisibleSourceOffset(targetBodyMarkdown, normalizedCurrentSourceOffset), streamableSourceLength);
    return {
        bodyMarkdown: buildVisibleMarkdownAtSourceOffset(targetBodyMarkdown, nextSourceOffset),
        sourceMarkdown: targetBodyMarkdown.slice(0, nextSourceOffset),
        sourceOffset: nextSourceOffset,
    };
}

function getNextVisibleConciergeDraftBodyMarkdown(currentBodyMarkdown: string, targetBodyMarkdown: string): string {
    return getNextVisibleConciergeDraftMarkdown(currentBodyMarkdown, targetBodyMarkdown).bodyMarkdown;
}

// Module-level cache so a chat re-mount (ReportScreen unmount/remount on chat
// switch) preserves the in-progress draft. Without this the gate's local state
// resets to null on every revisit and the synthetic bubble disappears for the
// remount + Onyx-hydration window. Keyed by reportID; entries are evicted by
// `setCachedDraft(reportID, null)` when the reducer returns null
// (completed/failed/cleared).
const draftCache = new Map<string, ConciergeDraft>();

function getCachedDraft(reportID: string): ConciergeDraft | null {
    return draftCache.get(reportID) ?? null;
}

function setCachedDraft(reportID: string, draft: ConciergeDraft | null): void {
    if (draft) {
        draftCache.set(reportID, draft);
    } else {
        draftCache.delete(reportID);
    }
}

function applyConciergeDraftEvent(currentDraft: ConciergeDraft | null, event: ConciergeDraftEvent, reportID: string): ConciergeDraft | null {
    if (event.reportID !== reportID) {
        return currentDraft;
    }

    const isSameStreamSession = currentDraft?.streamSessionID === event.streamSessionID;

    if (isSameStreamSession && event.sequence <= currentDraft.sequence) {
        return currentDraft;
    }

    if (!isSameStreamSession && currentDraft && event.status !== 'started' && event.status !== 'updated') {
        return currentDraft;
    }

    if (event.status === 'failed' || event.status === 'cleared') {
        return isSameStreamSession ? null : currentDraft;
    }

    const nextReportAction =
        buildConciergeDraftReportAction({
            actorAccountID: event.actorAccountID,
            bodyMarkdown: event.bodyMarkdown,
            created: event.created,
            finalRenderedHTML: event.finalRenderedHTML,
            reportActionID: event.reportActionID,
            reportID: event.reportID,
        }) ?? currentDraft?.reportAction;

    if (!nextReportAction) {
        return currentDraft;
    }

    return {
        bodyMarkdown: event.bodyMarkdown ?? currentDraft?.bodyMarkdown,
        reportAction: nextReportAction,
        sequence: event.sequence,
        status: event.status,
        streamSessionID: event.streamSessionID,
        terminalReason: event.terminalReason,
    };
}

export {applyConciergeDraftEvent, getCachedDraft, getNextVisibleConciergeDraftBodyMarkdown, getNextVisibleConciergeDraftMarkdown, setCachedDraft, stripIncompleteMarkdown};
export type {ConciergeDraft};
