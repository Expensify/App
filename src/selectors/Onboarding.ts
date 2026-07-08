import isTrackOnboardingChoice from '@libs/OnboardingUtils';

import type ONYXKEYS from '@src/ONYXKEYS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import type {OnyxValue} from 'react-native-onyx';

/**
 * Selector to get the value of hasCompletedGuidedSetupFlow from the Onyx store
 *
 * `undefined` means the value is not loaded yet
 * `true` means the user has completed the NewDot onboarding flow
 * `false` means the user has not completed the NewDot onboarding flow
 */
function hasCompletedGuidedSetupFlowSelector(onboarding: OnyxValue<typeof ONYXKEYS.NVP_ONBOARDING>): boolean | undefined {
    // Onboarding is an empty object for old accounts and accounts migrated from OldDot
    if (isEmptyObject(onboarding)) {
        return true;
    }

    if (!isEmptyObject(onboarding) && onboarding?.hasCompletedGuidedSetupFlow === undefined) {
        return true;
    }

    return onboarding?.hasCompletedGuidedSetupFlow;
}

/**
 * Selector to get the value of completedHybridAppOnboarding from the Onyx store
 *
 * `undefined` means the value is not loaded yet
 * `true` means the user has completed the hybrid app onboarding flow
 * `false` means the user has not completed the hybrid app onboarding flow
 */
function tryNewDotOnyxSelector(tryNewDotData: OnyxValue<typeof ONYXKEYS.NVP_TRY_NEW_DOT>): {isHybridAppOnboardingCompleted: boolean | undefined; hasBeenAddedToNudgeMigration: boolean} {
    let isHybridAppOnboardingCompleted = tryNewDotData?.classicRedirect?.completedHybridAppOnboarding;
    const hasBeenAddedToNudgeMigration = !!tryNewDotData?.nudgeMigration?.timestamp;

    // Backend might return strings instead of booleans
    if (typeof isHybridAppOnboardingCompleted === 'string') {
        isHybridAppOnboardingCompleted = isHybridAppOnboardingCompleted === 'true';
    }

    return {isHybridAppOnboardingCompleted, hasBeenAddedToNudgeMigration};
}

/**
 * Selector to get the value of selfTourViewed from the Onyx store
 *
 * `undefined` means the value is not loaded yet
 * `true` means the user has completed the NewDot onboarding flow
 * `false` means the user has not completed the NewDot onboarding flow
 */
function hasSeenTourSelector(onboarding: OnyxValue<typeof ONYXKEYS.NVP_ONBOARDING>): boolean | undefined {
    if (isEmptyObject(onboarding)) {
        return false;
    }

    return !!onboarding?.selfTourViewed;
}

/**
 * Selector to get the value of nvp_introSelected NVP from the Onyx Store
 *
 * `undefined` means the value is not loaded yet
 * `true` means they were invited to NewDot
 * `false` means they are an organic sign-in
 */
function wasInvitedToNewDotSelector(introSelected: OnyxValue<typeof ONYXKEYS.NVP_INTRO_SELECTED>): boolean | undefined {
    return introSelected?.inviteType !== undefined;
}

/**
 * Combined selector that derives both the self-tour status and the guided-setup
 * completion flag from a single NVP_ONBOARDING read, avoiding two subscriptions
 * to the same key from callers that need both.
 */
function guidedSetupAndTourStatusSelector(onboarding: OnyxValue<typeof ONYXKEYS.NVP_ONBOARDING>): {isSelfTourViewed: boolean | undefined; hasCompletedGuidedSetupFlow: boolean | undefined} {
    return {
        isSelfTourViewed: hasSeenTourSelector(onboarding),
        hasCompletedGuidedSetupFlow: hasCompletedGuidedSetupFlowSelector(onboarding),
    };
}

/**
 * Selector to check if the user selected a track-intent onboarding choice
 */
function isTrackIntentUserSelector(introSelected: OnyxValue<typeof ONYXKEYS.NVP_INTRO_SELECTED>): boolean {
    return isTrackOnboardingChoice(introSelected?.choice);
}

export {hasCompletedGuidedSetupFlowSelector, tryNewDotOnyxSelector, hasSeenTourSelector, wasInvitedToNewDotSelector, guidedSetupAndTourStatusSelector, isTrackIntentUserSelector};
