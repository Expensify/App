import getShouldSkipOnboardingAfterMerge from '@libs/getShouldSkipOnboardingAfterMerge';

import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

describe('getShouldSkipOnboardingAfterMerge', () => {
    it.each([
        {name: 'completed onboarding', key: ONYXKEYS.NVP_ONBOARDING, value: {hasCompletedGuidedSetupFlow: true}},
        {name: 'empty onboarding', key: ONYXKEYS.NVP_ONBOARDING, value: {}},
        {name: 'removed onboarding', key: ONYXKEYS.NVP_ONBOARDING, value: null},
        {name: 'invited account', key: ONYXKEYS.NVP_INTRO_SELECTED, value: {inviteType: 'workspace'}},
        {name: 'group workspace', key: ONYXKEYS.HAS_NON_PERSONAL_POLICY, value: true},
    ])('skips for $name from the destination response', ({key, value}) => {
        // Given an established destination, independently of the source account's cached values.
        const updates = [{onyxMethod: Onyx.METHOD.SET, key, value}];
        // When deciding whether to continue onboarding from the merge response.
        const shouldSkip = getShouldSkipOnboardingAfterMerge(updates);
        // Then onboarding is dismissed without completing it again.
        expect(shouldSkip).toBe(true);
    });

    it.each([
        {updates: []},
        {updates: [{onyxMethod: Onyx.METHOD.MERGE, key: ONYXKEYS.NVP_ONBOARDING, value: {isMergeAccountStepCompleted: true}}]},
        {updates: [{onyxMethod: Onyx.METHOD.SET, key: ONYXKEYS.NVP_ONBOARDING, value: {isMergeAccountStepCompleted: true}}]},
        {updates: [{onyxMethod: Onyx.METHOD.SET, key: ONYXKEYS.NVP_ONBOARDING, value: {hasCompletedGuidedSetupFlow: false}}]},
    ])('does not infer completion from incomplete or omitted destination data (%#)', ({updates}) => {
        // Given a response without evidence of an established destination.
        // When evaluating eligibility without falling back to source-account state.
        const shouldSkip = getShouldSkipOnboardingAfterMerge(updates);
        // Then the response does not authorize skipping onboarding.
        expect(shouldSkip).toBe(false);
    });

    it('applies ordered SET and MERGE updates without retaining overwritten fields', () => {
        // Given a completed, invited account whose later response updates reset both states.
        const updates = [
            {onyxMethod: Onyx.METHOD.SET, key: ONYXKEYS.NVP_ONBOARDING, value: {hasCompletedGuidedSetupFlow: true}},
            {onyxMethod: Onyx.METHOD.MERGE, key: ONYXKEYS.NVP_ONBOARDING, value: {hasCompletedGuidedSetupFlow: false}},
            {onyxMethod: Onyx.METHOD.MERGE, key: ONYXKEYS.NVP_ONBOARDING, value: {isMergeAccountStepCompleted: true}},
            {onyxMethod: Onyx.METHOD.SET, key: ONYXKEYS.NVP_INTRO_SELECTED, value: {inviteType: 'workspace'}},
            {onyxMethod: Onyx.METHOD.SET, key: ONYXKEYS.NVP_INTRO_SELECTED, value: {}},
            {onyxMethod: Onyx.METHOD.SET, key: ONYXKEYS.HAS_NON_PERSONAL_POLICY, value: true},
            {onyxMethod: Onyx.METHOD.SET, key: ONYXKEYS.HAS_NON_PERSONAL_POLICY, value: false},
        ];
        // When the updates are evaluated in server order.
        const shouldSkip = getShouldSkipOnboardingAfterMerge(updates);
        // Then obsolete eligibility values do not skip the destination's onboarding.
        expect(shouldSkip).toBe(false);
    });
});
