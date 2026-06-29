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
};

/**
 * Decides whether the empty "For You" section should be hidden.
 *
 * New users (free-trial start on/after the cutoff date) have the empty section hidden until they have an actionable
 * to-do, while old users (onboarded before the cutoff, or without a trial start date) always keep the section. We
 * never hide during the initial load so the skeleton can render regardless of segment. Once an actionable to-do has
 * ever appeared (`hasSeenTodo`), the section stays visible permanently even when it later goes empty.
 */
function shouldHideForYouSection({isInitialLoad, hasAnyTodos, hasSeenTodo, firstDayFreeTrial, cutoffDate}: ShouldHideForYouSectionParams): boolean {
    if (isInitialLoad || hasAnyTodos || hasSeenTodo) {
        return false;
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
