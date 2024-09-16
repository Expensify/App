import type {OnyxValue} from 'react-native-onyx';
import type ONYXKEYS from '@src/ONYXKEYS';

function hasCompletedGuidedSetupFlowSelector(onboarding: OnyxValue<typeof ONYXKEYS.NVP_ONBOARDING>): boolean {
    // onboarding is an array for old accounts and accounts created from olddot
    if (Array.isArray(onboarding)) {
        return true;
    }

    return onboarding?.hasCompletedGuidedSetupFlow ?? true;
}

export default hasCompletedGuidedSetupFlowSelector;
