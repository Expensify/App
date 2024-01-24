import CONST from '@src/CONST';

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

export {trimLeadingSpace, hasEnoughSpaceForLargeSuggestionMenu};
