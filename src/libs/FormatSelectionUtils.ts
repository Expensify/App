import type {MarkdownType} from '@expensify/react-native-live-markdown';
import {parseExpensiMark} from '@expensify/react-native-live-markdown';

type FormatRule = {
    markdownType: MarkdownType;
    syntax: string;
};

type Match = {
    start: number;
    end: number;
};

function applyFormatting(text: string, selectionStart: number, selectionEnd: number, syntax: string) {
    const prefix = text.slice(0, selectionStart);
    const suffix = text.slice(selectionEnd);
    const selectedText = text.slice(selectionStart, selectionEnd);
    const formattedText = `${syntax}${selectedText}${syntax}`;
    const updatedText = `${prefix}${formattedText}${suffix}`;
    const cursorOffset = formattedText.length - selectedText.length;
    return {updatedText, cursorOffset};
}

function findMatchingFormat(text: string, selectionStart: number, selectionEnd: number, formatRule: FormatRule): Match | null {
    const markdownRanges = parseExpensiMark(text);
    for (const range of markdownRanges) {
        if (range && range.type === formatRule.markdownType && range.start != null && range.length != null) {
            const rangeEnd = range.start + range.length;
            const isExactMatch = range.start === selectionStart && rangeEnd === selectionEnd;
            const isEnclosedMatch = range.start - 1 === selectionStart && rangeEnd + 1 === selectionEnd;
            const isRangeBetweenSyntaxes = range.start > 0 && text[range.start - 1] === formatRule.syntax && rangeEnd < text.length && text[rangeEnd] === formatRule.syntax;
            if ((isExactMatch || isEnclosedMatch) && isRangeBetweenSyntaxes) {
                return {start: range.start, end: rangeEnd};
            }
        }
    }
    return null;
}

function getFormatRule(formatCommand: string): FormatRule | null {
    if (formatCommand === 'formatBold') {
        return {markdownType: 'bold', syntax: '*'};
    }
    if (formatCommand === 'formatItalic') {
        return {markdownType: 'italic', syntax: '_'};
    }
    return null;
}

function removeFormatting(text: string, selectionStart: number, match: Match) {
    const prefix = text.slice(0, match.start - 1);
    const suffix = text.slice(match.end + 1);
    const unformattedText = text.slice(match.start, match.end);
    const updatedText = `${prefix}${unformattedText}${suffix}`;
    const cursorOffset = selectionStart - match.start - 1;
    return {updatedText, cursorOffset};
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

    const match = findMatchingFormat(text, selectionStart, selectionEnd, formatRule);
    if (match) {
        return removeFormatting(text, selectionStart, match);
    }

    return applyFormatting(text, selectionStart, selectionEnd, formatRule.syntax);
}

export default toggleSelectionFormat;
