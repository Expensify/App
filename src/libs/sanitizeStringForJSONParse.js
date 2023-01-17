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
function sanitizeStringForJSONParse(inputString) {
    if (!inputString || typeof inputString !== 'string') {
        return '';
    }

    return inputString

        // Replace any newlines and escape backslashes
        .replace(/\\|\t|\n|\r|\f|"/g, replacer);
}

export default sanitizeStringForJSONParse;
