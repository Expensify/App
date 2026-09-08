import {isReportActionUnread, isReportPreviewAction, shouldHideNewMarker} from '@libs/ReportActionsUtils';

import CONST from '@src/CONST';
import type * as OnyxTypes from '@src/types/onyx';

type ShouldDisplayNewMarkerOnReportActionParams = {
    /** The reportAction for which the check is done */
    message: OnyxTypes.ReportAction;

    /** The reportAction adjacent to `message` (either previous or next one) */
    nextMessage: OnyxTypes.ReportAction | undefined;

    /** Is it the earliestReceivedOfflineMessage */
    isEarliestReceivedOfflineMessage: boolean;

    /** Time for unreadMarker */
    unreadMarkerTime: string | undefined;

    /** User accountID */
    currentUserAccountID: number;

    /** Map of reportActions saved via usePrev */
    prevSortedVisibleReportActionsObjects: Record<string, OnyxTypes.ReportAction>;

    /** Whether the list is scrolled past the threshold where incoming actions are considered out of view */
    isScrolledOverThreshold: boolean;

    /** Whether the network is offline */
    isOffline: boolean;

    /** The reportActionID of the current unread marker, if one exists */
    prevUnreadMarkerReportActionID?: string | null;

    /** Whether the action `prevUnreadMarkerReportActionID` points to is still present (not deleted/hidden) */
    isPrevUnreadMarkerReportActionPresent?: boolean;

    /** The reportActionID the user explicitly marked as unread, if any */
    manuallyMarkedUnreadReportActionID?: string | null;
    /** Whether the app window is focused */
    hasWindowFocus?: boolean;
};

/**
 * This function decides whether the given report action (message) should have the new marker indicator displayed
 * It's used for the standard "chat" Report and for `MoneyRequestReport` actions lists.
 */
const shouldDisplayNewMarkerOnReportAction = ({
    message,
    nextMessage,
    isEarliestReceivedOfflineMessage,
    unreadMarkerTime,
    currentUserAccountID,
    prevSortedVisibleReportActionsObjects,
    isScrolledOverThreshold,
    isOffline,
    prevUnreadMarkerReportActionID,
    isPrevUnreadMarkerReportActionPresent = false,
    manuallyMarkedUnreadReportActionID,
    hasWindowFocus = true,
}: ShouldDisplayNewMarkerOnReportActionParams): boolean => {
    // The user explicitly marked an action as unread. While a manual mark is active, the marked action is
    // the *sole* anchor for the marker: show it only on the marked action and suppress it on every other
    // action (newer self-messages, other users' messages, the earliest offline message), regardless of the
    // timestamp-based checks below. Anchoring by the stored reportActionID is stable across the
    // optimistic->confirmed transition, where unreadMarkerTime, lastReadTime, and created all converge on
    // (or drift past) the confirmed `created` and isReportActionUnread would wrongly report the marked
    // action as read. The marked action is the oldest unread by construction (markCommentAsUnread sets
    // lastReadTime = its created - 1ms), so it stays the correct anchor even when newer messages arrive
    // after the mark. `shouldHideNewMarker` is still honored so the marker isn't anchored on a pending-delete action.
    if (manuallyMarkedUnreadReportActionID) {
        return message.reportActionID === manuallyMarkedUnreadReportActionID && !shouldHideNewMarker(message, isOffline);
    }

    const isNextMessageUnread = !!nextMessage && isReportActionUnread(nextMessage, unreadMarkerTime);

    // If the current message is the earliest message received while offline, we want to display the unread marker above this message.
    if (isEarliestReceivedOfflineMessage && !isNextMessageUnread) {
        return true;
    }

    // If the unread marker should be hidden or is not within the visible area, don't show the unread marker.
    if (shouldHideNewMarker(message, isOffline)) {
        return false;
    }

    const isCurrentMessageUnread = isReportActionUnread(message, unreadMarkerTime);

    // If the current message is read or the next message is unread, don't show the unread marker.
    if (!isCurrentMessageUnread || isNextMessageUnread) {
        return false;
    }

    const isPendingAdd = (action: OnyxTypes.ReportAction) => {
        return action?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD;
    };

    // If no unread marker exists, don't set an unread marker for newly added messages from the current user.
    const isFromCurrentUser = currentUserAccountID === (isReportPreviewAction(message) ? message.childLastActorAccountID : message.actorAccountID);
    const isNewMessage = !prevSortedVisibleReportActionsObjects[message.reportActionID];

    // The unread marker will show if the action's `created` time is later than `unreadMarkerTime`.
    // The `unreadMarkerTime` has already been updated to match the optimistic action created time,
    // but once the new action is saved on the backend, the actual created time will be later than the optimistic one.
    // Therefore, we also need to prevent the unread marker from appearing for previously optimistic actions.
    const isPreviouslyOptimistic =
        (isPendingAdd(prevSortedVisibleReportActionsObjects[message.reportActionID]) && !isPendingAdd(message)) ||
        (!!prevSortedVisibleReportActionsObjects[message.reportActionID]?.isOptimisticAction && !message.isOptimisticAction);
    // This branch is only reached when no manual mark-as-unread is active (the check at the top of the
    // function returns early while one is). Ignore unread for a self-authored message that is new or was
    // just optimistic, preserving the #91940 behavior for cold opens.
    const prevMarkedReportAction = prevUnreadMarkerReportActionID ? prevSortedVisibleReportActionsObjects[prevUnreadMarkerReportActionID] : undefined;
    const isPreviouslyUnreadFromCurrentUser = currentUserAccountID === prevMarkedReportAction?.actorAccountID;
    // So essentially, the previously unread cannot move from one new self-user-action to another. Once a
    // self-authored action holds the marker, keep it there rather than letting it hop to a different
    // self-authored action (e.g. a persisted reimbursable toggle) — the regression from Expensify/App#91940.
    // This only applies while that previous anchor is still present: if it was deleted, the marker must be
    // allowed to relocate to the next unread message.
    const isDifferentUnread = isPrevUnreadMarkerReportActionPresent && isPreviouslyUnreadFromCurrentUser && prevMarkedReportAction?.reportActionID !== message.reportActionID;
    const shouldIgnoreUnreadForCurrentUserMessage = isNewMessage || isPreviouslyOptimistic || isDifferentUnread;

    if (isFromCurrentUser) {
        // For a self-authored action, only move/keep the "New" marker when one already exists in this session
        // (`prevUnreadMarkerReportActionID` is set). The explicit mark-as-unread case is handled earlier by the
        // stable `manuallyMarkedUnreadReportActionID` check, which anchors the marker on first open/re-entry
        // regardless of this guard.
        if (prevUnreadMarkerReportActionID) {
            return !shouldIgnoreUnreadForCurrentUserMessage;
        }
        return false;
    }

    return !isNewMessage || isScrolledOverThreshold || !hasWindowFocus;
};

export default shouldDisplayNewMarkerOnReportAction;

type GetUnreadMarkerReportActionParams = {
    /** The visible report actions to scan */
    visibleReportActions: OnyxTypes.ReportAction[];

    /** Index of the earliest message received while offline, used to limit the scan range */
    earliestReceivedOfflineMessageIndex: number | undefined;

    /** User accountID */
    currentUserAccountID: number;

    /** Map of reportActions saved via usePrev */
    prevSortedVisibleReportActionsObjects: OnyxTypes.ReportActions;

    /** Time for unreadMarker */
    unreadMarkerTime: string | undefined;

    /** Whether the list is scrolled past the threshold where incoming actions are considered out of view */
    isScrolledOverThreshold: boolean;

    /** Whether the network is offline */
    isOffline: boolean;

    /** Whether to scan the array from high index to low (e.g. non-inverted FlatList) instead of low to high */
    isReversed: boolean;

    /** Whether the current user is anonymous — skips the scan entirely */
    isAnonymousUser?: boolean;

    /** The reportActionID of the current unread marker, if one exists */
    prevUnreadMarkerReportActionID?: string | null;

    /** The reportActionID the user explicitly marked as unread, if any */
    manuallyMarkedUnreadReportActionID?: string | null;
    /** Whether the app window is focused */
    hasWindowFocus?: boolean;
};

/**
 * Scans visibleReportActions and returns the [reportActionID, index] tuple for the action
 * that should display the unread marker, or [null, -1] if none qualifies.
 */
const getUnreadMarkerReportAction = ({
    visibleReportActions,
    earliestReceivedOfflineMessageIndex,
    currentUserAccountID,
    prevSortedVisibleReportActionsObjects,
    unreadMarkerTime,
    isScrolledOverThreshold,
    isOffline,
    isReversed,
    isAnonymousUser = false,
    prevUnreadMarkerReportActionID,
    manuallyMarkedUnreadReportActionID,
    hasWindowFocus = true,
}: GetUnreadMarkerReportActionParams): [string | null, number] => {
    if (isAnonymousUser) {
        return [null, -1];
    }

    // The stable manual-mark anchor is only valid while the marked action is still present and not pending
    // deletion. Once it is deleted, keeping the anchor would leave every visible action failing the
    // `reportActionID === manuallyMarkedUnreadReportActionID` check, so the marker would vanish instead of
    // moving on. Drop the anchor in that case so the timestamp-based scan below can move the marker to the
    // next unread message.
    const manuallyMarkedUnreadReportAction = manuallyMarkedUnreadReportActionID
        ? visibleReportActions.find((action) => action.reportActionID === manuallyMarkedUnreadReportActionID)
        : undefined;
    const activeManuallyMarkedUnreadReportActionID =
        manuallyMarkedUnreadReportAction && !shouldHideNewMarker(manuallyMarkedUnreadReportAction, isOffline) ? manuallyMarkedUnreadReportActionID : null;

    // Whether the action the marker was previously anchored on is still present (not deleted/hidden). This
    // distinguishes "the anchor was deleted, so let the marker relocate to the next unread message" from
    // "the anchor is still around, so a different self-authored action must not steal the marker".
    const isPrevUnreadMarkerReportActionPresent = prevUnreadMarkerReportActionID
        ? visibleReportActions.some((action) => action.reportActionID === prevUnreadMarkerReportActionID && !shouldHideNewMarker(action, isOffline))
        : false;

    const startIndex = isReversed ? visibleReportActions.length - 1 : (earliestReceivedOfflineMessageIndex ?? 0);
    const endIndex = isReversed ? (earliestReceivedOfflineMessageIndex ?? 0) : visibleReportActions.length;
    const step = isReversed ? -1 : 1;

    for (let index = startIndex; isReversed ? index >= endIndex : index < endIndex; index += step) {
        const reportAction = visibleReportActions.at(index);

        if (!isReversed && reportAction?.reportActionID === CONST.CONCIERGE_GREETING_ACTION_ID) {
            continue;
        }

        let nextAction: OnyxTypes.ReportAction | undefined;
        if (isReversed) {
            nextAction = index > 0 ? visibleReportActions.at(index - 1) : undefined;
        } else {
            nextAction = visibleReportActions.at(index + 1);
            if (nextAction?.reportActionID === CONST.CONCIERGE_GREETING_ACTION_ID) {
                nextAction = visibleReportActions.at(index + 2);
            }
        }

        const isEarliestReceivedOfflineMessage = index === earliestReceivedOfflineMessageIndex;

        const shouldShowMarker =
            reportAction &&
            shouldDisplayNewMarkerOnReportAction({
                message: reportAction,
                nextMessage: nextAction,
                isEarliestReceivedOfflineMessage,
                currentUserAccountID,
                prevSortedVisibleReportActionsObjects,
                unreadMarkerTime,
                isScrolledOverThreshold,
                isOffline,
                prevUnreadMarkerReportActionID,
                isPrevUnreadMarkerReportActionPresent,
                manuallyMarkedUnreadReportActionID: activeManuallyMarkedUnreadReportActionID,
                hasWindowFocus,
            });

        if (shouldShowMarker) {
            return [reportAction.reportActionID, index];
        }
    }

    return [null, -1];
};

export {getUnreadMarkerReportAction};
