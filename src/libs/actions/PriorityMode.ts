import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import debounce from 'lodash/debounce';
import Onyx, { OnyxCollection } from 'react-native-onyx';
import * as CollectionUtils from '@libs/CollectionUtils';
import { Report } from '@src/types/onyx';
import Log from '@libs/Log';

let resolveIsReadyPromise: (args?: unknown[]) => void;
let isReadyPromise = new Promise((resolve) => {
    resolveIsReadyPromise = resolve;
});
function resetHasReadRequiredDataFromStorage() {
    // Create a new promise and a new resolve function
    isReadyPromise = new Promise((resolve) => {
        resolveIsReadyPromise = resolve;
    });
}

let currentUserAccountID: number | undefined | null;
Onyx.connect({
    key: ONYXKEYS.SESSION,
    callback: (val) => {
        currentUserAccountID = val?.accountID;
    },
});

let allReports: OnyxCollection<Report> | undefined;
Onyx.connect({
    key: ONYXKEYS.COLLECTION.REPORT,
    callback: (report, key) => {
        if (!key || !report) {
            return;
        }

        if (!allReports) {
            allReports = {};
        }

        const reportID = CollectionUtils.extractCollectionItemID(key);
        allReports[reportID] = report;
    },
});

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
    callback: (priorityMode) => (isInFocusMode = priorityMode === CONST.PRIORITY_MODE.GSD),
});

let hasTriedFocusMode: boolean | undefined | null;
Onyx.connect({
    key: ONYXKEYS.NVP_TRY_FOCUS_MODE,
    callback: (val) => {
        hasTriedFocusMode = val;

        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        checkRequiredData();
    },
});

function checkRequiredData() {
    if (allReports === undefined || hasTriedFocusMode === undefined || isInFocusMode === undefined || isLoadingReportData) {
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
        if (isInFocusMode ?? hasTriedFocusMode) {
            Log.info('Not switching user to optimized focus mode.', false, {isInFocusMode, hasTriedFocusMode});
            return;
        }

        const reportCount = Object.keys(allReports ?? {}).length;
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

/**
 * Debounce the prompt to promote focus mode as many reports updates could happen in a short burst
 */
const autoSwitchToFocusMode = debounce(tryFocusModeUpdate, 300, {leading: true});

export {
    resetHasReadRequiredDataFromStorage,
    autoSwitchToFocusMode,
};
