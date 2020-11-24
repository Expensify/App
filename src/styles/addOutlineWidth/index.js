/**
 * Web and desktop platforms support the "addOutlineWidth" property, so it
 * can be added to the object
 */

/**
 * Adds the addOutlineWidth property to an object to be used when styling
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
