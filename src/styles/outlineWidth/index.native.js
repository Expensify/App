/**
 * Native platforms don't support the "outlineWidth" property, so this
 * function is a no-op
 */

/**
 * @param {object} obj
 * @returns {object}
 */
function withOutlineWidth(obj) {
    return obj;
}

export default withOutlineWidth;
