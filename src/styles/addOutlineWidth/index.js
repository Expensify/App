/**
 * Web and desktop platforms support the "addOutlineWidth" property, so it
 * can be added to the object
 */

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
    };
}

export default withOutlineWidth;
