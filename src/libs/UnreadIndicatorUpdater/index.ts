import {getIsOffline} from '@libs/NetworkState';
import {canHaveOneTransactionThread, getOneTransactionThreadReportID} from '@libs/ReportActionsUtils';
import {getReportNotificationPreference, hasExpensifyGuidesEmails, isArchivedReport, isDefaultRoom, isHiddenForCurrentUser, isUnread, shouldReportBeInOptionList} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportActions, ReportAttributesDerivedValue, ReportNameValuePairs} from '@src/types/onyx';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

type UnreadIndicatorData = {
    reportNameValuePairs?: OnyxCollection<ReportNameValuePairs>;
    reportActions?: OnyxCollection<ReportActions>;
    reportAttributes?: ReportAttributesDerivedValue['reports'];
    currentUserLogin?: string;
    currentUserAccountID?: number;
    conciergeReportID?: string;
};

type ThreadIDEntry = {
    type: Report['type'];
    transactionCount: Report['transactionCount'];
    chatReport: OnyxEntry<Report>;
    isOffline: boolean;
    threadReportID: string | undefined;
};

// Onyx keeps the same object for a report's actions until they change, so the thread of a report stays the same while that object,
// the report's type and transaction count, its chat report and the offline state are all the same as when it was computed.
// Keep the cache key in sync with what getOneTransactionThreadReportID reads.
const threadReportIDCache = new WeakMap<ReportActions, ThreadIDEntry>();

function getCachedOneTransactionThreadReportID(report: Report | undefined, chatReport: OnyxEntry<Report>, actions: OnyxEntry<ReportActions>, isOffline: boolean) {
    if (!actions) {
        return getOneTransactionThreadReportID(report, chatReport, actions, isOffline);
    }
    const hit = threadReportIDCache.get(actions);
    if (hit && hit.type === report?.type && hit.transactionCount === report?.transactionCount && hit.chatReport === chatReport && hit.isOffline === isOffline) {
        return hit.threadReportID;
    }
    const threadReportID = getOneTransactionThreadReportID(report, chatReport, actions, isOffline);
    threadReportIDCache.set(actions, {
        type: report?.type,
        transactionCount: report?.transactionCount,
        chatReport,
        isOffline,
        threadReportID,
    });
    return threadReportID;
}

function getUnreadReportIDsForUnreadIndicator(
    reports: OnyxCollection<Report>,
    currentReportID: string | undefined,
    hasDraftComment: boolean | undefined,
    {reportNameValuePairs, reportActions, reportAttributes, currentUserLogin = '', currentUserAccountID = CONST.DEFAULT_NUMBER_ID, conciergeReportID}: UnreadIndicatorData = {},
): string[] {
    // Read the in-memory offline state directly since this is an imperative one-shot computation (reactivity is not needed here).
    const isOffline = getIsOffline();
    const unreadReports = Object.values(reports ?? {}).filter((report) => {
        // A report read after its own newest message and mention can only be unread through a newer message in its transaction thread, so the rest of the checks are skipped for it
        const lastReadTime = report?.lastReadTime;
        if (lastReadTime && lastReadTime >= (report?.lastVisibleActionCreated ?? '') && lastReadTime >= (report?.lastMentionedTime ?? '')) {
            // Only some report types have a transaction thread
            if (!canHaveOneTransactionThread(report?.type)) {
                return false;
            }
            const threadReportID = getCachedOneTransactionThreadReportID(
                report,
                reports?.[`${ONYXKEYS.COLLECTION.REPORT}${report?.chatReportID}`],
                reportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report?.reportID}`],
                isOffline,
            );
            const threadReport = threadReportID ? reports?.[`${ONYXKEYS.COLLECTION.REPORT}${threadReportID}`] : undefined;
            if (lastReadTime >= (threadReport?.lastVisibleActionCreated ?? '')) {
                return false;
            }
        }

        const notificationPreference = getReportNotificationPreference(report, currentUserAccountID);

        /**
         * Next cheapest predicate: reject the large muted/hidden population before doing any expensive work.
         *
         * Chats with hidden preference remain invisible in the LHN and are not considered "unread."
         * They are excluded from the LHN rendering, but not filtered from the "option list."
         * This ensures they appear in Search, but not in the LHN or unread count.
         *
         * Furthermore, muted reports may or may not appear in the LHN depending on priority mode,
         * but they should not be considered in the unread indicator count.
         */
        if (isHiddenForCurrentUser(notificationPreference) || notificationPreference === CONST.REPORT.NOTIFICATION_PREFERENCE.MUTE) {
            return false;
        }

        const nameValuePairs = reportNameValuePairs?.[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report?.reportID}`];
        const isReportArchived = isArchivedReport(nameValuePairs);
        const chatReport = reports?.[`${ONYXKEYS.COLLECTION.REPORT}${report?.chatReportID}`];
        const oneTransactionThreadReportID = getCachedOneTransactionThreadReportID(
            report,
            chatReport,
            reportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report?.reportID}`],
            isOffline,
        );
        const oneTransactionThreadReport = reports?.[`${ONYXKEYS.COLLECTION.REPORT}${oneTransactionThreadReportID}`];

        const derivedIsEmptyReport = report?.reportID ? reportAttributes?.[report.reportID]?.isEmpty : undefined;
        const requiresAttention = report?.reportID ? reportAttributes?.[report.reportID]?.requiresAttention : undefined;

        if (!isUnread(report, oneTransactionThreadReport, isReportArchived, derivedIsEmptyReport)) {
            return false;
        }

        // Heaviest predicate runs last, only for unread, non-muted, non-hidden reports, a small fraction of all reports.
        return shouldReportBeInOptionList({
            report,
            chatReport,
            currentReportId: currentReportID,
            // This list never had the beta, it used to pass an empty betas array, so it stays off on purpose
            isDefaultRoomsBetaEnabled: false,
            doesReportHaveViolations: false,
            isInFocusMode: false,
            excludeEmptyChats: false,
            isReportArchived,
            hasDraftComment,
            currentUserLogin,
            currentUserAccountID,
            // TODO: Pass guideAccountIDs in Phase B. hasExpensifyGuidesEmails falls back to the personal details store until then. See https://github.com/Expensify/App/issues/66413.
            hasGuidesEmails: isDefaultRoom(report) ? hasExpensifyGuidesEmails(Object.keys(report?.participants ?? {}).map(Number), undefined) : false,
            conciergeReportID,
            requiresAttention,
            derivedIsEmptyReport,
        });
    });
    return unreadReports.flatMap((report) => (report?.reportID ? [report.reportID] : []));
}

export default {getUnreadReportIDsForUnreadIndicator};
