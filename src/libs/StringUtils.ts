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

export default {sanitizeString, isEmptyString, removeInvisibleCharacters};
