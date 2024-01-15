import CONST from '@src/CONST';

/**
 * Return the max available index for arrow manager.
 * @param numRows
 * @param  isAutoSuggestionPickerLarge
 */
function getMaxArrowIndex(numRows: number, isAutoSuggestionPickerLarge: boolean): number {
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
 * @param str
 */
function trimLeadingSpace(str: string): string {
    return str.startsWith(' ') ? str.slice(1) : str;
}

/**
 * Checks if space is available to render large suggestion menu
 * @param listHeight
 * @param composerHeight
 * @param totalSuggestions
 */
function hasEnoughSpaceForLargeSuggestionMenu(listHeight: number, composerHeight: number, totalSuggestions: number): boolean {
    const maxSuggestions = CONST.AUTO_COMPLETE_SUGGESTER.MAX_AMOUNT_OF_VISIBLE_SUGGESTIONS_IN_CONTAINER;
    const chatFooterHeight = CONST.CHAT_FOOTER_SECONDARY_ROW_HEIGHT + 2 * CONST.CHAT_FOOTER_SECONDARY_ROW_PADDING;
    const availableHeight = listHeight - composerHeight - chatFooterHeight;
    const menuHeight =
        (!totalSuggestions || totalSuggestions > maxSuggestions ? maxSuggestions : totalSuggestions) * CONST.AUTO_COMPLETE_SUGGESTER.SUGGESTION_ROW_HEIGHT +
        CONST.AUTO_COMPLETE_SUGGESTER.SUGGESTER_INNER_PADDING * 2;

    return availableHeight > menuHeight;
}

export {getMaxArrowIndex, trimLeadingSpace, hasEnoughSpaceForLargeSuggestionMenu};
