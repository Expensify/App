import AppStateMonitor from '@libs/AppStateMonitor';
import memoize from '@libs/memoize';
import {getIsOffline} from '@libs/NetworkState';
import {getOneTransactionThreadReportID} from '@libs/ReportActionsUtils';
import * as ReportUtils from '@libs/ReportUtils';

import Navigation, {navigationRef} from '@navigation/Navigation';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportActions, ReportNameValuePairs, Session} from '@src/types/onyx';

import type {OnyxCollection} from 'react-native-onyx';

import debounce from 'lodash/debounce';
import Onyx from 'react-native-onyx';

import updateUnread from './updateUnread';

let allReports: OnyxCollection<Report> = {};
let currentUserAccountID: number = CONST.DEFAULT_NUMBER_ID;
let currentUserLogin = '';

Onyx.connectWithoutView({
    key: ONYXKEYS.SESSION,
    callback: (value: Session | undefined) => {
        currentUserAccountID = value?.accountID ?? CONST.DEFAULT_NUMBER_ID;
        currentUserLogin = value?.email ?? '';
    },
});

let allReportNameValuePairs: OnyxCollection<ReportNameValuePairs> = {};
// This subscription is used to update the unread indicators count which is not linked to UI and it does not update any UI state.
Onyx.connectWithoutView({
    key: ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS,
    callback: (value) => {
        allReportNameValuePairs = value;
    },
});

let allReportActions: OnyxCollection<ReportActions> = {};
// This subscription is used to update the unread indicators count which is not linked to UI and it does not update any UI state.
Onyx.connectWithoutView({
    key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
    callback: (value) => {
        allReportActions = value;
    },
});

let allDraftComments: OnyxCollection<string> = {};
Onyx.connectWithoutView({
    key: ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT,
    callback: (value) => {
        allDraftComments = value;
    },
});

function getUnreadReportsForUnreadIndicator(reports: OnyxCollection<Report>, currentReportID: string | undefined, draftComment: string | undefined) {
    // Read the in-memory offline state directly since this is an imperative one-shot computation (reactivity is not needed here).
    const isOffline = getIsOffline();
    return Object.values(reports ?? {}).filter((report) => {
        const notificationPreference = ReportUtils.getReportNotificationPreference(report);

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
        if (ReportUtils.isHiddenForCurrentUser(notificationPreference) || notificationPreference === CONST.REPORT.NOTIFICATION_PREFERENCE.MUTE) {
            return false;
        }

        const nameValuePairs = allReportNameValuePairs?.[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report?.reportID}`];
        const isReportArchived = ReportUtils.isArchivedReport(nameValuePairs);
        const chatReport = reports?.[`${ONYXKEYS.COLLECTION.REPORT}${report?.chatReportID}`];
        const oneTransactionThreadReportID = getOneTransactionThreadReportID(report, chatReport, allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report?.reportID}`], isOffline);
        const oneTransactionThreadReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${oneTransactionThreadReportID}`];

        if (!ReportUtils.isUnread(report, oneTransactionThreadReport, isReportArchived)) {
            return false;
        }

        // Heaviest predicate runs last, only for unread, non-muted, non-hidden reports — a small fraction of all reports.
        return ReportUtils.shouldReportBeInOptionList({
            report,
            chatReport,
            currentReportId: currentReportID,
            betas: [],
            doesReportHaveViolations: false,
            isInFocusMode: false,
            excludeEmptyChats: false,
            isReportArchived,
            draftComment,
            currentUserLogin,
            currentUserAccountID,
        });
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

export default {getUnreadReportsForUnreadIndicator};
