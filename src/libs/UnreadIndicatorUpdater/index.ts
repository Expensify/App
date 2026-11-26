import {getIsOffline} from '@libs/NetworkState';
import {getOneTransactionThreadReportID} from '@libs/ReportActionsUtils';
import {getReportNotificationPreference, hasExpensifyGuidesEmails, isArchivedReport, isDefaultRoom, isHiddenForCurrentUser, isUnread, shouldReportBeInOptionList} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportActions, ReportAttributesDerivedValue, ReportNameValuePairs} from '@src/types/onyx';

import type {OnyxCollection} from 'react-native-onyx';

type UnreadIndicatorData = {
    reportNameValuePairs?: OnyxCollection<ReportNameValuePairs>;
    reportActions?: OnyxCollection<ReportActions>;
    reportAttributes?: ReportAttributesDerivedValue['reports'];
    currentUserLogin?: string;
    currentUserAccountID?: number;
    conciergeReportID?: string;
};

/** The IDs of the reports that count towards the unread indicator. */
function getUnreadReportIDsForUnreadIndicator(
    reports: OnyxCollection<Report>,
    currentReportID: string | undefined,
    draftComment: string | undefined,
    {reportNameValuePairs, reportActions, reportAttributes, currentUserLogin = '', currentUserAccountID = CONST.DEFAULT_NUMBER_ID, conciergeReportID}: UnreadIndicatorData = {},
) {
    // Read the in-memory offline state directly since this is an imperative one-shot computation (reactivity is not needed here).
    const isOffline = getIsOffline();
    const unreadReportIDs: string[] = [];
    for (const report of Object.values(reports ?? {})) {
        // Only the ID is returned, and a report without one never counted
        if (!report?.reportID) {
            continue;
        }

        // A chat read up to its newest message and mention can't be unread, and its thread-free state means nothing else can change that.
        // Skipping it here avoids the lookups below for the large read population. Expense-like reports are excluded
        // because their single transaction thread can carry newer times.
        if (
            report.type === CONST.REPORT.TYPE.CHAT &&
            report.lastReadTime &&
            report.lastReadTime >= (report.lastVisibleActionCreated ?? '') &&
            report.lastReadTime >= (report.lastMentionedTime ?? '')
        ) {
            continue;
        }

        const notificationPreference = getReportNotificationPreference(report, currentUserAccountID);

        /**
         * Cheapest predicates first so we reject the large muted/hidden population before doing any expensive work.
         *
         * Chats with hidden preference remain invisible in the LHN and are not considered "unread."
         * They are excluded from the LHN rendering, but not filtered from the "option list."
         * This ensures they appear in Search, but not in the LHN or unread count.
         *
         * Furthermore, muted reports may or may not appear in the LHN depending on priority mode,
         * but they should not be considered in the unread indicator count.
         */
        if (isHiddenForCurrentUser(notificationPreference) || notificationPreference === CONST.REPORT.NOTIFICATION_PREFERENCE.MUTE) {
            continue;
        }

        const nameValuePairs = reportNameValuePairs?.[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report?.reportID}`];
        const isReportArchived = isArchivedReport(nameValuePairs);
        const chatReport = reports?.[`${ONYXKEYS.COLLECTION.REPORT}${report?.chatReportID}`];
        const oneTransactionThreadReportID = getOneTransactionThreadReportID(report, chatReport, reportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report?.reportID}`], isOffline);
        const oneTransactionThreadReport = reports?.[`${ONYXKEYS.COLLECTION.REPORT}${oneTransactionThreadReportID}`];

        const derivedIsEmptyReport = reportAttributes?.[report.reportID]?.isEmpty;
        const requiresAttention = reportAttributes?.[report.reportID]?.requiresAttention;

        if (!isUnread(report, oneTransactionThreadReport, isReportArchived, derivedIsEmptyReport)) {
            continue;
        }

        // Heaviest predicate runs last, only for unread, non-muted, non-hidden reports — a small fraction of all reports.
        const shouldCount = shouldReportBeInOptionList({
            report,
            chatReport,
            currentReportId: currentReportID,
            // This list never had the beta, it used to pass an empty betas array, so it stays off on purpose
            isDefaultRoomsBetaEnabled: false,
            doesReportHaveViolations: false,
            isInFocusMode: false,
            excludeEmptyChats: false,
            isReportArchived,
            draftComment,
            currentUserLogin,
            currentUserAccountID,
            // TODO: Pass guideAccountIDs in Phase B. hasExpensifyGuidesEmails falls back to the personal details store until then. See https://github.com/Expensify/App/issues/66413.
            hasGuidesEmails: isDefaultRoom(report) ? hasExpensifyGuidesEmails(Object.keys(report?.participants ?? {}).map(Number), undefined) : false,
            conciergeReportID,
            requiresAttention,
            // The metadata is only read when `requiresAttention` is missing, which here means reportAttributes has not
            // computed this report yet. Subscribing to the whole metadata collection to cover that moment would cost
            // this module another Onyx connection for a count that corrects itself on the next recompute.
            pendingExpenseActionMetadata: undefined,
            derivedIsEmptyReport,
        });
        if (shouldCount) {
            unreadReportIDs.push(report.reportID);
        }
    }
    return unreadReportIDs;
}

export default {getUnreadReportIDsForUnreadIndicator};
