/**
 * Native platforms don't support the "outlineWidth" property, so this
 * function is a no-op
 */

/**
 * @param {object} obj
 * @param {number] }val
 * @returns {object}
 */
function withOutlineWidth(obj, val) {
    return obj;
}

export default withOutlineWidth;
