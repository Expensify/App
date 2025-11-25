import debounce from 'lodash/debounce';
import type {OnyxCollection} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import AppStateMonitor from '@libs/AppStateMonitor';
import memoize from '@libs/memoize';
import {getOneTransactionThreadReportID} from '@libs/ReportActionsUtils';
import * as ReportUtils from '@libs/ReportUtils';
import Navigation, {navigationRef} from '@navigation/Navigation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportActions, ReportNameValuePairs} from '@src/types/onyx';
import updateUnread from './updateUnread';
import { Platform } from 'react-native';

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

// Listen for app state changes to update unread count when app becomes active
AppStateMonitor.addBecameActiveListener(() => {
    triggerUnreadUpdate();
});

/**
 * Manually trigger an unread update by reading current Onyx data.
 * This is useful in background/headless JS contexts where Onyx.connectWithoutView callbacks may not run.
 * It reads the latest data from Onyx and calculates the unread count.
 */
function triggerUnreadUpdateFromOnyx(): Promise<void> {
    // Android does not yet implement this
    if (Platform.OS === 'android') {
        return Promise.resolve();
    }


    // Use one-time connections to read current Onyx values
    const readReports = (): Promise<OnyxCollection<Report>> => {
        return new Promise<OnyxCollection<Report>>((resolve) => {
            const connection = Onyx.connect({
                key: ONYXKEYS.COLLECTION.REPORT,
                waitForCollectionCallback: true,
                callback: (value) => {
                    Onyx.disconnect(connection);
                    resolve((value ?? {}) as OnyxCollection<Report>);
                },
            });
        });
    };

    const readReportActions = (): Promise<OnyxCollection<ReportActions>> => {
        return new Promise<OnyxCollection<ReportActions>>((resolve) => {
            const connection = Onyx.connect({
                key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
                waitForCollectionCallback: true,
                callback: (value) => {
                    Onyx.disconnect(connection);
                    resolve((value ?? {}) as OnyxCollection<ReportActions>);
                },
            });
        });
    };

    const readReportNameValuePairs = (): Promise<OnyxCollection<ReportNameValuePairs>> => {
        return new Promise<OnyxCollection<ReportNameValuePairs>>((resolve) => {
            const connection = Onyx.connect({
                key: ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS,
                waitForCollectionCallback: true,
                callback: (value) => {
                    Onyx.disconnect(connection);
                    resolve((value ?? {}) as OnyxCollection<ReportNameValuePairs>);
                },
            });
        });
    };

    const readDraftComments = (): Promise<OnyxCollection<string>> => {
        return new Promise<OnyxCollection<string>>((resolve) => {
            const connection = Onyx.connect({
                key: ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT,
                waitForCollectionCallback: true,
                callback: (value) => {
                    Onyx.disconnect(connection);
                    resolve((value ?? {}) as OnyxCollection<string>);
                },
            });
        });
    };

    return Promise.all([readReports(), readReportActions(), readReportNameValuePairs(), readDraftComments()]).then(
        ([reports, reportActions, reportNameValuePairs, draftComments]) => {
            // Update module-level variables with fresh data
            allReports = reports;
            allReportActions = reportActions;
            allReportNameValuePairs = reportNameValuePairs;
            allDraftComments = draftComments;

            // Calculate current report ID (may be undefined in headless context)
            const currentReportID = navigationRef?.isReady?.() ? Navigation.getTopmostReportId() : undefined;
            const draftComment = draftComments?.[`${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT}${currentReportID}`];

            // Calculate unread count
            const unreadReports = getUnreadReportsForUnreadIndicator(reports, currentReportID, draftComment);
            updateUnread(unreadReports.length);
        },
    );
}

export default {getUnreadReportsForUnreadIndicator, triggerUnreadUpdateFromOnyx};
