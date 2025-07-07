"use strict";
/* eslint-disable @typescript-eslint/naming-convention */
Object.defineProperty(exports, "__esModule", { value: true });
var replacer = function (str) {
    var _a;
    return (_a = ({
        '\\': '\\\\',
        '\t': '\\t',
        '\n': '\\n',
        '\r': '\\r',
        '\f': '\\f',
        '"': '\\"',
    })[str]) !== null && _a !== void 0 ? _a : '';
};
/**
 * Replace any characters in the string that will break JSON.parse for our Git Log output
 *
 * Solution partly taken from SO user Gabriel Rodríguez Flores 🙇
 * https://stackoverflow.com/questions/52789718/how-to-remove-special-characters-before-json-parse-while-file-reading
 */
var sanitizeStringForJSONParse = function (inputString) {
    if (typeof inputString !== 'string') {
        throw new TypeError('Input must me of type String');
    }
    // Replace any newlines and escape backslashes
    return inputString.replace(/\\|\t|\n|\r|\f|"/g, replacer);
};
exports.default = sanitizeStringForJSONParse;
