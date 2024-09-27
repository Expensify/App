import {NativeModules} from 'react-native';
import type {OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import * as API from '@libs/API';
import {SIDE_EFFECT_REQUEST_COMMANDS} from '@libs/API/types';
import Log from '@libs/Log';
import Navigation from '@libs/Navigation/Navigation';
import variables from '@styles/variables';
import type {OnboardingPurposeType} from '@src/CONST';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
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
};

type HasOpenedForTheFirstTimeFromHybridAppProps = {
    onFirstTimeInHybridApp?: () => void;
    onSubsequentRuns?: () => void;
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
const tryNewDotStatusPromise = new Promise<void>((resolve) => {
    resolveTryNewDotStatus = resolve;
});

function onServerDataReady(): Promise<void> {
    return isServerDataReadyPromise;
}

let isOnboardingInProgress = false;
function isOnboardingFlowCompleted({onCompleted, onNotCompleted}: HasCompletedOnboardingFlowProps) {
    isOnboardingFlowStatusKnownPromise.then(() => {
        if (Array.isArray(onboarding) || onboarding?.hasCompletedGuidedSetupFlow === undefined) {
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
                        OnboardingFlow.startOnboardingFlow();
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

/**
 * Check if the onboarding data is loaded
 */
function checkOnboardingDataReady() {
    if (onboarding === undefined) {
        return;
    }

    resolveOnboardingFlowStatus();
}

function setOnboardingCustomChoices(value: OnboardingPurposeType[]) {
    Onyx.set(ONYXKEYS.ONBOARDING_CUSTOM_CHOICES, value ?? []);
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

function updateOnboardingLastVisitedPath(path: string) {
    Onyx.merge(ONYXKEYS.ONBOARDING_LAST_VISITED_PATH, path);
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

    // eslint-disable-next-line rulesdir/no-api-side-effects-method
    API.makeRequestWithSideEffects(SIDE_EFFECT_REQUEST_COMMANDS.COMPLETE_HYBRID_APP_ONBOARDING, {}, {optimisticData, failureData}).then((response) => {
        if (!response) {
            return;
        }

        // if the call succeeded HybridApp onboarding is finished, otherwise it's not
        Log.info(`[HybridApp] Onboarding status has changed. Propagating new value to OldDot`, true, {completedHybridAppOnboarding: response?.jsonCode === CONST.JSON_CODE.SUCCESS});
        NativeModules.HybridAppModule.completeOnboarding(response?.jsonCode === CONST.JSON_CODE.SUCCESS);
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
    setOnboardingCustomChoices,
    setOnboardingPurposeSelected,
    updateOnboardingLastVisitedPath,
    resetAllChecks,
    setOnboardingAdminsChatReportID,
    setOnboardingPolicyID,
    completeHybridAppOnboarding,
    handleHybridAppOnboarding,
    setOnboardingErrorMessage,
};
