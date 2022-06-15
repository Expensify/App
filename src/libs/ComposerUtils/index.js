/**
 * Get the current number of lines in the composer
 *
 * @param {Number} maxLines
 * @param {Number} lineHeight
 * @param {Number} paddingTopAndBottom
 * @param {Number} scrollHeight
 *
 * @returns {Number}
 */
function getNumberOfLines(maxLines, lineHeight, paddingTopAndBottom, scrollHeight) {
    let newNumberOfLines = Math.ceil((scrollHeight - paddingTopAndBottom) / lineHeight);
    newNumberOfLines = maxLines <= 0 ? newNumberOfLines : Math.min(newNumberOfLines, maxLines);
    return newNumberOfLines;
}

export default getNumberOfLines;
