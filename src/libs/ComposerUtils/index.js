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

/**
 * Replace substring between selection with a text.
 * @param {String} text
 * @param {Object} selection
 * @param {String} textToInsert
 * @returns {String}
 */
function insertText(text, selection, textToInsert) {
    return text.slice(0, selection.start) + textToInsert + text.slice(selection.end, text.length);
}

export {
    getNumberOfLines,
    insertText,
};
