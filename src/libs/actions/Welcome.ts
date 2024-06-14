import {NativeModules} from 'react-native';
import type {OnyxCollection} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import type {OnboardingPurposeType} from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type Onboarding from '@src/types/onyx/Onboarding';
import type OnyxPolicy from '@src/types/onyx/Policy';
import type {EmptyObject} from '@src/types/utils/EmptyObject';

let onboarding: Onboarding | [] | undefined;
let isLoadingReportData = true;
let hasSeenNewUserModal: boolean | null | undefined;

type HasCompletedOnboardingFlowProps = {
    onCompleted?: () => void;
    onNotCompleted?: () => void;
};

type HasOpenedForTheFirstTimeFromHybridAppProps = {
    onFirstTimeInHybridApp?: () => void;
    onSubsequentRunsOrNotInHybridApp?: () => void;
};

let resolveIsReadyPromise: (value?: Promise<void>) => void | undefined;
let isServerDataReadyPromise = new Promise<void>((resolve) => {
    resolveIsReadyPromise = resolve;
});

let resolveOnboardingFlowStatus: (value?: Promise<void>) => void | undefined;
let isOnboardingFlowStatusKnownPromise = new Promise<void>((resolve) => {
    resolveOnboardingFlowStatus = resolve;
});

let resolveNewUserModalStatus: (value?: Promise<void>) => void | undefined;
const hasSeenNewUserModalStatusPromise = new Promise<void>((resolve) => {
    resolveNewUserModalStatus = resolve;
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
 * Determines whether the application is being launched for the first time by a hybrid app user,
 * and executes corresponding callback functions.
 */
function isFirstTimeHybridAppUser({onFirstTimeInHybridApp, onSubsequentRunsOrNotInHybridApp}: HasOpenedForTheFirstTimeFromHybridAppProps) {
    hasSeenNewUserModalStatusPromise.then(() => {
        if (NativeModules.HybridAppModule && !hasSeenNewUserModal) {
            onFirstTimeInHybridApp?.();
            return;
        }

        onSubsequentRunsOrNotInHybridApp?.();
    });
}

/**
 * Check that a few requests have completed so that the welcome action can proceed:
 *
 * - Whether we are a first time new expensify user
 * - Whether we have loaded all policies the server knows about
 * - Whether we have loaded all reports the server knows about
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

/**
 * Check if user saw explanation modal and dismissed it
 */
function checkNewUserModalDataReady() {
    if (hasSeenNewUserModal === undefined) {
        return;
    }

    resolveNewUserModalStatus?.();
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

function setHasSeenNewUserModal() {
    Onyx.set(ONYXKEYS.NVP_SEEN_NEW_USER_MODAL, true);
}

Onyx.connect({
    key: ONYXKEYS.NVP_ONBOARDING,
    initWithStoredValues: false,
    callback: (value) => {
        if (value === undefined) {
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
    key: ONYXKEYS.NVP_SEEN_NEW_USER_MODAL,
    callback: (value) => {
        hasSeenNewUserModal = value;
        checkNewUserModalDataReady();
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

export {
    onServerDataReady,
    isOnboardingFlowCompleted,
    setOnboardingPurposeSelected,
    resetAllChecks,
    setOnboardingAdminsChatReportID,
    setOnboardingPolicyID,
    isFirstTimeHybridAppUser,
    setHasSeenNewUserModal,
};
