import deburr from 'lodash/deburr';

/**
 * Sort a list of string alphabetically, ignoring case and normalizing unicode.
 */
function sortAlphabetically(list: string[]): string[] {
    return list.sort((a, b) => deburr(a.toLowerCase()).localeCompare(deburr(b.toLowerCase())));
}

// eslint-disable-next-line import/prefer-default-export
export {sortAlphabetically};
