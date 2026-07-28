import CONST from '@src/CONST';
import type ONYXKEYS from '@src/ONYXKEYS';

import type {OnyxValue} from 'react-native-onyx';

import {hasCompletedGuidedSetupFlowSelector, hasSeenTourSelector, isTrackIntentUserSelector} from '@selectors/Onboarding';

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
    describe('isTrackIntentUserSelector', () => {
        it('Should return true for PERSONAL_SPEND choice', () => {
            const introSelected = {choice: CONST.ONBOARDING_CHOICES.PERSONAL_SPEND} as OnyxValue<typeof ONYXKEYS.NVP_INTRO_SELECTED>;
            expect(isTrackIntentUserSelector(introSelected)).toBe(true);
        });

        it('Should return true for TRACK_BUSINESS choice', () => {
            const introSelected = {choice: CONST.ONBOARDING_CHOICES.TRACK_BUSINESS} as OnyxValue<typeof ONYXKEYS.NVP_INTRO_SELECTED>;
            expect(isTrackIntentUserSelector(introSelected)).toBe(true);
        });

        it('Should return true for TRACK_PERSONAL choice', () => {
            const introSelected = {choice: CONST.ONBOARDING_CHOICES.TRACK_PERSONAL} as OnyxValue<typeof ONYXKEYS.NVP_INTRO_SELECTED>;
            expect(isTrackIntentUserSelector(introSelected)).toBe(true);
        });

        it('Should return false for MANAGE_TEAM choice', () => {
            const introSelected = {choice: CONST.ONBOARDING_CHOICES.MANAGE_TEAM} as OnyxValue<typeof ONYXKEYS.NVP_INTRO_SELECTED>;
            expect(isTrackIntentUserSelector(introSelected)).toBe(false);
        });

        it('Should return false for undefined introSelected', () => {
            expect(isTrackIntentUserSelector(undefined)).toBe(false);
        });

        it('Should return false when choice is undefined', () => {
            const introSelected = {} as OnyxValue<typeof ONYXKEYS.NVP_INTRO_SELECTED>;
            expect(isTrackIntentUserSelector(introSelected)).toBe(false);
        });
    });
});
