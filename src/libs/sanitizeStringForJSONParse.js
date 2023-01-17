const replacer = str => ({
    '\\': '\\\\',
    '\t': '\\t',
    '\n': '\\n',
    '\r': '\\r',
    '\f': '\\f',
    '"': '\\"',
}[str]);

/**
 * Replace any characters in the string that will break JSON.parse for our Git Log output
 *
 * Solution partly taken from SO user Gabriel Rodríguez Flores 🙇
 * https://stackoverflow.com/questions/52789718/how-to-remove-special-characters-before-json-parse-while-file-reading
 *
 * @param {String} inputString
 * @returns {String}
 */
export default function (inputString) {
    if (!inputString || typeof inputString !== 'string') {
        throw new TypeError('Input must me of type String');
    }

    // Replace any newlines and escape backslashes
    return inputString.replace(/\\|\t|\n|\r|\f|"/g, replacer);
}
