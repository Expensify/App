import type {OnyxCollection} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import type {SelectedPurposeType} from '@pages/OnboardingPurpose/BaseOnboardingPurpose';
import ONYXKEYS from '@src/ONYXKEYS';
import type Onboarding from '@src/types/onyx/Onboarding';
import type OnyxPolicy from '@src/types/onyx/Policy';
import type {EmptyObject} from '@src/types/utils/EmptyObject';

let hasSelectedPurpose: boolean | undefined;
let hasProvidedPersonalDetails: boolean | undefined;
let onboarding: Onboarding | [] | undefined;
let hasDismissedModal: boolean | undefined;
let isLoadingReportData = true;

type HasCompletedOnboardingFlowProps = {
    onCompleted?: () => void;
    onNotCompleted?: () => void;
};

let resolveIsReadyPromise: (value?: Promise<void>) => void | undefined;
let isServerDataReadyPromise = new Promise<void>((resolve) => {
    resolveIsReadyPromise = resolve;
});

let resolveOnboardingFlowStatus: (value?: Promise<void>) => void | undefined;
let isOnboardingFlowStatusKnownPromise = new Promise<void>((resolve) => {
    resolveOnboardingFlowStatus = resolve;
});

function onServerDataReady(): Promise<void> {
    return isServerDataReadyPromise;
}

function isOnboardingFlowCompleted({onCompleted, onNotCompleted}: HasCompletedOnboardingFlowProps) {
    isOnboardingFlowStatusKnownPromise.then(() => {
        if (Array.isArray(onboarding) || onboarding?.hasCompletedGuidedSetupFlow === undefined) {
            return;
        }

        if (onboarding?.hasCompletedGuidedSetupFlow) {
            onCompleted?.();
        } else {
            onNotCompleted?.();
        }
    });
}

/**
 * Check that a few requests have completed so that the welcome action can proceed:
 *
 * - Whether we are a first time new expensify user
 * - Whether we have loaded all policies the server knows about
 * - Whether we have loaded all reports the server knows about
 */
function checkOnReady() {
    const hasRequiredOnyxKeysBeenLoaded = [onboarding, hasSelectedPurpose, hasDismissedModal, hasProvidedPersonalDetails].every((value) => value !== undefined);

    if (isLoadingReportData || !hasRequiredOnyxKeysBeenLoaded) {
        return;
    }

    resolveOnboardingFlowStatus?.();
    resolveIsReadyPromise?.();
}

function getPersonalDetails(accountID: number | undefined) {
    Onyx.connect({
        key: ONYXKEYS.PERSONAL_DETAILS_LIST,
        initWithStoredValues: true,
        callback: (value) => {
            if (!value || !accountID) {
                return;
            }

            hasProvidedPersonalDetails = !!value[accountID]?.firstName && !!value[accountID]?.lastName;
            checkOnReady();
        },
    });
}

function setOnboardingPurposeSelected(value: SelectedPurposeType) {
    Onyx.set(ONYXKEYS.ONBOARDING_PURPOSE_SELECTED, value ?? null);
}

Onyx.connect({
    key: ONYXKEYS.NVP_ONBOARDING,
    initWithStoredValues: false,
    callback: (value) => {
        if (value === null) {
            return;
        }

        onboarding = value;

        checkOnReady();
    },
});

Onyx.connect({
    key: ONYXKEYS.NVP_INTRO_SELECTED,
    initWithStoredValues: true,
    callback: (value) => {
        hasSelectedPurpose = !!value;

        checkOnReady();
    },
});

Onyx.connect({
    key: ONYXKEYS.NVP_HAS_DISMISSED_IDLE_PANEL,
    initWithStoredValues: true,
    callback: (value) => {
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

Onyx.connect({
    key: ONYXKEYS.SESSION,
    callback: (val, key) => {
        if (!val || !key) {
            return;
        }

        getPersonalDetails(val.accountID);
    },
});

function resetAllChecks() {
    isServerDataReadyPromise = new Promise((resolve) => {
        resolveIsReadyPromise = resolve;
    });
    isOnboardingFlowStatusKnownPromise = new Promise((resolve) => {
        resolveOnboardingFlowStatus = resolve;
    });
    onboarding = undefined;
    isLoadingReportData = true;
}

export {onServerDataReady, isOnboardingFlowCompleted, setOnboardingPurposeSelected, resetAllChecks};
