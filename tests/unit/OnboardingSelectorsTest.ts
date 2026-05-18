import {hasCompletedGuidedSetupFlowSelector, hasSeenTourSelector} from '@selectors/Onboarding';
import type {OnyxValue} from 'react-native-onyx';
import CONST from '@src/CONST';
import type ONYXKEYS from '@src/ONYXKEYS';

describe('onboardingSelectors', () => {
    // Not all users have this NVP defined as we did not run a migration to backfill it for existing accounts, hence we need to make sure
    // the onboarding flow is only showed to the users with `hasCompletedGuidedSetupFlow` set to false
    describe('hasCompletedGuidedSetupFlowSelector', () => {
        // Regression test: hasCompletedGuidedSetupFlowSelector returns true for empty onboarding objects (the pre-login default state).
        // The deeplink guard in Link.ts must combine this with a dynamic hasAuthToken() check to prevent premature navigation.
        it('Should return true for empty onboarding (pre-login default), confirming the need for an auth guard in deeplink navigation', () => {
            const emptyOnboarding = {} as OnyxValue<typeof ONYXKEYS.NVP_ONBOARDING>;
            const hasToken = false; // simulates hasAuthToken() returning false before login
            const selectorResult = hasCompletedGuidedSetupFlowSelector(emptyOnboarding);

            // The selector returns true for empty objects (old/migrated accounts), which is correct for its own purpose.
            expect(selectorResult).toBe(true);

            // But the deeplink guard must NOT navigate when the user has no auth token, even if the selector returns true.
            // This is the condition from openReportFromDeepLink: (hasAuthToken() && hasCompletedGuidedSetupFlowSelector(val))
            expect(hasToken && selectorResult).toBe(false);
        });

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
