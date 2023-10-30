import _ from 'lodash';
import CONST from '@src/CONST';

/**
 * Check if the text contains HTML
 * @param text
 * @return whether the text contains HTML
 */
function containsHtml(text: string): boolean {
    return /<\/?[a-z][\s\S]*>/i.test(text);
}

/**
 * Removes diacritical marks and non-alphabetic and non-latin characters from a string.
 * @param str - The input string to be sanitized.
 * @returns The sanitized string
 */
function sanitizeString(str: string): string {
    return _.deburr(str).toLowerCase().replaceAll(CONST.REGEX.NON_ALPHABETIC_AND_NON_LATIN_CHARS, '');
}

export {containsHtml, sanitizeString};
