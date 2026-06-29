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
};

/**
 * Decides whether the empty "For You" section should be hidden.
 *
 * New users (free-trial start on/after the cutoff date) have the empty section hidden until they have an actionable
 * to-do, while old users (onboarded before the cutoff, or without a trial start date) always keep the section. We
 * never hide during the initial load so the skeleton can render regardless of segment. Once an actionable to-do has
 * ever appeared (`hasSeenTodo`), the section stays visible permanently even when it later goes empty.
 */
function shouldHideForYouSection({isInitialLoad, hasAnyTodos, hasSeenTodo, firstDayFreeTrial, cutoffDate, isOnboardingCompleted}: ShouldHideForYouSectionParams): boolean {
    if (isInitialLoad || hasAnyTodos || hasSeenTodo) {
        return false;
    }

    // A user still going through onboarding is, by definition, a new user: keep the empty section hidden until there is
    // an actionable to-do. This also covers the window right after login where the free-trial NVP hasn't arrived yet,
    // which would otherwise briefly flash the empty section before the segment can be determined.
    if (isOnboardingCompleted === false) {
        return true;
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
