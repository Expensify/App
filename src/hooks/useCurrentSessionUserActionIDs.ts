import {useEffect, useState} from 'react';
import {isCurrentUserPendingAddAction} from '@libs/ReportActionsUtils';
import type {ReportAction} from '@src/types/onyx';

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
 */
function useCurrentSessionUserActionIDs(actions: ReportAction[] | undefined, currentUserAccountID: number | undefined, sessionStartTime: string | null): Set<string> {
    const [sentIDs, setSentIDs] = useState<Set<string>>(() => new Set());

    // Reset the captured IDs when the session boundary changes, using the "adjust state during render"
    // pattern so the returned set never carries IDs from a previous session.
    const [prevSessionStartTime, setPrevSessionStartTime] = useState(sessionStartTime);
    if (prevSessionStartTime !== sessionStartTime) {
        setPrevSessionStartTime(sessionStartTime);
        setSentIDs(new Set());
    }

    useEffect(() => {
        if (!sessionStartTime || !actions) {
            return;
        }
        setSentIDs((prev) => {
            let next = prev;
            for (const action of actions) {
                if (!isCurrentUserPendingAddAction(action, currentUserAccountID) || !action.reportActionID || prev.has(action.reportActionID)) {
                    continue;
                }
                if (next === prev) {
                    next = new Set(prev);
                }
                next.add(action.reportActionID);
            }
            return next;
        });
    }, [actions, currentUserAccountID, sessionStartTime]);

    return sentIDs;
}

export default useCurrentSessionUserActionIDs;
