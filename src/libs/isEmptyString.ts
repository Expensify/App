import CONST from '@src/CONST';

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

export default isEmptyString;
