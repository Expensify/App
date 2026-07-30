import shouldHideForYouSection from '@pages/home/ForYouSection/shouldHideForYouSection';

const CUTOFF = '2026-06-24';

const baseParams = {
    isInitialLoad: false,
    hasAnyTodos: false,
    hasSeenTodo: false,
    firstDayFreeTrial: undefined as string | undefined,
    cutoffDate: CUTOFF,
    isOnboardingCompleted: true as boolean | undefined,
    isOnboardingStatusKnown: true,
    isNewDotOnboardedUser: false,
};

describe('shouldHideForYouSection', () => {
    it('hides the section for a user who onboarded on the cutoff date', () => {
        expect(shouldHideForYouSection({...baseParams, firstDayFreeTrial: '2026-06-24'})).toBe(true);
    });

    it('hides the section for a user who onboarded after the cutoff date', () => {
        expect(shouldHideForYouSection({...baseParams, firstDayFreeTrial: '2026-07-01'})).toBe(true);
    });

    it('keeps the section for a user who onboarded before the cutoff date', () => {
        expect(shouldHideForYouSection({...baseParams, firstDayFreeTrial: '2026-01-01'})).toBe(false);
    });

    it('keeps the section for an old/migrated user when the trial start date is missing', () => {
        expect(shouldHideForYouSection({...baseParams, firstDayFreeTrial: undefined, isNewDotOnboardedUser: false})).toBe(false);
    });

    it('hides the section for a NewDot-onboarded user with no workspace (no trial start date)', () => {
        expect(shouldHideForYouSection({...baseParams, firstDayFreeTrial: undefined, isNewDotOnboardedUser: true})).toBe(true);
    });

    it('keeps the section when the trial start date cannot be parsed', () => {
        expect(shouldHideForYouSection({...baseParams, firstDayFreeTrial: 'not-a-date'})).toBe(false);
    });

    it('keeps the section during the initial load even for a new user', () => {
        expect(shouldHideForYouSection({...baseParams, isInitialLoad: true, firstDayFreeTrial: '2026-07-01'})).toBe(false);
    });

    it('keeps the section when the user has actionable to-dos even for a new user', () => {
        expect(shouldHideForYouSection({...baseParams, hasAnyTodos: true, firstDayFreeTrial: '2026-07-01'})).toBe(false);
    });

    it('keeps the section for a new user with no current to-dos once a to-do has been seen', () => {
        expect(shouldHideForYouSection({...baseParams, hasSeenTodo: true, firstDayFreeTrial: '2026-07-01'})).toBe(false);
    });

    it('still hides the section for a new user with no to-dos when none has ever been seen', () => {
        expect(shouldHideForYouSection({...baseParams, hasSeenTodo: false, firstDayFreeTrial: '2026-07-01'})).toBe(true);
    });

    it('hides the section for a user still going through onboarding even before the trial start date arrives', () => {
        expect(shouldHideForYouSection({...baseParams, isOnboardingCompleted: false, firstDayFreeTrial: undefined})).toBe(true);
    });

    it('keeps the section while onboarding completion is not yet known and there is no trial start date', () => {
        expect(shouldHideForYouSection({...baseParams, isOnboardingCompleted: undefined, firstDayFreeTrial: undefined})).toBe(false);
    });

    it('keeps the section visible during onboarding when the user already has actionable to-dos', () => {
        expect(shouldHideForYouSection({...baseParams, isOnboardingCompleted: false, hasAnyTodos: true})).toBe(false);
    });

    it('hides the section (no skeleton) for a user still onboarding during the initial load', () => {
        expect(shouldHideForYouSection({...baseParams, isOnboardingCompleted: false, isInitialLoad: true})).toBe(true);
    });

    it('hides the section (no skeleton) during the initial load while the onboarding status is still unknown', () => {
        // Before NVP_ONBOARDING loads the selector reports "completed" (true); we must not flash the skeleton yet.
        expect(shouldHideForYouSection({...baseParams, isInitialLoad: true, isOnboardingCompleted: true, isOnboardingStatusKnown: false})).toBe(true);
    });

    it('shows the skeleton during the initial load for a completed user once the onboarding status is known', () => {
        expect(shouldHideForYouSection({...baseParams, isInitialLoad: true, isOnboardingCompleted: true, isOnboardingStatusKnown: true})).toBe(false);
    });
});
