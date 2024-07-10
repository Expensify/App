import _ from 'lodash';
import CONST from '@src/CONST';

/**
 * Removes diacritical marks and non-alphabetic and non-latin characters from a string.
 * @param str - The input string to be sanitized.
 * @returns The sanitized string
 */
function sanitizeString(str: string): string {
    return _.deburr(str).toLowerCase().replaceAll(CONST.REGEX.NON_ALPHABETIC_AND_NON_LATIN_CHARS, '');
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
    // - \u00A0: non-breaking space
    // - \u2060: word joiner
    result = result.replace(/[\u200B\u00A0\u2060]/g, '');

    // Temporarily replace all newlines with non-breaking spaces
    // It is necessary because the next step removes all newlines because they are in the (Cc) category
    result = result.replace(/\n/g, '\u00A0');

    // Remove all characters from the 'Other' (C) category except for format characters (Cf)
    // because some of them are used for emojis
    result = result.replace(/[\p{Cc}\p{Cs}\p{Co}\p{Cn}]/gu, '');

    // Replace all non-breaking spaces with newlines
    result = result.replace(/\u00A0/g, '\n');

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
 * Generates an acronym for a string.
 * @param string the string for which to produce the acronym
 * @returns the acronym
 */
function getAcronym(string: string): string {
    let acronym = '';
    const wordsInString = string.split(' ');
    wordsInString.forEach((wordInString) => {
        const splitByHyphenWords = wordInString.split('-');
        splitByHyphenWords.forEach((splitByHyphenWord) => {
            acronym += splitByHyphenWord.substring(0, 1);
        });
    });
    return acronym;
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
    return lines[0];
}

export default {sanitizeString, isEmptyString, removeInvisibleCharacters, normalizeAccents, normalizeCRLF, getAcronym, lineBreaksToSpaces, getFirstLine};
