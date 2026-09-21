import * as API from '@libs/API';
import {SIDE_EFFECT_REQUEST_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import DateUtils from '@libs/DateUtils';
import {getMicroSecondOnyxErrorWithMessage} from '@libs/ErrorUtils';
import Log from '@libs/Log';
import Navigation from '@libs/Navigation/Navigation';
import {prepareOnboardingOnyxData} from '@libs/ReportUtils';

import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import type {OnboardingAccounting} from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import INPUT_IDS from '@src/types/form/OnboardingWorkEmailForm';
import type {OnboardingPurpose} from '@src/types/onyx';
import type Onboarding from '@src/types/onyx/Onboarding';
import type OnboardingRHPVariant from '@src/types/onyx/OnboardingRHPVariant';
import type Report from '@src/types/onyx/Report';

import type {OnyxEntry, OnyxUpdate} from 'react-native-onyx';

import HybridAppModule from '@expensify/react-native-hybrid-app';
import Onyx from 'react-native-onyx';

import type {OnboardingCompanySize} from './OnboardingFlow';

import {getOnboardingMessages} from './OnboardingFlow';

type JoinWorkspaceOnboardingContentType = 'validateEmail' | 'joinWorkspace' | 'empty';

let isLoadingReportData = true;
// Tracks whether we've seen loading start (true) in the current session.
// Without this, a stale persisted `false` from a previous session would
// resolve the onServerDataReady() promise before OpenApp/ReconnectApp completes.
let hasStartedLoading = false;

let resolveIsReadyPromise: (value?: Promise<void>) => void | undefined;
let isServerDataReadyPromise = new Promise<void>((resolve) => {
    resolveIsReadyPromise = resolve;
});

function onServerDataReady(): Promise<void> {
    return isServerDataReadyPromise;
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

function setOnboardingPurposeSelected(value: OnboardingPurpose) {
    Onyx.set(ONYXKEYS.ONBOARDING_PURPOSE_SELECTED, value ?? null);
}

function setOnboardingCompanySize(value: OnboardingCompanySize) {
    Onyx.set(ONYXKEYS.ONBOARDING_COMPANY_SIZE, value);
}

function setOnboardingUserReportedIntegration(value: OnboardingAccounting | null) {
    Onyx.set(ONYXKEYS.ONBOARDING_USER_REPORTED_INTEGRATION, value);
}

function setOnboardingAccountingEnabled(value: boolean | null) {
    Onyx.set(ONYXKEYS.ONBOARDING_ACCOUNTING_ENABLED, value);
}

function setOnboardingInterestedFeaturesMap(value: Array<{id: string; enabled: boolean; enabledByDefault?: boolean; requiresUpdate?: boolean}> | null) {
    Onyx.set(ONYXKEYS.ONBOARDING_INTERESTED_FEATURES_MAP, value);
}
function setOnboardingPersonalTrackGoal(value: string) {
    Onyx.set(ONYXKEYS.ONBOARDING_PERSONAL_TRACK_GOAL, value);
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

function setOnboardingRHPVariant(value?: OnboardingRHPVariant) {
    Onyx.set(ONYXKEYS.NVP_ONBOARDING_RHP_VARIANT, value ?? null);
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

async function clearOnboardingShouldValidate(onboardingValues: Onboarding | undefined) {
    await Onyx.set(ONYXKEYS.NVP_ONBOARDING, {...onboardingValues, shouldValidate: undefined});
}

function setOnboardingMergeAccountStepValue(value: boolean, skipped = false) {
    Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {isMergeAccountStepCompleted: value, isMergeAccountStepSkipped: skipped});
}

function setOnboardingMergingAccountBlocked(value: boolean) {
    Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {isMergingAccountBlocked: value});
}

function createJoinWorkspaceOnboardingContent(
    contentType: JoinWorkspaceOnboardingContentType,
    companyDomain: string,
    workEmail: string,
    conciergeChat: OnyxEntry<Report>,
    delegateAccountID: number | undefined,
) {
    const {joinWorkspaceMessages} = getOnboardingMessages();
    let onboardingMessage = joinWorkspaceMessages.joinWorkspace;
    if (contentType === 'validateEmail') {
        onboardingMessage = joinWorkspaceMessages.validateEmail;
    } else if (contentType === 'empty') {
        onboardingMessage = joinWorkspaceMessages.empty;
    }
    if (contentType !== 'empty') {
        onboardingMessage = {...onboardingMessage, message: ''};
    }
    const onboardingData = prepareOnboardingOnyxData({
        introSelected: {choice: CONST.ONBOARDING_CHOICES.JOIN_WORKSPACE},
        engagementChoice: CONST.ONBOARDING_CHOICES.JOIN_WORKSPACE,
        onboardingMessage,
        companySize: undefined,
        companyDomain,
        workEmail,
        conciergeChat,
        delegateAccountID,
        isIncremental: true,
    });

    if (!onboardingData) {
        return;
    }

    const task = onboardingData.guidedSetupData.find(
        (item) => item.type === 'task' && item.task === (contentType === 'joinWorkspace' ? CONST.ONBOARDING_TASK_TYPE.JOIN_WORKSPACE : CONST.ONBOARDING_TASK_TYPE.VALIDATE_EMAIL),
    );
    const taskReportID = task && 'taskReportID' in task ? task.taskReportID : undefined;

    API.write(
        WRITE_COMMANDS.CREATE_JOIN_WORKSPACE_ONBOARDING_CONTENT,
        {
            event: contentType === 'empty' ? 'noJoinableWorkspacesMessage' : contentType,
            data: JSON.stringify(onboardingData.guidedSetupData),
        },
        {
            optimisticData: onboardingData.optimisticData,
            successData: onboardingData.successData,
            failureData: onboardingData.failureData,
        },
    );

    return taskReportID;
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

        // No matter what the response is, we want to mark the onboarding as completed.
        Log.info(`[HybridApp] Onboarding status has changed. Propagating new value to OldDot`, true);
        HybridAppModule.completeOnboarding({status: true});
    });
}

function addWorkEmailFormError(error: string, isLoading = false) {
    Onyx.merge(ONYXKEYS.FORMS.ONBOARDING_WORK_EMAIL_FORM, {
        errors: getMicroSecondOnyxErrorWithMessage(error),
        errorFields: {
            [INPUT_IDS.ONBOARDING_WORK_EMAIL]: getMicroSecondOnyxErrorWithMessage(error),
        },
        isLoading,
    });
}
function clearWorkEmailFormErrors(isLoading = false) {
    Onyx.merge(ONYXKEYS.FORMS.ONBOARDING_WORK_EMAIL_FORM, {
        errors: null,
        errorFields: null,
        isLoading,
    });
}

function clearOnboardingMergeAccountBlocked() {
    Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {isMergingAccountBlocked: false});
    setOnboardingErrorMessage(null);
    clearWorkEmailFormErrors();
}

// We use `connectWithoutView` here since this connection only to get loading flag
// and doesn't need to trigger component re-renders.
Onyx.connectWithoutView({
    key: ONYXKEYS.IS_LOADING_REPORT_DATA,
    callback: (value) => {
        isLoadingReportData = value ?? false;
        if (isLoadingReportData) {
            hasStartedLoading = true;
        }
        // Only resolve once loading has started — this ensures a stale
        // persisted `false` from a previous session is ignored.
        if (hasStartedLoading) {
            checkServerDataReady();
        }
    },
});

function resetAllChecks() {
    isServerDataReadyPromise = new Promise((resolve) => {
        resolveIsReadyPromise = resolve;
    });
    isLoadingReportData = true;
    hasStartedLoading = false;
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
    dismissProductTraining,
    setOnboardingPurposeSelected,
    updateOnboardingLastVisitedPath,
    resetAllChecks,
    setOnboardingAdminsChatReportID,
    setOnboardingPolicyID,
    setOnboardingRHPVariant,
    completeHybridAppOnboarding,
    setOnboardingErrorMessage,
    setOnboardingCompanySize,
    setSelfTourViewed,
    setOnboardingMergeAccountStepValue,
    setOnboardingMergingAccountBlocked,
    createJoinWorkspaceOnboardingContent,
    updateOnboardingValuesAndNavigation,
    clearOnboardingShouldValidate,
    setOnboardingUserReportedIntegration,
    setOnboardingAccountingEnabled,
    setOnboardingInterestedFeaturesMap,
    setOnboardingPersonalTrackGoal,
    addWorkEmailFormError,
    clearWorkEmailFormErrors,
    clearOnboardingMergeAccountBlocked,
};
