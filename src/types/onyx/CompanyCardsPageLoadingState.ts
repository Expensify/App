/**
 * Session-scoped loading state for the Company Cards page, keyed by policyID.
 *
 * Frontend-owned and RAM-only so page requests can settle before the workspace account ID resolves.
 */
type CompanyCardsPageLoadingState = {
    /** Set when OpenPolicyCompanyCardsPage starts. Only a server response clears it, so it stays true if the request fails before one arrives */
    isLoadingPage?: boolean;

    /** Whether the last OpenPolicyCompanyCardsPage response came back with a non-200 jsonCode. Cleared when a new request starts */
    hasLoadingError?: boolean;

    /** Retained across refreshes to avoid showing the initial page skeleton again */
    hasOnceLoadedPage?: boolean;
};

export default CompanyCardsPageLoadingState;
