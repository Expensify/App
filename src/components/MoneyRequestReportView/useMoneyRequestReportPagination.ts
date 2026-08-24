import useLoadReportActions from '@hooks/useLoadReportActions';

import TransitionTracker from '@libs/Navigation/TransitionTracker';
import {isMoneyRequestAction} from '@libs/ReportActionsUtils';

import isSearchTopmostFullScreenRoute from '@navigation/helpers/isSearchTopmostFullScreenRoute';

import {getOlderActions} from '@userActions/Report';

import type * as OnyxTypes from '@src/types/onyx';

import {useEffect, useRef} from 'react';

// The server page size for report actions is ~50. Gaps from IOU prioritization only happen
// when the initial load is truncated, so skip backfill for smaller reports.
const BACKFILL_MIN_ACTIONS_THRESHOLD = 50;

type UseMoneyRequestReportPaginationParams = {
    /** The report whose actions are being paginated */
    reportID: string | undefined;

    /** Paginated report actions, newest-first */
    reportActions: OnyxTypes.ReportAction[];

    /** IDs of all paginated report actions */
    reportActionIDs: string[];

    /** The single-transaction thread report ID, when one exists */
    transactionThreadReportID: string | undefined;

    /** Whether older actions exist beyond the loaded page */
    hasOlderActions: boolean;

    /** Whether newer actions exist beyond the loaded page */
    hasNewerActions: boolean;

    /** Whether the network is offline */
    isOffline: boolean;

    /** The report's pagination cursor state */
    reportPaginationState: OnyxTypes.ReportPaginationState | undefined;

    /** The report's loading state */
    reportLoadingState: OnyxTypes.ReportLoadingState | undefined;
};

type UseMoneyRequestReportPaginationResult = {
    /** FlashList onStartReached handler — loads older actions */
    onStartReached: () => void;

    /** FlashList onEndReached handler — loads newer actions */
    onEndReached: () => void;
};

/**
 * Owns loading more actions for the money-request report view: the list-edge handlers, the
 * auto-load-newer loop, and the IOU backfill loop.
 *
 * The consuming component remounts per report (keyed by reportID), so the cursor refs below reset
 * naturally on report switch and never need render-phase resets.
 */
function useMoneyRequestReportPagination({
    reportID,
    reportActions,
    reportActionIDs,
    transactionThreadReportID,
    hasOlderActions,
    hasNewerActions,
    isOffline,
    reportPaginationState,
    reportLoadingState,
}: UseMoneyRequestReportPaginationParams): UseMoneyRequestReportPaginationResult {
    const {loadOlderChats, loadNewerChats} = useLoadReportActions({
        reportID,
        reportActions,
        allReportActionIDs: reportActionIDs,
        transactionThreadReportID,
        hasOlderActions,
        hasNewerActions,
        newestFetchedReportActionID: reportPaginationState?.newestFetchedReportActionID,
    });

    const hasFinishedInitialLoad = reportLoadingState?.isLoadingInitialReportActions === false;
    const prevNewestFetchedIDRef = useRef<string | undefined>(undefined);
    useEffect(() => {
        if (!hasFinishedInitialLoad || !hasNewerActions || reportActions.length === 0 || isOffline || reportLoadingState?.isLoadingNewerReportActions) {
            return;
        }
        // Safety guard: if the cursor hasn't advanced since the last call, the server
        // isn't returning new data. Stop to prevent an infinite request loop.
        const currentCursor = reportPaginationState?.newestFetchedReportActionID;
        if (prevNewestFetchedIDRef.current !== undefined && prevNewestFetchedIDRef.current === currentCursor) {
            return;
        }
        prevNewestFetchedIDRef.current = currentCursor;
        loadNewerChats(false);
    }, [
        hasFinishedInitialLoad,
        reportActions.length,
        hasNewerActions,
        isOffline,
        reportLoadingState?.isLoadingNewerReportActions,
        reportPaginationState?.newestFetchedReportActionID,
        loadNewerChats,
    ]);

    // Backfill loop: the backend prioritizes IOU actions in OpenReport/GetNewerActions for money
    // request reports, which can leave non-IOU chat messages in a gap between the IOU-biased cursor
    // and older messages. After auto-pagination finishes, walk backwards from the IOU cursor using
    // getOlderActions. Each response advances oldestFetchedReportActionID so the next call picks up
    // where the previous one left off, until the cursor stops advancing (gap filled).
    const prevBackfillCursorRef = useRef<string | undefined>(undefined);
    const isBackfillingRef = useRef(false);
    useEffect(() => {
        if (!hasFinishedInitialLoad || isOffline || hasNewerActions || reportLoadingState?.isLoadingNewerReportActions || reportLoadingState?.isLoadingOlderReportActions) {
            return;
        }

        if (!isBackfillingRef.current) {
            const hasIOUActions = reportActions.some((action) => isMoneyRequestAction(action));
            if (!hasIOUActions || reportActions.length < BACKFILL_MIN_ACTIONS_THRESHOLD || !reportPaginationState?.newestFetchedReportActionID) {
                return;
            }
        }

        const cursor = isBackfillingRef.current ? reportPaginationState?.oldestFetchedReportActionID : reportPaginationState?.newestFetchedReportActionID;
        if (!cursor) {
            return;
        }

        if (prevBackfillCursorRef.current === cursor) {
            return;
        }

        isBackfillingRef.current = true;
        prevBackfillCursorRef.current = cursor;
        const handle = TransitionTracker.runAfterTransitions({callback: () => getOlderActions(reportID, cursor)});

        return () => handle.cancel();
    }, [
        hasFinishedInitialLoad,
        isOffline,
        hasNewerActions,
        reportLoadingState?.isLoadingNewerReportActions,
        reportLoadingState?.isLoadingOlderReportActions,
        reportPaginationState?.newestFetchedReportActionID,
        reportPaginationState?.oldestFetchedReportActionID,
        reportActions,
        reportID,
    ]);

    const onStartReached = () => {
        if (!isSearchTopmostFullScreenRoute()) {
            loadOlderChats(false);
            return;
        }
        TransitionTracker.runAfterTransitions({
            callback: () => loadOlderChats(false),
        });
    };

    const onEndReached = () => {
        loadNewerChats(false);
    };

    return {onStartReached, onEndReached};
}

export default useMoneyRequestReportPagination;
