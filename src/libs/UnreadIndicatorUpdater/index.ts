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

function getUnreadReportsForUnreadIndicator(
    reports: OnyxCollection<Report>,
    currentReportID: string | undefined,
    draftComment: string | undefined,
    {reportNameValuePairs, reportActions, reportAttributes, currentUserLogin = '', currentUserAccountID = CONST.DEFAULT_NUMBER_ID, conciergeReportID}: UnreadIndicatorData = {},
) {
    // Read the in-memory offline state directly since this is an imperative one-shot computation (reactivity is not needed here).
    const isOffline = getIsOffline();
    return Object.values(reports ?? {}).filter((report) => {
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
            return false;
        }

        const nameValuePairs = reportNameValuePairs?.[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report?.reportID}`];
        const isReportArchived = isArchivedReport(nameValuePairs);
        const chatReport = reports?.[`${ONYXKEYS.COLLECTION.REPORT}${report?.chatReportID}`];
        const oneTransactionThreadReportID = getOneTransactionThreadReportID(report, chatReport, reportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report?.reportID}`], isOffline);
        const oneTransactionThreadReport = reports?.[`${ONYXKEYS.COLLECTION.REPORT}${oneTransactionThreadReportID}`];

        const derivedIsEmptyReport = report?.reportID ? reportAttributes?.[report.reportID]?.isEmpty : undefined;
        const requiresAttention = report?.reportID ? reportAttributes?.[report.reportID]?.requiresAttention : undefined;

        if (!isUnread(report, oneTransactionThreadReport, isReportArchived, derivedIsEmptyReport)) {
            return false;
        }

        // Heaviest predicate runs last, only for unread, non-muted, non-hidden reports — a small fraction of all reports.
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
            draftComment,
            currentUserLogin,
            currentUserAccountID,
            // TODO: Pass guideAccountIDs in Phase B. hasExpensifyGuidesEmails falls back to the personal details store until then. See https://github.com/Expensify/App/issues/66413.
            hasGuidesEmails: isDefaultRoom(report) ? hasExpensifyGuidesEmails(Object.keys(report?.participants ?? {}).map(Number), undefined) : false,
            conciergeReportID,
            requiresAttention,
            derivedIsEmptyReport,
        });
    });
}

export default {getUnreadReportsForUnreadIndicator};
