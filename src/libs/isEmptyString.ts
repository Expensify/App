import CONST from '../CONST';

/**
 *  Checks if the string would be empty if all invisible characters were removed.
 */
function isEmptyString(value: string): boolean {
    // \p{C} matches all 'Other' characters
    // \p{Z} matches all separators (spaces etc.)
    // Source: http://www.unicode.org/reports/tr18/#General_Category_Property
    return value.replace(CONST.REGEX.INVISIBLE_CHARACTERS, '') === '';
}

export default isEmptyString;
