import HybridAppModule from '@expensify/react-native-hybrid-app';
import type {OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import * as API from '@libs/API';
import {SIDE_EFFECT_REQUEST_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import DateUtils from '@libs/DateUtils';
import Log from '@libs/Log';
import Navigation from '@libs/Navigation/Navigation';
import CONFIG from '@src/CONFIG';
import type {OnboardingAccounting} from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Account, OnboardingPurpose} from '@src/types/onyx';
import type Onboarding from '@src/types/onyx/Onboarding';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import type {OnboardingCompanySize} from './OnboardingFlow';
import {startOnboardingFlow} from './OnboardingFlow';

let isLoadingReportData = true;
let onboarding: Onboarding | undefined;
let account: Account | undefined;

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

function onServerDataReady(): Promise<void> {
    return isServerDataReadyPromise;
}

let isOnboardingInProgress = false;
function isOnboardingFlowCompleted({onCompleted, onNotCompleted, onCanceled}: HasCompletedOnboardingFlowProps) {
    isOnboardingFlowStatusKnownPromise.then(() => {
        // Don't trigger onboarding if we are showing the require 2FA page
        const shouldShowRequire2FAPage = account && !!account.needsTwoFactorAuthSetup && (!account.requiresTwoFactorAuth || !!account.twoFactorAuthSetupInProgress);
        if (shouldShowRequire2FAPage) {
            return;
        }

        if (isEmptyObject(onboarding) || onboarding?.hasCompletedGuidedSetupFlow === undefined) {
            onCanceled?.();
            return;
        }

        // The value `undefined` should not be used here because `testDriveModalDismissed` may not always exist in `onboarding`.
        // So we only compare it to `false` to avoid unintentionally opening the test drive modal.
        if (onboarding?.testDriveModalDismissed === false) {
            Navigation.setNavigationActionToMicrotaskQueue(() => {
                // Check if we're already on the test drive modal route or if navigation is in progress to prevent duplicate navigation
                const currentRoute = Navigation.getActiveRoute();
                if (currentRoute?.includes(ROUTES.TEST_DRIVE_MODAL_ROOT.route)) {
                    return;
                }

                Log.info('[Onboarding] User has not completed the guided setup flow, starting onboarding flow from test drive modal');
                startOnboardingFlow({
                    onboardingInitialPath: ROUTES.TEST_DRIVE_MODAL_ROOT.route,
                    isUserFromPublicDomain: false,
                    hasAccessiblePolicies: false,
                    currentOnboardingCompanySize: undefined,
                    currentOnboardingPurposeSelected: undefined,
                    onboardingValues: onboarding,
                });
            });

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
 * Check if the onboarding data is loaded
 */
function checkOnboardingDataReady() {
    if (onboarding === undefined || account === undefined) {
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

function setOnboardingUserReportedIntegration(value: OnboardingAccounting | null) {
    Onyx.set(ONYXKEYS.ONBOARDING_USER_REPORTED_INTEGRATION, value);
}

function setOnboardingErrorMessage(value: TranslationPaths | null) {
    Onyx.set(ONYXKEYS.ONBOARDING_ERROR_MESSAGE_TRANSLATION_KEY, value);
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

function setOnboardingMergeAccountStepValue(value: boolean, skipped = false) {
    Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {isMergeAccountStepCompleted: value, isMergeAccountStepSkipped: skipped});
}

function setOnboardingTestDriveModalDismissed() {
    Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {testDriveModalDismissed: true});
}

function completeHybridAppOnboarding() {
    if (!CONFIG.IS_HYBRID_APP) {
        return;
    }

    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.NVP_TRY_NEW_DOT>> = [
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

// We use `connectWithoutView` here since this connection only updates a module-level variable
// and doesn't need to trigger component re-renders.
Onyx.connectWithoutView({
    key: ONYXKEYS.ACCOUNT,
    callback: (value) => {
        account = value;
        checkOnboardingDataReady();
    },
});

// We use `connectWithoutView` here since this connection only updates a module-level variable
// and doesn't need to trigger component re-renders.
Onyx.connectWithoutView({
    key: ONYXKEYS.NVP_ONBOARDING,
    callback: (value) => {
        onboarding = value;
        checkOnboardingDataReady();
    },
});

// We use `connectWithoutView` here since this connection only to get loading flag
// and doesn't need to trigger component re-renders.
Onyx.connectWithoutView({
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
    isOnboardingFlowStatusKnownPromise = new Promise<void>((resolve) => {
        resolveOnboardingFlowStatus = resolve;
    });
    isLoadingReportData = true;
    isOnboardingInProgress = false;
}

function setSelfTourViewed(shouldUpdateOnyxDataOnlyLocally = false) {
    if (shouldUpdateOnyxDataOnlyLocally) {
        Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {selfTourViewed: true});
        return;
    }

    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.NVP_ONBOARDING>> = [
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
    setOnboardingUserReportedIntegration,
    setOnboardingTestDriveModalDismissed,
};
