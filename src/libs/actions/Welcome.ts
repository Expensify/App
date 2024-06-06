import type {OnyxCollection} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import type {OnboardingPurposeType} from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type Onboarding from '@src/types/onyx/Onboarding';
import type OnyxPolicy from '@src/types/onyx/Policy';

let onboarding: Onboarding | [] | undefined;
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
    if (isLoadingReportData) {
        return;
    }

    resolveIsReadyPromise?.();
}

function setOnboardingPurposeSelected(value: OnboardingPurposeType) {
    Onyx.set(ONYXKEYS.ONBOARDING_PURPOSE_SELECTED, value ?? null);
}

function setOnboardingAdminsChatReportID(adminsChatReportID?: string) {
    Onyx.set(ONYXKEYS.ONBOARDING_ADMINS_CHAT_REPORT_ID, adminsChatReportID ?? null);
}

function setOnboardingPolicyID(policyID?: string) {
    Onyx.set(ONYXKEYS.ONBOARDING_POLICY_ID, policyID ?? null);
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
    key: ONYXKEYS.IS_LOADING_REPORT_DATA,
    initWithStoredValues: false,
    callback: (value) => {
        isLoadingReportData = value ?? false;
        checkServerDataReady();
    },
});

const allPolicies: OnyxCollection<OnyxPolicy> = {};
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

export {onServerDataReady, isOnboardingFlowCompleted, setOnboardingPurposeSelected, resetAllChecks, setOnboardingAdminsChatReportID, setOnboardingPolicyID};
