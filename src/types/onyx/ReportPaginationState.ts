/**
 * Pagination cursors for a single report's action list.
 *
 * Kept separate from business metadata because cursors are rewritten on every
 * paginated fetch (via the Pagination middleware) and have no bearing on
 * any report-level UI state other than the paginator itself.
 */
type ReportPaginationState = {
    /** The newest report action ID from the last pagination response (excludes Pusher-delivered actions) */
    newestFetchedReportActionID?: string;

    /** The oldest report action ID from the last pagination response, used as advancing cursor for backfill */
    oldestFetchedReportActionID?: string;

    /** Results of explicit newest-page requests, shared with the tab that requested the jump. */
    liveTailRequestResults?: Record<string, {settled?: boolean; newestActionID?: string; expiresAt?: number}>;
};

export default ReportPaginationState;
