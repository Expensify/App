/* eslint-disable import/prefer-default-export */
import * as ContextMenuActions from '../ContextMenuActions';

/**
 * Returns full link address to show in the context menu's description
 *
 * @param {String} menuType
 * @param {String} link
 * @returns {String}
 */
function getPopoverDescription(menuType, link) {
    if (menuType === ContextMenuActions.CONTEXT_MENU_TYPES.LINK) {
        return link;
    }
    return '';
}

export {
    getPopoverDescription,
};
