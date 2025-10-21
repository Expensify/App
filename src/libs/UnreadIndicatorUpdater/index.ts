import debounce from 'lodash/debounce';
import type {OnyxCollection} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import memoize from '@libs/memoize';
import {getOneTransactionThreadReportID} from '@libs/ReportActionsUtils';
import * as ReportUtils from '@libs/ReportUtils';
import Navigation, {navigationRef} from '@navigation/Navigation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportActions, ReportNameValuePairs} from '@src/types/onyx';
import updateUnread from './updateUnread';

let allReports: OnyxCollection<Report> = {};

let allReportNameValuePairs: OnyxCollection<ReportNameValuePairs> = {};
// This subscription is used to update the unread indicators count which is not linked to UI and it does not update any UI state.
Onyx.connectWithoutView({
    key: ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS,
    waitForCollectionCallback: true,
    callback: (value) => {
        allReportNameValuePairs = value;
    },
});

let allReportActions: OnyxCollection<ReportActions> = {};
// This subscription is used to update the unread indicators count which is not linked to UI and it does not update any UI state.
Onyx.connectWithoutView({
    key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
    waitForCollectionCallback: true,
    callback: (value) => {
        allReportActions = value;
    },
});

let allDraftComments: OnyxCollection<string> = {};
Onyx.connectWithoutView({
    key: ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT,
    waitForCollectionCallback: true,
    callback: (value) => {
        allDraftComments = value;
    },
});

function getUnreadReportsForUnreadIndicator(reports: OnyxCollection<Report>, currentReportID: string | undefined, draftComment: string | undefined) {
    return Object.values(reports ?? {}).filter((report) => {
        const notificationPreference = ReportUtils.getReportNotificationPreference(report);
        const chatReport = reports?.[`${ONYXKEYS.COLLECTION.REPORT}${report?.chatReportID}`];
        const oneTransactionThreadReportID = getOneTransactionThreadReportID(report, chatReport, allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report?.reportID}`]);
        const oneTransactionThreadReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${oneTransactionThreadReportID}`];
        const nameValuePairs = allReportNameValuePairs?.[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report?.reportID}`];
        const isReportArchived = ReportUtils.isArchivedReport(nameValuePairs);
        return (
            ReportUtils.isUnread(report, oneTransactionThreadReport, isReportArchived) &&
            ReportUtils.shouldReportBeInOptionList({
                report,
                chatReport,
                currentReportId: currentReportID,
                betas: [],
                doesReportHaveViolations: false,
                isInFocusMode: false,
                excludeEmptyChats: false,
                isReportArchived,
                draftComment,
            }) &&
            /**
             * Chats with hidden preference remain invisible in the LHN and are not considered "unread."
             * They are excluded from the LHN rendering, but not filtered from the "option list."
             * This ensures they appear in Search, but not in the LHN or unread count.
             *
             * Furthermore, muted reports may or may not appear in the LHN depending on priority mode,
             * but they should not be considered in the unread indicator count.
             */
            !ReportUtils.isHiddenForCurrentUser(notificationPreference) &&
            notificationPreference !== CONST.REPORT.NOTIFICATION_PREFERENCE.MUTE
        );
    });
}

const memoizedGetUnreadReportsForUnreadIndicator = memoize(getUnreadReportsForUnreadIndicator, {maxArgs: 3});

/**
 * Debouncing is used here to limit the frequency of updates to the unread indicator.
 * This ensures that rapid changes in the underlying data (e.g., multiple Onyx updates in quick succession)
 * do not trigger excessive computations or updates, improving performance and avoiding unnecessary overhead.
 */
const triggerUnreadUpdate = debounce(() => {
    const currentReportID = navigationRef?.isReady?.() ? Navigation.getTopmostReportId() : undefined;
    const draftComment = allDraftComments?.[`${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT}${currentReportID}`];
    // We want to keep notification count consistent with what can be accessed from the LHN list
    const unreadReports = memoizedGetUnreadReportsForUnreadIndicator(allReports, currentReportID, draftComment);

    updateUnread(unreadReports.length);
}, CONST.TIMING.UNREAD_UPDATE_DEBOUNCE_TIME);

// This subscription is used to update the unread indicators count which is not linked to UI and it does not update any UI state.
Onyx.connectWithoutView({
    key: ONYXKEYS.COLLECTION.REPORT,
    waitForCollectionCallback: true,
    callback: (value) => {
        allReports = value;
        triggerUnreadUpdate();
    },
});

navigationRef?.addListener?.('state', () => {
    triggerUnreadUpdate();
});

export default {getUnreadReportsForUnreadIndicator};
