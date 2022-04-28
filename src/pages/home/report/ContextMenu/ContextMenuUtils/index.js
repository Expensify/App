/* eslint-disable import/prefer-default-export */
import * as ContextMenuActions from '../ContextMenuActions';

/**
 * Returns full link address to show in the tooltip
 *
 * @param {String} menuType
 * @param {String} link
 * @param {Boolean} isSmallScreenWidth
 * @returns {String}
 */
function getPopoverDescription(menuType, link, isSmallScreenWidth) {
    if (menuType === ContextMenuActions.CONTEXT_MENU_TYPES.LINK && isSmallScreenWidth) {
        return link;
    }
    return '';
}

export {
    getPopoverDescription,
};
