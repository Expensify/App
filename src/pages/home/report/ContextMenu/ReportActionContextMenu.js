"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contextMenuRef = void 0;
exports.showContextMenu = showContextMenu;
exports.hideContextMenu = hideContextMenu;
exports.isActiveReportAction = isActiveReportAction;
exports.clearActiveReportAction = clearActiveReportAction;
exports.showDeleteModal = showDeleteModal;
exports.hideDeleteModal = hideDeleteModal;
var react_1 = require("react");
var contextMenuRef = react_1.default.createRef();
exports.contextMenuRef = contextMenuRef;
/**
 * Hide the ReportActionContextMenu modal popover.
 * Hides the popover menu with an optional delay
 * @param [shouldDelay] - whether the menu should close after a delay
 * @param [onHideCallback] - Callback to be called after Context Menu is completely hidden
 */
function hideContextMenu(shouldDelay, onHideCallback) {
    if (onHideCallback === void 0) { onHideCallback = function () { }; }
    if (!contextMenuRef.current) {
        return;
    }
    if (!shouldDelay) {
        contextMenuRef.current.hideContextMenu(onHideCallback);
        return;
    }
    // Save the active instanceID for which hide action was called.
    // If menu is being closed with a delay, check that whether the same instance exists or a new was created.
    // If instance is not same, cancel the hide action
    var instanceID = contextMenuRef.current.instanceIDRef.current;
    setTimeout(function () {
        var _a;
        if (((_a = contextMenuRef.current) === null || _a === void 0 ? void 0 : _a.instanceIDRef.current) !== instanceID) {
            return;
        }
        contextMenuRef.current.hideContextMenu(onHideCallback);
    }, 800);
}
/**
 * Show the ReportActionContextMenu modal popover.
 *
 * @param type - the context menu type to display [EMAIL, LINK, REPORT_ACTION, REPORT]
 * @param [event] - A press event.
 * @param [selection] - Copied content.
 * @param contextMenuAnchor - popoverAnchor
 * @param reportID - Active Report Id
 * @param reportActionID - ReportActionID for ContextMenu
 * @param originalReportID - The current Report Id of the reportAction
 * @param draftMessage - ReportAction draft message
 * @param [onShow=() => {}] - Run a callback when Menu is shown
 * @param [onHide=() => {}] - Run a callback when Menu is hidden
 * @param isArchivedRoom - Whether the provided report is an archived room
 * @param isChronosReport - Flag to check if the chat participant is Chronos
 * @param isPinnedChat - Flag to check if the chat is pinned in the LHN. Used for the Pin/Unpin action
 * @param isUnreadChat - Flag to check if the chat has unread messages in the LHN. Used for the Mark as Read/Unread action
 */
function showContextMenu(showContextMenuParams) {
    if (!contextMenuRef.current) {
        return;
    }
    var show = function () {
        var _a;
        (_a = contextMenuRef.current) === null || _a === void 0 ? void 0 : _a.showContextMenu(showContextMenuParams);
    };
    // If there is an already open context menu, close it first before opening
    // a new one.
    if (contextMenuRef.current.instanceIDRef.current) {
        hideContextMenu(false, show);
        return;
    }
    show();
}
/**
 * Hides the Confirm delete action modal
 */
function hideDeleteModal() {
    if (!contextMenuRef.current) {
        return;
    }
    contextMenuRef.current.hideDeleteModal();
}
/**
 * Opens the Confirm delete action modal
 */
function showDeleteModal(reportID, reportAction, shouldSetModalVisibility, onConfirm, onCancel) {
    if (!contextMenuRef.current || !reportID) {
        return;
    }
    contextMenuRef.current.showDeleteModal(reportID, reportAction, shouldSetModalVisibility, onConfirm, onCancel);
}
/**
 * Whether Context Menu is active for the Report Action.
 */
function isActiveReportAction(actionID) {
    if (!contextMenuRef.current) {
        return false;
    }
    return contextMenuRef.current.isActiveReportAction(actionID);
}
function clearActiveReportAction() {
    if (!contextMenuRef.current) {
        return;
    }
    return contextMenuRef.current.clearActiveReportAction();
}
