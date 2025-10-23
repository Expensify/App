import deburr from 'lodash/deburr';
import {isSafari} from '@libs/Browser';
import CONST from '@src/CONST';
import decodeUnicode from './decodeUnicode';
import dedent from './dedent';
import hash from './hash';

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
    // We implemented a custom emoji on this Unicode Private Use Area (PUA) code point
    // so we should not remove it.
    // Temporarily replace \uE100 with a placeholder
    const PLACEHOLDER = '<<KEEP_E100>>';
    let transformed = value.replaceAll('\uE100', PLACEHOLDER);

    // \p{C} matches all 'Other' characters
    // \p{Z} matches all separators (spaces etc.)
    // Source: http://www.unicode.org/reports/tr18/#General_Category_Property
    transformed = transformed.replaceAll(CONST.REGEX.INVISIBLE_CHARACTERS_GROUPS, '');

    // Remove other invisible characters that are not in the above unicode categories
    transformed = transformed.replaceAll(CONST.REGEX.OTHER_INVISIBLE_CHARACTERS, '');

    transformed = transformed.replaceAll(new RegExp(PLACEHOLDER, 'g'), '\uE100');

    // Check if after removing invisible characters the string is empty
    return transformed === '';
}

/**
 *  Remove invisible characters from a string except for spaces and format characters for emoji, and trim it.
 */
function removeInvisibleCharacters(value: string): string {
    let result = value;

    // We implemented a custom emoji on this Unicode Private Use Area (PUA) code point
    // so we should not remove it.
    // Temporarily replace \uE100 with a placeholder
    const PLACEHOLDER = '<<KEEP_E100>>';
    result = result.replaceAll('\uE100', PLACEHOLDER);

    // Remove spaces:
    // - \u200B: zero-width space
    // - \u2060: word joiner
    result = result.replaceAll(/[\u200B\u2060]/g, '');

    const invisibleCharacterRegex = isSafari() ? /([\uD800-\uDBFF][\uDC00-\uDFFF])|[\p{Cc}\p{Co}\p{Cn}]/gu : /[\p{Cc}\p{Cs}\p{Co}\p{Cn}]/gu;

    // The control unicode (Cc) regex removes all newlines,
    // so we first split the string by newline and rejoin it afterward to retain the original line breaks.
    result = result
        .split('\n')
        .map((part) =>
            // Remove all characters from the 'Other' (C) category except for format characters (Cf)
            // because some of them are used for emojis
            part.replace(invisibleCharacterRegex, ''),
        )
        .join('\n');

    // Remove characters from the (Cf) category that are not used for emojis
    result = result.replaceAll(/[\u200E-\u200F]/g, '');

    // Remove all characters from the 'Separator' (Z) category except for Space Separator (Zs)
    result = result.replaceAll(/[\p{Zl}\p{Zp}]/gu, '');

    // Restore \uE100 from placeholder
    result = result.replaceAll(new RegExp(PLACEHOLDER, 'g'), '\uE100');

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
    return text.normalize('NFD').replaceAll(/[\u0300-\u036f]/g, '');
}

/**
 * Normalize a string by:
 * - removing diacritical marks
 * - Removing non-alphabetic and non-latin characters from a string
 * - Removing invisible characters
 * - normalizing space-like characters into normal spaces
 * - collapsing whitespaces
 * - trimming
 */
function normalize(text: string): string {
    return removeInvisibleCharacters(text)
        .replaceAll(/[\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000]/g, ' ') // space-like -> ' '
        .replaceAll(/\s+/g, ' ') // collapse spaces
        .trim();
}

/**
 *  Replace all CRLF with LF
 *  @param value - The input string
 *  @returns The string with all CRLF replaced with LF
 */
function normalizeCRLF(value?: string): string | undefined {
    return value?.replaceAll('\r\n', '\n');
}

/**
 * Replace all line breaks with white spaces
 */
function lineBreaksToSpaces(text = '', useNonBreakingSpace = false) {
    return text.replaceAll(CONST.REGEX.LINE_BREAK, useNonBreakingSpace ? '\u00A0' : ' ');
}

/**
 * Get the first line of the string
 */
function getFirstLine(text = '') {
    // Split the input string by newline characters and return the first element of the resulting array
    const lines = text.split('\n');
    return lines.at(0);
}

/**
 * Remove double quotes from the string
 */
function removeDoubleQuotes(text = '') {
    return text.replaceAll('"', '');
}

/**
 * Sort an array of strings by their length.
 * The longest strings will be at the end of the array.
 */
function sortStringArrayByLength(arr: string[]): string[] {
    return arr.sort((a, b) => a.length - b.length);
}

/**
 * Remove pre tag from the html
 */
function removePreCodeBlock(text = '') {
    return text.replaceAll(/<pre[^>]*>|<\/pre>/g, '');
}

/**
 * Returns the number of bytes required to encode a string in UTF-8.
 */
function getUTF8ByteLength(str: string) {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(str);
    return bytes.length;
}

/**
 * Remove white spaces length from the string
 */
function countWhiteSpaces(str: string): number {
    return (str.match(/\s/g) ?? []).length;
}

/**
 * Check if the string starts with a vowel
 * @param str - The input string
 * @returns True if the string starts with a vowel, false otherwise
 */
function startsWithVowel(str: string): boolean {
    return /^[aeiouAEIOU]/.test(str);
}

export default {
    sanitizeString,
    isEmptyString,
    removeInvisibleCharacters,
    normalize,
    normalizeAccents,
    normalizeCRLF,
    lineBreaksToSpaces,
    getFirstLine,
    removeDoubleQuotes,
    removePreCodeBlock,
    sortStringArrayByLength,
    dedent,
    hash,
    getUTF8ByteLength,
    decodeUnicode,
    countWhiteSpaces,
    startsWithVowel,
};
