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

/**
 * Checks if space is available to render large suggestion menu
 * @param {Number} listHeight
 * @param {Number} composerHeight
 * @param {Number} totalSuggestions
 * @returns {Boolean}
 */
function hasEnoughSpaceForLargeSuggestionMenu(listHeight, composerHeight, totalSuggestions) {
    const maxSuggestions = CONST.AUTO_COMPLETE_SUGGESTER.MAX_AMOUNT_OF_VISIBLE_SUGGESTIONS_IN_CONTAINER;
    const chatFooterHeight = CONST.CHAT_FOOTER_SECONDARY_ROW_HEIGHT + 2 * CONST.CHAT_FOOTER_SECONDARY_ROW_PADDING;
    const availableHeight = listHeight - composerHeight - chatFooterHeight;
    const menuHeight =
        (!totalSuggestions || totalSuggestions > maxSuggestions ? maxSuggestions : totalSuggestions) * CONST.AUTO_COMPLETE_SUGGESTER.SUGGESTION_ROW_HEIGHT +
        CONST.AUTO_COMPLETE_SUGGESTER.SUGGESTER_INNER_PADDING * 2;

    return availableHeight > menuHeight;
}

export {getMaxArrowIndex, trimLeadingSpace, hasEnoughSpaceForLargeSuggestionMenu};
