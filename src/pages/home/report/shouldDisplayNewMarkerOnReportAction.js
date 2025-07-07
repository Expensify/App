"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ReportActionsUtils_1 = require("@libs/ReportActionsUtils");
var CONST_1 = require("@src/CONST");
/**
 * This function decides whether the given report action (message) should have the new marker indicator displayed
 * It's used for the standard "chat" Report and for `MoneyRequestReport` actions lists.
 */
var shouldDisplayNewMarkerOnReportAction = function (_a) {
    var _b;
    var message = _a.message, nextMessage = _a.nextMessage, isEarliestReceivedOfflineMessage = _a.isEarliestReceivedOfflineMessage, unreadMarkerTime = _a.unreadMarkerTime, accountID = _a.accountID, prevSortedVisibleReportActionsObjects = _a.prevSortedVisibleReportActionsObjects, prevUnreadMarkerReportActionID = _a.prevUnreadMarkerReportActionID, scrollingVerticalOffset = _a.scrollingVerticalOffset;
    var isNextMessageUnread = !!nextMessage && (0, ReportActionsUtils_1.isReportActionUnread)(nextMessage, unreadMarkerTime);
    // If the current message is the earliest message received while offline, we want to display the unread marker above this message.
    if (isEarliestReceivedOfflineMessage && !isNextMessageUnread) {
        return true;
    }
    // If the unread marker should be hidden or is not within the visible area, don't show the unread marker.
    if ((0, ReportActionsUtils_1.shouldHideNewMarker)(message)) {
        return false;
    }
    var isCurrentMessageUnread = (0, ReportActionsUtils_1.isReportActionUnread)(message, unreadMarkerTime);
    // If the current message is read or the next message is unread, don't show the unread marker.
    if (!isCurrentMessageUnread || isNextMessageUnread) {
        return false;
    }
    var isPendingAdd = function (action) {
        return (action === null || action === void 0 ? void 0 : action.pendingAction) === CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD;
    };
    // If no unread marker exists, don't set an unread marker for newly added messages from the current user.
    var isFromCurrentUser = accountID === ((0, ReportActionsUtils_1.isReportPreviewAction)(message) ? message.childLastActorAccountID : message.actorAccountID);
    var isNewMessage = !prevSortedVisibleReportActionsObjects[message.reportActionID];
    // The unread marker will show if the action's `created` time is later than `unreadMarkerTime`.
    // The `unreadMarkerTime` has already been updated to match the optimistic action created time,
    // but once the new action is saved on the backend, the actual created time will be later than the optimistic one.
    // Therefore, we also need to prevent the unread marker from appearing for previously optimistic actions.
    var isPreviouslyOptimistic = (isPendingAdd(prevSortedVisibleReportActionsObjects[message.reportActionID]) && !isPendingAdd(message)) ||
        (!!((_b = prevSortedVisibleReportActionsObjects[message.reportActionID]) === null || _b === void 0 ? void 0 : _b.isOptimisticAction) && !message.isOptimisticAction);
    var shouldIgnoreUnreadForCurrentUserMessage = !prevUnreadMarkerReportActionID && isFromCurrentUser && (isNewMessage || isPreviouslyOptimistic);
    if (isFromCurrentUser) {
        return !shouldIgnoreUnreadForCurrentUserMessage;
    }
    return !isNewMessage || scrollingVerticalOffset >= CONST_1.default.REPORT.ACTIONS.ACTION_VISIBLE_THRESHOLD;
};
exports.default = shouldDisplayNewMarkerOnReportAction;
