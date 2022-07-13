/* eslint-disable import/prefer-default-export */

/**
 * The popover description will be an empty string on anything but mobile web
 * because we show link in tooltip instead of popover on web
 *
 * @param {Object} selection
 * @param {Boolean} isSmallScreenWidth
 * @returns {String}
 */
function getPopoverDescription(selection, isSmallScreenWidth) {
    return isSmallScreenWidth && selection ? selection.text : '';
}

export {
    getPopoverDescription,
};
