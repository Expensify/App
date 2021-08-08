import React from 'react';

const contextMenuRef = React.createRef();

/**
 * Show the ReportActionContextMenu modal popover.
 *
 * @param {string} type - the context menu type to display [LINK, REPORT_ACTION]
 * @param {Object} [event] - A press event.
 * @param {string} [selection] - A copy text.
 * @param {Element} contextMenuAnchor - popoverAnchor
 * @param {Number} reportID - Active Report Id
 * @param {Object} reportAction - ReportAction for ContextMenu
 * @param {String} draftMessage - ReportAction Draftmessage
 * @param {Function} [onShow=() => {}] - Run a callback when Menu is shown
 * @param {Function} [onHide=() => {}] - Run a callback when Menu is hidden
 */
function showContextMenu(
    type,
    event,
    selection,
    contextMenuAnchor,
    reportID = 0,
    reportAction = {},
    draftMessage = '',
    onShow = () => {},
    onHide = () => {},
) {
    if (!contextMenuRef.current) {
        return;
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
    );
}

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
    setTimeout(() => contextMenuRef.current.hideContextMenu(onHideCallback), 800);
}

function hideDeleteModal() {
    if (!contextMenuRef.current) {
        return;
    }
    contextMenuRef.current.hideDeleteModal();
}

/**
 * Opens the Confirm delete action modal
 * @param {Number} reportID
 * @param {Object} reportAction
 */
function showDeleteModal(reportID, reportAction) {
    if (!contextMenuRef.current) {
        return;
    }
    contextMenuRef.current.showDeleteModal(reportID, reportAction);
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

export {
    contextMenuRef,
    showContextMenu,
    hideContextMenu,
    isActiveReportAction,
    showDeleteModal,
    hideDeleteModal,
};
