import debounce from 'lodash/debounce';
import Onyx from 'react-native-onyx';
import Log from '@libs/Log';
import * as ReportConnection from '@libs/ReportConnection';
import * as ReportUtils from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

/**
 * This actions file is used to automatically switch a user into #focus mode when they exceed a certain number of reports. We do this primarily for performance reasons.
 * Similar to the "Welcome action" we must wait for a number of things to happen when the user signs in or refreshes the page:
 *
 *     - NVP that tracks whether they have already been switched over. We only do this once.
 *     - Priority mode NVP (that dictates the ordering/filtering logic of the LHN)
 *     - Reports to load (in ReconnectApp or OpenApp). As we check the count of the reports to determine whether the user is eligible to be automatically switched.
 */

let resolveIsReadyPromise: (args?: unknown[]) => void;
let isReadyPromise = new Promise((resolve) => {
    resolveIsReadyPromise = resolve;
});

let currentUserAccountID: number | undefined;
Onyx.connect({
    key: ONYXKEYS.SESSION,
    callback: (val) => {
        currentUserAccountID = val?.accountID;
    },
});

/**
 * Debounce the prompt to promote focus mode as many reports updates could happen in a short burst
 */
// eslint-disable-next-line @typescript-eslint/no-use-before-define
const autoSwitchToFocusMode = debounce(tryFocusModeUpdate, 300, {leading: true});

let isLoadingReportData = true;
Onyx.connect({
    key: ONYXKEYS.IS_LOADING_REPORT_DATA,
    initWithStoredValues: false,
    callback: (value) => {
        isLoadingReportData = value ?? false;

        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        checkRequiredData();
    },
});

let isInFocusMode: boolean | undefined;
Onyx.connect({
    key: ONYXKEYS.NVP_PRIORITY_MODE,
    callback: (priorityMode) => {
        isInFocusMode = priorityMode === CONST.PRIORITY_MODE.GSD;

        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        checkRequiredData();
    },
});

let hasTriedFocusMode: boolean | undefined;
Onyx.connect({
    key: ONYXKEYS.NVP_TRY_FOCUS_MODE,
    callback: (val) => {
        hasTriedFocusMode = val;

        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        checkRequiredData();
    },
});

function resetHasReadRequiredDataFromStorage() {
    // Create a new promise and a new resolve function
    isReadyPromise = new Promise((resolve) => {
        resolveIsReadyPromise = resolve;
    });
    isLoadingReportData = true;
}

function checkRequiredData() {
    if (ReportConnection.getAllReports() === undefined || hasTriedFocusMode === undefined || isInFocusMode === undefined || isLoadingReportData) {
        return;
    }

    resolveIsReadyPromise();
}

function tryFocusModeUpdate() {
    isReadyPromise.then(() => {
        // User is signed out so do not try to switch them
        if (!currentUserAccountID) {
            return;
        }

        // Check to see if the user is using #focus mode, has tried it before, or we have already switched them over automatically.
        if ((isInFocusMode ?? false) || hasTriedFocusMode) {
            Log.info('Not switching user to optimized focus mode.', false, {isInFocusMode, hasTriedFocusMode});
            return;
        }

        const validReports = [];
        const allReports = ReportConnection.getAllReports();
        Object.keys(allReports ?? {}).forEach((key) => {
            const report = allReports?.[key];
            if (!report) {
                return;
            }

            if (!ReportUtils.isValidReport(report) || !ReportUtils.isReportParticipant(currentUserAccountID ?? -1, report)) {
                return;
            }

            validReports.push(report);
        });

        const reportCount = validReports.length;
        if (reportCount < CONST.REPORT.MAX_COUNT_BEFORE_FOCUS_UPDATE) {
            Log.info('Not switching user to optimized focus mode as they do not have enough reports', false, {reportCount});
            return;
        }

        Log.info('Switching user to optimized focus mode', false, {reportCount, hasTriedFocusMode, isInFocusMode});

        // Record that we automatically switched them so we don't ask again.
        hasTriedFocusMode = true;

        // Setting this triggers a modal to open and notify the user.
        Onyx.set(ONYXKEYS.FOCUS_MODE_NOTIFICATION, true);
    });
}

export {resetHasReadRequiredDataFromStorage, autoSwitchToFocusMode};
