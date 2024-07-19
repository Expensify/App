import {NativeModules} from 'react-native';
import type {OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import * as API from '@libs/API';
import {WRITE_COMMANDS} from '@libs/API/types';
import Navigation from '@libs/Navigation/Navigation';
import variables from '@styles/variables';
import type {OnboardingPurposeType} from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type Onboarding from '@src/types/onyx/Onboarding';
import type TryNewDot from '@src/types/onyx/TryNewDot';

type OnboardingData = Onboarding | [] | undefined;

let isLoadingReportData = true;
let tryNewDotData: TryNewDot | undefined;

type HasCompletedOnboardingFlowProps = {
    onCompleted?: () => void;
    onNotCompleted?: () => void;
};

type HasOpenedForTheFirstTimeFromHybridAppProps = {
    onFirstTimeInHybridApp?: () => void;
    onSubsequentRuns?: () => void;
};

let resolveIsReadyPromise: (value?: Promise<void>) => void | undefined;
let isServerDataReadyPromise = new Promise<void>((resolve) => {
    resolveIsReadyPromise = resolve;
});

let resolveOnboardingFlowStatus: (value?: OnboardingData) => void;
let isOnboardingFlowStatusKnownPromise = new Promise<OnboardingData>((resolve) => {
    resolveOnboardingFlowStatus = resolve;
});

let resolveTryNewDotStatus: (value?: Promise<void>) => void | undefined;
const tryNewDotStatusPromise = new Promise<void>((resolve) => {
    resolveTryNewDotStatus = resolve;
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
 * Determines whether the application is being launched for the first time by a hybrid app user,
 * and executes corresponding callback functions.
 */
function isFirstTimeHybridAppUser({onFirstTimeInHybridApp, onSubsequentRuns}: HasOpenedForTheFirstTimeFromHybridAppProps) {
    tryNewDotStatusPromise.then(() => {
        let completedHybridAppOnboarding = tryNewDotData?.classicRedirect?.completedHybridAppOnboarding;
        // Backend might return strings instead of booleans
        if (typeof completedHybridAppOnboarding === 'string') {
            completedHybridAppOnboarding = completedHybridAppOnboarding === 'true';
        }

        if (NativeModules.HybridAppModule && !completedHybridAppOnboarding) {
            onFirstTimeInHybridApp?.();
            return;
        }

        onSubsequentRuns?.();
    });
}

/**
 * Handles HybridApp onboarding flow if it's possible and necessary.
 */
function handleHybridAppOnboarding() {
    if (!NativeModules.HybridAppModule) {
        return;
    }

    isFirstTimeHybridAppUser({
        // When user opens New Expensify for the first time from HybridApp we always want to show explanation modal first.
        onFirstTimeInHybridApp: () => Navigation.navigate(ROUTES.EXPLANATION_MODAL_ROOT),
        // In other scenarios we need to check if onboarding was completed.
        onSubsequentRuns: () =>
            isOnboardingFlowCompleted({
                onNotCompleted: () =>
                    setTimeout(() => {
                        Navigation.navigate(ROUTES.ONBOARDING_ROOT);
                    }, variables.explanationModalDelay),
            }),
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

/**
 * Check if user completed HybridApp onboarding
 */
function checkTryNewDotDataReady() {
    if (tryNewDotData === undefined) {
        return;
    }

    resolveTryNewDotStatus?.();
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

function completeHybridAppOnboarding() {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.NVP_TRYNEWDOT,
            value: {
                classicRedirect: {
                    completedHybridAppOnboarding: true,
                },
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.NVP_TRYNEWDOT,
            value: {
                classicRedirect: {
                    completedHybridAppOnboarding: false,
                },
            },
        },
    ];

    API.write(WRITE_COMMANDS.COMPLETE_HYBRID_APP_ONBOARDING, {}, {optimisticData, failureData});
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

Onyx.connect({
    key: ONYXKEYS.NVP_TRYNEWDOT,
    callback: (value) => {
        tryNewDotData = value;
        checkTryNewDotDataReady();
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
    completeHybridAppOnboarding,
    handleHybridAppOnboarding,
    setOnboardingErrorMessage,
};
