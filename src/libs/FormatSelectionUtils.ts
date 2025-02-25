import type {MarkdownType} from '@expensify/react-native-live-markdown';
import {parseExpensiMark} from '@expensify/react-native-live-markdown';

type FormatRule = {
    markdownType: MarkdownType;
    syntax: string;
};

function getFormatRule(formatCommand: string): FormatRule | null {
    if (formatCommand === 'formatBold') {
        return {markdownType: 'bold', syntax: '*'};
    }
    if (formatCommand === 'formatItalic') {
        return {markdownType: 'italic', syntax: '_'};
    }
    return null;
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
function toggleSelectionFormat(text: string, selectionStart: number, selectionEnd: number, formatCommand: string) {
    const formatRule = getFormatRule(formatCommand);
    if (!text || selectionStart == null || selectionEnd == null || !formatRule) {
        return {updatedText: text, cursorOffset: 0};
    }

    // Remove formatting if the selection is already formatted.
    const markdownRanges = parseExpensiMark(text);
    for (const range of markdownRanges) {
        if (range && range.type === formatRule.markdownType && range.start != null && range.length != null) {
            const rangeEnd = range.start + range.length;
            const isExactMatch = range.start === selectionStart && rangeEnd === selectionEnd;
            const isEnclosedMatch = range.start - 1 === selectionStart && rangeEnd + 1 === selectionEnd;
            const isRangeBetweenSyntaxes = text[range.start - 1] === formatRule.syntax && text[rangeEnd] === formatRule.syntax;
            if ((isExactMatch || isEnclosedMatch) && isRangeBetweenSyntaxes) {
                const prefix = text.slice(0, range.start - 1);
                const suffix = text.slice(rangeEnd + 1);
                const unformattedText = text.slice(range.start, rangeEnd);
                const updatedText = `${prefix}${unformattedText}${suffix}`;
                const cursorOffset = selectionStart - range.start - 1;
                return {updatedText, cursorOffset};
            }
        }
    }

    // Otherwise, add formatting.
    const prefix = text.slice(0, selectionStart);
    const suffix = text.slice(selectionEnd);
    const selectedText = text.slice(selectionStart, selectionEnd);
    const formattedText = `${formatRule.syntax}${selectedText}${formatRule.syntax}`;
    const updatedText = `${prefix}${formattedText}${suffix}`;
    const cursorOffset = formattedText.length - selectedText.length;
    return {updatedText, cursorOffset};
}

export default toggleSelectionFormat;
