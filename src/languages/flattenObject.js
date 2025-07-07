"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Converts an object to it's flattened version.
 *
 * Ex:
 * Input: { common: { yes: "Yes", no: "No" }}
 * Output: { "common.yes": "Yes", "common.no": "No" }
 */
function flattenObject(obj) {
    var result = {};
    var recursive = function (data, key) {
        // If the data is a function or not a object (eg. a string or array),
        // it's the final value for the key being built and there is no need
        // for more recursion
        if (typeof data === 'function' || Array.isArray(data) || !(typeof data === 'object' && !!data)) {
            result[key] = data;
        }
        else {
            var isEmpty_1 = true;
            // Recursive call to the keys and connect to the respective data
            Object.keys(data).forEach(function (k) {
                isEmpty_1 = false;
                recursive(data[k], key ? "".concat(key, ".").concat(k) : k);
            });
            // Check for when the object is empty but a key exists, so that
            // it defaults to an empty object
            if (isEmpty_1 && key) {
                result[key] = '';
            }
        }
    };
    recursive(obj, '');
    return result;
}
exports.default = flattenObject;
