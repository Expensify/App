/* eslint-disable import/prefer-default-export */

/**
 * We should show popover description only for mWeb
 *
 * @param {Boolean} isSmallScreenWidth
 * @returns {Boolean}
 */
function shouldShowDescription(isSmallScreenWidth) {
    return isSmallScreenWidth;
}

export {
    shouldShowDescription,
};
