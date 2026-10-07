import CONST from '@src/CONST';
import type ONYXKEYS from '@src/ONYXKEYS';

import type {OnyxValue} from 'react-native-onyx';

import {guidedSetupAndTourStatusSelector, hasCompletedGuidedSetupFlowSelector, hasSeenTourSelector, isTrackIntentUserSelector} from '@selectors/Onboarding';

import createMock from '../utils/createMock';

describe('onboardingSelectors', () => {
    // Not all users have this NVP defined as we did not run a migration to backfill it for existing accounts, hence we need to make sure
    // the onboarding flow is only showed to the users with `hasCompletedGuidedSetupFlow` set to false
    describe('hasCompletedGuidedSetupFlowSelector', () => {
        it('Should return true if onboarding NVP is an empty object', () => {
            const onboarding = createMock<NonNullable<OnyxValue<typeof ONYXKEYS.NVP_ONBOARDING>>>({});
            expect(hasCompletedGuidedSetupFlowSelector(onboarding)).toBe(true);
        });
        it('Should return true if onboarding NVP contains only signupQualifier', () => {
            const onboarding = createMock<NonNullable<OnyxValue<typeof ONYXKEYS.NVP_ONBOARDING>>>({signupQualifier: CONST.ONBOARDING_SIGNUP_QUALIFIERS.VSB});
            expect(hasCompletedGuidedSetupFlowSelector(onboarding)).toBe(true);
        });
        it('Should return true if onboarding NVP contains hasCompletedGuidedSetupFlow = true', () => {
            const onboarding = createMock<NonNullable<OnyxValue<typeof ONYXKEYS.NVP_ONBOARDING>>>({hasCompletedGuidedSetupFlow: true});
            expect(hasCompletedGuidedSetupFlowSelector(onboarding)).toBe(true);
        });
        it('Should return false if onboarding NVP contains hasCompletedGuidedSetupFlow = false', () => {
            const onboarding = createMock<NonNullable<OnyxValue<typeof ONYXKEYS.NVP_ONBOARDING>>>({hasCompletedGuidedSetupFlow: false});
            expect(hasCompletedGuidedSetupFlowSelector(onboarding)).toBe(false);
        });
        it('Should return true if onboarding NVP contains only selfTourViewed', () => {
            const onboarding = createMock<NonNullable<OnyxValue<typeof ONYXKEYS.NVP_ONBOARDING>>>({selfTourViewed: true});
            expect(hasCompletedGuidedSetupFlowSelector(onboarding)).toBe(true);
        });
    });

    describe('hasSeenTourSelector', () => {
        it('Should return false if onboarding NVP is an empty object', () => {
            const onboarding = createMock<NonNullable<OnyxValue<typeof ONYXKEYS.NVP_ONBOARDING>>>({});
            expect(hasSeenTourSelector(onboarding)).toBe(false);
        });

        it('Should return false if onboarding NVP is undefined (treated as empty)', () => {
            expect(hasSeenTourSelector(undefined)).toBe(false);
        });

        it('Should return false if onboarding NVP has selfTourViewed = false', () => {
            const onboarding = createMock<NonNullable<OnyxValue<typeof ONYXKEYS.NVP_ONBOARDING>>>({selfTourViewed: false});
            expect(hasSeenTourSelector(onboarding)).toBe(false);
        });

        it('Should return true if onboarding NVP has selfTourViewed = true', () => {
            const onboarding = createMock<NonNullable<OnyxValue<typeof ONYXKEYS.NVP_ONBOARDING>>>({selfTourViewed: true});
            expect(hasSeenTourSelector(onboarding)).toBe(true);
        });

        it('Should return false if onboarding NVP has no selfTourViewed field', () => {
            const onboarding = createMock<NonNullable<OnyxValue<typeof ONYXKEYS.NVP_ONBOARDING>>>({hasCompletedGuidedSetupFlow: true});
            expect(hasSeenTourSelector(onboarding)).toBe(false);
        });

        it('Should return false if onboarding NVP contains only signupQualifier', () => {
            const onboarding = createMock<NonNullable<OnyxValue<typeof ONYXKEYS.NVP_ONBOARDING>>>({signupQualifier: CONST.ONBOARDING_SIGNUP_QUALIFIERS.VSB});
            expect(hasSeenTourSelector(onboarding)).toBe(false);
        });
    });
    describe('isTrackIntentUserSelector', () => {
        it('Should return true for PERSONAL_SPEND choice', () => {
            const introSelected = createMock<NonNullable<OnyxValue<typeof ONYXKEYS.NVP_INTRO_SELECTED>>>({choice: CONST.ONBOARDING_CHOICES.PERSONAL_SPEND});
            expect(isTrackIntentUserSelector(introSelected)).toBe(true);
        });

        it('Should return true for TRACK_BUSINESS choice', () => {
            const introSelected = createMock<NonNullable<OnyxValue<typeof ONYXKEYS.NVP_INTRO_SELECTED>>>({choice: CONST.ONBOARDING_CHOICES.TRACK_BUSINESS});
            expect(isTrackIntentUserSelector(introSelected)).toBe(true);
        });

        it('Should return true for TRACK_PERSONAL choice', () => {
            const introSelected = createMock<NonNullable<OnyxValue<typeof ONYXKEYS.NVP_INTRO_SELECTED>>>({choice: CONST.ONBOARDING_CHOICES.TRACK_PERSONAL});
            expect(isTrackIntentUserSelector(introSelected)).toBe(true);
        });

        it('Should return false for MANAGE_TEAM choice', () => {
            const introSelected = createMock<NonNullable<OnyxValue<typeof ONYXKEYS.NVP_INTRO_SELECTED>>>({choice: CONST.ONBOARDING_CHOICES.MANAGE_TEAM});
            expect(isTrackIntentUserSelector(introSelected)).toBe(false);
        });

        it('Should return false for undefined introSelected', () => {
            expect(isTrackIntentUserSelector(undefined)).toBe(false);
        });

        it('Should return false when choice is undefined', () => {
            const introSelected = createMock<NonNullable<OnyxValue<typeof ONYXKEYS.NVP_INTRO_SELECTED>>>({});
            expect(isTrackIntentUserSelector(introSelected)).toBe(false);
        });
    });

    // The combined selector derives both onboarding flags from a single NVP_ONBOARDING read. Callers that need both
    // (e.g. the openReport wiring) rely on each field mapping to its own source without being swapped.
    describe('guidedSetupAndTourStatusSelector', () => {
        it('Should map each flag from its own source without swapping them', () => {
            const onboarding = createMock<NonNullable<OnyxValue<typeof ONYXKEYS.NVP_ONBOARDING>>>({selfTourViewed: true, hasCompletedGuidedSetupFlow: false});
            expect(guidedSetupAndTourStatusSelector(onboarding)).toEqual({isSelfTourViewed: true, hasCompletedGuidedSetupFlow: false});
        });

        it('Should treat an empty onboarding NVP as tour-not-seen and guided-setup-completed', () => {
            const onboarding = createMock<NonNullable<OnyxValue<typeof ONYXKEYS.NVP_ONBOARDING>>>({});
            expect(guidedSetupAndTourStatusSelector(onboarding)).toEqual({isSelfTourViewed: false, hasCompletedGuidedSetupFlow: true});
        });

        it('Should treat an undefined onboarding NVP the same as an empty one', () => {
            expect(guidedSetupAndTourStatusSelector(undefined)).toEqual({isSelfTourViewed: false, hasCompletedGuidedSetupFlow: true});
        });

        it('Should reflect a fully completed onboarding (tour seen and guided setup done)', () => {
            const onboarding = createMock<NonNullable<OnyxValue<typeof ONYXKEYS.NVP_ONBOARDING>>>({selfTourViewed: true, hasCompletedGuidedSetupFlow: true});
            expect(guidedSetupAndTourStatusSelector(onboarding)).toEqual({isSelfTourViewed: true, hasCompletedGuidedSetupFlow: true});
        });
    });
});
