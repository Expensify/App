import type {OnyxCollection} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type OnyxPolicy from '@src/types/onyx/Policy';
import type Report from '@src/types/onyx/Report';
import type {EmptyObject} from '@src/types/utils/EmptyObject';
import * as Policy from './Policy';

let resolveIsReadyPromise: (value?: Promise<void>) => void | undefined;
let isReadyPromise = new Promise<void>((resolve) => {
    resolveIsReadyPromise = resolve;
});

let isFirstTimeNewExpensifyUser: boolean | undefined;
let hasDismissedModal: boolean | undefined;
let hasSelectedChoice: boolean | undefined;
let isLoadingReportData = true;

type ShowParams = {
    showEngagementModal: () => void;
};

/**
 * Check that a few requests have completed so that the welcome action can proceed:
 *
 * - Whether we are a first time new expensify user
 * - Whether we have loaded all policies the server knows about
 * - Whether we have loaded all reports the server knows about
 */
function checkOnReady() {
    if (isFirstTimeNewExpensifyUser === undefined || isLoadingReportData || hasSelectedChoice === undefined || hasDismissedModal === undefined) {
        return;
    }

    resolveIsReadyPromise?.();
}

Onyx.connect({
    key: ONYXKEYS.NVP_IS_FIRST_TIME_NEW_EXPENSIFY_USER,
    initWithStoredValues: false,
    callback: (value) => {
        // If isFirstTimeNewExpensifyUser was true do not update it to false. We update it to false inside the Welcome.show logic
        // More context here https://github.com/Expensify/App/pull/16962#discussion_r1167351359

        isFirstTimeNewExpensifyUser = value ?? undefined;

        checkOnReady();
    },
});

Onyx.connect({
    key: ONYXKEYS.NVP_INTRO_SELECTED,
    initWithStoredValues: true,
    callback: (value) => {
        // If isFirstTimeNewExpensifyUser was true do not update it to false. We update it to false inside the Welcome.show logic
        // More context here https://github.com/Expensify/App/pull/16962#discussion_r1167351359
        hasSelectedChoice = !!value;

        checkOnReady();
    },
});

Onyx.connect({
    key: ONYXKEYS.NVP_HAS_DISMISSED_IDLE_PANEL,
    initWithStoredValues: true,
    callback: (value) => {
        // If isFirstTimeNewExpensifyUser was true do not update it to false. We update it to false inside the Welcome.show logic
        // More context here https://github.com/Expensify/App/pull/16962#discussion_r1167351359
        hasDismissedModal = value ?? false;

        checkOnReady();
    },
});

Onyx.connect({
    key: ONYXKEYS.IS_LOADING_REPORT_DATA,
    initWithStoredValues: false,
    callback: (value) => {
        isLoadingReportData = value ?? false;
        checkOnReady();
    },
});

const allReports: OnyxCollection<Report> = {};
Onyx.connect({
    key: ONYXKEYS.COLLECTION.REPORT,
    initWithStoredValues: false,
    callback: (val, key) => {
        if (!val || !key) {
            return;
        }

        allReports[key] = {...allReports[key], ...val};
    },
});

const allPolicies: OnyxCollection<OnyxPolicy> | EmptyObject = {};
Onyx.connect({
    key: ONYXKEYS.COLLECTION.POLICY,
    callback: (val, key) => {
        if (!key) {
            return;
        }

        if (val === null || val === undefined) {
            delete allPolicies[key];
            return;
        }

        allPolicies[key] = {...allPolicies[key], ...val};
    },
});

/**
 * Shows a welcome action on first login
 */
function show({showEngagementModal}: ShowParams) {
    isReadyPromise.then(() => {
        if (!isFirstTimeNewExpensifyUser) {
            return;
        }

        // If user is not already an admin of a free policy and we are not navigating them to their workspace or creating a new workspace via workspace/new then
        // we will show the engagement modal.
        if (!Policy.isAdminOfFreePolicy(allPolicies ?? undefined) && !hasSelectedChoice && !hasDismissedModal && Object.keys(allPolicies ?? {}).length === 1) {
            Onyx.set(ONYXKEYS.NVP_IS_FIRST_TIME_NEW_EXPENSIFY_USER, false);
            showEngagementModal();
        }

        // Update isFirstTimeNewExpensifyUser so the Welcome logic doesn't run again
        isFirstTimeNewExpensifyUser = false;
    });
}

function resetReadyCheck() {
    isReadyPromise = new Promise((resolve) => {
        resolveIsReadyPromise = resolve;
    });
    isFirstTimeNewExpensifyUser = undefined;
    isLoadingReportData = true;
}

function serverDataIsReadyPromise(): Promise<void> {
    return isReadyPromise;
}

export {show, serverDataIsReadyPromise, resetReadyCheck};
