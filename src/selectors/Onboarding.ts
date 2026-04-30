import type {OnyxValue} from 'react-native-onyx';
import type ONYXKEYS from '@src/ONYXKEYS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

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

    if (onboarding?.hasCompletedGuidedSetupFlow === true) {
        return true;
    }

    if (onboarding?.hasCompletedGuidedSetupFlow === false) {
        return false;
    }

    // Partial NVP before hasCompletedGuidedSetupFlow is set (e.g. OD → NewDot signup with signupQualifier only).
    // Those users must see guided onboarding; treating them as completed hides the onboarding modal (issue #89010).
    if (onboarding?.signupQualifier !== undefined) {
        return false;
    }

    // Legacy accounts with onboarding keys but no guided-setup flag — assume completed
    return true;
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

export {hasCompletedGuidedSetupFlowSelector, tryNewDotOnyxSelector, hasSeenTourSelector, wasInvitedToNewDotSelector};
