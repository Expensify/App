import {NativeModules} from 'react-native';
import type {OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import * as API from '@libs/API';
import {SIDE_EFFECT_REQUEST_COMMANDS} from '@libs/API/types';
import Log from '@libs/Log';
import ONYXKEYS from '@src/ONYXKEYS';
import type {OnboardingPurpose} from '@src/types/onyx';
import type Onboarding from '@src/types/onyx/Onboarding';
import type TryNewDot from '@src/types/onyx/TryNewDot';
import * as OnboardingFlow from './OnboardingFlow';

type OnboardingData = Onboarding | [] | undefined;

let isLoadingReportData = true;
let tryNewDotData: TryNewDot | undefined;
let onboarding: OnboardingData;

type HasCompletedOnboardingFlowProps = {
    onCompleted?: () => void;
    onNotCompleted?: () => void;
    onCanceled?: () => void;
};

let resolveIsReadyPromise: (value?: Promise<void>) => void | undefined;
let isServerDataReadyPromise = new Promise<void>((resolve) => {
    resolveIsReadyPromise = resolve;
});

let resolveOnboardingFlowStatus: () => void;
let isOnboardingFlowStatusKnownPromise = new Promise<void>((resolve) => {
    resolveOnboardingFlowStatus = resolve;
});

let resolveTryNewDotStatus: (value?: Promise<void>) => void | undefined;

function onServerDataReady(): Promise<void> {
    return isServerDataReadyPromise;
}

let isOnboardingInProgress = false;
function isOnboardingFlowCompleted({onCompleted, onNotCompleted, onCanceled}: HasCompletedOnboardingFlowProps) {
    isOnboardingFlowStatusKnownPromise.then(() => {
        if (Array.isArray(onboarding) || onboarding?.hasCompletedGuidedSetupFlow === undefined) {
            onCanceled?.();
            return;
        }

        if (onboarding?.hasCompletedGuidedSetupFlow) {
            isOnboardingInProgress = false;
            onCompleted?.();
        } else if (!isOnboardingInProgress) {
            isOnboardingInProgress = true;
            onNotCompleted?.();
        }
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

/**
 * Check if the onboarding data is loaded
 */
function checkOnboardingDataReady() {
    if (onboarding === undefined) {
        return;
    }

    resolveOnboardingFlowStatus();
}

function setOnboardingPurposeSelected(value: OnboardingPurpose) {
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

function updateOnboardingLastVisitedPath(path: string) {
    Onyx.merge(ONYXKEYS.ONBOARDING_LAST_VISITED_PATH, path);
}

function completeHybridAppOnboarding() {
    if (!NativeModules.HybridAppModule) {
        return;
    }

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

    // eslint-disable-next-line rulesdir/no-api-side-effects-method
    API.makeRequestWithSideEffects(SIDE_EFFECT_REQUEST_COMMANDS.COMPLETE_HYBRID_APP_ONBOARDING, {}, {optimisticData}).then((response) => {
        if (!response) {
            return;
        }

        // No matter what the response is, we want to mark the onboarding as completed (user saw the explanation modal)
        Log.info(`[HybridApp] Onboarding status has changed. Propagating new value to OldDot`, true);
        NativeModules.HybridAppModule.completeOnboarding(true);
    });
}

Onyx.connect({
    key: ONYXKEYS.NVP_ONBOARDING,
    callback: (value) => {
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
    isOnboardingFlowStatusKnownPromise = new Promise<void>((resolve) => {
        resolveOnboardingFlowStatus = resolve;
    });
    isLoadingReportData = true;
    isOnboardingInProgress = false;
    OnboardingFlow.clearInitialPath();
}

export {
    onServerDataReady,
    isOnboardingFlowCompleted,
    setOnboardingPurposeSelected,
    updateOnboardingLastVisitedPath,
    resetAllChecks,
    setOnboardingAdminsChatReportID,
    setOnboardingPolicyID,
    completeHybridAppOnboarding,
    setOnboardingErrorMessage,
};
