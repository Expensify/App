"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockValues = exports.validateAndApplyDeferredUpdates = exports.detectGapsAndSplit = exports.applyUpdates = void 0;
var createProxyForObject_1 = require("@src/utils/createProxyForObject");
var applyUpdates_1 = require("./applyUpdates");
Object.defineProperty(exports, "applyUpdates", { enumerable: true, get: function () { return applyUpdates_1.applyUpdates; } });
var UtilsImplementation = jest.requireActual('@libs/actions/OnyxUpdateManager/utils');
var mockValues = {
    beforeValidateAndApplyDeferredUpdates: undefined,
};
var mockValuesProxy = (0, createProxyForObject_1.default)(mockValues);
exports.mockValues = mockValuesProxy;
var detectGapsAndSplit = jest.fn(UtilsImplementation.detectGapsAndSplit);
exports.detectGapsAndSplit = detectGapsAndSplit;
var validateAndApplyDeferredUpdates = jest.fn(function (clientLastUpdateID) {
    if (mockValuesProxy.beforeValidateAndApplyDeferredUpdates === undefined) {
        return UtilsImplementation.validateAndApplyDeferredUpdates(clientLastUpdateID);
    }
    return mockValuesProxy.beforeValidateAndApplyDeferredUpdates(clientLastUpdateID).then(function () { return UtilsImplementation.validateAndApplyDeferredUpdates(clientLastUpdateID); });
});
exports.validateAndApplyDeferredUpdates = validateAndApplyDeferredUpdates;
