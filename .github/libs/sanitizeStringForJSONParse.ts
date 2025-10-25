/* eslint-disable @typescript-eslint/naming-convention */

const replacer = (str: string): string =>
    ({
        '\\': '\\\\',
        '\t': '\\t',
        '\n': '\\n',
        '\r': '\\r',
        '\f': '\\f',
        '"': '\\"',
    })[str] ?? '';

/**
 * Replace any characters in the string that will break JSON.parse for our Git Log output
 *
 * Solution partly taken from SO user Gabriel Rodríguez Flores 🙇
 * https://stackoverflow.com/questions/52789718/how-to-remove-special-characters-before-json-parse-while-file-reading
 */
const sanitizeStringForJSONParse = (inputString: string | number | boolean | null | undefined): string => {
    if (typeof inputString !== 'string') {
        throw new TypeError('Input must me of type String');
    }

    // Replace any newlines and escape backslashes
    return inputString.replaceAll(/\\|\t|\n|\r|\f|"/g, replacer);
};

export default sanitizeStringForJSONParse;
