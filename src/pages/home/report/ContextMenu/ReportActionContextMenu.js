import React from 'react';

const contextMenuRef = React.createRef();

/**
 * Hide the ReportActionContextMenu modal popover.
 * Hides the popover menu with an optional delay
 * @param {Boolean} shouldDelay - whether the menu should close after a delay
 * @param {Function} [onHideCallback=() => {}] - Callback to be called after Context Menu is completely hidden
 */
function hideContextMenu(shouldDelay, onHideCallback = () => {}) {
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
    const instanceID = contextMenuRef.current.instanceID;
    setTimeout(() => {
        if (contextMenuRef.current.instanceID !== instanceID) {
            return;
        }

        contextMenuRef.current.hideContextMenu(onHideCallback);
    }, 800);
}

/**
 * Show the ReportActionContextMenu modal popover.
 *
 * @param {string} type - the context menu type to display [EMAIL, LINK, REPORT_ACTION, REPORT]
 * @param {Object} [event] - A press event.
 * @param {String} [selection] - Copied content.
 * @param {Element} contextMenuAnchor - popoverAnchor
 * @param {String} reportID - Active Report Id
 * @param {Object} reportAction - ReportAction for ContextMenu
 * @param {String} draftMessage - ReportAction Draftmessage
 * @param {Function} [onShow=() => {}] - Run a callback when Menu is shown
 * @param {Function} [onHide=() => {}] - Run a callback when Menu is hidden
 * @param {Boolean} isArchivedRoom - Whether the provided report is an archived room
 * @param {Boolean} isChronosReport - Flag to check if the chat participant is Chronos
 * @param {Boolean} isPinnedChat - Flag to check if the chat is pinned in the LHN. Used for the Pin/Unpin action
 * @param {Boolean} isUnreadChat - Flag to check if the chat has unread messages in the LHN. Used for the Mark as Read/Unread action
 */
function showContextMenu(
    type,
    event,
    selection,
    contextMenuAnchor,
    reportID = '0',
    reportAction = {},
    draftMessage = '',
    onShow = () => {},
    onHide = () => {},
    isArchivedRoom = false,
    isChronosReport = false,
    isPinnedChat = false,
    isUnreadChat = false,
) {
    if (!contextMenuRef.current) {
        return;
    }
    // If there is an already open context menu, close it first before opening
    // a new one.
    if (contextMenuRef.current.instanceID) {
        hideContextMenu();
        contextMenuRef.current.runAndResetOnPopoverHide();
    }
    contextMenuRef.current.showContextMenu(
        type,
        event,
        selection,
        contextMenuAnchor,
        reportID,
        reportAction,
        draftMessage,
        onShow,
        onHide,
        isArchivedRoom,
        isChronosReport,
        isPinnedChat,
        isUnreadChat,
    );
}

function hideDeleteModal() {
    if (!contextMenuRef.current) {
        return;
    }
    contextMenuRef.current.hideDeleteModal();
}

/**
 * Opens the Confirm delete action modal
 * @param {String} reportID
 * @param {Object} reportAction
 * @param {Boolean} [shouldSetModalVisibility]
 * @param {Function} [onConfirm]
 * @param {Function} [onCancel]
 */
function showDeleteModal(reportID, reportAction, shouldSetModalVisibility, onConfirm, onCancel) {
    if (!contextMenuRef.current) {
        return;
    }
    contextMenuRef.current.showDeleteModal(reportID, reportAction, shouldSetModalVisibility, onConfirm, onCancel);
}

/**
 * Whether Context Menu is active for the Report Action.
 *
 * @param {Number|String} actionID
 * @return {Boolean}
 */
function isActiveReportAction(actionID) {
    if (!contextMenuRef.current) {
        return;
    }
    return contextMenuRef.current.isActiveReportAction(actionID);
}

export {contextMenuRef, showContextMenu, hideContextMenu, isActiveReportAction, showDeleteModal, hideDeleteModal};
