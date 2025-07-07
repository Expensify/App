"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var isFileUploadable_1 = require("./isFileUploadable");
/**
 * Ensures no value of type `object` other than null, Blob, its subclasses, or {uri: string} (native platforms only) is passed to XMLHttpRequest.
 * Otherwise, it will be incorrectly serialized as `[object Object]` and cause an error on Android.
 * See https://github.com/Expensify/App/issues/45086
 */
function validateFormDataParameter(command, key, value) {
    // eslint-disable-next-line @typescript-eslint/no-shadow
    var isValid = function (value, isTopLevel) {
        if (value === null || typeof value !== 'object') {
            return true;
        }
        if (Array.isArray(value)) {
            return value.every(function (element) { return isValid(element, false); });
        }
        if (isTopLevel) {
            return (0, isFileUploadable_1.default)(value);
        }
        return false;
    };
    if (!isValid(value, true)) {
        // eslint-disable-next-line no-console
        console.warn("An unsupported value was passed to command '".concat(command, "' (parameter: '").concat(key, "'). Only Blob and primitive types are allowed."));
    }
}
exports.default = validateFormDataParameter;
