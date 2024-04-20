import type {OnyxCollection} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import type {SelectedPurposeType} from '@pages/OnboardingPurpose/BaseOnboardingPurpose';
import ONYXKEYS from '@src/ONYXKEYS';
import type OnyxPolicy from '@src/types/onyx/Policy';
import type {EmptyObject} from '@src/types/utils/EmptyObject';
import type Onboarding from '@src/types/onyx/Onboarding';
import { isObject } from 'lodash';

let hasSelectedPurpose: boolean | undefined;
let hasProvidedPersonalDetails: boolean | undefined;
let onboarding: Onboarding | [];
let hasDismissedModal: boolean | undefined;
let isLoadingReportData = true;

type DetermineOnboardingStatusProps = {
    onAble?: () => void;
    onNotAble?: () => void;
};

type HasCompletedOnboardingFlowProps = {
    onCompleted?: () => void;
    onNotCompleted?: () => void;
};

let resolveIsReadyPromise: (value?: Promise<void>) => void | undefined;
const isServerDataReadyPromise = new Promise<void>((resolve) => {
    resolveIsReadyPromise = resolve;
});

let resolveOnboardingFlowStatus: (value?: Promise<void>) => void | undefined;
const isOnboardingFlowStatusKnownPromise = new Promise<void>((resolve) => {
    resolveOnboardingFlowStatus = resolve;
});

function onServerDataReady(): Promise<void> {
    return isServerDataReadyPromise;
}

/**
 * Checks if Onyx keys required to determine the
 * onboarding flow status have been loaded (namely,
 * are not undefined).
 */
function isAbleToDetermineOnboardingStatus({onAble, onNotAble}: DetermineOnboardingStatusProps) {
    const hasRequiredOnyxKeysBeenLoaded = [hasProvidedPersonalDetails, hasSelectedPurpose].every((value) => value !== undefined);

    if (hasRequiredOnyxKeysBeenLoaded) {
        onAble?.();
    } else {
        onNotAble?.();
    }
}

/**
 * A promise returning the onboarding flow status.
 * Returns true if user has completed the onboarding
 * flow, false otherwise.
 */
function isOnboardingFlowCompleted({onCompleted, onNotCompleted}: HasCompletedOnboardingFlowProps) {
    isOnboardingFlowStatusKnownPromise.then(() => {
        console.log("onboardingNVP: ", onboarding);
        if (isObject(onboarding) && onboarding?.hasCompletedGuidedSetupFlow) {
            return;
        }

        console.log("onboarding: ", onboarding);

        const onboardingFlowCompleted = onboarding?.hasCompletedGuidedSetupFlow || onboarding?.hasCompletedGuidedSetupFlow === undefined;

        console.log("onboarding?.hasCompletedGuidedSetupFlow: ", onboarding?.hasCompletedGuidedSetupFlow);

        if (onboardingFlowCompleted) {
            onCompleted?.();
        } else {
            onNotCompleted?.();
        }
    });
}

/**
 * Check that a few requests have completed so that the welcome action can proceed:
 *
 * - Whether we are a first time new expensify user
 * - Whether we have loaded all policies the server knows about
 * - Whether we have loaded all reports the server knows about
 */
function checkOnReady() {
    const hasRequiredOnyxKeysBeenLoaded = [onboarding, hasDismissedModal].every((value) => value !== undefined);

    if (isLoadingReportData || !hasRequiredOnyxKeysBeenLoaded) {
        return;
    }

    resolveIsReadyPromise?.();
}

function getPersonalDetails(accountID: number | undefined) {
    Onyx.connect({
        key: ONYXKEYS.PERSONAL_DETAILS_LIST,
        initWithStoredValues: true,
        callback: (value) => {
            if (!value || !accountID) {
                return;
            }

            hasProvidedPersonalDetails = !!value[accountID]?.firstName && !!value[accountID]?.lastName;
            isAbleToDetermineOnboardingStatus({onAble: resolveOnboardingFlowStatus});
        },
    });
}

function setOnboardingPurposeSelected(value: SelectedPurposeType) {
    Onyx.set(ONYXKEYS.ONBOARDING_PURPOSE_SELECTED, value ?? null);
}

Onyx.connect({
    key: ONYXKEYS.NVP_ONBOARDING,
    initWithStoredValues: true,
    callback: (value) => {
        console.log("ONYXKEYS.NVP_ONBOARDING: ", value);
        onboarding = value;

        checkOnReady();
    },
});

Onyx.connect({
    key: ONYXKEYS.NVP_INTRO_SELECTED,
    initWithStoredValues: true,
    callback: (value) => {
        hasSelectedPurpose = !!value;
        isAbleToDetermineOnboardingStatus({onAble: resolveOnboardingFlowStatus});
    },
});

Onyx.connect({
    key: ONYXKEYS.NVP_HAS_DISMISSED_IDLE_PANEL,
    initWithStoredValues: true,
    callback: (value) => {
        hasDismissedModal = value ?? false;

        checkOnReady();
    },
});

Onyx.connect({
    key: ONYXKEYS.IS_LOADING_REPORT_DATA,
    initWithStoredValues: false,
    callback: (value) => {
        isLoadingReportData = value ?? false;
        checkOnReady();
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
    key: ONYXKEYS.SESSION,
    callback: (val, key) => {
        if (!val || !key) {
            return;
        }

        getPersonalDetails(val.accountID);
    },
});

export {onServerDataReady, isOnboardingFlowCompleted, setOnboardingPurposeSelected};
