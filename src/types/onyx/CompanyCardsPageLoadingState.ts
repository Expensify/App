/**
 * Session-scoped loading state for the Company Cards page, keyed by policyID.
 *
 * Frontend-owned and RAM-only so page requests can settle before the workspace account ID resolves.
 */
type CompanyCardsPageLoadingState = {
    isLoadingPage?: boolean;

    hasLoadingError?: boolean;

    /** Retained across refreshes to avoid showing the initial page skeleton again */
    hasOnceLoadedPage?: boolean;
};

export default CompanyCardsPageLoadingState;
