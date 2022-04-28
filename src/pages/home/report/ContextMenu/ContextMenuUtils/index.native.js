/* eslint-disable import/prefer-default-export */

/**
 * Always show popover description on native platforms
 *
 * @param {String} selection
 * @returns {Boolean}
 */
function getPopoverDescription(selection) {
    return selection;
}

export {
    getPopoverDescription,
};
