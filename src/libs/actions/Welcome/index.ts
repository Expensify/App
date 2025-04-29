import HybridAppModule from '@expensify/react-native-hybrid-app';
import type {OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import * as API from '@libs/API';
import {SIDE_EFFECT_REQUEST_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import DateUtils from '@libs/DateUtils';
import Log from '@libs/Log';
import Navigation from '@libs/Navigation/Navigation';
import CONFIG from '@src/CONFIG';
import type {OnboardingCompanySize} from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {OnboardingPurpose} from '@src/types/onyx';
import type Onboarding from '@src/types/onyx/Onboarding';
import type TryNewDot from '@src/types/onyx/TryNewDot';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import {clearInitialPath} from './OnboardingFlow';

type OnboardingData = Onboarding | undefined;

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
        if (isEmptyObject(onboarding) || onboarding?.hasCompletedGuidedSetupFlow === undefined) {
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

function setOnboardingCompanySize(value: OnboardingCompanySize) {
    Onyx.set(ONYXKEYS.ONBOARDING_COMPANY_SIZE, value);
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

function updateOnboardingValuesAndNavigation(onboardingValues: Onboarding | undefined) {
    Onyx.set(ONYXKEYS.NVP_ONBOARDING, {...onboardingValues, shouldValidate: undefined});

    // We need to have the Onyx values updated before navigating back
    // Because we navigate based no useEffect logic and we need to clear `shouldValidate` value before going back
    Navigation.setNavigationActionToMicrotaskQueue(() => {
        Navigation.goBack(ROUTES.ONBOARDING_WORK_EMAIL.getRoute());
    });
}

function setOnboardingMergeAccountStepValue(value: boolean) {
    Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {isMergeAccountStepCompleted: value});
}
function completeHybridAppOnboarding() {
    if (!CONFIG.IS_HYBRID_APP) {
        return;
    }

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.NVP_TRY_NEW_DOT,
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
        HybridAppModule.completeOnboarding({status: true});
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
    key: ONYXKEYS.NVP_TRY_NEW_DOT,
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
    clearInitialPath();
}

function setSelfTourViewed(shouldUpdateOnyxDataOnlyLocally = false) {
    if (shouldUpdateOnyxDataOnlyLocally) {
        Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {selfTourViewed: true});
        return;
    }

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.NVP_ONBOARDING,
            value: {
                selfTourViewed: true,
            },
        },
    ];

    API.write(WRITE_COMMANDS.SELF_TOUR_VIEWED, null, {optimisticData});
}

function dismissProductTraining(elementName: string, isDismissedUsingCloseButton = false) {
    const date = new Date();
    const dismissedMethod = isDismissedUsingCloseButton ? 'x' : 'click';
    const optimisticData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.NVP_DISMISSED_PRODUCT_TRAINING,
            value: {
                [elementName]: {
                    timestamp: DateUtils.getDBTime(date.valueOf()),
                    dismissedMethod,
                },
            },
        },
    ];
    API.write(WRITE_COMMANDS.DISMISS_PRODUCT_TRAINING, {name: elementName, dismissedMethod}, {optimisticData});
}

export {
    onServerDataReady,
    isOnboardingFlowCompleted,
    dismissProductTraining,
    setOnboardingPurposeSelected,
    updateOnboardingLastVisitedPath,
    resetAllChecks,
    setOnboardingAdminsChatReportID,
    setOnboardingPolicyID,
    completeHybridAppOnboarding,
    setOnboardingErrorMessage,
    setOnboardingCompanySize,
    setSelfTourViewed,
    setOnboardingMergeAccountStepValue,
    updateOnboardingValuesAndNavigation,
};
