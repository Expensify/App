type ShouldHideForYouSectionParams = {
    /** Whether the section is still in its initial load (skeleton) state. */
    isInitialLoad: boolean;

    /** Whether the user currently has any actionable to-do. */
    hasAnyTodos: boolean;

    /** Whether an actionable to-do has ever appeared before (keeps the section visible once seen). */
    hasSeenTodo: boolean;

    /** The user's free-trial start date (`nvp_private_firstDayFreeTrial`), e.g. "2026-06-24". */
    firstDayFreeTrial: string | undefined;

    /** The cutoff date that splits new from old users. */
    cutoffDate: string;

    /** Whether onboarding is complete. `false` means still onboarding (brand-new user). */
    isOnboardingCompleted: boolean | undefined;

    /** Whether the onboarding NVP has loaded. Until then `isOnboardingCompleted` defaults to "completed" and is unreliable. */
    isOnboardingStatusKnown: boolean;

    /** Whether the account went through NewDot onboarding (non-empty onboarding NVP). `false` means an old/migrated account. */
    isNewDotOnboardedUser: boolean;
};

/**
 * Decides whether the empty "For You" section should be hidden.
 *
 * New users (still onboarding, free-trial start on/after the cutoff, or NewDot-onboarded with no free trial yet) stay
 * hidden until they have an actionable to-do; old/migrated users always keep the section. Once a to-do has ever appeared
 * (`hasSeenTodo`), it stays visible.
 */
function shouldHideForYouSection({
    isInitialLoad,
    hasAnyTodos,
    hasSeenTodo,
    firstDayFreeTrial,
    cutoffDate,
    isOnboardingCompleted,
    isOnboardingStatusKnown,
    isNewDotOnboardedUser,
}: ShouldHideForYouSectionParams): boolean {
    // Keep the section visible (even during initial load) once a to-do exists or ever has.
    if (hasAnyTodos || hasSeenTodo) {
        return false;
    }

    // Onboarding users are new users: stay hidden until a to-do appears.
    if (isOnboardingCompleted === false) {
        return true;
    }

    if (isInitialLoad) {
        // Hide the skeleton until we know the user isn't onboarding, otherwise it flashes for onboarding users.
        return !isOnboardingStatusKnown;
    }

    // No free-trial date means no workspace yet, so the cutoff can't classify the user. Fall back to the onboarding
    // origin: NewDot-onboarded accounts are new (hide), old/migrated accounts keep the section.
    if (!firstDayFreeTrial) {
        return isNewDotOnboardedUser;
    }

    const trialStartMs = new Date(firstDayFreeTrial).getTime();
    const cutoffMs = new Date(cutoffDate).getTime();

    if (Number.isNaN(trialStartMs) || Number.isNaN(cutoffMs)) {
        return false;
    }

    return trialStartMs >= cutoffMs;
}

export default shouldHideForYouSection;
