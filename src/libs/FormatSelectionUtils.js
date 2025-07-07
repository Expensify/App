"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_native_live_markdown_1 = require("@expensify/react-native-live-markdown");
function applyFormatting(text, selectionStart, selectionEnd, syntax) {
    var prefix = text.slice(0, selectionStart);
    var suffix = text.slice(selectionEnd);
    var selectedText = text.slice(selectionStart, selectionEnd);
    var formattedText = "".concat(syntax).concat(selectedText).concat(syntax);
    var updatedText = "".concat(prefix).concat(formattedText).concat(suffix);
    var cursorOffset = formattedText.length - selectedText.length;
    return { updatedText: updatedText, cursorOffset: cursorOffset };
}
function findMatchingFormat(text, selectionStart, selectionEnd, formatRule) {
    var markdownRanges = (0, react_native_live_markdown_1.parseExpensiMark)(text);
    for (var _i = 0, markdownRanges_1 = markdownRanges; _i < markdownRanges_1.length; _i++) {
        var range = markdownRanges_1[_i];
        if (range && range.type === formatRule.markdownType && range.start != null && range.length != null) {
            var rangeEnd = range.start + range.length;
            var isExactMatch = range.start === selectionStart && rangeEnd === selectionEnd;
            var isEnclosedMatch = range.start - 1 === selectionStart && rangeEnd + 1 === selectionEnd;
            var isRangeBetweenSyntaxes = range.start > 0 && text[range.start - 1] === formatRule.syntax && rangeEnd < text.length && text[rangeEnd] === formatRule.syntax;
            if ((isExactMatch || isEnclosedMatch) && isRangeBetweenSyntaxes) {
                return { start: range.start, end: rangeEnd };
            }
        }
    }
    return null;
}
function getFormatRule(formatCommand) {
    if (formatCommand === 'formatBold') {
        return { markdownType: 'bold', syntax: '*' };
    }
    if (formatCommand === 'formatItalic') {
        return { markdownType: 'italic', syntax: '_' };
    }
    return null;
}
function removeFormatting(text, selectionStart, match) {
    var prefix = text.slice(0, match.start - 1);
    var suffix = text.slice(match.end + 1);
    var unformattedText = text.slice(match.start, match.end);
    var updatedText = "".concat(prefix).concat(unformattedText).concat(suffix);
    var cursorOffset = selectionStart - match.start - 1;
    return { updatedText: updatedText, cursorOffset: cursorOffset };
}
/**
 * Applies or removes formatting for the selected text.
 *
 * @param text - The full text.
 * @param selectionStart - The start index of the selection.
 * @param selectionEnd - The end index of the selection.
 * @param formatCommand - The formatting command (e.g., 'formatBold', 'formatItalic').
 * @returns The updated text and cursor offset.
 */
function toggleSelectionFormat(text, selectionStart, selectionEnd, formatCommand) {
    var formatRule = getFormatRule(formatCommand);
    if (!text || selectionStart == null || selectionEnd == null || !formatRule) {
        return { updatedText: text, cursorOffset: 0 };
    }
    var match = findMatchingFormat(text, selectionStart, selectionEnd, formatRule);
    if (match) {
        return removeFormatting(text, selectionStart, match);
    }
    return applyFormatting(text, selectionStart, selectionEnd, formatRule.syntax);
}
exports.default = toggleSelectionFormat;
