import type {OnyxValue} from 'react-native-onyx';
import {hasCompletedGuidedSetupFlowSelector} from '@libs/onboardingSelectors';
import CONST from '@src/CONST';
import type ONYXKEYS from '@src/ONYXKEYS';

describe('onboardingSelectors', () => {
    // Not all users have this NVP defined as we did not run a migration to backfill it for existing accounts, hence we need to make sure
    // the onboarding flow is only showed to the users with `hasCompletedGuidedSetupFlow` set to false
    describe('hasCompletedGuidedSetupFlowSelector', () => {
        it('Should return true if onboarding NVP is an empty object', () => {
            const onboarding = {} as OnyxValue<typeof ONYXKEYS.NVP_ONBOARDING>;
            expect(hasCompletedGuidedSetupFlowSelector(onboarding)).toBe(true);
        });
        it('Should return true if onboarding NVP contains only signupQualifier', () => {
            const onboarding = {signupQualifier: CONST.ONBOARDING_SIGNUP_QUALIFIERS.VSB} as OnyxValue<typeof ONYXKEYS.NVP_ONBOARDING>;
            expect(hasCompletedGuidedSetupFlowSelector(onboarding)).toBe(true);
        });
        it('Should return true if onboarding NVP contains hasCompletedGuidedSetupFlow = true', () => {
            const onboarding = {hasCompletedGuidedSetupFlow: true} as OnyxValue<typeof ONYXKEYS.NVP_ONBOARDING>;
            expect(hasCompletedGuidedSetupFlowSelector(onboarding)).toBe(true);
        });
        it('Should return false if onboarding NVP contains hasCompletedGuidedSetupFlow = false', () => {
            const onboarding = {hasCompletedGuidedSetupFlow: false} as OnyxValue<typeof ONYXKEYS.NVP_ONBOARDING>;
            expect(hasCompletedGuidedSetupFlowSelector(onboarding)).toBe(false);
        });
        it('Should return true if onboarding NVP contains only selfTourViewed', () => {
            const onboarding = {selfTourViewed: true} as OnyxValue<typeof ONYXKEYS.NVP_ONBOARDING>;
            expect(hasCompletedGuidedSetupFlowSelector(onboarding)).toBe(true);
        });
    });
});
