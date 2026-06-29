type ShouldHideForYouSectionParams = {
    /** Whether the section is still in its initial load (skeleton) state. */
    isInitialLoad: boolean;

    /** Whether the user currently has any actionable to-do. */
    hasAnyTodos: boolean;

    /** Whether an actionable to-do has ever appeared in the section before (keeps it visible once seen). */
    hasSeenTodo: boolean;

    /** The user's free-trial start date (`nvp_private_firstDayFreeTrial`), e.g. "2026-06-24". */
    firstDayFreeTrial: string | undefined;

    /** The cutoff date that splits new from old users. */
    cutoffDate: string;

    /**
     * Whether the user has completed the NewDot guided-setup (onboarding) flow. `false` means the user is still
     * onboarding (a brand-new user), `true`/`undefined` means onboarded or not yet known.
     */
    isOnboardingCompleted: boolean | undefined;

    /**
     * Whether the onboarding NVP has finished loading, i.e. whether `isOnboardingCompleted` reflects real data. While
     * this is `false`, the onboarding status is still unknown (the NVP defaults to "completed" before it loads), so we
     * must not assume the user is a completed user yet.
     */
    isOnboardingStatusKnown: boolean;
};

/**
 * Decides whether the empty "For You" section should be hidden.
 *
 * New users (still onboarding, or free-trial start on/after the cutoff date) have the section hidden until they have
 * an actionable to-do, while old users (onboarded before the cutoff, or without a trial start date) always keep the
 * section. For old users we never hide during the initial load so the skeleton can render, but onboarding users never
 * see the skeleton. Once an actionable to-do has ever appeared (`hasSeenTodo`), the section stays visible permanently
 * even when it later goes empty.
 */
function shouldHideForYouSection({
    isInitialLoad,
    hasAnyTodos,
    hasSeenTodo,
    firstDayFreeTrial,
    cutoffDate,
    isOnboardingCompleted,
    isOnboardingStatusKnown,
}: ShouldHideForYouSectionParams): boolean {
    // Once there's an actionable to-do (or there ever has been), always keep the section visible, even during the
    // initial load, so the to-dos render as soon as they're available.
    if (hasAnyTodos || hasSeenTodo) {
        return false;
    }

    // A user still going through onboarding is, by definition, a new user: keep the section hidden (including the
    // skeleton during the initial load) until there is an actionable to-do. This also covers the window right after
    // login where the free-trial NVP hasn't arrived yet, which would otherwise briefly flash the section before the
    // segment can be determined.
    if (isOnboardingCompleted === false) {
        return true;
    }

    if (isInitialLoad) {
        // Only render the skeleton once we actually know the user isn't onboarding. The onboarding NVP defaults to
        // "completed" before it loads, so showing the skeleton while the status is still unknown would flash it for
        // onboarding users. Hide until the status is known; the skeleton then renders for everyone else.
        return !isOnboardingStatusKnown;
    }

    if (!firstDayFreeTrial) {
        return false;
    }

    const trialStartMs = new Date(firstDayFreeTrial).getTime();
    const cutoffMs = new Date(cutoffDate).getTime();

    if (Number.isNaN(trialStartMs) || Number.isNaN(cutoffMs)) {
        return false;
    }

    return trialStartMs >= cutoffMs;
}

export default shouldHideForYouSection;
