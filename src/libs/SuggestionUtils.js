import CONST from '../CONST';

/**
 * Return the max available index for arrow manager.
 * @param {Number} numRows
 * @param {Boolean} isAutoSuggestionPickerLarge
 * @returns {Number}
 */
function getMaxArrowIndex(numRows, isAutoSuggestionPickerLarge) {
    // rowCount is number of emoji/mention suggestions. For small screen we can fit 3 items
    // and for large we show up to 20 items for mentions/emojis
    const rowCount = isAutoSuggestionPickerLarge
        ? Math.min(numRows, CONST.AUTO_COMPLETE_SUGGESTER.MAX_AMOUNT_OF_SUGGESTIONS)
        : Math.min(numRows, CONST.AUTO_COMPLETE_SUGGESTER.MIN_AMOUNT_OF_SUGGESTIONS);

    // -1 because we start at 0
    return rowCount - 1;
}

/**
 * Trims first character of the string if it is a space
 * @param {String} str
 * @returns {String}
 */
function trimLeadingSpace(str) {
    return str.slice(0, 1) === ' ' ? str.slice(1) : str;
}

export {getMaxArrowIndex, trimLeadingSpace};
