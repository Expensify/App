/**
 * Web and desktop platforms support the "addOutlineWidth" property, so it
 * can be added to the object
 */

import themeDefault from '../themes/default';

/**
 * Adds the addOutlineWidth property to an object to be used when styling
 *
 * @param {Object} obj
 * @param {Number} val
 * @param {boolean} [error=false]
 * @returns {Object}
 */
function withOutlineWidth(obj, val, error = false) {
    return {
        ...obj,
        outlineWidth: val,
        ...(val !== 0 && {
            boxShadow: `0px 0px 0px ${val}px ${error ? themeDefault.badgeDangerBG : themeDefault.borderFocus}`,
        }),
    };
}

export default withOutlineWidth;
