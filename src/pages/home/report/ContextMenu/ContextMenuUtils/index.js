/* eslint-disable import/prefer-default-export */

/**
 * We should show popover description only on mWeb
 *
 * @param {String} selection
 * @param {Boolean} isSmallScreenWidth
 * @returns {Boolean}
 */
function getPopoverDescription(selection, isSmallScreenWidth) {
    return isSmallScreenWidth ? selection : '';
}

export {
    getPopoverDescription,
};
