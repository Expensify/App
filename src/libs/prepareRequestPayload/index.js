"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var validateFormDataParameter_1 = require("@libs/validateFormDataParameter");
/**
 * Prepares the request payload (body) for a given command and data.
 */
var prepareRequestPayload = function (command, data) {
    var formData = new FormData();
    Object.keys(data).forEach(function (key) {
        var value = data[key];
        if (value === undefined) {
            return;
        }
        (0, validateFormDataParameter_1.default)(command, key, value);
        formData.append(key, value);
    });
    return Promise.resolve(formData);
};
exports.default = prepareRequestPayload;
