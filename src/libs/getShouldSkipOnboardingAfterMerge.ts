/**
 * Evaluate destination-account eligibility without reading the source account's cached state.
 */
import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

type MergeUpdate = {
    key: string;
    onyxMethod: string;
    value?: unknown;
};

function getShouldSkipOnboardingAfterMerge(updates: MergeUpdate[] = []): boolean {
    let hasCompletedGuidedSetupFlow: boolean | undefined;
    let inviteType: unknown;
    let hasNonPersonalPolicy = false;
    let hasDestinationOnboarding = false;

    for (const update of updates) {
        if (update.onyxMethod !== Onyx.METHOD.SET && update.onyxMethod !== Onyx.METHOD.MERGE) {
            continue;
        }

        if (update.key === ONYXKEYS.NVP_ONBOARDING) {
            const value = update.value;
            if (update.onyxMethod === Onyx.METHOD.SET) {
                hasCompletedGuidedSetupFlow = undefined;
                hasDestinationOnboarding = false;
            }
            if (value === null) {
                hasCompletedGuidedSetupFlow = undefined;
                hasDestinationOnboarding = true;
            }
            // Transition flags alone are not evidence of the destination's persisted onboarding state.
            if (value && typeof value === 'object' && 'hasCompletedGuidedSetupFlow' in value) {
                hasCompletedGuidedSetupFlow = typeof value.hasCompletedGuidedSetupFlow === 'boolean' ? value.hasCompletedGuidedSetupFlow : undefined;
                hasDestinationOnboarding = true;
            } else if (value && typeof value === 'object' && (Object.keys(value).length === 0 || 'signupQualifier' in value || 'selfTourViewed' in value || 'chatReportID' in value)) {
                hasDestinationOnboarding = true;
            }
        } else if (update.key === ONYXKEYS.NVP_INTRO_SELECTED) {
            const value = update.value;
            if (update.onyxMethod === Onyx.METHOD.SET || value === null) {
                inviteType = undefined;
            }
            if (value && typeof value === 'object' && 'inviteType' in value) {
                inviteType = value.inviteType ?? undefined;
            }
        } else if (update.key === ONYXKEYS.HAS_NON_PERSONAL_POLICY) {
            hasNonPersonalPolicy = update.value === true;
        }
    }

    // As in hasCompletedGuidedSetupFlowSelector, an empty destination NVP counts as completed.
    return (hasDestinationOnboarding && hasCompletedGuidedSetupFlow !== false) || inviteType !== undefined || hasNonPersonalPolicy;
}

export default getShouldSkipOnboardingAfterMerge;
