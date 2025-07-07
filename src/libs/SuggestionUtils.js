"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trimLeadingSpace = trimLeadingSpace;
exports.hasEnoughSpaceForLargeSuggestionMenu = hasEnoughSpaceForLargeSuggestionMenu;
var CONST_1 = require("@src/CONST");
/**
 * Trims first character of the string if it is a space
 */
function trimLeadingSpace(str) {
    return str.startsWith(' ') ? str.slice(1) : str;
}
/**
 * Checks if space is available to render large suggestion menu
 */
function hasEnoughSpaceForLargeSuggestionMenu(listHeight, composerHeight, totalSuggestions) {
    var maxSuggestions = CONST_1.default.AUTO_COMPLETE_SUGGESTER.MAX_AMOUNT_OF_VISIBLE_SUGGESTIONS_IN_CONTAINER;
    var chatFooterHeight = CONST_1.default.CHAT_FOOTER_SECONDARY_ROW_HEIGHT + 2 * CONST_1.default.CHAT_FOOTER_SECONDARY_ROW_PADDING;
    var availableHeight = listHeight - composerHeight - chatFooterHeight;
    var menuHeight = (!totalSuggestions || totalSuggestions > maxSuggestions ? maxSuggestions : totalSuggestions) * CONST_1.default.AUTO_COMPLETE_SUGGESTER.SUGGESTION_ROW_HEIGHT +
        CONST_1.default.AUTO_COMPLETE_SUGGESTER.SUGGESTER_INNER_PADDING * 2;
    return availableHeight > menuHeight;
}
