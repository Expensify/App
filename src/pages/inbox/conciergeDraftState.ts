import Parser from '@libs/Parser';
import type {ConciergeDraftEvent} from '@libs/Pusher/types';
import {getParsedComment} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import type {ReportAction} from '@src/types/onyx';

type ConciergeDraft = {
    reportAction: ReportAction;
    sequence: number;
    status: ConciergeDraftEvent['status'];
    streamSessionID: string;
    terminalReason?: string;
};

type BuildConciergeDraftReportActionParams = {
    bodyMarkdown?: string;
    created: string;
    finalRenderedHTML?: string;
    reportActionID: string;
    reportID: string;
};

/**
 * Count non-overlapping occurrences of `needle` in `haystack`.
 */
function countOccurrences(haystack: string, needle: string): number {
    let count = 0;
    let pos = 0;
    while (true) {
        const idx = haystack.indexOf(needle, pos);
        if (idx === -1) {
            break;
        }
        count++;
        pos = idx + needle.length;
    }
    return count;
}

/**
 * If the last line of `text` contains an odd number of `delimiter` occurrences,
 * the final one opened a construct that was never closed. Strip from that
 * opening delimiter to the end of the string.
 */
function stripUnpairedLastLineDelimiter(text: string, delimiter: string): string {
    const lastNewline = text.lastIndexOf('\n');
    const lastLine = text.substring(lastNewline + 1);
    const count = countOccurrences(lastLine, delimiter);

    if (count > 0 && count % 2 !== 0) {
        return text.substring(0, text.lastIndexOf(delimiter));
    }
    return text;
}

/**
 * Strips incomplete markdown constructs from the tail of a streaming markdown
 * string so that ExpensiMark doesn't render raw syntax for half-finished
 * links, bold, strikethrough, or code blocks.
 */
function stripIncompleteMarkdown(markdown: string): string {
    if (!markdown) {
        return markdown;
    }

    let result = markdown;

    // 1. Incomplete link/image: find the last '[' and check whether a
    //    complete [text](url) follows it. If not, strip from '[' (or '![').
    const lastOpenBracket = result.lastIndexOf('[');
    if (lastOpenBracket !== -1) {
        const tail = result.substring(lastOpenBracket);
        if (!/^\[[^\]]*\]\([^)]*\)/.test(tail)) {
            const stripFrom = lastOpenBracket > 0 && result[lastOpenBracket - 1] === '!' ? lastOpenBracket - 1 : lastOpenBracket;
            result = result.substring(0, stripFrom);
        }
    }

    // 2. Unclosed bold (**) on the last line.
    result = stripUnpairedLastLineDelimiter(result, '**');

    // 3. Unclosed strikethrough (~~) on the last line.
    result = stripUnpairedLastLineDelimiter(result, '~~');

    // 4. Unclosed code block (``` spans multiple lines).
    const codeBlockCount = countOccurrences(result, '```');
    if (codeBlockCount % 2 !== 0) {
        result = result.substring(0, result.lastIndexOf('```'));
    }

    // 5. Unclosed inline code (`) on the last line (after code-block handling).
    result = stripUnpairedLastLineDelimiter(result, '`');

    return result;
}

function buildConciergeDraftReportAction({bodyMarkdown, created, finalRenderedHTML, reportActionID, reportID}: BuildConciergeDraftReportActionParams): ReportAction | null {
    const html = finalRenderedHTML ?? (bodyMarkdown ? getParsedComment(stripIncompleteMarkdown(bodyMarkdown), {reportID}) : '');

    if (!html) {
        return null;
    }

    return {
        reportActionID,
        reportID,
        actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
        actorAccountID: CONST.ACCOUNT_ID.CONCIERGE,
        person: [{style: 'strong', text: CONST.CONCIERGE_DISPLAY_NAME, type: 'TEXT'}],
        created,
        message: [{type: CONST.REPORT.MESSAGE.TYPE.COMMENT, html, text: Parser.htmlToText(html)}],
        originalMessage: {html, whisperedTo: []},
        shouldShow: true,
    } as ReportAction;
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
        reportAction: nextReportAction,
        sequence: event.sequence,
        status: event.status,
        streamSessionID: event.streamSessionID,
        terminalReason: event.terminalReason,
    };
}

export {applyConciergeDraftEvent, buildConciergeDraftReportAction, getCachedDraft, setCachedDraft, stripIncompleteMarkdown};
export type {ConciergeDraft};
