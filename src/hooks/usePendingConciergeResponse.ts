import {useEffect} from 'react';
import {applyPendingConciergeAction, discardPendingConciergeAction} from '@libs/actions/Report/SuggestedFollowup';
import ONYXKEYS from '@src/ONYXKEYS';
import useOnyx from './useOnyx';

/** If displayAfter is more than this far in the past, the response is stale (e.g. app was killed and restarted) */
const STALE_THRESHOLD_MS = 10_000;

/**
 * Processes pending concierge responses stored in Onyx for a given report.
 * When a pending response exists, schedules the action to be moved to REPORT_ACTIONS
 * after the remaining delay, with automatic cleanup on unmount via useEffect.
 */
function usePendingConciergeResponse(reportID: string) {
    const [pendingResponse] = useOnyx(`${ONYXKEYS.COLLECTION.PENDING_CONCIERGE_RESPONSE}${reportID}`, {canBeMissing: true});

    useEffect(() => {
        if (!pendingResponse) {
            return;
        }

        const remaining = pendingResponse.displayAfter - Date.now();

        // If the pending response is stale (e.g. app was killed/restarted), discard it
        // instead of displaying a phantom message that was never confirmed by the server.
        if (remaining < -STALE_THRESHOLD_MS) {
            discardPendingConciergeAction(reportID);
            return;
        }

        const timer = setTimeout(
            () => {
                applyPendingConciergeAction(reportID, pendingResponse.reportAction);
            },
            Math.max(0, remaining),
        );

        return () => clearTimeout(timer);
    }, [pendingResponse, reportID]);
}

export default usePendingConciergeResponse;
