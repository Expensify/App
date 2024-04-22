import CONST from '@src/CONST';

/**
 * Trims first character of the string if it is a space
 */
function trimLeadingSpace(str: string): string {
    return str.startsWith(' ') ? str.slice(1) : str;
}
/**
 * Checks if space is available to render large suggestion menu
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

const measureHeightOfSuggestionsContainer = (numRows: number, isSuggestionsPickerLarge: boolean): number => {
    // Autocomplete suggestions has inner padding 8px and border-width 1px
    const borderAndPadding = CONST.AUTO_COMPLETE_SUGGESTER.SUGGESTER_INNER_PADDING + 2;
    let suggestionsHeight = 0;

    if (isSuggestionsPickerLarge) {
        if (numRows > CONST.AUTO_COMPLETE_SUGGESTER.MAX_AMOUNT_OF_VISIBLE_SUGGESTIONS_IN_CONTAINER) {
            // On large screens, if there are more than 5 suggestions, we display a scrollable window with a height of 5 items, indicating that there are more items available
            suggestionsHeight = CONST.AUTO_COMPLETE_SUGGESTER.MAX_AMOUNT_OF_VISIBLE_SUGGESTIONS_IN_CONTAINER * CONST.AUTO_COMPLETE_SUGGESTER.SUGGESTION_ROW_HEIGHT;
        } else {
            suggestionsHeight = numRows * CONST.AUTO_COMPLETE_SUGGESTER.SUGGESTION_ROW_HEIGHT;
        }
    } else if (numRows > 2) {
        // On small screens, we display a scrollable window with a height of 2.5 items, indicating that there are more items available beyond what is currently visible
        suggestionsHeight = CONST.AUTO_COMPLETE_SUGGESTER.SMALL_CONTAINER_HEIGHT_FACTOR * CONST.AUTO_COMPLETE_SUGGESTER.SUGGESTION_ROW_HEIGHT;
    } else {
        suggestionsHeight = numRows * CONST.AUTO_COMPLETE_SUGGESTER.SUGGESTION_ROW_HEIGHT;
    }
    return suggestionsHeight + borderAndPadding;
};

export {trimLeadingSpace, hasEnoughSpaceForLargeSuggestionMenu, measureHeightOfSuggestionsContainer};
