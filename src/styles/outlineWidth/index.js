/**
 * Web and desktop platforms support the "outlineWidth" property, so it
 * can be added to the object
 */

/**
 * Adds the outlineWidth property to an object to be used when styling
 *
 * @param {object} obj
 * @param {number} val
 * @returns {object}
 */
function withOutlineWidth(obj, val) {
    return {
        ...obj,
        outlineWidth: val,
    };
}

export default withOutlineWidth;
