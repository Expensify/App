import CONST from '../../CONST';

/**
 * Adds the header padding with vertical offset on desktop
 * @param {Number} vertical
 * @returns {Object}
 */
export default (vertical) => ({
    // We add CONST.DESKTOP_HEADER_GAP on desktop which we
    // need to add to vertical offset to have proper vertical
    // offset on desktop
    vertical: vertical + CONST.DESKTOP_HEADER_PADDING,
});
