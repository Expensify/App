import {useEffect, useRef} from 'react';

type UseBackfillWhenNoVisibleActionsParams = {
    /** The id of the current report */
    reportID: string;

    /** Whether the paginated chain currently yields no visible actions */
    isMissingReportActions: boolean;

    /** If the report has older actions to load */
    hasOlderActions: boolean;

    /** If the report has newer actions to load */
    hasNewerActions: boolean;

    /** Whether the device is offline */
    isOffline: boolean;

    /** Whether the initial OpenReport call is still in flight. Must come from the request queue (`useIsReportLoadPending`) */
    isReportLoadPending: boolean;

    /** Whether a GetOlderActions call is already in flight */
    isLoadingOlderReportActions: boolean | undefined;

    /** Whether the last GetOlderActions call failed */
    hasLoadingOlderReportActionsError: boolean | undefined;

    /** The oldest action of the current report, i.e. the cursor `loadOlderChats` sends */
    oldestReportActionID: string | undefined;

    /** Fetches the page of actions older than the current chain */
    loadOlderChats: (force?: boolean) => void;
};

/**
 * Loads older chats in a report whose newest page contains no visible actions.
 *
 * The backend prioritizes IOU actions in OpenReport, so a report can come back with a page made up
 * entirely of invisible actions (e.g. a self DM whose imported card expenses were all deleted), while
 * the visible messages sit on an older page. That chain renders as empty, which keeps the skeleton up
 * in place of the list — and the list is what owns pagination, so nothing is left to fetch the page
 * that would end the skeleton. This walks backwards from the chain's oldest action until visible
 * actions come into view. See https://github.com/Expensify/App/issues/97574.
 */
function useBackfillWhenNoVisibleActions({
    reportID,
    isMissingReportActions,
    hasOlderActions,
    hasNewerActions,
    isOffline,
    isReportLoadPending,
    isLoadingOlderReportActions,
    hasLoadingOlderReportActionsError,
    oldestReportActionID,
    loadOlderChats,
}: UseBackfillWhenNoVisibleActionsParams) {
    const lastRequestedCursorRef = useRef<string | undefined>(undefined);
    const retriedCursorRef = useRef<string | undefined>(undefined);
    const previousReportIDRef = useRef(reportID);

    useEffect(() => {
        if (previousReportIDRef.current !== reportID) {
            previousReportIDRef.current = reportID;
            lastRequestedCursorRef.current = undefined;
            retriedCursorRef.current = undefined;
        }

        // Only the newest chain is backfilled, walking backwards from the middle could page through everything older while the visible actions sit on the newer side
        if (!isMissingReportActions || !hasOlderActions || hasNewerActions || isOffline || isReportLoadPending) {
            return;
        }

        // A failed request consumes the cursor without advancing it.
        // Each cursor gets a single retry, so a request that keeps failing can't spin.
        if (hasLoadingOlderReportActionsError && oldestReportActionID && retriedCursorRef.current !== oldestReportActionID) {
            retriedCursorRef.current = oldestReportActionID;
            lastRequestedCursorRef.current = undefined;
        }

        if (isLoadingOlderReportActions) {
            return;
        }

        // If the cursor hasn't advanced since the last call, the server has no more actions for this chain.
        if (!oldestReportActionID || lastRequestedCursorRef.current === oldestReportActionID) {
            return;
        }

        lastRequestedCursorRef.current = oldestReportActionID;
        loadOlderChats(false);
    }, [
        reportID,
        isMissingReportActions,
        hasOlderActions,
        hasNewerActions,
        isOffline,
        isReportLoadPending,
        isLoadingOlderReportActions,
        hasLoadingOlderReportActionsError,
        oldestReportActionID,
        loadOlderChats,
    ]);
}

export default useBackfillWhenNoVisibleActions;
