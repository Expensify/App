import * as ContextMenuActions from '../pages/home/report/ContextMenu/ContextMenuActions';
import * as ReportActionContextMenu from '../pages/home/report/ContextMenu/ReportActionContextMenu';

/**
 * Show the ReportActionContextMenu modal popover.
 *
 * @param {Object} [event] - A press event.
 * @param {String} [selection] - Copied content.
 * @param {Object} [popoverAnchor] - The popover anchor.
 */
const showPopover = (event, selection, popoverAnchor) => {
    ReportActionContextMenu.showContextMenu(
        ContextMenuActions.CONTEXT_MENU_TYPES.LINK,
        event,
        selection,
        popoverAnchor,
    );
};

export default showPopover;
