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

function buildConciergeDraftReportAction({bodyMarkdown, created, finalRenderedHTML, reportActionID, reportID}: BuildConciergeDraftReportActionParams): ReportAction | null {
    const html = finalRenderedHTML ?? (bodyMarkdown ? getParsedComment(bodyMarkdown, {reportID}) : '');

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

export {applyConciergeDraftEvent, buildConciergeDraftReportAction, getCachedDraft, setCachedDraft};
export type {ConciergeDraft};
