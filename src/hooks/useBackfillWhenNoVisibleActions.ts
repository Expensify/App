import {useEffect, useRef} from 'react';

type UseBackfillWhenNoVisibleActionsParams = {
    /** The id of the current report */
    reportID: string;

    /** Whether the paginated chain currently yields no visible actions */
    isMissingReportActions: boolean;

    /** If the report has older actions to load */
    hasOlderActions: boolean;

    /** Whether the device is offline */
    isOffline: boolean;

    /**
     * Whether the initial OpenReport call is still in flight. Must come from the request queue
     * (`useIsReportLoadPending`), not from the RAM-only loading flag: a flag that never cleared would
     * block the backfill for as long as the report stays open.
     */
    isReportLoadPending: boolean;

    /** Whether a GetOlderActions call is already in flight */
    isLoadingOlderReportActions: boolean | undefined;

    /** Whether the last GetOlderActions call failed */
    hasLoadingOlderReportActionsError: boolean | undefined;

    /** The cursor `loadOlderChats` sends, i.e. the oldest action of the current report */
    oldestReportActionID: string | undefined;

    /** Fetches the page of actions older than the current chain */
    loadOlderChats: (force?: boolean) => void;
};

/**
 * Recovers a report whose newest page contains no visible actions.
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
        // A different report gets its own cursor, otherwise the guard could carry over an ID this report never requested.
        if (previousReportIDRef.current !== reportID) {
            previousReportIDRef.current = reportID;
            lastRequestedCursorRef.current = undefined;
            retriedCursorRef.current = undefined;
        }

        if (!isMissingReportActions || !hasOlderActions || isOffline || isReportLoadPending) {
            return;
        }

        // A failed request consumes the cursor without advancing it, so without this one transient failure
        // would strand the report on the skeleton — the symptom this hook exists to fix. Each cursor gets a
        // single retry, so a request that keeps failing can't spin.
        if (hasLoadingOlderReportActionsError && oldestReportActionID && retriedCursorRef.current !== oldestReportActionID) {
            retriedCursorRef.current = oldestReportActionID;
            lastRequestedCursorRef.current = undefined;
        }

        if (isLoadingOlderReportActions) {
            return;
        }

        // Safety guard against an infinite request loop: if the cursor hasn't advanced since the last
        // call, the server has no more actions to give us for this chain.
        if (!oldestReportActionID || lastRequestedCursorRef.current === oldestReportActionID) {
            return;
        }

        lastRequestedCursorRef.current = oldestReportActionID;
        loadOlderChats(false);
    }, [
        reportID,
        isMissingReportActions,
        hasOlderActions,
        isOffline,
        isReportLoadPending,
        isLoadingOlderReportActions,
        hasLoadingOlderReportActionsError,
        oldestReportActionID,
        loadOlderChats,
    ]);
}

export default useBackfillWhenNoVisibleActions;
