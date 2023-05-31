/**
 * Get the current number of lines in the composer
 *
 * @param {Number} lineHeight
 * @param {Number} paddingTopAndBottom
 * @param {Number} scrollHeight
 *
 * @returns {Number}
 */
function getNumberOfLines(lineHeight, paddingTopAndBottom, scrollHeight) {
    return Math.ceil((scrollHeight - paddingTopAndBottom) / lineHeight);
}

export default getNumberOfLines;
