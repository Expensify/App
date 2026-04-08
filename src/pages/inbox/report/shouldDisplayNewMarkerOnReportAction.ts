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

    /** Current value for vertical offset */
    scrollingVerticalOffset: number;

    /** The id of reportAction that was last marked as read */
    prevUnreadMarkerReportActionID: string | null;

    /** Whether the network is offline */
    isOffline: boolean;
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
    prevUnreadMarkerReportActionID,
    scrollingVerticalOffset,
    isOffline,
}: ShouldDisplayNewMarkerOnReportActionParams): boolean => {
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
    const shouldIgnoreUnreadForCurrentUserMessage = !prevUnreadMarkerReportActionID && isFromCurrentUser && (isNewMessage || isPreviouslyOptimistic);

    if (isFromCurrentUser) {
        return !shouldIgnoreUnreadForCurrentUserMessage;
    }

    return !isNewMessage || scrollingVerticalOffset >= CONST.REPORT.ACTIONS.ACTION_VISIBLE_THRESHOLD;
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

    /** Current value for vertical offset */
    scrollingVerticalOffset: number;

    /** The id of reportAction that was last marked as read */
    prevUnreadMarkerReportActionID: string | null;

    /** Whether the network is offline */
    isOffline: boolean;

    /** Whether to scan the array from high index to low (e.g. non-inverted FlatList) instead of low to high */
    isReversed: boolean;

    /** Whether the current user is anonymous — skips the scan entirely */
    isAnonymousUser?: boolean;
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
    scrollingVerticalOffset,
    prevUnreadMarkerReportActionID,
    isOffline,
    isReversed,
    isAnonymousUser = false,
}: GetUnreadMarkerReportActionParams): [string | null, number] => {
    if (isAnonymousUser) {
        return [null, -1];
    }

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
                scrollingVerticalOffset,
                prevUnreadMarkerReportActionID,
                isOffline,
            });

        if (shouldShowMarker) {
            return [reportAction.reportActionID, index];
        }
    }

    return [null, -1];
};

export {getUnreadMarkerReportAction};
