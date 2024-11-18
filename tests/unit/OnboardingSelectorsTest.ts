import type {OnyxValue} from 'react-native-onyx';
import {hasCompletedGuidedSetupFlowSelector} from '@libs/onboardingSelectors';
import CONST from '@src/CONST';
import type ONYXKEYS from '@src/ONYXKEYS';

describe('onboardingSelectors', () => {
    describe('hasCompletedGuidedSetupFlowSelector', () => {
        it('Should return true if onboarding nvp is array ', () => {
            const onboarding = [] as OnyxValue<typeof ONYXKEYS.NVP_ONBOARDING>;
            expect(hasCompletedGuidedSetupFlowSelector(onboarding)).toBe(true);
        });
        it('Should return true if onboarding nvp is {}', () => {
            const onboarding = {} as OnyxValue<typeof ONYXKEYS.NVP_ONBOARDING>;
            expect(hasCompletedGuidedSetupFlowSelector(onboarding)).toBe(true);
        });
        it('Should return true if onboarding nvp contains only signupQualifier', () => {
            const onboarding = {signupQualifier: CONST.ONBOARDING_SIGNUP_QUALIFIERS.VSB} as OnyxValue<typeof ONYXKEYS.NVP_ONBOARDING>;
            expect(hasCompletedGuidedSetupFlowSelector(onboarding)).toBe(true);
        });
        it('Should return true if onboarding nvp contains hasCompletedGuidedSetupFlow = true', () => {
            const onboarding = {hasCompletedGuidedSetupFlow: true} as OnyxValue<typeof ONYXKEYS.NVP_ONBOARDING>;
            expect(hasCompletedGuidedSetupFlowSelector(onboarding)).toBe(true);
        });
        it('Should return false if onboarding nvp contains hasCompletedGuidedSetupFlow = false', () => {
            const onboarding = {hasCompletedGuidedSetupFlow: false} as OnyxValue<typeof ONYXKEYS.NVP_ONBOARDING>;
            expect(hasCompletedGuidedSetupFlowSelector(onboarding)).toBe(false);
        });
        it('Should return true if onboarding nvp contains only selfTourViewed', () => {
            const onboarding = {selfTourViewed: true} as OnyxValue<typeof ONYXKEYS.NVP_ONBOARDING>;
            expect(hasCompletedGuidedSetupFlowSelector(onboarding)).toBe(true);
        });
    });
});
