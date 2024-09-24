import {type OnyxValue} from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';

function hasCompletedGuidedSetupFlowSelector(onboarding: OnyxValue<typeof ONYXKEYS.NVP_ONBOARDING>): boolean | undefined {
    // onboarding is an array for old accounts and accounts created from olddot
    if (Array.isArray(onboarding)) {
        return true;
    }

    return onboarding?.hasCompletedGuidedSetupFlow;
}

function hasCompletedHybridAppSetupFlowSelector(tryNewDotData: OnyxValue<typeof ONYXKEYS.NVP_TRYNEWDOT>): boolean | undefined {
    let completedHybridAppOnboarding = tryNewDotData?.classicRedirect?.completedHybridAppOnboarding;
    // Backend might return strings instead of booleans
    if (typeof completedHybridAppOnboarding === 'string') {
        completedHybridAppOnboarding = completedHybridAppOnboarding === 'true';
    }

    return completedHybridAppOnboarding;
}

export {hasCompletedGuidedSetupFlowSelector, hasCompletedHybridAppSetupFlowSelector};
