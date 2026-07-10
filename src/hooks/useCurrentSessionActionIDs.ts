import {isCreatedAction, isCurrentUserPendingAddAction} from '@libs/ReportActionsUtils';

import type {ReportAction} from '@src/types/onyx';

import {useState} from 'react';

/**
 * Tracks which report action IDs belong to the active Concierge session (the user's messages and the
 * replies to them), identified by arrival instead of timestamp.
 *
 * Timestamps are unreliable: `sessionStartTime` and the user's optimistic message use the client clock,
 * while a reply carries a server timestamp — so under clock skew a real reply can land before
 * `sessionStartTime` and get dropped ("no response from Concierge"). Instead we capture the user's own
 * messages while optimistic (`pendingAction === ADD`), then any action arriving after that, gated by a
 * server-time floor over the pre-session history so older late-loading messages can't leak in.
 *
 * Sets reset when `sessionStartTime` changes; capture runs during render so the result is up to date.
 */
function useCurrentSessionActionIDs(actions: ReportAction[] | undefined, currentUserAccountID: number | undefined, sessionStartTime: string | null): Set<string> {
    const [capturedIDs, setCapturedIDs] = useState<Set<string>>(() => new Set());
    const [seenIDs, setSeenIDs] = useState<Set<string>>(() => new Set());
    const [prevSessionStartTime, setPrevSessionStartTime] = useState(sessionStartTime);

    // Reset both sets when the session boundary changes.
    let captured = capturedIDs;
    let seen = seenIDs;
    if (prevSessionStartTime !== sessionStartTime) {
        setPrevSessionStartTime(sessionStartTime);
        captured = new Set();
        seen = new Set();
    }

    let nextCaptured = captured;
    let nextSeen = seen;

    if (sessionStartTime && actions) {
        // The user has an active question once one of their ADDs is pending or already captured.
        const userHasSentMessage = actions.some(
            (action) =>
                !!action.reportActionID &&
                action.actorAccountID === currentUserAccountID &&
                (isCurrentUserPendingAddAction(action, currentUserAccountID) || captured.has(action.reportActionID)),
        );

        // Newest pre-session server timestamp (excluding the user's own skewed messages). A reply is
        // always newer, so this is a skew-proof floor that late-loading older history can't cross.
        // When no such history is seen yet, fall back to `sessionStartTime` so older history that
        // loads after the user's first message can't leak in before a baseline exists.
        let latestPreSessionCreated: string | undefined;
        for (const action of actions) {
            if (!action.reportActionID || !seen.has(action.reportActionID) || action.actorAccountID === currentUserAccountID || isCreatedAction(action)) {
                continue;
            }
            if (!latestPreSessionCreated || action.created > latestPreSessionCreated) {
                latestPreSessionCreated = action.created;
            }
        }

        // Until we've seen the session-start actions, everything looks new — don't capture replies yet.
        const baselineEstablished = seen.size > 0;

        for (const action of actions) {
            const actionID = action.reportActionID;
            if (!actionID) {
                continue;
            }
            const isNewArrival = !seen.has(actionID);
            const isSessionReply =
                baselineEstablished &&
                userHasSentMessage &&
                isNewArrival &&
                action.actorAccountID !== currentUserAccountID &&
                !isCreatedAction(action) &&
                action.created > (latestPreSessionCreated ?? sessionStartTime);

            if ((isCurrentUserPendingAddAction(action, currentUserAccountID) || isSessionReply) && !nextCaptured.has(actionID)) {
                if (nextCaptured === captured) {
                    nextCaptured = new Set(captured);
                }
                nextCaptured.add(actionID);
            }

            if (isNewArrival) {
                if (nextSeen === seen) {
                    nextSeen = new Set(seen);
                }
                nextSeen.add(actionID);
            }
        }
    }

    if (nextCaptured !== capturedIDs) {
        setCapturedIDs(nextCaptured);
    }
    if (nextSeen !== seenIDs) {
        setSeenIDs(nextSeen);
    }

    return nextCaptured;
}

export default useCurrentSessionActionIDs;
