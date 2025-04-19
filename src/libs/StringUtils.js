
exports.__esModule = true;
const deburr_1 = require('lodash/deburr');
const CONST_1 = require('@src/CONST');
const Browser_1 = require('./Browser');
/**
 * Removes diacritical marks and non-alphabetic and non-latin characters from a string.
 * @param str - The input string to be sanitized.
 * @returns The sanitized string
 */
function sanitizeString(str) {
    return deburr_1['default'](str).toLowerCase().replaceAll(CONST_1['default'].REGEX.NON_ALPHABETIC_AND_NON_LATIN_CHARS, '');
}
/**
 *  Check if the string would be empty if all invisible characters were removed.
 */
function isEmptyString(value) {
    // \p{C} matches all 'Other' characters
    // \p{Z} matches all separators (spaces etc.)
    // Source: http://www.unicode.org/reports/tr18/#General_Category_Property
    let transformed = value.replace(CONST_1['default'].REGEX.INVISIBLE_CHARACTERS_GROUPS, '');
    // Remove other invisible characters that are not in the above unicode categories
    transformed = transformed.replace(CONST_1['default'].REGEX.OTHER_INVISIBLE_CHARACTERS, '');
    // Check if after removing invisible characters the string is empty
    return transformed === '';
}
/**
 *  Remove invisible characters from a string except for spaces and format characters for emoji, and trim it.
 */
function removeInvisibleCharacters(value) {
    let result = value;
    // Remove spaces:
    // - \u200B: zero-width space
    // - \u2060: word joiner
    result = result.replace(/[\u200B\u2060]/g, '');
    const invisibleCharacterRegex = Browser_1.isSafari() ? /([\uD800-\uDBFF][\uDC00-\uDFFF])|[\p{Cc}\p{Co}\p{Cn}]/gu : /[\p{Cc}\p{Cs}\p{Co}\p{Cn}]/gu;
    // The control unicode (Cc) regex removes all newlines,
    // so we first split the string by newline and rejoin it afterward to retain the original line breaks.
    result = result
        .split('\n')
        .map(function (part) {
            // Remove all characters from the 'Other' (C) category except for format characters (Cf)
            // because some of them are used for emojis
            return part.replace(invisibleCharacterRegex, '');
        })
        .join('\n');
    // Remove characters from the (Cf) category that are not used for emojis
    result = result.replace(/[\u200E-\u200F]/g, '');
    // Remove all characters from the 'Separator' (Z) category except for Space Separator (Zs)
    result = result.replace(/[\p{Zl}\p{Zp}]/gu, '');
    // If the result consist of only invisible characters, return an empty string
    if (isEmptyString(result)) {
        return '';
    }
    return result.trim();
}
/**
 * Remove accents/diacritics
 * @param text - The input string
 * @returns The string with all accents/diacritics removed
 */
function normalizeAccents(text) {
    return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}
/**
 *  Replace all CRLF with LF
 *  @param value - The input string
 *  @returns The string with all CRLF replaced with LF
 */
function normalizeCRLF(value) {
    return value === null || value === void 0 ? void 0 : value.replace(/\r\n/g, '\n');
}
/**
 * Replace all line breaks with white spaces
 */
function lineBreaksToSpaces(text, useNonBreakingSpace) {
    if (text === void 0) {
        text = '';
    }
    if (useNonBreakingSpace === void 0) {
        useNonBreakingSpace = false;
    }
    return text.replace(CONST_1['default'].REGEX.LINE_BREAK, useNonBreakingSpace ? '\u00A0' : ' ');
}
/**
 * Get the first line of the string
 */
function getFirstLine(text) {
    if (text === void 0) {
        text = '';
    }
    // Split the input string by newline characters and return the first element of the resulting array
    const lines = text.split('\n');
    return lines.at(0);
}
/**
 * Remove double quotes from the string
 */
function removeDoubleQuotes(text) {
    if (text === void 0) {
        text = '';
    }
    return text.replace(/"/g, '');
}
/**
 * Remove pre tag from the html
 */
function removePreCodeBlock(text) {
    if (text === void 0) {
        text = '';
    }
    return text.replace(/<pre[^>]*>|<\/pre>/g, '');
}
exports['default'] = {
    sanitizeString,
    isEmptyString,
    removeInvisibleCharacters,
    normalizeAccents,
    normalizeCRLF,
    lineBreaksToSpaces,
    getFirstLine,
    removeDoubleQuotes,
    removePreCodeBlock,
};
