import React from 'react';
import * as ReportActionContextMenu from '../pages/home/report/ContextMenu/ReportActionContextMenu';
import * as ContextMenuActions from '../pages/home/report/ContextMenu/ContextMenuActions';

const ShowContextMenuContext = React.createContext(null);
ShowContextMenuContext.displayName = 'ShowContextMenuContext';

/**
 * Show the report action context menu.
 *
 * @param {Object} [event] - A press event
 * @param {Element} anchor - Context menu anchor
 * @param {String} reportID - Active Report Id
 * @param {Object} action - ReportAction for ContextMenu
 * @param {Function} checkIfContextMenuActive Callback to update context menu active state
 */
function showContextMenuForReport(event, anchor, reportID, action, checkIfContextMenuActive) {
    ReportActionContextMenu.showContextMenu(
        ContextMenuActions.CONTEXT_MENU_TYPES.REPORT_ACTION,
        event,
        '',
        anchor,
        reportID,
        action,
        '',
        checkIfContextMenuActive,
        checkIfContextMenuActive,
    );
}

export {
    ShowContextMenuContext,
    showContextMenuForReport,
};
