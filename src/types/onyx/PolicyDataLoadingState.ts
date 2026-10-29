/**
 * Session-scoped loading state for a policy's on-demand categories/tags read, keyed by policyID.
 *
 * Frontend-owned and RAM-only so a backend SET on the categories/tags collections cannot wipe the flags.
 * `hasOnceLoaded` is written only from `successData`, so a read that never landed leaves it false and the
 * next picker mount retries. Tracking success rather than "we tried once" matters because a partial
 * collection (only the value already on the expense) is indistinguishable from a complete one, so the
 * presence of the collection cannot stand in for a successful read.
 */
type PolicyDataLoadingState = {
    /** Whether a read for this policy has succeeded at least once in this session */
    hasOnceLoaded?: boolean;

    /** Whether a read for this policy is currently in flight */
    isLoading?: boolean;
};

export default PolicyDataLoadingState;
