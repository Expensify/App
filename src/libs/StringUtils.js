import _ from 'lodash';
import CONST from '../CONST';
/**
 * Removes diacritical marks and non-alphabetic and non-latin characters from a string.
 * @param {String} str - The input string to be sanitized.
 * @returns {String} The sanitized string
 */
function sanitizeString(str) {
    return _.chain(str).deburr().toLower().value().replaceAll(CONST.REGEX.NON_ALPHABETIC_AND_NON_LATIN_CHARS, '');
}

export default {sanitizeString};
