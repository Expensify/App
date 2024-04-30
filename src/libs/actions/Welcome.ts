import type {OnyxCollection} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import type {OnboardingPurposeType} from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type Onboarding from '@src/types/onyx/Onboarding';
import type OnyxPolicy from '@src/types/onyx/Policy';
import type {EmptyObject} from '@src/types/utils/EmptyObject';

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
 * Check if onboarding data is ready in order to check if the user has completed onboarding or not
 */
function checkOnboardingDataReady() {
    if (onboarding === undefined) {
        return;
    }

    resolveOnboardingFlowStatus?.();
}

/**
 * Check if user dismissed modal and if report data are loaded
 */
function checkServerDataReady() {
    if (isLoadingReportData || hasDismissedModal === undefined) {
        return;
    }

    resolveIsReadyPromise?.();
}

function setOnboardingPurposeSelected(value: OnboardingPurposeType) {
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

        checkOnboardingDataReady();
    },
});

Onyx.connect({
    key: ONYXKEYS.NVP_HAS_DISMISSED_IDLE_PANEL,
    initWithStoredValues: true,
    callback: (value) => {
        hasDismissedModal = value ?? false;

        checkServerDataReady();
    },
});

Onyx.connect({
    key: ONYXKEYS.IS_LOADING_REPORT_DATA,
    initWithStoredValues: false,
    callback: (value) => {
        isLoadingReportData = value ?? false;
        checkServerDataReady();
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
