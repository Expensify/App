import Parser from '@libs/Parser';
import type {ConciergeDraftEvent} from '@libs/Pusher/types';
import {getParsedComment} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import type {ReportAction} from '@src/types/onyx';

type ConciergeDraft = {
    /** Currently rendered markdown. Pusher pacing may intentionally lag this behind the latest server snapshot. */
    bodyMarkdown?: string;
    /** Latest server markdown snapshot held by the Pusher pacer so remounts can resume revealing banked text. */
    pusherTargetBodyMarkdown?: string;
    /** Server event sequence for the latest Pusher target snapshot. */
    pusherTargetSequence?: number;
    /** Completion event held while the Pusher pacer is still revealing banked text. */
    pusherPendingCompletionEvent?: ConciergeDraftEvent;
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

const CODE_BLOCK_DELIMITER = '```';
const INLINE_CODE_DELIMITER = '`';
const BOLD_DELIMITER = '**';
const STRIKETHROUGH_DELIMITER = '~~';
const DRAFT_PACE_BACKLOG_CHAR_LIMIT = 80;
const DRAFT_PACE_CATCHUP_DIVISOR = 40;
const DRAFT_PACE_COMPLETION_DIVISOR = 4;

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

function sliceByCodePoint(text: string, length: number): string {
    return Array.from(text).slice(0, length).join('');
}

function getNextVisibleConciergeDraftBodyMarkdown(currentBodyMarkdown: string, targetBodyMarkdown: string, shouldAccelerate = false): string {
    if (!targetBodyMarkdown || currentBodyMarkdown === targetBodyMarkdown) {
        return currentBodyMarkdown;
    }

    if (!targetBodyMarkdown.startsWith(currentBodyMarkdown)) {
        return targetBodyMarkdown;
    }

    const currentLength = Array.from(currentBodyMarkdown).length;
    const targetLength = Array.from(targetBodyMarkdown).length;
    const remainingLength = targetLength - currentLength;
    const divisor = shouldAccelerate ? DRAFT_PACE_COMPLETION_DIVISOR : DRAFT_PACE_CATCHUP_DIVISOR;
    const step = remainingLength <= DRAFT_PACE_BACKLOG_CHAR_LIMIT && !shouldAccelerate ? 1 : Math.max(1, Math.ceil(remainingLength / divisor));

    return sliceByCodePoint(targetBodyMarkdown, currentLength + step);
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

export {applyConciergeDraftEvent, getCachedDraft, getNextVisibleConciergeDraftBodyMarkdown, setCachedDraft, stripIncompleteMarkdown};
export type {ConciergeDraft};
