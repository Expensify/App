/**
 * Session-scoped loading state for the Expensify Card page, keyed by policyID.
 *
 * Frontend-owned and RAM-only. Keyed by policyID rather than fundID because the fund the page
 * resolves can change while a request is in flight, which would strand the flags on a key nothing
 * reads. Used to gate the page skeleton so it always has a terminal state, even when the response
 * carries no settings for the resolved fund.
 */
type ExpensifyCardLoadingState = {
    /** Whether the Expensify Card page has been fetched at least once in this session */
    hasOnceLoadedPage?: boolean;

    /** Whether the initial Expensify Card page fetch failed */
    hasLoadingError?: boolean;
};

export default ExpensifyCardLoadingState;
