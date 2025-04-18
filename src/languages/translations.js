"use strict";
exports.__esModule = true;
exports.flattenObject = void 0;
var en_1 = require("./en");
var es_1 = require("./es");
var es_ES_1 = require("./es-ES");
/**
 * Converts an object to it's flattened version.
 *
 * Ex:
 * Input: { common: { yes: "Yes", no: "No" }}
 * Output: { "common.yes": "Yes", "common.no": "No" }
 */
// Necessary to export so that it is accessible to the unit tests
// eslint-disable-next-line rulesdir/no-inline-named-export
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
                recursive(data[k], key ? key + "." + k : k);
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
exports.flattenObject = flattenObject;
exports["default"] = {
    en: flattenObject(en_1["default"]),
    es: flattenObject(es_1["default"]),
    // eslint-disable-next-line @typescript-eslint/naming-convention
    'es-ES': flattenObject(es_ES_1["default"])
};
