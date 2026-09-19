import {getOriginalMessage, isActionOfType, isReportActionUnread, isReportPreviewAction, shouldHideNewMarker} from '@libs/ReportActionsUtils';

import CONST from '@src/CONST';
import type * as OnyxTypes from '@src/types/onyx';

type ShouldDisplayNewMarkerOnReportActionParams = {
    /** The reportAction for which the check is done */
    message: OnyxTypes.ReportAction;

    /** The reportAction adjacent to `message` (either previous or next one) */
    nextMessage: OnyxTypes.ReportAction | undefined;

    isEarliestReceivedOfflineMessage: boolean;
    unreadMarkerTime: string | undefined;
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

    /** Actions created before this time cannot have "just arrived" (e.g. Concierge history revealed via "Show history"),
     * so the live auto-read suppression for new-to-list messages does not apply to them */
    newMessageBoundaryTime?: string | null;
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
    newMessageBoundaryTime,
}: ShouldDisplayNewMarkerOnReportActionParams): boolean => {
    // While a manual mark is active, the marked action is the sole anchor: every other action is suppressed.
    // We anchor by reportActionID rather than timestamp because `created` shifts on the optimistic->confirmed
    // transition and would wrongly read as already-read. The marked action is the oldest unread by construction
    // (markCommentAsUnread sets lastReadTime = its created - 1ms), so it stays correct as newer messages arrive.
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
    const prevMarkedReportAction = prevUnreadMarkerReportActionID ? prevSortedVisibleReportActionsObjects[prevUnreadMarkerReportActionID] : undefined;
    const isPreviouslyUnreadFromCurrentUser = currentUserAccountID === prevMarkedReportAction?.actorAccountID;
    // Once a self-authored action holds the marker, don't let a different self-authored action steal it (the
    // Expensify/App#91940 hop). Only while that anchor is still present — if it was deleted, the marker must relocate.
    const isDifferentUnread = isPrevUnreadMarkerReportActionPresent && isPreviouslyUnreadFromCurrentUser && prevMarkedReportAction?.reportActionID !== message.reportActionID;
    const shouldIgnoreUnreadForCurrentUserMessage = isNewMessage || isPreviouslyOptimistic || isDifferentUnread;

    if (isFromCurrentUser) {
        // Only move/keep the marker on a self-authored action when one already exists in this session.
        // An explicit mark-as-unread bypasses this guard via the early return at the top of the function.
        if (prevUnreadMarkerReportActionID) {
            return !shouldIgnoreUnreadForCurrentUserMessage;
        }
        return false;
    }

    // An action created before the session boundary was revealed or loaded from history, not received live,
    // so it is never treated as read-on-arrival.
    const isRevealedHistoryMessage = !!newMessageBoundaryTime && message.created < newMessageBoundaryTime;

    const result = !isNewMessage || isRevealedHistoryMessage || isScrolledOverThreshold || !hasWindowFocus;
    return result;
};

function canReportActionTriggerUnreadMarker(reportAction: OnyxTypes.ReportAction, currentUserAccountID: number): boolean {
    if (isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.REIMBURSED)) {
        const originalMessage = getOriginalMessage(reportAction);
        const actionableForAccountIDs = originalMessage?.actionableForAccountIDs;
        return !actionableForAccountIDs || actionableForAccountIDs.includes(currentUserAccountID);
    }

    return !isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.EXPORTED_TO_INTEGRATION);
}

export default shouldDisplayNewMarkerOnReportAction;

type GetUnreadMarkerReportActionParams = {
    /** The visible report actions to scan */
    visibleReportActions: OnyxTypes.ReportAction[];

    /** Index of the earliest message received while offline, used to limit the scan range */
    earliestReceivedOfflineMessageIndex: number | undefined;

    currentUserAccountID: number;

    /** Map of reportActions saved via usePrev */
    prevSortedVisibleReportActionsObjects: OnyxTypes.ReportActions;

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

    /** Actions created before this time cannot have "just arrived" (e.g. Concierge history revealed via "Show history"),
     * so the live auto-read suppression for new-to-list messages does not apply to them */
    newMessageBoundaryTime?: string | null;
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
    newMessageBoundaryTime,
}: GetUnreadMarkerReportActionParams): [string | null, number] => {
    if (isAnonymousUser) {
        return [null, -1];
    }

    // Drop the manual anchor once the marked action is deleted, otherwise no action would match it and the
    // marker would vanish instead of relocating via the timestamp scan below.
    const manuallyMarkedUnreadReportActionIndex = manuallyMarkedUnreadReportActionID
        ? visibleReportActions.findIndex((action) => action.reportActionID === manuallyMarkedUnreadReportActionID)
        : -1;
    const manuallyMarkedUnreadReportAction = manuallyMarkedUnreadReportActionIndex >= 0 ? visibleReportActions.at(manuallyMarkedUnreadReportActionIndex) : undefined;
    const activeManuallyMarkedUnreadReportActionID =
        manuallyMarkedUnreadReportAction && !shouldHideNewMarker(manuallyMarkedUnreadReportAction, isOffline) ? manuallyMarkedUnreadReportActionID : null;

    if (activeManuallyMarkedUnreadReportActionID) {
        return [activeManuallyMarkedUnreadReportActionID, manuallyMarkedUnreadReportActionIndex];
    }

    // Lets the caller tell "the anchor was deleted, so relocate the marker" apart from "the anchor is still
    // around, so another self-authored action must not steal it".
    const isPrevUnreadMarkerReportActionPresent = prevUnreadMarkerReportActionID
        ? visibleReportActions.some((action) => action.reportActionID === prevUnreadMarkerReportActionID && !shouldHideNewMarker(action, isOffline))
        : false;

    const canActionTriggerMarker = (action: OnyxTypes.ReportAction | undefined): action is OnyxTypes.ReportAction =>
        !!action && (isReversed || action.reportActionID !== CONST.CONCIERGE_GREETING_ACTION_ID) && canReportActionTriggerUnreadMarker(action, currentUserAccountID);

    let earliestEligibleReceivedOfflineMessageIndex = earliestReceivedOfflineMessageIndex;
    if (!isReversed && earliestEligibleReceivedOfflineMessageIndex !== undefined) {
        while (earliestEligibleReceivedOfflineMessageIndex >= 0 && !canActionTriggerMarker(visibleReportActions.at(earliestEligibleReceivedOfflineMessageIndex))) {
            earliestEligibleReceivedOfflineMessageIndex--;
        }
        if (earliestEligibleReceivedOfflineMessageIndex < 0) {
            return [null, -1];
        }
    }

    const startIndex = isReversed ? visibleReportActions.length - 1 : (earliestEligibleReceivedOfflineMessageIndex ?? 0);
    const endIndex = isReversed ? (earliestEligibleReceivedOfflineMessageIndex ?? 0) : visibleReportActions.length;
    const step = isReversed ? -1 : 1;

    for (let index = startIndex; isReversed ? index >= endIndex : index < endIndex; index += step) {
        const reportAction = visibleReportActions.at(index);

        if (!canActionTriggerMarker(reportAction)) {
            continue;
        }

        let nextAction: OnyxTypes.ReportAction | undefined;
        const nextActionStep = isReversed ? -1 : 1;
        for (let nextIndex = index + nextActionStep; nextIndex >= 0 && nextIndex < visibleReportActions.length; nextIndex += nextActionStep) {
            const candidate = visibleReportActions.at(nextIndex);
            if (canActionTriggerMarker(candidate)) {
                nextAction = candidate;
                break;
            }
        }

        const isEarliestReceivedOfflineMessage = index === earliestEligibleReceivedOfflineMessageIndex;

        const shouldShowMarker = shouldDisplayNewMarkerOnReportAction({
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
            newMessageBoundaryTime,
        });

        if (shouldShowMarker) {
            return [reportAction.reportActionID, index];
        }
    }

    return [null, -1];
};

export {canReportActionTriggerUnreadMarker, getUnreadMarkerReportAction};
