import deburr from 'lodash/deburr';
import CONST from '@src/CONST';

/**
 * Removes diacritical marks and non-alphabetic and non-latin characters from a string.
 * @param str - The input string to be sanitized.
 * @returns The sanitized string
 */
function sanitizeString(str: string): string {
    return deburr(str).toLowerCase().replaceAll(CONST.REGEX.NON_ALPHABETIC_AND_NON_LATIN_CHARS, '');
}

/**
 *  Check if the string would be empty if all invisible characters were removed.
 */
function isEmptyString(value: string): boolean {
    // \p{C} matches all 'Other' characters
    // \p{Z} matches all separators (spaces etc.)
    // Source: http://www.unicode.org/reports/tr18/#General_Category_Property
    let transformed = value.replace(CONST.REGEX.INVISIBLE_CHARACTERS_GROUPS, '');

    // Remove other invisible characters that are not in the above unicode categories
    transformed = transformed.replace(CONST.REGEX.OTHER_INVISIBLE_CHARACTERS, '');

    // Check if after removing invisible characters the string is empty
    return transformed === '';
}

/**
 *  Remove invisible characters from a string except for spaces and format characters for emoji, and trim it.
 */
function removeInvisibleCharacters(value: string): string {
    let result = value;

    // Remove spaces:
    // - \u200B: zero-width space
    // - \u2060: word joiner
    result = result.replace(/[\u200B\u2060]/g, '');

    // The control unicode (Cc) regex removes all newlines,
    // so we first split the string by newline and rejoin it afterward to retain the original line breaks.
    result = result
        .split('\n')
        .map((part) =>
            // Remove all characters from the 'Other' (C) category except for format characters (Cf)
            // because some of them are used for emojis
            part.replace(/[\p{Cc}\p{Cs}\p{Co}\p{Cn}]/gu, ''),
        )
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
function normalizeAccents(text: string) {
    return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 *  Replace all CRLF with LF
 *  @param value - The input string
 *  @returns The string with all CRLF replaced with LF
 */
function normalizeCRLF(value?: string): string | undefined {
    return value?.replace(/\r\n/g, '\n');
}

/**
 * Replace all line breaks with white spaces
 */
function lineBreaksToSpaces(text = '') {
    return text.replace(CONST.REGEX.LINE_BREAK, ' ');
}

/**
 * Get the first line of the string
 */
function getFirstLine(text = '') {
    // Split the input string by newline characters and return the first element of the resulting array
    const lines = text.split('\n');
    return lines.at(0);
}

export default {sanitizeString, isEmptyString, removeInvisibleCharacters, normalizeAccents, normalizeCRLF, lineBreaksToSpaces, getFirstLine};
