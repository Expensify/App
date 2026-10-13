type ShouldHideForYouSectionParams = {
    /** Whether the user currently has any actionable to-do. */
    hasAnyTodos: boolean;

    /** Whether an actionable to-do has ever appeared before (keeps the section visible once seen). */
    hasSeenTodo: boolean;

    /** The user's free-trial start date (`nvp_private_firstDayFreeTrial`), e.g. "2026-06-24". */
    firstDayFreeTrial: string | undefined;

    /** The cutoff date that splits new from old users. */
    cutoffDate: string;

    /**
     * Whether onboarding is complete. `false` means still onboarding (brand-new user). Before the onboarding NVP
     * loads this is `true`, so only the explicit `false` is trusted as "still onboarding".
     */
    isOnboardingCompleted: boolean | undefined;
};

/**
 * Decides whether the empty "For You" section should be hidden once its data has loaded. The load state does not
 * consult this: the skeleton stands in for the body unconditionally.
 *
 * New users with a workspace (free-trial start on or after the cutoff) stay hidden until they have an actionable to-do.
 * Users with no workspace yet (no free-trial date, e.g. the "Something else" intent) keep the empty section so the
 * home page isn't bare beneath the Concierge box. Once a to-do has ever appeared (`hasSeenTodo`), it stays visible.
 */
function shouldHideForYouSection({hasAnyTodos, hasSeenTodo, firstDayFreeTrial, cutoffDate, isOnboardingCompleted}: ShouldHideForYouSectionParams): boolean {
    // Keep the section visible once a to-do exists or ever has.
    if (hasAnyTodos || hasSeenTodo) {
        return false;
    }

    // Onboarding users are new users: stay hidden until a to-do appears.
    if (isOnboardingCompleted === false) {
        return true;
    }

    // No free-trial date means no workspace yet (e.g. the "Something else" intent). Keep the empty "For you" state so
    // the home page isn't bare beneath the Concierge box. This applies to both NewDot-onboarded and old/migrated accounts.
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
