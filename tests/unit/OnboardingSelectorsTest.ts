import {hasCompletedGuidedSetupFlowSelector, hasSeenTourSelector} from '@selectors/Onboarding';
import type {OnyxValue} from 'react-native-onyx';
import CONST from '@src/CONST';
import type ONYXKEYS from '@src/ONYXKEYS';

describe('onboardingSelectors', () => {
    // Not all users have hasCompletedGuidedSetupFlow backfilled; legacy partial NVPs should not strand new signups
    // (e.g. signupQualifier without the flag must still be treated as incomplete guided setup).
    describe('hasCompletedGuidedSetupFlowSelector', () => {
        it('Should return true if onboarding NVP is an empty object', () => {
            const onboarding = {} as OnyxValue<typeof ONYXKEYS.NVP_ONBOARDING>;
            expect(hasCompletedGuidedSetupFlowSelector(onboarding)).toBe(true);
        });
        it('Should return false if onboarding NVP contains only signupQualifier (guided flow not finished)', () => {
            const onboarding = {signupQualifier: CONST.ONBOARDING_SIGNUP_QUALIFIERS.VSB} as OnyxValue<typeof ONYXKEYS.NVP_ONBOARDING>;
            expect(hasCompletedGuidedSetupFlowSelector(onboarding)).toBe(false);
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

    describe('hasSeenTourSelector', () => {
        it('Should return false if onboarding NVP is an empty object', () => {
            const onboarding = {} as OnyxValue<typeof ONYXKEYS.NVP_ONBOARDING>;
            expect(hasSeenTourSelector(onboarding)).toBe(false);
        });

        it('Should return false if onboarding NVP is undefined (treated as empty)', () => {
            expect(hasSeenTourSelector(undefined)).toBe(false);
        });

        it('Should return false if onboarding NVP has selfTourViewed = false', () => {
            const onboarding = {selfTourViewed: false} as OnyxValue<typeof ONYXKEYS.NVP_ONBOARDING>;
            expect(hasSeenTourSelector(onboarding)).toBe(false);
        });

        it('Should return true if onboarding NVP has selfTourViewed = true', () => {
            const onboarding = {selfTourViewed: true} as OnyxValue<typeof ONYXKEYS.NVP_ONBOARDING>;
            expect(hasSeenTourSelector(onboarding)).toBe(true);
        });

        it('Should return false if onboarding NVP has no selfTourViewed field', () => {
            const onboarding = {hasCompletedGuidedSetupFlow: true} as OnyxValue<typeof ONYXKEYS.NVP_ONBOARDING>;
            expect(hasSeenTourSelector(onboarding)).toBe(false);
        });

        it('Should return false if onboarding NVP contains only signupQualifier', () => {
            const onboarding = {signupQualifier: CONST.ONBOARDING_SIGNUP_QUALIFIERS.VSB} as OnyxValue<typeof ONYXKEYS.NVP_ONBOARDING>;
            expect(hasSeenTourSelector(onboarding)).toBe(false);
        });
    });
});
