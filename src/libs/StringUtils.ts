import _ from 'lodash';
import CONST from '../CONST';

/**
 * Removes diacritical marks and non-alphabetic and non-latin characters from a string.
 * @param str - The input string to be sanitized.
 * @returns The sanitized string
 */
function sanitizeString(str: string): string {
    return _.deburr(str).toLowerCase().replaceAll(CONST.REGEX.NON_ALPHABETIC_AND_NON_LATIN_CHARS, '');
}

/**
 * Very simple function to identify if a string contains HTML elements. WARNING: Things like '<potato>' will return true
 * @param str - The string to check.
 * @returns True if it contains html elements
 */
function hasHTML(str: string): boolean {
    const regex = new RegExp('/<\\/?[a-z][\\s\\S]*>/', 'i');
    return regex.test(str)
}

export {
    sanitizeString,
    hasHTML,
};
