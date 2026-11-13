/**
 * The conversations listed on the Concierge page. Each one is either a thread of the Concierge DM, or a message
 * Concierge posted in the DM that has no thread yet, which gets one when the user opens it.
 */
import CONST from '@src/CONST';
import type {Report, ReportAction, ReportActions} from '@src/types/onyx';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

import {isDeletedAction, isWhisperAction} from './ReportActionsUtils';
import {isHiddenForCurrentUser} from './ReportUtils';

type ConciergeConversation = {
    /** Unique across both kinds, for list keys */
    key: string;

    /** Set for a thread */
    reportID?: string;

    /** Set for a Concierge message without a thread */
    reportActionID?: string;

    /** When the conversation last changed, which orders the list */
    lastActivity: string;
};

/** Whether the report is the Concierge DM or one of its threads */
function isConciergeConversationReport(report: Pick<Report, 'reportID' | 'parentReportID'> | undefined, conciergeReportID: string | undefined): boolean {
    return !!conciergeReportID && !!report && (report.reportID === conciergeReportID || report.parentReportID === conciergeReportID);
}

/** The threads of the Concierge DM the user has not left */
function getConciergeThreadConversations(reports: OnyxCollection<Report>, conciergeReportID: string | undefined): ConciergeConversation[] {
    if (!conciergeReportID) {
        return [];
    }
    const conversations: ConciergeConversation[] = [];
    for (const report of Object.values(reports ?? {})) {
        if (!report || report.parentReportID !== conciergeReportID || isHiddenForCurrentUser(report)) {
            continue;
        }
        conversations.push({
            key: `thread-${report.reportID}`,
            reportID: report.reportID,
            lastActivity: report.lastVisibleActionCreated ?? report.created ?? '',
        });
    }
    return conversations;
}

/** The messages Concierge posted in its DM that nobody opened a thread on yet */
function getConciergeMessageConversations(reportActions: OnyxEntry<ReportActions>): ConciergeConversation[] {
    const conversations: ConciergeConversation[] = [];
    for (const reportAction of Object.values(reportActions ?? {})) {
        if (!isConciergeMessageWithoutThread(reportAction)) {
            continue;
        }
        conversations.push({
            key: `message-${reportAction.reportActionID}`,
            reportActionID: reportAction.reportActionID,
            lastActivity: reportAction.created,
        });
    }
    return conversations;
}

function isConciergeMessageWithoutThread(reportAction: OnyxEntry<ReportAction>): reportAction is ReportAction {
    return (
        !!reportAction &&
        reportAction.actorAccountID === CONST.ACCOUNT_ID.CONCIERGE &&
        reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT &&
        !reportAction.childReportID &&
        !isWhisperAction(reportAction) &&
        !isDeletedAction(reportAction)
    );
}

/** Most recent activity first */
function sortConciergeConversations(conversations: ConciergeConversation[]): ConciergeConversation[] {
    return conversations.sort((first, second) => second.lastActivity.localeCompare(first.lastActivity) || second.key.localeCompare(first.key));
}

export {getConciergeMessageConversations, getConciergeThreadConversations, isConciergeConversationReport, isConciergeMessageWithoutThread, sortConciergeConversations};
export type {ConciergeConversation};
