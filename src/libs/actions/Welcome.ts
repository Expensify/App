import {NativeModules} from 'react-native';
import Onyx from 'react-native-onyx';
import Log from '@libs/Log';
import Navigation from '@libs/Navigation/Navigation';
import variables from '@styles/variables';
import type {OnboardingPurposeType} from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type Onboarding from '@src/types/onyx/Onboarding';

type OnboardingData = Onboarding | [] | undefined;

let isLoadingReportData = true;

type HasCompletedOnboardingFlowProps = {
    onCompleted?: () => void;
    onNotCompleted?: () => void;
};

let resolveIsReadyPromise: (value?: Promise<void>) => void | undefined;
let isServerDataReadyPromise = new Promise<void>((resolve) => {
    resolveIsReadyPromise = resolve;
});

let resolveOnboardingFlowStatus: (value?: OnboardingData) => void;
let isOnboardingFlowStatusKnownPromise = new Promise<OnboardingData>((resolve) => {
    resolveOnboardingFlowStatus = resolve;
});

function onServerDataReady(): Promise<void> {
    return isServerDataReadyPromise;
}

function isOnboardingFlowCompleted({onCompleted, onNotCompleted}: HasCompletedOnboardingFlowProps) {
    isOnboardingFlowStatusKnownPromise.then((onboarding) => {
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
 * Handles HybridApp onboarding.
 */
function handleHybridAppOnboarding() {
    if (!NativeModules.HybridAppModule) {
        return;
    }

    NativeModules.HybridAppModule.getOnboardingStatus()
        .then((completed) => {
            if (completed) {
                isOnboardingFlowCompleted({
                    onNotCompleted: () =>
                        setTimeout(() => {
                            Navigation.navigate(ROUTES.ONBOARDING_ROOT.route);
                        }, variables.explanationModalDelay),
                });
                return;
            }

            Navigation.navigate(ROUTES.EXPLANATION_MODAL_ROOT);
        })
        .catch((error) => {
            Log.hmmm('[HybridApp] Something went wrong during retrieving onboarding status. This should not happen', {error});
        });
}

/**
 * Check if report data are loaded
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

function setOnboardingErrorMessage(value: string) {
    Onyx.set(ONYXKEYS.ONBOARDING_ERROR_MESSAGE, value ?? null);
}

function setOnboardingAdminsChatReportID(adminsChatReportID?: string) {
    Onyx.set(ONYXKEYS.ONBOARDING_ADMINS_CHAT_REPORT_ID, adminsChatReportID ?? null);
}

function setOnboardingPolicyID(policyID?: string) {
    Onyx.set(ONYXKEYS.ONBOARDING_POLICY_ID, policyID ?? null);
}

Onyx.connect({
    key: ONYXKEYS.NVP_ONBOARDING,
    callback: (value) => {
        if (value === undefined) {
            return;
        }

        resolveOnboardingFlowStatus(value);
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

function resetAllChecks() {
    isServerDataReadyPromise = new Promise((resolve) => {
        resolveIsReadyPromise = resolve;
    });
    isOnboardingFlowStatusKnownPromise = new Promise<OnboardingData>((resolve) => {
        resolveOnboardingFlowStatus = resolve;
    });
    isLoadingReportData = true;
}

export {
    onServerDataReady,
    isOnboardingFlowCompleted,
    setOnboardingPurposeSelected,
    resetAllChecks,
    setOnboardingAdminsChatReportID,
    setOnboardingPolicyID,
    handleHybridAppOnboarding,
    setOnboardingErrorMessage,
};
