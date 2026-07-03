import {isCurrentUserPendingAddAction} from '@libs/ReportActionsUtils';

import type {ReportAction} from '@src/types/onyx';

import {useState} from 'react';

/**
 * Tracks the IDs of the current user's own messages sent during the active Concierge session.
 *
 * A message is captured while it is still optimistic (`pendingAction === ADD`), which is the only
 * moment a clock-skewed `created` can be reliably attributed to the current session. Once captured
 * the ID is retained for the rest of the session, so the message keeps counting as a current-session
 * message even after the AddComment success clears its `pendingAction` but before Concierge replies.
 * Without this, a skewed just-sent message (whose `created` is earlier than `sessionStartTime`) would
 * fall out of the session as soon as `pendingAction` is cleared, collapsing the side panel back to the
 * welcome/history state and hiding the thinking indicator until a later action arrives.
 *
 * The set is reset whenever the session boundary (`sessionStartTime`) changes, so IDs from a previous
 * session never leak into a new one.
 *
 * Capture happens during render (via the "adjust state during render" pattern) rather than in an
 * effect: the returned set is therefore correct within the same render, and we avoid the cascading
 * renders that calling setState inside an effect would cause.
 */
function useCurrentSessionUserActionIDs(actions: ReportAction[] | undefined, currentUserAccountID: number | undefined, sessionStartTime: string | null): Set<string> {
    const [sentIDs, setSentIDs] = useState<Set<string>>(() => new Set());
    const [prevSessionStartTime, setPrevSessionStartTime] = useState(sessionStartTime);

    // Reset the captured IDs when the session boundary changes.
    let currentSet = sentIDs;
    if (prevSessionStartTime !== sessionStartTime) {
        setPrevSessionStartTime(sessionStartTime);
        currentSet = new Set();
    }

    // Add any of the current user's optimistic (pendingAction === ADD) messages not yet captured.
    let nextSet = currentSet;
    if (sessionStartTime && actions) {
        for (const action of actions) {
            if (!isCurrentUserPendingAddAction(action, currentUserAccountID) || !action.reportActionID || nextSet.has(action.reportActionID)) {
                continue;
            }
            if (nextSet === currentSet) {
                nextSet = new Set(currentSet);
            }
            nextSet.add(action.reportActionID);
        }
    }

    if (nextSet !== sentIDs) {
        setSentIDs(nextSet);
    }

    return nextSet;
}

export default useCurrentSessionUserActionIDs;
