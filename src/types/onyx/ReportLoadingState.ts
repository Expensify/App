/**
 * Session-scoped loading state for a single report.
 *
 * Transient by nature: describes in-flight API work and error conditions.
 * Kept in a separate Onyx key (and registered RAM-only) so that routine
 * loading-flag flips during pagination/warm-nav don't broadcast to every
 * subscriber of report-level business state.
 */
type ReportLoadingState = {
    /** Whether the user has successfully opened a report at least once in this session */
    hasOnceLoadedReportActions?: boolean;

    /** Are we loading newer report actions? */
    isLoadingNewerReportActions?: boolean;

    /** Was there an error when loading newer report actions? */
    hasLoadingNewerReportActionsError?: boolean;

    /** Are we loading older report actions? */
    isLoadingOlderReportActions?: boolean;

    /** Was there an error when loading older report actions? */
    hasLoadingOlderReportActionsError?: boolean;

    /** Flag to check if the initial report actions fetch is in flight */
    isLoadingInitialReportActions?: boolean;

    /** Whether participants private notes are being currently loaded */
    isLoadingPrivateNotes?: boolean;

    /** Whether a search-row action (hold/pay/approve) is in flight */
    isActionLoading?: boolean;
};

export default ReportLoadingState;
