import {isCreatedAction, isCurrentUserPendingAddAction} from '@libs/ReportActionsUtils';

import type {ReportAction} from '@src/types/onyx';

import {useState} from 'react';

/**
 * Tracks the IDs of the report actions that belong to the active Concierge session — the current
 * user's own messages and the Concierge replies to them — identified by arrival rather than timestamp.
 *
 * Timestamps can't be trusted here: `sessionStartTime` is a raw client clock value, the user's
 * optimistic message is stamped with the skew-adjusted client clock, and a Concierge reply carries an
 * authoritative server timestamp. When the client clock runs ahead of the server, a genuine reply's
 * `created` lands before `sessionStartTime` and it gets filtered out of the session — "sometimes no
 * response from Concierge". So membership is captured from clock-independent facts instead:
 *   - The current user's own messages are captured while optimistic (`pendingAction === ADD`) and kept
 *     for the rest of the session, so a skewed message keeps counting even after AddComment success
 *     clears its `pendingAction` (which never rewrites `created`).
 *   - Once the user has sent a message this session, any newly-arriving action (i.e. not present at
 *     session start) is the Concierge reply to it and is captured too. A server-time floor over the
 *     history already loaded at session start keeps late-loading older history from leaking in, since
 *     a reply is always newer than any pre-session message (server clocks are monotonic).
 *
 * The sets reset when `sessionStartTime` changes so IDs from a previous session never leak into a new
 * one. Capture happens during render (via the "adjust state during render" pattern) so the returned
 * set is correct within the same render.
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
        // The user has an active question in this session once one of their optimistic ADDs has been
        // captured (or is still pending). Only then can a newly-arriving action be attributed to the
        // ongoing exchange (i.e. the Concierge reply).
        const userHasSentMessage = actions.some(
            (action) =>
                !!action.reportActionID &&
                action.actorAccountID === currentUserAccountID &&
                (isCurrentUserPendingAddAction(action, currentUserAccountID) || captured.has(action.reportActionID)),
        );

        // Newest server timestamp among the history already loaded at session start (excluding the
        // user's own skew-stamped messages). A reply is always newer than this, so it is a skew-proof
        // floor that late-loading older history can never cross.
        let latestPreSessionCreated: string | undefined;
        for (const action of actions) {
            if (!action.reportActionID || !seen.has(action.reportActionID) || action.actorAccountID === currentUserAccountID || isCreatedAction(action)) {
                continue;
            }
            if (!latestPreSessionCreated || action.created > latestPreSessionCreated) {
                latestPreSessionCreated = action.created;
            }
        }

        // The baseline is established once we have observed the actions loaded at session start; before
        // that every action looks "new", so we must not capture replies yet.
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
                (latestPreSessionCreated === undefined || action.created > latestPreSessionCreated);

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
