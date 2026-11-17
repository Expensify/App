/**
 * The conversations listed on the Concierge page. Each one is either a thread of the Concierge DM, or a message
 * Concierge posted in the DM that has no thread yet, which gets one when the user opens it.
 */
import CONST from '@src/CONST';
import type {Report, ReportAction, ReportActions} from '@src/types/onyx';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

import {isConciergePageThread} from './isInConciergeConversation';
import {isDeletedAction, isWhisperAction} from './ReportActionsUtils';
import {isHiddenForCurrentUser, isUnread} from './ReportUtils';

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

/** The threads of the Concierge DM the user has not left, without support tickets */
function getConciergeThreadConversations(reports: OnyxCollection<Report>, conciergeReportID: string | undefined): ConciergeConversation[] {
    if (!conciergeReportID) {
        return [];
    }
    const conversations: ConciergeConversation[] = [];
    for (const report of Object.values(reports ?? {})) {
        if (!report || !isConciergePageThread(report, conciergeReportID) || isHiddenForCurrentUser(report)) {
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

/** A thread created by opening a Concierge message is newer than the message, so its time comes from the message */
function getConciergeThreadLastActivities(reportActions: OnyxEntry<ReportActions>): Record<string, string> {
    const lastActivities: Record<string, string> = {};
    for (const reportAction of Object.values(reportActions ?? {})) {
        if (!reportAction?.childReportID) {
            continue;
        }
        lastActivities[reportAction.childReportID] = reportAction.childLastVisibleActionCreated ?? reportAction.created;
    }
    return lastActivities;
}

/** Whether a thread listed on the Concierge page has a reply the user hasn't read */
function isUnreadConciergeThread(report: OnyxEntry<Report>, conciergeReportID: string | undefined): boolean {
    return isConciergePageThread(report, conciergeReportID) && !isHiddenForCurrentUser(report) && isUnread(report, undefined, false, undefined);
}

/** Whether a Concierge message without a thread was posted after the user last read the DM */
function isUnreadConciergeMessage(reportAction: OnyxEntry<ReportAction>, conciergeLastReadTime: string | undefined): reportAction is ReportAction {
    return isConciergeMessageWithoutThread(reportAction) && reportAction.created > (conciergeLastReadTime ?? '');
}

/** The listed thread with the most recent unread reply */
function getLatestUnreadConciergeThread(reports: OnyxCollection<Report>, conciergeReportID: string | undefined): ConciergeConversation | undefined {
    if (!conciergeReportID) {
        return undefined;
    }
    let latestThread: ConciergeConversation | undefined;
    for (const report of Object.values(reports ?? {})) {
        if (!report || !isUnreadConciergeThread(report, conciergeReportID)) {
            continue;
        }
        const lastActivity = report.lastVisibleActionCreated ?? report.created ?? '';
        if (!latestThread || lastActivity > latestThread.lastActivity) {
            latestThread = {key: `thread-${report.reportID}`, reportID: report.reportID, lastActivity};
        }
    }
    return latestThread;
}

/** The most recent Concierge message without a thread that the user hasn't read */
function getLatestUnreadConciergeMessage(reportActions: OnyxEntry<ReportActions>, conciergeLastReadTime: string | undefined): ReportAction | undefined {
    let latestMessage: ReportAction | undefined;
    for (const reportAction of Object.values(reportActions ?? {})) {
        if (!isUnreadConciergeMessage(reportAction, conciergeLastReadTime)) {
            continue;
        }
        if (!latestMessage || reportAction.created > latestMessage.created) {
            latestMessage = reportAction;
        }
    }
    return latestMessage;
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

export {
    getConciergeMessageConversations,
    getConciergeThreadConversations,
    getConciergeThreadLastActivities,
    getLatestUnreadConciergeMessage,
    getLatestUnreadConciergeThread,
    isConciergeMessageWithoutThread,
    isUnreadConciergeMessage,
    isUnreadConciergeThread,
    sortConciergeConversations,
};
export type {ConciergeConversation};
