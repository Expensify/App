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
 * @returns {Object}
 */
function withOutlineWidth(obj, val) {
    return {
        ...obj,
        outlineWidth: val,
        boxShadow: `0px 0px 0px ${val}px ${themeDefault.borderFocus}`,
    };
}

export default withOutlineWidth;
