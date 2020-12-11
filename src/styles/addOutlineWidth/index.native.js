/**
 * Native platforms don't support the "addOutlineWidth" property, so this
 * function is a no-op
 */

/**
 * @param {Object} obj
 * @returns {Object}
 */
function withOutlineWidth(obj) {
    return obj;
}

export default withOutlineWidth;
