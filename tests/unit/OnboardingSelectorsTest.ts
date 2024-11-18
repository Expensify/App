import type {OnyxValue} from 'react-native-onyx';
import {hasCompletedGuidedSetupFlowSelector} from '@libs/onboardingSelectors';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

describe('onboardingSelectors', () => {
    describe('hasCompletedGuidedSetupFlowSelector', () => {
        it('Should return true if onboarding nvp is array ', async () => {
            const onboarding = [] as OnyxValue<typeof ONYXKEYS.NVP_ONBOARDING>;
            expect(hasCompletedGuidedSetupFlowSelector(onboarding)).toBe(true);
        });
        it('Should return true if onboarding nvp is {}', async () => {
            const onboarding = {} as OnyxValue<typeof ONYXKEYS.NVP_ONBOARDING>;
            expect(hasCompletedGuidedSetupFlowSelector(onboarding)).toBe(true);
        });
        it('Should return true if onboarding nvp contains only signupQualifier', async () => {
            const onboarding = {signupQualifier: CONST.ONBOARDING_SIGNUP_QUALIFIERS.VSB} as OnyxValue<typeof ONYXKEYS.NVP_ONBOARDING>;
            expect(hasCompletedGuidedSetupFlowSelector(onboarding)).toBe(true);
        });
        it('Should return true if onboarding nvp contains hasCompletedGuidedSetupFlow = true', async () => {
            const onboarding = {hasCompletedGuidedSetupFlow: true} as OnyxValue<typeof ONYXKEYS.NVP_ONBOARDING>;
            expect(hasCompletedGuidedSetupFlowSelector(onboarding)).toBe(true);
        });
        it('Should return false if onboarding nvp contains hasCompletedGuidedSetupFlow = false', async () => {
            const onboarding = {hasCompletedGuidedSetupFlow: false} as OnyxValue<typeof ONYXKEYS.NVP_ONBOARDING>;
            expect(hasCompletedGuidedSetupFlowSelector(onboarding)).toBe(false);
        });
        it('Should return true if onboarding nvp contains only selfTourViewed', async () => {
            const onboarding = {selfTourViewed: true} as OnyxValue<typeof ONYXKEYS.NVP_ONBOARDING>;
            expect(hasCompletedGuidedSetupFlowSelector(onboarding)).toBe(true);
        });
    });
});
