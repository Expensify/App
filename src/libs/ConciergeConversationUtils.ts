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

type ConciergeConversationBase = {
    /** Unique across both kinds, for list keys */
    key: string;

    /** When the conversation last changed, which orders the list */
    lastActivity: string;
};

type ConciergeThreadConversation = ConciergeConversationBase & {
    reportID: string;
};

type ConciergeMessageConversation = ConciergeConversationBase & {
    /** The Concierge message without a thread */
    reportActionID: string;
};

type ConciergeConversation = ConciergeThreadConversation | ConciergeMessageConversation;

type ConciergeDMConversations = {
    /** The messages Concierge posted in its DM that nobody opened a thread on yet */
    messageConversations: ConciergeMessageConversation[];

    /** When each thread of the DM last changed, by the thread's reportID */
    threadLastActivities: Record<string, string>;
};

function buildThreadConversation(report: Report): ConciergeThreadConversation {
    return {
        key: `thread-${report.reportID}`,
        reportID: report.reportID,
        lastActivity: report.lastVisibleActionCreated ?? report.created ?? '',
    };
}

/** The threads of the Concierge DM the user has not left, without support tickets */
function getConciergeThreadConversations(reports: OnyxCollection<Report>, conciergeReportID: string | undefined): ConciergeThreadConversation[] {
    if (!conciergeReportID) {
        return [];
    }
    const conversations: ConciergeThreadConversation[] = [];
    for (const report of Object.values(reports ?? {})) {
        if (!report || !isConciergePageThread(report, conciergeReportID) || isHiddenForCurrentUser(report)) {
            continue;
        }
        conversations.push(buildThreadConversation(report));
    }
    return conversations;
}

/**
 * The messages Concierge posted in its DM that nobody opened a thread on yet, and when each thread of the DM last changed.
 * A thread created by opening a Concierge message is newer than the message, so its time comes from the message.
 */
function getConciergeDMConversations(reportActions: OnyxEntry<ReportActions>): ConciergeDMConversations {
    const messageConversations: ConciergeMessageConversation[] = [];
    const threadLastActivities: Record<string, string> = {};
    for (const reportAction of Object.values(reportActions ?? {})) {
        if (reportAction?.childReportID) {
            threadLastActivities[reportAction.childReportID] = reportAction.childLastVisibleActionCreated ?? reportAction.created;
            continue;
        }
        if (!isConciergeMessageWithoutThread(reportAction)) {
            continue;
        }
        messageConversations.push({
            key: `message-${reportAction.reportActionID}`,
            reportActionID: reportAction.reportActionID,
            lastActivity: reportAction.created,
        });
    }
    return {messageConversations, threadLastActivities};
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
function getLatestUnreadConciergeThread(reports: OnyxCollection<Report>, conciergeReportID: string | undefined): ConciergeThreadConversation | undefined {
    if (!conciergeReportID) {
        return undefined;
    }
    let latestThread: ConciergeThreadConversation | undefined;
    for (const report of Object.values(reports ?? {})) {
        if (!report || !isUnreadConciergeThread(report, conciergeReportID)) {
            continue;
        }
        const thread = buildThreadConversation(report);
        if (!latestThread || thread.lastActivity > latestThread.lastActivity) {
            latestThread = thread;
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

/** Orders timestamps and IDs, which aren't user-facing text, so they don't need a locale-aware comparison */
function compareDescending(first: string, second: string): number {
    if (first === second) {
        return 0;
    }
    return first < second ? 1 : -1;
}

/** Most recent activity first */
function sortConciergeConversations(conversations: ConciergeConversation[]): ConciergeConversation[] {
    return conversations.sort((first, second) => compareDescending(first.lastActivity, second.lastActivity) || compareDescending(first.key, second.key));
}

export {
    getConciergeDMConversations,
    getConciergeThreadConversations,
    getLatestUnreadConciergeMessage,
    getLatestUnreadConciergeThread,
    isUnreadConciergeMessage,
    isUnreadConciergeThread,
    sortConciergeConversations,
};
export type {ConciergeConversation};
